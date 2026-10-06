import React, { useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { Button } from "../common/Button";
import { useAuthStore } from "../../store/authStore";

interface NavbarProps {
  onNavigate: (page: string) => void;
  activePage: string;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  activePage,
  onOpenAuthModal,
}) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      {/* Top Consumer Health Masthead */}
      <div className="bg-slate-950 text-slate-300 text-2xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="font-semibold tracking-wider text-white uppercase">
              BiteIQ
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">
              AI Nutrition, Macro Tracker &amp; Food Scanner
            </span>
            <span className="text-slate-600 hidden md:inline">•</span>
            <span className="text-slate-400 hidden md:inline">
              ICMR-NIN 2024 &amp; WHO Dietary Benchmarks
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 text-2xs">
            <span className="text-slate-500 hidden sm:inline">Language:</span>
            <div className="flex items-center gap-1 font-medium">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`transition-colors cursor-pointer px-1.5 py-0.5 rounded text-2xs ${
                  language === "en"
                    ? "text-white font-semibold bg-slate-800"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                English
              </button>
              <span className="text-slate-700">|</span>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`transition-colors cursor-pointer px-1.5 py-0.5 rounded text-2xs ${
                  language === "hi"
                    ? "text-white font-semibold bg-slate-800"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Lockup */}
        <div 
          onClick={() => handleNavClick("landing")}
          className="flex items-center gap-3 cursor-pointer select-none shrink-0 group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleNavClick("landing");
            }
          }}
          aria-label="BiteIQ Home"
        >
          <img
            src="/logo.png"
            alt="BiteIQ Logo"
            className="w-9 h-9 object-contain group-hover:opacity-90 transition-opacity"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />

          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-heading tracking-tight text-slate-950">
                BiteIQ
              </span>
              <span className="text-xs text-slate-500 font-hindi font-medium">
                बाइट IQ
              </span>
            </div>
            <span className="text-2xs font-mono uppercase tracking-wider text-slate-600 hidden sm:block">
              AI Nutrition &amp; Macro Intelligence
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => handleNavClick("landing")}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activePage === "landing"
                ? "bg-slate-900 text-white font-semibold shadow-2xs"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => handleNavClick("health")}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activePage === "health"
                ? "bg-slate-900 text-white font-semibold shadow-2xs"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            Nutrition &amp; Health Scanner
          </button>

          <button
            type="button"
            onClick={() => handleNavClick("history")}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activePage === "history"
                ? "bg-slate-900 text-white font-semibold shadow-2xs"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            Scan History
          </button>
        </nav>

        {/* Right Section: Auth Controls, Primary CTA, Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Authentication Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden xl:flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-800 px-2.5 py-1 rounded-md text-2xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-medium max-w-[140px] truncate">
                  {user?.fullName || user?.email?.split("@")[0] || "Consumer"}
                </span>
              </div>

              <button
                type="button"
                onClick={logout}
                className="text-xs text-slate-500 hover:text-rose-600 font-medium px-2 py-1 rounded transition-colors"
                title="Sign out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-3 py-1 rounded-md text-xs font-medium border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
              title="Sign in to save scan history"
            >
              Sign In
            </button>
          )}

          {/* Primary Action Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleNavClick("health")}
            className={`hidden md:inline-flex text-xs font-semibold px-3 py-1.5 transition-all ${
              activePage === "health"
                ? "ring-2 ring-slate-900 ring-offset-2"
                : ""
            }`}
          >
            Scan Food Label
          </Button>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X size={18} weight="bold" />
            ) : (
              <List size={18} weight="bold" />
            )}
          </button>

        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-dropdown animate-fadeIn">
          {/* Mobile Navigation Links */}
          <nav className="space-y-1">
            <span className="text-2xs uppercase font-mono font-medium text-slate-500 block mb-1.5">
              Consumer Navigation
            </span>

            <button
              type="button"
              onClick={() => handleNavClick("landing")}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                activePage === "landing"
                  ? "bg-slate-900 text-white font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>Overview</span>
              {activePage === "landing" && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("health")}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                activePage === "health"
                  ? "bg-slate-900 text-white font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>Nutrition &amp; Health Scanner</span>
              {activePage === "health" && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("history")}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                activePage === "history"
                  ? "bg-slate-900 text-white font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>Scan History</span>
              {activePage === "history" && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>
          </nav>

          {/* Mobile Auth and Action */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleNavClick("health")}
              className="w-full text-xs font-semibold justify-center py-2"
            >
              Scan Food Label
            </Button>

            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="w-full text-center py-2 text-xs font-medium text-slate-700 hover:text-slate-950 border border-slate-200 rounded-lg bg-slate-50 transition-colors"
              >
                Sign In to Save History
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-center py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-lg transition-colors"
              >
                Sign Out ({user?.fullName || "Consumer"})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
