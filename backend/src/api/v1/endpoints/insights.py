"""
BiteIQ - REST Endpoints for Clinical Health Insights & Indian Whole-Food Swaps.
"""

from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.core.database import get_db_session
from backend.src.core.security import CurrentUser, get_current_user
from backend.src.models.insight import HealthInsightsLog
from backend.src.schemas.insight import InsightResponse, WholeFoodSwapItem
from backend.src.services.clinical_engine import ClinicalContraindicationEngine

router = APIRouter()


@router.get(
    "/daily",
    response_model=List[InsightResponse],
    summary="Get recent clinical health insights and contraindication warnings",
)
async def get_daily_insights(
    unread_only: bool = Query(False, description="Filter for unread insights only"),
    limit: int = Query(50, ge=1, le=100, description="Max insights to retrieve"),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> List[InsightResponse]:
    """
    Retrieves recent clinical contraindications, safety advisories, and habit insights
    logged for the authenticated user.
    """
    stmt = (
        select(HealthInsightsLog)
        .where(HealthInsightsLog.user_id == current_user.id)
    )
    if unread_only:
        stmt = stmt.where(HealthInsightsLog.is_read == False)  # noqa: E712

    stmt = stmt.order_by(HealthInsightsLog.created_at.desc()).limit(limit)
    res = await db.execute(stmt)
    insights = res.scalars().all()

    return [
        InsightResponse(
            id=i.id,
            insight_type=i.insight_type,
            severity=i.severity,
            title=i.title,
            message=i.message,
            related_condition=i.related_condition,
            is_read=i.is_read,
            created_at=i.created_at,
        )
        for i in insights
    ]


@router.post(
    "/{insight_id}/read",
    response_model=InsightResponse,
    summary="Acknowledge or mark a clinical health insight as read",
)
async def mark_insight_as_read(
    insight_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> InsightResponse:
    """
    Marks a specific clinical alert as read/acknowledged.
    """
    stmt = select(HealthInsightsLog).where(
        HealthInsightsLog.id == insight_id,
        HealthInsightsLog.user_id == current_user.id,
    )
    res = await db.execute(stmt)
    insight = res.scalars().first()

    if not insight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health insight record not found.",
        )

    insight.is_read = True
    await db.commit()
    await db.refresh(insight)

    return InsightResponse(
        id=insight.id,
        insight_type=insight.insight_type,
        severity=insight.severity,
        title=insight.title,
        message=insight.message,
        related_condition=insight.related_condition,
        is_read=insight.is_read,
        created_at=insight.created_at,
    )


@router.get(
    "/swaps",
    response_model=List[WholeFoodSwapItem],
    summary="Get culturally familiar Indian whole-food alternatives",
)
async def get_whole_food_swaps(
    category: Optional[str] = Query(
        None,
        description="Filter by category (e.g. sweet_beverage, fried_snack, refined_grain, sweet_dessert)",
    ),
    current_user: CurrentUser = Depends(get_current_user),
) -> List[WholeFoodSwapItem]:
    """
    Returns curated, evidence-based Indian whole-food alternatives that replace
    ultra-processed or contraindicated items.
    """
    swaps = ClinicalContraindicationEngine.get_swaps(category=category)
    return [
        WholeFoodSwapItem(
            category=s.category,
            original_item=s.original_item,
            swap_name=s.swap_name,
            swap_advantage=s.swap_advantage,
            calorie_difference=s.calorie_difference,
        )
        for s in swaps
    ]
