"""
PackDrashiti - Comprehensive REST Endpoint & Security Hardening Test Suite
Verifies all public & secured API routes, security headers middleware,
sliding-window rate limiting (HTTP 429), and input sanitization.
"""

import io
import uuid
from decimal import Decimal
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.main import app
from backend.src.core.database import get_db_session
from backend.src.core.cache import cache_manager
from backend.src.core.security import RateLimiter, sanitize_text_input
from backend.src.models.scan import ProductScan, ComplianceStatus


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
    Test GET /api/v1/health probe and 404 handling on missing audit.
    """
    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] in ("ok", "healthy")
        assert "database" in data["subsystems"]

        # Non-existent audit returns 404
        res_404 = await client.get("/api/v1/health/00000000-0000-0000-0000-000000000099")
        assert res_404.status_code == 404
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_rules_search_endpoint(db_session: AsyncSession):
    """
    Test GET /api/v1/rules/search with semantic query and input sanitization.
    """
    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/rules/search?q=unit+sale+price")
        assert res.status_code == 200
        data = res.json()
        assert "citations" in data
        assert data["query"] == "unit sale price"

        # Test with malicious script tag in query (must be sanitized)
        res_xss = await client.get("/api/v1/rules/search?q=<script>alert('xss')</script>dual+mrp")
        assert res_xss.status_code == 200
        assert "<script>" not in res_xss.json()["query"]
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_compounding_calculate_endpoint():
    """
    Test POST /api/v1/compounding/calculate.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "offence_count": 1,
            "prompt_settlement": True,
            "violations": [
                {
                    "rule_reference": "Rule 6(1)(e)",
                    "title": "Missing Unit Sale Price",
                    "severity": "high",
                }
            ],
        }
        res = await client.post("/api/v1/compounding/calculate", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["is_compoundable"] is True
        assert data["gross_compounding_fee_inr"] == 10000.0
        assert data["prompt_settlement_discount_inr"] == 2000.0
        assert data["net_payable_compounding_fee_inr"] == 8000.0


@pytest.mark.asyncio
async def test_compounding_validation_error():
    """
    Test POST /api/v1/compounding/calculate with invalid payload returns 422 Unprocessable Entity.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Invalid offence_count: must be >= 1
        res = await client.post("/api/v1/compounding/calculate", json={"offence_count": 0, "violations": []})
        assert res.status_code == 422


@pytest.mark.asyncio
async def test_pdf_streaming_endpoint(db_session: AsyncSession):
    """
    Test GET /api/v1/reports/pdf/{scan_id} streams valid PDF binary.
    """
    scan_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    scan = ProductScan(
        id=scan_id,
        scan_code="SCAN-2026-DEL-0001",
        product_name="VitaHealth Malted Drink 500g",
        brand="VitaHealth",
        category="Food & Beverage",
        pdp_area_cm2=Decimal("200.00"),
        net_quantity="500 g",
        mrp="Rs. 245.00",
        mfg_date="10/2025",
        overall_status=ComplianceStatus.VIOLATION,
        compliance_score=Decimal("65.00"),
        image_url="https://example.com/scan.jpg",
    )
    db_session.add(scan)
    await db_session.commit()

    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get(f"/api/v1/reports/pdf/{scan_id}")
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        assert res.headers["x-statutory-form"] == "FORM LM-INSP-2011"
        assert res.content.startswith(b"%PDF-")
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_dashboard_metrics_and_activity_endpoints(db_session: AsyncSession):
    """
    Test GET /api/v1/dashboard/metrics and GET /api/v1/dashboard/activity.
    """
    scan = ProductScan(
        scan_code="SCAN-2026-DEL-0002",
        product_name="Organic Basmati Rice",
        brand="IndiaGate",
        category="Food & Beverage",
        pdp_area_cm2=Decimal("250.00"),
        net_quantity="1 kg",
        mrp="Rs. 150.00",
        mfg_date="10/2025",
        overall_status=ComplianceStatus.COMPLIANT,
        compliance_score=Decimal("100.00"),
        image_url="https://example.com/scan2.jpg",
    )
    db_session.add(scan)
    await db_session.commit()

    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res_m = await client.get("/api/v1/dashboard/metrics")
        assert res_m.status_code == 200
        assert res_m.json()["total_inspections"] >= 1

        res_a = await client.get("/api/v1/dashboard/activity")
        assert res_a.status_code == 200
        assert len(res_a.json()["activities"]) >= 1
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
