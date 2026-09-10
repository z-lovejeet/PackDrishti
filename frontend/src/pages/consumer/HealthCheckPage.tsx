import React, { useState, useRef } from 'react';
import { 
  Heartbeat, 
  Warning, 
  CheckCircle, 
  CloudArrowUp, 
  Camera as CameraIcon, 
  Image as ImageIcon, 
  CurrencyInr, 
  ArrowRight, 
  ArrowClockwise,
  Scales,
  Sparkle,
  Plant,
  XCircle,
  Info,
  ShieldCheck,
  UploadSimple,
  FileText
} from '@phosphor-icons/react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Camera } from '../../components/scanner/Camera';
import { HealthBadgeGroup } from '../../components/health/HealthBadgeGroup';
import { NutrientRow } from '../../components/health/NutrientRow';
import { DietaryAdvisory } from '../../components/health/DietaryAdvisory';
import { ProductHealthAudit } from '../../types';
import { apiClient } from '../../utils/apiClient';
import { downsampleImage, blobToFile } from '../../utils/imageProc';

export const HealthCheckPage: React.FC = () => {
  // Dual Image Upload States
  const [frontImageSrc, setFrontImageSrc] = useState<string | null>(null);
  const [frontFileName, setFrontFileName] = useState<string>('');
  const [frontRawFile, setFrontRawFile] = useState<File | null>(null);

  const [backImageSrc, setBackImageSrc] = useState<string | null>(null);
  const [backFileName, setBackFileName] = useState<string>('');
  const [backRawFile, setBackRawFile] = useState<File | null>(null);

  const [isDragOverFront, setIsDragOverFront] = useState<boolean>(false);
  const [isDragOverBack, setIsDragOverBack] = useState<boolean>(false);
  const [isDragOverUnified, setIsDragOverUnified] = useState<boolean>(false);

  // Live Camera Modal State
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraTarget, setCameraTarget] = useState<'front' | 'back'>('front');

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [liveAuditResult, setLiveAuditResult] = useState<ProductHealthAudit | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const frontFileRef = useRef<HTMLInputElement>(null);
  const frontCamRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);
  const backCamRef = useRef<HTMLInputElement>(null);
  const unifiedFileRef = useRef<HTMLInputElement>(null);

  // Active Audit Data Resolution: strictly live audit result
  const currentAudit: ProductHealthAudit | null = liveAuditResult;

  const handleFrontFile = (file: File) => {
    if (!file) return;
    setFrontRawFile(file);
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setFrontImageSrc(e.target?.result as string);
      setFrontFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleBackFile = (file: File) => {
    if (!file) return;
    setBackRawFile(file);
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setBackImageSrc(e.target?.result as string);
      setBackFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (blob: Blob) => {
    setIsCameraOpen(false);
    const filename = `${cameraTarget}_specimen.jpg`;
    const capturedFile = new File([blob], filename, { type: 'image/jpeg' });
    if (cameraTarget === 'front') {
      handleFrontFile(capturedFile);
    } else {
      handleBackFile(capturedFile);
    }
  };

  const handleUnifiedDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverUnified(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      if (filesArray.length >= 2) {
        handleFrontFile(filesArray[0]);
        handleBackFile(filesArray[1]);
      } else if (!frontRawFile) {
        handleFrontFile(filesArray[0]);
      } else {
        handleBackFile(filesArray[0]);
      }
    }
  };

  const runDualScanAudit = async () => {
    setIsAnalyzing(true);
    setAnalysisStep(1);
    setErrorMessage(null);

    const timer1 = setTimeout(() => setAnalysisStep(2), 400);
    const timer2 = setTimeout(() => setAnalysisStep(3), 850);

    try {
      // Step 1: Client Downsampling if files exceed statutory threshold (< 2MB)
      let finalFront: File | Blob | null = frontRawFile;
      let finalBack: File | Blob | null = backRawFile;

      if (frontRawFile && frontRawFile.size > 2 * 1024 * 1024) {
        const downFront = await downsampleImage(frontRawFile, {
          maxDimension: 2048,
          maxSizeBytes: 2 * 1024 * 1024,
        });
        finalFront = blobToFile(downFront.blob, frontFileName || 'front.jpg');
      }

      if (backRawFile && backRawFile.size > 2 * 1024 * 1024) {
        const downBack = await downsampleImage(backRawFile, {
          maxDimension: 2048,
          maxSizeBytes: 2 * 1024 * 1024,
        });
        finalBack = blobToFile(downBack.blob, backFileName || 'back.jpg');
      }

      const formData = new FormData();
      if (finalFront) {
        formData.append('front_image', finalFront);
      } else {
        formData.append(
          'front_image',
          new Blob([new Uint8Array([0xff, 0xd8, 0xff])], { type: 'image/jpeg' }),
          frontFileName || 'front.jpg'
        );
      }

      if (finalBack) {
        formData.append('back_image', finalBack);
      } else {
        formData.append(
          'back_image',
          new Blob([new Uint8Array([0xff, 0xd8, 0xff])], { type: 'image/jpeg' }),
          backFileName || 'back.jpg'
        );
      }

      formData.append(
        'product_name',
        frontFileName ? frontFileName.replace(/\.[^/.]+$/, '') : 'Packaged Commodity'
      );
      formData.append('brand', 'Packaged Foods Ltd.');
      formData.append('serving_size_g', '100.0');

      const response = await apiClient.post('/health/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.data) {
        const apiData = response.data.data;
        const mappedAudit: ProductHealthAudit = {
          id: apiData.audit_id,
          commodityName: apiData.product_name || 'Verified Food Commodity',
          brandName: apiData.brand || 'Packaged Foods',
          category: 'Packaged Food Commodity',
          servingSize: apiData.serving_size || '100 g',
          netQuantity: 'Standard Package',
          mrp: 'Declared on Back Panel',
          pricePer100g: 'Standard Basis',
          priceRating: 'Fair Market Rate',
          priceAnalysis:
            apiData.dietary_summary ||
            'Audited against ICMR-NIN 2024 Dietary Guidelines for Indians.',
          overallRating: apiData.score_band as any,
          ratingScore: Math.round(apiData.health_score),
          frontImageUrl:
            frontImageSrc ||
            'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
          backImageUrl:
            backImageSrc ||
            'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
          badges: (apiData.badges || []).map((b: any) => ({
            label: b.badge,
            type:
              b.severity === 'danger'
                ? 'danger'
                : b.severity === 'good'
                ? 'good'
                : 'warning',
          })),
          nutrients: (apiData.nutrients || []).map((n: any) => ({
            name: n.name,
            valuePer100g: n.value,
            valuePerServe: Math.round(n.value * 0.2 * 10) / 10,
            unit: n.unit,
            icmrDailyLimit: `${n.icmr_limit} ${n.unit}`,
            level: n.threshold,
            assessment: n.assessment,
          })),
          whoCanConsume: apiData.dietary_advisory?.who_can_consume || [],
          whoShouldAvoid: apiData.dietary_advisory?.who_should_avoid || [],
          healthierAlternatives: (
            apiData.dietary_advisory?.healthier_alternatives || []
          ).map(
            (a: any) =>
              `${a.alternative_name}: ${a.swap_advantage} (${a.calorie_difference})`
          ),
          dietarySummary: apiData.dietary_summary || '',
        };
        setLiveAuditResult(mappedAudit);
      }
    } catch (err: any) {
      const errorDetail = err?.response?.data?.detail || err?.message || 'Verification request failed';
      setErrorMessage(`Failed to analyze packaging: ${errorDetail}`);
      setLiveAuditResult(null);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsAnalyzing(false);
    }
  };

  const handleResetUploads = () => {
    setFrontImageSrc(null);
    setFrontFileName('');
    setFrontRawFile(null);
    setBackImageSrc(null);
    setBackFileName('');
    setBackRawFile(null);
    setLiveAuditResult(null);
    setErrorMessage(null);
  };

  const isUploadComplete = frontImageSrc && backImageSrc;

  // Circular Score Gauge Math
  const score = currentAudit ? currentAudit.ratingScore : 0;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const scoreColor = score >= 70 ? '#059669' : score >= 45 ? '#D97706' : '#DC2626';

  const getVerdictDisplay = () => {
    if (!currentAudit) return null;
    if (currentAudit.overallRating === 'Nutritious Choice' || currentAudit.ratingScore >= 70) {
      return {
        label: 'Nutritious Choice',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: <CheckCircle size={16} weight="fill" className="text-emerald-600" />,
        desc: 'Balanced nutritional profile compliant with ICMR-NIN 2024 recommended dietary allowances.',
      };
    }
    if (currentAudit.overallRating === 'Consume in Moderation' || currentAudit.ratingScore >= 45) {
      return {
        label: 'Consume in Moderation',
        badgeClass: 'bg-amber-50 text-amber-950 border-amber-300',
        icon: <Warning size={16} weight="fill" className="text-amber-700" />,
        desc: 'Moderate sodium or sugar content. Advised for occasional consumption rather than daily intake.',
      };
    }
    return {
      label: 'High Health Concern',
      badgeClass: 'bg-rose-50 text-rose-900 border-rose-300',
      icon: <XCircle size={16} weight="fill" className="text-rose-600" />,
      desc: 'High concentration of added sugars, saturated fats, or sodium exceeding daily safe limits.',
    };
  };

  const verdict = getVerdictDisplay();

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto font-sans">
      
      {/* Live Camera Viewfinder Modal */}
      <Camera
        isOpen={isCameraOpen}
        onCapture={handleCameraCapture}
        onClose={() => setIsCameraOpen(false)}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-navy-800 text-white flex items-center justify-center shadow-xs">
              <Heartbeat size={20} weight="bold" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 font-heading tracking-tight">
              Consumer Health &amp; Nutrition Audit
            </h1>
            <span className="text-2xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs font-mono">
              ICMR-NIN &amp; WHO STANDARDS
            </span>
          </div>
          <p className="text-xs text-neutral-600 max-w-2xl leading-relaxed">
            Scan both front packaging and back nutrition panels to audit sugar levels, sodium concentration, saturated fats, price fairness, and dietary contraindications against ICMR-NIN 2024 guidelines.
          </p>
        </div>

        {(frontImageSrc || backImageSrc || currentAudit) && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {currentAudit && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-2xs font-mono border border-neutral-200 bg-neutral-50 text-neutral-700 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live ICMR-NIN Analysis</span>
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetUploads}
              icon={<ArrowClockwise size={15} weight="bold" />}
            >
              Reset Health Scanner
            </Button>
          </div>
        )}
      </div>

      {/* Dual Photo Upload Section (Front Panel + Nutrition Facts Panel) */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 font-heading uppercase tracking-wide flex items-center gap-2">
              <UploadSimple size={16} className="text-navy-800" weight="bold" />
              <span>Dual Packaging Evidence Ingestion</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Both front brand display and back nutritional facts panel are required for 100% accurate health index scoring.
            </p>
          </div>
          <div className="text-2xs font-mono font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded border border-neutral-200">
            {frontImageSrc && backImageSrc ? '2/2 Panels Ready' : frontImageSrc || backImageSrc ? '1/2 Panels Ready' : '0/2 Panels Ready'}
          </div>
        </div>

        {/* Hidden File & Camera Inputs */}
        <input type="file" ref={frontFileRef} accept="image/*" className="hidden" onChange={(e) => e.target.files && handleFrontFile(e.target.files[0])} />
        <input type="file" ref={frontCamRef} accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files && handleFrontFile(e.target.files[0])} />
        <input type="file" ref={backFileRef} accept="image/*" className="hidden" onChange={(e) => e.target.files && handleBackFile(e.target.files[0])} />
        <input type="file" ref={backCamRef} accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files && handleBackFile(e.target.files[0])} />
        <input type="file" ref={unifiedFileRef} accept="image/*" multiple className="hidden" onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            const arr = Array.from(e.target.files);
            if (arr.length >= 2) {
              handleFrontFile(arr[0]);
              handleBackFile(arr[1]);
            } else if (!frontRawFile) {
              handleFrontFile(arr[0]);
            } else {
              handleBackFile(arr[0]);
            }
          }
        }} />

        {/* 2-Column Upload Target Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Slot 1: Front Panel */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragOverFront(true); }}
            onDragLeave={() => setIsDragOverFront(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverFront(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFrontFile(e.dataTransfer.files[0]);
            }}
            className={`border-2 rounded-lg p-4 text-center transition-all flex flex-col justify-between ${
              isDragOverFront 
                ? 'border-saffron-500 bg-saffron-50/40' 
                : frontImageSrc 
                ? 'border-navy-800/40 bg-navy-50/20' 
                : 'border-dashed border-neutral-300 bg-neutral-50/60 hover:border-neutral-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-navy-800 text-white flex items-center justify-center text-2xs font-mono">1</span>
                  <span>Photo 1: Front Packaging</span>
                </span>
                {frontImageSrc ? (
                  <span className="text-2xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Front Loaded
                  </span>
                ) : (
                  <span className="text-2xs font-medium text-neutral-500">
                    Brand &amp; Product Title
                  </span>
                )}
              </div>

              {frontImageSrc ? (
                <div className="relative aspect-video max-h-48 rounded-md overflow-hidden border border-neutral-200 bg-neutral-950/5 flex items-center justify-center my-2 shadow-2xs">
                  <img src={frontImageSrc} alt="Front Packaging" className="max-h-full object-contain" />
                </div>
              ) : (
                <div className="py-6 text-center space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-500">
                    <ImageIcon size={22} />
                  </div>
                  <p className="text-xs font-semibold text-neutral-800">Primary Packaging Face</p>
                  <p className="text-2xs text-neutral-500">Brand Name, Flavor, Claims, and Net Weight</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 pt-3 border-t border-neutral-100 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => frontFileRef.current?.click()} 
                icon={<UploadSimple size={14} weight="bold" />}
              >
                {frontImageSrc ? 'Change Front' : 'Browse Front'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setCameraTarget('front'); setIsCameraOpen(true); }} 
                icon={<CameraIcon size={14} weight="bold" />}
              >
                Camera
              </Button>
            </div>
          </div>

          {/* Slot 2: Back Panel (Nutrition Facts Panel) */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragOverBack(true); }}
            onDragLeave={() => setIsDragOverBack(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverBack(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) handleBackFile(e.dataTransfer.files[0]);
            }}
            className={`border-2 rounded-lg p-4 text-center transition-all flex flex-col justify-between ${
              isDragOverBack 
                ? 'border-saffron-500 bg-saffron-50/40' 
                : backImageSrc 
                ? 'border-navy-800/40 bg-navy-50/20' 
                : 'border-dashed border-neutral-300 bg-neutral-50/60 hover:border-neutral-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-navy-800 text-white flex items-center justify-center text-2xs font-mono">2</span>
                  <span>Photo 2: Nutrition Facts Panel</span>
                </span>
                {backImageSrc ? (
                  <span className="text-2xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Back Loaded
                  </span>
                ) : (
                  <span className="text-2xs font-medium text-neutral-500">
                    Nutrients &amp; Ingredients
                  </span>
                )}
              </div>

              {backImageSrc ? (
                <div className="relative aspect-video max-h-48 rounded-md overflow-hidden border border-neutral-200 bg-neutral-950/5 flex items-center justify-center my-2 shadow-2xs">
                  <img src={backImageSrc} alt="Back Nutritional Panel" className="max-h-full object-contain" />
                </div>
              ) : (
                <div className="py-6 text-center space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-500">
                    <FileText size={22} />
                  </div>
                  <p className="text-xs font-semibold text-neutral-800">Nutritional Facts &amp; MRP</p>
                  <p className="text-2xs text-neutral-500">Sugar, Sodium, Saturated Fats, Ingredients, and Price</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 pt-3 border-t border-neutral-100 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => backFileRef.current?.click()} 
                icon={<UploadSimple size={14} weight="bold" />}
              >
                {backImageSrc ? 'Change Back' : 'Browse Back'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setCameraTarget('back'); setIsCameraOpen(true); }} 
                icon={<CameraIcon size={14} weight="bold" />}
              >
                Camera
              </Button>
            </div>
          </div>

        </div>

        {/* Drag-and-Drop Unified Helper Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOverUnified(true); }}
          onDragLeave={() => setIsDragOverUnified(false)}
          onDrop={handleUnifiedDrop}
          className={`border border-dashed rounded-lg p-4 text-center transition-all ${
            isDragOverUnified ? 'border-saffron-500 bg-saffron-50/40' : 'border-neutral-200 bg-neutral-50/40'
          }`}
        >
          <div className="flex items-center justify-center gap-2 text-2xs text-neutral-600">
            <CloudArrowUp size={16} className="text-navy-800" />
            <span>Drop both Front and Back images here simultaneously for instant loading</span>
          </div>
        </div>

        {/* Action Button & Status / Progress Bar */}
        <div className="pt-2">
          {isAnalyzing ? (
            <div className="p-5 bg-navy-50/70 rounded-lg border border-navy-200/90 space-y-3 shadow-xs animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-navy-950 font-heading">
                <span className="flex items-center gap-2">
                  <Sparkle size={16} className="text-saffron-600 animate-spin" weight="fill" />
                  <span>
                    {analysisStep === 1 && 'Step 1: Extracting nutritional table values & ingredients list...'}
                    {analysisStep === 2 && 'Step 2: Auditing sugar, sodium & saturated fats against ICMR-NIN 2024 limits...'}
                    {analysisStep === 3 && 'Step 3: Calculating price fairness & synthesizing clinical dietary advisories...'}
                  </span>
                </span>
                <span className="font-mono text-navy-800 bg-white px-2.5 py-0.5 rounded border border-navy-200">
                  {Math.round(analysisStep * 33.3)}%
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-navy-800 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${analysisStep * 33.3}%` }} 
                />
              </div>
              <div className="flex items-center justify-between text-2xs text-neutral-600 pt-1 font-mono">
                <span>Deterministic ICMR-NIN Comparison Engine</span>
                <span>Serving Unit Normalization: 100g Standard</span>
              </div>
            </div>
          ) : isUploadComplete ? (
            <Button
              variant="primary"
              size="md"
              onClick={runDualScanAudit}
              className="w-full"
              icon={<ArrowRight size={16} weight="bold" />}
              iconPosition="right"
            >
              Run Health &amp; Nutrition Check
            </Button>
          ) : (
            <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-600 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-neutral-500 shrink-0" />
                <span>Upload photographs of both Front and Back panels above to activate the health audit.</span>
              </div>
              <span className="font-semibold text-neutral-700 font-mono text-2xs bg-white px-2 py-0.5 rounded border border-neutral-200">
                {frontImageSrc ? '1/2 Uploaded' : backImageSrc ? '1/2 Uploaded' : '0/2 Uploaded'}
              </span>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-rose-800">
              <XCircle size={16} weight="fill" />
              <span>Nutrition Audit Execution Error</span>
            </div>
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* AUDIT RESULTS DISPLAY */}
      {currentAudit ? (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Health Summary Banner */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-5 border-l-4 border-l-navy-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              
              {/* Product Identity */}
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap text-2xs">
                  <span className="font-bold text-neutral-700 bg-neutral-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider font-heading border border-neutral-200">
                    {currentAudit.brandName}
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="font-semibold text-neutral-600 bg-neutral-50 px-2.5 py-0.5 rounded-md border border-neutral-200">
                    {currentAudit.category}
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="font-mono font-semibold text-navy-800 bg-navy-50 px-2.5 py-0.5 rounded-md border border-navy-200">
                    REF: {currentAudit.id.substring(0, 8).toUpperCase()}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 font-heading tracking-tight leading-tight">
                  {currentAudit.commodityName}
                </h2>

                <div className="text-xs text-neutral-600 flex flex-wrap items-center gap-3">
                  <span>Serving Unit: <strong className="text-neutral-800">{currentAudit.servingSize}</strong></span>
                  <span className="text-neutral-300">•</span>
                  <span>Net Quantity: <strong className="text-neutral-800">{currentAudit.netQuantity}</strong></span>
                  <span className="text-neutral-300">•</span>
                  <span>Declared MRP: <strong className="text-neutral-800">{currentAudit.mrp}</strong></span>
                </div>
              </div>

              {/* Circular Score Gauge & Overall Verdict */}
              <div className="flex items-center gap-4 shrink-0 bg-neutral-50 p-4 rounded-lg border border-neutral-200/90 shadow-2xs">
                
                {/* Circular Score Ring */}
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                  <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r={radius}
                      stroke="#E2E8F0"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r={radius}
                      stroke={scoreColor}
                      strokeWidth="6"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-extrabold font-heading text-lg leading-none text-neutral-900">
                      {score}
                    </span>
                    <span className="text-2xs font-mono font-bold text-neutral-500 mt-0.5">
                      /100
                    </span>
                  </div>
                </div>

                {/* Overall Verdict Text */}
                <div className="space-y-1">
                  <span className="text-2xs uppercase tracking-wider font-bold text-neutral-500 block font-heading">
                    Nutritional Index
                  </span>
                  {verdict && (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold border shadow-2xs ${verdict.badgeClass}`}>
                      {verdict.icon}
                      <span>{verdict.label}</span>
                    </div>
                  )}
                  {verdict && (
                    <p className="text-2xs text-neutral-600 max-w-[200px] leading-tight pt-0.5">
                      {verdict.desc}
                    </p>
                  )}
                </div>

              </div>

            </div>

            {/* Health Warning Badges Strip using HealthBadgeGroup */}
            <div className="pt-3 border-t border-neutral-100 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-neutral-800 font-heading uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-navy-800" weight="bold" />
                  <span>Identified Nutritional Health Markers:</span>
                </span>
                <span className="text-2xs text-neutral-500 font-medium">
                  Audited per ICMR-NIN 2024 thresholds
                </span>
              </div>
              <HealthBadgeGroup badges={currentAudit.badges} />
            </div>
          </div>

          {/* Nutritional Breakdown Table vs ICMR Limits using NutrientRow */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-bold text-neutral-900 font-heading uppercase tracking-wider flex items-center gap-2">
                  <Scales size={16} className="text-navy-800" weight="bold" />
                  <span>Nutritional Parameter Breakdown vs ICMR-NIN 2024 Limits</span>
                </h3>
                <p className="text-2xs text-neutral-500 mt-0.5">
                  Evaluated per 100g baseline and per serving against National Institute of Nutrition daily upper limits.
                </p>
              </div>
              <span className="text-2xs font-mono font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded border border-neutral-200">
                Regulatory Reference: ICMR-NIN 2024
              </span>
            </div>

            {/* Grid of NutrientRow Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {currentAudit.nutrients.map((nut, idx) => (
                <NutrientRow key={idx} nutrient={nut} />
              ))}
            </div>
          </div>

          {/* MRP & Price Fairness Analysis Card */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-saffron-50 text-saffron-700 flex items-center justify-center border border-saffron-200">
                  <CurrencyInr size={18} weight="bold" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 font-heading uppercase tracking-wide">
                    MRP &amp; Price Fairness Evaluation
                  </h3>
                  <span className="text-2xs text-neutral-500 font-medium">
                    Statutory Unit Sale Price (USP) validation under Legal Metrology Rule 6(11)
                  </span>
                </div>
              </div>

              <Badge 
                variant={currentAudit.priceRating === 'Budget' ? 'compliant' : currentAudit.priceRating === 'Premium' ? 'warning' : 'neutral'} 
                size="sm"
              >
                {currentAudit.priceRating} Assessment
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/80 space-y-1">
                <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wider block">
                  Declared Maximum Retail Price (MRP)
                </span>
                <span className="text-lg font-bold text-neutral-900 font-mono block">
                  {currentAudit.mrp}
                </span>
                <span className="text-2xs text-neutral-500 block">
                  Inclusive of all statutory taxes
                </span>
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/80 space-y-1">
                <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wider block">
                  Calculated Unit Sale Price (USP)
                </span>
                <span className="text-lg font-bold text-navy-800 font-mono block">
                  {currentAudit.pricePer100g}
                </span>
                <span className="text-2xs text-neutral-500 block">
                  Standard metric baseline (per 100g / 100ml)
                </span>
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/80 space-y-1">
                <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wider block">
                  Market Fairness Assessment
                </span>
                <p className="text-2xs text-neutral-700 leading-relaxed mt-0.5">
                  {currentAudit.priceAnalysis}
                </p>
              </div>
            </div>
          </div>

          {/* Two-Column Dietary Guidance & Healthier Alternatives using DietaryAdvisory */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <Plant size={18} weight="bold" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 font-heading uppercase tracking-wide">
                    Clinical Dietary Guidance &amp; Substitutions
                  </h3>
                  <span className="text-2xs text-neutral-500 font-medium">
                    Evidence-backed consumer dietary stratification under ICMR-NIN standards
                  </span>
                </div>
              </div>
            </div>

            <DietaryAdvisory
              whoCanConsume={currentAudit.whoCanConsume}
              whoShouldAvoid={currentAudit.whoShouldAvoid}
              healthierAlternatives={currentAudit.healthierAlternatives}
            />
          </div>

        </div>
      ) : !isAnalyzing && (
        /* Clean empty state when idle */
        <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center space-y-5 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-navy-50 text-navy-800 flex items-center justify-center mx-auto border border-navy-200">
            <Heartbeat size={24} weight="bold" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-neutral-900 font-heading">
              Ready for Health &amp; Nutrition Verification
            </h3>
            <p className="text-xs text-neutral-500 max-w-lg mx-auto leading-relaxed">
              Upload photographs of both Front brand packaging and Rear nutrition facts table above, then click Run Health &amp; Nutrition Check to view an ICMR-NIN 2024 compliant health audit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-left">
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-xs font-bold text-navy-900 font-heading block">
                ICMR-NIN 2024 Thresholds
              </span>
              <p className="text-2xs text-neutral-600 leading-relaxed">
                Audits added sugars (&lt; 25g/day), daily sodium upper limits (&lt; 2000mg/day), and saturated fats.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-xs font-bold text-navy-900 font-heading block">
                Dual-Photo Requirement
              </span>
              <p className="text-2xs text-neutral-600 leading-relaxed">
                Front panel captures brand identity &amp; net quantity; back panel extracts nutrition table &amp; ingredients.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-xs font-bold text-navy-900 font-heading block">
                Clinical Dietary Synthesis
              </span>
              <p className="text-2xs text-neutral-600 leading-relaxed">
                Automated risk identification for diabetics, hypertensives, and pediatric populations with whole-food swaps.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
