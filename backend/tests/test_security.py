import uuid
import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from backend.src.core.security import (
    get_current_user,
    require_consumer_role,
    require_officer_role,
    require_admin_role,
    verify_password,
    get_password_hash,
    decode_supabase_token,
)
from backend.src.core.cache import cache_manager
from backend.src.models.user import UserRole
from backend.tests.conftest import make_test_token


@pytest.mark.asyncio
async def test_jwt_decode_and_current_user_extraction():
    """
    Verifies that a valid Supabase JWT is decoded and mapped to a CurrentUser dataclass.
    """
    token = make_test_token(
        user_id="4f8a3c21-9e20-4a89-b8d1-7c9b0e2d1f4a",
        email="officer.sharma@gov.in",
        role="officer",
        badge_number="LMO-DL-2024-089",
        zone="DL-NORTH",
    )

    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    current_user = await get_current_user(creds)

    assert current_user.id == uuid.UUID("4f8a3c21-9e20-4a89-b8d1-7c9b0e2d1f4a")
    assert current_user.email == "officer.sharma@gov.in"
    assert current_user.role == UserRole.OFFICER
    assert current_user.badge_number == "LMO-DL-2024-089"
    assert current_user.zone == "DL-NORTH"


@pytest.mark.asyncio
async def test_jwt_expired_token_rejection():
    """
    Verifies that an expired JWT token is rejected with HTTP 401.
    """
    expired_token = make_test_token(expired=True)
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=expired_token)

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(creds)

    assert exc_info.value.status_code == 401
    assert "Invalid authentication token" in exc_info.value.detail


@pytest.mark.asyncio
async def test_jwt_missing_credentials():
    """
    Verifies that requests without credentials raise HTTP 401.
    """
    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(None)

    assert exc_info.value.status_code == 401
    assert "Authentication credentials were not provided" in exc_info.value.detail


@pytest.mark.asyncio
async def test_role_based_access_control():
    """
    Verifies RBAC guards:
    - Consumer can access consumer endpoints, but forbidden from officer/admin endpoints.
    - Officer can access consumer and officer endpoints, but forbidden from admin.
    - Admin can access all endpoints.
    """
    consumer_token = make_test_token(role="consumer")
    officer_token = make_test_token(role="officer")
    admin_token = make_test_token(role="admin")

    consumer_user = await get_current_user(HTTPAuthorizationCredentials(scheme="Bearer", credentials=consumer_token))
    officer_user = await get_current_user(HTTPAuthorizationCredentials(scheme="Bearer", credentials=officer_token))
    admin_user = await get_current_user(HTTPAuthorizationCredentials(scheme="Bearer", credentials=admin_token))

    # Consumer checks
    assert require_consumer_role(consumer_user).role == UserRole.CONSUMER
    with pytest.raises(HTTPException) as exc:
        require_officer_role(consumer_user)
    assert exc.value.status_code == 403

    with pytest.raises(HTTPException) as exc:
        require_admin_role(consumer_user)
    assert exc.value.status_code == 403

    # Officer checks
    assert require_officer_role(officer_user).role == UserRole.OFFICER
    with pytest.raises(HTTPException) as exc:
        require_admin_role(officer_user)
    assert exc.value.status_code == 403

    # Admin checks
    assert require_officer_role(admin_user).role == UserRole.ADMIN
    assert require_admin_role(admin_user).role == UserRole.ADMIN


@pytest.mark.asyncio
async def test_in_memory_token_denylist():
    """
    Verifies that revoking a token JTI in the in-memory cache instantly blocks access.
    """
    jti_id = "test-jti-session-12345"
    token = make_test_token(jti=jti_id)
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    # First call succeeds
    user = await get_current_user(creds)
    assert user is not None

    # Revoke session via in-memory cache
    cache_manager.revoke_token(jti_id)
    assert cache_manager.is_token_revoked(jti_id) is True

    # Subsequent call with same JTI must be rejected
    with pytest.raises(HTTPException) as exc:
        await get_current_user(creds)

    assert exc.value.status_code == 401
    assert "Session has been revoked" in exc.value.detail


def test_in_memory_rate_limiter():
    """
    Verifies sliding-window in-memory rate limiting.
    """
    key = "test_ip_192_168_1_1"
    # Allow 3 requests per 10 seconds
    assert cache_manager.check_rate_limit(key, max_requests=3, window_seconds=10) is True
    assert cache_manager.check_rate_limit(key, max_requests=3, window_seconds=10) is True
    assert cache_manager.check_rate_limit(key, max_requests=3, window_seconds=10) is True
    # 4th request must be blocked
    assert cache_manager.check_rate_limit(key, max_requests=3, window_seconds=10) is False


def test_password_hashing():
    """
    Verifies password hashing and verification.
    """
    password = "SuperSecretPassword123!"
    hashed = get_password_hash(password)

    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False
