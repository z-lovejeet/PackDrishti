"""
BiteIQ - Integration Tests for Profile & Macro Budget API Endpoints.
Verifies GET /profile, PUT /profile, GET /macro-budget, POST /recalculate-budget,
biometric validation constraints, and auth guards.
"""

import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.main import app
from backend.src.core.database import get_db_session
from backend.src.models.user import User, UserRole
from backend.tests.conftest import make_test_token


@pytest.mark.asyncio
async def test_profile_endpoints_lifecycle(db_session: AsyncSession):
    """
    Test full lifecycle of user profile:
    1. Unauthorized request rejected (401).
    2. New user without profile returns 404.
    3. PUT /profile creates profile, calculates BMR/TDEE & daily macro budget.
    4. GET /profile returns stored biometrics, conditions, and budget.
    5. GET /profile/macro-budget returns today's calculated budget.
    6. POST /profile/recalculate-budget successfully triggers budget recalculation.
    """
    # Create test user in DB
    user_id = uuid.uuid4()
    test_user = User(
        id=user_id,
        email="test_profile_user@biteiq.io",
        password_hash="test_secure_hash",
        full_name="Arjun Mehta",
        role=UserRole.CONSUMER,
    )
    db_session.add(test_user)
    await db_session.commit()

    token = make_test_token(user_id=str(user_id), email=test_user.email)
    auth_headers = {"Authorization": f"Bearer {token}"}

    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Unauthorized request
        unauth_res = await client.get("/api/v1/profile")
        assert unauth_res.status_code == 401

        # 2. User has no profile yet -> 404
        get_res_empty = await client.get("/api/v1/profile", headers=auth_headers)
        assert get_res_empty.status_code == 404
        assert "Profile not found" in get_res_empty.json()["detail"]

        # 3. Create profile via PUT
        payload = {
            "age": 28,
            "biological_sex": "male",
            "height_cm": 178.0,
            "current_weight_kg": 76.5,
            "target_weight_kg": 72.0,
            "activity_level": "moderately_active",
            "primary_goal": "moderate_fat_loss",
            "diet_type": "standard_omnivore",
            "conditions": [
                "diabetes_type_2",
                {"condition_key": "hypertension", "severity": "mild", "notes": "Stage 1"},
            ],
        }
        put_res = await client.put("/api/v1/profile", json=payload, headers=auth_headers)
        assert put_res.status_code == 200
        data = put_res.json()
        assert data["age"] == 28
        assert data["biological_sex"] == "male"
        assert round(data["bmr_kcal"], 1) == 1742.5
        assert round(data["tdee_kcal"], 1) == 2700.9
        assert len(data["conditions"]) == 2

        macro_budget = data["macro_budget"]
        assert macro_budget is not None
        # Diabetic cap applies (<= 130g carbs)
        assert macro_budget["target_carbs_g"] <= 130.0
        # Hypertension ceiling applies (<= 1500mg sodium)
        assert macro_budget["ceiling_sodium_mg"] == 1500.0
        # Diabetes added sugar ceiling applies (<= 10g)
        assert macro_budget["ceiling_added_sugar_g"] == 10.0

        # 4. GET /profile returns updated record
        get_res = await client.get("/api/v1/profile", headers=auth_headers)
        assert get_res.status_code == 200
        get_data = get_res.json()
        assert get_data["current_weight_kg"] == 76.5
        assert len(get_data["conditions"]) == 2

        # 5. GET /profile/macro-budget
        budget_res = await client.get("/api/v1/profile/macro-budget", headers=auth_headers)
        assert budget_res.status_code == 200
        budget_data = budget_res.json()
        assert budget_data["target_calories"] == macro_budget["target_calories"]
        assert budget_data["target_protein_g"] == macro_budget["target_protein_g"]

        # 6. POST /profile/recalculate-budget
        recalc_res = await client.post("/api/v1/profile/recalculate-budget", headers=auth_headers)
        assert recalc_res.status_code == 200
        recalc_data = recalc_res.json()
        assert recalc_data["target_calories"] == budget_data["target_calories"]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_profile_validation_errors(db_session: AsyncSession):
    """
    Test validation boundaries on ProfileUpdateRequest (age, height, weight).
    """
    user_id = uuid.uuid4()
    test_user = User(
        id=user_id,
        email="test_validation@biteiq.io",
        password_hash="test_secure_hash",
        full_name="Pooja Patel",
        role=UserRole.CONSUMER,
    )
    db_session.add(test_user)
    await db_session.commit()

    token = make_test_token(user_id=str(user_id), email=test_user.email)
    auth_headers = {"Authorization": f"Bearer {token}"}

    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Age under limit (<10)
        invalid_age = {
            "age": 8,
            "biological_sex": "female",
            "height_cm": 160.0,
            "current_weight_kg": 55.0,
            "target_weight_kg": 52.0,
        }
        res = await client.put("/api/v1/profile", json=invalid_age, headers=auth_headers)
        assert res.status_code == 422

        # Negative height
        invalid_height = {
            "age": 25,
            "biological_sex": "female",
            "height_cm": -160.0,
            "current_weight_kg": 55.0,
            "target_weight_kg": 52.0,
        }
        res2 = await client.put("/api/v1/profile", json=invalid_height, headers=auth_headers)
        assert res2.status_code == 422

    app.dependency_overrides.clear()
