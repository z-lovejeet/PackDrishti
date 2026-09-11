import React from 'react';
import { 
  WarningCircle, 
  Flame, 
  Heartbeat, 
  Clock, 
  CheckCircle, 
  Scales,
  Info,
  Drop,
  ShieldWarning
} from '@phosphor-icons/react';
import { HighNutrientRisk } from '../../types';

interface WhatIsHighCardProps {
  items?: HighNutrientRisk[];
  className?: string;
}

export const WhatIsHighCard: React.FC<WhatIsHighCardProps> = ({
  items = [],
  className = '',
}) => {
  if (!items || items.length === 0) {
    return (
      <div className={`p-5 rounded-xl bg-emerald-50/50 border border-emerald-200 shadow-2xs ${className}`}>
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <CheckCircle size={22} weight="fill" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-emerald-950 font-heading tracking-tight">
              No Critical Nutrient Excess Detected
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              All tested markers (sugar, sodium, saturated fat, and calories) remain within ICMR-NIN 2024 safe daily dietary allowances. This product presents a balanced nutritional profile for standard consumption.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getSeverityTokens = (severity: HighNutrientRisk['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          badge: 'bg-rose-100 text-rose-900 border-rose-300',
          label: 'CRITICAL RISK',
          border: 'border-rose-200 hover:border-rose-300',
          topBar: 'bg-rose-600',
          headerBg: 'bg-rose-50/70',
          icon: <WarningCircle size={20} weight="fill" className="text-rose-600 shrink-0" />,
          measuredText: 'text-rose-700 font-bold',
        };
      case 'high':
        return {
          badge: 'bg-amber-100 text-amber-950 border-amber-300',
          label: 'HIGH CONCERN',
          border: 'border-amber-200 hover:border-amber-300',
          topBar: 'bg-amber-500',
          headerBg: 'bg-amber-50/70',
          icon: <Flame size={20} weight="fill" className="text-amber-600 shrink-0" />,
          measuredText: 'text-amber-800 font-bold',
        };
      case 'moderate':
      default:
        return {
          badge: 'bg-slate-100 text-slate-800 border-slate-300',
          label: 'MODERATE ELEVATION',
          border: 'border-slate-200 hover:border-slate-300',
          topBar: 'bg-slate-500',
          headerBg: 'bg-slate-50',
          icon: <Info size={20} weight="bold" className="text-slate-600 shrink-0" />,
          measuredText: 'text-slate-800 font-bold',
        };
    }
  };

  const getNutrientIcon = (name: string) => {
    const l = name.toLowerCase();
    if (l.includes('sugar') || l.includes('sweetener')) {
      return <WarningCircle size={18} weight="fill" className="text-rose-600 shrink-0" />;
    }
    if (l.includes('fat') || l.includes('palm') || l.includes('lipid')) {
      return <Drop size={18} weight="fill" className="text-amber-600 shrink-0" />;
    }
    if (l.includes('sodium') || l.includes('salt')) {
      return <Scales size={18} weight="bold" className="text-amber-700 shrink-0" />;
    }
    if (l.includes('caffeine')) {
      return <Flame size={18} weight="fill" className="text-rose-600 shrink-0" />;
    }
    return <ShieldWarning size={18} weight="fill" className="text-rose-600 shrink-0" />;
  };

  return (
    <div className={`space-y-4 ${className}`} aria-label="High Nutrients and Health Consequences">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/80 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldWarning size={20} weight="fill" className="text-rose-600 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-slate-950 font-heading tracking-tight">
              What Is High &amp; What Does It Cause?
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Plain-language explanations of nutrients breaching ICMR-NIN safe limits, their immediate bodily reactions, and chronic risks.
          </p>
        </div>
        <span className="self-start sm:self-auto px-2.5 py-1 rounded-md text-2xs font-mono font-bold bg-rose-50 text-rose-900 border border-rose-200 shrink-0">
          {items.length} {items.length === 1 ? 'Excess Nutrient' : 'Excess Nutrients'} Detected
        </span>
      </div>

      {/* Grid of Excess Nutrients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => {
          const tokens = getSeverityTokens(item.severity);
          const icon = getNutrientIcon(item.nutrient);

          return (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-xl border bg-white shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between ${tokens.border}`}
            >
              {/* Color Top Accent */}
              <div className={`h-1 w-full ${tokens.topBar}`} />

              <div className="p-4 sm:p-5 space-y-4">
                {/* Header: Name + Measured vs Limit Pill + Severity */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                      {icon}
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-950 font-heading tracking-tight leading-snug">
                        {item.nutrient}
                      </h4>
                      <span className="text-2xs font-mono text-slate-500 block">
                        ICMR-NIN 2024 Threshold Audit
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-2xs font-mono font-bold border tracking-wider uppercase ${tokens.badge}`}>
                    {tokens.label}
                  </span>
                </div>

                {/* Quantitative Metric Bar */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-2xs uppercase tracking-wider text-slate-500 font-mono block">
                      Measured Quantity
                    </span>
                    <span className={`text-sm sm:text-base font-mono ${tokens.measuredText}`}>
                      {item.measuredValue}
                    </span>
                  </div>

                  <div className="h-8 w-px bg-slate-200" />

                  <div className="text-right">
                    <span className="text-2xs uppercase tracking-wider text-slate-500 font-mono block">
                      Safe Daily Limit
                    </span>
                    <span className="text-xs sm:text-sm font-mono text-slate-700 font-semibold">
                      {item.icmrLimit}
                    </span>
                  </div>
                </div>

                {/* Section 1: What Is It? */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 text-2xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    <Info size={14} weight="bold" className="text-slate-500 shrink-0" />
                    <span>What Is It?</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-2.5 rounded-md border border-slate-100">
                    {item.whatIsIt}
                  </p>
                </div>

                {/* Section 2: Immediate Bodily Reaction */}
                {item.immediateEffects && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-2xs font-bold text-amber-900 uppercase tracking-wider font-mono">
                      <Clock size={14} weight="fill" className="text-amber-600 shrink-0" />
                      <span>Immediate Bodily Reaction (0-2 Hours)</span>
                    </div>
                    <p className="text-xs text-amber-950/90 leading-relaxed bg-amber-50/60 p-2.5 rounded-md border border-amber-200/70">
                      {item.immediateEffects}
                    </p>
                  </div>
                )}

                {/* Section 3: Chronic Clinical Consequences */}
                {item.whatItCauses && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-2xs font-bold text-rose-900 uppercase tracking-wider font-mono">
                      <Heartbeat size={14} weight="fill" className="text-rose-600 shrink-0" />
                      <span>What It Causes Long-Term (Chronic Impact)</span>
                    </div>
                    <p className="text-xs text-rose-950/90 leading-relaxed bg-rose-50/60 p-2.5 rounded-md border border-rose-200/70">
                      {item.whatItCauses}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Regulatory Citation */}
              <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-2xs font-mono text-slate-500">
                <span>National Institute of Nutrition (NIN)</span>
                <span className="font-medium text-slate-700">ICMR-NIN 2024 Standard</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
