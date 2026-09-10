import React, { useState } from "react";
import { 
  FileText, 
  DownloadSimple, 
  Printer, 
  MagnifyingGlass, 
  Funnel, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User, 
  Building,
  SealCheck,
  ArrowSquareOut,
  X
} from "@phosphor-icons/react";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { MOCK_REPORTS } from "../../data/mockReports";
import { ComplianceReport } from "../../types";

interface ReportViewerPageProps {
  onOpenNewReportModal: () => void;
}

export const ReportViewerPage: React.FC<ReportViewerPageProps> = ({
  onOpenNewReportModal,
}) => {
  const [reports, setReports] = useState<ComplianceReport[]>(MOCK_REPORTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [activeReport, setActiveReport] = useState<ComplianceReport | null>(MOCK_REPORTS[0]);

  const filteredReports = reports.filter((rep) => {
    const matchesSearch = 
      rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || rep.reportType === selectedType;
    return matchesSearch && matchesType;
  });

  const [isDownloading, setIsDownloading] = useState(false);

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
      if (!res.ok) throw new Error('PDF download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FORM_LM_INSP_2011_${reportNumber || 'DOCKET'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error generating PDF: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 font-heading">
              Statutory Compliance Reports & Dockets
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary-light text-primary border border-primary-border">
              OFFICIAL REPOSITORY
            </span>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            Archived compliance audit certificates, district marketplace inspections, and violation summaries under LMPC Rules, 2011.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenNewReportModal}
            icon={<FileText size={16} />}
          >
            Generate New Report
          </Button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-[8px] border border-neutral-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by report docket number, title, or inspection district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-[6px] border border-neutral-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <Funnel size={15} className="text-neutral-500" />
          <span className="text-neutral-500 font-medium">Type:</span>
          {["all", "Single Product Audit", "Marketplace Inspection", "Monthly District Summary"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-2.5 py-1.5 rounded-[6px] transition-colors ${
                selectedType === type
                  ? "bg-primary text-white font-bold"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {type === "all" ? "All Formats" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Report Dockets List + Selected Report Full Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Report List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
            Archived Inspection Dockets ({filteredReports.length})
          </span>

          <div className="space-y-2">
            {filteredReports.map((rep) => {
              const isSelected = activeReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => setActiveReport(rep)}
                  className={`p-3.5 rounded-[8px] border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white border-primary ring-2 ring-primary/20 shadow-xs"
                      : "bg-white border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                        {rep.reportNumber}
                      </span>
                      <h3 className="text-xs font-bold text-neutral-900 font-heading leading-tight truncate">
                        {rep.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                        <span>{rep.generatedDate}</span>
                        <span>•</span>
                        <span>{rep.district}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 font-mono">
                        {rep.format}
                      </span>
                      <div className="text-[11px] text-neutral-600">
                        <strong className="text-neutral-900">{rep.totalProductsScanned}</strong> items
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full Statutory Report Preview Sheet */}
        <div className="lg:col-span-7">
          {activeReport ? (
            <div className="bg-white p-6 rounded-[8px] border border-neutral-300 shadow-sm space-y-6">
              
              {/* Official Document Banner */}
              <div className="border-b-2 border-neutral-800 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <SealCheck size={20} weight="fill" />
                    <span>Government of India • Ministry of Consumer Affairs</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-neutral-700">
                    FORM LM-INSP-2011
                  </span>
                </div>

                <div className="text-center pt-2">
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900 font-heading">
                    CERTIFICATE OF STATUTORY INSPECTION AUDIT
                  </h2>
                  <p className="text-[11px] text-neutral-600">
                    Issued under Rule 29 of the Legal Metrology (Packaged Commodities) Rules, 2011
                  </p>
                </div>
              </div>

              {/* Report Header Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-[6px] bg-neutral-50 border border-neutral-200 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Docket Number</span>
                  <span className="font-mono font-bold text-neutral-900">{activeReport.reportNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Date of Audit</span>
                  <span className="font-medium text-neutral-900">{activeReport.generatedDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Jurisdiction District</span>
                  <span className="font-medium text-neutral-900">{activeReport.district}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Inspecting Officer</span>
                  <span className="font-medium text-neutral-900">{activeReport.generatedBy}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-neutral-500 uppercase block">Designation</span>
                  <span className="font-medium text-neutral-700">{activeReport.designation}</span>
                </div>
              </div>

              {/* Inspection Findings Summary */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-heading border-b border-neutral-100 pb-1.5">
                  1. Statutory Findings Overview
                </h4>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-neutral-50 rounded-[6px] border border-neutral-200">
                    <span className="text-xl font-bold text-neutral-900 font-heading block">
                      {activeReport.totalProductsScanned}
                    </span>
                    <span className="text-[11px] text-neutral-500">Specimens Audited</span>
                  </div>
                  <div className="p-3 bg-success-light/30 rounded-[6px] border border-success-border">
                    <span className="text-xl font-bold text-success font-heading block">
                      {activeReport.compliantCount}
                    </span>
                    <span className="text-[11px] text-success">Compliant Samples</span>
                  </div>
                  <div className="p-3 bg-violation-light/30 rounded-[6px] border border-violation-border">
                    <span className="text-xl font-bold text-violation font-heading block">
                      {activeReport.violationCount}
                    </span>
                    <span className="text-[11px] text-violation">Infractions Flagged</span>
                  </div>
                </div>
              </div>

              {/* Statutory Certification Attestation */}
              <div className="space-y-2 text-xs text-neutral-700 bg-neutral-50 p-3.5 rounded-[6px] border border-neutral-200 leading-relaxed">
                <h4 className="font-bold text-neutral-900 uppercase text-[11px]">
                  2. Official Statutory Attestation
                </h4>
                <p>
                  "I hereby attest that the packaging specimens itemized in this docket have been subjected to optical verification against Rule 6 (Mandatory Declarations), Rule 7 Table-I (Numeral & Letter Font Height Criteria), and Rule 13 (Metric Units of Measure) of the Legal Metrology (Packaged Commodities) Rules, 2011. Non-compliant units have been slated for notice under Section 36(1) of the Legal Metrology Act, 2009."
                </p>
              </div>

              {/* Officer Signature & Department Stamp Block */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="w-20 h-9 rounded border border-dashed border-neutral-300 flex items-center justify-center text-[10px] text-neutral-400 font-mono">
                    [E-STAMP]
                  </div>
                  <span className="text-[10px] text-neutral-500 block">DoCA Verification Stamp</span>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-serif italic text-sm text-neutral-800">
                    {activeReport.generatedBy}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    Digitally Certified with Token ID: <span className="font-mono">DOCA-INSP-{activeReport.id}</span>
                  </div>
                </div>
              </div>

              {/* Export and Print Action Toolbar */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-end gap-2.5 no-print">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  icon={<Printer size={15} />}
                >
                  Print Form
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleDownloadPdf(activeReport.id, activeReport.reportNumber)}
                  loading={isDownloading}
                  icon={<DownloadSimple size={15} />}
                >
                  Download Certified PDF (FORM LM-INSP-2011)
                </Button>
              </div>

            </div>
          ) : (
            <div className="bg-white p-12 rounded-[8px] border border-neutral-200 text-center text-neutral-500">
              Select a report from the left to view full statutory certificate
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
