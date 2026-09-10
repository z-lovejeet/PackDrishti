import React from "react";
import { 
  ShieldCheck, 
  Scan, 
  Heartbeat, 
  ArrowRight,
  User,
  IdentificationCard,
  Archive,
  Scales,
  FileText,
  CheckCircle,
  Ruler,
  Coins,
  Sparkle,
  Eye
} from "@phosphor-icons/react";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
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
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900">
      
      {/* Top Institutional Hero Banner */}
      <section className="relative bg-white border-b border-neutral-200 overflow-hidden">
        {/* Subtle geometric government watermarks */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-navy-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-saffron-50/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
          
          {/* Ministry Endorsement Banner */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-navy-950 text-neutral-200 border border-navy-800 shadow-xs">
            <ShieldCheck size={16} weight="bold" className="text-saffron-400 shrink-0" />
            <span className="text-2xs font-semibold tracking-wide uppercase text-neutral-100">
              MINISTRY OF CONSUMER AFFAIRS, FOOD &amp; PUBLIC DISTRIBUTION • GOVT. OF INDIA
            </span>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-950 font-heading tracking-tight leading-tight">
              Packaged Commodities Legal Metrology Verification System
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              An intelligent statutory verification and consumer protection platform under the <strong className="text-navy-900">Legal Metrology (Packaged Commodities) Rules, 2011</strong>. Enforcing 11 mandatory packaging declarations, automated <strong className="text-navy-900">Rule 7 Table-I</strong> millimeter font calibrations, and <strong className="text-navy-900">ICMR-NIN 2024</strong> dietary threshold audits across Indian retail commerce.
            </p>
          </div>

          {/* Dual Operational Persona Selection */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold uppercase tracking-wider text-neutral-600 font-mono">
                Select Operational Persona:
              </span>
              <span className="text-2xs text-neutral-600">
                Switch role at any time from navigation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Persona 1: Citizen Consumer Portal */}
              <div 
                onClick={() => {
                  onSetUserRole("consumer");
                  onNavigate("scanner");
                }}
                className={`relative p-5 sm:p-6 rounded-card border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  userRole === "consumer"
                    ? "border-saffron-500 bg-gradient-to-br from-white via-saffron-50/30 to-amber-50/20 shadow-md ring-1 ring-saffron-400"
                    : "border-neutral-200 bg-white hover:border-saffron-300 hover:shadow-card-hover"
                }`}
              >
                {userRole === "consumer" && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="saffron" size="sm" dot>
                      Active Persona
                    </Badge>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-saffron-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <User size={26} weight="bold" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-neutral-900 font-heading">
                          Citizen Consumer Portal
                        </h2>
                        <span className="text-2xs uppercase font-bold px-2 py-0.5 rounded-full bg-saffron-100 text-saffron-800 border border-saffron-300 font-mono">
                          Retail Mode
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Shopping Verification &amp; Dietary Health Audits
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Verify pre-packaged retail items before purchase. Confirm accurate Maximum Retail Prices, calculate Unit Sale Prices (INR/g, INR/ml), audit added sugars and sodium against ICMR-NIN 2024 limits, and retain your personal commodity scan history.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
                    <div className="flex items-center gap-1.5 text-2xs text-neutral-700">
                      <CheckCircle size={14} weight="bold" className="text-saffron-600 shrink-0" />
                      <span>Fair MRP &amp; USP math</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-2xs text-neutral-700">
                      <CheckCircle size={14} weight="bold" className="text-saffron-600 shrink-0" />
                      <span>ICMR sugar &amp; sodium limits</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-2xs text-neutral-700">
                      <CheckCircle size={14} weight="bold" className="text-saffron-600 shrink-0" />
                      <span>Instant camera barcode/label OCR</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-2xs text-neutral-700">
                      <CheckCircle size={14} weight="bold" className="text-saffron-600 shrink-0" />
                      <span>Personal inspection archive</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="saffron"
                    size="sm"
                    className="w-full justify-between"
                    icon={<ArrowRight size={16} />}
                    iconPosition="right"
                  >
                    <span>Launch Citizen Consumer Workflow</span>
                  </Button>
                </div>
              </div>

              {/* Persona 2: Legal Metrology Enforcement Officer */}
              <div 
                onClick={() => {
                  onSetUserRole("officer");
                  onNavigate("dashboard");
                }}
                className={`relative p-5 sm:p-6 rounded-card border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  userRole === "officer"
                    ? "border-navy-800 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 text-white shadow-md ring-1 ring-navy-700"
                    : "border-neutral-200 bg-white hover:border-navy-600 hover:shadow-card-hover"
                }`}
              >
                {userRole === "officer" && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="info" size="sm" dot>
                      Active Jurisdiction
                    </Badge>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-navy-800 border border-navy-700 text-saffron-400 flex items-center justify-center shrink-0 shadow-xs">
                      <IdentificationCard size={26} weight="bold" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className={`text-base font-bold font-heading ${userRole === "officer" ? "text-white" : "text-neutral-900"}`}>
                          Legal Metrology Enforcement Officer
                        </h2>
                        <span className={`text-2xs uppercase font-bold px-2 py-0.5 rounded-full font-mono ${
                          userRole === "officer" 
                            ? "bg-navy-800 text-saffron-300 border border-navy-700" 
                            : "bg-navy-50 text-navy-800 border border-navy-200"
                        }`}>
                          Inspector Mode
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 ${userRole === "officer" ? "text-neutral-300" : "text-neutral-500"}`}>
                        Field Inspections &amp; Statutory Adjudication
                      </p>
                    </div>
                  </div>

                  <p className={`text-xs leading-relaxed ${userRole === "officer" ? "text-neutral-300" : "text-neutral-600"}`}>
                    Execute field inspections under the Legal Metrology Act, 2009. Audit mandatory declarations under Rule 6, measure font cap-height against Rule 7 Table-I standards, calculate Section 36(1) compounding fees, and generate digital show-cause notices.
                  </p>

                  <div className={`grid grid-cols-2 gap-2 pt-2 border-t ${userRole === "officer" ? "border-navy-800" : "border-neutral-100"}`}>
                    <div className={`flex items-center gap-1.5 text-2xs ${userRole === "officer" ? "text-neutral-300" : "text-neutral-700"}`}>
                      <CheckCircle size={14} weight="bold" className="text-saffron-400 shrink-0" />
                      <span>Table-I font cap-height</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-2xs ${userRole === "officer" ? "text-neutral-300" : "text-neutral-700"}`}>
                      <CheckCircle size={14} weight="bold" className="text-saffron-400 shrink-0" />
                      <span>Sec. 36(1) compounding fines</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-2xs ${userRole === "officer" ? "text-neutral-300" : "text-neutral-700"}`}>
                      <CheckCircle size={14} weight="bold" className="text-saffron-400 shrink-0" />
                      <span>Form I show-cause generator</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-2xs ${userRole === "officer" ? "text-neutral-300" : "text-neutral-700"}`}>
                      <CheckCircle size={14} weight="bold" className="text-saffron-400 shrink-0" />
                      <span>District inspection repository</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant={userRole === "officer" ? "saffron" : "primary"}
                    size="sm"
                    className="w-full justify-between"
                    icon={<ArrowRight size={16} />}
                    iconPosition="right"
                  >
                    <span>Launch Enforcement Officer Dashboard</span>
                  </Button>
                </div>
              </div>

            </div>
          </div>

          {/* Statutory Metrics Bar */}
          <div className="pt-4">
            <div className="bg-navy-900 rounded-card p-4 sm:p-5 border border-navy-800 text-white shadow-card">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-navy-800">
                
                <div className="pt-2 sm:pt-0 sm:pr-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-saffron-400" />
                    <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                      Rule 6 Mandate
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-heading text-white">
                    11 Declarations
                  </div>
                  <p className="text-2xs text-neutral-300 leading-normal">
                    Manufacturer, PIN, Net Qty, MRP, USP, Mfg Date &amp; Consumer Care.
                  </p>
                </div>

                <div className="pt-3 sm:pt-0 sm:px-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Ruler size={18} className="text-saffron-400" />
                    <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                      Rule 7 Standard
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-heading text-white">
                    Table-I Calibrated
                  </div>
                  <p className="text-2xs text-neutral-300 leading-normal">
                    Principal Display Panel font cap-height validated from 1.0mm to 6.0mm.
                  </p>
                </div>

                <div className="pt-3 sm:pt-0 sm:px-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Coins size={18} className="text-saffron-400" />
                    <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                      Statutory Penalty
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-heading text-white">
                    Section 36(1) &amp; 48
                  </div>
                  <p className="text-2xs text-neutral-300 leading-normal">
                    Compounding penalty engine for 1st, 2nd, and subsequent offences.
                  </p>
                </div>

                <div className="pt-3 sm:pt-0 sm:pl-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkle size={18} className="text-saffron-400" />
                    <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                      Dietary Safety
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-heading text-white">
                    ICMR-NIN 2024
                  </div>
                  <p className="text-2xs text-neutral-300 leading-normal">
                    Daily intake safety limits for added sugars, calories, fat, and sodium.
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Core Capabilities Section */}
      <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-neutral-200 pb-4">
          <div>
            <span className="text-2xs uppercase font-bold tracking-wider text-saffron-600 font-mono block">
              Automated Inspection Modules
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 font-heading">
              Platform Core Capabilities
            </h2>
          </div>
          <p className="text-xs text-neutral-600 max-w-md">
            Tailored tools for Legal Metrology officers in the field and citizens making informed retail choices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Capability 1: Optical Compliance Verification */}
          <div className="bg-white rounded-card border border-neutral-200 shadow-card hover:shadow-card-hover transition-all p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-navy-50 text-navy-800 border border-navy-200 flex items-center justify-center font-bold">
                <Scan size={22} weight="bold" />
              </div>
              <div>
                <span className="text-2xs font-bold text-saffron-600 uppercase tracking-wider font-mono">
                  Module 01 • Rule 6 &amp; 7
                </span>
                <h3 className="text-base font-bold text-neutral-900 font-heading mt-0.5">
                  1. Optical Compliance Verification
                </h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Scan packaged goods to verify all mandatory declarations: manufacturer address with PIN, Maximum Retail Price (MRP), Unit Sale Price (USP), Net Quantity with standard SI metric units, and Table-I cap-height measurements.
              </p>
              <div className="space-y-1.5 pt-2 border-t border-neutral-100 text-2xs text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-success shrink-0" />
                  <span>Rule 6 mandatory declaration OCR detection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-success shrink-0" />
                  <span>Rule 6(1)(e) Proviso Unit Sale Price math</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-success shrink-0" />
                  <span>Standard SI unit validation (g, kg, ml vs gms/ltrs)</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("scanner")}
              className="w-full justify-between"
              icon={<ArrowRight size={15} />}
              iconPosition="right"
            >
              Open Label Scanner
            </Button>
          </div>

          {/* Capability 2: Consumer Health & Nutrition Audit */}
          <div className="bg-white rounded-card border border-neutral-200 shadow-card hover:shadow-card-hover transition-all p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-saffron-50 text-saffron-600 border border-saffron-200 flex items-center justify-center font-bold">
                <Heartbeat size={22} weight="bold" />
              </div>
              <div>
                <span className="text-2xs font-bold text-saffron-600 uppercase tracking-wider font-mono">
                  Module 02 • ICMR-NIN 2024
                </span>
                <h3 className="text-base font-bold text-neutral-900 font-heading mt-0.5">
                  2. Consumer Health &amp; Nutrition Audit
                </h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Dual-panel packaging analysis evaluating total sugars, added sugars, calories, saturated fat, and sodium against ICMR limits. Generates front-of-pack health warning indicators, nutritional ratings, and consumer advisories.
              </p>
              <div className="space-y-1.5 pt-2 border-t border-neutral-100 text-2xs text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-success shrink-0" />
                  <span>ICMR dietary limit threshold comparisons</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-success shrink-0" />
                  <span>Sugar, calorie, and sodium safety warnings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-success shrink-0" />
                  <span>Target demographic suitability advisories</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("health")}
              className="w-full justify-between"
              icon={<ArrowRight size={15} />}
              iconPosition="right"
            >
              Run Consumer Health Audit
            </Button>
          </div>

          {/* Capability 3: Central Inspection Repository */}
          <div className="bg-white rounded-card border border-neutral-200 shadow-card hover:shadow-card-hover transition-all p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-navy-50 text-navy-800 border border-navy-200 flex items-center justify-center font-bold">
                <Archive size={22} weight="bold" />
              </div>
              <div>
                <span className="text-2xs font-bold text-saffron-600 uppercase tracking-wider font-mono">
                  Module 03 • Central Archive
                </span>
                <h3 className="text-base font-bold text-neutral-900 font-heading mt-0.5">
                  3. Central Inspection Repository
                </h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Centralized repository of previously audited pre-packaged goods, statutory certificates, and infraction dockets. Query historical records by product name, brand, or scan ID with rapid re-inspection tools.
              </p>
              <div className="space-y-1.5 pt-2 border-t border-neutral-100 text-2xs text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-success shrink-0" />
                  <span>Live Supabase database integration</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-success shrink-0" />
                  <span>Fast search by product name, brand &amp; scan ID</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-success shrink-0" />
                  <span>Instant status filtering and audit certificates</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("history")}
              className="w-full justify-between"
              icon={<ArrowRight size={15} />}
              iconPosition="right"
            >
              Access Inspection Repository
            </Button>
          </div>

        </div>
      </section>

      {/* Mandatory Declarations Reference Matrix */}
      <section className="py-12 bg-white border-t border-neutral-200 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <Scales size={18} className="text-saffron-600" />
              <span className="text-2xs uppercase font-bold tracking-wider text-saffron-600 font-mono">
                Legal Metrology Act, 2009 Reference
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 font-heading">
              Mandatory Declarations Checked under LMPC Rules, 2011
            </h2>
            <p className="text-xs text-neutral-600">
              Prescribed statutory obligations under the Legal Metrology (Packaged Commodities) Rules, 2011 for all pre-packaged commodities sold in India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Rule 1: Rule 6(1)(a) */}
            <div className="p-4 bg-neutral-50 rounded-card border border-neutral-200 space-y-2 hover:border-neutral-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-xs font-mono">Rule 6(1)(a)</span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-navy-50 text-navy-800 border border-navy-200">
                  Sec. 36(1)
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-800">
                Manufacturer, Packer or Importer Address &amp; PIN
              </h4>
              <p className="text-2xs text-neutral-600 leading-relaxed">
                Name and complete postal address of the manufacturer, packer, or importer along with the postal PIN code.
              </p>
            </div>

            {/* Rule 2: Rule 6(1)(c) & Rule 13 */}
            <div className="p-4 bg-neutral-50 rounded-card border border-neutral-200 space-y-2 hover:border-neutral-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-xs font-mono">Rule 6(1)(c) &amp; Rule 13</span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-navy-50 text-navy-800 border border-navy-200">
                  Standard SI
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-800">
                Net Quantity &amp; Standard Metric Units
              </h4>
              <p className="text-2xs text-neutral-600 leading-relaxed">
                Net quantity declared strictly in standard metric SI units (g, kg, ml, l). Non-standard units like gms, Kgs, ML, ltrs are prohibited.
              </p>
            </div>

            {/* Rule 3: Rule 6(1)(e) */}
            <div className="p-4 bg-neutral-50 rounded-card border border-neutral-200 space-y-2 hover:border-neutral-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-xs font-mono">Rule 6(1)(e)</span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-navy-50 text-navy-800 border border-navy-200">
                  Rule 18
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-800">
                Maximum Retail Price (MRP)
              </h4>
              <p className="text-2xs text-neutral-600 leading-relaxed">
                Retail price declared strictly in format "MRP ₹ XX.XX (inclusive of all taxes)". Dual MRPs or stating "taxes extra" is illegal.
              </p>
            </div>

            {/* Rule 4: Rule 6(1)(e) Proviso */}
            <div className="p-4 bg-neutral-50 rounded-card border border-neutral-200 space-y-2 hover:border-neutral-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-xs font-mono">Rule 6(1)(e) Proviso</span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-saffron-50 text-saffron-700 border border-saffron-200">
                  Mandatory 2022
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-800">
                Unit Sale Price (USP) Calculation
              </h4>
              <p className="text-2xs text-neutral-600 leading-relaxed">
                Unit sale price declared in ₹/g, ₹/kg, ₹/ml or ₹/l for all pre-packaged commodities to enable accurate price comparison.
              </p>
            </div>

            {/* Rule 5: Rule 7 Table-I */}
            <div className="p-4 bg-neutral-50 rounded-card border border-neutral-200 space-y-2 hover:border-neutral-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-xs font-mono">Rule 7 &amp; Table-I</span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-navy-50 text-navy-800 border border-navy-200">
                  Cap-Height
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-800">
                Table-I Font Height Calibration
              </h4>
              <p className="text-2xs text-neutral-600 leading-relaxed">
                Minimum numeral and letter cap-height (1.0 mm to 6.0 mm) calibrated strictly to the area of the Principal Display Panel (PDP).
              </p>
            </div>

            {/* Rule 6: Rule 9(1) */}
            <div className="p-4 bg-neutral-50 rounded-card border border-neutral-200 space-y-2 hover:border-neutral-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-xs font-mono">Rule 9(1)</span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-navy-50 text-navy-800 border border-navy-200">
                  Contrast Ratio
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-800">
                Conspicuous Optical Contrast
              </h4>
              <p className="text-2xs text-neutral-600 leading-relaxed">
                All declarations must be printed in colors that contrast conspicuously with the background (WCAG contrast ratio ≥ 3:1).
              </p>
            </div>

          </div>

          <div className="p-4 rounded-card bg-navy-950 text-neutral-300 border border-navy-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-navy-800 text-saffron-400 flex items-center justify-center shrink-0">
                <Eye size={18} weight="bold" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Jan Vishwas (Amendment of Provisions) Act Adjudication
                </h4>
                <p className="text-2xs text-neutral-400">
                  First procedural label defaults receive improvement notices under amended Section 36(1).
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate("scanner")}
              className="shrink-0 text-2xs"
            >
              Start Inspection Now
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

