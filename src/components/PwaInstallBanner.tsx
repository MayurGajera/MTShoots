'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Check, Smartphone, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installNote, setInstallNote] = useState<string | null>(null);

  useEffect(() => {
    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(isIosDevice);

    // Check if already in standalone (installed) mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    // Listen for browser native install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Show popup on launch time (after 1.2s welcoming delay) if not dismissed recently
    const dismissedRecently = sessionStorage.getItem('mtshoots_pwa_dismissed');
    let timer: NodeJS.Timeout;
    if (!dismissedRecently) {
      timer = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsVisible(false);
          sessionStorage.setItem('mtshoots_pwa_dismissed', 'true');
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      } finally {
        setIsInstalling(false);
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      setInstallNote("Tap Safari's Share button and choose 'Add to Home Screen' to install.");
    } else {
      setInstallNote("Tap your browser's menu (three dots) and select 'Install app'.");
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('mtshoots_pwa_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          role="dialog"
          aria-label="Install MTShoots App"
          className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#E7E1DA] overflow-hidden"
        >
          {/* Header row with App Icon, Info & Close button */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img
                src="/icons/icon-192.png"
                alt="MTShoots App"
                className="w-14 h-14 rounded-2xl shadow-md ring-2 ring-[#C85A32]/25 object-cover bg-[#181615]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-[#C85A32] mb-0.5">
                    <Sparkles className="w-3 h-3" />
                    <span>Quick Mobile Access</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#181615] leading-tight">
                    Install MTShoots
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleDismiss}
                  aria-label="Close"
                  className="w-7 h-7 rounded-full bg-[#FAF8F5] hover:bg-[#F4EFEB] flex items-center justify-center text-[#8a726a] hover:text-[#181615] transition-colors -mr-1 -mt-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#8a726a] mt-0.5">
                Fast, 1-tap bookings and portfolio previews on your home screen.
              </p>
            </div>
          </div>

          {/* Simple Note if browser doesn't support direct JS prompt */}
          {installNote && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-2.5 rounded-xl bg-[#FFF6F3] border border-[#FADCD1] text-xs font-medium text-[#C85A32] text-center"
            >
              {installNote}
            </motion.div>
          )}

          {/* Actions */}
          <div className="mt-5 flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#C85A32] hover:bg-[#B24E2A] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#C85A32]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isInstalling ? 'Starting Installation...' : 'Install App'}</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="py-2.5 px-4 rounded-xl border border-[#E7E1DA] hover:bg-[#FAF8F5] text-xs font-semibold text-[#8a726a] hover:text-[#181615] transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
