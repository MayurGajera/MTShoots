'use client';
import React, { useState, useEffect } from 'react';
import { Camera, Calendar, Heart, PlusCircle, Home } from 'lucide-react';
import { Link, useLocation } from '@/lib/navigation';

interface PwaNavProps {
  currentTab?: 'roster' | 'callsheets' | 'shortlist';
  setCurrentTab?: (tab: 'roster' | 'callsheets' | 'shortlist') => void;
  bookingCount?: number;
  shortlistCount?: number;
  onOpenNewBooking?: () => void;
}

export const PwaNav: React.FC<PwaNavProps> = ({
  bookingCount = 0,
  shortlistCount = 0,
  onOpenNewBooking
}) => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      if (typeof window === 'undefined') return null;
      const stored = localStorage.getItem('mtshoots_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const syncUser = () => {
      try {
        const stored = localStorage.getItem('mtshoots_user');
        setCurrentUser(stored ? JSON.parse(stored) : null);
      } catch {
        setCurrentUser(null);
      }
    };
    window.addEventListener('storage', syncUser);
    window.addEventListener('mtshoots-auth-changed', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('mtshoots-auth-changed', syncUser);
    };
  }, []);

  const isUserSignedIn = Boolean(currentUser);
  const showBookingBadge = isUserSignedIn && bookingCount > 0;
  const showShortlistBadge = isUserSignedIn && shortlistCount > 0;

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const tabClass = (path: string) =>
    `flex flex-col items-center justify-center py-1 relative transition-colors cursor-pointer ${
      isActive(path) ? 'text-[#C85A32]' : 'text-[#8a726a] hover:text-[#181615]'
    }`;

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-xl border-t border-[#231f1d]/10 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="grid grid-cols-5 h-16 items-center px-2">
        {/* Home */}
        <Link to="/" className={tabClass('/')} aria-label="Home">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Home</span>
          {isActive('/') && location.pathname === '/' && (
            <span className="w-1 h-1 rounded-full bg-[#C85A32] absolute -bottom-0.5" />
          )}
        </Link>

        {/* Explore */}
        <Link to="/photographers" className={tabClass('/photographers')} aria-label="Explore photographers">
          <Camera className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Explore</span>
          {isActive('/photographers') && (
            <span className="w-1 h-1 rounded-full bg-[#C85A32] absolute -bottom-0.5" />
          )}
        </Link>

        {/* Book Shoot  -  center CTA */}
        {onOpenNewBooking && (
          <button
            onClick={onOpenNewBooking}
            className="flex flex-col items-center justify-center py-1 cursor-pointer"
            aria-label="Book a shoot"
          >
            <div className="w-12 h-12 rounded-full bg-[#C85A32] flex items-center justify-center shadow-lg -mt-5 border-4 border-[#FAF8F5]">
              <PlusCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5 text-[#C85A32]">Book</span>
          </button>
        )}

        {/* Bookings */}
        <Link to="/bookings" className={tabClass('/bookings')} aria-label="My bookings">
          <div className="relative">
            <Calendar className="w-5 h-5" />
            {showBookingBadge && (
              <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-[#C85A32] text-white text-[9px] font-bold flex items-center justify-center">
                {bookingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold mt-0.5">Bookings</span>
          {isActive('/bookings') && (
            <span className="w-1 h-1 rounded-full bg-[#C85A32] absolute -bottom-0.5" />
          )}
        </Link>

        {/* Saved */}
        <Link to="/saved" className={tabClass('/saved')} aria-label="Saved photographers">
          <div className="relative">
            <Heart className="w-5 h-5" />
            {showShortlistBadge && (
              <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-[#4A7C59] text-white text-[9px] font-bold flex items-center justify-center">
                {shortlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold mt-0.5">Saved</span>
          {isActive('/saved') && (
            <span className="w-1 h-1 rounded-full bg-[#C85A32] absolute -bottom-0.5" />
          )}
        </Link>
      </div>
    </nav>
  );
};
