import React, { useState } from "react";
import { ShieldCheck, List, X } from "@phosphor-icons/react";
import { Button } from "../common/Button";
import { UserRole } from "../../types";
import { useAuthStore } from "../../store/authStore";

interface NavbarProps {
  onNavigate: (page: string) => void;
  activePage: string;
  userRole: UserRole;
  onToggleUserRole: () => void;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  activePage,
  userRole,
  onToggleUserRole,
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
      {/* Top Government Masthead */}
      <div className="bg-slate-950 text-slate-300 text-2xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="font-semibold tracking-wider text-white uppercase">
              Government of India
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">
              Ministry of Consumer Affairs, Food &amp; Public Distribution
            </span>
            <span className="text-slate-600 hidden md:inline">•</span>
            <span className="text-slate-400 hidden md:inline">
              Department of Consumer Affairs (Legal Metrology Division)
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
          aria-label="PackDrashiti Home"
        >
          <div className="w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center text-white shrink-0 shadow-2xs transition-transform group-hover:scale-105">
            <ShieldCheck size={20} weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-950 tracking-tight font-heading leading-tight">
                PackDrashiti
              </span>
            </div>
            <p className="text-2xs text-slate-500 font-normal leading-none mt-0.5">
              Legal Metrology Division
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links (Typography-only, zero icon clutter) */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => handleNavClick("landing")}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activePage === "landing"
                ? "bg-slate-900 text-white font-semibold shadow-2xs"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            Overview
          </button>

          {userRole === "officer" && (
            <button
              type="button"
              onClick={() => handleNavClick("dashboard")}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activePage === "dashboard"
                  ? "bg-slate-900 text-white font-semibold shadow-2xs"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              Officer Desk
            </button>
          )}

          <button
            type="button"
            onClick={() => handleNavClick("scanner")}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activePage === "scanner"
                ? "bg-slate-900 text-white font-semibold shadow-2xs"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            {userRole === "officer" ? "Field Scanner" : "Label Scanner"}
          </button>

          {userRole === "consumer" && (
            <button
              type="button"
              onClick={() => handleNavClick("health")}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activePage === "health"
                  ? "bg-slate-900 text-white font-semibold shadow-2xs"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              Health Check
            </button>
          )}

          {userRole === "consumer" && (
            <button
              type="button"
              onClick={() => handleNavClick("history")}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activePage === "history"
                  ? "bg-slate-900 text-white font-semibold shadow-2xs"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              Archived Scans
            </button>
          )}

          {userRole === "officer" && (
            <button
              type="button"
              onClick={() => handleNavClick("inspections")}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activePage === "inspections"
                  ? "bg-slate-900 text-white font-semibold shadow-2xs"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              Inspection Ledger
            </button>
          )}

          {userRole === "officer" && (
            <button
              type="button"
              onClick={() => handleNavClick("reports")}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activePage === "reports"
                  ? "bg-slate-900 text-white font-semibold shadow-2xs"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              Reports &amp; Dockets
            </button>
          )}
        </nav>

        {/* Right Section: Persona Switcher, Auth Controls, Primary CTA, Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Persona Segmented Control (Pure text, zero icons) */}
          <div 
            role="group" 
            aria-label="Operating Mode"
            className="hidden sm:flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs shadow-2xs"
          >
            <button
              type="button"
              onClick={() => {
                if (userRole !== "consumer") onToggleUserRole();
              }}
              className={`px-2.5 py-1 rounded-md transition-all text-xs ${
                userRole === "consumer"
                  ? "bg-white text-slate-950 font-semibold shadow-2xs border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
              title="Citizen consumer verification mode"
            >
              Consumer
            </button>

            <button
              type="button"
              onClick={() => {
                if (userRole !== "officer") onToggleUserRole();
              }}
              className={`px-2.5 py-1 rounded-md transition-all text-xs ${
                userRole === "officer"
                  ? "bg-slate-900 text-white font-semibold shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
              title="Statutory enforcement officer mode"
            >
              Officer
            </button>
          </div>

          {/* Authentication Section (Pure text) */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden xl:flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-800 px-2.5 py-1 rounded-md text-2xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-medium max-w-[120px] truncate">
                  {user?.badgeNumber || user?.email?.split("@")[0] || "Authorized"}
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-colors"
                title="Sign out of portal"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-3 py-1 rounded-md text-xs font-medium border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 transition-colors shadow-2xs"
              title="Sign in for official access"
            >
              Sign In
            </button>
          )}

          {/* Primary Action Button (Pure text, sleek and restrained) */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleNavClick("scanner")}
            className={`hidden md:inline-flex text-xs font-semibold px-3 py-1.5 transition-all ${
              activePage === "scanner"
                ? "ring-2 ring-slate-900 ring-offset-2"
                : ""
            }`}
          >
            Scan Package
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

      {/* Mobile Menu Drawer (Pure text navigation) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-dropdown animate-fadeIn">
          
          {/* Mobile Persona Switcher */}
          <div>
            <span className="text-2xs uppercase font-mono font-medium text-slate-500 block mb-1.5">
              Operating Mode
            </span>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (userRole !== "consumer") onToggleUserRole();
                }}
                className={`py-1.5 px-3 rounded-md text-center font-medium transition-all ${
                  userRole === "consumer"
                    ? "bg-white text-slate-950 font-semibold shadow-2xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Consumer
              </button>

              <button
                type="button"
                onClick={() => {
                  if (userRole !== "officer") onToggleUserRole();
                }}
                className={`py-1.5 px-3 rounded-md text-center font-medium transition-all ${
                  userRole === "officer"
                    ? "bg-slate-900 text-white font-semibold shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Officer
              </button>
            </div>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="space-y-1">
            <span className="text-2xs uppercase font-mono font-medium text-slate-500 block mb-1.5">
              Navigation
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

            {userRole === "officer" && (
              <button
                type="button"
                onClick={() => handleNavClick("dashboard")}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                  activePage === "dashboard"
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>Officer Desk</span>
                {activePage === "dashboard" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => handleNavClick("scanner")}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                activePage === "scanner"
                  ? "bg-slate-900 text-white font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>{userRole === "officer" ? "Field Scanner" : "Label Scanner"}</span>
              {activePage === "scanner" && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>

            {userRole === "consumer" && (
              <button
                type="button"
                onClick={() => handleNavClick("health")}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                  activePage === "health"
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>Health Check</span>
                {activePage === "health" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            )}

            {userRole === "consumer" && (
              <button
                type="button"
                onClick={() => handleNavClick("history")}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                  activePage === "history"
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>Archived Scans</span>
                {activePage === "history" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            )}

            {userRole === "officer" && (
              <button
                type="button"
                onClick={() => handleNavClick("inspections")}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                  activePage === "inspections"
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>Inspection Ledger</span>
                {activePage === "inspections" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            )}

            {userRole === "officer" && (
              <button
                type="button"
                onClick={() => handleNavClick("reports")}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                  activePage === "reports"
                    ? "bg-slate-900 text-white font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>Reports &amp; Dockets</span>
                {activePage === "reports" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            )}
          </nav>

          {/* Mobile Quick Scan CTA */}
          <Button
            variant="primary"
            size="md"
            onClick={() => handleNavClick("scanner")}
            className="w-full text-xs font-semibold"
          >
            Scan Package Now
          </Button>

          {/* Mobile Auth and Status */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            {isAuthenticated ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-2xs font-mono font-medium text-slate-700 truncate">
                    {user?.badgeNumber || user?.email || "Authorized"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 text-slate-700 hover:bg-slate-100"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="w-full py-2 px-3 rounded-md text-xs font-medium border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 text-center"
              >
                Sign In to Portal
              </button>
            )}
          </div>

        </div>
      )}
    </header>
  );
};
