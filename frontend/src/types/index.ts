export type ComplianceStatus = 'compliant' | 'violation' | 'warning' | 'pending';

export * from './roles';

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
