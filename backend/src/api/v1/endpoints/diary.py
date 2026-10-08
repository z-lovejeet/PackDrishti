"""
BiteIQ - REST Endpoints for Daily Food Diary, Meal Item Logging & Water Tracking.
"""

from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Dict, List, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.core.database import get_db_session
from backend.src.core.security import CurrentUser, get_current_user
from backend.src.models.diary import DailyFoodDiary, MealEntry
from backend.src.models.profile import UserProfile, UserMedicalCondition, DailyMacroBudget
from backend.src.models.insight import HealthInsightsLog
from backend.src.schemas.diary import (
    DailyBudgetSummary,
    DiaryResponse,
    MealEntryCreateRequest,
    MealEntryResponse,
    MealEntryUpdateRequest,
    RemainingBudgetSummary,
    TotalsConsumedSummary,
    WaterLogRequest,
)
from backend.src.services.clinical_engine import ClinicalContraindicationEngine
from backend.src.services.mass_invariants import MassInvariantValidator
from backend.src.services.nutrition_calc import NutritionCalculator

router = APIRouter()


async def _resolve_daily_budget(
    user_id: uuid.UUID,
    target_date: date,
    db: AsyncSession,
) -> DailyBudgetSummary:
    """
    Resolves the budget for the specified date from DailyMacroBudget,
    or calculates it from the UserProfile, or returns safe biological defaults.
    """
    b_stmt = select(DailyMacroBudget).where(
        DailyMacroBudget.user_id == user_id,
        DailyMacroBudget.effective_date == target_date,
    )
    b_res = await db.execute(b_stmt)
    budget = b_res.scalars().first()

    if budget:
        return DailyBudgetSummary(
            target_calories=float(budget.target_calories),
            target_protein_g=float(budget.target_protein_g),
            target_carbs_g=float(budget.target_carbs_g),
            target_fat_g=float(budget.target_fat_g),
            target_fiber_g=float(budget.target_fiber_g),
            ceiling_sodium_mg=float(budget.ceiling_sodium_mg),
            ceiling_added_sugar_g=float(budget.ceiling_added_sugar_g),
            target_water_ml=float(budget.target_water_ml),
        )

    # Check user profile
    p_stmt = select(UserProfile).where(UserProfile.user_id == user_id)
    p_res = await db.execute(p_stmt)
    profile = p_res.scalars().first()

    if profile:
        c_stmt = select(UserMedicalCondition).where(UserMedicalCondition.user_id == user_id)
        c_res = await db.execute(c_stmt)
        conditions = [c.condition_key for c in c_res.scalars().all()]

        calc = NutritionCalculator.calculate_macro_budget(
            age=profile.age,
            biological_sex=profile.biological_sex,
            height_cm=float(profile.height_cm),
            weight_kg=float(profile.current_weight_kg),
            activity_level=profile.activity_level,
            primary_goal=profile.primary_goal,
            body_fat_percentage=float(profile.body_fat_percentage) if profile.body_fat_percentage else None,
            conditions=conditions,
        )

        # Cache in daily_macro_budgets
        new_budget = DailyMacroBudget(
            user_id=user_id,
            effective_date=target_date,
            target_calories=Decimal(str(calc.target_calories)),
            target_protein_g=Decimal(str(calc.target_protein_g)),
            target_carbs_g=Decimal(str(calc.target_carbs_g)),
            target_fat_g=Decimal(str(calc.target_fat_g)),
            target_fiber_g=Decimal(str(calc.target_fiber_g)),
            ceiling_sodium_mg=Decimal(str(calc.ceiling_sodium_mg)),
            ceiling_added_sugar_g=Decimal(str(calc.ceiling_added_sugar_g)),
            target_water_ml=Decimal(str(calc.target_water_ml)),
        )
        db.add(new_budget)
        await db.flush()

        return DailyBudgetSummary(
            target_calories=calc.target_calories,
            target_protein_g=calc.target_protein_g,
            target_carbs_g=calc.target_carbs_g,
            target_fat_g=calc.target_fat_g,
            target_fiber_g=calc.target_fiber_g,
            ceiling_sodium_mg=calc.ceiling_sodium_mg,
            ceiling_added_sugar_g=calc.ceiling_added_sugar_g,
            target_water_ml=calc.target_water_ml,
        )

    # Fallback conservative biological baseline
    return DailyBudgetSummary(
        target_calories=2000.0,
        target_protein_g=75.0,
        target_carbs_g=250.0,
        target_fat_g=55.0,
        target_fiber_g=30.0,
        ceiling_sodium_mg=2000.0,
        ceiling_added_sugar_g=25.0,
        target_water_ml=2500.0,
    )


async def _recalculate_diary_totals(diary_id: uuid.UUID, db: AsyncSession) -> None:
    """
    Deterministically computes consumed totals from all active meal entries.
    Prevents floating-point / incremental drift.
    """
    diary = await db.get(DailyFoodDiary, diary_id)
    if not diary:
        return

    stmt = select(MealEntry).where(MealEntry.diary_id == diary_id)
    res = await db.execute(stmt)
    entries = res.scalars().all()

    total_cal = sum(float(e.calories) for e in entries)
    total_p = sum(float(e.protein_g) for e in entries)
    total_c = sum(float(e.carbs_g) for e in entries)
    total_f = sum(float(e.fat_g) for e in entries)
    total_fib = sum(float(e.fiber_g) for e in entries)
    total_na = sum(float(e.sodium_mg) for e in entries)
    total_sug = sum(float(e.sugar_g) for e in entries)

    diary.total_calories = Decimal(str(round(total_cal, 2)))
    diary.total_protein_g = Decimal(str(round(total_p, 2)))
    diary.total_carbs_g = Decimal(str(round(total_c, 2)))
    diary.total_fat_g = Decimal(str(round(total_f, 2)))
    diary.total_fiber_g = Decimal(str(round(total_fib, 2)))
    diary.total_sodium_mg = Decimal(str(round(total_na, 2)))
    diary.total_sugar_g = Decimal(str(round(total_sug, 2)))
    diary.updated_at = datetime.now(timezone.utc)


@router.get("", response_model=DiaryResponse)
async def get_daily_diary(
    date_param: Optional[date] = Query(None, alias="date"),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Retrieves the complete daily food diary for the specified date (default today).
    Automatically creates the diary record if it does not yet exist.
    """
    target_date = date_param or date.today()

    stmt = (
        select(DailyFoodDiary)
        .where(
            DailyFoodDiary.user_id == current_user.id,
            DailyFoodDiary.diary_date == target_date,
        )
    )
    result = await db.execute(stmt)
    diary = result.scalars().first()

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
        await db.commit()
        await db.refresh(diary)
        meal_entries = []
    else:
        e_stmt = (
            select(MealEntry)
            .where(MealEntry.diary_id == diary.id)
            .order_by(MealEntry.logged_at.asc())
        )
        e_res = await db.execute(e_stmt)
        meal_entries = e_res.scalars().all()

    budget = await _resolve_daily_budget(current_user.id, target_date, db)

    # Calculate consumed totals
    totals = TotalsConsumedSummary(
        calories=float(diary.total_calories),
        protein_g=float(diary.total_protein_g),
        carbs_g=float(diary.total_carbs_g),
        fat_g=float(diary.total_fat_g),
        fiber_g=float(diary.total_fiber_g),
        sodium_mg=float(diary.total_sodium_mg),
        sugar_g=float(diary.total_sugar_g),
        water_ml=float(diary.total_water_ml),
    )

    remaining = RemainingBudgetSummary(
        calories=round(max(0.0, budget.target_calories - totals.calories), 1),
        protein_g=round(max(0.0, budget.target_protein_g - totals.protein_g), 1),
        carbs_g=round(max(0.0, budget.target_carbs_g - totals.carbs_g), 1),
        fat_g=round(max(0.0, budget.target_fat_g - totals.fat_g), 1),
    )

    # Group meals by slot
    meals_dict: Dict[str, List[MealEntryResponse]] = {
        "breakfast": [],
        "lunch": [],
        "dinner": [],
        "snack": [],
    }

    for entry in meal_entries:
        slot = entry.meal_type.lower()
        if slot not in meals_dict:
            meals_dict[slot] = []
        meals_dict[slot].append(
            MealEntryResponse(
                id=entry.id,
                diary_id=entry.diary_id,
                meal_type=entry.meal_type,
                food_name=entry.food_name,
                source_type=entry.source_type,
                serving_quantity=float(entry.serving_quantity),
                serving_unit=entry.serving_unit,
                weight_in_grams=float(entry.weight_in_grams),
                calories=float(entry.calories),
                protein_g=float(entry.protein_g),
                carbs_g=float(entry.carbs_g),
                fat_g=float(entry.fat_g),
                fiber_g=float(entry.fiber_g),
                sodium_mg=float(entry.sodium_mg),
                sugar_g=float(entry.sugar_g),
                metadata_json=entry.metadata_json,
                logged_at=entry.logged_at,
                clinical_warnings=[],
            )
        )

    return DiaryResponse(
        diary_id=diary.id,
        diary_date=diary.diary_date,
        budget=budget,
        totals_consumed=totals,
        remaining=remaining,
        meals=meals_dict,
        adherence_status=diary.adherence_status,
    )


@router.post(
    "/log-item",
    response_model=MealEntryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log an individual food item into daily diary",
)
async def log_meal_item(
    payload: MealEntryCreateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Logs an item into breakfast, lunch, dinner, or snack.
    Verifies mass invariants, runs clinical contraindication evaluations,
    records any clinical insights, and atomically recalculates daily consumed totals.
    """
    target_date = payload.diary_date or date.today()

    # 1. Mass Invariant Verification
    nutrients_dict = {
        "calories": payload.calories,
        "protein_g": payload.protein_g,
        "carbs_g": payload.carbs_g,
        "fat_g": payload.fat_g,
        "fiber_g": payload.fiber_g,
        "sodium_mg": payload.sodium_mg,
        "sugar_g": payload.sugar_g,
    }
    is_valid, invariant_violations = MassInvariantValidator.validate_nutrients(nutrients_dict)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Nutritional invariant violation: {'; '.join(invariant_violations)}",
        )

    # 2. Fetch or create target day's diary
    stmt = (
        select(DailyFoodDiary)
        .where(
            DailyFoodDiary.user_id == current_user.id,
            DailyFoodDiary.diary_date == target_date,
        )
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

    # 3. Clinical Contraindication Evaluation
    cond_stmt = select(UserMedicalCondition).where(UserMedicalCondition.user_id == current_user.id)
    cond_res = await db.execute(cond_stmt)
    conditions = [c.condition_key for c in cond_res.scalars().all()]

    clinical_alerts = ClinicalContraindicationEngine.evaluate_food(
        user_conditions=conditions,
        food_name=payload.food_name,
        nutrients=nutrients_dict,
        cumulative_daily_sodium_mg=float(diary.total_sodium_mg),
    )

    # Persist critical insights to health_insights_log
    warning_messages: List[str] = []
    for alert in clinical_alerts:
        warning_messages.append(f"[{alert.title}] {alert.message}")
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

    # 4. Insert MealEntry
    entry = MealEntry(
        diary_id=diary.id,
        meal_type=payload.meal_type.lower(),
        food_name=payload.food_name,
        source_type=payload.source_type,
        verified_food_id=payload.verified_food_id,
        custom_food_id=payload.custom_food_id,
        packaged_audit_id=payload.packaged_audit_id,
        serving_quantity=Decimal(str(payload.serving_quantity)),
        serving_unit=payload.serving_unit,
        weight_in_grams=Decimal(str(payload.weight_in_grams)),
        calories=Decimal(str(payload.calories)),
        protein_g=Decimal(str(payload.protein_g)),
        carbs_g=Decimal(str(payload.carbs_g)),
        fat_g=Decimal(str(payload.fat_g)),
        fiber_g=Decimal(str(payload.fiber_g)),
        sodium_mg=Decimal(str(payload.sodium_mg)),
        sugar_g=Decimal(str(payload.sugar_g)),
        metadata_json=payload.metadata_json,
    )
    db.add(entry)
    await db.flush()

    # 5. Atomically Recalculate Totals
    await _recalculate_diary_totals(diary.id, db)

    await db.commit()
    await db.refresh(entry)

    return MealEntryResponse(
        id=entry.id,
        diary_id=entry.diary_id,
        meal_type=entry.meal_type,
        food_name=entry.food_name,
        source_type=entry.source_type,
        serving_quantity=float(entry.serving_quantity),
        serving_unit=entry.serving_unit,
        weight_in_grams=float(entry.weight_in_grams),
        calories=float(entry.calories),
        protein_g=float(entry.protein_g),
        carbs_g=float(entry.carbs_g),
        fat_g=float(entry.fat_g),
        fiber_g=float(entry.fiber_g),
        sodium_mg=float(entry.sodium_mg),
        sugar_g=float(entry.sugar_g),
        metadata_json=entry.metadata_json,
        logged_at=entry.logged_at,
        clinical_warnings=warning_messages,
    )


@router.put("/entry/{entry_id}", response_model=MealEntryResponse)
async def update_meal_entry(
    entry_id: uuid.UUID,
    payload: MealEntryUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Updates portions or macros for an existing meal entry.
    Verifies tenant ownership and updates daily totals atomically.
    """
    stmt = (
        select(MealEntry)
        .join(DailyFoodDiary, MealEntry.diary_id == DailyFoodDiary.id)
        .where(
            MealEntry.id == entry_id,
            DailyFoodDiary.user_id == current_user.id,
        )
    )
    res = await db.execute(stmt)
    entry = res.scalars().first()

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal entry not found or unauthorized.",
        )

    # Apply updates
    if payload.serving_quantity is not None:
        entry.serving_quantity = Decimal(str(payload.serving_quantity))
    if payload.serving_unit is not None:
        entry.serving_unit = payload.serving_unit
    if payload.weight_in_grams is not None:
        entry.weight_in_grams = Decimal(str(payload.weight_in_grams))
    if payload.calories is not None:
        entry.calories = Decimal(str(payload.calories))
    if payload.protein_g is not None:
        entry.protein_g = Decimal(str(payload.protein_g))
    if payload.carbs_g is not None:
        entry.carbs_g = Decimal(str(payload.carbs_g))
    if payload.fat_g is not None:
        entry.fat_g = Decimal(str(payload.fat_g))
    if payload.fiber_g is not None:
        entry.fiber_g = Decimal(str(payload.fiber_g))
    if payload.sodium_mg is not None:
        entry.sodium_mg = Decimal(str(payload.sodium_mg))
    if payload.sugar_g is not None:
        entry.sugar_g = Decimal(str(payload.sugar_g))

    diary_id = entry.diary_id
    await db.flush()

    # Recalculate totals on parent diary
    await _recalculate_diary_totals(diary_id, db)

    await db.commit()
    await db.refresh(entry)

    return MealEntryResponse(
        id=entry.id,
        diary_id=entry.diary_id,
        meal_type=entry.meal_type,
        food_name=entry.food_name,
        source_type=entry.source_type,
        serving_quantity=float(entry.serving_quantity),
        serving_unit=entry.serving_unit,
        weight_in_grams=float(entry.weight_in_grams),
        calories=float(entry.calories),
        protein_g=float(entry.protein_g),
        carbs_g=float(entry.carbs_g),
        fat_g=float(entry.fat_g),
        fiber_g=float(entry.fiber_g),
        sodium_mg=float(entry.sodium_mg),
        sugar_g=float(entry.sugar_g),
        metadata_json=entry.metadata_json,
        logged_at=entry.logged_at,
        clinical_warnings=[],
    )


@router.delete("/entry/{entry_id}")
async def delete_meal_entry(
    entry_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Removes a meal entry from the food diary.
    Recalculates daily consumed totals.
    """
    stmt = (
        select(MealEntry)
        .join(DailyFoodDiary, MealEntry.diary_id == DailyFoodDiary.id)
        .where(
            MealEntry.id == entry_id,
            DailyFoodDiary.user_id == current_user.id,
        )
    )
    res = await db.execute(stmt)
    entry = res.scalars().first()

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal entry not found or unauthorized.",
        )

    diary_id = entry.diary_id
    await db.delete(entry)
    await db.flush()

    await _recalculate_diary_totals(diary_id, db)

    await db.commit()
    return {"status": "success", "message": "Meal entry removed successfully"}


@router.post("/water")
async def log_water_consumption(
    payload: WaterLogRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Increments daily water hydration tracker.
    """
    target_date = payload.diary_date or date.today()

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
            total_water_ml=Decimal(str(payload.amount_ml)),
            adherence_status="on_track",
        )
        db.add(diary)
    else:
        diary.total_water_ml += Decimal(str(payload.amount_ml))
        diary.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(diary)

    return {
        "status": "success",
        "diary_date": str(diary.diary_date),
        "total_water_ml": float(diary.total_water_ml),
    }


# Public utility exports for related endpoints (e.g., meals.py, packaged.py)
recalculate_diary_totals = _recalculate_diary_totals
resolve_daily_budget = _resolve_daily_budget

