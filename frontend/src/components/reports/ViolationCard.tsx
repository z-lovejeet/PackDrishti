import React from "react";
import { Warning, Scales, ShieldWarning, Gavel, ShieldCheck, FileText, Info } from "@phosphor-icons/react";
import { StatutoryViolation } from "../../types";

interface ViolationCardProps {
  violation: StatutoryViolation;
  onFileNotice?: () => void;
  showAction?: boolean;
}

export const ViolationCard: React.FC<ViolationCardProps> = ({
  violation,
  onFileNotice,
  showAction = false,
}) => {
  const getSeverityPill = () => {
    switch (violation.severity) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1 text-2xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs">
            <ShieldWarning size={13} weight="fill" className="text-rose-700" />
            <span>High Severity Infraction</span>
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 text-2xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
            <Warning size={13} weight="fill" className="text-amber-700" />
            <span>Medium Severity</span>
          </span>
        );
      case "low":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-2xs font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-300 shadow-2xs">
            <Info size={13} weight="bold" className="text-neutral-600" />
            <span>Procedural Non-Compliance</span>
          </span>
        );
    }
  };

  return (
    <div className="p-5 rounded-lg border border-rose-200/90 border-l-4 border-l-rose-600 bg-rose-50/25 shadow-xs space-y-3.5 transition-all">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xs font-bold px-2.5 py-0.5 rounded bg-rose-700 text-white uppercase tracking-wider font-mono shadow-2xs">
              {violation.ruleReference}
            </span>
            {getSeverityPill()}
            <span className="text-2xs font-semibold text-neutral-700 flex items-center gap-1 font-mono bg-white px-2 py-0.5 rounded border border-neutral-200 shadow-2xs">
              <Scales size={13} className="text-neutral-500" />
              {violation.actSection || "Section 36(1) LMA 2009"}
            </span>
          </div>

          <h4 className="text-sm sm:text-base font-bold text-neutral-900 font-heading">
            {violation.title}
          </h4>
        </div>

        <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
          <ShieldWarning size={20} weight="fill" />
        </div>
      </div>

      {/* Infraction Description */}
      <p className="text-xs text-neutral-700 leading-relaxed font-sans">
        {violation.description}
      </p>

      {/* Section 36(1) Compounding & Penalty Box */}
      <div className="p-3.5 rounded-md bg-white border border-neutral-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap border-b border-neutral-100 pb-2">
          <div className="flex items-center gap-1.5 text-neutral-900 font-bold text-2xs uppercase tracking-wide">
            <Gavel size={15} className="text-rose-600 shrink-0" />
            <span>Section 36(1) Compounding Provision</span>
          </div>
          <span className="text-2xs font-mono font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200/80">
            Penalty Limit: Up to INR 25,000 (First Offence)
          </span>
        </div>

        <div className="text-xs text-neutral-700 leading-relaxed font-mono">
          <strong className="font-semibold text-neutral-900 font-sans">Statutory Sanction: </strong>
          <span>{violation.penaltyClause}</span>
        </div>
      </div>

      {/* Corrective Rectification Instruction */}
      <div className="p-3.5 rounded-md bg-emerald-50/60 border border-emerald-200/80 shadow-xs space-y-1.5">
        <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-2xs uppercase tracking-wide">
          <ShieldCheck size={16} className="text-emerald-700 shrink-0" weight="fill" />
          <span>Mandated Statutory Rectification</span>
        </div>
        <p className="text-xs text-neutral-800 font-medium leading-relaxed">
          {violation.correctiveAction}
        </p>
      </div>

      {/* Enforcement Notice Action */}
      {showAction && onFileNotice && (
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={onFileNotice}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-rose-700 hover:bg-rose-800 text-white font-sans text-xs font-semibold shadow-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <FileText size={15} weight="bold" />
            <span>Draft Show-Cause Notice under Sec 36(1)</span>
          </button>
        </div>
      )}
    </div>
  );
};
