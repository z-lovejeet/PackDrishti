import React from "react";
import { ShieldCheck } from "@phosphor-icons/react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto text-neutral-600 text-xs py-8 no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6px] bg-primary text-white flex items-center justify-center font-bold">
              <ShieldCheck size={20} weight="bold" />
            </div>
            <div>
              <span className="font-bold text-neutral-900 font-heading block">
                MetroScan — Legal Metrology Compliance System
              </span>
              <span className="text-[11px] text-neutral-500">
                Statutory framework: Legal Metrology Act, 2009 & Packaged Commodities Rules, 2011
              </span>
            </div>
          </div>

          <div className="text-[11px] text-neutral-500 sm:text-right">
            <span>Administering Body: </span>
            <strong className="text-neutral-700">Department of Consumer Affairs</strong>
            <span className="block">Ministry of Consumer Affairs, Food & Public Distribution, Govt. of India</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-400">
          <p>
            Developed for regulatory verification and consumer empowerment under Smart India Hackathon.
          </p>
          <div className="flex items-center gap-4 text-neutral-500">
            <span>Rule 6 Mandatory Declarations</span>
            <span>•</span>
            <span>Rule 7 Table-I Standards</span>
            <span>•</span>
            <span>ICMR-NIN 2024 Thresholds</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
