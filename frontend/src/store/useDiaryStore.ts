import { create } from 'zustand';
import type { DailyDiaryData, MealEntryItem } from '../types/models';
import { api } from '../utils/apiClient';
import { useProfileStore } from './useProfileStore';

interface DiaryState {
  activeDate: string; // YYYY-MM-DD
  diary: DailyDiaryData | null;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;

  // Actions
  setDate: (dateStr: string) => void;
  fetchDiary: (dateStr?: string) => Promise<void>;
  logItem: (
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    foodName: string,
    grams: number,
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    fiber: number,
    sodium: number,
    sugar: number,
    servingUnit?: string,
    sourceType?: 'manual_search' | 'plate_vision' | 'packaged_scan',
    metadata?: Record<string, any>
  ) => Promise<boolean>;
  deleteItem: (entryId: string) => Promise<boolean>;
  quickAddWater: (amountMl?: number) => Promise<boolean>;
}

const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createEmptyDiary = (dateStr: string): DailyDiaryData => {
  const profileBudget = useProfileStore.getState().budget || {
    targetCalories: 2000,
    targetProteinG: 120,
    targetCarbsG: 220,
    targetFatG: 55,
    targetFiberG: 30,
    ceilingSodiumMg: 2000,
    ceilingAddedSugarG: 25,
    targetWaterMl: 2500,
  };

  return {
    diaryId: `local-${Date.now()}`,
    diaryDate: dateStr,
    budget: profileBudget,
    totalsConsumed: {
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
      sodiumMg: 0,
      sugarG: 0,
      waterMl: 0,
    },
    remaining: {
      calories: profileBudget.targetCalories,
      proteinG: profileBudget.targetProteinG,
      carbsG: profileBudget.targetCarbsG,
      fatG: profileBudget.targetFatG,
    },
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    },
    adherenceStatus: 'on_track',
  };
};

export const useDiaryStore = create<DiaryState>((set, get) => ({
  activeDate: getTodayString(),
  diary: createEmptyDiary(getTodayString()),
  isLoading: false,
  isSyncing: false,
  error: null,

  setDate: (dateStr: string) => {
    set({ activeDate: dateStr });
    get().fetchDiary(dateStr);
  },

  fetchDiary: async (dateStr?: string) => {
    const targetDate = dateStr || get().activeDate;
    set({ isLoading: true, error: null });

    try {
      const res = await api.get<any>(`/diary?date=${targetDate}`);
      if (res && res.diary_id) {
        const mappedDiary: DailyDiaryData = {
          diaryId: res.diary_id,
          diaryDate: res.diary_date,
          budget: {
            targetCalories: Number(res.budget.target_calories),
            targetProteinG: Number(res.budget.target_protein_g),
            targetCarbsG: Number(res.budget.target_carbs_g),
            targetFatG: Number(res.budget.target_fat_g),
            targetFiberG: Number(res.budget.target_fiber_g),
            ceilingSodiumMg: Number(res.budget.ceiling_sodium_mg),
            ceilingAddedSugarG: Number(res.budget.ceiling_added_sugar_g),
            targetWaterMl: Number(res.budget.target_water_ml),
          },
          totalsConsumed: {
            calories: Number(res.totals_consumed.calories),
            proteinG: Number(res.totals_consumed.protein_g),
            carbsG: Number(res.totals_consumed.carbs_g),
            fatG: Number(res.totals_consumed.fat_g),
            fiberG: Number(res.totals_consumed.fiber_g),
            sodiumMg: Number(res.totals_consumed.sodium_mg),
            sugarG: Number(res.totals_consumed.sugar_g),
            waterMl: Number(res.totals_consumed.water_ml),
          },
          remaining: {
            calories: Number(res.remaining.calories),
            proteinG: Number(res.remaining.protein_g),
            carbsG: Number(res.remaining.carbs_g),
            fatG: Number(res.remaining.fat_g),
          },
          meals: {
            breakfast: (res.meals.breakfast || []).map(mapMealEntry),
            lunch: (res.meals.lunch || []).map(mapMealEntry),
            dinner: (res.meals.dinner || []).map(mapMealEntry),
            snack: (res.meals.snack || []).map(mapMealEntry),
          },
          adherenceStatus: res.adherence_status || 'on_track',
        };

        set({ diary: mappedDiary, isLoading: false });
        return;
      }
    } catch {
      // In offline / guest mode, fallback to local empty diary
    }

    set({
      diary: get().diary || createEmptyDiary(targetDate),
      isLoading: false,
    });
  },

  logItem: async (
    mealType,
    foodName,
    grams,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sodium,
    sugar,
    servingUnit = 'serving',
    sourceType = 'manual_search',
    metadata = {}
  ) => {
    const current = get().diary || createEmptyDiary(get().activeDate);
    const newEntry: MealEntryItem = {
      id: `local-entry-${Date.now()}`,
      diaryId: current.diaryId,
      mealType,
      foodName,
      sourceType,
      servingQuantity: 1.0,
      servingUnit,
      weightInGrams: grams,
      calories,
      proteinG: protein,
      carbsG: carbs,
      fatG: fat,
      fiberG: fiber,
      sodiumMg: sodium,
      sugarG: sugar,
      metadataJson: metadata,
      loggedAt: new Date().toISOString(),
    };

    // Optimistically update
    const updatedMeals = {
      ...current.meals,
      [mealType]: [newEntry, ...current.meals[mealType]],
    };
    const newTotals = {
      ...current.totalsConsumed,
      calories: Math.round((current.totalsConsumed.calories + calories) * 10) / 10,
      proteinG: Math.round((current.totalsConsumed.proteinG + protein) * 10) / 10,
      carbsG: Math.round((current.totalsConsumed.carbsG + carbs) * 10) / 10,
      fatG: Math.round((current.totalsConsumed.fatG + fat) * 10) / 10,
      fiberG: Math.round((current.totalsConsumed.fiberG + fiber) * 10) / 10,
      sodiumMg: Math.round((current.totalsConsumed.sodiumMg + sodium) * 10) / 10,
      sugarG: Math.round((current.totalsConsumed.sugarG + sugar) * 10) / 10,
    };
    const newRemaining = {
      calories: Math.round((current.budget.targetCalories - newTotals.calories) * 10) / 10,
      proteinG: Math.round((current.budget.targetProteinG - newTotals.proteinG) * 10) / 10,
      carbsG: Math.round((current.budget.targetCarbsG - newTotals.carbsG) * 10) / 10,
      fatG: Math.round((current.budget.targetFatG - newTotals.fatG) * 10) / 10,
    };

    set({
      diary: {
        ...current,
        meals: updatedMeals,
        totalsConsumed: newTotals,
        remaining: newRemaining,
      },
      isSyncing: true,
    });

    try {
      const payload = {
        diary_date: get().activeDate,
        meal_type: mealType,
        food_name: foodName,
        source_type: sourceType,
        serving_quantity: 1.0,
        serving_unit: servingUnit,
        weight_in_grams: grams,
        calories,
        protein_g: protein,
        carbs_g: carbs,
        fat_g: fat,
        fiber_g: fiber,
        sodium_mg: sodium,
        sugar_g: sugar,
        metadata_json: metadata,
      };

      const res = await api.post<any>('/diary/log-item', payload);
      if (res && res.entry_id) {
        newEntry.id = res.entry_id;
      }
      set({ isSyncing: false });
      return true;
    } catch {
      set({ isSyncing: false });
      // Keep optimistic entry locally
      return true;
    }
  },

  deleteItem: async (entryId: string) => {
    const current = get().diary;
    if (!current) return false;

    // Find entry to delete
    let foundEntry: MealEntryItem | null = null;
    let foundSlot: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null = null;

    const slots: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = ['breakfast', 'lunch', 'dinner', 'snack'];
    for (const slot of slots) {
      const item = current.meals[slot].find((e: MealEntryItem) => e.id === entryId);
      if (item) {
        foundEntry = item;
        foundSlot = slot;
        break;
      }
    }

    if (!foundEntry || !foundSlot) return false;

    const targetEntry: MealEntryItem = foundEntry;
    const targetSlot = foundSlot;

    // Optimistically remove
    const updatedMeals = {
      ...current.meals,
      [targetSlot]: current.meals[targetSlot].filter((e: MealEntryItem) => e.id !== entryId),
    };
    const newTotals = {
      ...current.totalsConsumed,
      calories: Math.max(0, Math.round((current.totalsConsumed.calories - targetEntry.calories) * 10) / 10),
      proteinG: Math.max(0, Math.round((current.totalsConsumed.proteinG - targetEntry.proteinG) * 10) / 10),
      carbsG: Math.max(0, Math.round((current.totalsConsumed.carbsG - targetEntry.carbsG) * 10) / 10),
      fatG: Math.max(0, Math.round((current.totalsConsumed.fatG - targetEntry.fatG) * 10) / 10),
      fiberG: Math.max(0, Math.round((current.totalsConsumed.fiberG - targetEntry.fiberG) * 10) / 10),
      sodiumMg: Math.max(0, Math.round((current.totalsConsumed.sodiumMg - targetEntry.sodiumMg) * 10) / 10),
      sugarG: Math.max(0, Math.round((current.totalsConsumed.sugarG - targetEntry.sugarG) * 10) / 10),
    };
    const newRemaining = {
      calories: Math.round((current.budget.targetCalories - newTotals.calories) * 10) / 10,
      proteinG: Math.round((current.budget.targetProteinG - newTotals.proteinG) * 10) / 10,
      carbsG: Math.round((current.budget.targetCarbsG - newTotals.carbsG) * 10) / 10,
      fatG: Math.round((current.budget.targetFatG - newTotals.fatG) * 10) / 10,
    };

    set({
      diary: {
        ...current,
        meals: updatedMeals,
        totalsConsumed: newTotals,
        remaining: newRemaining,
      },
      isSyncing: true,
    });

    try {
      if (!entryId.startsWith('local-')) {
        await api.delete(`/diary/entry/${entryId}`);
      }
      set({ isSyncing: false });
      return true;
    } catch {
      set({ isSyncing: false });
      return true;
    }
  },

  quickAddWater: async (amountMl: number = 250) => {
    const current = get().diary || createEmptyDiary(get().activeDate);
    const updatedWater = current.totalsConsumed.waterMl + amountMl;

    set({
      diary: {
        ...current,
        totalsConsumed: {
          ...current.totalsConsumed,
          waterMl: updatedWater,
        },
      },
      isSyncing: true,
    });

    try {
      await api.post('/diary/water', {
        diary_date: get().activeDate,
        amount_ml: amountMl,
      });
      set({ isSyncing: false });
      return true;
    } catch {
      set({ isSyncing: false });
      return true;
    }
  },
}));

function mapMealEntry(raw: any): MealEntryItem {
  return {
    id: raw.id || raw.entry_id || `item-${Date.now()}`,
    diaryId: raw.diary_id,
    mealType: raw.meal_type || 'snack',
    foodName: raw.food_name || 'Food Item',
    sourceType: raw.source_type || 'manual_search',
    servingQuantity: Number(raw.serving_quantity || 1.0),
    servingUnit: raw.serving_unit || 'serving',
    weightInGrams: Number(raw.weight_in_grams || 100),
    calories: Number(raw.calories || 0),
    proteinG: Number(raw.protein_g || 0),
    carbsG: Number(raw.carbs_g || 0),
    fatG: Number(raw.fat_g || 0),
    fiberG: Number(raw.fiber_g || 0),
    sodiumMg: Number(raw.sodium_mg || 0),
    sugarG: Number(raw.sugar_g || 0),
    metadataJson: raw.metadata_json,
    loggedAt: raw.logged_at || new Date().toISOString(),
    clinicalWarnings: raw.clinical_warnings || [],
  };
}
