'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BookingRequest, Photographer, ShootDurationType, UsageRightsTier } from '@/types';
import { isSupabaseConfigured, saveBookingToSupabase, fetchBookings } from '@/lib/supabase';

export interface BookingConfig {
  photographer: Photographer;
  selectedDate: string;
  durationType: ShootDurationType;
  usageRights: UsageRightsTier;
  selectedAddOns: string[];
  totalCost: number;
  shootLocation: string;
}

interface AppContextType {
  bookings: BookingRequest[];
  setBookings: React.Dispatch<React.SetStateAction<BookingRequest[]>>;
  isBookingsLoading: boolean;
  shortlistIds: string[];
  setShortlistIds: React.Dispatch<React.SetStateAction<string[]>>;
  onToggleSave: (id: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  showLocationPicker: boolean;
  setShowLocationPicker: (show: boolean) => void;
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (open: boolean) => void;
  bookingConfig: BookingConfig | null;
  setBookingConfig: (config: BookingConfig | null) => void;
  openBooking: (config: BookingConfig | null) => void;
  openNewBooking: () => void;
  toastMessage: string | null;
  triggerToast: (msg: string) => void;
  handleConfirmBooking: (newBooking: BookingRequest) => void;
  handleLocationSelect: (city: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<BookingRequest[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('capturely_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDbBookings() {
      try {
        const remote = await fetchBookings();
        if (isMounted && remote && remote.length > 0) {
          setBookings(remote);
        }
      } catch (err) {
        console.warn('Could not load remote bookings from Supabase:', err);
      } finally {
        if (isMounted) {
          setIsBookingsLoading(false);
        }
      }
    }
    loadDbBookings();
    return () => {
      isMounted = false;
    };
  }, []);

  const [shortlistIds, setShortlistIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const user = localStorage.getItem('mtshoots_user');
      if (!user) return [];
      const saved = localStorage.getItem('capturely_shortlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleAuthChange = () => {
      try {
        const user = localStorage.getItem('mtshoots_user');
        if (!user) {
          setShortlistIds([]);
          return;
        }
        const saved = localStorage.getItem('capturely_shortlist');
        setShortlistIds(saved ? JSON.parse(saved) : []);
      } catch {
        setShortlistIds([]);
      }
    };
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('mtshoots-auth-changed', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('mtshoots-auth-changed', handleAuthChange);
    };
  }, []);

  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem('mtshoots_city') || '';
    } catch {
      return '';
    }
  });

  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem('mtshoots_booking_modal_open') === 'true';
    } catch {
      return false;
    }
  });

  const [bookingConfig, setBookingConfig] = useState<BookingConfig | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = sessionStorage.getItem('mtshoots_active_booking_config');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (bookingConfig) {
        sessionStorage.setItem('mtshoots_active_booking_config', JSON.stringify(bookingConfig));
      } else {
        sessionStorage.removeItem('mtshoots_active_booking_config');
      }
    } catch {}
  }, [bookingConfig]);

  useEffect(() => {
    try {
      if (isBookingModalOpen) {
        sessionStorage.setItem('mtshoots_booking_modal_open', 'true');
      } else {
        sessionStorage.removeItem('mtshoots_booking_modal_open');
      }
    } catch {}
  }, [isBookingModalOpen]);

  useEffect(() => {
    try {
      localStorage.setItem('capturely_bookings', JSON.stringify(bookings));
    } catch {}
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem('capturely_shortlist', JSON.stringify(shortlistIds));
    } catch {}
  }, [shortlistIds]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const isUserSignedIn = () => {
    try {
      if (typeof window === 'undefined') return false;
      return !!localStorage.getItem('mtshoots_user');
    } catch {
      return false;
    }
  };

  const onToggleSave = (id: string) => {
    if (!isUserSignedIn()) {
      triggerToast('Please sign in to save photographers');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
      return;
    }
    const next = shortlistIds.includes(id)
      ? shortlistIds.filter(x => x !== id)
      : [...shortlistIds, id];
    setShortlistIds(next);
    triggerToast(next.includes(id) ? 'Saved to shortlist' : 'Removed from shortlist');
  };

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

  const openBooking = (config: BookingConfig | null) => {
    if (!isUserSignedIn()) {
      triggerToast('Please sign in to book a photoshoot');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
      return;
    }
    setBookingConfig(config);
    setIsBookingModalOpen(true);
  };

  const openNewBooking = () => {
    if (!isUserSignedIn()) {
      triggerToast('Please sign in to book a photoshoot');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
      return;
    }
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

  return (
    <AppContext.Provider
      value={{
        bookings,
        setBookings,
        isBookingsLoading,
        shortlistIds: isUserSignedIn() ? shortlistIds : [],
        setShortlistIds,
        onToggleSave,
        selectedCity,
        setSelectedCity,
        showLocationPicker,
        setShowLocationPicker,
        isBookingModalOpen,
        setIsBookingModalOpen,
        bookingConfig,
        setBookingConfig,
        openBooking,
        openNewBooking,
        toastMessage,
        triggerToast,
        handleConfirmBooking,
        handleLocationSelect,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

const defaultAppContext: AppContextType = {
  bookings: [],
  setBookings: () => {},
  isBookingsLoading: false,
  shortlistIds: [],
  setShortlistIds: () => {},
  onToggleSave: () => {},
  selectedCity: 'All India',
  setSelectedCity: () => {},
  showLocationPicker: false,
  setShowLocationPicker: () => {},
  isBookingModalOpen: false,
  setIsBookingModalOpen: () => {},
  bookingConfig: null,
  setBookingConfig: () => {},
  openBooking: () => {},
  openNewBooking: () => {},
  toastMessage: null,
  triggerToast: () => {},
  handleConfirmBooking: () => {},
  handleLocationSelect: () => {}
};

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  return ctx || defaultAppContext;
}

export function useSafeApp(): AppContextType | null {
  return useContext(AppContext);
}
