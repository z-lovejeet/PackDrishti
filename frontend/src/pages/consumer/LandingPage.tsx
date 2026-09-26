import React from "react";
import { ArrowRight, Heartbeat, Archive, ShieldCheck, Plant, Sparkle } from "@phosphor-icons/react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
}) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-slate-100 selection:text-slate-900">
      
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
        
        {/* Consumer Health Masthead Tag */}
        <div className="flex items-center gap-3.5 mb-8">
          <img
            src="/logo.png"
            alt="PackDrashiti Logo"
            className="w-11 h-11 rounded-xl object-contain shadow-xs border border-slate-200 shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-2xs font-mono font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Daily Consumer Food, Ingredient &amp; Nutrition Intelligence</span>
          </div>
        </div>

        {/* Primary Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 font-heading max-w-3xl leading-[1.12]">
          Know what’s really inside your everyday packaged food.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
          PackDrashiti helps you make smarter grocery choices in seconds. Snap the front and back of any food packet to uncover hidden sugars, industrial palm oil, synthetic dyes, expiry hazards, and get healthier whole-food alternatives.
        </p>

        {/* Consumer Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          
          {/* Portal 1: Nutrition & Ingredient Scanner */}
          <div 
            onClick={() => onNavigate("health")}
            className="group relative p-8 rounded-xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50/40 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Heartbeat size={14} weight="bold" />
                  Food &amp; Nutrition Scanner
                </span>
                <span className="text-xs font-mono text-slate-400">01</span>
              </div>
              <h2 className="text-xl font-bold text-slate-950 font-heading mb-2">Scan Food &amp; Ingredients</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Photograph front and back packaging panels to evaluate nutrients against ICMR-NIN 2024 safe limits, flag palm oil and synthetic colors, check shelf-life expiry, and calculate real price per 100g.
              </p>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-slate-900 group-hover:translate-x-1 transition-transform duration-200">
              <span>Launch nutrition scanner</span>
              <ArrowRight size={14} weight="bold" />
            </div>
          </div>

          {/* Portal 2: Consumer Scan History */}
          <div 
            onClick={() => onNavigate("history")}
            className="group relative p-8 rounded-xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50/40 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Archive size={14} weight="bold" />
                  Personal Food Log
                </span>
                <span className="text-xs font-mono text-slate-400">02</span>
              </div>
              <h2 className="text-xl font-bold text-slate-950 font-heading mb-2">Past Scans &amp; Comparisons</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Review your previously scanned snacks, beverages, and groceries. Compare 0–100 health scores, track flagged additives, and revisit recommended whole-food swaps anytime.
              </p>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-slate-900 group-hover:translate-x-1 transition-transform duration-200">
              <span>View scan history</span>
              <ArrowRight size={14} weight="bold" />
            </div>
          </div>

        </div>

      </section>

      {/* Consumer Health Highlights Strip */}
      <section className="border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold font-heading text-slate-950">0–100</div>
              <div className="text-xs text-slate-500 mt-1">Nutrition Health Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-heading text-slate-950">ICMR 2024</div>
              <div className="text-xs text-slate-500 mt-1">Daily Dietary Benchmarks</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-heading text-slate-950">Per 100g</div>
              <div className="text-xs text-slate-500 mt-1">Nutrient &amp; Price Normalization</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-heading text-slate-950">&lt; 8 sec</div>
              <div className="text-xs text-slate-500 mt-1">Instant Label Decoding</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Pillar Consumer Nutrition Architecture */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">How PackDrashiti Works</div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 font-heading mb-12">
          From tiny back-of-pack print to clear daily health answers.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Step 01 / Visual Reading</div>
            <h3 className="text-base font-bold text-slate-950 font-heading">Direct Multimodal Label Perception</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Snap photos of any food packet using your phone camera or upload images from your gallery. Multimodal AI reads the brand, nutrition table, fine-print ingredients, expiry date, and price directly.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => onNavigate("health")} 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-600 cursor-pointer"
              >
                Scan a food packet <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Step 02 / Nutrient Normalization</div>
            <h3 className="text-base font-bold text-slate-950 font-heading">Per-100g &amp; Per-Serving Math</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Brands often hide high sugar or fat behind tiny 15g or 20g serving sizes. PackDrashiti automatically normalizes every nutrient to a strict 100g/100ml baseline so you see the true concentration.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => onNavigate("health")} 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-600 cursor-pointer"
              >
                Check nutrient levels <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Step 03 / Ingredient &amp; Dye Audit</div>
            <h3 className="text-base font-bold text-slate-950 font-heading">Palm Oil, Hidden Sugar &amp; Additive Detection</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Spots disguised sugars (maltodextrin, liquid glucose), industrial palmolein, MSG/flavour enhancers (INS 621/627/631), and synthetic azo food dyes (Tartrazine, Sunset Yellow, Allura Red).
            </p>
            <div className="pt-2">
              <button 
                onClick={() => onNavigate("health")} 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-600 cursor-pointer"
              >
                Audit ingredients <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Step 04 / Personalized Guidance</div>
            <h3 className="text-base font-bold text-slate-950 font-heading">Age Suitability &amp; Healthier Swaps</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Highlights who should avoid a product (toddlers, diabetics, hypertensive individuals) and recommends practical, culturally familiar Indian whole-food alternatives.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => onNavigate("history")} 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-600 cursor-pointer"
              >
                Browse past scans <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Everyday Label Guide Matrix */}
      <section className="border-t border-slate-100 bg-slate-50/40 py-20">
        <div className="max-w-5xl mx-auto px-6">
          
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-10 gap-2">
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Daily Shopping Guide</div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-950 font-heading mt-1">
                4 Things to Check on Every Food Packet
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">ICMR-NIN 2024 &amp; WHO Guidelines</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-950 flex items-center gap-1.5">
                    <Heartbeat size={14} className="text-rose-600" />
                    Added Sugars &amp; Sweeteners
                  </span>
                  <span className="text-2xs font-mono text-slate-500">Max 25g / day</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Products with more than 10g of added sugar per 100g (or 5g per 100ml for drinks) can spike blood glucose rapidly. Watch out for sucrose, liquid glucose, invert syrup, and maltodextrin.
                </p>
              </div>

              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-950 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-amber-600" />
                    Edible Vegetable Oil (Palmolein)
                  </span>
                  <span className="text-2xs font-mono text-slate-500">Saturated Fat Alert</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Many chips, biscuits, and instant noodles list &quot;Edible Vegetable Oil (Palmolein)&quot; as a primary ingredient—a cheap, highly saturated fat linked to elevated LDL cholesterol.
                </p>
              </div>

              <div className="p-6 space-y-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-950 flex items-center gap-1.5">
                    <Sparkle size={14} className="text-indigo-600" />
                    Sodium &amp; Synthetic Azo Dyes
                  </span>
                  <span className="text-2xs font-mono text-slate-500">Max 2000mg Sodium</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Savoury snacks often exceed 600mg sodium per 100g and use synthetic colors (INS 102, 110, 129) that can trigger hyperactivity in young children and raise blood pressure.
                </p>
              </div>

              <div className="p-6 space-y-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-950 flex items-center gap-1.5">
                    <Plant size={14} className="text-emerald-600" />
                    Expiry &amp; Real Price per 100g
                  </span>
                  <span className="text-2xs font-mono text-slate-500">Freshness &amp; Value</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Always check the manufacturing and expiry dates before consuming, and compare the price per 100g across pack sizes to avoid paying extra for air-filled or shrinkflated packs.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
