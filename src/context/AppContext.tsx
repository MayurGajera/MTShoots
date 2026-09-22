'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BookingRequest, Photographer, ShootDurationType, UsageRightsTier } from '@/types';
import { INITIAL_BOOKINGS, INITIAL_PHOTOGRAPHERS } from '@/data/photographers';
import { isSupabaseConfigured, saveBookingToSupabase } from '@/lib/supabase';

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
    if (typeof window === 'undefined') return INITIAL_BOOKINGS;
    try {
      const saved = localStorage.getItem('capturely_bookings');
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  const [shortlistIds, setShortlistIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['darshan-mehta', 'rohan-varma'];
    try {
      const saved = localStorage.getItem('capturely_shortlist');
      return saved ? JSON.parse(saved) : ['darshan-mehta', 'rohan-varma'];
    } catch {
      return ['darshan-mehta', 'rohan-varma'];
    }
  });

  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem('mtshoots_city') || '';
    } catch {
      return '';
    }
  });

  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingConfig, setBookingConfig] = useState<BookingConfig | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const onToggleSave = (id: string) => {
    const next = shortlistIds.includes(id)
      ? shortlistIds.filter(x => x !== id)
      : [...shortlistIds, id];
    setShortlistIds(next);
    triggerToast(next.includes(id) ? 'Saved to shortlist â™¥' : 'Removed from shortlist');
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
    } catch {}
    setShowLocationPicker(false);
    triggerToast(`Showing photographers near ${city} ðŸ" `);
  };

  return (
    <AppContext.Provider
      value={{
        bookings,
        setBookings,
        shortlistIds,
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

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
