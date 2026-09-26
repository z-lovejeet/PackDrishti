export type UserRole = "consumer" | "admin";

export interface ScanHistoryItem {
  id: string;
  scanCode: string;
  productName: string;
  brand: string;
  category: string;
  scanDate: string;
  scanType: "consumer_health" | "health_check" | string;
  status: "healthy" | "caution" | "violation";
  declaredMrp: string;
  thumbnailUrl: string;
  summaryNote: string;
  healthScore?: number;
  mfgDate?: string;
  expiryDate?: string;
  isExpired?: boolean;
  expiryStatus?: string;
  netQuantity?: string;
  badges?: any[];
  nutrients?: any[];
  dietaryAdvisory?: any;
}
