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
  BowlFood,
  SlidersHorizontal,
  ArrowUpRight,
} from "@phosphor-icons/react";
import { useDiaryStore } from "../../store/useDiaryStore";
import { useProfileStore } from "../../store/useProfileStore";
import { useAuthStore } from "../../store/authStore";

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onOpenLogger: (slot?: "breakfast" | "lunch" | "dinner" | "snack") => void;
  onOpenOnboarding?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenLogger,
  onOpenOnboarding,
}) => {
  const { isAuthenticated, user } = useAuthStore();
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

  // Time-based Greeting
  const timeGreeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  const userName = user?.fullName || user?.email?.split("@")[0] || "Citizen";

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
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(1, consumedCalories / Math.max(1, targetCalories));
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Meal slot calorie split
  const breakfastItems = diary?.meals?.breakfast || [];
  const lunchItems = diary?.meals?.lunch || [];
  const dinnerItems = diary?.meals?.dinner || [];
  const snackItems = diary?.meals?.snack || [];

  const breakfastCal = breakfastItems.reduce((acc, it) => acc + (it.calories || 0), 0);
  const lunchCal = lunchItems.reduce((acc, it) => acc + (it.calories || 0), 0);
  const dinnerCal = dinnerItems.reduce((acc, it) => acc + (it.calories || 0), 0);
  const snackCal = snackItems.reduce((acc, it) => acc + (it.calories || 0), 0);

  // Clinical condition badges & tip determination
  const conditions = profile?.conditions ?? [];
  let clinicalTip = {
    title: "Clinical Nutrition Recommendation",
    body: "Balance each meal with adequate dietary fiber and protein to maintain steady postprandial glucose levels and satiety.",
    tag: "Metabolic Balance",
  };

  if (conditions.includes("type_2_diabetes") || conditions.includes("prediabetes")) {
    clinicalTip = {
      title: "Glycemic Stability Advisory",
      body: `You have ${Math.max(0, Math.round(targetCarbs - consumedCarbs))}g carbs remaining today. Combine high-glycemic starches with whole pulses or salad to blunt glycemic excursion.`,
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

  // Goal description
  const goalLabel = (() => {
    switch (profile?.primaryGoal) {
      case "rapid_fat_loss":
        return "Rapid Fat Loss (-25% Deficit)";
      case "moderate_fat_loss":
        return "Moderate Fat Loss (-15% Deficit)";
      case "clean_lean_bulk":
        return "Clean Muscle Gain (+12% Surplus)";
      case "aggressive_hypertrophy":
        return "Hypertrophy (+20% Surplus)";
      case "metabolic_reversal":
        return "Metabolic Stabilization";
      default:
        return "Metabolic Maintenance (Eucaloric)";
    }
  })();

  return (
    <div className="min-h-screen bg-slate-50/70 pb-28 md:pb-16 pt-4 sm:pt-6 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header & Personalized Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-mono font-semibold tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 uppercase">
                <Sparkle size={13} weight="fill" />
                <span>{goalLabel}</span>
              </span>

              {conditions.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-mono font-semibold text-rose-800 bg-rose-50 border border-rose-200">
                  <ShieldCheck size={13} weight="fill" />
                  <span>{conditions.length} Clinical Safeguards Active</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-950 tracking-tight">
              {timeGreeting}, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Target daily intake: <span className="font-mono font-bold text-slate-900">{targetCalories.toLocaleString()} kcal</span> • BMR: <span className="font-mono">{profile?.bmrKcal || 1680} kcal</span> • TDEE: <span className="font-mono">{profile?.tdeeKcal || 2400} kcal</span>
            </p>
          </div>

          {/* Quick Date Stepper & Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
            {/* Date Navigator */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={handlePrevDay}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
                title="Previous Day"
              >
                <CaretLeft size={16} weight="bold" />
              </button>

              <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-800 font-mono">
                <Calendar size={14} className="text-slate-500" />
                <span>{isToday ? `Today, ${formattedDate}` : formattedDate}</span>
              </div>

              {!isToday && (
                <button
                  type="button"
                  onClick={handleToday}
                  className="px-2 py-1 text-2xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                  title="Jump to Today"
                >
                  Today
                </button>
              )}

              <button
                type="button"
                onClick={handleNextDay}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
                title="Next Day"
              >
                <CaretRight size={16} weight="bold" />
              </button>
            </div>

            {/* Recalculate / Adjust Profile Button */}
            <button
              type="button"
              onClick={onOpenOnboarding || (() => onNavigate("profile"))}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
              title="Adjust biometrics & recalculate calories"
            >
              <SlidersHorizontal size={14} weight="bold" />
              <span className="hidden sm:inline">Recalculate Macros</span>
            </button>

            {/* Log Meal Button */}
            <button
              type="button"
              onClick={() => onOpenLogger()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-900 text-white transition-all shadow-xs cursor-pointer"
            >
              <Plus size={14} weight="bold" />
              <span>Log Food</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRIMARY ENERGY COMMAND CENTER: CALORIC RING & MACROS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Caloric Energy Dial Card (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Flame size={16} weight="fill" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-sm text-slate-950">
                    Energy Balance
                  </h2>
                  <span className="text-2xs text-slate-500 font-mono">
                    {Math.round((consumedCalories / Math.max(1, targetCalories)) * 100)}% of target consumed
                  </span>
                </div>
              </div>
              <span className={`text-2xs font-mono font-bold px-2 py-0.5 rounded uppercase ${
                isOverBudget
                  ? "bg-rose-100 text-rose-800"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}>
                {isOverBudget ? "Over Budget" : "Caloric Target Active"}
              </span>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative my-6 flex items-center justify-center">
              <svg width="200" height="200" className="rotate-[-90deg]">
                {/* Background Track */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  stroke="#F1F5F9"
                  strokeWidth="14"
                  fill="transparent"
                />
                {/* Progress Stroke */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  stroke={isOverBudget ? "#EF4444" : "#059669"}
                  strokeWidth="14"
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
                      Excess Intake
                    </span>
                    <span className="font-heading font-extrabold text-3xl text-rose-600 leading-tight">
                      +{calorieExcess.toLocaleString()}
                    </span>
                    <span className="text-2xs text-slate-500 font-mono">
                      kcal over limit
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-950 leading-tight tracking-tight">
                      {remainingCalories.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      kcal remaining
                    </span>
                    <span className="text-2xs text-slate-500 font-mono mt-0.5">
                      of {targetCalories.toLocaleString()} target
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Consumed vs Budget Legend + Meal Breakdown Bar */}
            <div className="w-full space-y-3 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-2xs text-slate-500 font-mono block">Consumed</span>
                  <span className="font-heading font-bold text-sm text-slate-950">
                    {consumedCalories.toLocaleString()} kcal
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-2xs text-slate-500 font-mono block">Daily Target</span>
                  <span className="font-heading font-bold text-sm text-slate-950">
                    {targetCalories.toLocaleString()} kcal
                  </span>
                </div>
              </div>

              {/* Proportional Intake Breakdown */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-2xs font-mono text-slate-500">
                  <span>B: {breakfastCal} kcal</span>
                  <span>L: {lunchCal} kcal</span>
                  <span>D: {dinnerCal} kcal</span>
                  <span>S: {snackCal} kcal</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-100">
                  <div
                    className="bg-amber-400 h-full transition-all"
                    style={{ width: `${(breakfastCal / Math.max(1, consumedCalories)) * 100}%` }}
                    title={`Breakfast: ${breakfastCal} kcal`}
                  />
                  <div
                    className="bg-emerald-500 h-full transition-all"
                    style={{ width: `${(lunchCal / Math.max(1, consumedCalories)) * 100}%` }}
                    title={`Lunch: ${lunchCal} kcal`}
                  />
                  <div
                    className="bg-indigo-500 h-full transition-all"
                    style={{ width: `${(dinnerCal / Math.max(1, consumedCalories)) * 100}%` }}
                    title={`Dinner: ${dinnerCal} kcal`}
                  />
                  <div
                    className="bg-cyan-400 h-full transition-all"
                    style={{ width: `${(snackCal / Math.max(1, consumedCalories)) * 100}%` }}
                    title={`Snacks: ${snackCal} kcal`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Macronutrient Split 4-Card Grid (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Protein Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-heading text-indigo-700 uppercase tracking-wider">
                    Protein
                  </span>
                  <span className="text-2xs font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                    {Math.round((consumedProtein / Math.max(1, targetProtein)) * 100)}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-heading font-extrabold text-2xl text-slate-950">
                    {Math.round(consumedProtein)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    / {targetProtein}g
                  </span>
                </div>
                <div className="w-full bg-indigo-100/70 rounded-full h-2 overflow-hidden my-2.5">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (consumedProtein / Math.max(1, targetProtein)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
                <span>Remaining: {Math.max(0, targetProtein - Math.round(consumedProtein))}g</span>
                <span className="text-indigo-700 font-medium">Muscle Synthesis</span>
              </div>
            </div>

            {/* Carbohydrates Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-heading text-cyan-700 uppercase tracking-wider">
                    Carbohydrates
                  </span>
                  <span className="text-2xs font-mono px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-bold">
                    {Math.round((consumedCarbs / Math.max(1, targetCarbs)) * 100)}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-heading font-extrabold text-2xl text-slate-950">
                    {Math.round(consumedCarbs)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    / {targetCarbs}g
                  </span>
                </div>
                <div className="w-full bg-cyan-100/70 rounded-full h-2 overflow-hidden my-2.5">
                  <div
                    className="bg-cyan-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (consumedCarbs / Math.max(1, targetCarbs)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
                <span>Remaining: {Math.max(0, targetCarbs - Math.round(consumedCarbs))}g</span>
                <span className="text-cyan-700 font-medium">Glycemic Energy</span>
              </div>
            </div>

            {/* Fats Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-heading text-amber-700 uppercase tracking-wider">
                    Fats &amp; Lipids
                  </span>
                  <span className="text-2xs font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold">
                    {Math.round((consumedFat / Math.max(1, targetFat)) * 100)}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-heading font-extrabold text-2xl text-slate-950">
                    {Math.round(consumedFat)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    / {targetFat}g
                  </span>
                </div>
                <div className="w-full bg-amber-100/70 rounded-full h-2 overflow-hidden my-2.5">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (consumedFat / Math.max(1, targetFat)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
                <span>Remaining: {Math.max(0, targetFat - Math.round(consumedFat))}g</span>
                <span className="text-amber-700 font-medium">Hormone Balance</span>
              </div>
            </div>

            {/* Dietary Fiber Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-heading text-emerald-700 uppercase tracking-wider">
                    Dietary Fiber
                  </span>
                  <span className="text-2xs font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                    {Math.round((consumedFiber / Math.max(1, targetFiber)) * 100)}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-heading font-extrabold text-2xl text-slate-950">
                    {consumedFiber.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    / {targetFiber}g
                  </span>
                </div>
                <div className="w-full bg-emerald-100/70 rounded-full h-2 overflow-hidden my-2.5">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (consumedFiber / Math.max(1, targetFiber)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
                <span>Remaining: {Math.max(0, Number((targetFiber - consumedFiber).toFixed(1)))}g</span>
                <span className="text-emerald-700 font-medium">Microbiome Health</span>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* MICRONUTRIENT CEILINGS & HYDRATION HUB */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Sodium Ceiling Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">Sodium Ceiling</span>
                <span className={`text-2xs font-mono font-bold ${
                  consumedSodium > ceilingSodium ? "text-rose-600" : "text-slate-600"
                }`}>
                  {consumedSodium} / {ceilingSodium}mg
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    consumedSodium > ceilingSodium ? "bg-rose-500" : "bg-slate-800"
                  }`}
                  style={{ width: `${Math.min(100, (consumedSodium / ceilingSodium) * 100)}%` }}
                />
              </div>
            </div>
            <p className="text-2xs text-slate-500 mt-1">
              {consumedSodium > ceilingSodium
                ? "Exceeded daily sodium limit. Avoid salted packaged goods."
                : "Safe cardiovascular zone under ICMR-NIN safe ceiling."}
            </p>
          </div>

          {/* Added Sugar Ceiling */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">Free Added Sugar</span>
                <span className={`text-2xs font-mono font-bold ${
                  consumedSugar > ceilingSugar ? "text-rose-600" : "text-slate-600"
                }`}>
                  {consumedSugar.toFixed(1)} / {ceilingSugar}g
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    consumedSugar > ceilingSugar ? "bg-rose-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, (consumedSugar / ceilingSugar) * 100)}%` }}
                />
              </div>
            </div>
            <p className="text-2xs text-slate-500 mt-1">
              {consumedSugar > ceilingSugar
                ? "Exceeded WHO & ICMR 5% caloric threshold for added sucrose."
                : "Safe low-glycemic zone. Natural fruit sugars excluded."}
            </p>
          </div>

          {/* Interactive Hydration Tracker */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-cyan-600 font-bold text-xs">
                  <Drop size={16} weight="fill" />
                  <span>Hydration Target</span>
                </div>
                <span className="text-2xs font-mono font-bold text-slate-700">
                  {consumedWater} / {targetWater} mL
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (consumedWater / targetWater) * 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => quickAddWater(250)}
                className="py-1 px-2 text-2xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 rounded-lg border border-cyan-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                title="Add 250ml water glass"
              >
                <Plus size={11} weight="bold" />
                <span>+250 mL Glass</span>
              </button>
              <button
                type="button"
                onClick={() => quickAddWater(500)}
                className="py-1 px-2 text-2xs font-semibold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 rounded-lg border border-cyan-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                title="Add 500ml water bottle"
              >
                <Plus size={11} weight="bold" />
                <span>+500 mL Bottle</span>
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* TODAY'S MEAL JOURNEY CARDS (BREAKFAST, LUNCH, DINNER, SNACK) */}
        {/* ========================================================================= */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold font-heading text-slate-950 uppercase tracking-wide">
                Today&apos;s Meal Intake Journey
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review logged items, macro contributions, and tap to add dishes directly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("diary")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors"
            >
              <span>View Comprehensive Diary</span>
              <ArrowUpRight size={14} weight="bold" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Breakfast */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Breakfast
                  </span>
                  <span className="text-2xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {breakfastCal} kcal
                  </span>
                </div>

                <div className="py-3 space-y-1.5 min-h-[90px]">
                  {breakfastItems.length === 0 ? (
                    <span className="text-2xs text-slate-400 italic block pt-2">
                      No items logged yet
                    </span>
                  ) : (
                    breakfastItems.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-2xs">
                        <span className="text-slate-700 font-medium truncate max-w-[140px]">
                          {item.foodName}
                        </span>
                        <span className="text-slate-500 font-mono">{item.calories} kcal</span>
                      </div>
                    ))
                  )}
                  {breakfastItems.length > 3 && (
                    <span className="text-3xs font-mono text-slate-400 block">
                      +{breakfastItems.length - 3} more items
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenLogger("breakfast")}
                className="w-full py-1.5 text-2xs font-semibold text-slate-800 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Plus size={12} weight="bold" />
                <span>Add to Breakfast</span>
              </button>
            </div>

            {/* Lunch */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Lunch
                  </span>
                  <span className="text-2xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {lunchCal} kcal
                  </span>
                </div>

                <div className="py-3 space-y-1.5 min-h-[90px]">
                  {lunchItems.length === 0 ? (
                    <span className="text-2xs text-slate-400 italic block pt-2">
                      No items logged yet
                    </span>
                  ) : (
                    lunchItems.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-2xs">
                        <span className="text-slate-700 font-medium truncate max-w-[140px]">
                          {item.foodName}
                        </span>
                        <span className="text-slate-500 font-mono">{item.calories} kcal</span>
                      </div>
                    ))
                  )}
                  {lunchItems.length > 3 && (
                    <span className="text-3xs font-mono text-slate-400 block">
                      +{lunchItems.length - 3} more items
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenLogger("lunch")}
                className="w-full py-1.5 text-2xs font-semibold text-slate-800 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Plus size={12} weight="bold" />
                <span>Add to Lunch</span>
              </button>
            </div>

            {/* Dinner */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Dinner
                  </span>
                  <span className="text-2xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {dinnerCal} kcal
                  </span>
                </div>

                <div className="py-3 space-y-1.5 min-h-[90px]">
                  {dinnerItems.length === 0 ? (
                    <span className="text-2xs text-slate-400 italic block pt-2">
                      No items logged yet
                    </span>
                  ) : (
                    dinnerItems.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-2xs">
                        <span className="text-slate-700 font-medium truncate max-w-[140px]">
                          {item.foodName}
                        </span>
                        <span className="text-slate-500 font-mono">{item.calories} kcal</span>
                      </div>
                    ))
                  )}
                  {dinnerItems.length > 3 && (
                    <span className="text-3xs font-mono text-slate-400 block">
                      +{dinnerItems.length - 3} more items
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenLogger("dinner")}
                className="w-full py-1.5 text-2xs font-semibold text-slate-800 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Plus size={12} weight="bold" />
                <span>Add to Dinner</span>
              </button>
            </div>

            {/* Snack */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Snacks / Tea
                  </span>
                  <span className="text-2xs font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
                    {snackCal} kcal
                  </span>
                </div>

                <div className="py-3 space-y-1.5 min-h-[90px]">
                  {snackItems.length === 0 ? (
                    <span className="text-2xs text-slate-400 italic block pt-2">
                      No items logged yet
                    </span>
                  ) : (
                    snackItems.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-2xs">
                        <span className="text-slate-700 font-medium truncate max-w-[140px]">
                          {item.foodName}
                        </span>
                        <span className="text-slate-500 font-mono">{item.calories} kcal</span>
                      </div>
                    ))
                  )}
                  {snackItems.length > 3 && (
                    <span className="text-3xs font-mono text-slate-400 block">
                      +{snackItems.length - 3} more items
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenLogger("snack")}
                className="w-full py-1.5 text-2xs font-semibold text-slate-800 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Plus size={12} weight="bold" />
                <span>Add to Snack</span>
              </button>
            </div>

          </div>
        </div>

        {/* Clinical Health Advisory Card */}
        <div className="bg-slate-950 text-white p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck size={24} weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  {clinicalTip.tag}
                </span>
                <span className="text-slate-600">•</span>
                <h3 className="text-sm font-bold text-white font-heading">
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
            onClick={onOpenOnboarding || (() => onNavigate("profile"))}
            className="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            Adjust Safeguards
          </button>
        </div>

        {/* ========================================================================= */}
        {/* QUICK ACCESS SCANNER PORTALS: FOOD vs PACKAGED FOOD */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Portal 1: Food & Meal Plate Scanner */}
          <div
            onClick={() => onNavigate("food")}
            className="p-5 bg-white hover:bg-emerald-50/30 rounded-2xl border border-slate-200/80 hover:border-emerald-400 shadow-xs cursor-pointer transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-emerald-100">
                <BowlFood size={24} weight="duotone" />
              </div>
              <div>
                <span className="text-2xs font-mono text-emerald-800 font-bold uppercase tracking-wider">
                  AI Plate Vision
                </span>
                <h4 className="font-heading font-bold text-sm text-slate-950 group-hover:text-emerald-800 transition-colors">
                  Food &amp; Meal Plate Scanner
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Snap home-cooked thalis, calculate serving grams &amp; ICMR plate balance.
                </p>
              </div>
            </div>
            <ArrowRight size={18} className="text-slate-400 group-hover:text-emerald-800 transition-colors shrink-0 ml-2" />
          </div>

          {/* Portal 2: Packaged Food Scanner */}
          <div
            onClick={() => onNavigate("packaged")}
            className="p-5 bg-white hover:bg-amber-50/30 rounded-2xl border border-slate-200/80 hover:border-amber-400 shadow-xs cursor-pointer transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-amber-100">
                <Barcode size={24} weight="duotone" />
              </div>
              <div>
                <span className="text-2xs font-mono text-amber-800 font-bold uppercase tracking-wider">
                  Commercial Product Audit
                </span>
                <h4 className="font-heading font-bold text-sm text-slate-950 group-hover:text-amber-800 transition-colors">
                  Packaged Food &amp; Label Audit
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect front/back packaging, detect palm oil, artificial dyes &amp; expiry dates.
                </p>
              </div>
            </div>
            <ArrowRight size={18} className="text-slate-400 group-hover:text-amber-800 transition-colors shrink-0 ml-2" />
          </div>
        </div>

      </div>
    </div>
  );
};
