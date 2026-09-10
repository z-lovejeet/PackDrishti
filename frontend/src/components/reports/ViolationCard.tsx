import React from "react";
import { Warning, Scales, ShieldWarning, Gavel } from "@phosphor-icons/react";
import { StatutoryViolation } from "../../types";
import { Badge } from "../common/Badge";

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
  const getSeverityBadge = () => {
    switch (violation.severity) {
      case "high":
        return <Badge variant="violation" size="sm">High Severity</Badge>;
      case "medium":
        return <Badge variant="warning" size="sm">Medium Severity</Badge>;
      case "low":
      default:
        return <Badge variant="neutral" size="sm">Procedural</Badge>;
    }
  };

  return (
    <div className="p-4 rounded-[8px] border border-violation-border bg-violation-light/30 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violation text-white uppercase tracking-wider font-mono">
              {violation.ruleReference}
            </span>
            {getSeverityBadge()}
            <span className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1 font-mono">
              <Scales size={13} />
              {violation.actSection}
            </span>
          </div>

          <h4 className="text-sm font-bold text-neutral-900 font-heading">
            {violation.title}
          </h4>
        </div>

        <ShieldWarning size={20} className="text-violation shrink-0 mt-1" weight="bold" />
      </div>

      <p className="text-xs text-neutral-700 leading-relaxed">
        {violation.description}
      </p>

      {/* Statutory Penalty and Cure Box */}
      <div className="p-2.5 rounded-[6px] bg-white border border-neutral-200 space-y-1.5 text-xs">
        <div className="flex items-start gap-1.5 text-neutral-800">
          <Gavel size={14} className="text-violation shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-neutral-900">Penalty Provision: </strong>
            <span>{violation.penaltyClause}</span>
          </div>
        </div>

        <div className="flex items-start gap-1.5 text-neutral-700 pt-1 border-t border-neutral-100">
          <Warning size={14} className="text-primary shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-neutral-900">Mandated Rectification: </strong>
            <span>{violation.correctiveAction}</span>
          </div>
        </div>
      </div>

      {showAction && onFileNotice && (
        <div className="pt-1 flex justify-end">
          <button
            onClick={onFileNotice}
            className="text-xs font-semibold text-violation hover:text-violation-hover flex items-center gap-1 transition-colors"
          >
            <span>Draft Show-Cause Notice under Sec 36(1)</span>
          </button>
        </div>
      )}
    </div>
  );
};
