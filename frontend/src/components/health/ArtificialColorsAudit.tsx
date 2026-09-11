import React from 'react';
import { 
  Palette, 
  ShieldCheck, 
  WarningCircle, 
  CheckCircle, 
  Info, 
  Warning
} from '@phosphor-icons/react';
import { ArtificialColorAudit } from '../../types';

interface ArtificialColorsAuditProps {
  colors?: ArtificialColorAudit[];
  className?: string;
}

export const ArtificialColorsAudit: React.FC<ArtificialColorsAuditProps> = ({
  colors = [],
  className = '',
}) => {
  const getGradeTokens = (grade: string, isOkayToEat: string) => {
    const g = (grade || '').toLowerCase();
    const ok = (isOkayToEat || '').toLowerCase();

    if (g.includes('grade a') || ok.includes('safe')) {
      return {
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        cardBg: 'bg-gradient-to-br from-white via-emerald-50/20 to-emerald-50/40 border-emerald-200',
        indicatorBar: 'bg-emerald-500',
        verdictBg: 'bg-emerald-100 text-emerald-950 border-emerald-300',
        icon: <CheckCircle size={18} weight="fill" className="text-emerald-600 shrink-0" />,
        gradeText: 'Grade A • Wholesome Natural',
        isSafe: true,
      };
    }

    if (g.includes('grade c') || ok.includes('avoid') || ok.includes('strictly limit')) {
      return {
        badgeBg: 'bg-rose-50 text-rose-800 border-rose-300',
        cardBg: 'bg-gradient-to-br from-white via-rose-50/20 to-rose-50/50 border-rose-200',
        indicatorBar: 'bg-rose-500',
        verdictBg: 'bg-rose-100 text-rose-950 border-rose-300',
        icon: <WarningCircle size={18} weight="fill" className="text-rose-600 shrink-0" />,
        gradeText: 'Grade C • High Concern Azo Dye',
        isSafe: false,
      };
    }

    // Grade B / Caution
    return {
      badgeBg: 'bg-amber-50 text-amber-900 border-amber-300',
      cardBg: 'bg-gradient-to-br from-white via-amber-50/20 to-amber-50/40 border-amber-200',
      indicatorBar: 'bg-amber-500',
      verdictBg: 'bg-amber-100 text-amber-950 border-amber-300',
      icon: <Warning size={18} weight="fill" className="text-amber-700 shrink-0" />,
      gradeText: 'Grade B • Permitted Synthetic',
      isSafe: false,
    };
  };

  const hasColors = colors && colors.length > 0;

  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5 ${className}`}>
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
            <Palette size={22} weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-slate-950 font-heading uppercase tracking-wide">
                Food Colors &amp; Chemical Dyes Safety Audit
              </h3>
              <span className={`text-2xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                hasColors ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-emerald-50 text-emerald-900 border-emerald-200'
              }`}>
                {hasColors ? `${colors.length} Colorants Identified` : 'Zero Synthetic Dyes'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Detection of synthetic petroleum azo dyes, caramel coloring classes, and natural botanical extracts under FSSAI &amp; European food standards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-2xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            FSSAI &amp; EFSA Standards
          </span>
        </div>
      </div>

      {/* Educational Banner: What Are Artificial Food Colors */}
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-slate-900 font-bold font-heading">
          <Info size={16} className="text-slate-700 shrink-0" weight="bold" />
          <span>What Are Artificial Food Colors and Why Should You Check Them?</span>
        </div>
        <p className="text-slate-600 leading-relaxed">
          Artificial food colors are synthetic, petroleum-derived chemical dyes (such as Tartrazine, Sunset Yellow, and Allura Red) added to snacks, colas, candies, and sauces solely for visual appearance. They provide <strong>zero nutritional value</strong> and are used by food companies to make products look vibrant, fresh, or fruit-flavored without using real fruits.
        </p>
        
        {/* 3-Tier Legend Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-2xs">
          <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
            <div>
              <strong className="block font-semibold">Grade A: Natural Plant Extracts</strong>
              <span>Curcumin, Beetroot, Paprika (Safe to eat)</span>
            </div>
          </div>
          <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
            <div>
              <strong className="block font-semibold">Grade B: Permitted Synthetic</strong>
              <span>Caramel I &amp; II (Consume in moderation)</span>
            </div>
          </div>
          <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-950 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
            <div>
              <strong className="block font-semibold">Grade C: High Concern Azo Dyes</strong>
              <span>Tartrazine 102, Sunset Yellow 110, Caramel IV (Avoid / Limit)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Identified Colors List */}
      {hasColors ? (
        <div className="space-y-4 pt-1">
          <h4 className="text-xs font-bold text-slate-900 font-heading uppercase tracking-wider">
            Detected Colorants in this Packaging ({colors.length})
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colors.map((color, idx) => {
              const tokens = getGradeTokens(color.grade, color.isOkayToEat);

              return (
                <div
                  key={idx}
                  className={`relative overflow-hidden p-4 rounded-lg border shadow-2xs space-y-3 ${tokens.cardBg}`}
                >
                  {/* Top Accent Strip */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${tokens.indicatorBar}`} />

                  {/* Header: Color Name, INS Code, Grade Badge */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-950 font-heading">
                          {color.name}
                        </span>
                        {color.insCode && (
                          <span className="text-2xs font-mono font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                            {color.insCode}
                          </span>
                        )}
                      </div>
                      <span className="text-2xs font-medium text-slate-500 block">
                        {color.quality}
                      </span>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold border shrink-0 ${tokens.badgeBg}`}>
                      {tokens.icon}
                      <span>{color.grade}</span>
                    </span>
                  </div>

                  {/* Is It Okay To Eat Callout Box */}
                  <div className={`p-3 rounded-md border text-xs space-y-1 ${tokens.verdictBg}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-2xs font-bold font-heading uppercase tracking-wider block">
                        Is It Okay to Eat?
                      </span>
                      <strong className="text-2xs font-mono uppercase tracking-wider">
                        {color.isOkayToEat}
                      </strong>
                    </div>
                    <p className="text-2xs leading-relaxed font-medium">
                      {color.healthConsequences}
                    </p>
                  </div>

                  {/* Why Was It Added */}
                  <div className="text-xs text-slate-700 space-y-1 bg-white/70 p-2.5 rounded border border-slate-200/80">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 block">
                      Why Food Companies Add This
                    </span>
                    <p className="text-2xs text-slate-600 leading-relaxed">
                      {color.whyAdded}
                    </p>
                  </div>

                  {/* Regulatory Status */}
                  <div className="flex items-center justify-between text-2xs font-mono text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Regulatory Framework:</span>
                    <span className="text-slate-700 font-semibold">{color.regulatoryStatus}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Zero Artificial Colors Verified Badge */
        <div className="p-5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0 mt-0.5">
              <ShieldCheck size={22} weight="fill" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-bold text-emerald-950 font-heading">
                Zero Synthetic Petroleum Dyes Detected
              </h4>
              <p className="text-xs text-emerald-800/90 leading-relaxed">
                This product does not list synthetic coal-tar azo colors (Tartrazine INS 102, Sunset Yellow INS 110, or Allura Red INS 129). It uses either natural spices/vegetable extracts or contains no added cosmetic dyes.
              </p>
            </div>
          </div>

          <span className="text-2xs font-mono font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300 shrink-0">
            CLEAN COLOR PROFILE
          </span>
        </div>
      )}

    </div>
  );
};
