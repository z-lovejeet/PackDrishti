"""
BiteIQ - REST Endpoints for User Biometrics, Medical Conditions & Macro Budgets.
"""

from datetime import date, datetime, timezone
from decimal import Decimal
from typing import List
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.src.core.database import get_db_session
from backend.src.core.security import CurrentUser, get_current_user
from backend.src.models.profile import UserProfile, UserMedicalCondition, DailyMacroBudget
from backend.src.schemas.profile import (
    ConditionItem,
    ProfileUpdateRequest,
    ProfileResponse,
    MacroBudgetResponse,
)
from backend.src.services.nutrition_calc import NutritionCalculator

router = APIRouter()


@router.get("", response_model=ProfileResponse)
async def get_user_profile(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Retrieves the authenticated user's demographic biometrics, medical conditions,
    and active metabolic budget.
    """
    stmt = (
        select(UserProfile)
        .where(UserProfile.user_id == current_user.id)
        .options(selectinload(UserProfile.user))
    )
    result = await db.execute(stmt)
    profile = result.scalars().first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please complete biometric onboarding.",
        )

    # Fetch conditions
    cond_stmt = select(UserMedicalCondition).where(UserMedicalCondition.user_id == current_user.id)
    cond_result = await db.execute(cond_stmt)
    conditions = cond_result.scalars().all()

    # Fetch today's macro budget
    today = date.today()
    budget_stmt = select(DailyMacroBudget).where(
        DailyMacroBudget.user_id == current_user.id,
        DailyMacroBudget.effective_date == today,
    )
    b_result = await db.execute(budget_stmt)
    daily_budget = b_result.scalars().first()

    budget_response = None
    if daily_budget:
        budget_response = MacroBudgetResponse(
            target_calories=float(daily_budget.target_calories),
            target_protein_g=float(daily_budget.target_protein_g),
            target_carbs_g=float(daily_budget.target_carbs_g),
            target_fat_g=float(daily_budget.target_fat_g),
            target_fiber_g=float(daily_budget.target_fiber_g),
            ceiling_sodium_mg=float(daily_budget.ceiling_sodium_mg),
            ceiling_added_sugar_g=float(daily_budget.ceiling_added_sugar_g),
            ceiling_saturated_fat_g=round((float(daily_budget.target_calories) * 0.10) / 9.0, 1),
            ceiling_trans_fat_g=0.0,
            target_water_ml=float(daily_budget.target_water_ml),
            bmr_kcal=float(profile.bmr_kcal),
            tdee_kcal=float(profile.tdee_kcal),
            is_clamped_to_floor=False,
        )

    return ProfileResponse(
        user_id=profile.user_id,
        age=profile.age,
        biological_sex=profile.biological_sex,
        height_cm=float(profile.height_cm),
        current_weight_kg=float(profile.current_weight_kg),
        target_weight_kg=float(profile.target_weight_kg),
        body_fat_percentage=float(profile.body_fat_percentage) if profile.body_fat_percentage else None,
        activity_level=profile.activity_level,
        primary_goal=profile.primary_goal,
        diet_type=profile.diet_type,
        bmr_kcal=float(profile.bmr_kcal),
        tdee_kcal=float(profile.tdee_kcal),
        conditions=[
            ConditionItem(
                condition_key=c.condition_key,
                severity=c.severity,
                notes=c.notes,
                diagnosed_date=c.diagnosed_date,
            )
            for c in conditions
        ],
        macro_budget=budget_response,
    )


@router.put("", response_model=ProfileResponse)
async def update_user_profile(
    payload: ProfileUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Updates or initializes user biometrics and conditions.
    Automatically recalculates BMR, TDEE, and macro budget targets.
    """
    # Normalize conditions list
    condition_items: List[ConditionItem] = []
    condition_keys: List[str] = []
    for item in payload.conditions:
        if isinstance(item, str):
            c_key = item.strip().lower()
            condition_items.append(ConditionItem(condition_key=c_key))
            condition_keys.append(c_key)
        elif isinstance(item, dict):
            c_key = item.get("condition_key", "").strip().lower()
            condition_items.append(
                ConditionItem(
                    condition_key=c_key,
                    severity=item.get("severity", "moderate"),
                    notes=item.get("notes"),
                    diagnosed_date=item.get("diagnosed_date"),
                )
            )
            condition_keys.append(c_key)
        else:
            condition_items.append(item)
            condition_keys.append(item.condition_key.strip().lower())

    # 1. Compute Deterministic Clinical Budget
    calculated_budget = NutritionCalculator.calculate_macro_budget(
        age=payload.age,
        biological_sex=payload.biological_sex,
        height_cm=payload.height_cm,
        weight_kg=payload.current_weight_kg,
        activity_level=payload.activity_level,
        primary_goal=payload.primary_goal,
        body_fat_percentage=payload.body_fat_percentage,
        conditions=condition_keys,
    )

    # 2. Upsert UserProfile record
    stmt = select(UserProfile).where(UserProfile.user_id == current_user.id)
    result = await db.execute(stmt)
    profile = result.scalars().first()

    if not profile:
        profile = UserProfile(
            user_id=current_user.id,
            age=payload.age,
            biological_sex=payload.biological_sex,
            height_cm=Decimal(str(payload.height_cm)),
            current_weight_kg=Decimal(str(payload.current_weight_kg)),
            target_weight_kg=Decimal(str(payload.target_weight_kg)),
            body_fat_percentage=Decimal(str(payload.body_fat_percentage)) if payload.body_fat_percentage else None,
            activity_level=payload.activity_level,
            primary_goal=payload.primary_goal,
            diet_type=payload.diet_type,
            bmr_kcal=Decimal(str(calculated_budget.bmr_kcal)),
            tdee_kcal=Decimal(str(calculated_budget.tdee_kcal)),
        )
        db.add(profile)
    else:
        profile.age = payload.age
        profile.biological_sex = payload.biological_sex
        profile.height_cm = Decimal(str(payload.height_cm))
        profile.current_weight_kg = Decimal(str(payload.current_weight_kg))
        profile.target_weight_kg = Decimal(str(payload.target_weight_kg))
        profile.body_fat_percentage = (
            Decimal(str(payload.body_fat_percentage)) if payload.body_fat_percentage else None
        )
        profile.activity_level = payload.activity_level
        profile.primary_goal = payload.primary_goal
        profile.diet_type = payload.diet_type
        profile.bmr_kcal = Decimal(str(calculated_budget.bmr_kcal))
        profile.tdee_kcal = Decimal(str(calculated_budget.tdee_kcal))
        profile.updated_at = datetime.now(timezone.utc)

    # 3. Synchronize UserMedicalConditions
    await db.execute(
        delete(UserMedicalCondition).where(UserMedicalCondition.user_id == current_user.id)
    )
    for c in condition_items:
        new_cond = UserMedicalCondition(
            user_id=current_user.id,
            condition_key=c.condition_key,
            severity=c.severity,
            notes=c.notes,
            diagnosed_date=c.diagnosed_date,
        )
        db.add(new_cond)

    # 4. Upsert today's DailyMacroBudget
    today = date.today()
    b_stmt = select(DailyMacroBudget).where(
        DailyMacroBudget.user_id == current_user.id,
        DailyMacroBudget.effective_date == today,
    )
    b_res = await db.execute(b_stmt)
    today_budget = b_res.scalars().first()

    if not today_budget:
        today_budget = DailyMacroBudget(
            user_id=current_user.id,
            effective_date=today,
            target_calories=Decimal(str(calculated_budget.target_calories)),
            target_protein_g=Decimal(str(calculated_budget.target_protein_g)),
            target_carbs_g=Decimal(str(calculated_budget.target_carbs_g)),
            target_fat_g=Decimal(str(calculated_budget.target_fat_g)),
            target_fiber_g=Decimal(str(calculated_budget.target_fiber_g)),
            ceiling_sodium_mg=Decimal(str(calculated_budget.ceiling_sodium_mg)),
            ceiling_added_sugar_g=Decimal(str(calculated_budget.ceiling_added_sugar_g)),
            target_water_ml=Decimal(str(calculated_budget.target_water_ml)),
        )
        db.add(today_budget)
    else:
        today_budget.target_calories = Decimal(str(calculated_budget.target_calories))
        today_budget.target_protein_g = Decimal(str(calculated_budget.target_protein_g))
        today_budget.target_carbs_g = Decimal(str(calculated_budget.target_carbs_g))
        today_budget.target_fat_g = Decimal(str(calculated_budget.target_fat_g))
        today_budget.target_fiber_g = Decimal(str(calculated_budget.target_fiber_g))
        today_budget.ceiling_sodium_mg = Decimal(str(calculated_budget.ceiling_sodium_mg))
        today_budget.ceiling_added_sugar_g = Decimal(str(calculated_budget.ceiling_added_sugar_g))
        today_budget.target_water_ml = Decimal(str(calculated_budget.target_water_ml))

    await db.commit()
    await db.refresh(profile)

    budget_response = MacroBudgetResponse(
        target_calories=calculated_budget.target_calories,
        target_protein_g=calculated_budget.target_protein_g,
        target_carbs_g=calculated_budget.target_carbs_g,
        target_fat_g=calculated_budget.target_fat_g,
        target_fiber_g=calculated_budget.target_fiber_g,
        ceiling_sodium_mg=calculated_budget.ceiling_sodium_mg,
        ceiling_added_sugar_g=calculated_budget.ceiling_added_sugar_g,
        ceiling_saturated_fat_g=calculated_budget.ceiling_saturated_fat_g,
        ceiling_trans_fat_g=calculated_budget.ceiling_trans_fat_g,
        target_water_ml=calculated_budget.target_water_ml,
        bmr_kcal=calculated_budget.bmr_kcal,
        tdee_kcal=calculated_budget.tdee_kcal,
        is_clamped_to_floor=calculated_budget.is_clamped_to_floor,
        safety_advisory=calculated_budget.safety_advisory,
    )

    return ProfileResponse(
        user_id=profile.user_id,
        age=profile.age,
        biological_sex=profile.biological_sex,
        height_cm=float(profile.height_cm),
        current_weight_kg=float(profile.current_weight_kg),
        target_weight_kg=float(profile.target_weight_kg),
        body_fat_percentage=float(profile.body_fat_percentage) if profile.body_fat_percentage else None,
        activity_level=profile.activity_level,
        primary_goal=profile.primary_goal,
        diet_type=profile.diet_type,
        bmr_kcal=float(profile.bmr_kcal),
        tdee_kcal=float(profile.tdee_kcal),
        conditions=condition_items,
        macro_budget=budget_response,
    )


@router.get("/macro-budget", response_model=MacroBudgetResponse)
async def get_macro_budget(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Returns today's active macro budget. If missing, derives it dynamically from profile.
    """
    today = date.today()
    b_stmt = select(DailyMacroBudget).where(
        DailyMacroBudget.user_id == current_user.id,
        DailyMacroBudget.effective_date == today,
    )
    result = await db.execute(b_stmt)
    budget = result.scalars().first()

    # Load profile for BMR & TDEE
    p_stmt = select(UserProfile).where(UserProfile.user_id == current_user.id)
    p_res = await db.execute(p_stmt)
    profile = p_res.scalars().first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not configured. Please complete biometric setup first.",
        )

    if budget:
        return MacroBudgetResponse(
            target_calories=float(budget.target_calories),
            target_protein_g=float(budget.target_protein_g),
            target_carbs_g=float(budget.target_carbs_g),
            target_fat_g=float(budget.target_fat_g),
            target_fiber_g=float(budget.target_fiber_g),
            ceiling_sodium_mg=float(budget.ceiling_sodium_mg),
            ceiling_added_sugar_g=float(budget.ceiling_added_sugar_g),
            ceiling_saturated_fat_g=round((float(budget.target_calories) * 0.10) / 9.0, 1),
            ceiling_trans_fat_g=0.0,
            target_water_ml=float(budget.target_water_ml),
            bmr_kcal=float(profile.bmr_kcal),
            tdee_kcal=float(profile.tdee_kcal),
            is_clamped_to_floor=False,
        )

    # If no budget row for today, calculate and save
    cond_stmt = select(UserMedicalCondition).where(UserMedicalCondition.user_id == current_user.id)
    c_res = await db.execute(cond_stmt)
    conditions = [c.condition_key for c in c_res.scalars().all()]

    calculated = NutritionCalculator.calculate_macro_budget(
        age=profile.age,
        biological_sex=profile.biological_sex,
        height_cm=float(profile.height_cm),
        weight_kg=float(profile.current_weight_kg),
        activity_level=profile.activity_level,
        primary_goal=profile.primary_goal,
        body_fat_percentage=float(profile.body_fat_percentage) if profile.body_fat_percentage else None,
        conditions=conditions,
    )

    new_budget = DailyMacroBudget(
        user_id=current_user.id,
        effective_date=today,
        target_calories=Decimal(str(calculated.target_calories)),
        target_protein_g=Decimal(str(calculated.target_protein_g)),
        target_carbs_g=Decimal(str(calculated.target_carbs_g)),
        target_fat_g=Decimal(str(calculated.target_fat_g)),
        target_fiber_g=Decimal(str(calculated.target_fiber_g)),
        ceiling_sodium_mg=Decimal(str(calculated.ceiling_sodium_mg)),
        ceiling_added_sugar_g=Decimal(str(calculated.ceiling_added_sugar_g)),
        target_water_ml=Decimal(str(calculated.target_water_ml)),
    )
    db.add(new_budget)
    await db.commit()

    return MacroBudgetResponse(
        target_calories=calculated.target_calories,
        target_protein_g=calculated.target_protein_g,
        target_carbs_g=calculated.target_carbs_g,
        target_fat_g=calculated.target_fat_g,
        target_fiber_g=calculated.target_fiber_g,
        ceiling_sodium_mg=calculated.ceiling_sodium_mg,
        ceiling_added_sugar_g=calculated.ceiling_added_sugar_g,
        ceiling_saturated_fat_g=calculated.ceiling_saturated_fat_g,
        ceiling_trans_fat_g=calculated.ceiling_trans_fat_g,
        target_water_ml=calculated.target_water_ml,
        bmr_kcal=calculated.bmr_kcal,
        tdee_kcal=calculated.tdee_kcal,
        is_clamped_to_floor=calculated.is_clamped_to_floor,
        safety_advisory=calculated.safety_advisory,
    )


@router.post("/recalculate-budget", response_model=MacroBudgetResponse)
async def recalculate_macro_budget(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Forces recalculation of the active daily macro budget.
    """
    p_stmt = select(UserProfile).where(UserProfile.user_id == current_user.id)
    p_res = await db.execute(p_stmt)
    profile = p_res.scalars().first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not configured. Please complete biometric setup first.",
        )

    cond_stmt = select(UserMedicalCondition).where(UserMedicalCondition.user_id == current_user.id)
    c_res = await db.execute(cond_stmt)
    conditions = [c.condition_key for c in c_res.scalars().all()]

    calculated = NutritionCalculator.calculate_macro_budget(
        age=profile.age,
        biological_sex=profile.biological_sex,
        height_cm=float(profile.height_cm),
        weight_kg=float(profile.current_weight_kg),
        activity_level=profile.activity_level,
        primary_goal=profile.primary_goal,
        body_fat_percentage=float(profile.body_fat_percentage) if profile.body_fat_percentage else None,
        conditions=conditions,
    )

    profile.bmr_kcal = Decimal(str(calculated.bmr_kcal))
    profile.tdee_kcal = Decimal(str(calculated.tdee_kcal))
    profile.updated_at = datetime.now(timezone.utc)

    today = date.today()
    b_stmt = select(DailyMacroBudget).where(
        DailyMacroBudget.user_id == current_user.id,
        DailyMacroBudget.effective_date == today,
    )
    b_res = await db.execute(b_stmt)
    today_budget = b_res.scalars().first()

    if not today_budget:
        today_budget = DailyMacroBudget(
            user_id=current_user.id,
            effective_date=today,
            target_calories=Decimal(str(calculated.target_calories)),
            target_protein_g=Decimal(str(calculated.target_protein_g)),
            target_carbs_g=Decimal(str(calculated.target_carbs_g)),
            target_fat_g=Decimal(str(calculated.target_fat_g)),
            target_fiber_g=Decimal(str(calculated.target_fiber_g)),
            ceiling_sodium_mg=Decimal(str(calculated.ceiling_sodium_mg)),
            ceiling_added_sugar_g=Decimal(str(calculated.ceiling_added_sugar_g)),
            target_water_ml=Decimal(str(calculated.target_water_ml)),
        )
        db.add(today_budget)
    else:
        today_budget.target_calories = Decimal(str(calculated.target_calories))
        today_budget.target_protein_g = Decimal(str(calculated.target_protein_g))
        today_budget.target_carbs_g = Decimal(str(calculated.target_carbs_g))
        today_budget.target_fat_g = Decimal(str(calculated.target_fat_g))
        today_budget.target_fiber_g = Decimal(str(calculated.target_fiber_g))
        today_budget.ceiling_sodium_mg = Decimal(str(calculated.ceiling_sodium_mg))
        today_budget.ceiling_added_sugar_g = Decimal(str(calculated.ceiling_added_sugar_g))
        today_budget.target_water_ml = Decimal(str(calculated.target_water_ml))

    await db.commit()

    return MacroBudgetResponse(
        target_calories=calculated.target_calories,
        target_protein_g=calculated.target_protein_g,
        target_carbs_g=calculated.target_carbs_g,
        target_fat_g=calculated.target_fat_g,
        target_fiber_g=calculated.target_fiber_g,
        ceiling_sodium_mg=calculated.ceiling_sodium_mg,
        ceiling_added_sugar_g=calculated.ceiling_added_sugar_g,
        ceiling_saturated_fat_g=calculated.ceiling_saturated_fat_g,
        ceiling_trans_fat_g=calculated.ceiling_trans_fat_g,
        target_water_ml=calculated.target_water_ml,
        bmr_kcal=calculated.bmr_kcal,
        tdee_kcal=calculated.tdee_kcal,
        is_clamped_to_floor=calculated.is_clamped_to_floor,
        safety_advisory=calculated.safety_advisory,
    )
