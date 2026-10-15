import React, { useState, useMemo } from "react";
import {
  X,
  User,
  Heartbeat,
  Sparkle,
  CheckCircle,
  ArrowRight,
  Flame,
} from "@phosphor-icons/react";
import { useProfileStore } from "../../store/useProfileStore";
import { useDiaryStore } from "../../store/useDiaryStore";
import { useAuthStore } from "../../store/authStore";
import type { UserProfileData } from "../../types/models";

interface BiometricOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const MEDICAL_CONDITIONS = [
  { key: "type_2_diabetes", label: "Type 2 Diabetes / Prediabetes", desc: "Clamps carb ceiling & sugar floor" },
  { key: "hypertension", label: "Hypertension (High BP)", desc: "Enforces 1,500mg daily sodium ceiling" },
  { key: "dyslipidemia", label: "Dyslipidemia (High Cholesterol)", desc: "Restricts saturated fat & zero trans fats" },
  { key: "nafld", label: "Fatty Liver (NAFLD)", desc: "Bans industrial fructose & palm oils" },
  { key: "pcos", label: "PCOS / PCOD", desc: "Low-insulinemic complex carb focus" },
  { key: "hypothyroidism", label: "Hypothyroidism", desc: "Monitors metabolic rate & micronutrients" },
  { key: "ckd", label: "Chronic Kidney Disease (CKD)", desc: "Caps dietary protein to 0.8g/kg" },
];

const ACTIVITY_LEVELS = [
  { key: "sedentary", label: "Sedentary", desc: "Desk job, < 5,000 steps/day" },
  { key: "lightly_active", label: "Lightly Active", desc: "1-3 workout days/wk" },
  { key: "moderately_active", label: "Moderately Active", desc: "3-5 workout days/wk" },
  { key: "very_active", label: "Very Active", desc: "6-7 hard training days" },
  { key: "extra_active", label: "Extra Active", desc: "Heavy physical labor / athletes" },
] as const;

const GOALS = [
  { key: "moderate_fat_loss", label: "Moderate Fat Loss", desc: "-15% deficit for sustainable fat reduction" },
  { key: "rapid_fat_loss", label: "Rapid Fat Loss", desc: "-25% deficit with high protein retention" },
  { key: "maintenance", label: "Metabolic Maintenance", desc: "Maintain current weight and energy balance" },
  { key: "clean_lean_bulk", label: "Clean Muscle Gain", desc: "+12% caloric surplus for lean hypertrophy" },
  { key: "aggressive_hypertrophy", label: "Aggressive Hypertrophy", desc: "+20% surplus for strength & mass" },
  { key: "metabolic_reversal", label: "Metabolic Stabilization", desc: "Balanced glycemic control & insulin reset" },
] as const;

const DIET_TYPES = [
  { key: "standard_omnivore", label: "Standard Omnivore" },
  { key: "vegetarian", label: "Vegetarian (Lacto)" },
  { key: "eggetarian", label: "Eggetarian" },
  { key: "vegan", label: "Vegan (Plant-Based)" },
  { key: "jain", label: "Jain (Strict Vegetarian)" },
  { key: "sattvic", label: "Sattvic Ayurvedic" },
] as const;

export const BiometricOnboardingModal: React.FC<BiometricOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { user } = useAuthStore();
  const { profile, updateProfile, calculateLivePreview } = useProfileStore();
  const { fetchDiary, activeDate } = useDiaryStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [age, setAge] = useState<number>(profile?.age || 28);
  const [biologicalSex, setBiologicalSex] = useState<"male" | "female">(
    profile?.biologicalSex || "male"
  );
  const [heightCm, setHeightCm] = useState<number>(profile?.heightCm || 172);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(
    profile?.currentWeightKg || 72
  );
  const [targetWeightKg, setTargetWeightKg] = useState<number>(
    profile?.targetWeightKg || 68
  );
  const [activityLevel, setActivityLevel] = useState<
    "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extra_active"
  >(profile?.activityLevel || "moderately_active");
  const [primaryGoal, setPrimaryGoal] = useState<
    "rapid_fat_loss" | "moderate_fat_loss" | "maintenance" | "clean_lean_bulk" | "aggressive_hypertrophy" | "metabolic_reversal"
  >(profile?.primaryGoal || "moderate_fat_loss");
  const [dietType, setDietType] = useState<
    "standard_omnivore" | "vegetarian" | "vegan" | "eggetarian" | "jain" | "sattvic"
  >((profile?.dietType as any) || "vegetarian");
  const [conditions, setConditions] = useState<string[]>(profile?.conditions || []);

  // Live Metabolic Calculation
  const livePreview = useMemo(() => {
    return calculateLivePreview({
      age,
      biologicalSex,
      heightCm,
      currentWeightKg,
      targetWeightKg,
      activityLevel,
      primaryGoal,
      dietType,
      conditions,
    });
  }, [
    age,
    biologicalSex,
    heightCm,
    currentWeightKg,
    targetWeightKg,
    activityLevel,
    primaryGoal,
    dietType,
    conditions,
    calculateLivePreview,
  ]);

  if (!isOpen) return null;

  const toggleCondition = (key: string) => {
    setConditions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const payload: Partial<UserProfileData> = {
        age,
        biologicalSex,
        heightCm,
        currentWeightKg,
        targetWeightKg,
        activityLevel,
        primaryGoal,
        dietType,
        conditions,
      };

      await updateProfile(payload);

      // Save onboarding completion flag for this user
      if (user?.id) {
        localStorage.setItem(`biteiq_onboarding_${user.id}`, "true");
      }
      localStorage.setItem("biteiq_onboarding_completed", "true");

      // Refresh diary calculations
      await fetchDiary(activeDate);

      if (onComplete) onComplete();
      onClose();
    } catch {
      alert("Failed to save health profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-slideUp text-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-modal-title"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200/90 px-6 py-4 bg-slate-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Sparkle size={20} weight="fill" />
            </div>
            <div>
              <span className="text-2xs font-mono uppercase tracking-wider text-emerald-400 font-semibold block">
                Clinical Onboarding • ICMR-NIN 2024
              </span>
              <h2 id="onboarding-modal-title" className="text-base font-bold font-heading text-white">
                Configure Your Metabolic Profile
              </h2>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-colors ${
                  step === s
                    ? "bg-emerald-500 text-slate-950"
                    : step > s
                    ? "bg-slate-800 text-emerald-400 border border-emerald-500/40"
                    : "bg-slate-900 text-slate-500 border border-slate-800"
                }`}
              >
                {step > s ? <CheckCircle size={14} weight="bold" /> : s}
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* STEP 1: Biometrics */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold font-heading text-slate-950 uppercase tracking-wide">
                  Step 1: Biological &amp; Anthropometric Metrics
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  These metrics calculate your Basal Metabolic Rate (BMR) via the clinically validated Mifflin-St Jeor equation.
                </p>
              </div>

              {/* Sex Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Biological Sex
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBiologicalSex("male")}
                    className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      biologicalSex === "male"
                        ? "bg-slate-950 text-white border-slate-950 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setBiologicalSex("female")}
                    className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      biologicalSex === "female"
                        ? "bg-slate-950 text-white border-slate-950 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Age, Height, Weights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="14"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(Math.max(14, Math.min(100, Number(e.target.value))))}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="120"
                    max="230"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Math.max(120, Math.min(230, Number(e.target.value))))}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Current Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="35"
                    max="220"
                    step="0.5"
                    value={currentWeightKg}
                    onChange={(e) => setCurrentWeightKg(Math.max(35, Math.min(220, Number(e.target.value))))}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Target Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="35"
                    max="220"
                    step="0.5"
                    value={targetWeightKg}
                    onChange={(e) => setTargetWeightKg(Math.max(35, Math.min(220, Number(e.target.value))))}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Activity & Goal */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold font-heading text-slate-950 uppercase tracking-wide">
                  Step 2: Activity Level &amp; Health Objective
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Establishes your Total Daily Energy Expenditure (TDEE) and goal caloric delta.
                </p>
              </div>

              {/* Activity Level Radios */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Physical Activity Level (PAL)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ACTIVITY_LEVELS.map((act) => (
                    <div
                      key={act.key}
                      onClick={() => setActivityLevel(act.key)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        activityLevel === act.key
                          ? "bg-emerald-50/70 border-emerald-500 text-slate-950 shadow-2xs"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{act.label}</span>
                        {activityLevel === act.key && (
                          <CheckCircle size={16} weight="fill" className="text-emerald-600" />
                        )}
                      </div>
                      <span className="text-2xs text-slate-500 mt-0.5 block">{act.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary Goal */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Primary Nutrition Objective
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {GOALS.map((g) => (
                    <div
                      key={g.key}
                      onClick={() => setPrimaryGoal(g.key)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        primaryGoal === g.key
                          ? "bg-emerald-50/70 border-emerald-500 text-slate-950 shadow-2xs"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{g.label}</span>
                        {primaryGoal === g.key && (
                          <CheckCircle size={16} weight="fill" className="text-emerald-600" />
                        )}
                      </div>
                      <span className="text-2xs text-slate-500 mt-0.5 block">{g.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Diet & Health Conditions */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold font-heading text-slate-950 uppercase tracking-wide">
                  Step 3: Dietary Pattern &amp; Clinical Safeguards
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applies ICMR-NIN 2024 dietary thresholds, sodium ceilings, and glycemic clamps tailored to your biology.
                </p>
              </div>

              {/* Dietary Pattern */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Dietary Pattern
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DIET_TYPES.map((dt) => (
                    <button
                      key={dt.key}
                      type="button"
                      onClick={() => setDietType(dt.key)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        dietType === dt.key
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {dt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Medical Conditions */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Clinical Conditions (Select all that apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MEDICAL_CONDITIONS.map((cond) => {
                    const isChecked = conditions.includes(cond.key);
                    return (
                      <div
                        key={cond.key}
                        onClick={() => toggleCondition(cond.key)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? "bg-rose-50/80 border-rose-400 text-slate-950 shadow-2xs"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{cond.label}</span>
                          {isChecked ? (
                            <CheckCircle size={16} weight="fill" className="text-rose-600" />
                          ) : (
                            <div className="w-4 h-4 rounded border border-slate-300 bg-white" />
                          )}
                        </div>
                        <span className="text-2xs text-slate-500 mt-0.5 block">{cond.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Live Dynamic Preview Engine Bar */}
          <div className="bg-slate-950 text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={18} weight="fill" className="text-amber-400" />
                <span className="text-xs font-bold font-heading text-white">
                  Real-Time Clinical Calculation
                </span>
              </div>
              <span className="text-2xs font-mono text-slate-400">
                BMR: {livePreview.bmrKcal} kcal • TDEE: {livePreview.tdeeKcal} kcal
              </span>
            </div>

            {/* Macro 4-Column Grid */}
            <div className="grid grid-cols-4 gap-2 text-center pt-1 border-t border-slate-800">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-2xs font-mono text-slate-400 block">Daily Budget</span>
                <span className="text-sm sm:text-base font-extrabold text-white font-mono">
                  {livePreview.budget.targetCalories}
                </span>
                <span className="text-2xs text-slate-400 block">kcal</span>
              </div>

              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-2xs font-mono text-indigo-400 block">Protein</span>
                <span className="text-sm sm:text-base font-extrabold text-indigo-300 font-mono">
                  {livePreview.budget.targetProteinG}g
                </span>
                <span className="text-2xs text-slate-400 block">
                  {Math.round((livePreview.budget.targetProteinG * 4 * 100) / livePreview.budget.targetCalories)}%
                </span>
              </div>

              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-2xs font-mono text-cyan-400 block">Carbs</span>
                <span className="text-sm sm:text-base font-extrabold text-cyan-300 font-mono">
                  {livePreview.budget.targetCarbsG}g
                </span>
                <span className="text-2xs text-slate-400 block">
                  {Math.round((livePreview.budget.targetCarbsG * 4 * 100) / livePreview.budget.targetCalories)}%
                </span>
              </div>

              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-2xs font-mono text-amber-400 block">Fats</span>
                <span className="text-sm sm:text-base font-extrabold text-amber-300 font-mono">
                  {livePreview.budget.targetFatG}g
                </span>
                <span className="text-2xs text-slate-400 block">
                  {Math.round((livePreview.budget.targetFatG * 9 * 100) / livePreview.budget.targetCalories)}%
                </span>
              </div>
            </div>

            {/* Micronutrient Ceilings */}
            <div className="flex items-center justify-between text-2xs font-mono text-slate-400 pt-1">
              <span>Fiber: {livePreview.budget.targetFiberG}g</span>
              <span>Sodium ceiling: {livePreview.budget.ceilingSodiumMg}mg</span>
              <span>Hydration: {livePreview.budget.targetWaterMl}mL</span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Previous
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as any)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-950 text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight size={14} weight="bold" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishOnboarding}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <CheckCircle size={16} weight="fill" />
              <span>{isSubmitting ? "Configuring Dashboard..." : "Save & Launch Dashboard"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
