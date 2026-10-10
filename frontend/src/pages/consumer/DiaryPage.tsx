import React, { useEffect, useState } from "react";
import {
  CaretLeft,
  CaretRight,
  Calendar,
  Plus,
  Trash,
  Camera,
  Barcode,
  MagnifyingGlass,
  WarningCircle,
} from "@phosphor-icons/react";
import { useDiaryStore } from "../../store/useDiaryStore";
import { useProfileStore } from "../../store/useProfileStore";
import { useAuthStore } from "../../store/authStore";
import { MealEntryItem } from "../../types/models";

interface DiaryPageProps {
  onNavigate: (page: string) => void;
  onOpenLogger: (slot: "breakfast" | "lunch" | "dinner" | "snack") => void;
}

const MEAL_SLOTS = [
  { id: "breakfast", label: "Breakfast", defaultTime: "Morning (7:00 AM - 10:30 AM)" },
  { id: "lunch", label: "Lunch", defaultTime: "Midday (12:30 PM - 3:00 PM)" },
  { id: "dinner", label: "Dinner", defaultTime: "Evening (7:30 PM - 10:00 PM)" },
  { id: "snack", label: "Snacks", defaultTime: "Anytime Quick Bites" },
] as const;

export const DiaryPage: React.FC<DiaryPageProps> = ({
  onNavigate,
  onOpenLogger,
}) => {
  const { isAuthenticated } = useAuthStore();
  const {
    activeDate,
    diary,
    setDate,
    fetchDiary,
    deleteItem,
  } = useDiaryStore();

  const { budget: profileBudget, fetchProfile } = useProfileStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const formattedDate = (() => {
    try {
      const [year, month, day] = activeDate.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return activeDate;
    }
  })();

  const handleDelete = async (entryId: string) => {
    setDeletingId(entryId);
    try {
      await deleteItem(entryId);
    } finally {
      setDeletingId(null);
    }
  };

  // Compute Subtotals for a Slot
  const getSlotSubtotals = (items: MealEntryItem[]) => {
    return items.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        proteinG: acc.proteinG + (item.proteinG || 0),
        carbsG: acc.carbsG + (item.carbsG || 0),
        fatG: acc.fatG + (item.fatG || 0),
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
    );
  };

  const targetCalories = diary?.budget?.targetCalories ?? profileBudget?.targetCalories ?? 2000;
  const totalsConsumed = diary?.totalsConsumed ?? {
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    fiberG: 0,
    sodiumMg: 0,
    sugarG: 0,
    waterMl: 0,
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28 md:pb-16 pt-4 sm:pt-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Date Navigator Header */}
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
                {isToday ? `Today (${formattedDate})` : formattedDate}
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

          <div className="flex items-center gap-3 text-xs font-mono">
            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              className="text-2xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors font-sans"
            >
              Dashboard
            </button>
            <span className="text-slate-500">Day Total:</span>
            <span className="font-bold text-slate-900 font-heading text-sm">
              {totalsConsumed.calories.toLocaleString()} / {targetCalories.toLocaleString()} kcal
            </span>
          </div>
        </div>

        {/* 4 Distinct Meal Slot Cards */}
        <div className="space-y-5">
          {MEAL_SLOTS.map((slot) => {
            const items = diary?.meals?.[slot.id] ?? [];
            const sub = getSlotSubtotals(items);

            return (
              <div
                key={slot.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
              >
                {/* Meal Slot Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/40">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-bold text-base text-slate-900">
                        {slot.label}
                      </h3>
                      <span className="text-2xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        {items.length} {items.length === 1 ? "item" : "items"}
                      </span>
                    </div>
                    <span className="text-2xs text-slate-600 block mt-0.5">
                      {slot.defaultTime}
                    </span>
                  </div>

                  {/* Subtotal Macro Badges */}
                  <div className="flex items-center gap-2 sm:gap-3 text-2xs font-mono">
                    <div className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-800 font-semibold">
                      {Math.round(sub.calories)} kcal
                    </div>
                    <div className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md font-medium">
                      {Math.round(sub.proteinG)}g P
                    </div>
                    <div className="px-2 py-1 bg-cyan-50 text-cyan-700 rounded-md font-medium">
                      {Math.round(sub.carbsG)}g C
                    </div>
                    <div className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md font-medium">
                      {Math.round(sub.fatG)}g F
                    </div>
                  </div>
                </div>

                {/* Meal Slot Items */}
                <div className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <div className="py-8 px-4 text-center">
                      <p className="text-xs text-slate-600">
                        No food items logged for {slot.label.toLowerCase()} yet.
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenLogger(slot.id)}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <Plus size={14} weight="bold" />
                        <span>Add {slot.label} Item</span>
                      </button>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-heading font-semibold text-sm text-slate-900">
                              {item.foodName}
                            </span>

                            {/* Source Type Tag */}
                            {item.sourceType === "plate_vision" && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                <Camera size={12} weight="bold" />
                                <span>Plate Vision</span>
                              </span>
                            )}
                            {item.sourceType === "packaged_scan" && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                <Barcode size={12} weight="bold" />
                                <span>Packaged Scan</span>
                              </span>
                            )}
                            {item.sourceType === "manual_search" && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                <MagnifyingGlass size={12} weight="bold" />
                                <span>Database</span>
                              </span>
                            )}
                          </div>

                          <div className="text-2xs text-slate-600 font-mono">
                            {item.servingQuantity} {item.servingUnit || "serving"}
                            {item.weightInGrams > 0 && ` (~${item.weightInGrams}g)`}
                          </div>

                          {/* Clinical warnings if attached */}
                          {item.clinicalWarnings && item.clinicalWarnings.length > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex mt-1">
                              <WarningCircle size={12} weight="bold" />
                              <span>{item.clinicalWarnings.join(", ")}</span>
                            </div>
                          )}
                        </div>

                        {/* Macros & Delete Action */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <div className="text-right text-2xs font-mono">
                            <div className="font-bold text-slate-900 text-xs">
                              {Math.round(item.calories)} kcal
                            </div>
                            <div className="text-slate-500">
                              {Math.round(item.proteinG)}g P • {Math.round(item.carbsG)}g C • {Math.round(item.fatG)}g F
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
                            title="Delete entry"
                            aria-label={`Delete ${item.foodName}`}
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Quick Add Button */}
                {items.length > 0 && (
                  <div className="p-3 bg-slate-50/50 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onOpenLogger(slot.id)}
                      className="w-full py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 border border-dashed border-slate-300 hover:border-slate-400 rounded-xl bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} weight="bold" />
                      <span>Add item to {slot.label}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Daily Summary Card */}
        <div className="bg-slate-950 text-slate-100 p-5 rounded-2xl border border-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-heading font-bold text-sm text-white">
              Daily Nutrition Intake Summary
            </span>
            <span className="text-2xs font-mono text-emerald-400">
              ICMR-NIN 2024 Audit
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-2xs text-slate-400 block">Total Energy</span>
              <span className="font-bold text-sm text-white font-heading">
                {totalsConsumed.calories.toLocaleString()} kcal
              </span>
            </div>
            <div>
              <span className="text-2xs text-slate-400 block">Protein Total</span>
              <span className="font-bold text-sm text-indigo-300">
                {totalsConsumed.proteinG.toFixed(1)}g
              </span>
            </div>
            <div>
              <span className="text-2xs text-slate-400 block">Carbohydrates</span>
              <span className="font-bold text-sm text-cyan-300">
                {totalsConsumed.carbsG.toFixed(1)}g
              </span>
            </div>
            <div>
              <span className="text-2xs text-slate-400 block">Fats Total</span>
              <span className="font-bold text-sm text-amber-300">
                {totalsConsumed.fatG.toFixed(1)}g
              </span>
            </div>
            <div>
              <span className="text-2xs text-slate-400 block">Dietary Fiber</span>
              <span className="font-bold text-slate-200">
                {totalsConsumed.fiberG.toFixed(1)}g
              </span>
            </div>
            <div>
              <span className="text-2xs text-slate-400 block">Sodium</span>
              <span className="font-bold text-slate-200">
                {totalsConsumed.sodiumMg} mg
              </span>
            </div>
            <div>
              <span className="text-2xs text-slate-400 block">Added Sugars</span>
              <span className="font-bold text-slate-200">
                {totalsConsumed.sugarG.toFixed(1)}g
              </span>
            </div>
            <div>
              <span className="text-2xs text-slate-400 block">Hydration</span>
              <span className="font-bold text-cyan-400">
                {totalsConsumed.waterMl} mL
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
