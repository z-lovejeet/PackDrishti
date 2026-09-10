import uuid
import pytest
import pytest_asyncio
from datetime import datetime, timezone, timedelta
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool
from jose import jwt

from backend.src.models.base import Base
from backend.src.core.config import settings
from backend.src.core.cache import cache_manager

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Creates an isolated in-memory test database session for each test function.
    Automatically drops tables after the test runs.
    """
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(autouse=True)
def clean_in_memory_cache():
    """
    Flushes in-memory cache before every test.
    """
    cache_manager.clear()
    yield
    cache_manager.clear()


def make_test_token(
    user_id: str = "4f8a3c21-9e20-4a89-b8d1-7c9b0e2d1f4a",
    email: str = "officer.sharma@delhi.gov.in",
    role: str = "officer",
    badge_number: str = "LMO-DL-2024-089",
    zone: str = "DL-NORTH-01",
    jti: str = None,
    expired: bool = False,
) -> str:
    """
    Generates a test Supabase Auth JWT token for authentication tests.
    """
    now = datetime.now(timezone.utc)
    exp = now - timedelta(hours=1) if expired else now + timedelta(hours=24)

    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "app_metadata": {"role": role},
        "user_metadata": {
            "badge_number": badge_number,
            "zone": zone,
        },
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
        "jti": jti or str(uuid.uuid4()),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
