import React from "react";
import { ShieldCheck, Warning, XCircle, Barcode, Calendar, MapPin, Scales } from "@phosphor-icons/react";
import { Badge } from "../common/Badge";

interface ReportHeaderProps {
  productName: string;
  brand: string;
  category: string;
  scanCode: string;
  scannedAt: string;
  location?: string;
  overallStatus: "compliant" | "violation" | "warning";
  complianceScore?: number;
  barcode?: string;
  netQuantity?: string;
  declaredMrp?: string;
  pdpAreaCm2?: number;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  productName,
  brand,
  category,
  scanCode,
  scannedAt,
  location,
  overallStatus,
  complianceScore,
  barcode,
  netQuantity,
  declaredMrp,
  pdpAreaCm2,
}) => {
  const getStatusDisplay = () => {
    switch (overallStatus) {
      case "compliant":
        return {
          badge: <Badge variant="compliant" size="md">Compliant under LMPC Rules</Badge>,
          border: "border-l-success",
          icon: <ShieldCheck size={24} className="text-success" weight="fill" />,
        };
      case "violation":
        return {
          badge: <Badge variant="violation" size="md">Statutory Infractions Detected</Badge>,
          border: "border-l-violation",
          icon: <XCircle size={24} className="text-violation" weight="fill" />,
        };
      case "warning":
      default:
        return {
          badge: <Badge variant="warning" size="md">Rectification Required</Badge>,
          border: "border-l-warning",
          icon: <Warning size={24} className="text-warning" weight="fill" />,
        };
    }
  };

  const statusInfo = getStatusDisplay();

  return (
    <div className={`bg-white p-5 rounded-[8px] border border-neutral-200 border-l-4 ${statusInfo.border} shadow-xs space-y-4`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {brand}
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-xs font-semibold text-neutral-600">
              {category}
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-[11px] font-mono font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
              {scanCode}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 font-heading">
            {productName}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {complianceScore !== undefined && (
            <div className="text-right pr-3 border-r border-neutral-200">
              <span className="text-2xl font-bold text-neutral-900 font-heading block">
                {complianceScore}/100
              </span>
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                Score
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            {statusInfo.icon}
            {statusInfo.badge}
          </div>
        </div>
      </div>

      {/* Metadata Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-neutral-500 flex items-center gap-1 text-[11px]">
            <Calendar size={13} />
            Scan Timestamp
          </span>
          <span className="font-semibold text-neutral-800 block">
            {scannedAt}
          </span>
        </div>

        {declaredMrp && (
          <div className="space-y-0.5">
            <span className="text-neutral-500 flex items-center gap-1 text-[11px]">
              <Scales size={13} />
              Declared MRP / Qty
            </span>
            <span className="font-semibold text-neutral-800 block font-heading">
              {declaredMrp} {netQuantity ? `(${netQuantity})` : ""}
            </span>
          </div>
        )}

        {pdpAreaCm2 && (
          <div className="space-y-0.5">
            <span className="text-neutral-500 text-[11px]">
              PDP Area (Rule 7)
            </span>
            <span className="font-semibold text-neutral-800 block font-mono">
              {pdpAreaCm2} cm²
            </span>
          </div>
        )}

        {barcode && (
          <div className="space-y-0.5">
            <span className="text-neutral-500 flex items-center gap-1 text-[11px]">
              <Barcode size={13} />
              GTIN / Barcode
            </span>
            <span className="font-semibold text-neutral-800 block font-mono">
              {barcode}
            </span>
          </div>
        )}

        {location && (
          <div className="col-span-2 sm:col-span-4 space-y-0.5 pt-1 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center gap-1">
            <MapPin size={13} />
            <span>Inspection Location: {location}</span>
          </div>
        )}
      </div>
    </div>
  );
};
