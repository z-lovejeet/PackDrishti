import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from sqlalchemy import (
    String,
    Numeric,
    Date,
    DateTime,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.src.models.base import Base, GUID, TimestampMixin, JSON_TYPE

if TYPE_CHECKING:
    from backend.src.models.user import User
    from backend.src.models.packaged import PackagedFoodAudit
    from backend.src.models.food import VerifiedFoodReference, CustomFood


class DailyFoodDiary(Base, TimestampMixin):
    __tablename__ = "daily_food_diaries"

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
    diary_date: Mapped[date] = mapped_column(Date, nullable=False)
    total_calories: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=Decimal("0.00"), nullable=False)
    total_protein_g: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    total_carbs_g: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    total_fat_g: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    total_fiber_g: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    total_sodium_mg: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=Decimal("0.00"), nullable=False)
    total_sugar_g: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    total_water_ml: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=Decimal("0.00"), nullable=False)
    adherence_status: Mapped[str] = mapped_column(String(32), default="on_track", nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="food_diaries")
    meal_entries: Mapped[List["MealEntry"]] = relationship(
        "MealEntry",
        back_populates="diary",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        UniqueConstraint("user_id", "diary_date", name="uq_user_diary_date"),
        Index("idx_food_diaries_lookup", "user_id", "diary_date"),
    )


class MealEntry(Base):
    __tablename__ = "meal_entries"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        primary_key=True,
        default=uuid.uuid4,
    )
    diary_id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        ForeignKey("daily_food_diaries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    meal_type: Mapped[str] = mapped_column(String(20), nullable=False)
    food_name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_type: Mapped[str] = mapped_column(String(32), default="manual_search", nullable=False)
    packaged_audit_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID,
        ForeignKey("packaged_food_audits.id", ondelete="SET NULL"),
        nullable=True,
    )
    verified_food_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID,
        ForeignKey("verified_food_reference.id", ondelete="SET NULL"),
        nullable=True,
    )
    custom_food_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID,
        ForeignKey("custom_foods.id", ondelete="SET NULL"),
        nullable=True,
    )
    serving_quantity: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=Decimal("1.00"), nullable=False)
    serving_unit: Mapped[str] = mapped_column(String(64), default="serving", nullable=False)
    weight_in_grams: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    calories: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    protein_g: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    carbs_g: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    fat_g: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    fiber_g: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    sodium_mg: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=Decimal("0.00"), nullable=False)
    sugar_g: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSON_TYPE, default=dict, nullable=False)
    logged_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    diary: Mapped["DailyFoodDiary"] = relationship("DailyFoodDiary", back_populates="meal_entries")
    packaged_audit: Mapped[Optional["PackagedFoodAudit"]] = relationship("PackagedFoodAudit")
    verified_food: Mapped[Optional["VerifiedFoodReference"]] = relationship("VerifiedFoodReference")
    custom_food: Mapped[Optional["CustomFood"]] = relationship("CustomFood")

    __table_args__ = (
        CheckConstraint("meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')", name="chk_meal_type"),
        CheckConstraint(
            "source_type IN ('manual_search', 'plate_vision', 'packaged_scan', 'custom_recipe')",
            name="chk_source_type",
        ),
        Index("idx_meal_entries_diary", "diary_id"),
        Index("idx_meal_entries_type", "meal_type"),
    )
