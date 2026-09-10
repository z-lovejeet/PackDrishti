import React from "react";
import { ShieldCheck, Warning, XCircle, Barcode, Calendar, MapPin, Scales, CornersOut } from "@phosphor-icons/react";

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
          badgeClass: "bg-emerald-50 text-emerald-900 border-emerald-300",
          border: "border-l-emerald-600",
          statusText: "Compliant under LMPC Rules",
          scoreBg: "bg-emerald-50 text-emerald-800 border-emerald-300",
          icon: <ShieldCheck size={22} className="text-emerald-600 shrink-0" weight="fill" />,
        };
      case "violation":
        return {
          badgeClass: "bg-rose-50 text-rose-900 border-rose-300",
          border: "border-l-rose-600",
          statusText: "Statutory Infractions Detected",
          scoreBg: "bg-rose-50 text-rose-800 border-rose-300",
          icon: <XCircle size={22} className="text-rose-600 shrink-0" weight="fill" />,
        };
      case "warning":
      default:
        return {
          badgeClass: "bg-amber-50 text-amber-950 border-amber-300",
          border: "border-l-amber-500",
          statusText: "Rectification Required",
          scoreBg: "bg-amber-50 text-amber-900 border-amber-300",
          icon: <Warning size={22} className="text-amber-600 shrink-0" weight="fill" />,
        };
    }
  };

  const statusInfo = getStatusDisplay();

  return (
    <div
      className={`bg-white p-6 rounded-lg border border-neutral-200 border-l-4 ${statusInfo.border} shadow-xs space-y-5`}
    >
      {/* Top Docket Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-2xs">
            <span className="font-bold text-neutral-700 bg-neutral-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider font-heading border border-neutral-200">
              {brand}
            </span>
            <span className="text-neutral-300">•</span>
            <span className="font-semibold text-neutral-600 bg-neutral-50 px-2.5 py-0.5 rounded-md border border-neutral-200">
              {category}
            </span>
            <span className="text-neutral-300">•</span>
            <span className="font-mono font-semibold text-neutral-700 bg-navy-50 text-navy-900 px-2.5 py-0.5 rounded-md border border-navy-200">
              REF: {scanCode}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 font-heading tracking-tight leading-tight">
            {productName}
          </h1>
        </div>

        {/* Right Status Badges & Score Box */}
        <div className="flex items-center gap-4 shrink-0 flex-wrap">
          {complianceScore !== undefined && (
            <div
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg border shadow-2xs ${statusInfo.scoreBg}`}
            >
              <div className="text-right">
                <span className="text-2xl font-extrabold font-heading block leading-none">
                  {complianceScore}
                </span>
                <span className="text-2xs uppercase tracking-wider font-bold opacity-80 block mt-0.5">
                  Score / 100
                </span>
              </div>
            </div>
          )}

          <div
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border shadow-2xs ${statusInfo.badgeClass}`}
          >
            {statusInfo.icon}
            <span className="text-xs font-bold font-heading">{statusInfo.statusText}</span>
          </div>
        </div>
      </div>

      {/* Structured Statutory Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1: GTIN / Barcode */}
        <div className="p-3 rounded-md bg-neutral-50 border border-neutral-200/80 space-y-1">
          <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
            <Barcode size={15} className="text-neutral-500" />
            <span>GTIN / Barcode</span>
          </span>
          <span className="font-mono font-bold text-xs sm:text-sm text-neutral-900 block truncate">
            {barcode || "Not Available"}
          </span>
        </div>

        {/* Metric 2: Rule 7 PDP Area */}
        <div className="p-3 rounded-md bg-neutral-50 border border-neutral-200/80 space-y-1">
          <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
            <CornersOut size={15} className="text-neutral-500" />
            <span>PDP Area (Rule 7)</span>
          </span>
          <span className="font-mono font-bold text-xs sm:text-sm text-neutral-900 block">
            {pdpAreaCm2 ? `${pdpAreaCm2} cm²` : "Calculated on PDP"}
          </span>
        </div>

        {/* Metric 3: Declared MRP & Net Qty */}
        <div className="p-3 rounded-md bg-neutral-50 border border-neutral-200/80 space-y-1">
          <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
            <Scales size={15} className="text-neutral-500" />
            <span>Declared MRP &amp; Qty</span>
          </span>
          <span className="font-heading font-bold text-xs sm:text-sm text-neutral-900 block truncate">
            {declaredMrp || "₹ --"} {netQuantity ? `(${netQuantity})` : ""}
          </span>
        </div>

        {/* Metric 4: Timestamp */}
        <div className="p-3 rounded-md bg-neutral-50 border border-neutral-200/80 space-y-1">
          <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
            <Calendar size={15} className="text-neutral-500" />
            <span>Scan Timestamp</span>
          </span>
          <span className="font-sans font-semibold text-xs sm:text-sm text-neutral-800 block truncate">
            {scannedAt}
          </span>
        </div>
      </div>

      {/* Inspection Jurisdiction Location Bar */}
      {location && (
        <div className="p-2.5 rounded-md bg-neutral-100/60 border border-neutral-200 text-2xs text-neutral-700 flex items-center gap-2">
          <MapPin size={15} className="text-navy-800 shrink-0" weight="bold" />
          <span className="font-semibold text-neutral-800">Inspection Division &amp; Location:</span>
          <span className="font-mono text-neutral-600 truncate">{location}</span>
        </div>
      )}
    </div>
  );
};
