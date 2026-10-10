/**
 * BiteIQ Domain Models and Database Schemas.
 * Consumer Food Nutrition, Ingredient Safety & Daily Product Scanner.
 */

import type { UserRole } from './roles';
export type { UserRole };

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface HealthAuditModel {
  id: string;
  energyKcal: number;
  proteinG: number;
  carbohydratesG: number;
  totalSugarsG: number;
  addedSugarsG: number;
  totalFatG: number;
  saturatedFatG: number;
  transFatG: number;
  sodiumMg: number;
  healthScore: number;
  advisoryBadges: string[];
  contraindications: string[];
  recommendations: string[];
}

// Authentication & Session Contracts
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// API Envelope Standard
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
  timestamp: string;
  requestId?: string;
}

// User Profile & Biometrics
export interface UserProfileData {
  userId?: string;
  age: number;
  biologicalSex: 'male' | 'female';
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  bodyFatPercentage?: number | null;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  primaryGoal: 'rapid_fat_loss' | 'moderate_fat_loss' | 'maintenance' | 'clean_lean_bulk' | 'aggressive_hypertrophy' | 'metabolic_reversal';
  dietType: 'standard_omnivore' | 'vegetarian' | 'vegan' | 'eggetarian' | 'jain' | 'keto' | 'paleo' | 'halal' | 'sattvic';
  bmrKcal?: number;
  tdeeKcal?: number;
  conditions: string[];
}

export interface MacroBudgetSummary {
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetFiberG: number;
  ceilingSodiumMg: number;
  ceilingAddedSugarG: number;
  targetWaterMl: number;
}

// Daily Food Diary & Meal Entries
export interface MealEntryItem {
  id: string;
  diaryId?: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  sourceType: 'manual_search' | 'plate_vision' | 'packaged_scan';
  servingQuantity: number;
  servingUnit: string;
  weightInGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sodiumMg: number;
  sugarG: number;
  metadataJson?: Record<string, any>;
  loggedAt: string;
  clinicalWarnings?: string[];
}

export interface TotalsConsumed {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sodiumMg: number;
  sugarG: number;
  waterMl: number;
}

export interface RemainingBudget {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface DailyDiaryData {
  diaryId: string;
  diaryDate: string; // YYYY-MM-DD
  budget: MacroBudgetSummary;
  totalsConsumed: TotalsConsumed;
  remaining: RemainingBudget;
  meals: {
    breakfast: MealEntryItem[];
    lunch: MealEntryItem[];
    dinner: MealEntryItem[];
    snack: MealEntryItem[];
  };
  adherenceStatus: string;
}

// Plate Computer Vision
export interface DetectedFoodPlateItem {
  id: string;
  name: string;
  hindiName?: string;
  category: string;
  estimatedGrams: number;
  confidenceScore: number;
  boundingBox: number[]; // [ymin, xmin, ymax, xmax] (0-1000 scale)
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  servingDescription: string;
}

export interface PlateAnalysisData {
  analysisId: string;
  detectedItems: DetectedFoodPlateItem[];
  plateSummary: {
    totalCalories: number;
    totalProteinG: number;
    totalCarbsG: number;
    totalFatG: number;
    totalFiberG: number;
  };
  healthAdvisory?: string;
  warnings?: string[];
}

// Packaged Food Audit
export interface PackagedNutrientItem {
  name: string;
  valuePer100g: number;
  valuePerServe: number;
  unit: string;
  icmrDailyLimit?: string;
  level?: string;
  assessment?: string;
}

export interface PackagedBadgeItem {
  id?: string;
  label: string;
  severity: 'danger' | 'warning' | 'good' | 'neutral';
  description?: string;
}

export interface PackagedAdditiveItem {
  code?: string;
  name: string;
  type?: string;
  grade: string;
  advisory?: string;
}

export interface PackagedAuditResultData {
  auditId: string;
  productName: string;
  brandName: string;
  category: string;
  healthScore: number;
  scoreBand: string;
  mrp?: number;
  netQuantityG?: number;
  pricePer100g?: number;
  priceRating?: string;
  mfgDate?: string;
  expiryDate?: string;
  isExpired: boolean;
  nutrientsPer100g: {
    energyKcal: number;
    proteinG: number;
    totalCarbsG: number;
    totalSugarsG: number;
    addedSugarsG: number;
    totalFatG: number;
    saturatedFatG: number;
    transFatG: number;
    sodiumMg: number;
    dietaryFiberG: number;
  };
  nutrientsRaw: PackagedNutrientItem[];
  badges: PackagedBadgeItem[];
  additivesAudit: PackagedAdditiveItem[];
  contraindicationAlerts: {
    condition: string;
    severity: string;
    alert: string;
  }[];
  healthierAlternatives: string[];
  clinicalAdvisory: {
    shouldWeEatIt: string;
    howBadIsIt: string;
    notEatableForAge: string[];
    whoCanConsume: string[];
    whoShouldAvoid: string[];
    healthProblems: string[];
    hasPalmOil: boolean;
    palmOilDetails?: string;
    hasAddedSugar: boolean;
    hasHighSodium: boolean;
    hasArtificialAdditives: boolean;
    ingredientsList: string[];
    flaggedIngredients: { name: string; reason: string }[];
  };
  createdAt: string;
}

// Food Reference & Swaps
export interface FoodReferenceItem {
  id: string;
  name: string;
  hindiName?: string;
  category: string;
  defaultServingG: number;
  servingUnitName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sodiumMg: number;
  sugarG: number;
}

export interface WholeFoodSwapItem {
  originalItem: string;
  recommendedSwap: string;
  healthBenefit: string;
  calorieDelta: number;
  proteinDeltaG: number;
  fiberDeltaG: number;
  conditionRelevance: string;
}
