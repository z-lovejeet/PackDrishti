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
  FileText,
  Drop,
  WarningCircle,
  UsersThree,
  ShieldWarning
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
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStageText, setProgressStageText] = useState<string>('');
  const [activeAgentLabel, setActiveAgentLabel] = useState<string>('Multimodal Vision Agent');
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [liveAuditResult, setLiveAuditResult] = useState<ProductHealthAudit | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const frontFileRef = useRef<HTMLInputElement>(null);
  const frontCamRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);
  const backCamRef = useRef<HTMLInputElement>(null);
  const unifiedFileRef = useRef<HTMLInputElement>(null);

  // Active Audit Data Resolution: strictly live real-time audit result
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
    setProgressPercent(5);
    setProgressStageText('Step 1/5: Ingesting & validating Front & Back packaging panels...');
    setActiveAgentLabel('Multimodal Ingestion Agent');
    setErrorMessage(null);

    const startTime = Date.now();
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      const elapsedSec = (Date.now() - startTime) / 1000;
      if (elapsedSec < 2.0) {
        const pct = Math.min(20, Math.round(5 + (elapsedSec / 2.0) * 15));
        setProgressPercent(pct);
        setProgressStageText('Step 1/5: Ingesting & validating Front & Back packaging panels...');
        setActiveAgentLabel('Multimodal Preprocessing');
      } else if (elapsedSec < 7.0) {
        const pct = Math.min(50, Math.round(20 + ((elapsedSec - 2.0) / 5.0) * 30));
        setProgressPercent(pct);
        setProgressStageText('Step 2/5: Multimodal Vision Agent inspecting ingredient list & nutrition table...');
        setActiveAgentLabel('Multimodal Vision Agent (Zero OCR)');
      } else if (elapsedSec < 14.0) {
        const pct = Math.min(75, Math.round(50 + ((elapsedSec - 7.0) / 7.0) * 25));
        setProgressPercent(pct);
        setProgressStageText('Step 3/5: Benchmarking nutrients against ICMR-NIN 2024 & detecting palm oil / UPF...');
        setActiveAgentLabel('ICMR-NIN Profiling Engine');
      } else if (elapsedSec < 22.0) {
        const pct = Math.min(92, Math.round(75 + ((elapsedSec - 14.0) / 8.0) * 17));
        setProgressPercent(pct);
        setProgressStageText('Step 4/5: Calculating age restrictions, disease risks & clinical advisories...');
        setActiveAgentLabel('Clinical Nutrition Agent');
      } else {
        const creep = Math.min(96, Math.round(92 + (elapsedSec - 22.0) * 0.4));
        setProgressPercent(creep);
        setProgressStageText('Step 5/5: Formulating consumer health verdict & whole-food alternatives...');
        setActiveAgentLabel('Multi-Agent Consensus Engine');
      }
    }, 200);

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

      // Do NOT send hardcoded dummy brand or file names as hints
      // Allow the Multimodal Vision Agent to extract genuine brand and product identity directly from packaging pixels

      const response = await apiClient.post('/health/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setProgressPercent(100);
      setProgressStageText('Audit Complete: Health & Nutrition Certification Formulated');
      setActiveAgentLabel('Audit Finalized');

      if (response.data && response.data.data) {
        const apiData = response.data.data;

        // Clean and filter nutrients list: remove malformed table entries
        const rawNutrients = apiData.nutrients || [];
        const cleanedNutrients = rawNutrients
          .filter((n: any) => {
            if (!n) return false;
            const name = String(n.name || n.nutrient || '').toLowerCase().trim();
            return name && !['columns', 'data', 'table', 'index', 'nutrient'].includes(name);
          })
          .map((n: any) => {
            const raw100g = n.value ?? n.value_per_100g ?? n.valuePer100g ?? 0;
            const rawServe = n.value_per_serve ?? n.valuePerServe;
            return {
              name: String(n.name || n.nutrient || 'Nutrient').trim(),
              valuePer100g: typeof raw100g === 'number' && (isNaN(raw100g) || raw100g > 100000) ? 0 : raw100g,
              valuePerServe:
                rawServe !== undefined && rawServe !== null && typeof rawServe === 'number' && (isNaN(rawServe) || rawServe > 100000)
                  ? 0
                  : rawServe,
              unit: String(n.unit || 'g').trim(),
              icmrDailyLimit:
                n.icmr_daily_limit ??
                n.icmrDailyLimit ??
                (n.icmr_limit ? `${n.icmr_limit} ${n.unit || ''}`.trim() : 'ICMR Standard'),
              level: n.level || 'Moderate',
              assessment: n.assessment || `Measured ${n.name || 'nutrient'} content on packaging.`,
            };
          });

        const mappedAudit: ProductHealthAudit = {
          id: apiData.audit_id || 'AUDIT-' + Date.now(),
          commodityName: apiData.commodity_name || apiData.product_name || 'Verified Food Commodity',
          brandName: apiData.brand_name || apiData.brand || 'Commercial Brand',
          category: apiData.category || 'Packaged Food Commodity',
          servingSize: apiData.serving_size || 'Declared on Panel',
          netQuantity: apiData.net_quantity || 'Declared on Panel',
          mrp: apiData.mrp || 'Declared on Package',
          mfgDate: apiData.mfg_date || 'Declared on Package',
          expiryDate: apiData.expiry_date || 'Not Declared',
          isExpired: Boolean(apiData.is_expired),
          expiryStatus: apiData.expiry_status,
          expiryWarning: apiData.expiry_warning,
          pricePer100g: apiData.price_per_100g || 'Standard Basis',
          priceRating: apiData.price_rating || 'Fair Market Rate',
          priceAnalysis:
            apiData.price_analysis ||
            apiData.dietary_summary ||
            'Audited against Legal Metrology Rule 6(11) and ICMR-NIN 2024 Dietary Guidelines.',
          overallRating: apiData.score_band || apiData.overall_rating || 'Consume in Moderation',
          ratingScore: Math.round(apiData.rating_score ?? apiData.health_score ?? 50),
          frontImageUrl:
            frontImageSrc ||
            'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
          backImageUrl:
            backImageSrc ||
            'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
          badges: (apiData.badges || []).map((b: any) => ({
            label: b.badge || b.label || 'Health Marker',
            type:
              b.severity === 'danger' || b.type === 'danger'
                ? 'danger'
                : b.severity === 'good' || b.type === 'good'
                ? 'good'
                : 'warning',
            description: b.description || '',
          })),
          nutrients: cleanedNutrients,
          shouldWeEatIt: apiData.should_we_eat_it || 'Consume in Strict Moderation',
          howBadIsIt: apiData.how_bad_is_it || 'Packaged ultra-processed commodity.',
          notEatableForAge: apiData.not_eatable_for_age || [],
          whoCanConsume: apiData.who_can_consume || [],
          whoShouldAvoid: apiData.who_should_avoid || [],
          healthProblemsIfEatenMore: apiData.health_problems || apiData.healthProblemsIfEatenMore || [],
          dietarySummary: apiData.dietary_summary || '',
          healthierAlternatives: apiData.healthier_alternatives || [],
          hasPalmOil: Boolean(apiData.has_palm_oil),
          palmOilDetails: apiData.palm_oil_details || apiData.dietary_advisory?.palm_oil_details,
          hasAddedSugar: apiData.has_added_sugar,
          addedSugarDetails: apiData.added_sugar_details,
          hasHighSodium: apiData.has_high_sodium,
          hasArtificialAdditives: apiData.has_artificial_additives,
          ingredientsList: apiData.ingredients_list || [],
          flaggedIngredients: apiData.flagged_ingredients || apiData.dietary_advisory?.flagged_ingredients || [],
        };
        setLiveAuditResult(mappedAudit);
      }
    } catch (err: any) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      const errorDetail = err?.response?.data?.detail || err?.message || 'Verification request failed';
      setErrorMessage(`Failed to analyze packaging: ${errorDetail}`);
      setLiveAuditResult(null);
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
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
    if (currentAudit.isExpired || currentAudit.overallRating === 'Critical Hazard - Expired Food' || currentAudit.ratingScore === 0) {
      return {
        label: 'Critical Hazard - Expired Food',
        badgeClass: 'bg-rose-950 text-white border-rose-600',
        icon: <XCircle size={16} weight="fill" className="text-rose-400" />,
        desc: currentAudit.expiryWarning || 'Strictly unfit for human consumption. Commodity has passed its declared shelf life and poses severe microbiological risk.',
      };
    }
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <p className="text-2xs font-mono font-medium tracking-wider text-slate-500 uppercase">
            Nutritional Safety &amp; Ingredients • ICMR-NIN 2024
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-950 mt-1 tracking-tight">
            Nutrition &amp; Ingredient Analysis
          </h1>
          <p className="text-xs text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
            Evaluate nutritional profiles, palm oil content, added sugars, sodium density, and age-specific dietary suitability against national health standards.
          </p>
        </div>

        {(frontImageSrc || backImageSrc || currentAudit) && (
          <div className="flex items-center gap-2.5 shrink-0">
            {currentAudit && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Audit Complete</span>
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetUploads}
              className="text-xs font-medium"
            >
              Reset Scanner
            </Button>
          </div>
        )}
      </div>

      {/* Dual Photo Upload Section (Front Panel + Nutrition Facts Panel) */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider">
              Packaging Panels &amp; Nutrition Table
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit front brand face and back nutrition facts table for comprehensive health evaluation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-2xs font-mono font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded border border-neutral-200">
              {frontImageSrc && backImageSrc ? '2/2 Panels Ready' : frontImageSrc || backImageSrc ? '1/2 Panels Ready' : '0/2 Panels Ready'}
            </div>
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
            className={`border rounded-lg p-4 text-center transition-all flex flex-col justify-between ${
              isDragOverFront 
                ? 'border-neutral-900 bg-neutral-100/60' 
                : frontImageSrc 
                ? 'border-neutral-400 bg-neutral-50/40' 
                : 'border-dashed border-neutral-300 bg-neutral-50/60 hover:border-neutral-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-2xs font-mono">1</span>
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
                  <p className="text-2xs text-neutral-500">Brand Name, Claims, and Net Weight</p>
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
            className={`border rounded-lg p-4 text-center transition-all flex flex-col justify-between ${
              isDragOverBack 
                ? 'border-neutral-900 bg-neutral-100/60' 
                : backImageSrc 
                ? 'border-neutral-400 bg-neutral-50/40' 
                : 'border-dashed border-neutral-300 bg-neutral-50/60 hover:border-neutral-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-2xs font-mono">2</span>
                  <span>Photo 2: Nutrition Facts &amp; Ingredients</span>
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
                  <p className="text-xs font-semibold text-neutral-800">Nutritional Facts &amp; Ingredients</p>
                  <p className="text-2xs text-neutral-500">Sugar, Sodium, Saturated Fats, Palm Oil, and Additives</p>
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
            isDragOverUnified ? 'border-neutral-900 bg-neutral-100' : 'border-neutral-200 bg-neutral-50/40'
          }`}
        >
          <div className="flex items-center justify-center gap-2 text-2xs text-neutral-600">
            <CloudArrowUp size={16} className="text-neutral-900" />
            <span>Drop both Front and Back images here simultaneously for instant inspection</span>
          </div>
        </div>

        {/* Action Button & Status / Progress Bar */}
        <div className="pt-2">
          {isAnalyzing ? (
            <div className="p-5 bg-neutral-50 rounded-lg border border-neutral-300 space-y-3 shadow-xs animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-950 font-heading">
                <span className="flex items-center gap-2">
                  <Sparkle size={16} className="text-neutral-900 animate-spin" weight="fill" />
                  <span>{progressStageText}</span>
                </span>
                <span className="font-mono text-neutral-900 bg-white px-2.5 py-0.5 rounded border border-neutral-200">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-neutral-900 h-full rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
              <div className="flex items-center justify-between text-2xs text-neutral-600 pt-1 font-mono">
                <span className="font-semibold text-neutral-800">{activeAgentLabel}</span>
                <span>ICMR-NIN 2024 &amp; WHO Dietary Guidelines</span>
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
              Run Multimodal Health Check
            </Button>
          ) : (
            <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-600 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-neutral-500 shrink-0" />
                <span>Upload photographs of both Front and Back panels above or load the demo benchmark.</span>
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
          
          {/* Expiry Hazard Danger Banner */}
          {currentAudit.isExpired && (
            <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 border-2 border-rose-600 rounded-lg p-5 shadow-lg text-white space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-600/70 border border-rose-400 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <ShieldWarning size={24} weight="fill" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-2xs font-bold uppercase tracking-wider text-rose-100 mb-1">
                      Severe Health Hazard
                    </div>
                    <h3 className="text-base sm:text-lg font-bold font-heading text-white">
                      STRICTLY DO NOT CONSUME - EXPIRED FOOD HAZARD
                    </h3>
                    <p className="text-xs text-rose-200 mt-0.5">
                      {currentAudit.expiryWarning || 'This packaged commodity has passed its declared shelf life and poses severe risk of microbial food poisoning.'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded bg-rose-600 text-white font-mono text-xs font-bold shadow-xs">
                    HEALTH SCORE: 0/100
                  </span>
                  <p className="text-2xs text-rose-300 mt-1 font-mono">
                    Rating: Critical Hazard
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-rose-800/80 text-xs">
                <div className="bg-rose-900/60 p-2.5 rounded border border-rose-700/60">
                  <span className="text-rose-300 text-2xs block uppercase tracking-wider font-semibold">Manufacture Date</span>
                  <strong className="text-white text-xs block mt-0.5">{currentAudit.mfgDate || 'Declared on Package'}</strong>
                </div>
                <div className="bg-rose-900/60 p-2.5 rounded border border-rose-700/60">
                  <span className="text-rose-300 text-2xs block uppercase tracking-wider font-semibold">Expiry / Best Before</span>
                  <strong className="text-rose-200 text-xs block mt-0.5">{currentAudit.expiryDate || 'Not Declared'}</strong>
                </div>
                <div className="bg-rose-900/60 p-2.5 rounded border border-rose-700/60">
                  <span className="text-rose-300 text-2xs block uppercase tracking-wider font-semibold">Shelf Life Audit</span>
                  <strong className="text-rose-300 text-xs font-mono block mt-0.5">{currentAudit.expiryStatus || 'Expired past shelf life'}</strong>
                </div>
              </div>

              <div className="bg-rose-900/40 p-2.5 rounded border border-rose-800 text-2xs text-rose-100 leading-relaxed">
                <strong>Medical Warning:</strong> Consumption of expired packaged commodities poses acute risks of bacterial food poisoning, gastrointestinal distress, and enterotoxin ingestion. Immediate disposal is strongly recommended.
              </div>
            </div>
          )}

          {/* 1. Health Summary Banner */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              
              {/* Product Identity */}
              <div className="space-y-3 min-w-0">
                <div className="flex items-center gap-2 flex-wrap text-2xs">
                  <span className="font-bold text-neutral-800 bg-neutral-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider font-heading border border-neutral-200">
                    {currentAudit.brandName}
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="font-semibold text-neutral-600 bg-neutral-50 px-2.5 py-0.5 rounded-md border border-neutral-200">
                    {currentAudit.category}
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="font-mono font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-0.5 rounded-md border border-neutral-200">
                    REF: {currentAudit.id.substring(0, 8).toUpperCase()}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 font-heading tracking-tight leading-tight">
                  {currentAudit.commodityName}
                </h2>

                {/* Structured Packaging Declaration Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1 max-w-2xl">
                  <div className="bg-neutral-50/80 rounded-md p-2.5 border border-neutral-200/80 text-xs">
                    <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wider block">Serving Portion</span>
                    <strong className="text-neutral-900 font-mono block text-xs mt-0.5">{currentAudit.servingSize}</strong>
                  </div>
                  <div className="bg-neutral-50/80 rounded-md p-2.5 border border-neutral-200/80 text-xs">
                    <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wider block">Net Quantity</span>
                    <strong className="text-neutral-900 font-mono block text-xs mt-0.5">{currentAudit.netQuantity}</strong>
                  </div>
                  <div className="bg-neutral-50/80 rounded-md p-2.5 border border-neutral-200/80 text-xs">
                    <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wider block">Declared MRP</span>
                    <strong className="text-neutral-900 font-mono block text-xs mt-0.5">{currentAudit.mrp}</strong>
                  </div>
                  <div className="bg-neutral-50/80 rounded-md p-2.5 border border-neutral-200/80 text-xs">
                    <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wider block">Mfg Date</span>
                    <strong className="text-neutral-900 font-mono block text-xs mt-0.5">{currentAudit.mfgDate || 'Declared'}</strong>
                  </div>
                  <div className={`rounded-md p-2.5 border text-xs ${
                    currentAudit.isExpired 
                      ? 'bg-rose-50 border-rose-300 text-rose-900' 
                      : 'bg-neutral-50/80 border-neutral-200/80 text-neutral-900'
                  }`}>
                    <span className={`text-2xs font-medium uppercase tracking-wider block ${
                      currentAudit.isExpired ? 'text-rose-700 font-bold' : 'text-neutral-500'
                    }`}>
                      {currentAudit.isExpired ? 'Expired' : 'Expiry Date'}
                    </span>
                    <strong className={`font-mono block text-xs mt-0.5 ${currentAudit.isExpired ? 'text-rose-700 font-bold' : 'text-neutral-900'}`}>
                      {currentAudit.expiryDate || 'Not Declared'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Circular Score Gauge & Overall Verdict */}
              <div className="flex items-center gap-4 shrink-0 bg-neutral-50 p-4 rounded-lg border border-neutral-200 shadow-2xs">
                
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

            {/* Health Warning Badges: Premium Centerpiece Showcase */}
            <div className="pt-6 border-t border-slate-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <ShieldCheck size={18} weight="bold" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-950 font-heading uppercase tracking-wider">
                        Identified Nutritional Health Badges
                      </h3>
                      <span className="text-2xs font-mono font-bold bg-rose-100 text-rose-900 px-2.5 py-0.5 rounded-full border border-rose-200">
                        {currentAudit.badges.length} Critical Indicators
                      </span>
                    </div>
                    <p className="text-2xs text-slate-500 font-medium mt-0.5">
                      Clinical risk detection audited against ICMR-NIN 2024 &amp; WHO dietary thresholds
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-2xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    ICMR-NIN 2024 Standards
                  </span>
                </div>
              </div>

              {/* Large Premium Badges Grid */}
              <HealthBadgeGroup badges={currentAudit.badges} />
            </div>
          </div>

          {/* 2. DIRECT CONSUMER VERDICT: "Should We Eat It?" & "How Bad Is It?" */}
          {(currentAudit.shouldWeEatIt || currentAudit.howBadIsIt) && (
            <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-neutral-900 text-white flex items-center justify-center">
                    <Heartbeat size={18} weight="bold" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 font-heading uppercase tracking-wide">
                      Direct Consumer Health Verdict
                    </h3>
                    <span className="text-2xs text-neutral-500 font-medium">
                      Definitive recommendation synthesized by Multimodal Vision Agent
                    </span>
                  </div>
                </div>
                <span className="text-2xs font-mono font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded border border-neutral-200">
                  Plain-Language Summary
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Should We Eat It */}
                <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 font-heading uppercase tracking-wide">
                    <ShieldWarning size={16} className={currentAudit.ratingScore < 50 ? 'text-rose-600' : 'text-emerald-600'} weight="fill" />
                    <span>Should You Eat This?</span>
                  </div>
                  <p className="text-xs text-neutral-800 leading-relaxed font-medium">
                    {currentAudit.shouldWeEatIt || 'Consume with discretion according to your personal health goals and dietary restrictions.'}
                  </p>
                </div>

                {/* How Bad Is It */}
                <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 font-heading uppercase tracking-wide">
                    <WarningCircle size={16} className={currentAudit.ratingScore < 50 ? 'text-rose-600' : 'text-amber-600'} weight="fill" />
                    <span>How Bad Is It? (Clinical Assessment)</span>
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    {currentAudit.howBadIsIt || 'Detailed nutritional evaluation indicates high carbohydrate and sodium concentration.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. AGE RESTRICTIONS & AGE SUITABILITY */}
          {currentAudit.notEatableForAge && currentAudit.notEatableForAge.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
                    <UsersThree size={18} weight="bold" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 font-heading uppercase tracking-wide">
                      Age Restrictions &amp; Pediatric / Vulnerable Group Suitability
                    </h3>
                    <span className="text-2xs text-neutral-500 font-medium">
                      Age-stratified metabolic tolerance based on organ maturity and dietary upper limits
                    </span>
                  </div>
                </div>
                <span className="text-2xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200">
                  Strict Age Advisory
                </span>
              </div>

              <div className="space-y-2.5">
                {currentAudit.notEatableForAge.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 leading-relaxed flex items-start gap-3"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. HEALTH PROBLEMS FROM EXCESS CONSUMPTION */}
          {currentAudit.healthProblemsIfEatenMore && currentAudit.healthProblemsIfEatenMore.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-800 flex items-center justify-center border border-rose-200">
                    <WarningCircle size={18} weight="bold" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 font-heading uppercase tracking-wide">
                      Health Problems If Consumed Frequently or In Excess
                    </h3>
                    <span className="text-2xs text-neutral-500 font-medium">
                      Clinical pathology risks identified from ingredient chemistry and nutrient density
                    </span>
                  </div>
                </div>
                <span className="text-2xs font-semibold px-2.5 py-1 rounded bg-rose-50 text-rose-900 border border-rose-200">
                  Chronic Disease Risk
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentAudit.healthProblemsIfEatenMore.map((problem, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <span>{problem}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. PALM OIL & DECEPTIVE INGREDIENTS AUDIT */}
          {(currentAudit.hasPalmOil || (currentAudit.flaggedIngredients && currentAudit.flaggedIngredients.length > 0)) && (
            <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-neutral-900 text-white flex items-center justify-center">
                    <Drop size={18} weight="fill" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 font-heading uppercase tracking-wide">
                      Palm Oil &amp; Industrial Additives Inspection
                    </h3>
                    <span className="text-2xs text-neutral-500 font-medium">
                      Direct detection of low-cost industrial fats, sweeteners, and chemical additives
                    </span>
                  </div>
                </div>
                {currentAudit.hasPalmOil ? (
                  <span className="text-2xs font-bold px-2.5 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200 font-mono">
                    PALM OIL DETECTED
                  </span>
                ) : (
                  <span className="text-2xs font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                    NO PALM OIL FLAGGED
                  </span>
                )}
              </div>

              {/* Palm Oil Details Callout */}
              {currentAudit.hasPalmOil && currentAudit.palmOilDetails && (
                <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1.5">
                  <span className="text-xs font-bold text-neutral-900 font-heading block">
                    Palm Olein &amp; Saturated Lipid Burden
                  </span>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    {currentAudit.palmOilDetails}
                  </p>
                </div>
              )}

              {/* Flagged Ingredients Grid */}
              {currentAudit.flaggedIngredients && currentAudit.flaggedIngredients.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-2xs font-bold uppercase tracking-wider text-neutral-500 font-heading block">
                    Flagged Problematic Ingredients ({currentAudit.flaggedIngredients.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentAudit.flaggedIngredients.map((ing, idx) => (
                      <div key={idx} className="p-3 rounded-md bg-neutral-50 border border-neutral-200 text-xs space-y-0.5">
                        <span className="font-bold text-neutral-900 block">{ing.name}</span>
                        <span className="text-2xs text-neutral-600 block">{ing.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. Nutritional Breakdown Table vs ICMR Limits using NutrientRow */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-bold text-neutral-900 font-heading uppercase tracking-wider flex items-center gap-2">
                  <Scales size={16} className="text-neutral-900" weight="bold" />
                  <span>Nutritional Breakdown vs ICMR-NIN 2024 Limits</span>
                </h3>
                <p className="text-2xs text-neutral-500 mt-0.5">
                  Evaluated per 100g baseline and per serving against National Institute of Nutrition daily upper limits.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xs font-mono font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded border border-neutral-200">
                  {currentAudit.nutrients.length} Nutrients Extracted
                </span>
                <span className="text-2xs font-mono font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded border border-neutral-200">
                  ICMR-NIN Standards
                </span>
              </div>
            </div>

            {/* Grid of NutrientRow Components */}
            {currentAudit.nutrients && currentAudit.nutrients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {currentAudit.nutrients.map((nut, idx) => (
                  <NutrientRow key={idx} nutrient={nut} />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-neutral-500 bg-neutral-50 rounded-lg border border-neutral-200">
                Nutritional facts panel could not be clearly resolved from the uploaded photograph. Please ensure the nutrition table on the packaging back panel is clear and well-lit.
              </div>
            )}
          </div>

          {/* 7. MRP & Price Fairness Analysis Card */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200">
                  <CurrencyInr size={18} weight="bold" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 font-heading uppercase tracking-wide">
                    MRP &amp; Price Fairness Evaluation
                  </h3>
                  <span className="text-2xs text-neutral-500 font-medium">
                    Statutory Unit Sale Price (USP) validation under Legal Metrology Rule 6(11) &amp; Rule 6(1)(e)
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
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/80 space-y-1.5">
                <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wider block">
                  Declared Maximum Retail Price (MRP)
                </span>
                <span className="text-xl font-bold text-neutral-900 font-mono block">
                  {currentAudit.mrp}
                </span>
                <div className="text-2xs text-neutral-500 space-y-0.5 pt-1 border-t border-neutral-200/60">
                  <span>Net Quantity: <strong className="text-neutral-700">{currentAudit.netQuantity}</strong></span>
                  <span className="block text-neutral-400">Inclusive of all statutory taxes</span>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/80 space-y-1.5">
                <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wider block">
                  Calculated Unit Sale Price (USP)
                </span>
                <span className="text-xl font-bold text-neutral-900 font-mono block">
                  {currentAudit.pricePer100g}
                </span>
                <div className="text-2xs text-neutral-500 space-y-0.5 pt-1 border-t border-neutral-200/60">
                  <span>Serving Unit: <strong className="text-neutral-700">{currentAudit.servingSize}</strong></span>
                  <span className="block text-neutral-400">Standard metric baseline per 100g</span>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/80 space-y-1.5">
                <span className="text-2xs font-medium text-neutral-500 uppercase tracking-wider block">
                  Market Fairness Assessment
                </span>
                <p className="text-xs text-neutral-700 leading-relaxed pt-0.5">
                  {currentAudit.priceAnalysis}
                </p>
                <div className="text-2xs text-neutral-400 pt-1 border-t border-neutral-200/60">
                  Evaluated against FMCG packaged goods benchmark indices
                </div>
              </div>
            </div>
          </div>

          {/* 8. Two-Column Dietary Guidance & Healthier Alternatives using DietaryAdvisory */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200">
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
          <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center mx-auto border border-neutral-200">
            <Heartbeat size={24} weight="bold" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-neutral-900 font-heading">
              Ready for Multimodal Health &amp; Nutrition Verification
            </h3>
            <p className="text-xs text-neutral-500 max-w-lg mx-auto leading-relaxed">
              Upload photographs of both Front brand packaging and Rear nutrition facts table above to initiate autonomous multimodal health verification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-left">
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-xs font-bold text-neutral-900 font-heading block">
                Direct Multimodal Vision
              </span>
              <p className="text-2xs text-neutral-600 leading-relaxed">
                Direct visual extraction of packaging text, ingredients, nutrition numbers, and warnings without brittle OCR dependencies.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-xs font-bold text-neutral-900 font-heading block">
                ICMR-NIN &amp; Palm Oil Audit
              </span>
              <p className="text-2xs text-neutral-600 leading-relaxed">
                Flags palm oil, added sugars (&lt; 25g/day), sodium (&lt; 2000mg/day), and saturated fats with clinical risk badges.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
              <span className="text-xs font-bold text-neutral-900 font-heading block">
                Age &amp; Disease Restrictions
              </span>
              <p className="text-2xs text-neutral-600 leading-relaxed">
                Identifies age contraindications (e.g. toddlers, pediatric limits) and chronic disease risks (hypertension, NAFLD, diabetes).
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
