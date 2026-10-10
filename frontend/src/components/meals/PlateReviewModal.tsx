import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  Plus,
  Minus,
  Trash,
  Sparkle,
  WarningCircle,
} from "@phosphor-icons/react";
import { PlateAnalysisData, DetectedFoodPlateItem } from "../../types/models";
import { apiClient } from "../../utils/apiClient";
import { useDiaryStore } from "../../store/useDiaryStore";

interface PlateReviewModalProps {
  isOpen: boolean;
  analysisData: PlateAnalysisData | null;
  initialSlot?: "breakfast" | "lunch" | "dinner" | "snack";
  onClose: () => void;
  onConfirmed: (mealType: string, count: number) => void;
}

export const PlateReviewModal: React.FC<PlateReviewModalProps> = ({
  isOpen,
  analysisData,
  initialSlot = "lunch",
  onClose,
  onConfirmed,
}) => {
  const [targetSlot, setTargetSlot] = useState<"breakfast" | "lunch" | "dinner" | "snack">(
    initialSlot
  );
  const [items, setItems] = useState<DetectedFoodPlateItem[]>([]);
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Missed Item inline input
  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>("");
  const [customGrams, setCustomGrams] = useState<number>(50);

  const { activeDate, fetchDiary } = useDiaryStore();

  useEffect(() => {
    if (analysisData?.detectedItems) {
      setItems([...analysisData.detectedItems]);
    }
  }, [analysisData]);

  useEffect(() => {
    if (initialSlot) {
      setTargetSlot(initialSlot);
    }
  }, [initialSlot]);

  // Portion Stepper adjustment
  const handleAdjustGrams = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newGrams = Math.max(10, item.estimatedGrams + delta);
        const ratio = newGrams / Math.max(1, item.estimatedGrams);
        return {
          ...item,
          estimatedGrams: newGrams,
          calories: Math.round(item.calories * ratio),
          proteinG: Number((item.proteinG * ratio).toFixed(1)),
          carbsG: Number((item.carbsG * ratio).toFixed(1)),
          fatG: Number((item.fatG * ratio).toFixed(1)),
          fiberG: Number((item.fiberG * ratio).toFixed(1)),
        };
      })
    );
  };

  // Remove misidentified item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Add missed item
  const handleAddMissedItem = () => {
    if (!customName.trim()) return;
    const newItem: DetectedFoodPlateItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      category: "Side/Garnish",
      estimatedGrams: customGrams,
      confidenceScore: 1.0,
      boundingBox: [0, 0, 1000, 1000],
      calories: Math.round(customGrams * 1.5),
      proteinG: Number((customGrams * 0.05).toFixed(1)),
      carbsG: Number((customGrams * 0.15).toFixed(1)),
      fatG: Number((customGrams * 0.08).toFixed(1)),
      fiberG: Number((customGrams * 0.02).toFixed(1)),
      servingDescription: `${customGrams}g portion`,
    };
    setItems((prev) => [...prev, newItem]);
    setCustomName("");
    setCustomGrams(50);
    setIsAddingCustom(false);
  };

  // Aggregate totals
  const totalCalories = items.reduce((acc, it) => acc + (it.calories || 0), 0);
  const totalProtein = items.reduce((acc, it) => acc + (it.proteinG || 0), 0);
  const totalCarbs = items.reduce((acc, it) => acc + (it.carbsG || 0), 0);
  const totalFat = items.reduce((acc, it) => acc + (it.fatG || 0), 0);
  const totalFiber = items.reduce((acc, it) => acc + (it.fiberG || 0), 0);

  // Commit items to backend diary
  const handleConfirmAndLog = async () => {
    if (items.length === 0) return;
    setIsCommitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        diary_date: activeDate,
        meal_type: targetSlot,
        items: items.map((it) => ({
          food_name: it.name,
          serving_quantity: 1.0,
          serving_unit: it.servingDescription || "serving",
          weight_in_grams: it.estimatedGrams,
          calories: it.calories,
          protein_g: it.proteinG,
          carbs_g: it.carbsG,
          fat_g: it.fatG,
          fiber_g: it.fiberG,
          sodium_mg: 150.0,
          sugar_g: 1.0,
          confidence_score: it.confidenceScore,
          bounding_box: it.boundingBox,
        })),
      };

      await apiClient.post("/meals/confirm-plate-log", payload);
      await fetchDiary(activeDate);

      onConfirmed(targetSlot, items.length);
      onClose();
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail || "Failed to commit plate log. Please try again.";
      setErrorMsg(detail);
    } finally {
      setIsCommitting(false);
    }
  };

  if (!isOpen || !analysisData) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-2xl border border-slate-200/80 shadow-modal max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkle size={20} weight="fill" className="text-emerald-600" />
            <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900">
              Review AI Meal Plate
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Aggregate Macro Summary Pill Header */}
        <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-2xs font-mono uppercase tracking-wider text-emerald-400 block">
              Recognized Nutritional Yield
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-heading font-extrabold text-2xl text-white">
                {Math.round(totalCalories)}
              </span>
              <span className="text-xs font-mono text-slate-300">kcal total</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-2xs font-mono">
            <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded font-semibold">
              {totalProtein.toFixed(1)}g Protein
            </span>
            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded font-semibold">
              {totalCarbs.toFixed(1)}g Carbs
            </span>
            <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded font-semibold">
              {totalFat.toFixed(1)}g Fat
            </span>
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded font-semibold">
              {totalFiber.toFixed(1)}g Fiber
            </span>
          </div>
        </div>

        {/* Meal Slot Selector */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-2xs font-mono uppercase text-slate-500 font-semibold">
            Log to Meal Slot:
          </span>
          <div className="flex items-center gap-1">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTargetSlot(slot)}
                className={`py-1 px-2.5 rounded-md text-2xs font-semibold capitalize transition-all ${
                  targetSlot === slot
                    ? "bg-slate-950 text-white shadow-2xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Itemized Foods Scroll View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-bold text-sm text-slate-900">
                      {item.name}
                    </span>
                    {item.hindiName && (
                      <span className="text-2xs text-slate-500 font-hindi">
                        {item.hindiName}
                      </span>
                    )}
                    <span className="text-2xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-2xs text-slate-600 font-mono block mt-0.5">
                    {Math.round(item.confidenceScore * 100)}% detection confidence
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove item"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash size={16} />
                </button>
              </div>

              {/* Portion Stepper & Dynamic Macros */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Portion:</span>
                  <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleAdjustGrams(item.id, -25)}
                      className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
                      aria-label="Decrease portion"
                    >
                      <Minus size={12} weight="bold" />
                    </button>
                    <span className="px-2.5 text-xs font-mono font-bold text-slate-900">
                      {item.estimatedGrams}g
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustGrams(item.id, 25)}
                      className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
                      aria-label="Increase portion"
                    >
                      <Plus size={12} weight="bold" />
                    </button>
                  </div>
                </div>

                <div className="text-2xs font-mono text-slate-600">
                  <span className="font-bold text-slate-900">{item.calories} kcal</span>
                  <span className="text-slate-400 mx-1">•</span>
                  <span>{item.proteinG}g P</span>
                  <span className="text-slate-400 mx-1">•</span>
                  <span>{item.carbsG}g C</span>
                  <span className="text-slate-400 mx-1">•</span>
                  <span>{item.fatG}g F</span>
                </div>
              </div>
            </div>
          ))}

          {/* Inline Add Missed Item */}
          {isAddingCustom ? (
            <div className="p-3.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 space-y-3 animate-fadeIn">
              <span className="text-xs font-bold text-emerald-950 block">
                Add Missing Food or Condiment
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="e.g. 1 tbsp Desi Ghee, Mango Pickle"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customGrams}
                    onChange={(e) => setCustomGrams(Number(e.target.value) || 10)}
                    className="w-20 px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                  />
                  <span className="text-xs font-mono text-slate-600">grams</span>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddMissedItem}
                  className="px-3 py-1 text-xs font-semibold bg-emerald-700 text-white rounded-md hover:bg-emerald-800"
                >
                  Add Item
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingCustom(true)}
              className="w-full py-2.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 border border-dashed border-emerald-300 hover:border-emerald-400 rounded-xl bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus size={14} weight="bold" />
              <span>Add Missed Dish or Condiment</span>
            </button>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <WarningCircle size={16} weight="bold" className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmAndLog}
            disabled={items.length === 0 || isCommitting}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <CheckCircle size={16} weight="bold" />
            <span>
              {isCommitting
                ? "Logging to Diary..."
                : `Confirm & Log to ${targetSlot.toUpperCase()}`}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
