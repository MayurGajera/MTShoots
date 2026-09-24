'use client';
import React, { useState } from 'react';
import { Heart, Camera, ArrowLeft, X } from 'lucide-react';
import { Link, useNavigate } from '@/lib/navigation';
import { Photographer } from '../types';
import { loadPhotographers } from '../lib/supabase';
import { PhotographerCard } from '../components/PhotographerCard';
import { PhotographerDetailModal } from '../components/PhotographerDetailModal';
import { BookingSheetModal } from '../components/BookingSheetModal';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BookingRequest } from '../types';
import { INITIAL_BOOKINGS } from '../data/photographers';
import { PortfolioItem, ShootDurationType, UsageRightsTier } from '../types';

export const SavedPage: React.FC = () => {
  const navigate = useNavigate();
  const [allPhotographers, setAllPhotographers] = useState<Photographer[]>([]);

  React.useEffect(() => {
    loadPhotographers().then(remote => {
      if (remote) setAllPhotographers(remote);
    }).catch(() => {});
  }, []);

  const [shortlistIds, setShortlistIds] = useState<string[]>(() => {
    try {
      if (typeof window === 'undefined') return [];
      const saved = localStorage.getItem('capturely_shortlist');
      return saved ? JSON.parse(saved) : ['darshan-mehta', 'rohan-varma'];
    } catch { return ['darshan-mehta', 'rohan-varma']; }
  });

  const [bookings, setBookings] = useState<BookingRequest[]>(() => {
    try {
      if (typeof window === 'undefined') return [];
      const saved = localStorage.getItem('capturely_bookings');
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch { return INITIAL_BOOKINGS; }
  });

  const [selectedPhotographer, setSelectedPhotographer] = useState<Photographer | null>(null);
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);
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

  const savedPhotographers = allPhotographers.filter(p => shortlistIds.includes(p.id));

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleSave = (id: string) => {
    const next = shortlistIds.includes(id)
      ? shortlistIds.filter(x => x !== id)
      : [...shortlistIds, id];
    setShortlistIds(next);
    try { localStorage.setItem('capturely_shortlist', JSON.stringify(next)); } catch {}
    triggerToast(shortlistIds.includes(id) ? 'Photographer removed.' : 'Photographer saved!');
  };

  const handleQuickBook = (p: Photographer) => {
    setBookingConfig({
      photographer: p,
      selectedDate: p.nextAvailableDate,
      durationType: 'full-day',
      usageRights: 'commercial-standard',
      selectedAddOns: [],
      totalCost: p.dayRate + Math.round(p.dayRate * 0.45) + 5000,
      shootLocation: p.officeLocation || p.location
    });
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = (newBooking: BookingRequest) => {
    const updated = [newBooking, ...bookings];
    setBookings(updated);
    try { localStorage.setItem('capturely_bookings', JSON.stringify(updated)); } catch {}
    setIsBookingModalOpen(false);
    setBookingConfig(null);
    triggerToast('Booking confirmed!');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col pb-24 md:pb-0">
      <Navbar
        currentTab="shortlist"
        setCurrentTab={() => {}}
        bookingCount={bookings.length}
        shortlistCount={shortlistIds.length}
        onOpenNewBooking={() => { setBookingConfig(null); setIsBookingModalOpen(true); }}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 page-enter">
          <div className="flex items-center gap-3 mb-1">
            <Link to="/" className="flex items-center gap-1 text-xs text-[#8a726a] hover:text-[#C85A32] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#181615] flex items-center gap-3">
            <Heart className="w-7 h-7 text-[#C85A32] fill-[#C85A32]" />
            Saved Photographers
          </h1>
          <p className="text-sm text-[#57423b] mt-1">
            {savedPhotographers.length} saved • Your shortlisted photographers
          </p>
        </div>

        {savedPhotographers.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto animate-scaleIn">
            <div className="w-20 h-20 rounded-2xl bg-[#F4EFEB] flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-[#dec0b7]" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#181615] mb-3">No Saved Photographers</h2>
            <p className="text-sm text-[#57423b] leading-relaxed mb-8">
              When you tap the heart icon on a photographer's card, they'll appear here for easy access.
            </p>
            <Link
              to="/photographers"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#C85A32] text-white text-sm font-bold hover:bg-[#B24E2A] transition-all shadow-lg cursor-pointer"
            >
              <Camera className="w-4 h-4" /> Browse Photographers
            </Link>
          </div>
        ) : (
          <>
            {/* Quick Clear All */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs text-[#8a726a] font-medium">{savedPhotographers.length} photographer{savedPhotographers.length !== 1 ? 's' : ''} saved</p>
              <button
                onClick={() => {
                  setShortlistIds([]);
                  try { localStorage.setItem('capturely_shortlist', JSON.stringify([])); } catch {}
                  triggerToast('All photographers removed from saved.');
                }}
                className="text-xs text-[#C85A32] hover:underline font-medium cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {savedPhotographers.map(p => (
                <PhotographerCard
                  key={p.id}
                  photographer={p}
                  onSelect={() => navigate(`/photographers/${p.id}`)}
                  onQuickBook={handleQuickBook}
                  isSaved={true}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />

      {selectedPhotographer && (
        <PhotographerDetailModal
          photographer={selectedPhotographer}
          onClose={() => setSelectedPhotographer(null)}
          onStartBooking={(config) => { setBookingConfig(config); setSelectedPhotographer(null); setIsBookingModalOpen(true); }}
          isSaved={shortlistIds.includes(selectedPhotographer.id)}
          onToggleSave={handleToggleSave}
          onOpenLightbox={item => setLightboxItem(item)}
        />
      )}

      {isBookingModalOpen && (
        <BookingSheetModal
          initialConfig={bookingConfig}
          photographers={allPhotographers}
          onClose={() => { setIsBookingModalOpen(false); setBookingConfig(null); }}
          onConfirmBooking={handleConfirmBooking}
        />
      )}

      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 bg-[#181615] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#dec0b7]/30 flex items-center space-x-2.5 animate-bounce-short">
          <span className="w-2 h-2 rounded-full bg-[#4A7C59]" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};


export default SavedPage;
