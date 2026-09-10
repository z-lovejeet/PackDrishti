import React from "react";
import { TrendUp, TrendDown } from "@phosphor-icons/react";

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
  // Top border accent tokens (Navy, Emerald, Crimson, Amber, Slate)
  const topAccentStyles = {
    primary: "border-t-[3px] border-t-navy-800",
    success: "border-t-[3px] border-t-success",
    violation: "border-t-[3px] border-t-violation",
    warning: "border-t-[3px] border-t-warning",
    neutral: "border-t-[3px] border-t-neutral-400",
  };

  const iconStyles = {
    primary: "bg-primary-light text-primary border-primary-border",
    success: "bg-success-light text-success border-success-border",
    violation: "bg-violation-light text-violation border-violation-border",
    warning: "bg-warning-light text-warning border-warning-border",
    neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
  };

  const isPositiveTrend = trendDelta ? trendDelta.trim().startsWith("+") : false;
  const isNegativeTrend = trendDelta ? trendDelta.trim().startsWith("-") : false;

  return (
    <div
      className={`group bg-white p-4 rounded-card border border-neutral-200 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${topAccentStyles[variant]}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-2xs font-bold text-neutral-500 uppercase tracking-wider font-heading leading-tight pt-1">
          {label}
        </p>
        <div
          className={`w-9 h-9 rounded-md border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200 ${iconStyles[variant]}`}
        >
          {icon}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline flex-wrap gap-2">
          <span className="text-2xl font-bold text-neutral-900 font-heading tracking-tight">
            {value}
          </span>
          {trendDelta && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold font-mono border ${
                isPositiveTrend
                  ? "bg-success-light text-success border-success-border"
                  : isNegativeTrend
                  ? "bg-violation-light text-violation border-violation-border"
                  : "bg-neutral-100 text-neutral-700 border-neutral-200"
              }`}
            >
              {isPositiveTrend && <TrendUp size={12} weight="bold" />}
              {isNegativeTrend && <TrendDown size={12} weight="bold" />}
              <span>{trendDelta}</span>
            </span>
          )}
        </div>

        {subtext && (
          <p className="text-2xs text-neutral-500 font-normal leading-relaxed">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};
