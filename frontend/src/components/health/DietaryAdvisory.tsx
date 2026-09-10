import React from "react";
import { CheckCircle, XCircle, Sparkle } from "@phosphor-icons/react";

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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Who Can Consume Safely */}
        <div className="p-4 rounded-[8px] bg-success-light/30 border border-success-border space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-success shrink-0" weight="fill" />
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide font-heading">
              Who Can Consume Safely
            </h4>
          </div>
          <ul className="space-y-1.5 text-xs text-neutral-700 list-disc list-inside">
            {whoCanConsume.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Who Should Avoid or Limit */}
        <div className="p-4 rounded-[8px] bg-violation-light/30 border border-violation-border space-y-2">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-violation shrink-0" weight="fill" />
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide font-heading">
              Who Should Avoid or Limit
            </h4>
          </div>
          <ul className="space-y-1.5 text-xs text-neutral-700 list-disc list-inside">
            {whoShouldAvoid.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {healthierAlternatives && healthierAlternatives.length > 0 && (
        <div className="p-3.5 rounded-[8px] bg-white border border-neutral-200 space-y-2">
          <div className="flex items-center gap-1.5 text-primary">
            <Sparkle size={16} weight="fill" />
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide font-heading">
              Healthier Whole-Food Alternatives
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {healthierAlternatives.map((alt, idx) => (
              <div key={idx} className="p-2.5 rounded-[6px] bg-neutral-50 border border-neutral-150 text-neutral-700">
                {alt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
