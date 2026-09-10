import { ExtractedDeclaration, StatutoryViolation } from "../types";
import { RULE_7_TABLE_I } from "../data/legalMetrologyRules";

export interface ComplianceScoreResult {
  score: number; // 0 - 100
  totalChecked: number;
  compliantCount: number;
  violationsCount: number;
  warningsCount: number;
  verdict: "Compliant" | "Actionable Violations" | "Requires Rectification";
}

export function calculateComplianceScore(
  declarations: ExtractedDeclaration[],
  violations: StatutoryViolation[]
): ComplianceScoreResult {
  if (declarations.length === 0) {
    return {
      score: 0,
      totalChecked: 0,
      compliantCount: 0,
      violationsCount: 0,
      warningsCount: 0,
      verdict: "Requires Rectification",
    };
  }

  const compliantCount = declarations.filter((d) => d.status === "compliant").length;
  const warningsCount = declarations.filter((d) => d.status === "warning").length;
  const violationsCount = violations.length;

  // Base score from declaration presence
  const rawRatio = compliantCount / declarations.length;
  let score = Math.round(rawRatio * 100);

  // Heavy penalty for statutory offenses under Section 36(1)
  score = Math.max(0, score - violationsCount * 22);

  let verdict: "Compliant" | "Actionable Violations" | "Requires Rectification" = "Compliant";
  if (violationsCount > 0) {
    verdict = "Actionable Violations";
  } else if (warningsCount > 0 || score < 90) {
    verdict = "Requires Rectification";
  }

  return {
    score,
    totalChecked: declarations.length,
    compliantCount,
    violationsCount,
    warningsCount,
    verdict,
  };
}

export function calculateRequiredFont(pdpAreaCm2: number): number {
  for (const tier of RULE_7_TABLE_I) {
    if (pdpAreaCm2 <= tier.pdpAreaMaxCm2) {
      return tier.minHeightNormalMm;
    }
  }
  return 6.0;
}
