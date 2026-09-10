import pytest
from ai.src.rag.supabase_vector import SupabaseVectorRAG


@pytest.mark.asyncio
async def test_statutory_rag_retrieval():
    """
    Validates semantic statutory citations retrieval from Supabase pgvector knowledge base.
    """
    rag = SupabaseVectorRAG()

    citations = await rag.retrieve_citations_for_rule("PCR_RULE_5_USP")
    assert len(citations) > 0
    assert "Rule 5" in citations[0].title or "Unit Sale Price" in citations[0].title
    assert citations[0].compounding_amount > 0

    font_citations = await rag.retrieve_citations_for_rule("PCR_RULE_7_FONT")
    assert len(font_citations) > 0
    assert "Rule 7" in font_citations[0].title or "Height" in font_citations[0].title


@pytest.mark.asyncio
async def test_statutory_rag_search():
    """
    Validates semantic query search over statutory knowledge.
    """
    rag = SupabaseVectorRAG()

    results = await rag.search_statutory_rules("mandatory declarations manufacturer", top_k=2)
    assert len(results) > 0
    assert any("Rule 6" in r.title or "Mandatory" in r.title for r in results)
