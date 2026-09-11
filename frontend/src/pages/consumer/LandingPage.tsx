import React from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { UserRole } from "../../types";

interface LandingPageProps {
  onNavigate: (page: string) => void;
  userRole: UserRole;
  onSetUserRole: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  userRole: _userRole,
  onSetUserRole,
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
          />
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-2xs font-mono font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            <span>Department of Consumer Affairs • Legal Metrology Division</span>
          </div>
        </div>

        {/* Primary Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 font-heading max-w-3xl leading-[1.12]">
          Statutory packaging compliance and nutritional verification.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
          National regulatory verification platform operating under the Legal Metrology (Packaged Commodities) Rules, 2011 and direct multimodal nutritional intelligence.
        </p>

        {/* Dual Operational Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          
          {/* Citizen Consumer Portal */}
          {/* Citizen Consumer Health & Nutrition Portal */}
          <div 
            onClick={() => {
              onSetUserRole("consumer");
              onNavigate("health");
            }}
            className="group relative p-8 rounded-xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase tracking-wider">
                  Citizen Portal
                </span>
                <span className="text-xs font-mono text-slate-400">01</span>
              </div>
              <h2 className="text-xl font-bold text-slate-950 font-heading mb-2">Consumer Health &amp; Nutrition</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Scan packaged food commodities to audit ICMR-NIN 2024 nutritional benchmarks, identify hidden sugars, sodium density, palm oil, and age-specific health advisories.
              </p>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-slate-900 group-hover:translate-x-1 transition-transform duration-200">
              <span>Check food health &amp; nutrition</span>
              <ArrowRight size={14} weight="bold" />
            </div>
          </div>

          {/* Officer Enforcement Workstation */}
          <div 
            onClick={() => {
              onSetUserRole("officer");
              onNavigate("dashboard");
            }}
            className="group relative p-8 rounded-xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 text-white uppercase tracking-wider">
                  Enforcement Desk
                </span>
                <span className="text-xs font-mono text-slate-400">02</span>
              </div>
              <h2 className="text-xl font-bold text-slate-950 font-heading mb-2">Legal Metrology Officer</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Field workstation for Rule 7 Table-I font calibration, statutory show-cause notices (FORM LM-INSP-2011), and Section 48 compounding fee adjudication.
              </p>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-slate-900 group-hover:translate-x-1 transition-transform duration-200">
              <span>Access officer command desk</span>
              <ArrowRight size={14} weight="bold" />
            </div>
          </div>

        </div>

      </section>

      {/* Statutory Baseline Strip (2011 Rules & Schedules) */}
      <section className="border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold font-heading text-slate-950">11</div>
              <div className="text-xs text-slate-500 mt-1">Rule 6 mandatory declarations</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-heading text-slate-950">Table-I</div>
              <div className="text-xs text-slate-500 mt-1">Rule 7 font height standard</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-heading text-slate-950">1.0% - 9%</div>
              <div className="text-xs text-slate-500 mt-1">First Schedule MPE tolerances</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-heading text-slate-950">ICMR 2024</div>
              <div className="text-xs text-slate-500 mt-1">Nutritional threshold guidelines</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Tier Pipeline Architecture */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Pipeline Architecture</div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 font-heading mb-12">
          Multimodal vision, deterministic rule math, and statutory RAG.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Tier 01 / Perception</div>
            <h3 className="text-base font-bold text-slate-950 font-heading">Direct Multimodal Vision (VLM)</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Eliminates brittle manual OCR workflows. Direct multimodal image perception extracts spatial text coordinates, principal display panel dimensions, and complete packaging typography.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => {
                  onSetUserRole("officer");
                  onNavigate("scanner");
                }} 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-600"
              >
                Launch officer compliance scanner <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Tier 02 / Determinism</div>
            <h3 className="text-base font-bold text-slate-950 font-heading">Python Rule Engine</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              100% mathematically auditable logic. Verifies Unit Sale Price arithmetic under Rule 6(1)(e), validates Rule 7 Table-I numeral step functions, and checks SI metric unit symbols under Rule 13.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => {
                  onSetUserRole("officer");
                  onNavigate("dashboard");
                }} 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-600"
              >
                Open compounding engine <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Tier 03 / Statutory RAG</div>
            <h3 className="text-base font-bold text-slate-950 font-heading">Statutory Vector Index</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Indexed across all 34 rules, 7 schedules, and recent amendments of the 2011 Regulations. Automatically retrieves exact statutory sections and generates court-admissible FORM LM-INSP-2011 notices.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => {
                  onSetUserRole("officer");
                  onNavigate("reports");
                }} 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-600"
              >
                View statutory dockets <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Tier 04 / Consumer Health</div>
            <h3 className="text-base font-bold text-slate-950 font-heading">Nutrition &amp; Dietary Agent</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Evaluates ingredient lists and nutrition facts against ICMR-NIN 2024 thresholds. Detects industrial palm olein, excessive sodium, ultra-processed formulation (UPF / NOVA 4), and age suitability.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => onNavigate("health")} 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-600"
              >
                Run health check <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Statutory Rules & Schedules Matrix (Complete 2011 Dataset Breakdown) */}
      <section className="border-t border-slate-100 bg-slate-50/40 py-20">
        <div className="max-w-5xl mx-auto px-6">
          
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-10 gap-2">
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Statutory Matrix</div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-950 font-heading mt-1">
                The Legal Metrology (Packaged Commodities) Rules, 2011
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">G.S.R. 202(E) • 54 Regulatory Clauses</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-950">Rule 6(1) &amp; Rule 10</span>
                  <span className="text-2xs font-mono text-slate-500">Mandatory Declarations</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Requires 11 statutory declarations on PDP: Manufacturer/packer identity with factory address and PIN, generic commodity name, net quantity, manufacturing month/year, MRP, and consumer grievance contact.
                </p>
              </div>

              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-950">Rule 6(1)(e) Proviso</span>
                  <span className="text-2xs font-mono text-slate-500">Unit Sale Price (USP)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mandates Unit Sale Price declaration per gram, millilitre, kilogram, or litre alongside total MRP. Prohibits obscure or missing unit pricing on retail packaging.
                </p>
              </div>

              <div className="p-6 space-y-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-950">Rule 7 &amp; Table-I</span>
                  <span className="text-2xs font-mono text-slate-500">Numeral Cap-Heights</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Prescribes minimum numeral heights for net quantity: &le; 200g/ml requires 2.0mm; 200g&ndash;500g/ml requires 4.0mm; &gt; 500g/ml requires 6.0mm. Letters must be &ge; 1.0mm normal or &ge; 2.0mm molded.
                </p>
              </div>

              <div className="p-6 space-y-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-950">Rule 8 &amp; Rule 9</span>
                  <span className="text-2xs font-mono text-slate-500">Quiet Zone &amp; Contrast</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enforces quiet margins around net quantity (&ge; 1x numeral height above/below, &ge; 2x left/right). Mandates high conspicuous color contrast for price and quantity declarations.
                </p>
              </div>

              <div className="p-6 space-y-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-950">Rule 13 &amp; Rule 18(2A)</span>
                  <span className="text-2xs font-mono text-slate-500">SI Units &amp; Dual MRP</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enforces standard SI metric unit symbols (kg, g, mg, l, ml, m, cm, mm) and strictly prohibits non-metric abbreviations (gm, gms, ltr, cc). Strictly prohibits Dual MRP on identical goods.
                </p>
              </div>

              <div className="p-6 space-y-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-950">Schedules I, II &amp; VII</span>
                  <span className="text-2xs font-mono text-slate-500">MPE &amp; FORM LM-INSP-2011</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Defines Maximum Permissible Error (1.0% to 9.0%), Second Schedule standard pack sizes across 19 commodity classes, and Seventh Schedule statutory inspection datasheets for legal evidence.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
