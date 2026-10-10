import React, { useState, useEffect, useMemo } from "react";
import {
  User,
  Heartbeat,
  CheckCircle,
  WarningCircle,
  Sparkle,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { useProfileStore } from "../../store/useProfileStore";
import { useAuthStore } from "../../store/authStore";

interface ProfileSettingsPageProps {
  onNavigate: (page: string) => void;
  onSuccessToast?: (title: string, message: string) => void;
}

const MEDICAL_CONDITIONS = [
  { key: "type_2_diabetes", label: "Type 2 Diabetes / Prediabetes", desc: "Clamps glycemic index & sugar floor" },
  { key: "hypertension", label: "Hypertension (High BP)", desc: "Enforces 1,500mg daily sodium ceiling" },
  { key: "dyslipidemia", label: "Dyslipidemia (High Cholesterol)", desc: "Restricts saturated fat & zero trans fats" },
  { key: "nafld", label: "Fatty Liver (NAFLD)", desc: "Bans industrial fructose & hydrogenated oils" },
  { key: "pcos", label: "PCOS / PCOD", desc: "Low-insulinemic complex carb prioritization" },
  { key: "hypothyroidism", label: "Hypothyroidism", desc: "Monitors goitrogen thresholds & micronutrients" },
  { key: "celiac", label: "Celiac / Gluten Sensitivity", desc: "Strict gluten contraindication triggers" },
  { key: "hyperuricemia", label: "Hyperuricemia / Gout", desc: "Flags high-purine foods & organ meats" },
  { key: "gerd", label: "GERD / Acid Reflux", desc: "Flags aggressive spicy & deep-fried triggers" },
  { key: "ckd", label: "Chronic Kidney Disease (CKD)", desc: "Caps dietary protein & potassium load" },
];

const ACTIVITY_LEVELS = [
  { key: "sedentary", label: "Sedentary", desc: "Desk job, < 5,000 steps/day" },
  { key: "lightly_active", label: "Lightly Active", desc: "1-3 workout days/wk, 5,000-7,500 steps" },
  { key: "moderately_active", label: "Moderately Active", desc: "3-5 workout days/wk, 7,500-10,000 steps" },
  { key: "very_active", label: "Very Active", desc: "6-7 hard training days, > 10,000 steps" },
  { key: "extra_active", label: "Extra Active", desc: "Physical labor or athlete double-sessions" },
] as const;

const GOALS = [
  { key: "rapid_fat_loss", label: "Rapid Fat Loss (-25% Deficit)" },
  { key: "moderate_fat_loss", label: "Moderate Fat Loss (-15% Deficit)" },
  { key: "maintenance", label: "Metabolic Maintenance (Eucaloric)" },
  { key: "clean_lean_bulk", label: "Clean Lean Bulk (+10% Surplus)" },
  { key: "aggressive_hypertrophy", label: "Hypertrophy (+15% Surplus)" },
  { key: "metabolic_reversal", label: "Metabolic Reversal / Health Focus" },
] as const;

const DIET_TYPES = [
  { key: "standard_omnivore", label: "Standard Omnivore" },
  { key: "vegetarian", label: "Vegetarian (Lacto)" },
  { key: "eggetarian", label: "Eggetarian" },
  { key: "vegan", label: "Vegan (Plant-Based)" },
  { key: "jain", label: "Jain (Strict Vegetarian)" },
  { key: "keto", label: "Ketogenic" },
  { key: "paleo", label: "Paleo" },
  { key: "halal", label: "Halal" },
  { key: "sattvic", label: "Sattvic Ayurvedic" },
] as const;

export const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({
  onNavigate,
  onSuccessToast,
}) => {
  const { isAuthenticated } = useAuthStore();
  const {
    profile,
    isSaving,
    fetchProfile,
    updateProfile,
    calculateLivePreview,
  } = useProfileStore();

  // Local Form State
  const [age, setAge] = useState<number>(28);
  const [biologicalSex, setBiologicalSex] = useState<"male" | "female">("male");
  const [heightCm, setHeightCm] = useState<number>(172);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(72);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(68);
  const [bodyFat, setBodyFat] = useState<number | undefined>(undefined);
  const [activityLevel, setActivityLevel] = useState<
    "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extra_active"
  >("moderately_active");
  const [primaryGoal, setPrimaryGoal] = useState<
    "rapid_fat_loss" | "moderate_fat_loss" | "maintenance" | "clean_lean_bulk" | "aggressive_hypertrophy" | "metabolic_reversal"
  >("moderate_fat_loss");
  const [dietType, setDietType] = useState<
    "standard_omnivore" | "vegetarian" | "vegan" | "eggetarian" | "jain" | "keto" | "paleo" | "halal" | "sattvic"
  >("vegetarian");
  const [conditions, setConditions] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setAge(profile.age || 28);
      setBiologicalSex(profile.biologicalSex || "male");
      setHeightCm(profile.heightCm || 172);
      setCurrentWeightKg(profile.currentWeightKg || 72);
      setTargetWeightKg(profile.targetWeightKg || 68);
      setBodyFat(profile.bodyFatPercentage ?? undefined);
      setActivityLevel(profile.activityLevel || "moderately_active");
      setPrimaryGoal(profile.primaryGoal || "moderate_fat_loss");
      setDietType(profile.dietType || "vegetarian");
      setConditions(profile.conditions || []);
    }
  }, [profile]);

  // Live client-side calculated metabolic preview
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

  const toggleCondition = (key: string) => {
    setConditions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateProfile({
        age,
        biologicalSex,
        heightCm,
        currentWeightKg,
        targetWeightKg,
        bodyFatPercentage: bodyFat || null,
        activityLevel,
        primaryGoal,
        dietType,
        conditions,
      });

      setSaveSuccess(true);
      if (onSuccessToast) {
        onSuccessToast("Profile Updated", "Biometrics and macro budget synchronized.");
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to update profile settings.";
      setSaveError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28 md:pb-16 pt-4 sm:pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <User size={20} weight="bold" className="text-slate-900" />
              <h1 className="font-heading font-extrabold text-lg sm:text-xl text-slate-950">
                Health Profile &amp; Biometric Settings
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Calibrates your clinical BMR, TDEE, macronutrient distribution, and disease contraindications.
            </p>
          </div>

          <span className="text-2xs font-mono uppercase px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold self-start sm:self-auto">
            ICMR-NIN 2024 Engine
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: Demographics & Body Metrics */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="font-heading font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              1. Physical Biometrics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Biological Sex */}
              <div>
                <label className="text-2xs font-mono uppercase text-slate-500 font-semibold block mb-1.5">
                  Biological Sex
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBiologicalSex("male")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      biologicalSex === "male"
                        ? "bg-slate-950 text-white border-slate-950 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setBiologicalSex("female")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      biologicalSex === "female"
                        ? "bg-slate-950 text-white border-slate-950 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="text-2xs font-mono uppercase text-slate-500 font-semibold block mb-1.5">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min={12}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value) || 20)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  required
                />
              </div>

              {/* Height */}
              <div>
                <label className="text-2xs font-mono uppercase text-slate-500 font-semibold block mb-1.5">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min={100}
                  max={250}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value) || 160)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  required
                />
              </div>

              {/* Current Weight */}
              <div>
                <label className="text-2xs font-mono uppercase text-slate-500 font-semibold block mb-1.5">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={30}
                  max={250}
                  value={currentWeightKg}
                  onChange={(e) => setCurrentWeightKg(Number(e.target.value) || 60)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  required
                />
              </div>

              {/* Target Weight */}
              <div>
                <label className="text-2xs font-mono uppercase text-slate-500 font-semibold block mb-1.5">
                  Target Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={30}
                  max={250}
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(Number(e.target.value) || 60)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  required
                />
              </div>

              {/* Body Fat % (Optional) */}
              <div>
                <label className="text-2xs font-mono uppercase text-slate-500 font-semibold block mb-1.5">
                  Body Fat % (Optional)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={5}
                  max={60}
                  value={bodyFat || ""}
                  placeholder="Optional estimate"
                  onChange={(e) =>
                    setBodyFat(e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Lifestyle, Activity & Goal */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="font-heading font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              2. Lifestyle &amp; Metabolic Target
            </h2>

            {/* Activity Level Radio Grid */}
            <div className="space-y-1.5">
              <label className="text-2xs font-mono uppercase text-slate-500 font-semibold block">
                Activity Multiplier
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {ACTIVITY_LEVELS.map((act) => (
                  <div
                    key={act.key}
                    onClick={() => setActivityLevel(act.key)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      activityLevel === act.key
                        ? "bg-slate-950 text-white border-slate-950 shadow-xs"
                        : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="font-heading font-bold text-xs block">
                      {act.label}
                    </span>
                    <span
                      className={`text-2xs block mt-0.5 ${
                        activityLevel === act.key ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {act.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Primary Goal */}
              <div>
                <label className="text-2xs font-mono uppercase text-slate-500 font-semibold block mb-1.5">
                  Primary Goal
                </label>
                <select
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                >
                  {GOALS.map((g) => (
                    <option key={g.key} value={g.key}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Diet Type */}
              <div>
                <label className="text-2xs font-mono uppercase text-slate-500 font-semibold block mb-1.5">
                  Dietary Preference
                </label>
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                >
                  {DIET_TYPES.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Active Medical Conditions */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Heartbeat size={18} weight="bold" className="text-rose-500" />
                <h2 className="font-heading font-bold text-sm text-slate-900">
                  3. Clinical Conditions &amp; Contraindications
                </h2>
              </div>
              <span className="text-2xs font-mono text-slate-500">
                {conditions.length} active conditions
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Select any conditions that apply. BiteIQ dynamically enforces clinical thresholds (e.g. 1500mg sodium limit for Hypertension, fiber &amp; carb clamp for Type 2 Diabetes).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MEDICAL_CONDITIONS.map((cond) => {
                const isActive = conditions.includes(cond.key);
                return (
                  <div
                    key={cond.key}
                    onClick={() => toggleCondition(cond.key)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isActive
                        ? "bg-rose-50 border-rose-300 text-rose-950"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 pointer-events-none"
                    />
                    <div>
                      <span className="font-heading font-bold text-xs block">
                        {cond.label}
                      </span>
                      <span className="text-2xs text-slate-500 block mt-0.5">
                        {cond.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Live Computed Metabolic Budget Preview */}
          <div className="bg-slate-950 text-white p-5 sm:p-6 rounded-2xl border border-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkle size={18} weight="fill" className="text-amber-400" />
                <h3 className="font-heading font-bold text-sm text-white">
                  Live Computed Metabolic Budget Preview
                </h3>
              </div>
              <span className="text-2xs font-mono text-emerald-400">
                Mifflin-St Jeor Engine
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-2xs text-slate-400 block">Basal Metabolic Rate</span>
                <span className="font-bold text-base text-white font-heading">
                  {livePreview.bmrKcal} kcal
                </span>
                <span className="text-2xs text-slate-500">BMR baseline</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-2xs text-slate-400 block">Total Expenditure</span>
                <span className="font-bold text-base text-white font-heading">
                  {livePreview.tdeeKcal} kcal
                </span>
                <span className="text-2xs text-slate-500">TDEE calibrated</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-2xs text-slate-400 block">Target Budget</span>
                <span className="font-bold text-base text-emerald-400 font-heading">
                  {livePreview.budget.targetCalories} kcal
                </span>
                <span className="text-2xs text-slate-500">Goal calibrated</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-2xs text-slate-400 block">Sodium Ceiling</span>
                <span className="font-bold text-base text-rose-400 font-heading">
                  {livePreview.budget.ceilingSodiumMg} mg
                </span>
                <span className="text-2xs text-slate-500">
                  {conditions.includes("hypertension") ? "DASH 1500mg clamp" : "Standard ceiling"}
                </span>
              </div>
            </div>

            {/* Target Macro Splits */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-3 text-center text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-900">
                <span className="text-indigo-400 font-bold block text-sm">
                  {livePreview.budget.targetProteinG}g
                </span>
                <span className="text-2xs text-slate-300">Target Protein</span>
              </div>
              <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-900">
                <span className="text-cyan-400 font-bold block text-sm">
                  {livePreview.budget.targetCarbsG}g
                </span>
                <span className="text-2xs text-slate-300">Target Carbs</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-900">
                <span className="text-amber-400 font-bold block text-sm">
                  {livePreview.budget.targetFatG}g
                </span>
                <span className="text-2xs text-slate-300">Target Fat</span>
              </div>
            </div>
          </div>

          {saveError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <WarningCircle size={18} weight="bold" className="shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle size={18} weight="bold" className="shrink-0" />
              <span>Profile saved and daily macro targets successfully updated!</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <ArrowsClockwise size={16} className="animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} weight="bold" />
                  <span>Save Health Profile</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
