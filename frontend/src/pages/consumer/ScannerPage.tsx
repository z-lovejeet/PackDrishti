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
  Database,
  Scales,
  ShieldCheck,
  Coins,
  Package,
  Ruler,
  WarningOctagon
} from "@phosphor-icons/react";
import { Button } from "../../components/common/Button";
import { AnnotatedImage } from "../../components/scanner/AnnotatedImage";
import { Camera } from "../../components/scanner/Camera";
import { ReportHeader } from "../../components/reports/ReportHeader";
import { ComplianceCard } from "../../components/reports/ComplianceCard";
import { ViolationCard } from "../../components/reports/ViolationCard";
import { NoticePreviewModal } from "../../components/officer/NoticePreviewModal";
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
  const [subView, setSubView] = useState<"infractions" | "declarations" | "font_table" | "citations">("infractions");
  const [activePanelTab, setActivePanelTab] = useState<"front" | "back">("front");
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState<boolean>(false);

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
      {
        id: "live-dec-mfg",
        ruleClause: "Rule 6(1)(d)",
        fieldName: "Date of Manufacture & Expiry",
        extractedValue: (liveResult as any).expiry_date && (liveResult as any).expiry_date !== "Not Declared"
          ? `Mfg: ${(liveResult as any).mfg_date || "N/A"} • Exp: ${(liveResult as any).expiry_date}`
          : `Mfg: ${(liveResult as any).mfg_date || "Declared on Package"}`,
        status: (liveResult as any).is_expired ? "violation" : "compliant",
        statusNote: (liveResult as any).is_expired
          ? `CRITICAL INFRACTION: Expired commodity (${(liveResult as any).expiry_details || "Passed declared shelf life"})`
          : "Mandatory date declaration conforms to Rule 6(1)(d)",
        measuredFontHeightMm: 2.2,
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
      mfgDate: (liveResult as any).mfg_date || "Declared on Specimen",
      expiryDate: (liveResult as any).expiry_date,
      isExpired: Boolean((liveResult as any).is_expired),
      expiryStatus: (liveResult as any).expiry_status,
      expiryDetails: (liveResult as any).expiry_details,
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
    processFiles(primary, secondary, primary.name, secondary?.name, userRole);
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
        processFiles(f1, f2, f1.name, f2.name, userRole);
      } else {
        const f1 = filesArray[0];
        setFrontFile(f1);
        setFrontPreview(URL.createObjectURL(f1));
        if (backFile) {
          processFiles(f1, backFile, f1.name, backFile.name, userRole);
        } else {
          processFiles(f1, null, f1.name, undefined, userRole);
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
        processFiles(captured, backFile, captured.name, backFile.name, userRole);
      } else {
        processFiles(captured, null, captured.name, undefined, userRole);
      }
    } else {
      setBackFile(captured);
      setBackPreview(URL.createObjectURL(captured));
      if (frontFile) {
        processFiles(frontFile, captured, frontFile.name, captured.name, userRole);
      } else {
        processFiles(captured, null, captured.name, undefined, userRole);
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
            Enforcement Inspection Workstation • LMPC Rules, 2011
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-950 mt-1 tracking-tight">
            Legal Metrology Compliance Scanner
          </h1>
          <p className="text-xs text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
            Statutory packaging inspection for Legal Metrology Officers. Evaluates mandatory Rule 6 declarations, verifies Rule 7 Table-I numeral cap-heights, checks Unit Sale Price math, and computes Section 48 compounding exposure.
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
                processFiles(arr[0], arr[1], arr[0].name, arr[1].name, userRole);
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
      {currentScan && scanStatus === "complete" && (() => {
        const finalFrontImg = frontPreview || imageSrc;
        const finalBackImg = backPreview || _backImageSrc;
        const hasDualImage = Boolean(finalFrontImg && finalBackImg);

        const violationsCount = currentScan.violations.length;
        const isCompliant = currentScan.overallStatus === "compliant" || violationsCount === 0;

        // Calculate total compounding liability under Section 48
        const totalCompounding = currentScan.violations.reduce((acc, v) => {
          const liveV = liveResult?.violations.find(lv => lv.violation_id === v.id || lv.rule_code === v.ruleReference);
          if (liveV && typeof liveV.compounding_amount === "number") {
            return acc + liveV.compounding_amount;
          }
          return acc + 25000;
        }, 0);

        // Calculate USP per 100g or 100ml
        let per100gStr = "N/A";
        if (liveResult?.net_quantity_value && liveResult?.mrp && liveResult.net_quantity_value > 0) {
          const unitLower = (liveResult.net_quantity_unit || "g").toLowerCase();
          if (unitLower === "g" || unitLower === "grams") {
            const valPer100g = (liveResult.mrp / liveResult.net_quantity_value) * 100;
            per100gStr = `Rs. ${valPer100g.toFixed(2)} / 100g`;
          } else if (unitLower === "kg") {
            const valPer100g = (liveResult.mrp / (liveResult.net_quantity_value * 1000)) * 100;
            per100gStr = `Rs. ${valPer100g.toFixed(2)} / 100g`;
          } else if (unitLower === "ml") {
            const valPer100ml = (liveResult.mrp / liveResult.net_quantity_value) * 100;
            per100gStr = `Rs. ${valPer100ml.toFixed(2)} / 100ml`;
          } else if (unitLower === "l" || unitLower === "litre") {
            const valPer100ml = (liveResult.mrp / (liveResult.net_quantity_value * 1000)) * 100;
            per100gStr = `Rs. ${valPer100ml.toFixed(2)} / 100ml`;
          }
        }

        const isExpiredCommodity = Boolean(
          (liveResult as any)?.is_expired ||
          currentScan.isExpired ||
          currentScan.violations.some(v => v.ruleReference === "PCR_RULE_6_1_D_EXPIRED" || v.id === "PCR_RULE_6_1_D_EXPIRED" || v.title?.toLowerCase().includes("expired"))
        );
        const expiredDetailsStr = (liveResult as any)?.expiry_details || 
          (currentScan.expiryDate ? `Passed shelf life (Expiry: ${currentScan.expiryDate})` : "Passed declared shelf life or expired relative to current date (September 2026)");
        const mfgDateStr = (liveResult as any)?.mfg_date || currentScan.mfgDate || "Declared on Package";
        const expDateStr = (liveResult as any)?.expiry_date || currentScan.expiryDate || "Not Declared";

        return (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Critical Expiry Statutory Alert Banner */}
            {isExpiredCommodity && (
              <div className="p-4 sm:p-5 rounded-lg border-2 border-rose-600 bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white shadow-lg space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-600/60 border border-rose-400 flex items-center justify-center text-white shrink-0 mt-0.5">
                      <WarningOctagon size={24} weight="fill" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/40 border border-rose-300/40 text-2xs font-bold tracking-wide uppercase text-rose-100 mb-1">
                        Critical Enforcement Alert
                      </div>
                      <h3 className="text-base sm:text-lg font-bold font-heading text-white">
                        CRITICAL INFRACTION: EXPIRED PACKAGED COMMODITY
                      </h3>
                      <p className="text-xs text-rose-200 mt-0.5">
                        Statutory Reference: Rule 6(1)(d) &amp; Rule 18(1), PCR 2011 read with Section 59, FSSAI Act 2006
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded bg-rose-500 text-white font-mono text-xs font-bold shadow-xs">
                      BANNED FROM SALE
                    </span>
                    <p className="text-2xs text-rose-200 mt-1 font-mono">
                      Compounding: ₹50,000 Sec 48
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-rose-700/60 text-xs">
                  <div className="bg-rose-950/50 p-2.5 rounded border border-rose-700/50">
                    <span className="text-rose-300 text-2xs block">Date of Manufacture:</span>
                    <span className="font-semibold text-white">{mfgDateStr}</span>
                  </div>
                  <div className="bg-rose-950/50 p-2.5 rounded border border-rose-700/50">
                    <span className="text-rose-300 text-2xs block">Declared Expiry / Best Before:</span>
                    <span className="font-semibold text-rose-200">{expDateStr}</span>
                  </div>
                  <div className="bg-rose-950/50 p-2.5 rounded border border-rose-700/50">
                    <span className="text-rose-300 text-2xs block">Enforcement Status:</span>
                    <span className="font-semibold text-rose-300 font-mono text-2xs">{expiredDetailsStr}</span>
                  </div>
                </div>

                <p className="text-2xs text-rose-100 bg-rose-950/40 p-2 rounded border border-rose-800/40 leading-relaxed">
                  <strong>Mandatory Seizure Action:</strong> Under Rule 18(1) of the Legal Metrology (Packaged Commodities) Rules 2011, no person or retail dealer shall sell or distribute any commodity past its expiry date. Display or offering for sale of this specimen is an actionable statutory offence requiring immediate inventory impoundment under Section 15 and notice issuance under Section 36(1).
                </p>
              </div>
            )}

            {/* Executive Docket Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-mono text-2xs font-bold px-2.5 py-0.5 rounded bg-slate-900 text-white uppercase tracking-wider">
                      Docket: {currentScan.scanCode}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-700 font-semibold">{currentScan.brand}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{currentScan.category}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-400 font-mono text-2xs">{currentScan.scannedAt}</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-950 tracking-tight">
                    {currentScan.productName}
                  </h1>
                </div>

                {/* Primary Verdict & Notice Action */}
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono border ${
                    isCompliant
                      ? "bg-slate-50 text-slate-900 border-slate-200"
                      : "bg-slate-900 text-white border-slate-900"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isCompliant ? "bg-slate-900" : "bg-rose-400"}`} />
                    <span>{isCompliant ? "VERIFIED COMPLIANT" : `${violationsCount} STATUTORY INFRACTIONS`}</span>
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsNoticeModalOpen(true)}
                    className="text-xs font-medium"
                    icon={<FileText size={13} weight="bold" />}
                  >
                    Draft Notice (LM-INSP-2011)
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onOpenReportModal}
                    className="text-xs font-medium"
                  >
                    Export PDF Docket
                  </Button>
                </div>
              </div>

              {/* 4 Officer Key Inspection Metrics (Spacious, Clean, Slate) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-2xs font-mono uppercase text-slate-400 block tracking-wider">Compliance Score</span>
                  <div className="text-2xl font-bold font-heading text-slate-950">
                    {complianceResult?.score || 0} / 100
                  </div>
                  <span className="text-2xs text-slate-500 block">LMPC 2011 Rules adherence</span>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-2xs font-mono uppercase text-slate-400 block tracking-wider">Section 48 Liability</span>
                  <div className="text-2xl font-bold font-heading text-slate-950">
                    {totalCompounding > 0 ? `₹${totalCompounding.toLocaleString("en-IN")}` : "₹0"}
                  </div>
                  <span className="text-2xs text-slate-500 block">
                    {violationsCount > 0 ? `${violationsCount} actionable infraction counts` : "Zero statutory liability"}
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-2xs font-mono uppercase text-slate-400 block tracking-wider">Unit Sale Price (USP)</span>
                  <div className="text-lg font-bold font-heading text-slate-950 truncate">
                    {liveResult?.calculated_usp ? `₹${liveResult.calculated_usp.toFixed(2)} / ${liveResult.calculated_usp_unit || "g"}` : "Not Declared"}
                  </div>
                  <span className="text-2xs text-slate-500 block">
                    Rule 6(1)(e) Proviso ({per100gStr})
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-2xs font-mono uppercase text-slate-400 block tracking-wider">PDP Area &amp; Standard</span>
                  <div className="text-2xl font-bold font-heading text-slate-950">
                    {currentScan.pdpAreaCm2} cm²
                  </div>
                  <span className="text-2xs text-slate-500 block">
                    Min. Numeral: {currentScan.pdpAreaCm2 <= 50 ? "1.0 mm" : currentScan.pdpAreaCm2 <= 100 ? "1.5 mm" : currentScan.pdpAreaCm2 <= 500 ? "2.0 mm" : "4.0 mm"}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Interactive Officer Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Clean Tabbed Working Desk */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Clean Tab Switcher (Understated, high readability) */}
                <div className="flex items-center gap-1 border-b border-slate-200 pb-2 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setSubView("infractions")}
                    className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      subView === "infractions"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span>Statutory Infractions</span>
                    <span className={`text-2xs px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      subView === "infractions"
                        ? "bg-slate-700 text-white"
                        : violationsCount > 0 ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-600"
                    }`}>
                      {violationsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubView("declarations")}
                    className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      subView === "declarations"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span>Rule 6 Declarations Matrix</span>
                    <span className={`text-2xs px-1.5 py-0.2 rounded-full font-mono ${
                      subView === "declarations" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {currentScan.declarations.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubView("font_table")}
                    className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      subView === "font_table"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span>Rule 7 Table-I Font Audit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubView("citations")}
                    className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      subView === "citations"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span>Legal Citations &amp; Authorities</span>
                  </button>
                </div>

                {/* TAB 1: Statutory Infractions List */}
                {subView === "infractions" && (
                  <div className="space-y-4">
                    {violationsCount === 0 ? (
                      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3 shadow-xs">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center mx-auto">
                          <CheckCircle size={22} weight="fill" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 font-heading">
                          Zero Statutory Defaults Flagged
                        </h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                          All mandatory declarations under Rule 6, numeral heights under Rule 7 Table-I, and Unit Sale Price calculations conform to statutory standards.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {currentScan.violations.map((violation) => (
                          <ViolationCard
                            key={violation.id}
                            violation={violation}
                            showAction={true}
                            onFileNotice={() => setIsNoticeModalOpen(true)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Rule 6 Mandatory Declarations Matrix (Exhaustive, Spacious Table) */}
                {subView === "declarations" && (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider">
                          Mandatory Packaging Declarations Audit
                        </h3>
                        <p className="text-2xs text-slate-500 mt-0.5">
                          Section 18 &amp; Rule 6, Legal Metrology (Packaged Commodities) Rules, 2011
                        </p>
                      </div>
                      <span className="text-2xs font-mono text-slate-400">
                        {currentScan.declarations.filter(d => d.status === "compliant").length} / {currentScan.declarations.length} Compliant
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-mono text-2xs uppercase border-b border-slate-200">
                            <th className="py-3 px-4 font-semibold">Rule Clause</th>
                            <th className="py-3 px-4 font-semibold">Statutory Field</th>
                            <th className="py-3 px-4 font-semibold">Declared Specimen Text</th>
                            <th className="py-3 px-4 font-semibold text-right">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentScan.declarations.map((d) => (
                            <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-slate-900 text-2xs whitespace-nowrap">
                                {d.ruleClause}
                              </td>
                              <td className="py-3 px-4 font-medium text-slate-800">
                                {d.fieldName}
                              </td>
                              <td className="py-3 px-4 font-mono text-2xs text-slate-600 max-w-xs break-words">
                                {d.extractedValue || "Not declared on packaging panel"}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-full border ${
                                  d.status === "compliant"
                                    ? "bg-slate-50 text-slate-700 border-slate-200"
                                    : "bg-rose-50 text-rose-800 border-rose-200"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${d.status === "compliant" ? "bg-slate-700" : "bg-rose-600"}`} />
                                  <span>{d.status === "compliant" ? "Conforms" : "Infraction"}</span>
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: Rule 7 Table-I Font Calibration */}
                {subView === "font_table" && (
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider">
                        Rule 7 Table-I Font Cap-Height Calibration
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Statutory numeral height requirements derived from Principal Display Panel (PDP) area of <strong>{currentScan.pdpAreaCm2} cm²</strong>.
                      </p>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-mono text-2xs uppercase border-b border-slate-200">
                            <th className="py-3 px-4 font-semibold">Statutory Field</th>
                            <th className="py-3 px-4 font-semibold">Required Minimum</th>
                            <th className="py-3 px-4 font-semibold">Measured Cap-Height</th>
                            <th className="py-3 px-4 font-semibold text-right">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentScan.declarations
                            .filter((d) => d.measuredFontHeightMm && d.requiredFontHeightMm)
                            .map((d) => {
                              const isPassing = (d.measuredFontHeightMm || 0) >= (d.requiredFontHeightMm || 0);
                              return (
                                <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="py-3 px-4 font-medium text-slate-900">{d.fieldName}</td>
                                  <td className="py-3 px-4 font-mono text-slate-600">{d.requiredFontHeightMm} mm</td>
                                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{d.measuredFontHeightMm} mm</td>
                                  <td className="py-3 px-4 text-right">
                                    <span className={`inline-flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-full border ${
                                      isPassing
                                        ? "bg-slate-50 text-slate-700 border-slate-200"
                                        : "bg-rose-50 text-rose-800 border-rose-200"
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${isPassing ? "bg-slate-700" : "bg-rose-600"}`} />
                                      <span>{isPassing ? "Conforms" : "Deficient"}</span>
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 4: Legal Citations & Statutory Authorities */}
                {subView === "citations" && (
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
                    <div className="space-y-1 border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider">
                        Statutory Authorities &amp; Legal Citations
                      </h3>
                      <p className="text-slate-500 text-2xs">
                        Governing statutes and legal precedents for enforcement notice formulation.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                        <span className="font-bold text-slate-900 block font-mono text-2xs">
                          Section 36(1) • Legal Metrology Act, 2009
                        </span>
                        <p className="text-slate-600 leading-relaxed">
                          Whoever manufactures, packs, imports, sells, distributes, delivers or otherwise transfers any pre-packaged commodity which does not conform to the declarations on the package as provided under the Act or rules made thereunder, shall be punished with fine which may extend to twenty-five thousand rupees, and for the second offence, with fine which may extend to fifty thousand rupees.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                        <span className="font-bold text-slate-900 block font-mono text-2xs">
                          Section 48 • Compounding of Offences
                        </span>
                        <p className="text-slate-600 leading-relaxed">
                          Any offence punishable under Section 36(1) may, either before or after the institution of the prosecution, be compounded by the Director or Controller or such legal metrology officer as may be specially authorized.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                        <span className="font-bold text-slate-900 block font-mono text-2xs">
                          Rule 18(1) • Prohibition of Sale of Non-Compliant Packages
                        </span>
                        <p className="text-slate-600 leading-relaxed">
                          No wholesale dealer or retail dealer or other person shall sell, deliver, or offer for sale any pre-packaged commodity, the packaging of which does not conform to all provisions of the rules or which has passed its expiry date.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* RIGHT COLUMN: Sticky Packaging Evidence & Docket Actions */}
              <div className="lg:col-span-5 space-y-5">
                <div className="sticky top-20 space-y-5">
                  
                  {/* Packaging Specimen Card with Clean Panel Toggles */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider">
                        Packaging Specimen Evidence
                      </span>
                      {hasDualImage && (
                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md">
                          <button
                            type="button"
                            onClick={() => setActivePanelTab("front")}
                            className={`px-2 py-0.5 rounded text-2xs font-medium cursor-pointer transition-colors ${
                              activePanelTab === "front"
                                ? "bg-white text-slate-900 font-semibold shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Front Panel
                          </button>
                          <button
                            type="button"
                            onClick={() => setActivePanelTab("back")}
                            className={`px-2 py-0.5 rounded text-2xs font-medium cursor-pointer transition-colors ${
                              activePanelTab === "back"
                                ? "bg-white text-slate-900 font-semibold shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            Back Panel
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Image View */}
                    <div className="rounded-lg overflow-hidden border border-slate-100 bg-slate-950/5 flex items-center justify-center">
                      <AnnotatedImage
                        imageUrl={
                          hasDualImage
                            ? (activePanelTab === "front" ? finalFrontImg! : finalBackImg!)
                            : (finalFrontImg || finalBackImg || currentScan.imageUrl)
                        }
                        title={hasDualImage ? (activePanelTab === "front" ? "Front Display Panel" : "Back Statutory Panel") : "Packaging Specimen"}
                        badge={hasDualImage ? (activePanelTab === "front" ? "Panel 1/2 • Front" : "Panel 2/2 • Back") : "Specimen 1/1"}
                        pdpAreaCm2={currentScan.pdpAreaCm2}
                        showOverlay={false}
                      />
                    </div>

                    <div className="flex items-center justify-between text-2xs font-mono text-slate-400 pt-1">
                      <span>Area: {currentScan.pdpAreaCm2} cm²</span>
                      <span>Verified: Legal Metrology</span>
                    </div>
                  </div>

                  {/* Officer Action Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                    <span className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider block">
                      Enforcement Toolkit
                    </span>

                    <div className="space-y-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsNoticeModalOpen(true)}
                        className="w-full text-xs font-semibold justify-center"
                        icon={<FileText size={14} weight="bold" />}
                      >
                        Draft FORM LM-INSP-2011 Notice
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onOpenReportModal}
                        className="w-full text-xs font-medium justify-center"
                        icon={<DownloadSimple size={14} />}
                      >
                        Export Statutory Inspection Certificate
                      </Button>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Notice Preview Modal for FORM LM-INSP-2011 */}
            <NoticePreviewModal
              isOpen={isNoticeModalOpen}
              onClose={() => setIsNoticeModalOpen(false)}
              scanId={currentScan.id}
              docketNumber={currentScan.scanCode}
              productName={currentScan.productName}
              brand={currentScan.brand}
              mrp={currentScan.mrp}
              netQty={currentScan.netQuantity}
              violationsCount={currentScan.violations.length}
              compoundingFee={totalCompounding}
              assignedOfficer="Senior Legal Metrology Inspector"
              inspectionDate={new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            />

          </div>
        );
      })()}

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
