import React from "react";
import { CheckCircle, XCircle, Warning, TextT, Crosshair } from "@phosphor-icons/react";
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
          icon: <CheckCircle size={16} className="text-emerald-600 shrink-0" weight="fill" />,
          pillStyle: "bg-emerald-50 text-emerald-800 border-emerald-200",
          statusText: "Compliant",
          borderColor: isSelected ? "border-navy-800 ring-2 ring-navy-800/20 bg-navy-50/15" : "border-neutral-200 hover:border-neutral-300 bg-white",
        };
      case "violation":
        return {
          icon: <XCircle size={16} className="text-rose-600 shrink-0" weight="fill" />,
          pillStyle: "bg-rose-50 text-rose-800 border-rose-200",
          statusText: "Non-Compliant",
          borderColor: isSelected ? "border-rose-600 ring-2 ring-rose-600/20 bg-rose-50/20" : "border-rose-200/80 hover:border-rose-300 bg-rose-50/10",
        };
      case "warning":
      default:
        return {
          icon: <Warning size={16} className="text-amber-600 shrink-0" weight="fill" />,
          pillStyle: "bg-amber-50 text-amber-900 border-amber-200",
          statusText: "Caution Required",
          borderColor: isSelected ? "border-amber-600 ring-2 ring-amber-600/20 bg-amber-50/20" : "border-neutral-200 hover:border-neutral-300 bg-white",
        };
    }
  };

  const status = getStatusDetails();
  const hasFontMetrics = Boolean(declaration.measuredFontHeightMm && declaration.requiredFontHeightMm);
  const isFontPassing = (declaration.measuredFontHeightMm || 0) >= (declaration.requiredFontHeightMm || 0);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Declaration ${declaration.fieldName}, clause ${declaration.ruleClause}, status ${status.statusText}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}
      className={`p-4 rounded-lg border transition-all cursor-pointer shadow-xs space-y-3 outline-hidden focus-visible:ring-2 focus-visible:ring-navy-800 ${status.borderColor}`}
    >
      {/* Top Header: Clause Badge & Status Pill */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-navy-50 text-navy-900 font-mono border border-navy-200/90 shadow-2xs">
              {declaration.ruleClause}
            </span>
            <h4 className="text-sm font-bold text-neutral-900 font-heading">
              {declaration.fieldName}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 text-2xs font-semibold px-2.5 py-1 rounded-full border shadow-2xs ${status.pillStyle}`}
          >
            {status.icon}
            <span>{status.statusText}</span>
          </span>
        </div>
      </div>

      {/* Declared Value Monospace Box */}
      <div className="space-y-1">
        <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wider block">
          Declared Packaging Text:
        </span>
        <div className="p-2.5 rounded-md bg-neutral-50/90 border border-neutral-200 font-mono text-xs text-neutral-900 break-words leading-relaxed">
          {declaration.extractedValue || "Not declared on packaging panel"}
        </div>
      </div>

      {/* Font Height & Contrast Comparison Micro-Table */}
      {hasFontMetrics && (
        <div className="bg-neutral-50/60 rounded-md border border-neutral-200/80 p-2.5 space-y-1.5">
          <div className="flex items-center gap-1 text-2xs font-bold text-neutral-700 uppercase tracking-wide">
            <TextT size={14} className="text-neutral-500" />
            <span>Rule 7 Table-I Cap-Height Comparison</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-white rounded p-1.5 border border-neutral-200">
              <span className="text-2xs text-neutral-500 block">Required Min</span>
              <span className="font-mono font-bold text-neutral-800">
                {declaration.requiredFontHeightMm} mm
              </span>
            </div>
            <div className="bg-white rounded p-1.5 border border-neutral-200">
              <span className="text-2xs text-neutral-500 block">Measured Height</span>
              <span
                className={`font-mono font-bold ${
                  isFontPassing ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {declaration.measuredFontHeightMm} mm
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-white rounded p-1.5 border border-neutral-200 flex flex-col justify-center">
              <span className="text-2xs text-neutral-500 block">Result</span>
              <span
                className={`text-2xs font-bold uppercase tracking-wider ${
                  isFontPassing ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {isFontPassing ? "Conforms to Table-I" : "Deficient Height"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Status Observation Note */}
      {declaration.statusNote && (
        <div className="text-xs text-neutral-600 bg-neutral-100/60 p-2.5 rounded-md border border-neutral-200/70 leading-relaxed italic">
          <span className="font-semibold not-italic text-neutral-700">Observation: </span>
          <span>{declaration.statusNote}</span>
        </div>
      )}

      {/* Footer Locate Action */}
      {declaration.boxId && (
        <div className="pt-1 flex items-center justify-between border-t border-neutral-100 text-2xs">
          <span className="text-neutral-500 font-mono">Box ID: {declaration.boxId}</span>
          <span className="text-navy-800 font-semibold flex items-center gap-1 hover:underline">
            <Crosshair size={13} />
            <span>Locate on Packaging PDP</span>
          </span>
        </div>
      )}
    </div>
  );
};
