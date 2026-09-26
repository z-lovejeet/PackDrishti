import React, { useState, useEffect } from "react";
import { 
  Archive, 
  MagnifyingGlass, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  ArrowClockwise, 
  SpinnerGap, 
  Package, 
  Heartbeat, 
  X, 
  ShieldCheck, 
  Trash,
  WarningCircle
} from "@phosphor-icons/react";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { ScanHistoryItem } from "../../types";
import { apiClient } from "../../utils/apiClient";

interface ProductHistoryPageProps {
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
  badges?: any[];
  nutrients?: any[];
  dietary_advisory?: any;
}

export const ProductHistoryPage: React.FC<ProductHistoryPageProps> = ({
  onNavigateToHealth,
}) => {
  const [historyItems, setHistoryItems] = useState<ScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveSource, setIsLiveSource] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "healthy" | "concern">("all");
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ScanHistoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ title: string; desc: string; type: "success" | "error" } | null>(null);

  const fetchLiveHistory = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ApiHistoryRecord[]>("/health/history");
      if (response.data && response.data.length > 0) {
        const mappedItems: ScanHistoryItem[] = response.data.map((record) => {
          const isExpired = Boolean(record.is_expired);
          const score = Math.round(record.overall_score || 0);

          let statusVal: ScanHistoryItem["status"] = "healthy";
          if (isExpired || score < 40) {
            statusVal = "violation";
          } else if (score < 70) {
            statusVal = "caution";
          }

          let summary = "";
          if (isExpired) {
            summary = `CRITICAL HEALTH HAZARD: Expired food product (Mfg: ${record.mfg_date || 'Declared'}, Exp: ${record.expiry_date || 'Expired'}). Unsafe for consumption.`;
          } else {
            summary = `Nutrition Health Score: ${score}/100. Evaluated against ICMR-NIN 2024 & WHO dietary benchmarks.`;
          }

          return {
            id: record.scan_id,
            scanCode: record.scan_code || `HLTH-${record.scan_id.substring(0, 8).toUpperCase()}`,
            productName: record.product_name || "Packaged Food Product",
            brand: record.brand_name || "Unspecified Brand",
            category: record.category || "Packaged Food",
            scanDate: record.created_at
              ? new Date(record.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Recent",
            scanType: "consumer_health",
            status: statusVal,
            declaredMrp: record.mrp_str || (record.mrp ? `INR ${record.mrp.toFixed(2)}` : "Declared on Package"),
            thumbnailUrl: record.image_url || "",
            summaryNote: summary,
            healthScore: score,
            mfgDate: record.mfg_date,
            expiryDate: record.expiry_date,
            isExpired: isExpired,
            expiryStatus: record.expiry_status,
            netQuantity: record.net_quantity,
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
      await apiClient.delete("/health/history");
      setHistoryItems([]);
      setIsClearModalOpen(false);
      setFeedbackToast({
        type: "success",
        title: "History Cleared",
        desc: "All saved food and nutrition scan records have been cleared.",
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    } catch {
      setFeedbackToast({
        type: "error",
        title: "Action Failed",
        desc: "Unable to clear scan history from database.",
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
      await apiClient.delete(`/health/${itemToDelete.id}`);
      setHistoryItems((prev) => prev.filter((x) => x.id !== itemToDelete.id));
      setFeedbackToast({
        type: "success",
        title: "Record Deleted",
        desc: `Scan record '${itemToDelete.productName}' removed from history.`,
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
      (statusFilter === "healthy" && item.status === "healthy") ||
      (statusFilter === "concern" && (item.status === "violation" || item.status === "caution"));

    return matchesSearch && matchesStatus;
  });

  const totalScans = historyItems.length;
  const healthyCount = historyItems.filter((i) => i.status === "healthy").length;
  const concernCount = historyItems.filter(
    (i) => i.status === "violation" || i.status === "caution"
  ).length;

  const healthyPct = totalScans > 0 ? Math.round((healthyCount / totalScans) * 100) : 0;
  const concernPct = totalScans > 0 ? Math.round((concernCount / totalScans) * 100) : 0;

  const getItemBadge = (item: ScanHistoryItem) => {
    if (item.isExpired) {
      return <Badge variant="violation" size="sm" dot>EXPIRED PRODUCT</Badge>;
    }
    switch (item.status) {
      case "healthy":
        return <Badge variant="compliant" size="sm" dot>Nutritious Choice</Badge>;
      case "caution":
        return <Badge variant="warning" size="sm" dot>Moderate / Caution</Badge>;
      case "violation":
        return <Badge variant="violation" size="sm" dot>High Health Concern</Badge>;
      default:
        return <Badge variant="neutral" size="sm" dot>Evaluated</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto font-sans text-neutral-900">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <p className="text-2xs font-mono font-medium tracking-wider text-slate-500 uppercase">
            Consumer Food Log • Nutrition History
          </p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-950 tracking-tight">
              Scanned Food Products
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-mono border ${
              isLiveSource 
                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLiveSource ? "bg-emerald-600" : "bg-slate-400"}`} />
              <span>{isLiveSource ? "Live Database" : "Offline Mode"}</span>
              <span className="text-slate-300">•</span>
              <span>{totalScans} products</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
            Your personal log of scanned packaged foods, 0–100 nutrition scores, ingredient &amp; additive checks, and shelf-life freshness alerts.
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
            onClick={onNavigateToHealth}
            className="text-xs font-medium"
          >
            Scan New Product
          </Button>
        </div>
      </div>

      {/* 3 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Stat Card 1: Total Scans */}
        <div className="bg-white p-4 sm:p-5 rounded-card border border-neutral-200 shadow-card flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-2xs font-bold uppercase tracking-wider text-neutral-500 font-mono block">
              Total Products Scanned
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-navy-950">
              {totalScans}
            </div>
            <p className="text-2xs text-neutral-500">
              Food &amp; beverage items saved in your history
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-navy-50 text-navy-800 border border-navy-200 flex items-center justify-center shrink-0">
            <Archive size={22} weight="bold" />
          </div>
        </div>

        {/* Stat Card 2: Nutritious Choices */}
        <div className="bg-white p-4 sm:p-5 rounded-card border border-neutral-200 shadow-card flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                Nutritious Choices
              </span>
              <span className="text-2xs font-bold px-1.5 py-0.2 rounded bg-success-light text-success border border-success-border">
                {healthyPct}%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-success">
              {healthyCount}
            </div>
            <p className="text-2xs text-neutral-500">
              Scored 70+ on ICMR-NIN 2024 nutrition scale
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-success-light text-success border border-success-border flex items-center justify-center shrink-0">
            <CheckCircle size={22} weight="bold" />
          </div>
        </div>

        {/* Stat Card 3: Caution / High Concern */}
        <div className="bg-white p-4 sm:p-5 rounded-card border border-neutral-200 shadow-card flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xs font-bold uppercase tracking-wider text-neutral-500 font-mono block">
                Caution / High Concern
              </span>
              <span className="text-2xs font-bold px-1.5 py-0.2 rounded bg-violation-light text-violation border border-violation-border">
                {concernPct}%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-heading text-violation">
              {concernCount}
            </div>
            <p className="text-2xs text-neutral-500">
              High sugar, sodium, palm oil, or expired items
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
              placeholder="Search by product name, brand, or category..."
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
              All Products
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("healthy")}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                statusFilter === "healthy"
                  ? "bg-white text-success font-bold shadow-xs"
                  : "text-neutral-600 hover:text-success"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span>Nutritious (70+)</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("concern")}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                statusFilter === "concern"
                  ? "bg-white text-violation font-bold shadow-xs"
                  : "text-neutral-600 hover:text-violation"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violation" />
              <span>Caution / Concern</span>
            </button>
          </div>

        </div>

        {/* Result Count Bar */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-2xs text-neutral-500 font-mono">
          <span>
            Showing <strong>{filteredItems.length}</strong> of <strong>{totalScans}</strong> scanned products
          </span>
          {(searchTerm || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="text-saffron-600 hover:text-saffron-700 font-semibold underline underline-offset-2"
            >
              Reset Filters
            </button>
          )}
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
                      <span className="text-2xs font-mono uppercase">Food Pack</span>
                    </div>
                  )}

                  {/* Corner Score Badge */}
                  {item.healthScore !== undefined && (
                    <div className="absolute top-1 left-1">
                      <span className={`px-1.5 py-0.2 rounded text-2xs font-mono font-bold shadow-xs ${
                        item.healthScore >= 70 
                          ? "bg-success text-white" 
                          : item.healthScore >= 40 
                          ? "bg-saffron-500 text-white" 
                          : "bg-violation text-white"
                      }`}>
                        {item.healthScore}/100
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

                  {/* Pricing & Freshness Indicators */}
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
                  </div>

                </div>

              </div>

              {/* Health Summary Box */}
              <div className={`p-3 rounded-md border text-xs leading-relaxed space-y-1 ${
                item.isExpired 
                  ? "bg-rose-50/90 border-rose-300 text-rose-950 font-medium" 
                  : "bg-neutral-50 border-neutral-200/80 text-neutral-700"
              }`}>
                <div className={`flex items-center gap-1.5 font-bold text-2xs uppercase tracking-wider font-mono ${
                  item.isExpired ? "text-rose-800" : "text-neutral-500"
                }`}>
                  <ShieldCheck size={14} className={item.isExpired ? "text-rose-700 shrink-0" : "text-navy-800 shrink-0"} />
                  <span>{item.isExpired ? "Shelf-Life Safety Alert" : "Nutrition & Ingredient Summary"}</span>
                </div>
                <p>{item.summaryNote}</p>
              </div>

              {/* Footer: Date & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-neutral-100 text-2xs text-neutral-500">
                <div className="flex items-center gap-1.5 font-mono">
                  <Calendar size={14} className="text-neutral-400" />
                  <span>Scanned on {item.scanDate}</span>
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
                    variant="secondary"
                    size="sm"
                    onClick={onNavigateToHealth}
                    className="text-2xs h-8 px-2.5"
                    icon={<Heartbeat size={14} className="text-saffron-600" />}
                  >
                    Scan Another Product
                  </Button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Empty State */}
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
                ? "No Food Scans Saved Yet"
                : "No Products Match Your Search"}
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {historyItems.length === 0
                ? "Scan the front and back of any packaged food item to save its nutrition score and ingredient breakdown here."
                : `No products in your scan history match "${searchTerm}" under the selected filter.`}
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
                }}
                className="text-2xs"
              >
                Reset Filters
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={onNavigateToHealth}
              className="text-2xs font-semibold"
              icon={<Heartbeat size={15} />}
            >
              Scan Food Label Now
            </Button>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Clear All Scan History"
        subtitle="Permanent Deletion"
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
            Are you sure you want to clear <strong>all {historyItems.length} saved food scans</strong> from your history?
          </p>
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-2xs space-y-1">
            <p className="font-semibold">Please Note:</p>
            <p>
              This action permanently deletes your saved food and nutrition scan history. This cannot be undone.
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
        <div className="space-y-2 py-2 text-xs text-slate-600 leading-relaxed">
          <p>
            Are you sure you want to delete the scan record for{" "}
            <strong className="text-slate-900">{itemToDelete?.productName}</strong> ({itemToDelete?.scanCode})?
          </p>
        </div>
      </Modal>

      {/* Floating Feedback Toast */}
      {feedbackToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg border border-slate-700 flex items-start gap-3 animate-fadeIn">
          {feedbackToast.type === "success" ? (
            <CheckCircle size={18} weight="fill" className="text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <WarningCircle size={18} weight="fill" className="text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-0.5">
            <p className="font-bold">{feedbackToast.title}</p>
            <p className="text-slate-300 text-2xs">{feedbackToast.desc}</p>
          </div>
        </div>
      )}

    </div>
  );
};
