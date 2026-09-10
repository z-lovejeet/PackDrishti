import pytest
from ai.src.pipeline.langgraph_workflow import run_packaging_scan_workflow


@pytest.mark.asyncio
async def test_langgraph_packaging_scan_workflow_end_to_end():
    """
    Validates end-to-end state transitions across all 4 tiers in LangGraph workflow.
    """
    # Simulate packaging scan input
    mock_image_bytes = b"Sample Packaging Label Data for Testing"
    final_state = await run_packaging_scan_workflow(
        image_bytes=mock_image_bytes,
        filename="test_biscuit_packet.jpg",
        scan_id="00000000-0000-0000-0000-000000000001",
    )

    assert final_state["error"] is None
    assert final_state["extraction"] is not None
    assert final_state["evaluation"] is not None
    assert final_state["citations"] is not None
    assert len(final_state["citations"]) > 0
    assert final_state["consensus"] is not None
    assert final_state["consensus"].primary_provider == "google_gemini"
    assert final_state["consensus"].secondary_provider == "groq_api"
    assert len(final_state["consensus"].consumer_advisory_summary) > 10
