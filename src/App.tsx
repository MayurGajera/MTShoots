import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LandingPage } from './pages/LandingPage';
import { PhotographersPage } from './pages/PhotographersPage';
import { PhotographerProfilePage } from './pages/PhotographerProfilePage';
import { BookingsPage } from './pages/BookingsPage';
import { SavedPage } from './pages/SavedPage';
import { AuthPage } from './pages/AuthPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { CancellationPage } from './pages/CancellationPage';
import { PhotographerApplyPage } from './pages/PhotographerApplyPage';
import { PwaNav } from './components/PwaNav';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { BookingSheetModal } from './components/BookingSheetModal';
import { LocationPickerModal } from './components/LocationPickerModal';
import { ScrollToTop } from './components/ScrollToTop';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { ApertureLoader } from './components/ApertureLoader';
import { INITIAL_BOOKINGS } from './data/photographers';
import { BookingRequest, Photographer, ShootDurationType, UsageRightsTier } from './types';
import { isSupabaseConfigured, saveBookingToSupabase, loadPhotographers } from './lib/supabase';
import { useScrollLock } from './hooks/useScrollLock';

// Page transitions variant
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = { duration: 0.28, ease: 'easeInOut' as const };

function AnimatedRoutes({
  bookings, setBookings, shortlistIds, setShortlistIds,
  onOpenBooking, openNewBooking
}: {
  bookings: BookingRequest[];
  setBookings: (b: BookingRequest[]) => void;
  shortlistIds: string[];
  setShortlistIds: (ids: string[]) => void;
  onOpenBooking: (config: any) => void;
  openNewBooking: () => void;
}) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        className="min-h-screen"
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/photographers" element={<PhotographersPage />} />`n          <Route path="/photographers/apply" element={<PhotographerApplyPage />} />
          <Route path="/photographers/:id" element={
            <PhotographerProfilePage
              onOpenBooking={onOpenBooking}
              shortlistIds={shortlistIds}
              onToggleSave={(id) => {
                const next = shortlistIds.includes(id)
                  ? shortlistIds.filter(x => x !== id)
                  : [...shortlistIds, id];
                setShortlistIds(next);
                try { localStorage.setItem('capturely_shortlist', JSON.stringify(next)); } catch {}
              }}
            />
          } />
          <Route path="/bookings" element={
            <BookingsPage
              bookings={bookings}
              photographers={[]}
              onOpenNewBooking={openNewBooking}
            />
          } />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/cancellation" element={<CancellationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [bookings, setBookings] = useState<BookingRequest[]>(() => {
    try {
      const saved = localStorage.getItem('capturely_bookings');
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch { return INITIAL_BOOKINGS; }
  });

  const [shortlistIds, setShortlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('capturely_shortlist');
      return saved ? JSON.parse(saved) : ['darshan-mehta', 'rohan-varma'];
    } catch { return ['darshan-mehta', 'rohan-varma']; }
  });

  const [selectedCity, setSelectedCity] = useState<string>(() => {
    try { return localStorage.getItem('mtshoots_city') || ''; } catch { return ''; }
  });

  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingConfig, setBookingConfig] = useState<{
    photographer: Photographer;
    selectedDate: string;
    durationType: ShootDurationType;
    usageRights: UsageRightsTier;
    selectedAddOns: string[];
    totalCost: number;
    shootLocation: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [photographersList, setPhotographersList] = useState<Photographer[]>([]);

  useEffect(() => {
    loadPhotographers().then(r => {
      if (r) setPhotographersList(r);
    }).catch(() => {});
  }, []);

  // Lock body scroll when booking modal is open
  useScrollLock(isBookingModalOpen);

  // Show location picker on first visit & handle trigger events
  useEffect(() => {
    const handleOpenLoc = () => setShowLocationPicker(true);
    window.addEventListener('open-location-picker', handleOpenLoc);

    const hasCity = localStorage.getItem('mtshoots_city');
    if (!hasCity) {
      setTimeout(() => setShowLocationPicker(true), 1200);
    }
    setTimeout(() => setIsAppLoading(false), 800);

    return () => window.removeEventListener('open-location-picker', handleOpenLoc);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    try { localStorage.setItem('capturely_bookings', JSON.stringify(bookings)); } catch {}
  }, [bookings]);

  useEffect(() => {
    try { localStorage.setItem('capturely_shortlist', JSON.stringify(shortlistIds)); } catch {}
  }, [shortlistIds]);

  const handleConfirmBooking = (newBooking: BookingRequest) => {
    const updated = [newBooking, ...bookings];
    setBookings(updated);
    setIsBookingModalOpen(false);
    setBookingConfig(null);
    triggerToast('Booking confirmed! View your bookings');
    if (isSupabaseConfigured()) {
      saveBookingToSupabase(newBooking).catch(() => {});
    }
  };

  const handleOpenBooking = (config: typeof bookingConfig) => {
    setBookingConfig(config);
    setIsBookingModalOpen(true);
  };

  const openNewBooking = () => {
    setBookingConfig(null);
    setIsBookingModalOpen(true);
  };

  const handleLocationSelect = (city: string) => {
    setSelectedCity(city);
    try {
      localStorage.setItem('mtshoots_city', city);
      window.dispatchEvent(new CustomEvent('mtshoots-city-changed', { detail: city }));
    } catch {}
    setShowLocationPicker(false);
  };

  // App loading screen
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
      <ScrollToTop />

      <AnimatedRoutes
        bookings={bookings}
        setBookings={setBookings}
        shortlistIds={shortlistIds}
        setShortlistIds={setShortlistIds}
        onOpenBooking={handleOpenBooking}
        openNewBooking={openNewBooking}
      />

      {/* Global PWA Mobile Bottom Nav */}
      <PwaNav
        bookingCount={bookings.length}
        shortlistCount={shortlistIds.length}
        onOpenNewBooking={openNewBooking}
      />

      {/* Global PWA Install Banner */}
      <PwaInstallBanner />

      {/* Floating Scroll To Top Button (mouse animation) */}
      <ScrollToTopButton />

      {/* Location Picker */}
      {showLocationPicker && (
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
          onClose={() => { setIsBookingModalOpen(false); setBookingConfig(null); }}
          onConfirmBooking={handleConfirmBooking}
        />
      )}

      {/* Global Toast */}
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
