import React from "react";
import { ShieldCheck, Heartbeat, Plant, Sparkle } from "@phosphor-icons/react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 mt-auto text-xs py-10 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Main Two-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-8 border-b border-slate-900">
          
          {/* Column 1: Platform Identity */}
          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <img
                src="/logo.png"
                alt="BiteIQ Logo"
                className="w-10 h-10 rounded-lg object-contain shrink-0 shadow-2xs border border-slate-800"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-white text-base tracking-tight">
                    BiteIQ
                  </span>
                  <span className="text-2xs uppercase font-mono font-semibold tracking-wider px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    Consumer Health AI
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  AI-Powered Daily Food Nutrition, Ingredient Safety &amp; Product Scanner
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Designed for everyday shoppers and families to decode packaged food labels in seconds. Evaluates nutrition tables and ingredient lists against <strong className="text-white">ICMR-NIN 2024 Dietary Guidelines for Indians</strong> and <strong className="text-white">WHO</strong> safe intake thresholds.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-2xs font-medium">
                <Heartbeat size={13} className="text-slate-400" />
                ICMR-NIN 2024 Thresholds
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-2xs font-medium">
                <ShieldCheck size={13} className="text-slate-400" />
                Additive &amp; Dye Audit
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-2xs font-medium">
                <Plant size={13} className="text-slate-400" />
                Whole-Food Alternatives
              </span>
            </div>
          </div>

          {/* Column 2: Daily Consumer Capabilities */}
          <div className="space-y-4 lg:pl-6 lg:border-l lg:border-slate-900">
            <div>
              <span className="text-2xs uppercase font-semibold tracking-wider text-slate-400 block mb-1">
                What BiteIQ Checks For You
              </span>
              <h4 className="text-sm font-bold text-white">
                Transparent Food &amp; Ingredient Intelligence
              </h4>
              <p className="text-slate-400 text-xs mt-0.5">
                Snap the front and back of any packaged snack, beverage, cereal, or grocery item before you buy.
              </p>
            </div>

            <div className="bg-slate-900/60 rounded-lg p-3.5 border border-slate-800/80 space-y-2">
              <span className="text-2xs uppercase font-semibold tracking-wider text-slate-300 block">
                Core Consumer Protection Pillars
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Sparkle size={14} className="text-slate-400 shrink-0" />
                  <span>0–100 Nutrition Health Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkle size={14} className="text-slate-400 shrink-0" />
                  <span>Palm Oil &amp; Hidden Sugar Alerts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkle size={14} className="text-slate-400 shrink-0" />
                  <span>Artificial Color &amp; INS Additive Audit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkle size={14} className="text-slate-400 shrink-0" />
                  <span>Shelf-Life Expiry &amp; Price per 100g</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-2xs text-slate-400">
          <p>
            Built to empower everyday consumers with instant, science-backed nutrition and ingredient clarity.
          </p>
          <p className="text-slate-400 sm:text-right shrink-0">
            BiteIQ • Consumer Nutrition &amp; Ingredient Intelligence
          </p>
        </div>

      </div>
    </footer>
  );
};
