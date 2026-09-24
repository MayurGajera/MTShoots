'use client';
import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, MapPin, CheckCircle2, Camera, AlertCircle,
  XCircle, User, FileText, ChevronDown, ChevronUp, Plus, ArrowLeft
} from 'lucide-react';
import { Link } from '@/lib/navigation';
import { useApp } from '@/context/AppContext';
import { BookingRequest, Photographer } from '../types';
import { formatINR } from '../utils/format';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { loadPhotographers } from '../lib/supabase';
import { ShimmerBookingCard } from '../components/ShimmerCard';
import { PhotographerDashboard } from '../components/PhotographerDashboard';

const STATUS_CONFIG: Record<BookingRequest['status'], { label: string; color: string; icon: React.FC<any>; bg: string }> = {
  confirmed: { label: 'Confirmed', color: 'text-[#2D593E]', bg: 'bg-[#EAF4ED]', icon: CheckCircle2 },
  pending: { label: 'Pending', color: 'text-[#8C531B]', bg: 'bg-[#FEF6E9]', icon: Clock },
  'in-production': { label: 'In Progress', color: 'text-[#1D4E75]', bg: 'bg-[#EEF4FB]', icon: Camera },
};

interface BookingsPageProps {
  bookings?: BookingRequest[];
  photographers?: Photographer[];
  onOpenNewBooking?: () => void;
}

export const BookingsPage: React.FC<BookingsPageProps> = ({
  bookings: propBookings,
  photographers: propPhotographers,
  onOpenNewBooking
}) => {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const readCurrentUser = () => {
      try {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem('mtshoots_user');
        return stored ? JSON.parse(stored) : null;
      } catch { return null; }
    };

    const syncUser = () => setCurrentUser(readCurrentUser());
    syncUser();

    const onAuthChanged = () => syncUser();
    window.addEventListener('mtshoots-auth-changed', onAuthChanged);
    return () => window.removeEventListener('mtshoots-auth-changed', onAuthChanged);
  }, []);

  if (currentUser?.role === 'photographer') {
    return <PhotographerDashboard user={currentUser} onOpenNewBooking={onOpenNewBooking} />;
  }

  const app = useApp();
  const bookings = propBookings ?? app?.bookings ?? [];
  const effectiveOpenNewBooking = onOpenNewBooking ?? app?.openNewBooking;
  const currentUserEmail = currentUser?.email?.toLowerCase();
  const visibleBookings = currentUserEmail
    ? bookings.filter((booking) => String(booking.artDirectorEmail || '').toLowerCase() === currentUserEmail)
    : [];

  const [photographers, setPhotographers] = useState<Photographer[]>(() => propPhotographers || []);

  useEffect(() => {
    if (!propPhotographers) {
      loadPhotographers().then(remote => {
        if (remote && remote.length > 0) setPhotographers(remote);
      }).catch(() => {});
    }
  }, [propPhotographers]);

  const [expandedId, setExpandedId] = useState<string | null>(() => visibleBookings[0]?.id || null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    if (!expandedId && visibleBookings.length > 0) {
      setExpandedId(visibleBookings[0]?.id || null);
    }
  }, [visibleBookings, expandedId]);

  const activeBooking = visibleBookings.find(b => b.id === expandedId) || visibleBookings[0];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
        <Navbar
          currentTab="callsheets"
          setCurrentTab={() => {}}
          bookingCount={0}
          shortlistCount={0}
          onOpenNewBooking={onOpenNewBooking}
        />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-[#F4EFEB] flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-[#8a726a]" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#181615] mb-3">Sign in to view bookings</h2>
            <p className="text-sm text-[#57423b] leading-relaxed mb-8">
              Your booking history is tied to your account, so we can keep each client’s bookings private and secure.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#C85A32] text-white text-sm font-bold hover:bg-[#B24E2A] transition-all shadow-lg cursor-pointer"
            >
              <User className="w-4 h-4" /> Sign In
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (visibleBookings.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
        <Navbar
          currentTab="callsheets"
          setCurrentTab={() => {}}
          bookingCount={0}
          shortlistCount={0}
          onOpenNewBooking={onOpenNewBooking}
        />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-[#F4EFEB] flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-[#8a726a]" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#181615] mb-3">No Bookings Yet</h2>
            <p className="text-sm text-[#57423b] leading-relaxed mb-8">
              When you book a photographer, your upcoming and past bookings will appear here. Start exploring photographers to book your first shoot!
            </p>
            <Link
              to="/photographers"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#C85A32] text-white text-sm font-bold hover:bg-[#B24E2A] transition-all shadow-lg cursor-pointer"
            >
              <Camera className="w-4 h-4" /> Explore Photographers
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col pb-24 md:pb-0">
      <Navbar
        currentTab="callsheets"
        setCurrentTab={() => {}}
        bookingCount={visibleBookings.length}
        shortlistCount={0}
        onOpenNewBooking={onOpenNewBooking}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 page-enter">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link to="/" className="flex items-center gap-1 text-xs text-[#8a726a] hover:text-[#C85A32] transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Home
              </Link>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#181615]">My Bookings</h1>
            <p className="text-sm text-[#57423b] mt-1">
              {visibleBookings.length} booking{visibleBookings.length !== 1 ? 's' : ''} • View and manage your photography shoots
            </p>
          </div>
          <Link
            to="/photographers"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C85A32] text-white text-sm font-semibold hover:bg-[#B24E2A] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Booking
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Booking List */}
          <div className="lg:col-span-1 space-y-3">
            {visibleBookings.map(booking => {
              const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed;
              const StatusIcon = status.icon;
              const isExpanded = expandedId === booking.id;
              const photographer = photographers.find(p => p.id === booking.photographerId);

              return (
                <button
                  key={booking.id}
                  onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                  className={`w-full text-left bg-white rounded-2xl border transition-all p-4 group cursor-pointer ${
                    isExpanded
                      ? 'border-[#C85A32] shadow-md ring-1 ring-[#C85A32]/15'
                      : 'border-[#E7E1DA] hover:border-[#dec0b7] hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={booking.photographerAvatar || photographer?.avatar}
                      alt={booking.photographerName}
                      className="w-11 h-11 rounded-full object-cover border-2 border-[#E7E1DA] shrink-0"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm text-[#181615] truncate">{booking.photographerName}</p>
                        <span className={`shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#8a726a] mt-0.5">{booking.campaignTitle || booking.durationType}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[11px] text-[#57423b]">
                          <Calendar className="w-3 h-3" /> {booking.shootDate}
                        </span>
                        <span className="text-[11px] font-bold text-[#181615]">{formatINR(booking.totalCost)}</span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#8a726a] shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-[#8a726a] shrink-0 mt-1" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Booking Detail */}
          <div className="lg:col-span-2">
            {activeBooking ? (
              <div className="bg-white rounded-2xl border border-[#E7E1DA] overflow-hidden shadow-sm animate-fadeIn">
                {/* Header */}
                <div className="bg-[#FAF8F5] border-b border-[#E7E1DA] px-4 sm:px-6 py-4 sm:py-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase font-bold tracking-widest text-[#C85A32] mb-1">Booking Reference</div>
                      <h2 className="font-serif text-lg sm:text-2xl font-bold text-[#181615] tracking-tight break-keep whitespace-nowrap overflow-hidden text-ellipsis">{activeBooking.id}</h2>
                      <p className="text-xs text-[#8a726a] mt-0.5">Created on {activeBooking.createdAt}</p>
                    </div>
                    <div className={`self-start sm:self-auto shrink-0 flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full ${STATUS_CONFIG[activeBooking.status]?.bg} ${STATUS_CONFIG[activeBooking.status]?.color}`}>
                      {React.createElement(STATUS_CONFIG[activeBooking.status]?.icon || CheckCircle2, { className: 'w-3.5 h-3.5 sm:w-4 sm:h-4' })}
                      {STATUS_CONFIG[activeBooking.status]?.label || 'Confirmed'}
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Photographer Info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={activeBooking.photographerAvatar}
                      alt={activeBooking.photographerName}
                      className="w-16 h-16 rounded-2xl object-cover border border-[#E7E1DA]"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'; }}
                    />
                    <div>
                      <p className="font-serif text-xl font-bold text-[#181615]">{activeBooking.photographerName}</p>
                      <p className="text-xs text-[#8a726a]">{activeBooking.campaignTitle}</p>
                      <Link to="/photographers" className="text-xs text-[#C85A32] hover:underline mt-0.5 inline-block cursor-pointer">
                        View Profile →
                      </Link>
                    </div>
                  </div>

                  {/* Shoot Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Shoot Date', value: activeBooking.shootDate, icon: Calendar },
                      { label: 'Start Time', value: activeBooking.callTime, icon: Clock },
                      { label: 'Location', value: activeBooking.locationName, icon: MapPin },
                      { label: 'Duration', value: activeBooking.durationType.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()), icon: Clock },
                      { label: 'Your Name', value: activeBooking.artDirectorName, icon: User },
                      { label: 'Email', value: activeBooking.artDirectorEmail, icon: FileText },
                    ].map(item => (
                      <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA]">
                        <item.icon className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-[#8a726a]">{item.label}</p>
                          <p className="text-sm font-medium text-[#181615] mt-0.5">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Address */}
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA]">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-[#8a726a] mb-1">Location Address</p>
                    <p className="text-sm text-[#181615]">{activeBooking.locationAddress}</p>
                  </div>

                  {/* Notes */}
                  {activeBooking.notes && (
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA]">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-[#8a726a] mb-1">Special Instructions</p>
                      <p className="text-xs text-[#57423b] leading-relaxed">{activeBooking.notes}</p>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="rounded-xl border border-[#E7E1DA] overflow-hidden">
                    <div className="bg-[#FAF8F5] px-4 py-3 border-b border-[#E7E1DA]">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#181615]">Price Breakdown</p>
                    </div>
                    <div className="p-4 space-y-2">
                      {[
                        { label: `Photographer Rate (${activeBooking.durationType.replace('-', ' ')})`, value: activeBooking.durationCost },
                        { label: `Usage Rights (${activeBooking.usageRights.replace(/-/g, ' ')})`, value: activeBooking.usageCost },
                        { label: 'Add-ons', value: activeBooking.addOnsCost },
                        { label: 'Platform Fee', value: activeBooking.productionFee },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between text-xs">
                          <span className="text-[#57423b] capitalize">{row.label}</span>
                          <span className="font-medium text-[#181615]">{formatINR(row.value)}</span>
                        </div>
                      ))}
                      <div className="border-t border-[#E7E1DA] pt-2 flex items-center justify-between">
                        <span className="font-bold text-sm text-[#181615]">Total</span>
                        <span className="font-serif text-xl font-bold text-[#181615]">{formatINR(activeBooking.totalCost)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E7E1DA] p-12 text-center">
                <FileText className="w-10 h-10 text-[#8a726a] mx-auto mb-3" />
                <p className="text-sm text-[#57423b]">Select a booking from the list to view details.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};


export default BookingsPage;
