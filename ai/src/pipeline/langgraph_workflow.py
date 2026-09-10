import logging
from typing import TypedDict, Optional, List, Dict, Any
from langgraph.graph import StateGraph, START, END

from ai.src.pipeline.extractor import (
    VisualPerceptionExtractor,
    PackageVisualExtraction,
)
from ai.src.rules.deterministic import (
    DeterministicRuleEngine,
    RuleEngineEvaluationResult,
)
from ai.src.rag.supabase_vector import (
    SupabaseVectorRAG,
    StatutoryCitation,
)
from ai.src.llm.dual_engine import (
    ParallelDualLLMEngine,
    DualLLMConsensusOutput,
)

logger = logging.getLogger("packdrashiti.workflow")


class PackagingScanState(TypedDict):
    """
    State object passed between LangGraph nodes during packaging compliance analysis.
    """
    image_bytes: bytes
    filename: str
    scan_id: Optional[str]
    extraction: Optional[PackageVisualExtraction]
    evaluation: Optional[RuleEngineEvaluationResult]
    citations: List[StatutoryCitation]
    consensus: Optional[DualLLMConsensusOutput]
    error: Optional[str]


# Pipeline instances
extractor = VisualPerceptionExtractor()
rule_engine = DeterministicRuleEngine()
rag_module = SupabaseVectorRAG()
dual_llm = ParallelDualLLMEngine()


async def node_perceive_label(state: PackagingScanState) -> Dict[str, Any]:
    """
    Node 1: Tier 1 Multimodal Visual Perception and Spatial Extraction.
    """
    try:
        extraction = await extractor.extract_from_image_bytes(
            state["image_bytes"], state.get("filename", "")
        )
        return {"extraction": extraction, "error": None}
    except Exception as e:
        logger.error(f"Error in node_perceive_label: {e}")
        return {"error": f"Visual perception error: {str(e)}"}


async def node_evaluate_rules(state: PackagingScanState) -> Dict[str, Any]:
    """
    Node 2: Tier 2 Deterministic Rule Engine verification.
    """
    extraction = state.get("extraction")
    if not extraction:
        return {"error": "Missing extraction data for rule engine evaluation."}

    try:
        evaluation = rule_engine.evaluate_compliance(extraction)
        return {"evaluation": evaluation}
    except Exception as e:
        logger.error(f"Error in node_evaluate_rules: {e}")
        return {"error": f"Rule evaluation error: {str(e)}"}


async def node_retrieve_citations(state: PackagingScanState) -> Dict[str, Any]:
    """
    Node 3: Tier 3 Statutory RAG over Supabase pgvector knowledge base.
    """
    evaluation = state.get("evaluation")
    citations: List[StatutoryCitation] = []

    if evaluation and evaluation.violations:
        for violation in evaluation.violations:
            rule_citations = await rag_module.retrieve_citations_for_rule(violation.rule_code, top_k=1)
            citations.extend(rule_citations)
    else:
        # Compliant package: retrieve standard Rule 6 & 11 authority
        citations = await rag_module.retrieve_citations_for_rule("PCR_RULE_5_USP", top_k=1)

    return {"citations": citations}


async def node_synthesize_consensus(state: PackagingScanState) -> Dict[str, Any]:
    """
    Node 4: Tier 4 Parallel Dual-LLM Consensus Synthesis (Gemini + Groq).
    """
    evaluation = state.get("evaluation")
    citations = state.get("citations", [])

    if not evaluation:
        return {"error": "Cannot synthesize consensus without rule evaluation."}

    try:
        consensus = await dual_llm.generate_consensus(evaluation, citations)
        return {"consensus": consensus}
    except Exception as e:
        logger.error(f"Error in node_synthesize_consensus: {e}")
        return {"error": f"Consensus synthesis error: {str(e)}"}


def build_langgraph_workflow():
    """
    Assembles and compiles the stateful LangGraph workflow.
    """
    workflow = StateGraph(PackagingScanState)

    # Register Nodes
    workflow.add_node("perceive_label", node_perceive_label)
    workflow.add_node("evaluate_rules", node_evaluate_rules)
    workflow.add_node("retrieve_citations", node_retrieve_citations)
    workflow.add_node("synthesize_consensus", node_synthesize_consensus)

    # Wire Edges
    workflow.add_edge(START, "perceive_label")
    workflow.add_edge("perceive_label", "evaluate_rules")
    workflow.add_edge("evaluate_rules", "retrieve_citations")
    workflow.add_edge("retrieve_citations", "synthesize_consensus")
    workflow.add_edge("synthesize_consensus", END)

    return workflow.compile()


# Compiled Singleton Graph
packaging_compliance_graph = build_langgraph_workflow()


async def run_packaging_scan_workflow(
    image_bytes: bytes, filename: str = "", scan_id: Optional[str] = None
) -> PackagingScanState:
    """
    Public entrypoint to execute the complete 4-tier LangGraph packaging scan workflow.
    """
    initial_state: PackagingScanState = {
        "image_bytes": image_bytes,
        "filename": filename,
        "scan_id": scan_id,
        "extraction": None,
        "evaluation": None,
        "citations": [],
        "consensus": None,
        "error": None,
    }

    final_state = await packaging_compliance_graph.ainvoke(initial_state)
    return final_state
