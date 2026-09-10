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
  FileText
} from "@phosphor-icons/react";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { ScanHistoryItem } from "../../types";
import { apiClient } from "../../utils/apiClient";

interface ProductHistoryPageProps {
  onNavigateToScanner: () => void;
  onNavigateToHealth: () => void;
}

interface ApiHistoryRecord {
  scan_id: string;
  scan_code: string;
  brand_name: string;
  product_name: string;
  mrp: number;
  net_quantity: string;
  compliance_status: string;
  overall_score: number;
  created_at: string | null;
}

// Fallback demonstration dataset representing typical Indian pre-packaged commodities
const DEMO_SAMPLE_ITEMS: ScanHistoryItem[] = [
  {
    id: "demo-scan-01",
    scanCode: "LMPC-2024-8841",
    productName: "Fortune Sunlite Refined Sunflower Oil 1L",
    brand: "Fortune (Adani Wilmar Ltd)",
    category: "Edible Oils & Fats",
    scanDate: "10 Sep 2026",
    scanType: "label_compliance",
    status: "compliant",
    declaredMrp: "INR 145.00",
    thumbnailUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80",
    summaryNote: "Full statutory compliance verified under Legal Metrology Rules 2011. Mandatory manufacturer address with PIN (380009), standard SI metric unit (L), and Rule 7 Table-I font cap-height (4.2mm) verified.",
    violationsCount: 0,
    healthScore: 96,
  },
  {
    id: "demo-scan-02",
    scanCode: "LMPC-2024-8912",
    productName: "Tata Salt Lite 1kg",
    brand: "Tata Consumer Products",
    category: "Salt & Spices",
    scanDate: "09 Sep 2026",
    scanType: "label_compliance",
    status: "compliant",
    declaredMrp: "INR 42.00",
    thumbnailUrl: "https://images.unsplash.com/photo-1518110903495-cd79e122680a?w=400&q=80",
    summaryNote: "Rule 6 declarations compliant. 15% low sodium formulation aligns with ICMR-NIN 2024 dietary guidelines. Consumer care contacts and manufacturing batch fully declared.",
    violationsCount: 0,
    healthScore: 94,
  },
  {
    id: "demo-scan-03",
    scanCode: "LMPC-2024-9023",
    productName: "SweetCrunch Choco Butter Biscuits 200g",
    brand: "Delight Bakers India",
    category: "Bakery & Confectionery",
    scanDate: "08 Sep 2026",
    scanType: "label_compliance",
    status: "violation",
    declaredMrp: "INR 60.00",
    thumbnailUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80",
    summaryNote: "Non-compliant under Rule 6(1)(e) Proviso: Missing mandatory Unit Sale Price (USP in INR/g). Added sugar content (34.2g/100g) exceeds ICMR-NIN 2024 maximum dietary threshold.",
    violationsCount: 2,
    healthScore: 48,
  },
  {
    id: "demo-scan-04",
    scanCode: "LMPC-2024-9184",
    productName: "Amul Taaza Homogenised Toned Milk 1L",
    brand: "Amul (GCMMF Ltd)",
    category: "Dairy Products",
    scanDate: "07 Sep 2026",
    scanType: "consumer_health",
    status: "healthy",
    declaredMrp: "INR 56.00",
    thumbnailUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80",
    summaryNote: "Excellent compliance across all 11 mandatory declarations. Standard SI metric unit symbol verified. Balanced nutritional profile under ICMR-NIN 2024 dietary norms.",
    violationsCount: 0,
    healthScore: 98,
  },
  {
    id: "demo-scan-05",
    scanCode: "LMPC-2024-9247",
    productName: "Royal Feast Premium Basmati Rice 5kg",
    brand: "Royal Agro Packagers",
    category: "Grains & Pulses",
    scanDate: "06 Sep 2026",
    scanType: "label_compliance",
    status: "violation",
    declaredMrp: "INR 495.00",
    thumbnailUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
    summaryNote: "Statutory infraction under Rule 7 Table-I: Net quantity numeral cap-height measured at 2.8mm, failing the mandatory 4.0mm minimum threshold for PDP area > 500 cm2. Subject to Section 36(1) compounding.",
    violationsCount: 1,
    healthScore: 52,
  },
  {
    id: "demo-scan-06",
    scanCode: "LMPC-2024-9331",
    productName: "Himalayan Natural Multifloral Honey 500g",
    brand: "Himalayan Nectar Corp",
    category: "Honey & Natural Sweeteners",
    scanDate: "05 Sep 2026",
    scanType: "label_compliance",
    status: "compliant",
    declaredMrp: "INR 280.00",
    thumbnailUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80",
    summaryNote: "Full compliance with Rule 6 declarations and FSSAI honey standards. Origin district declared, standard SI units verified, FOP font heights compliant.",
    violationsCount: 0,
    healthScore: 92,
  },
];

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

  const fetchLiveHistory = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ApiHistoryRecord[]>("/scan/history");
      if (response.data && response.data.length > 0) {
        const mappedItems: ScanHistoryItem[] = response.data.map((record) => {
          const isCompliant =
            record.compliance_status?.toUpperCase() === "COMPLIANT";
          return {
            id: record.scan_id,
            scanCode: record.scan_code || `LMPC-${record.scan_id.substring(0, 8).toUpperCase()}`,
            productName: record.product_name || "Verified Packaging Unit",
            brand: record.brand_name || "Unspecified Brand",
            category: "Packaged Goods",
            scanDate: record.created_at
              ? new Date(record.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Recent",
            scanType: "label_compliance",
            status: isCompliant ? "compliant" : "violation",
            declaredMrp: record.mrp ? `INR ${record.mrp.toFixed(2)}` : "Declared on Package",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
            summaryNote: isCompliant
              ? "Full statutory compliance verified under Legal Metrology (Packaged Commodities) Rules 2011."
              : "Statutory infractions detected during automated optical verification under Section 36(1).",
            violationsCount: isCompliant ? 0 : 2,
            healthScore: Math.round(record.overall_score || 85),
          };
        });
        setHistoryItems(mappedItems);
        setIsLiveSource(true);
      } else {
        // Fallback to rich demo records if live database is empty
        setHistoryItems(DEMO_SAMPLE_ITEMS);
        setIsLiveSource(false);
      }
    } catch {
      // Fallback to demo sample items if network or backend is offline
      setHistoryItems(DEMO_SAMPLE_ITEMS);
      setIsLiveSource(false);
    } finally {
      setIsLoading(false);
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
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLiveHistory}
            disabled={isLoading}
            className="text-xs font-medium"
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
                  <div className="flex items-center gap-3 text-2xs text-neutral-700 font-medium pt-1 flex-wrap">
                    <span className="bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200">
                      Declared MRP: <strong className="text-neutral-900">{item.declaredMrp}</strong>
                    </span>

                    {item.violationsCount !== undefined && item.violationsCount > 0 ? (
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
              <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200/80 text-xs text-neutral-700 leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-2xs uppercase tracking-wider text-neutral-500 font-mono">
                  <ShieldCheck size={14} className="text-navy-800 shrink-0" />
                  <span>Statutory Inspection Findings</span>
                </div>
                <p>{item.summaryNote}</p>
              </div>

              {/* Footer: Date & Dual Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-neutral-100 text-2xs text-neutral-500">
                <div className="flex items-center gap-1.5 font-mono">
                  <Calendar size={14} className="text-neutral-400" />
                  <span>Audited on {item.scanDate}</span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
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
            <MagnifyingGlass size={32} weight="light" />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-neutral-900 font-heading">
              No Commodities Match Your Search Criteria
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              No commodities in the compliance repository match your query &quot;{searchTerm}&quot; under the selected filter scope.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
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

            <Button
              variant="primary"
              size="sm"
              onClick={onNavigateToScanner}
              className="text-2xs"
              icon={<Scan size={15} />}
            >
              Scan New Product
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

