import React, { useState } from 'react';
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
  X,
  BookOpen,
  UsersThree,
  Heartbeat
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
  if (l.includes('caffeine')) {
    return <Flame size={22} weight="fill" className="text-rose-600 shrink-0" />;
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

const getFallbackDetails = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('caffeine')) {
    return {
      whatIsIt: 'A central nervous system stimulant added to beverages and energy foods to artificially boost alertness and heart rate.',
      whyUsed: 'Provides quick simulated alertness, stimulates dopamine release, and increases repeated consumption frequency.',
      healthConsequences: 'Triggers rapid heartbeat (tachycardia), anxiety, elevated blood pressure, severe sleep disruption, and dependency.',
      safeDailyLimit: 'Max 300mg/day for healthy adults. Strict 0mg for children and adolescents (FSSAI/AAP guidelines).',
      whoShouldAvoid: ['Children & Adolescents', 'Pregnant Women', 'Hypertensive Patients', 'Anxiety Sufferers']
    };
  }
  if (l.includes('sugar')) {
    return {
      whatIsIt: 'Refined sucrose or high-fructose corn syrup stripped of all dietary fiber, vitamins, and minerals.',
      whyUsed: 'Extremely cheap palatability enhancer that triggers brain dopamine pathways and preserves moisture.',
      healthConsequences: 'Causes rapid blood sugar spikes, insulin resistance, visceral belly fat accumulation, non-alcoholic fatty liver, and type-2 diabetes.',
      safeDailyLimit: 'Under 25g/day (approx. 5 teaspoons) total free sugar per ICMR-NIN 2024 guidelines.',
      whoShouldAvoid: ['Diabetic & Pre-diabetic Individuals', 'Obese Individuals', 'Children', 'Cardiac Patients']
    };
  }
  if (l.includes('palm')) {
    return {
      whatIsIt: 'A high-yield tropical vegetable oil containing roughly 50% saturated palmitic fatty acids.',
      whyUsed: 'Cheapest commercially available edible oil with high oxidative stability and long room-temperature shelf life.',
      healthConsequences: 'Elevates atherogenic LDL (bad) cholesterol, promotes arterial plaque formation, and increases coronary heart disease risk.',
      safeDailyLimit: 'Total saturated fatty acids must remain under 8-10% of total daily calories (ICMR-NIN 2024).',
      whoShouldAvoid: ['Heart Patients', 'Individuals with High LDL Cholesterol', 'Sedentary Individuals']
    };
  }
  if (l.includes('saturated')) {
    return {
      whatIsIt: 'Fat molecules with single chemical bonds that remain solid or semi-solid at ambient room temperature.',
      whyUsed: 'Imparts rich mouthfeel, crunchiness, and creaminess while preventing rancidity during prolonged storage.',
      healthConsequences: 'Drives liver synthesis of LDL cholesterol and apolipoprotein B, clogging arterial walls over time.',
      safeDailyLimit: 'Less than 20g/day for an average 2000 kcal adult diet.',
      whoShouldAvoid: ['Cardiovascular Patients', 'Hypertensive Individuals', 'Hyperlipidemia Patients']
    };
  }
  if (l.includes('sodium') || l.includes('salt')) {
    return {
      whatIsIt: 'Sodium chloride and sodium-based chemical preservatives (like monosodium glutamate or sodium benzoate).',
      whyUsed: 'Powerful flavor enhancer, moisture binder, and antibacterial preservative used heavily in processed snacks.',
      healthConsequences: 'Forces kidneys to retain water, dramatically increasing blood volume and arterial pressure, stressing kidneys and heart.',
      safeDailyLimit: 'Under 2000mg sodium (equivalent to 5g total table salt) per day (ICMR-NIN & WHO).',
      whoShouldAvoid: ['Hypertensive Individuals', 'Kidney Disease Patients', 'Edema Patients']
    };
  }
  if (l.includes('nova') || l.includes('ultra-processed') || l.includes('upf')) {
    return {
      whatIsIt: 'Industrial formulations manufactured from refined substances with cosmetic additives (emulsifiers, flavor enhancers, colorants).',
      whyUsed: 'Engineered for hyper-palatability, long supermarket shelf-life, and high commercial profit margins.',
      healthConsequences: 'Directly linked to gut microbiome dysbiosis, chronic systemic inflammation, obesity, and metabolic syndrome.',
      safeDailyLimit: 'ICMR-NIN 2024 advises minimizing UPF to near zero in standard daily diets.',
      whoShouldAvoid: ['General Public', 'Growing Children', 'Metabolic Syndrome Patients']
    };
  }
  if (l.includes('maida') || l.includes('refined wheat')) {
    return {
      whatIsIt: 'Endosperm of wheat milled after mechanically removing the fiber-rich bran and nutrient-dense germ.',
      whyUsed: 'Creates smooth textures, high dough elasticity, and soft mouthfeel in commercial bakery and noodles.',
      healthConsequences: 'Very high glycemic index (GI 70+) converts instantly into glucose in the bloodstream, triggering sharp insulin crashes.',
      safeDailyLimit: 'Replace with whole grains (millets, whole wheat, oats) whenever possible.',
      whoShouldAvoid: ['Diabetic Individuals', 'Weight Management Patients', 'Constipation Sufferers']
    };
  }
  return {
    whatIsIt: 'Monitored food ingredient or additive evaluated against national food safety and nutritional standards.',
    whyUsed: 'Formulated to meet specific manufacturing, shelf-life, taste, or texture criteria.',
    healthConsequences: 'Excessive consumption may disrupt metabolic balance or contribute to dietary imbalances.',
    safeDailyLimit: 'Refer to ICMR-NIN 2024 Recommended Dietary Allowances (RDA).',
    whoShouldAvoid: ['Individuals with specific metabolic sensitivities']
  };
};

export const HealthBadgeGroup: React.FC<HealthBadgeGroupProps> = ({ badges, className = '' }) => {
  const [activeModalBadge, setActiveModalBadge] = useState<HealthBadge | null>(null);

  if (!badges || badges.length === 0) {
    return null;
  }

  const getStyleTokens = (type: HealthBadge['type']) => {
    switch (type) {
      case 'danger':
        return {
          cardBg: 'bg-white border-rose-200/90 hover:border-rose-400',
          iconBox: 'bg-rose-100/90 text-rose-700 border border-rose-200/80 shadow-2xs',
          tagBg: 'bg-rose-100 text-rose-900 border border-rose-200',
          tagText: 'CRITICAL RISK',
          accentBar: 'bg-rose-500',
          subtlePill: 'bg-rose-50 text-rose-900 border-rose-200',
        };
      case 'warning':
        return {
          cardBg: 'bg-white border-amber-200/90 hover:border-amber-400',
          iconBox: 'bg-amber-100/90 text-amber-800 border border-amber-200/80 shadow-2xs',
          tagBg: 'bg-amber-100 text-amber-950 border border-amber-200',
          tagText: 'ELEVATED LEVEL',
          accentBar: 'bg-amber-500',
          subtlePill: 'bg-amber-50 text-amber-900 border-amber-200',
        };
      case 'good':
        return {
          cardBg: 'bg-white border-emerald-200/90 hover:border-emerald-400',
          iconBox: 'bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 shadow-2xs',
          tagBg: 'bg-emerald-100 text-emerald-950 border border-emerald-200',
          tagText: 'SAFE / WHOLESOME',
          accentBar: 'bg-emerald-500',
          subtlePill: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        };
      case 'neutral':
      default:
        return {
          cardBg: 'bg-white border-slate-200 hover:border-slate-300',
          iconBox: 'bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs',
          tagBg: 'bg-slate-100 text-slate-700 border border-slate-200',
          tagText: 'MONITORED',
          accentBar: 'bg-slate-400',
          subtlePill: 'bg-slate-50 text-slate-800 border-slate-200',
        };
    }
  };

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`} role="list" aria-label="Identified Health Markers">
        {badges.map((badge, idx) => {
          const tokens = getStyleTokens(badge.type);
          const icon = getContextualIcon(badge.label, badge.type);
          const fallback = getFallbackDetails(badge.label);

          const whatIsIt = badge.whatIsIt || fallback.whatIsIt;
          const whyUsed = badge.whyUsed || fallback.whyUsed;
          const consequences = badge.healthConsequences || badge.description || fallback.healthConsequences;
          const safeLimit = badge.safeDailyLimit || fallback.safeDailyLimit;
          const avoidList: string[] = Array.isArray(badge.whoShouldAvoid)
            ? badge.whoShouldAvoid
            : typeof badge.whoShouldAvoid === 'string'
            ? [badge.whoShouldAvoid]
            : fallback.whoShouldAvoid;

          return (
            <div
              key={idx}
              role="listitem"
              className={`relative overflow-hidden p-4 sm:p-5 rounded-xl border shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between gap-4 ${tokens.cardBg}`}
            >
              {/* Top Accent Strip */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${tokens.accentBar}`} />

              <div className="space-y-3.5">
                {/* Header: Icon + Title + Severity Tag */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tokens.iconBox}`}>
                      {icon}
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-950 font-heading tracking-tight leading-snug">
                        {badge.label}
                      </h4>
                      <span className="text-2xs font-mono text-slate-500 block">
                        Consumer Educational Marker
                      </span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-mono font-bold tracking-wider uppercase shrink-0 ${tokens.tagBg}`}>
                    {tokens.tagText}
                  </span>
                </div>

                {/* Educational Block 1: What is it in plain words */}
                <div className="space-y-1">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 font-mono block">
                    What Is This?
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {whatIsIt}
                  </p>
                </div>

                {/* Educational Block 2: Clinical / Body Impact */}
                <div className="space-y-1 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-1 text-2xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                    <Heartbeat size={13} weight="fill" className="text-rose-600 shrink-0" />
                    <span>Body &amp; Health Impact</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {consequences}
                  </p>
                </div>

                {/* Vulnerable cohorts tag pills */}
                {avoidList && avoidList.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 font-mono block">
                      Who Should Avoid
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {avoidList.slice(0, 3).map((item, aIdx) => (
                        <span
                          key={aIdx}
                          className="px-2 py-0.5 rounded text-2xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {item}
                        </span>
                      ))}
                      {avoidList.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded text-2xs font-medium text-slate-500">
                          +{avoidList.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer: Safe Limit + Learn More Button */}
              <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between gap-2">
                <span className="text-2xs font-mono text-slate-500 truncate" title={safeLimit}>
                  Limit: {safeLimit ? safeLimit.split('.')[0] : 'ICMR Standard'}
                </span>

                <button
                  type="button"
                  onClick={() => setActiveModalBadge(badge)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-navy-900 transition-colors px-2 py-1 rounded hover:bg-slate-100 shrink-0"
                >
                  <BookOpen size={14} weight="bold" />
                  <span>Explain Science</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Educational Science Modal */}
      {activeModalBadge && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  {getContextualIcon(activeModalBadge.label, activeModalBadge.type)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 font-heading">
                    {activeModalBadge.label}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ICMR-NIN 2024 Science &amp; Clinical Guide
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalBadge(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                aria-label="Close dialog"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Modal Body */}
            {(() => {
              const fb = getFallbackDetails(activeModalBadge.label);
              const whatIsIt = activeModalBadge.whatIsIt || fb.whatIsIt;
              const whyUsed = activeModalBadge.whyUsed || fb.whyUsed;
              const consequences = activeModalBadge.healthConsequences || activeModalBadge.description || fb.healthConsequences;
              const safeLimit = activeModalBadge.safeDailyLimit || fb.safeDailyLimit;
              const avoidList: string[] = Array.isArray(activeModalBadge.whoShouldAvoid)
                ? activeModalBadge.whoShouldAvoid
                : typeof activeModalBadge.whoShouldAvoid === 'string'
                ? [activeModalBadge.whoShouldAvoid]
                : fb.whoShouldAvoid;

              return (
                <div className="space-y-4 text-xs sm:text-sm">
                  {/* What is it */}
                  <div className="space-y-1">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 font-mono block">
                      1. Plain-Language Definition
                    </span>
                    <p className="text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {whatIsIt}
                    </p>
                  </div>

                  {/* Why manufacturers use it */}
                  <div className="space-y-1">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 font-mono block">
                      2. Why Manufacturers Add It To Food
                    </span>
                    <p className="text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {whyUsed}
                    </p>
                  </div>

                  {/* Clinical consequences */}
                  <div className="space-y-1">
                    <span className="text-2xs font-bold uppercase tracking-wider text-rose-800 font-mono block">
                      3. Clinical &amp; Body Impact (Short &amp; Long Term)
                    </span>
                    <p className="text-rose-950 leading-relaxed bg-rose-50/70 p-3 rounded-lg border border-rose-200">
                      {consequences}
                    </p>
                  </div>

                  {/* ICMR safe limit */}
                  <div className="space-y-1">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 font-mono block">
                      4. ICMR-NIN Safe Daily Threshold
                    </span>
                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-950 border border-emerald-200 font-medium">
                      {safeLimit}
                    </div>
                  </div>

                  {/* Who should avoid */}
                  {avoidList && avoidList.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 font-mono block">
                        5. Who Should Avoid Or Strictly Limit
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {avoidList.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-2xs text-slate-500 font-mono">
                Department of Consumer Affairs • Govt. of India
              </span>
              <button
                type="button"
                onClick={() => setActiveModalBadge(null)}
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-navy-900 transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
