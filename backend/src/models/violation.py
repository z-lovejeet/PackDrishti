import enum
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    String,
    Text,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.src.models.base import Base, GUID, TimestampMixin


class ViolationSeverity(str, enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class StatutoryViolation(Base):
    __tablename__ = "statutory_violations"

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
    cited_knowledge_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID,
        ForeignKey("statutory_knowledge_base.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    rule_reference: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    act_section: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    penalty_clause: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    severity: Mapped[ViolationSeverity] = mapped_column(
        SQLEnum(ViolationSeverity, name="violation_severity", native_enum=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    corrective_action: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    scan: Mapped["ProductScan"] = relationship(
        "ProductScan",
        back_populates="statutory_violations",
    )
    cited_knowledge: Mapped[Optional["StatutoryKnowledgeBase"]] = relationship(
        "StatutoryKnowledgeBase",
        back_populates="statutory_violations",
    )


class ViolationRecord(Base, TimestampMixin):
    __tablename__ = "violation_records"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        primary_key=True,
        default=uuid.uuid4,
    )
    scan_id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        ForeignKey("product_scans.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    violation_code: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False,
        index=True,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="Open",
        nullable=False,
    )
    assigned_officer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    timeline_json: Mapped[List[Dict[str, Any]]] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )

    # Relationships
    scan: Mapped["ProductScan"] = relationship(
        "ProductScan",
        back_populates="violation_records",
    )
    assigned_officer: Mapped[Optional["User"]] = relationship(
        "User",
    )
