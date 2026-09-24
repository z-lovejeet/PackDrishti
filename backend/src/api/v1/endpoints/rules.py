from typing import List
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from backend.src.core.security import RateLimiter, sanitize_text_input
from ai.src.rag.supabase_vector import SupabaseVectorRAG, StatutoryCitation

router = APIRouter()
rag_service = SupabaseVectorRAG()


class RuleSearchResponse(BaseModel):
    query: str
    total_results: int
    citations: List[StatutoryCitation]


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
