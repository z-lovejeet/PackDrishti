import React from "react";
import { Warning, CheckCircle, Info } from "@phosphor-icons/react";
import { HealthBadge } from "../../data/mockHealthData";

interface HealthBadgeGroupProps {
  badges: HealthBadge[];
}

export const HealthBadgeGroup: React.FC<HealthBadgeGroupProps> = ({ badges }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {badges.map((badge, idx) => {
        let style = "bg-neutral-100 text-neutral-800 border-neutral-200";
        let icon = <Info size={14} className="shrink-0" />;

        if (badge.type === "danger") {
          style = "bg-violation-light text-violation border-violation-border font-bold";
          icon = <Warning size={14} className="shrink-0 text-violation" weight="fill" />;
        } else if (badge.type === "warning") {
          style = "bg-warning-light text-warning border-warning-border font-bold";
          icon = <Warning size={14} className="shrink-0 text-warning" weight="fill" />;
        } else if (badge.type === "good") {
          style = "bg-success-light text-success border-success-border font-bold";
          icon = <CheckCircle size={14} className="shrink-0 text-success" weight="fill" />;
        }

        return (
          <span
            key={idx}
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-[6px] border ${style}`}
          >
            {icon}
            <span>{badge.label}</span>
          </span>
        );
      })}
    </div>
  );
};
