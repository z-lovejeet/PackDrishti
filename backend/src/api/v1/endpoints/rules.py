import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.src.core.database import get_db_session
from backend.src.core.security import get_optional_current_user, CurrentUser, RateLimiter, sanitize_text_input
from backend.src.models.violation import StatutoryViolation
from backend.src.models.scan import ProductScan
from ai.src.rag.supabase_vector import SupabaseVectorRAG, StatutoryCitation
from ai.src.llm.dual_engine import ParallelDualLLMEngine
from ai.src.rules.deterministic import RuleEngineEvaluationResult, StatutoryRuleViolation

router = APIRouter()
rag_service = SupabaseVectorRAG()
dual_llm_service = ParallelDualLLMEngine()


class RuleSearchResponse(BaseModel):
    query: str
    total_results: int
    citations: List[StatutoryCitation]


class NoticeGenerationResponse(BaseModel):
    violation_id: str
    scan_id: str
    form_type: str
    show_cause_notice: str
    statutory_citations: List[StatutoryCitation]
    compounding_amount: float
    issued_to: str
    status: str


@router.get(
    "/rules/search",
    response_model=RuleSearchResponse,
    summary="Semantic Statutory Rule Search",
    dependencies=[Depends(RateLimiter(max_requests=60, window_seconds=60))],
)
async def search_statutory_rules(
    q: str = Query(..., min_length=2, description="Legal Metrology query (e.g. dual MRP, font height, USP)"),
    top_k: int = Query(5, ge=1, le=20),
):
    """
    Executes semantic search against Supabase pgvector knowledge base
    covering Legal Metrology Act, 2009 and Packaged Commodities Rules, 2011.
    """
    sanitized_q = sanitize_text_input(q)
    citations = await rag_service.search_statutory_rules(query_text=sanitized_q, top_k=top_k)
    return RuleSearchResponse(
        query=sanitized_q,
        total_results=len(citations),
        citations=citations,
    )


@router.post(
    "/violations/{violation_id}/generate-notice",
    response_model=NoticeGenerationResponse,
    summary="Generate FORM LM-INSP-2011 Statutory Notice",
)
async def generate_statutory_show_cause_notice(
    violation_id: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: Optional[CurrentUser] = Depends(get_optional_current_user),
):
    """
    Generates a formal show-cause inspection report (FORM LM-INSP-2011)
    under Section 36(1) of Legal Metrology Act, 2009.
    """
    try:
        viol_uuid = uuid.UUID(violation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid violation UUID format.")

    result = await db.execute(
        select(StatutoryViolation).where(StatutoryViolation.id == viol_uuid)
    )
    violation = result.scalar_one_or_none()
    if not violation:
        raise HTTPException(status_code=404, detail="Statutory violation not found.")

    # Retrieve scan for manufacturer context
    scan_res = await db.execute(
        select(ProductScan).where(ProductScan.id == violation.scan_id)
    )
    scan = scan_res.scalar_one_or_none()
    company_name = (scan.brand if scan and scan.brand else None) or "Manufacturer / Packer / Dealer"

    # Retrieve citations
    citations = await rag_service.retrieve_citations_for_rule(violation.rule_reference, top_k=2)

    compounding_amount = 10000.0
    if "25,000" in violation.penalty_clause:
        compounding_amount = 25000.0
    elif "5,000" in violation.penalty_clause:
        compounding_amount = 5000.0

    # Synthesize formal notice using Dual-LLM engine
    rule_eval = RuleEngineEvaluationResult(
        is_compliant=False,
        compliance_score=60.0,
        total_checks_performed=1,
        passed_checks=0,
        failed_checks=1,
        violations=[
            StatutoryRuleViolation(
                rule_code=violation.rule_reference,
                rule_name=violation.title,
                severity=violation.severity.value if hasattr(violation.severity, "value") else str(violation.severity),
                description=violation.description,
                expected_value="Statutory Standard",
                actual_value="Non-Compliant Declaration",
                statutory_reference=violation.act_section,
                compounding_amount=compounding_amount,
            )
        ],
        pdp_area_cm2=float(scan.pdp_area_cm2) if scan and scan.pdp_area_cm2 else 150.0,
        min_font_height_required_mm=2.0,
    )

    consensus = await dual_llm_service.generate_consensus(rule_eval, citations)

    return NoticeGenerationResponse(
        violation_id=str(violation.id),
        scan_id=str(violation.scan_id),
        form_type="FORM LM-INSP-2011",
        show_cause_notice=(
            consensus.form_lm_insp_2011_notice_draft
            if consensus and consensus.form_lm_insp_2011_notice_draft
            else "FORM LM-INSP-2011: Statutory Show-Cause Notice Draft"
        ),
        statutory_citations=citations,
        compounding_amount=compounding_amount,
        issued_to=company_name,
        status="drafted",
    )
