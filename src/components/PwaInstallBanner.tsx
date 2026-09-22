'use client';
import React, { useState, useEffect } from 'react';
import { Download, X, Share2, Smartphone, Star, ShieldCheck, Check, Sparkles } from 'lucide-react';
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
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    if (
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone)
    ) {
      setIsInstalled(true);
      return;
    }

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const iosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const androidDevice = /Android/.test(ua);
    const isMobile = iosDevice || androidDevice || (typeof window !== 'undefined' && window.innerWidth < 768);

    setIsIos(iosDevice);
    setIsAndroid(androidDevice);

    // Register beforeinstallprompt event for Chrome / Edge
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Manual trigger from navbar or anywhere
    const handleManualOpen = () => {
      setIsVisible(true);
    };
    window.addEventListener('open-pwa-install', handleManualOpen);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setTimeout(() => setIsVisible(false), 2500);
    });

    // On mobile devices, show the install popup automatically after a 1.2s welcoming delay
    let timer: NodeJS.Timeout;
    if (isMobile) {
      const dismissedRecently = sessionStorage.getItem('mtshoots_pwa_dismissed_session');
      if (!dismissedRecently) {
        timer = setTimeout(() => {
          setIsVisible(true);
        }, 1200);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('open-pwa-install', handleManualOpen);
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
          setIsInstalled(true);
          setIsVisible(false);
        }
      } catch {}
      setIsInstalling(false);
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowInstructions(true);
    } else {
      // Android or other mobile where beforeinstallprompt already fired or needs instructions
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowInstructions(false);
    sessionStorage.setItem('mtshoots_pwa_dismissed_session', 'true');
  };

  if (!isVisible && !showInstructions) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          role="dialog"
          aria-label="Download MTShoots PWA App"
          className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-[#E7E1DA] overflow-hidden"
        >
          {/* Header row with App Icon, Info & Close button */}
          <div className="flex items-start gap-4">
            {/* High-Resolution App Icon */}
            <div className="relative shrink-0">
              <img
                src="/icons/icon-192.png"
                alt="MTShoots App Icon"
                className="w-16 h-16 rounded-2xl shadow-md ring-2 ring-[#C85A32]/25 object-cover bg-[#181615]"
                onError={(e) => {
                  // Fallback to favicon
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Verified App">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            </div>

            {/* App Title & Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-[#C85A32] mb-0.5">
                    <Sparkles className="w-3 h-3" />
                    <span>Official Mobile App</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#181615] leading-tight">
                    MTShoots
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

              {/* Rating & Category */}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center text-amber-500 text-xs">
                  <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                  <span className="font-bold ml-1 text-[#181615]">4.9</span>
                </div>
                <span className="text-[#8a726a] text-xs">•</span>
                <span className="text-xs text-[#8a726a]">Photography & Shoots</span>
              </div>
            </div>
          </div>

          {/* Value Prop Features */}
          <div className="mt-4 p-3 bg-[#FAF8F5] rounded-2xl border border-[#E7E1DA] space-y-1.5 text-xs text-[#57423b]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Instant 1-tap launch from your phone home screen</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
              <span>Offline access to call sheets and booking details</span>
            </div>
          </div>

          {/* Installation Instructions for iOS / Android */}
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-3.5 rounded-2xl bg-[#FFF6F3] border border-[#FADCD1] text-xs text-[#181615] space-y-2"
            >
              {isIos ? (
                <>
                  <div className="font-bold text-[#C85A32] flex items-center gap-1.5 text-xs">
                    <Share2 className="w-3.5 h-3.5" /> How to install on iPhone / iPad:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#57423b]">
                    <li>Tap the <strong>Share</strong> icon in the bottom Safari toolbar</li>
                    <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
                    <li>Tap <strong>Add</strong> in top right corner</li>
                  </ol>
                </>
              ) : (
                <>
                  <div className="font-bold text-[#C85A32] flex items-center gap-1.5 text-xs">
                    <Download className="w-3.5 h-3.5" /> How to install on Android:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#57423b]">
                    <li>Tap the Chrome menu (<strong>⋮</strong> three dots) at the top right</li>
                    <li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong></li>
                    <li>Confirm installation to get the app icon</li>
                  </ol>
                </>
              )}
            </motion.div>
          )}

          {/* Actions */}
          <div className="mt-5 flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="flex-1 py-3 px-4 rounded-xl bg-[#C85A32] hover:bg-[#B24E2A] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#C85A32]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isInstalling ? 'Installing...' : 'Install App'}</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="py-3 px-4 rounded-xl border border-[#E7E1DA] hover:bg-[#FAF8F5] text-xs font-bold text-[#8a726a] hover:text-[#181615] transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};