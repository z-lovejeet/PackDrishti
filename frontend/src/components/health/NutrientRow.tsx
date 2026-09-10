import React from "react";
import { CheckCircle, Warning, WarningCircle, Info, Scales } from "@phosphor-icons/react";
import { NutrientAudit } from "../../types";

interface NutrientRowProps {
  nutrient: NutrientAudit;
}

export const NutrientRow: React.FC<NutrientRowProps> = ({ nutrient }) => {
  const getLevelConfig = (level: NutrientAudit["level"]) => {
    switch (level) {
      case "Excessive":
        return {
          variant: "bg-rose-50 text-rose-800 border-rose-200",
          barColor: "bg-rose-500",
          tierIndex: 3,
          label: "Excessive Warning",
          icon: <WarningCircle size={14} weight="fill" className="text-rose-600 shrink-0" />,
        };
      case "High":
        return {
          variant: "bg-amber-50 text-amber-900 border-amber-200",
          barColor: "bg-amber-500",
          tierIndex: 2,
          label: "High Concentration",
          icon: <Warning size={14} weight="fill" className="text-amber-600 shrink-0" />,
        };
      case "Moderate":
        return {
          variant: "bg-blue-50 text-blue-800 border-blue-200",
          barColor: "bg-blue-500",
          tierIndex: 1,
          label: "Moderate Level",
          icon: <Info size={14} weight="bold" className="text-blue-600 shrink-0" />,
        };
      case "Low":
      default:
        return {
          variant: "bg-emerald-50 text-emerald-800 border-emerald-200",
          barColor: "bg-emerald-500",
          tierIndex: 0,
          label: "Low / Safe Range",
          icon: <CheckCircle size={14} weight="fill" className="text-emerald-600 shrink-0" />,
        };
    }
  };

  const config = getLevelConfig(nutrient.level);
  const tiers = ["Low", "Moderate", "High", "Excessive"];

  return (
    <div className="p-4 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-all shadow-xs space-y-3">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-neutral-900 font-heading">
            {nutrient.name}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-2xs font-semibold px-2.5 py-0.5 rounded-full border ${config.variant}`}
          >
            {config.icon}
            <span>{config.label}</span>
          </span>
        </div>

        {/* 4-Tier Concentration Meter */}
        <div className="flex items-center gap-1">
          {tiers.map((tier, idx) => {
            const isFilled = idx <= config.tierIndex;
            return (
              <div
                key={tier}
                title={`Level: ${tier}`}
                className={`h-2 w-6 rounded-xs transition-colors ${
                  isFilled ? config.barColor : "bg-neutral-200"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Metric Breakdown Table Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <div className="bg-neutral-50 rounded-md p-2.5 border border-neutral-200/70 space-y-0.5">
          <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wider block">
            Per 100g Baseline
          </span>
          <span className="text-xs font-bold text-neutral-900 font-mono block">
            {nutrient.valuePer100g} {nutrient.unit}
          </span>
        </div>

        <div className="bg-neutral-50 rounded-md p-2.5 border border-neutral-200/70 space-y-0.5">
          <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wider block">
            Per Serving Unit
          </span>
          <span className="text-xs font-bold text-neutral-800 font-mono block">
            {nutrient.valuePerServe} {nutrient.unit}
          </span>
        </div>

        <div className="bg-neutral-50 rounded-md p-2.5 border border-neutral-200/70 space-y-0.5">
          <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-1">
            <Scales size={12} className="text-neutral-400" />
            <span>ICMR Recommended Limit</span>
          </span>
          <span className="text-xs font-bold text-neutral-700 font-mono block">
            {nutrient.icmrDailyLimit}
          </span>
        </div>
      </div>

      {/* Clinical / Dietary Assessment Note */}
      {nutrient.assessment && (
        <div className="text-xs text-neutral-700 bg-neutral-50/90 p-2.5 rounded-md border border-neutral-200/80 leading-relaxed">
          <span className="font-semibold text-neutral-800">Dietary Assessment: </span>
          <span>{nutrient.assessment}</span>
        </div>
      )}
    </div>
  );
};
