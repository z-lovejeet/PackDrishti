import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/layout/Navbar";
import { BottomNav } from "./components/layout/BottomNav";
import { Footer } from "./components/layout/Footer";
import { ToastContainer, ToastMessage } from "./components/common/Toast";
import { AuthModal } from "./components/common/AuthModal";
import { useAuthStore } from "./store/authStore";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { PWAInstallPrompt } from "./components/common/PWAInstallPrompt";

// Consumer Pages
import { LandingPage } from "./pages/consumer/LandingPage";
import { DashboardPage } from "./pages/consumer/DashboardPage";
import { DiaryPage } from "./pages/consumer/DiaryPage";
import { FoodPage } from "./pages/consumer/FoodPage";
import { PackagedAuditResultPage } from "./pages/consumer/PackagedAuditResultPage";
import { ProfileSettingsPage } from "./pages/consumer/ProfileSettingsPage";
import { HealthCheckPage } from "./pages/consumer/HealthCheckPage";
import { ProductHistoryPage } from "./pages/consumer/ProductHistoryPage";

// Interactive Modals
import { FoodLoggerModal } from "./components/diary/FoodLoggerModal";
import { PlateReviewModal } from "./components/meals/PlateReviewModal";

// Types
import { PlateAnalysisData, PackagedAuditResultData } from "./types/models";

const VALID_PAGES = [
  "landing",
  "dashboard",
  "diary",
  "food",
  "packaged",
  "packaged-result",
  "profile",
  "health",
  "history",
] as const;

type PageKey = typeof VALID_PAGES[number];

const parseHashPage = (): PageKey => {
  if (typeof window === "undefined") return "landing";
  const hash = window.location.hash.replace(/^#\/?/, "").trim().toLowerCase();
  if (VALID_PAGES.includes(hash as PageKey)) {
    return hash as PageKey;
  }
  return "landing";
};

export function App() {
  const [activePage, setActivePage] = useState<string>(() => parseHashPage());
  const { role: userRole } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Food Logger & Review Modals State
  const [isLoggerOpen, setIsLoggerOpen] = useState<boolean>(false);
  const [loggerInitialSlot, setLoggerInitialSlot] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >("breakfast");
  const [isPlateReviewOpen, setIsPlateReviewOpen] = useState<boolean>(false);
  const [plateAnalysisData, setPlateAnalysisData] = useState<PlateAnalysisData | null>(null);
  const [packagedAuditResult, setPackagedAuditResult] = useState<PackagedAuditResultData | null>(null);

  const addToast = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string
  ) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateTo = useCallback((page: string) => {
    if (VALID_PAGES.includes(page as PageKey)) {
      setActivePage(page);
      if (window.location.hash !== `#${page}`) {
        window.location.hash = page;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Synchronize with URL hash changes (browser back/forward, direct bookmarked links)
  useEffect(() => {
    const handleHashChange = () => {
      const pageFromHash = parseHashPage();
      setActivePage(pageFromHash);
    };

    const initialHash = window.location.hash.replace(/^#\/?/, "").trim().toLowerCase();
    if (!VALID_PAGES.includes(initialHash as PageKey)) {
      window.location.hash = activePage;
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [activePage]);

  // Modal Handlers
  const handleOpenLogger = (slot?: "breakfast" | "lunch" | "dinner" | "snack") => {
    if (slot) {
      setLoggerInitialSlot(slot);
    }
    setIsLoggerOpen(true);
  };

  const handlePlateScanned = (analysis: PlateAnalysisData) => {
    setPlateAnalysisData(analysis);
    setIsPlateReviewOpen(true);
  };

  const handlePackagedScanned = (audit: PackagedAuditResultData) => {
    setPackagedAuditResult(audit);
    navigateTo("packaged-result");
  };

  const handlePlateConfirmed = (mealType: string, count: number) => {
    addToast(
      "success",
      "Plate Logged",
      `Successfully committed ${count} items to ${mealType.toUpperCase()} diary.`
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900">
      {/* Toast Notification Queue */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Consumer Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(msg) => addToast("success", "Authentication", msg)}
      />

      {/* Unified Food Logger Modal */}
      <FoodLoggerModal
        isOpen={isLoggerOpen}
        initialSlot={loggerInitialSlot}
        onClose={() => setIsLoggerOpen(false)}
        onPlateScanned={handlePlateScanned}
        onPackagedScanned={handlePackagedScanned}
        onSuccessToast={(title, msg) => addToast("success", title, msg)}
      />

      {/* Plate Segmentation Review Modal */}
      <PlateReviewModal
        isOpen={isPlateReviewOpen}
        analysisData={plateAnalysisData}
        initialSlot={loggerInitialSlot}
        onClose={() => setIsPlateReviewOpen(false)}
        onConfirmed={handlePlateConfirmed}
      />

      {/* Persistent Consumer Navbar */}
      <Navbar
        onNavigate={navigateTo}
        activePage={activePage}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenLogger={() => handleOpenLogger()}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <ErrorBoundary>
          {activePage === "landing" && (
            <LandingPage onNavigate={navigateTo} />
          )}

          {activePage === "dashboard" && (
            <DashboardPage
              onNavigate={navigateTo}
              onOpenLogger={handleOpenLogger}
            />
          )}

          {activePage === "diary" && (
            <DiaryPage
              onNavigate={navigateTo}
              onOpenLogger={handleOpenLogger}
            />
          )}

          {activePage === "food" && (
            <FoodPage
              onNavigate={navigateTo}
              onSuccessToast={(title, msg) => addToast("success", title, msg)}
            />
          )}

          {(activePage === "packaged" || activePage === "health") && (
            <HealthCheckPage userRole={userRole} onNavigate={navigateTo} />
          )}

          {activePage === "packaged-result" && (
            <PackagedAuditResultPage
              auditData={packagedAuditResult}
              onNavigate={navigateTo}
              onSuccessToast={(title, msg) => addToast("success", title, msg)}
            />
          )}

          {activePage === "profile" && (
            <ProfileSettingsPage
              onNavigate={navigateTo}
              onSuccessToast={(title, msg) => addToast("success", title, msg)}
            />
          )}

          {activePage === "history" && (
            <ProductHistoryPage
              onNavigateToHealth={() => navigateTo("packaged")}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <BottomNav
        activePage={activePage}
        onNavigate={navigateTo}
        onOpenLogger={() => handleOpenLogger()}
      />

      {/* Progressive Web App Install Banner */}
      <PWAInstallPrompt />

      {/* Consumer Platform Footer */}
      <Footer />
    </div>
  );
}

export default App;
