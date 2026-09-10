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
  TrendUp
} from "@phosphor-icons/react";
import { Button } from "../../components/common/Button";
import { StatCard } from "../../components/dashboard/StatCard";
import { ComplianceChart } from "../../components/dashboard/ComplianceChart";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";
import { CompoundingCalculator } from "../../components/officer/CompoundingCalculator";
import { NoticePreviewModal } from "../../components/officer/NoticePreviewModal";
import { api } from "../../utils/apiClient";
import { 
  MOCK_OFFICER_PROFILE, 
  MOCK_DASHBOARD_METRICS, 
  MOCK_RECENT_ACTIONS, 
  MOCK_TOP_VIOLATIONS 
} from "../../data/mockDashboard";

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
  const [metrics, setMetrics] = useState(MOCK_DASHBOARD_METRICS);

  useEffect(() => {
    const fetchLiveMetrics = async () => {
      try {
        const live = await api.get<{
          total_inspections: number;
          compliant_count: number;
          violations_recorded: number;
          compounded_closed: number;
          total_compounding_assessed_inr: number;
          monthly_scans_delta: number;
        }>("/dashboard/metrics");

        if (live && live.total_inspections) {
          setMetrics(prev => ({
            ...prev,
            totalInspections: live.total_inspections,
            compliantCount: live.compliant_count,
            violationCount: live.violations_recorded,
            compoundedCount: live.compounded_closed,
            totalFinesLeviedInr: live.total_compounding_assessed_inr,
            monthlyScansDelta: live.monthly_scans_delta,
          }));
        }
      } catch {
        // Graceful fallback to mock dashboard metrics
      }
    };

    fetchLiveMetrics();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      
      {/* Officer Credential & Jurisdiction Banner */}
      <div className="bg-white p-5 rounded-[8px] border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-primary">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-[6px] bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
            <IdentificationCard size={28} weight="bold" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-neutral-900 font-heading">
                {MOCK_OFFICER_PROFILE.name}
              </h1>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-primary-light text-primary border border-primary-border">
                {MOCK_OFFICER_PROFILE.badgeNumber}
              </span>
            </div>
            <p className="text-xs text-neutral-600 font-medium">
              {MOCK_OFFICER_PROFILE.designation} • {MOCK_OFFICER_PROFILE.division}
            </p>
            <div className="flex items-center gap-4 text-[11px] text-neutral-500 pt-0.5">
              <span className="flex items-center gap-1">
                <Building size={13} />
                {MOCK_OFFICER_PROFILE.zone}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                {MOCK_OFFICER_PROFILE.jurisdiction}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Officer Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
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
        </div>
      </div>

      {/* Primary Statutory Enforcement Metrics Row */}
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
          variant="success"
          icon={<ShieldCheck size={20} />}
        />
        <StatCard
          label="Infractions Detected"
          value={metrics.violationCount.toLocaleString("en-IN")}
          subtext="Actionable defaults under Sec 36(1)"
          variant="violation"
          icon={<Warning size={20} />}
        />
        <StatCard
          label="Compounding Assessed"
          value={"₹ " + (metrics.totalFinesLeviedInr / 100000).toFixed(1) + " L"}
          subtext={metrics.compoundedCount + " compounding orders settled"}
          variant="warning"
          icon={<Scales size={20} />}
        />
      </div>

      {/* Middle Grid: Compliance Distribution Chart & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <ComplianceChart
            compliantCount={metrics.compliantCount}
            violationCount={metrics.violationCount}
            pendingCount={metrics.pendingNoticesCount}
          />

          {/* Quick Navigation Cards */}
          <div className="bg-white p-4 rounded-[8px] border border-neutral-200 space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-heading">
              Enforcement Modules
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate("inspections")}
                className="p-3 rounded-[6px] border border-neutral-200 hover:border-primary hover:bg-primary-light/20 text-left transition-colors space-y-1"
              >
                <div className="text-xs font-bold text-neutral-900 font-heading flex items-center justify-between">
                  <span>Inspection Ledger</span>
                  <FileText size={14} className="text-primary" />
                </div>
                <p className="text-[11px] text-neutral-500">
                  Manage active show-cause case files
                </p>
              </button>

              <button
                onClick={() => onNavigate("reports")}
                className="p-3 rounded-[6px] border border-neutral-200 hover:border-primary hover:bg-primary-light/20 text-left transition-colors space-y-1"
              >
                <div className="text-xs font-bold text-neutral-900 font-heading flex items-center justify-between">
                  <span>Report Archive</span>
                  <DownloadSimple size={14} className="text-primary" />
                </div>
                <p className="text-[11px] text-neutral-500">
                  Export district PDF dockets
                </p>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <ActivityFeed
            actions={MOCK_RECENT_ACTIONS}
            onViewCase={() => onNavigate("inspections")}
          />
        </div>
      </div>

      {/* Bottom Section: Top Statutory Violation Breakdown */}
      <div className="bg-white p-5 rounded-[8px] border border-neutral-200 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 font-heading flex items-center gap-2">
              <TrendUp size={18} className="text-primary" />
              <span>Predominant Regulatory Infractions (Current Inspection Cycle)</span>
            </h3>
            <p className="text-xs text-neutral-500">
              Breakdown of non-compliance patterns flagged under the Legal Metrology Act, 2009
            </p>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            413 Total Infractions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                <th className="py-2.5 px-3">Statutory Rule Citation</th>
                <th className="py-2.5 px-3">Infraction Category</th>
                <th className="py-2.5 px-3">Governing Act</th>
                <th className="py-2.5 px-3 text-right">Incidence Count</th>
                <th className="py-2.5 px-3 text-right">Proportion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-150">
              {MOCK_TOP_VIOLATIONS.map((viol, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">
                    {viol.ruleClause}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-800 font-medium">
                    {viol.categoryTitle}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-500 font-mono">
                    {viol.actSection}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900">
                    {viol.count}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          style={{ width: `${viol.percentage}%` }}
                          className="bg-violation h-full"
                        />
                      </div>
                      <span className="font-mono text-neutral-700 w-10 text-right">
                        {viol.percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
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
