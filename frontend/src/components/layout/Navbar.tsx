import React, { useState } from "react";
import { 
  ShieldCheck, 
  Scan, 
  Heartbeat, 
  FileText, 
  Archive, 
  SquaresFour, 
  DownloadSimple, 
  User, 
  IdentificationCard, 
  SignIn, 
  SignOut,
  List,
  X,
  Globe
} from "@phosphor-icons/react";
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      {/* Top Government Masthead */}
      <div className="bg-navy-950 text-neutral-300 text-2xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-navy-900/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="font-bold tracking-wider text-white uppercase">
              Government of India
            </span>
            <span className="text-neutral-500">•</span>
            <span className="font-medium tracking-wide text-neutral-200 uppercase">
              Ministry of Consumer Affairs, Food &amp; Public Distribution
            </span>
            <span className="text-neutral-500 hidden md:inline">•</span>
            <span className="text-neutral-300 hidden md:inline">
              Department of Consumer Affairs (Legal Metrology Division)
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-2xs">
            <div className="flex items-center gap-1 text-neutral-400">
              <Globe size={13} className="text-saffron-400" />
              <span className="hidden sm:inline text-neutral-400">Language:</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`transition-colors cursor-pointer px-1.5 py-0.5 rounded ${
                  language === "en" 
                    ? "text-white font-bold bg-navy-900" 
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                English
              </button>
              <span className="text-neutral-600">|</span>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`transition-colors cursor-pointer px-1.5 py-0.5 rounded ${
                  language === "hi" 
                    ? "text-white font-bold bg-navy-900" 
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo and Identity */}
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
          <div className="w-10 h-10 rounded-lg bg-navy-900 border border-navy-800 flex items-center justify-center text-saffron-400 shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <ShieldCheck size={24} weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-navy-950 tracking-tight font-heading leading-tight">
                PackDrashiti
              </span>
              <span className="text-2xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-saffron-50 text-saffron-800 border border-saffron-200/80 font-mono">
                LMPC 2011
              </span>
            </div>
            <p className="text-2xs text-neutral-500 font-medium leading-none mt-1">
              Legal Metrology Division • Govt. of India
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleNavClick("landing")}
            className={`px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
              activePage === "landing"
                ? "bg-navy-900 text-white font-bold shadow-xs"
                : "text-neutral-600 hover:text-navy-950 hover:bg-neutral-100"
            }`}
          >
            Overview
          </button>

          {userRole === "officer" && (
            <button
              type="button"
              onClick={() => handleNavClick("dashboard")}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activePage === "dashboard"
                  ? "bg-navy-900 text-white font-bold shadow-xs"
                  : "text-neutral-600 hover:text-navy-950 hover:bg-neutral-100"
              }`}
            >
              <SquaresFour size={16} weight={activePage === "dashboard" ? "bold" : "regular"} className={activePage === "dashboard" ? "text-saffron-400" : "text-neutral-500"} />
              <span>Officer Dashboard</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleNavClick("scanner")}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activePage === "scanner"
                ? "bg-navy-900 text-white font-bold shadow-xs"
                : "text-neutral-600 hover:text-navy-950 hover:bg-neutral-100"
            }`}
          >
            <Scan size={16} weight={activePage === "scanner" ? "bold" : "regular"} className={activePage === "scanner" ? "text-saffron-400" : "text-neutral-500"} />
            <span>{userRole === "officer" ? "Field Scanner" : "Label Scanner"}</span>
          </button>

          {userRole === "consumer" && (
            <button
              type="button"
              onClick={() => handleNavClick("health")}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activePage === "health"
                  ? "bg-navy-900 text-white font-bold shadow-xs"
                  : "text-neutral-600 hover:text-navy-950 hover:bg-neutral-100"
              }`}
            >
              <Heartbeat size={16} weight={activePage === "health" ? "bold" : "regular"} className={activePage === "health" ? "text-saffron-400" : "text-neutral-500"} />
              <span>Health Check</span>
            </button>
          )}

          {userRole === "consumer" && (
            <button
              type="button"
              onClick={() => handleNavClick("history")}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activePage === "history"
                  ? "bg-navy-900 text-white font-bold shadow-xs"
                  : "text-neutral-600 hover:text-navy-950 hover:bg-neutral-100"
              }`}
            >
              <Archive size={16} weight={activePage === "history" ? "bold" : "regular"} className={activePage === "history" ? "text-saffron-400" : "text-neutral-500"} />
              <span>My Scans</span>
            </button>
          )}

          {userRole === "officer" && (
            <button
              type="button"
              onClick={() => handleNavClick("inspections")}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activePage === "inspections"
                  ? "bg-navy-900 text-white font-bold shadow-xs"
                  : "text-neutral-600 hover:text-navy-950 hover:bg-neutral-100"
              }`}
            >
              <FileText size={16} weight={activePage === "inspections" ? "bold" : "regular"} className={activePage === "inspections" ? "text-saffron-400" : "text-neutral-500"} />
              <span>Inspection Ledger</span>
            </button>
          )}

          {userRole === "officer" && (
            <button
              type="button"
              onClick={() => handleNavClick("reports")}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activePage === "reports"
                  ? "bg-navy-900 text-white font-bold shadow-xs"
                  : "text-neutral-600 hover:text-navy-950 hover:bg-neutral-100"
              }`}
            >
              <DownloadSimple size={16} weight={activePage === "reports" ? "bold" : "regular"} className={activePage === "reports" ? "text-saffron-400" : "text-neutral-500"} />
              <span>Report Dockets</span>
            </button>
          )}
        </nav>

        {/* Right Section: Persona Switcher, Auth Controls, Primary CTA, Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Persona Segmented Control (Desktop) */}
          <div 
            role="group" 
            aria-label="Persona Mode Selection"
            className="hidden sm:flex items-center p-0.5 rounded-lg bg-neutral-100 border border-neutral-200 text-xs shadow-2xs"
          >
            <button
              type="button"
              onClick={() => {
                if (userRole !== "consumer") onToggleUserRole();
              }}
              className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all text-xs font-semibold ${
                userRole === "consumer"
                  ? "bg-white text-navy-950 font-bold shadow-xs border border-neutral-200/80"
                  : "text-neutral-600 hover:text-navy-950"
              }`}
              title="Switch to Consumer Mode (Citizen retail and nutrition verification)"
            >
              <User 
                size={14} 
                weight={userRole === "consumer" ? "bold" : "regular"} 
                className={userRole === "consumer" ? "text-saffron-600" : "text-neutral-400"} 
              />
              <span>Consumer</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (userRole !== "officer") onToggleUserRole();
              }}
              className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all text-xs font-semibold ${
                userRole === "officer"
                  ? "bg-navy-900 text-white font-bold shadow-xs"
                  : "text-neutral-600 hover:text-navy-950"
              }`}
              title="Switch to Officer Mode (Enforcement and Inspection jurisdiction)"
            >
              <IdentificationCard 
                size={14} 
                weight={userRole === "officer" ? "bold" : "regular"} 
                className={userRole === "officer" ? "text-saffron-400" : "text-neutral-400"} 
              />
              <span>Officer</span>
            </button>
          </div>

          {/* Authentication Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden xl:flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 text-neutral-800 px-2.5 py-1.5 rounded-lg text-2xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-medium max-w-[120px] truncate">
                  {user?.badgeNumber || user?.email?.split("@")[0] || "Authorized"}
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-neutral-300 text-neutral-700 hover:bg-neutral-100 hover:text-navy-900 transition-colors flex items-center gap-1.5"
                title="Sign out of portal"
              >
                <SignOut size={14} weight="bold" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-navy-200 bg-navy-50 text-navy-900 hover:bg-navy-100 hover:border-navy-300 transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Sign in or register for official access"
            >
              <SignIn size={14} weight="bold" className="text-saffron-600" />
              <span>Sign In</span>
            </button>
          )}

          {/* Primary Action Button (Desktop) */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleNavClick("scanner")}
            icon={<Scan size={14} weight="bold" />}
            className="hidden md:inline-flex bg-navy-900 hover:bg-navy-800 text-white border-0 shadow-xs font-semibold text-xs"
          >
            Scan Product
          </Button>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-navy-900 transition-colors"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X size={20} weight="bold" />
            ) : (
              <List size={20} weight="bold" />
            )}
          </button>

        </div>

      </div>

      {/* Mobile Menu Drawer / Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white/98 backdrop-blur-md px-4 py-4 space-y-4 shadow-dropdown animate-fadeIn">
          
          {/* Mobile Persona Switcher */}
          <div>
            <span className="text-2xs uppercase font-bold tracking-wider text-neutral-500 block mb-1.5">
              Operating Mode
            </span>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-neutral-100 border border-neutral-200 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (userRole !== "consumer") onToggleUserRole();
                }}
                className={`py-2 px-3 rounded-md flex items-center justify-center gap-2 font-semibold transition-all ${
                  userRole === "consumer"
                    ? "bg-white text-navy-950 font-bold shadow-xs border border-neutral-200/80"
                    : "text-neutral-600 hover:text-navy-950"
                }`}
              >
                <User 
                  size={15} 
                  weight={userRole === "consumer" ? "bold" : "regular"} 
                  className={userRole === "consumer" ? "text-saffron-600" : "text-neutral-400"} 
                />
                <span>Consumer Mode</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (userRole !== "officer") onToggleUserRole();
                }}
                className={`py-2 px-3 rounded-md flex items-center justify-center gap-2 font-semibold transition-all ${
                  userRole === "officer"
                    ? "bg-navy-900 text-white font-bold shadow-xs"
                    : "text-neutral-600 hover:text-navy-950"
                }`}
              >
                <IdentificationCard 
                  size={15} 
                  weight={userRole === "officer" ? "bold" : "regular"} 
                  className={userRole === "officer" ? "text-saffron-400" : "text-neutral-400"} 
                />
                <span>Officer Mode</span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="space-y-1">
            <span className="text-2xs uppercase font-bold tracking-wider text-neutral-500 block mb-1.5">
              Navigation
            </span>

            <button
              type="button"
              onClick={() => handleNavClick("landing")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                activePage === "landing"
                  ? "bg-navy-900 text-white font-bold"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-navy-900"
              }`}
            >
              <span>Overview</span>
              {activePage === "landing" && (
                <span className="w-1.5 h-1.5 rounded-full bg-saffron-400" />
              )}
            </button>

            {userRole === "officer" && (
              <button
                type="button"
                onClick={() => handleNavClick("dashboard")}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                  activePage === "dashboard"
                    ? "bg-navy-900 text-white font-bold"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-navy-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <SquaresFour size={16} weight={activePage === "dashboard" ? "bold" : "regular"} className={activePage === "dashboard" ? "text-saffron-400" : "text-neutral-500"} />
                  <span>Officer Dashboard</span>
                </div>
                {activePage === "dashboard" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-saffron-400" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => handleNavClick("scanner")}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                activePage === "scanner"
                  ? "bg-navy-900 text-white font-bold"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-navy-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Scan size={16} weight={activePage === "scanner" ? "bold" : "regular"} className={activePage === "scanner" ? "text-saffron-400" : "text-neutral-500"} />
                <span>{userRole === "officer" ? "Field Scanner" : "Label Scanner"}</span>
              </div>
              {activePage === "scanner" && (
                <span className="w-1.5 h-1.5 rounded-full bg-saffron-400" />
              )}
            </button>

            {userRole === "consumer" && (
              <button
                type="button"
                onClick={() => handleNavClick("health")}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                  activePage === "health"
                    ? "bg-navy-900 text-white font-bold"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-navy-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Heartbeat size={16} weight={activePage === "health" ? "bold" : "regular"} className={activePage === "health" ? "text-saffron-400" : "text-neutral-500"} />
                  <span>Health Check</span>
                </div>
                {activePage === "health" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-saffron-400" />
                )}
              </button>
            )}

            {userRole === "consumer" && (
              <button
                type="button"
                onClick={() => handleNavClick("history")}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                  activePage === "history"
                    ? "bg-navy-900 text-white font-bold"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-navy-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Archive size={16} weight={activePage === "history" ? "bold" : "regular"} className={activePage === "history" ? "text-saffron-400" : "text-neutral-500"} />
                  <span>My Scans</span>
                </div>
                {activePage === "history" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-saffron-400" />
                )}
              </button>
            )}

            {userRole === "officer" && (
              <button
                type="button"
                onClick={() => handleNavClick("inspections")}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                  activePage === "inspections"
                    ? "bg-navy-900 text-white font-bold"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-navy-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText size={16} weight={activePage === "inspections" ? "bold" : "regular"} className={activePage === "inspections" ? "text-saffron-400" : "text-neutral-500"} />
                  <span>Inspection Ledger</span>
                </div>
                {activePage === "inspections" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-saffron-400" />
                )}
              </button>
            )}

            {userRole === "officer" && (
              <button
                type="button"
                onClick={() => handleNavClick("reports")}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                  activePage === "reports"
                    ? "bg-navy-900 text-white font-bold"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-navy-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <DownloadSimple size={16} weight={activePage === "reports" ? "bold" : "regular"} className={activePage === "reports" ? "text-saffron-400" : "text-neutral-500"} />
                  <span>Report Dockets</span>
                </div>
                {activePage === "reports" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-saffron-400" />
                )}
              </button>
            )}
          </nav>

          {/* Mobile Quick Scan CTA */}
          <Button
            variant="primary"
            size="md"
            onClick={() => handleNavClick("scanner")}
            icon={<Scan size={16} weight="bold" />}
            className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold shadow-xs text-xs"
          >
            Scan Product Now
          </Button>

          {/* Mobile Auth and Status */}
          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
            {isAuthenticated ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-2xs font-mono font-medium text-neutral-700 truncate">
                    {user?.badgeNumber || user?.email || "Authorized"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-neutral-300 text-neutral-700 hover:bg-neutral-100 flex items-center gap-1.5"
                >
                  <SignOut size={14} weight="bold" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold border border-navy-200 bg-navy-50 text-navy-900 hover:bg-navy-100 flex items-center justify-center gap-2 shadow-2xs"
              >
                <SignIn size={14} weight="bold" className="text-saffron-600" />
                <span>Sign In to Statutory Portal</span>
              </button>
            )}
          </div>

        </div>
      )}
    </header>
  );
};
