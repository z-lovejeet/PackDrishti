import pytest
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.models import (
    User,
    UserRole,
    HealthAudit,
    ScanHistory,
)


@pytest.mark.asyncio
async def test_user_model_crud(db_session: AsyncSession):
    """
    Verifies User model creation, querying, and role assignment.
    """
    consumer = User(
        email="citizen.patel@example.com",
        password_hash="hashed_secret_123",
        role=UserRole.CONSUMER,
        full_name="Rajesh Patel",
    )
    db_session.add(consumer)
    await db_session.commit()

    result = await db_session.execute(select(User).where(User.email == "citizen.patel@example.com"))
    fetched = result.scalar_one_or_none()

    assert fetched is not None
    assert fetched.role == UserRole.CONSUMER
    assert fetched.full_name == "Rajesh Patel"
    assert fetched.is_active is True
    assert fetched.created_at is not None


@pytest.mark.asyncio
async def test_health_audits_and_scan_history(db_session: AsyncSession):
    """
    Verifies HealthAudit creation and ScanHistory linking.
    """
    citizen = User(
        email="citizen.verma@example.com",
        password_hash="hash_abc",
        role=UserRole.CONSUMER,
        full_name="Anil Verma",
    )
    db_session.add(citizen)
    await db_session.flush()

    health = HealthAudit(
        user_id=citizen.id,
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
        user_id=citizen.id,
        health_audit_id=health.id,
        scan_type="health_check",
    )
    db_session.add(history)
    await db_session.commit()

    # Query back
    health_res = await db_session.execute(
        select(HealthAudit).where(HealthAudit.product_name == "Maggi 2-Minute Noodles")
    )
    fetched_health = health_res.scalar_one()
    assert fetched_health.health_score == Decimal("38.50")
    assert fetched_health.brand == "Nestle"
    assert len(fetched_health.scan_history_entries) == 1
    assert fetched_health.scan_history_entries[0].scan_type == "health_check"


@pytest.mark.asyncio
async def test_cascade_delete_health_audit(db_session: AsyncSession):
    """
    Verifies that deleting a HealthAudit removes associated ScanHistory entries.
    """
    audit = HealthAudit(
        product_name="Bournvita Pro Health Drink",
        brand="Cadbury",
        front_image_url="https://example.com/front.jpg",
        back_image_url="https://example.com/back.jpg",
        health_score=Decimal("32.00"),
        nutrients_json=[{"name": "Added Sugars", "per_100g": 32.2}],
        badges_json=[{"id": "BADGE_HIGH_SUGAR", "label": "High Added Sugar"}],
        dietary_advisory_json={"who_should_avoid": [], "healthier_alternatives": []},
    )
    db_session.add(audit)
    await db_session.flush()

    history = ScanHistory(
        health_audit_id=audit.id,
        scan_type="health_check",
    )
    db_session.add(history)
    await db_session.commit()

    audit_id = audit.id
    await db_session.delete(audit)
    await db_session.commit()

    hist_res = await db_session.execute(
        select(ScanHistory).where(ScanHistory.health_audit_id == audit_id)
    )
    assert len(hist_res.scalars().all()) == 0
