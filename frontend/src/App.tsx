import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { ToastContainer, ToastMessage } from "./components/common/Toast";
import { GenerateReportModal } from "./components/reports/GenerateReportModal";
import { AuthModal } from "./components/common/AuthModal";
import { useAuthStore } from "./store/authStore";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { PWAInstallPrompt } from "./components/common/PWAInstallPrompt";

// Consumer Pages
import { LandingPage } from "./pages/consumer/LandingPage";
import { ScannerPage } from "./pages/consumer/ScannerPage";
import { HealthCheckPage } from "./pages/consumer/HealthCheckPage";
import { ProductHistoryPage } from "./pages/consumer/ProductHistoryPage";

// Enforcement Officer Pages
import { OfficerDashboardPage } from "./pages/officer/OfficerDashboardPage";
import { InspectionsPage } from "./pages/officer/InspectionsPage";
import { ReportViewerPage } from "./pages/officer/ReportViewerPage";

const VALID_PAGES = [
  "landing",
  "scanner",
  "health",
  "history",
  "dashboard",
  "inspections",
  "reports"
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
  const { role: userRole, setRole: setUserRole } = useAuthStore();
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: "success" | "error" | "warning" | "info", title: string, message: string) => {
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

  // Restrict scanner to officer role; redirect consumer to health check
  useEffect(() => {
    if (userRole === "consumer" && activePage === "scanner") {
      navigateTo("health");
    }
  }, [userRole, activePage, navigateTo]);

  const handleToggleUserRole = () => {
    if (userRole === "consumer") {
      setUserRole("officer");
      addToast("info", "Officer Mode Enabled", "Switched to Enforcement Officer jurisdiction view.");
      if (activePage === "health" || activePage === "history") {
        navigateTo("dashboard");
      }
    } else {
      setUserRole("consumer");
      addToast("info", "Consumer Mode Enabled", "Switched to Citizen retail and nutrition verification.");
      if (activePage === "dashboard" || activePage === "reports" || activePage === "inspections" || activePage === "scanner") {
        navigateTo("health");
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900">
      {/* Toast Notification Queue */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Report Generator Modal */}
      <GenerateReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccessToast={() => addToast("success", "Statutory Report Generated", "Inspection certificate downloaded successfully.")}
      />

      {/* Authentication and Role Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(msg) => addToast("success", "Authentication", msg)}
      />

      {/* Persistent Government Shell Navbar */}
      <Navbar
        onNavigate={navigateTo}
        activePage={activePage}
        userRole={userRole}
        onToggleUserRole={handleToggleUserRole}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <ErrorBoundary>
          {activePage === "landing" && (
            <LandingPage
              onNavigate={navigateTo}
              userRole={userRole}
              onSetUserRole={(role) => {
                setUserRole(role);
                addToast(
                  "info", 
                  role === "officer" ? "Officer Mode Active" : "Consumer Mode Active", 
                  "Interface adjusted for selected audience."
                );
              }}
            />
          )}

          {activePage === "scanner" && (
            <ScannerPage 
              userRole={userRole}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onNavigateToHealth={() => navigateTo("health")}
              onSaveToast={() => addToast("success", "Saved to Repository", "Product scan record archived in compliance history.")}
            />
          )}

          {activePage === "health" && (
            <HealthCheckPage userRole={userRole} />
          )}

          {activePage === "history" && (
            <ProductHistoryPage
              onNavigateToScanner={() => navigateTo("health")}
              onNavigateToHealth={() => navigateTo("health")}
            />
          )}

          {activePage === "dashboard" && (
            <OfficerDashboardPage
              onNavigate={navigateTo}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          )}

          {activePage === "inspections" && (
            <InspectionsPage />
          )}

          {activePage === "reports" && (
            <ReportViewerPage
              onOpenNewReportModal={() => setIsReportModalOpen(true)}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Progressive Web App Install Banner */}
      <PWAInstallPrompt />

      {/* Statutory Government Footer */}
      <Footer />
    </div>
  );
}

export default App;
