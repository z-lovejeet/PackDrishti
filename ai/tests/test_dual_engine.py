import pytest
from ai.src.pipeline.extractor import PackageVisualExtraction
from ai.src.rules.deterministic import DeterministicRuleEngine
from ai.src.rag.supabase_vector import SupabaseVectorRAG
from ai.src.llm.dual_engine import ParallelDualLLMEngine


@pytest.mark.asyncio
async def test_parallel_dual_llm_execution():
    """
    Validates parallel execution of Gemini and Groq fallback chains via asyncio.gather().
    """
    engine = ParallelDualLLMEngine()
    rag = SupabaseVectorRAG()

    extraction = PackageVisualExtraction(
        brand_name="Test Brand",
        product_name="Test Product",
        mrp=50.0,
        net_quantity_value=100.0,
        net_quantity_unit="g",
        declared_usp=0.50,
        declared_usp_unit="g",
        pdp_area_cm2=120.0,
        measured_font_height_mm=2.2,
        mfg_month=5,
        mfg_year=2024,
        consumer_care_email="support@test.com",
        manufacturer_name="Test Manufacturer Ltd",
        country_of_origin="India",
    )

    evaluation = DeterministicRuleEngine.evaluate_compliance(extraction)
    citations = await rag.retrieve_citations_for_rule("PCR_RULE_5_USP")

    consensus = await engine.generate_consensus(evaluation, citations)

    assert consensus.primary_provider == "google_gemini"
    assert consensus.secondary_provider == "groq_api"
    assert consensus.consensus_confidence >= 0.90
    assert len(consensus.consumer_advisory_summary) > 20
    assert consensus.form_lm_insp_2011_notice_draft is not None
