import React from "react";
import { CheckCircle, XCircle, Warning, TextT, Eye } from "@phosphor-icons/react";
import { ExtractedDeclaration } from "../../types";

interface ComplianceCardProps {
  declaration: ExtractedDeclaration;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const ComplianceCard: React.FC<ComplianceCardProps> = ({
  declaration,
  isSelected,
  onSelect,
}) => {
  const getStatusDetails = () => {
    switch (declaration.status) {
      case "compliant":
        return {
          icon: <CheckCircle size={18} className="text-success shrink-0" weight="fill" />,
          bgColor: isSelected ? "bg-success-light/40 border-success" : "bg-white border-neutral-200 hover:border-neutral-300",
          statusText: "Compliant",
          statusClass: "text-success",
        };
      case "violation":
        return {
          icon: <XCircle size={18} className="text-violation shrink-0" weight="fill" />,
          bgColor: isSelected ? "bg-violation-light/50 border-violation" : "bg-violation-light/20 border-violation-border hover:border-violation",
          statusText: "Non-Compliant",
          statusClass: "text-violation",
        };
      case "warning":
      default:
        return {
          icon: <Warning size={18} className="text-warning shrink-0" weight="fill" />,
          bgColor: isSelected ? "bg-warning-light/40 border-warning" : "bg-white border-neutral-200 hover:border-neutral-300",
          statusText: "Caution",
          statusClass: "text-warning",
        };
    }
  };

  const status = getStatusDetails();

  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-[8px] border transition-all cursor-pointer ${status.bgColor} ${
        isSelected ? "ring-2 ring-primary/20 shadow-xs" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 font-mono border border-neutral-200">
              {declaration.ruleClause}
            </span>
            <h4 className="text-xs font-bold text-neutral-900 font-heading">
              {declaration.fieldName}
            </h4>
          </div>

          <p className="text-xs font-medium text-neutral-800 break-words font-mono bg-neutral-50/80 p-1.5 rounded border border-neutral-150">
            {declaration.extractedValue}
          </p>

          {declaration.statusNote && (
            <p className="text-[11px] text-neutral-500 italic">
              {declaration.statusNote}
            </p>
          )}

          {declaration.measuredFontHeightMm && declaration.requiredFontHeightMm && (
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 pt-0.5">
              <TextT size={13} className="text-neutral-400" />
              <span>
                Font Height:{" "}
                <strong className={declaration.measuredFontHeightMm >= declaration.requiredFontHeightMm ? "text-success font-mono" : "text-violation font-mono"}>
                  {declaration.measuredFontHeightMm} mm
                </strong>{" "}
                / Min {declaration.requiredFontHeightMm} mm
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-1">
            {status.icon}
            <span className={`text-xs font-bold font-heading ${status.statusClass}`}>
              {status.statusText}
            </span>
          </div>

          {declaration.boxId && (
            <span className="text-[10px] text-neutral-400 flex items-center gap-1 hover:text-primary">
              <Eye size={12} />
              <span>Locate</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
