import { create } from 'zustand';
import type { UserProfileData, MacroBudgetSummary } from '../types/models';
import { api } from '../utils/apiClient';

export interface MetabolicPreviewResult {
  bmrKcal: number;
  tdeeKcal: number;
  budget: MacroBudgetSummary;
}

interface ProfileState {
  profile: UserProfileData | null;
  budget: MacroBudgetSummary | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfileData>) => Promise<boolean>;
  calculateLivePreview: (data: Partial<UserProfileData>) => MetabolicPreviewResult;
  setLocalProfile: (profile: UserProfileData) => void;
}

// Sensible biological defaults for new users / guest demo preview
const DEFAULT_PROFILE: UserProfileData = {
  age: 28,
  biologicalSex: 'male',
  heightCm: 175,
  currentWeightKg: 72,
  targetWeightKg: 68,
  bodyFatPercentage: 18,
  activityLevel: 'moderately_active',
  primaryGoal: 'moderate_fat_loss',
  dietType: 'standard_omnivore',
  bmrKcal: 1680,
  tdeeKcal: 2604,
  conditions: [],
};

export const calculateClientMacroPreview = (data: Partial<UserProfileData>): MacroBudgetSummary => {
  const age = data.age || 28;
  const isMale = (data.biologicalSex || 'male') === 'male';
  const height = data.heightCm || 175;
  const weight = data.currentWeightKg || 72;
  const activity = data.activityLevel || 'moderately_active';
  const goal = data.primaryGoal || 'moderate_fat_loss';
  const conditions = data.conditions || [];

  // 1. BMR (Mifflin-St Jeor)
  const bmr = isMale
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  // 2. PAL Multiplier
  const palMap: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };
  const tdee = bmr * (palMap[activity] || 1.55);

  // 3. Goal Calorie Adjustment
  const deltaMap: Record<string, number> = {
    rapid_fat_loss: -0.25,
    moderate_fat_loss: -0.15,
    maintenance: 0.0,
    clean_lean_bulk: 0.12,
    aggressive_hypertrophy: 0.2,
    metabolic_reversal: -0.05,
  };
  const rawTargetCal = tdee * (1 + (deltaMap[goal] || 0.0));
  const floorCal = isMale ? 1500 : 1200;
  const targetCal = Math.round(Math.max(floorCal, rawTargetCal));

  // 4. Protein Allocation
  let proteinMultiplier = 1.6;
  if (goal === 'rapid_fat_loss') proteinMultiplier = 2.0;
  else if (goal === 'aggressive_hypertrophy' || goal === 'clean_lean_bulk') proteinMultiplier = 1.8;
  else if (goal === 'maintenance') proteinMultiplier = 1.4;

  if (conditions.includes('chronic_kidney_disease') || conditions.includes('chronic_kidney_disease_ckd')) {
    proteinMultiplier = 0.8;
  }
  const targetProtein = Math.round(weight * proteinMultiplier);
  const proteinCal = targetProtein * 4;

  // 5. Fat Allocation (25% calories, min 0.6g/kg)
  const targetFat = Math.round(Math.max(weight * 0.6, (targetCal * 0.25) / 9));
  const fatCal = targetFat * 9;

  // 6. Residual Carbs
  let targetCarbs = Math.round(Math.max(50, (targetCal - proteinCal - fatCal) / 4));
  if (conditions.includes('diabetes_type_2') || conditions.includes('prediabetes')) {
    targetCarbs = Math.min(targetCarbs, 130);
  }

  // 7. Micronutrients & Thresholds
  const fiberTarget = Math.max(30, Math.round((targetCal / 1000) * 14));
  const sodiumCeiling = conditions.includes('hypertension') ? 1500 : 2000;
  const sugarCeiling = (conditions.includes('diabetes_type_2') || conditions.includes('prediabetes')) ? 10 : 25;
  const waterTarget = Math.round(Math.max(2000, weight * 35));

  return {
    targetCalories: targetCal,
    targetProteinG: targetProtein,
    targetCarbsG: targetCarbs,
    targetFatG: targetFat,
    targetFiberG: fiberTarget,
    ceilingSodiumMg: sodiumCeiling,
    ceilingAddedSugarG: sugarCeiling,
    targetWaterMl: waterTarget,
  };
};

export const calculateClientMetabolicDetails = (data: Partial<UserProfileData>): MetabolicPreviewResult => {
  const age = data.age || 28;
  const isMale = (data.biologicalSex || 'male') === 'male';
  const height = data.heightCm || 175;
  const weight = data.currentWeightKg || 72;
  const activity = data.activityLevel || 'moderately_active';

  const bmr = Math.round(
    isMale
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161
  );

  const palMap: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };
  const tdee = Math.round(bmr * (palMap[activity] || 1.55));
  const budget = calculateClientMacroPreview(data);

  return {
    bmrKcal: bmr,
    tdeeKcal: tdee,
    budget,
  };
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: DEFAULT_PROFILE,
  budget: calculateClientMacroPreview(DEFAULT_PROFILE),
  isLoading: false,
  isSaving: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<{ status: string; data: any }>('/profile');
      if (res && res.data) {
        const d = res.data;
        const mappedProfile: UserProfileData = {
          userId: d.user_id,
          age: d.age,
          biologicalSex: d.biological_sex,
          heightCm: Number(d.height_cm),
          currentWeightKg: Number(d.current_weight_kg),
          targetWeightKg: Number(d.target_weight_kg),
          bodyFatPercentage: d.body_fat_percentage ? Number(d.body_fat_percentage) : null,
          activityLevel: d.activity_level,
          primaryGoal: d.primary_goal,
          dietType: d.diet_type,
          bmrKcal: d.bmr_kcal ? Number(d.bmr_kcal) : undefined,
          tdeeKcal: d.tdee_kcal ? Number(d.tdee_kcal) : undefined,
          conditions: (d.conditions || []).map((c: any) => (typeof c === 'string' ? c : c.condition_key)),
        };

        let mappedBudget: MacroBudgetSummary;
        try {
          const bRes = await api.get<{ status: string; data: any }>('/profile/macro-budget');
          const bd = bRes.data;
          mappedBudget = {
            targetCalories: Number(bd.target_calories),
            targetProteinG: Number(bd.target_protein_g),
            targetCarbsG: Number(bd.target_carbs_g),
            targetFatG: Number(bd.target_fat_g),
            targetFiberG: Number(bd.target_fiber_g),
            ceilingSodiumMg: Number(bd.ceiling_sodium_mg),
            ceilingAddedSugarG: Number(bd.ceiling_added_sugar_g),
            targetWaterMl: Number(bd.target_water_ml),
          };
        } catch {
          mappedBudget = calculateClientMacroPreview(mappedProfile);
        }

        set({
          profile: mappedProfile,
          budget: mappedBudget,
          isLoading: false,
        });
        return;
      }
    } catch {
      // Fallback to local default profile
    }
    set({
      profile: get().profile || DEFAULT_PROFILE,
      budget: calculateClientMacroPreview(get().profile || DEFAULT_PROFILE),
      isLoading: false,
    });
  },

  updateProfile: async (data: Partial<UserProfileData>) => {
    set({ isSaving: true, error: null });
    const current = get().profile || DEFAULT_PROFILE;
    const merged: UserProfileData = { ...current, ...data };
    const optimisticBudget = calculateClientMacroPreview(merged);

    // Immediate optimistic local update (< 16ms)
    set({ profile: merged, budget: optimisticBudget });

    try {
      const payload = {
        age: merged.age,
        biological_sex: merged.biologicalSex,
        height_cm: merged.heightCm,
        current_weight_kg: merged.currentWeightKg,
        target_weight_kg: merged.targetWeightKg,
        body_fat_percentage: merged.bodyFatPercentage || null,
        activity_level: merged.activityLevel,
        primary_goal: merged.primaryGoal,
        diet_type: merged.dietType,
        conditions: merged.conditions,
      };

      await api.put('/profile', payload);
      set({ isSaving: false });
      return true;
    } catch (err: any) {
      set({
        isSaving: false,
        error: err?.message || 'Failed to update profile.',
      });
      return false;
    }
  },

  calculateLivePreview: (data: Partial<UserProfileData>) => {
    const current = get().profile || DEFAULT_PROFILE;
    return calculateClientMetabolicDetails({ ...current, ...data });
  },

  setLocalProfile: (profile: UserProfileData) => {
    set({
      profile,
      budget: calculateClientMacroPreview(profile),
    });
  },
}));
