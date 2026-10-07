"""
BiteIQ - Integration Tests for Daily Diary, Meal Logging & Water Tracking APIs.
Verifies GET /diary, POST /log-item, PUT /entry/{id}, DELETE /entry/{id},
POST /water, clinical warning generation, transactional recalculation,
and cross-tenant isolation security.
"""

from datetime import date
from decimal import Decimal
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.main import app
from backend.src.core.database import get_db_session
from backend.src.models.profile import UserMedicalCondition, UserProfile
from backend.src.models.user import User, UserRole
from backend.tests.conftest import make_test_token


@pytest.mark.asyncio
async def test_diary_lifecycle_and_recalculation(db_session: AsyncSession):
    """
    Tests:
    1. GET /diary initializes empty day with 0 consumed.
    2. POST /diary/log-item logs breakfast item and updates consumed & remaining totals.
    3. PUT /diary/entry/{id} updates portion and updates consumed totals.
    4. DELETE /diary/entry/{id} removes entry and recalculates totals back.
    5. POST /diary/water logs hydration increments.
    """
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="diary_tester@biteiq.io",
        password_hash="test_secure_hash",
        full_name="Kavita Rao",
        role=UserRole.CONSUMER,
    )
    db_session.add(user)

    # Add profile so budget is computed
    profile = UserProfile(
        user_id=user_id,
        age=30,
        biological_sex="female",
        height_cm=Decimal("165.0"),
        current_weight_kg=Decimal("60.0"),
        target_weight_kg=Decimal("58.0"),
        activity_level="moderately_active",
        primary_goal="moderate_fat_loss",
        diet_type="standard_omnivore",
        bmr_kcal=Decimal("1337.5"),
        tdee_kcal=Decimal("2073.1"),
    )
    db_session.add(profile)
    await db_session.commit()

    token = make_test_token(user_id=str(user_id), email=user.email)
    auth_headers = {"Authorization": f"Bearer {token}"}

    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. GET /diary auto-creates day
        res_init = await client.get("/api/v1/diary", headers=auth_headers)
        assert res_init.status_code == 200
        diary_data = res_init.json()
        assert diary_data["totals_consumed"]["calories"] == 0.0
        assert diary_data["remaining"]["calories"] > 0.0
        assert diary_data["meals"]["breakfast"] == []

        # 2. Log breakfast food item
        log_payload = {
            "meal_type": "breakfast",
            "food_name": "Moong Dal Chilla with Mint Chutney",
            "serving_quantity": 2.0,
            "serving_unit": "chilla",
            "weight_in_grams": 120.0,
            "calories": 240.0,
            "protein_g": 14.0,
            "carbs_g": 30.0,
            "fat_g": 6.0,
            "fiber_g": 5.0,
            "sodium_mg": 280.0,
            "sugar_g": 1.5,
        }
        res_log = await client.post("/api/v1/diary/log-item", json=log_payload, headers=auth_headers)
        assert res_log.status_code == 201
        entry = res_log.json()
        assert entry["food_name"] == "Moong Dal Chilla with Mint Chutney"
        assert entry["calories"] == 240.0
        entry_id = entry["id"]

        # Verify diary consumed totals increased
        res_after_log = await client.get("/api/v1/diary", headers=auth_headers)
        d_after = res_after_log.json()
        assert d_after["totals_consumed"]["calories"] == 240.0
        assert d_after["totals_consumed"]["protein_g"] == 14.0
        assert len(d_after["meals"]["breakfast"]) == 1

        # 3. Update entry portion
        update_payload = {
            "serving_quantity": 3.0,
            "weight_in_grams": 180.0,
            "calories": 360.0,
            "protein_g": 21.0,
            "carbs_g": 45.0,
            "fat_g": 9.0,
        }
        res_update = await client.put(f"/api/v1/diary/entry/{entry_id}", json=update_payload, headers=auth_headers)
        assert res_update.status_code == 200
        updated_entry = res_update.json()
        assert updated_entry["calories"] == 360.0
        assert updated_entry["protein_g"] == 21.0

        # Verify recalculated diary totals
        res_after_update = await client.get("/api/v1/diary", headers=auth_headers)
        d_up = res_after_update.json()
        assert d_up["totals_consumed"]["calories"] == 360.0
        assert d_up["totals_consumed"]["protein_g"] == 21.0

        # 4. Log water
        water_payload = {"amount_ml": 500.0}
        res_water = await client.post("/api/v1/diary/water", json=water_payload, headers=auth_headers)
        assert res_water.status_code == 200
        assert res_water.json()["total_water_ml"] == 500.0

        # 5. Delete entry and verify totals recalculate
        res_del = await client.delete(f"/api/v1/diary/entry/{entry_id}", headers=auth_headers)
        assert res_del.status_code == 200

        res_after_del = await client.get("/api/v1/diary", headers=auth_headers)
        d_del = res_after_del.json()
        assert d_del["totals_consumed"]["calories"] == 0.0
        assert d_del["totals_consumed"]["protein_g"] == 0.0
        assert len(d_del["meals"]["breakfast"]) == 0
        assert d_del["totals_consumed"]["water_ml"] == 500.0

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_diary_clinical_warnings_for_diabetic_user(db_session: AsyncSession):
    """
    Logging high net carb or high sugar item for a diabetic user generates clinical warnings.
    """
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="diabetic_tester@biteiq.io",
        password_hash="test_secure_hash",
        full_name="Rajesh Kumar",
        role=UserRole.CONSUMER,
    )
    db_session.add(user)

    # Attach diabetes condition
    cond = UserMedicalCondition(
        user_id=user_id,
        condition_key="diabetes_type_2",
        severity="moderate",
    )
    db_session.add(cond)
    await db_session.commit()

    token = make_test_token(user_id=str(user_id), email=user.email)
    auth_headers = {"Authorization": f"Bearer {token}"}

    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Log food with 52g net carbs (>40g threshold) and 12g sugar (>5g threshold)
        high_carb_item = {
            "meal_type": "lunch",
            "food_name": "Sweet Jalebi with Sugar Syrup",
            "serving_quantity": 2.0,
            "serving_unit": "pieces",
            "weight_in_grams": 100.0,
            "calories": 380.0,
            "protein_g": 3.0,
            "carbs_g": 70.0,
            "fat_g": 10.0,
            "fiber_g": 1.0,
            "sugar_g": 45.0,
            "metadata_json": {
                "ingredients": ["maida", "liquid glucose", "sugar", "edible vegetable oil"],
            },
        }
        res = await client.post("/api/v1/diary/log-item", json=high_carb_item, headers=auth_headers)
        assert res.status_code == 201
        data = res.json()
        warnings = data["clinical_warnings"]
        assert len(warnings) > 0
        # Warnings should catch High Glycemic Load and Elevated Sugar
        warning_str = " ".join(warnings).lower()
        assert "glycemic load" in warning_str or "sugar" in warning_str or "glucose" in warning_str

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_diary_cross_tenant_isolation(db_session: AsyncSession):
    """
    User B must NOT be able to modify or delete User A's meal entries.
    """
    user_a_id = uuid.uuid4()
    user_a = User(
        id=user_a_id,
        email="user_a@biteiq.io",
        password_hash="test_secure_hash",
        full_name="User Alpha",
        role=UserRole.CONSUMER,
    )
    user_b_id = uuid.uuid4()
    user_b = User(
        id=user_b_id,
        email="user_b@biteiq.io",
        password_hash="test_secure_hash",
        full_name="User Bravo",
        role=UserRole.CONSUMER,
    )
    db_session.add_all([user_a, user_b])
    await db_session.commit()

    token_a = make_test_token(user_id=str(user_a_id), email=user_a.email)
    token_b = make_test_token(user_id=str(user_b_id), email=user_b.email)
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # User A logs a food item
        payload = {
            "meal_type": "lunch",
            "food_name": "Dal Tadka",
            "serving_quantity": 1.0,
            "serving_unit": "bowl",
            "weight_in_grams": 150.0,
            "calories": 180.0,
            "protein_g": 9.0,
            "carbs_g": 24.0,
            "fat_g": 5.0,
        }
        res_create = await client.post("/api/v1/diary/log-item", json=payload, headers=headers_a)
        assert res_create.status_code == 201
        entry_id = res_create.json()["id"]

        # User B attempts to update User A's entry -> 404
        update_attempt = {
            "serving_quantity": 2.0,
            "calories": 360.0,
        }
        res_bad_put = await client.put(f"/api/v1/diary/entry/{entry_id}", json=update_attempt, headers=headers_b)
        assert res_bad_put.status_code == 404

        # User B attempts to delete User A's entry -> 404
        res_bad_del = await client.delete(f"/api/v1/diary/entry/{entry_id}", headers=headers_b)
        assert res_bad_del.status_code == 404

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_diary_validation_failures(db_session: AsyncSession):
    """
    Rejects invalid inputs: negative calories, negative portions, invalid meal types.
    """
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="validator_user@biteiq.io",
        password_hash="test_secure_hash",
        full_name="Simran Kaur",
        role=UserRole.CONSUMER,
    )
    db_session.add(user)
    await db_session.commit()

    token = make_test_token(user_id=str(user_id), email=user.email)
    auth_headers = {"Authorization": f"Bearer {token}"}

    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Negative calories
        bad_cal = {
            "meal_type": "dinner",
            "food_name": "Chicken Curry",
            "serving_quantity": 1.0,
            "weight_in_grams": 100.0,
            "calories": -100.0,
            "protein_g": 20.0,
            "carbs_g": 5.0,
            "fat_g": 8.0,
        }
        res1 = await client.post("/api/v1/diary/log-item", json=bad_cal, headers=auth_headers)
        assert res1.status_code == 422

        # Invalid meal type
        bad_type = {
            "meal_type": "midnight_feast",
            "food_name": "Pizza",
            "serving_quantity": 1.0,
            "weight_in_grams": 100.0,
            "calories": 250.0,
            "protein_g": 10.0,
            "carbs_g": 30.0,
            "fat_g": 10.0,
        }
        res2 = await client.post("/api/v1/diary/log-item", json=bad_type, headers=auth_headers)
        assert res2.status_code == 422

    app.dependency_overrides.clear()
