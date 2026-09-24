'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from '@/context/AppContext';
import { useLocation } from '@/lib/navigation';
import { PwaNav } from '@/components/PwaNav';
import { PwaInstallBanner } from '@/components/PwaInstallBanner';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { LocationPickerModal } from '@/components/LocationPickerModal';
import { BookingSheetModal } from '@/components/BookingSheetModal';
import { loadPhotographers } from '@/lib/supabase';
import { Photographer } from '@/types';
import { ApertureLoader } from '@/components/ApertureLoader';
import { PwaVideoSplash } from '@/components/PwaVideoSplash';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function InnerShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const isPolicyPage = pathname === '/privacy' || pathname === '/terms' || pathname === '/cancellation';
  const [photographersList, setPhotographersList] = useState<Photographer[]>([]);

  useEffect(() => {
    loadPhotographers().then(remote => {
      if (remote) setPhotographersList(remote);
    }).catch(() => {});
  }, []);

  const {
    bookings,
    shortlistIds,
    selectedCity,
    showLocationPicker,
    setShowLocationPicker,
    isBookingModalOpen,
    setIsBookingModalOpen,
    bookingConfig,
    setBookingConfig,
    openNewBooking,
    toastMessage,
    handleConfirmBooking,
    handleLocationSelect,
  } = useApp();

  const [showPwaSplash, setShowPwaSplash] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // Check if running in PWA standalone display mode on first launch
    const isPwa =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://') ||
        window.location.search.includes('mode=pwa') ||
        window.location.search.includes('pwa=true'));

    const hasLaunched =
      typeof window !== 'undefined' ? sessionStorage.getItem('mtshoots_pwa_launched') : null;

    if (isPwa && !hasLaunched) {
      setShowPwaSplash(true);
      setIsAppLoading(false);
    } else {
      setShowPwaSplash(false);
      const timer = setTimeout(() => setIsAppLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleOpenLoc = () => setShowLocationPicker(true);
    window.addEventListener('open-location-picker', handleOpenLoc);

    const hasCity = localStorage.getItem('mtshoots_city');
    if (!hasCity && !isPolicyPage) {
      setTimeout(() => setShowLocationPicker(true), 1200);
    }

    return () => {
      window.removeEventListener('open-location-picker', handleOpenLoc);
    };
  }, [setShowLocationPicker, isPolicyPage]);

  if (showPwaSplash) {
    return (
      <PwaVideoSplash
        videoSrc="/promo.mp4"
        durationSeconds={6.5}
        onComplete={() => {
          try {
            sessionStorage.setItem('mtshoots_pwa_launched', 'true');
          } catch {}
          setShowPwaSplash(false);
        }}
      />
    );
  }

  if (isAppLoading) {
    return (
      <div className="fixed inset-0 bg-[#FAF8F5] flex flex-col items-center justify-center gap-6 z-[100]">
        <ApertureLoader size="lg" label="Loading MTShoots..." />
        <div className="text-center">
          <p className="font-serif text-xl font-bold text-[#181615]">MTShoots</p>
          <p className="text-xs text-[#8a726a]">India's Verified Photography Network</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181615] selection:bg-[#C85A32]/20 selection:text-[#C85A32]">
      {children}

      {/* Global PWA Mobile Bottom Nav */}
      <PwaNav
        bookingCount={bookings.length}
        shortlistCount={shortlistIds.length}
        onOpenNewBooking={openNewBooking}
      />

      {/* Global PWA Install Banner */}
      {!isPolicyPage && <PwaInstallBanner />}

      {/* Floating Scroll To Top Button */}
      <ScrollToTopButton />

      {/* Location Picker Modal */}
      {showLocationPicker && !isPolicyPage && (
        <LocationPickerModal
          onSelect={handleLocationSelect}
          onDismiss={() => setShowLocationPicker(false)}
          initialCity={selectedCity}
        />
      )}

      {/* Global Booking Modal */}
      {isBookingModalOpen && (
        <BookingSheetModal
          initialConfig={bookingConfig}
          photographers={photographersList}
          onClose={() => {
            setIsBookingModalOpen(false);
            setBookingConfig(null);
          }}
          onConfirmBooking={handleConfirmBooking}
        />
      )}

      {/* Global Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            className="fixed top-20 right-4 z-[200] bg-[#181615] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#dec0b7]/30 flex items-center space-x-2.5 max-w-xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#4A7C59] shrink-0" />
            <span className="text-xs font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AppProvider>
        <React.Suspense fallback={<ApertureLoader />}>
          <InnerShell>{children}</InnerShell>
        </React.Suspense>
      </AppProvider>
    </ErrorBoundary>
  );
}
