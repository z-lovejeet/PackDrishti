import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Scan,
  Scales,
  FileText,
  ArrowRight,
  User,
  ArrowSquareOut
} from "@phosphor-icons/react";
import { Button } from "../../components/common/Button";
import { CompoundingCalculator } from "../../components/officer/CompoundingCalculator";
import { NoticePreviewModal } from "../../components/officer/NoticePreviewModal";
import { api } from "../../utils/apiClient";
import {
  OfficerProfile,
  DashboardMetrics,
  EnforcementActionItem,
  ViolationCategoryBreakdown
} from "../../types";

const DEFAULT_OFFICER_PROFILE: OfficerProfile = {
  name: "Sh. Rajesh Kumar Sharma",
  badgeNumber: "DL-LM-INSP-0442",
  designation: "Senior Legal Metrology Inspector",
  division: "Central Enforcement Division",
  zone: "Zone-1 (Central & Old Delhi)",
  jurisdiction: "Delhi NCT",
};

const DEFAULT_VIOLATIONS: ViolationCategoryBreakdown[] = [
  {
    ruleClause: "Rule 6(1)(e)",
    categoryTitle: "Missing / Erroneous Unit Sale Price (USP)",
    actSection: "Section 36(1)",
    count: 142,
    percentage: 34.4,
  },
  {
    ruleClause: "Rule 7 Table-I",
    categoryTitle: "Deficient Font Height on Principal Display Panel",
    actSection: "Section 36(1)",
    count: 118,
    percentage: 28.6,
  },
  {
    ruleClause: "Rule 6(1)(d)",
    categoryTitle: "MRP Format / Dual MRP Non-Compliance",
    actSection: "Section 36(1)",
    count: 87,
    percentage: 21.1,
  },
  {
    ruleClause: "Rule 9",
    categoryTitle: "Inadequate Color Contrast on Mandatory Declarations",
    actSection: "Section 39",
    count: 41,
    percentage: 9.9,
  },
  {
    ruleClause: "Rule 6(1)(b)",
    categoryTitle: "Non-Standard Measurement Units (Non-SI Standard)",
    actSection: "Section 36(1)",
    count: 25,
    percentage: 6.0,
  },
];

const INITIAL_METRICS: DashboardMetrics = {
  totalInspections: 1247,
  compliantCount: 834,
  violationCount: 413,
  compoundedCount: 290,
  totalFinesLeviedInr: 4275000,
  monthlyScansDelta: 14.2,
  complianceRate: 66.9,
};

const DEFAULT_ACTIONS: EnforcementActionItem[] = [
  {
    id: "act-01",
    caseRef: "INSP-2026-DEL-049",
    productName: "VitaHealth Malted Nutrition Drink 500g",
    actionType: "Show Cause Notice",
    statutoryClause: "Rule 6(1)(e) & Sec 36(1)",
    timestamp: "10-Sep-2026 14:30 IST",
    targetEstablishment: "Khari Baoli Wholesale Market, Old Delhi",
    status: "Pending Hearing",
  },
  {
    id: "act-02",
    caseRef: "INSP-2026-DEL-044",
    productName: "SunHarvest Cold Pressed Mustard Oil 1L",
    actionType: "Compounding Order",
    statutoryClause: "Rule 7 Table-I & Sec 48",
    timestamp: "10-Sep-2026 11:15 IST",
    targetEstablishment: "Daryaganj Supermarket, Delhi",
    status: "Settled",
  },
  {
    id: "act-03",
    caseRef: "INSP-2026-DEL-038",
    productName: "Supreme Pure Basmati Rice 5kg",
    actionType: "Cured & Dismissed",
    statutoryClause: "Rule 6(1)(d) Rectification",
    timestamp: "09-Sep-2026 16:45 IST",
    targetEstablishment: "Chandni Chowk Retail Traders Association",
    status: "Settled",
  },
  {
    id: "act-04",
    caseRef: "INSP-2026-DEL-032",
    productName: "Herbal Glow Ayurvedic Face Wash 150ml",
    actionType: "Seizure Memo",
    statutoryClause: "Rule 6(1)(a) & Sec 15",
    timestamp: "09-Sep-2026 12:20 IST",
    targetEstablishment: "Connaught Place Super Store",
    status: "Issued",
  },
];

interface OfficerDashboardPageProps {
  onNavigate: (page: string) => void;
  onOpenReportModal: () => void;
}

export const OfficerDashboardPage: React.FC<OfficerDashboardPageProps> = ({
  onNavigate,
  onOpenReportModal,
}) => {
  const [isCompoundingOpen, setIsCompoundingOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [selectedNoticeItem, setSelectedNoticeItem] = useState<{
    scanId: string;
    productName: string;
    brand: string;
    mrp: string;
    netQty: string;
  } | null>(null);

  const [metrics, setMetrics] = useState<DashboardMetrics>(INITIAL_METRICS);
  const [actions, setActions] = useState<EnforcementActionItem[]>(DEFAULT_ACTIONS);
  const [violations] = useState<ViolationCategoryBreakdown[]>(DEFAULT_VIOLATIONS);
  const [officer] = useState<OfficerProfile>(DEFAULT_OFFICER_PROFILE);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const metricsRes = await api.get<DashboardMetrics>("/dashboard/metrics");
        if (metricsRes) setMetrics(metricsRes);
      } catch {
        // Keeps graceful defaults
      }

      try {
        const actRes = await api.get<EnforcementActionItem[]>("/dashboard/activity");
        if (actRes && actRes.length > 0) setActions(actRes);
      } catch {
        // Keeps graceful defaults
      }
    };

    fetchDashboardData();
  }, []);

  const handleOpenNotice = (item?: EnforcementActionItem) => {
    setSelectedNoticeItem({
      scanId: item?.caseRef || "INSP-2026-DEL-049",
      productName: item?.productName || "VitaHealth Malted Nutrition Drink 500g",
      brand: "VitaHealth Nutrition",
      mrp: "320.00",
      netQty: "500 g",
    });
    setIsNoticeOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      
      {/* Officer Header Bar */}
      <section className="border-b border-slate-200/80 bg-slate-50/40">
        <div className="max-w-6xl mx-auto px-6 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-950">
                  {officer.name}
                </h1>
                <span className="font-mono text-2xs px-2.5 py-0.5 rounded border border-slate-300 bg-white text-slate-700 font-semibold">
                  {officer.badgeNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {officer.designation} • {officer.division} • {officer.zone}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate("scanner")}
                icon={<Scan size={14} weight="bold" />}
                className="text-xs bg-white"
              >
                New Field Scan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCompoundingOpen(true)}
                icon={<Scales size={14} weight="bold" />}
                className="text-xs bg-white"
              >
                Compounding Desk
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenNotice()}
                icon={<FileText size={14} weight="bold" />}
                className="text-xs bg-white"
              >
                FORM LM-INSP-2011
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenReportModal}
                className="text-xs"
              >
                Generate Report
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">

        {/* 4 Metric Tiles (Minimal, Spacious, Single Theme) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-2">
            <span className="text-2xs font-mono uppercase tracking-wider text-slate-400">Total Inspections</span>
            <div className="text-3xl font-bold font-heading text-slate-950">
              {metrics.totalInspections.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-slate-500">Field compliance sweeps</div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-2">
            <span className="text-2xs font-mono uppercase tracking-wider text-slate-400">Certified Compliant</span>
            <div className="text-3xl font-bold font-heading text-slate-950">
              {metrics.compliantCount.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-slate-500">{metrics.complianceRate}% adherence rate</div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-2">
            <span className="text-2xs font-mono uppercase tracking-wider text-slate-400">Infractions Flagged</span>
            <div className="text-3xl font-bold font-heading text-slate-950">
              {metrics.violationCount.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-slate-500">Actionable statutory defaults</div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-2">
            <span className="text-2xs font-mono uppercase tracking-wider text-slate-400">Compounding Assessed</span>
            <div className="text-3xl font-bold font-heading text-slate-950">
              ₹{(metrics.totalFinesLeviedInr / 100000).toFixed(2)} L
            </div>
            <div className="text-xs text-slate-500">{metrics.compoundedCount} cases compounded</div>
          </div>

        </section>

        {/* Compliance Distribution & Live Activity Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Compliance Distribution & Navigation */}
          <div className="space-y-6">
            
            <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold font-heading text-slate-950">Compliance Distribution</h2>
                <span className="text-xs font-mono text-slate-500">{metrics.complianceRate}%</span>
              </div>
              
              {/* Clean Single-Themed Distribution Bar */}
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
                <div 
                  className="bg-slate-900 h-full transition-all duration-300"
                  style={{ width: `${(metrics.compliantCount / metrics.totalInspections) * 100}%` }}
                />
                <div 
                  className="bg-slate-400 h-full transition-all duration-300"
                  style={{ width: `${(metrics.violationCount / metrics.totalInspections) * 100}%` }}
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-900" />
                  <span>Compliant ({metrics.compliantCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Infractions ({metrics.violationCount})</span>
                </div>
              </div>
            </div>

            {/* Sub-Station Quick Links */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
              <span className="text-2xs font-mono uppercase tracking-wider text-slate-400">Enforcement Stations</span>
              
              <div className="space-y-1 pt-1">
                <button
                  onClick={() => onNavigate("inspections")}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-800 transition-colors"
                >
                  <span>Field Inspection Ledger</span>
                  <ArrowRight size={13} className="text-slate-400" />
                </button>
                <button
                  onClick={() => onNavigate("reports")}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-800 transition-colors"
                >
                  <span>Statutory Report Archive</span>
                  <ArrowRight size={13} className="text-slate-400" />
                </button>
                <button
                  onClick={() => setIsCompoundingOpen(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-800 transition-colors"
                >
                  <span>Section 48 Fee Calculator</span>
                  <ArrowRight size={13} className="text-slate-400" />
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Live Timeline of Enforcement Actions */}
          <div className="lg:col-span-2 p-6 rounded-xl border border-slate-200 bg-white space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold font-heading text-slate-950">Recent Enforcement Actions</h2>
              <button 
                onClick={() => onNavigate("inspections")}
                className="text-xs font-semibold text-slate-900 hover:text-slate-600 inline-flex items-center gap-1"
              >
                View full ledger <ArrowRight size={12} weight="bold" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {actions.map((act) => (
                <div key={act.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-2xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        {act.caseRef}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {act.actionType}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">
                      {act.productName}
                    </div>
                    <div className="text-2xs text-slate-500">
                      {act.targetEstablishment} • {act.statutoryClause}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-2xs font-mono text-slate-400">{act.timestamp}</span>
                    <button
                      onClick={() => handleOpenNotice(act)}
                      className="text-xs text-slate-700 hover:text-slate-950 p-1.5 rounded hover:bg-slate-100"
                      title="Inspect Notice"
                    >
                      <ArrowSquareOut size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </section>

        {/* Predominant Regulatory Infractions Table */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-bold font-heading text-slate-950">
              Predominant Regulatory Infractions
            </h2>
            <span className="text-xs text-slate-500">Central Enforcement Zone-1</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-mono text-2xs uppercase">
                    <th className="py-3 px-5 font-semibold">Rule Clause</th>
                    <th className="py-3 px-5 font-semibold">Infraction Description</th>
                    <th className="py-3 px-5 font-semibold">Governing Act</th>
                    <th className="py-3 px-5 font-semibold text-right">Incidents</th>
                    <th className="py-3 px-5 font-semibold text-right">Proportion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {violations.map((v) => (
                    <tr key={v.ruleClause} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-slate-900">
                        {v.ruleClause}
                      </td>
                      <td className="py-4 px-5 text-slate-700 font-medium">
                        {v.categoryTitle}
                      </td>
                      <td className="py-4 px-5 font-mono text-slate-500">
                        {v.actSection}
                      </td>
                      <td className="py-4 px-5 text-right font-mono font-bold text-slate-900">
                        {v.count}
                      </td>
                      <td className="py-4 px-5 text-right font-mono text-slate-600">
                        {v.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>

      {/* Compounding Desk Modal */}
      <CompoundingCalculator
        isOpen={isCompoundingOpen}
        onClose={() => setIsCompoundingOpen(false)}
        initialViolations={[]}
      />

      {/* Statutory Notice Preview Modal */}
      {selectedNoticeItem && (
        <NoticePreviewModal
          isOpen={isNoticeOpen}
          onClose={() => setIsNoticeOpen(false)}
          scanId={selectedNoticeItem.scanId}
          docketNumber={selectedNoticeItem.scanId}
          productName={selectedNoticeItem.productName}
          brand={selectedNoticeItem.brand}
          mrp={selectedNoticeItem.mrp}
          netQty={selectedNoticeItem.netQty}
          violationsCount={2}
          compoundingFee={15000}
          assignedOfficer={officer.name}
          inspectionDate="10-Sep-2026"
        />
      )}

    </div>
  );
};
