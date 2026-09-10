/**
 * PackDrashiti Domain Models and Database Schemas.
 * Corresponds to SQLAlchemy 2.0 ORM schemas defined in docs/database_schema.md
 * and RESTful API contracts defined in docs/api_specification.md.
 */

import type { UserRole } from './roles';
export type { UserRole };

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  badgeNumber?: string | null;
  jurisdiction?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type ScanComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'WARNING';

export interface ProductScanModel {
  id: string;
  userId: string;
  productName: string;
  brandName: string;
  category: string;
  barcode?: string | null;
  imageFrontUrl: string;
  imageBackUrl?: string | null;
  declaredMrp: number;
  netQuantityValue: number;
  netQuantityUnit: string;
  calculatedUsp: number;
  pdpAreaSqcm: number;
  overallComplianceScore: number;
  overallStatus: ScanComplianceStatus;
  scanCode: string;
  createdAt: string;
}

export interface BoundingBoxCoordinates {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface ExtractedDeclarationModel {
  id: string;
  scanId: string;
  declarationType: string;
  rawText: string;
  normalizedValue?: string | null;
  boundingBox: BoundingBoxCoordinates;
  fontHeightMm?: number | null;
  isCompliant: boolean;
  violationReason?: string | null;
}

export type ViolationSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';

export interface StatutoryCitation {
  ruleIdentifier: string;
  title: string;
  actReference: string;
  amendmentYear?: number;
  gazetteNotification?: string;
  courtPrecedent?: string;
}

export interface StatutoryViolationModel {
  id: string;
  scanId: string;
  declarationId?: string | null;
  citedKnowledgeId?: string | null;
  ruleReference: string;
  penaltySection: string;
  severity: ViolationSeverity;
  description: string;
  compoundingFeeInr: number;
  remediationText: string;
  statutoryCitations?: StatutoryCitation[];
}

export type ReportStatus = 'DRAFT' | 'ISSUED' | 'DISMISSED' | 'COMPOUNDED';

export interface ComplianceReportModel {
  id: string;
  docketNumber: string;
  scanId: string;
  officerId: string;
  officerName: string;
  jurisdiction: string;
  reportType: string;
  summaryFindings: string;
  digitalSignatureToken: string;
  status: ReportStatus;
  createdAt: string;
}

export interface HealthAuditModel {
  id: string;
  scanId: string;
  energyKcal: number;
  proteinG: number;
  carbohydratesG: number;
  totalSugarsG: number;
  addedSugarsG: number;
  totalFatG: number;
  saturatedFatG: number;
  transFatG: number;
  sodiumMg: number;
  healthScore: number;
  advisoryBadges: string[];
  contraindications: string[];
  recommendations: string[];
}

export interface StatutoryKnowledgeBaseModel {
  id: string;
  ruleIdentifier: string;
  title: string;
  actReference: string;
  amendmentYear: number;
  fullText: string;
  metadataJson?: Record<string, unknown>;
  createdAt: string;
}

// Authentication & Session Contracts
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  badgeNumber?: string;
  jurisdiction?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// API Envelope Standard
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
  timestamp: string;
  requestId?: string;
}
