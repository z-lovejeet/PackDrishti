import React from "react";
import { 
  ArrowRight,
  ShieldCheck, 
  Scan, 
  Heartbeat, 
  IdentificationCard,
  User,
  FileText,
  Scales
} from "@phosphor-icons/react";
import { UserRole } from "../../types";

interface LandingPageProps {
  onNavigate: (page: string) => void;
  userRole: UserRole;
  onSetUserRole: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  userRole,
  onSetUserRole,
}) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-slate-100 selection:text-slate-900">
      
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
        
        {/* Subtle Government Authority Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 text-slate-600 text-2xs font-medium tracking-wide mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          <span>Department of Consumer Affairs, Government of India</span>
        </div>

        {/* Primary Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 font-heading max-w-3xl leading-[1.12]">
          Statutory packaging and health verification.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
          National compliance verification under the Legal Metrology (Packaged Commodities) Rules, 2011 and direct multimodal nutritional label analysis.
        </p>

        {/* Dual Operational Roles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          
          {/* Consumer Action */}
          <div 
            onClick={() => {
              onSetUserRole("consumer");
              onNavigate("scanner");
            }}
            className="group relative p-8 rounded-xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-200">
                  <User size={20} weight="bold" />
                </div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Citizen Portal</span>
              </div>
              <h2 className="text-xl font-bold text-slate-950 font-heading mb-2">Consumer Verification</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Scan packaged food products to verify Maximum Retail Price (MRP), Unit Sale Price, hidden palm oil, excessive sugar, and age-specific health risks.
              </p>
            </div>
            
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-slate-900 group-hover:translate-x-1 transition-transform duration-200">
              <span>Start product scan</span>
              <ArrowRight size={14} weight="bold" />
            </div>
          </div>

          {/* Officer Action */}
          <div 
            onClick={() => {
              onSetUserRole("officer");
              onNavigate("dashboard");
            }}
            className="group relative p-8 rounded-xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50/40 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-200">
                  <IdentificationCard size={20} weight="bold" />
                </div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Enforcement</span>
              </div>
              <h2 className="text-xl font-bold text-slate-950 font-heading mb-2">Legal Metrology Officer</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Field inspection station for Rule 7 Table-I font calibration, statutory show-cause notices (FORM LM-INSP-2011), and Section 48 compounding orders.
              </p>
            </div>
            
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-slate-900 group-hover:translate-x-1 transition-transform duration-200">
              <span>Access officer command desk</span>
              <ArrowRight size={14} weight="bold" />
            </div>
          </div>

        </div>

      </section>

      {/* Minimal Stat Line */}
      <section className="border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold font-heading text-slate-950">11</div>
              <div className="text-xs text-slate-500 mt-1">Mandatory Rule 6 declarations</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-heading text-slate-950">Table-I</div>
              <div className="text-xs text-slate-500 mt-1">Rule 7 font height standard</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-heading text-slate-950">Sec 36(1)</div>
              <div className="text-xs text-slate-500 mt-1">Statutory compounding schedule</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-heading text-slate-950">2026</div>
              <div className="text-xs text-slate-500 mt-1">Gazette standards reference</div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Capabilities */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">Core Systems</div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 font-heading mb-12">
          Purpose-built for statutory rigor and consumer clarity.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          <div className="space-y-3">
            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-800">
              <Scan size={18} weight="bold" />
            </div>
            <h3 className="text-base font-bold text-slate-950 font-heading">Direct Vision Perception</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Multimodal neural models inspect physical packaging images directly, extracting net quantity, MRP numerals, and principal display panel dimensions.
            </p>
            <button 
              onClick={() => onNavigate("scanner")} 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-600 pt-1"
            >
              Open label scanner <ArrowRight size={12} weight="bold" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-800">
              <Heartbeat size={18} weight="bold" />
            </div>
            <h3 className="text-base font-bold text-slate-950 font-heading">Nutritional Health Agent</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Examines ingredients and nutrition facts to identify hidden palm oil, excess sodium, and specific age-group dietary contraindications.
            </p>
            <button 
              onClick={() => onNavigate("health")} 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-600 pt-1"
            >
              Run health check <ArrowRight size={12} weight="bold" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-800">
              <Scales size={18} weight="bold" />
            </div>
            <h3 className="text-base font-bold text-slate-950 font-heading">Statutory RAG Index</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Grounded in the Gazette of India Extraordinary standards, providing court-admissible legal sections and compounding fee calculations.
            </p>
            <button 
              onClick={() => {
                onSetUserRole("officer");
                onNavigate("inspections");
              }} 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-600 pt-1"
            >
              View inspection ledger <ArrowRight size={12} weight="bold" />
            </button>
          </div>

        </div>
      </section>

      {/* Statutory Rules Matrix (Clean, Minimal Table) */}
      <section className="border-t border-slate-100 bg-slate-50/30 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 gap-2">
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Statutory Matrix</div>
              <h3 className="text-xl font-bold text-slate-950 font-heading mt-1">Legal Metrology Framework</h3>
            </div>
            <span className="text-xs text-slate-500">Gazette Standards 2026</span>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-900">Rule 3 &amp; Rule 13</span>
                  <span className="text-2xs text-slate-500">Metric System</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Strict enforcement of International System of Units (SI). Non-standard units (gm, ltr, cc, oz) prohibited.
                </p>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-900">Rule 6(1)(e)</span>
                  <span className="text-2xs text-slate-500">Unit Sale Price</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mandatory declaration of Unit Sale Price (USP) per gram, millilitre, kilogram, or litre alongside total MRP.
                </p>
              </div>

              <div className="p-5 space-y-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-900">Rule 7 &amp; Table-I</span>
                  <span className="text-2xs text-slate-500">Font Height</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Principal Display Panel area determines required numeral and letter cap-heights (1.0 mm to 6.0 mm).
                </p>
              </div>

              <div className="p-5 space-y-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-900">Section 36(1) &amp; 48</span>
                  <span className="text-2xs text-slate-500">Enforcement</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Compounding schedules for first and second offences with 20% prompt settlement reduction under Jan Vishwas Act.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
