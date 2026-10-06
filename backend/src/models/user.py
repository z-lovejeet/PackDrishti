import enum
import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.src.models.base import Base, GUID, TimestampMixin

if TYPE_CHECKING:
    from backend.src.models.profile import UserProfile, UserMedicalCondition, DailyMacroBudget
    from backend.src.models.diary import DailyFoodDiary
    from backend.src.models.food import CustomFood
    from backend.src.models.packaged import PackagedFoodAudit
    from backend.src.models.insight import HealthInsightsLog
    from backend.src.models.health import HealthAudit


class UserRole(str, enum.Enum):
    CONSUMER = "consumer"
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
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # Relationships
    profile: Mapped[Optional["UserProfile"]] = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    medical_conditions: Mapped[List["UserMedicalCondition"]] = relationship(
        "UserMedicalCondition",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    macro_budgets: Mapped[List["DailyMacroBudget"]] = relationship(
        "DailyMacroBudget",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    food_diaries: Mapped[List["DailyFoodDiary"]] = relationship(
        "DailyFoodDiary",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    custom_foods: Mapped[List["CustomFood"]] = relationship(
        "CustomFood",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    packaged_audits: Mapped[List["PackagedFoodAudit"]] = relationship(
        "PackagedFoodAudit",
        back_populates="user",
        lazy="selectin",
    )
    health_insights: Mapped[List["HealthInsightsLog"]] = relationship(
        "HealthInsightsLog",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    # Retained backward compatibility relationship
    health_audits: Mapped[List["HealthAudit"]] = relationship(
        "HealthAudit",
        back_populates="user",
        lazy="selectin",
    )
