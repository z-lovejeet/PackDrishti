/**
 * Legal Metrology (Packaged Commodities) Rules, 2011 Codified Statutory Rules
 * Administered by: Ministry of Consumer Affairs, Food & Public Distribution
 */

export interface FontRuleThreshold {
  pdpAreaMaxCm2: number;
  minHeightNormalMm: number;
  minHeightEmbossedMm: number;
}

// Table-I under Rule 7: Minimum height of numerals and letters
export const RULE_7_TABLE_I: FontRuleThreshold[] = [
  { pdpAreaMaxCm2: 50, minHeightNormalMm: 1.0, minHeightEmbossedMm: 2.0 },
  { pdpAreaMaxCm2: 100, minHeightNormalMm: 1.5, minHeightEmbossedMm: 3.0 },
  { pdpAreaMaxCm2: 500, minHeightNormalMm: 2.5, minHeightEmbossedMm: 4.0 },
  { pdpAreaMaxCm2: 2500, minHeightNormalMm: 4.0, minHeightEmbossedMm: 6.0 },
  { pdpAreaMaxCm2: Infinity, minHeightNormalMm: 6.0, minHeightEmbossedMm: 6.0 },
];

export function getRequiredFontHeight(pdpAreaCm2: number, isEmbossed = false): number {
  for (const row of RULE_7_TABLE_I) {
    if (pdpAreaCm2 <= row.pdpAreaMaxCm2) {
      return isEmbossed ? row.minHeightEmbossedMm : row.minHeightNormalMm;
    }
  }
  return isEmbossed ? 6.0 : 6.0;
}

export const LEGAL_RULES_REGISTRY = [
  {
    clause: 'Rule 6(1)(a)',
    title: 'Manufacturer / Packer / Importer Details',
    mandate: 'Name and complete address of the manufacturer, packer, or importer along with postal PIN code.',
    actSection: 'Section 36(1) of Legal Metrology Act, 2009',
    penaltySummary: 'Fine up to ₹25,000 for 1st offence; ₹50,000 for 2nd offence; up to ₹1,00,000 for subsequent offences.',
  },
  {
    clause: 'Rule 6(1)(aa)',
    title: 'Country of Origin',
    mandate: 'Mandatory declaration of country of origin/assembly for imported goods.',
    actSection: 'Section 36(1) of Legal Metrology Act, 2009',
    penaltySummary: 'Fine up to ₹25,000 (compoundable under Section 48).',
  },
  {
    clause: 'Rule 6(1)(b)',
    title: 'Generic or Common Name',
    mandate: 'Common or generic commercial name of commodity contained in the package.',
    actSection: 'Section 36(1) of Legal Metrology Act, 2009',
    penaltySummary: 'Fine up to ₹25,000 for non-standard labeling.',
  },
  {
    clause: 'Rule 6(1)(c) & Rule 13',
    title: 'Net Quantity & Standard Metric Units',
    mandate: 'Net quantity in standard metric SI units (g, kg, ml, l, cm, m, N). Usage of gms, Kgs, ML, ltrs is strictly illegal.',
    actSection: 'Section 36(1) & Section 36(2) of Legal Metrology Act, 2009',
    penaltySummary: 'Fine up to ₹25,000 for symbol misuse; up to ₹50,000 for actual net quantity shortage.',
  },
  {
    clause: 'Rule 6(1)(d)',
    title: 'Month and Year of Manufacture',
    mandate: 'Mandatory month and year in which commodity was manufactured.',
    actSection: 'Section 36(1) of Legal Metrology Act, 2009',
    penaltySummary: 'Fine up to ₹25,000.',
  },
  {
    clause: 'Rule 6(1)(e)',
    title: 'Maximum Retail Price (MRP)',
    mandate: 'Retail sale price inclusive of all taxes in format: MRP ₹ XX.XX (inclusive of all taxes). Stating "taxes extra" is illegal.',
    actSection: 'Section 36(1) & Rule 18 of LMPC Rules',
    penaltySummary: 'Fine up to ₹25,000. Selling above MRP or altering printed price is strictly punishable.',
  },
  {
    clause: 'Rule 6(1)(e) - Second Proviso',
    title: 'Unit Sale Price (USP)',
    mandate: 'Mandatory since Oct 2022: Price per unit of measure (₹/g, ₹/kg, ₹/ml, ₹/l, or ₹/piece) rounded to 2 decimal places.',
    actSection: 'Section 36(1) of Legal Metrology Act, 2009',
    penaltySummary: 'Fine up to ₹25,000 (1st offence); Improvement notice issued on first procedural default under Jan Vishwas Act.',
  },
  {
    clause: 'Rule 6(1)(n)',
    title: 'Consumer Care Contact Information',
    mandate: 'Consumer care must contain 4 elements: (1) Contact designation/office, (2) Complete postal address, (3) Telephone number, (4) Email address.',
    actSection: 'Section 36(1) of Legal Metrology Act, 2009',
    penaltySummary: 'Fine up to ₹25,000.',
  },
  {
    clause: 'Rule 7 & Table-I',
    title: 'Minimum Font Height & Aspect Ratio',
    mandate: 'Font height must meet Table-I based on PDP area; letter width must not be less than 1/3rd of height.',
    actSection: 'Section 36(1) of Legal Metrology Act, 2009',
    penaltySummary: 'Fine up to ₹25,000.',
  },
  {
    clause: 'Rule 9(1)',
    title: 'Color Contrast & Conspicuousness',
    mandate: 'Declarations must be printed in a color contrasting conspicuously with background (WCAG contrast ratio ≥ 3:1).',
    actSection: 'Section 36(1) of Legal Metrology Act, 2009',
    penaltySummary: 'Fine up to ₹25,000.',
  },
  {
    clause: 'Rule 18(2A)',
    title: 'Prohibition of Dual MRP',
    mandate: 'No manufacturer, packer, or importer shall declare different MRPs on identical pre-packaged commodities across sales channels.',
    actSection: 'Section 36(1) & Rule 18(2A) of LMPC Rules',
    penaltySummary: 'Actionable offense with fine up to ₹50,000.',
  }
];
