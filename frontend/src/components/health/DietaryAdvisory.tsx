import React from "react";
import { CheckCircle, XCircle, Sparkle, Plant } from "@phosphor-icons/react";

interface DietaryAdvisoryProps {
  whoCanConsume: string[];
  whoShouldAvoid: string[];
  healthierAlternatives?: string[];
}

export const DietaryAdvisory: React.FC<DietaryAdvisoryProps> = ({
  whoCanConsume,
  whoShouldAvoid,
  healthierAlternatives,
}) => {
  return (
    <div className="space-y-5">
      {/* Two-Column Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {/* Who Can Consume Safely - Emerald Tinged Surface */}
        <div className="p-5 rounded-lg bg-emerald-50/60 border border-emerald-200/90 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-emerald-200/60">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-emerald-600 shrink-0" weight="fill" />
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide font-heading">
                  Who Can Consume Safely
                </h4>
              </div>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                Recommended Cohorts
              </span>
            </div>

            <p className="text-2xs text-emerald-900/80 leading-normal">
              Nutritionally suitable for populations with active metabolism or standard caloric allowances:
            </p>

            <ul className="space-y-2 pt-1" role="list">
              {whoCanConsume.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-neutral-800 font-medium leading-relaxed bg-white/80 rounded-md p-2.5 border border-emerald-100/80 shadow-2xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Who Should Avoid or Strictly Limit - Crimson Tinged Surface */}
        <div className="p-5 rounded-lg bg-rose-50/60 border border-rose-200/90 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-rose-200/60">
              <div className="flex items-center gap-2">
                <XCircle size={20} className="text-rose-600 shrink-0" weight="fill" />
                <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wide font-heading">
                  Who Should Avoid or Strictly Limit
                </h4>
              </div>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-rose-100/80 text-rose-800 border border-rose-200">
                Clinical Caution
              </span>
            </div>

            <p className="text-2xs text-rose-900/80 leading-normal">
              Contraindicated or strictly limited for individuals managing specific health profiles:
            </p>

            <ul className="space-y-2 pt-1" role="list">
              {whoShouldAvoid.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-neutral-800 font-medium leading-relaxed bg-white/80 rounded-md p-2.5 border border-rose-100/80 shadow-2xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Healthier Whole-Food Alternatives Section */}
      {healthierAlternatives && healthierAlternatives.length > 0 && (
        <div className="p-5 rounded-lg bg-white border border-neutral-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap border-b border-neutral-100 pb-2.5">
            <div className="flex items-center gap-2 text-primary">
              <Plant size={18} weight="fill" className="text-emerald-600" />
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide font-heading">
                Healthier Whole-Food Alternatives
              </h4>
            </div>
            <span className="text-2xs font-medium text-neutral-500">
              Evidence-backed substitutions recommended under NIN/ICMR dietary guidelines
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {healthierAlternatives.map((alt, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-md bg-neutral-50/70 hover:bg-white border border-neutral-200 hover:border-emerald-300 transition-all shadow-xs flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center shrink-0">
                    <Sparkle size={14} weight="fill" />
                  </div>
                  <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    Whole-Food Swap
                  </span>
                </div>

                <div className="text-xs font-bold text-neutral-900 font-heading">
                  {alt}
                </div>

                <div className="text-2xs text-neutral-500 flex items-center gap-1">
                  <span>Lower glycemic &amp; sodium footprint</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
