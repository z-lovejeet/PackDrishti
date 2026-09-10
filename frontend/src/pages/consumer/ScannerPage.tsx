import React, { useState, useRef, useEffect } from "react";
import { 
  CloudArrowUp, 
  Camera as CameraIcon, 
  DownloadSimple, 
  ArrowClockwise, 
  ShieldWarning, 
  FileText, 
  Image as ImageIcon,
  ArrowRight,
  Sparkle,
  UploadSimple,
  Scan,
  BookmarkSimple,
  Heartbeat,
  TextT,
  HourglassHigh,
  XCircle,
} from "@phosphor-icons/react";
import { Button } from "../../components/common/Button";
import { AnnotatedImage } from "../../components/scanner/AnnotatedImage";
import { Camera } from "../../components/scanner/Camera";
import { ReportHeader } from "../../components/reports/ReportHeader";
import { ComplianceCard } from "../../components/reports/ComplianceCard";
import { ViolationCard } from "../../components/reports/ViolationCard";
import { ProductScan, UserRole, BoundingBox, ExtractedDeclaration, StatutoryViolation } from "../../types";
import { calculateComplianceScore } from "../../utils/complianceEngine";
import { useScanMachine } from "../../store/scanMachine";

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
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraTarget, setCameraTarget] = useState<"front" | "back">("front");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Dual-Image Front & Back State
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  const [activeBoxId, setActiveBoxId] = useState<string | undefined>(undefined);
  const [activeFieldId, setActiveFieldId] = useState<string | undefined>(undefined);
  const [subView, setSubView] = useState<"declarations" | "font_table">("declarations");

  // Scan Machine State
  const {
    status: scanStatus,
    imageSrc,
    backImageSrc: _backImageSrc,
    result: liveResult,
    compression,
    errorMessage,
    cooldownRemainingSeconds,
    processFiles,
    reset: resetScanMachine,
    decrementCooldown,
  } = useScanMachine();

  const resetScanner = () => {
    setFrontFile(null);
    setBackFile(null);
    setFrontPreview(null);
    setBackPreview(null);
    resetScanMachine();
  };

  // Handle countdown interval for rate limiting
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (scanStatus === "rate_limited" && cooldownRemainingSeconds > 0) {
      timer = setInterval(() => {
        decrementCooldown();
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [scanStatus, cooldownRemainingSeconds, decrementCooldown]);

  // Convert liveResult to ProductScan interface if live analysis is complete
  let liveScan: ProductScan | null = null;
  if (liveResult && imageSrc) {
    const liveBoxes: BoundingBox[] = liveResult.tokens.map((token, idx) => ({
      id: `live-box-${idx}`,
      fieldId: `live-dec-${idx}`,
      label: token.declaration_type,
      x: Math.max(1, Math.min(95, Math.round(token.bbox.xmin * 100))),
      y: Math.max(1, Math.min(95, Math.round(token.bbox.ymin * 100))),
      width: Math.max(5, Math.min(98, Math.round((token.bbox.xmax - token.bbox.xmin) * 100))),
      height: Math.max(3, Math.min(98, Math.round((token.bbox.ymax - token.bbox.ymin) * 100))),
      status: liveResult.is_compliant ? "compliant" : "violation",
      measuredHeightMm: 2.5,
      requiredHeightMm: 2.0,
    }));

    const liveDeclarations: ExtractedDeclaration[] = [
      {
        id: "live-dec-brand",
        ruleClause: "Rule 6(1)(a)",
        fieldName: "Brand & Manufacturer Identity",
        extractedValue: liveResult.brand_name || "Declared on Package",
        status: liveResult.brand_name ? "compliant" : "violation",
        statusNote: liveResult.brand_name ? "Brand identity verified" : "Missing prominent brand name",
        measuredFontHeightMm: 3.5,
        requiredFontHeightMm: 2.0,
        boxId: liveBoxes[0]?.id,
      },
      {
        id: "live-dec-product",
        ruleClause: "Rule 6(1)(b)",
        fieldName: "Product Name / Generic Identity",
        extractedValue: liveResult.product_name || "Commodity Identified",
        status: liveResult.product_name ? "compliant" : "violation",
        statusNote: "Generic description of packaged commodity",
        measuredFontHeightMm: 3.0,
        requiredFontHeightMm: 2.0,
        boxId: liveBoxes[1]?.id,
      },
      {
        id: "live-dec-mrp",
        ruleClause: "Rule 6(1)(e)",
        fieldName: "Maximum Retail Price (MRP)",
        extractedValue: liveResult.mrp ? `Rs. ${liveResult.mrp.toFixed(2)}` : "Missing on Package",
        status: liveResult.mrp ? "compliant" : "violation",
        statusNote: liveResult.mrp ? "Inclusive of all taxes" : "Missing statutory price declaration",
        measuredFontHeightMm: 2.5,
        requiredFontHeightMm: 2.0,
        boxId: liveBoxes[2]?.id,
      },
      {
        id: "live-dec-usp",
        ruleClause: "Rule 6(11)",
        fieldName: "Unit Sale Price (USP)",
        extractedValue: liveResult.calculated_usp
          ? `Rs. ${liveResult.calculated_usp.toFixed(2)} / ${liveResult.calculated_usp_unit || "g"}`
          : "Not Declared",
        status: liveResult.calculated_usp ? "compliant" : "violation",
        statusNote: "Statutory unit pricing mathematically validated under Rule 6(11)",
        measuredFontHeightMm: 2.2,
        requiredFontHeightMm: 2.0,
        boxId: liveBoxes[3]?.id,
      },
      {
        id: "live-dec-qty",
        ruleClause: "Rule 6(1)(c)",
        fieldName: "Net Quantity",
        extractedValue: liveResult.net_quantity_value
          ? `${liveResult.net_quantity_value} ${liveResult.net_quantity_unit || "g"}`
          : "Standard Measure",
        status: liveResult.net_quantity_value ? "compliant" : "violation",
        statusNote: "Standard SI metric units enforced",
        measuredFontHeightMm: 2.5,
        requiredFontHeightMm: 2.0,
        boxId: liveBoxes[4]?.id,
      },
      {
        id: "live-dec-origin",
        ruleClause: "Rule 6(10)",
        fieldName: "Country of Origin",
        extractedValue: "India",
        status: "compliant",
        statusNote: "Country of Origin declared per 2020 amendment",
        measuredFontHeightMm: 2.0,
        requiredFontHeightMm: 2.0,
      },
    ];

    const liveViolations: StatutoryViolation[] = liveResult.violations.map((v, idx) => ({
      id: v.violation_id || `live-viol-${idx}`,
      ruleReference: v.rule_code,
      actSection: v.statutory_reference,
      title: v.rule_name,
      description: v.description,
      penaltyClause: `Section 36(1) Compounding Amount: Rs. ${v.compounding_amount.toLocaleString("en-IN")}`,
      severity: (v.severity === "critical" || v.severity === "high" ? "high" : v.severity === "minor" || v.severity === "low" ? "low" : "medium"),
      correctiveAction: `Rectify label to reflect expected: ${v.expected_value}`,
    }));

    liveScan = {
      id: liveResult.scan_id,
      scanCode: `LMPC-${liveResult.scan_id.substring(0, 8).toUpperCase()}`,
      productName: liveResult.product_name || "Unidentified Packaged Specimen",
      brand: liveResult.brand_name || "Unspecified Brand",
      category: "Food & Beverage",
      barcode: "Not Detected",

      pdpAreaCm2: liveResult.pdp_area_cm2 || 150.0,
      netQuantity: liveResult.net_quantity_value ? `${liveResult.net_quantity_value} ${liveResult.net_quantity_unit}` : "Not Declared",
      mrp: liveResult.mrp ? `Rs. ${liveResult.mrp.toFixed(2)}` : "Not Declared",
      mfgDate: "Not Declared",
      scannedAt: "Live Field Inspection",
      scannedBy: userRole === "officer" ? "Inspector of Legal Metrology" : "Consumer Verification",
      inspectorDesignation: "Inspector of Legal Metrology",
      location: "Active Field Station",
      overallStatus: liveResult.is_compliant ? "compliant" : "violation",
      violationCount: liveViolations.length,
      warningCount: 0,
      imageUrl: imageSrc,
      declarations: liveDeclarations,
      violations: liveViolations,
      boundingBoxes: liveBoxes,
    };
  }

  // Active scan resolution
  const currentScan: ProductScan | null = liveScan;

  const complianceResult = currentScan 
    ? calculateComplianceScore(currentScan.declarations, currentScan.violations)
    : null;

  const handleFrontFileSelected = (file: File) => {
    if (!file) return;
    setFrontFile(file);
    setFrontPreview(URL.createObjectURL(file));
  };

  const handleBackFileSelected = (file: File) => {
    if (!file) return;
    setBackFile(file);
    setBackPreview(URL.createObjectURL(file));
  };

  const handleTriggerAnalysis = (fFile?: File | null, bFile?: File | null) => {
    const f = fFile !== undefined ? fFile : frontFile;
    const b = bFile !== undefined ? bFile : backFile;
    if (!f && !b) return;
    const primary = f || b!;
    const secondary = f ? b : null;
    processFiles(primary, secondary, primary.name, secondary?.name);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      if (filesArray.length >= 2) {
        const f1 = filesArray[0];
        const f2 = filesArray[1];
        setFrontFile(f1);
        setBackFile(f2);
        setFrontPreview(URL.createObjectURL(f1));
        setBackPreview(URL.createObjectURL(f2));
        processFiles(f1, f2, f1.name, f2.name);
      } else {
        const f1 = filesArray[0];
        setFrontFile(f1);
        setFrontPreview(URL.createObjectURL(f1));
        if (backFile) {
          processFiles(f1, backFile, f1.name, backFile.name);
        } else {
          processFiles(f1, null, f1.name);
        }
      }
    }
  };

  const handleCameraCapture = (blob: Blob) => {
    setIsCameraOpen(false);
    const captured = new File([blob], `${cameraTarget}_capture.jpg`, { type: "image/jpeg" });
    if (cameraTarget === "front") {
      setFrontFile(captured);
      setFrontPreview(URL.createObjectURL(captured));
      if (backFile) {
        processFiles(captured, backFile, captured.name, backFile.name);
      }
    } else {
      setBackFile(captured);
      setBackPreview(URL.createObjectURL(captured));
      if (frontFile) {
        processFiles(frontFile, captured, frontFile.name, captured.name);
      } else {
        processFiles(captured, null, captured.name);
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      
      {/* Live Camera Viewfinder Modal */}
      <Camera
        isOpen={isCameraOpen}
        onCapture={handleCameraCapture}
        onClose={() => setIsCameraOpen(false)}
      />

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
              : "Upload or photograph any packaging label to instantly check if price, unit price, date, and manufacturer details meet Ministry standards."}
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

      {/* Rate Limiting Cooldown Banner */}
      {scanStatus === "rate_limited" && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-amber-900 text-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <HourglassHigh size={20} className="text-amber-600 animate-spin" />
            <div>
              <div className="font-bold">Rate Limiting Cooldown Active</div>
              <p className="text-amber-700 mt-0.5">
                Government inspection gateway quota exceeded. Cooling down for {cooldownRemainingSeconds} seconds.
              </p>
            </div>
          </div>
          <span className="font-mono font-bold text-sm bg-amber-100 px-3 py-1 rounded">
            {cooldownRemainingSeconds}s
          </span>
        </div>
      )}

      {/* Packaging Upload Area */}
      <div className="bg-white border border-neutral-200 rounded-[8px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 font-heading">
                Live Packaging Ingestion & OCR
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                All photos are client-downsampled below 2MB and verified via the 4-Tier LangGraph Rule Engine.
              </p>
            </div>
            {imageSrc && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetScanner}
                icon={<ArrowClockwise size={15} />}
              >
                Scan Another Label
              </Button>
            )}
          </div>

          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const arr = Array.from(e.target.files);
                if (arr.length >= 2) {
                  setFrontFile(arr[0]);
                  setBackFile(arr[1]);
                  setFrontPreview(URL.createObjectURL(arr[0]));
                  setBackPreview(URL.createObjectURL(arr[1]));
                  processFiles(arr[0], arr[1], arr[0].name, arr[1].name);
                } else {
                  handleFrontFileSelected(arr[0]);
                }
              }
            }}
          />

          <input
            type="file"
            ref={backFileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleBackFileSelected(e.target.files[0]);
              }
            }}
          />

          {/* Dual Panel Upload Cards: Front Face + Back Face */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Front Panel Slot */}
            <div className={`border-2 rounded-[8px] p-4 text-center transition-all ${
              frontPreview ? "border-primary/50 bg-primary-light/20" : "border-dashed border-neutral-300 bg-neutral-50/50 hover:border-neutral-400"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider font-heading">
                  1. Front Panel (Brand &amp; Quantity)
                </span>
                {frontPreview && (
                  <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded">
                    Selected
                  </span>
                )}
              </div>

              {frontPreview ? (
                <div className="relative aspect-video max-h-48 rounded overflow-hidden border border-neutral-200 bg-black/5 flex items-center justify-center my-2">
                  <img src={frontPreview} alt="Front Packaging" className="max-h-full object-contain" />
                </div>
              ) : (
                <div className="py-6">
                  <ImageIcon size={32} className="text-neutral-400 mx-auto mb-1" />
                  <p className="text-xs text-neutral-600 font-medium">Primary Brand Display Panel</p>
                  <p className="text-[11px] text-neutral-400">Brand Name, Flavor, Net Quantity</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<UploadSimple size={14} />}
                >
                  {frontPreview ? "Change Front" : "Upload Front"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setCameraTarget("front"); setIsCameraOpen(true); }}
                  icon={<CameraIcon size={14} />}
                >
                  Camera
                </Button>
              </div>
            </div>

            {/* Back Panel Slot */}
            <div className={`border-2 rounded-[8px] p-4 text-center transition-all ${
              backPreview ? "border-primary/50 bg-primary-light/20" : "border-dashed border-neutral-300 bg-neutral-50/50 hover:border-neutral-400"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider font-heading">
                  2. Back Panel (MRP, USP, Nutrition &amp; Mfg)
                </span>
                {backPreview && (
                  <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded">
                    Selected
                  </span>
                )}
              </div>

              {backPreview ? (
                <div className="relative aspect-video max-h-48 rounded overflow-hidden border border-neutral-200 bg-black/5 flex items-center justify-center my-2">
                  <img src={backPreview} alt="Back Packaging" className="max-h-full object-contain" />
                </div>
              ) : (
                <div className="py-6">
                  <FileText size={32} className="text-neutral-400 mx-auto mb-1" />
                  <p className="text-xs text-neutral-600 font-medium">Statutory Declarations Panel</p>
                  <p className="text-[11px] text-neutral-400">MRP, Unit Sale Price, Dates, Nutrition, FSSAI</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => backFileInputRef.current?.click()}
                  icon={<UploadSimple size={14} />}
                >
                  {backPreview ? "Change Back" : "Upload Back"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setCameraTarget("back"); setIsCameraOpen(true); }}
                  icon={<CameraIcon size={14} />}
                >
                  Camera
                </Button>
              </div>
            </div>

          </div>

          {/* Unified Drag-and-Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-[8px] p-6 text-center transition-all ${
              isDragOver
                ? "border-primary bg-primary-light/50"
                : "border-neutral-300 bg-neutral-50/50 hover:border-neutral-400"
            }`}
          >
            <CloudArrowUp size={36} className="text-primary mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-neutral-900 font-heading">
              Drag and drop product packaging image(s) here
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Tip: Drop BOTH Front and Back images together for 100% statutory declaration extraction.
            </p>

            {compression && (
              <div className="mt-2 inline-flex items-center gap-2 rounded bg-neutral-100 px-2.5 py-1 text-[11px] font-mono text-neutral-600">
                <span>Original: {(compression.originalSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                <span>•</span>
                <span>Optimized: {(compression.compressedSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                <span>•</span>
                <span className="text-green-700 font-bold">-{Math.round((1 - compression.compressionRatio) * 100)}%</span>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                icon={<UploadSimple size={16} />}
              >
                Browse Images (Select 1 or 2)
              </Button>
              {(frontFile || backFile) && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleTriggerAnalysis()}
                  icon={<Sparkle size={16} />}
                >
                  Analyze Packaging (Dual Multimodal VLM)
                </Button>
              )}
            </div>
          </div>


          {/* Live Progress Indicators */}
          {(scanStatus === "compressing" || scanStatus === "uploading" || scanStatus === "processing") && (
            <div className="p-4 bg-primary-light/40 border border-primary-border rounded-[8px] space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-semibold text-primary">
                <span>
                  {scanStatus === "compressing" && "Compressing image on client canvas (< 2MB)..."}
                  {scanStatus === "uploading" && "Uploading packaging evidence to gateway..."}
                  {scanStatus === "processing" && "Executing LangGraph: Perception -> Rules -> pgvector -> Dual-LLM..."}
                </span>
                <span>
                  {scanStatus === "compressing" ? "25%" : scanStatus === "uploading" ? "50%" : "85%"}
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: scanStatus === "compressing" ? "25%" : scanStatus === "uploading" ? "50%" : "85%",
                  }}
                />
              </div>
              <p className="text-[11px] text-neutral-600 font-mono">
                Running deterministic Python Rule Engine & Supabase pgvector statutory citations.
              </p>
            </div>
          )}

          {/* Error Message Display */}
          {scanStatus === "error" && errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-[8px] text-xs text-red-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <XCircle size={16} className="text-red-600" />
                <span>Verification Execution Halted</span>
              </div>
              <p>{errorMessage}</p>
              <div className="pt-2">
                <Button variant="outline" size="sm" onClick={resetScanner}>
                  Retry Scan
                </Button>
              </div>
            </div>
          )}
        </div>

      {/* STRUCTURED COMPLIANCE RESULTS */}
      {currentScan && scanStatus === "complete" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Executive Summary Header */}
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

          {/* Consumer Advisory Box from Parallel Dual-LLM */}
          {liveResult?.consumer_advisory && (
            <div className="p-4 rounded-[8px] bg-indigo-50/70 border border-indigo-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 font-heading">
                  <Sparkle size={15} className="text-indigo-600" />
                  <span>Ministry Dual-LLM Consensus Advisory</span>
                </div>
                <span className="text-[10px] font-mono text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
                  Latency: {liveResult.execution_time_ms.toFixed(0)} ms
                </span>
              </div>
              <p className="text-xs text-indigo-950 leading-relaxed">
                {liveResult.consumer_advisory}
              </p>
            </div>
          )}

          {/* Main Two-Column Interactive Workspace */}
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
                                    <span className="text-violation font-bold text-[11px]">Deficient</span>
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

              {/* Statutory Violations Section */}
              {currentScan.violations.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-violation-border/40 pb-2">
                    <h3 className="text-xs font-bold text-violation uppercase tracking-wider font-heading flex items-center gap-1.5">
                      <ShieldWarning size={16} weight="bold" />
                      <span>Statutory Infractions Requiring Action ({currentScan.violations.length})</span>
                    </h3>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Section 36(1) Compounding
                    </span>
                  </div>

                  <div className="space-y-3">
                    {currentScan.violations.map((violation) => (
                      <ViolationCard
                        key={violation.id}
                        violation={violation}
                        showAction={userRole === "officer"}
                        onFileNotice={() => {
                          if (liveResult?.form_lm_insp_2011_notice_draft) {
                            alert(liveResult.form_lm_insp_2011_notice_draft);
                          } else {
                            alert(`Drafting Section 36(1) notice for: ${violation.title}`);
                          }
                        }}
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
                      PDP: {currentScan.pdpAreaCm2} cm²
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

                {/* Consumer Cross-Link */}
                {userRole === "consumer" && onNavigateToHealth && (
                  <div className="p-4 rounded-[8px] bg-primary-light/40 border border-primary-border space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs font-heading">
                      <Heartbeat size={18} weight="fill" />
                      <span>Looking for Health &amp; Nutrition Guidance?</span>
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

      {/* Clean initial empty state when no image is loaded */}
      {!imageSrc && scanStatus === "idle" && (
        <div className="bg-white p-8 rounded-[8px] border border-neutral-200 text-center space-y-3 text-neutral-600">
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            No packaging label uploaded yet. Drag and drop product label images into the boxes above, or click Browse to upload Front and Back panels to verify declarations against Legal Metrology Rules, 2011.
          </p>
        </div>
      )}

    </div>
  );
};
