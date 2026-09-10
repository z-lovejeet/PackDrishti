import enum
import uuid
from typing import List, Optional
from sqlalchemy import String, Boolean, Enum as SQLEnum, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.src.models.base import Base, GUID, TimestampMixin


class UserRole(str, enum.Enum):
    CONSUMER = "consumer"
    OFFICER = "officer"
    ADMIN = "admin"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        primary_key=True,
        default=uuid.uuid4,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="user_role", native_enum=False, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=UserRole.CONSUMER,
    )
    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    badge_number: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )
    designation: Mapped[Optional[str]] = mapped_column(
        String(150),
        nullable=True,
    )
    zone: Mapped[Optional[str]] = mapped_column(
        String(150),
        nullable=True,
    )
    jurisdiction: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # Relationships
    product_scans: Mapped[List["ProductScan"]] = relationship(
        "ProductScan",
        back_populates="user",
        lazy="selectin",
    )
    compliance_reports: Mapped[List["ComplianceReport"]] = relationship(
        "ComplianceReport",
        back_populates="officer",
        lazy="selectin",
    )
    health_audits: Mapped[List["HealthAudit"]] = relationship(
        "HealthAudit",
        back_populates="user",
        lazy="selectin",
    )

    __table_args__ = (
        CheckConstraint(
            "(role != 'officer') OR (badge_number IS NOT NULL AND designation IS NOT NULL)",
            name="chk_users_officer_badge",
        ),
    )
