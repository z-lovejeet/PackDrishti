import React from "react";
import { House, Calendar, Plus, Barcode, BowlFood } from "@phosphor-icons/react";
import { useAuthStore } from "../../store/authStore";

interface BottomNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onOpenLogger: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activePage,
  onNavigate,
  onOpenLogger,
}) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return null;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg md:hidden pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
        {/* Dashboard */}
        <button
          type="button"
          onClick={() => onNavigate("dashboard")}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activePage === "dashboard"
              ? "text-slate-950 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
          aria-label="Dashboard"
        >
          <House size={22} weight={activePage === "dashboard" ? "fill" : "regular"} />
          <span className="text-[11px] leading-tight mt-0.5 tracking-tight">Dashboard</span>
        </button>

        {/* Fresh Food & Meal Scanner */}
        <button
          type="button"
          onClick={() => onNavigate("food")}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activePage === "food"
              ? "text-slate-950 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
          aria-label="Food & Meal Intelligence"
        >
          <BowlFood size={22} weight={activePage === "food" ? "fill" : "regular"} />
          <span className="text-[11px] leading-tight mt-0.5 tracking-tight">Food</span>
        </button>

        {/* Quick Log Action (Raised Button) */}
        <div className="flex flex-col items-center justify-center h-full">
          <button
            type="button"
            onClick={onOpenLogger}
            className="w-12 h-12 -mt-5 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-md border-4 border-white active:scale-95 transition-all hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            aria-label="Quick Log Food"
          >
            <Plus size={22} weight="bold" />
          </button>
          <span className="text-[11px] leading-tight mt-0.5 font-medium text-slate-700">Log</span>
        </div>

        {/* Packaged Food Scanner */}
        <button
          type="button"
          onClick={() => onNavigate("packaged")}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activePage === "packaged" || activePage === "health"
              ? "text-slate-950 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
          aria-label="Packaged Food Scanner"
        >
          <Barcode
            size={22}
            weight={activePage === "packaged" || activePage === "health" ? "fill" : "regular"}
          />
          <span className="text-[11px] leading-tight mt-0.5 tracking-tight">Packaged</span>
        </button>

        {/* Food Diary */}
        <button
          type="button"
          onClick={() => onNavigate("diary")}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activePage === "diary"
              ? "text-slate-950 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
          aria-label="Food Diary"
        >
          <Calendar size={22} weight={activePage === "diary" ? "fill" : "regular"} />
          <span className="text-[11px] leading-tight mt-0.5 tracking-tight">Diary</span>
        </button>
      </div>
    </nav>
  );
};
