import React, { useState, useEffect } from "react";
import { 
  Archive, 
  MagnifyingGlass, 
  Calendar, 
  Scan, 
  CheckCircle, 
  XCircle, 
  ArrowClockwise, 
  SpinnerGap, 
  Package, 
  Heartbeat, 
  X, 
  ShieldCheck, 
  FileText,
  Trash,
  WarningCircle
} from "@phosphor-icons/react";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { ScanHistoryItem } from "../../types";
import { apiClient } from "../../utils/apiClient";

interface ProductHistoryPageProps {
  onNavigateToScanner: () => void;
  onNavigateToHealth: () => void;
}

interface ApiHistoryRecord {
  scan_id: string;
  scan_code: string;
  scan_type?: string;
  brand_name: string;
  product_name: string;
  category?: string;
  mrp: number;
  mrp_str?: string;
  net_quantity?: string;
  mfg_date?: string;
  expiry_date?: string;
  is_expired?: boolean;
  expiry_status?: string;
  compliance_status: string;
  overall_score: number;
  created_at: string | null;
  image_url?: string;
  violations?: any[];
  badges?: any[];
  nutrients?: any[];
  dietary_advisory?: any;
}

export const ProductHistoryPage: React.FC<ProductHistoryPageProps> = ({
  onNavigateToScanner,
  onNavigateToHealth,
}) => {
  const [historyItems, setHistoryItems] = useState<ScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveSource, setIsLiveSource] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "compliant" | "infractions">("all");
  const [scanTypeFilter, setScanTypeFilter] = useState<string>("all");
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ScanHistoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ title: string; desc: string; type: "success" | "error" } | null>(null);

  const fetchLiveHistory = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ApiHistoryRecord[]>("/scan/history?role=consumer");
      if (response.data && response.data.length > 0) {
        const mappedItems: ScanHistoryItem[] = response.data.map((record) => {
          const isCompliant =
            record.compliance_status?.toLowerCase() === "compliant" ||
            record.compliance_status?.toLowerCase() === "healthy";
          const isExpired = Boolean(record.is_expired);
          const scanType = (record.scan_type === "health_check" || record.scan_type === "consumer_health") 
            ? "consumer_health" 
            : "label_compliance";
          const violCount = record.violations?.length ?? (isCompliant ? 0 : 1);

          let statusVal: ScanHistoryItem["status"] = "compliant";
          if (isExpired) {
            statusVal = "violation";
          } else if (scanType === "consumer_health") {
            statusVal = (record.overall_score >= 70) ? "healthy" : (record.overall_score >= 40) ? "caution" : "violation";
          } else {
            statusVal = isCompliant ? "compliant" : "violation";
          }

          let summary = "";
          if (isExpired) {
            summary = `CRITICAL HAZARD: Expired commodity (Mfg: ${record.mfg_date || 'Declared'}, Exp: ${record.expiry_date || 'Expired'}). Past legal shelf life under Rule 6(1)(d) & Section 59 FSSAI. Strictly banned from sale.`;
          } else if (scanType === "consumer_health") {
            summary = `Nutritional Health Index: ${Math.round(record.overall_score || 50)}/100. Audited against ICMR-NIN 2024 Dietary Limits.`;
          } else if (isCompliant) {
            summary = "Full statutory compliance verified under Legal Metrology (Packaged Commodities) Rules 2011.";
          } else {
            summary = `Statutory infractions detected (${violCount} non-conformances) under Section 36(1).`;
          }

          return {
            id: record.scan_id,
            scanCode: record.scan_code || `LMPC-${record.scan_id.substring(0, 8).toUpperCase()}`,
            productName: record.product_name || "Verified Packaging Unit",
            brand: record.brand_name || "Unspecified Brand",
            category: record.category || (scanType === "consumer_health" ? "Packaged Food" : "Packaged Goods"),
            scanDate: record.created_at
              ? new Date(record.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Recent",
            scanType: scanType,
            status: statusVal,
            declaredMrp: record.mrp_str || (record.mrp ? `INR ${record.mrp.toFixed(2)}` : "Declared on Package"),
            thumbnailUrl: record.image_url || "",
            summaryNote: summary,
            violationsCount: violCount,
            healthScore: Math.round(record.overall_score || 0),
            mfgDate: record.mfg_date,
            expiryDate: record.expiry_date,
            isExpired: isExpired,
            expiryStatus: record.expiry_status,
            netQuantity: record.net_quantity,
            violations: record.violations || [],
            badges: record.badges || [],
            nutrients: record.nutrients || [],
            dietaryAdvisory: record.dietary_advisory,
          };
        });
        setHistoryItems(mappedItems);
        setIsLiveSource(true);
      } else {
        setHistoryItems([]);
        setIsLiveSource(true);
      }
    } catch {
      setHistoryItems([]);
      setIsLiveSource(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllHistory = async () => {
    setIsClearing(true);
    try {
      await apiClient.delete("/scan/history?role=consumer");
      setHistoryItems([]);
      setIsClearModalOpen(false);
      setFeedbackToast({
        type: "success",
        title: "Repository Cleared",
        desc: "All consumer scan history records have been permanently cleared.",
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    } catch {
      setFeedbackToast({
        type: "error",
        title: "Action Failed",
        desc: "Unable to clear consumer scan records from database.",
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/scan/${itemToDelete.id}`);
      setHistoryItems((prev) => prev.filter((x) => x.id !== itemToDelete.id));
      setFeedbackToast({
        type: "success",
        title: "Record Deleted",
        desc: `Scan record '${itemToDelete.productName}' deleted from repository.`,
      });
      setTimeout(() => setFeedbackToast(null), 4000);
      setItemToDelete(null);
    } catch {
      setFeedbackToast({
        type: "error",
        title: "Deletion Failed",
        desc: "Could not remove the selected scan record.",
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchLiveHistory();
  }, []);

  const handleImageError = (id: string) => {
    setImageLoadErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Filter logic
  const filteredItems = historyItems.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      term === "" ||
      item.productName.toLowerCase().includes(term) ||
      item.brand.toLowerCase().includes(term) ||
      item.scanCode.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "compliant" && (item.status === "compliant" || item.status === "healthy")) ||
      (statusFilter === "infractions" && (item.status === "violation" || item.status === "caution"));

    const matchesType =
      scanTypeFilter === "all" || item.scanType === scanTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalScans = historyItems.length;
  const compliantCount = historyItems.filter(
    (i) => i.status === "compliant" || i.status === "healthy"
  ).length;
  const violationCount = historyItems.filter(
    (i) => i.status === "violation" || i.status === "caution"
  ).length;

  const compliantPct = totalScans > 0 ? Math.round((compliantCount / totalScans) * 100) : 0;
  const violationPct = totalScans > 0 ? Math.round((violationCount / totalScans) * 100) : 0;

  const getItemBadge = (item: ScanHistoryItem) => {
    if (item.isExpired) {
      return <Badge variant="violation" size="sm" dot>EXPIRED PRODUCT</Badge>;
    }
    switch (item.status) {
      case "compliant":
        return <Badge variant="compliant" size="sm" dot>LMPC Compliant</Badge>;
      case "healthy":
        return <Badge variant="compliant" size="sm" dot>Nutritious Choice</Badge>;
      case "violation":
        return <Badge variant="violation" size="sm" dot>Statutory Infraction</Badge>;
      case "caution":
        return <Badge variant="warning" size="sm" dot>Health Caution</Badge>;
      default:
        return <Badge variant="neutral" size="sm" dot>Under Review</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto font-sans text-neutral-900">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <p className="text-2xs font-mono font-medium tracking-wider text-slate-500 uppercase">
            Audit Records • Central Repository
          </p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-950 tracking-tight">
              Archived Inspections
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-mono border ${
              isLiveSource 
                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLiveSource ? "bg-emerald-600" : "bg-slate-400"}`} />
              <span>{isLiveSource ? "Live Database" : "Demonstration Ledger"}</span>
              <span className="text-slate-300">•</span>
              <span>{totalScans} commodities</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
            Historical log of verified pre-packaged commodities, statutory Rule 6 declarations, Table-I font assessments, and nutritional evaluations.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {historyItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsClearModalOpen(true)}
              disabled={isLoading || isClearing}
              className="text-xs font-medium text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
              icon={<Trash size={14} />}
            >
              Clear All History
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={fetchLiveHistory}
            disabled={isLoading}
            className="text-xs font-medium"
            icon={<ArrowClockwise size={14} className={isLoading ? "animate-spin" : ""} />}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onNavigateToScanner}
            className="text-xs font-medium"
          >
            New Inspection
          </Button>
        </div>
      </div>

      {/* 3 Executive Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Stat Card 1: Total Scans Archived */}
        <div className="bg-white p-4 sm:p-5 rounded-card border border-neutral-200 shadow-card flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-2xs font-bold uppercase tracking-wider text-neutral-500 font-mono block">
              Total Scans Archived
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-navy-950">
              {totalScans}
            </div>
            <p className="text-2xs text-neutral-500">
              Pre-packaged commodities registered in repository
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-navy-50 text-navy-800 border border-navy-200 flex items-center justify-center shrink-0">
            <Archive size={22} weight="bold" />
          </div>
        </div>

        {/* Stat Card 2: Verified Compliant */}
        <div className="bg-white p-4 sm:p-5 rounded-card border border-neutral-200 shadow-card flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                Verified Compliant
              </span>
              <span className="text-2xs font-bold px-1.5 py-0.2 rounded bg-success-light text-success border border-success-border">
                {compliantPct}%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-success">
              {compliantCount}
            </div>
            <p className="text-2xs text-neutral-500">
              Passed Rule 6 statutory declarations &amp; Table-I fonts
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-success-light text-success border border-success-border flex items-center justify-center shrink-0">
            <CheckCircle size={22} weight="bold" />
          </div>
        </div>

        {/* Stat Card 3: Non-Compliant Items */}
        <div className="bg-white p-4 sm:p-5 rounded-card border border-neutral-200 shadow-card flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                Non-Compliant Items
              </span>
              <span className="text-2xs font-bold px-1.5 py-0.2 rounded bg-violation-light text-violation border border-violation-border">
                {violationPct}%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-violation">
              {violationCount}
            </div>
            <p className="text-2xs text-neutral-500">
              Statutory infractions or excessive sugar/sodium limits
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-violation-light text-violation border border-violation-border flex items-center justify-center shrink-0">
            <XCircle size={22} weight="bold" />
          </div>
        </div>

      </div>

      {/* Interactive Filter Toolbar */}
      <div className="bg-white p-4 rounded-card border border-neutral-200 shadow-card space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input with Clear Button */}
          <div className="relative flex-1">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search repository by product name, brand, or scan ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-xs rounded-md border border-neutral-300 focus:outline-none focus:border-navy-800 focus:ring-1 focus:ring-navy-800 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                aria-label="Clear search input"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Segmented Filter Buttons: Status */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-md text-2xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded transition-all ${
                statusFilter === "all"
                  ? "bg-white text-navy-950 font-bold shadow-xs"
                  : "text-neutral-600 hover:text-navy-950"
              }`}
            >
              All Records
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("compliant")}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                statusFilter === "compliant"
                  ? "bg-white text-success font-bold shadow-xs"
                  : "text-neutral-600 hover:text-success"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span>Compliant Only</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("infractions")}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                statusFilter === "infractions"
                  ? "bg-white text-violation font-bold shadow-xs"
                  : "text-neutral-600 hover:text-violation"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violation" />
              <span>Infractions Only</span>
            </button>
          </div>

        </div>

        {/* Secondary Category & Result Count Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-2xs text-neutral-600">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-neutral-500 uppercase tracking-wider font-mono">
              Audit Scope:
            </span>
            {[
              { key: "all", label: "All Scans" },
              { key: "label_compliance", label: "Label Compliance" },
              { key: "consumer_health", label: "Health Checks" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setScanTypeFilter(tab.key)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  scanTypeFilter === tab.key
                    ? "bg-navy-900 text-white font-bold"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-neutral-500 font-mono">
            <span>
              Showing <strong>{filteredItems.length}</strong> of <strong>{totalScans}</strong> commodities
            </span>
            {(searchTerm || statusFilter !== "all" || scanTypeFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setScanTypeFilter("all");
                }}
                className="text-saffron-600 hover:text-saffron-700 font-semibold underline underline-offset-2 ml-1"
              >
                Reset All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredItems.map((item) => {
          const hasImageError = imageLoadErrors[item.id];

          return (
            <div
              key={item.id}
              className="bg-white rounded-card border border-neutral-200 hover:border-neutral-300 hover:shadow-card-hover transition-all p-5 flex flex-col justify-between space-y-4"
            >
              {/* Product Top Header: Image + Essential Information */}
              <div className="flex items-start gap-4">
                
                {/* Thumbnail Container with Placeholder Fallback */}
                <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {!hasImageError && item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.productName}
                      onError={() => handleImageError(item.id)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-400 gap-1 p-2 text-center">
                      <Package size={28} weight="light" />
                      <span className="text-2xs font-mono uppercase">Packaging</span>
                    </div>
                  )}

                  {/* Corner Score Badge */}
                  {item.healthScore !== undefined && (
                    <div className="absolute top-1 left-1">
                      <span className={`px-1.5 py-0.2 rounded text-2xs font-mono font-bold shadow-xs ${
                        item.healthScore >= 80 
                          ? "bg-success text-white" 
                          : item.healthScore >= 60 
                          ? "bg-saffron-500 text-white" 
                          : "bg-violation text-white"
                      }`}>
                        {item.healthScore}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details Column */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  
                  {/* Brand & Status Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-2xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                      {item.brand}
                    </span>
                    {getItemBadge(item)}
                  </div>

                  {/* Product Title */}
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900 font-heading leading-snug">
                    {item.productName}
                  </h3>

                  {/* Meta Specs Row */}
                  <div className="flex items-center gap-2 text-2xs text-neutral-500 flex-wrap">
                    <span className="font-mono bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-700">
                      {item.scanCode}
                    </span>
                    <span>•</span>
                    <span>{item.category}</span>
                  </div>

                  {/* Pricing & Compliance Indicators */}
                  <div className="flex items-center gap-2 text-2xs text-neutral-700 font-medium pt-1 flex-wrap">
                    <span className="bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200">
                      MRP: <strong className="text-neutral-900">{item.declaredMrp}</strong>
                    </span>

                    {item.netQuantity && (
                      <span className="bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200">
                        Qty: <strong className="text-neutral-900">{item.netQuantity}</strong>
                      </span>
                    )}

                    {item.mfgDate && (
                      <span className="bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200">
                        Mfg: <strong className="text-neutral-900">{item.mfgDate}</strong>
                      </span>
                    )}

                    {item.expiryDate && (
                      <span className={`px-2 py-0.5 rounded border ${
                        item.isExpired 
                          ? "bg-rose-50 border-rose-300 text-rose-800 font-bold" 
                          : "bg-neutral-50 border-neutral-200"
                      }`}>
                        Exp: <strong className={item.isExpired ? "text-rose-900" : "text-neutral-900"}>{item.expiryDate}</strong>
                      </span>
                    )}

                    {item.isExpired ? (
                      <span className="text-violation font-bold font-mono inline-flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <XCircle size={14} weight="fill" className="text-rose-600" />
                        <span>Banned from Retail Sale</span>
                      </span>
                    ) : item.violationsCount !== undefined && item.violationsCount > 0 ? (
                      <span className="text-violation font-bold font-mono inline-flex items-center gap-1">
                        <XCircle size={14} weight="bold" />
                        <span>{item.violationsCount} Statutory Infractions</span>
                      </span>
                    ) : (
                      <span className="text-success font-bold font-mono inline-flex items-center gap-1">
                        <CheckCircle size={14} weight="bold" />
                        <span>Rule 6 Verified</span>
                      </span>
                    )}
                  </div>

                </div>

              </div>

              {/* Statutory Note Box */}
              <div className={`p-3 rounded-md border text-xs leading-relaxed space-y-1 ${
                item.isExpired 
                  ? "bg-rose-50/90 border-rose-300 text-rose-950 font-medium" 
                  : "bg-neutral-50 border-neutral-200/80 text-neutral-700"
              }`}>
                <div className={`flex items-center gap-1.5 font-bold text-2xs uppercase tracking-wider font-mono ${
                  item.isExpired ? "text-rose-800" : "text-neutral-500"
                }`}>
                  <ShieldCheck size={14} className={item.isExpired ? "text-rose-700 shrink-0" : "text-navy-800 shrink-0"} />
                  <span>{item.isExpired ? "Critical Enforcement Infraction" : "Statutory Inspection Findings"}</span>
                </div>
                <p>{item.summaryNote}</p>
              </div>

              {/* Footer: Date & Dual Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-neutral-100 text-2xs text-neutral-500">
                <div className="flex items-center gap-1.5 font-mono">
                  <Calendar size={14} className="text-neutral-400" />
                  <span>Audited on {item.scanDate}</span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setItemToDelete(item)}
                    className="text-2xs h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200"
                    icon={<Trash size={14} />}
                  >
                    Delete
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onNavigateToScanner}
                    className="text-2xs h-8 px-2.5"
                    icon={<FileText size={14} className="text-navy-800" />}
                  >
                    View Label Audit
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onNavigateToHealth}
                    className="text-2xs h-8 px-2.5"
                    icon={<Heartbeat size={14} className="text-saffron-600" />}
                  >
                    Nutrition Health Check
                  </Button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Illustrated Empty State */}
      {filteredItems.length === 0 && (
        <div className="bg-white rounded-card border border-neutral-200 p-8 sm:p-12 text-center space-y-4 shadow-card">
          <div className="w-16 h-16 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-400 flex items-center justify-center mx-auto">
            {historyItems.length === 0 ? (
              <Archive size={32} weight="light" />
            ) : (
              <MagnifyingGlass size={32} weight="light" />
            )}
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-neutral-900 font-heading">
              {historyItems.length === 0
                ? "No Inspection Scans Recorded Yet"
                : "No Commodities Match Your Search Criteria"}
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {historyItems.length === 0
                ? "Perform an optical inspection scan or nutrition audit to archive packages in this registry."
                : `No commodities in the compliance repository match your query "${searchTerm}" under the selected filter scope.`}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {historyItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setScanTypeFilter("all");
                }}
                className="text-2xs"
              >
                Clear All Filters
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={onNavigateToScanner}
              className="text-2xs font-semibold"
              icon={<Scan size={15} />}
            >
              Scan Package Now
            </Button>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Clear All Consumer History"
        subtitle="Permanent Database Deletion"
        maxWidth="sm"
        icon={<Trash size={20} className="text-rose-600" />}
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsClearModalOpen(false)}
              disabled={isClearing}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearAllHistory}
              disabled={isClearing}
              icon={isClearing ? <SpinnerGap size={14} className="animate-spin" /> : <Trash size={14} />}
            >
              {isClearing ? "Clearing..." : "Yes, Clear All"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-2 text-xs text-slate-600 leading-relaxed">
          <p>
            Are you sure you want to clear <strong>all {historyItems.length} consumer audit records</strong> from the central repository?
          </p>
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-2xs space-y-1">
            <p className="font-semibold">Statutory Ledger Notice:</p>
            <p>
              This action permanently purges all packaging evaluations, nutrition audits, and violation records registered under consumer mode. This cannot be undone.
            </p>
          </div>
        </div>
      </Modal>

      {/* Delete Item Confirmation Modal */}
      <Modal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        title="Delete Scan Record"
        subtitle="Confirm Removal"
        maxWidth="sm"
        icon={<Trash size={20} className="text-rose-600" />}
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setItemToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteItem}
              disabled={isDeleting}
              icon={isDeleting ? <SpinnerGap size={14} className="animate-spin" /> : <Trash size={14} />}
            >
              {isDeleting ? "Deleting..." : "Delete Record"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-2 text-xs text-slate-600 leading-relaxed">
          <p>
            Are you sure you want to delete the scan report for{' '}
            <strong className="text-slate-900">{itemToDelete?.productName}</strong> ({itemToDelete?.brand})?
          </p>
          <p className="text-2xs text-slate-500 font-mono">
            Docket ID: {itemToDelete?.scanCode}
          </p>
        </div>
      </Modal>

      {/* Feedback Toast */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div className={`p-4 rounded-xl shadow-lg border flex items-start gap-3 max-w-sm ${
            feedbackToast.type === "success" 
              ? "bg-white text-slate-900 border-emerald-300 shadow-emerald-500/10" 
              : "bg-white text-slate-900 border-rose-300 shadow-rose-500/10"
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              feedbackToast.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}>
              {feedbackToast.type === "success" ? <CheckCircle size={18} weight="bold" /> : <WarningCircle size={18} weight="bold" />}
            </div>
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-xs font-bold text-slate-900">{feedbackToast.title}</h4>
              <p className="text-2xs text-slate-600 leading-relaxed">{feedbackToast.desc}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

