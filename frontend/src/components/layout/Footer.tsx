import React from "react";
import { ShieldCheck, Scales, FileText, PhoneCall, Globe } from "@phosphor-icons/react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 mt-auto text-xs py-10 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Main Two-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-8 border-b border-slate-900">
          
          {/* Column 1: Statutory Framework & Legal Metrology Seal */}
          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck size={22} weight="bold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-white text-base tracking-tight">
                    PackDrashiti
                  </span>
                  <span className="text-2xs uppercase font-mono font-semibold tracking-wider px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    Govt. of India
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  Legal Metrology Regulatory Compliance and Automated Packaging Verification Engine
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Statutory verification compliant with the <strong className="text-white">Legal Metrology Act, 2009</strong> and the <strong className="text-white">Legal Metrology (Packaged Commodities) Rules, 2011 (LMPC)</strong> as amended. Enforces declaration standards, font proportions, net quantity thresholds, and dual-language labelling across retail packaging in India.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-2xs font-medium">
                <FileText size={13} className="text-slate-400" />
                Rule 6 Mandatory Declarations
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-2xs font-medium">
                <Scales size={13} className="text-slate-400" />
                Rule 7 Table-I Standards
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-2xs font-medium">
                <ShieldCheck size={13} className="text-slate-400" />
                ICMR-NIN 2024 Thresholds
              </span>
            </div>
          </div>

          {/* Column 2: Administering Authority & SIH 2024 Compliance */}
          <div className="space-y-4 lg:pl-6 lg:border-l lg:border-slate-900">
            <div>
              <span className="text-2xs uppercase font-semibold tracking-wider text-slate-400 block mb-1">
                Administering Authority
              </span>
              <h4 className="text-sm font-bold text-white">
                Department of Consumer Affairs
              </h4>
              <p className="text-slate-400 text-xs mt-0.5">
                Ministry of Consumer Affairs, Food &amp; Public Distribution, Government of India
              </p>
              <p className="text-slate-500 text-2xs mt-1">
                Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001
              </p>
            </div>

            <div className="bg-slate-900/60 rounded-lg p-3.5 border border-slate-800/80 space-y-2">
              <span className="text-2xs uppercase font-semibold tracking-wider text-slate-300 block">
                Statutory Redressal &amp; Support Channels
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <PhoneCall size={14} className="text-slate-400 shrink-0" />
                  <span>National Consumer Helpline: <strong className="text-white">1915</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Globe size={14} className="text-slate-400 shrink-0" />
                  <span>e-Daakhil Consumer Grievance Portal</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-2xs text-slate-400 pt-1">
              <span>Smart India Hackathon (SIH 2024) Compliance Architecture</span>
              <span className="text-slate-300 font-semibold font-mono">SIH-2024-LMPC</span>
            </div>
          </div>

        </div>

        {/* Bottom Statutory Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-2xs text-slate-400">
          <p>
            Developed for regulatory inspection, evidence compounding, and consumer empowerment under Smart India Hackathon 2024.
          </p>
          <p className="text-slate-400 sm:text-right shrink-0">
            Legal Metrology Division • Department of Consumer Affairs • Govt. of India
          </p>
        </div>

      </div>
    </footer>
  );
};
