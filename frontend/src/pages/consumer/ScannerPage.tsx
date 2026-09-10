import React, { useState, useRef } from "react";
import { 
  CloudArrowUp, 
  Camera, 
  CheckCircle, 
  XCircle, 
  Warning, 
  DownloadSimple, 
  ArrowClockwise, 
  ShieldWarning, 
  FileText, 
  Image as ImageIcon,
  ArrowRight,
  Sparkle,
  UploadSimple,
  Scan,
  Gavel,
  BookmarkSimple,
  Heartbeat,
  SlidersHorizontal,
  TextT
} from "@phosphor-icons/react";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { AnnotatedImage } from "../../components/scanner/AnnotatedImage";
import { ReportHeader } from "../../components/reports/ReportHeader";
import { ComplianceCard } from "../../components/reports/ComplianceCard";
import { ViolationCard } from "../../components/reports/ViolationCard";
import { MOCK_SCANS } from "../../data/mockProducts";
import { ProductScan, UserRole } from "../../types";
import { calculateComplianceScore } from "../../utils/complianceEngine";

interface ScannerPageProps {
  userRole?: UserRole;
  onOpenReportModal: () => void;
  onNavigateToHealth?: () => void;
  onSaveToast?: () => void;
}

export const ScannerPage: React.FC<ScannerPageProps> = ({
  userRole = "consumer",
  onOpenReportModal,
  onNavigateToHealth,
  onSaveToast,
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "samples">("upload");
  
  // Upload State
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);

  // Selected sample tab state
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [activeBoxId, setActiveBoxId] = useState<string | undefined>(undefined);
  const [activeFieldId, setActiveFieldId] = useState<string | undefined>(undefined);
  const [subView, setSubView] = useState<"declarations" | "font_table">("declarations");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Active scan resolution
  let currentScan: ProductScan | null = null;

  if (activeTab === "upload" && uploadedImageSrc) {
    const base = MOCK_SCANS[0];
    currentScan = {
      ...base,
      productName: uploadedFileName ? `Audited Commodity (${uploadedFileName.replace(/\.[^/.]+$/, "")})` : "Uploaded Commodity Specimen",
      imageUrl: uploadedImageSrc,
      scanCode: `MS-2026-UPLOAD-${Math.floor(1000 + Math.random() * 9000)}`,
      scannedAt: "Just now (Field Upload)",
    };
  } else if (activeTab === "samples" && selectedSampleId) {
    currentScan = MOCK_SCANS.find((s) => s.id === selectedSampleId) || null;
  }

  const complianceResult = currentScan 
    ? calculateComplianceScore(currentScan.declarations, currentScan.violations)
    : null;

  const handleFileChange = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImageSrc(result);
      setUploadedFileName(file.name);
      runAutomatedAudit();
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const runAutomatedAudit = () => {
    setIsAnalyzing(true);
    setAnalysisStep(1);
    setTimeout(() => setAnalysisStep(2), 350);
    setTimeout(() => setAnalysisStep(3), 700);
    setTimeout(() => {
      setIsAnalyzing(false);
      setActiveBoxId("box-5");
      setActiveFieldId("dec-5");
    }, 1050);
  };

  const handleSelectPreloadedSample = (scanId: string) => {
    setSelectedSampleId(scanId);
    if (scanId === "scan-001") {
      setActiveBoxId("box-5");
      setActiveFieldId("dec-5");
    } else if (scanId === "scan-002") {
      setActiveBoxId("tb-3");
      setActiveFieldId("t-4");
    } else {
      setActiveBoxId("cb-1");
      setActiveFieldId("c-1");
    }
  };

  const handleClearUpload = () => {
    setUploadedImageSrc(null);
    setUploadedFileName("");
    setActiveBoxId(undefined);
    setActiveFieldId(undefined);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 font-heading">
              Label Compliance Verification
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary-light text-primary border border-primary-border">
              {userRole === "officer" ? "ENFORCEMENT AUDIT ENGINE" : "CONSUMER VERIFICATION"}
            </span>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            {userRole === "officer" 
              ? "Statutory inspection workstation for detecting missing declarations, verifying Table-I numeral heights, and drafting Section 36(1) notices."
              : "Upload a packaging photo to instantly check if mandatory price, weight, date, and manufacturer details meet legal standards."}
          </p>
        </div>

        {currentScan && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenReportModal}
              icon={<DownloadSimple size={16} />}
            >
              Export Report (PDF)
            </Button>
            {onSaveToast && (
              <Button
                variant="primary"
                size="sm"
                onClick={onSaveToast}
                icon={<BookmarkSimple size={16} />}
              >
                Save to Repository
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Mode Switcher: Upload Image vs Benchmark Samples */}
      <div className="flex border-b border-neutral-200 text-xs font-medium">
        <button
          onClick={() => setActiveTab("upload")}
          className={`pb-3 px-4 transition-all relative font-heading ${
            activeTab === "upload"
              ? "text-primary font-bold border-b-2 border-primary"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          Upload Packaging Specimen
        </button>
        <button
          onClick={() => {
            setActiveTab("samples");
            if (!selectedSampleId) setSelectedSampleId("scan-001");
          }}
          className={`pb-3 px-4 transition-all relative font-heading ${
            activeTab === "samples"
              ? "text-primary font-bold border-b-2 border-primary"
              : "text-neutral-500 hover:text-neutral-800"
          }`}
        >
          Benchmark Test Samples
        </button>
      </div>

      {/* TAB 1: UPLOAD AREA */}
      {activeTab === "upload" && (
        <div className="bg-white border border-neutral-200 rounded-[8px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 font-heading">
                Upload Product Label Photograph
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Ensure packaging declarations, MRP, and net quantity are clearly readable in the photograph.
              </p>
            </div>
            {uploadedImageSrc && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearUpload}
                icon={<ArrowClockwise size={15} />}
              >
                Upload Different Image
              </Button>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-[8px] p-8 text-center transition-all ${
              isDragOver
                ? "border-primary bg-primary-light/50"
                : "border-neutral-300 bg-neutral-50/50 hover:border-neutral-400"
            }`}
          >
            <CloudArrowUp size={40} className="text-primary mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-neutral-900 font-heading">
              Drag and drop product packaging image here
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Supports JPEG, PNG, WEBP files up to 20 MB
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                icon={<UploadSimple size={16} />}
              >
                Browse Image File
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => cameraInputRef.current?.click()}
                icon={<Camera size={16} />}
              >
                Use Camera
              </Button>
            </div>
          </div>

          {/* Analysis Progress Overlay */}
          {isAnalyzing && (
            <div className="p-4 bg-primary-light/40 border border-primary-border rounded-[8px] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-primary">
                <span>Running Optical Rule Engine Verification...</span>
                <span>{analysisStep === 1 ? "30%" : analysisStep === 2 ? "70%" : "95%"}</span>
              </div>
              <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: analysisStep === 1 ? "30%" : analysisStep === 2 ? "70%" : "95%" }}
                />
              </div>
              <p className="text-[11px] text-neutral-600">
                {analysisStep === 1 && "Step 1/3: Segmenting text lines & detecting Principal Display Panel (PDP)..."}
                {analysisStep === 2 && "Step 2/3: Extracting Rule 6 mandatory declarations (MRP, USP, Net Qty, PIN)..."}
                {analysisStep === 3 && "Step 3/3: Calibrating font height against Rule 7 Table-I thresholds..."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BENCHMARK TEST SAMPLES */}
      {activeTab === "samples" && (
        <div className="bg-white border border-neutral-200 rounded-[8px] p-5 space-y-3">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 font-heading">
              Select Pre-Configured Government Benchmark Test Specimen
            </h2>
            <p className="text-xs text-neutral-500">
              Quickly test the compliance engine using verified commodity specimens with ground-truth statutory annotations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MOCK_SCANS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectPreloadedSample(sample.id)}
                className={`p-3.5 rounded-[6px] border text-left transition-all space-y-2 ${
                  selectedSampleId === sample.id
                    ? "border-primary bg-primary-light/30 ring-2 ring-primary/20"
                    : "border-neutral-200 hover:border-neutral-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
                    {sample.category}
                  </span>
                  {sample.overallStatus === "compliant" ? (
                    <Badge variant="compliant" size="sm">Compliant</Badge>
                  ) : (
                    <Badge variant="violation" size="sm">{sample.violationCount} Violations</Badge>
                  )}
                </div>
                <div className="font-bold text-xs text-neutral-900 font-heading line-clamp-1">
                  {sample.productName}
                </div>
                <div className="text-[11px] text-neutral-500">
                  {sample.brand} • {sample.netQuantity}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STRUCTURED COMPLIANCE RESULTS (Organized & Humanized) */}
      {currentScan && !isAnalyzing && (
        <div className="space-y-6">
          
          {/* 1. Executive Summary Header */}
          <ReportHeader
            productName={currentScan.productName}
            brand={currentScan.brand}
            category={currentScan.category}
            scanCode={currentScan.scanCode}
            scannedAt={currentScan.scannedAt}
            location={currentScan.location}
            overallStatus={currentScan.overallStatus}
            complianceScore={complianceResult?.score}
            barcode={currentScan.barcode}
            netQuantity={currentScan.netQuantity}
            declaredMrp={currentScan.mrp}
            pdpAreaCm2={currentScan.pdpAreaCm2}
          />

          {/* 2. Main Two-Column Interactive Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Organized Declarations & Violations */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Sub-view switcher: Declarations vs Table-I Audit */}
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setSubView("declarations")}
                    className={`px-3 py-1.5 rounded-[6px] font-heading font-semibold transition-colors ${
                      subView === "declarations"
                        ? "bg-primary text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    Rule 6 Declarations ({currentScan.declarations.length})
                  </button>
                  <button
                    onClick={() => setSubView("font_table")}
                    className={`px-3 py-1.5 rounded-[6px] font-heading font-semibold transition-colors flex items-center gap-1 ${
                      subView === "font_table"
                        ? "bg-primary text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    <TextT size={14} />
                    <span>Rule 7 Table-I Font Audit</span>
                  </button>
                </div>

                <span className="text-[11px] text-neutral-500">
                  Click any item to highlight on packaging
                </span>
              </div>

              {/* View 1: Rule 6 Mandatory Declarations List */}
              {subView === "declarations" && (
                <div className="space-y-2.5">
                  {currentScan.declarations.map((declaration) => (
                    <ComplianceCard
                      key={declaration.id}
                      declaration={declaration}
                      isSelected={activeFieldId === declaration.id}
                      onSelect={() => {
                        setActiveFieldId(declaration.id);
                        if (declaration.boxId) setActiveBoxId(declaration.boxId);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* View 2: Table-I Millimeter Font Height Audit */}
              {subView === "font_table" && (
                <div className="bg-white p-4 rounded-[8px] border border-neutral-200 space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-neutral-900 font-heading">
                      Rule 7 Table-I Font Cap-Height Verification
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Minimum height of numerals and letters based on Principal Display Panel (PDP) area of {currentScan.pdpAreaCm2} cm².
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                          <th className="py-2 px-2.5">Field</th>
                          <th className="py-2 px-2.5">Required Min</th>
                          <th className="py-2 px-2.5">Measured</th>
                          <th className="py-2 px-2.5 text-right">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-150">
                        {currentScan.declarations
                          .filter((d) => d.measuredFontHeightMm && d.requiredFontHeightMm)
                          .map((d) => {
                            const isPassing = (d.measuredFontHeightMm || 0) >= (d.requiredFontHeightMm || 0);
                            return (
                              <tr key={d.id} className="hover:bg-neutral-50/60">
                                <td className="py-2 px-2.5 font-medium text-neutral-900">{d.fieldName}</td>
                                <td className="py-2 px-2.5 font-mono text-neutral-600">{d.requiredFontHeightMm} mm</td>
                                <td className="py-2 px-2.5 font-mono font-bold text-neutral-900">{d.measuredFontHeightMm} mm</td>
                                <td className="py-2 px-2.5 text-right">
                                  {isPassing ? (
                                    <span className="text-success font-bold text-[11px]">Pass</span>
                                  ) : (
                                    <span className="text-violation font-bold text-[11px]">Deficient (-{(d.requiredFontHeightMm! - d.measuredFontHeightMm!).toFixed(1)}mm)</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actionable Statutory Infractions Section (If any) */}
              {currentScan.violations.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-violation-border/40 pb-2">
                    <h3 className="text-xs font-bold text-violation uppercase tracking-wider font-heading flex items-center gap-1.5">
                      <ShieldWarning size={16} weight="bold" />
                      <span>Statutory Infractions Requiring Action ({currentScan.violations.length})</span>
                    </h3>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Compoundable under Section 48
                    </span>
                  </div>

                  <div className="space-y-3">
                    {currentScan.violations.map((violation) => (
                      <ViolationCard
                        key={violation.id}
                        violation={violation}
                        showAction={userRole === "officer"}
                        onFileNotice={() => alert(`Drafting Section 36(1) show-cause notice for: ${violation.title}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Interactive Packaging Specimen Image */}
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-20 space-y-4">
                <div className="bg-white p-4 rounded-[8px] border border-neutral-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-neutral-900 font-heading uppercase tracking-wider flex items-center gap-1.5">
                      <Scan size={16} className="text-primary" />
                      <span>Packaging Visual Segmentation</span>
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Scale: 4.8 px/mm
                    </span>
                  </div>

                  <AnnotatedImage
                    imageUrl={currentScan.imageUrl}
                    boxes={currentScan.boundingBoxes}
                    activeBoxId={activeBoxId}
                    pdpAreaCm2={currentScan.pdpAreaCm2}
                    title={currentScan.productName}
                    onBoxClick={(boxId, fieldId) => {
                      setActiveBoxId(boxId);
                      setActiveFieldId(fieldId);
                    }}
                  />

                  {/* Visual Legend */}
                  <div className="flex items-center justify-around pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-success/30 border border-success" />
                      <span>Compliant</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-violation/30 border border-violation" />
                      <span>Infraction</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-primary/30 border border-primary" />
                      <span>Focused Box</span>
                    </div>
                  </div>
                </div>

                {/* Consumer Cross-Link: Nutritional Health Check */}
                {userRole === "consumer" && onNavigateToHealth && (
                  <div className="p-4 rounded-[8px] bg-primary-light/40 border border-primary-border space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs font-heading">
                      <Heartbeat size={18} weight="fill" />
                      <span>Looking for Health & Nutrition Guidance?</span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Scan both the front and back nutritional panel to audit sugar, calories, fat, and sodium against ICMR limits.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onNavigateToHealth}
                      className="w-full"
                      icon={<ArrowRight size={14} />}
                      iconPosition="right"
                    >
                      Run Consumer Health Audit
                    </Button>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>
      )}

      {/* Clean initial empty state when on upload tab with no image */}
      {activeTab === "upload" && !uploadedImageSrc && !isAnalyzing && (
        <div className="bg-white p-8 rounded-[8px] border border-neutral-200 text-center space-y-3 text-neutral-600">
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            No packaging label uploaded yet. Drag and drop a product label image into the box above, click Browse Image File, or use your camera to verify declarations against Legal Metrology Rules, 2011.
          </p>
          <div className="pt-2">
            <span className="text-[11px] text-neutral-400">
              Or switch to <strong className="text-primary cursor-pointer" onClick={() => { setActiveTab("samples"); setSelectedSampleId("scan-001"); }}>Benchmark Test Samples</strong> to see how compliance auditing works.
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
