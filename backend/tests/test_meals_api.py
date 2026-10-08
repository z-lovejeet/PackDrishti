"""
BiteIQ - Integration Tests for AI Meal Plate Vision & Confirmation APIs.
Verifies POST /meals/scan-plate, POST /meals/confirm-plate-log,
image MIME validation, size limits, diary integration, clinical insights persistence,
and authentication guards.
"""

from decimal import Decimal
import io
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
async def test_meals_scan_plate_and_confirm_workflow(db_session: AsyncSession):
    """
    Tests complete plate scanning and confirmation workflow:
    1. Unauthorized calls rejected with 401.
    2. Upload valid JPEG image to POST /meals/scan-plate -> 200 OK.
    3. User reviews and commits plate items via POST /meals/confirm-plate-log -> 201 Created.
    4. Verified that diary totals and meal entries reflect the logged plate.
    """
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="plate_tester@biteiq.io",
        password_hash="test_secure_hash",
        full_name="Rohan Verma",
        role=UserRole.CONSUMER,
    )
    db_session.add(user)

    profile = UserProfile(
        user_id=user_id,
        age=26,
        biological_sex="male",
        height_cm=Decimal("175.0"),
        current_weight_kg=Decimal("70.0"),
        target_weight_kg=Decimal("68.0"),
        activity_level="moderately_active",
        primary_goal="moderate_fat_loss",
        diet_type="standard_omnivore",
        bmr_kcal=Decimal("1650.0"),
        tdee_kcal=Decimal("2557.5"),
    )
    db_session.add(profile)
    await db_session.commit()

    token = make_test_token(user_id=str(user_id), email=user.email)
    auth_headers = {"Authorization": f"Bearer {token}"}

    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Unauthorized scan attempt
        res_unauth = await client.post("/api/v1/meals/scan-plate")
        assert res_unauth.status_code == 401

        # 2. Upload valid JPEG to scan-plate
        valid_jpeg_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x00" * 200
        files = {
            "image": ("test_plate.jpg", io.BytesIO(valid_jpeg_bytes), "image/jpeg"),
        }
        data_form = {"meal_type_hint": "lunch"}

        res_scan = await client.post(
            "/api/v1/meals/scan-plate",
            files=files,
            data=data_form,
            headers=auth_headers,
        )
        assert res_scan.status_code == 200
        scan_data = res_scan.json()
        assert "analysis_id" in scan_data
        assert len(scan_data["items"]) >= 3
        assert scan_data["plate_summary"]["total_calories"] > 0.0

        first_item = scan_data["items"][0]
        assert "name" in first_item
        assert "bounding_box" in first_item
        assert len(first_item["bounding_box"]) == 4

        # 3. Confirm and log the plate items to lunch
        confirm_payload = {
            "meal_type": "lunch",
            "items": [
                {
                    "food_name": "Toor Dal Tadka",
                    "serving_quantity": 1.0,
                    "serving_unit": "katori",
                    "weight_in_grams": 150.0,
                    "calories": 142.0,
                    "protein_g": 7.5,
                    "carbs_g": 21.0,
                    "fat_g": 3.2,
                    "fiber_g": 5.0,
                    "sodium_mg": 280.0,
                    "sugar_g": 1.0,
                    "bounding_box": [120, 150, 480, 520],
                    "confidence_score": 0.95,
                },
                {
                    "food_name": "Phulka / Roti",
                    "serving_quantity": 2.0,
                    "serving_unit": "roti",
                    "weight_in_grams": 75.0,
                    "calories": 210.0,
                    "protein_g": 6.4,
                    "carbs_g": 42.0,
                    "fat_g": 1.2,
                    "fiber_g": 5.2,
                    "sodium_mg": 150.0,
                    "sugar_g": 1.0,
                    "bounding_box": [110, 530, 490, 890],
                    "confidence_score": 0.98,
                },
            ],
        }

        res_confirm = await client.post(
            "/api/v1/meals/confirm-plate-log",
            json=confirm_payload,
            headers=auth_headers,
        )
        assert res_confirm.status_code == 201
        conf_data = res_confirm.json()
        assert conf_data["status"] == "success"
        assert conf_data["logged_entries_count"] == 2
        assert conf_data["total_calories_logged"] == 352.0

        # 4. Inspect GET /diary to ensure lunch items exist and totals updated
        res_diary = await client.get("/api/v1/diary", headers=auth_headers)
        assert res_diary.status_code == 200
        diary_data = res_diary.json()
        assert diary_data["totals_consumed"]["calories"] == 352.0
        assert len(diary_data["meals"]["lunch"]) == 2
        assert diary_data["meals"]["lunch"][0]["source_type"] == "plate_vision"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_meals_scan_plate_validation_errors(db_session: AsyncSession):
    """
    Tests input validation boundaries for POST /meals/scan-plate:
    1. Non-image file (e.g., text/plain) is rejected with 400.
    2. Empty file is rejected with 400.
    3. File exceeding 10MB is rejected with 400.
    """
    user_id = uuid.uuid4()
    test_user = User(
        id=user_id,
        email="file_tester@biteiq.io",
        password_hash="test_secure_hash",
        full_name="File Tester",
        role=UserRole.CONSUMER,
    )
    db_session.add(test_user)
    await db_session.commit()

    token = make_test_token(user_id=str(user_id), email=test_user.email)
    auth_headers = {"Authorization": f"Bearer {token}"}

    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Non-image file
        bad_text_file = {
            "image": ("script.txt", io.BytesIO(b"Hello world, this is plain text"), "text/plain"),
        }
        res_text = await client.post("/api/v1/meals/scan-plate", files=bad_text_file, headers=auth_headers)
        assert res_text.status_code == 400
        assert "Invalid image format" in res_text.json()["detail"]

        # 2. Empty file
        empty_file = {
            "image": ("empty.jpg", io.BytesIO(b""), "image/jpeg"),
        }
        res_empty = await client.post("/api/v1/meals/scan-plate", files=empty_file, headers=auth_headers)
        assert res_empty.status_code == 400
        assert "empty" in res_empty.json()["detail"].lower()

        # 3. Oversized file (> 10MB)
        oversized_bytes = b"\xFF\xD8\xFF" + b"\x00" * (11 * 1024 * 1024)
        oversized_file = {
            "image": ("huge.jpg", io.BytesIO(oversized_bytes), "image/jpeg"),
        }
        res_huge = await client.post("/api/v1/meals/scan-plate", files=oversized_file, headers=auth_headers)
        assert res_huge.status_code == 400
        assert "maximum permitted size" in res_huge.json()["detail"].lower()

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_confirm_plate_log_clinical_interception(db_session: AsyncSession):
    """
    Confirms that when a user with active medical conditions (e.g., diabetes)
    confirms plate items with excessive sugar or net carbs, clinical contraindications
    are recorded into health_insights_log.
    """
    user_id = uuid.uuid4()
    test_user = User(
        id=user_id,
        email="diabetic_plate@biteiq.io",
        password_hash="test_secure_hash",
        full_name="Vikram Seth",
        role=UserRole.CONSUMER,
    )
    db_session.add(test_user)

    cond = UserMedicalCondition(
        user_id=user_id,
        condition_key="diabetes_type_2",
        severity="moderate",
    )
    db_session.add(cond)
    await db_session.commit()

    token = make_test_token(user_id=str(user_id), email=test_user.email)
    auth_headers = {"Authorization": f"Bearer {token}"}

    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # High net carbs + high sugar dessert on plate
        payload = {
            "meal_type": "dinner",
            "items": [
                {
                    "food_name": "Jalebi with Rabdi",
                    "serving_quantity": 2.0,
                    "serving_unit": "pieces",
                    "weight_in_grams": 120.0,
                    "calories": 420.0,
                    "protein_g": 6.0,
                    "carbs_g": 72.0,
                    "fat_g": 12.0,
                    "fiber_g": 1.0,
                    "sugar_g": 45.0,
                }
            ],
        }

        res = await client.post("/api/v1/meals/confirm-plate-log", json=payload, headers=auth_headers)
        assert res.status_code == 201
        conf_data = res.json()
        assert conf_data["clinical_warnings_count"] >= 1

        # Verify insight appears in GET /api/v1/insights/daily
        res_insights = await client.get("/api/v1/insights/daily", headers=auth_headers)
        assert res_insights.status_code == 200
        insights = res_insights.json()
        assert len(insights) >= 1
        assert any("Glycemic" in i["title"] or "Sugar" in i["title"] for i in insights)

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_confirm_plate_log_validation_failures(db_session: AsyncSession):
    """
    Tests validation errors on confirm-plate-log:
    1. Negative calories/macros -> 422.
    2. Invalid meal type -> 422.
    3. Empty items list -> 422.
    """
    user_id = uuid.uuid4()
    test_user = User(
        id=user_id,
        email="val_tester@biteiq.io",
        password_hash="test_secure_hash",
        full_name="Val Tester",
        role=UserRole.CONSUMER,
    )
    db_session.add(test_user)
    await db_session.commit()

    token = make_test_token(user_id=str(user_id), email=test_user.email)
    auth_headers = {"Authorization": f"Bearer {token}"}

    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Negative calories
        payload_bad_cal = {
            "meal_type": "lunch",
            "items": [
                {
                    "food_name": "Roti",
                    "weight_in_grams": 50.0,
                    "calories": -100.0,
                    "protein_g": 5.0,
                    "carbs_g": 20.0,
                    "fat_g": 2.0,
                }
            ],
        }
        res1 = await client.post("/api/v1/meals/confirm-plate-log", json=payload_bad_cal, headers=auth_headers)
        assert res1.status_code == 422

        # Invalid meal type
        payload_bad_type = {
            "meal_type": "midnight_snack",
            "items": [
                {
                    "food_name": "Roti",
                    "weight_in_grams": 50.0,
                    "calories": 100.0,
                    "protein_g": 5.0,
                    "carbs_g": 20.0,
                    "fat_g": 2.0,
                }
            ],
        }
        res2 = await client.post("/api/v1/meals/confirm-plate-log", json=payload_bad_type, headers=auth_headers)
        assert res2.status_code == 422

        # Empty items list
        payload_empty = {
            "meal_type": "breakfast",
            "items": [],
        }
        res3 = await client.post("/api/v1/meals/confirm-plate-log", json=payload_empty, headers=auth_headers)
        assert res3.status_code == 422

    app.dependency_overrides.clear()
