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
  const total = Math.max(1, compliantCount + violationCount + pendingCount);
  const compliantPct = Math.round((compliantCount / total) * 100);
  const violationPct = Math.round((violationCount / total) * 100);
  const pendingPct = Math.max(0, 100 - compliantPct - violationPct);

  return (
    <div className="bg-white p-5 rounded-[8px] border border-neutral-200 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 font-heading">
            Jurisdiction Compliance Distribution
          </h3>
          <p className="text-xs text-neutral-500">
            Total {total.toLocaleString("en-IN")} commodities inspected across current cycle
          </p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-neutral-900 font-heading">
            {compliantPct}%
          </span>
          <span className="text-[11px] block text-neutral-500 font-medium">
            Overall Rate
          </span>
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div className="h-3 w-full rounded-full bg-neutral-100 overflow-hidden flex">
        <div
          style={{ width: `${compliantPct}%` }}
          className="bg-success h-full transition-all"
          title={`Compliant: ${compliantPct}%`}
        />
        <div
          style={{ width: `${violationPct}%` }}
          className="bg-violation h-full transition-all"
          title={`Violations: ${violationPct}%`}
        />
        <div
          style={{ width: `${pendingPct}%` }}
          className="bg-warning h-full transition-all"
          title={`Under Notice: ${pendingPct}%`}
        />
      </div>

      {/* Metric Breakdown Badges */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-100 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-success shrink-0" weight="fill" />
          <div>
            <span className="font-bold text-neutral-900 block font-heading">
              {compliantCount} ({compliantPct}%)
            </span>
            <span className="text-neutral-500 text-[11px]">Fully Compliant</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <XCircle size={16} className="text-violation shrink-0" weight="fill" />
          <div>
            <span className="font-bold text-neutral-900 block font-heading">
              {violationCount} ({violationPct}%)
            </span>
            <span className="text-neutral-500 text-[11px]">Infractions Detected</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Warning size={16} className="text-warning shrink-0" weight="fill" />
          <div>
            <span className="font-bold text-neutral-900 block font-heading">
              {pendingCount} ({pendingPct}%)
            </span>
            <span className="text-neutral-500 text-[11px]">Show Cause / Review</span>
          </div>
        </div>
      </div>
    </div>
  );
};
