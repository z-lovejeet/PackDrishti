"""
BiteIQ - REST Endpoints for AI Meal Plate Computer Vision & Confirmation Logging.
"""

from datetime import date, datetime, timezone
from decimal import Decimal
from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ai.src.pipeline.plate_agent import PlateVisionAgent
from backend.src.api.v1.endpoints.diary import recalculate_diary_totals
from backend.src.core.database import get_db_session
from backend.src.core.security import CurrentUser, get_current_user
from backend.src.models.diary import DailyFoodDiary, MealEntry
from backend.src.models.insight import HealthInsightsLog
from backend.src.models.profile import UserMedicalCondition
from backend.src.schemas.meals import (
    ConfirmPlateLogRequest,
    ConfirmPlateLogResponse,
    PlateAnalysisResult,
)
from backend.src.services.clinical_engine import ClinicalContraindicationEngine
from backend.src.services.mass_invariants import MassInvariantValidator

router = APIRouter()

MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit


@router.post(
    "/scan-plate",
    response_model=PlateAnalysisResult,
    summary="Scan and segment cooked meal plate with portion & macro estimation",
)
async def scan_meal_plate(
    image: UploadFile = File(..., description="Meal plate photo (JPEG, PNG, WebP)"),
    meal_type_hint: Optional[str] = Form(None, description="Optional meal category hint"),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> PlateAnalysisResult:
    """
    Accepts a top-down or angled photograph of a prepared meal plate.
    Uses multimodal computer vision to segment discrete dishes,
    estimate volumetric mass in grams, compute macros, and cross-reference
    with user clinical conditions.
    """
    if not image or not image.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided.",
        )

    # Read binary bytes
    contents = await image.read()
    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image file is empty.",
        )

    if len(contents) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image exceeds maximum permitted size of {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)}MB.",
        )

    # Validate image magic bytes
    is_jpeg = contents.startswith(b"\xFF\xD8\xFF")
    is_png = contents.startswith(b"\x89PNG")
    is_webp = b"RIFF" in contents[:12] and b"WEBP" in contents[:16]

    if not (is_jpeg or is_png or is_webp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Supported formats: JPEG, PNG, WebP.",
        )

    # Fetch user's active clinical conditions
    cond_stmt = select(UserMedicalCondition).where(UserMedicalCondition.user_id == current_user.id)
    cond_res = await db.execute(cond_stmt)
    conditions = [c.condition_key for c in cond_res.scalars().all()]

    # Run AI Plate Vision Agent
    agent = PlateVisionAgent()
    try:
        result = await agent.analyze_plate(
            image_bytes=contents,
            user_conditions=conditions,
            meal_type_hint=meal_type_hint,
        )
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Plate vision analysis failed: {str(exc)}",
        )


@router.post(
    "/confirm-plate-log",
    response_model=ConfirmPlateLogResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Commit confirmed plate items into user's daily food diary",
)
async def confirm_plate_log(
    payload: ConfirmPlateLogRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> ConfirmPlateLogResponse:
    """
    Commits reviewed plate items into the user's daily diary for the specified meal slot.
    Evaluates clinical contraindications, persists alerts, and recalculates running diary totals.
    """
    target_date = payload.diary_date or date.today()

    # 1. Fetch or initialize today's diary
    stmt = select(DailyFoodDiary).where(
        DailyFoodDiary.user_id == current_user.id,
        DailyFoodDiary.diary_date == target_date,
    )
    res = await db.execute(stmt)
    diary = res.scalars().first()

    if not diary:
        diary = DailyFoodDiary(
            user_id=current_user.id,
            diary_date=target_date,
            total_calories=Decimal("0.00"),
            total_protein_g=Decimal("0.00"),
            total_carbs_g=Decimal("0.00"),
            total_fat_g=Decimal("0.00"),
            total_fiber_g=Decimal("0.00"),
            total_sodium_mg=Decimal("0.00"),
            total_sugar_g=Decimal("0.00"),
            total_water_ml=Decimal("0.00"),
            adherence_status="on_track",
        )
        db.add(diary)
        await db.flush()

    # 2. Fetch user's active clinical conditions
    cond_stmt = select(UserMedicalCondition).where(UserMedicalCondition.user_id == current_user.id)
    cond_res = await db.execute(cond_stmt)
    conditions = [c.condition_key for c in cond_res.scalars().all()]

    warnings_created = 0

    # 3. Create meal entries for each confirmed item
    for item in payload.items:
        # Validate mass invariants
        nutrients = {
            "calories": item.calories,
            "protein_g": item.protein_g,
            "carbs_g": item.carbs_g,
            "fat_g": item.fat_g,
            "fiber_g": item.fiber_g,
            "sodium_mg": item.sodium_mg,
            "sugar_g": item.sugar_g,
        }
        is_valid, violations = MassInvariantValidator.validate_nutrients(nutrients)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Nutritional invariant violation on '{item.food_name}': {'; '.join(violations)}",
            )

        # Clinical evaluation
        alerts = ClinicalContraindicationEngine.evaluate_food(
            user_conditions=conditions,
            food_name=item.food_name,
            nutrients=nutrients,
        )
        for alert in alerts:
            if alert.severity in ("warning", "critical"):
                insight = HealthInsightsLog(
                    user_id=current_user.id,
                    insight_type="contraindication",
                    severity=alert.severity,
                    title=alert.title,
                    message=f"{alert.message} Recommendation: {alert.recommendation or 'None'}",
                    related_condition=alert.condition_key,
                    is_read=False,
                )
                db.add(insight)
                warnings_created += 1

        # Insert meal entry record
        entry = MealEntry(
            diary_id=diary.id,
            meal_type=payload.meal_type.lower(),
            food_name=item.food_name,
            source_type="plate_vision",
            serving_quantity=Decimal(str(item.serving_quantity)),
            serving_unit=item.serving_unit,
            weight_in_grams=Decimal(str(item.weight_in_grams)),
            calories=Decimal(str(item.calories)),
            protein_g=Decimal(str(item.protein_g)),
            carbs_g=Decimal(str(item.carbs_g)),
            fat_g=Decimal(str(item.fat_g)),
            fiber_g=Decimal(str(item.fiber_g)),
            sodium_mg=Decimal(str(item.sodium_mg)),
            sugar_g=Decimal(str(item.sugar_g)),
            metadata_json={
                "bounding_box": item.bounding_box,
                "confidence_score": item.confidence_score,
            },
        )
        db.add(entry)

    await db.flush()

    # 4. Atomically recalculate diary totals
    await recalculate_diary_totals(diary.id, db)

    await db.commit()
    await db.refresh(diary)

    total_cal = sum(i.calories for i in payload.items)
    total_p = sum(i.protein_g for i in payload.items)
    total_c = sum(i.carbs_g for i in payload.items)
    total_f = sum(i.fat_g for i in payload.items)

    return ConfirmPlateLogResponse(
        status="success",
        diary_id=diary.id,
        diary_date=diary.diary_date,
        meal_type=payload.meal_type.lower(),
        logged_entries_count=len(payload.items),
        total_calories_logged=round(total_cal, 1),
        total_protein_logged=round(total_p, 1),
        total_carbs_logged=round(total_c, 1),
        total_fat_logged=round(total_f, 1),
        clinical_warnings_count=warnings_created,
    )
