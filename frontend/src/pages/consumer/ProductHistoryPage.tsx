import React, { useState, useEffect } from "react";
import { 
  Archive, 
  MagnifyingGlass, 
  Funnel, 
  Calendar, 
  Tag, 
  ShieldCheck, 
  Warning, 
  Heartbeat, 
  Scan, 
  ArrowRight,
  Sparkle,
  CheckCircle,
  XCircle,
  CurrencyInr,
  ArrowClockwise,
  SpinnerGap
} from "@phosphor-icons/react";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { MOCK_SCAN_HISTORY } from "../../data/mockScanHistory";
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

export const ProductHistoryPage: React.FC<ProductHistoryPageProps> = ({
  onNavigateToScanner,
  onNavigateToHealth,
}) => {
  const [historyItems, setHistoryItems] = useState<ScanHistoryItem[]>(MOCK_SCAN_HISTORY);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveSource, setIsLiveSource] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [scanTypeFilter, setScanTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<ScanHistoryItem | null>(null);

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
            scanCode: record.scan_code || "SCAN-REF",
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
            declaredMrp: record.mrp ? `INR ${record.mrp.toFixed(2)}` : "Declared",
            thumbnailUrl:
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
            summaryNote: isCompliant
              ? "Full statutory compliance verified under Legal Metrology (Packaged Commodities) Rules 2011."
              : "Statutory infractions detected during automated optical verification.",
            violationsCount: isCompliant ? 0 : 2,
            healthScore: Math.round(record.overall_score || 85),
          };
        });
        setHistoryItems(mappedItems);
        setIsLiveSource(true);
      } else {
        // Retain mock records if database empty
        setHistoryItems(MOCK_SCAN_HISTORY);
        setIsLiveSource(false);
      }
    } catch {
      // Fallback cleanly on network or server issue
      setHistoryItems(MOCK_SCAN_HISTORY);
      setIsLiveSource(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveHistory();
  }, []);

  const filteredItems = historyItems.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.scanCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      scanTypeFilter === "all" || item.scanType === scanTypeFilter;

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const compliantCount = historyItems.filter(i => i.status === "compliant" || i.status === "healthy").length;
  const violationCount = historyItems.filter(i => i.status === "violation" || i.status === "caution").length;

  const getItemBadge = (item: ScanHistoryItem) => {
    switch (item.status) {
      case "compliant":
        return <Badge variant="compliant" size="sm">LMPC Compliant</Badge>;
      case "healthy":
        return <Badge variant="compliant" size="sm">Nutritious Choice</Badge>;
      case "violation":
        return <Badge variant="violation" size="sm">Statutory Infraction</Badge>;
      case "caution":
        return <Badge variant="warning" size="sm">Health Caution</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Under Review</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 font-heading">
              Scanned Commodities & History Repository
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary-light text-primary border border-primary-border">
              VERIFICATION ARCHIVE
            </span>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            Browse and retrieve previously verified packaged goods, label compliance certificates, and consumer health audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[11px] font-mono border border-neutral-200 bg-neutral-50 text-neutral-600">
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveSource ? "bg-success animate-pulse" : "bg-warning"
              }`}
            />
            <span>{isLiveSource ? "Supabase Live Records" : "Demo Sample Records"}</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={fetchLiveHistory}
            disabled={isLoading}
            icon={
              isLoading ? (
                <SpinnerGap size={15} className="animate-spin" />
              ) : (
                <ArrowClockwise size={15} />
              )
            }
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onNavigateToScanner}
            icon={<Scan size={16} />}
          >
            Scan New Product
          </Button>
        </div>
      </div>

      {/* Summary Stat Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-[8px] border border-neutral-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-primary-light text-primary flex items-center justify-center font-bold">
            <Archive size={22} weight="bold" />
          </div>
          <div>
            <span className="text-xl font-bold text-neutral-900 font-heading block">
              {historyItems.length}
            </span>
            <span className="text-xs text-neutral-500">Total Scans in Repository</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-neutral-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-success-light text-success flex items-center justify-center font-bold">
            <CheckCircle size={22} weight="fill" />
          </div>
          <div>
            <span className="text-xl font-bold text-success font-heading block">
              {compliantCount}
            </span>
            <span className="text-xs text-neutral-500">Verified Compliant / Nutritious</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-neutral-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-violation-light text-violation flex items-center justify-center font-bold">
            <XCircle size={22} weight="fill" />
          </div>
          <div>
            <span className="text-xl font-bold text-violation font-heading block">
              {violationCount}
            </span>
            <span className="text-xs text-neutral-500">Infractions / High Concerns</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-[8px] border border-neutral-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search repository by product name, brand, or scan ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-[6px] border border-neutral-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <Funnel size={15} className="text-neutral-500" />
          <span className="text-neutral-500 font-medium">Category:</span>
          {[
            { key: "all", label: "All Records" },
            { key: "label_compliance", label: "Label Scans" },
            { key: "consumer_health", label: "Health Audits" }
          ].map((type) => (
            <button
              key={type.key}
              onClick={() => setScanTypeFilter(type.key)}
              className={`px-2.5 py-1.5 rounded-[6px] transition-colors ${
                scanTypeFilter === type.key
                  ? "bg-primary text-white font-bold"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Repository Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-[8px] border border-neutral-200 hover:border-neutral-300 shadow-xs p-4 flex flex-col justify-between space-y-3 transition-all"
          >
            <div className="flex items-start gap-3.5">
              <img
                src={item.thumbnailUrl}
                alt={item.productName}
                className="w-20 h-20 rounded-[6px] object-cover border border-neutral-200 shrink-0"
              />

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                    {item.brand}
                  </span>
                  {getItemBadge(item)}
                </div>

                <h3 className="text-sm font-bold text-neutral-900 font-heading leading-snug">
                  {item.productName}
                </h3>

                <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                  <span className="font-mono">{item.scanCode}</span>
                  <span>•</span>
                  <span>{item.category}</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-neutral-600 font-medium pt-0.5">
                  <span>Declared MRP: <strong>{item.declaredMrp}</strong></span>
                  {item.healthScore !== undefined && (
                    <span className="text-primary font-bold font-mono">
                      Health Score: {item.healthScore}/100
                    </span>
                  )}
                  {item.violationsCount !== undefined && item.violationsCount > 0 && (
                    <span className="text-violation font-bold font-mono">
                      {item.violationsCount} Violations
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-[6px] border border-neutral-150 leading-relaxed">
              {item.summaryNote}
            </p>

            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-100">
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {item.scanDate}
              </span>

              <div className="flex items-center gap-2">
                {item.scanType === "label_compliance" ? (
                  <button
                    onClick={onNavigateToScanner}
                    className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
                  >
                    <span>View Label Audit</span>
                    <ArrowRight size={13} />
                  </button>
                ) : (
                  <button
                    onClick={onNavigateToHealth}
                    className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
                  >
                    <span>View Health Breakdown</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-2 p-12 bg-white rounded-[8px] border border-neutral-200 text-center text-neutral-500">
            No scanned commodities matched your filter. Try adjusting your query or scan a new product.
          </div>
        )}
      </div>

    </div>
  );
};
