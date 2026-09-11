import React from 'react';
import { CheckCircle, Warning, WarningCircle, Info, Scales } from '@phosphor-icons/react';
import { NutrientAudit } from '../../types';

interface NutrientRowProps {
  nutrient: NutrientAudit;
}

const formatNutrientValue = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '0';
  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val) || val > 100000) return '0';
    return Number.isInteger(val) ? val.toString() : parseFloat(val.toFixed(1)).toString();
  }
  const strVal = String(val).trim();
  if (/e[+-]?\d+/i.test(strVal)) return '0';
  const numMatch = strVal.match(/^(\d+(?:\.\d+)?)/);
  if (numMatch) {
    const num = parseFloat(numMatch[1]);
    if (isNaN(num) || num > 100000) return '0';
    return Number.isInteger(num) ? num.toString() : parseFloat(num.toFixed(1)).toString();
  }
  return strVal;
};

export const NutrientRow: React.FC<NutrientRowProps> = ({ nutrient }) => {
  const getLevelConfig = (level: NutrientAudit['level']) => {
    switch (level) {
      case 'Excessive':
        return {
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
          barColor: 'bg-rose-500',
          tierIndex: 3,
          label: 'Excessive',
          icon: <WarningCircle size={14} weight="fill" className="text-rose-600 shrink-0" />,
        };
      case 'High':
        return {
          badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
          barColor: 'bg-amber-500',
          tierIndex: 2,
          label: 'High Content',
          icon: <Warning size={14} weight="fill" className="text-amber-600 shrink-0" />,
        };
      case 'Moderate':
        return {
          badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
          barColor: 'bg-blue-500',
          tierIndex: 1,
          label: 'Moderate',
          icon: <Info size={14} weight="bold" className="text-blue-600 shrink-0" />,
        };
      case 'Low':
      default:
        return {
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          barColor: 'bg-emerald-500',
          tierIndex: 0,
          label: 'Low / Safe',
          icon: <CheckCircle size={14} weight="fill" className="text-emerald-600 shrink-0" />,
        };
    }
  };

  const config = getLevelConfig(nutrient.level);
  const tiers = ['Low', 'Moderate', 'High', 'Excessive'];

  const formatted100g = formatNutrientValue(nutrient.valuePer100g);
  const formattedServe = nutrient.valuePerServe !== undefined && nutrient.valuePerServe !== null
    ? formatNutrientValue(nutrient.valuePerServe)
    : null;
  const cleanUnit = (nutrient.unit || 'g').trim();

  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all shadow-2xs space-y-3">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 font-heading">
            {nutrient.name}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-2xs font-semibold px-2 py-0.5 rounded-full border ${config.badgeClass}`}
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
                title={`Concentration: ${tier}`}
                className={`h-2 w-5 rounded-xs transition-colors ${
                  isFilled ? config.barColor : 'bg-slate-200'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Metric Breakdown 3-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200/80 space-y-0.5">
          <span className="text-2xs font-medium text-slate-500 uppercase tracking-wider block">
            Per 100g Baseline
          </span>
          <span className="text-xs font-bold text-slate-900 font-mono block">
            {formatted100g} {cleanUnit}
          </span>
        </div>

        <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200/80 space-y-0.5">
          <span className="text-2xs font-medium text-slate-500 uppercase tracking-wider block">
            Per Serving Unit
          </span>
          <span className="text-xs font-bold text-slate-800 font-mono block">
            {formattedServe !== null ? `${formattedServe} ${cleanUnit}` : 'Declared per 100g'}
          </span>
        </div>

        <div className="bg-slate-50 rounded-md p-2.5 border border-slate-200/80 space-y-0.5">
          <span className="text-2xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Scales size={12} className="text-slate-400" />
            <span>ICMR Limit</span>
          </span>
          <span className="text-xs font-bold text-slate-700 font-mono block">
            {nutrient.icmrDailyLimit || 'ICMR Reference Standard'}
          </span>
        </div>
      </div>

      {/* Dietary Assessment Callout */}
      {nutrient.assessment && (
        <div className="text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-md border border-slate-200/70 leading-relaxed">
          <span className="font-semibold text-slate-800">Dietary Assessment: </span>
          <span>{nutrient.assessment}</span>
        </div>
      )}
    </div>
  );
};
