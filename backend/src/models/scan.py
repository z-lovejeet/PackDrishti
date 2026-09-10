import enum
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional, Dict, Any
from sqlalchemy import (
    String,
    Numeric,
    Text,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
    CheckConstraint,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.src.models.base import Base, GUID


class ComplianceStatus(str, enum.Enum):
    COMPLIANT = "compliant"
    VIOLATION = "violation"
    WARNING = "warning"
    PENDING = "pending"


class ProductScan(Base):
    __tablename__ = "product_scans"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        primary_key=True,
        default=uuid.uuid4,
    )
    scan_code: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False,
        index=True,
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
    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    barcode: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True,
        index=True,
    )
    pdp_area_cm2: Mapped[Decimal] = mapped_column(
        Numeric(8, 2),
        nullable=False,
    )
    net_quantity: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )
    mrp: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )
    mfg_date: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )
    overall_status: Mapped[ComplianceStatus] = mapped_column(
        SQLEnum(ComplianceStatus, name="compliance_status", native_enum=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=ComplianceStatus.PENDING,
    )
    compliance_score: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
        default=Decimal("0.00"),
    )
    image_url: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    location: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
    inspector_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    scanned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="product_scans",
    )
    extracted_declarations: Mapped[List["ExtractedDeclaration"]] = relationship(
        "ExtractedDeclaration",
        back_populates="scan",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    statutory_violations: Mapped[List["StatutoryViolation"]] = relationship(
        "StatutoryViolation",
        back_populates="scan",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    violation_records: Mapped[List["ViolationRecord"]] = relationship(
        "ViolationRecord",
        back_populates="scan",
        lazy="selectin",
    )
    compliance_reports: Mapped[List["ComplianceReport"]] = relationship(
        "ComplianceReport",
        back_populates="scan",
        lazy="selectin",
    )

    __table_args__ = (
        CheckConstraint("pdp_area_cm2 > 0.00", name="chk_product_scans_pdp_area"),
        CheckConstraint("compliance_score >= 0.00 AND compliance_score <= 100.00", name="chk_product_scans_compliance_score"),
    )


class ExtractedDeclaration(Base):
    __tablename__ = "extracted_declarations"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        primary_key=True,
        default=uuid.uuid4,
    )
    scan_id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        ForeignKey("product_scans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    rule_clause: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    field_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )
    extracted_value: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    status: Mapped[ComplianceStatus] = mapped_column(
        SQLEnum(ComplianceStatus, name="compliance_status", native_enum=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    status_note: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    measured_font_height_mm: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )
    required_font_height_mm: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )
    contrast_ratio: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )
    bounding_box_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    scan: Mapped["ProductScan"] = relationship(
        "ProductScan",
        back_populates="extracted_declarations",
    )

    __table_args__ = (
        CheckConstraint("measured_font_height_mm IS NULL OR measured_font_height_mm >= 0.00", name="chk_extracted_font_measured"),
        CheckConstraint("required_font_height_mm IS NULL OR required_font_height_mm >= 0.00", name="chk_extracted_font_required"),
        CheckConstraint("contrast_ratio IS NULL OR contrast_ratio >= 0.00", name="chk_extracted_contrast"),
    )
