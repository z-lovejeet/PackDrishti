"""
BiteIQ - Integration Tests for Packaged Food Scanner & Diary Bridge APIs.
Tests POST /packaged/analyze, POST /packaged/log-to-diary, GET /packaged/history,
GET /packaged/{audit_id}, DELETE /packaged/{audit_id}, file validations,
mass invariant scaling, and clinical contraindication logging.
"""

from datetime import date
from decimal import Decimal
import io
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.main import app
from backend.src.core.database import get_db_session
from backend.src.models.diary import DailyFoodDiary, MealEntry
from backend.src.models.insight import HealthInsightsLog
from backend.src.models.packaged import PackagedFoodAudit
from backend.src.models.profile import UserMedicalCondition, UserProfile
from backend.src.models.user import User, UserRole
from backend.tests.conftest import make_test_token


@pytest.mark.asyncio
async def test_packaged_analyze_and_log_to_diary_workflow(db_session: AsyncSession):
    """
    Tests complete packaged food workflow:
    1. Upload front and back packaging images to POST /api/v1/packaged/analyze -> 200 OK.
    2. Audits ICMR scores, nutrients per 100g, and chemical additives.
    3. Log half pack (27.5g) to diary via POST /api/v1/packaged/log-to-diary -> 201 Created.
    4. Verify diary totals and meal entries reflect proportionally scaled macros.
    """
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="packaged_tester@biteiq.io",
        password_hash="test_secure_hash",
        full_name="Pooja Sharma",
        role=UserRole.CONSUMER,
    )
    db_session.add(user)

    profile = UserProfile(
        user_id=user_id,
        age=29,
        biological_sex="female",
        height_cm=Decimal("162.0"),
        current_weight_kg=Decimal("58.0"),
        target_weight_kg=Decimal("54.0"),
        activity_level="moderately_active",
        primary_goal="moderate_fat_loss",
        diet_type="standard_omnivore",
        bmr_kcal=Decimal("1320.0"),
        tdee_kcal=Decimal("2046.0"),
    )
    db_session.add(profile)
    await db_session.commit()

    token = make_test_token(user_id=str(user_id), email=user.email)
    auth_headers = {"Authorization": f"Bearer {token}"}

    app.dependency_overrides[get_db_session] = lambda: db_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Analyze Packaged Food
        front_img = io.BytesIO(b"\xFF\xD8\xFF\xE0MockFrontJPEGBinaryContentForPackagedScanner")
        back_img = io.BytesIO(b"\xFF\xD8\xFF\xE0MockBackJPEGBinaryContentForPackagedScanner")

        files = {
            "front_image": ("front.jpg", front_img, "image/jpeg"),
            "back_image": ("back.jpg", back_img, "image/jpeg"),
        }
        data = {
            "product_name_hint": "Bingo! Tedhe Medhe Masala Tadka",
            "brand_name_hint": "Bingo! (ITC)",
        }

        resp = await client.post(
            "/api/v1/packaged/analyze",
            files=files,
            data=data,
            headers=auth_headers,
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["status"] == "success"
        audit_data = body["data"]
        audit_id = audit_data["audit_id"]
        assert audit_data["product_name"] == "Bingo! Tedhe Medhe Masala Tadka"
        assert audit_data["brand_name"] == "Bingo! (ITC)"
        assert 0.0 <= audit_data["health_score"] <= 100.0
        assert "nutrients_per_100g" in audit_data
        assert audit_data["nutrients_per_100g"]["energy_kcal"] > 0.0
        assert len(audit_data["badges"]) > 0

        # 2. Bridge to Diary: Log 27.5g to afternoon snack
        log_payload = {
            "audit_id": audit_id,
            "diary_date": str(date.today()),
            "meal_type": "snack",
            "consumed_grams": 27.5,
            "serving_unit": "0.5 pack (27.5g)",
        }

        log_resp = await client.post(
            "/api/v1/packaged/log-to-diary",
            json=log_payload,
            headers=auth_headers,
        )
        assert log_resp.status_code == 201, log_resp.text
        log_body = log_resp.json()
        assert log_body["status"] == "success"
        assert log_body["consumed_grams"] == 27.5
        assert log_body["meal_type"] == "snack"

        # Verify scaled calories
        base_kcal = audit_data["nutrients_per_100g"]["energy_kcal"]
        expected_kcal = round(base_kcal * (27.5 / 100.0), 2)
        assert abs(log_body["calories_logged"] - expected_kcal) < 0.1

        # 3. Verify diary reflects the logged packaged item
        diary_resp = await client.get(
            f"/api/v1/diary?date={date.today()}",
            headers=auth_headers,
        )
        assert diary_resp.status_code == 200
        diary_data = diary_resp.json()

        snack_items = diary_data["meals"]["snack"]
        assert len(snack_items) >= 1
        logged_entry = next(e for e in snack_items if e["food_name"] == audit_data["product_name"])
        assert logged_entry["source_type"] == "packaged_scan"
        assert float(logged_entry["weight_in_grams"]) == 27.5
        assert abs(float(logged_entry["calories"]) - expected_kcal) < 0.1

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_packaged_analyze_file_validations(db_session: AsyncSession):
    """
    Tests security and format guards on POST /api/v1/packaged/analyze:
    - Invalid MIME types (e.g., text/plain) -> 400 Bad Request
    - Empty image bytes -> 400 Bad Request
    - Image exceeding 10MB -> 413 Payload Too Large
    """
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="validator_tester@biteiq.io",
        password_hash="test_secure_hash",
        full_name="Validations User",
        role=UserRole.CONSUMER,
    )
    db_session.add(user)
    await db_session.commit()

    token = make_test_token(user_id=str(user_id), email=user.email)
    auth_headers = {"Authorization": f"Bearer {token}"}

    app.dependency_overrides[get_db_session] = lambda: db_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # A. Invalid MIME type (text/plain)
        bad_file = io.BytesIO(b"Just plain text file content")
        good_file = io.BytesIO(b"\xFF\xD8\xFF\xE0ValidJPEG")
        resp_mime = await client.post(
            "/api/v1/packaged/analyze",
            files={
                "front_image": ("bad.txt", bad_file, "text/plain"),
                "back_image": ("back.jpg", good_file, "image/jpeg"),
            },
            headers=auth_headers,
        )
        assert resp_mime.status_code == 400
        assert "invalid format" in resp_mime.json()["detail"]

        # B. Empty file payload
        empty_file = io.BytesIO(b"")
        resp_empty = await client.post(
            "/api/v1/packaged/analyze",
            files={
                "front_image": ("front.jpg", empty_file, "image/jpeg"),
                "back_image": ("back.jpg", good_file, "image/jpeg"),
            },
            headers=auth_headers,
        )
        assert resp_empty.status_code == 400
        assert "empty" in resp_empty.json()["detail"].lower()

        # C. File exceeding 10MB
        oversized = io.BytesIO(b"0" * (11 * 1024 * 1024))
        resp_size = await client.post(
            "/api/v1/packaged/analyze",
            files={
                "front_image": ("front.jpg", oversized, "image/jpeg"),
                "back_image": ("back.jpg", good_file, "image/jpeg"),
            },
            headers=auth_headers,
        )
        assert resp_size.status_code == 413
        assert "exceeds" in resp_size.json()["detail"].lower()

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_packaged_history_and_get_by_id_and_delete(db_session: AsyncSession):
    """
    Tests GET /packaged/history, GET /packaged/{audit_id}, and DELETE /packaged/{audit_id}.
    """
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="history_tester@biteiq.io",
        password_hash="test_secure_hash",
        full_name="History Tester",
        role=UserRole.CONSUMER,
    )
    db_session.add(user)

    audit = PackagedFoodAudit(
        user_id=user_id,
        product_name="Roasted Makhana Himalayan Salt",
        brand_name="NutriBite",
        category="Healthy Snack",
        health_score=Decimal("82.0"),
        score_band="Nutritious Choice",
        mrp=Decimal("50.0"),
        net_quantity_g=Decimal("40.0"),
        price_per_100g=Decimal("125.0"),
        mfg_date="08/2026",
        expiry_date="02/2027",
        is_expired=False,
        nutrients_json=[
            {"name": "Energy", "value_per_100g": 380.0, "unit": "kcal"},
            {"name": "Protein", "value_per_100g": 9.5, "unit": "g"},
            {"name": "Total Fat", "value_per_100g": 8.0, "unit": "g"},
            {"name": "Sodium", "value_per_100g": 320.0, "unit": "mg"},
        ],
        badges_json=[{"label": "High Protein", "type": "good"}],
        additives_json=[],
        clinical_advisory_json={
            "should_we_eat_it": "Wholesome Choice",
            "how_bad_is_it": "Minimal processing, clean snack.",
        },
    )
    db_session.add(audit)
    await db_session.commit()
    await db_session.refresh(audit)

    token = make_test_token(user_id=str(user_id), email=user.email)
    auth_headers = {"Authorization": f"Bearer {token}"}

    app.dependency_overrides[get_db_session] = lambda: db_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # A. History endpoint
        hist_resp = await client.get("/api/v1/packaged/history", headers=auth_headers)
        assert hist_resp.status_code == 200
        hist_body = hist_resp.json()
        assert hist_body["status"] == "success"
        assert hist_body["total"] >= 1
        assert any(item["id"] == str(audit.id) for item in hist_body["items"])

        # B. Fuzzy Search
        search_resp = await client.get("/api/v1/packaged/history?search=Makhana", headers=auth_headers)
        assert search_resp.status_code == 200
        assert len(search_resp.json()["items"]) == 1

        # C. Get by ID
        get_resp = await client.get(f"/api/v1/packaged/{audit.id}", headers=auth_headers)
        assert get_resp.status_code == 200
        assert get_resp.json()["data"]["audit_id"] == str(audit.id)
        assert get_resp.json()["data"]["product_name"] == "Roasted Makhana Himalayan Salt"

        # D. Delete audit
        del_resp = await client.delete(f"/api/v1/packaged/{audit.id}", headers=auth_headers)
        assert del_resp.status_code == 200
        assert del_resp.json()["status"] == "success"

        # E. Verify 404 after deletion
        get_again = await client.get(f"/api/v1/packaged/{audit.id}", headers=auth_headers)
        assert get_again.status_code == 404

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_packaged_clinical_contraindication_alerts(db_session: AsyncSession):
    """
    Tests clinical contraindication trigger:
    When a user with active 'hypertension' condition logs a high-sodium product,
    an alert is surfaced in the response and persisted to health_insights_log.
    """
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="hypertension_scanner@biteiq.io",
        password_hash="test_secure_hash",
        full_name="Aman Gupta",
        role=UserRole.CONSUMER,
    )
    db_session.add(user)

    # Attach medical condition: hypertension
    condition = UserMedicalCondition(
        user_id=user_id,
        condition_key="hypertension",
        severity="moderate",
    )
    db_session.add(condition)

    # Add audit with high sodium (950mg per 100g)
    audit = PackagedFoodAudit(
        user_id=user_id,
        product_name="Salty Fried Sticks",
        brand_name="CrunchCo",
        category="Savoury Snack",
        health_score=Decimal("30.0"),
        score_band="High Health Concern",
        nutrients_json=[
            {"name": "Energy", "value_per_100g": 520.0, "unit": "kcal"},
            {"name": "Sodium", "value_per_100g": 950.0, "unit": "mg"},
            {"name": "Total Fat", "value_per_100g": 32.0, "unit": "g"},
        ],
        badges_json=[{"label": "High Sodium", "type": "danger"}],
        additives_json=[],
        clinical_advisory_json={},
    )
    db_session.add(audit)
    await db_session.commit()
    await db_session.refresh(audit)

    token = make_test_token(user_id=str(user_id), email=user.email)
    auth_headers = {"Authorization": f"Bearer {token}"}

    app.dependency_overrides[get_db_session] = lambda: db_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Log 100g of the high sodium snack
        log_resp = await client.post(
            "/api/v1/packaged/log-to-diary",
            json={
                "audit_id": str(audit.id),
                "diary_date": str(date.today()),
                "meal_type": "snack",
                "consumed_grams": 100.0,
            },
            headers=auth_headers,
        )
        assert log_resp.status_code == 201
        body = log_resp.json()
        assert body["contraindications_logged"] >= 1

        # Check DB health insights log
        stmt = select(HealthInsightsLog).where(
            HealthInsightsLog.user_id == user_id,
            HealthInsightsLog.related_condition == "hypertension",
        )
        res = await db_session.execute(stmt)
        insights = res.scalars().all()
        assert len(insights) >= 1
        assert "Sodium" in insights[0].title or "Sodium" in insights[0].message

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_packaged_log_to_diary_proportional_scaling(db_session: AsyncSession):
    """
    Tests exact proportional scaling of macros when bridging packaged foods into diary.
    Given 100g declared: 500 kcal, 10g protein, 50g carbs, 20g fat, 5g fiber, 600mg sodium, 12g sugar.
    Logging 50g must yield exactly: 250 kcal, 5g protein, 25g carbs, 10g fat, 2.5g fiber, 300mg sodium, 6g sugar.
    """
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="scaling_tester@biteiq.io",
        password_hash="test_secure_hash",
        full_name="Scaling Tester",
        role=UserRole.CONSUMER,
    )
    db_session.add(user)

    audit = PackagedFoodAudit(
        user_id=user_id,
        product_name="Energy Granola Cluster",
        brand_name="HealthyBite",
        category="Cereal / Snack",
        health_score=Decimal("65.0"),
        score_band="Consume in Moderation",
        nutrients_json=[
            {"name": "Energy", "value_per_100g": 500.0, "unit": "kcal"},
            {"name": "Protein", "value_per_100g": 10.0, "unit": "g"},
            {"name": "Total Carbohydrates", "value_per_100g": 50.0, "unit": "g"},
            {"name": "Total Fat", "value_per_100g": 20.0, "unit": "g"},
            {"name": "Dietary Fiber", "value_per_100g": 5.0, "unit": "g"},
            {"name": "Sodium", "value_per_100g": 600.0, "unit": "mg"},
            {"name": "Added Sugars", "value_per_100g": 12.0, "unit": "g"},
        ],
        badges_json=[],
        additives_json=[],
        clinical_advisory_json={},
    )
    db_session.add(audit)
    await db_session.commit()
    await db_session.refresh(audit)

    token = make_test_token(user_id=str(user_id), email=user.email)
    auth_headers = {"Authorization": f"Bearer {token}"}

    app.dependency_overrides[get_db_session] = lambda: db_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        log_resp = await client.post(
            "/api/v1/packaged/log-to-diary",
            json={
                "audit_id": str(audit.id),
                "diary_date": str(date.today()),
                "meal_type": "breakfast",
                "consumed_grams": 50.0,
                "serving_unit": "0.5 cup (50g)",
            },
            headers=auth_headers,
        )
        assert log_resp.status_code == 201
        res = log_resp.json()

        assert res["consumed_grams"] == 50.0
        assert res["calories_logged"] == 250.0
        assert res["protein_logged"] == 5.0
        assert res["carbs_logged"] == 25.0
        assert res["fat_logged"] == 10.0
        assert res["fiber_logged"] == 2.5
        assert res["sodium_logged"] == 300.0
        assert res["sugar_logged"] == 6.0

    app.dependency_overrides.clear()

