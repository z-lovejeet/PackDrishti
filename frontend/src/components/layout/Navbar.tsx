import React, { useState } from "react";
import { List, X, Flame, Plus } from "@phosphor-icons/react";
import { Button } from "../common/Button";
import { useAuthStore } from "../../store/authStore";
import { useDiaryStore } from "../../store/useDiaryStore";
import { useProfileStore } from "../../store/useProfileStore";

interface NavbarProps {
  onNavigate: (page: string) => void;
  activePage: string;
  onOpenAuthModal?: () => void;
  onOpenLogger?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  activePage,
  onOpenAuthModal,
  onOpenLogger,
}) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { diary } = useDiaryStore();
  const { budget } = useProfileStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  const consumedCalories = diary?.totalsConsumed?.calories ?? 0;
  const targetCalories = budget?.targetCalories ?? diary?.budget?.targetCalories ?? 2000;
  const calPercent = Math.min(100, Math.round((consumedCalories / Math.max(1, targetCalories)) * 100));

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
              Clinical Nutrition Engine &amp; AI Food Intelligence
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
        <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => handleNavClick("landing")}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activePage === "landing"
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => handleNavClick("dashboard")}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activePage === "dashboard"
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => handleNavClick("diary")}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activePage === "diary"
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            Food Diary
          </button>

          <button
            type="button"
            onClick={() => handleNavClick("packaged")}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activePage === "packaged" || activePage === "health"
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            Food Scanner
          </button>

          <button
            type="button"
            onClick={() => handleNavClick("profile")}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activePage === "profile"
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            Profile
          </button>
        </nav>

        {/* Right Section: Calorie Pill, Quick Log CTA, Auth Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Live Calorie Budget Indicator (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-2xs font-mono">
            <Flame size={15} weight="fill" className="text-amber-500 shrink-0" />
            <span className="font-semibold text-slate-800">
              {consumedCalories.toLocaleString()}
            </span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500">
              {targetCalories.toLocaleString()} kcal
            </span>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden ml-1">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${calPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Log Button (Desktop) */}
          {onOpenLogger && (
            <button
              type="button"
              onClick={onOpenLogger}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs cursor-pointer"
              title="Log food item"
            >
              <Plus size={14} weight="bold" />
              <span>Log Food</span>
            </button>
          )}

          {/* Authentication Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleNavClick("profile")}
                className="hidden xl:flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-800 px-2.5 py-1 rounded-md text-2xs font-mono hover:bg-slate-100 transition-colors"
                title="View Profile Settings"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-medium max-w-[120px] truncate">
                  {user?.fullName || user?.email?.split("@")[0] || "Citizen"}
                </span>
              </button>

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
              title="Sign in to save diary history"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
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
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-dropdown animate-fadeIn">
          <nav className="space-y-1">
            <span className="text-2xs uppercase font-mono font-medium text-slate-500 block mb-1.5">
              Navigation
            </span>

            <button
              type="button"
              onClick={() => handleNavClick("dashboard")}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                activePage === "dashboard"
                  ? "bg-slate-900 text-white font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>Dashboard</span>
              {activePage === "dashboard" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("diary")}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                activePage === "diary"
                  ? "bg-slate-900 text-white font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>Food Diary</span>
              {activePage === "diary" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("packaged")}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                activePage === "packaged" || activePage === "health"
                  ? "bg-slate-900 text-white font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>Food Scanner</span>
              {(activePage === "packaged" || activePage === "health") && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("profile")}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                activePage === "profile"
                  ? "bg-slate-900 text-white font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>Profile Settings</span>
              {activePage === "profile" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("landing")}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                activePage === "landing"
                  ? "bg-slate-900 text-white font-semibold"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>Overview &amp; Features</span>
              {activePage === "landing" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </button>
          </nav>

          {/* Mobile Auth and Action */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            {onOpenLogger && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenLogger();
                }}
                className="w-full text-xs font-semibold justify-center py-2 bg-emerald-600 hover:bg-emerald-700"
              >
                Log Food Entry
              </Button>
            )}

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
                Sign Out ({user?.fullName || "Citizen"})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
