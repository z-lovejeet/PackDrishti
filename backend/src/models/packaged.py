import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from sqlalchemy import (
    String,
    Numeric,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.src.models.base import Base, GUID, JSON_TYPE

if TYPE_CHECKING:
    from backend.src.models.user import User


class PackagedFoodAudit(Base):
    __tablename__ = "packaged_food_audits"

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
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    brand_name: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    health_score: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    score_band: Mapped[str] = mapped_column(String(50), nullable=False)
    mrp: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    net_quantity_g: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    price_per_100g: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    mfg_date: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    expiry_date: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    is_expired: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    nutrients_json: Mapped[List[Dict[str, Any]]] = mapped_column(JSON_TYPE, default=list, nullable=False)
    badges_json: Mapped[List[Dict[str, Any]]] = mapped_column(JSON_TYPE, default=list, nullable=False)
    additives_json: Mapped[List[Dict[str, Any]]] = mapped_column(JSON_TYPE, default=list, nullable=False)
    clinical_advisory_json: Mapped[Dict[str, Any]] = mapped_column(JSON_TYPE, default=dict, nullable=False)
    front_image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    back_image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", back_populates="packaged_audits")

    __table_args__ = (
        CheckConstraint("health_score >= 0.00 AND health_score <= 100.00", name="chk_health_score_range"),
        Index("idx_packaged_audits_user", "user_id"),
        Index("idx_packaged_audits_created", "created_at"),
    )
