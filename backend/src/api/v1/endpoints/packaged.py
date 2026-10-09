"""
BiteIQ - REST Endpoints for Packaged Food Scanning, ICMR Profiling & Diary Bridge.
Provides endpoints for dual-panel packaging analysis, ICMR-NIN 2024 profiling,
additive and dye inspection, shelf-life verification, and one-tap diary logging.
"""

from datetime import date, datetime, timezone
from decimal import Decimal
import logging
import re
from typing import Any, Dict, List, Optional
import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ai.src.pipeline.health_agent import MultimodalHealthAgent, MultimodalHealthAnalysis
from backend.src.api.v1.endpoints.diary import recalculate_diary_totals
from backend.src.core.database import get_db_session
from backend.src.core.security import (
    CurrentUser,
    get_current_user,
    get_optional_current_user,
)
from backend.src.models.diary import DailyFoodDiary, MealEntry
from backend.src.models.insight import HealthInsightsLog
from backend.src.models.packaged import PackagedFoodAudit
from backend.src.models.profile import UserMedicalCondition
from backend.src.schemas.packaged import (
    AdditiveAuditItemSchema,
    BadgeItemSchema,
    ClinicalAdvisorySchema,
    ContraindicationAlertSchema,
    LogPackagedToDiaryRequest,
    LogPackagedToDiaryResponse,
    NutrientItemSchema,
    NutrientsPer100gSchema,
    PackagedAuditData,
    PackagedAuditResponse,
    PackagedAuditSummaryResponse,
    PackagedHistoryListResponse,
)
from backend.src.services.clinical_engine import ClinicalContraindicationEngine
from backend.src.services.mass_invariants import MassInvariantValidator

logger = logging.getLogger("biteiq.packaged")

router = APIRouter()

MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB per image limit
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]


def _extract_numeric_decimal(val_str: Optional[str]) -> Optional[Decimal]:
    """Helper to extract clean numeric Decimal from currency or text strings."""
    if not val_str:
        return None
    m = re.search(r"(\d+(?:\.\d+)?)", str(val_str))
    if m:
        try:
            return Decimal(m.group(1))
        except Exception:
            return None
    return None


def _build_flat_nutrients_from_json(nutrients_list: List[Dict[str, Any]]) -> Dict[str, float]:
    """Reconstructs flat per-100g nutrients dictionary from stored nutrients JSON."""
    result = {
        "energy_kcal": 0.0,
        "protein_g": 0.0,
        "total_carbs_g": 0.0,
        "total_sugars_g": 0.0,
        "added_sugars_g": 0.0,
        "total_fat_g": 0.0,
        "saturated_fat_g": 0.0,
        "trans_fat_g": 0.0,
        "sodium_mg": 0.0,
        "dietary_fiber_g": 0.0,
    }
    for n in nutrients_list:
        raw_name = n.get("name") or n.get("nutrient") or ""
        name_lower = str(raw_name).lower().strip()
        val = 0.0
        try:
            v_raw = n.get("value_per_100g") if n.get("value_per_100g") is not None else n.get("valuePer100g")
            m = re.search(r"(\d+(?:\.\d+)?)", str(v_raw))
            val = float(m.group(1)) if m else 0.0
        except Exception:
            val = 0.0

        if "energy" in name_lower or "calorie" in name_lower or "kcal" in name_lower:
            if result["energy_kcal"] == 0.0:
                result["energy_kcal"] = round(val, 1)
        elif "protein" in name_lower:
            if result["protein_g"] == 0.0:
                result["protein_g"] = round(val, 2)
        elif "added sugar" in name_lower:
            result["added_sugars_g"] = round(val, 2)
        elif "total sugar" in name_lower or ("sugar" in name_lower and "added" not in name_lower):
            if result["total_sugars_g"] == 0.0:
                result["total_sugars_g"] = round(val, 2)
        elif "carbohydrate" in name_lower or "carb" in name_lower:
            if result["total_carbs_g"] == 0.0:
                result["total_carbs_g"] = round(val, 2)
        elif "saturated" in name_lower:
            result["saturated_fat_g"] = round(val, 2)
        elif "trans" in name_lower:
            result["trans_fat_g"] = round(val, 2)
        elif "total fat" in name_lower or (name_lower == "fat" or "edible fat" in name_lower):
            if result["total_fat_g"] == 0.0:
                result["total_fat_g"] = round(val, 2)
        elif "sodium" in name_lower:
            u = str(n.get("unit") or "").lower()
            if u == "g" and val < 50.0:
                val = val * 1000.0
            result["sodium_mg"] = round(val, 1)
        elif "fiber" in name_lower or "fibre" in name_lower:
            result["dietary_fiber_g"] = round(val, 2)

    if result["total_sugars_g"] == 0.0 and result["added_sugars_g"] > 0.0:
        result["total_sugars_g"] = result["added_sugars_g"]

    if result["energy_kcal"] == 0.0 and (
        result["protein_g"] > 0 or result["total_carbs_g"] > 0 or result["total_fat_g"] > 0
    ):
        calc_energy = (4.0 * result["protein_g"]) + (4.0 * result["total_carbs_g"]) + (9.0 * result["total_fat_g"])
        result["energy_kcal"] = round(calc_energy, 1)

    return result


def _format_audit_response(
    audit: PackagedFoodAudit,
    user_conditions: Optional[List[str]] = None,
) -> PackagedAuditResponse:
    """Constructs PackagedAuditResponse from DB model."""
    nutrients_per_100g_dict = _build_flat_nutrients_from_json(audit.nutrients_json or [])
    nutrients_per_100g_schema = NutrientsPer100gSchema(**nutrients_per_100g_dict)

    # Format raw nutrient table
    raw_nutrients = []
    for item in audit.nutrients_json or []:
        raw_nutrients.append(
            NutrientItemSchema(
                name=str(item.get("name") or "Nutrient"),
                value_per_100g=float(item.get("value_per_100g") or item.get("valuePer100g") or 0.0),
                value_per_serve=float(item.get("value_per_serve") or item.get("valuePerServe") or 0.0),
                unit=str(item.get("unit") or "g"),
                icmr_daily_limit=item.get("icmr_daily_limit") or item.get("icmrDailyLimit"),
                level=item.get("level") or "Moderate",
                assessment=item.get("assessment"),
            )
        )

    # Format badges
    badges = []
    for b in audit.badges_json or []:
        badges.append(
            BadgeItemSchema(
                id=b.get("id"),
                label=str(b.get("label") or "Health Marker"),
                severity=str(b.get("severity") or b.get("type") or "warning"),
                description=b.get("description"),
            )
        )

    # Format additives
    additives = []
    for a in audit.additives_json or []:
        additives.append(
            AdditiveAuditItemSchema(
                code=a.get("code") or a.get("insCode"),
                name=str(a.get("name") or "Additive"),
                type=a.get("type") or a.get("colorType"),
                grade=str(a.get("grade") or "Grade B (Permitted Synthetic)"),
                advisory=a.get("advisory") or a.get("healthConsequences"),
            )
        )

    # Clinical contraindications
    contraindication_alerts = []
    advisory_data = audit.clinical_advisory_json or {}
    if user_conditions:
        eval_nutrients = {
            "calories": nutrients_per_100g_dict["energy_kcal"],
            "protein_g": nutrients_per_100g_dict["protein_g"],
            "carbs_g": nutrients_per_100g_dict["total_carbs_g"],
            "fat_g": nutrients_per_100g_dict["total_fat_g"],
            "fiber_g": nutrients_per_100g_dict["dietary_fiber_g"],
            "sodium_mg": nutrients_per_100g_dict["sodium_mg"],
            "sugar_g": nutrients_per_100g_dict["added_sugars_g"],
        }
        alerts = ClinicalContraindicationEngine.evaluate_food(
            user_conditions=user_conditions,
            food_name=audit.product_name,
            nutrients=eval_nutrients,
        )
        for al in alerts:
            contraindication_alerts.append(
                ContraindicationAlertSchema(
                    condition=al.condition_key,
                    severity=al.severity,
                    alert=f"{al.title}: {al.message}",
                )
            )
    elif "contraindication_alerts" in advisory_data:
        for ca in advisory_data.get("contraindication_alerts", []):
            contraindication_alerts.append(
                ContraindicationAlertSchema(
                    condition=ca.get("condition", "general"),
                    severity=ca.get("severity", "warning"),
                    alert=ca.get("alert", ""),
                )
            )

    clinical_advisory = ClinicalAdvisorySchema(
        should_we_eat_it=advisory_data.get("should_we_eat_it", "Consume in Moderation"),
        how_bad_is_it=advisory_data.get("how_bad_is_it", "Packaged food commodity."),
        not_eatable_for_age=advisory_data.get("not_eatable_for_age", []),
        who_can_consume=advisory_data.get("who_can_consume", []),
        who_should_avoid=advisory_data.get("who_should_avoid", []),
        health_problems=advisory_data.get("health_problems", []),
        has_palm_oil=bool(advisory_data.get("has_palm_oil", False)),
        palm_oil_details=advisory_data.get("palm_oil_details"),
        has_added_sugar=bool(advisory_data.get("has_added_sugar", False)),
        has_high_sodium=bool(advisory_data.get("has_high_sodium", False)),
        has_artificial_additives=bool(advisory_data.get("has_artificial_additives", False)),
        ingredients_list=advisory_data.get("ingredients_list", []),
        flagged_ingredients=advisory_data.get("flagged_ingredients", []),
    )

    audit_data = PackagedAuditData(
        audit_id=audit.id,
        product_name=audit.product_name,
        brand_name=audit.brand_name,
        category=audit.category,
        health_score=float(audit.health_score),
        score_band=audit.score_band,
        mrp=float(audit.mrp) if audit.mrp else None,
        net_quantity_g=float(audit.net_quantity_g) if audit.net_quantity_g else None,
        price_per_100g=float(audit.price_per_100g) if audit.price_per_100g else None,
        price_rating=advisory_data.get("price_rating", "Fair Market Rate"),
        mfg_date=audit.mfg_date,
        expiry_date=audit.expiry_date,
        is_expired=audit.is_expired,
        nutrients_per_100g=nutrients_per_100g_schema,
        nutrients_raw=raw_nutrients,
        badges=badges,
        additives_audit=additives,
        contraindication_alerts=contraindication_alerts,
        healthier_alternatives=advisory_data.get("healthier_alternatives", []),
        clinical_advisory=clinical_advisory,
        front_image_url=audit.front_image_url,
        back_image_url=audit.back_image_url,
        created_at=audit.created_at,
    )

    return PackagedAuditResponse(
        status="success",
        data=audit_data,
        timestamp=datetime.now(timezone.utc),
    )


@router.post(
    "/analyze",
    response_model=PackagedAuditResponse,
    summary="Analyze Packaged Food Front & Back Packaging Panels",
)
async def analyze_packaged_food(
    front_image: UploadFile = File(..., description="Front packaging panel image"),
    back_image: UploadFile = File(..., description="Back packaging panel image with nutrition & ingredients"),
    product_name_hint: Optional[str] = Form(None, description="Optional product hint"),
    brand_name_hint: Optional[str] = Form(None, description="Optional brand hint"),
    current_user: Optional[CurrentUser] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> PackagedAuditResponse:
    """
    Ingests front and back panel photos of a packaged food product, extracts declared nutrition,
    audits ingredients, additives, palm oil, and shelf-life, benchmarks against ICMR-NIN 2024,
    and cross-checks contraindications against the user's active clinical profile.
    """
    # 1. Image format and content-type validation
    for img, label in [(front_image, "Front image"), (back_image, "Back image")]:
        if img.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{label} has invalid format '{img.content_type}'. Allowed types: JPEG, PNG, WEBP.",
            )

    front_bytes = await front_image.read()
    back_bytes = await back_image.read()

    # 2. Empty file validation
    if len(front_bytes) == 0 or len(back_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded packaging image payload is empty.",
        )

    # 3. Size validation
    if len(front_bytes) > MAX_IMAGE_SIZE_BYTES or len(back_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"Image size exceeds the maximum limit of {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)}MB.",
        )

    # 4. Fetch user's medical conditions if authenticated
    conditions = []
    if current_user:
        cond_stmt = select(UserMedicalCondition).where(UserMedicalCondition.user_id == current_user.id)
        cond_res = await db.execute(cond_stmt)
        conditions = [c.condition_key for c in cond_res.scalars().all()]

    # 5. Invoke Multimodal VLM Pipeline
    agent = MultimodalHealthAgent()
    try:
        analysis: MultimodalHealthAnalysis = await agent.analyze_packaging(
            front_bytes=front_bytes,
            back_bytes=back_bytes,
            product_name_hint=product_name_hint,
            brand_hint=brand_name_hint,
        )
    except Exception as exc:
        logger.error(f"Multimodal packaged analysis failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Packaged food analysis failed: {str(exc)}",
        )

    # 6. Extract normalized nutrients per 100g & validate invariants
    nutrients_per_100g_dict = analysis.to_nutrients_per_100g_dict()
    is_valid, violations = MassInvariantValidator.validate_nutrients({
        "calories": nutrients_per_100g_dict["energy_kcal"],
        "protein_g": nutrients_per_100g_dict["protein_g"],
        "carbs_g": nutrients_per_100g_dict["total_carbs_g"],
        "fat_g": nutrients_per_100g_dict["total_fat_g"],
        "fiber_g": nutrients_per_100g_dict["dietary_fiber_g"],
        "sodium_mg": nutrients_per_100g_dict["sodium_mg"],
        "sugar_g": nutrients_per_100g_dict["added_sugars_g"],
    })
    if not is_valid:
        logger.warning(f"Nutritional invariant warnings on packaged item: {violations}")

    # 7. Check clinical contraindications & log insights if user authenticated
    contraindication_dicts = []
    if current_user and conditions:
        alerts = ClinicalContraindicationEngine.evaluate_food(
            user_conditions=conditions,
            food_name=analysis.commodityName,
            nutrients={
                "calories": nutrients_per_100g_dict["energy_kcal"],
                "protein_g": nutrients_per_100g_dict["protein_g"],
                "carbs_g": nutrients_per_100g_dict["total_carbs_g"],
                "fat_g": nutrients_per_100g_dict["total_fat_g"],
                "fiber_g": nutrients_per_100g_dict["dietary_fiber_g"],
                "sodium_mg": nutrients_per_100g_dict["sodium_mg"],
                "sugar_g": nutrients_per_100g_dict["added_sugars_g"],
            },
        )
        for al in alerts:
            contraindication_dicts.append({
                "condition": al.condition_key,
                "severity": al.severity,
                "alert": f"{al.title}: {al.message}",
            })
            if al.severity in ("warning", "critical"):
                insight = HealthInsightsLog(
                    user_id=current_user.id,
                    insight_type="contraindication",
                    severity=al.severity,
                    title=f"Packaged Food Alert: {al.title}",
                    message=f"{al.message} Scanned product: {analysis.commodityName}.",
                    related_condition=al.condition_key,
                    is_read=False,
                )
                db.add(insight)

    # 8. Persist to packaged_food_audits table
    mrp_dec = _extract_numeric_decimal(analysis.mrp)
    net_qty_dec = _extract_numeric_decimal(analysis.netQuantity)
    usp_dec = _extract_numeric_decimal(analysis.pricePer100g)

    db_nutrients = [
        {
            "name": n.name,
            "value_per_100g": n.valuePer100g,
            "value_per_serve": n.valuePerServe,
            "unit": n.unit,
            "icmr_daily_limit": n.icmrDailyLimit,
            "level": n.level,
            "assessment": n.assessment,
        }
        for n in analysis.nutrients
    ]
    db_badges = [b.model_dump() for b in analysis.badges]
    db_additives = [c.model_dump() for c in analysis.artificialColors]
    db_advisory = {
        "should_we_eat_it": analysis.shouldWeEatIt,
        "how_bad_is_it": analysis.howBadIsIt,
        "not_eatable_for_age": analysis.notEatableForAge,
        "who_can_consume": analysis.whoCanConsume,
        "who_should_avoid": analysis.whoShouldAvoid,
        "health_problems": analysis.healthProblemsIfEatenMore,
        "dietary_summary": analysis.dietarySummary,
        "healthier_alternatives": analysis.healthierAlternatives,
        "has_palm_oil": analysis.hasPalmOil,
        "palm_oil_details": analysis.palmOilDetails,
        "has_added_sugar": analysis.hasAddedSugar,
        "has_high_sodium": analysis.hasHighSodium,
        "has_artificial_additives": analysis.hasArtificialAdditives,
        "ingredients_list": analysis.ingredientsList,
        "flagged_ingredients": analysis.flaggedIngredients,
        "price_rating": analysis.priceRating,
        "contraindication_alerts": contraindication_dicts,
    }

    audit = PackagedFoodAudit(
        user_id=current_user.id if current_user else None,
        product_name=analysis.commodityName,
        brand_name=analysis.brandName,
        category=analysis.category,
        health_score=Decimal(str(analysis.ratingScore)),
        score_band=analysis.overallRating,
        mrp=mrp_dec,
        net_quantity_g=net_qty_dec,
        price_per_100g=usp_dec,
        mfg_date=analysis.mfgDate,
        expiry_date=analysis.expiryDate,
        is_expired=analysis.isExpired,
        nutrients_json=db_nutrients,
        badges_json=db_badges,
        additives_json=db_additives,
        clinical_advisory_json=db_advisory,
        front_image_url=None,
        back_image_url=None,
    )
    db.add(audit)
    await db.commit()
    await db.refresh(audit)

    return _format_audit_response(audit, user_conditions=conditions)


@router.post(
    "/log-to-diary",
    response_model=LogPackagedToDiaryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Bridge Scanned Packaged Food Directly into Daily Diary",
)
async def log_packaged_to_diary(
    payload: LogPackagedToDiaryRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> LogPackagedToDiaryResponse:
    """
    Bridges an audited packaged product into the user's active food diary.
    Scales declared per-100g nutrition by (consumed_grams / 100.0), creates a MealEntry,
    evaluates clinical contraindications, and atomically updates the daily food diary.
    """
    # 1. Fetch the audited packaged food record
    stmt = select(PackagedFoodAudit).where(PackagedFoodAudit.id == payload.audit_id)
    res = await db.execute(stmt)
    audit = res.scalars().first()

    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Packaged food audit with ID '{payload.audit_id}' not found.",
        )

    # 2. Prevent logging expired food or warn strictly
    if audit.is_expired:
        logger.warning(f"User {current_user.id} logged expired food {audit.product_name}.")

    target_date = payload.diary_date or date.today()

    # 3. Find or initialize today's daily food diary
    diary_stmt = select(DailyFoodDiary).where(
        DailyFoodDiary.user_id == current_user.id,
        DailyFoodDiary.diary_date == target_date,
    )
    diary_res = await db.execute(diary_stmt)
    diary = diary_res.scalars().first()

    if not diary:
        diary = DailyFoodDiary(
            user_id=current_user.id,
            diary_date=target_date,
            total_calories=Decimal("0.00"),
            total_protein_g=Decimal("0.00"),
            total_carbs_g=Decimal("0.00"),
            total_fat_g=Decimal("0.00"),
            total_fiber_g=Decimal("0.00"),
            total_sodium_mg=Decimal("0.00"),
            total_sugar_g=Decimal("0.00"),
            total_water_ml=Decimal("0.00"),
            adherence_status="on_track",
        )
        db.add(diary)
        await db.flush()

    # 4. Proportional Scaling calculation
    base_nutrients = _build_flat_nutrients_from_json(audit.nutrients_json or [])
    scale_factor = payload.consumed_grams / 100.0

    logged_cal = round(base_nutrients["energy_kcal"] * scale_factor, 2)
    logged_p = round(base_nutrients["protein_g"] * scale_factor, 2)
    logged_c = round(base_nutrients["total_carbs_g"] * scale_factor, 2)
    logged_f = round(base_nutrients["total_fat_g"] * scale_factor, 2)
    logged_fib = round(base_nutrients["dietary_fiber_g"] * scale_factor, 2)
    logged_na = round(base_nutrients["sodium_mg"] * scale_factor, 2)
    logged_sug = round(base_nutrients["added_sugars_g"] * scale_factor, 2)

    # 5. Evaluate clinical contraindications for logged quantity
    cond_stmt = select(UserMedicalCondition).where(UserMedicalCondition.user_id == current_user.id)
    cond_res = await db.execute(cond_stmt)
    conditions = [c.condition_key for c in cond_res.scalars().all()]

    warnings_created = 0
    if conditions:
        alerts = ClinicalContraindicationEngine.evaluate_food(
            user_conditions=conditions,
            food_name=audit.product_name,
            nutrients={
                "calories": logged_cal,
                "protein_g": logged_p,
                "carbs_g": logged_c,
                "fat_g": logged_f,
                "fiber_g": logged_fib,
                "sodium_mg": logged_na,
                "sugar_g": logged_sug,
            },
        )
        for al in alerts:
            if al.severity in ("warning", "critical"):
                insight = HealthInsightsLog(
                    user_id=current_user.id,
                    insight_type="contraindication",
                    severity=al.severity,
                    title=f"Packaged Food Diary Warning: {al.title}",
                    message=f"{al.message} Portion: {payload.consumed_grams}g of {audit.product_name}.",
                    related_condition=al.condition_key,
                    is_read=False,
                )
                db.add(insight)
                warnings_created += 1

    # 6. Create MealEntry record
    serving_unit_str = payload.serving_unit or f"{payload.consumed_grams}g"
    entry = MealEntry(
        diary_id=diary.id,
        meal_type=payload.meal_type.lower(),
        food_name=audit.product_name,
        source_type="packaged_scan",
        packaged_audit_id=audit.id,
        serving_quantity=Decimal("1.00"),
        serving_unit=serving_unit_str,
        weight_in_grams=Decimal(str(payload.consumed_grams)),
        calories=Decimal(str(logged_cal)),
        protein_g=Decimal(str(logged_p)),
        carbs_g=Decimal(str(logged_c)),
        fat_g=Decimal(str(logged_f)),
        fiber_g=Decimal(str(logged_fib)),
        sodium_mg=Decimal(str(logged_na)),
        sugar_g=Decimal(str(logged_sug)),
        metadata_json={
            "packaged_audit_id": str(audit.id),
            "brand_name": audit.brand_name,
            "health_score": float(audit.health_score),
            "score_band": audit.score_band,
            "is_expired": audit.is_expired,
        },
    )
    db.add(entry)
    await db.flush()

    # 7. Recalculate daily diary totals atomically
    await recalculate_diary_totals(diary.id, db)

    await db.commit()
    await db.refresh(entry)
    await db.refresh(diary)

    return LogPackagedToDiaryResponse(
        status="success",
        meal_entry_id=entry.id,
        diary_id=diary.id,
        diary_date=diary.diary_date,
        meal_type=entry.meal_type,
        food_name=entry.food_name,
        consumed_grams=float(entry.weight_in_grams),
        calories_logged=float(entry.calories),
        protein_logged=float(entry.protein_g),
        carbs_logged=float(entry.carbs_g),
        fat_logged=float(entry.fat_g),
        fiber_logged=float(entry.fiber_g),
        sodium_logged=float(entry.sodium_mg),
        sugar_logged=float(entry.sugar_g),
        contraindications_logged=warnings_created,
    )


@router.get(
    "/history",
    response_model=PackagedHistoryListResponse,
    summary="Get User's Packaged Food Scan Audit History",
)
async def get_packaged_history(
    skip: int = Query(0, ge=0, description="Pagination skip offset"),
    limit: int = Query(20, ge=1, le=100, description="Pagination limit"),
    search: Optional[str] = Query(None, description="Fuzzy search filter on product or brand name"),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> PackagedHistoryListResponse:
    """Retrieves paginated scan history of packaged foods audited by the authenticated user."""
    base_conditions = [PackagedFoodAudit.user_id == current_user.id]

    if search and search.strip():
        term = f"%{search.strip()}%"
        base_conditions.append(
            or_(
                PackagedFoodAudit.product_name.ilike(term),
                PackagedFoodAudit.brand_name.ilike(term),
            )
        )

    # Count total
    count_stmt = select(func.count(PackagedFoodAudit.id)).where(*base_conditions)
    count_res = await db.execute(count_stmt)
    total_count = count_res.scalar_one()

    # Query items
    stmt = (
        select(PackagedFoodAudit)
        .where(*base_conditions)
        .order_by(PackagedFoodAudit.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    res = await db.execute(stmt)
    audits = res.scalars().all()

    items = [
        PackagedAuditSummaryResponse(
            id=a.id,
            product_name=a.product_name,
            brand_name=a.brand_name,
            category=a.category,
            health_score=float(a.health_score),
            score_band=a.score_band,
            mrp=float(a.mrp) if a.mrp else None,
            is_expired=a.is_expired,
            created_at=a.created_at,
        )
        for a in audits
    ]

    return PackagedHistoryListResponse(
        status="success",
        items=items,
        total=total_count,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{audit_id}",
    response_model=PackagedAuditResponse,
    summary="Get Detailed Packaged Food Audit by ID",
)
async def get_packaged_audit_by_id(
    audit_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> PackagedAuditResponse:
    """Retrieves full audit breakdown for a specific packaged food scan by ID."""
    stmt = select(PackagedFoodAudit).where(PackagedFoodAudit.id == audit_id)
    res = await db.execute(stmt)
    audit = res.scalars().first()

    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Packaged food audit '{audit_id}' not found.",
        )

    if audit.user_id is not None and audit.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Packaged food audit '{audit_id}' not found.",
        )

    # Fetch conditions
    cond_stmt = select(UserMedicalCondition).where(UserMedicalCondition.user_id == current_user.id)
    cond_res = await db.execute(cond_stmt)
    conditions = [c.condition_key for c in cond_res.scalars().all()]

    return _format_audit_response(audit, user_conditions=conditions)


@router.delete(
    "/{audit_id}",
    summary="Delete Packaged Food Audit Record",
)
async def delete_packaged_audit(
    audit_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Deletes an audit from the user's scan history. Linked meal entries retain NULL reference."""
    stmt = select(PackagedFoodAudit).where(
        PackagedFoodAudit.id == audit_id,
        PackagedFoodAudit.user_id == current_user.id,
    )
    res = await db.execute(stmt)
    audit = res.scalars().first()

    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Packaged food audit '{audit_id}' not found or unauthorized.",
        )

    await db.delete(audit)
    await db.commit()

    return {
        "status": "success",
        "message": "Packaged food audit deleted successfully.",
    }
