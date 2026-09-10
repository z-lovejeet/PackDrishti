import { DashboardMetrics, OfficerProfile } from "../types";

export const MOCK_OFFICER_PROFILE: OfficerProfile = {
  name: "Sh. Rajesh Kumar Sharma",
  badgeNumber: "DL-LM-INSP-0442",
  designation: "Senior Legal Metrology Inspector",
  division: "Central Enforcement Division",
  zone: "Zone-1 (Central & Old Delhi)",
  jurisdiction: "Delhi NCT",
};

export const MOCK_DASHBOARD_METRICS: DashboardMetrics = {
  totalInspections: 1247,
  compliantCount: 834,
  violationCount: 413,
  compoundedCount: 290,
  pendingNoticesCount: 123,
  complianceRate: 66.8,
  totalFinesLeviedInr: 4850000,
  monthlyScansDelta: 14.2,
};

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

export const MOCK_RECENT_ACTIONS: EnforcementActionItem[] = [
  {
    id: "act-01",
    caseRef: "DL/LM/2026/SCN-881",
    productName: "Parle-G Gold Glucose Biscuits 800g",
    actionType: "Show Cause Notice",
    statutoryClause: "Rule 6(1)(e) Second Proviso (USP Missing)",
    timestamp: "18-Aug-2026 11:30 IST",
    targetEstablishment: "M/s Gupta General Stores, Sadar Bazaar",
    fineAmountInr: 25000,
    status: "Pending Hearing",
  },
  {
    id: "act-02",
    caseRef: "DL/LM/2026/CMP-219",
    productName: "Sunfeast Dark Fantasy Choco Fills 300g",
    actionType: "Compounding Order",
    statutoryClause: "Rule 7 Table-I (Font Height Deficient)",
    timestamp: "08-Aug-2026 14:15 IST",
    targetEstablishment: "Super Bazaar Retail Depot, Connaught Place",
    fineAmountInr: 50000,
    status: "Settled",
  },
  {
    id: "act-03",
    caseRef: "MH/LM/2026/SZR-044",
    productName: "Everest Meat Masala 100g",
    actionType: "Seizure Memo",
    statutoryClause: "Rule 18(5) (Dual MRP Sticker Overprint)",
    timestamp: "05-Aug-2026 13:10 IST",
    targetEstablishment: "Crawford Wholesalers Association",
    fineAmountInr: 25000,
    status: "Issued",
  },
  {
    id: "act-04",
    caseRef: "KA/LM/2026/SCN-112",
    productName: "Imported Bluetooth Headphones Model X2",
    actionType: "Show Cause Notice",
    statutoryClause: "Rule 6(1)(aa) (Country of Origin Omitted)",
    timestamp: "02-Aug-2026 16:20 IST",
    targetEstablishment: "Apex Electronics Imports, SP Road",
    fineAmountInr: 25000,
    status: "Pending Hearing",
  },
  {
    id: "act-05",
    caseRef: "WB/LM/2026/RES-078",
    productName: "Patanjali Dant Kanti 200g",
    actionType: "Cured & Dismissed",
    statutoryClause: "Rule 6(1)(n) (Consumer Care Email Rectified)",
    timestamp: "10-Aug-2026 12:00 IST",
    targetEstablishment: "Patanjali Mega Store, Barabazar",
    status: "Closed",
  }
];

export interface ViolationCategoryBreakdown {
  ruleClause: string;
  categoryTitle: string;
  count: number;
  percentage: number;
  actSection: string;
}

export const MOCK_TOP_VIOLATIONS: ViolationCategoryBreakdown[] = [
  {
    ruleClause: "Rule 6(1)(e) Proviso",
    categoryTitle: "Omission of Unit Sale Price (USP)",
    count: 154,
    percentage: 37.3,
    actSection: "Section 36(1)",
  },
  {
    ruleClause: "Rule 7 & Table-I",
    categoryTitle: "Deficient Font Height / PDP Proportions",
    count: 108,
    percentage: 26.2,
    actSection: "Section 36(1)",
  },
  {
    ruleClause: "Rule 13 & Rule 6(1)(c)",
    categoryTitle: "Non-Standard Metric Symbols (gms, Kgs, ltrs)",
    count: 76,
    percentage: 18.4,
    actSection: "Section 36(1)",
  },
  {
    ruleClause: "Rule 18(2A) / 18(5)",
    categoryTitle: "Dual MRP or Price Sticker Alteration",
    count: 47,
    percentage: 11.4,
    actSection: "Section 36(1) & 18",
  },
  {
    ruleClause: "Rule 6(1)(aa)",
    categoryTitle: "Missing Country of Origin / Importer Details",
    count: 28,
    percentage: 6.7,
    actSection: "Section 36(1)",
  },
];
