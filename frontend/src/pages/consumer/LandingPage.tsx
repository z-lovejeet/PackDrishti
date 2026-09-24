import React from "react";
import { ArrowRight, Heartbeat, Scan } from "@phosphor-icons/react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
  userRole?: string;
  onSetUserRole?: (role: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
}) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-slate-100 selection:text-slate-900">
      
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
        
        {/* Government Authority Masthead Tag with Official Emblem */}
        <div className="flex items-center gap-3.5 mb-8">
          <img
            src="/logo.png"
            alt="PackDrashiti Official Logo"
            className="w-11 h-11 rounded-xl object-contain shadow-xs border border-slate-200 shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-2xs font-mono font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            <span>Public Consumer Verification Platform • Department of Consumer Affairs</span>
          </div>
        </div>

        {/* Primary Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 font-heading max-w-3xl leading-[1.12]">
          Verify packaged goods for fair price, compliance &amp; nutrition.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
          PackDrashiti puts the power of India's Legal Metrology (Packaged Commodities) Rules, 2011 and ICMR-NIN 2024 nutritional benchmarks directly into consumers' hands. Scan any retail packaging in seconds.
        </p>

        {/* Dual Consumer Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          
          {/* Consumer Portal 1: Label Compliance Scanner */}
          <div 
            onClick={() => onNavigate("scanner")}
            className="group relative p-8 rounded-xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50/40 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Scan size={14} weight="bold" />
                  Package Scanner
                </span>
                <span className="text-xs font-mono text-slate-400">01</span>
              </div>
              <h2 className="text-xl font-bold text-slate-950 font-heading mb-2">Label Compliance &amp; Price Check</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Scan front and back packaging labels to verify Maximum Retail Price (MRP), calculate fair Unit Sale Price (USP), check net quantity units, and detect missing manufacturer declarations.
              </p>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-slate-900 group-hover:translate-x-1 transition-transform duration-200">
              <span>Scan packaging label</span>
              <ArrowRight size={14} weight="bold" />
            </div>
          </div>

          {/* Consumer Portal 2: Health & Nutrition Audit */}
          <div 
            onClick={() => onNavigate("health")}
            className="group relative p-8 rounded-xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50/40 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Heartbeat size={14} weight="bold" />
                  Health &amp; Nutrition
                </span>
                <span className="text-xs font-mono text-slate-400">02</span>
              </div>
              <h2 className="text-xl font-bold text-slate-950 font-heading mb-2">Nutrition &amp; Ingredient Audit</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Photograph food nutrition panels to evaluate against ICMR-NIN 2024 safe limits. Identify hidden sugars, excessive sodium, industrial palm oil, harmful azo dyes, and get a clear health score.
              </p>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-slate-900 group-hover:translate-x-1 transition-transform duration-200">
              <span>Check nutrition &amp; food health</span>
              <ArrowRight size={14} weight="bold" />
            </div>
          </div>

        </div>

      </section>

      {/* Consumer Statutory Baseline Strip */}
      <section className="border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold font-heading text-slate-950">11+</div>
              <div className="text-xs text-slate-500 mt-1">Mandatory Label Declarations</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-heading text-slate-950">Per g/ml</div>
              <div className="text-xs text-slate-500 mt-1">Unit Sale Price Transparency</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-heading text-slate-950">&lt; 8 sec</div>
              <div className="text-xs text-slate-500 mt-1">Instant Label Verification</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-heading text-slate-950">ICMR 2024</div>
              <div className="text-xs text-slate-500 mt-1">National Health Benchmarks</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Tier Pipeline Architecture */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Consumer Intelligence Pipeline</div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 font-heading mb-12">
          Multimodal vision, deterministic rule math, and nutrition intelligence.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Tier 01 / Perception</div>
            <h3 className="text-base font-bold text-slate-950 font-heading">Direct Multimodal Vision (VLM)</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Snap high-resolution photos of product packaging from your mobile camera or desktop. Multimodal vision perceives label text, expiry dates, batch details, and mandatory legal declarations.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => onNavigate("scanner")} 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-600 cursor-pointer"
              >
                Launch package scanner <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Tier 02 / Determinism</div>
            <h3 className="text-base font-bold text-slate-950 font-heading">Python Rule Engine</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              100% mathematically auditable logic. Verifies Unit Sale Price arithmetic under Rule 6(1)(e), validates net quantity metric units under Rule 13, and ensures no dual-pricing manipulations.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => onNavigate("scanner")} 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-600 cursor-pointer"
              >
                Verify pricing &amp; units <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Tier 03 / Statutory Knowledge</div>
            <h3 className="text-base font-bold text-slate-950 font-heading">Legal Metrology Knowledge Base</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Indexed across the complete 2011 Regulations and statutory amendments. Explains your rights as a consumer regarding mandatory declarations, dual MRP bans, and consumer care coordinates.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => onNavigate("history")} 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-600 cursor-pointer"
              >
                View scan history <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Tier 04 / Consumer Health</div>
            <h3 className="text-base font-bold text-slate-950 font-heading">Nutrition &amp; Dietary Health Engine</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Evaluates ingredient lists and nutrition facts against ICMR-NIN 2024 thresholds. Detects industrial palm olein, excessive sodium, ultra-processed formulation (UPF / NOVA 4), and age suitability.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => onNavigate("health")} 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-600 cursor-pointer"
              >
                Run nutrition health check <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Consumer Rights & Packaging Standards Matrix */}
      <section className="border-t border-slate-100 bg-slate-50/40 py-20">
        <div className="max-w-5xl mx-auto px-6">
          
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-10 gap-2">
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Consumer Knowledge</div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-950 font-heading mt-1">
                Essential Packaging Rules Every Consumer Should Know
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Legal Metrology (Packaged Commodities) Rules, 2011</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-950">Rule 6(1) &amp; Rule 10</span>
                  <span className="text-2xs font-mono text-slate-500">Mandatory Declarations</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every package must clearly declare manufacturer/packer identity with postal PIN, generic commodity name, net quantity, manufacturing date, Maximum Retail Price (MRP), and consumer care grievance coordinates.
                </p>
              </div>

              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-950">Rule 6(1)(e) Proviso</span>
                  <span className="text-2xs font-mono text-slate-500">Unit Sale Price (USP)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mandatory declaration of Unit Sale Price per gram, millilitre, kilogram, or litre alongside total MRP. This allows consumers to compare actual prices across different pack sizes.
                </p>
              </div>

              <div className="p-6 space-y-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-950">Rule 13 &amp; Metric Standards</span>
                  <span className="text-2xs font-mono text-slate-500">Legal SI Units</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Standard SI metric units (g, kg, ml, l) must be used. Misleading or prohibited abbreviations such as &quot;gms&quot;, &quot;kgs&quot;, &quot;ltr&quot; are legally non-compliant.
                </p>
              </div>

              <div className="p-6 space-y-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-950">Rule 18(2A)</span>
                  <span className="text-2xs font-mono text-slate-500">Dual MRP Prohibition</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Strictly prohibits charging higher prices or printing dual MRP stickers for identical pre-packaged goods across different retail establishments or locations.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
