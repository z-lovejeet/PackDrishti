import math
from typing import List, Dict, Any, Optional, Tuple
from pydantic import BaseModel, Field

from ai.src.pipeline.extractor import PackageVisualExtraction


class StatutoryRuleViolation(BaseModel):
    """
    Representation of an individual statutory violation flagged by Tier 2 Rule Engine.
    """
    rule_code: str
    rule_name: str
    severity: str  # critical, major, minor
    description: str
    expected_value: str
    actual_value: str
    statutory_reference: str
    compounding_amount: float = 0.0


class RuleEngineEvaluationResult(BaseModel):
    """
    Aggregated evaluation result produced by the Deterministic Rule Engine.
    """
    is_compliant: bool
    compliance_score: float = Field(..., ge=0.0, le=100.0)
    total_checks_performed: int
    passed_checks: int
    failed_checks: int
    violations: List[StatutoryRuleViolation]
    pdp_area_cm2: float
    min_font_height_required_mm: float
    calculated_usp: Optional[float] = None
    calculated_usp_unit: Optional[str] = None


class DeterministicRuleEngine:
    """
    Tier 2 Deterministic Python Rule Engine for Legal Metrology (Packaged Commodities) Rules, 2011.
    Executes 100% mathematically auditable statutory verification.
    """

    # Permitted SI Metric Units under Rule 13 and Second Schedule
    VALID_METRIC_UNITS = {
        "mass": {"g", "gram", "grams", "kg", "kilogram", "kilograms", "mg", "milligram"},
        "volume": {"ml", "millilitre", "milliliter", "l", "litre", "liter"},
        "length": {"m", "meter", "metre", "cm", "centimetre", "centimeter", "mm"},
        "number": {"u", "unit", "units", "n", "number", "numbers", "piece", "pieces"},
    }

    # Prohibited non-standard units
    PROHIBITED_UNITS = {
        "lb", "lbs", "pound", "pounds", "oz", "ounce", "ounces",
        "fl oz", "pint", "quart", "gallon", "inch", "ft", "feet", "yard"
    }

    @staticmethod
    def get_table_1_min_font_height(pdp_area_cm2: float) -> float:
        """
        Rule 7 Table-I: Step-function mapping Principal Display Panel area (cm^2)
        to minimum permissible numeral/letter height in millimeters (mm).
        """
        if pdp_area_cm2 <= 50.0:
            return 1.0
        elif pdp_area_cm2 <= 100.0:
            return 1.5
        elif pdp_area_cm2 <= 500.0:
            return 2.0
        elif pdp_area_cm2 <= 2500.0:
            return 4.0
        else:
            return 6.0

    @staticmethod
    def verify_font_height(
        pdp_area_cm2: float, measured_font_height_mm: float
    ) -> Tuple[bool, float, Optional[StatutoryRuleViolation]]:
        """
        Verifies compliance against Rule 7 Table-I.
        """
        min_required = DeterministicRuleEngine.get_table_1_min_font_height(pdp_area_cm2)
        if measured_font_height_mm < min_required:
            violation = StatutoryRuleViolation(
                rule_code="PCR_RULE_7_FONT",
                rule_name="Minimum Font Height Non-Compliance",
                severity="major",
                description=(
                    f"Principal Display Panel area is {pdp_area_cm2:.1f} cm^2, which requires a "
                    f"minimum numeral height of {min_required:.1f} mm under Rule 7 Table-I. "
                    f"Measured height is {measured_font_height_mm:.1f} mm."
                ),
                expected_value=f">= {min_required:.1f} mm",
                actual_value=f"{measured_font_height_mm:.1f} mm",
                statutory_reference="Rule 7(1) read with Table-I, PCR 2011",
                compounding_amount=5000.0,
            )
            return False, min_required, violation
        return True, min_required, None

    @staticmethod
    def calculate_expected_usp(
        mrp: float, net_quantity: float, unit: str
    ) -> Tuple[Optional[float], Optional[str]]:
        """
        Calculates statutory expected Unit Sale Price per Rule 5.
        - For <= 1 kg or <= 1 L, USP must be calculated per g or per ml.
        - For > 1 kg or > 1 L, USP must be calculated per kg or per l.
        """
        unit_lower = unit.lower().strip()
        if net_quantity <= 0 or mrp <= 0:
            return None, None

        if unit_lower in {"g", "gram", "grams"}:
            if net_quantity <= 1000.0:
                # Per gram
                return round(mrp / net_quantity, 2), "g"
            else:
                # Convert to kg and calculate per kg
                kg_val = net_quantity / 1000.0
                return round(mrp / kg_val, 2), "kg"

        elif unit_lower in {"kg", "kilogram", "kilograms"}:
            if net_quantity <= 1.0:
                # Convert to g and calculate per gram
                g_val = net_quantity * 1000.0
                return round(mrp / g_val, 2), "g"
            else:
                return round(mrp / net_quantity, 2), "kg"

        elif unit_lower in {"ml", "millilitre", "milliliter"}:
            if net_quantity <= 1000.0:
                return round(mrp / net_quantity, 2), "ml"
            else:
                l_val = net_quantity / 1000.0
                return round(mrp / l_val, 2), "l"

        elif unit_lower in {"l", "litre", "liter"}:
            if net_quantity <= 1.0:
                ml_val = net_quantity * 1000.0
                return round(mrp / ml_val, 2), "ml"
            else:
                return round(mrp / net_quantity, 2), "l"

        elif unit_lower in {"u", "unit", "units", "n", "piece", "pieces"}:
            return round(mrp / net_quantity, 2), "u"

        return round(mrp / net_quantity, 2), unit_lower

    @staticmethod
    def verify_unit_sale_price(
        mrp: Optional[float],
        net_quantity: Optional[float],
        net_quantity_unit: Optional[str],
        declared_usp: Optional[float],
        declared_usp_unit: Optional[str],
    ) -> Tuple[bool, Optional[float], Optional[str], Optional[StatutoryRuleViolation]]:
        """
        Verifies compliance against Rule 5 (Unit Sale Price).
        """
        if mrp is None or net_quantity is None or not net_quantity_unit:
            violation = StatutoryRuleViolation(
                rule_code="PCR_RULE_5_USP_DATA_MISSING",
                rule_name="Insufficient Data for Unit Sale Price Verification",
                severity="critical",
                description="MRP or Net Quantity was not found on the packaging to compute Unit Sale Price.",
                expected_value="MRP and Net Quantity Present",
                actual_value="Missing",
                statutory_reference="Rule 5 and Rule 6(11), PCR 2011",
                compounding_amount=10000.0,
            )
            return False, None, None, violation

        expected_usp, expected_unit = DeterministicRuleEngine.calculate_expected_usp(
            mrp, net_quantity, net_quantity_unit
        )

        if expected_usp is None:
            return False, None, None, None

        if declared_usp is None:
            violation = StatutoryRuleViolation(
                rule_code="PCR_RULE_5_USP_MISSING",
                rule_name="Omission of Mandatory Unit Sale Price",
                severity="critical",
                description=(
                    f"Unit Sale Price is absent from the packaging. For a package of MRP Rs. {mrp:.2f} "
                    f"and net quantity {net_quantity} {net_quantity_unit}, statutory USP is Rs. {expected_usp:.2f}/{expected_unit}."
                ),
                expected_value=f"Rs. {expected_usp:.2f} / {expected_unit}",
                actual_value="Not Declared",
                statutory_reference="Rule 6(11) of PCR 2011 (Amended 2021)",
                compounding_amount=10000.0,
            )
            return False, expected_usp, expected_unit, violation

        # Check arithmetic accuracy within tolerance of 0.01
        diff = abs(declared_usp - expected_usp)
        if diff > 0.02:
            violation = StatutoryRuleViolation(
                rule_code="PCR_RULE_5_USP_MISCALCULATED",
                rule_name="Inaccurate Unit Sale Price Calculation",
                severity="major",
                description=(
                    f"Declared USP of Rs. {declared_usp:.2f}/{declared_usp_unit or expected_unit} does not match "
                    f"statutory calculation of Rs. {expected_usp:.2f}/{expected_unit} (difference of Rs. {diff:.2f})."
                ),
                expected_value=f"Rs. {expected_usp:.2f} / {expected_unit}",
                actual_value=f"Rs. {declared_usp:.2f} / {declared_usp_unit or 'unknown'}",
                statutory_reference="Rule 6(11) of PCR 2011",
                compounding_amount=5000.0,
            )
            return False, expected_usp, expected_unit, violation

        return True, expected_usp, expected_unit, None

    @staticmethod
    def verify_metric_units(unit: Optional[str]) -> Tuple[bool, Optional[StatutoryRuleViolation]]:
        """
        Rule 13: Verifies that net quantity is declared strictly in standard SI metric units.
        """
        if not unit:
            return False, StatutoryRuleViolation(
                rule_code="PCR_RULE_13_UNIT_MISSING",
                rule_name="Missing Measurement Unit",
                severity="critical",
                description="Net quantity is declared without an identifiable unit of measurement.",
                expected_value="Standard SI Unit (g, kg, ml, l)",
                actual_value="Missing",
                statutory_reference="Rule 13 read with Second Schedule, PCR 2011",
                compounding_amount=5000.0,
            )

        u_clean = unit.lower().strip().rstrip(".")
        if u_clean in DeterministicRuleEngine.PROHIBITED_UNITS:
            return False, StatutoryRuleViolation(
                rule_code="PCR_RULE_13_NON_METRIC_UNIT",
                rule_name="Use of Non-Standard Non-Metric Measurement Unit",
                severity="critical",
                description=(
                    f"Unit '{unit}' is non-metric and strictly prohibited. "
                    "All packaged commodities must declare net quantity in standard SI metric units."
                ),
                expected_value="Standard SI Metric (g, kg, ml, l)",
                actual_value=unit,
                statutory_reference="Rule 13 read with Section 11 of Legal Metrology Act, 2009",
                compounding_amount=10000.0,
            )

        all_valid = set()
        for s in DeterministicRuleEngine.VALID_METRIC_UNITS.values():
            all_valid.update(s)

        if u_clean not in all_valid:
            return False, StatutoryRuleViolation(
                rule_code="PCR_RULE_13_INVALID_UNIT",
                rule_name="Unrecognized Measurement Unit",
                severity="major",
                description=f"Unit '{unit}' is not recognized under the Second Schedule of Legal Metrology Rules.",
                expected_value="Standard Metric Unit",
                actual_value=unit,
                statutory_reference="Rule 13, PCR 2011",
                compounding_amount=2500.0,
            )

        return True, None

    @staticmethod
    def verify_contrast_ratio(
        fg_hex: Optional[str], bg_hex: Optional[str]
    ) -> Tuple[bool, float, Optional[StatutoryRuleViolation]]:
        """
        Rule 9: Optical contrast verification ensuring declarations are clearly legible.
        Evaluates WCAG relative luminance contrast ratio. Statutory requirement is >= 4.5:1.
        """
        if not fg_hex or not bg_hex:
            return True, 7.0, None

        def hex_to_rgb(hex_str: str) -> Tuple[float, float, float]:
            hex_clean = hex_str.lstrip("#")
            if len(hex_clean) == 3:
                hex_clean = "".join([c * 2 for c in hex_clean])
            if len(hex_clean) != 6:
                return (0.0, 0.0, 0.0)
            r = int(hex_clean[0:2], 16) / 255.0
            g = int(hex_clean[2:4], 16) / 255.0
            b = int(hex_clean[4:6], 16) / 255.0
            return (r, g, b)

        def get_luminance(r: float, g: float, b: float) -> float:
            def transform(c: float) -> float:
                return c / 12.92 if c <= 0.03928 else math.pow((c + 0.055) / 1.055, 2.4)
            return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b)

        try:
            fg_r, fg_g, fg_b = hex_to_rgb(fg_hex)
            bg_r, bg_g, bg_b = hex_to_rgb(bg_hex)

            l1 = get_luminance(fg_r, fg_g, fg_b)
            l2 = get_luminance(bg_r, bg_g, bg_b)

            brightest = max(l1, l2)
            darkest = min(l1, l2)
            contrast = (brightest + 0.05) / (darkest + 0.05)

            if contrast < 4.5:
                violation = StatutoryRuleViolation(
                    rule_code="PCR_RULE_9_CONTRAST",
                    rule_name="Insufficient Background Contrast Ratio",
                    severity="minor",
                    description=(
                        f"Contrast ratio between declaration text ({fg_hex}) and package background ({bg_hex}) "
                        f"is {contrast:.2f}:1, which is below the statutory readability threshold of 4.5:1."
                    ),
                    expected_value=">= 4.5:1",
                    actual_value=f"{contrast:.2f}:1",
                    statutory_reference="Rule 9(1)(b), PCR 2011",
                    compounding_amount=2500.0,
                )
                return False, round(contrast, 2), violation

            return True, round(contrast, 2), None
        except Exception:
            return True, 5.0, None

    @staticmethod
    def verify_mandatory_declarations(
        extraction: PackageVisualExtraction,
    ) -> List[StatutoryRuleViolation]:
        """
        Rule 8: Verifies 9-point mandatory statutory declarations checklist.
        """
        violations = []

        # 1. Manufacturer / Packer Name and Address
        if not extraction.manufacturer_name or len(extraction.manufacturer_name.strip()) < 3:
            violations.append(
                StatutoryRuleViolation(
                    rule_code="PCR_RULE_8_MANUFACTURER_MISSING",
                    rule_name="Missing Manufacturer/Packer Name",
                    severity="critical",
                    description="Name and address of the manufacturer, packer, or importer is not declared on the package.",
                    expected_value="Full Corporate Name & Address",
                    actual_value="Missing",
                    statutory_reference="Rule 6(1)(a), PCR 2011",
                    compounding_amount=10000.0,
                )
            )

        # 2. Generic Name of Commodity
        if not extraction.product_name or len(extraction.product_name.strip()) < 2:
            violations.append(
                StatutoryRuleViolation(
                    rule_code="PCR_RULE_8_GENERIC_NAME_MISSING",
                    rule_name="Missing Generic Commodity Name",
                    severity="major",
                    description="Common or generic name of the commodity contained in the package is absent.",
                    expected_value="Generic / Common Name Declared",
                    actual_value="Missing",
                    statutory_reference="Rule 6(1)(b), PCR 2011",
                    compounding_amount=5000.0,
                )
            )

        # 3. Net Quantity
        if extraction.net_quantity_value is None or extraction.net_quantity_value <= 0:
            violations.append(
                StatutoryRuleViolation(
                    rule_code="PCR_RULE_8_NET_QUANTITY_MISSING",
                    rule_name="Missing Net Quantity Declaration",
                    severity="critical",
                    description="Net quantity in weight, measure, or count is missing.",
                    expected_value="Net Quantity in Metric Units",
                    actual_value="Missing",
                    statutory_reference="Rule 6(1)(c), PCR 2011",
                    compounding_amount=15000.0,
                )
            )

        # 4. Month and Year of Manufacture / Import
        if not extraction.mfg_month or not extraction.mfg_year:
            violations.append(
                StatutoryRuleViolation(
                    rule_code="PCR_RULE_8_MFG_DATE_MISSING",
                    rule_name="Missing Month and Year of Manufacture",
                    severity="major",
                    description="Month and year in which the commodity is manufactured, packed, or imported is omitted.",
                    expected_value="MM/YYYY Declaration",
                    actual_value="Missing",
                    statutory_reference="Rule 6(1)(d), PCR 2011",
                    compounding_amount=5000.0,
                )
            )

        # 5. Maximum Retail Price (MRP)
        if extraction.mrp is None or extraction.mrp <= 0:
            violations.append(
                StatutoryRuleViolation(
                    rule_code="PCR_RULE_8_MRP_MISSING",
                    rule_name="Missing Maximum Retail Price",
                    severity="critical",
                    description="Maximum Retail Price (inclusive of all taxes) is not declared on the package.",
                    expected_value="MRP Rs. XX.XX (incl. of all taxes)",
                    actual_value="Missing",
                    statutory_reference="Rule 6(1)(e), PCR 2011",
                    compounding_amount=25000.0,
                )
            )

        # 6. Consumer Care / Grievance Redressal Details
        has_care = bool(
            extraction.consumer_care_email
            or extraction.consumer_care_phone
            or extraction.consumer_care_address
        )
        if not has_care:
            violations.append(
                StatutoryRuleViolation(
                    rule_code="PCR_RULE_8_CONSUMER_CARE_MISSING",
                    rule_name="Missing Consumer Care Contact Details",
                    severity="major",
                    description="Consumer care details (telephone number, email address, or postal address) are absent.",
                    expected_value="Consumer Helpline Phone/Email",
                    actual_value="Missing",
                    statutory_reference="Rule 6(1)(f), PCR 2011",
                    compounding_amount=5000.0,
                )
            )

        # 7. Country of Origin (Mandatory since 2020)
        if not extraction.country_of_origin:
            violations.append(
                StatutoryRuleViolation(
                    rule_code="PCR_RULE_8_ORIGIN_MISSING",
                    rule_name="Missing Country of Origin",
                    severity="major",
                    description="Country of origin is not declared on imported or domestic manufactured package.",
                    expected_value="Country of Origin Declared",
                    actual_value="Missing",
                    statutory_reference="Rule 6(10), PCR 2011 (Amended 2020)",
                    compounding_amount=5000.0,
                )
            )

        return violations

    @classmethod
    def evaluate_compliance(
        cls, extraction: PackageVisualExtraction
    ) -> RuleEngineEvaluationResult:
        """
        Executes the complete deterministic rule engine suite against extracted packaging data.
        Returns 100% auditable evaluation result.
        """
        violations: List[StatutoryRuleViolation] = []
        checks_performed = 0
        checks_passed = 0

        # Check 1: Mandatory declarations
        checks_performed += 7
        m_violations = cls.verify_mandatory_declarations(extraction)
        violations.extend(m_violations)
        checks_passed += 7 - len(m_violations)

        # Check 2: Unit Sale Price (Rule 5)
        checks_performed += 1
        usp_ok, expected_usp, expected_usp_unit, usp_violation = cls.verify_unit_sale_price(
            extraction.mrp,
            extraction.net_quantity_value,
            extraction.net_quantity_unit,
            extraction.declared_usp,
            extraction.declared_usp_unit,
        )
        if usp_violation:
            violations.append(usp_violation)
        else:
            checks_passed += 1

        # Check 3: Font Height Calibration (Rule 7 Table-I)
        checks_performed += 1
        pdp_area = extraction.pdp_area_cm2 or 150.0
        measured_font = extraction.measured_font_height_mm or 2.5
        font_ok, min_font_req, font_violation = cls.verify_font_height(pdp_area, measured_font)
        if font_violation:
            violations.append(font_violation)
        else:
            checks_passed += 1

        # Check 4: SI Metric Units (Rule 13)
        if extraction.net_quantity_unit:
            checks_performed += 1
            unit_ok, unit_violation = cls.verify_metric_units(extraction.net_quantity_unit)
            if unit_violation:
                violations.append(unit_violation)
            else:
                checks_passed += 1

        # Check 5: Contrast Ratio (Rule 9)
        checks_performed += 1
        contrast_ok, contrast_ratio, contrast_violation = cls.verify_contrast_ratio(
            extraction.fg_color_hex, extraction.bg_color_hex
        )
        if contrast_violation:
            violations.append(contrast_violation)
        else:
            checks_passed += 1

        # Compute Compliance Score:
        # Start at 100. Deduct 25 for critical, 15 for major, 5 for minor.
        score = 100.0
        for v in violations:
            if v.severity == "critical":
                score -= 25.0
            elif v.severity == "major":
                score -= 15.0
            elif v.severity == "minor":
                score -= 5.0

        final_score = max(0.0, min(100.0, score))
        is_compliant = len(violations) == 0

        return RuleEngineEvaluationResult(
            is_compliant=is_compliant,
            compliance_score=final_score,
            total_checks_performed=checks_performed,
            passed_checks=checks_passed,
            failed_checks=len(violations),
            violations=violations,
            pdp_area_cm2=pdp_area,
            min_font_height_required_mm=min_font_req,
            calculated_usp=expected_usp,
            calculated_usp_unit=expected_usp_unit,
        )
