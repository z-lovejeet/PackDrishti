import logging
from typing import TypedDict, Optional, List, Dict, Any, Union
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
    State object passed between LangGraph agent nodes during packaging compliance analysis.
    Supports single image bytes or multiple image byte buffers (Front + Back panels).
    """
    image_bytes: Union[bytes, List[bytes]]
    filename: str
    scan_id: Optional[str]
    extraction: Optional[PackageVisualExtraction]
    evaluation: Optional[RuleEngineEvaluationResult]
    citations: List[StatutoryCitation]
    health_analysis: Optional[Dict[str, Any]]
    consensus: Optional[DualLLMConsensusOutput]
    error: Optional[str]



# Pipeline instances
extractor = VisualPerceptionExtractor()
rule_engine = DeterministicRuleEngine()
rag_module = SupabaseVectorRAG()
dual_llm = ParallelDualLLMEngine()


async def node_perceive_label(state: PackagingScanState) -> Dict[str, Any]:
    """
    Agent 1: Multimodal Visual Perception Agent.
    Performs direct image inspection over Front + Back packaging panels.
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
    Agent 2: Statutory Compliance Rules Agent.
    Executes deterministic legal math (Rule 6 declarations, USP arithmetic, Rule 7 font calibration).
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
    Agent 3: Statutory Legal RAG Agent.
    Semantic retrieval over the complete 54-rule 2011 regulations dataset.
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


async def node_consumer_health(state: PackagingScanState) -> Dict[str, Any]:
    """
    Agent 4: Consumer Health Profiling Agent.
    Audits nutrition panel, detects palm oil / added sugar / sodium, and checks ICMR-NIN 2024 compliance.
    """
    try:
        from ai.src.pipeline.health_agent import MultimodalHealthAgent
        health_agent = MultimodalHealthAgent()
        image_input = state["image_bytes"]
        front_bytes = image_input[0] if isinstance(image_input, list) and len(image_input) > 0 else (image_input if isinstance(image_input, bytes) else b"")
        back_bytes = image_input[1] if isinstance(image_input, list) and len(image_input) > 1 else b""

        extraction = state.get("extraction")
        prod_hint = extraction.product_name if extraction else None
        brand_hint = extraction.brand_name if extraction else None

        analysis = await health_agent.analyze_packaging(
            front_bytes=front_bytes,
            back_bytes=back_bytes,
            product_name_hint=prod_hint,
            brand_hint=brand_hint,
        )
        return {"health_analysis": analysis.model_dump()}
    except Exception as e:
        logger.warning("Consumer health agent notice (continuing workflow): %s", e)
        return {"health_analysis": None}


async def node_synthesize_consensus(state: PackagingScanState) -> Dict[str, Any]:
    """
    Agent 5: Consensus & Legal Docket Synthesis Agent.
    Fuses statutory findings, RAG citations, and health data into a formal courtroom docket.
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
    Assembles and compiles the 5-agent stateful LangGraph workflow.
    """
    workflow = StateGraph(PackagingScanState)

    # Register Nodes
    workflow.add_node("perceive_label", node_perceive_label)
    workflow.add_node("evaluate_rules", node_evaluate_rules)
    workflow.add_node("retrieve_citations", node_retrieve_citations)
    workflow.add_node("consumer_health", node_consumer_health)
    workflow.add_node("synthesize_consensus", node_synthesize_consensus)

    # Wire Edges
    workflow.add_edge(START, "perceive_label")
    workflow.add_edge("perceive_label", "evaluate_rules")
    workflow.add_edge("evaluate_rules", "retrieve_citations")
    workflow.add_edge("retrieve_citations", "consumer_health")
    workflow.add_edge("consumer_health", "synthesize_consensus")
    workflow.add_edge("synthesize_consensus", END)

    return workflow.compile()


# Compiled Singleton Graph
packaging_compliance_graph = build_langgraph_workflow()


async def run_packaging_scan_workflow(
    image_bytes: Union[bytes, List[bytes]], filename: str = "", scan_id: Optional[str] = None
) -> PackagingScanState:
    """
    Public entrypoint to execute the complete 5-agent LangGraph packaging scan workflow.
    """
    initial_state: PackagingScanState = {
        "image_bytes": image_bytes,
        "filename": filename,
        "scan_id": scan_id,
        "extraction": None,
        "evaluation": None,
        "citations": [],
        "health_analysis": None,
        "consensus": None,
        "error": None,
    }

    final_state = await packaging_compliance_graph.ainvoke(initial_state)
    return final_state

