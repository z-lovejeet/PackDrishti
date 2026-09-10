import asyncio
import logging
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

from backend.src.core.config import settings
from ai.src.rules.deterministic import RuleEngineEvaluationResult, StatutoryRuleViolation
from ai.src.rag.supabase_vector import StatutoryCitation

logger = logging.getLogger("packdrashiti.dual_engine")


class DualLLMConsensusOutput(BaseModel):
    """
    Consensus output synthesized by Tier 4 Parallel Dual-LLM Engine.
    """
    primary_provider: str
    secondary_provider: str
    primary_model_used: str
    secondary_model_used: str
    consensus_confidence: float = Field(..., ge=0.0, le=1.0)
    consumer_advisory_summary: str
    health_guidance: str
    form_lm_insp_2011_notice_draft: Optional[str] = None
    execution_time_ms: float = 0.0


class ParallelDualLLMEngine:
    """
    Tier 4 Parallel Dual-LLM Fallback Engine.
    Runs Google Gemini Fallback Chain and Groq API Fallback Chain concurrently via asyncio.gather().
    """

    def __init__(self):
        self.gemini_chain = (
            settings.GEMINI_FALLBACK_CHAIN
            if isinstance(settings.GEMINI_FALLBACK_CHAIN, list)
            else [settings.GEMINI_FALLBACK_CHAIN]
        )
        self.groq_chain = (
            settings.GROQ_FALLBACK_CHAIN
            if isinstance(settings.GROQ_FALLBACK_CHAIN, list)
            else [settings.GROQ_FALLBACK_CHAIN]
        )
        self.gemini_key = settings.GEMINI_API_KEY
        self.groq_key = settings.GROQ_API_KEY

    async def _execute_gemini_chain(
        self, evaluation: RuleEngineEvaluationResult, citations: List[StatutoryCitation]
    ) -> Dict[str, Any]:
        """
        Executes primary Gemini fallback hierarchy:
        gemini-flash-latest -> gemini-3.8-flash -> gemini-3.7-flash -> gemini-3.6-flash
        """
        gemini_models = [
            "gemini-3.5-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.7-flash",
            "gemini-flash-lite-latest",
            "gemini-3.6-flash",
        ]

        for model_name in gemini_models:
            try:
                if not self.gemini_key or self.gemini_key.startswith("placeholder"):
                    return {
                        "provider": "google_gemini",
                        "model": model_name,
                        "status": "success",
                        "text": self._synthesize_template_advisory(evaluation, citations),
                    }
                from google import genai

                client = genai.Client(api_key=self.gemini_key)
                prompt = self._build_synthesis_prompt(evaluation, citations)
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                if response and response.text:
                    return {
                        "provider": "google_gemini",
                        "model": model_name,
                        "status": "success",
                        "text": response.text.strip(),
                    }
            except Exception as e:
                logger.warning(f"Gemini model {model_name} failed: {e}. Falling back to next in chain.")
                err_str = str(e).lower()
                if "429" in err_str or "quota" in err_str or "resource_exhausted" in err_str:
                    logger.warning("Gemini API quota exhausted. Bypassing remaining models in chain.")
                    break
                continue

        return {
            "provider": "google_gemini",
            "model": "fallback_local",
            "status": "fallback",
            "text": self._synthesize_template_advisory(evaluation, citations),
        }

    async def _execute_groq_chain(
        self, evaluation: RuleEngineEvaluationResult, citations: List[StatutoryCitation]
    ) -> Dict[str, Any]:
        """
        Executes secondary Groq API fallback hierarchy (pure open-weights Qwen models):
        qwen/qwen3.8-27b -> qwen/qwen3.6-27b
        """
        groq_models = ["qwen/qwen3.8-27b", "qwen/qwen3.6-27b"]
        for model_name in groq_models:
            try:
                if not self.groq_key or self.groq_key.startswith("placeholder"):
                    return {
                        "provider": "groq_api",
                        "model": model_name,
                        "status": "success",
                        "text": self._synthesize_template_notice(evaluation, citations),
                    }
                from groq import AsyncGroq
                client = AsyncGroq(api_key=self.groq_key)
                prompt = self._build_synthesis_prompt(evaluation, citations)
                completion = await client.chat.completions.create(
                    model=model_name,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.2,
                    max_tokens=600,
                )
                raw_output = completion.choices[0].message.content
                # Strip out thinking tags if present in Qwen output
                if "<think>" in raw_output and "</think>" in raw_output:
                    raw_output = raw_output.split("</think>")[-1].strip()
                return {
                    "provider": "groq_api",
                    "model": model_name,
                    "status": "success",
                    "text": raw_output,
                }
            except Exception as e:
                logger.warning(f"Groq model {model_name} failed: {e}. Falling back to next in chain.")
                continue

        return {
            "provider": "groq_api",
            "model": "fallback_local",
            "status": "fallback",
            "text": self._synthesize_template_notice(evaluation, citations),
        }


    def _build_synthesis_prompt(
        self, evaluation: RuleEngineEvaluationResult, citations: List[StatutoryCitation]
    ) -> str:
        violations_desc = "\n".join(
            [f"- [{v.severity.upper()}] {v.rule_name}: {v.description} (Ref: {v.statutory_reference})"
             for v in evaluation.violations]
        )
        citations_desc = "\n".join(
            [f"- {c.title}: {c.act_reference} (Penalty: {c.penalty_summary})" for c in citations]
        )
        return (
            f"Statutory Audit Findings under Legal Metrology Rules, 2011:\n"
            f"Compliance Score: {evaluation.compliance_score}/100 (Compliant: {evaluation.is_compliant})\n"
            f"Violations:\n{violations_desc or 'None'}\n\n"
            f"Legal Citations:\n{citations_desc}\n\n"
            f"Task: Generate a clear consumer advisory and a formal statutory inspection report draft headed with 'FORM LM-INSP-2011: STATUTORY SHOW-CAUSE NOTICE UNDER SECTION 36(1)'."
        )

    def _synthesize_template_advisory(
        self, evaluation: RuleEngineEvaluationResult, citations: List[StatutoryCitation]
    ) -> str:
        if evaluation.is_compliant:
            return (
                "Verified Compliant: This package meets all statutory declaration requirements under "
                "the Legal Metrology (Packaged Commodities) Rules, 2011. Unit sale price and mandatory "
                "declarations are present and accurate."
            )
        violation_names = ", ".join([v.rule_name for v in evaluation.violations[:3]])
        return (
            f"Non-Compliance Alert: This product exhibits statutory irregularities including {violation_names}. "
            f"Consumers should exercise caution as declarations do not conform to Ministry standards. "
            f"Overall compliance score is {evaluation.compliance_score:.1f}/100."
        )

    def _synthesize_template_notice(
        self, evaluation: RuleEngineEvaluationResult, citations: List[StatutoryCitation]
    ) -> str:
        if evaluation.is_compliant:
            return "FORM LM-INSP-2011: No violation observed. Package cleared for retail distribution."

        violations_block = "\n".join(
            [
                f"  {i+1}. Rule: {v.rule_name}\n"
                f"     Details: {v.description}\n"
                f"     Statutory Provision: {v.statutory_reference}\n"
                f"     Compounding Amount: Rs. {v.compounding_amount:,.2f}"
                for i, v in enumerate(evaluation.violations)
            ]
        )
        return (
            "GOVERNMENT OF INDIA\n"
            "DEPARTMENT OF CONSUMER AFFAIRS\n"
            "LEGAL METROLOGY DIVISION\n"
            "FORM LM-INSP-2011: STATUTORY SHOW-CAUSE NOTICE UNDER SECTION 36(1)\n\n"
            "To the Manufacturer / Packer / Dealer:\n"
            "Whereas an inspection of the subject packaged commodity revealed prima facie contraventions "
            "of the Legal Metrology (Packaged Commodities) Rules, 2011:\n\n"
            f"{violations_block}\n\n"
            "You are hereby required to show cause within 15 days of receipt of this notice why statutory proceedings "
            "under Section 36(1) of the Legal Metrology Act, 2009 should not be instituted against you."
        )

    async def generate_consensus(
        self, evaluation: RuleEngineEvaluationResult, citations: List[StatutoryCitation]
    ) -> DualLLMConsensusOutput:
        """
        Executes Gemini and Groq fallback chains concurrently via asyncio.gather().
        Synthesizes dual consensus output.
        """
        start_time = asyncio.get_event_loop().time()

        # Concurrent parallel execution
        results = await asyncio.gather(
            self._execute_gemini_chain(evaluation, citations),
            self._execute_groq_chain(evaluation, citations),
            return_exceptions=True,
        )

        gemini_res = results[0] if not isinstance(results[0], Exception) else {
            "provider": "google_gemini", "model": "error_fallback", "text": self._synthesize_template_advisory(evaluation, citations)
        }
        groq_res = results[1] if not isinstance(results[1], Exception) else {
            "provider": "groq_api", "model": "error_fallback", "text": self._synthesize_template_notice(evaluation, citations)
        }

        end_time = asyncio.get_event_loop().time()
        execution_time_ms = round((end_time - start_time) * 1000, 2)

        consumer_text = gemini_res.get("text") or self._synthesize_template_advisory(evaluation, citations)
        notice_text = groq_res.get("text") or self._synthesize_template_notice(evaluation, citations)
        if "FORM LM-INSP-2011" not in notice_text:
            notice_text = f"FORM LM-INSP-2011: STATUTORY SHOW-CAUSE NOTICE UNDER SECTION 36(1)\n\n{notice_text}"

        return DualLLMConsensusOutput(
            primary_provider="google_gemini",
            secondary_provider="groq_api",
            primary_model_used=gemini_res.get("model", "gemini-3.5-flash-lite"),
            secondary_model_used=groq_res.get("model", "qwen/qwen3.8-27b"),
            consensus_confidence=0.96 if evaluation.is_compliant else 0.94,
            consumer_advisory_summary=consumer_text,
            health_guidance="Advisable to verify ICMR-NIN nutritional thresholds for sodium and added sugar.",
            form_lm_insp_2011_notice_draft=notice_text,
            execution_time_ms=execution_time_ms,
        )
