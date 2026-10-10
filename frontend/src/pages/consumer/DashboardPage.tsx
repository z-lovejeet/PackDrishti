import React, { useEffect } from "react";
import {
  CaretLeft,
  CaretRight,
  Flame,
  Drop,
  Plus,
  ArrowRight,
  ShieldCheck,
  Sparkle,
  Calendar,
  Barcode,
  ListPlus,
} from "@phosphor-icons/react";
import { useDiaryStore } from "../../store/useDiaryStore";
import { useProfileStore } from "../../store/useProfileStore";
import { useAuthStore } from "../../store/authStore";

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onOpenLogger: (slot?: "breakfast" | "lunch" | "dinner" | "snack") => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenLogger,
}) => {
  const { isAuthenticated } = useAuthStore();
  const {
    activeDate,
    diary,
    setDate,
    fetchDiary,
    quickAddWater,
  } = useDiaryStore();

  const {
    profile,
    budget: profileBudget,
    fetchProfile,
  } = useProfileStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchDiary(activeDate);
    }
  }, [isAuthenticated, activeDate, fetchProfile, fetchDiary]);

  // Navigate Date Helpers
  const handlePrevDay = () => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + 1);
    setDate(d.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    setDate(today);
  };

  const isToday = activeDate === new Date().toISOString().slice(0, 10);

  // Formatted date string
  const formattedDate = (() => {
    try {
      const [year, month, day] = activeDate.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return activeDate;
    }
  })();

  // Resolved Targets & Consumed
  const targetCalories =
    diary?.budget?.targetCalories ?? profileBudget?.targetCalories ?? 2000;
  const targetProtein =
    diary?.budget?.targetProteinG ?? profileBudget?.targetProteinG ?? 120;
  const targetCarbs =
    diary?.budget?.targetCarbsG ?? profileBudget?.targetCarbsG ?? 225;
  const targetFat =
    diary?.budget?.targetFatG ?? profileBudget?.targetFatG ?? 55;
  const targetFiber =
    diary?.budget?.targetFiberG ?? profileBudget?.targetFiberG ?? 30;
  const ceilingSodium =
    diary?.budget?.ceilingSodiumMg ?? profileBudget?.ceilingSodiumMg ?? 2000;
  const ceilingSugar =
    diary?.budget?.ceilingAddedSugarG ?? profileBudget?.ceilingAddedSugarG ?? 30;
  const targetWater =
    diary?.budget?.targetWaterMl ?? profileBudget?.targetWaterMl ?? 2500;

  const consumedCalories = diary?.totalsConsumed?.calories ?? 0;
  const consumedProtein = diary?.totalsConsumed?.proteinG ?? 0;
  const consumedCarbs = diary?.totalsConsumed?.carbsG ?? 0;
  const consumedFat = diary?.totalsConsumed?.fatG ?? 0;
  const consumedFiber = diary?.totalsConsumed?.fiberG ?? 0;
  const consumedSodium = diary?.totalsConsumed?.sodiumMg ?? 0;
  const consumedSugar = diary?.totalsConsumed?.sugarG ?? 0;
  const consumedWater = diary?.totalsConsumed?.waterMl ?? 0;

  const remainingCalories = Math.max(0, targetCalories - consumedCalories);
  const isOverBudget = consumedCalories > targetCalories;
  const calorieExcess = consumedCalories - targetCalories;

  // Calorie ring calculations
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(1, consumedCalories / Math.max(1, targetCalories));
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Clinical tip determination
  const conditions = profile?.conditions ?? [];
  let clinicalTip = {
    title: "Clinical Nutrition Recommendation",
    body: "Balance each meal with adequate dietary fiber and protein to maintain steady postprandial glucose levels and satiety.",
    tag: "Metabolic Balance",
  };

  if (conditions.includes("type_2_diabetes") || conditions.includes("prediabetes")) {
    clinicalTip = {
      title: "Glycemic Stability Advisory",
      body: `You have ${Math.max(0, Math.round(targetCarbs - consumedCarbs))}g carbs remaining today. Combine high-glycemic starches with intact lentils (dal) to reduce glycemic load.`,
      tag: "Diabetes Protocol",
    };
  } else if (conditions.includes("hypertension")) {
    clinicalTip = {
      title: "Cardiovascular Sodium Advisory",
      body: `Daily sodium ceiling: ${ceilingSodium}mg. You have consumed ${consumedSodium}mg. Avoid packaged snacks containing hidden sodium or monosodium glutamate.`,
      tag: "DASH Protocol",
    };
  } else if (conditions.includes("nafld") || conditions.includes("dyslipidemia")) {
    clinicalTip = {
      title: "Lipid & Hepatic Advisory",
      body: "Limit trans-fatty acids and added sugars to zero. Prioritize omega-3 rich seeds and cold-pressed mustard oil over palm oil.",
      tag: "Hepatic Health",
    };
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28 md:pb-16 pt-4 sm:pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Date Navigator Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label="Previous day"
            >
              <CaretLeft size={18} weight="bold" />
            </button>
            <div className="flex items-center gap-2 px-2">
              <Calendar size={18} className="text-slate-500" />
              <span className="font-heading font-semibold text-sm sm:text-base text-slate-900">
                {isToday ? `Today, ${formattedDate}` : formattedDate}
              </span>
            </div>
            <button
              type="button"
              onClick={handleNextDay}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label="Next day"
            >
              <CaretRight size={18} weight="bold" />
            </button>
            {!isToday && (
              <button
                type="button"
                onClick={handleToday}
                className="text-2xs font-medium px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              >
                Jump to Today
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate("diary")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              <ListPlus size={16} />
              <span>View Full Diary</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenLogger()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-950 hover:bg-slate-800 px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <Plus size={16} weight="bold" />
              <span>Log Meal</span>
            </button>
          </div>
        </div>

        {/* Hero Section: Calorie Dial + Macro Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Caloric Energy Dial Card */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-between">
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Flame size={20} weight="fill" className="text-amber-500" />
                <h2 className="font-heading font-bold text-sm text-slate-900">
                  Caloric Energy Balance
                </h2>
              </div>
              <span className="text-2xs font-mono uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Daily Budget
              </span>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative my-6 flex items-center justify-center">
              <svg width="180" height="180" className="rotate-[-90deg]">
                {/* Background Track */}
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  stroke="#E2E8F0"
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Progress Stroke */}
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  stroke={isOverBudget ? "#EF4444" : "#10B981"}
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Inner Dial Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                {isOverBudget ? (
                  <>
                    <span className="text-2xs uppercase font-mono font-bold text-rose-600">
                      Over Budget
                    </span>
                    <span className="font-heading font-extrabold text-2xl text-rose-600 leading-tight">
                      +{calorieExcess.toLocaleString()}
                    </span>
                    <span className="text-2xs text-slate-500 font-mono">
                      kcal over limit
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-heading font-extrabold text-3xl text-slate-950 leading-tight">
                      {remainingCalories.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      kcal remaining
                    </span>
                    <span className="text-2xs text-slate-600 font-mono mt-0.5">
                      of {targetCalories.toLocaleString()} target
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Consumed vs Budget Legend */}
            <div className="w-full grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-center">
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-2xs text-slate-500 font-mono block">Consumed</span>
                <span className="font-heading font-bold text-sm text-slate-900">
                  {consumedCalories.toLocaleString()} kcal
                </span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-2xs text-slate-500 font-mono block">Target Budget</span>
                <span className="font-heading font-bold text-sm text-slate-900">
                  {targetCalories.toLocaleString()} kcal
                </span>
              </div>
            </div>
          </div>

          {/* Macronutrient Split 3-Card Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Protein Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold font-heading text-indigo-700 uppercase tracking-wide">
                    Protein
                  </span>
                  <span className="text-2xs font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                    {Math.round((consumedProtein / Math.max(1, targetProtein)) * 100)}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1 my-2">
                  <span className="font-heading font-extrabold text-2xl text-slate-950">
                    {Math.round(consumedProtein)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    / {targetProtein}g
                  </span>
                </div>
                <div className="w-full bg-indigo-100 rounded-full h-2 overflow-hidden my-3">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (consumedProtein / Math.max(1, targetProtein)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-2xs text-slate-500 mt-2">
                Muscle recovery &amp; metabolic support.
              </p>
            </div>

            {/* Carbohydrates Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold font-heading text-cyan-700 uppercase tracking-wide">
                    Carbohydrates
                  </span>
                  <span className="text-2xs font-mono px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-semibold">
                    {Math.round((consumedCarbs / Math.max(1, targetCarbs)) * 100)}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1 my-2">
                  <span className="font-heading font-extrabold text-2xl text-slate-950">
                    {Math.round(consumedCarbs)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    / {targetCarbs}g
                  </span>
                </div>
                <div className="w-full bg-cyan-100 rounded-full h-2 overflow-hidden my-3">
                  <div
                    className="bg-cyan-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (consumedCarbs / Math.max(1, targetCarbs)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-2xs text-slate-500 mt-2">
                Primary glucose fuel &amp; brain glycogen.
              </p>
            </div>

            {/* Fats Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold font-heading text-amber-700 uppercase tracking-wide">
                    Fats
                  </span>
                  <span className="text-2xs font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold">
                    {Math.round((consumedFat / Math.max(1, targetFat)) * 100)}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1 my-2">
                  <span className="font-heading font-extrabold text-2xl text-slate-950">
                    {Math.round(consumedFat)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    / {targetFat}g
                  </span>
                </div>
                <div className="w-full bg-amber-100 rounded-full h-2 overflow-hidden my-3">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (consumedFat / Math.max(1, targetFat)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-2xs text-slate-500 mt-2">
                Hormonal synthesis &amp; cellular membranes.
              </p>
            </div>

          </div>

        </div>

        {/* Micronutrients Strip & Hydration Quick-Add */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Dietary Fiber */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-800">Dietary Fiber</span>
              <span className="text-2xs font-mono text-slate-500">
                {consumedFiber.toFixed(1)} / {targetFiber}g
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1.5">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (consumedFiber / targetFiber) * 100)}%` }}
              />
            </div>
            <span className="text-2xs text-slate-600 block">
              Promotes microbiome diversity &amp; insulin sensitivity.
            </span>
          </div>

          {/* Sodium Ceiling Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-800">Sodium Ceiling</span>
              <span className={`text-2xs font-mono font-medium ${
                consumedSodium > ceilingSodium ? "text-rose-600 font-bold" : "text-slate-500"
              }`}>
                {consumedSodium} / {ceilingSodium}mg
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  consumedSodium > ceilingSodium ? "bg-rose-500" : "bg-slate-700"
                }`}
                style={{ width: `${Math.min(100, (consumedSodium / ceilingSodium) * 100)}%` }}
              />
            </div>
            <span className="text-2xs text-slate-600 block">
              {consumedSodium > ceilingSodium
                ? "Exceeded clinical sodium ceiling."
                : "Safe cardiovascular threshold."}
            </span>
          </div>

          {/* Added Sugars Ceiling */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-800">Added Sugar</span>
              <span className={`text-2xs font-mono font-medium ${
                consumedSugar > ceilingSugar ? "text-rose-600 font-bold" : "text-slate-500"
              }`}>
                {consumedSugar.toFixed(1)} / {ceilingSugar}g
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  consumedSugar > ceilingSugar ? "bg-rose-500" : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, (consumedSugar / ceilingSugar) * 100)}%` }}
              />
            </div>
            <span className="text-2xs text-slate-600 block">
              WHO guideline: keep added sucrose &lt; 5% total energy.
            </span>
          </div>

          {/* Hydration Tracker */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-cyan-600">
                <Drop size={16} weight="fill" />
                <span className="text-xs font-semibold text-slate-800">Hydration</span>
              </div>
              <span className="text-2xs font-mono text-slate-500">
                {consumedWater} / {targetWater} mL
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (consumedWater / targetWater) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-1 mt-1">
              <button
                type="button"
                onClick={() => quickAddWater(250)}
                className="w-full py-1 text-2xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded border border-cyan-200 transition-colors flex items-center justify-center gap-1"
                title="Add 250ml water glass"
              >
                <Plus size={12} weight="bold" />
                <span>+250 mL Glass</span>
              </button>
            </div>
          </div>

        </div>

        {/* Clinical Health Tip Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck size={22} weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {clinicalTip.tag}
                </span>
                <span className="text-slate-500">•</span>
                <h3 className="text-sm font-bold text-white">
                  {clinicalTip.title}
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
                {clinicalTip.body}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("profile")}
            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Adjust Health Profile
          </button>
        </div>

        {/* Quick Access Scan & Log Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => onNavigate("packaged")}
            className="p-5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:scale-105 transition-transform">
                <Barcode size={24} weight="duotone" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                  Packaged Food Scanner
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify adulterants, harmful dyes, palm oil &amp; log directly to diary.
                </p>
              </div>
            </div>
            <ArrowRight size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors shrink-0 ml-2" />
          </div>

          <div
            onClick={() => onOpenLogger()}
            className="p-5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:scale-105 transition-transform">
                <Sparkle size={24} weight="duotone" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                  AI Meal Plate Scanner
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Snap your thali or home-cooked dish for instant portion &amp; macro breakdown.
                </p>
              </div>
            </div>
            <ArrowRight size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors shrink-0 ml-2" />
          </div>
        </div>

      </div>
    </div>
  );
};
