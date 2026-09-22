import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Camera, Menu, X, Heart, MapPin, ChevronDown, Smartphone, Download } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { MTShootsLogo } from './MTShootsLogo';

interface NavbarProps {
  currentTab?: 'roster' | 'callsheets' | 'shortlist';
  setCurrentTab?: (tab: 'roster' | 'callsheets' | 'shortlist') => void;
  bookingCount?: number;
  shortlistCount?: number;
  onOpenNewBooking?: () => void;
  onOpenLocationPicker?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  bookingCount = 0,
  shortlistCount = 0,
  onOpenNewBooking,
  onOpenLocationPicker
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState<string>(() => {
    try {
      return localStorage.getItem('mtshoots_city') || 'All India';
    } catch {
      return 'All India';
    }
  });

  // Keep city updated when changed
  useEffect(() => {
    const handleStorage = () => {
      try {
        const city = localStorage.getItem('mtshoots_city');
        if (city) setCurrentCity(city);
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleOpenCityModal = () => {
    if (onOpenLocationPicker) {
      onOpenLocationPicker();
    } else {
      window.dispatchEvent(new CustomEvent('open-location-picker'));
    }
  };

  // Detect current route for active state
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinkClass = (path: string) =>
    `px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all duration-200 cursor-pointer ${
      isActive(path)
        ? 'bg-[#181615] text-white shadow-xs'
        : 'text-[#57423b] hover:text-[#181615] hover:bg-[#F4EFEB]'
    }`;

  const user = (() => {
    try {
      const stored = localStorage.getItem('mtshoots_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  })();

  const handleSignOut = () => {
    try { localStorage.removeItem('mtshoots_user'); } catch {}
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E7E1DA] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
          {/* Left: Brand Logo */}
          <Link to="/" className="focus-ring rounded-lg shrink-0">
            <MTShootsLogo size="md" showTagline />
          </Link>

          {/* Right: Unified Navigation & Actions Cluster in small, crisp text */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 lg:space-x-3">
            {/* City Badge Button */}
            <button
              onClick={handleOpenCityModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-[#F4EFEB] text-[#57423b] border border-[#E7E1DA] hover:border-[#C85A32]/40 transition-all cursor-pointer shadow-2xs"
              title="Change location"
            >
              <MapPin className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
              <span className="truncate max-w-[85px] text-xs">{currentCity}</span>
              <ChevronDown className="w-3 h-3 text-[#8a726a] shrink-0" />
            </button>

            {/* Desktop Nav Links (Small Text) */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/photographers"
                id="nav-roster-btn"
                className={navLinkClass('/photographers')}
              >
                <Camera className="w-3.5 h-3.5 shrink-0" />
                <span>Photographers</span>
              </Link>

              <Link
                to="/bookings"
                id="nav-callsheets-btn"
                className={navLinkClass('/bookings')}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Bookings</span>
                {bookingCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive('/bookings') ? 'bg-[#C85A32] text-white' : 'bg-[#C85A32]/15 text-[#C85A32]'
                  }`}>
                    {bookingCount}
                  </span>
                )}
              </Link>

              <Link
                to="/saved"
                id="nav-shortlist-btn"
                className={navLinkClass('/saved')}
              >
                <Heart className="w-3.5 h-3.5 shrink-0" />
                <span>Saved</span>
                {shortlistCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#EAF4ED] text-[#2D593E]">
                    {shortlistCount}
                  </span>
                )}
              </Link>
            </nav>

            {/* Install App CTA (Desktop) */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install'))}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E7E1DA] hover:border-[#C85A32] text-xs font-semibold text-[#57423b] hover:text-[#C85A32] hover:bg-[#F4EFEB] transition-all cursor-pointer"
              title="Install MTShoots as an App"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Install App</span>
            </button>

            {/* Subtle Divider */}
            <div className="hidden lg:block h-4 w-px bg-[#E7E1DA]" />

            {/* Book a Shoot CTA */}
            {onOpenNewBooking && (
              <Button
                variant="terracotta"
                size="sm"
                onClick={onOpenNewBooking}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 h-8 shadow-sm cursor-pointer hover:scale-[1.02] transition-transform whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Shoot</span>
              </Button>
            )}

            {/* Auth / Profile Links */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-xs text-[#57423b] font-medium truncate max-w-[100px]">
                  {user.fullName || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-[#C85A32] hover:underline cursor-pointer font-semibold"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1.5">
                <Link
                  to="/auth?role=photographer"
                  className="text-xs font-semibold text-[#57423b] px-2.5 py-1.5 rounded-full border border-[#E7E1DA] hover:border-[#dec0b7] hover:bg-[#F4EFEB] transition-all cursor-pointer whitespace-nowrap"
                >
                  For Photographers
                </Link>
                <Link
                  to="/auth"
                  className="text-xs font-bold text-white bg-[#181615] px-3.5 py-1.5 rounded-full hover:bg-[#C85A32] transition-all cursor-pointer shadow-sm whitespace-nowrap"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F4EFEB] transition-colors cursor-pointer text-[#181615]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-[#E7E1DA] py-3 space-y-1 overflow-hidden"
            >
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOpenCityModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF8F5] text-xs font-semibold text-[#181615] border border-[#E7E1DA] mb-2 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C85A32]" />
                  <span>City: {currentCity}</span>
                </div>
                <span className="text-[#C85A32]">Change →</span>
              </button>

              <Link
                to="/photographers"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#F4EFEB] text-xs font-semibold text-[#181615] cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#C85A32]" /> Explore Photographers
              </Link>
              <Link
                to="/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#F4EFEB] text-xs font-semibold text-[#181615] cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#C85A32]" /> My Bookings
                {bookingCount > 0 && (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#C85A32]/15 text-[#C85A32] font-bold">
                    {bookingCount}
                  </span>
                )}
              </Link>
              <Link
                to="/saved"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#F4EFEB] text-xs font-semibold text-[#181615] cursor-pointer"
              >
                <Heart className="w-4 h-4 text-[#C85A32]" /> Saved Photographers
                {shortlistCount > 0 && (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#EAF4ED] text-[#2D593E] font-bold">
                    {shortlistCount}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('open-pwa-install'));
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA] text-xs font-bold text-[#C85A32] cursor-pointer"
              >
                <Smartphone className="w-4 h-4" /> Install App to Home Screen
              </button>

              <div className="border-t border-[#E7E1DA] pt-2 mt-1 space-y-1">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-xs text-[#C85A32] font-semibold cursor-pointer hover:bg-[#F4EFEB] rounded-xl"
                  >
                    Sign Out ({user.fullName || user.email})
                  </button>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-xs font-bold text-[#181615] hover:bg-[#F4EFEB] rounded-xl cursor-pointer"
                    >
                      Sign In / Create Account
                    </Link>
                    <Link
                      to="/auth?role=photographer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-xs font-semibold text-[#57423b] hover:bg-[#F4EFEB] rounded-xl cursor-pointer"
                    >
                      Join as Photographer
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
