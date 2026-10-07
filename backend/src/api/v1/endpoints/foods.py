"""
BiteIQ - REST Endpoints for Verified Food Reference Search & Custom Food Management.
"""

from decimal import Decimal
from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.core.database import get_db_session
from backend.src.core.security import CurrentUser, get_current_user
from backend.src.models.food import CustomFood, VerifiedFoodReference
from backend.src.schemas.foods import (
    CustomFoodCreateRequest,
    CustomFoodResponse,
    FoodItemResponse,
    FoodSearchResponse,
)

router = APIRouter()


@router.get(
    "/search",
    response_model=FoodSearchResponse,
    summary="Search verified food reference database and user custom foods",
)
async def search_foods(
    q: str = Query(..., min_length=1, description="Food search query"),
    category: Optional[str] = Query(None, description="Optional category filter"),
    limit: int = Query(20, ge=1, le=100, description="Page limit"),
    offset: int = Query(0, ge=0, description="Page offset"),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> FoodSearchResponse:
    """
    Search across verified staple reference foods (ICMR-NIN & USDA benchmarks)
    as well as user-created proprietary custom recipes.
    """
    search_term = f"%{q.strip()}%"

    # 1. Search verified reference foods
    v_stmt = select(VerifiedFoodReference).where(
        or_(
            VerifiedFoodReference.food_name.ilike(search_term),
            VerifiedFoodReference.regional_name.ilike(search_term),
        )
    )
    if category:
        v_stmt = v_stmt.where(VerifiedFoodReference.category == category)

    v_stmt = v_stmt.order_by(VerifiedFoodReference.food_name.asc())
    v_res = await db.execute(v_stmt)
    verified_items = v_res.scalars().all()

    # 2. Search user's custom foods
    c_stmt = select(CustomFood).where(
        CustomFood.user_id == current_user.id,
        CustomFood.food_name.ilike(search_term),
    ).order_by(CustomFood.created_at.desc())
    c_res = await db.execute(c_stmt)
    custom_items = c_res.scalars().all()

    # Format unified food item response list
    combined: List[FoodItemResponse] = []

    # Map verified foods
    for vf in verified_items:
        combined.append(
            FoodItemResponse(
                id=vf.id,
                food_name=vf.food_name,
                regional_name=vf.regional_name,
                category=vf.category,
                calories_per_100g=float(vf.calories_per_100g),
                protein_per_100g=float(vf.protein_per_100g),
                carbs_per_100g=float(vf.carbs_per_100g),
                fat_per_100g=float(vf.fat_per_100g),
                fiber_per_100g=float(vf.fiber_per_100g),
                sodium_per_100g=float(vf.sodium_per_100g),
                sugar_per_100g=float(vf.sugar_per_100g),
                portion_sizes_json=vf.portion_sizes_json or [],
                is_verified=vf.is_verified,
                source="verified_reference",
            )
        )

    # Map custom foods
    for cf in custom_items:
        combined.append(
            FoodItemResponse(
                id=cf.id,
                food_name=cf.food_name,
                regional_name=None,
                category="custom_recipes",
                calories_per_100g=float(cf.calories_per_serving),
                protein_per_100g=float(cf.protein_per_serving),
                carbs_per_100g=float(cf.carbs_per_serving),
                fat_per_100g=float(cf.fat_per_serving),
                fiber_per_100g=0.0,
                sodium_per_100g=0.0,
                sugar_per_100g=0.0,
                portion_sizes_json=[
                    {
                        "unit": cf.serving_description,
                        "weight_g": 100.0,
                        "description": cf.serving_description,
                    }
                ],
                is_verified=False,
                source="custom_food",
            )
        )

    total_count = len(combined)
    paginated_items = combined[offset : offset + limit]

    return FoodSearchResponse(
        query=q,
        total=total_count,
        items=paginated_items,
    )


@router.post(
    "/custom",
    response_model=CustomFoodResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a custom recipe or food item",
)
async def create_custom_food(
    payload: CustomFoodCreateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> CustomFoodResponse:
    """
    Creates a user-specific custom food item or saved recipe.
    """
    custom = CustomFood(
        user_id=current_user.id,
        food_name=payload.food_name.strip(),
        calories_per_serving=Decimal(str(round(payload.calories_per_serving, 2))),
        protein_per_serving=Decimal(str(round(payload.protein_per_serving, 2))),
        carbs_per_serving=Decimal(str(round(payload.carbs_per_serving, 2))),
        fat_per_serving=Decimal(str(round(payload.fat_per_serving, 2))),
        serving_description=payload.serving_description.strip(),
        ingredients_recipe_json=payload.ingredients_recipe_json or [],
    )
    db.add(custom)
    await db.commit()
    await db.refresh(custom)

    return CustomFoodResponse(
        id=custom.id,
        user_id=custom.user_id,
        food_name=custom.food_name,
        calories_per_serving=float(custom.calories_per_serving),
        protein_per_serving=float(custom.protein_per_serving),
        carbs_per_serving=float(custom.carbs_per_serving),
        fat_per_serving=float(custom.fat_per_serving),
        serving_description=custom.serving_description,
        ingredients_recipe_json=custom.ingredients_recipe_json,
        created_at=custom.created_at,
        source="custom_food",
    )


@router.get(
    "/custom",
    response_model=List[CustomFoodResponse],
    summary="Get all custom foods created by authenticated user",
)
async def get_user_custom_foods(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> List[CustomFoodResponse]:
    """
    Returns all proprietary custom foods created by the authenticated user.
    """
    stmt = (
        select(CustomFood)
        .where(CustomFood.user_id == current_user.id)
        .order_by(CustomFood.created_at.desc())
    )
    res = await db.execute(stmt)
    foods = res.scalars().all()

    return [
        CustomFoodResponse(
            id=f.id,
            user_id=f.user_id,
            food_name=f.food_name,
            calories_per_serving=float(f.calories_per_serving),
            protein_per_serving=float(f.protein_per_serving),
            carbs_per_serving=float(f.carbs_per_serving),
            fat_per_serving=float(f.fat_per_serving),
            serving_description=f.serving_description,
            ingredients_recipe_json=f.ingredients_recipe_json,
            created_at=f.created_at,
            source="custom_food",
        )
        for f in foods
    ]
