"""
BiteIQ - Phase 6 End-to-End User Journeys Integration Test Suite.
Verifies the complete consumer lifecycle:
1. Journey A: Biometric Onboarding -> Mifflin-St Jeor / TDEE Calculation -> Dynamic Macro Budget with Hypertension Ceiling.
2. Journey B.1: Food Database Search -> Manual Breakfast Logging -> Diary Consumed / Remaining Updates.
3. Journey B.2: AI Meal Plate Vision Scan -> Segmented Food Items -> Confirm to Lunch -> Diary Subtotals.
4. Journey B.3: Packaged Food Dual-Panel Scan -> ICMR-NIN 2024 Profiling -> 1-Tap Diary Bridge to Snack.
5. Journey B.4: Water Hydration Logging -> Daily Macro Summation -> Clinical Insights & Safety Warnings.
"""

from datetime import date
from decimal import Decimal
import io
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.main import app
from backend.src.core.database import get_db_session
from backend.src.models.user import User, UserRole
from backend.tests.conftest import make_test_token


@pytest.mark.asyncio
async def test_end_to_end_user_lifecycle_and_multimodal_logging(db_session: AsyncSession):
    """
    Executes the entire end-to-end multi-modal nutrition lifecycle:
    Onboarding -> Manual Search -> Plate Scan -> Packaged Audit -> Water & Insights.
    """
    app.dependency_overrides[get_db_session] = lambda: db_session

    # Step 1: Create Consumer User
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="hero_consumer@biteiq.io",
        password_hash="argon2_secure_hash",
        full_name="Vikramaditya Sharma",
        role=UserRole.CONSUMER,
    )
    db_session.add(user)
    await db_session.commit()

    token = make_test_token(user_id=str(user_id), email=user.email)
    auth_headers = {"Authorization": f"Bearer {token}"}
    today_str = str(date.today())

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:

        # ----------------------------------------------------------------------
        # JOURNEY A: Biometric Profile Setup & Dynamic TDEE Macro Budget
        # ----------------------------------------------------------------------
        profile_payload = {
            "age": 28,
            "biological_sex": "male",
            "height_cm": 178.0,
            "current_weight_kg": 76.5,
            "target_weight_kg": 72.0,
            "activity_level": "moderately_active",
            "primary_goal": "moderate_fat_loss",
            "diet_type": "standard_omnivore",
            "conditions": [
                {"condition_key": "hypertension", "severity": "mild", "notes": "Stage 1 elevated blood pressure"}
            ],
        }

        res_profile = await client.put("/api/v1/profile", json=profile_payload, headers=auth_headers)
        assert res_profile.status_code == 200, res_profile.text
        profile_data = res_profile.json()
        assert profile_data["age"] == 28
        assert round(profile_data["bmr_kcal"], 1) == 1742.5
        assert round(profile_data["tdee_kcal"], 1) == 2700.9

        # Target macro budget checks
        macro_budget = profile_data["macro_budget"]
        assert macro_budget is not None
        assert macro_budget["ceiling_sodium_mg"] == 1500.0  # Hypertension safety clamp
        assert macro_budget["target_calories"] > 1800.0

        # Verify initial clean diary state
        res_diary_init = await client.get(f"/api/v1/diary?date={today_str}", headers=auth_headers)
        assert res_diary_init.status_code == 200
        diary_init = res_diary_init.json()
        assert diary_init["totals_consumed"]["calories"] == 0.0
        assert diary_init["remaining"]["calories"] > 0.0

        # ----------------------------------------------------------------------
        # JOURNEY B.1: Food Search & Breakfast Logging
        # ----------------------------------------------------------------------
        # Search food database
        res_search = await client.get("/api/v1/foods/search?q=Chilla", headers=auth_headers)
        assert res_search.status_code == 200
        search_data = res_search.json()
        assert "items" in search_data

        # Log Breakfast Item
        breakfast_payload = {
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
        res_b_log = await client.post("/api/v1/diary/log-item", json=breakfast_payload, headers=auth_headers)
        assert res_b_log.status_code == 201
        b_entry = res_b_log.json()
        assert b_entry["food_name"] == "Moong Dal Chilla with Mint Chutney"

        # Check diary totals updated
        res_diary_b = await client.get(f"/api/v1/diary?date={today_str}", headers=auth_headers)
        assert res_diary_b.status_code == 200
        d_b = res_diary_b.json()
        assert d_b["totals_consumed"]["calories"] == 240.0
        assert d_b["totals_consumed"]["protein_g"] == 14.0
        assert len(d_b["meals"]["breakfast"]) == 1

        # ----------------------------------------------------------------------
        # JOURNEY B.2: AI Meal Plate Vision Scan & Lunch Confirmation
        # ----------------------------------------------------------------------
        fake_jpeg = b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x00" * 300
        files = {"image": ("my_lunch.jpg", io.BytesIO(fake_jpeg), "image/jpeg")}
        data_hint = {"meal_type_hint": "lunch"}

        res_scan = await client.post("/api/v1/meals/scan-plate", files=files, data=data_hint, headers=auth_headers)
        assert res_scan.status_code == 200
        scan_result = res_scan.json()
        assert "analysis_id" in scan_result
        assert len(scan_result["items"]) >= 3
        lunch_items = scan_result["items"]

        # Confirm and commit the scanned plate items to Lunch slot
        confirm_items_payload = {
            "meal_type": "lunch",
            "items": [
                {
                    "food_name": item["name"],
                    "serving_quantity": 1.0,
                    "serving_unit": item["serving_description"],
                    "weight_in_grams": item["estimated_grams"],
                    "calories": item["calories"],
                    "protein_g": item["protein_g"],
                    "carbs_g": item["carbs_g"],
                    "fat_g": item["fat_g"],
                    "fiber_g": item.get("fiber_g", 0.0),
                    "sodium_mg": item.get("sodium_mg", 0.0),
                    "sugar_g": item.get("sugar_g", 0.0),
                    "bounding_box": item["bounding_box"],
                    "confidence_score": item["confidence_score"],
                }
                for item in lunch_items
            ],
            "plate_summary": scan_result["plate_summary"],
        }
        res_confirm = await client.post("/api/v1/meals/confirm-plate-log", json=confirm_items_payload, headers=auth_headers)
        assert res_confirm.status_code == 201
        confirm_resp = res_confirm.json()
        assert confirm_resp["status"] == "success"
        assert confirm_resp["meal_type"] == "lunch"
        assert confirm_resp["logged_entries_count"] == len(lunch_items)

        lunch_cals = confirm_resp["total_calories_logged"]

        # Check diary after lunch
        res_diary_l = await client.get(f"/api/v1/diary?date={today_str}", headers=auth_headers)
        assert res_diary_l.status_code == 200
        d_l = res_diary_l.json()
        assert abs(d_l["totals_consumed"]["calories"] - (240.0 + lunch_cals)) < 1.0
        assert len(d_l["meals"]["lunch"]) == len(lunch_items)

        # ----------------------------------------------------------------------
        # JOURNEY B.3: Packaged Food Scan & Snack Diary Bridge
        # ----------------------------------------------------------------------
        fake_front = b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x01" * 300
        fake_back = b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x02" * 300
        files_pkg = {
            "front_image": ("snack_front.jpg", io.BytesIO(fake_front), "image/jpeg"),
            "back_image": ("snack_back.jpg", io.BytesIO(fake_back), "image/jpeg"),
        }
        data_pkg = {
            "product_name_hint": "Bingo! Tedhe Medhe Masala Tadka",
            "brand_hint": "Bingo! (ITC)",
        }
        res_pkg_scan = await client.post("/api/v1/packaged/analyze", files=files_pkg, data=data_pkg, headers=auth_headers)
        assert res_pkg_scan.status_code == 200
        pkg_body = res_pkg_scan.json()
        assert pkg_body["status"] == "success"
        audit = pkg_body["data"]
        audit_id = audit["audit_id"]
        assert 0.0 <= audit["health_score"] <= 100.0

        # Bridge 25g to Snack via 1-tap bridge
        pkg_bridge_payload = {
            "audit_id": audit_id,
            "diary_date": today_str,
            "meal_type": "snack",
            "consumed_grams": 25.0,
            "serving_unit": "0.5 pack (25g)",
        }
        res_bridge = await client.post("/api/v1/packaged/log-to-diary", json=pkg_bridge_payload, headers=auth_headers)
        assert res_bridge.status_code == 201
        bridge_data = res_bridge.json()
        snack_cals = bridge_data["calories_logged"]

        # Check diary after snack
        res_diary_s = await client.get(f"/api/v1/diary?date={today_str}", headers=auth_headers)
        assert res_diary_s.status_code == 200
        d_s = res_diary_s.json()
        expected_total_cals = 240.0 + lunch_cals + snack_cals
        assert abs(d_s["totals_consumed"]["calories"] - expected_total_cals) < 1.0
        assert len(d_s["meals"]["snack"]) >= 1

        # ----------------------------------------------------------------------
        # JOURNEY B.4: Water Hydration Logging & Daily Insights
        # ----------------------------------------------------------------------
        # Log 750ml water
        res_water = await client.post("/api/v1/diary/water", json={"amount_ml": 750}, headers=auth_headers)
        assert res_water.status_code == 200
        assert res_water.json()["total_water_ml"] == 750.0

        # Query daily diary summary
        res_final_diary = await client.get(f"/api/v1/diary?date={today_str}", headers=auth_headers)
        assert res_final_diary.status_code == 200
        d_final = res_final_diary.json()
        assert d_final["totals_consumed"]["water_ml"] == 750.0
        assert d_final["totals_consumed"]["calories"] > 0.0
        assert d_final["remaining"]["calories"] >= 0.0

        # Retrieve daily clinical insights
        res_insights = await client.get("/api/v1/insights/daily", headers=auth_headers)
        assert res_insights.status_code == 200
        insights_list = res_insights.json()
        assert isinstance(insights_list, list)

    app.dependency_overrides.clear()
