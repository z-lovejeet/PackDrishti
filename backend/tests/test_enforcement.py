"""
PackDrashiti - Statutory Enforcement & Officer Docket Unit Tests
Tests CompoundingEngine (Section 48, Legal Metrology Act, 2009),
StatutoryPDFGenerator (FORM LM-INSP-2011 with BSA 2023 Sec 63(4)),
and Phase 6 enforcement and dashboard REST endpoints.
"""

import io
import uuid
from decimal import Decimal
from datetime import datetime, timezone, timedelta
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.main import app
from backend.src.core.database import get_db_session
from backend.src.models.scan import ProductScan, ComplianceStatus
from backend.src.models.violation import StatutoryViolation, ViolationSeverity
from backend.src.services.compounding_engine import (
    CompoundingEngine,
    CompoundingCalculationRequest,
    ViolationInput,
)
from backend.src.services.pdf_generator import StatutoryPDFGenerator


def test_compounding_engine_first_offence_prompt_discount():
    """
    Test 1st offence compounding calculation with 20% prompt payment discount (Jan Vishwas Act 2023).
    """
    req = CompoundingCalculationRequest(
        violations=[
            ViolationInput(rule_reference="Rule 6(1)(e)", title="Missing Unit Sale Price", severity="high"),
            ViolationInput(rule_reference="Rule 7 Table-I", title="Deficient Font Height", severity="medium"),
        ],
        offence_count=1,
        prompt_settlement=True,
    )
    res = CompoundingEngine.calculate_compounding(req)

    assert res.is_compoundable is True
    assert res.court_prosecution_mandatory is False
    assert res.effective_offence_tier == "first"
    assert res.gross_compounding_fee_inr == 17500.0  # 10000 + 7500
    assert res.prompt_settlement_discount_inr == 3500.0  # 20%
    assert res.net_payable_compounding_fee_inr == 14000.0
    assert len(res.breakdown) == 2
    assert "Section 48" in res.statutory_authorities[2]


def test_compounding_engine_second_offence_doubling():
    """
    Test 2nd offence within 3 years doubles compounding fee up to statutory ceiling.
    """
    req = CompoundingCalculationRequest(
        violations=[
            ViolationInput(rule_reference="Rule 6(1)(e)", title="Missing Unit Sale Price", severity="high"),
        ],
        offence_count=2,
        days_since_last_offence=180,
        prompt_settlement=False,
    )
    res = CompoundingEngine.calculate_compounding(req)

    assert res.is_compoundable is True
    assert res.effective_offence_tier == "second"
    assert res.gross_compounding_fee_inr == 20000.0  # 10000 * 2
    assert res.net_payable_compounding_fee_inr == 20000.0
    assert res.three_year_reset_applied is False


def test_compounding_engine_three_year_reset_rule():
    """
    Test Section 48(2): Offence committed after 3 years (1095 days) resets to First Offence.
    """
    req = CompoundingCalculationRequest(
        violations=[
            ViolationInput(rule_reference="Rule 6(1)(e)", title="Missing Unit Sale Price", severity="high"),
        ],
        offence_count=2,
        days_since_last_offence=1200,  # Over 3 years
        prompt_settlement=False,
    )
    res = CompoundingEngine.calculate_compounding(req)

    assert res.effective_offence_tier == "first"
    assert res.three_year_reset_applied is True
    assert res.gross_compounding_fee_inr == 10000.0  # Reset to 1x multiplier


def test_compounding_engine_subsequent_offence_uncompoundable():
    """
    Test Section 48(1) proviso: 3rd or subsequent offence cannot be compounded;
    mandatory court prosecution under Section 36(1).
    """
    req = CompoundingCalculationRequest(
        violations=[
            ViolationInput(rule_reference="Rule 18", title="Dual MRP Infraction", severity="high"),
        ],
        offence_count=3,
        days_since_last_offence=200,
        prompt_settlement=False,
    )
    res = CompoundingEngine.calculate_compounding(req)

    assert res.is_compoundable is False
    assert res.court_prosecution_mandatory is True
    assert res.effective_offence_tier == "subsequent_court_prosecution"
    assert "prosecution" in res.enforcement_summary.lower()


def test_statutory_pdf_generator_form_lm_insp_2011():
    """
    Test ReportLab generation of official FORM LM-INSP-2011 PDF.
    Verifies valid PDF byte signature and non-empty docket content.
    """
    scan_data = {
        "id": "e4b6c8a0-1234-5678-9abc-def012345678",
        "scan_code": "INSP-2026-DEL-088",
        "product_name": "NutriPro Protein Cereal",
        "brand": "NutriPro Consumer Goods Ltd.",
        "category": "Food & Beverage",
        "barcode": "8901234567890",
        "pdp_area_cm2": 160.0,
        "net_quantity": "400 g",
        "mrp": "Rs. 250.00",
        "location": "Connaught Place, New Delhi",
        "scanned_by": "Inspector R. K. Sharma",
        "inspector_designation": "Senior Inspector, Legal Metrology",
        "scanned_at": "10-Sep-2026 10:30:00 UTC",
    }

    violations = [
        {
            "rule_reference": "Rule 6(1)(e)",
            "act_section": "Section 36(1)",
            "title": "Missing Unit Sale Price",
            "description": "Mandatory USP declaration absent from Principal Display Panel.",
            "severity": "high",
            "compounding_amount": 10000.0,
        }
    ]

    pdf_bytes = StatutoryPDFGenerator.generate_form_lm_insp_2011(
        scan_data=scan_data,
        violations=violations,
        compounding_data={"net_payable_compounding_fee_inr": 8000.0, "prompt_settlement_discount_inr": 2000.0},
    )

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 2000
    assert pdf_bytes.startswith(b"%PDF-")


@pytest.mark.asyncio
async def test_api_compounding_calculate():
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
        assert data["net_payable_compounding_fee_inr"] == 8000.0
        assert len(data["breakdown"]) == 1


@pytest.mark.asyncio
async def test_api_stream_inspection_pdf(db_session: AsyncSession):
    """
    Test GET /api/v1/reports/pdf/{scan_id} streaming binary PDF.
    """
    scan_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
    scan = ProductScan(
        id=scan_id,
        scan_code="SCAN-2026-DEL-0001",
        product_name="VitaHealth Malted Nutrition Drink 500g",
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
async def test_api_dashboard_metrics(db_session: AsyncSession):
    """
    Test GET /api/v1/dashboard/metrics.
    """
    scan = ProductScan(
        scan_code="SCAN-2026-DEL-0003",
        product_name="SunHarvest Cold Pressed Mustard Oil 1L",
        brand="SunHarvest",
        category="Food & Beverage",
        pdp_area_cm2=Decimal("220.00"),
        net_quantity="1 L",
        mrp="Rs. 190.00",
        mfg_date="10/2025",
        overall_status=ComplianceStatus.VIOLATION,
        compliance_score=Decimal("70.00"),
        image_url="https://example.com/scan3.jpg",
    )
    db_session.add(scan)
    await db_session.flush()

    viol = StatutoryViolation(
        scan_id=scan.id,
        rule_reference="Rule 6(1)(e)",
        act_section="Section 36(1)",
        title="Missing Unit Sale Price (USP)",
        description="Packaged commodity lacks statutory Unit Sale Price declaration.",
        penalty_clause="Fine up to Rs. 25,000 for first offence under Section 36(1)",
        severity=ViolationSeverity.HIGH,
        corrective_action="Print statutory Unit Sale Price adjacent to Maximum Retail Price.",
    )
    db_session.add(viol)
    await db_session.commit()

    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/dashboard/metrics")
        assert res.status_code == 200
        data = res.json()
        assert data["total_inspections"] > 0
        assert "Food & Beverage" in data["violations_by_category"]
        assert len(data["top_violating_rules"]) >= 1
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_api_dashboard_activity(db_session: AsyncSession):
    """
    Test GET /api/v1/dashboard/activity.
    """
    scan = ProductScan(
        scan_code="SCAN-2026-DEL-0004",
        product_name="Supreme Pure Basmati Rice 5kg",
        brand="Supreme",
        category="Food & Beverage",
        pdp_area_cm2=Decimal("350.00"),
        net_quantity="5 kg",
        mrp="Rs. 450.00",
        mfg_date="10/2025",
        overall_status=ComplianceStatus.COMPLIANT,
        compliance_score=Decimal("100.00"),
        image_url="https://example.com/scan4.jpg",
    )
    db_session.add(scan)
    await db_session.commit()

    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/dashboard/activity")
        assert res.status_code == 200
        data = res.json()
        assert data["total_activities"] > 0
        assert len(data["activities"]) > 0
        act = data["activities"][0]
        assert "Statutory" in act["action"]
    app.dependency_overrides.clear()
