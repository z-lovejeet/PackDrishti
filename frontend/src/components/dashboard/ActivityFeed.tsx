import React from "react";
import { FileText, Warning, ShieldWarning, CheckCircle, ArrowRight } from "@phosphor-icons/react";
import { EnforcementActionItem } from "../../types";
import { Badge } from "../common/Badge";

interface ActivityFeedProps {
  actions: EnforcementActionItem[];
  onViewCase?: (caseRef: string) => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ actions, onViewCase }) => {
  const getActionIcon = (type: EnforcementActionItem["actionType"]) => {
    switch (type) {
      case "Show Cause Notice":
        return <Warning size={16} className="text-warning" weight="bold" />;
      case "Compounding Order":
        return <FileText size={16} className="text-primary" weight="bold" />;
      case "Seizure Memo":
        return <ShieldWarning size={16} className="text-violation" weight="bold" />;
      case "Cured & Dismissed":
        return <CheckCircle size={16} className="text-success" weight="bold" />;
    }
  };

  const getStatusBadge = (status: EnforcementActionItem["status"]) => {
    switch (status) {
      case "Pending Hearing":
        return <Badge variant="warning" size="sm">Pending Hearing</Badge>;
      case "Settled":
        return <Badge variant="compliant" size="sm">Compounded / Settled</Badge>;
      case "Issued":
        return <Badge variant="violation" size="sm">Active Notice</Badge>;
      case "Closed":
        return <Badge variant="neutral" size="sm">Case Closed</Badge>;
    }
  };

  return (
    <div className="bg-white p-5 rounded-[8px] border border-neutral-200 space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 font-heading">
            Live Enforcement Timeline
          </h3>
          <p className="text-xs text-neutral-500">
            Recent statutory notices, compounding orders, and field seizure memos
          </p>
        </div>
      </div>

      <div className="divide-y divide-neutral-100">
        {actions.map((action) => (
          <div key={action.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 rounded-[6px] bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                {getActionIcon(action.actionType)}
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-neutral-900 font-heading truncate">
                    {action.productName}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500 px-1.5 py-0.5 bg-neutral-100 rounded border border-neutral-200">
                    {action.caseRef}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 truncate">
                  {action.statutoryClause}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                  <span>{action.targetEstablishment}</span>
                  <span>•</span>
                  <span>{action.timestamp}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-center">
              {getStatusBadge(action.status)}
              {onViewCase && (
                <button
                  onClick={() => onViewCase(action.caseRef)}
                  className="text-neutral-400 hover:text-primary transition-colors p-1"
                  title="View Case Docket"
                >
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
