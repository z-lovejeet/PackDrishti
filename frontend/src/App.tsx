import React, { useState } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { ToastContainer, ToastMessage } from "./components/common/Toast";
import { GenerateReportModal } from "./components/reports/GenerateReportModal";
import { UserRole } from "./types";

// Consumer Pages
import { LandingPage } from "./pages/consumer/LandingPage";
import { ScannerPage } from "./pages/consumer/ScannerPage";
import { HealthCheckPage } from "./pages/consumer/HealthCheckPage";
import { ProductHistoryPage } from "./pages/consumer/ProductHistoryPage";

// Enforcement Officer Pages
import { OfficerDashboardPage } from "./pages/officer/OfficerDashboardPage";
import { InspectionsPage } from "./pages/officer/InspectionsPage";
import { ReportViewerPage } from "./pages/officer/ReportViewerPage";

export function App() {
  const [activePage, setActivePage] = useState<string>("landing");
  const [userRole, setUserRole] = useState<UserRole>("consumer");
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([
    {
      id: "init-toast",
      type: "info",
      title: "MetroScan Engine Ready",
      message: "Legal Metrology Rules 2011 rulebook loaded. Choose Consumer or Officer mode above.",
    }
  ]);

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

  const handleToggleUserRole = () => {
    if (userRole === "consumer") {
      setUserRole("officer");
      addToast("info", "Officer Mode Enabled", "Switched to Enforcement Officer jurisdiction view.");
      if (activePage === "health" || activePage === "history") {
        setActivePage("dashboard");
      }
    } else {
      setUserRole("consumer");
      addToast("info", "Consumer Mode Enabled", "Switched to Citizen retail & nutrition verification.");
      if (activePage === "dashboard" || activePage === "reports" || activePage === "inspections") {
        setActivePage("scanner");
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      {/* Toast Notification Queue */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Report Generator Modal */}
      <GenerateReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccessToast={() => addToast("success", "Statutory Report Generated", "Inspection certificate downloaded successfully.")}
      />

      {/* Adaptive Government Navbar */}
      <Navbar
        onNavigate={setActivePage}
        activePage={activePage}
        userRole={userRole}
        onToggleUserRole={handleToggleUserRole}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activePage === "landing" && (
          <LandingPage
            onNavigate={setActivePage}
            userRole={userRole}
            onSetUserRole={(role) => {
              setUserRole(role);
              addToast("info", role === "officer" ? "Officer Mode Active" : "Consumer Mode Active", "Interface adjusted for selected audience.");
            }}
          />
        )}

        {activePage === "scanner" && (
          <ScannerPage 
            userRole={userRole}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onNavigateToHealth={() => setActivePage("health")}
            onSaveToast={() => addToast("success", "Saved to Repository", "Product scan record archived in compliance history.")}
          />
        )}

        {activePage === "health" && (
          <HealthCheckPage />
        )}

        {activePage === "history" && (
          <ProductHistoryPage
            onNavigateToScanner={() => setActivePage("scanner")}
            onNavigateToHealth={() => setActivePage("health")}
          />
        )}

        {activePage === "dashboard" && (
          <OfficerDashboardPage
            onNavigate={setActivePage}
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
      </main>

      {/* Statutory Footer */}
      <Footer />
    </div>
  );
}

export default App;
