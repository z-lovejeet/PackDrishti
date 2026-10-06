import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import (
    String,
    Integer,
    Numeric,
    Date,
    DateTime,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.src.models.base import Base, GUID, TimestampMixin

if TYPE_CHECKING:
    from backend.src.models.user import User


class UserProfile(Base, TimestampMixin):
    __tablename__ = "user_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    biological_sex: Mapped[str] = mapped_column(String(16), nullable=False)
    height_cm: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    current_weight_kg: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    target_weight_kg: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    body_fat_percentage: Mapped[Optional[Decimal]] = mapped_column(Numeric(4, 2), nullable=True)
    activity_level: Mapped[str] = mapped_column(String(32), default="sedentary", nullable=False)
    primary_goal: Mapped[str] = mapped_column(String(32), default="maintenance", nullable=False)
    diet_type: Mapped[str] = mapped_column(String(32), default="standard_omnivore", nullable=False)
    bmr_kcal: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    tdee_kcal: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="profile")

    __table_args__ = (
        CheckConstraint("age >= 10 AND age <= 120", name="chk_profiles_age"),
        CheckConstraint("biological_sex IN ('male', 'female')", name="chk_profiles_sex"),
        CheckConstraint("height_cm >= 80.0 AND height_cm <= 260.0", name="chk_profiles_height"),
        CheckConstraint("current_weight_kg >= 25.0 AND current_weight_kg <= 400.0", name="chk_profiles_weight"),
        CheckConstraint(
            "activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')",
            name="chk_profiles_activity",
        ),
        CheckConstraint(
            "primary_goal IN ('rapid_fat_loss', 'moderate_fat_loss', 'maintenance', 'clean_lean_bulk', 'aggressive_hypertrophy', 'metabolic_reversal')",
            name="chk_profiles_goal",
        ),
    )


class UserMedicalCondition(Base):
    __tablename__ = "user_medical_conditions"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    condition_key: Mapped[str] = mapped_column(String(64), nullable=False)
    severity: Mapped[str] = mapped_column(String(32), default="moderate", nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    diagnosed_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="medical_conditions")

    __table_args__ = (
        UniqueConstraint("user_id", "condition_key", name="uq_user_condition"),
        CheckConstraint(
            "condition_key IN ('diabetes_type_2', 'prediabetes', 'hypertension', 'dyslipidemia', "
            "'fatty_liver_nafld', 'pcod_pcos', 'hypothyroidism', 'hyperthyroidism', "
            "'chronic_kidney_disease_ckd', 'hyperuricemia_gout', 'gerd_acid_reflux', "
            "'celiac_disease', 'lactose_intolerance', 'peanut_allergy', 'tree_nut_allergy', "
            "'shellfish_allergy', 'soy_allergy', 'egg_allergy')",
            name="chk_condition_key",
        ),
    )


class DailyMacroBudget(Base):
    __tablename__ = "daily_macro_budgets"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    effective_date: Mapped[date] = mapped_column(Date, nullable=False)
    target_calories: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    target_protein_g: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    target_carbs_g: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    target_fat_g: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    target_fiber_g: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("30.00"), nullable=False)
    ceiling_sodium_mg: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=Decimal("2000.00"), nullable=False)
    ceiling_added_sugar_g: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("25.00"), nullable=False)
    target_water_ml: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=Decimal("2500.00"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="macro_budgets")

    __table_args__ = (
        UniqueConstraint("user_id", "effective_date", name="uq_user_budget_date"),
        CheckConstraint("target_calories >= 1000.0", name="chk_target_calories"),
        Index("idx_macro_budgets_user_date", "user_id", "effective_date"),
    )
