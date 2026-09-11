import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    String,
    Numeric,
    Text,
    DateTime,
    ForeignKey,
    CheckConstraint,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.src.models.base import Base, GUID


class HealthAudit(Base):
    __tablename__ = "health_audits"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    product_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    brand: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )
    front_image_url: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    back_image_url: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    health_score: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )
    nutrients_json: Mapped[List[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=False,
    )
    badges_json: Mapped[List[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=False,
    )
    dietary_advisory_json: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
    )
    mfg_date: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True,
    )
    expiry_date: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True,
    )
    is_expired: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )
    user_role: Mapped[str] = mapped_column(
        String(32),
        default="consumer",
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="health_audits",
    )
    scan_history_entries: Mapped[List["ScanHistory"]] = relationship(
        "ScanHistory",
        back_populates="health_audit",
        lazy="selectin",
    )

    __table_args__ = (
        CheckConstraint(
            "health_score >= 0.00 AND health_score <= 100.00",
            name="chk_health_audits_score",
        ),
    )


class ScanHistory(Base):
    __tablename__ = "scan_history"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    scan_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID,
        ForeignKey("product_scans.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    health_audit_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID,
        ForeignKey("health_audits.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    scan_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    user_role: Mapped[str] = mapped_column(
        String(32),
        default="consumer",
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    scan: Mapped[Optional["ProductScan"]] = relationship(
        "ProductScan",
    )
    health_audit: Mapped[Optional["HealthAudit"]] = relationship(
        "HealthAudit",
        back_populates="scan_history_entries",
    )

    __table_args__ = (
        CheckConstraint(
            "scan_type IN ('label_compliance', 'health_check')",
            name="chk_scan_history_type",
        ),
        CheckConstraint(
            "scan_id IS NOT NULL OR health_audit_id IS NOT NULL",
            name="chk_scan_history_target",
        ),
    )
