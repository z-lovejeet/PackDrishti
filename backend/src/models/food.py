import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from sqlalchemy import (
    String,
    Numeric,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.src.models.base import Base, GUID, JSON_TYPE

if TYPE_CHECKING:
    from backend.src.models.user import User


class VerifiedFoodReference(Base):
    __tablename__ = "verified_food_reference"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        primary_key=True,
        default=uuid.uuid4,
    )
    food_name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    regional_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    calories_per_100g: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    protein_per_100g: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    carbs_per_100g: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    fat_per_100g: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    fiber_per_100g: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    sodium_per_100g: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=Decimal("0.00"), nullable=False)
    sugar_per_100g: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    portion_sizes_json: Mapped[List[Dict[str, Any]]] = mapped_column(JSON_TYPE, default=list, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        Index("idx_food_ref_name", "food_name"),
        Index("idx_food_ref_category", "category"),
    )


class CustomFood(Base):
    __tablename__ = "custom_foods"

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
    food_name: Mapped[str] = mapped_column(String(255), nullable=False)
    calories_per_serving: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    protein_per_serving: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    carbs_per_serving: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    fat_per_serving: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    serving_description: Mapped[str] = mapped_column(String(100), default="1 serving", nullable=False)
    ingredients_recipe_json: Mapped[List[Dict[str, Any]]] = mapped_column(JSON_TYPE, default=list, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="custom_foods")

    __table_args__ = (
        Index("idx_custom_foods_user", "user_id"),
    )
