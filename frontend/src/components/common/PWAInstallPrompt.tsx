import React, { useState, useEffect } from 'react';
import { 
  DownloadSimple, 
  X, 
  DeviceMobile, 
  CheckCircle,
  ShareNetwork,
  PlusSquare
} from '@phosphor-icons/react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already installed/running in standalone mode
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;

    if (isRunningStandalone) {
      setIsStandalone(true);
      return;
    }

    // Check iOS detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Check if dismissed recently in localStorage
    const dismissedUntil = localStorage.getItem('packdrashiti_pwa_dismissed');
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    // Handler for Android / Chromium browsers
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // On iOS, if not standalone and not dismissed, show prompt after 5 seconds
    if (isIosDevice && !isRunningStandalone) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Suppress prompt for 7 days
    localStorage.setItem('packdrashiti_pwa_dismissed', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
  };

  if (isStandalone || !isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-200"
      role="region"
      aria-label="App Installation Prompt"
    >
      <div className="bg-navy-950 text-white p-4 rounded-xl shadow-2xl border border-navy-800 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-saffron-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm font-bold">
              <DeviceMobile size={22} weight="fill" />
            </div>
            <div>
              <h4 className="text-sm font-bold font-heading text-white">
                Install PackDrashiti App
              </h4>
              <p className="text-2xs text-slate-300">
                Fast mobile scanning, camera access, and offline health checks
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-7 h-7 rounded-full bg-navy-900 hover:bg-navy-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="Dismiss installation prompt"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {isIOS ? (
          <div className="bg-navy-900/90 rounded-lg p-2.5 text-2xs text-slate-200 space-y-1.5 border border-navy-800">
            <div className="flex items-center gap-1.5 text-saffron-400 font-semibold">
              <ShareNetwork size={14} weight="bold" />
              <span>How to install on iPhone / iPad:</span>
            </div>
            <p className="leading-relaxed">
              Tap the <strong className="text-white">Share</strong> button at the bottom of Safari, then tap <strong className="text-white">Add to Home Screen</strong> <PlusSquare size={12} className="inline ml-0.5 text-white" />.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg bg-saffron-500 hover:bg-saffron-600 text-slate-950 font-bold text-xs transition-colors shadow-sm"
            >
              <DownloadSimple size={16} weight="bold" />
              <span>Install to Home Screen</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="py-2 px-3 rounded-lg bg-navy-900 hover:bg-navy-800 text-slate-300 text-xs transition-colors"
            >
              Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
