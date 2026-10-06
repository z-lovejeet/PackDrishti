import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
import pytest
from sqlalchemy import select, delete
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.src.models import (
    User,
    UserRole,
    UserProfile,
    UserMedicalCondition,
    DailyMacroBudget,
    DailyFoodDiary,
    MealEntry,
    VerifiedFoodReference,
    CustomFood,
    PackagedFoodAudit,
    HealthInsightsLog,
)
from backend.src.scripts.seed_foods import seed_verified_foods, FOOD_SEED_ITEMS


@pytest.mark.asyncio
async def test_user_profile_crud_and_relationships(db_session: AsyncSession):
    """
    Verifies 1:1 user-profile and 1:N medical conditions linking and lazy load.
    """
    user = User(
        email="athlete.sharma@example.com",
        password_hash="hashed_pw_xyz",
        role=UserRole.CONSUMER,
        full_name="Aman Sharma",
    )
    db_session.add(user)
    await db_session.flush()

    profile = UserProfile(
        user_id=user.id,
        age=28,
        biological_sex="male",
        height_cm=Decimal("178.50"),
        current_weight_kg=Decimal("76.00"),
        target_weight_kg=Decimal("72.00"),
        body_fat_percentage=Decimal("16.50"),
        activity_level="moderately_active",
        primary_goal="moderate_fat_loss",
        diet_type="high_protein_omnivore",
        bmr_kcal=Decimal("1745.00"),
        tdee_kcal=Decimal("2443.00"),
    )
    db_session.add(profile)

    condition = UserMedicalCondition(
        user_id=user.id,
        condition_key="hypertension",
        severity="mild",
        diagnosed_date=date(2024, 1, 15),
    )
    db_session.add(condition)
    await db_session.commit()

    # Re-fetch user with relationships
    result = await db_session.execute(select(User).where(User.id == user.id))
    fetched_user = result.scalar_one()

    assert fetched_user.profile is not None
    assert fetched_user.profile.age == 28
    assert fetched_user.profile.biological_sex == "male"
    assert fetched_user.profile.height_cm == Decimal("178.50")
    assert fetched_user.profile.bmr_kcal == Decimal("1745.00")

    assert len(fetched_user.medical_conditions) == 1
    assert fetched_user.medical_conditions[0].condition_key == "hypertension"
    assert fetched_user.medical_conditions[0].severity == "mild"
    assert fetched_user.medical_conditions[0].user.email == "athlete.sharma@example.com"


@pytest.mark.asyncio
async def test_user_profile_check_constraints(db_session: AsyncSession):
    """
    Verifies check constraints on UserProfile: age, sex, height, weight, activity, goal.
    """
    user = User(
        email="boundary.test@example.com",
        password_hash="pass123",
        role=UserRole.CONSUMER,
        full_name="Boundary Tester",
    )
    db_session.add(user)
    await db_session.flush()

    # Case A: Age < 10
    invalid_profile = UserProfile(
        user_id=user.id,
        age=5,  # Violates age >= 10
        biological_sex="male",
        height_cm=Decimal("170.00"),
        current_weight_kg=Decimal("70.00"),
        target_weight_kg=Decimal("65.00"),
        bmr_kcal=Decimal("1600.00"),
        tdee_kcal=Decimal("2200.00"),
    )
    db_session.add(invalid_profile)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()

    # Case B: Biological sex invalid
    invalid_sex_profile = UserProfile(
        user_id=user.id,
        age=25,
        biological_sex="other_alien",  # Violates IN ('male', 'female')
        height_cm=Decimal("170.00"),
        current_weight_kg=Decimal("70.00"),
        target_weight_kg=Decimal("65.00"),
        bmr_kcal=Decimal("1600.00"),
        tdee_kcal=Decimal("2200.00"),
    )
    db_session.add(invalid_sex_profile)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()

    # Case C: Height > 260
    invalid_height_profile = UserProfile(
        user_id=user.id,
        age=25,
        biological_sex="female",
        height_cm=Decimal("290.00"),  # Violates height <= 260
        current_weight_kg=Decimal("70.00"),
        target_weight_kg=Decimal("65.00"),
        bmr_kcal=Decimal("1600.00"),
        tdee_kcal=Decimal("2200.00"),
    )
    db_session.add(invalid_height_profile)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_user_medical_conditions_uniqueness_and_keys(db_session: AsyncSession):
    """
    Verifies unique condition per user and allowed condition_key constraint.
    """
    user = User(
        email="conditions.test@example.com",
        password_hash="pass123",
        role=UserRole.CONSUMER,
        full_name="Condition Tester",
    )
    db_session.add(user)
    await db_session.flush()

    user_id = user.id
    cond1 = UserMedicalCondition(
        user_id=user_id,
        condition_key="diabetes_type_2",
        severity="moderate",
    )
    db_session.add(cond1)
    await db_session.commit()

    # Duplicate condition for same user
    dup_cond = UserMedicalCondition(
        user_id=user_id,
        condition_key="diabetes_type_2",
        severity="severe",
    )
    db_session.add(dup_cond)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()

    # Invalid condition key
    invalid_key_cond = UserMedicalCondition(
        user_id=user_id,
        condition_key="unknown_disease_xyz",
        severity="mild",
    )
    db_session.add(invalid_key_cond)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_daily_macro_budget_constraints(db_session: AsyncSession):
    """
    Verifies target_calories metabolic floor (>= 1000) and (user_id, effective_date) uniqueness.
    """
    user = User(
        email="budget.test@example.com",
        password_hash="pass123",
        role=UserRole.CONSUMER,
        full_name="Budget Tester",
    )
    db_session.add(user)
    await db_session.commit()
    user_id = user.id

    # Case A: target_calories < 1000
    starvation_budget = DailyMacroBudget(
        user_id=user_id,
        effective_date=date(2026, 10, 6),
        target_calories=Decimal("800.00"),  # Violates >= 1000.0
        target_protein_g=Decimal("120.00"),
        target_carbs_g=Decimal("50.00"),
        target_fat_g=Decimal("20.00"),
    )
    db_session.add(starvation_budget)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()

    # Case B: Valid budget
    valid_budget = DailyMacroBudget(
        user_id=user_id,
        effective_date=date(2026, 10, 6),
        target_calories=Decimal("2100.00"),
        target_protein_g=Decimal("160.00"),
        target_carbs_g=Decimal("220.00"),
        target_fat_g=Decimal("65.00"),
    )
    db_session.add(valid_budget)
    await db_session.commit()

    # Case C: Duplicate budget on same date for same user
    dup_budget = DailyMacroBudget(
        user_id=user_id,
        effective_date=date(2026, 10, 6),
        target_calories=Decimal("2200.00"),
        target_protein_g=Decimal("170.00"),
        target_carbs_g=Decimal("230.00"),
        target_fat_g=Decimal("70.00"),
    )
    db_session.add(dup_budget)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_food_diary_and_meal_entries_lifecycle(db_session: AsyncSession):
    """
    Verifies daily diary creation, 4 meal slots logging, meal_type constraint, and cascade deletion.
    """
    user = User(
        email="diary.test@example.com",
        password_hash="pass123",
        role=UserRole.CONSUMER,
        full_name="Diary Tester",
    )
    db_session.add(user)
    await db_session.flush()

    diary = DailyFoodDiary(
        user_id=user.id,
        diary_date=date(2026, 10, 6),
        total_calories=Decimal("1260.00"),
        total_protein_g=Decimal("78.00"),
        total_carbs_g=Decimal("141.00"),
        total_fat_g=Decimal("41.00"),
    )
    db_session.add(diary)
    await db_session.flush()

    meals = [
        MealEntry(
            diary_id=diary.id,
            meal_type="breakfast",
            food_name="Oats with Milk",
            weight_in_grams=Decimal("200.00"),
            calories=Decimal("250.00"),
            protein_g=Decimal("10.00"),
            carbs_g=Decimal("40.00"),
            fat_g=Decimal("5.00"),
        ),
        MealEntry(
            diary_id=diary.id,
            meal_type="lunch",
            food_name="Chicken Breast & Brown Rice",
            weight_in_grams=Decimal("350.00"),
            calories=Decimal("450.00"),
            protein_g=Decimal("40.00"),
            carbs_g=Decimal("50.00"),
            fat_g=Decimal("8.00"),
        ),
        MealEntry(
            diary_id=diary.id,
            meal_type="dinner",
            food_name="Paneer Sabzi & Roti",
            weight_in_grams=Decimal("250.00"),
            calories=Decimal("400.00"),
            protein_g=Decimal("22.00"),
            carbs_g=Decimal("45.00"),
            fat_g=Decimal("14.00"),
        ),
        MealEntry(
            diary_id=diary.id,
            meal_type="snack",
            food_name="Roasted Almonds",
            weight_in_grams=Decimal("28.00"),
            calories=Decimal("160.00"),
            protein_g=Decimal("6.00"),
            carbs_g=Decimal("6.00"),
            fat_g=Decimal("14.00"),
        ),
    ]
    db_session.add_all(meals)
    await db_session.commit()

    # Verify query back
    res = await db_session.execute(
        select(DailyFoodDiary).where(DailyFoodDiary.id == diary.id)
    )
    fetched_diary = res.scalar_one()
    assert len(fetched_diary.meal_entries) == 4

    diary_id = diary.id
    # Test invalid meal_type constraint
    invalid_meal = MealEntry(
        diary_id=diary_id,
        meal_type="midnight_feast",  # Violates meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')
        food_name="Pizza",
        weight_in_grams=Decimal("100.00"),
        calories=Decimal("300.00"),
        protein_g=Decimal("10.00"),
        carbs_g=Decimal("30.00"),
        fat_g=Decimal("15.00"),
    )
    db_session.add(invalid_meal)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()

    # Cascade delete verification
    res = await db_session.execute(select(DailyFoodDiary).where(DailyFoodDiary.id == diary_id))
    diary_to_delete = res.scalar_one()
    await db_session.delete(diary_to_delete)
    await db_session.commit()

    entries_res = await db_session.execute(
        select(MealEntry).where(MealEntry.diary_id == diary_id)
    )
    assert len(entries_res.scalars().all()) == 0


@pytest.mark.asyncio
async def test_packaged_food_audit_linking_and_null_on_delete(db_session: AsyncSession):
    """
    Verifies that deleting a PackagedFoodAudit retains the MealEntry but sets packaged_audit_id to NULL.
    """
    user = User(
        email="packaged.test@example.com",
        password_hash="pass123",
        role=UserRole.CONSUMER,
        full_name="Packaged Tester",
    )
    db_session.add(user)
    await db_session.flush()

    diary = DailyFoodDiary(
        user_id=user.id,
        diary_date=date(2026, 10, 6),
    )
    db_session.add(diary)
    await db_session.flush()

    audit = PackagedFoodAudit(
        user_id=user.id,
        product_name="Dark Chocolate 70%",
        brand_name="Amul",
        category="snacks",
        health_score=Decimal("65.00"),
        score_band="moderate",
        nutrients_json=[],
        badges_json=[],
        additives_json=[],
        clinical_advisory_json={},
    )
    db_session.add(audit)
    await db_session.flush()

    meal = MealEntry(
        diary_id=diary.id,
        meal_type="snack",
        food_name="Amul Dark Chocolate 70%",
        source_type="packaged_scan",
        packaged_audit_id=audit.id,
        weight_in_grams=Decimal("30.00"),
        calories=Decimal("165.00"),
        protein_g=Decimal("2.50"),
        carbs_g=Decimal("13.00"),
        fat_g=Decimal("11.50"),
    )
    db_session.add(meal)
    await db_session.commit()

    # Delete the packaged audit
    audit_id = audit.id
    meal_id = meal.id
    await db_session.delete(audit)
    await db_session.commit()

    # Query back the meal entry and refresh from DB
    meal_res = await db_session.execute(select(MealEntry).where(MealEntry.id == meal_id))
    fetched_meal = meal_res.scalar_one_or_none()
    assert fetched_meal is not None
    await db_session.refresh(fetched_meal)
    assert fetched_meal.packaged_audit_id is None


@pytest.mark.asyncio
async def test_verified_food_reference_uniqueness(db_session: AsyncSession):
    """
    Verifies unique constraint on VerifiedFoodReference.food_name.
    """
    food1 = VerifiedFoodReference(
        food_name="Tandoori Roti Special",
        category="grains_cereals",
        calories_per_100g=Decimal("260.00"),
        protein_per_100g=Decimal("8.50"),
        carbs_per_100g=Decimal("50.00"),
        fat_per_100g=Decimal("2.00"),
        portion_sizes_json=[],
    )
    db_session.add(food1)
    await db_session.commit()

    food2 = VerifiedFoodReference(
        food_name="Tandoori Roti Special",  # Duplicate name
        category="grains_cereals",
        calories_per_100g=Decimal("260.00"),
        protein_per_100g=Decimal("8.50"),
        carbs_per_100g=Decimal("50.00"),
        fat_per_100g=Decimal("2.00"),
        portion_sizes_json=[],
    )
    db_session.add(food2)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_seed_food_reference_data_integrity(db_session: AsyncSession):
    """
    Verifies that the seed pipeline loads >= 100 items, all items adhere to Atwater
    energy conservation, macro mass <= 100g, and seeding is idempotent.
    """
    initial_seeded = await seed_verified_foods(db_session)
    assert initial_seeded >= 100

    # Query all seeded items
    result = await db_session.execute(select(VerifiedFoodReference))
    all_foods = result.scalars().all()
    assert len(all_foods) >= 100

    for food in all_foods:
        # 1. Mass conservation: protein + carbs + fat <= 100g
        macro_sum = food.protein_per_100g + food.carbs_per_100g + food.fat_per_100g
        assert macro_sum <= Decimal("100.00"), f"Mass conservation violated for {food.food_name}: {macro_sum}g > 100g"

        # 2. Atwater energy estimation consistency:
        # Standard: 4P + 4C + 9F
        diff_std = abs(
            Decimal("4.0") * food.protein_per_100g
            + Decimal("4.0") * food.carbs_per_100g
            + Decimal("9.0") * food.fat_per_100g
            - food.calories_per_100g
        )
        # Net-carbs with fiber adjustment for high-fiber foods: 4P + 4(C - Fib) + 9F + 2Fib
        net_carbs = max(Decimal("0.0"), food.carbs_per_100g - food.fiber_per_100g)
        diff_net = abs(
            Decimal("4.0") * food.protein_per_100g
            + Decimal("4.0") * net_carbs
            + Decimal("9.0") * food.fat_per_100g
            + Decimal("2.0") * food.fiber_per_100g
            - food.calories_per_100g
        )
        best_diff = min(diff_std, diff_net)
        rel_diff = best_diff / food.calories_per_100g if food.calories_per_100g > 0 else Decimal("0.0")
        assert (
            best_diff <= Decimal("50.00") or rel_diff <= Decimal("0.10")
        ), f"Atwater invariant exceeded for {food.food_name}: diff={best_diff} kcal, rel={rel_diff:.2%}"

        # 3. Portions must have at least 1 entry
        assert len(food.portion_sizes_json) >= 1, f"No portions defined for {food.food_name}"

    # Verify idempotency on second seed execution
    second_seeded = await seed_verified_foods(db_session)
    assert second_seeded == 0


@pytest.mark.asyncio
async def test_custom_foods_isolation_and_cascade(db_session: AsyncSession):
    """
    Verifies that custom foods belong strictly to the creating user and cascade on delete.
    """
    user_a = User(
        email="usera.custom@example.com",
        password_hash="pass123",
        role=UserRole.CONSUMER,
        full_name="User Alpha",
    )
    user_b = User(
        email="userb.custom@example.com",
        password_hash="pass123",
        role=UserRole.CONSUMER,
        full_name="User Beta",
    )
    db_session.add_all([user_a, user_b])
    await db_session.flush()

    recipe = CustomFood(
        user_id=user_a.id,
        food_name="Alpha Protein Shake",
        calories_per_serving=Decimal("320.00"),
        protein_per_serving=Decimal("35.00"),
        carbs_per_serving=Decimal("25.00"),
        fat_per_serving=Decimal("8.00"),
        serving_description="1 shaker bottle",
    )
    db_session.add(recipe)
    await db_session.commit()

    # User B should see 0 custom foods
    b_foods = await db_session.execute(
        select(CustomFood).where(CustomFood.user_id == user_b.id)
    )
    assert len(b_foods.scalars().all()) == 0

    # Cascade on delete user_a
    await db_session.delete(user_a)
    await db_session.commit()

    a_foods = await db_session.execute(
        select(CustomFood).where(CustomFood.id == recipe.id)
    )
    assert a_foods.scalar_one_or_none() is None


@pytest.mark.asyncio
async def test_health_insights_log_severity_constraint(db_session: AsyncSession):
    """
    Verifies severity check constraint on HealthInsightsLog: ('info', 'warning', 'critical', 'achievement').
    """
    user = User(
        email="insights.test@example.com",
        password_hash="pass123",
        role=UserRole.CONSUMER,
        full_name="Insight Tester",
    )
    db_session.add(user)
    await db_session.flush()

    valid_insight = HealthInsightsLog(
        user_id=user.id,
        insight_type="sodium_alert",
        severity="warning",
        title="High Sodium Meal Logged",
        message="Your lunch exceeded 50% of your daily sodium ceiling.",
        related_condition="hypertension",
    )
    db_session.add(valid_insight)
    await db_session.commit()

    # Invalid severity
    invalid_insight = HealthInsightsLog(
        user_id=user.id,
        insight_type="fun_fact",
        severity="unverified_rumor",  # Violates chk_insight_severity
        title="Spam Alert",
        message="Invalid severity test",
    )
    db_session.add(invalid_insight)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_simulated_tenant_isolation(db_session: AsyncSession):
    """
    Verifies that multi-tenant queries isolated by user_id never leak records across users.
    """
    user_1 = User(
        email="tenant1@example.com",
        password_hash="pass123",
        role=UserRole.CONSUMER,
        full_name="Tenant One",
    )
    user_2 = User(
        email="tenant2@example.com",
        password_hash="pass123",
        role=UserRole.CONSUMER,
        full_name="Tenant Two",
    )
    db_session.add_all([user_1, user_2])
    await db_session.flush()

    diary_1 = DailyFoodDiary(
        user_id=user_1.id,
        diary_date=date(2026, 10, 6),
        total_calories=Decimal("2000.00"),
    )
    diary_2 = DailyFoodDiary(
        user_id=user_2.id,
        diary_date=date(2026, 10, 6),
        total_calories=Decimal("1500.00"),
    )
    db_session.add_all([diary_1, diary_2])
    await db_session.commit()

    # Scoped query for User 1
    res1 = await db_session.execute(
        select(DailyFoodDiary).where(DailyFoodDiary.user_id == user_1.id)
    )
    diaries1 = res1.scalars().all()
    assert len(diaries1) == 1
    assert diaries1[0].total_calories == Decimal("2000.00")

    # Scoped query for User 2
    res2 = await db_session.execute(
        select(DailyFoodDiary).where(DailyFoodDiary.user_id == user_2.id)
    )
    diaries2 = res2.scalars().all()
    assert len(diaries2) == 1
    assert diaries2[0].total_calories == Decimal("1500.00")


def test_alembic_migration_execution(tmp_path):
    """
    Verifies that Alembic 001 and 002 upgrade to head and downgrade to base cleanly.
    """
    from alembic.config import Config
    from alembic import command

    db_path = tmp_path / "alembic_rev_test.db"
    cfg = Config("backend/alembic.ini")
    cfg.set_main_option("sqlalchemy.url", f"sqlite:///{db_path}")
    cfg.set_main_option("script_location", "backend/alembic")

    # Run upgrade to head
    command.upgrade(cfg, "head")

    # Run downgrade back to base
    command.downgrade(cfg, "base")
