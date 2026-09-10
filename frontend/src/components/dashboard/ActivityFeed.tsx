import React from "react";
import {
  FileText,
  Warning,
  ShieldWarning,
  CheckCircle,
  ArrowRight,
  Clock,
} from "@phosphor-icons/react";
import { EnforcementActionItem } from "../../types";

interface ActivityFeedProps {
  actions: EnforcementActionItem[];
  onViewCase?: (caseRef: string) => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ actions, onViewCase }) => {
  const getActionNode = (type: EnforcementActionItem["actionType"]) => {
    switch (type) {
      case "Show Cause Notice":
        return {
          icon: <Warning size={14} className="text-warning" weight="bold" />,
          wrapperClass: "bg-warning-light border-warning-border ring-2 ring-warning/20",
        };
      case "Compounding Order":
        return {
          icon: <FileText size={14} className="text-primary" weight="bold" />,
          wrapperClass: "bg-primary-light border-primary-border ring-2 ring-primary/20",
        };
      case "Seizure Memo":
        return {
          icon: <ShieldWarning size={14} className="text-violation" weight="bold" />,
          wrapperClass: "bg-violation-light border-violation-border ring-2 ring-violation/20",
        };
      case "Cured & Dismissed":
        return {
          icon: <CheckCircle size={14} className="text-success" weight="bold" />,
          wrapperClass: "bg-success-light border-success-border ring-2 ring-success/20",
        };
    }
  };

  const getStatusBadge = (status: EnforcementActionItem["status"]) => {
    switch (status) {
      case "Pending Hearing":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-warning-light text-[#B7791F] border border-warning-border">
            Pending Hearing
          </span>
        );
      case "Settled":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-success-light text-success border border-success-border">
            Compounded / Settled
          </span>
        );
      case "Issued":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-violation-light text-violation border border-violation-border">
            Active Notice
          </span>
        );
      case "Closed":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-300">
            Case Closed
          </span>
        );
    }
  };

  return (
    <div className="bg-white p-5 rounded-card border border-neutral-200 shadow-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 font-heading tracking-tight">
            Live Enforcement Timeline
          </h3>
          <p className="text-2xs text-neutral-500 mt-0.5">
            Recent statutory notices, compounding orders, and field seizure memos
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-primary-light text-primary border border-primary-border shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span>Statutory Feed</span>
        </span>
      </div>

      {/* Timeline List */}
      {actions.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <FileText size={28} className="mx-auto text-neutral-400" />
          <p className="text-xs text-neutral-500">
            No enforcement actions recorded in current session.
          </p>
        </div>
      ) : (
        <div className="relative pl-7 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
          {actions.map((action) => {
            const nodeConfig = getActionNode(action.actionType);

            return (
              <div key={action.id} className="relative group transition-all duration-150">
                {/* Vertical Timeline Marker Node */}
                <div
                  className={`absolute -left-7 top-3 w-6 h-6 rounded-full border-2 border-white shadow-xs flex items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-110 duration-200 ${nodeConfig.wrapperClass}`}
                  title={action.actionType}
                >
                  {nodeConfig.icon}
                </div>

                {/* Timeline Card with Clean Hover State */}
                <div className="bg-white group-hover:bg-neutral-50/80 border border-neutral-200/80 group-hover:border-neutral-300 rounded-lg p-3.5 transition-all duration-150 shadow-xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-neutral-900 font-heading group-hover:text-primary transition-colors truncate">
                          {action.productName}
                        </span>
                        <span className="text-2xs font-mono font-medium text-neutral-700 px-2 py-0.5 bg-neutral-100 rounded border border-neutral-200 shrink-0 select-all">
                          {action.caseRef}
                        </span>
                      </div>
                      <p className="text-2xs text-neutral-600 leading-normal">
                        {action.statutoryClause}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {getStatusBadge(action.status)}
                      {onViewCase && (
                        <button
                          onClick={() => onViewCase(action.caseRef)}
                          className="text-neutral-400 hover:text-primary transition-colors p-1 rounded hover:bg-neutral-100"
                          title="View Case Docket"
                          aria-label={`View docket for ${action.caseRef}`}
                        >
                          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-neutral-100 text-2xs text-neutral-500">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-neutral-700">
                        {action.targetEstablishment}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock size={12} className="text-neutral-400" />
                        {action.timestamp}
                      </span>
                    </div>

                    {typeof action.fineAmountInr === "number" && action.fineAmountInr > 0 && (
                      <span className="font-mono font-semibold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                        ₹{action.fineAmountInr.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
