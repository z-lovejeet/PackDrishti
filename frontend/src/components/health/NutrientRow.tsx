import React from "react";
import { NutrientAudit } from "../../types";
import { Badge } from "../common/Badge";

interface NutrientRowProps {
  nutrient: NutrientAudit;
}

export const NutrientRow: React.FC<NutrientRowProps> = ({ nutrient }) => {
  const getLevelBadge = (level: NutrientAudit["level"]) => {
    switch (level) {
      case "Excessive":
        return <Badge variant="violation" size="sm">Excessive Warning</Badge>;
      case "High":
        return <Badge variant="warning" size="sm">High</Badge>;
      case "Moderate":
        return <Badge variant="neutral" size="sm">Moderate</Badge>;
      case "Low":
      default:
        return <Badge variant="compliant" size="sm">Low / Safe</Badge>;
    }
  };

  return (
    <div className="p-3 bg-white rounded-[6px] border border-neutral-200 hover:border-neutral-300 transition-colors space-y-1.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-900 font-heading">
            {nutrient.name}
          </span>
          {getLevelBadge(nutrient.level)}
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-neutral-900 font-mono">
            {nutrient.valuePer100g} {nutrient.unit}
          </span>
          <span className="text-[10px] text-neutral-500 block">
            per 100g ({nutrient.valuePerServe} {nutrient.unit} / serve)
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-0.5">
        <span>Standard Limit: {nutrient.icmrDailyLimit}</span>
      </div>

      <p className="text-[11px] text-neutral-600 bg-neutral-50 p-2 rounded border border-neutral-100 leading-normal">
        {nutrient.assessment}
      </p>
    </div>
  );
};
