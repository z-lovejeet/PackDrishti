import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from backend.src.core.config import settings

logger = logging.getLogger("packdrashiti.database")


import socket
from urllib.parse import urlparse

def get_async_database_url(url: str) -> str:
    """
    Converts standard postgresql:// URL to postgresql+asyncpg:// or ensures aiosqlite for SQLite.
    Validates external database hostname DNS resolution; automatically falls back to local SQLite
    if the external host is unreachable or fails DNS resolution.
    """
    if not url or url.startswith("sqlite"):
        if url and url.startswith("sqlite:///") and not url.startswith("sqlite+aiosqlite:///"):
            return url.replace("sqlite:///", "sqlite+aiosqlite:///", 1)
        return url or "sqlite+aiosqlite:///./packdrashiti.db"

    # Validate remote host DNS resolution
    try:
        clean_url = url.replace("postgresql+asyncpg://", "http://").replace("postgresql://", "http://").replace("postgres://", "http://")
        parsed = urlparse(clean_url)
        host = parsed.hostname
        port = parsed.port or 5432
        if host and host not in ("localhost", "127.0.0.1", "0.0.0.0"):
            socket.getaddrinfo(host, port, proto=socket.IPPROTO_TCP)
    except Exception as dns_err:
        logger.warning(
            "Configured database host '%s' failed DNS validation (%s). "
            "Falling back automatically to local SQLite database: sqlite+aiosqlite:///./packdrashiti.db",
            host if 'host' in locals() else 'unknown',
            dns_err,
        )
        return "sqlite+aiosqlite:///./packdrashiti.db"

    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    return url


async_db_url = get_async_database_url(settings.DATABASE_URL)

engine_kwargs = {
    "echo": settings.DEBUG,
    "future": True,
}

# Only configure pooling args for non-sqlite databases
if not async_db_url.startswith("sqlite"):
    engine_kwargs.update({
        "pool_size": settings.DATABASE_POOL_SIZE,
        "max_overflow": settings.DATABASE_MAX_OVERFLOW,
        "pool_timeout": settings.DATABASE_POOL_TIMEOUT,
        "pool_pre_ping": True,
    })

engine = create_async_engine(async_db_url, **engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency yielding request-scoped async database sessions.
    Automatically commits on successful response, rolls back on exceptions.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as exc:
            await session.rollback()
            logger.error("Database session rolled back due to error: %s", exc)
            raise
