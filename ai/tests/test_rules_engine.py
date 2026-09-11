import pytest
from ai.src.pipeline.extractor import PackageVisualExtraction, RawDeclarationToken, BoundingBox
from ai.src.rules.deterministic import DeterministicRuleEngine


def test_rule_5_usp_calculation_under_one_kg():
    """
    Test Rule 5: For commodity <= 1kg, USP must be calculated per gram.
    Package: MRP Rs. 100.00, Net Wt: 200g. Expected USP: Rs. 0.50 / g.
    """
    expected_usp, unit = DeterministicRuleEngine.calculate_expected_usp(
        mrp=100.0, net_quantity=200.0, unit="g"
    )
    assert expected_usp == 0.50
    assert unit == "g"

    # Test verification passing when declared correctly
    ok, usp_val, usp_unit, violation = DeterministicRuleEngine.verify_unit_sale_price(
        mrp=100.0,
        net_quantity=200.0,
        net_quantity_unit="g",
        declared_usp=0.50,
        declared_usp_unit="g",
    )
    assert ok is True
    assert violation is None


def test_rule_5_usp_calculation_over_one_kg():
    """
    Test Rule 5: For commodity > 1kg, USP must be calculated per kilogram.
    Package: MRP Rs. 500.00, Net Wt: 2500g (2.5kg). Expected USP: Rs. 200.00 / kg.
    """
    expected_usp, unit = DeterministicRuleEngine.calculate_expected_usp(
        mrp=500.0, net_quantity=2500.0, unit="g"
    )
    assert expected_usp == 200.00
    assert unit == "kg"


def test_rule_5_usp_miscalculated_violation():
    """
    Test Rule 5: Flag miscalculated USP.
    """
    ok, usp_val, usp_unit, violation = DeterministicRuleEngine.verify_unit_sale_price(
        mrp=120.0,
        net_quantity=500.0,
        net_quantity_unit="g",
        declared_usp=0.50,  # Incorrect, should be 0.24
        declared_usp_unit="g",
    )
    assert ok is False
    assert violation is not None
    assert violation.rule_code == "PCR_RULE_5_USP_MISCALCULATED"
    assert violation.severity == "major"


def test_rule_7_font_height_step_function():
    """
    Test Rule 7 Table-I step-function mapping:
    <= 50 cm2 -> 1.0mm
    50 - 100 cm2 -> 1.5mm
    100 - 500 cm2 -> 2.0mm
    500 - 2500 cm2 -> 4.0mm
    > 2500 cm2 -> 6.0mm
    """
    assert DeterministicRuleEngine.get_table_1_min_font_height(40.0) == 1.0
    assert DeterministicRuleEngine.get_table_1_min_font_height(75.0) == 1.5
    assert DeterministicRuleEngine.get_table_1_min_font_height(250.0) == 2.0
    assert DeterministicRuleEngine.get_table_1_min_font_height(1000.0) == 4.0
    assert DeterministicRuleEngine.get_table_1_min_font_height(3000.0) == 6.0


def test_rule_7_font_height_violation():
    """
    Package PDP Area = 150 cm2 (requires min 2.0mm).
    Measured Font Height = 1.2mm.
    Must flag violation.
    """
    ok, min_req, violation = DeterministicRuleEngine.verify_font_height(
        pdp_area_cm2=150.0, measured_font_height_mm=1.2
    )
    assert ok is False
    assert min_req == 2.0
    assert violation is not None
    assert violation.rule_code == "PCR_RULE_7_FONT"
    assert violation.severity == "major"


def test_rule_8_mandatory_declarations_complete():
    """
    Fully compliant package with all 7 checked declarations.
    """
    extraction = PackageVisualExtraction(
        brand_name="Tata Salt",
        product_name="Iodised Table Salt",
        mrp=28.0,
        declared_usp=0.028,
        declared_usp_unit="g",
        net_quantity_value=1000.0,
        net_quantity_unit="g",
        pdp_area_cm2=180.0,
        measured_font_height_mm=2.5,
        mfg_month=6,
        mfg_year=2026,
        expiry_month=6,
        expiry_year=2027,
        consumer_care_email="care@tataconsumer.com",
        manufacturer_name="Tata Consumer Products Ltd",
        country_of_origin="India",
        fg_color_hex="#000000",
        bg_color_hex="#FFFFFF",
    )

    result = DeterministicRuleEngine.evaluate_compliance(extraction)
    assert result.is_compliant is True
    assert result.compliance_score == 100.0
    assert len(result.violations) == 0


def test_rule_8_missing_manufacturer_and_mrp():
    """
    Non-compliant package missing manufacturer name and MRP.
    """
    extraction = PackageVisualExtraction(
        product_name="Generic Biscuits",
        mrp=None,
        net_quantity_value=100.0,
        net_quantity_unit="g",
        manufacturer_name=None,
        country_of_origin="India",
        consumer_care_email="care@example.com",
        mfg_month=2,
        mfg_year=2025,
    )

    result = DeterministicRuleEngine.evaluate_compliance(extraction)
    assert result.is_compliant is False
    assert result.compliance_score < 100.0

    violation_codes = [v.rule_code for v in result.violations]
    assert "PCR_RULE_8_MANUFACTURER_MISSING" in violation_codes
    assert "PCR_RULE_8_MRP_MISSING" in violation_codes


def test_rule_13_prohibited_units():
    """
    Rule 13: Rejection of non-metric prohibited units (e.g. lbs, oz).
    """
    ok, violation = DeterministicRuleEngine.verify_metric_units("lbs")
    assert ok is False
    assert violation is not None
    assert violation.rule_code == "PCR_RULE_13_NON_METRIC_UNIT"

    ok_g, violation_g = DeterministicRuleEngine.verify_metric_units("g")
    assert ok_g is True
    assert violation_g is None


def test_rule_9_contrast_ratio():
    """
    Rule 9: Dark text on light background passes; low contrast fails.
    """
    # Black on White: Contrast ~21:1 -> Pass
    ok_high, ratio_high, v_high = DeterministicRuleEngine.verify_contrast_ratio("#000000", "#FFFFFF")
    assert ok_high is True
    assert ratio_high >= 4.5
    assert v_high is None

    # Light grey on white: Contrast < 4.5:1 -> Fail
    ok_low, ratio_low, v_low = DeterministicRuleEngine.verify_contrast_ratio("#CCCCCC", "#FFFFFF")
    assert ok_low is False
    assert v_low is not None
    assert v_low.rule_code == "PCR_RULE_9_CONTRAST"
