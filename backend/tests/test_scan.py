import io
import uuid
from decimal import Decimal
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.main import app
from backend.src.core.database import get_db_session
from backend.src.models.scan import ProductScan, ComplianceStatus
from backend.src.models.violation import StatutoryViolation, ViolationSeverity


@pytest.mark.asyncio
async def test_upload_packaging_scan_image(db_session: AsyncSession):
    """
    Test POST /api/v1/scan/upload with multipart image file.
    """
    app.dependency_overrides[get_db_session] = lambda: db_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        file_content = b"Fake JPEG binary packaging scan content for test"
        files = {"file": ("packet.jpg", io.BytesIO(file_content), "image/jpeg")}

        response = await client.post("/api/v1/scan/upload", files=files)
        assert response.status_code == 200

        data = response.json()
        assert "scan_id" in data
        assert "file_hash" in data
        assert data["file_size_bytes"] == len(file_content)
        assert "/static/uploads/" in data["file_url"]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_analyze_packaging_compliance(db_session: AsyncSession):
    """
    Test POST /api/v1/scan/analyze with multipart image payload triggering LangGraph.
    """
    app.dependency_overrides[get_db_session] = lambda: db_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        file_content = b"MRP Rs. 120.00 Net Quantity: 500 g"
        files = {"file": ("biscuit.jpg", io.BytesIO(file_content), "image/jpeg")}

        response = await client.post("/api/v1/scan/analyze", files=files)
        assert response.status_code == 200

        data = response.json()
        assert "scan_id" in data
        assert "compliance_score" in data
        assert data["calculated_usp"] is not None
        assert data["calculated_usp_unit"] == "g"
        assert "violations" in data
        assert "tokens" in data
        assert len(data["consumer_advisory"]) > 10

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_scan_by_id_and_history(db_session: AsyncSession):
    """
    Test GET /api/v1/scan/{scan_id} and GET /api/v1/scan/history.
    """
    app.dependency_overrides[get_db_session] = lambda: db_session

    scan_id = uuid.uuid4()
    scan = ProductScan(
        id=scan_id,
        scan_code="SCAN-TEST001",
        brand="Britannia",
        product_name="Good Day Biscuits",
        category="Bakery",
        pdp_area_cm2=Decimal("120.00"),
        mrp="Rs. 30.00",
        net_quantity="100 g",
        mfg_date="01/2025",
        overall_status=ComplianceStatus.COMPLIANT,
        compliance_score=Decimal("100.00"),
        image_url="/static/uploads/test.jpg",
    )
    db_session.add(scan)
    await db_session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Test get by ID
        get_res = await client.get(f"/api/v1/scan/{scan_id}")
        assert get_res.status_code == 200
        get_data = get_res.json()
        assert get_data["scan_id"] == str(scan_id)
        assert get_data["brand_name"] == "Britannia"

        # Test history
        hist_res = await client.get("/api/v1/scan/history")
        assert hist_res.status_code == 200
        hist_data = hist_res.json()
        assert len(hist_data) >= 1
        assert any(s["scan_id"] == str(scan_id) for s in hist_data)

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_rules_search_endpoint():
    """
    Test GET /api/v1/rules/search.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/rules/search?q=unit+sale+price")
        assert response.status_code == 200
        data = response.json()
        assert data["total_results"] > 0
        assert len(data["citations"]) > 0


@pytest.mark.asyncio
async def test_generate_statutory_show_cause_notice(db_session: AsyncSession):
    """
    Test POST /api/v1/violations/{id}/generate-notice.
    """
    app.dependency_overrides[get_db_session] = lambda: db_session

    scan_id = uuid.uuid4()
    scan = ProductScan(
        id=scan_id,
        scan_code="SCAN-TEST002",
        brand="Offending Brand Ltd",
        product_name="Deficient Packaged Commodity",
        category="Snacks",
        pdp_area_cm2=Decimal("150.00"),
        mrp="Rs. 40.00",
        net_quantity="200 g",
        mfg_date="02/2025",
        overall_status=ComplianceStatus.VIOLATION,
        compliance_score=Decimal("40.00"),
        image_url="/static/uploads/offending.jpg",
    )
    db_session.add(scan)

    viol_id = uuid.uuid4()
    violation = StatutoryViolation(
        id=viol_id,
        scan_id=scan_id,
        rule_reference="PCR_RULE_7_FONT",
        act_section="Rule 7 Table-I, PCR 2011",
        title="Minimum Font Height Deficient",
        description="Font size 1.0mm is below required 2.0mm for 150 cm2 package.",
        penalty_clause="Section 36(1) compounding amount: Rs. 5,000",
        severity=ViolationSeverity.MEDIUM,
        corrective_action="Increase numeral height to minimum 2.0mm",
    )
    db_session.add(violation)
    await db_session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(f"/api/v1/violations/{viol_id}/generate-notice")
        assert response.status_code == 200

        data = response.json()
        assert data["violation_id"] == str(viol_id)
        assert data["form_type"] == "FORM LM-INSP-2011"
        assert "FORM LM-INSP-2011" in data["show_cause_notice"]
        assert len(data["statutory_citations"]) > 0

    app.dependency_overrides.clear()
