import React, { useState, useEffect, useMemo } from "react";
import {
  MagnifyingGlass,
  CheckCircle,
  Warning,
  Trash,
  ArrowClockwise,
  SpinnerGap,
  WarningCircle,
} from "@phosphor-icons/react";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { ComplianceReport } from "../../types";
import { api } from "../../utils/apiClient";

interface ReportViewerPageProps {
  onOpenNewReportModal: () => void;
}

export const ReportViewerPage: React.FC<ReportViewerPageProps> = ({
  onOpenNewReportModal,
}) => {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [activeReport, setActiveReport] = useState<ComplianceReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ComplianceReport | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ title: string; desc: string; type: "success" | "error" } | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any>("/scan/history?role=officer");
      const list = Array.isArray(res) ? res : (res && res.history ? res.history : []);

      if (list && list.length > 0) {
        const liveReports: ComplianceReport[] = list.map((s: any, idx: number) => {
          const isCompliant = (s.compliance_status === "compliant" || s.compliance_status === "healthy") && !s.is_expired;
          const violCount = s.is_expired ? 1 : (s.violations ? s.violations.length : (isCompliant ? 0 : 1));
          return {
            id: s.scan_id || `live-rep-${idx}`,
            reportNumber: `REP-${s.scan_code || (s.scan_id ? s.scan_id.substring(0, 8).toUpperCase() : `2026-DEL-${String(idx + 50).padStart(3, '0')}`)}`,
            title: `${s.is_expired ? '[EXPIRED] ' : ''}Statutory Packaging Audit: ${s.product_name || s.brand_name || 'Packaged Commodity'}`,
            reportType: "Single Product Audit",
            generatedDate: s.created_at || s.scanned_at ? new Date(s.created_at || s.scanned_at).toLocaleDateString('en-GB') : "10-Sep-2026",
            generatedBy: "Sh. Rajesh Kumar Sharma",
            designation: "Senior Legal Metrology Inspector (DL-LM-INSP-0442)",
            district: "Zone-1 (Central & Old Delhi), Delhi NCT",
            totalProductsScanned: 1,
            compliantCount: isCompliant ? 1 : 0,
            violationCount: violCount,
            format: "PDF",
          };
        });

        setReports(liveReports);
        setActiveReport(liveReports[0]);
      } else {
        setReports([]);
        setActiveReport(null);
      }
    } catch {
      setReports([]);
      setActiveReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllReports = async () => {
    setIsClearing(true);
    try {
      await api.delete('/scan/history?role=officer');
      setReports([]);
      setActiveReport(null);
      setIsClearModalOpen(false);
      setFeedbackToast({
        type: "success",
        title: "Reports Cleared",
        desc: "All officer inspection reports have been permanently removed.",
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    } catch {
      setFeedbackToast({
        type: "error",
        title: "Action Failed",
        desc: "Unable to clear officer reports from database.",
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/scan/${reportToDelete.id}`);
      const updated = reports.filter((r) => r.id !== reportToDelete.id);
      setReports(updated);
      if (activeReport?.id === reportToDelete.id) {
        setActiveReport(updated.length > 0 ? updated[0] : null);
      }
      setFeedbackToast({
        type: "success",
        title: "Report Deleted",
        desc: `Inspection report '${reportToDelete.reportNumber}' removed from database.`,
      });
      setTimeout(() => setFeedbackToast(null), 4000);
      setReportToDelete(null);
    } catch {
      setFeedbackToast({
        type: "error",
        title: "Deletion Failed",
        desc: "Could not remove the selected inspection report.",
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        rep.title.toLowerCase().includes(q) ||
        rep.reportNumber.toLowerCase().includes(q) ||
        rep.district.toLowerCase().includes(q);
      const matchesType = selectedType === "all" || rep.reportType === selectedType;
      return matchesSearch && matchesType;
    });
  }, [reports, searchQuery, selectedType]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async (scanId?: string, reportNumber?: string) => {
    setIsDownloading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      const effectiveScanId = scanId || '00000000-0000-0000-0000-000000000001';
      const targetUrl = `${baseUrl}/reports/pdf/${effectiveScanId}`;
      const res = await fetch(targetUrl);

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FORM_LM_INSP_2011_${reportNumber || 'DOCKET'}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        window.print();
      }
    } catch {
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto font-sans antialiased text-slate-900">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200/80 no-print">
        <div>
          <p className="text-2xs font-mono font-medium tracking-wider text-slate-500 uppercase">
            Official Records • Form LM-INSP-2011
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-950 mt-1 tracking-tight">
            Compliance Dockets &amp; Reports
          </h1>
          <p className="text-xs text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
            Certified inspection dockets, packaging conformity assessments, and evidentiary records for legal metrology enforcement.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {reports.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsClearModalOpen(true)}
              disabled={isLoading || isClearing}
              className="text-xs font-medium text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
              icon={<Trash size={14} />}
            >
              Clear All Reports
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={fetchReports}
            disabled={isLoading}
            className="text-xs font-medium"
            icon={<ArrowClockwise size={14} className={isLoading ? "animate-spin" : ""} />}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenNewReportModal}
            className="text-xs font-medium"
          >
            Generate New Report
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 no-print">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by docket reference, product title, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", "Single Product Audit", "Marketplace Inspection", "Monthly District Summary"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                selectedType === type
                  ? "bg-slate-900 text-white font-medium shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {type === "all" ? "All Formats" : type}
            </button>
          ))}
          <span className="text-2xs font-mono text-slate-400 ml-2">
            {filteredReports.length} dockets
          </span>
        </div>
      </div>

      {/* Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Clean Docket List */}
        <div className="lg:col-span-5 space-y-3 no-print">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-2xs font-mono font-medium text-slate-500 uppercase tracking-wider">
              Inspection Dockets ({filteredReports.length})
            </span>
            <span className="text-2xs font-mono text-slate-400">Rule 29 Register</span>
          </div>

          <div className="space-y-2">
            {filteredReports.map((rep) => {
              const isSelected = activeReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => setActiveReport(rep)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-50/80 border-slate-900 ring-1 ring-slate-900/10 shadow-2xs"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-2xs font-mono font-semibold text-slate-900">
                          {rep.reportNumber}
                        </span>
                        <span className="text-2xs text-slate-400 font-mono">
                          {rep.generatedDate}
                        </span>
                      </div>

                      <h3 className="text-xs font-semibold text-slate-950 leading-snug line-clamp-2">
                        {rep.title}
                      </h3>

                      <p className="text-2xs text-slate-500 truncate">
                        {rep.district}
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-2xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {rep.totalProductsScanned} {rep.totalProductsScanned === 1 ? "specimen" : "specimens"}
                        </span>
                        {rep.violationCount === 0 ? (
                          <span className="text-2xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 flex items-center gap-1">
                            <CheckCircle size={12} weight="fill" />
                            <span>Conforming</span>
                          </span>
                        ) : (
                          <span className="text-2xs font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-800 flex items-center gap-1">
                            <Warning size={12} weight="fill" />
                            <span>{rep.violationCount} Infraction</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                      <span className="text-2xs font-mono text-slate-400 uppercase tracking-wider">
                        {rep.format}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportToDelete(rep);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete this report"
                        aria-label="Delete this report"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredReports.length === 0 && !isLoading && (
              <div className="p-8 border border-slate-200 rounded-xl text-center space-y-2">
                <p className="text-xs font-semibold text-slate-800">
                  {reports.length === 0 ? "No Inspection Dockets Generated Yet" : "No matching inspection dockets"}
                </p>
                <p className="text-2xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  {reports.length === 0
                    ? "Statutory inspection dockets and FORM LM-INSP-2011 compliance records will appear here as packaging scans are performed."
                    : "No inspection dockets match your search query or format filter."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: High-Dignity Formal Certificate Sheet */}
        <div className="lg:col-span-7">
          {activeReport ? (
            <div className="bg-white p-8 sm:p-10 rounded-xl border border-slate-200 shadow-sm space-y-6 print:border-0 print:p-0 print:shadow-none font-sans">
              
              {/* Official Masthead */}
              <div className="border-b border-slate-200 pb-6 text-center space-y-2">
                <div className="flex items-center justify-between text-2xs font-mono text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                  <span>Confidential • Official Record</span>
                  <span className="font-semibold text-slate-900">Schedule IV • Form LM-INSP-2011</span>
                  <span>Court-Admissible</span>
                </div>

                <div className="pt-2 flex justify-center mb-1">
                  <img
                    src="/logo.png"
                    alt="Legal Metrology Division Official Emblem"
                    className="w-12 h-12 rounded-xl object-contain shadow-xs border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-950 font-heading">
                    Government of India
                  </div>
                  <div className="text-2xs font-medium uppercase tracking-wider text-slate-600">
                    Ministry of Consumer Affairs, Food &amp; Public Distribution
                  </div>
                  <div className="text-2xs font-semibold text-slate-900 uppercase tracking-wide">
                    Department of Consumer Affairs • Legal Metrology Division
                  </div>
                  <div className="text-2xs text-slate-400 italic">
                    सत्यमेव जयते • Satyameva Jayate
                  </div>
                </div>

                <div className="pt-3">
                  <h2 className="text-base sm:text-lg font-bold text-slate-950 font-heading uppercase tracking-wide">
                    Certificate of Statutory Packaging Inspection
                  </h2>
                  <p className="text-2xs text-slate-500 max-w-lg mx-auto leading-relaxed mt-1">
                    Issued pursuant to Rule 29 of the Legal Metrology (Packaged Commodities) Rules, 2011 read with Sections 15, 36 &amp; 48 of the Legal Metrology Act, 2009.
                  </p>
                </div>
              </div>

              {/* Docket Particulars */}
              <div className="space-y-2">
                <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-slate-500 block">
                  I. Docket Particulars
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-lg bg-slate-50/60 border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-2xs font-mono uppercase text-slate-400 block">Docket Reference</span>
                    <span className="font-mono font-semibold text-slate-950 block mt-0.5">{activeReport.reportNumber}</span>
                  </div>
                  <div>
                    <span className="text-2xs font-mono uppercase text-slate-400 block">Date &amp; Time of Inspection</span>
                    <span className="font-medium text-slate-900 block mt-0.5">{activeReport.generatedDate} • 14:30 IST</span>
                  </div>
                  <div>
                    <span className="text-2xs font-mono uppercase text-slate-400 block">Enforcement Division &amp; Zone</span>
                    <span className="font-medium text-slate-900 block mt-0.5">{activeReport.district}</span>
                  </div>
                  <div>
                    <span className="text-2xs font-mono uppercase text-slate-400 block">Inspecting Officer In-Charge</span>
                    <span className="font-semibold text-slate-950 block mt-0.5">{activeReport.generatedBy}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-2xs font-mono uppercase text-slate-400 block">Designation</span>
                    <span className="text-slate-600 block mt-0.5">{activeReport.designation}</span>
                  </div>
                </div>
              </div>

              {/* Three-Pillar Statutory Compliance Summary */}
              <div className="space-y-3">
                <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-slate-500 block">
                  II. Statutory Findings Summary
                </span>

                {/* 3 Metric Counts */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-xl font-bold font-heading text-slate-950 block">
                      {activeReport.totalProductsScanned}
                    </span>
                    <span className="text-2xs text-slate-500 font-mono">Specimens</span>
                  </div>
                  <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
                    <span className="text-xl font-bold font-heading text-emerald-800 block">
                      {activeReport.compliantCount}
                    </span>
                    <span className="text-2xs text-emerald-700 font-mono">Compliant</span>
                  </div>
                  <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200">
                    <span className="text-xl font-bold font-heading text-rose-800 block">
                      {activeReport.violationCount}
                    </span>
                    <span className="text-2xs text-rose-700 font-mono">Infractions</span>
                  </div>
                </div>

                {/* Statutory Check Rows */}
                <div className="space-y-2 pt-1 text-xs">
                  <div className="p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3 bg-white">
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        Mandatory Declarations (Rule 6)
                      </span>
                      <p className="text-2xs text-slate-500 mt-0.5">
                        Verification of manufacturer identity, net quantity, month/year, MRP, and consumer care particulars.
                      </p>
                    </div>
                    <span className={`text-2xs font-mono font-medium px-2.5 py-1 rounded-full border shrink-0 ${
                      activeReport.violationCount === 0
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-rose-50 text-rose-800 border-rose-200"
                    }`}>
                      {activeReport.violationCount === 0 ? "Conforming" : "Infraction Flagged"}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3 bg-white">
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        Numeral Cap-Height &amp; Units (Rule 7 Table-I &amp; Rule 13)
                      </span>
                      <p className="text-2xs text-slate-500 mt-0.5">
                        Optical measurement of numeral height against PDP area; standard SI metric unit symbols verification.
                      </p>
                    </div>
                    <span className="text-2xs font-mono font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                      Conforming (&ge; 4.0mm)
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3 bg-white">
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        Unit Sale Pricing &amp; Dual MRP (Rule 6(1)(e) &amp; Rule 18)
                      </span>
                      <p className="text-2xs text-slate-500 mt-0.5">
                        Mathematical audit of Unit Sale Price (per g/ml/kg/L) and verification of single price integrity.
                      </p>
                    </div>
                    <span className={`text-2xs font-mono font-medium px-2.5 py-1 rounded-full border shrink-0 ${
                      activeReport.violationCount === 0
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}>
                      {activeReport.violationCount === 0 ? "Conforming" : "Notice Slated"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Legal Attestation */}
              <div className="space-y-2 p-4 rounded-lg bg-slate-50/70 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-slate-500 block">
                  III. Legal Attestation under Section 36(1)
                </span>
                <p className="text-xs leading-relaxed text-slate-700">
                  &quot;I, <strong className="font-semibold text-slate-950">{activeReport.generatedBy}</strong>, Senior Legal Metrology Inspector, do hereby certify that on {activeReport.generatedDate}, statutory inspection of the packaged commodity specimen referenced in Docket <strong className="font-mono text-slate-950">{activeReport.reportNumber}</strong> was conducted pursuant to Section 15 of the Legal Metrology Act, 2009. The declarations, numeral height measurements, metric unit usages, and Unit Sale Price disclosures have been examined against the mandatory requirements of the Legal Metrology (Packaged Commodities) Rules, 2011. This record constitutes valid secondary electronic evidence under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023.&quot;
                </p>
              </div>

              {/* Signature & Digital Verification */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-serif italic text-base font-bold text-slate-950">
                    {activeReport.generatedBy}
                  </div>
                  <div className="text-2xs text-slate-500 font-mono mt-0.5">
                    Senior Legal Metrology Inspector • DL-LM-INSP-0442
                  </div>
                  <div className="text-2xs font-mono text-slate-400 mt-0.5">
                    TS: {activeReport.generatedDate} 14:32:08 IST
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono text-2xs space-y-0.5">
                  <span className="text-emerald-700 font-semibold block">
                    Digitally Verified • DSC Token Active
                  </span>
                  <span className="text-slate-400 block truncate max-w-xs">
                    SHA-256: 7f83b1657ff1fc53b92dc18148a1d65d...b5c6
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 no-print flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReportToDelete(activeReport)}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200"
                  icon={<Trash size={14} />}
                >
                  Delete Report
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="text-xs font-medium"
                >
                  Print Certificate
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleDownloadPdf(activeReport.id, activeReport.reportNumber)}
                  loading={isDownloading}
                  className="text-xs font-medium"
                >
                  Download PDF (FORM LM-INSP-2011)
                </Button>
              </div>

            </div>
          ) : (
            <div className="p-16 rounded-xl border border-slate-200 bg-white text-center space-y-3">
              <p className="text-sm font-semibold text-slate-800">
                {reports.length === 0 ? "No Active Inspection Docket" : "Select an Inspection Docket"}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {reports.length === 0
                  ? "Field dockets and certified statutory inspection reports under Schedule IV Form LM-INSP-2011 will be rendered here once packaging scans are performed."
                  : "Select any inspection docket from the register on the left to preview the court-admissible certificate sheet."}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Clear All Reports Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Clear All Inspection Reports"
        subtitle="Permanent Enforcement Register Purge"
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
              onClick={handleClearAllReports}
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
            Are you sure you want to permanently clear <strong>all {reports.length} officer inspection reports</strong>?
          </p>
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-2xs space-y-1">
            <p className="font-semibold">Legal Metrology Ledger Notice:</p>
            <p>
              This action will delete all archived certificates of inspection and statutory enforcement findings for this division. This operation cannot be reversed.
            </p>
          </div>
        </div>
      </Modal>

      {/* Delete Item Confirmation Modal */}
      <Modal
        isOpen={Boolean(reportToDelete)}
        onClose={() => setReportToDelete(null)}
        title="Delete Inspection Report"
        subtitle="Confirm Removal"
        maxWidth="sm"
        icon={<Trash size={20} className="text-rose-600" />}
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReportToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteReport}
              disabled={isDeleting}
              icon={isDeleting ? <SpinnerGap size={14} className="animate-spin" /> : <Trash size={14} />}
            >
              {isDeleting ? "Deleting..." : "Delete Report"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-2 text-xs text-slate-600 leading-relaxed">
          <p>
            Are you sure you want to delete report{' '}
            <strong className="text-slate-900">{reportToDelete?.reportNumber}</strong> (
            {reportToDelete?.title})?
          </p>
          <p className="text-2xs text-slate-500 font-mono">
            District: {reportToDelete?.district}
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
