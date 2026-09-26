export * from './roles';
export * from './models';

export interface NutrientAudit {
  name: string;
  valuePer100g: number;
  valuePerServe: number;
  unit: string;
  icmrDailyLimit: string;
  level: 'Low' | 'Moderate' | 'High' | 'Excessive';
  assessment: string;
}

export interface HealthBadge {
  label: string;
  type: 'danger' | 'warning' | 'good' | 'neutral';
  description?: string;
  whatIsIt?: string;
  whyUsed?: string;
  healthConsequences?: string;
  safeDailyLimit?: string;
  whoShouldAvoid?: string;
}

export interface ArtificialColorAudit {
  name: string;
  insCode?: string;
  colorType: 'natural' | 'permitted_synthetic' | 'high_risk_azo';
  grade: 'Grade A' | 'Grade B' | 'Grade C' | string;
  quality: string;
  isOkayToEat: 'Safe to Eat' | 'Consume in Moderation' | 'Avoid or Strictly Limit' | string;
  whyAdded: string;
  healthConsequences: string;
  regulatoryStatus: string;
}

export interface HighNutrientRisk {
  nutrient: string;
  measuredValue: string;
  icmrLimit: string;
  severity: 'critical' | 'high' | 'moderate';
  whatIsIt: string;
  whatItCauses: string;
  immediateEffects: string;
}

export interface ProductHealthAudit {
  id: string;
  commodityName: string;
  brandName: string;
  category: string;
  servingSize: string;
  netQuantity: string;
  mrp: string;
  mfgDate?: string;
  expiryDate?: string;
  isExpired?: boolean;
  expiryStatus?: string;
  expiryWarning?: string;
  pricePer100g: string;
  priceRating: 'Budget' | 'Fair Market Rate' | 'Premium';
  priceAnalysis: string;
  overallRating: 'Nutritious Choice' | 'Consume in Moderation' | 'High Health Concern' | 'Critical Hazard - Expired Food' | string;
  ratingScore: number;
  frontImageUrl: string;
  backImageUrl: string;
  badges: HealthBadge[];
  nutrients: NutrientAudit[];
  whoCanConsume: string[];
  whoShouldAvoid: string[];
  healthierAlternatives: string[];
  dietarySummary: string;
  shouldWeEatIt?: string;
  howBadIsIt?: string;
  notEatableForAge?: string[];
  healthProblemsIfEatenMore?: string[];
  hasPalmOil?: boolean;
  palmOilDetails?: string;
  hasAddedSugar?: boolean;
  addedSugarDetails?: string;
  hasHighSodium?: boolean;
  hasArtificialAdditives?: boolean;
  ingredientsList?: string[];
  flaggedIngredients?: { name: string; reason: string }[];
  artificialColors?: ArtificialColorAudit[];
  whatIsHigh?: HighNutrientRisk[];
}
