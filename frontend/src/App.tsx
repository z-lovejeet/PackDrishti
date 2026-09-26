import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { ToastContainer, ToastMessage } from "./components/common/Toast";
import { AuthModal } from "./components/common/AuthModal";
import { useAuthStore } from "./store/authStore";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { PWAInstallPrompt } from "./components/common/PWAInstallPrompt";

// Consumer Pages
import { LandingPage } from "./pages/consumer/LandingPage";
import { HealthCheckPage } from "./pages/consumer/HealthCheckPage";
import { ProductHistoryPage } from "./pages/consumer/ProductHistoryPage";

const VALID_PAGES = [
  "landing",
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

      {/* Persistent Consumer Navbar */}
      <Navbar
        onNavigate={navigateTo}
        activePage={activePage}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <ErrorBoundary>
          {activePage === "landing" && (
            <LandingPage
              onNavigate={navigateTo}
            />
          )}

          {activePage === "health" && (
            <HealthCheckPage userRole={userRole} />
          )}

          {activePage === "history" && (
            <ProductHistoryPage
              onNavigateToHealth={() => navigateTo("health")}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Progressive Web App Install Banner */}
      <PWAInstallPrompt />

      {/* Consumer Platform Footer */}
      <Footer />
    </div>
  );
}

export default App;
