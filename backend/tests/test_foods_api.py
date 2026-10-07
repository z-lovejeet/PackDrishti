"""
BiteIQ - Integration Tests for Foods & Clinical Insights APIs.
Verifies GET /foods/search, POST /foods/custom, GET /foods/custom,
GET /insights/daily, POST /insights/{id}/read, and GET /insights/swaps.
"""

from decimal import Decimal
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.main import app
from backend.src.core.database import get_db_session
from backend.src.models.food import CustomFood, VerifiedFoodReference
from backend.src.models.insight import HealthInsightsLog
from backend.src.models.user import User, UserRole
from backend.tests.conftest import make_test_token


@pytest.mark.asyncio
async def test_food_search_and_custom_foods(db_session: AsyncSession):
    """
    Tests:
    1. Seed verified foods (Roti, Paneer) and search for them.
    2. Create a custom recipe via POST /foods/custom.
    3. Retrieve user's custom foods via GET /foods/custom.
    4. Combined search returns both verified items and user custom recipes.
    """
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="chef_tester@biteiq.io",
        password_hash="test_secure_hash",
        full_name="Chef Sanjeev",
        role=UserRole.CONSUMER,
    )
    db_session.add(user)

    # Seed verified reference items
    roti = VerifiedFoodReference(
        id=uuid.uuid4(),
        food_name="Whole Wheat Roti / Chapati",
        regional_name="Phulka",
        category="grains_cereals",
        calories_per_100g=Decimal("264.00"),
        protein_per_100g=Decimal("9.00"),
        carbs_per_100g=Decimal("51.00"),
        fat_per_100g=Decimal("2.50"),
        fiber_per_100g=Decimal("7.00"),
        sodium_per_100g=Decimal("150.00"),
        sugar_per_100g=Decimal("1.00"),
        portion_sizes_json=[{"unit": "1 medium roti", "weight_g": 35.0}],
        is_verified=True,
    )
    paneer = VerifiedFoodReference(
        id=uuid.uuid4(),
        food_name="Fresh Paneer (Cottage Cheese)",
        regional_name="Paneer",
        category="dairy",
        calories_per_100g=Decimal("265.00"),
        protein_per_100g=Decimal("18.30"),
        carbs_per_100g=Decimal("3.40"),
        fat_per_100g=Decimal("20.80"),
        fiber_per_100g=Decimal("0.00"),
        sodium_per_100g=Decimal("22.00"),
        sugar_per_100g=Decimal("2.50"),
        portion_sizes_json=[{"unit": "100g cube", "weight_g": 100.0}],
        is_verified=True,
    )
    db_session.add_all([roti, paneer])
    await db_session.commit()

    token = make_test_token(user_id=str(user_id), email=user.email)
    auth_headers = {"Authorization": f"Bearer {token}"}

    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Search for Roti
        res_roti = await client.get("/api/v1/foods/search?q=roti", headers=auth_headers)
        assert res_roti.status_code == 200
        roti_data = res_roti.json()
        assert roti_data["total"] >= 1
        assert any("Roti" in item["food_name"] for item in roti_data["items"])

        # 2. Search for Paneer
        res_paneer = await client.get("/api/v1/foods/search?q=paneer", headers=auth_headers)
        assert res_paneer.status_code == 200
        paneer_data = res_paneer.json()
        assert paneer_data["total"] >= 1
        assert any("Paneer" in item["food_name"] for item in paneer_data["items"])

        # 3. Create Custom Food
        custom_payload = {
            "food_name": "Mom's Homemade Palak Paneer",
            "calories_per_serving": 280.0,
            "protein_per_serving": 15.0,
            "carbs_g": 8.0,
            "carbs_per_serving": 8.0,
            "fat_per_serving": 21.0,
            "serving_description": "1 bowl (200g)",
            "ingredients_recipe_json": [
                {"name": "Spinach", "amount_g": 150},
                {"name": "Paneer", "amount_g": 80},
            ],
        }
        res_create = await client.post("/api/v1/foods/custom", json=custom_payload, headers=auth_headers)
        assert res_create.status_code == 201
        created = res_create.json()
        assert created["food_name"] == "Mom's Homemade Palak Paneer"
        assert created["calories_per_serving"] == 280.0

        # 4. Get User Custom Foods
        res_my_foods = await client.get("/api/v1/foods/custom", headers=auth_headers)
        assert res_my_foods.status_code == 200
        my_foods = res_my_foods.json()
        assert len(my_foods) == 1
        assert my_foods[0]["food_name"] == "Mom's Homemade Palak Paneer"

        # 5. Search for "Palak Paneer" returns the custom food
        res_search_custom = await client.get("/api/v1/foods/search?q=Palak", headers=auth_headers)
        assert res_search_custom.status_code == 200
        search_results = res_search_custom.json()
        assert search_results["total"] >= 1
        assert search_results["items"][0]["food_name"] == "Mom's Homemade Palak Paneer"
        assert search_results["items"][0]["source"] == "custom_food"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_clinical_insights_and_swaps_api(db_session: AsyncSession):
    """
    Tests:
    1. GET /insights/daily retrieves logged alerts.
    2. POST /insights/{id}/read marks alert as read.
    3. GET /insights/swaps retrieves Indian whole-food alternatives.
    """
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="insights_tester@biteiq.io",
        password_hash="test_secure_hash",
        full_name="Deepa Sharma",
        role=UserRole.CONSUMER,
    )
    db_session.add(user)

    # Insert an unread insight
    insight_id = uuid.uuid4()
    insight = HealthInsightsLog(
        id=insight_id,
        user_id=user_id,
        insight_type="contraindication",
        severity="critical",
        title="High Glycemic Load Alert",
        message="Exceeds 40g net carbs in a single meal.",
        related_condition="diabetes_type_2",
        is_read=False,
    )
    db_session.add(insight)
    await db_session.commit()

    token = make_test_token(user_id=str(user_id), email=user.email)
    auth_headers = {"Authorization": f"Bearer {token}"}

    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. GET /insights/daily
        res_insights = await client.get("/api/v1/insights/daily?unread_only=true", headers=auth_headers)
        assert res_insights.status_code == 200
        insights_list = res_insights.json()
        assert len(insights_list) == 1
        assert insights_list[0]["title"] == "High Glycemic Load Alert"
        assert insights_list[0]["is_read"] is False

        # 2. POST /insights/{id}/read
        res_read = await client.post(f"/api/v1/insights/{insight_id}/read", headers=auth_headers)
        assert res_read.status_code == 200
        read_data = res_read.json()
        assert read_data["is_read"] is True

        # Verify unread filter now returns 0
        res_insights_unread = await client.get("/api/v1/insights/daily?unread_only=true", headers=auth_headers)
        assert res_insights_unread.status_code == 200
        assert len(res_insights_unread.json()) == 0

        # 3. GET /insights/swaps
        res_swaps_all = await client.get("/api/v1/insights/swaps", headers=auth_headers)
        assert res_swaps_all.status_code == 200
        swaps_all = res_swaps_all.json()
        assert len(swaps_all) >= 5

        # 4. Filter swaps by category
        res_swaps_bev = await client.get("/api/v1/insights/swaps?category=sweet_beverage", headers=auth_headers)
        assert res_swaps_bev.status_code == 200
        bev_swaps = res_swaps_bev.json()
        assert len(bev_swaps) >= 1
        assert all(s["category"] == "sweet_beverage" for s in bev_swaps)
        assert any("Coconut Water" in s["swap_name"] for s in bev_swaps)

    app.dependency_overrides.clear()
