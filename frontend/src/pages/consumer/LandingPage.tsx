import React from "react";
import { 
  ShieldCheck, 
  Scan, 
  Heartbeat, 
  FileText, 
  ArrowRight,
  User,
  IdentificationCard,
  Archive,
  Scales,
  Gavel,
  CheckCircle,
  Building
} from "@phosphor-icons/react";
import { Button } from "../../components/common/Button";
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
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      
      {/* Hero Section */}
      <section className="bg-white border-b border-neutral-200 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-primary-light border border-primary-border text-xs text-primary font-medium">
            <ShieldCheck size={16} weight="bold" className="text-primary" />
            <span>Ministry of Consumer Affairs, Food & Public Distribution • Govt. of India</span>
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight font-heading">
              Packaged Commodities Compliance System
            </h1>
            <p className="text-base text-neutral-600 leading-relaxed">
              An intelligent regulatory inspection and consumer protection platform under the <strong>Legal Metrology (Packaged Commodities) Rules, 2011</strong>. Detect mandatory declarations, verify Unit Sale Prices (USP), audit font sizes under Table-I, and evaluate nutritional health limits.
            </p>
          </div>

          {/* Dual Audience Selection Section */}
          <div className="pt-4 space-y-3">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block font-heading">
              Select Your Operational Role:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
              
              {/* Role Card 1: Consumer */}
              <div 
                onClick={() => {
                  onSetUserRole("consumer");
                  onNavigate("scanner");
                }}
                className={`p-4 rounded-[8px] border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                  userRole === "consumer"
                    ? "border-primary bg-primary-light/40 shadow-xs ring-1 ring-primary"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <div className="w-10 h-10 rounded-[6px] bg-primary text-white flex items-center justify-center shrink-0">
                  <User size={22} weight="bold" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-neutral-900 font-heading">
                      Everyday Consumer
                    </h3>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white text-primary border border-primary-border">
                      Citizen Portal
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Verify packaged goods before purchase, check fair MRP, audit added sugar and sodium, and review product scan history.
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-primary">
                    <span>Launch Consumer Workflow</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>

              {/* Role Card 2: Enforcement Officer */}
              <div 
                onClick={() => {
                  onSetUserRole("officer");
                  onNavigate("dashboard");
                }}
                className={`p-4 rounded-[8px] border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                  userRole === "officer"
                    ? "border-primary bg-primary-light/40 shadow-xs ring-1 ring-primary"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <div className="w-10 h-10 rounded-[6px] bg-[#0F3A4C] text-white flex items-center justify-center shrink-0">
                  <IdentificationCard size={22} weight="bold" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-neutral-900 font-heading">
                      Enforcement Officer
                    </h3>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white text-[#0F3A4C] border border-[#164D66]">
                      Inspector Mode
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Access district dashboards, field inspections, Table-I font audits, Section 36(1) show-cause notices, and statutory dockets.
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-primary">
                    <span>Launch Officer Dashboard</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Metrics */}
          <div className="pt-6 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl text-xs">
            <div>
              <div className="text-xl font-bold text-neutral-900 font-heading">11 Declarations</div>
              <div className="text-neutral-500 mt-0.5">Audited under Rule 6</div>
            </div>
            <div>
              <div className="text-xl font-bold text-neutral-900 font-heading">Rule 7 Table-I</div>
              <div className="text-neutral-500 mt-0.5">Millimeter font cap-height</div>
            </div>
            <div>
              <div className="text-xl font-bold text-neutral-900 font-heading">Section 36(1) & 48</div>
              <div className="text-neutral-500 mt-0.5">Compounding penalty engine</div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-heading">
            Platform Capabilities for Both Audiences
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Tailored tools for Legal Metrology officers in the field and citizens making informed retail choices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Capability 1 */}
          <div className="bg-white p-5 rounded-[8px] border border-neutral-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-[6px] bg-primary-light text-primary flex items-center justify-center font-bold border border-primary-border">
                <Scan size={20} />
              </div>
              <h3 className="text-base font-bold text-neutral-900 font-heading">
                1. Optical Compliance Verification
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Scan product labels to verify mandatory declarations: manufacturer address with PIN, MRP, Unit Sale Price (USP), Net Quantity with SI units, and Table-I font sizes.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("scanner")}
              className="w-full"
              icon={<ArrowRight size={15} />}
              iconPosition="right"
            >
              Open Label Scanner
            </Button>
          </div>

          {/* Capability 2 */}
          <div className="bg-white p-5 rounded-[8px] border border-neutral-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-[6px] bg-primary-light text-primary flex items-center justify-center font-bold border border-primary-border">
                <Heartbeat size={20} />
              </div>
              <h3 className="text-base font-bold text-neutral-900 font-heading">
                2. Consumer Health & Nutrition Audit
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Scan both front and back packaging panels to evaluate sugar, calories, fat, and sodium against ICMR limits. Get health badges, price fairness analysis, and dietary advisories.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("health")}
              className="w-full"
              icon={<ArrowRight size={15} />}
              iconPosition="right"
            >
              Run Consumer Health Audit
            </Button>
          </div>

          {/* Capability 3 */}
          <div className="bg-white p-5 rounded-[8px] border border-neutral-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-[6px] bg-primary-light text-primary flex items-center justify-center font-bold border border-primary-border">
                <Archive size={20} />
              </div>
              <h3 className="text-base font-bold text-neutral-900 font-heading">
                3. Product Repository & Scans
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Maintain a centralized repository of previously scanned products and compliance history with search, status filters, and instant re-inspection tools.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("history")}
              className="w-full"
              icon={<ArrowRight size={15} />}
              iconPosition="right"
            >
              View Product Repository
            </Button>
          </div>

        </div>
      </section>

      {/* Statutory Mandates Checklist */}
      <section className="py-10 bg-white border-t border-neutral-200 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div>
            <h3 className="text-base font-bold text-neutral-900 font-heading">
              Mandatory Declarations Checked under LMPC Rules, 2011
            </h3>
            <p className="text-xs text-neutral-500">
              Prescribed under the Legal Metrology Act, 2009 for all retail pre-packaged goods.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-neutral-50 rounded-[6px] border border-neutral-200">
              <span className="font-bold text-neutral-900 block font-heading">Rule 6(1)(a)</span>
              <span className="text-neutral-600">Complete Manufacturer Address & PIN</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-[6px] border border-neutral-200">
              <span className="font-bold text-neutral-900 block font-heading">Rule 6(1)(c) & 13</span>
              <span className="text-neutral-600">Standard SI Metric Units (g, kg, ml, l)</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-[6px] border border-neutral-200">
              <span className="font-bold text-neutral-900 block font-heading">Rule 6(1)(e)</span>
              <span className="text-neutral-600">MRP "Inclusive of All Taxes"</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-[6px] border border-neutral-200">
              <span className="font-bold text-neutral-900 block font-heading">Rule 6(1)(e) Proviso</span>
              <span className="text-neutral-600">Unit Sale Price (₹/g, ₹/kg, ₹/ml)</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
