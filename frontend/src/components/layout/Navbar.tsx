import React from "react";
import { 
  ShieldCheck, 
  Scan, 
  Heartbeat, 
  FileText, 
  Archive, 
  SquaresFour, 
  DownloadSimple, 
  ArrowRight,
  User,
  IdentificationCard,
  ArrowsLeftRight
} from "@phosphor-icons/react";
import { Button } from "../common/Button";
import { UserRole } from "../../types";

interface NavbarProps {
  onNavigate: (page: string) => void;
  activePage: string;
  userRole: UserRole;
  onToggleUserRole: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  activePage,
  userRole,
  onToggleUserRole,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      {/* Official Government Ministry Banner */}
      <div className="bg-[#0F3A4C] text-white text-[11px] py-1 px-4 sm:px-8 flex justify-between items-center border-b border-[#164D66]">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wide">MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION</span>
          <span className="text-neutral-400 hidden sm:inline">•</span>
          <span className="text-neutral-300 hidden sm:inline">Department of Consumer Affairs (Legal Metrology Division)</span>
        </div>
        
        <div className="flex items-center gap-3 text-neutral-300">
          <span className="hover:text-white cursor-pointer transition-colors">English</span>
          <span>|</span>
          <span className="hover:text-white cursor-pointer transition-colors font-medium">हिन्दी</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div 
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-3 cursor-pointer select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-[6px] bg-primary flex items-center justify-center text-white shadow-xs">
            <ShieldCheck size={26} weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-neutral-900 tracking-tight font-heading">MetroScan</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary-light text-primary border border-primary-border">
                LMPC 2011
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">Compliance Checking System</p>
          </div>
        </div>

        {/* Adaptive Role Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => onNavigate("landing")}
            className={`px-2.5 py-2 rounded-[6px] transition-colors whitespace-nowrap ${
              activePage === "landing"
                ? "bg-primary-light text-primary font-bold"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            Overview
          </button>

          {userRole === "officer" && (
            <button
              onClick={() => onNavigate("dashboard")}
              className={`px-2.5 py-2 rounded-[6px] transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activePage === "dashboard"
                  ? "bg-primary-light text-primary font-bold"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              <SquaresFour size={16} />
              <span>Officer Dashboard</span>
            </button>
          )}

          <button
            onClick={() => onNavigate("scanner")}
            className={`px-2.5 py-2 rounded-[6px] transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activePage === "scanner"
                ? "bg-primary-light text-primary font-bold"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            <Scan size={16} />
            <span>{userRole === "officer" ? "Field Scanner" : "Label Scanner"}</span>
          </button>

          {userRole === "consumer" && (
            <button
              onClick={() => onNavigate("health")}
              className={`px-2.5 py-2 rounded-[6px] transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activePage === "health"
                  ? "bg-primary-light text-primary font-bold"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              <Heartbeat size={16} />
              <span>Health Check</span>
            </button>
          )}

          {userRole === "consumer" && (
            <button
              onClick={() => onNavigate("history")}
              className={`px-2.5 py-2 rounded-[6px] transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activePage === "history"
                  ? "bg-primary-light text-primary font-bold"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              <Archive size={16} />
              <span>My Scans</span>
            </button>
          )}

          {userRole === "officer" && (
            <button
              onClick={() => onNavigate("inspections")}
              className={`px-2.5 py-2 rounded-[6px] transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activePage === "inspections"
                  ? "bg-primary-light text-primary font-bold"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              <FileText size={16} />
              <span>Inspection Ledger</span>
            </button>
          )}

          {userRole === "officer" && (
            <button
              onClick={() => onNavigate("reports")}
              className={`px-2.5 py-2 rounded-[6px] transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activePage === "reports"
                  ? "bg-primary-light text-primary font-bold"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              <DownloadSimple size={16} />
              <span>Report Dockets</span>
            </button>
          )}
        </nav>

        {/* Right Role Switcher & Action CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Quick Role Toggle Pill */}
          <button
            onClick={onToggleUserRole}
            className={`px-2.5 py-1.5 rounded-[6px] text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              userRole === "officer"
                ? "bg-[#0F3A4C] text-white border-[#0F3A4C] shadow-xs"
                : "bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50"
            }`}
            title="Click to switch between Consumer and Enforcement Officer views"
          >
            {userRole === "officer" ? (
              <>
                <IdentificationCard size={15} weight="bold" />
                <span className="hidden md:inline">Officer Mode</span>
              </>
            ) : (
              <>
                <User size={15} weight="bold" />
                <span className="hidden md:inline">Consumer Mode</span>
              </>
            )}
            <ArrowsLeftRight size={13} className="text-neutral-400 ml-0.5" />
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate("scanner")}
            icon={<Scan size={15} />}
            className="hidden sm:inline-flex"
          >
            Scan Product
          </Button>
        </div>

      </div>
    </header>
  );
};
