import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  variant?: "primary" | "success" | "violation" | "warning" | "neutral";
  trendDelta?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  variant = "neutral",
  trendDelta,
}) => {
  const variantStyles = {
    primary: "border-l-4 border-l-primary bg-white",
    success: "border-l-4 border-l-success bg-white",
    violation: "border-l-4 border-l-violation bg-white",
    warning: "border-l-4 border-l-warning bg-white",
    neutral: "border-l-4 border-l-neutral-300 bg-white",
  };

  const iconBgStyles = {
    primary: "bg-primary-light text-primary border-primary-border",
    success: "bg-success-light text-success border-success-border",
    violation: "bg-violation-light text-violation border-violation-border",
    warning: "bg-warning-light text-warning border-warning-border",
    neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
  };

  return (
    <div className={`p-4 rounded-[8px] border border-neutral-200 shadow-xs ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 font-heading">
              {value}
            </span>
            {trendDelta && (
              <span className="text-[11px] font-semibold text-success font-mono">
                {trendDelta}
              </span>
            )}
          </div>
          {subtext && (
            <p className="text-[11px] text-neutral-500">
              {subtext}
            </p>
          )}
        </div>
        <div className={`w-9 h-9 rounded-[6px] border flex items-center justify-center shrink-0 ${iconBgStyles[variant]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
