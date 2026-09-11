import React from 'react';
import {
  Warning,
  WarningCircle,
  CheckCircle,
  Info,
  Drop,
  ShieldWarning,
  Scales,
  Flame,
  Plant,
} from '@phosphor-icons/react';
import { HealthBadge } from '../../types';

interface HealthBadgeGroupProps {
  badges: HealthBadge[];
  className?: string;
}

const getContextualIcon = (label: string, type: HealthBadge['type']) => {
  const l = label.toLowerCase();
  if (l.includes('palm')) {
    return <Drop size={22} weight="fill" className="text-amber-700 shrink-0" />;
  }
  if (l.includes('sugar') || l.includes('sweetener')) {
    return <WarningCircle size={22} weight="fill" className="text-rose-600 shrink-0" />;
  }
  if (l.includes('saturated') || l.includes('trans fat')) {
    return <Flame size={22} weight="fill" className="text-rose-600 shrink-0" />;
  }
  if (l.includes('sodium') || l.includes('salt')) {
    return <Scales size={22} weight="bold" className="text-amber-700 shrink-0" />;
  }
  if (l.includes('ultra-processed') || l.includes('nova') || l.includes('upf')) {
    return <ShieldWarning size={22} weight="fill" className="text-rose-600 shrink-0" />;
  }
  if (l.includes('maida') || l.includes('flour') || l.includes('refined')) {
    return <Plant size={22} weight="bold" className="text-amber-700 shrink-0" />;
  }

  switch (type) {
    case 'danger':
      return <WarningCircle size={22} weight="fill" className="text-rose-600 shrink-0" />;
    case 'warning':
      return <Warning size={22} weight="fill" className="text-amber-700 shrink-0" />;
    case 'good':
      return <CheckCircle size={22} weight="fill" className="text-emerald-600 shrink-0" />;
    case 'neutral':
    default:
      return <Info size={22} weight="bold" className="text-slate-600 shrink-0" />;
  }
};

const getContextualDescription = (badge: HealthBadge): string => {
  if (badge.description && badge.description.trim().length > 0) {
    return badge.description.trim();
  }
  const l = badge.label.toLowerCase();
  if (l.includes('nova') || l.includes('ultra-processed') || l.includes('upf')) {
    return 'NOVA Group 4 formulation formulated with industrial additives, flavor enhancers, and heavy processing.';
  }
  if (l.includes('sugar')) {
    return 'Free and added sugars exceed ICMR-NIN safe dietary allowances, precipitating rapid glycemic surges.';
  }
  if (l.includes('palm')) {
    return 'Refined palm oil / palmolein identified as primary fat medium, heavily elevating palmitic acid intake.';
  }
  if (l.includes('saturated')) {
    return 'Saturated fatty acid concentration exceeds 10g per 100g, raising atherogenic LDL cholesterol burden.';
  }
  if (l.includes('sodium') || l.includes('salt')) {
    return 'Sodium density exceeds 650mg per 100g, contributing directly to elevated arterial blood pressure.';
  }
  if (l.includes('maida') || l.includes('flour') || l.includes('refined')) {
    return 'Refined wheat flour depleted of natural cereal bran and germ fiber, driving high glycemic response.';
  }
  if (l.includes('calorie')) {
    return 'High caloric density exceeding 500 kcal per 100g, mandating strict portion limitation.';
  }
  if (l.includes('additive') || l.includes('preservative')) {
    return 'Contains synthetic acidity regulators, preservatives, or artificial flavoring compounds.';
  }
  if (badge.type === 'good') {
    return 'Nutritional parameter aligns favorably with ICMR-NIN 2024 recommended dietary allowances.';
  }
  return 'Monitored nutritional safety parameter evaluated under ICMR-NIN 2024 dietary guidelines.';
};

export const HealthBadgeGroup: React.FC<HealthBadgeGroupProps> = ({ badges, className = '' }) => {
  if (!badges || badges.length === 0) {
    return null;
  }

  const getStyleTokens = (type: HealthBadge['type']) => {
    switch (type) {
      case 'danger':
        return {
          cardBg: 'bg-gradient-to-br from-white via-rose-50/40 to-rose-50/70 border-rose-200/90 hover:border-rose-400',
          iconBox: 'bg-rose-100/90 text-rose-700 border border-rose-200/80 shadow-2xs',
          tagBg: 'bg-rose-100 text-rose-900 border border-rose-200',
          tagText: 'CRITICAL RISK',
          accentBar: 'bg-rose-500',
        };
      case 'warning':
        return {
          cardBg: 'bg-gradient-to-br from-white via-amber-50/40 to-amber-50/70 border-amber-200/90 hover:border-amber-400',
          iconBox: 'bg-amber-100/90 text-amber-800 border border-amber-200/80 shadow-2xs',
          tagBg: 'bg-amber-100 text-amber-950 border border-amber-200',
          tagText: 'ELEVATED LEVEL',
          accentBar: 'bg-amber-500',
        };
      case 'good':
        return {
          cardBg: 'bg-gradient-to-br from-white via-emerald-50/40 to-emerald-50/70 border-emerald-200/90 hover:border-emerald-400',
          iconBox: 'bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 shadow-2xs',
          tagBg: 'bg-emerald-100 text-emerald-950 border border-emerald-200',
          tagText: 'SAFE / WHOLESOME',
          accentBar: 'bg-emerald-500',
        };
      case 'neutral':
      default:
        return {
          cardBg: 'bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50 border-slate-200 hover:border-slate-300',
          iconBox: 'bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs',
          tagBg: 'bg-slate-100 text-slate-700 border border-slate-200',
          tagText: 'MONITORED',
          accentBar: 'bg-slate-400',
        };
    }
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 ${className}`} role="list" aria-label="Identified Health Markers">
      {badges.map((badge, idx) => {
        const tokens = getStyleTokens(badge.type);
        const icon = getContextualIcon(badge.label, badge.type);
        const description = getContextualDescription(badge);

        return (
          <div
            key={idx}
            role="listitem"
            className={`relative overflow-hidden p-4 rounded-lg border shadow-2xs hover:shadow-xs transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between ${tokens.cardBg}`}
          >
            {/* Top Accent Strip */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${tokens.accentBar}`} />

            <div className="space-y-3">
              {/* Header: Large Icon + Severity Tag */}
              <div className="flex items-center justify-between gap-2.5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tokens.iconBox}`}>
                  {icon}
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono font-bold tracking-wider uppercase ${tokens.tagBg}`}>
                  {tokens.tagText}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-slate-950 font-heading tracking-tight leading-snug">
                  {badge.label}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                  {description}
                </p>
              </div>
            </div>

            {/* Bottom Verification Seal */}
            <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-2xs font-mono text-slate-500">
              <span>ICMR-NIN 2024 Threshold</span>
              <span className="font-semibold text-slate-700">Verified Flag</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

