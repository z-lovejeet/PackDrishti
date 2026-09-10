import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Warning,
  FileText,
  Scales,
  Scan,
  DownloadSimple,
  IdentificationCard,
  Building,
  MapPin,
  TrendUp,
  ArrowRight,
  Briefcase,
  Shield
} from "@phosphor-icons/react";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/dashboard/StatCard";
import { ComplianceChart } from "../../components/dashboard/ComplianceChart";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";
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
  const [officerProfile] = useState<OfficerProfile>(DEFAULT_OFFICER_PROFILE);
  const [metrics, setMetrics] = useState<DashboardMetrics>(INITIAL_METRICS);
  const [actions, setActions] = useState<EnforcementActionItem[]>(DEFAULT_ACTIONS);
  const [topViolations, setTopViolations] = useState<ViolationCategoryBreakdown[]>(DEFAULT_VIOLATIONS);

  useEffect(() => {
    let isMounted = true;

    const fetchLiveMetrics = async () => {
      try {
        const live = await api.get<{
          total_inspections: number;
          compliant_count: number;
          violations_recorded: number;
          compounded_closed: number;
          total_compounding_assessed_inr: number;
          monthly_scans_delta: number;
          top_violating_rules?: Array<{
            rule?: string;
            title?: string;
            count?: number;
            severity?: string;
          }>;
        }>("/dashboard/metrics");

        if (live && isMounted) {
          setMetrics((prev) => ({
            ...prev,
            totalInspections: live.total_inspections || prev.totalInspections,
            compliantCount: live.compliant_count || prev.compliantCount,
            violationCount: live.violations_recorded || prev.violationCount,
            compoundedCount: live.compounded_closed || prev.compoundedCount,
            totalFinesLeviedInr: live.total_compounding_assessed_inr || prev.totalFinesLeviedInr,
            monthlyScansDelta: live.monthly_scans_delta !== undefined ? live.monthly_scans_delta : prev.monthlyScansDelta,
          }));

          if (live.top_violating_rules && live.top_violating_rules.length > 0) {
            const totalV = live.violations_recorded || 1;
            const mappedViolations: ViolationCategoryBreakdown[] = live.top_violating_rules.map((r) => ({
              ruleClause: r.rule || "Rule 6",
              categoryTitle: r.title || "Statutory Non-Compliance",
              count: r.count || 0,
              percentage: Math.round(((r.count || 0) / totalV) * 1000) / 10,
              actSection: "Section 36(1)",
            }));
            setTopViolations(mappedViolations);
          }
        }
      } catch {
        // Retain default verified metrics baseline
      }

      try {
        const actRes = await api.get<{ activities: any[] }>("/dashboard/activity");
        if (actRes && actRes.activities && actRes.activities.length > 0 && isMounted) {
          const mappedActions: EnforcementActionItem[] = actRes.activities.map((a: any) => ({
            id: a.id || `act-${Math.random()}`,
            caseRef: a.docket_number || a.id || "INSP-DEL-REC",
            productName: `${a.brand || ""} ${a.product_name || ""}`.trim() || "Audited Package Specimen",
            actionType:
              a.action && a.action.includes("Notice")
                ? "Show Cause Notice"
                : a.action && a.action.includes("Compounding")
                ? "Compounding Order"
                : a.action && a.action.includes("Seizure")
                ? "Seizure Memo"
                : "Cured & Dismissed",
            statutoryClause: "Rule 6(1) & Sec 36(1)",
            timestamp: a.timestamp || "Recent",
            targetEstablishment: a.location || "Market Premises",
            status: a.status === "Resolved" || a.status === "Compliant" ? "Settled" : "Pending Hearing",
          }));
          setActions(mappedActions);
        }
      } catch {
        // Retain default verified actions baseline
      }
    };

    fetchLiveMetrics();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Officer Credential & Jurisdiction Card */}
      <div className="bg-white rounded-card border border-neutral-200 shadow-card overflow-hidden border-t-4 border-t-navy-800">
        <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Inspector Identification Block */}
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-lg bg-navy-800 text-white flex items-center justify-center shrink-0 shadow-sm border border-navy-700">
              <IdentificationCard size={32} weight="duotone" className="text-saffron-400" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg font-bold text-neutral-900 font-heading tracking-tight">
                  {officerProfile.name}
                </h1>
                <span className="text-2xs font-mono font-bold px-2.5 py-0.5 rounded-badge bg-navy-50 text-navy-800 border border-navy-200">
                  {officerProfile.badgeNumber}
                </span>
                <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-badge bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Enforcement Duty
                </span>
              </div>
              <p className="text-xs text-neutral-700 font-semibold flex items-center gap-1.5">
                <Briefcase size={14} className="text-navy-700" />
                <span>{officerProfile.designation}</span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-600 font-normal">{officerProfile.division}</span>
              </p>
              <div className="flex items-center gap-3 text-2xs text-neutral-500 pt-0.5 flex-wrap">
                <span className="flex items-center gap-1 text-neutral-600 font-medium">
                  <Building size={14} className="text-neutral-400" />
                  {officerProfile.zone}
                </span>
                <span className="text-neutral-300">•</span>
                <span className="flex items-center gap-1 text-neutral-600 font-medium">
                  <MapPin size={14} className="text-neutral-400" />
                  {officerProfile.jurisdiction}
                </span>
                <span className="text-neutral-300">•</span>
                <span className="text-neutral-500">
                  Legal Metrology Act, 2009 Authority
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-neutral-100">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate("scanner")}
              icon={<Scan size={16} />}
            >
              New Product Inspection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCompoundingOpen(true)}
              icon={<Scales size={16} />}
            >
              Compounding Calculator
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNoticeOpen(true)}
              icon={<FileText size={16} />}
            >
              Preview FORM LM-INSP-2011
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenReportModal}
              icon={<FileText size={16} />}
            >
              File Report
            </Button>
          </div>
        </div>

        {/* Official Jurisdiction Metadata Ribbon */}
        <div className="bg-neutral-50 px-5 py-2 border-t border-neutral-200 flex items-center justify-between text-2xs text-neutral-600 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-navy-800" />
            <span className="font-semibold text-neutral-800">
              Department of Consumer Affairs • Legal Metrology Division
            </span>
          </div>
          <div className="flex items-center gap-4 text-neutral-500 font-mono">
            <span>STATION: CENTRAL-DEL-01</span>
            <span>CYCLE: Q3-2026</span>
          </div>
        </div>
      </div>

      {/* 4 Primary Metric Cards using redesigned StatCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Inspected"
          value={metrics.totalInspections.toLocaleString("en-IN")}
          subtext="Packaged commodities audited"
          trendDelta={"+ " + metrics.monthlyScansDelta + "% this month"}
          variant="primary"
          icon={<Scan size={20} />}
        />
        <StatCard
          label="Compliant Items"
          value={metrics.compliantCount.toLocaleString("en-IN")}
          subtext="Conforming to LMPC Rules, 2011"
          trendDelta={metrics.complianceRate ? `${metrics.complianceRate}% compliance rate` : undefined}
          variant="success"
          icon={<ShieldCheck size={20} />}
        />
        <StatCard
          label="Infractions Detected"
          value={metrics.violationCount.toLocaleString("en-IN")}
          subtext="Actionable defaults under Sec 36(1)"
          trendDelta="- 4.8% vs last cycle"
          variant="violation"
          icon={<Warning size={20} />}
        />
        <StatCard
          label="Compounding Assessed"
          value={"INR " + (metrics.totalFinesLeviedInr / 100000).toFixed(1) + " L"}
          subtext={metrics.compoundedCount + " compounding orders settled"}
          trendDelta="Section 48 compounding"
          variant="warning"
          icon={<Scales size={20} />}
        />
      </div>

      {/* Middle Grid: Compliance Chart & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Compliance Chart & Quick Modules */}
        <div className="lg:col-span-5 space-y-6">
          <ComplianceChart
            compliantCount={metrics.compliantCount}
            violationCount={metrics.violationCount}
            pendingCount={metrics.pendingNoticesCount || 89}
          />

          {/* Enforcement Modules Quick Navigation */}
          <div className="bg-white p-5 rounded-card border border-neutral-200 shadow-card space-y-3.5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-1.5">
                <Briefcase size={16} className="text-navy-800" />
                <span>Enforcement Modules</span>
              </h3>
              <span className="text-2xs font-mono text-neutral-500 font-semibold">4 MODULES</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => onNavigate("inspections")}
                className="group p-3.5 rounded-md border border-neutral-200 hover:border-navy-700 hover:bg-navy-50/40 text-left transition-all duration-150 space-y-1 shadow-xs"
              >
                <div className="text-xs font-bold text-neutral-900 font-heading flex items-center justify-between">
                  <span>Inspection Ledger</span>
                  <FileText size={15} className="text-navy-800 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-2xs text-neutral-500 leading-relaxed">
                  Manage active show-cause case files and docket chronology
                </p>
              </button>

              <button
                onClick={() => onNavigate("reports")}
                className="group p-3.5 rounded-md border border-neutral-200 hover:border-navy-700 hover:bg-navy-50/40 text-left transition-all duration-150 space-y-1 shadow-xs"
              >
                <div className="text-xs font-bold text-neutral-900 font-heading flex items-center justify-between">
                  <span>Report Archive</span>
                  <DownloadSimple size={15} className="text-navy-800 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-2xs text-neutral-500 leading-relaxed">
                  Export FORM LM-INSP-2011 district PDF dockets
                </p>
              </button>

              <button
                onClick={() => onNavigate("scanner")}
                className="group p-3.5 rounded-md border border-neutral-200 hover:border-saffron-500 hover:bg-saffron-50/40 text-left transition-all duration-150 space-y-1 shadow-xs"
              >
                <div className="text-xs font-bold text-neutral-900 font-heading flex items-center justify-between">
                  <span>Optical Scanner</span>
                  <Scan size={15} className="text-saffron-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-2xs text-neutral-500 leading-relaxed">
                  AI-assisted statutory font height & declaration audit
                </p>
              </button>

              <button
                onClick={() => setIsCompoundingOpen(true)}
                className="group p-3.5 rounded-md border border-neutral-200 hover:border-saffron-500 hover:bg-saffron-50/40 text-left transition-all duration-150 space-y-1 shadow-xs"
              >
                <div className="text-xs font-bold text-neutral-900 font-heading flex items-center justify-between">
                  <span>Compounding Desk</span>
                  <Scales size={15} className="text-saffron-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-2xs text-neutral-500 leading-relaxed">
                  Section 48 multi-violation settlement fee calculator
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Activity Feed */}
        <div className="lg:col-span-7">
          <ActivityFeed
            actions={actions}
            onViewCase={() => onNavigate("inspections")}
          />
        </div>
      </div>

      {/* Bottom Section: Predominant Regulatory Infractions Data Table */}
      <div className="bg-white p-5 rounded-card border border-neutral-200 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3.5">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-neutral-900 font-heading flex items-center gap-2">
              <TrendUp size={18} className="text-navy-800" />
              <span>Predominant Regulatory Infractions (Current Inspection Cycle)</span>
            </h3>
            <p className="text-xs text-neutral-500">
              Frequency distribution of non-compliance patterns flagged under the Legal Metrology Act, 2009 & LMPC Rules, 2011
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xs font-mono font-bold px-2.5 py-1 rounded bg-neutral-100 text-neutral-800 border border-neutral-300">
              {metrics.violationCount} Total Infractions
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-semibold">
                <th className="py-3 px-3.5">Statutory Rule Clause</th>
                <th className="py-3 px-3.5">Infraction Category</th>
                <th className="py-3 px-3.5">Governing Act Section</th>
                <th className="py-3 px-3.5 text-right">Incidence Count</th>
                <th className="py-3 px-3.5 text-right">Ledger Proportion</th>
                <th className="py-3 px-3.5 text-center">Enforcement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {topViolations.length > 0 ? (
                topViolations.map((viol, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-3.5">
                      <span className="font-mono font-bold text-navy-800 bg-navy-50 px-2 py-0.5 rounded border border-navy-200 text-2xs">
                        {viol.ruleClause}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-neutral-900 font-medium">
                      {viol.categoryTitle}
                    </td>
                    <td className="py-3 px-3.5 text-neutral-600 font-mono text-2xs">
                      {viol.actSection}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-neutral-900">
                      {viol.count.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <div className="w-24 h-2 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200">
                          <div
                            style={{ width: `${Math.min(100, viol.percentage)}%` }}
                            className={`h-full ${
                              viol.percentage > 25
                                ? "bg-violation"
                                : viol.percentage > 10
                                ? "bg-saffron-500"
                                : "bg-navy-600"
                            }`}
                          />
                        </div>
                        <span className="font-mono text-neutral-800 text-2xs font-semibold w-12 text-right">
                          {viol.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <button
                        onClick={() => {
                          setIsNoticeOpen(true);
                        }}
                        className="text-2xs font-medium text-navy-800 hover:text-navy-900 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Draft Notice</span>
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500 text-xs">
                    No statutory violations recorded in current inspection ledger.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compounding Fee Calculator Modal */}
      <CompoundingCalculator
        isOpen={isCompoundingOpen}
        onClose={() => setIsCompoundingOpen(false)}
      />

      {/* Statutory FORM LM-INSP-2011 Notice Preview Modal */}
      <NoticePreviewModal
        isOpen={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
      />
    </div>
  );
};
