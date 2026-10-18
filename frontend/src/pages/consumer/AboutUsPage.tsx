import React from "react";
import {
  ShieldCheck,
  Heartbeat,
  Sparkle,
  Plant,
  Eye,
  CheckCircle,
  ArrowRight,
  Scales,
  LockKey,
  UsersThree,
  GraduationCap,
  Flask,
} from "@phosphor-icons/react";

interface AboutUsPageProps {
  onNavigate: (page: string) => void;
  onOpenAuthModal?: () => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({
  onNavigate,
  onOpenAuthModal,
}) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-slate-100 selection:text-slate-900">
      
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-14 sm:pt-24 sm:pb-18 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            IQ
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 text-slate-600 text-2xs font-mono font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Public Health Mission • Food Transparency Project</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950 font-heading max-w-3xl leading-[1.15]">
          Empowering Every Citizen with Uncompromising Food Intelligence.
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
          BiteIQ was created with a single, urgent purpose: to end the chronic disease epidemic driven by deceptive food packaging and ultra-processed ingredients. We believe every shopper and family deserves complete clarity on what enters their body.
        </p>

        {/* Quick Value Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-100">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono">
              100%
            </div>
            <div className="text-2xs text-slate-500 font-medium uppercase tracking-wider mt-1">
              Independent • Zero FMCG Ads
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono">
              800+
            </div>
            <div className="text-2xs text-slate-500 font-medium uppercase tracking-wider mt-1">
              INS &amp; E-Additives Cataloged
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono">
              ICMR-NIN
            </div>
            <div className="text-2xs text-slate-500 font-medium uppercase tracking-wider mt-1">
              2024 Clinical Guidelines
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono">
              0 Millisec
            </div>
            <div className="text-2xs text-slate-500 font-medium uppercase tracking-wider mt-1">
              Data Sold to 3rd Parties
            </div>
          </div>
        </div>
      </section>

      {/* The Crisis We Are Solving */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-2xl">
          <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
            The Public Health Reality
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-heading mt-4">
            Why Nutritional Literacy is a Health Emergency
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Over the past two decades, our food environment has transformed from whole, minimally processed grains and pulses to high-yield industrial formulations engineered with hidden sugars, cheap palm oil, and synthetic additives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <Heartbeat size={18} weight="fill" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              101M Diabetic • 136M Pre-Diabetic
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              According to landmark ICMR-INDIAB data, metabolic syndrome and early-onset Type 2 diabetes are skyrocketing across young demographics who consume ultra-processed commercial snacks.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Eye size={18} weight="fill" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              The "Health-Washing" Trap
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Packaged cereals, digestives, and beverages prominently claim "Rich in Fiber" or "100% Real," yet their ingredient lists reveal 40% refined wheat flour (maida) and multi-syrup sugars.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Flask size={18} weight="fill" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Cryptic Chemical Additives
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Synthetic dyes, artificial emulsifiers, and industrial dough conditioners are masked behind ambiguous INS/E numbers that everyday consumers cannot decode while shopping.
            </p>
          </div>
        </div>
      </section>

      {/* Our Core Commitments */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-2xl">
          <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Our Guiding Ethics
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-heading mt-4">
            Built on Uncompromising Principles
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            We are not a diet fad or an influencer-backed marketing brand. We operate as an impartial, science-backed computational nutrition utility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Scales size={20} weight="bold" />
              </div>
              <h3 className="text-base font-bold text-slate-950 font-heading">
                100% Independent Editorial Integrity
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              No food manufacturer or packaged brand can pay to improve their health score, alter warnings, or promote products in our database. Our algorithms evaluate strictly against published scientific standards.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                <GraduationCap size={20} weight="bold" />
              </div>
              <h3 className="text-base font-bold text-slate-950 font-heading">
                Calibrated to ICMR-NIN &amp; WHO Standards
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every dietary ceiling, sodium cap, trans-fat alert, and sugar calculation is anchored in the 2024 ICMR-NIN Dietary Guidelines for Indians and WHO nutritional thresholds, adjusted for age, sex, and clinical conditions.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <LockKey size={20} weight="bold" />
              </div>
              <h3 className="text-base font-bold text-slate-950 font-heading">
                Privacy-First Health Architecture
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your biometric data, meal scans, and clinical profiles belong to you. We do not sell your personal lifestyle data to health insurance providers, pharmaceutical advertisers, or retail aggregators.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <UsersThree size={20} weight="bold" />
              </div>
              <h3 className="text-base font-bold text-slate-950 font-heading">
                Consumer-First Community Voice
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              When food brands reformulate ingredients or reduce synthetic colors, our community benefits. When deceptive packaging is flagged, we bring it to light to drive systemic industry reform.
            </p>
          </div>
        </div>
      </section>

      {/* The Two Engines of BiteIQ */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-2xl mb-10">
          <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-heading mt-4">
            Two Specialized AI Engines in One Platform
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Food isn't just packaged snacks; it's also your home-cooked roti, dal, sabzi, and fresh thalis. BiteIQ covers both sides of daily nutrition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-mono font-semibold uppercase tracking-wider">
              <Sparkle size={16} weight="fill" className="text-emerald-600" />
              <span>Engine 01</span>
            </div>
            <h3 className="text-lg font-bold text-slate-950 font-heading">
              Fresh Food Vision &amp; Plate Segmentation
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Point your camera at your lunch or dinner plate. Our multi-item vision model identifies individual dishes, estimates portion volume in grams, and calculates exact calories, protein, carbs, fats, and fiber in seconds.
            </p>
            <ul className="text-xs text-slate-700 space-y-2 pt-2 border-t border-slate-200">
              <li className="flex items-center gap-2">
                <CheckCircle size={14} weight="fill" className="text-emerald-600 shrink-0" />
                <span>Regional Indian &amp; Asian staple database (dal, sabzi, curries, rotis)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} weight="fill" className="text-emerald-600 shrink-0" />
                <span>Interactive portion tuning and instant diary logging</span>
              </li>
            </ul>
          </div>

          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-4">
            <div className="flex items-center gap-2 text-indigo-800 text-xs font-mono font-semibold uppercase tracking-wider">
              <ShieldCheck size={16} weight="fill" className="text-indigo-600" />
              <span>Engine 02</span>
            </div>
            <h3 className="text-lg font-bold text-slate-950 font-heading">
              Packaged Food &amp; Chemical Additive Auditor
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Scan barcode or capture the back nutrition panel and ingredient list of any packaged grocery item. Our OCR engine detects hidden sugars, fractionated palm oil, and cross-references chemical additives with toxicological monographs.
            </p>
            <ul className="text-xs text-slate-700 space-y-2 pt-2 border-t border-slate-200">
              <li className="flex items-center gap-2">
                <CheckCircle size={14} weight="fill" className="text-emerald-600 shrink-0" />
                <span>0-100 Nutrition Health Score with traffic-light alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} weight="fill" className="text-emerald-600 shrink-0" />
                <span>Clean, whole-food healthier alternative recommendations</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20 text-center">
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-900 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">
              Ready to See What's Really Inside Your Food?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Join thousands of conscious consumers making evidence-based dietary choices for themselves and their families.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={onOpenAuthModal || (() => onNavigate("dashboard"))}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-500 transition-colors shadow-xs cursor-pointer"
              >
                <span>Get Started with BiteIQ</span>
                <ArrowRight size={16} weight="bold" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate("methodology")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              >
                <span>Explore Our Science</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutUsPage;
