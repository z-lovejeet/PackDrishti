export type UserRole = "consumer" | "officer" | "admin";

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
  pendingNoticesCount: number;
  complianceRate: number;
  totalFinesLeviedInr: number;
  monthlyScansDelta: number;
}

export interface ScanHistoryItem {
  id: string;
  scanCode: string;
  productName: string;
  brand: string;
  category: string;
  scanDate: string;
  scanType: "label_compliance" | "consumer_health";
  status: "compliant" | "violation" | "warning" | "healthy" | "caution";
  declaredMrp: string;
  thumbnailUrl: string;
  summaryNote: string;
  violationsCount?: number;
  healthScore?: number;
}
