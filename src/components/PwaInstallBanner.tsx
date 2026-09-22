'use client';
import React, { useState, useEffect } from 'react';
import { Camera, X, Download, Share2, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  const [isDismissed, setIsDismissed] = useState(() => {
    try { if (typeof window === 'undefined') return false;
      return localStorage.getItem('mtshoots_pwa_dismissed') === 'true'; } catch { return false; }
  });

  const isIos = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  useEffect(() => {
    // Check if already in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isDismissed) {
        // Show after a brief delay so page loads smoothly first
        setTimeout(() => setIsVisible(true), 1500);
      }
    };

    const handleManualOpen = () => {
      setIsVisible(true);
      setShowIosGuide(isIos);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('open-pwa-install', handleManualOpen);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setTimeout(() => setIsVisible(false), 2500);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('open-pwa-install', handleManualOpen);
    };
  }, [isDismissed, isIos]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch {
        // Handled gracefully
      }
      setIsInstalling(false);
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // Browser doesn't support beforeinstallprompt yet or already triggered
      alert('To install MTShoots: Open your browser menu (⋮) and select "Install App" or "Add to Home screen".');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    try { localStorage.setItem('mtshoots_pwa_dismissed', 'true'); } catch {}
  };

  if (!isVisible && !showIosGuide) return null;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        aria-label="Install MTShoots on Mobile"
        className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-white/98 backdrop-blur-xl rounded-2xl p-5 border-2 border-[#E7E1DA] shadow-2xl"
      >
        <div className="flex items-start gap-3.5">
          {/* Terracotta Camera Badge */}
          <div className="w-11 h-11 rounded-xl bg-[#C85A32] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#C85A32]/25">
            <Camera className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Title & Close */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-serif text-base font-bold text-[#181615] leading-snug">
                {isInstalled ? 'MTShoots App Installed!' : 'Install MTShoots on Mobile'}
              </h4>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-[#8a726a] hover:text-[#181615] p-1 -mr-1.5 -mt-1 cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-[#57423b] mt-1 leading-relaxed">
              {isInstalled
                ? 'App is added to your home screen with offline sync ready.'
                : 'Add MTShoots to your mobile home screen for immediate offline call sheet access on shoot day.'}
            </p>

            {/* iOS Safari Installation Steps */}
            {showIosGuide && (
              <div className="mt-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA] text-xs text-[#181615] space-y-1.5">
                <div className="font-semibold text-[#C85A32] flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" /> For iPhone &amp; iPad:
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#57423b]">
                  1. Tap the <Share2 className="w-3.5 h-3.5 text-[#C85A32] inline" /> <strong>Share</strong> button in Safari toolbar
                </div>
                <div className="text-[11px] text-[#57423b]">
                  2. Scroll down and tap <strong>Add to Home Screen</strong>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!isInstalled && (
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="px-4 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B24E2A] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#C85A32]/25 flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isInstalling ? 'Installing...' : 'ADD TO HOMESCREEN'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-xs font-semibold text-[#8a726a] hover:text-[#181615] transition-colors cursor-pointer py-2 px-1"
                >
                  Maybe Later
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};
