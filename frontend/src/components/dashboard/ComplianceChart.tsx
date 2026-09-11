import React from "react";
import { CheckCircle, XCircle } from "@phosphor-icons/react";

interface ComplianceChartProps {
  compliantCount: number;
  violationCount: number;
  pendingCount?: number;
}

export const ComplianceChart: React.FC<ComplianceChartProps> = ({
  compliantCount,
  violationCount,
}) => {
  const actualTotal = compliantCount + violationCount;
  const total = Math.max(1, actualTotal);
  const compliantPct = actualTotal > 0 ? Math.round((compliantCount / total) * 100) : 0;
  const violationPct = actualTotal > 0 ? 100 - compliantPct : 0;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-heading">
            Compliance Distribution
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {actualTotal > 0
              ? `${actualTotal.toLocaleString("en-IN")} commodities inspected`
              : "No commodities inspected"}
          </p>
        </div>
        {actualTotal > 0 && (
          <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
            {compliantPct}% compliant
          </span>
        )}
      </div>

      {/* Segmented Progress Bar */}
      <div className="space-y-2">
        <div className="h-2 w-full rounded-full bg-slate-100 flex gap-0.5 overflow-hidden">
          {compliantPct > 0 && (
            <div
              style={{ width: `${compliantPct}%` }}
              className="bg-slate-900 h-full transition-all duration-300"
              title={`Compliant: ${compliantPct}%`}
            />
          )}
          {violationPct > 0 && (
            <div
              style={{ width: `${violationPct}%` }}
              className="bg-slate-300 h-full transition-all duration-300"
              title={`Infractions: ${violationPct}%`}
            />
          )}
        </div>
      </div>

      {/* Clean Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-slate-900 shrink-0" />
              <span className="font-medium">Compliant</span>
            </div>
            <CheckCircle size={14} className="text-slate-700 shrink-0" weight="bold" />
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-base font-bold text-slate-900 font-heading">
              {compliantCount.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {compliantPct}%
            </span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
              <span className="font-medium">Infractions</span>
            </div>
            <XCircle size={14} className="text-slate-500 shrink-0" weight="bold" />
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-base font-bold text-slate-900 font-heading">
              {violationCount.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {violationPct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
