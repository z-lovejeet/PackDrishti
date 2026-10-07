"""
BiteIQ - Pydantic v2 Schemas for Verified Food Reference & Custom User Recipes.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class FoodPortionSize(BaseModel):
    unit: str
    weight_g: float
    description: Optional[str] = None


class FoodItemResponse(BaseModel):
    id: uuid.UUID
    food_name: str
    regional_name: Optional[str] = None
    category: str
    calories_per_100g: float
    protein_per_100g: float
    carbs_per_100g: float
    fat_per_100g: float
    fiber_per_100g: float
    sodium_per_100g: float
    sugar_per_100g: float
    portion_sizes_json: List[Dict[str, Any]] = Field(default_factory=list)
    is_verified: bool = True
    source: str = "verified_reference"

    model_config = ConfigDict(from_attributes=True)


class CustomFoodCreateRequest(BaseModel):
    food_name: str = Field(min_length=1, max_length=255)
    calories_per_serving: float = Field(ge=0.0)
    protein_per_serving: float = Field(ge=0.0)
    carbs_per_serving: float = Field(ge=0.0)
    fat_per_serving: float = Field(ge=0.0)
    serving_description: str = Field(default="1 serving", max_length=100)
    ingredients_recipe_json: Optional[List[Dict[str, Any]]] = None


class CustomFoodResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    food_name: str
    calories_per_serving: float
    protein_per_serving: float
    carbs_per_serving: float
    fat_per_serving: float
    serving_description: str
    ingredients_recipe_json: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    source: str = "custom_food"

    model_config = ConfigDict(from_attributes=True)


class FoodSearchResponse(BaseModel):
    query: str
    total: int
    items: List[FoodItemResponse]
