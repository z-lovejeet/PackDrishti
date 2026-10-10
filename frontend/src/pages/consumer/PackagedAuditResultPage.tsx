import React, { useState } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  Warning,
  WarningCircle,
  XCircle,
  CheckCircle,
  Plant,
  Barcode,
  Scales,
  Plus,
} from "@phosphor-icons/react";
import { PackagedAuditResultData } from "../../types/models";
import { apiClient } from "../../utils/apiClient";
import { useDiaryStore } from "../../store/useDiaryStore";

interface PackagedAuditResultPageProps {
  auditData: PackagedAuditResultData | null;
  onNavigate: (page: string) => void;
  onSuccessToast?: (title: string, message: string) => void;
}

export const PackagedAuditResultPage: React.FC<PackagedAuditResultPageProps> = ({
  auditData,
  onNavigate,
  onSuccessToast,
}) => {
  const { activeDate, fetchDiary } = useDiaryStore();

  const netQty = auditData?.netQuantityG || 100;
  const [portionMode, setPortionMode] = useState<"half" | "full" | "custom">("full");
  const [customGrams, setCustomGrams] = useState<number>(netQty);
  const [selectedSlot, setSelectedSlot] = useState<"breakfast" | "lunch" | "dinner" | "snack">(
    "snack"
  );
  const [isLogging, setIsLogging] = useState<boolean>(false);
  const [logSuccess, setLogSuccess] = useState<boolean>(false);
  const [logError, setLogError] = useState<string | null>(null);

  if (!auditData) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-16 px-4 flex flex-col items-center justify-center text-center">
        <Barcode size={48} className="text-slate-400 mb-3" />
        <h2 className="text-lg font-heading font-bold text-slate-900">
          No Packaged Food Audit Selected
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
          Please scan a packaged food item with front and back panels to view the full clinical audit.
        </p>
        <button
          type="button"
          onClick={() => onNavigate("packaged")}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          Open Packaged Food Scanner
        </button>
      </div>
    );
  }

  const activePortionGrams =
    portionMode === "half"
      ? Math.max(1, Math.round(netQty / 2))
      : portionMode === "full"
      ? netQty
      : customGrams;

  const scaleFactor = activePortionGrams / 100.0;
  const nut = auditData.nutrientsPer100g || {
    energyKcal: 0,
    proteinG: 0,
    totalCarbsG: 0,
    totalSugarsG: 0,
    addedSugarsG: 0,
    totalFatG: 0,
    saturatedFatG: 0,
    transFatG: 0,
    sodiumMg: 0,
    dietaryFiberG: 0,
  };

  const scaledCalories = Math.round(nut.energyKcal * scaleFactor);
  const scaledProtein = Number((nut.proteinG * scaleFactor).toFixed(1));
  const scaledCarbs = Number((nut.totalCarbsG * scaleFactor).toFixed(1));
  const scaledFat = Number((nut.totalFatG * scaleFactor).toFixed(1));
  const scaledSodium = Math.round(nut.sodiumMg * scaleFactor);
  const scaledSugar = Number(((nut.addedSugarsG || nut.totalSugarsG) * scaleFactor).toFixed(1));

  // Handle Log to Diary
  const handleLogToDiary = async () => {
    setIsLogging(true);
    setLogError(null);

    try {
      await apiClient.post("/packaged/log-to-diary", {
        audit_id: auditData.auditId,
        consumed_grams: activePortionGrams,
        meal_type: selectedSlot,
        diary_date: activeDate,
      });

      await fetchDiary(activeDate);
      setLogSuccess(true);
      if (onSuccessToast) {
        onSuccessToast(
          "Logged to Diary",
          `Added ${activePortionGrams}g of ${auditData.productName} to ${selectedSlot}`
        );
      }
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail || "Failed to log packaged food to diary.";
      setLogError(detail);
    } finally {
      setIsLogging(false);
    }
  };

  // Health Score Colors
  const score = auditData.healthScore;
  const scoreColor =
    score >= 70
      ? "text-emerald-600 border-emerald-500 bg-emerald-50"
      : score >= 45
      ? "text-amber-600 border-amber-500 bg-amber-50"
      : "text-rose-600 border-rose-500 bg-rose-50";

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28 md:pb-16 pt-4 sm:pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate("packaged")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft size={16} />
            <span>Back to Scanner</span>
          </button>

          <span className="text-2xs font-mono uppercase tracking-wider text-slate-500">
            Audit ID: {auditData.auditId.slice(0, 8)}
          </span>
        </div>

        {/* Product Identity & Health Score Hero Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {auditData.brandName || "Brand Verified"}
              </span>
              <span className="text-2xs font-mono text-slate-500">
                {auditData.category}
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-950">
              {auditData.productName}
            </h1>

            {/* Economic & Weight Details */}
            <div className="flex items-center gap-4 text-xs font-mono text-slate-600 pt-1">
              {auditData.mrp && (
                <span>MRP: ₹{auditData.mrp}</span>
              )}
              {auditData.netQuantityG && (
                <span>Pack: {auditData.netQuantityG}g</span>
              )}
              {auditData.pricePer100g && (
                <span>₹{auditData.pricePer100g}/100g ({auditData.priceRating || "Fair"})</span>
              )}
            </div>

            {/* Expiry Badge */}
            <div className="pt-1">
              {auditData.isExpired ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-100 text-rose-800 text-2xs font-bold font-mono">
                  <XCircle size={14} weight="bold" />
                  <span>CRITICAL HAZARD: EXPIRED PRODUCT</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-2xs font-mono">
                  <ShieldCheck size={14} weight="bold" />
                  <span>Valid Shelf Life • Fit for consumption</span>
                </div>
              )}
            </div>
          </div>

          {/* 0-100 Health Score Dial */}
          <div className="flex flex-col items-center justify-center shrink-0 p-4 rounded-2xl border-2 bg-white shadow-xs min-w-[150px]">
            <div className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center ${scoreColor}`}>
              <span className="font-heading font-extrabold text-2xl leading-none">
                {Math.round(score)}
              </span>
              <span className="text-[10px] font-mono font-semibold uppercase">/ 100</span>
            </div>
            <span className="font-heading font-bold text-xs text-slate-900 mt-2 text-center">
              {auditData.scoreBand || "Health Score"}
            </span>
          </div>
        </div>

        {/* STICKY "LOG TO DIARY" INTERACTIVE ACTION CARD */}
        <div className="bg-slate-950 text-white p-5 sm:p-6 rounded-2xl border border-slate-900 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Plus size={18} weight="bold" className="text-emerald-400" />
              <h3 className="font-heading font-bold text-sm text-white">
                Log Packaged Food to Diary
              </h3>
            </div>
            <span className="text-2xs font-mono text-slate-400">
              Auto-calculates proportional macros
            </span>
          </div>

          {/* Portion Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-2xs font-mono uppercase text-slate-400 block mb-2">
                Select Consumed Portion:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPortionMode("half")}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold font-mono transition-all ${
                    portionMode === "half"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  Half ({Math.round(netQty / 2)}g)
                </button>
                <button
                  type="button"
                  onClick={() => setPortionMode("full")}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold font-mono transition-all ${
                    portionMode === "full"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  Full ({netQty}g)
                </button>
                <button
                  type="button"
                  onClick={() => setPortionMode("custom")}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold font-mono transition-all ${
                    portionMode === "custom"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  Custom
                </button>
              </div>

              {portionMode === "custom" && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    value={customGrams}
                    onChange={(e) => setCustomGrams(Math.max(1, Number(e.target.value) || 1))}
                    className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                  />
                  <span className="text-xs text-slate-400 font-mono">grams consumed</span>
                </div>
              )}
            </div>

            {/* Target Meal Slot */}
            <div>
              <span className="text-2xs font-mono uppercase text-slate-400 block mb-2">
                Target Meal Slot:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {(["breakfast", "lunch", "dinner", "snack"] as const).map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-1 rounded-lg text-2xs font-semibold capitalize font-mono transition-all ${
                      selectedSlot === slot
                        ? "bg-white text-slate-950 font-bold"
                        : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scaled Macros Yield Bar */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-2xs font-mono">
            <div>
              <span className="text-white font-bold block text-xs">{scaledCalories} kcal</span>
              <span className="text-slate-400">Calories</span>
            </div>
            <div>
              <span className="text-indigo-400 font-bold block text-xs">{scaledProtein}g</span>
              <span className="text-slate-400">Protein</span>
            </div>
            <div>
              <span className="text-cyan-400 font-bold block text-xs">{scaledCarbs}g</span>
              <span className="text-slate-400">Carbs</span>
            </div>
            <div>
              <span className="text-amber-400 font-bold block text-xs">{scaledFat}g</span>
              <span className="text-slate-400">Fat</span>
            </div>
            <div>
              <span className="text-rose-400 font-bold block text-xs">{scaledSodium}mg</span>
              <span className="text-slate-400">Sodium</span>
            </div>
            <div>
              <span className="text-slate-200 font-bold block text-xs">{scaledSugar}g</span>
              <span className="text-slate-400">Sugar</span>
            </div>
          </div>

          {logError && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <WarningCircle size={16} weight="bold" className="shrink-0" />
              <span>{logError}</span>
            </div>
          )}

          {/* One-Tap Commit Button */}
          <button
            type="button"
            onClick={handleLogToDiary}
            disabled={isLogging || logSuccess}
            className={`w-full py-3 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
              logSuccess
                ? "bg-emerald-600 text-white"
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold"
            }`}
          >
            {logSuccess ? (
              <>
                <CheckCircle size={18} weight="bold" />
                <span>Successfully Logged to {selectedSlot.toUpperCase()}</span>
              </>
            ) : isLogging ? (
              <span>Logging to Today's Diary...</span>
            ) : (
              <>
                <Plus size={16} weight="bold" />
                <span>Log to Today's Diary ({activePortionGrams}g)</span>
              </>
            )}
          </button>
        </div>

        {/* Personalized Clinical Contraindication Alerts */}
        {auditData.contraindicationAlerts && auditData.contraindicationAlerts.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 text-rose-800">
              <Warning size={18} weight="bold" />
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider">
                Clinical Health Contraindications
              </h4>
            </div>
            <div className="space-y-1.5">
              {auditData.contraindicationAlerts.map((alt, idx) => (
                <div key={idx} className="text-xs text-rose-950 leading-relaxed pl-2 border-l-2 border-rose-400">
                  <span className="font-bold">{alt.condition}: </span>
                  <span>{alt.alert}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critical Health Risk Badges */}
        {auditData.badges && auditData.badges.length > 0 && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="font-heading font-bold text-xs text-slate-800 uppercase tracking-wider">
              Product Attribute Badges
            </h4>
            <div className="flex flex-wrap gap-2">
              {auditData.badges.map((b, idx) => {
                const isDanger = b.severity === "danger";
                const isWarn = b.severity === "warning";
                const isGood = b.severity === "good";
                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono ${
                      isDanger
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : isWarn
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : isGood
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {isDanger && <XCircle size={14} weight="bold" />}
                    {isWarn && <Warning size={14} weight="bold" />}
                    {isGood && <CheckCircle size={14} weight="bold" />}
                    <span>{b.label}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* 3-Tier Additive & Chemical Dye Audit Table */}
        {auditData.additivesAudit && auditData.additivesAudit.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scales size={18} className="text-slate-600" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900">
                  Food Additives &amp; Chemical Dye Audit
                </h4>
              </div>
              <span className="text-2xs font-mono text-slate-500">
                ICMR &amp; FSSAI Classifications
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {auditData.additivesAudit.map((item, idx) => {
                const isGradeA = item.grade.includes("Grade A");
                const isGradeB = item.grade.includes("Grade B");
                return (
                  <div key={idx} className="p-4 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.name}</span>
                        {item.code && (
                          <span className="text-2xs font-mono text-slate-500">
                            ({item.code})
                          </span>
                        )}
                      </div>
                      {item.advisory && (
                        <p className="text-2xs text-slate-600 mt-1 leading-relaxed">
                          {item.advisory}
                        </p>
                      )}
                    </div>

                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-md text-2xs font-mono font-bold ${
                        isGradeA
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : isGradeB
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {item.grade}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Nutrition Table vs ICMR-NIN 2024 Benchmarks */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900">
              Declared Nutrition (per 100g)
            </h4>
            <span className="text-2xs font-mono text-slate-500">
              ICMR-NIN 2024 Reference
            </span>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-slate-200 text-2xs uppercase text-slate-500">
                  <th className="pb-2 font-semibold">Nutrient</th>
                  <th className="pb-2 font-semibold text-right">Per 100g</th>
                  <th className="pb-2 font-semibold text-right">In This Pack ({netQty}g)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 text-slate-800">Energy (kcal)</td>
                  <td className="py-2 text-right font-bold text-slate-900">{nut.energyKcal}</td>
                  <td className="py-2 text-right">{Math.round(nut.energyKcal * (netQty / 100))}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-800">Protein (g)</td>
                  <td className="py-2 text-right font-bold text-slate-900">{nut.proteinG}</td>
                  <td className="py-2 text-right">{(nut.proteinG * (netQty / 100)).toFixed(1)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-800">Carbohydrates (g)</td>
                  <td className="py-2 text-right font-bold text-slate-900">{nut.totalCarbsG}</td>
                  <td className="py-2 text-right">{(nut.totalCarbsG * (netQty / 100)).toFixed(1)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-800">Added Sugars (g)</td>
                  <td className="py-2 text-right font-bold text-amber-600">{nut.addedSugarsG}</td>
                  <td className="py-2 text-right">{(nut.addedSugarsG * (netQty / 100)).toFixed(1)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-800">Total Fats (g)</td>
                  <td className="py-2 text-right font-bold text-slate-900">{nut.totalFatG}</td>
                  <td className="py-2 text-right">{(nut.totalFatG * (netQty / 100)).toFixed(1)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-800">Sodium (mg)</td>
                  <td className="py-2 text-right font-bold text-rose-600">{nut.sodiumMg}</td>
                  <td className="py-2 text-right">{Math.round(nut.sodiumMg * (netQty / 100))}</td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-800">Dietary Fiber (g)</td>
                  <td className="py-2 text-right font-bold text-emerald-600">{nut.dietaryFiberG}</td>
                  <td className="py-2 text-right">{(nut.dietaryFiberG * (netQty / 100)).toFixed(1)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Healthier Whole-Food Alternatives */}
        {auditData.healthierAlternatives && auditData.healthierAlternatives.length > 0 && (
          <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800">
              <Plant size={18} weight="fill" />
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider">
                Healthier Indian Whole-Food Alternatives
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {auditData.healthierAlternatives.map((alt, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-emerald-200 text-xs">
                  <span className="font-bold text-slate-900 block">{alt}</span>
                  <span className="text-2xs text-slate-500 mt-1 block">
                    Zero synthetic additives • Clean nutritional profile
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
