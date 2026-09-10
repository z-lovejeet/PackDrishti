import uuid
import pytest
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.models import (
    User,
    UserRole,
    ProductScan,
    ExtractedDeclaration,
    ComplianceStatus,
    StatutoryKnowledgeBase,
    StatutoryViolation,
    ViolationRecord,
    ViolationSeverity,
    ComplianceReport,
    HealthAudit,
    ScanHistory,
)


@pytest.mark.asyncio
async def test_user_model_crud(db_session: AsyncSession):
    """
    Verifies User model creation, querying, and role assignment.
    """
    officer = User(
        email="officer.patel@delhi.gov.in",
        password_hash="hashed_secret_123",
        role=UserRole.OFFICER,
        full_name="Rajesh Patel",
        badge_number="LMO-DL-2024-001",
        designation="Senior Legal Metrology Inspector",
        zone="DL-CENTRAL",
        jurisdiction="Central Delhi Market Division",
    )
    db_session.add(officer)
    await db_session.commit()

    result = await db_session.execute(select(User).where(User.email == "officer.patel@delhi.gov.in"))
    fetched = result.scalar_one_or_none()

    assert fetched is not None
    assert fetched.role == UserRole.OFFICER
    assert fetched.badge_number == "LMO-DL-2024-001"
    assert fetched.is_active is True
    assert fetched.created_at is not None


@pytest.mark.asyncio
async def test_product_scan_and_extracted_declarations(db_session: AsyncSession):
    """
    Verifies ProductScan creation, linking to ExtractedDeclarations, and relationship traversal.
    """
    scan = ProductScan(
        scan_code="SCAN-2026-DEL-0091",
        product_name="Bournvita Pro Health Drink",
        brand="Cadbury",
        category="Health Drinks",
        barcode="8901233024823",
        pdp_area_cm2=Decimal("240.50"),
        net_quantity="500 g",
        mrp="INR 280.00",
        mfg_date="11/2025",
        overall_status=ComplianceStatus.VIOLATION,
        compliance_score=Decimal("68.50"),
        image_url="https://storage.packdrashiti.gov.in/scans/bournvita_front.jpg",
        location="Connaught Place, New Delhi",
    )
    db_session.add(scan)
    await db_session.flush()

    declaration_mrp = ExtractedDeclaration(
        scan_id=scan.id,
        rule_clause="Rule 6(1)(e)",
        field_name="MRP",
        extracted_value="Rs 280 (incl of all taxes)",
        status=ComplianceStatus.COMPLIANT,
        measured_font_height_mm=Decimal("3.20"),
        required_font_height_mm=Decimal("3.00"),
        contrast_ratio=Decimal("7.50"),
    )
    declaration_usp = ExtractedDeclaration(
        scan_id=scan.id,
        rule_clause="Rule 6(1)(e) Second Proviso",
        field_name="Unit Sale Price",
        extracted_value="Missing",
        status=ComplianceStatus.VIOLATION,
        status_note="Unit Sale Price not declared on 500g package",
    )

    db_session.add_all([declaration_mrp, declaration_usp])
    await db_session.commit()

    # Query back via relationship
    result = await db_session.execute(
        select(ProductScan).where(ProductScan.scan_code == "SCAN-2026-DEL-0091")
    )
    fetched_scan = result.scalar_one()

    assert fetched_scan.product_name == "Bournvita Pro Health Drink"
    assert len(fetched_scan.extracted_declarations) == 2
    statuses = [d.status for d in fetched_scan.extracted_declarations]
    assert ComplianceStatus.COMPLIANT in statuses
    assert ComplianceStatus.VIOLATION in statuses


@pytest.mark.asyncio
async def test_statutory_knowledge_base_and_violations(db_session: AsyncSession):
    """
    Verifies StatutoryKnowledgeBase entry with vector embedding and linking to StatutoryViolation.
    """
    # Create legal authority entry in knowledge base
    mock_embedding = [0.012] * 1536
    knowledge = StatutoryKnowledgeBase(
        rule_identifier="Rule 6(1)(e)",
        title="Unit Sale Price Mandatory Declaration",
        act_reference="Legal Metrology (Packaged Commodities) Rules, 2011",
        amendment_year=2021,
        full_text="The unit sale price shall be declared on every package...",
        metadata_json={"mandatory": True, "schedule": "Second Proviso"},
        embedding=mock_embedding,
    )
    db_session.add(knowledge)
    await db_session.flush()

    scan = ProductScan(
        scan_code="SCAN-2026-MUM-0102",
        product_name="Whole Almonds Premium",
        brand="NutriFarm",
        category="Dry Fruits",
        pdp_area_cm2=Decimal("180.00"),
        net_quantity="500 g",
        mrp="INR 450.00",
        mfg_date="01/2026",
        overall_status=ComplianceStatus.VIOLATION,
        compliance_score=Decimal("75.00"),
        image_url="https://storage.packdrashiti.gov.in/scans/almonds.jpg",
    )
    db_session.add(scan)
    await db_session.flush()

    violation = StatutoryViolation(
        scan_id=scan.id,
        cited_knowledge_id=knowledge.id,
        rule_reference="Rule 6(1)(e)",
        act_section="Section 36(1)",
        title="Absence of Unit Sale Price",
        description="Commodity net weight exceeds 500g without per-gram unit pricing.",
        penalty_clause="Fine up to INR 25,000 for first offence under Section 36(1).",
        severity=ViolationSeverity.HIGH,
        corrective_action="Issue formal statutory show-cause notice.",
    )
    db_session.add(violation)
    await db_session.commit()

    # Query back
    result = await db_session.execute(
        select(StatutoryViolation).where(StatutoryViolation.scan_id == scan.id)
    )
    fetched_violation = result.scalar_one()

    assert fetched_violation.rule_reference == "Rule 6(1)(e)"
    assert fetched_violation.severity == ViolationSeverity.HIGH
    assert fetched_violation.cited_knowledge is not None
    assert fetched_violation.cited_knowledge.rule_identifier == "Rule 6(1)(e)"


@pytest.mark.asyncio
async def test_cascade_delete_product_scan(db_session: AsyncSession):
    """
    Verifies that deleting a ProductScan cascades to ExtractedDeclarations and StatutoryViolations.
    """
    scan = ProductScan(
        scan_code="SCAN-CASCADE-TEST",
        product_name="Test Product",
        brand="Test Brand",
        category="Test Category",
        pdp_area_cm2=Decimal("100.00"),
        net_quantity="100 g",
        mrp="INR 50.00",
        mfg_date="01/2026",
        overall_status=ComplianceStatus.PENDING,
        compliance_score=Decimal("50.00"),
        image_url="https://example.com/test.jpg",
    )
    db_session.add(scan)
    await db_session.flush()

    decl = ExtractedDeclaration(
        scan_id=scan.id,
        rule_clause="Rule 6(1)(a)",
        field_name="Name",
        extracted_value="Test Product",
        status=ComplianceStatus.COMPLIANT,
    )
    viol = StatutoryViolation(
        scan_id=scan.id,
        rule_reference="Rule 6(1)(a)",
        act_section="Section 36(1)",
        title="Test Violation",
        description="Description",
        penalty_clause="Penalty",
        severity=ViolationSeverity.LOW,
        corrective_action="Action",
    )
    db_session.add_all([decl, viol])
    await db_session.commit()

    # Delete scan
    await db_session.delete(scan)
    await db_session.commit()

    # Verify declarations and violations were cascaded
    decl_res = await db_session.execute(
        select(ExtractedDeclaration).where(ExtractedDeclaration.scan_id == scan.id)
    )
    assert len(decl_res.scalars().all()) == 0

    viol_res = await db_session.execute(
        select(StatutoryViolation).where(StatutoryViolation.scan_id == scan.id)
    )
    assert len(viol_res.scalars().all()) == 0


@pytest.mark.asyncio
async def test_compliance_reports_and_health_audits(db_session: AsyncSession):
    """
    Verifies ComplianceReport and HealthAudit models and scan history linking.
    """
    officer = User(
        email="inspector.verma@gov.in",
        password_hash="hash_abc",
        role=UserRole.OFFICER,
        full_name="Anil Verma",
        badge_number="LMO-MH-2024-112",
        designation="Inspector",
    )
    db_session.add(officer)
    await db_session.flush()

    report = ComplianceReport(
        report_number="REP-2026-DL-0012",
        officer_id=officer.id,
        report_type="FORM LM-INSP-2011",
        title="Inspection Certificate for Market Division",
        district="New Delhi",
        total_products_scanned=5,
        compliant_count=3,
        violation_count=2,
        pdf_url="https://storage.packdrashiti.gov.in/reports/rep_0012.pdf",
    )
    db_session.add(report)

    health = HealthAudit(
        user_id=officer.id,
        product_name="Maggi 2-Minute Noodles",
        brand="Nestle",
        front_image_url="https://example.com/front.jpg",
        back_image_url="https://example.com/back.jpg",
        health_score=Decimal("38.50"),
        nutrients_json=[{"nutrient": "Sodium", "value": "820mg", "status": "high"}],
        badges_json=[{"badge": "High Sodium", "severity": "red"}],
        dietary_advisory_json={"advisory": "High in sodium. Consume in moderation."},
    )
    db_session.add(health)
    await db_session.flush()

    history = ScanHistory(
        user_id=officer.id,
        health_audit_id=health.id,
        scan_type="health_check",
    )
    db_session.add(history)
    await db_session.commit()

    # Query back
    rep_res = await db_session.execute(
        select(ComplianceReport).where(ComplianceReport.report_number == "REP-2026-DL-0012")
    )
    fetched_report = rep_res.scalar_one()
    assert fetched_report.officer.full_name == "Anil Verma"
    assert fetched_report.total_products_scanned == 5

    health_res = await db_session.execute(
        select(HealthAudit).where(HealthAudit.product_name == "Maggi 2-Minute Noodles")
    )
    fetched_health = health_res.scalar_one()
    assert fetched_health.health_score == Decimal("38.50")
    assert len(fetched_health.scan_history_entries) == 1
