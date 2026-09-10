import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import (
    String,
    Integer,
    Text,
    DateTime,
    ForeignKey,
    CheckConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.src.models.base import Base, GUID


class ComplianceReport(Base):
    __tablename__ = "compliance_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        primary_key=True,
        default=uuid.uuid4,
    )
    report_number: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )
    officer_id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    scan_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID,
        ForeignKey("product_scans.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    report_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    district: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )
    total_products_scanned: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )
    compliant_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    violation_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    pdf_url: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    officer: Mapped["User"] = relationship(
        "User",
        back_populates="compliance_reports",
    )
    scan: Mapped[Optional["ProductScan"]] = relationship(
        "ProductScan",
        back_populates="compliance_reports",
    )

    __table_args__ = (
        CheckConstraint(
            "total_products_scanned >= 0 AND compliant_count >= 0 AND violation_count >= 0 AND (compliant_count + violation_count) <= total_products_scanned",
            name="chk_compliance_reports_counts",
        ),
    )
