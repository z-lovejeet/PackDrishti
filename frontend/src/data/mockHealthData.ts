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
}

export interface ProductHealthAudit {
  id: string;
  commodityName: string;
  brandName: string;
  category: string;
  servingSize: string;
  netQuantity: string;
  mrp: string;
  pricePer100g: string;
  priceRating: 'Budget' | 'Fair Market Rate' | 'Premium';
  priceAnalysis: string;
  overallRating: 'Nutritious Choice' | 'Consume in Moderation' | 'High Health Concern';
  ratingScore: number; // 0-100
  frontImageUrl: string;
  backImageUrl: string;
  badges: HealthBadge[];
  nutrients: NutrientAudit[];
  whoCanConsume: string[];
  whoShouldAvoid: string[];
  healthierAlternatives: string[];
  dietarySummary: string;
}

export const BENCHMARK_HEALTH_PRODUCTS: ProductHealthAudit[] = [
  {
    id: 'health-001',
    commodityName: 'Malt Chocolate Nutrition Drink Powder',
    brandName: 'Bournvita (Mondelez India)',
    category: 'Packaged Health Beverages',
    servingSize: '20 g (with 200 ml milk)',
    netQuantity: '500 g',
    mrp: '₹ 240.00',
    pricePer100g: '₹ 48.00 / 100g',
    priceRating: 'Fair Market Rate',
    priceAnalysis: 'At ₹ 48 per 100g, pricing is standard for fortified malt drinks in India (benchmark average ₹ 45-52 / 100g).',
    overallRating: 'High Health Concern',
    ratingScore: 38,
    frontImageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
    backImageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    badges: [
      { label: 'High Sugar', type: 'danger' },
      { label: 'High Calories', type: 'warning' },
      { label: 'Low Fiber', type: 'neutral' },
      { label: 'Fortified with Vitamins', type: 'good' },
    ],
    nutrients: [
      {
        name: 'Total Added Sugars',
        valuePer100g: 32.2,
        valuePerServe: 6.4,
        unit: 'g',
        icmrDailyLimit: 'Max 25 g / day (WHO & ICMR-NIN)',
        level: 'High',
        assessment: 'Contains 32.2g of sugar per 100g. Nearly one-third of this powder is free sugar, accounting for over 25% of a child daily sugar limit in a single glass.',
      },
      {
        name: 'Energy (Calories)',
        valuePer100g: 385,
        valuePerServe: 77,
        unit: 'kcal',
        icmrDailyLimit: '2,000 kcal / day',
        level: 'Moderate',
        assessment: 'Provides 77 kcal per 20g scoop before accounting for milk calories.',
      },
      {
        name: 'Total Carbohydrates',
        valuePer100g: 85.0,
        valuePerServe: 17.0,
        unit: 'g',
        icmrDailyLimit: '130 g / day',
        level: 'High',
        assessment: 'Primarily simple carbohydrates derived from sugar, malt extract, and liquid glucose.',
      },
      {
        name: 'Total Fat',
        valuePer100g: 1.8,
        valuePerServe: 0.36,
        unit: 'g',
        icmrDailyLimit: '25-30 g / day',
        level: 'Low',
        assessment: 'Fat content is low, with zero trans fats detected.',
      },
      {
        name: 'Sodium',
        valuePer100g: 155,
        valuePerServe: 31,
        unit: 'mg',
        icmrDailyLimit: '2,000 mg / day',
        level: 'Low',
        assessment: 'Well within daily sodium limits.',
      },
    ],
    whoCanConsume: [
      'Active sports adolescents and athletes requiring rapid carbohydrate replenishment.',
      'Individuals with high physical exertion needing quick caloric density.',
    ],
    whoShouldAvoid: [
      'Individuals diagnosed with Type 1 or Type 2 Diabetes (causes rapid blood glucose spikes).',
      'Sedentary children and toddlers (risk of dental cavities, insulin resistance, and early childhood obesity).',
      'Individuals on weight loss or calorie-restricted ketogenic diets.',
    ],
    healthierAlternatives: [
      'Unsweetened roasted barley (sattu) dissolved in buttermilk or water.',
      'Plain boiled whole cow milk with natural crushed almonds and cardamom.',
      'Sprouted ragi (finger millet) malt porridge with no added white sugar.',
    ],
    dietarySummary: 'Marketed as a health tonic, but contains approximately 32% sugar by weight. Daily consumption without high physical activity contributes significantly to excess sugar intake.',
  },
  {
    id: 'health-002',
    commodityName: '2-Minute Instant Masala Noodles',
    brandName: 'Maggi (Nestle India)',
    category: 'Packaged Instant Foods',
    servingSize: '70 g (One Single Pack)',
    netQuantity: '280 g (4 Packs)',
    mrp: '₹ 56.00',
    pricePer100g: '₹ 20.00 / 100g',
    priceRating: 'Budget',
    priceAnalysis: 'At ₹ 14 per 70g pack (₹ 20 / 100g), this product offers budget-tier caloric convenience, but with high nutritional compromise.',
    overallRating: 'High Health Concern',
    ratingScore: 29,
    frontImageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    backImageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
    badges: [
      { label: 'High Sodium', type: 'danger' },
      { label: 'High Saturated Fat', type: 'danger' },
      { label: 'Ultra-Processed', type: 'warning' },
      { label: 'Low Fiber', type: 'neutral' },
    ],
    nutrients: [
      {
        name: 'Sodium (Salt)',
        valuePer100g: 1220,
        valuePerServe: 854,
        unit: 'mg',
        icmrDailyLimit: 'Max 2,000 mg / day (WHO & ICMR)',
        level: 'Excessive',
        assessment: 'A single pack delivers 854mg of sodium, exceeding 42% of the total recommended daily salt limit for an adult in one sitting.',
      },
      {
        name: 'Saturated Fat',
        valuePer100g: 9.8,
        valuePerServe: 6.86,
        unit: 'g',
        icmrDailyLimit: 'Max 15 g / day',
        level: 'High',
        assessment: 'Deep fried in palm oil during manufacturing, leading to high saturated fat concentration.',
      },
      {
        name: 'Total Carbohydrates (Refined Maida)',
        valuePer100g: 63.5,
        valuePerServe: 44.5,
        unit: 'g',
        icmrDailyLimit: '130 g / day',
        level: 'High',
        assessment: 'Made predominantly from refined wheat flour (maida) with dietary fiber stripped.',
      },
      {
        name: 'Energy (Calories)',
        valuePer100g: 427,
        valuePerServe: 299,
        unit: 'kcal',
        icmrDailyLimit: '2,000 kcal / day',
        level: 'Moderate',
        assessment: 'Provides 299 kcal per single pack, largely from refined starch and palm fat.',
      },
    ],
    whoCanConsume: [
      'Occasional emergency meal for healthy adults with normal blood pressure (limit to once a month).',
    ],
    whoShouldAvoid: [
      'Patients with Hypertension or High Blood Pressure (excess sodium triggers fluid retention and pressure spikes).',
      'Individuals with coronary heart disease or elevated LDL cholesterol (high saturated palm fat).',
      'Patients with chronic kidney disease (CKD) requiring strict sodium and potassium limits.',
      'Children as a regular after-school snack substitute.',
    ],
    healthierAlternatives: [
      'Whole wheat or brown rice vermicelli (sewai) tossed with fresh steamed vegetables.',
      'Handmade rolled oats cooked with cumin, mustard seeds, turmeric, and mixed peas.',
      'Millet noodles (ragi or foxtail millet) using homemade spice powder with minimal salt.',
    ],
    dietarySummary: 'Ultra-processed packaged meal containing palm oil and flavour enhancers. Single serve exhausts nearly half the daily sodium allowance and contains high saturated fats.',
  },
  {
    id: 'health-003',
    commodityName: 'Whole California Raw Almonds (Badam)',
    brandName: 'Nutty Gritties / Tata Sampann',
    category: 'Dry Fruits & Nuts',
    servingSize: '28 g (approx. 20-24 nuts)',
    netQuantity: '500 g',
    mrp: '₹ 499.00',
    pricePer100g: '₹ 99.80 / 100g',
    priceRating: 'Premium',
    priceAnalysis: 'At ₹ 99.80 per 100g, this is priced at the premium wholesale dry fruit tier, justified by nutrient density and zero processing.',
    overallRating: 'Nutritious Choice',
    ratingScore: 92,
    frontImageUrl: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80',
    backImageUrl: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=600&q=80',
    badges: [
      { label: 'Low Sugar', type: 'good' },
      { label: 'High Protein', type: 'good' },
      { label: 'Heart Healthy Fats', type: 'good' },
      { label: 'High Dietary Fiber', type: 'good' },
      { label: 'Zero Added Sodium', type: 'good' },
    ],
    nutrients: [
      {
        name: 'Added Sugar',
        valuePer100g: 0.0,
        valuePerServe: 0.0,
        unit: 'g',
        icmrDailyLimit: 'Max 25 g / day',
        level: 'Low',
        assessment: 'Zero added sugar. Contains only trace natural sugars (4.2g/100g) bound with fiber.',
      },
      {
        name: 'Dietary Protein',
        valuePer100g: 21.2,
        valuePerServe: 5.9,
        unit: 'g',
        icmrDailyLimit: '50-60 g / day',
        level: 'High',
        assessment: 'Excellent plant protein density supporting muscle preservation.',
      },
      {
        name: 'Monounsaturated Healthy Fats',
        valuePer100g: 31.5,
        valuePerServe: 8.8,
        unit: 'g',
        icmrDailyLimit: '25-30 g / day',
        level: 'Moderate',
        assessment: 'Rich in oleic acid and Vitamin E, proven to lower LDL bad cholesterol.',
      },
      {
        name: 'Sodium',
        valuePer100g: 1.0,
        valuePerServe: 0.28,
        unit: 'mg',
        icmrDailyLimit: '2,000 mg / day',
        level: 'Low',
        assessment: 'Virtually sodium free in raw unsalted form.',
      },
    ],
    whoCanConsume: [
      'Diabetic and pre-diabetic patients (low glycemic index, prevents blood sugar spikes).',
      'Cardiovascular patients looking to improve lipid profiles and HDL cholesterol.',
      'Growing children, students, and seniors needing brain-healthy Omega fats and Vitamin E.',
      'Fitness enthusiasts and individuals following low-carb or Mediterranean diets.',
    ],
    whoShouldAvoid: [
      'Individuals with verified tree nut allergies.',
      'Patients prone to calcium-oxalate kidney stones (almonds are moderately high in oxalates; consume in controlled portions or soak overnight).',
    ],
    healthierAlternatives: [
      'Walnuts (Akhrot) for higher plant Omega-3 ALA content.',
      'Roasted pumpkin seeds or chia seeds for nut-allergic individuals.',
    ],
    dietarySummary: 'Minimally processed nutrient powerhouse providing plant protein, dietary fiber, magnesium, and heart-protective monounsaturated fats.',
  }
];
