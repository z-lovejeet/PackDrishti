import React from "react";
import { CheckCircle, XCircle, Warning } from "@phosphor-icons/react";

interface ComplianceChartProps {
  compliantCount: number;
  violationCount: number;
  pendingCount: number;
}

export const ComplianceChart: React.FC<ComplianceChartProps> = ({
  compliantCount,
  violationCount,
  pendingCount,
}) => {
  const actualTotal = compliantCount + violationCount + pendingCount;
  const total = Math.max(1, actualTotal);
  const compliantPct = actualTotal > 0 ? Math.round((compliantCount / total) * 100) : 0;
  const violationPct = actualTotal > 0 ? Math.round((violationCount / total) * 100) : 0;
  const pendingPct = actualTotal > 0 ? Math.max(0, 100 - compliantPct - violationPct) : 0;

  return (
    <div className="bg-white p-5 rounded-card border border-neutral-200 shadow-card space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 font-heading tracking-tight">
            Jurisdiction Compliance Distribution
          </h3>
          <p className="text-2xs text-neutral-500 mt-0.5">
            Total {actualTotal.toLocaleString("en-IN")} commodities inspected across current cycle
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-2xl font-bold text-neutral-900 font-heading leading-none">
              {compliantPct}%
            </span>
          </div>
          <span className="text-2xs font-semibold text-neutral-500 uppercase tracking-wider block mt-1">
            Overall Rate
          </span>
        </div>
      </div>

      {/* Segmented Progress Bar with Smooth Rounded Corners & Spacing */}
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded-full bg-neutral-100 p-0.5 flex gap-1 shadow-inner overflow-hidden">
          {compliantPct > 0 && (
            <div
              style={{ width: `${compliantPct}%` }}
              className="bg-success h-full rounded-full transition-all duration-500 ease-out"
              title={`Fully Compliant: ${compliantPct}%`}
            />
          )}
          {violationPct > 0 && (
            <div
              style={{ width: `${violationPct}%` }}
              className="bg-violation h-full rounded-full transition-all duration-500 ease-out"
              title={`Infractions Detected: ${violationPct}%`}
            />
          )}
          {pendingPct > 0 && (
            <div
              style={{ width: `${pendingPct}%` }}
              className="bg-warning h-full rounded-full transition-all duration-500 ease-out"
              title={`Show Cause / Under Review: ${pendingPct}%`}
            />
          )}
        </div>

        {/* Percentage Labels Row */}
        <div className="flex items-center justify-between text-2xs text-neutral-500 font-mono pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success inline-block shrink-0" />
            <span className="font-semibold text-neutral-700">{compliantPct}%</span>
            <span>Compliant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violation inline-block shrink-0" />
            <span className="font-semibold text-neutral-700">{violationPct}%</span>
            <span>Infractions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning inline-block shrink-0" />
            <span className="font-semibold text-neutral-700">{pendingPct}%</span>
            <span>Under Review</span>
          </div>
        </div>
      </div>

      {/* Clean Legend Cards with Count Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-neutral-100">
        {/* Compliant Card */}
        <div className="bg-neutral-50/70 hover:bg-white border border-neutral-200/90 hover:border-success-border rounded-lg p-3.5 transition-all duration-200 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-neutral-500 uppercase tracking-wider font-heading">
              Fully Compliant
            </span>
            <CheckCircle size={16} className="text-success shrink-0" weight="fill" />
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-lg font-bold text-neutral-900 font-heading">
              {compliantCount.toLocaleString("en-IN")}
            </span>
            <span className="text-2xs font-mono font-semibold text-success bg-success-light px-1.5 py-0.5 rounded border border-success-border">
              {compliantPct}%
            </span>
          </div>
          <p className="text-2xs text-neutral-500 leading-normal">
            Conforming to LMPC Rules
          </p>
        </div>

        {/* Infractions Card */}
        <div className="bg-neutral-50/70 hover:bg-white border border-neutral-200/90 hover:border-violation-border rounded-lg p-3.5 transition-all duration-200 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-neutral-500 uppercase tracking-wider font-heading">
              Infractions
            </span>
            <XCircle size={16} className="text-violation shrink-0" weight="fill" />
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-lg font-bold text-neutral-900 font-heading">
              {violationCount.toLocaleString("en-IN")}
            </span>
            <span className="text-2xs font-mono font-semibold text-violation bg-violation-light px-1.5 py-0.5 rounded border border-violation-border">
              {violationPct}%
            </span>
          </div>
          <p className="text-2xs text-neutral-500 leading-normal">
            Actionable under Sec 36(1)
          </p>
        </div>

        {/* Review / Show Cause Card */}
        <div className="bg-neutral-50/70 hover:bg-white border border-neutral-200/90 hover:border-warning-border rounded-lg p-3.5 transition-all duration-200 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-neutral-500 uppercase tracking-wider font-heading">
              Under Review
            </span>
            <Warning size={16} className="text-warning shrink-0" weight="fill" />
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-lg font-bold text-neutral-900 font-heading">
              {pendingCount.toLocaleString("en-IN")}
            </span>
            <span className="text-2xs font-mono font-semibold text-warning bg-warning-light px-1.5 py-0.5 rounded border border-warning-border">
              {pendingPct}%
            </span>
          </div>
          <p className="text-2xs text-neutral-500 leading-normal">
            Pending show cause / notice
          </p>
        </div>
      </div>
    </div>
  );
};
