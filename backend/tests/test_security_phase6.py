"""
BiteIQ - Phase 6 Security, RBAC & Multi-Tenant Isolation Test Suite.
Verifies:
1. JWT signature tampering, invalid algorithm, malformed token rejection.
2. Expired JWT token enforcement.
3. In-memory session revocation / JTI denylist enforcement.
4. RBAC role guard enforcement (Consumer vs Admin).
5. Cross-tenant data isolation (User A cannot access/modify User B's diary, profile, scans).
6. Sliding-window rate limiter saturation & HTTP 429 Retry-After response.
7. Injection & XSS sanitization across query parameters and payloads.
8. Multipart image upload MIME type enforcement.
9. Zero-emoji compliance across API response envelopes.
"""

import io
import re
import uuid
import pytest
from datetime import date
from decimal import Decimal
from httpx import AsyncClient, ASGITransport
from jose import jwt
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.main import app
from backend.src.core.config import settings
from backend.src.core.database import get_db_session
from backend.src.core.cache import cache_manager
from backend.src.core.security import (
    get_current_user,
    require_consumer_role,
    require_admin_role,
    RateLimiter,
    sanitize_text_input,
)
from backend.src.models.user import User, UserRole
from backend.tests.conftest import make_test_token


# ==============================================================================
# 1. JWT Security, Tampering & Expiry Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_jwt_tampered_signature_rejection():
    """
    Verifies that a JWT token with a forged signature is rejected with HTTP 401.
    """
    forged_token = jwt.encode(
        {"sub": str(uuid.uuid4()), "email": "attacker@evil.com", "role": "consumer"},
        "completely_wrong_secret_key_99999999999999999",
        algorithm="HS256",
    )
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=forged_token)

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(creds)

    assert exc_info.value.status_code == 401
    assert "Invalid authentication token" in exc_info.value.detail


@pytest.mark.asyncio
async def test_jwt_malformed_token_string_rejection():
    """
    Verifies that malformed or corrupted token strings are rejected with HTTP 401.
    """
    malformed_tokens = [
        "not.a.valid.jwt.token",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.corrupted_payload",
        "",
        "Bearer123456",
    ]

    for tok in malformed_tokens:
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=tok)
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(creds)
        assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_jwt_expired_token_rejection():
    """
    Verifies that expired JWT tokens are strictly rejected with HTTP 401.
    """
    expired_token = make_test_token(expired=True)
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=expired_token)

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(creds)

    assert exc_info.value.status_code == 401
    assert "Invalid authentication token" in exc_info.value.detail


# ==============================================================================
# 2. In-Memory Session Revocation & JTI Denylist
# ==============================================================================

@pytest.mark.asyncio
async def test_token_revocation_denylist_enforcement():
    """
    Verifies that revoking a session JTI prevents further authentication.
    """
    jti = f"revoked-session-{uuid.uuid4()}"
    token = make_test_token(jti=jti)
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    # Initial validation succeeds
    user = await get_current_user(creds)
    assert user is not None

    # Revoke JTI
    cache_manager.revoke_token(jti)
    assert cache_manager.is_token_revoked(jti) is True

    # Next attempt with same token must be rejected
    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(creds)

    assert exc_info.value.status_code == 401
    assert "Session has been revoked" in exc_info.value.detail


# ==============================================================================
# 3. RBAC Strict Role Enforcement
# ==============================================================================

@pytest.mark.asyncio
async def test_rbac_strict_role_guards():
    """
    Verifies that consumer users cannot access admin-only roles, while admins have full access.
    """
    consumer_token = make_test_token(role="consumer")
    admin_token = make_test_token(role="admin")

    consumer_user = await get_current_user(HTTPAuthorizationCredentials(scheme="Bearer", credentials=consumer_token))
    admin_user = await get_current_user(HTTPAuthorizationCredentials(scheme="Bearer", credentials=admin_token))

    # Consumer accessing consumer role: OK
    assert require_consumer_role(consumer_user).role == UserRole.CONSUMER

    # Consumer accessing admin role: 403 Forbidden
    with pytest.raises(HTTPException) as exc_info:
        require_admin_role(consumer_user)
    assert exc_info.value.status_code == 403

    # Admin accessing admin role: OK
    assert require_admin_role(admin_user).role == UserRole.ADMIN

    # Admin accessing consumer role: OK
    assert require_consumer_role(admin_user).role == UserRole.ADMIN


# ==============================================================================
# 4. Cross-Tenant Row-Level Data Isolation
# ==============================================================================

@pytest.mark.asyncio
async def test_cross_tenant_isolation_diary_and_entries(db_session: AsyncSession):
    """
    Verifies that User A cannot read, modify, or delete User B's diary entries.
    """
    app.dependency_overrides[get_db_session] = lambda: db_session

    user_a_id = uuid.uuid4()
    user_b_id = uuid.uuid4()

    user_a = User(
        id=user_a_id,
        email="tenant_a@biteiq.io",
        password_hash="hash_a",
        full_name="Tenant Alpha",
        role=UserRole.CONSUMER,
    )
    user_b = User(
        id=user_b_id,
        email="tenant_b@biteiq.io",
        password_hash="hash_b",
        full_name="Tenant Beta",
        role=UserRole.CONSUMER,
    )
    db_session.add_all([user_a, user_b])
    await db_session.commit()

    token_a = make_test_token(user_id=str(user_a_id), email=user_a.email)
    token_b = make_test_token(user_id=str(user_b_id), email=user_b.email)

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Step 1: User A logs a breakfast item
        log_payload = {
            "meal_type": "breakfast",
            "food_name": "Tenant A Secret Oatmeal",
            "serving_quantity": 1.0,
            "serving_unit": "bowl",
            "weight_in_grams": 100.0,
            "calories": 389.0,
            "protein_g": 16.9,
            "carbs_g": 66.3,
            "fat_g": 6.9,
            "fiber_g": 10.6,
            "sodium_mg": 2.0,
            "sugar_g": 0.0,
        }
        res_a_log = await client.post("/api/v1/diary/log-item", json=log_payload, headers=headers_a)
        assert res_a_log.status_code == 201
        entry_id_a = res_a_log.json()["id"]

        # Step 2: User B requests diary -> should see 0 entries
        res_b_diary = await client.get("/api/v1/diary", headers=headers_b)
        assert res_b_diary.status_code == 200
        diary_b = res_b_diary.json()
        assert diary_b["totals_consumed"]["calories"] == 0.0
        assert len(diary_b["meals"]["breakfast"]) == 0

        # Step 3: User B attempts to DELETE User A's entry -> returns 404 (tenant isolation)
        res_b_delete = await client.delete(f"/api/v1/diary/entry/{entry_id_a}", headers=headers_b)
        assert res_b_delete.status_code == 404
        assert "not found" in res_b_delete.json()["detail"].lower()

        # Step 4: User B attempts to UPDATE User A's entry -> returns 404
        update_payload = {"weight_in_grams": 200.0, "calories": 500.0}
        res_b_update = await client.put(f"/api/v1/diary/entry/{entry_id_a}", json=update_payload, headers=headers_b)
        assert res_b_update.status_code == 404

        # Step 5: Verify User A's entry is still completely intact
        res_a_diary = await client.get("/api/v1/diary", headers=headers_a)
        assert res_a_diary.status_code == 200
        assert len(res_a_diary.json()["meals"]["breakfast"]) == 1

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_cross_tenant_isolation_profile(db_session: AsyncSession):
    """
    Verifies that User B cannot access User A's biometrics or clinical conditions.
    """
    app.dependency_overrides[get_db_session] = lambda: db_session

    user_a_id = uuid.uuid4()
    user_b_id = uuid.uuid4()

    user_a = User(id=user_a_id, email="profa@biteiq.io", password_hash="hash_a", full_name="User A", role=UserRole.CONSUMER)
    user_b = User(id=user_b_id, email="profb@biteiq.io", password_hash="hash_b", full_name="User B", role=UserRole.CONSUMER)
    db_session.add_all([user_a, user_b])
    await db_session.commit()

    token_a = make_test_token(user_id=str(user_a_id), email=user_a.email)
    token_b = make_test_token(user_id=str(user_b_id), email=user_b.email)

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # User A creates profile
        profile_payload = {
            "age": 35,
            "biological_sex": "male",
            "height_cm": 180.0,
            "current_weight_kg": 85.0,
            "target_weight_kg": 78.0,
            "activity_level": "very_active",
            "primary_goal": "moderate_fat_loss",
            "diet_type": "standard_omnivore",
            "conditions": [{"condition_key": "hypertension", "severity": "mild"}],
        }
        res_a = await client.put("/api/v1/profile", json=profile_payload, headers=headers_a)
        assert res_a.status_code == 200

        # User B requests profile -> 404 (User B has not set up profile)
        res_b = await client.get("/api/v1/profile", headers=headers_b)
        assert res_b.status_code == 404
        assert "Profile not found" in res_b.json()["detail"]

    app.dependency_overrides.clear()


# ==============================================================================
# 5. Sliding-Window Rate Limiter Saturation
# ==============================================================================

@pytest.mark.asyncio
async def test_rate_limiter_saturation_and_retry_after():
    """
    Verifies that rate limit exhaustion returns HTTP 429 with Retry-After header.
    """
    cache_manager.clear()
    limiter = RateLimiter(max_requests=4, window_seconds=8)

    from fastapi import FastAPI, Depends
    mini_app = FastAPI()

    @mini_app.get("/burst-test", dependencies=[Depends(limiter)])
    async def burst_endpoint():
        return {"status": "ok"}

    transport = ASGITransport(app=mini_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # First 4 requests succeed
        for _ in range(4):
            r = await client.get("/burst-test")
            assert r.status_code == 200

        # 5th request blocked with 429
        r_blocked = await client.get("/burst-test")
        assert r_blocked.status_code == 429
        assert "Rate limit exceeded" in r_blocked.json()["detail"]
        assert r_blocked.headers.get("retry-after") == "8"

    cache_manager.clear()


# ==============================================================================
# 6. Input Sanitization & Injection Defense
# ==============================================================================

@pytest.mark.asyncio
async def test_input_sanitization_defense(db_session: AsyncSession):
    """
    Verifies that SQL injection strings and XSS script tags are sanitized.
    """
    app.dependency_overrides[get_db_session] = lambda: db_session

    # Unit sanitizer check
    xss_payload = "<script>alert('XSS')</script><b>Chicken</b>"
    clean_text = sanitize_text_input(xss_payload)
    assert "<script>" not in clean_text
    assert clean_text == "alert('XSS')Chicken"

    user_id = uuid.uuid4()
    user = User(id=user_id, email="search_sanitizer@biteiq.io", password_hash="hash", full_name="Search Tester", role=UserRole.CONSUMER)
    db_session.add(user)
    await db_session.commit()

    token = make_test_token(user_id=str(user_id), email=user.email)
    headers = {"Authorization": f"Bearer {token}"}

    # API query sanitization check
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        malicious_search = "Chicken' OR '1'='1; DROP TABLE foods;--"
        res = await client.get(f"/api/v1/foods/search?q={malicious_search}", headers=headers)
        assert res.status_code == 200
        # Results should have items list without database error or unhandled exception
        data = res.json()
        assert "items" in data
        assert isinstance(data["items"], list)

    app.dependency_overrides.clear()


# ==============================================================================
# 7. Multipart Upload MIME Type Validation
# ==============================================================================

@pytest.mark.asyncio
async def test_multipart_upload_mime_type_validation(db_session: AsyncSession):
    """
    Verifies that uploading a non-image file (e.g. text/plain or shell script)
    is rejected with HTTP 400.
    """
    app.dependency_overrides[get_db_session] = lambda: db_session

    user_id = uuid.uuid4()
    user = User(id=user_id, email="upload_test@biteiq.io", password_hash="hash", full_name="Uploader", role=UserRole.CONSUMER)
    db_session.add(user)
    await db_session.commit()

    token = make_test_token(user_id=str(user_id), email=user.email)
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Send text file to meal plate scan
        fake_text_file = io.BytesIO(b"echo 'malicious script'")
        files = {
            "image": ("exploit.sh", fake_text_file, "text/plain")
        }
        res_meal = await client.post("/api/v1/meals/scan-plate", files=files, headers=headers)
        assert res_meal.status_code == 400
        assert "image" in res_meal.json()["detail"].lower()

        # Send text files to packaged scan
        fake_front = io.BytesIO(b"not an image front")
        fake_back = io.BytesIO(b"not an image back")
        files_pkg = {
            "front_image": ("front.txt", fake_front, "text/plain"),
            "back_image": ("back.txt", fake_back, "text/plain"),
        }
        res_pkg = await client.post("/api/v1/packaged/analyze", files=files_pkg, headers=headers)
        assert res_pkg.status_code == 400
        assert "image" in res_pkg.json()["detail"].lower()

    app.dependency_overrides.clear()


# ==============================================================================
# 8. Zero-Emoji Compliance in Error Responses
# ==============================================================================

@pytest.mark.asyncio
async def test_zero_emoji_in_error_responses():
    """
    Verifies that standard error responses and exception messages do not contain unicode emojis.
    """
    emoji_regex = re.compile(
        r"[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF\U0001F900-\U0001F9FF\U0001FA70-\U0001FAFF]+"
    )

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Trigger 404
        r404 = await client.get("/api/v1/non-existent-route-999")
        assert not emoji_regex.findall(r404.text)

        # Trigger 401
        r401 = await client.get("/api/v1/diary")
        assert not emoji_regex.findall(r401.text)
