"""
PackDrashiti - Legal Metrology Statutory Compounding Fee Engine
Deterministic calculation of compounding fees under Section 48 read with
Section 36(1) and Section 39 of the Legal Metrology Act, 2009.
"""

from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ViolationInput(BaseModel):
    rule_reference: str = Field(..., description="Rule reference, e.g. Rule 6(1)(e), Rule 7 Table-I")
    title: str = Field(..., description="Short title of the infraction")
    severity: str = Field("medium", description="high, medium, or low")
    description: Optional[str] = None
    act_section: Optional[str] = "Section 36(1)"


class CompoundingItemBreakdown(BaseModel):
    rule_reference: str
    act_section: str
    title: str
    severity: str
    base_compounding_fee_inr: float
    multiplier: float
    calculated_fee_inr: float
    statutory_ceiling_inr: float
    statutory_citation: str
    remarks: str


class CompoundingCalculationRequest(BaseModel):
    scan_id: Optional[str] = None
    violations: List[ViolationInput]
    offence_count: int = Field(1, ge=1, description="1 for first offence, 2 for second, 3+ for subsequent")
    days_since_last_offence: Optional[int] = Field(None, ge=0, description="Days elapsed since previous compounding order")
    prompt_settlement: bool = Field(True, description="Apply 20% reduction under Jan Vishwas Act if paid within 15 days")
    inspection_date: Optional[datetime] = None


class CompoundingCalculationResult(BaseModel):
    total_violations: int
    offence_count: int
    effective_offence_tier: str
    is_compoundable: bool
    court_prosecution_mandatory: bool
    gross_compounding_fee_inr: float
    prompt_settlement_discount_inr: float
    net_payable_compounding_fee_inr: float
    due_date: datetime
    three_year_reset_applied: bool
    breakdown: List[CompoundingItemBreakdown]
    statutory_authorities: List[str]
    enforcement_summary: str


class CompoundingEngine:
    """
    Implements statutory compounding schedules mandated by Section 48 of
    the Legal Metrology Act, 2009 and the Jan Vishwas (Amendment of Provisions) Act, 2023.
    """

    STATUTORY_CEILING_FIRST_OFFENCE = 25000.0
    STATUTORY_CEILING_SECOND_OFFENCE = 50000.0
    THREE_YEAR_DAYS_THRESHOLD = 1095  # 3 years * 365 days

    BASE_FEE_SCHEDULE: Dict[str, float] = {
        "rule 6(1)(a)": 15000.0,  # Generic name missing
        "rule 6(1)(b)": 15000.0,  # Net quantity missing or non-standard
        "rule 6(1)(c)": 15000.0,  # Month and year of manufacture missing
        "rule 6(1)(d)": 20000.0,  # Maximum Retail Price (MRP) missing
        "rule 6(1)(e)": 10000.0,  # Unit Sale Price (USP) missing or erroneous
        "rule 6(1)(f)": 10000.0,  # Consumer care contact details missing
        "rule 7": 7500.0,         # Minimum font height (Table-I) non-compliance
        "rule 7 table-i": 7500.0,
        "rule 9": 5000.0,         # Contrast ratio non-compliance
        "rule 18": 25000.0,       # Dual MRP / Altered MRP
        "rule 27": 5000.0,        # Non-registration of manufacturer/packer/importer
        "rule 33": 2500.0,        # Procedural / inspection record non-compliance
    }

    @classmethod
    def resolve_base_fee(cls, rule_ref: str, severity: str) -> float:
        """Determines base compounding fee from statutory schedule."""
        cleaned_ref = rule_ref.strip().lower()
        for key, fee in cls.BASE_FEE_SCHEDULE.items():
            if key in cleaned_ref:
                return fee

        # Default fallback based on severity
        if severity == "high":
            return 15000.0
        elif severity == "medium":
            return 7500.0
        return 3000.0

    @classmethod
    def calculate_compounding(
        cls, request: CompoundingCalculationRequest
    ) -> CompoundingCalculationResult:
        """
        Executes statutory compounding assessment.
        Adheres to Section 48(1) and 48(2) of the Legal Metrology Act, 2009.
        """
        now = request.inspection_date or datetime.now(timezone.utc)
        due_date = now + timedelta(days=15)

        effective_tier = "first"
        three_year_reset = False
        offence_count = request.offence_count

        # Section 48(2) Reset Rule:
        # An offence committed after expiry of 3 years from previous compounding
        # is deemed a First Offence.
        if offence_count > 1 and request.days_since_last_offence is not None:
            if request.days_since_last_offence >= cls.THREE_YEAR_DAYS_THRESHOLD:
                offence_count = 1
                three_year_reset = True
                effective_tier = "first"

        multiplier = 1.0
        is_compoundable = True
        court_prosecution_mandatory = False

        if offence_count == 1:
            multiplier = 1.0
            effective_tier = "first"
            ceiling = cls.STATUTORY_CEILING_FIRST_OFFENCE
        elif offence_count == 2:
            multiplier = 2.0
            effective_tier = "second"
            ceiling = cls.STATUTORY_CEILING_SECOND_OFFENCE
        else:
            # Section 48(1) Proviso: Third or subsequent offence cannot be compounded.
            effective_tier = "subsequent_court_prosecution"
            is_compoundable = False
            court_prosecution_mandatory = True
            ceiling = cls.STATUTORY_CEILING_SECOND_OFFENCE

        breakdown: List[CompoundingItemBreakdown] = []
        gross_total = 0.0

        for viol in request.violations:
            base_fee = cls.resolve_base_fee(viol.rule_reference, viol.severity)
            calc_fee = base_fee * multiplier
            calc_fee = min(calc_fee, ceiling)

            citation = f"Section 36(1) read with Section 48, Legal Metrology Act, 2009 ({viol.rule_reference})"
            remarks = (
                f"Statutory compounding fee for {viol.title} ({effective_tier.replace('_', ' ').title()} Offence)."
                if is_compoundable
                else f"Repeat infraction ({offence_count}rd/subsequent offence). Compounding prohibited under Section 48(1) proviso; court trial mandated."
            )

            breakdown.append(
                CompoundingItemBreakdown(
                    rule_reference=viol.rule_reference,
                    act_section=viol.act_section or "Section 36(1)",
                    title=viol.title,
                    severity=viol.severity,
                    base_compounding_fee_inr=base_fee,
                    multiplier=multiplier if is_compoundable else 0.0,
                    calculated_fee_inr=calc_fee if is_compoundable else 0.0,
                    statutory_ceiling_inr=ceiling,
                    statutory_citation=citation,
                    remarks=remarks,
                )
            )
            if is_compoundable:
                gross_total += calc_fee

        # Prompt settlement discount under Jan Vishwas Act (20% if paid within 15 days)
        discount_inr = 0.0
        if is_compoundable and request.prompt_settlement:
            discount_inr = round(gross_total * 0.20, 2)

        net_payable = round(gross_total - discount_inr, 2)

        authorities = [
            "Section 36(1), Legal Metrology Act, 2009 (Penalty for non-standard packages)",
            "Section 39, Legal Metrology Act, 2009 (Offences by companies and nominated directors)",
            "Section 48, Legal Metrology Act, 2009 (Compounding of offences and 3-year reset rule)",
            "Legal Metrology (Packaged Commodities) Rules, 2011 (Mandatory declarations and font calibration)",
            "Jan Vishwas (Amendment of Provisions) Act, 2023 (Prompt settlement framework)",
        ]

        if is_compoundable:
            summary = (
                f"Total compounding fee assessed at INR {net_payable:,.2f} "
                f"({effective_tier.title()} Offence schedule). "
                f"Notice requires deposition within 15 days (by {due_date.strftime('%d-%b-%Y')}) "
                f"to avail statutory discharge under Section 48."
            )
        else:
            summary = (
                f"Offence cannot be compounded. Under the proviso to Section 48(1) of the Legal Metrology Act, 2009, "
                f"subsequent offences committed within 3 years of previous compounding require formal prosecution "
                f"before the Judicial Magistrate First Class / Metropolitan Magistrate under Section 36(1)."
            )

        return CompoundingCalculationResult(
            total_violations=len(request.violations),
            offence_count=offence_count,
            effective_offence_tier=effective_tier,
            is_compoundable=is_compoundable,
            court_prosecution_mandatory=court_prosecution_mandatory,
            gross_compounding_fee_inr=gross_total,
            prompt_settlement_discount_inr=discount_inr,
            net_payable_compounding_fee_inr=net_payable,
            due_date=due_date,
            three_year_reset_applied=three_year_reset,
            breakdown=breakdown,
            statutory_authorities=authorities,
            enforcement_summary=summary,
        )
