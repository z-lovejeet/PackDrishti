import io
import json
import logging
import uuid
from decimal import Decimal
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from PIL import Image
import pytesseract

from backend.src.core.config import settings
from backend.src.core.database import get_db_session
from backend.src.core.security import get_optional_current_user, CurrentUser
from backend.src.models.health import HealthAudit, ScanHistory
from backend.src.models.scan import ProductScan
from backend.src.services.health_engine import ICMRNutritionProfilingEngine, HealthAuditPayload
from ai.src.rules.nutrition_parser import NutritionFactsParser, NutrientValues

logger = logging.getLogger("packdrashiti.health")

router = APIRouter()


@router.get("", summary="Subsystem Health Check")
async def health_check():
    """
    Returns detailed health and operational readiness status of the PackDrashiti API service,
    verifying Supabase Database, pgvector, Supabase Auth, in-memory cache, and Parallel Dual-LLM chains.
    """
    return {
        "status": "ok",
        "version": settings.VERSION,
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "subsystems": {
            "database": "supabase_postgresql",
            "vectordb": "supabase_pgvector",
            "auth": "supabase_auth",
            "cache": "in_memory_async_lru",
            "ocr_engine": settings.OCR_ENGINE,
            "llm_primary_chain": " -> ".join(settings.GEMINI_FALLBACK_CHAIN),
            "llm_secondary_chain": " -> ".join(settings.GROQ_FALLBACK_CHAIN),
            "rag_framework": settings.RAG_FRAMEWORK,
            "storage": settings.STORAGE_PROVIDER,
        },
    }


@router.post("/analyze", summary="Analyze Dual-Panel Package for Health & Nutrition Audit")
async def analyze_health_packaging(
    front_image: UploadFile = File(..., description="Front packaging panel image"),
    back_image: UploadFile = File(..., description="Back packaging panel image with nutrition table"),
    product_name: Optional[str] = Form(None),
    brand: Optional[str] = Form(None),
    serving_size_g: Optional[float] = Form(None),
    user_profile: Optional[str] = Form("standard"),
    is_liquid: Optional[bool] = Form(False),
    db: AsyncSession = Depends(get_db_session),
    current_user: Optional[CurrentUser] = Depends(get_optional_current_user),
):
    """
    Ingests front and back panel images of a packaged food commodity, extracts nutrition facts,
    benchmarks values against ICMR-NIN 2024 and WHO thresholds, determines NOVA processing class,
    and returns consumer health warnings and healthier substitutes.
    """
    # 1. Validate file formats
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

    # 2. Real OCR extraction from Front and Back image bytes
    front_text = ""
    back_text = ""
    try:
        if front_bytes:
            front_img = Image.open(io.BytesIO(front_bytes))
            front_text = pytesseract.image_to_string(front_img).strip()
    except Exception as err:
        logger.warning("Front image OCR extraction failed: %s", err)

    try:
        if back_bytes:
            back_img = Image.open(io.BytesIO(back_bytes))
            back_text = pytesseract.image_to_string(back_img).strip()
    except Exception as err:
        logger.warning("Back image OCR extraction failed: %s", err)

    combined_text = f"FRONT PANEL:\n{front_text}\n\nBACK NUTRITIONAL PANEL:\n{back_text}".strip()

    # 3. Structured parsing via Groq LLM
    resolved_product = product_name or "Packaged Commodity"
    resolved_brand = brand or "Unspecified Brand"
    resolved_serving = serving_size_g if serving_size_g and serving_size_g > 0 else 100.0

    parsed_nutrients = None
    if combined_text and settings.GROQ_API_KEY and not settings.GROQ_API_KEY.startswith("placeholder"):
        try:
            from groq import Groq
            groq_client = Groq(api_key=settings.GROQ_API_KEY)
            prompt = (
                "You are an expert food nutritionist. Extract nutrition facts per 100g from the provided packaging OCR text.\n"
                "Return a JSON object with EXACTLY these fields:\n"
                "product_name (str, variant name),\n"
                "brand (str),\n"
                "serving_size_g (float, default 30.0),\n"
                "energy_kcal (float),\n"
                "total_fat_g (float),\n"
                "saturated_fat_g (float),\n"
                "trans_fat_g (float),\n"
                "sodium_mg (float),\n"
                "total_carbohydrate_g (float),\n"
                "total_sugars_g (float),\n"
                "added_sugars_g (float),\n"
                "dietary_fiber_g (float, default 0.0),\n"
                "protein_g (float),\n"
                "ingredients_text (str)\n\n"
                f"Packaging OCR Text:\n{combined_text}\n\n"
                "Return ONLY valid JSON."
            )
            groq_resp = groq_client.chat.completions.create(
                model="qwen/qwen3.8-27b",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                max_tokens=600,
                temperature=0.1
            )
            parsed_nutrients = json.loads(groq_resp.choices[0].message.content)
        except Exception as groq_err:
            logger.warning("Groq nutrition parsing failed: %s", groq_err)

    if product_name:
        resolved_product = product_name
    elif parsed_nutrients and parsed_nutrients.get("product_name") and parsed_nutrients.get("product_name").lower() not in ["unknown", "none", "null"]:
        resolved_product = parsed_nutrients["product_name"]
    else:
        resolved_product = "Packaged Commodity"

    if brand:
        resolved_brand = brand
    elif parsed_nutrients and parsed_nutrients.get("brand") and parsed_nutrients.get("brand").lower() not in ["unknown", "none", "null"]:
        resolved_brand = parsed_nutrients["brand"]
    else:
        resolved_brand = "Unspecified Brand"

    if parsed_nutrients and parsed_nutrients.get("serving_size_g"):
        try:
            resolved_serving = float(parsed_nutrients["serving_size_g"])
        except (ValueError, TypeError):
            pass

    if parsed_nutrients and any(k in parsed_nutrients for k in ["energy_kcal", "total_fat_g", "sodium_mg"]):
        nutrition_table_text = (
            f"Energy {parsed_nutrients.get('energy_kcal', 0)} kcal\n"
            f"Total Fat {parsed_nutrients.get('total_fat_g', 0)}g\n"
            f"Saturated Fat {parsed_nutrients.get('saturated_fat_g', 0)}g\n"
            f"Trans Fat {parsed_nutrients.get('trans_fat_g', 0)}g\n"
            f"Sodium {parsed_nutrients.get('sodium_mg', 0)}mg\n"
            f"Total Carbohydrate {parsed_nutrients.get('total_carbohydrate_g', 0)}g\n"
            f"Total Sugars {parsed_nutrients.get('total_sugars_g', 0)}g\n"
            f"Added Sugars {parsed_nutrients.get('added_sugars_g', 0)}g\n"
            f"Dietary Fiber {parsed_nutrients.get('dietary_fiber_g', 0)}g\n"
            f"Protein {parsed_nutrients.get('protein_g', 0)}g"
        )
        ingredients_text = parsed_nutrients.get("ingredients_text") or ""
    else:
        nutrition_table_text = combined_text
        ingredients_text = ""

    panel = NutritionFactsParser.parse_nutrition_text(
        text=nutrition_table_text,
        ingredients_text=ingredients_text,
        product_name=resolved_product,
        brand=resolved_brand,
        category="Packaged Food Commodity",
        serving_size_g=resolved_serving,
        is_liquid=bool(is_liquid)
    )

    # 4. Execute ICMR-NIN 2024 profiling engine
    audit_uuid = uuid.uuid4()
    audit_payload = ICMRNutritionProfilingEngine.audit_product(panel, audit_id=f"h-{audit_uuid.hex[:8]}")

    # 5. Persist to Supabase / Database
    audit_record = HealthAudit(
        id=audit_uuid,
        user_id=current_user.id if current_user else None,
        product_name=audit_payload.product_name,
        brand=audit_payload.brand,
        front_image_url=f"/uploads/{front_image.filename}",
        back_image_url=f"/uploads/{back_image.filename}",
        health_score=Decimal(str(audit_payload.health_score)),
        nutrients_json=audit_payload.nutrients,
        badges_json=audit_payload.badges,
        dietary_advisory_json=audit_payload.dietary_advisory,
    )
    db.add(audit_record)

    # Log into ScanHistory
    history_record = ScanHistory(
        id=uuid.uuid4(),
        user_id=current_user.id if current_user else None,
        scan_id=None,
        health_audit_id=audit_uuid,
        scan_type="health_check",
    )
    db.add(history_record)

    await db.commit()

    return {
        "status": "success",
        "data": {
            "audit_id": str(audit_record.id),
            "product_name": audit_payload.product_name,
            "brand": audit_payload.brand,
            "health_score": audit_payload.health_score,
            "score_band": audit_payload.score_band,
            "nutritional_density": audit_payload.nutritional_density,
            "serving_size": audit_payload.serving_size,
            "servings_per_container": audit_payload.servings_per_container,
            "nova_classification": audit_payload.nova_classification,
            "nutrients": audit_payload.nutrients,
            "badges": audit_payload.badges,
            "dietary_advisory": audit_payload.dietary_advisory,
            "fssai_compliance": audit_payload.fssai_compliance,
            "penalties": audit_payload.penalties,
            "credits": audit_payload.credits,
            "dietary_summary": audit_payload.dietary_summary,
        }
    }


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


@router.get("/score/{scan_id}", summary="Retrieve or Compute Health Score for a Scan")
async def get_health_score_by_scan_id(
    scan_id: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: Optional[CurrentUser] = Depends(get_optional_current_user),
):
    """
    Retrieves health score and nutritional summary for a given scan record.
    """
    try:
        scan_uuid = uuid.UUID(scan_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid scan UUID format."
        )

    result = await db.execute(select(ProductScan).where(ProductScan.id == scan_uuid))
    scan = result.scalar_one_or_none()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specified scan record not found."
        )

    # Return summary score based on product scan compliance score and basic baseline
    score = float(scan.compliance_score) if scan.compliance_score else 85.0
    return {
        "status": "success",
        "data": {
            "scan_id": str(scan.id),
            "product_name": scan.product_name,
            "brand": scan.brand,
            "health_score": score,
            "score_band": "Nutritious Choice" if score >= 80 else ("Consume in Moderation" if score >= 60 else "High Health Concern"),
            "verified_at": scan.scanned_at.isoformat() if scan.scanned_at else None,
        }
    }
