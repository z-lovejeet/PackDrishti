import React from "react";
import {
  Flask,
  Heartbeat,
  Sparkle,
  ShieldCheck,
  CheckCircle,
  WarningCircle,
  FileText,
  ArrowRight,
  Scales,
  ChartBar,
  Atom,
} from "@phosphor-icons/react";

interface ScienceMethodologyPageProps {
  onNavigate: (page: string) => void;
  onOpenAuthModal?: () => void;
}

export const ScienceMethodologyPage: React.FC<ScienceMethodologyPageProps> = ({
  onNavigate,
  onOpenAuthModal,
}) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-slate-100 selection:text-slate-900">
      
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-14 sm:pt-24 sm:pb-18 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-indigo-950 text-indigo-300 flex items-center justify-center font-bold text-sm shadow-xs border border-indigo-800">
            <Flask size={20} weight="fill" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 text-slate-600 text-2xs font-mono font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            <span>Clinical Science • Evidence-Based Nutritional AI</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950 font-heading max-w-3xl leading-[1.15]">
          The Clinical Methodology &amp; Computational Science Behind BiteIQ.
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
          Every nutrient budget, additive classification, and health score in BiteIQ is grounded in peer-reviewed clinical nutrition literature, the ICMR-NIN 2024 Dietary Guidelines, and algorithmic computer vision.
        </p>

        {/* Core Scientific Anchors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-2xs font-mono text-indigo-700 font-semibold block uppercase">01 / Foundation</span>
            <div className="text-sm font-bold text-slate-900 font-heading mt-1">ICMR-NIN 2024 Guidelines</div>
            <p className="text-2xs text-slate-600 mt-1">National Institute of Nutrition nutrient requirements &amp; Recommended Dietary Allowances (RDA) for Indians.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-2xs font-mono text-indigo-700 font-semibold block uppercase">02 / Classification</span>
            <div className="text-sm font-bold text-slate-900 font-heading mt-1">NOVA Food Classification</div>
            <p className="text-2xs text-slate-600 mt-1">Distinguishing unprocessed whole foods from ultra-processed industrial formulations.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-2xs font-mono text-indigo-700 font-semibold block uppercase">03 / Toxicological AI</span>
            <div className="text-sm font-bold text-slate-900 font-heading mt-1">CATS Additive Index</div>
            <p className="text-2xs text-slate-600 mt-1">Chemical Additive Toxicity Scoring evaluating 800+ INS/E-numbers against IARC, EFSA &amp; FSSAI monographs.</p>
          </div>
        </div>
      </section>

      {/* Plate Computer Vision & Volumetric Modeling */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-2xl mb-10">
          <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Vision Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-heading mt-4">
            How Fresh Food Plate Vision Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Estimating calories and macronutrients from a 2D smartphone photograph requires multi-stage geometric and biochemical inference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono font-bold text-xs">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Semantic Segmentation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our vision neural network delineates food contours, separating multiple dishes on a single thali (e.g. dal, paneer sabzi, rice, roti, salad).
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono font-bold text-xs">
              02
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Geometric Depth Estimation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Perspective cues, plate rim boundaries, and monocular depth mapping calculate relative 3D mound heights and container dimensions.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono font-bold text-xs">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Density Weight Matrix
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculated volume is mapped through empirical density coefficients (g/cm³) specific to culinary preparations (e.g. cooked dal ~1.05g/cm³, cooked basmati ~0.82g/cm³).
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono font-bold text-xs">
              04
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Biochemical Lookups
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Weight values query our verified Indian Food Composition Tables (IFCT) for precise calories, protein, bioavailable iron, calcium, and dietary fiber.
            </p>
          </div>
        </div>
      </section>

      {/* The 0-100 Health Score Architecture */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-2xl mb-10">
          <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
            Algorithmic Scoring
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-heading mt-4">
            The 0–100 Nutrition &amp; Safety Rating Algorithm
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Unlike simplistic Nutri-Score systems that can be manipulated by food corporations, BiteIQ uses a penalizing multi-vector scoring engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Negative Penalties */}
          <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50/30 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <h3 className="text-sm font-bold text-rose-950 uppercase tracking-wider font-mono">
                Penalties &amp; Deductions
              </h3>
            </div>
            
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-white border border-rose-100">
                <span className="font-bold text-rose-900 block">Added Free Sugars (&gt;10g / 100g)</span>
                <span className="text-slate-600 text-2xs leading-relaxed">
                  Deducts up to 25 points. Escalates severely if high-fructose corn syrup, liquid invert sugar, or maltodextrin is detected in the first 3 ingredients.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-rose-100">
                <span className="font-bold text-rose-900 block">Saturated &amp; Trans Fats</span>
                <span className="text-slate-600 text-2xs leading-relaxed">
                  Deducts up to 20 points. Any presence of partially hydrogenated vegetable oil triggers an instant 30-point deduction and severe health flag.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-rose-100">
                <span className="font-bold text-rose-900 block">Sodium Density (&gt;500mg / 100g)</span>
                <span className="text-slate-600 text-2xs leading-relaxed">
                  Deducts up to 20 points based on sodium per calorie density, critical for hypertensive consumers.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-rose-100">
                <span className="font-bold text-rose-900 block">Harmful INS Additives</span>
                <span className="text-slate-600 text-2xs leading-relaxed">
                  Tier 1 hazardous chemicals (e.g. artificial azo-dyes, propyl gallate) deduct 10–15 points per compound.
                </span>
              </div>
            </div>
          </div>

          {/* Positive Credits */}
          <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider font-mono">
                Nutritive Value Credits
              </h3>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-white border border-emerald-100">
                <span className="font-bold text-emerald-900 block">Dietary Fiber Density (&gt;6g / 100g)</span>
                <span className="text-slate-600 text-2xs leading-relaxed">
                  Adds up to 15 points. Recognizes whole grain bran, soluble beta-glucans, and prebiotic resistant starch.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-emerald-100">
                <span className="font-bold text-emerald-900 block">Natural High-Quality Protein</span>
                <span className="text-slate-600 text-2xs leading-relaxed">
                  Adds up to 15 points for products containing meaningful bioavailable protein without excessive sodium or saturated fat.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-emerald-100">
                <span className="font-bold text-emerald-900 block">Minimally Processed Whole Ingredients</span>
                <span className="text-slate-600 text-2xs leading-relaxed">
                  Adds 10 points when primary ingredients are identifiable raw foods (e.g. whole almonds, oats, roasted chickpeas) rather than protein isolates or starches.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-emerald-100">
                <span className="font-bold text-emerald-900 block">Clean Label Certification</span>
                <span className="text-slate-600 text-2xs leading-relaxed">
                  Zero artificial colors, zero synthetic preservatives, and zero artificial sweeteners awards an integrity bonus.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Additive Categorization System (CATS) */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-2xl mb-10">
          <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-purple-800 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
            Chemical Taxonomy
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-heading mt-4">
            The 4-Tier Chemical Additive Toxicity Framework
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Packaged foods in India contain hundreds of synthetic food additives. We classify each into four clear scientific safety tiers:
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-rose-700 text-white">
                  TIER 1 • SEVERE HAZARD
                </span>
                <span className="text-xs font-bold text-rose-950 font-heading">
                  High Risk / Restrictive Ban Candidates
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compounds with established carcinogenic potential, genotoxicity, or severe endocrine disruption in peer-reviewed animal/human trials. Examples: Potassium Bromate (INS 924a), BHA (INS 320), Tartrazine (INS 102).
              </p>
            </div>
            <span className="text-2xs font-mono text-rose-800 font-semibold self-start sm:self-center shrink-0">
              Immediate Red Alert
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-amber-600 text-white">
                  TIER 2 • MODERATE HAZARD
                </span>
                <span className="text-xs font-bold text-amber-950 font-heading">
                  Gut Microbiome &amp; Metabolic Disruptors
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Industrial emulsifiers and synthetic sweeteners linked to mucosal inflammation, insulin resistance, or altered gut microbiome profiles. Examples: Polysorbate 80 (INS 433), Carboxymethyl Cellulose (INS 466), Sucralose (INS 955).
              </p>
            </div>
            <span className="text-2xs font-mono text-amber-800 font-semibold self-start sm:self-center shrink-0">
              Cautionary Advisory
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-blue-600 text-white">
                  TIER 3 • MINOR CAUTION
                </span>
                <span className="text-xs font-bold text-blue-950 font-heading">
                  Potential Allergens &amp; Sensitive Sensitizers
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generally safe for the broad population but capable of triggering adverse reactions in sensitive individuals, asthmatics, or children. Examples: Sodium Benzoate (INS 211), Sulphites (INS 220–228).
              </p>
            </div>
            <span className="text-2xs font-mono text-blue-800 font-semibold self-start sm:self-center shrink-0">
              Allergen Notice
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-emerald-700 text-white">
                  TIER 4 • RECOGNIZED AS SAFE
                </span>
                <span className="text-xs font-bold text-emerald-950 font-heading">
                  Natural &amp; Inert Technological Aids
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compounds derived from plant sources or naturally occurring acids that pose no physiological toxicity. Examples: Pectin (INS 440), Citric Acid (INS 330), Mixed Tocopherols (Vitamin E, INS 307).
              </p>
            </div>
            <span className="text-2xs font-mono text-emerald-800 font-semibold self-start sm:self-center shrink-0">
              Safe Compound
            </span>
          </div>
        </div>
      </section>

      {/* Published Literature & Standards References */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-2xl mb-8">
          <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            Clinical References
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-heading mt-4">
            Authoritative Guidelines &amp; Citations
          </h2>
        </div>

        <div className="space-y-3 text-xs text-slate-700">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 flex items-start gap-3">
            <FileText size={18} className="text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block font-heading">
                ICMR-National Institute of Nutrition (NIN)
              </span>
              <p className="text-slate-600 text-2xs mt-0.5">
                "Dietary Guidelines for Indians: A Manual", 2024 Edition. Hyderabad: Indian Council of Medical Research. Benchmark for daily macro limits, salt consumption thresholds, and nutrient intake.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 flex items-start gap-3">
            <FileText size={18} className="text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block font-heading">
                World Health Organization (WHO)
              </span>
              <p className="text-slate-600 text-2xs mt-0.5">
                "Guideline: Sugars intake for adults and children", Geneva: World Health Organization, 2015. Recommends reducing free sugars to less than 5% of total caloric intake.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 flex items-start gap-3">
            <FileText size={18} className="text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block font-heading">
                The Lancet Global Health &amp; BMJ Public Health
              </span>
              <p className="text-slate-600 text-2xs mt-0.5">
                "Ultra-processed food consumption and risk of type 2 diabetes and cardiovascular disease: systematic review and meta-analysis." Informing our NOVA food processing penalties.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 flex items-start gap-3">
            <FileText size={18} className="text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block font-heading">
                Food Safety and Standards Authority of India (FSSAI)
              </span>
              <p className="text-slate-600 text-2xs mt-0.5">
                "Food Safety and Standards (Labelling and Display) Regulations, 2020." Mandatory declarations for trans fats, added sugars, saturated fats, sodium, and INS food additive classes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20 text-center">
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-900 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">
              Evidence-Based Nutrition In the Palm of Your Hand
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Test your meals or audit your pantry using our open clinical intelligence platform.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={onOpenAuthModal || (() => onNavigate("dashboard"))}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-500 transition-colors shadow-xs cursor-pointer"
              >
                <span>Sign Up &amp; Launch Platform</span>
                <ArrowRight size={16} weight="bold" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate("standards")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              >
                <span>Read Food Standards Guide</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ScienceMethodologyPage;
