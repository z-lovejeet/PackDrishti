export type UserRole = "consumer" | "admin";

export interface ScanHistoryItem {
  id: string;
  scanCode: string;
  productName: string;
  brand: string;
  category: string;
  scanDate: string;
  scanType: "label_compliance" | "consumer_health" | "health_check" | string;
  status: "compliant" | "violation" | "warning" | "healthy" | "caution";
  declaredMrp: string;
  thumbnailUrl: string;
  summaryNote: string;
  violationsCount?: number;
  healthScore?: number;
  mfgDate?: string;
  expiryDate?: string;
  isExpired?: boolean;
  expiryStatus?: string;
  netQuantity?: string;
  violations?: any[];
  badges?: any[];
  nutrients?: any[];
  dietaryAdvisory?: any;
}
