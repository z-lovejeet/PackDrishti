export type ComplianceStatus = 'compliant' | 'violation' | 'warning' | 'pending';

export * from './roles';
export * from './models';

export interface BoundingBox {
  id: string;
  fieldId: string;
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  status: 'compliant' | 'violation' | 'warning';
  measuredHeightMm?: number;
  requiredHeightMm?: number;
}

export interface ExtractedDeclaration {
  id: string;
  ruleClause: string;
  fieldName: string;
  extractedValue: string;
  status: 'compliant' | 'violation' | 'warning' | 'na';
  statusNote?: string;
  measuredFontHeightMm?: number;
  requiredFontHeightMm?: number;
  contrastRatio?: number;
  boxId?: string;
}

export interface StatutoryViolation {
  id: string;
  ruleReference: string;
  actSection: string;
  title: string;
  description: string;
  penaltyClause: string;
  severity: 'high' | 'medium' | 'low';
  correctiveAction: string;
}

export interface ProductScan {
  id: string;
  scanCode: string;
  productName: string;
  brand: string;
  category: 'Food & Beverage' | 'Personal Care' | 'Household' | 'Electronics' | 'Textiles' | 'Cosmetics';
  barcode: string;
  pdpAreaCm2: number;
  netQuantity: string;
  mrp: string;
  mfgDate: string;
  expiryDate?: string;
  isExpired?: boolean;
  expiryStatus?: string;
  expiryDetails?: string;
  scannedAt: string;
  scannedBy: string;
  inspectorDesignation: string;
  location: string;
  overallStatus: 'compliant' | 'violation' | 'warning';
  violationCount: number;
  warningCount: number;
  imageUrl: string;
  declarations: ExtractedDeclaration[];
  violations: StatutoryViolation[];
  boundingBoxes: BoundingBox[];
  notes?: string;
}

export interface ViolationRecord {
  id: string;
  scanId?: string;
  violationCode: string;
  productName: string;
  brand: string;
  category: string;
  ruleReference: string;
  violationType: string;
  severity: 'high' | 'medium' | 'low';
  dateDetected: string;
  status: 'Open' | 'Under Review' | 'Notice Issued' | 'Resolved' | 'Escalated';
  assignedOfficer: string;
  location: string;
  timeline: {
    date: string;
    action: string;
    by: string;
    note?: string;
  }[];
}

export interface ComplianceReport {
  id: string;
  reportNumber: string;
  title: string;
  reportType: 'Single Product Audit' | 'Marketplace Inspection' | 'Monthly District Summary';
  generatedDate: string;
  generatedBy: string;
  designation: string;
  district: string;
  totalProductsScanned: number;
  compliantCount: number;
  violationCount: number;
  format: 'PDF' | 'JSON' | 'DOCX';
  downloadUrl?: string;
}

export interface EcommerceAuditItem {
  id: string;
  url: string;
  productTitle: string;
  platform: 'Amazon.in' | 'Flipkart' | 'JioMart' | 'Blinkit' | 'BigBasket';
  scannedAt: string;
  status: 'compliant' | 'violation' | 'warning';
  declarations: {
    rule: string;
    name: string;
    status: 'present' | 'missing' | 'incomplete' | 'exempt';
    details: string;
  }[];
}

export interface NutrientAudit {
  name: string;
  valuePer100g: number;
  valuePerServe: number;
  unit: string;
  icmrDailyLimit: string;
  level: 'Low' | 'Moderate' | 'High' | 'Excessive';
  assessment: string;
}

export interface HealthBadge {
  label: string;
  type: 'danger' | 'warning' | 'good' | 'neutral';
  description?: string;
}

export interface ProductHealthAudit {
  id: string;
  commodityName: string;
  brandName: string;
  category: string;
  servingSize: string;
  netQuantity: string;
  mrp: string;
  mfgDate?: string;
  expiryDate?: string;
  isExpired?: boolean;
  expiryStatus?: string;
  expiryWarning?: string;
  pricePer100g: string;
  priceRating: 'Budget' | 'Fair Market Rate' | 'Premium';
  priceAnalysis: string;
  overallRating: 'Nutritious Choice' | 'Consume in Moderation' | 'High Health Concern' | 'Critical Hazard - Expired Food' | string;
  ratingScore: number;
  frontImageUrl: string;
  backImageUrl: string;
  badges: HealthBadge[];
  nutrients: NutrientAudit[];
  whoCanConsume: string[];
  whoShouldAvoid: string[];
  healthierAlternatives: string[];
  dietarySummary: string;
  shouldWeEatIt?: string;
  howBadIsIt?: string;
  notEatableForAge?: string[];
  healthProblemsIfEatenMore?: string[];
  hasPalmOil?: boolean;
  palmOilDetails?: string;
  hasAddedSugar?: boolean;
  addedSugarDetails?: string;
  hasHighSodium?: boolean;
  hasArtificialAdditives?: boolean;
  ingredientsList?: string[];
  flaggedIngredients?: { name: string; reason: string }[];
}

export interface EnforcementActionItem {
  id: string;
  caseRef: string;
  productName: string;
  actionType: "Show Cause Notice" | "Compounding Order" | "Seizure Memo" | "Cured & Dismissed";
  statutoryClause: string;
  timestamp: string;
  targetEstablishment: string;
  fineAmountInr?: number;
  status: "Pending Hearing" | "Issued" | "Settled" | "Closed";
}

export interface OfficerProfile {
  name: string;
  badgeNumber: string;
  designation: string;
  division: string;
  zone: string;
  jurisdiction: string;
}

export interface DashboardMetrics {
  totalInspections: number;
  compliantCount: number;
  violationCount: number;
  compoundedCount: number;
  pendingNoticesCount?: number;
  complianceRate?: number;
  totalFinesLeviedInr: number;
  monthlyScansDelta: number | string;
}

export interface ViolationCategoryBreakdown {
  ruleClause: string;
  categoryTitle: string;
  count: number;
  percentage: number;
  actSection: string;
}

