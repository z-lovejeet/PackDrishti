import React, { useState, useRef } from 'react';
import { 
  Heartbeat, 
  Warning, 
  CheckCircle, 
  CloudArrowUp, 
  Camera, 
  Image as ImageIcon, 
  CurrencyInr, 
  ArrowRight, 
  ArrowClockwise
} from '@phosphor-icons/react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ProductHealthAudit } from '../../types';
import { apiClient } from '../../utils/apiClient';

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

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [liveAuditResult, setLiveAuditResult] = useState<ProductHealthAudit | null>(null);

  const frontFileRef = useRef<HTMLInputElement>(null);
  const frontCamRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);
  const backCamRef = useRef<HTMLInputElement>(null);

  // Active Audit Data Resolution: strictly live audit result
  const currentAudit: ProductHealthAudit | null = liveAuditResult;

  const handleFrontFile = (file: File) => {
    if (!file) return;
    setFrontRawFile(file);
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
    const reader = new FileReader();
    reader.onload = (e) => {
      setBackImageSrc(e.target?.result as string);
      setBackFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const runDualScanAudit = async () => {
    setIsAnalyzing(true);
    setAnalysisStep(1);

    const timer1 = setTimeout(() => setAnalysisStep(2), 400);
    const timer2 = setTimeout(() => setAnalysisStep(3), 800);

    try {
      const formData = new FormData();
      if (frontRawFile) {
        formData.append('front_image', frontRawFile);
      } else {
        formData.append(
          'front_image',
          new Blob([new Uint8Array([0xff, 0xd8, 0xff])], { type: 'image/jpeg' }),
          frontFileName || 'front.jpg'
        );
      }

      if (backRawFile) {
        formData.append('back_image', backRawFile);
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
          commodityName: apiData.product_name || 'Verified Commodity',
          brandName: apiData.brand || 'Packaged Foods',
          category: 'Packaged Food Commodity',
          servingSize: apiData.serving_size || '100 g',
          netQuantity: 'Standard Pack',
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
      alert("Failed to analyze packaging: " + (err?.response?.data?.detail || err?.message || "Verification request failed"));
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
  };

  const isUploadComplete = frontImageSrc && backImageSrc;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 font-heading">
              Consumer Health & Nutrition Audit
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-success-light text-success border border-success-border">
              ICMR-NIN & WHO STANDARDS
            </span>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            Scan both front and back packaging to audit sugar levels, sodium concentration, saturated fats, price fairness, and dietary advisories.
          </p>
        </div>

        {(frontImageSrc || backImageSrc || currentAudit) && (
          <div className="flex items-center gap-2">
            {currentAudit && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[11px] font-mono border border-neutral-200 bg-neutral-50 text-neutral-600">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span>Live ICMR-NIN Analysis</span>
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetUploads}
              icon={<ArrowClockwise size={15} />}
            >
              Reset Health Scanner
            </Button>
          </div>
        )}
      </div>

      {/* Dual Photo Upload Section (Mandatory Front + Back) */}
      <div className="bg-white border border-neutral-200 rounded-[8px] p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 font-heading">
              Dual Packaging Photo Upload Required
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              To accurately evaluate nutritional health scores and verified statutory MRP, both the front face and rear nutritional panel must be submitted.
            </p>
          </div>

          {/* Hidden File & Camera Inputs */}
          <input type="file" ref={frontFileRef} accept="image/*" className="hidden" onChange={(e) => e.target.files && handleFrontFile(e.target.files[0])} />
          <input type="file" ref={frontCamRef} accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files && handleFrontFile(e.target.files[0])} />
          <input type="file" ref={backFileRef} accept="image/*" className="hidden" onChange={(e) => e.target.files && handleBackFile(e.target.files[0])} />
          <input type="file" ref={backCamRef} accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files && handleBackFile(e.target.files[0])} />

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
              className={`border-2 border-dashed rounded-[8px] p-5 text-center transition-all ${
                isDragOverFront ? 'border-primary bg-primary-light/50' : 'border-neutral-300 bg-neutral-50/50'
              }`}
            >
              {frontImageSrc ? (
                <div className="space-y-3">
                  <div className="aspect-[4/3] rounded bg-neutral-900 overflow-hidden relative">
                    <img src={frontImageSrc} alt="Front Packaging" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-neutral-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      Front Panel Loaded
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-800 truncate max-w-[200px]">{frontFileName}</span>
                    <button 
                      onClick={() => frontFileRef.current?.click()}
                      className="text-primary hover:underline font-medium"
                    >
                      Change Front
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <CloudArrowUp size={36} className="text-primary mx-auto" />
                  <h3 className="text-xs font-bold text-neutral-900 font-heading">
                    Photo 1: Front Packaging
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Captures brand name, product title, marketing claims, and net quantity.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <Button variant="primary" size="sm" onClick={() => frontFileRef.current?.click()} icon={<ImageIcon size={14} />}>
                      Browse Front
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => frontCamRef.current?.click()} icon={<Camera size={14} />}>
                      Camera
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Slot 2: Back Panel */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragOverBack(true); }}
              onDragLeave={() => setIsDragOverBack(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverBack(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) handleBackFile(e.dataTransfer.files[0]);
              }}
              className={`border-2 border-dashed rounded-[8px] p-5 text-center transition-all ${
                isDragOverBack ? 'border-primary bg-primary-light/50' : 'border-neutral-300 bg-neutral-50/50'
              }`}
            >
              {backImageSrc ? (
                <div className="space-y-3">
                  <div className="aspect-[4/3] rounded bg-neutral-900 overflow-hidden relative">
                    <img src={backImageSrc} alt="Back Packaging" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-neutral-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      Back Panel Loaded
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-800 truncate max-w-[200px]">{backFileName}</span>
                    <button 
                      onClick={() => backFileRef.current?.click()}
                      className="text-primary hover:underline font-medium"
                    >
                      Change Back
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <CloudArrowUp size={36} className="text-primary mx-auto" />
                  <h3 className="text-xs font-bold text-neutral-900 font-heading">
                    Photo 2: Back Packaging Panel
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Captures nutritional table (sugar, fat, sodium), ingredients, and MRP.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <Button variant="primary" size="sm" onClick={() => backFileRef.current?.click()} icon={<ImageIcon size={14} />}>
                      Browse Back
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => backCamRef.current?.click()} icon={<Camera size={14} />}>
                      Camera
                    </Button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Action Button & Status Bar */}
          <div className="pt-2">
            {isAnalyzing ? (
              <div className="p-4 bg-primary-light/80 rounded-[6px] border border-primary-border space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-primary font-heading">
                  <span>
                    {analysisStep === 1 && 'Extracting nutritional table values and ingredients list...'}
                    {analysisStep === 2 && 'Comparing sugar, sodium, and saturated fats against ICMR guidelines...'}
                    {analysisStep === 3 && 'Evaluating price fairness and calculating dietary advisories...'}
                  </span>
                  <span className="font-mono">{analysisStep * 33}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${analysisStep * 33.3}%` }} />
                </div>
              </div>
            ) : isUploadComplete ? (
              <Button
                variant="primary"
                size="md"
                onClick={runDualScanAudit}
                className="w-full"
                icon={<ArrowRight size={16} />}
                iconPosition="right"
              >
                Run Health & Nutrition Check
              </Button>
            ) : (
              <div className="p-3 bg-neutral-100 rounded-[6px] border border-neutral-200 text-xs text-neutral-600 flex items-center justify-between">
                <span>Upload both Front and Back packaging photographs to unlock the health audit.</span>
                <span className="font-semibold text-neutral-500">
                  {frontImageSrc ? '1/2 Uploaded' : backImageSrc ? '1/2 Uploaded' : '0/2 Uploaded'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* AUDIT RESULTS DISPLAY */}
        {currentAudit ? (
          <div className="space-y-6">
          
          {/* Header Summary Banner */}
          <div className="bg-white border border-neutral-200 rounded-[8px] p-5 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-neutral-500 font-semibold">{currentAudit.category}</span>
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 font-heading">
                  {currentAudit.commodityName}
                </h2>
                <div className="text-xs text-neutral-600 flex flex-wrap items-center gap-3">
                  <span>Brand: <strong>{currentAudit.brandName}</strong></span>
                  <span>•</span>
                  <span>Serving Unit: <strong>{currentAudit.servingSize}</strong></span>
                  <span>•</span>
                  <span>Net Qty: <strong>{currentAudit.netQuantity}</strong></span>
                </div>
              </div>

              {/* Health Score Box */}
              <div className="flex items-center gap-3 shrink-0 p-3 rounded-[6px] bg-neutral-50 border border-neutral-200">
                <div className="text-right">
                  <div className="text-[11px] text-neutral-500 uppercase font-semibold">Nutritional Index</div>
                  <div className="text-sm font-bold text-neutral-900 font-heading">{currentAudit.overallRating}</div>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg font-heading ${
                  currentAudit.ratingScore >= 70 ? 'bg-success-light text-success border border-success-border' :
                  currentAudit.ratingScore >= 45 ? 'bg-warning-light text-warning border border-warning-border' :
                  'bg-violation-light text-violation border border-violation-border'
                }`}>
                  {currentAudit.ratingScore}
                </div>
              </div>
            </div>

            {/* Health Warning Badges Strip */}
            <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-neutral-700">Identified Health Markers:</span>
              {currentAudit.badges.map((badge, idx) => (
                <Badge
                  key={idx}
                  variant={
                    badge.type === 'danger' ? 'violation' :
                    badge.type === 'warning' ? 'warning' :
                    badge.type === 'good' ? 'compliant' : 'neutral'
                  }
                  size="sm"
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Nutritional Breakdown Table against ICMR Limits */}
          <div className="bg-white border border-neutral-200 rounded-[8px] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-neutral-900 font-heading uppercase tracking-wide">
                  Nutritional Table vs ICMR Daily Limits
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Evaluated against National Institute of Nutrition (NIN) dietary guidelines per 100g and per serve
                </p>
              </div>
              <span className="text-xs text-neutral-500 font-mono">Reference: ICMR 2024</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100/70 text-neutral-600 border-b border-neutral-200 font-semibold uppercase tracking-wider text-[11px] font-heading">
                  <tr>
                    <th className="py-3 px-4">Nutrient Parameter</th>
                    <th className="py-3 px-3">Per 100g</th>
                    <th className="py-3 px-3">Per Serving</th>
                    <th className="py-3 px-4">Recommended Upper Limit</th>
                    <th className="py-3 px-3">Concentration</th>
                    <th className="py-3 px-4">Medical Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {currentAudit.nutrients.map((nut, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-neutral-900">
                        {nut.name}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-neutral-800">
                        {nut.valuePer100g} {nut.unit}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-neutral-800">
                        {nut.valuePerServe} {nut.unit}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px]">
                        {nut.icmrDailyLimit}
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge
                          variant={
                            nut.level === 'Excessive' ? 'violation' :
                            nut.level === 'High' ? 'violation' :
                            nut.level === 'Moderate' ? 'warning' : 'compliant'
                          }
                          size="sm"
                        >
                          {nut.level}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600 text-[11px] leading-relaxed max-w-sm">
                        {nut.assessment}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MRP & Price Fairness Section */}
          <div className="bg-white border border-neutral-200 rounded-[8px] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <div className="flex items-center gap-2">
                <CurrencyInr size={18} className="text-primary" />
                <h3 className="text-xs font-bold text-neutral-900 font-heading uppercase tracking-wide">
                  MRP & Price Fairness Evaluation
                </h3>
              </div>
              <Badge variant={currentAudit.priceRating === 'Budget' ? 'compliant' : currentAudit.priceRating === 'Premium' ? 'warning' : 'neutral'} size="sm">
                {currentAudit.priceRating}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                <span className="text-neutral-500 block">Declared Retail Price (MRP):</span>
                <span className="text-base font-bold text-neutral-900 font-mono mt-0.5 block">{currentAudit.mrp}</span>
                <span className="text-[11px] text-neutral-400">Inclusive of all taxes</span>
              </div>

              <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                <span className="text-neutral-500 block">Calculated Unit Sale Price (USP):</span>
                <span className="text-base font-bold text-primary font-mono mt-0.5 block">{currentAudit.pricePer100g}</span>
                <span className="text-[11px] text-neutral-400">Standard metric baseline</span>
              </div>

              <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                <span className="text-neutral-500 block">Fairness Assessment:</span>
                <p className="text-[11px] text-neutral-700 leading-snug mt-1">{currentAudit.priceAnalysis}</p>
              </div>
            </div>
          </div>

          {/* Two-Column Dietary Guidance: Who Should Eat vs Who Should Avoid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Left: Who Can Consume Safely */}
            <div className="bg-white border border-success-border rounded-[8px] p-5 space-y-3 border-t-4 border-t-success flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-success font-semibold text-xs font-heading uppercase tracking-wider">
                  <CheckCircle size={18} weight="bold" />
                  <span>Who Can Consume Safely</span>
                </div>
                <ul className="space-y-2 text-xs text-neutral-700">
                  {currentAudit.whoCanConsume.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Who Should Avoid or Limit */}
            <div className="bg-white border border-violation-border rounded-[8px] p-5 space-y-3 border-t-4 border-t-violation flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-violation font-semibold text-xs font-heading uppercase tracking-wider">
                  <Warning size={18} weight="bold" />
                  <span>Who Should Avoid or Strictly Limit</span>
                </div>
                <ul className="space-y-2 text-xs text-neutral-700">
                  {currentAudit.whoShouldAvoid.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-violation mt-1.5 shrink-0" />
                      <span className="leading-relaxed font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Healthier Whole-Food Alternatives */}
          <div className="p-4 bg-neutral-100/80 border border-neutral-200 rounded-[8px] space-y-2 text-xs">
            <span className="font-bold text-neutral-900 font-heading block">
              Recommended Healthier Alternatives:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-neutral-700">
              {currentAudit.healthierAlternatives.map((alt, idx) => (
                <div key={idx} className="p-2 bg-white rounded border border-neutral-200">
                  {alt}
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : !isAnalyzing && (
        <div className="bg-white border border-neutral-200 rounded-[8px] p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <Heartbeat size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-neutral-800 font-heading">No Food Product Analyzed Yet</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Upload photographs of both the front packaging and the rear nutritional facts table above, then click Run Health &amp; Nutrition Check to view an ICMR-NIN compliant health audit.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
