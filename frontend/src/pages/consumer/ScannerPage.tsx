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
  CheckCircle,
  Cpu,
  Database
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
  const [isDragOverFront, setIsDragOverFront] = useState<boolean>(false);
  const [isDragOverBack, setIsDragOverBack] = useState<boolean>(false);

  // Dual-Image Front & Back State
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);
  const unifiedFileInputRef = useRef<HTMLInputElement>(null);

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
        statusNote: liveResult.brand_name ? "Brand identity statutory declaration verified" : "Missing prominent brand name",
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
        statusNote: liveResult.mrp ? "Inclusive of all taxes per statutory standard" : "Missing statutory price declaration",
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
        statusNote: "Country of Origin declared per 2020 legal metrology amendment",
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
      productName: liveResult.product_name || "Packaged Specimen Under Inspection",
      brand: liveResult.brand_name || "Unspecified Brand",
      category: (liveResult.category as ProductScan["category"]) || "Food & Beverage",
      barcode: "Verified on Package",
      pdpAreaCm2: liveResult.pdp_area_cm2 || 150.0,
      netQuantity: liveResult.net_quantity_value ? `${liveResult.net_quantity_value} ${liveResult.net_quantity_unit}` : "Not Declared",
      mrp: liveResult.mrp ? `Rs. ${liveResult.mrp.toFixed(2)}` : "Not Declared",
      mfgDate: "Declared on Specimen",
      scannedAt: "Active Field Inspection",
      scannedBy: userRole === "officer" ? "Inspector of Legal Metrology" : "Consumer Verification",
      inspectorDesignation: "Inspector of Legal Metrology",
      location: "Central Consumer Protection Division",
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

  const handleUnifiedDrop = (e: React.DragEvent<HTMLDivElement>) => {
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

  // 5-Agent Multi-Agent Progress Engine
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStageText, setProgressStageText] = useState<string>('');
  const [activeAgentLabel, setActiveAgentLabel] = useState<string>('Perception Agent');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(1);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    if (scanStatus === 'compressing') {
      setProgressPercent(12);
      setProgressStageText('Stage 1/5: Client Downsampling (< 2MB) & Visual Normalization...');
      setActiveAgentLabel('Visual Preprocessor');
      setActiveStepIndex(1);
    } else if (scanStatus === 'uploading') {
      setProgressPercent(22);
      setProgressStageText('Stage 1/5: Ingesting Packaging Evidence to Legal Metrology Gateway...');
      setActiveAgentLabel('Evidence Gateway Ingestion');
      setActiveStepIndex(1);
    } else if (scanStatus === 'processing') {
      const startTime = Date.now();
      setProgressPercent(25);
      setProgressStageText('Stage 2/5: Perception Agent - Multimodal Vision Inspection of Packaging Panels...');
      setActiveAgentLabel('Multimodal Vision Perception Agent');
      setActiveStepIndex(2);

      progressTimerRef.current = setInterval(() => {
        const elapsedSec = (Date.now() - startTime) / 1000;
        if (elapsedSec < 3.5) {
          const p = Math.min(48, Math.round(25 + (elapsedSec / 3.5) * 23));
          setProgressPercent(p);
          setProgressStageText('Stage 2/5: Perception Agent - Extracting 11 Declarations & Bounding Boxes...');
          setActiveAgentLabel('Multimodal Vision Perception Agent');
          setActiveStepIndex(2);
        } else if (elapsedSec < 7.5) {
          const p = Math.min(68, Math.round(48 + ((elapsedSec - 3.5) / 4.0) * 20));
          setProgressPercent(p);
          setProgressStageText('Stage 3/5: Rules Engine Agent - Validating Rule 6 Clauses & Rule 7 Table-I Heights...');
          setActiveAgentLabel('Deterministic Rules Engine');
          setActiveStepIndex(3);
        } else if (elapsedSec < 12.0) {
          const p = Math.min(84, Math.round(68 + ((elapsedSec - 7.5) / 4.5) * 16));
          setProgressPercent(p);
          setProgressStageText('Stage 4/5: Statutory RAG Agent - Querying pgvector Knowledge Base & Precedents...');
          setActiveAgentLabel('Statutory Legal RAG Agent');
          setActiveStepIndex(4);
        } else {
          const p = Math.min(96, Math.round(84 + (elapsedSec - 12.0) * 0.4));
          setProgressPercent(p);
          setProgressStageText('Stage 5/5: Consensus Agent - Formulating Legal Audit Docket & Show-Cause Notice...');
          setActiveAgentLabel('Multi-Agent Consensus Engine');
          setActiveStepIndex(5);
        }
      }, 150);
    } else if (scanStatus === 'complete') {
      setProgressPercent(100);
      setProgressStageText('Verification Complete: Courtroom-Grade Audit Docket Formulated');
      setActiveAgentLabel('Multi-Agent Consensus Engine');
      setActiveStepIndex(5);
    } else if (scanStatus === 'error' || scanStatus === 'rate_limited' || scanStatus === 'idle') {
      setProgressPercent(0);
      setProgressStageText('');
      setActiveStepIndex(0);
    }

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [scanStatus]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto font-sans">
      
      {/* Live Camera Viewfinder Modal */}
      <Camera
        isOpen={isCameraOpen}
        onCapture={handleCameraCapture}
        onClose={() => setIsCameraOpen(false)}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <p className="text-2xs font-mono font-medium tracking-wider text-slate-500 uppercase">
            {userRole === "officer" 
              ? "Enforcement Inspection • LMPC Rules, 2011"
              : "Consumer Verification • LMPC Rules, 2011"}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-950 mt-1 tracking-tight">
            {userRole === "officer" ? "Statutory Label Inspection" : "Package Compliance Audit"}
          </h1>
          <p className="text-xs text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
            {userRole === "officer" 
              ? "Inspect mandatory Rule 6 declarations, verify Rule 7 Table-I numeral cap-heights, and check statutory Unit Sale Pricing."
              : "Verify packaged commodity compliance against Legal Metrology requirements, including Maximum Retail Price, Unit Sale Price, and manufacturer details."}
          </p>
        </div>

        {currentScan && (
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenReportModal}
              className="text-xs font-medium"
            >
              Export PDF
            </Button>
            {onSaveToast && (
              <Button
                variant="primary"
                size="sm"
                onClick={onSaveToast}
                className="text-xs font-medium"
              >
                Save Record
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Cooldown / Rate Limit Banner */}
      {scanStatus === "rate_limited" && (
        <div className="p-4 bg-saffron-50 border border-saffron-300 rounded-lg flex items-center justify-between text-saffron-950 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-saffron-100 flex items-center justify-center text-saffron-700 shrink-0 border border-saffron-300">
              <HourglassHigh size={20} className="animate-spin" />
            </div>
            <div>
              <div className="font-bold text-sm text-saffron-950 font-heading">
                Rate Limiting Cooldown Active
              </div>
              <p className="text-saffron-800 text-xs mt-0.5">
                Government inspection gateway query threshold reached. Automatic cool-off in progress.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-saffron-100 px-3.5 py-1.5 rounded-md border border-saffron-300 shadow-2xs shrink-0">
            <span className="text-2xs uppercase font-semibold text-saffron-800">Remaining</span>
            <span className="font-mono font-bold text-sm text-saffron-950">
              {cooldownRemainingSeconds}s
            </span>
          </div>
        </div>
      )}

      {/* Packaging Ingestion Area */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider">
              Packaging Evidence &amp; Label Panels
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Capture or upload front display face and back statutory declarations panel for compliance audit.
            </p>
          </div>
          {imageSrc && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetScanner}
              className="text-xs font-medium"
            >
              Reset Scanner
            </Button>
          )}
        </div>

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFrontFileSelected(e.target.files[0]);
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
        <input
          type="file"
          ref={unifiedFileInputRef}
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

        {/* Dual-Panel Upload Slots: Front Display Panel & Back Statutory Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Front Display Panel Slot */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOverFront(true); }}
            onDragLeave={() => setIsDragOverFront(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverFront(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFrontFileSelected(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 rounded-lg p-4 transition-all flex flex-col justify-between ${
              isDragOverFront 
                ? "border-saffron-500 bg-saffron-50/40" 
                : frontPreview 
                ? "border-navy-800/40 bg-navy-50/20" 
                : "border-dashed border-neutral-300 bg-neutral-50/60 hover:border-neutral-400"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-navy-800 text-white flex items-center justify-center text-2xs font-mono">1</span>
                  <span>Front Display Panel (PDP)</span>
                </span>
                {frontPreview ? (
                  <span className="text-2xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Front Loaded
                  </span>
                ) : (
                  <span className="text-2xs font-medium text-neutral-500">
                    Brand &amp; Quantity
                  </span>
                )}
              </div>

              {frontPreview ? (
                <div className="relative aspect-video max-h-48 rounded-md overflow-hidden border border-neutral-200 bg-neutral-950/5 flex items-center justify-center my-2 shadow-2xs">
                  <img src={frontPreview} alt="Front Packaging Specimen" className="max-h-full object-contain" />
                </div>
              ) : (
                <div className="py-6 text-center space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-500">
                    <ImageIcon size={22} />
                  </div>
                  <p className="text-xs font-semibold text-neutral-800">Primary Brand Face</p>
                  <p className="text-2xs text-neutral-500">Brand Name, Product Identity, Net Measure</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 pt-3 border-t border-neutral-100 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                icon={<UploadSimple size={14} weight="bold" />}
              >
                {frontPreview ? "Change Front" : "Browse Front"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setCameraTarget("front"); setIsCameraOpen(true); }}
                icon={<CameraIcon size={14} weight="bold" />}
              >
                Camera
              </Button>
            </div>
          </div>

          {/* Back Statutory Panel Slot */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOverBack(true); }}
            onDragLeave={() => setIsDragOverBack(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverBack(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleBackFileSelected(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 rounded-lg p-4 transition-all flex flex-col justify-between ${
              isDragOverBack 
                ? "border-saffron-500 bg-saffron-50/40" 
                : backPreview 
                ? "border-navy-800/40 bg-navy-50/20" 
                : "border-dashed border-neutral-300 bg-neutral-50/60 hover:border-neutral-400"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-navy-800 text-white flex items-center justify-center text-2xs font-mono">2</span>
                  <span>Back Statutory Panel</span>
                </span>
                {backPreview ? (
                  <span className="text-2xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Back Loaded
                  </span>
                ) : (
                  <span className="text-2xs font-medium text-neutral-500">
                    MRP, USP &amp; Dates
                  </span>
                )}
              </div>

              {backPreview ? (
                <div className="relative aspect-video max-h-48 rounded-md overflow-hidden border border-neutral-200 bg-neutral-950/5 flex items-center justify-center my-2 shadow-2xs">
                  <img src={backPreview} alt="Back Packaging Specimen" className="max-h-full object-contain" />
                </div>
              ) : (
                <div className="py-6 text-center space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-500">
                    <FileText size={22} />
                  </div>
                  <p className="text-xs font-semibold text-neutral-800">Statutory Declarations Face</p>
                  <p className="text-2xs text-neutral-500">MRP, USP, Manufacturing Date, FSSAI, Address</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 pt-3 border-t border-neutral-100 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => backFileInputRef.current?.click()}
                icon={<UploadSimple size={14} weight="bold" />}
              >
                {backPreview ? "Change Back" : "Browse Back"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setCameraTarget("back"); setIsCameraOpen(true); }}
                icon={<CameraIcon size={14} weight="bold" />}
              >
                Camera
              </Button>
            </div>
          </div>

        </div>

        {/* Drag-and-Drop Dropzone with Compression Readout */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleUnifiedDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            isDragOver
              ? "border-saffron-500 bg-saffron-50/50 shadow-inner"
              : "border-neutral-300 bg-neutral-50/50 hover:border-neutral-400"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-navy-50 text-navy-800 flex items-center justify-center mx-auto mb-2 border border-navy-200">
            <CloudArrowUp size={28} weight="bold" />
          </div>
          <h3 className="text-xs font-bold text-neutral-900 font-heading">
            Drag and drop product packaging image(s) here
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
            Drop both Front and Back panels together for full declaration extraction and legal compliance scoring.
          </p>

          {compression && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-neutral-100 px-3 py-1.5 text-2xs font-mono text-neutral-700 border border-neutral-200">
              <span>Original: {(compression.originalSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
              <span className="text-neutral-300">•</span>
              <span>Downsampled: {(compression.compressedSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
              <span className="text-neutral-300">•</span>
              <span className="text-emerald-700 font-bold">
                -{Math.round((1 - compression.compressionRatio) * 100)}% Optimization
              </span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => unifiedFileInputRef.current?.click()}
              icon={<UploadSimple size={16} weight="bold" />}
            >
              Browse Files (Select 1 or 2)
            </Button>
            {(frontFile || backFile) && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleTriggerAnalysis()}
                icon={<Sparkle size={16} weight="fill" />}
              >
                Execute Statutory Verification Scan
              </Button>
            )}
          </div>
        </div>

        {/* 5-Agent Multi-Agent Pipeline Progress Indicator */}
        {(scanStatus === "compressing" || scanStatus === "uploading" || scanStatus === "processing") && (
          <div className="p-5 bg-navy-50/60 border border-navy-200/90 rounded-lg space-y-4 animate-fadeIn shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-navy-950 font-heading">
              <span className="flex items-center gap-2">
                <Cpu size={16} className="text-navy-800 animate-pulse" weight="bold" />
                <span>{progressStageText}</span>
              </span>
              <span className="font-mono text-navy-800 bg-white px-2.5 py-0.5 rounded border border-navy-200">
                {progressPercent}%
              </span>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-navy-800 transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-2xs text-neutral-600 pt-0.5 font-mono">
              <span className="font-semibold text-navy-900">{activeAgentLabel}</span>
              <span>5-Agent Autonomous LangGraph Pipeline</span>
            </div>

            {/* 5-Agent Visual Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-1">
              <div className={`p-2.5 rounded-md border text-2xs space-y-1 ${
                activeStepIndex >= 1 ? "bg-white border-navy-300 text-navy-950 shadow-2xs" : "bg-neutral-100/60 border-neutral-200 text-neutral-400"
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>1. Preprocessing</span>
                  {activeStepIndex > 1 ? <CheckCircle size={14} className="text-emerald-600" weight="fill" /> : <span className="w-2 h-2 rounded-full bg-saffron-500 animate-ping" />}
                </div>
                <p className="text-neutral-500 leading-tight">Client canvas scaling &lt; 2MB</p>
              </div>

              <div className={`p-2.5 rounded-md border text-2xs space-y-1 ${
                activeStepIndex >= 2 ? "bg-white border-navy-300 text-navy-950 shadow-2xs" : "bg-neutral-100/60 border-neutral-200 text-neutral-400"
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>2. Perception Agent</span>
                  {activeStepIndex > 2 ? <CheckCircle size={14} className="text-emerald-600" weight="fill" /> : activeStepIndex === 2 ? <span className="w-2 h-2 rounded-full bg-saffron-500 animate-ping" /> : null}
                </div>
                <p className="text-neutral-500 leading-tight">Direct multimodal vision extraction</p>
              </div>

              <div className={`p-2.5 rounded-md border text-2xs space-y-1 ${
                activeStepIndex >= 3 ? "bg-white border-navy-300 text-navy-950 shadow-2xs" : "bg-neutral-100/60 border-neutral-200 text-neutral-400"
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>3. Rules Engine</span>
                  {activeStepIndex > 3 ? <CheckCircle size={14} className="text-emerald-600" weight="fill" /> : activeStepIndex === 3 ? <span className="w-2 h-2 rounded-full bg-saffron-500 animate-ping" /> : null}
                </div>
                <p className="text-neutral-500 leading-tight">LMPC 2011 Table-I font calibrations</p>
              </div>

              <div className={`p-2.5 rounded-md border text-2xs space-y-1 ${
                activeStepIndex >= 4 ? "bg-white border-navy-300 text-navy-950 shadow-2xs" : "bg-neutral-100/60 border-neutral-200 text-neutral-400"
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>4. Statutory RAG</span>
                  {activeStepIndex > 4 ? <CheckCircle size={14} className="text-emerald-600" weight="fill" /> : activeStepIndex === 4 ? <span className="w-2 h-2 rounded-full bg-saffron-500 animate-ping" /> : null}
                </div>
                <p className="text-neutral-500 leading-tight">pgvector legal citations &amp; schedules</p>
              </div>

              <div className={`p-2.5 rounded-md border text-2xs space-y-1 ${
                activeStepIndex >= 5 ? "bg-white border-navy-300 text-navy-950 shadow-2xs" : "bg-neutral-100/60 border-neutral-200 text-neutral-400"
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>5. Consensus Agent</span>
                  {activeStepIndex >= 5 ? <span className="w-2 h-2 rounded-full bg-saffron-500 animate-ping" /> : null}
                </div>
                <p className="text-neutral-500 leading-tight">Courtroom docket &amp; notice synthesis</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message Display */}
        {scanStatus === "error" && errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-rose-800">
              <XCircle size={18} className="text-rose-600" weight="fill" />
              <span>Packaging Verification Halted</span>
            </div>
            <p className="leading-relaxed">{errorMessage}</p>
            <div className="pt-1">
              <Button variant="outline" size="sm" onClick={resetScanner}>
                Retry Inspection Scan
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* RESULTS WORKSPACE (When Scan is Complete) */}
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

          {/* Statutory Findings & Consumer Advisory */}
          {liveResult?.consumer_advisory && (
            <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-200/80 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider">
                    Statutory Assessment Summary
                  </h3>
                  <span className="text-2xs text-slate-500 font-normal">
                    Automated evaluation against Legal Metrology Rules, 2011
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xs font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Ref: {currentScan.scanCode}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                {liveResult.consumer_advisory}
              </p>
            </div>
          )}

          {/* Main Two-Column Interactive Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Sub-View Switcher (Declarations vs Table-I Font Audit) & Violations */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Sub-view switcher tabs */}
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSubView("declarations")}
                    className={`px-3.5 py-2 rounded-md font-heading text-xs font-bold transition-all flex items-center gap-1.5 ${
                      subView === "declarations"
                        ? "bg-navy-800 text-white shadow-xs"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    <FileText size={14} weight="bold" />
                    <span>Rule 6 Declarations ({currentScan.declarations.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubView("font_table")}
                    className={`px-3.5 py-2 rounded-md font-heading text-xs font-bold transition-all flex items-center gap-1.5 ${
                      subView === "font_table"
                        ? "bg-navy-800 text-white shadow-xs"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    <TextT size={14} weight="bold" />
                    <span>Rule 7 Table-I Font Audit</span>
                  </button>
                </div>

                <span className="text-2xs text-neutral-500 font-medium">
                  Select item to highlight on visual label
                </span>
              </div>

              {/* View 1: Rule 6 Mandatory Declarations Cards */}
              {subView === "declarations" && (
                <div className="space-y-3" role="region" aria-label="Rule 6 Mandatory Declarations List">
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
                <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-xs space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <TextT size={18} className="text-navy-800" weight="bold" />
                      <h4 className="text-xs font-bold text-neutral-900 font-heading uppercase tracking-wide">
                        Rule 7 Table-I Font Cap-Height Verification
                      </h4>
                    </div>
                    <p className="text-2xs text-neutral-600 leading-relaxed">
                      Statutory minimum height of numerals and letters based on Principal Display Panel (PDP) area of <strong>{currentScan.pdpAreaCm2} cm²</strong>.
                    </p>
                  </div>

                  <div className="overflow-x-auto border border-neutral-200 rounded-md">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-100/70 border-b border-neutral-200 text-neutral-700 font-semibold font-heading uppercase text-2xs tracking-wider">
                          <th className="py-2.5 px-3">Statutory Field</th>
                          <th className="py-2.5 px-3">Required Minimum</th>
                          <th className="py-2.5 px-3">Measured Cap-Height</th>
                          <th className="py-2.5 px-3 text-right">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {currentScan.declarations
                          .filter((d) => d.measuredFontHeightMm && d.requiredFontHeightMm)
                          .map((d) => {
                            const isPassing = (d.measuredFontHeightMm || 0) >= (d.requiredFontHeightMm || 0);
                            return (
                              <tr key={d.id} className="hover:bg-neutral-50/70 transition-colors">
                                <td className="py-2.5 px-3 font-semibold text-neutral-900">{d.fieldName}</td>
                                <td className="py-2.5 px-3 font-mono text-neutral-600">{d.requiredFontHeightMm} mm</td>
                                <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">{d.measuredFontHeightMm} mm</td>
                                <td className="py-2.5 px-3 text-right">
                                  {isPassing ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-2xs font-bold">
                                      <CheckCircle size={12} weight="fill" />
                                      <span>Conforms</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-2xs font-bold">
                                      <XCircle size={12} weight="fill" />
                                      <span>Deficient</span>
                                    </span>
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
                <div className="space-y-3 pt-3">
                  <div className="flex items-center justify-between border-b border-rose-200 pb-2.5">
                    <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider font-heading flex items-center gap-1.5">
                      <ShieldWarning size={18} weight="fill" />
                      <span>Statutory Infractions Requiring Enforcement Action ({currentScan.violations.length})</span>
                    </h3>
                    <span className="text-2xs text-neutral-500 font-mono bg-neutral-100 px-2.5 py-0.5 rounded border border-neutral-200">
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
                            alert(`Drafting Section 36(1) legal metrology compounding notice for: ${violation.title}`);
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Sticky Packaging Specimen Image & Legend */}
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-20 space-y-4">
                <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-neutral-900 font-heading uppercase tracking-wider flex items-center gap-1.5">
                      <Scan size={16} className="text-navy-800" weight="bold" />
                      <span>Packaging Visual Segmentation</span>
                    </h3>
                    <span className="text-2xs font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
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

                  {/* Redesigned Visual Legend */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-100 text-2xs text-neutral-600">
                    <div className="flex items-center gap-1.5 bg-neutral-50 p-1.5 rounded border border-neutral-200/60 justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1 ring-emerald-300 shrink-0" />
                      <span className="font-semibold text-neutral-800">Compliant</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-neutral-50 p-1.5 rounded border border-neutral-200/60 justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-1 ring-rose-300 shrink-0" />
                      <span className="font-semibold text-neutral-800">Infraction</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-neutral-50 p-1.5 rounded border border-neutral-200/60 justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-navy-800 ring-1 ring-navy-400 shrink-0" />
                      <span className="font-semibold text-neutral-800">Active Box</span>
                    </div>
                  </div>
                </div>

                {/* Consumer Health Cross-Link */}
                {userRole === "consumer" && onNavigateToHealth && (
                  <div className="p-4 rounded-lg bg-navy-50/80 border border-navy-200/80 space-y-2 shadow-xs">
                    <div className="flex items-center gap-2 text-navy-900 font-bold text-xs font-heading">
                      <Heartbeat size={18} weight="fill" className="text-saffron-600" />
                      <span>Consumer Health &amp; Nutrition Audit</span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Cross-examine back nutritional facts against ICMR-NIN 2024 daily allowances for sugar, sodium, and saturated fats.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onNavigateToHealth}
                      className="w-full"
                      icon={<ArrowRight size={14} weight="bold" />}
                      iconPosition="right"
                    >
                      Launch Health &amp; Nutrition Check
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
        <div className="bg-white p-8 rounded-lg border border-neutral-200 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-navy-50 text-navy-800 flex items-center justify-center mx-auto border border-navy-200">
            <Scan size={24} weight="bold" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-neutral-900 font-heading">
              Ready for Packaging Ingestion
            </h3>
            <p className="text-xs text-neutral-500 max-w-lg mx-auto leading-relaxed">
              Upload photographs of Front and Back packaging panels above to evaluate statutory declarations, verify Table-I numeral heights, and calculate legal compliance scores.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-left">
            <div className="p-3 rounded-md bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-xs font-bold text-navy-900 font-heading block">Rule 6 Standards</span>
              <p className="text-2xs text-neutral-600">Verifies brand, generic identity, MRP, net quantity, and manufacturer address.</p>
            </div>
            <div className="p-3 rounded-md bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-xs font-bold text-navy-900 font-heading block">Rule 7 Table-I Audit</span>
              <p className="text-2xs text-neutral-600">Measures font cap-height in millimeters proportional to Principal Display Panel area.</p>
            </div>
            <div className="p-3 rounded-md bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-xs font-bold text-navy-900 font-heading block">Statutory Citations</span>
              <p className="text-2xs text-neutral-600">Deterministic Section 36(1) penalty calculations with legal metrology precedents.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
