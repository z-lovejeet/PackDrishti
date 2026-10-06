import logging
import uuid
from decimal import Decimal
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from backend.src.core.config import settings
from backend.src.core.database import get_db_session
from backend.src.core.security import get_optional_current_user, CurrentUser
from backend.src.models.health import HealthAudit, ScanHistory

logger = logging.getLogger("biteiq.health")

router = APIRouter()


@router.get("", summary="Subsystem Health Check")
async def health_check():
    """
    Returns detailed health and operational readiness status of the BiteIQ API service.
    """
    return {
        "status": "ok",
        "version": settings.VERSION,
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "subsystems": {
            "database": "supabase_postgresql",
            "auth": "supabase_auth",
            "cache": "in_memory_async_lru",
            "llm_primary_chain": " -> ".join(settings.GEMINI_FALLBACK_CHAIN),
            "llm_secondary_chain": " -> ".join(settings.GROQ_FALLBACK_CHAIN),
            "storage": settings.STORAGE_PROVIDER,
        },
    }


@router.post("/analyze", summary="Analyze Packaged Food for Nutrition, Ingredients & Health")
async def analyze_health_packaging(
    front_image: UploadFile = File(..., description="Front packaging panel image"),
    back_image: UploadFile = File(..., description="Back packaging panel image with nutrition & ingredients"),
    product_name: Optional[str] = Form(None),
    brand: Optional[str] = Form(None),
    serving_size_g: Optional[float] = Form(None),
    user_profile: Optional[str] = Form("standard"),
    is_liquid: Optional[bool] = Form(False),
    user_role: Optional[str] = Form("consumer"),
    db: AsyncSession = Depends(get_db_session),
    current_user: Optional[CurrentUser] = Depends(get_optional_current_user),
):
    """
    Ingests front and back panel images of a packaged food product, extracts nutrition facts & ingredients,
    benchmarks values against ICMR-NIN 2024 and WHO thresholds, audits additives and artificial colors,
    and returns consumer health scores, warnings, and healthier alternatives.
    """
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    for img, label in [(front_image, "Front image"), (back_image, "Back image")]:
        if img.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{label} has invalid format '{img.content_type}'. Allowed types: JPEG, PNG, WEBP."
            )

    front_bytes = await front_image.read()
    back_bytes = await back_image.read()

    if len(front_bytes) == 0 or len(back_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image payload is empty."
        )

    from ai.src.pipeline.health_agent import MultimodalHealthAgent
    agent = MultimodalHealthAgent()

    sanitized_product_hint = None
    if product_name and product_name.strip():
        pn = product_name.strip()
        is_filename = any(ext in pn.lower() for ext in [".jpg", ".jpeg", ".png", ".webp", "media_", "screenshot", "img_"])
        is_placeholder = any(ph in pn.lower() for ph in ["packaged commodity", "packaged food", "front label", "placeholder", "dummy"])
        if not is_filename and not is_placeholder:
            sanitized_product_hint = pn

    sanitized_brand_hint = None
    if brand and brand.strip():
        b = brand.strip()
        is_placeholder = any(ph in b.lower() for ph in ["packaged foods ltd", "packaged goods", "commercial brand", "placeholder", "dummy", "brand name"])
        if not is_placeholder:
            sanitized_brand_hint = b

    analysis = await agent.analyze_packaging(
        front_bytes=front_bytes,
        back_bytes=back_bytes,
        product_name_hint=sanitized_product_hint,
        brand_hint=sanitized_brand_hint,
    )

    resolved_product = analysis.commodityName
    resolved_brand = analysis.brandName

    db_badges = [b.model_dump() for b in analysis.badges]
    db_nutrients = [
        {
            "name": n.name,
            "value_per_100g": n.valuePer100g,
            "value_per_serve": n.valuePerServe,
            "unit": n.unit,
            "level": n.level,
            "assessment": n.assessment,
            "icmr_daily_limit": n.icmrDailyLimit,
        }
        for n in analysis.nutrients
    ]
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
        "flagged_ingredients": analysis.flaggedIngredients,
        "artificial_colors": [c.model_dump() for c in analysis.artificialColors],
        "what_is_high": [w.model_dump() for w in analysis.whatIsHigh],
        "mfg_date": analysis.mfgDate,
        "expiry_date": analysis.expiryDate,
        "is_expired": analysis.isExpired,
        "expiry_status": analysis.expiryStatus,
        "expiry_warning": analysis.expiryWarning,
    }

    audit_uuid = uuid.uuid4()
    try:
        effective_role = (user_role or "consumer").lower().strip()
        audit_record = HealthAudit(
            id=audit_uuid,
            user_id=current_user.id if current_user else None,
            product_name=resolved_product,
            brand=resolved_brand,
            front_image_url=f"/uploads/{front_image.filename}",
            back_image_url=f"/uploads/{back_image.filename}",
            health_score=Decimal(str(analysis.ratingScore)),
            nutrients_json=db_nutrients,
            badges_json=db_badges,
            dietary_advisory_json=db_advisory,
            mfg_date=analysis.mfgDate,
            expiry_date=analysis.expiryDate,
            is_expired=analysis.isExpired,
            user_role=effective_role,
        )
        db.add(audit_record)

        history_record = ScanHistory(
            id=uuid.uuid4(),
            user_id=current_user.id if current_user else None,
            health_audit_id=audit_uuid,
            scan_type="health_check",
            user_role=effective_role,
        )
        db.add(history_record)
        await db.commit()
    except Exception as db_err:
        logger.warning("Database persistence notice in health audit (returning analysis without DB write): %s", db_err)
        try:
            await db.rollback()
        except Exception:
            pass

    return {
        "status": "success",
        "data": {
            "audit_id": str(audit_uuid),
            "product_name": resolved_product,
            "brand": resolved_brand,
            "commodity_name": resolved_product,
            "brand_name": resolved_brand,
            "category": analysis.category,
            "serving_size": analysis.servingSize,
            "net_quantity": analysis.netQuantity,
            "mrp": analysis.mrp,
            "price_per_100g": analysis.pricePer100g,
            "price_rating": analysis.priceRating,
            "price_analysis": analysis.priceAnalysis,
            "mfg_date": analysis.mfgDate,
            "expiry_date": analysis.expiryDate,
            "is_expired": analysis.isExpired,
            "expiry_status": analysis.expiryStatus,
            "expiry_warning": analysis.expiryWarning,
            "health_score": analysis.ratingScore,
            "score_band": analysis.overallRating,
            "overall_rating": analysis.overallRating,
            "rating_score": analysis.ratingScore,
            "should_we_eat_it": analysis.shouldWeEatIt,
            "how_bad_is_it": analysis.howBadIsIt,
            "not_eatable_for_age": analysis.notEatableForAge,
            "who_can_consume": analysis.whoCanConsume,
            "who_should_avoid": analysis.whoShouldAvoid,
            "health_problems_if_eaten_more": analysis.healthProblemsIfEatenMore,
            "dietary_summary": analysis.dietarySummary,
            "badges": [b.model_dump() for b in analysis.badges],
            "has_palm_oil": analysis.hasPalmOil,
            "palm_oil_details": analysis.palmOilDetails,
            "has_added_sugar": analysis.hasAddedSugar,
            "added_sugar_details": analysis.addedSugarDetails,
            "has_high_sodium": analysis.hasHighSodium,
            "has_artificial_additives": analysis.hasArtificialAdditives,
            "ingredients_list": analysis.ingredientsList,
            "flagged_ingredients": analysis.flaggedIngredients,
            "artificial_colors": [c.model_dump() for c in analysis.artificialColors],
            "what_is_high": [w.model_dump() for w in analysis.whatIsHigh],
            "nutrients": [n.model_dump() for n in analysis.nutrients],
            "healthier_alternatives": analysis.healthierAlternatives,
            "dietary_advisory": db_advisory,
        }
    }


@router.get("/history", summary="Retrieve Consumer Health Scan History")
async def get_health_scan_history(
    limit: int = 50,
    db: AsyncSession = Depends(get_db_session),
    current_user: Optional[CurrentUser] = Depends(get_optional_current_user),
):
    """
    Retrieves recent consumer product health audits.
    """
    items = []
    try:
        stmt = select(HealthAudit).order_by(HealthAudit.created_at.desc()).limit(limit)
        result = await db.execute(stmt)
        audits = result.scalars().all()

        for a in audits:
            score_val = float(a.health_score) if a.health_score is not None else 50.0
            is_exp = bool(getattr(a, "is_expired", False))
            status_val = "expired" if is_exp else ("healthy" if score_val >= 70 else ("caution" if score_val >= 40 else "unhealthy"))

            items.append({
                "id": str(a.id),
                "scan_id": str(a.id),
                "scan_code": f"HLTH-{str(a.id)[:8].upper()}",
                "scan_type": "consumer_health",
                "brand_name": a.brand,
                "product_name": a.product_name,
                "category": "Packaged Food",
                "mrp": 0.0,
                "mfg_date": getattr(a, "mfg_date", None),
                "expiry_date": getattr(a, "expiry_date", None),
                "is_expired": is_exp,
                "expiry_status": "expired" if is_exp else "valid",
                "status": status_val,
                "overall_score": score_val,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "image_url": a.front_image_url,
                "badges": a.badges_json or [],
                "nutrients": a.nutrients_json or [],
                "dietary_advisory": a.dietary_advisory_json or {},
            })
    except Exception as db_err:
        logger.warning("Database query notice in health history: %s", db_err)

    return items


@router.delete("/history", summary="Clear All Consumer Health History")
async def clear_all_health_history(
    db: AsyncSession = Depends(get_db_session),
    current_user: Optional[CurrentUser] = Depends(get_optional_current_user),
):
    """
    Clears all consumer health audit and scan history records.
    """
    try:
        await db.execute(delete(ScanHistory))
        await db.execute(delete(HealthAudit))
        await db.commit()
    except Exception as e:
        logger.warning("Error clearing health history: %s", e)
        try:
            await db.rollback()
        except Exception:
            pass
    return {"status": "cleared", "message": "All scan history records have been removed."}


@router.get("/{audit_id}", summary="Retrieve Health Audit Record by ID")
async def get_health_audit_by_id(
    audit_id: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: Optional[CurrentUser] = Depends(get_optional_current_user),
):
    """
    Retrieves a complete health and nutrition audit record by unique audit identifier.
    """
    try:
        audit_uuid = uuid.UUID(audit_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid health audit UUID format."
        )

    result = await db.execute(select(HealthAudit).where(HealthAudit.id == audit_uuid))
    audit = result.scalar_one_or_none()

    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specified health audit identifier not found."
        )

    return {
        "status": "success",
        "data": {
            "audit_id": str(audit.id),
            "product_name": audit.product_name,
            "brand": audit.brand,
            "health_score": float(audit.health_score),
            "front_image_url": audit.front_image_url,
            "back_image_url": audit.back_image_url,
            "nutrients": audit.nutrients_json,
            "badges": audit.badges_json,
            "dietary_advisory": audit.dietary_advisory_json,
            "created_at": audit.created_at.isoformat() if audit.created_at else None,
        }
    }


@router.delete("/{audit_id}", summary="Delete Health Audit Record by ID")
async def delete_health_audit_by_id(
    audit_id: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: Optional[CurrentUser] = Depends(get_optional_current_user),
):
    """
    Deletes a specific health audit record and its associated history entry.
    """
    try:
        audit_uuid = uuid.UUID(audit_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid health audit UUID format."
        )

    try:
        await db.execute(delete(ScanHistory).where(ScanHistory.health_audit_id == audit_uuid))
        await db.execute(delete(HealthAudit).where(HealthAudit.id == audit_uuid))
        await db.commit()
    except Exception as e:
        logger.warning("Error deleting health audit %s: %s", audit_id, e)
        try:
            await db.rollback()
        except Exception:
            pass

    return {"status": "deleted", "audit_id": audit_id}
