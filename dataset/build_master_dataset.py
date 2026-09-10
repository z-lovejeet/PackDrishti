"""
Master Dataset Builder for PackDrashiti
Parses, structures, cleans, and merges:
1. The Legal Metrology (Packaged Commodities) Rules, 2011 (Pages 37 to 83 of Gazette G.S.R. 202(E))
   - Rules 1 to 34 (Preliminary, Retail Declarations, Wholesale, Exports, Exemptions, Registration, Penalties)
   - First Schedule (Maximum Permissible Errors on net quantity - Table I & Table II)
   - Second Schedule (Standard packaging sizes for all commodities)
   - Third Schedule ('When Packed' qualified commodities)
   - Fourth Schedule (Exceptions for declaration by weight/measure/number)
   - Fifth Schedule (Sampling plans and lot sizes)
   - Sixth Schedule (Testing procedures for net quantity & tare determination)
   - Seventh Schedule (Official inspection reporting forms)
2. Existing Legal Metrology Metric Standards Dataset (cleaned_rules_2026.json)
Generates:
- dataset/cleaned_rules_2011_2026.json
- dataset/cleaned_rules_2011_2026.csv
"""

import os
import json
import csv
from typing import List, Dict, Any

def build_rules_2011_entries() -> List[Dict[str, Any]]:
    rules = [
        # Preliminary
        {
            "rule_id": "LMPC_2011_R01",
            "rule_number": "Rule 1",
            "title": "Short Title and Commencement",
            "chapter": "Chapter I: Preliminary",
            "statutory_act": "Legal Metrology Act, 2009 (1 of 2010)",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "Notification G.S.R. 202(E), dated 7th March 2011",
            "summary": "These rules may be called The Legal Metrology (Packaged Commodities) Rules, 2011. They came into force on the 1st day of April, 2011.",
            "category": "Preliminary",
            "enforcement_clause": "Foundational statutory citation governing pre-packaged commodities throughout India.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_R02_DEFINITIONS",
            "rule_number": "Rule 2",
            "title": "Statutory Definitions (Dealer, Manufacturer, Packer, Net Quantity, PDP, Retail Package)",
            "chapter": "Chapter I: Preliminary",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 2",
            "summary": "Defines statutory terms including 'dealer', 'lot', 'manufacturer' (including brand owners claiming product), 'Maximum permissible error' (First Schedule), 'net quantity' (excluding packaging/wrappers), 'packer', 'principal display panel' (total surface area for required information), 'retail dealer', 'retail package' (for ultimate consumers, excluding industrial/institutional), 'retail sale price' (MRP inclusive of all taxes with paise rounding rules), and 'wholesale package'.",
            "category": "Definitions",
            "enforcement_clause": "Legal basis for establishing liability between manufacturer, packer, marketer, and retail dealer.",
            "priority": "High"
        },
        # Applicability & Regulations
        {
            "rule_id": "LMPC_2011_R03",
            "rule_number": "Rule 3",
            "title": "Applicability of Chapter II (Retail Packages)",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 3",
            "summary": "Exempts packages containing quantity of more than 25 kg or 25 litres (excluding cement and fertilizer sold in bags up to 50 kg), and packaged commodities meant for industrial or institutional consumers.",
            "category": "Applicability",
            "enforcement_clause": "Delineates retail scope vs industrial/bulk wholesale exemptions.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_R04",
            "rule_number": "Rule 4",
            "title": "Regulation for Pre-packing and Sale of Commodities in Packaged Form",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 4",
            "summary": "Prohibits pre-packing, sale, distribution, or delivery of commodities unless the package or label bears all statutory declarations. Packages within manufacturer premises without MRP are not in violation provided MRP is affixed before leaving premises.",
            "category": "General Regulation",
            "enforcement_clause": "Section 36(1) prosecution for dispatching packages lacking mandatory declarations.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_R05",
            "rule_number": "Rule 5",
            "title": "Specific Commodities in Recommended Standard Packages",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 5 read with Second Schedule",
            "summary": "Mandates that commodities specified in the Second Schedule must be packed in prescribed standard quantities. If packed in non-standard sizes, package must prominently declare: 'Not a standard pack size under the Legal Metrology (Packaged Commodities) Rules, 2011' or 'non standard size under the Legal Metrology (Packaged Commodities) Rules, 2011'.",
            "category": "Packaging Standards",
            "enforcement_clause": "Mandatory non-standard pack size warning label required under Rule 5 Proviso.",
            "priority": "High"
        },
        # Rule 6 Mandatory Declarations
        {
            "rule_id": "LMPC_2011_R06_1_A",
            "rule_number": "Rule 6(1)(a)",
            "title": "Name and Complete Address of Manufacturer, Packer, or Importer",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 6(1)(a)",
            "summary": "Every package must bear the name and complete address of the manufacturer, or manufacturer and packer if different, and for imported packages, the importer. If brand owner/marketer appears, marketer is held responsible. Food packages also governed by FSSAI/PFA requirements.",
            "category": "Mandatory Declarations",
            "enforcement_clause": "Section 36(1) fine of up to Rs. 25,000 for missing or incomplete manufacturer/packer/importer details.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_R06_1_B",
            "rule_number": "Rule 6(1)(b)",
            "title": "Common or Generic Names of the Commodity",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 6(1)(b)",
            "summary": "The common or generic name of the commodity must be prominently declared on the package. For packages containing more than one product, the name and number or quantity of each product shall be declared.",
            "category": "Mandatory Declarations",
            "enforcement_clause": "Section 36(1) prosecution for deceptive or omitted generic commodity name.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_R06_1_C",
            "rule_number": "Rule 6(1)(c)",
            "title": "Net Quantity in Standard SI Metric Units",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 6(1)(c)",
            "summary": "The net quantity in terms of standard unit of weight or measure (SI units: g, kg, ml, l, m, cm, mm, N, U) or number contained in the package must be declared, excluding wrappers and tare.",
            "category": "Mandatory Declarations",
            "enforcement_clause": "Section 36(1) infraction for missing net quantity or use of non-metric units.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_R06_1_D",
            "rule_number": "Rule 6(1)(d)",
            "title": "Month and Year of Manufacture, Pre-packing, or Import",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 6(1)(d)",
            "summary": "Mandates declaration of month and year of manufacture, pre-packing, or import. Rubber stamping without overwriting is permissible. Food articles also adhere to FSSAI expiry/best-before standards.",
            "category": "Mandatory Declarations",
            "enforcement_clause": "Section 36(1) infraction for absent or illegible manufacturing/packing date.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_R06_1_E_MRP",
            "rule_number": "Rule 6(1)(e)",
            "title": "Retail Sale Price (MRP Inclusive of All Taxes) and Unit Sale Price (USP)",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 6(1)(e) as amended",
            "summary": "The retail sale price of the package must be declared as 'Maximum or Max. retail price Rs...../...... inclusive of all taxes' or 'MRP Rs....../...... incl., of all taxes'. In addition, Unit Sale Price (USP) must be declared per g/kg (for weight), per ml/l (for volume), or per item/piece (for number), rounded off to two decimal places.",
            "category": "Mandatory Declarations",
            "enforcement_clause": "Section 36(1) compounding assessment for absent USP, incorrect rounding, or charging above MRP.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_R06_1_F",
            "rule_number": "Rule 6(1)(f)",
            "title": "Dimensions and Size Specifications",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 6(1)(f)",
            "summary": "Where the sizes or dimensions of the commodity are relevant, the dimensions of the commodity and of each different piece contained in the package must be declared.",
            "category": "Mandatory Declarations",
            "enforcement_clause": "Mandatory for textiles, bedsheets, paper sheets, and dimensional consumer goods.",
            "priority": "Medium"
        },
        {
            "rule_id": "LMPC_2011_R06_2",
            "rule_number": "Rule 6(2)",
            "title": "Consumer Complaint Redressal Contact Particulars",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 6(2)",
            "summary": "Every package must bear the name, address, telephone number, and E-mail address (if available) of the person or office that can be contacted in case of consumer complaints.",
            "category": "Consumer Protection",
            "enforcement_clause": "Section 36(1) violation for missing consumer redressal phone number, email, or contact point.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_R06_3_STICKERS",
            "rule_number": "Rule 6(3)",
            "title": "Prohibition of Individual Stickers (Except for MRP Reduction)",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 6(3)",
            "summary": "It is strictly unlawful to affix individual stickers on packages for altering or making required declarations. PROVISO: A sticker with a revised lower MRP (inclusive of all taxes) is permissible provided it does NOT cover or obscure the original manufacturer MRP.",
            "category": "Anti-Tampering",
            "enforcement_clause": "Section 36(1) fine and seizure for unlawful stickers altering price or dates.",
            "priority": "High"
        },
        # Rule 7 Principal Display Panel, Table-I & Table-II Font Sizes
        {
            "rule_id": "LMPC_2011_R07_TABLE_I",
            "rule_number": "Rule 7(2) Table-I",
            "title": "Minimum Height of Numerals for Net Quantity by Weight or Volume",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 7 Table-I",
            "summary": "Prescribes minimum height of numerals on Principal Display Panel based on net quantity by weight/volume: (1) Up to 200g/ml: Normal 1.0 mm, Blown/formed/moulded 2.0 mm; (2) Above 200g/ml up to 500g/ml: Normal 2.0 mm, Blown/formed/moulded 4.0 mm; (3) Above 500g/ml: Normal 4.0 mm, Blown/formed/moulded 6.0 mm. Letter height >= 1.0 mm (normal) / 2.0 mm (moulded). Letter width must be >= 1/3 height (except '1', 'i', 'l', 'I').",
            "category": "Optical Calibration",
            "table_data": [
                {"tier": "Up to 200 g/ml", "normal_min_height_mm": 1.0, "moulded_min_height_mm": 2.0},
                {"tier": "Above 200 g/ml up to 500 g/ml", "normal_min_height_mm": 2.0, "moulded_min_height_mm": 4.0},
                {"tier": "Above 500 g/ml", "normal_min_height_mm": 4.0, "moulded_min_height_mm": 6.0}
            ],
            "enforcement_clause": "Section 36(1) compounding for sub-standard font height below statutory threshold.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_R07_TABLE_II",
            "rule_number": "Rule 7(2) Table-II",
            "title": "Minimum Height of Numerals for Net Quantity by Length, Area, or Number",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 7 Table-II",
            "summary": "Prescribes minimum height of numerals on Principal Display Panel based on PDP area: (1) Up to 100 cm2: Normal 1.0 mm, Blown 2.0 mm; (2) Above 100 cm2 up to 500 cm2: Normal 2.0 mm, Blown 4.0 mm; (3) Above 500 cm2 up to 2500 cm2: Normal 4.0 mm, Blown 6.0 mm; (4) Above 2500 cm2: Normal 6.0 mm, Blown 6.0 mm.",
            "category": "Optical Calibration",
            "table_data": [
                {"area_tier": "Up to 100 cm2", "normal_min_height_mm": 1.0, "moulded_min_height_mm": 2.0},
                {"area_tier": "Above 100 cm2 up to 500 cm2", "normal_min_height_mm": 2.0, "moulded_min_height_mm": 4.0},
                {"area_tier": "Above 500 cm2 up to 2500 cm2", "normal_min_height_mm": 4.0, "moulded_min_height_mm": 6.0},
                {"area_tier": "Above 2500 cm2", "normal_min_height_mm": 6.0, "moulded_min_height_mm": 6.0}
            ],
            "enforcement_clause": "Mathematical verification of PDP font dimensions against measured surface area.",
            "priority": "High"
        },
        # Rule 8 Quiet Zone / Margins & Rule 9 Contrast
        {
            "rule_id": "LMPC_2011_R08",
            "rule_number": "Rule 8",
            "title": "Declaration Location and Quiet Zone Surrounding Quantity",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 8",
            "summary": "Every declaration must appear on the Principal Display Panel. The area surrounding the net quantity declaration must remain completely free of printed text: (a) above and below by a space equal to at least the height of the numeral; (b) to the left and right by a space at least twice the height of the numeral. For returnable bottles, MRP on crown cap or bottle is permissible.",
            "category": "Label Layout & Margins",
            "enforcement_clause": "Non-compliance if text or decorative artwork encroaches on statutory quiet zone margins.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_R09",
            "rule_number": "Rule 9",
            "title": "Prominence, Color Contrast, and Outer Wrapper Visibility",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 9",
            "summary": "Declarations must be legible and prominent. Numerals of retail sale price and net quantity must contrast conspicuously with the background. No declaration may be obscured or require reading through liquid. Outside transparent wrappers must allow full readability of inner declarations, otherwise outer wrapper must duplicate all declarations.",
            "category": "Optical & Contrast Standards",
            "enforcement_clause": "WCAG contrast ratio audit (< 4.5:1 on label background constitutes statutory infraction).",
            "priority": "High"
        },
        # Rule 10 to 17 Address, Net Quantity, Units
        {
            "rule_id": "LMPC_2011_R10",
            "rule_number": "Rule 10",
            "title": "Complete Manufacturer Postal Address and PIN Code",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 10",
            "summary": "Requires full corporate/registered postal address with street, premises number, city, State, and Postal Index Number (PIN) Code. For packages <= 5 cc, identification mark or inscription is permissible.",
            "category": "Manufacturer Details",
            "enforcement_clause": "Deficient declaration if city, State, or 6-digit PIN code is missing.",
            "priority": "Medium"
        },
        {
            "rule_id": "LMPC_2011_R11",
            "rule_number": "Rule 11",
            "title": "Net Quantity Exclusion of Wrappers and 'When Packed' Prohibitions",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 11",
            "summary": "Net quantity must strictly exclude tare weight of wrappers and containers. Where commodity is not subject to environmental variations, 'when packed' qualification is prohibited. 'When packed' is permitted exclusively for commodities listed in the Third Schedule (soaps, lotions, creams).",
            "category": "Quantity Verification",
            "enforcement_clause": "Unlawful use of 'when packed' on non-scheduled commodities constitutes statutory offence.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_R12",
            "rule_number": "Rule 12",
            "title": "Manner of Expressing Quantity (Mass vs Volume vs Linear vs Number)",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 12",
            "summary": "Solids, semi-solids, viscous commodities must be declared in mass. Liquids and cubic measures in volume. Linear goods in length. Area measures in area. Prohibits misleading expressions like 'minimum', 'not less than', 'average', 'about', 'approximately'.",
            "category": "Quantity Verification",
            "enforcement_clause": "Strict prohibition of subjective quantity qualifiers ('approx', 'about', 'min').",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_R13_UNITS",
            "rule_number": "Rule 13",
            "title": "SI Metric Unit Symbols and Prohibition of Non-Standard Units",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 13",
            "summary": "Permitted metric symbols: kg, g, mg, l, ml, m, cm, mm. Prohibits obsolete abbreviations (gm, gms, gm., kg., kilo, ltr, cc, sec, hr). Prohibits words like dozen, score, gross, great gross. Items sold by number must use symbol N or U.",
            "category": "Metric SI Compliance",
            "permitted_symbols": ["kg", "g", "mg", "l", "ml", "m", "cm", "mm", "N", "U"],
            "prohibited_symbols": ["gm", "gms", "gm.", "kg.", "kilo", "ltr", "ltr.", "cc", "dozen", "score", "gross"],
            "enforcement_clause": "Section 36(1) violation for non-standard metric abbreviations.",
            "priority": "High"
        },
        # Rule 18 Pricing & Enforcement
        {
            "rule_id": "LMPC_2011_R18_OVERPRICING",
            "rule_number": "Rule 18(2)",
            "title": "Prohibition of Selling Above Maximum Retail Price (MRP)",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 18(2)",
            "summary": "No retail dealer or other person (including manufacturer, packer, importer, wholesale dealer) shall sell any packaged commodity at a price exceeding the marked retail sale price (MRP).",
            "category": "Enforcement & Pricing",
            "enforcement_clause": "Section 36(1) prosecution and compounding for charging in excess of declared MRP.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_R18_SMUDGING",
            "rule_number": "Rule 18(5)",
            "title": "Prohibition of Obliterating, Smudging, or Altering MRP",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 18(5)",
            "summary": "No dealer or person shall obliterate, smudge, or alter the retail sale price indicated on the package or label by the manufacturer, packer, or importer.",
            "category": "Enforcement & Pricing",
            "enforcement_clause": "Prosecution for price tampering or smudging under Section 36(1).",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_R18_DUAL_MRP",
            "rule_number": "Rule 18(2A)",
            "title": "Prohibition of Dual MRP on Identical Pre-Packaged Commodities",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011 (Amended)",
            "gazette_reference": "G.S.R. 592(E) / Rule 18(2A)",
            "summary": "No person shall declare different maximum retail prices (Dual MRP) on an identical pre-packaged commodity in different geographical areas or sales channels (e.g. airports, cinema halls, premium lounges vs retail stores).",
            "category": "Enforcement & Pricing",
            "enforcement_clause": "Strict prohibition of dual pricing under Legal Metrology Act and consumer court precedent.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_R18_WEIGHING_MACHINE",
            "rule_number": "Rule 18(7)",
            "title": "Mandatory Class III Electronic Weighing Machine in Retail Stores",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 18(7)",
            "summary": "All VAT/TOT registered retailers dealing in commodities by weight or volume must provide a free-of-cost verified Class III electronic weighing machine with minimum 1 gram division and printed receipt facility at a prominent location for consumer verification.",
            "category": "Retail Infrastructure",
            "enforcement_clause": "Inspectors may issue show-cause notices for failure to maintain consumer check-weighing facility.",
            "priority": "Medium"
        },
        # Rule 19 to 23 Inspections, Errors & Deceptive Packages
        {
            "rule_id": "LMPC_2011_R19_INSPECTIONS",
            "rule_number": "Rule 19",
            "title": "Inspection Protocol at Manufacturer/Packer Premises and Lot Testing",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 19",
            "summary": "Empowers Legal Metrology Officers to inspect and test sample packages drawn per the Fifth Schedule and tested per the Sixth Schedule. If non-conforming, manufacturer must conduct 100% check of lot to isolate conforming units. Fresh testing fee is Rs. 2,500.",
            "category": "Field Inspection Protocol",
            "enforcement_clause": "Authority to seize 5 representative sample packages as courtroom evidence.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_R23_DECEPTIVE",
            "rule_number": "Rule 23",
            "title": "Prohibition of Deceptive Packaging (Slack Fill & Excessive Headspace)",
            "chapter": "Chapter II: Provisions Applicable to Packages Intended for Retail Sale",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 23",
            "summary": "Packages designed to give consumers an exaggerated or misleading impression of the quantity contained (excessive headspace, oversized non-functional volume) are deceptive packages. Officer may order repacking/relabling or seize the lot.",
            "category": "Packaging Standards",
            "enforcement_clause": "Immediate seizure of deceptive packages under Section 15 of Legal Metrology Act.",
            "priority": "High"
        },
        # Rule 24 Wholesale Packages
        {
            "rule_id": "LMPC_2011_R24_WHOLESALE",
            "rule_number": "Rule 24",
            "title": "Mandatory Declarations on Wholesale Packages",
            "chapter": "Chapter III: Provisions Applicable to Wholesale Packages",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 24",
            "summary": "Wholesale packages must bear: (a) name and address of manufacturer/packer/importer; (b) identity of the commodity; (c) total number of retail packages or net quantity in standard units of weight/measure/number.",
            "category": "Wholesale Regulation",
            "enforcement_clause": "Section 36(1) applies to wholesale non-compliance.",
            "priority": "Medium"
        },
        # Rule 25 Export Packages
        {
            "rule_id": "LMPC_2011_R25_EXPORT",
            "rule_number": "Rule 25",
            "title": "Restrictions on Sale of Export Packages in India",
            "chapter": "Chapter IV: Export of Packaged Commodities",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 25",
            "summary": "Packages intended for export cannot be sold in domestic Indian market unless repacked or relabeled in full compliance with Chapter II. Non-compliant export packages sold domestically are liable to immediate seizure.",
            "category": "Export Compliance",
            "enforcement_clause": "Seizure of export diversion packages under Section 15.",
            "priority": "High"
        },
        # Rule 26 Exemptions
        {
            "rule_id": "LMPC_2011_R26_EXEMPTIONS",
            "rule_number": "Rule 26",
            "title": "Statutory Exemptions for Packages <= 10g/10ml, Fast Food, DPCO, and Farm Produce",
            "chapter": "Chapter V: Exemptions",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 26",
            "summary": "Exempts: (a) packages with net weight/measure <= 10g or 10ml (PROVISO: MRP and net quantity MUST be declared on packages between 10g-20g or 10ml-20ml); (b) fast food packed by hotels/restaurants; (c) scheduled/non-scheduled formulations under Drugs (Price Control) Order (DPCO); (d) agricultural farm produce in packages above 50 kg.",
            "category": "Exemptions",
            "enforcement_clause": "Exemption threshold boundaries audit (10g/20g rule).",
            "priority": "High"
        },
        # Rule 27 to 31 Registration
        {
            "rule_id": "LMPC_2011_R27_REGISTRATION",
            "rule_number": "Rule 27",
            "title": "Mandatory Registration of Manufacturers, Packers, and Importers",
            "chapter": "Chapter VI: Registration of Manufacturers, Packers and Importers",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 27",
            "summary": "All entities pre-packing or importing commodities must apply for registration with Director/Controller within 90 days. Application fee is Rs. 500. Alteration fee is Rs. 100. Registering authority returns incomplete forms within 7 working days.",
            "category": "Registration & Licensing",
            "enforcement_clause": "Penalty of Rs. 4,000 under Rule 32 for operating without LMPC registration.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_R31_ADVERTISEMENTS",
            "rule_number": "Rule 31",
            "title": "Mandatory Declaration of Net Quantity in Price Advertisements",
            "chapter": "Chapter VII: General",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 31",
            "summary": "Any advertisement mentioning retail sale price of a pre-packaged commodity must also state net quantity or count in the same font size as the retail sale price.",
            "category": "Advertising Standards",
            "enforcement_clause": "Penalty under Rule 32 for misleading price advertisements lacking quantity.",
            "priority": "Medium"
        },
        {
            "rule_id": "LMPC_2011_R32_PENALTIES",
            "rule_number": "Rule 32",
            "title": "Statutory Penalties for Contravention of Packaged Commodities Rules",
            "chapter": "Chapter VII: General",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Part II Sec. 3(i), Rule 32",
            "summary": "Penalties for contraventions: (1) Rules 27 to 31: fine of Rs. 4,000; (2) General contravention of other provisions where no specific penalty is provided: fine of Rs. 2,000. Upgraded under Section 36(1) of Legal Metrology Act (Rs. 25,000 for 1st offence, Rs. 50,000 for 2nd offence, up to Rs. 1,00,000 / imprisonment for subsequent offences).",
            "category": "Penalties & Compounding",
            "enforcement_clause": "Statutory basis for Compounding Calculator under Section 48.",
            "priority": "High"
        },
        # Schedules
        {
            "rule_id": "LMPC_2011_SCH_01_MPE",
            "rule_number": "First Schedule [Rule 2(e)]",
            "title": "Maximum Permissible Errors (MPE) on Net Quantity Declared by Weight or Volume",
            "chapter": "The First Schedule",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) First Schedule Table-I",
            "summary": "Defines Maximum Permissible Error (MPE) in deficiency/excess: (i) Up to 50g/ml: 9.0%; (ii) 50 to 100g/ml: 4.5g/ml; (iii) 100 to 200g/ml: 4.5%; (iv) 200 to 300g/ml: 9.0g/ml; (v) 300 to 500g/ml: 3.0%; (vi) 500 to 1000g/ml: 15.0g/ml; (vii) 1000 to 10000g/ml: 1.5%; (viii) 10000 to 15000g/ml: 150g/ml; (ix) Above 15000g/ml: 1.0%. Percentage error rounded to 0.1g/ml for <=1000g/ml and whole g/ml above 1000g/ml.",
            "category": "Mathematical Tolerance Engine",
            "mpe_table": [
                {"range_min": 0, "range_max": 50, "type": "percentage", "value": 9.0, "unit": "%"},
                {"range_min": 50, "range_max": 100, "type": "fixed", "value": 4.5, "unit": "g_or_ml"},
                {"range_min": 100, "range_max": 200, "type": "percentage", "value": 4.5, "unit": "%"},
                {"range_min": 200, "range_max": 300, "type": "fixed", "value": 9.0, "unit": "g_or_ml"},
                {"range_min": 300, "range_max": 500, "type": "percentage", "value": 3.0, "unit": "%"},
                {"range_min": 500, "range_max": 1000, "type": "fixed", "value": 15.0, "unit": "g_or_ml"},
                {"range_min": 1000, "range_max": 10000, "type": "percentage", "value": 1.5, "unit": "%"},
                {"range_min": 10000, "range_max": 15000, "type": "fixed", "value": 150.0, "unit": "g_or_ml"},
                {"range_min": 15000, "range_max": None, "type": "percentage", "value": 1.0, "unit": "%"}
            ],
            "enforcement_clause": "Zero tolerance for deficiencies exceeding statutory MPE.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_SCH_02_STANDARD_PACKS",
            "rule_number": "Second Schedule [Rule 5]",
            "title": "Statutory Standard Packaging Quantities for 19 Commodity Categories",
            "chapter": "The Second Schedule",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Second Schedule",
            "summary": "Specifies standard packaging sizes: (1) Baby food: 100g-10kg; (2) Weaning food: 600g-10kg; (3) Biscuits: 25g, 50g, 75g, 100g, 150g, 200g, 250g, 300g, thereafter multiples of 100g up to 1kg; (4) Bread: 100g and multiples of 100g; (5) Butter/margarine: 25g, 50g, 100g, 200g, 500g, 1kg, 2kg, 5kg; (6) Cereals/pulses: 100g, 200g, 500g, 1kg, 2kg, 5kg; (7) Coffee: 25g, 50g, 100g, 200g, 250g, 500g, 1kg; (8) Tea: 25g, 50g, 100g, 125g, 250g, 500g, 1kg; (9) Beverages: 25g-1kg; (10) Edible oils, vanaspati, ghee, butter oil: multiples of 5kg, volume declaration must state mass in brackets; (11) Milk powder: 50g, 100g, 200g, 500g, 1kg; (12) Non-soapy detergents: 50g, 100g, 200g, 500g, 700g, 1kg, 1.5kg, 2kg; (13) Atta, rawa, suji: 100g, 200g, 500g, 1kg, 2kg, 5kg; (14) Salt: multiples of 10g below 50g, 50g, 100g, 200g, 500g, 750g, 1kg, 2kg, 5kg; (15) Soaps: laundry (50g, 75g, 100g), detergent bars, toilet soaps (25g, 50g, 75g, 100g, 125g, 150g); (16) Aerated soft drinks: 65ml, 100ml, 125ml, 150ml, 200ml, 250ml, 300ml, 330ml (cans), 500ml, 750ml, 1L, 1.5L, 2L, 3L, 4L, 5L; (17) Mineral/drinking water: 100ml to 5L; (18) Cement: 1kg to 50kg; (19) Paints, varnishes, base paints.",
            "category": "Packaging Standards",
            "enforcement_clause": "Non-standard size warning declaration required under Rule 5 Proviso.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_SCH_03_WHEN_PACKED",
            "rule_number": "Third Schedule [Rule 11(4)]",
            "title": "Commodities Qualified by Words 'When Packed'",
            "chapter": "The Third Schedule",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Third Schedule",
            "summary": "Exclusive list of commodities permitted to declare quantity qualified by 'When Packed': (1) All kinds of soaps; (2) Lotions; (3) Creams (other than cream of milk). All other commodities strictly prohibited from using 'When Packed'.",
            "category": "Statutory Exceptions",
            "enforcement_clause": "Prosecution for qualifying net quantity with 'when packed' on unlisted commodities.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_SCH_04_EXCEPTIONS",
            "rule_number": "Fourth Schedule [Rule 12(2)]",
            "title": "Exceptions to Manner of Expressing Quantity (26 Commodities)",
            "chapter": "The Fourth Schedule",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Fourth Schedule",
            "summary": "Specifies permitted units for 26 commodities: (1) Aerosol products (Weight); (2) Liquid acids (Weight or Volume); (3) Compressed/liquefied gas (Weight & volume); (4) Curd (Weight); (5-7) Cables & wires (Length or Weight); (8) Fruits (Number or Weight); (9) Furnace oil (Weight or Volume); (10-11) Edible oils / ghee (Weight or Volume); (12) Heavy residual fuel oil (Weight); (13) Industrial diesel fuel (Volume); (14) Honey & malt extract (Weight); (15) Ice cream (Volume); (16) Liquid chemicals (Weight or Volume); (17) LPG (Weight); (18) Nails/screws (Number or Weight); (19-20) Paints (Volume for liquid, Weight for paste); (21) Rasgulla, gulabjamun & sweets (Weight); (22) Readymade garments (Number); (23) Sauces (Weight); (24) Tyres/tubes (Number); (25) Yarn (Weight or Length); (26) Cosmetics, shampoo, perfume (Weight or Measure).",
            "category": "Quantity Specifications",
            "enforcement_clause": "Enforces proper statutory unit mapping for commodities.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_SCH_05_SAMPLING",
            "rule_number": "Fifth Schedule [Rule 19]",
            "title": "Manner of Selection of Sample Packages and Lot Sizes",
            "chapter": "The Fifth Schedule",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Fifth Schedule",
            "summary": "Statutory statistical sampling plan for testing: (1) Lot size less than 4,000 packages: Sample size 32 packages; (2) Lot size 4,000 to 10,000 packages: Sample size 80 packages; (3) Lot size more than 10,000 packages: Sample size 160 packages. Samples drawn at random from all parts of stack.",
            "category": "Statistical Sampling",
            "sampling_table": [
                {"lot_size_min": 1, "lot_size_max": 4000, "sample_size": 32},
                {"lot_size_min": 4001, "lot_size_max": 10000, "sample_size": 80},
                {"lot_size_min": 10001, "lot_size_max": None, "sample_size": 160}
            ],
            "enforcement_clause": "Mandatory sampling sizes for issuing formal inspection certificates and seizure memos.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_SCH_06_TESTING",
            "rule_number": "Sixth Schedule [Rule 20]",
            "title": "Determination of Net Quantity and Error in Packages (Tare Weight Protocol)",
            "chapter": "The Sixth Schedule",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Sixth Schedule",
            "summary": "Defines scientific procedure for net weight determination: Tare weight verification using 0.3 * MPE single container test and 0.4 * MPE max-min spread across 5 empty containers. If spread exceeds 0.4 * MPE, destructive test or 100% check is mandated. Procedures for liquids, length, and item count verification.",
            "category": "Laboratory & Field Testing",
            "enforcement_clause": "Standard testing methodology admissible as expert evidence in court under Section 63 BSA 2023.",
            "priority": "High"
        },
        {
            "rule_id": "LMPC_2011_SCH_07_FORMS",
            "rule_number": "Seventh Schedule [Rule 20(2)]",
            "title": "Statutory Inspection and Test Report Data Sheets (Form A & Form B)",
            "chapter": "The Seventh Schedule",
            "statutory_act": "Legal Metrology Act, 2009",
            "statutory_rule": "The Legal Metrology (Packaged Commodities) Rules, 2011",
            "gazette_reference": "G.S.R. 202(E) Seventh Schedule Form A & Form B",
            "summary": "Prescribes statutory data sheets: Form A for weight checking and Form B for volume/length checking. Contains fields for Manufacturer/Packer name, address, price, lot size, sample size, MPE %, individual gross/tare/net weights, average net weight, officer designation, and witness signatures.",
            "category": "Statutory Reporting Forms",
            "enforcement_clause": "Legal Metrology Inspection Form FORM LM-INSP-2011 layout and attestation.",
            "priority": "High"
        }
    ]
    return rules

def main():
    base_dir = "/Users/lovejeetsingh1/Documents/SIH"
    dataset_dir = os.path.join(base_dir, "dataset")
    
    # 1. Load existing cleaned_rules_2026.json (metric base standards)
    existing_file = os.path.join(dataset_dir, "cleaned_rules_2026.json")
    existing_rules = []
    if os.path.exists(existing_file):
        with open(existing_file, "r", encoding="utf-8") as f:
            existing_rules = json.load(f)
        print(f"Loaded {len(existing_rules)} existing rules from cleaned_rules_2026.json")
    
    # 2. Build 2011 LMPC Rules entries
    lmpc_rules = build_rules_2011_entries()
    print(f"Built {len(lmpc_rules)} statutory entries from 2011 LMPC Rules (Pages 37 to 83)")
    
    # 3. Merge: LMPC 2011 rules take highest priority, followed by Metric standards
    merged_rules = lmpc_rules + existing_rules
    print(f"Total merged rules: {len(merged_rules)}")
    
    # 4. Save merged JSON: cleaned_rules_2011_2026.json
    out_json_path = os.path.join(dataset_dir, "cleaned_rules_2011_2026.json")
    with open(out_json_path, "w", encoding="utf-8") as f:
        json.dump(merged_rules, f, indent=2, ensure_ascii=False)
    print(f"Saved {out_json_path} ({os.path.getsize(out_json_path)} bytes)")
    
    # Also update cleaned_rules_2026.json so any legacy references get the full unified dataset
    with open(existing_file, "w", encoding="utf-8") as f:
        json.dump(merged_rules, f, indent=2, ensure_ascii=False)
    print(f"Updated {existing_file}")

    # 5. Save merged CSV: cleaned_rules_2011_2026.csv
    out_csv_path = os.path.join(dataset_dir, "cleaned_rules_2011_2026.csv")
    fieldnames = [
        "rule_number",
        "title",
        "chapter",
        "statutory_act",
        "statutory_rule",
        "gazette_reference",
        "category",
        "priority",
        "summary",
        "enforcement_clause"
    ]
    
    with open(out_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for r in merged_rules:
            writer.writerow({
                "rule_number": r.get("rule_number", ""),
                "title": r.get("title", ""),
                "chapter": r.get("chapter", "National Standards"),
                "statutory_act": r.get("statutory_act", "Legal Metrology Act, 2009"),
                "statutory_rule": r.get("statutory_rule", "Legal Metrology Rules"),
                "gazette_reference": r.get("gazette_reference", ""),
                "category": r.get("category", "General"),
                "priority": r.get("priority", "Medium"),
                "summary": r.get("summary", ""),
                "enforcement_clause": r.get("enforcement_clause", "")
            })
    print(f"Saved {out_csv_path} ({os.path.getsize(out_csv_path)} bytes)")

if __name__ == "__main__":
    main()
