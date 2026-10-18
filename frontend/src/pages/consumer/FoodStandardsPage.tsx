import React from "react";
import {
  ShieldCheck,
  WarningCircle,
  CheckCircle,
  Eye,
  MagnifyingGlass,
  ArrowRight,
  Barcode,
  Scales,
  ListNumbers,
  Sparkle,
  Plant,
} from "@phosphor-icons/react";

interface FoodStandardsPageProps {
  onNavigate: (page: string) => void;
  onOpenAuthModal?: () => void;
}

export const FoodStandardsPage: React.FC<FoodStandardsPageProps> = ({
  onNavigate,
  onOpenAuthModal,
}) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-slate-100 selection:text-slate-900">
      
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-14 sm:pt-24 sm:pb-18 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-xs">
            <ShieldCheck size={20} weight="fill" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 text-slate-600 text-2xs font-mono font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>Consumer Protection Guide • Label Decoders</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950 font-heading max-w-3xl leading-[1.15]">
          The Everyday Consumer's Guide to Packaged Food Standards.
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
          Supermarket aisles are filled with misleading marketing slogans. Learn how to decode nutrition labels, detect hidden chemical additives, and spot the red flags food corporations don't want you to notice.
        </p>

        {/* Quick Summary Pill Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-2xs font-mono text-amber-700 font-semibold block uppercase">Rule 01</span>
            <div className="text-sm font-bold text-slate-900 font-heading mt-1">Ingredients Decreasing Order</div>
            <p className="text-2xs text-slate-600 mt-1">The first 3 ingredients make up 60–80% of what is actually in the box.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-2xs font-mono text-amber-700 font-semibold block uppercase">Rule 02</span>
            <div className="text-sm font-bold text-slate-900 font-heading mt-1">Watch Serving Size Tricks</div>
            <p className="text-2xs text-slate-600 mt-1">Brands declare nutrition per 15g or 30g to disguise massive total sugar counts.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-2xs font-mono text-amber-700 font-semibold block uppercase">Rule 03</span>
            <div className="text-sm font-bold text-slate-900 font-heading mt-1">Decode The INS Numbers</div>
            <p className="text-2xs text-slate-600 mt-1">INS/E-numbers are international chemical codes for artificial dyes, gums, and preservatives.</p>
          </div>
        </div>
      </section>

      {/* Anatomy of a Label */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-2xl mb-10">
          <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            Visual Guide
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-heading mt-4">
            Anatomy of a Packaged Food Label
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Every food package has three distinct sections. Marketing lives on the front; the truth lives on the back.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-mono font-bold text-xs">
              01
            </div>
            <h3 className="text-base font-bold text-slate-950 font-heading">
              The Front Panel (Unregulated Claims)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Words like "Natural", "High Protein", "Wholesome Grains", and "Doctor Recommended" are marketing phrases designed to trigger health optimism. Always flip the box over before placing it in your basket.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-mono font-bold text-xs">
              02
            </div>
            <h3 className="text-base font-bold text-slate-950 font-heading">
              Nutrition Information Table
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Required by FSSAI. Always look at the <strong>Per 100g / 100mL</strong> column rather than per-serve. This lets you compare products side-by-side without being fooled by tiny manufacturer portion sizes.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-mono font-bold text-xs">
              03
            </div>
            <h3 className="text-base font-bold text-slate-950 font-heading">
              The Mandatory Ingredient List
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ingredients are legally mandated to appear in descending order of weight. If sugar, palm olein, or refined wheat flour (maida) are in the top 3 items, the product is primarily an ultra-processed carrier.
            </p>
          </div>
        </div>
      </section>

      {/* The 5 Big Red Flags */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-2xl mb-10">
          <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
            Deceptive Marketing Exposed
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-heading mt-4">
            The 5 Most Common Supermarket Traps
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Here are the five most frequent loopholes used by commercial food brands to appear nutritious while delivering high metabolic stress.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md text-2xs font-mono font-bold bg-rose-100 text-rose-800">
                TRAP 01
              </span>
              <h3 className="text-base font-bold text-slate-950 font-heading">
                The "No Added Sugar" Mirage (Hidden Glucose Spikes)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Brands replace standard table sugar (sucrose) with <strong>Maltodextrin</strong>, <strong>Liquid Glucose</strong>, <strong>Concentrated Apple/Grape Juice Puree</strong>, or <strong>Invert Syrup</strong>. Maltodextrin has a Glycemic Index of 110–135—higher than pure glucose—spiking blood sugar faster than standard sugar while technically escaping the "added cane sugar" claim.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md text-2xs font-mono font-bold bg-rose-100 text-rose-800">
                TRAP 02
              </span>
              <h3 className="text-base font-bold text-slate-950 font-heading">
                Stealth Industrial Palm Oil &amp; Interesterified Fats
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Manufacturers mask low-cost palm oil behind deceptive terminology: <em>"Edible Vegetable Oil (Palmolein)"</em>, <em>"Fractionated Vegetable Fat"</em>, or <em>"Interesterified Fat"</em>. These oils are high in saturated palmitic acid, heavily oxidised during high-heat industrial frying, and contribute to non-alcoholic fatty liver disease (NAFLD).
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md text-2xs font-mono font-bold bg-rose-100 text-rose-800">
                TRAP 03
              </span>
              <h3 className="text-base font-bold text-slate-950 font-heading">
                The "Multigrain" or "100% Wheat" Illusion
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              "Atta Cookies" or "Multigrain Bread" often list <strong>Refined Wheat Flour (Maida)</strong> as 70–85% of their total flour composition, adding only 2–5% whole wheat or millet flakes to satisfy legal labeling minimums. BiteIQ highlights the true whole-grain to refined-starch ratio.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md text-2xs font-mono font-bold bg-rose-100 text-rose-800">
                TRAP 04
              </span>
              <h3 className="text-base font-bold text-slate-950 font-heading">
                Synthetic Food Colorings (The Southampton Six)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Petroleum-derived synthetic azo-dyes such as <strong>Tartrazine (INS 102)</strong>, <strong>Sunset Yellow (INS 110)</strong>, and <strong>Allura Red (INS 129)</strong> are banned or require statutory child hyperactivity warnings in the European Union, yet remain widely prevalent in Indian candy, sodas, and savory snacks.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md text-2xs font-mono font-bold bg-rose-100 text-rose-800">
                TRAP 05
              </span>
              <h3 className="text-base font-bold text-slate-950 font-heading">
                Chemical Preservatives &amp; Antioxidants
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Industrial antioxidants like <strong>TBHQ (INS 319)</strong> and <strong>BHA (INS 320)</strong> are added to oily snacks to prevent rancidity during prolonged 9-month shelf life. In clinical animal models, high-dose exposure has shown cellular oxidative stress and immune modulation.
            </p>
          </div>
        </div>
      </section>

      {/* FSSAI Regulations & Consumer Rights */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-2xl mb-10">
          <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Consumer Rights
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-heading mt-4">
            Indian Food Safety Standards (FSSAI) &amp; Your Rights
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            The Food Safety and Standards Authority of India (FSSAI) has instituted vital mandatory regulations that protect consumers. Here is what is legally required:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} weight="fill" className="text-emerald-600 shrink-0" />
              <span className="font-bold text-slate-900 font-heading">2% Trans Fat Ceiling</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Under FSSAI regulations effective Jan 1, 2022, industrial trans fatty acids in all fats, oils, and packaged foods must not exceed 2% of total fat content.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} weight="fill" className="text-emerald-600 shrink-0" />
              <span className="font-bold text-slate-900 font-heading">Mandatory Allergen Labeling</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Packaged goods must clearly state allergens including Cereals containing gluten, Crustaceans, Eggs, Fish, Peanuts, Soybeans, Milk, and Tree nuts.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} weight="fill" className="text-emerald-600 shrink-0" />
              <span className="font-bold text-slate-900 font-heading">Veg / Non-Veg Visual Dots</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Green dot inside a square for vegetarian food; brown dot inside a square for non-vegetarian foods, visible on the principal display panel.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} weight="fill" className="text-emerald-600 shrink-0" />
              <span className="font-bold text-slate-900 font-heading">Consumer Complaint Portal</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Citizens can file statutory complaints against deceptive packaging, mislabeling, or contamination through the FSSAI FoSCoS portal or National Consumer Helpline 1915.
            </p>
          </div>
        </div>
      </section>

      {/* The 5 Golden Rules Checklist */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20 border-b border-slate-100">
        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-6">
          <div className="max-w-xl">
            <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-slate-600">
              Shopping Quick-Card
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-950 mt-1">
              The 5 Golden Rules for Your Next Grocery Run
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
              <span className="font-mono font-bold text-slate-900 text-sm">01</span>
              <div>
                <strong className="text-slate-900 block">Read the first 3 ingredients:</strong>
                If sugar, oil, or maida lead, treat the item as an occasional confectionery, not a staple.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
              <span className="font-mono font-bold text-slate-900 text-sm">02</span>
              <div>
                <strong className="text-slate-900 block">Look for "Added Sugars" &lt; 5g/100g:</strong>
                Keep added free sugars under 25g/day total across all meals per WHO limits.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
              <span className="font-mono font-bold text-slate-900 text-sm">03</span>
              <div>
                <strong className="text-slate-900 block">Check sodium-to-calorie ratio:</strong>
                Aim for less than 1mg sodium per kcal (e.g. &lt;200mg sodium in a 200kcal snack).
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
              <span className="font-mono font-bold text-slate-900 text-sm">04</span>
              <div>
                <strong className="text-slate-900 block">Avoid long lists of INS numbers:</strong>
                More than 4–5 unpronounceable chemical codes indicates heavy ultra-processing.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20 text-center">
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-900 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">
              Instant Packaged Food Audits in 2 Seconds
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Don't spend minutes deciphering fine print in grocery aisles. Scan any product with BiteIQ to audit nutrition tables and ingredient lists automatically.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={onOpenAuthModal || (() => onNavigate("dashboard"))}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-500 transition-colors shadow-xs cursor-pointer"
              >
                <span>Sign Up &amp; Start Auditing</span>
                <ArrowRight size={16} weight="bold" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate("about")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              >
                <span>Read About Our Mission</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default FoodStandardsPage;
