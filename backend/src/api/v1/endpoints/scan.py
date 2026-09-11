import os
import re
import uuid
import hashlib
import time
import logging
from decimal import Decimal
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from backend.src.core.config import settings
from backend.src.core.database import get_db_session
from backend.src.core.security import get_optional_current_user, CurrentUser
from backend.src.models.scan import ProductScan, ExtractedDeclaration, ComplianceStatus
from backend.src.models.health import HealthAudit, ScanHistory
from backend.src.models.violation import StatutoryViolation, ViolationSeverity
from ai.src.pipeline.langgraph_workflow import run_packaging_scan_workflow

logger = logging.getLogger(__name__)

router = APIRouter()


class UploadScanResponse(BaseModel):
    scan_id: str
    file_url: str
    file_hash: str
    file_size_bytes: int
    message: str


class ScanAnalysisResponse(BaseModel):
    scan_id: str
    brand_name: Optional[str]
    product_name: Optional[str]
    category: Optional[str]
    mrp: Optional[float]
    net_quantity_value: Optional[float]
    net_quantity_unit: Optional[str]
    mfg_date: Optional[str] = None
    expiry_date: Optional[str] = None
    is_expired: bool = False
    expiry_status: str = "valid"
    expiry_details: Optional[str] = None
    is_compliant: bool
    compliance_score: float
    pdp_area_cm2: float
    calculated_usp: Optional[float]
    calculated_usp_unit: Optional[str]
    violations: List[Dict[str, Any]]
    tokens: List[Dict[str, Any]]
    consumer_advisory: str
    form_lm_insp_2011_notice_draft: Optional[str]
    execution_time_ms: float


@router.post("/upload", response_model=UploadScanResponse, summary="Upload packaging label image")
async def upload_scan_image(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db_session),
    current_user: Optional[CurrentUser] = Depends(get_optional_current_user),
):
    """
    Ingests packaging photograph for analysis.
    Validates image format and calculates SHA-256 evidence hash.
    """
    allowed_content_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image type: {file.content_type}. Permitted: JPEG, PNG, WEBP.",
        )

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum permitted limit of 10MB.",
        )

    # Compute SHA-256 tamper-evident hash
    file_hash = hashlib.sha256(content).hexdigest()
    scan_id = uuid.uuid4()
    scan_code = f"SCAN-{scan_id.hex[:8].upper()}"

    # Save to storage directory
    os.makedirs(settings.STORAGE_LOCAL_DIR, exist_ok=True)
    filename = f"{scan_id}_{file.filename or 'label.jpg'}"
    file_path = os.path.join(settings.STORAGE_LOCAL_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(content)

    file_url = f"/static/uploads/{filename}"

    # Create ProductScan database record with graceful fallback
    user_uuid = current_user.id if (current_user and isinstance(current_user.id, uuid.UUID)) else (
        uuid.UUID(current_user.id) if current_user and current_user.id else None
    )

    try:
        scan_record = ProductScan(
            id=scan_id,
            scan_code=scan_code,
            user_id=user_uuid,
            product_name="Uploaded Label Pending Analysis",
            brand="Unspecified Brand",
            category="Packaged Goods",
            pdp_area_cm2=Decimal("150.00"),
            net_quantity="Pending",
            mrp="Pending",
            mfg_date="Pending",
            overall_status=ComplianceStatus.PENDING,
            compliance_score=Decimal("0.00"),
            image_url=file_url,
        )
        db.add(scan_record)
        await db.commit()
    except Exception as db_err:
        logger.warning("Database insert failed during upload (continuing without DB write): %s", db_err)
        try:
            await db.rollback()
        except Exception:
            pass

    return UploadScanResponse(
        scan_id=str(scan_id),
        file_url=file_url,
        file_hash=file_hash,
        file_size_bytes=len(content),
        message="Image ingested successfully for compliance verification.",
    )


@router.post("/analyze", response_model=ScanAnalysisResponse, summary="Analyze packaging compliance")
async def analyze_packaging_compliance(
    scan_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    back_file: Optional[UploadFile] = File(None),
    files: Optional[List[UploadFile]] = File(None),
    user_role: Optional[str] = Form("consumer"),
    db: AsyncSession = Depends(get_db_session),
    current_user: Optional[CurrentUser] = Depends(get_optional_current_user),
):
    """
    Executes the 4-Tier LangGraph Stateful Workflow:
    Tier 1: Multimodal Visual Perception (Supports Front + Back Dual Panel Analysis)
    Tier 2: Deterministic Python Rule Engine (Zero Hallucination Legal Math)
    Tier 3: Statutory RAG (Supabase pgvector)
    Tier 4: Parallel Dual-LLM Consensus Synthesis
    """
    start_time = time.perf_counter()
    image_bytes_list: List[bytes] = []
    target_scan_id = None
    filename = ""

    # Check for multiple files uploaded under 'files'
    if files:
        for f in files:
            b = await f.read()
            if b:
                image_bytes_list.append(b)
        filename = files[0].filename or "upload_multi.jpg"
        target_scan_id = uuid.uuid4()

    # Check for primary front 'file'
    if file:
        f_bytes = await file.read()
        if f_bytes:
            image_bytes_list.append(f_bytes)
        filename = file.filename or "upload_front.jpg"
        if not target_scan_id:
            target_scan_id = uuid.uuid4()

    # Check for secondary back 'back_file'
    if back_file:
        b_bytes = await back_file.read()
        if b_bytes:
            image_bytes_list.append(b_bytes)

    if not image_bytes_list and scan_id:
        target_scan_id = uuid.UUID(scan_id)
        # Look up scan record
        result = await db.execute(select(ProductScan).where(ProductScan.id == target_scan_id))
        scan_row = result.scalar_one_or_none()
        if not scan_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scan record {scan_id} not found.",
            )
        # Read from storage
        local_filename = os.path.basename(scan_row.image_url)
        local_path = os.path.join(settings.STORAGE_LOCAL_DIR, local_filename)
        if os.path.exists(local_path):
            with open(local_path, "rb") as f:
                image_bytes_list.append(f.read())
        else:
            image_bytes_list.append(b"Fallback Synthetic Packaging Image")
        filename = local_filename
    elif not image_bytes_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'file', 'back_file', 'files', or 'scan_id' must be provided.",
        )

    # Pass either list of bytes or single bytes buffer
    payload_input: Any = image_bytes_list if len(image_bytes_list) > 1 else image_bytes_list[0]

    # Execute LangGraph Workflow
    final_state = await run_packaging_scan_workflow(
        image_bytes=payload_input,
        filename=filename,
        scan_id=str(target_scan_id),
    )


    if final_state.get("error"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Workflow execution failed: {final_state['error']}",
        )

    extraction = final_state["extraction"]
    evaluation = final_state["evaluation"]
    consensus = final_state["consensus"]

    user_uuid = current_user.id if (current_user and isinstance(current_user.id, uuid.UUID)) else (
        uuid.UUID(current_user.id) if current_user and current_user.id else None
    )

    brand_val = extraction.brand_name if (extraction and extraction.brand_name) else "Unspecified Brand"
    prod_val = extraction.product_name if (extraction and extraction.product_name) else "Unidentified Product"
    cat_val = extraction.category if (extraction and extraction.category) else "Packaged Goods"
    pdp_area_dec = Decimal(f"{(evaluation.pdp_area_cm2 if evaluation else 150.0):.2f}")
    score_dec = Decimal(f"{(evaluation.compliance_score if evaluation else 0.0):.2f}")
    net_qty_str = (
        f"{extraction.net_quantity_value} {extraction.net_quantity_unit}"
        if (extraction and extraction.net_quantity_value is not None and extraction.net_quantity_unit)
        else "Not Declared"
    )
    mrp_str = f"Rs. {extraction.mrp:.2f}" if (extraction and extraction.mrp is not None) else "Not Declared"
    mfg_str = getattr(extraction, "mfg_date_str", None) or (
        f"{extraction.mfg_month:02d}/{extraction.mfg_year}"
        if (extraction and extraction.mfg_month and extraction.mfg_year)
        else "Not Declared"
    )
    exp_str = getattr(extraction, "expiry_date_str", None) or (
        getattr(extraction, "expiry_date", None)
        if extraction
        else None
    ) or "Not Declared"
    is_expired_val = bool(getattr(extraction, "is_expired", False)) if extraction else False
    expiry_status_val = getattr(extraction, "expiry_status", "valid") if extraction else "valid"
    expiry_details_val = getattr(extraction, "expiry_details", None) if extraction else None

    status_enum = ComplianceStatus.COMPLIANT if (evaluation and evaluation.is_compliant and not is_expired_val) else ComplianceStatus.VIOLATION

    # Serialize violations for response
    serialized_violations = []
    if evaluation and evaluation.violations:
        for v in evaluation.violations:
            viol_id = uuid.uuid4()
            serialized_violations.append({
                "violation_id": str(viol_id),
                "rule_code": v.rule_code,
                "rule_name": v.rule_name,
                "severity": v.severity,
                "description": v.description,
                "expected_value": v.expected_value,
                "actual_value": v.actual_value,
                "statutory_reference": v.statutory_reference,
                "compounding_amount": v.compounding_amount,
            })

    # Gracefully persist scan, declarations, and violations to database if available
    try:
        effective_role = (user_role or "consumer").lower().strip()
        result = await db.execute(select(ProductScan).where(ProductScan.id == target_scan_id))
        scan_row = result.scalar_one_or_none()
        if not scan_row:
            scan_row = ProductScan(
                id=target_scan_id,
                scan_code=f"SCAN-{target_scan_id.hex[:8].upper()}",
                user_id=user_uuid,
                product_name=prod_val,
                brand=brand_val,
                category=cat_val,
                pdp_area_cm2=pdp_area_dec,
                net_quantity=net_qty_str,
                mrp=mrp_str,
                mfg_date=mfg_str,
                expiry_date=exp_str,
                is_expired=is_expired_val,
                user_role=effective_role,
                overall_status=status_enum,
                compliance_score=score_dec,
                image_url=f"/static/uploads/{filename}",
            )
            db.add(scan_row)
        else:
            scan_row.brand = brand_val
            scan_row.product_name = prod_val
            scan_row.category = cat_val
            scan_row.pdp_area_cm2 = pdp_area_dec
            scan_row.net_quantity = net_qty_str
            scan_row.mrp = mrp_str
            scan_row.mfg_date = mfg_str
            scan_row.expiry_date = exp_str
            scan_row.is_expired = is_expired_val
            scan_row.user_role = effective_role
            scan_row.overall_status = status_enum
            scan_row.compliance_score = score_dec

        if extraction:
            extracted_entity = ExtractedDeclaration(
                scan_id=target_scan_id,
                rule_clause="Rule 6(1)",
                field_name="Mandatory Declarations Summary",
                extracted_value=prod_val,
                status=status_enum,
                status_note="Automated perception verification",
                measured_font_height_mm=Decimal(f"{(extraction.measured_font_height_mm or 2.0):.2f}"),
                required_font_height_mm=Decimal(f"{(evaluation.min_font_height_required_mm if evaluation else 2.0):.2f}"),
                contrast_ratio=Decimal("7.00"),
                bounding_box_json={
                    "tokens_count": len(extraction.tokens),
                    "mfg_date": mfg_str,
                    "expiry_date": exp_str,
                    "is_expired": is_expired_val,
                    "consumer_care": extraction.consumer_care_email,
                },
            )
            db.add(extracted_entity)

        if evaluation and evaluation.violations:
            for v, s_v in zip(evaluation.violations, serialized_violations):
                sev_enum = ViolationSeverity.MEDIUM
                if v.severity == "critical":
                    sev_enum = ViolationSeverity.HIGH
                elif v.severity == "minor":
                    sev_enum = ViolationSeverity.LOW

                violation_record = StatutoryViolation(
                    id=uuid.UUID(s_v["violation_id"]),
                    scan_id=target_scan_id,
                    rule_reference=v.rule_code,
                    act_section=v.statutory_reference,
                    title=v.rule_name,
                    description=v.description,
                    penalty_clause=f"Section 36(1) compounding amount: Rs. {v.compounding_amount:,.2f}",
                    severity=sev_enum,
                    corrective_action=f"Amend package label to declare expected value: {v.expected_value}",
                )
                db.add(violation_record)

        # Log into ScanHistory
        history_record = ScanHistory(
            id=uuid.uuid4(),
            user_id=user_uuid,
            scan_id=target_scan_id,
            health_audit_id=None,
            scan_type="label_compliance",
            user_role=effective_role,
        )
        db.add(history_record)

        await db.commit()
    except Exception as db_err:
        logger.warning("Database persistence failed during scan analysis (continuing without DB write): %s", db_err)
        try:
            await db.rollback()
        except Exception:
            pass

    total_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

    tokens_serialized = [
        {
            "text": t.text,
            "declaration_type": t.declaration_type,
            "bbox": t.bbox.model_dump(),
            "confidence": t.confidence,
        }
        for t in (extraction.tokens if extraction else [])
    ]

    return ScanAnalysisResponse(
        scan_id=str(target_scan_id),
        brand_name=extraction.brand_name if extraction else None,
        product_name=extraction.product_name if extraction else None,
        category=extraction.category if extraction else "Packaged Food",
        mrp=extraction.mrp if extraction else None,
        net_quantity_value=extraction.net_quantity_value if extraction else None,
        net_quantity_unit=extraction.net_quantity_unit if extraction else None,
        mfg_date=mfg_str,
        expiry_date=exp_str,
        is_expired=is_expired_val,
        expiry_status=expiry_status_val,
        expiry_details=expiry_details_val,
        is_compliant=evaluation.is_compliant if evaluation else True,
        compliance_score=evaluation.compliance_score if evaluation else 100.0,
        pdp_area_cm2=evaluation.pdp_area_cm2 if evaluation else 150.0,
        calculated_usp=evaluation.calculated_usp if evaluation else None,
        calculated_usp_unit=evaluation.calculated_usp_unit if evaluation else None,
        violations=serialized_violations,
        tokens=tokens_serialized,
        consumer_advisory=consensus.consumer_advisory_summary if consensus else "",
        form_lm_insp_2011_notice_draft=consensus.form_lm_insp_2011_notice_draft if consensus else None,
        execution_time_ms=total_time_ms,
    )


@router.get("/history", summary="Retrieve scan history")
async def get_scan_history(
    limit: int = 50,
    scan_type: Optional[str] = None,
    role: Optional[str] = None,
    db: AsyncSession = Depends(get_db_session),
    current_user: Optional[CurrentUser] = Depends(get_optional_current_user),
):
    """
    Retrieves recent scan audit history across statutory compliance and health checks.
    Supports role-based isolation (consumer vs officer) so audit records are never conflated.
    """
    items = []
    effective_role = role.lower().strip() if role and role != "all" else None

    # 1. Fetch ProductScans (Statutory Compliance Scans)
    if not scan_type or scan_type in ("all", "label_compliance", "compliance"):
        try:
            stmt = select(ProductScan)
            if effective_role:
                stmt = stmt.where(ProductScan.user_role == effective_role)
            stmt = stmt.order_by(ProductScan.scanned_at.desc()).limit(limit)
            result = await db.execute(stmt)
            scans = result.scalars().all()
            for s in scans:
                # Load violations for this scan
                viol_res = await db.execute(select(StatutoryViolation).where(StatutoryViolation.scan_id == s.id))
                violations = viol_res.scalars().all()

                mrp_num = 0.0
                if s.mrp:
                    m = re.search(r"(\d+(?:\.\d+)?)", str(s.mrp))
                    if m:
                        try:
                            mrp_num = float(m.group(1))
                        except Exception:
                            pass

                status_val = s.overall_status.value if hasattr(s.overall_status, "value") else str(s.overall_status)
                if getattr(s, "is_expired", False):
                    status_val = "violation"

                items.append({
                    "id": str(s.id),
                    "scan_id": str(s.id),
                    "scan_code": s.scan_code or f"LMPC-{str(s.id)[:8].upper()}",
                    "scan_type": "label_compliance",
                    "user_role": getattr(s, "user_role", "consumer") or "consumer",
                    "brand_name": s.brand,
                    "product_name": s.product_name,
                    "category": s.category or "Packaged Goods",
                    "mrp": mrp_num,
                    "mrp_str": s.mrp,
                    "net_quantity": s.net_quantity,
                    "mfg_date": s.mfg_date,
                    "expiry_date": getattr(s, "expiry_date", None) or "Not Declared",
                    "is_expired": bool(getattr(s, "is_expired", False)),
                    "expiry_status": "expired" if getattr(s, "is_expired", False) else "valid",
                    "compliance_status": status_val,
                    "overall_score": float(s.compliance_score),
                    "created_at": s.scanned_at.isoformat() if s.scanned_at else None,
                    "image_url": s.image_url,
                    "violations": [
                        {
                            "violation_id": str(v.id),
                            "rule_clause": v.act_section,
                            "rule_code": v.rule_reference,
                            "rule_name": v.title,
                            "severity": v.severity.value if hasattr(v.severity, "value") else str(v.severity),
                            "description": v.description,
                            "penalty_clause": v.penalty_clause,
                            "compounding_amount": 50000.0 if "EXPIRED" in (v.rule_reference or "") else 10000.0,
                            "expected_value": "Mandatory Standard Declaration",
                            "actual_value": "Non-Conforming",
                        }
                        for v in violations
                    ],
                })
        except Exception as db_err:
            logger.warning("Database query failed during product scan history retrieval: %s", db_err)

    # 2. Fetch HealthAudits (Consumer Health Checks)
    if not scan_type or scan_type in ("all", "health_check", "health"):
        try:
            h_stmt = select(HealthAudit)
            if effective_role:
                h_stmt = h_stmt.where(HealthAudit.user_role == effective_role)
            h_stmt = h_stmt.order_by(HealthAudit.created_at.desc()).limit(limit)
            h_result = await db.execute(h_stmt)
            audits = h_result.scalars().all()
            for a in audits:
                advisory = a.dietary_advisory_json or {}
                badges = a.badges_json or []
                nutrients = a.nutrients_json or []
                is_exp = bool(getattr(a, "is_expired", False) or advisory.get("is_expired") or any(b.get("label") == "EXPIRED PRODUCT" for b in badges))

                h_score = float(a.health_score)
                comp_status = "healthy" if h_score >= 70 else ("caution" if h_score >= 40 else "violation")
                if is_exp:
                    comp_status = "violation"

                items.append({
                    "id": str(a.id),
                    "scan_id": str(a.id),
                    "scan_code": f"HLTH-{str(a.id)[:8].upper()}",
                    "scan_type": "health_check",
                    "user_role": getattr(a, "user_role", "consumer") or "consumer",
                    "brand_name": a.brand,
                    "product_name": a.product_name,
                    "category": "Packaged Food",
                    "mrp": 0.0,
                    "mrp_str": "Declared on Pack",
                    "net_quantity": "Standard Package",
                    "mfg_date": getattr(a, "mfg_date", None) or advisory.get("mfg_date") or "Audited Pack",
                    "expiry_date": getattr(a, "expiry_date", None) or advisory.get("expiry_date") or ("Expired" if is_exp else "Valid"),
                    "is_expired": is_exp,
                    "expiry_status": "expired" if is_exp else "valid",
                    "compliance_status": comp_status,
                    "overall_score": h_score,
                    "created_at": a.created_at.isoformat() if a.created_at else None,
                    "image_url": a.front_image_url,
                    "badges": badges,
                    "nutrients": nutrients,
                    "dietary_advisory": advisory,
                    "violations": [
                        {
                            "violation_id": str(uuid.uuid4()),
                            "rule_clause": "FSSAI Section 59",
                            "rule_code": "EXPIRED_FOOD_PRODUCT",
                            "rule_name": "Expired Food Product - Microbial Hazard",
                            "severity": "critical",
                            "description": "Commodity is expired. Unfit for human consumption due to acute food poisoning hazard.",
                            "penalty_clause": "FSSAI Seizure Notice",
                            "compounding_amount": 50000.0,
                            "expected_value": "Fresh / Within Shelf-Life",
                            "actual_value": "EXPIRED",
                        }
                    ] if is_exp else [],
                })
        except Exception as h_err:
            logger.warning("Database query failed during health audit history retrieval: %s", h_err)

    # Sort unified results by created_at descending
    items.sort(key=lambda x: x.get("created_at") or "", reverse=True)
    return items[:limit]


@router.delete("/history", summary="Clear scan audit history")
async def clear_scan_history(
    role: Optional[str] = None,
    scan_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db_session),
    current_user: Optional[CurrentUser] = Depends(get_optional_current_user),
):
    """
    Clears scan audit records with optional role-based separation (consumer vs officer).
    Ensures safe cascading deletion across statutory violations, extracted declarations, and scan history.
    """
    try:
        effective_role = role.lower().strip() if role and role != "all" else None

        # 1. Target ProductScans
        if not scan_type or scan_type in ("all", "label_compliance", "compliance"):
            ps_query = select(ProductScan.id)
            if effective_role:
                ps_query = ps_query.where(ProductScan.user_role == effective_role)
            ps_res = await db.execute(ps_query)
            scan_ids = ps_res.scalars().all()

            if scan_ids:
                await db.execute(delete(StatutoryViolation).where(StatutoryViolation.scan_id.in_(scan_ids)))
                await db.execute(delete(ExtractedDeclaration).where(ExtractedDeclaration.scan_id.in_(scan_ids)))
                await db.execute(delete(ScanHistory).where(ScanHistory.scan_id.in_(scan_ids)))
                await db.execute(delete(ProductScan).where(ProductScan.id.in_(scan_ids)))

        # 2. Target HealthAudits
        if not scan_type or scan_type in ("all", "health_check", "health"):
            ha_query = select(HealthAudit.id)
            if effective_role:
                ha_query = ha_query.where(HealthAudit.user_role == effective_role)
            ha_res = await db.execute(ha_query)
            audit_ids = ha_res.scalars().all()

            if audit_ids:
                await db.execute(delete(ScanHistory).where(ScanHistory.health_audit_id.in_(audit_ids)))
                await db.execute(delete(HealthAudit).where(HealthAudit.id.in_(audit_ids)))

        # 3. Clean up any remaining ScanHistory entries for role
        if effective_role:
            await db.execute(delete(ScanHistory).where(ScanHistory.user_role == effective_role))
        elif not scan_type or scan_type == "all":
            await db.execute(delete(ScanHistory))

        await db.commit()
        return {
            "status": "success",
            "message": f"Successfully cleared scan history for role '{effective_role or 'all'}'.",
        }
    except Exception as err:
        logger.error("Failed to clear scan history: %s", err)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear scan history: {str(err)}",
        )


@router.delete("/{scan_id}", summary="Delete specific scan audit record by ID")
async def delete_scan_by_id(
    scan_id: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: Optional[CurrentUser] = Depends(get_optional_current_user),
):
    """
    Deletes a single scan audit record (ProductScan or HealthAudit) and cascades to child tables.
    """
    try:
        scan_uuid = uuid.UUID(scan_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format.")

    deleted = False

    # Check ProductScan
    ps_res = await db.execute(select(ProductScan).where(ProductScan.id == scan_uuid))
    ps_record = ps_res.scalar_one_or_none()
    if ps_record:
        await db.execute(delete(StatutoryViolation).where(StatutoryViolation.scan_id == scan_uuid))
        await db.execute(delete(ExtractedDeclaration).where(ExtractedDeclaration.scan_id == scan_uuid))
        await db.execute(delete(ScanHistory).where(ScanHistory.scan_id == scan_uuid))
        await db.execute(delete(ProductScan).where(ProductScan.id == scan_uuid))
        deleted = True

    # Check HealthAudit
    ha_res = await db.execute(select(HealthAudit).where(HealthAudit.id == scan_uuid))
    ha_record = ha_res.scalar_one_or_none()
    if ha_record:
        await db.execute(delete(ScanHistory).where(ScanHistory.health_audit_id == scan_uuid))
        await db.execute(delete(HealthAudit).where(HealthAudit.id == scan_uuid))
        deleted = True

    # Also clean ScanHistory if scan_uuid was passed as scan_history id
    sh_res = await db.execute(select(ScanHistory).where(ScanHistory.id == scan_uuid))
    sh_record = sh_res.scalar_one_or_none()
    if sh_record:
        await db.execute(delete(ScanHistory).where(ScanHistory.id == scan_uuid))
        deleted = True

    if not deleted:
        raise HTTPException(status_code=404, detail=f"Scan record '{scan_id}' not found.")

    await db.commit()
    return {
        "status": "success",
        "message": f"Scan record '{scan_id}' successfully deleted.",
        "deleted_id": scan_id,
    }


@router.get("/{scan_id}", summary="Retrieve scan record by ID")
async def get_scan_by_id(
    scan_id: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: Optional[CurrentUser] = Depends(get_optional_current_user),
):
    """
    Fetches scan record and all associated violations from ProductScan or HealthAudit.
    """
    try:
        scan_uuid = uuid.UUID(scan_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format.")

    # 1. Try ProductScan
    result = await db.execute(select(ProductScan).where(ProductScan.id == scan_uuid))
    scan = result.scalar_one_or_none()
    if scan:
        viol_res = await db.execute(
            select(StatutoryViolation).where(StatutoryViolation.scan_id == scan_uuid)
        )
        violations = viol_res.scalars().all()

        return {
            "scan_id": str(scan.id),
            "scan_code": scan.scan_code,
            "scan_type": "label_compliance",
            "brand_name": scan.brand,
            "product_name": scan.product_name,
            "category": scan.category,
            "mrp": scan.mrp,
            "net_quantity": scan.net_quantity,
            "mfg_date": scan.mfg_date,
            "expiry_date": getattr(scan, "expiry_date", None) or "Not Declared",
            "is_expired": bool(getattr(scan, "is_expired", False)),
            "compliance_status": scan.overall_status.value if hasattr(scan.overall_status, "value") else str(scan.overall_status),
            "overall_score": float(scan.compliance_score),
            "created_at": scan.scanned_at.isoformat() if scan.scanned_at else None,
            "violations": [
                {
                    "id": str(v.id),
                    "rule_name": v.title,
                    "rule_section": v.act_section,
                    "severity": v.severity.value if hasattr(v.severity, "value") else str(v.severity),
                    "description": v.description,
                    "penalty_clause": v.penalty_clause,
                    "corrective_action": v.corrective_action,
                }
                for v in violations
            ],
        }

    # 2. Try HealthAudit
    h_result = await db.execute(select(HealthAudit).where(HealthAudit.id == scan_uuid))
    health_audit = h_result.scalar_one_or_none()
    if health_audit:
        return {
            "scan_id": str(health_audit.id),
            "scan_code": f"HLTH-{str(health_audit.id)[:8].upper()}",
            "scan_type": "health_check",
            "brand_name": health_audit.brand,
            "product_name": health_audit.product_name,
            "category": "Packaged Food",
            "mrp": "Declared on Pack",
            "net_quantity": "Standard Package",
            "mfg_date": getattr(health_audit, "mfg_date", None) or "Audited Pack",
            "expiry_date": getattr(health_audit, "expiry_date", None) or "Passed",
            "is_expired": bool(getattr(health_audit, "is_expired", False)),
            "compliance_status": "violation" if getattr(health_audit, "is_expired", False) else "healthy",
            "overall_score": float(health_audit.health_score),
            "created_at": health_audit.created_at.isoformat() if health_audit.created_at else None,
            "front_image_url": health_audit.front_image_url,
            "back_image_url": health_audit.back_image_url,
            "nutrients": health_audit.nutrients_json,
            "badges": health_audit.badges_json,
            "dietary_advisory": health_audit.dietary_advisory_json,
            "violations": [],
        }

    raise HTTPException(status_code=404, detail="Scan record not found.")
