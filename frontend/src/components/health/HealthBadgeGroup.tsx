import React from "react";
import { Warning, WarningCircle, CheckCircle, Info } from "@phosphor-icons/react";
import { HealthBadge } from "../../types";

interface HealthBadgeGroupProps {
  badges: HealthBadge[];
}

export const HealthBadgeGroup: React.FC<HealthBadgeGroupProps> = ({ badges }) => {
  if (!badges || badges.length === 0) {
    return null;
  }

  const getBadgeStyle = (type: HealthBadge["type"]) => {
    switch (type) {
      case "danger":
        return {
          container: "bg-rose-50 hover:bg-rose-100/80 text-rose-800 border-rose-200/80",
          icon: <WarningCircle size={14} weight="fill" className="shrink-0 text-rose-600" />,
        };
      case "warning":
        return {
          container: "bg-amber-50 hover:bg-amber-100/80 text-amber-900 border-amber-200/80",
          icon: <Warning size={14} weight="fill" className="shrink-0 text-amber-600" />,
        };
      case "good":
        return {
          container: "bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border-emerald-200/80",
          icon: <CheckCircle size={14} weight="fill" className="shrink-0 text-emerald-600" />,
        };
      case "neutral":
      default:
        return {
          container: "bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 border-neutral-300/80",
          icon: <Info size={14} weight="bold" className="shrink-0 text-neutral-500" />,
        };
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2" role="list" aria-label="Health markers">
      {badges.map((badge, idx) => {
        const { container, icon } = getBadgeStyle(badge.type);

        return (
          <span
            key={idx}
            role="listitem"
            className={`inline-flex items-center gap-1.5 text-2xs font-semibold px-3 py-1 rounded-full border shadow-xs transition-colors select-none ${container}`}
          >
            {icon}
            <span className="font-heading tracking-wide leading-none">{badge.label}</span>
          </span>
        );
      })}
    </div>
  );
};
