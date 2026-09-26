"""
PackDrashiti - Comprehensive REST Endpoint & Security Hardening Test Suite
Verifies all public & secured API routes, security headers middleware,
sliding-window rate limiting (HTTP 429), and input sanitization.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.main import app
from backend.src.core.database import get_db_session
from backend.src.core.cache import cache_manager
from backend.src.core.security import RateLimiter, sanitize_text_input


@pytest.mark.asyncio
async def test_root_and_security_headers():
    """
    Test root probes and verify security headers middleware injection:
    X-Content-Type-Options: nosniff
    X-Frame-Options: DENY
    X-XSS-Protection: 1; mode=block
    Referrer-Policy: strict-origin-when-cross-origin
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "ok"

        # Verify security defense headers
        assert res.headers.get("x-content-type-options") == "nosniff"
        assert res.headers.get("x-frame-options") == "DENY"
        assert "1; mode=block" in res.headers.get("x-xss-protection", "")
        assert res.headers.get("referrer-policy") == "strict-origin-when-cross-origin"

        # Root index
        res_root = await client.get("/")
        assert res_root.status_code == 200
        assert res_root.json()["name"] == "PackDrashiti"


@pytest.mark.asyncio
async def test_health_api_endpoints(db_session: AsyncSession):
    """
    Test GET /api/v1/health probe, GET /api/v1/health/history, and 404 handling on missing audit.
    """
    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] in ("ok", "healthy")
        assert "database" in data["subsystems"]

        # Consumer scan history endpoint
        res_history = await client.get("/api/v1/health/history")
        assert res_history.status_code == 200
        hist_data = res_history.json()
        assert isinstance(hist_data, list)

        # Non-existent audit returns 404
        res_404 = await client.get("/api/v1/health/00000000-0000-0000-0000-000000000099")
        assert res_404.status_code == 404
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_rate_limiter_burst_protection():
    """
    Test sliding-window rate limiting triggers HTTP 429 when threshold exceeded.
    """
    cache_manager.clear()
    limiter = RateLimiter(max_requests=5, window_seconds=10)

    # Use a mock dummy app with a strict rate limiter to verify 429
    from fastapi import FastAPI, Depends
    mini_app = FastAPI()

    @mini_app.get("/limited", dependencies=[Depends(limiter)])
    async def limited_endpoint():
        return {"status": "ok"}

    transport = ASGITransport(app=mini_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Send 5 permitted requests
        for _ in range(5):
            r = await client.get("/limited")
            assert r.status_code == 200

        # 6th request must trigger HTTP 429 Too Many Requests
        r_blocked = await client.get("/limited")
        assert r_blocked.status_code == 429
        assert "Rate limit exceeded" in r_blocked.json()["detail"]
        assert r_blocked.headers.get("retry-after") == "10"

    cache_manager.clear()


def test_input_sanitizer():
    """
    Unit tests for sanitize_text_input.
    """
    assert sanitize_text_input("<script>alert(1)</script>hello") == "alert(1)hello"
    assert sanitize_text_input("<b>Bold Label</b>") == "Bold Label"
    assert sanitize_text_input("clean_input_123") == "clean_input_123"
    assert sanitize_text_input("test" + chr(0) + "nullbyte") == "testnullbyte"
    assert sanitize_text_input(None) == ""
