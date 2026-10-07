from fastapi import APIRouter
from backend.src.api.v1.endpoints import diary, foods, health, insights, profile

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["Consumer Nutrition & Health"])
api_router.include_router(profile.router, prefix="/profile", tags=["User Profile & Macro Budget"])
api_router.include_router(diary.router, prefix="/diary", tags=["Daily Food Diary & Meal Logging"])
api_router.include_router(foods.router, prefix="/foods", tags=["Food Reference & Custom Recipes"])
api_router.include_router(insights.router, prefix="/insights", tags=["Clinical Insights & Swaps"])
