'use client';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from '@/lib/navigation';
import {
  X, Calendar, MapPin, Clock, User, Mail, FileText, CheckCircle2,
  ShieldAlert, Check, ChevronDown, Lock, LogIn, Sparkles, AlertCircle
} from 'lucide-react';
import { Photographer, BookingRequest, ShootDurationType, UsageRightsTier } from '../types';
import { AVAILABLE_ADDONS } from '../data/photographers';
import { fetchAddOns, DbAddOn, upsertUser, getUserByEmail } from '@/lib/supabase';
import { formatINR } from '../utils/format';
import { useScrollLock } from '../hooks/useScrollLock';

export type PhotoshootStyle =
  | 'Directed'
  | 'Candid'
  | 'Directed + Candid'
  | 'Paparazzi'
  | 'Instagram'
  | 'Fashion Editorial'
  | 'Lifestyle'
  | 'Travel Story'
  | 'Brand Campaign'
  | 'Family / Friends';

export const PHOTOSHOOT_STYLES: {
  id: PhotoshootStyle;
  label: string;
  image: string;
  description: string;
}[] = [
  { id: 'Directed', label: 'Directed', image: 'https://ethfuuipgkmzrgjdcgcb.supabase.co/storage/v1/object/public/mtshoots-portfolios/booking-styles/directed.jpg', description: 'Guided artistic posing and intentional framing.' },
  { id: 'Candid', label: 'Candid', image: 'https://ethfuuipgkmzrgjdcgcb.supabase.co/storage/v1/object/public/mtshoots-portfolios/booking-styles/candid.jpg', description: 'Unscripted, spontaneous emotional moments.' },
  { id: 'Directed + Candid', label: 'Directed + Candid', image: 'https://ethfuuipgkmzrgjdcgcb.supabase.co/storage/v1/object/public/mtshoots-portfolios/booking-styles/directed-candid.jpg', description: 'The best of both worlds: guided portraits + natural candids.' },
  { id: 'Paparazzi', label: 'Paparazzi', image: 'https://ethfuuipgkmzrgjdcgcb.supabase.co/storage/v1/object/public/mtshoots-portfolios/booking-styles/paparazzi.jpg', description: 'Discreet, documentary long-lens storytelling.' },
  { id: 'Instagram', label: 'Instagram', image: 'https://ethfuuipgkmzrgjdcgcb.supabase.co/storage/v1/object/public/mtshoots-portfolios/booking-styles/instagram.jpg', description: 'Modern, vibrant aesthetic tailored for social feeds.' },
  { id: 'Fashion Editorial', label: 'Fashion Editorial', image: 'https://ethfuuipgkmzrgjdcgcb.supabase.co/storage/v1/object/public/mtshoots-portfolios/booking-styles/fashion-editorial.jpg', description: 'High-fashion framing with polished styling and motion.' },
  { id: 'Lifestyle', label: 'Lifestyle', image: 'https://ethfuuipgkmzrgjdcgcb.supabase.co/storage/v1/object/public/mtshoots-portfolios/booking-styles/lifestyle.jpg', description: 'Natural, everyday storytelling rooted in real moments.' },
  { id: 'Travel Story', label: 'Travel Story', image: 'https://ethfuuipgkmzrgjdcgcb.supabase.co/storage/v1/object/public/mtshoots-portfolios/booking-styles/travel-story.jpg', description: 'Scenic, destination-driven imagery with immersive context.' },
  { id: 'Brand Campaign', label: 'Brand Campaign', image: 'https://ethfuuipgkmzrgjdcgcb.supabase.co/storage/v1/object/public/mtshoots-portfolios/booking-styles/brand-campaign.jpg', description: 'Commercial visuals engineered for polished brand storytelling.' },
  { id: 'Family / Friends', label: 'Family / Friends', image: 'https://ethfuuipgkmzrgjdcgcb.supabase.co/storage/v1/object/public/mtshoots-portfolios/booking-styles/family-friends.jpg', description: 'Warm, relaxed portraits full of laughter and connection.' }
];

const SUGGESTED_CALL_TIMES = [
  { time: '08:00 AM IST', label: 'Early Morning Setup', desc: 'Soft outdoor light' },
  { time: '08:30 AM IST', label: 'Morning Start', desc: 'Comfortable prep window' },
  { time: '09:00 AM IST', label: 'Standard Morning Call', desc: 'Production-ready timing' },
  { time: '09:30 AM IST', label: 'Ideal Exposure Window', desc: 'Balanced daylight tones' },
  { time: '10:00 AM IST', label: 'Golden Start', desc: 'Warm, flattering portraits' },
  { time: '10:30 AM IST', label: 'Creative Morning', desc: 'Smooth shooting flow' },
  { time: '11:00 AM IST', label: 'Late Morning Session', desc: 'Great for city scenes' },
  { time: '11:30 AM IST', label: 'Midday Light', desc: 'Clear, clean compositions' },
  { time: '12:00 PM IST', label: 'Lunch Break Set', desc: 'Flexible studio time' },
  { time: '12:30 PM IST', label: 'Afternoon Start', desc: 'Color-rich daylight' },
  { time: '01:00 PM IST', label: 'Sunlit Coverage', desc: 'Ideal for lifestyle frames' },
  { time: '01:30 PM IST', label: 'Late Lunch Slot', desc: 'Good for indoor setups' },
  { time: '02:00 PM IST', label: 'Afternoon Session', desc: 'High-key location work' },
  { time: '02:30 PM IST', label: 'Creative Midday', desc: 'Shots with strong motion' },
  { time: '03:00 PM IST', label: 'Late Afternoon', desc: 'Softening daylight' },
  { time: '03:30 PM IST', label: 'Golden Prep', desc: 'Warm ambient fill' },
  { time: '04:00 PM IST', label: 'Sunset Run-Up', desc: 'Nice cinematic transition' },
  { time: '04:30 PM IST', label: 'Golden Hour', desc: 'Soft sunlight and warm skin tones' },
  { time: '05:00 PM IST', label: 'Late Sunset', desc: 'Warm editorial mood' },
  { time: '05:30 PM IST', label: 'Blue Hour Setup', desc: 'Moody contrast' },
  { time: '06:00 PM IST', label: 'Twilight Session', desc: 'Dusk atmosphere' },
  { time: '06:30 PM IST', label: 'Blue Hour', desc: 'Low-light styling' },
  { time: '07:00 PM IST', label: 'Evening Coverage', desc: 'Ambient night scenes' }
];

interface BookingSheetModalProps {
  initialConfig?: {
    photographer: Photographer;
    selectedDate: string;
    durationType: ShootDurationType;
    usageRights: UsageRightsTier;
    selectedAddOns: string[];
    totalCost: number;
    shootLocation: string;
  } | null;
  photographers: Photographer[];
  onClose: () => void;
  onConfirmBooking: (booking: BookingRequest) => void;
}

export const BookingSheetModal: React.FC<BookingSheetModalProps> = ({
  initialConfig,
  photographers,
  onClose,
  onConfirmBooking
}) => {
  useScrollLock(true);

  const [addOnsList, setAddOnsList] = useState(AVAILABLE_ADDONS);

  useEffect(() => {
    fetchAddOns().then(dbAddOns => {
      if (dbAddOns && dbAddOns.length > 0) {
        setAddOnsList(dbAddOns.map(a => ({
          id: a.id,
          name: a.name,
          price: a.price,
          description: a.description || ''
        })));
      }
    }).catch(() => {});
  }, []);

  const defaultPhotographer = initialConfig?.photographer || photographers[0];
  const showPhotographerDropdown = !initialConfig?.photographer;

  const [selectedPhotographerId, setSelectedPhotographerId] = useState<string>(
    defaultPhotographer?.id || photographers[0]?.id || ''
  );
  const currentPhotographer =
    photographers.find((p) => p.id === selectedPhotographerId) || defaultPhotographer || photographers[0];

  const [photoshootStyle, setPhotoshootStyle] = useState<PhotoshootStyle>('Directed');
  const [hoveredStyle, setHoveredStyle] = useState<PhotoshootStyle | null>(null);
  const [hoverPreviewPosition, setHoverPreviewPosition] = useState({ x: 0, y: 0 });
  const styleOptionImages = useMemo(() => {
    const avatarPool = [
      currentPhotographer.avatar,
      currentPhotographer.heroImage,
      ...photographers.map((p) => p.avatar).filter(Boolean),
      ...photographers.map((p) => p.heroImage).filter(Boolean)
    ].filter((value): value is string => Boolean(value));

    return avatarPool.length > 0 ? avatarPool : [''];
  }, [currentPhotographer, photographers]);
  const [artDirectorName, setArtDirectorName] = useState<string>('');
  const [artDirectorEmail, setArtDirectorEmail] = useState<string>('');
  const [shootDate, setShootDate] = useState<string>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);
    const maxStr = maxDate.toISOString().split('T')[0];
    const candidate = initialConfig?.selectedDate;
    if (candidate && candidate >= todayStr && candidate <= maxStr) {
      return candidate;
    }
    return todayStr;
  });
  const [callTime, setCallTime] = useState<string>(SUGGESTED_CALL_TIMES[0]?.time || '08:00 AM IST');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  const [selectedLocation, setSelectedLocation] = useState<string>(
    initialConfig?.shootLocation || currentPhotographer.officeLocation || currentPhotographer.location
  );
  const [locationAddress, setLocationAddress] = useState<string>(
    currentPhotographer.officeAddress || currentPhotographer.location
  );
  const [durationType, setDurationType] = useState<ShootDurationType>(
    initialConfig?.durationType || 'full-day'
  );
  const [usageRights, setUsageRights] = useState<UsageRightsTier>(
    initialConfig?.usageRights || 'commercial-standard'
  );
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(
    initialConfig?.selectedAddOns || []
  );
  const [notes, setNotes] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [cancellationAccepted, setCancellationAccepted] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Auth & Login Requirement State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Check login on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mtshoots_user');
      if (stored) {
        const u = JSON.parse(stored);
        setCurrentUser(u);
        if (u.fullName || u.name) setArtDirectorName(u.fullName || u.name);
        if (u.email) setArtDirectorEmail(u.email);
      }
    } catch {}
  }, []);

  // Close time dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(e.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const locationOptions = useMemo(() => {
    const opts = [
      {
        label: 'Studio / Office',
        value: currentPhotographer.officeLocation || currentPhotographer.location,
        address: currentPhotographer.officeAddress || currentPhotographer.location
      },
      {
        label: 'Main shoot city',
        value: currentPhotographer.location,
        address: currentPhotographer.location
      }
    ];
    return opts;
  }, [currentPhotographer]);

  const durationMultiplier = durationType === 'half-day' ? 0.6 : durationType === 'full-day' ? 1 : durationType === 'two-day' ? 1.9 : 2.7;
  const durationCost = Math.round(currentPhotographer.dayRate * durationMultiplier);

  const usageMultiplier = usageRights === 'editorial' ? 0.25 : usageRights === 'commercial-standard' ? 0.45 : usageRights === 'commercial-global' ? 0.75 : 1.2;
  const usageCost = Math.round(currentPhotographer.dayRate * usageMultiplier);

  const addOnsCost = selectedAddOns.reduce((sum, id) => {
    const item = addOnsList.find((a) => a.id === id);
    return sum + (item ? item.price : 0);
  }, 0);

  const productionFee = 5000;
  const totalCost = durationCost + usageCost + addOnsCost + productionFee;

  const handleLocationChoice = (value: string) => {
    setSelectedLocation(value);
    const matched = locationOptions.find((option) => option.value === value);
    if (matched) setLocationAddress(matched.address);
  };

  const handleQuickAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) {
      setAuthError('Please enter your email address');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const finalName = authName.trim() || authEmail.split('@')[0].replace(/[._]/g, ' ');
      let userObj: any = {
        id: 'usr-' + Date.now(),
        fullName: finalName,
        email: authEmail.trim().toLowerCase(),
        role: 'client'
      };

      try {
        if (authMode === 'signup') {
          const dbUser = await upsertUser({
            email: authEmail.trim().toLowerCase(),
            full_name: finalName,
            role: 'client'
          });
          if (dbUser?.id) userObj.id = dbUser.id;
        } else {
          const dbUser = await getUserByEmail(authEmail.trim().toLowerCase());
          if (dbUser?.id) {
            userObj.id = dbUser.id;
            userObj.fullName = dbUser.full_name || finalName;
          }
        }
      } catch {}

      localStorage.setItem('mtshoots_user', JSON.stringify(userObj));
      window.dispatchEvent(new CustomEvent('mtshoots-auth-changed'));
      setCurrentUser(userObj);
      if (!artDirectorName) setArtDirectorName(userObj.fullName);
      if (!artDirectorEmail) setArtDirectorEmail(userObj.email);
      setShowAuthModal(false);
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check login requirement first
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    const errors: Record<string, string> = {};
    if (!artDirectorName.trim() || artDirectorName.trim().length < 2) {
      errors.name = 'Please enter your name (minimum 2 characters)';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!artDirectorEmail.trim() || !emailRegex.test(artDirectorEmail.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (!shootDate) {
      errors.date = 'Please select a shoot date';
    }
    if (!callTime.trim()) {
      errors.time = 'Please select or enter call time';
    }
    if (!termsAccepted || !privacyAccepted || !cancellationAccepted) {
      errors.terms = 'Please accept all policy terms to proceed';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const randomNum = Math.floor(100 + Math.random() * 900);
    const campaignTitle = `${currentPhotographer.primaryCategory} shoot (${photoshootStyle})`;
    const clientBrand = currentPhotographer.name;
    const newBooking: BookingRequest = {
      id: `CS-2026-IND-${randomNum}`,
      photographerId: currentPhotographer.id,
      photographerName: currentPhotographer.name,
      photographerAvatar: currentPhotographer.avatar,
      campaignTitle,
      clientBrand,
      artDirectorName,
      artDirectorEmail,
      shootDate,
      callTime,
      locationName: selectedLocation,
      locationAddress,
      durationType,
      usageRights,
      selectedAddOns,
      dayRate: currentPhotographer.dayRate,
      durationCost,
      usageCost,
      addOnsCost,
      productionFee,
      totalCost,
      status: 'confirmed',
      createdAt: new Date().toISOString().split('T')[0],
      notes,
      shotListOverview: `Style: ${photoshootStyle}. Shot 01: Key portrait set. Shot 02-05: Styling details, movement frames, and location coverage.`,
      photoshootStyle
    };

    onConfirmBooking(newBooking);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#181615]/80 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#E7E1DA] overflow-hidden shadow-2xl animate-fadeIn my-6 sm:my-8 overscroll-contain relative">
        {/* Header */}
        <div className="bg-[#FAF8F5] px-6 py-5 border-b border-[#E7E1DA] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#C85A32]">
              Booking Details
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#181615]">
              Complete Your Booking
            </h2>
            <p className="text-xs text-[#8a726a] mt-0.5">
              Confirm your photoshoot style, shoot date, location, and contact details.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F4EFEB] text-[#181615] transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Login Warning Banner if not logged in */}
        {!currentUser && (
          <div className="bg-[#fbf2ee] border-b border-[#C85A32]/20 px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#8a3818]">
              <Lock className="w-3.5 h-3.5 shrink-0 text-[#C85A32]" />
              <span>You must be signed in to confirm this booking.</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="text-[#C85A32] font-bold hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <LogIn className="w-3 h-3" /> Sign In
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Selected Photographer */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block mb-1.5">
              Selected Photographer
            </label>

            {showPhotographerDropdown ? (
              <select
                value={selectedPhotographerId}
                onChange={(e) => setSelectedPhotographerId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E1DA] bg-[#FAF8F5] text-sm text-[#181615] font-medium focus:outline-none focus:border-[#C85A32] cursor-pointer appearance-none"
              >
                {photographers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.location}{showPhotographerDropdown ? ` — ${formatINR(p.dayRate)}/day` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E1DA] bg-[#FAF8F5] text-sm text-[#181615] font-medium cursor-default">
                {currentPhotographer.name} — {currentPhotographer.location}
              </div>
            )}
          </div>

          {/* 2. Photoshoot Style Preference */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#181615]">
                Style
              </span>
              <span className="text-[10px] font-semibold text-[#C85A32] bg-[#fbf2ee] px-2 py-1 rounded-full shrink-0">
                {photoshootStyle}
              </span>
            </div>

            <div className="relative flex items-center gap-2 overflow-visible">
              <button
                type="button"
                aria-label="Scroll style selector left"
                onClick={() => document.getElementById('photoshoot-style-row')?.scrollBy({ left: -180, behavior: 'smooth' })}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E7E1DA] bg-[#FAF8F5] text-[#181615] shadow-sm transition hover:border-[#C85A32]/60 hover:text-[#C85A32]"
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
              </button>

              <div id="photoshoot-style-row" className="relative flex flex-1 gap-2 overflow-x-auto pb-1 no-scrollbar snap-x snap-mandatory">
                {PHOTOSHOOT_STYLES.map((style) => {
                  const isSelected = photoshootStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onMouseEnter={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        setHoveredStyle(style.id);
                        setHoverPreviewPosition({
                          x: rect.left + rect.width / 2,
                          y: rect.top
                        });
                      }}
                      onMouseLeave={() => setHoveredStyle(null)}
                      onClick={() => setPhotoshootStyle(style.id)}
                      className={`group relative snap-start shrink-0 flex cursor-pointer items-center gap-2 rounded-full border px-2.5 py-1.5 text-[12px] font-medium transition-all duration-200 whitespace-nowrap ${
                        isSelected
                          ? 'border-[#C85A32] bg-[#C85A32] text-white shadow-sm'
                          : 'border-[#E7E1DA] bg-[#FAF8F5] text-[#181615] hover:border-[#C85A32]/60 hover:text-[#C85A32]'
                      }`}
                    >
                      <img
                        src={style.image || ''}
                        alt={style.label}
                        className={`rounded-full object-cover border border-white/80 bg-[#F1ECE6] ${isSelected ? 'h-8 w-8' : 'h-7 w-7'}`}
                        loading="lazy"
                        onError={(event) => {
                          const target = event.currentTarget as HTMLImageElement;
                          target.src = 'https://ethfuuipgkmzrgjdcgcb.supabase.co/storage/v1/object/public/mtshoots-portfolios/booking-styles/candid.jpg';
                        }}
                      />
                      <span>{style.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                aria-label="Scroll style selector right"
                onClick={() => document.getElementById('photoshoot-style-row')?.scrollBy({ left: 180, behavior: 'smooth' })}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E7E1DA] bg-[#FAF8F5] text-[#181615] shadow-sm transition hover:border-[#C85A32]/60 hover:text-[#C85A32]"
              >
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </button>
            </div>

            {hoveredStyle && (
              <div
                className="pointer-events-none fixed z-[60]"
                style={{
                  left: hoverPreviewPosition.x,
                  top: hoverPreviewPosition.y,
                  transform: 'translate(-50%, -120%)'
                }}
              >
                <div className="flex items-center justify-center rounded-2xl border border-[#E7E1DA] bg-white/95 p-1.5 shadow-xl backdrop-blur-sm">
                  <img
                    src={PHOTOSHOOT_STYLES.find((style) => style.id === hoveredStyle)?.image || ''}
                    alt={PHOTOSHOOT_STYLES.find((style) => style.id === hoveredStyle)?.label || ''}
                    className="h-28 w-28 rounded-xl object-cover"
                    loading="lazy"
                    onError={(event) => {
                      const target = event.currentTarget as HTMLImageElement;
                      target.src = 'https://ethfuuipgkmzrgjdcgcb.supabase.co/storage/v1/object/public/mtshoots-portfolios/booking-styles/candid.jpg';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block mb-1.5">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8a726a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={artDirectorName}
                  onChange={(e) => {
                    setArtDirectorName(e.target.value);
                    if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
                  }}
                  placeholder="e.g. Priya Sharma"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E7E1DA] text-sm text-[#181615] placeholder:text-stone-400 placeholder:font-normal focus:outline-none focus:border-[#C85A32]"
                />
              </div>
              {formErrors.name && (
                <p className="mt-1 text-[11px] text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block mb-1.5">
                Your Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8a726a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={artDirectorEmail}
                  onChange={(e) => {
                    setArtDirectorEmail(e.target.value);
                    if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
                  }}
                  placeholder="e.g. priya.sharma@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E7E1DA] text-sm text-[#181615] placeholder:text-stone-400 placeholder:font-normal focus:outline-none focus:border-[#C85A32]"
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-[11px] text-red-500">{formErrors.email}</p>
              )}
            </div>
          </div>

          {/* 4. Shoot Date & Clock Call Time Selection (Screenshot 4 Match) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block mb-1.5">
                Shoot Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#8a726a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  max={(() => {
                    const d = new Date();
                    d.setMonth(d.getMonth() + 6);
                    return d.toISOString().split('T')[0];
                  })()}
                  value={shootDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    const todayStr = new Date().toISOString().split('T')[0];
                    const maxDate = new Date();
                    maxDate.setMonth(maxDate.getMonth() + 6);
                    const maxStr = maxDate.toISOString().split('T')[0];
                    if (val < todayStr) {
                      setShootDate(todayStr);
                    } else if (val > maxStr) {
                      setShootDate(maxStr);
                    } else {
                      setShootDate(val);
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E7E1DA] text-sm text-[#181615] focus:outline-none focus:border-[#C85A32] cursor-pointer"
                />
              </div>
            </div>

            {/* Interactive Clock Call Time Dropdown */}
            <div ref={timeDropdownRef} className="relative">
              <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block mb-1.5">
                Start Time (Call Time)
              </label>
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => setIsTimeDropdownOpen(prev => !prev)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a726a] hover:text-[#C85A32] transition-colors cursor-pointer"
                  title="Choose time slot"
                >
                  <Clock className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  required
                  readOnly
                  value={callTime}
                  onFocus={() => setIsTimeDropdownOpen(true)}
                  onKeyDown={(e) => e.preventDefault()}
                  placeholder="e.g. 07:00 AM IST"
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#E7E1DA] text-sm text-[#181615] placeholder:text-stone-400 placeholder:font-normal focus:outline-none focus:border-[#C85A32] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setIsTimeDropdownOpen(prev => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8a726a] hover:text-[#181615] transition-colors cursor-pointer"
                  title="Toggle call time suggestions"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isTimeDropdownOpen ? 'rotate-180 text-[#C85A32]' : ''}`} />
                </button>
              </div>

              {/* Time Dropdown Menu */}
              {isTimeDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-2xl shadow-xl border border-[#E7E1DA] overflow-hidden z-30 animate-fadeIn divide-y divide-[#E7E1DA]/50">
                  <div className="p-2 bg-[#FAF8F5] flex items-center justify-between text-[11px] font-semibold text-[#8a726a]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C85A32]" /> Recommended Shoot Slots
                    </span>
                    <span className="text-[10px] text-[#8a726a]/70">IST</span>
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {SUGGESTED_CALL_TIMES.map((slot) => {
                      const isSelected = callTime === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => {
                            setCallTime(slot.time);
                            setIsTimeDropdownOpen(false);
                            if (formErrors.time) setFormErrors(prev => ({ ...prev, time: '' }));
                          }}
                          className={`w-full px-3.5 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#fbf2ee] text-[#C85A32] font-bold' : 'hover:bg-[#FAF8F5] text-[#181615]'
                          }`}
                        >
                          <div>
                            <span className="font-semibold block">{slot.time}</span>
                            <span className="text-[10px] text-[#8a726a] font-normal">{slot.label} &bull; {slot.desc}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {formErrors.time && (
                <p className="mt-1 text-[11px] text-red-500">{formErrors.time}</p>
              )}
            </div>
          </div>

          {/* 5. Preferred Shoot Location */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block">
              Preferred Shoot Location
            </label>
            <div className="space-y-2">
              {locationOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedLocation === option.value ? 'border-[#C85A32] bg-[#fbf2ee]' : 'border-[#E7E1DA] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <input
                    type="radio"
                    name="selected-location"
                    checked={selectedLocation === option.value}
                    onChange={() => handleLocationChoice(option.value)}
                    className="mt-0.5 text-[#C85A32] cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#181615]">
                      <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-[#8a726a]">{option.address}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 6. Address for Production Team */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block mb-1.5">
              Address for Production Team
            </label>
            <input
              type="text"
              required
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E1DA] text-sm text-[#181615] focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          {/* 7. Shot List & Special Instructions */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block mb-1.5">
              Shot List &amp; Special Instructions
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Include bride family portraits, outfit switch at 3 PM, bring softbox..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E1DA] text-xs text-[#181615] focus:outline-none focus:border-[#C85A32] leading-relaxed"
            />
          </div>

          {/* 8. Total Price Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E7E1DA] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#57423b] block">Total Price (Includes Equipment &amp; Crew)</span>
              <span className="font-serif text-2xl font-bold text-[#181615] tabular-nums">
                {formatINR(totalCost)}
              </span>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-lg bg-[#EAF4ED] text-[#2D593E] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Instant Confirmation
            </span>
          </div>

          {/* 9. Policy Checkboxes */}
          <div className="rounded-2xl border border-[#E7E1DA] bg-[#FAF8F5] p-3 sm:p-4 space-y-2">
            {/* Terms & Conditions */}
            <label
              htmlFor="agree-terms-checkbox"
              className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none text-xs text-[#181615] ${
                termsAccepted ? 'border-[#C85A32]/40 bg-white shadow-xs' : 'border-transparent hover:bg-white/60'
              }`}
            >
              <input
                id="agree-terms-checkbox"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  if (formErrors.terms) setFormErrors(prev => ({ ...prev, terms: '' }));
                }}
                className="mt-0.5 w-4 h-4 rounded text-[#C85A32] focus:ring-[#C85A32] border-[#E7E1DA] cursor-pointer shrink-0"
              />
              <span className="leading-relaxed">
                I agree to the{' '}
                <Link
                  to="/terms"
                  onClick={(e) => e.stopPropagation()}
                  className="font-bold underline text-[#C85A32] hover:text-[#B24E2A]"
                >
                  Terms and Conditions
                </Link>{' '}
                for photography booking and shoot execution.
              </span>
            </label>

            {/* Privacy Policy */}
            <label
              htmlFor="agree-privacy-checkbox"
              className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none text-xs text-[#181615] ${
                privacyAccepted ? 'border-[#C85A32]/40 bg-white shadow-xs' : 'border-transparent hover:bg-white/60'
              }`}
            >
              <input
                id="agree-privacy-checkbox"
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => {
                  setPrivacyAccepted(e.target.checked);
                  if (formErrors.terms) setFormErrors(prev => ({ ...prev, terms: '' }));
                }}
                className="mt-0.5 w-4 h-4 rounded text-[#C85A32] focus:ring-[#C85A32] border-[#E7E1DA] cursor-pointer shrink-0"
              />
              <span className="leading-relaxed">
                I agree to the{' '}
                <Link
                  to="/privacy"
                  onClick={(e) => e.stopPropagation()}
                  className="font-bold underline text-[#C85A32] hover:text-[#B24E2A]"
                >
                  Privacy Policy
                </Link>{' '}
                and understand my contact details are used for booking coordination only.
              </span>
            </label>

            {/* Cancellation & Refund */}
            <label
              htmlFor="agree-cancellation-checkbox"
              className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none text-xs text-[#181615] ${
                cancellationAccepted ? 'border-[#C85A32]/40 bg-white shadow-xs' : 'border-transparent hover:bg-white/60'
              }`}
            >
              <input
                id="agree-cancellation-checkbox"
                type="checkbox"
                checked={cancellationAccepted}
                onChange={(e) => {
                  setCancellationAccepted(e.target.checked);
                  if (formErrors.terms) setFormErrors(prev => ({ ...prev, terms: '' }));
                }}
                className="mt-0.5 w-4 h-4 rounded text-[#C85A32] focus:ring-[#C85A32] border-[#E7E1DA] cursor-pointer shrink-0"
              />
              <span className="leading-relaxed">
                I accept the{' '}
                <Link
                  to="/cancellation"
                  onClick={(e) => e.stopPropagation()}
                  className="font-bold underline text-[#C85A32] hover:text-[#B24E2A]"
                >
                  Cancellation &amp; Refund Slabs
                </Link>{' '}
                including rescheduling policies.
              </span>
            </label>
          </div>

          {formErrors.terms && (
            <p className="text-xs text-red-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {formErrors.terms}
            </p>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#E7E1DA] text-xs font-semibold text-[#57423b] hover:bg-[#FAF8F5] cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="confirm-booking-submit-btn"
              type="submit"
              disabled={!termsAccepted || !privacyAccepted || !cancellationAccepted}
              className="px-7 py-3 rounded-xl bg-[#C85A32] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#B24E2A] transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {!currentUser && <Lock className="w-3.5 h-3.5" />}
              <span>{currentUser ? 'Confirm Booking' : 'Sign In & Book'}</span>
            </button>
          </div>
        </form>

        {/* 10. Seamless Auth Modal (Screenshot 1 Match: User login first before booking) */}
        {showAuthModal && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-40 p-6 flex flex-col justify-center items-center animate-fadeIn">
            <div className="w-full max-w-sm bg-white p-6 rounded-2xl border border-[#E7E1DA] shadow-xl text-center relative">
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute right-4 top-4 text-[#8a726a] hover:text-[#181615] cursor-pointer"
                title="Close sign in"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-[#fbf2ee] text-[#C85A32] flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>

              <h3 className="font-serif text-xl font-bold text-[#181615]">
                {authMode === 'signin' ? 'Sign In to Book' : 'Create an Account'}
              </h3>
              <p className="text-xs text-[#8a726a] mt-1 mb-4">
                Your selected date, photographer, and photoshoot style will be preserved.
              </p>

              {authError && (
                <div className="mb-3 p-2.5 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-1.5 text-left">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleQuickAuth} className="space-y-3 text-left">
                {authMode === 'signup' && (
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#8a726a] block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3 py-2 rounded-xl border border-[#E7E1DA] text-xs text-[#181615] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#8a726a] block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-[#E7E1DA] text-xs text-[#181615] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#8a726a] block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    className="w-full px-3 py-2 rounded-xl border border-[#E7E1DA] text-xs text-[#181615] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#C85A32] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#B24E2A] transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? 'Verifying...' : authMode === 'signin' ? 'Sign In & Continue Booking' : 'Register & Continue Booking'}
                </button>
              </form>

              <div className="mt-4 pt-3 border-t border-[#E7E1DA] flex items-center justify-between text-xs text-[#8a726a]">
                <span>
                  {authMode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                    setAuthError('');
                  }}
                  className="font-bold text-[#C85A32] hover:underline cursor-pointer"
                >
                  {authMode === 'signin' ? 'Register Now' : 'Sign In'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
