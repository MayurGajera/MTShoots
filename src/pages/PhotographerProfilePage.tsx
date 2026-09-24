'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from '@/lib/navigation';
import { useApp } from '@/context/AppContext';
import {
  Camera, Star, MapPin, Calendar, Clock, Award, ShieldCheck,
  Heart, Share2, ArrowLeft, ChevronLeft, ChevronRight, Check,
  Sparkles, CheckCircle2, ExternalLink, Zap, Info,
  Sliders, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_PHOTOGRAPHERS, AVAILABLE_ADDONS, getAllPhotographers } from '../data/photographers';
import { getPhotographerById } from '../lib/supabase';
import { ApertureLoader } from '../components/ApertureLoader';
import { Photographer, PortfolioItem, ShootDurationType, UsageRightsTier } from '../types';
import { formatINR } from '../utils/format';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MediaLightbox } from '../components/MediaLightbox';

interface PhotographerProfilePageProps {
  onOpenBooking?: (config: {
    photographer: Photographer;
    selectedDate: string;
    durationType: ShootDurationType;
    usageRights: UsageRightsTier;
    selectedAddOns: string[];
    totalCost: number;
    shootLocation: string;
  }) => void;
  shortlistIds?: string[];
  onToggleSave?: (id: string) => void;
}

export const PhotographerProfilePage: React.FC<PhotographerProfilePageProps> = ({
  onOpenBooking,
  shortlistIds: propShortlistIds,
  onToggleSave: propOnToggleSave
}) => {
  const app = useApp();
  const shortlistIds = propShortlistIds ?? app?.shortlistIds ?? [];
  const onToggleSave = propOnToggleSave ?? app?.onToggleSave ?? (() => {});
  const effectiveOpenBooking = onOpenBooking ?? app?.openBooking ?? (() => {});
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [photographer, setPhotographer] = useState<Photographer | null>(() => {
    const normalizedId = id ? decodeURIComponent(id) : '';
    const all = getAllPhotographers();
    const localMatch = all.find(p => p.id === id || p.id === normalizedId || (id && p.id?.includes(id)));
    if (localMatch) return localMatch;

    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('mtshoots_photographer_profile') : null;
      if (!raw) return null;
      const saved = JSON.parse(raw) as Photographer | null;
      if (saved && (saved.id === id || saved.id === normalizedId || (id && saved.id?.includes(id)))) {
        return saved;
      }
    } catch {
      // ignore malformed cached data
    }

    return null;
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(!photographer);

  useEffect(() => {
    let isMounted = true;
    const normalizedId = id ? decodeURIComponent(id) : '';
    const local = getAllPhotographers().find(p => p.id === id || p.id === normalizedId || (id && p.id?.includes(id)));
    if (local) {
      setPhotographer(local);
      setIsLoadingProfile(false);
    } else {
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('mtshoots_photographer_profile') : null;
        if (raw) {
          const saved = JSON.parse(raw) as Photographer | null;
          if (saved && (saved.id === id || saved.id === normalizedId || (id && saved.id?.includes(id)))) {
            setPhotographer(saved);
            setIsLoadingProfile(false);
          }
        }
      } catch {
        // ignore malformed cached data
      }
    }

    async function loadRemoteProfile() {
      if (!id) return;
      try {
        const remote = await getPhotographerById(id);
        if (isMounted && remote) {
          setPhotographer(remote);
        }
      } catch (err) {
        console.warn('Error fetching remote photographer profile:', err);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    }

    loadRemoteProfile();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Collect all photos for slider (hero image + homeSliderPhotos + portfolio items)
  const allPhotos: { url: string; title: string; category: string; specs?: string; item?: PortfolioItem }[] = React.useMemo(() => {
    if (!photographer) return [];
    const list: { url: string; title: string; category: string; specs?: string; item?: PortfolioItem }[] = [];
    const seen = new Set<string>();

    const normalizeUrl = (u: string) => {
      try {
        const urlObj = new URL(u);
        return urlObj.origin + urlObj.pathname;
      } catch {
        return u.split('?')[0];
      }
    };

    const pushPhoto = (url: string, title: string, category: string, specs?: string, item?: PortfolioItem) => {
      const normalized = normalizeUrl(url);
      if (!url || seen.has(normalized)) return;
      list.push({ url, title, category, specs, item });
      seen.add(normalized);
    };

    if (photographer.heroImage) {
      pushPhoto(
        photographer.heroImage,
        `${photographer.name} - Signature Frame`,
        photographer.primaryCategory,
        photographer.cameraFormat
      );
    }

    if (photographer.homeSliderPhotos) {
      photographer.homeSliderPhotos.forEach((img, i) => {
        pushPhoto(
          img,
          `${photographer.primaryCategory} Series #${i + 1}`,
          photographer.primaryCategory,
          photographer.cameraFormat
        );
      });
    }

    if (photographer.portfolio) {
      photographer.portfolio.forEach(item => {
        pushPhoto(item.imageUrl, item.title, item.category, item.techSpecs, item);
      });
    }

    return list;
  }, [photographer]);

  const lightboxItems = React.useMemo<PortfolioItem[]>(() => {
    if (!photographer) return [];

    return allPhotos.map((photo, index) => {
      const base = photo.item ?? {
        id: `lightbox-${photographer.id}-${index}`,
        title: photo.title,
        clientOrSeries: photographer.primaryCategory,
        category: photo.category,
        imageUrl: photo.url,
        aspectRatio: '16:9' as const,
        year: '2026',
        location: photographer.location,
        techSpecs: photo.specs || photographer.cameraFormat,
        story: photo.title,
      };

      return {
        ...base,
        id: base.id || `lightbox-${photographer.id}-${index}`,
        title: base.title || photo.title,
        category: base.category || photo.category,
        imageUrl: base.imageUrl || photo.url,
        location: base.location || photographer.location,
        techSpecs: base.techSpecs || photo.specs || photographer.cameraFormat,
      };
    });
  }, [allPhotos, photographer]);

  // Slider State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  // Booking quick config state
  const [selectedPackage, setSelectedPackage] = useState<ShootDurationType>('full-day');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);
    const maxStr = maxDate.toISOString().split('T')[0];
    const candidate = photographer?.nextAvailableDate;
    if (candidate && candidate >= todayStr && candidate <= maxStr) {
      return candidate;
    }
    return todayStr;
  });

  useEffect(() => {
    if (photographer?.nextAvailableDate) {
      const todayStr = new Date().toISOString().split('T')[0];
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 6);
      const maxStr = maxDate.toISOString().split('T')[0];
      if (photographer.nextAvailableDate >= todayStr && photographer.nextAvailableDate <= maxStr) {
        setSelectedDate(photographer.nextAvailableDate);
      } else {
        setSelectedDate(todayStr);
      }
    }
  }, [photographer?.nextAvailableDate]);

  const [activeTab, setActiveTab] = useState<'portfolio' | 'about' | 'gear' | 'pricing'>('portfolio');

  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);
  const [workSlideIndex, setWorkSlideIndex] = useState(0);
  const [isWorksAutoLoop, setIsWorksAutoLoop] = useState(true);

  // Selected Works auto-loop timer
  useEffect(() => {
    const list = photographer?.portfolio || [];
    if (!isWorksAutoLoop || list.length <= 1) return;
    const timer = setInterval(() => {
      setWorkSlideIndex(prev => (prev + 1) % list.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isWorksAutoLoop, photographer?.portfolio]);

  // Auto slider logic
  useEffect(() => {
    if (!isAutoPlaying || allPhotos.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % allPhotos.length);
    }, 4500);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, allPhotos.length]);

  // Keep active thumbnail in view within the container ONLY (never scrolls the window/page)
  useEffect(() => {
    const container = thumbnailScrollRef.current;
    if (!container) return;
    const activeThumb = container.children[currentIndex] as HTMLElement | undefined;
    if (activeThumb) {
      const targetLeft = activeThumb.offsetLeft - (container.clientWidth / 2) + (activeThumb.offsetWidth / 2);
      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (allPhotos.length <= 1) return;
    setCurrentIndex(prev => (prev + 1) % allPhotos.length);
  }, [allPhotos.length]);

  const handlePrev = useCallback(() => {
    if (allPhotos.length <= 1) return;
    setCurrentIndex(prev => (prev - 1 + allPhotos.length) % allPhotos.length);
  }, [allPhotos.length]);

  // Touch swipe support for photo slider
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (allPhotos.length <= 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (allPhotos.length <= 1 || touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (allPhotos.length <= 1) return;
    if (Math.abs(touchDeltaX.current) > 40) {
      if (touchDeltaX.current < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  // Keyboard navigation for image slider
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (allPhotos.length <= 1) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allPhotos.length, handleNext, handlePrev]);

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#181615] flex flex-col">
        <Navbar />
        {/* Breadcrumb Skeleton */}
        <div className="border-b border-[#E7E1DA] bg-white/70 backdrop-blur-sm py-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="h-4 w-44 rounded-full shimmer" />
            <div className="flex gap-2">
              <div className="h-7 w-16 rounded-full shimmer" />
              <div className="h-7 w-16 rounded-full shimmer" />
              <div className="h-7 w-24 rounded-full shimmer" />
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 w-full space-y-10">
          {/* Main Stage Gallery Skeleton */}
          <div className="max-w-5xl mx-auto bg-[#181615] rounded-3xl overflow-hidden shadow-2xl h-[420px] sm:h-[540px] relative shimmer" />

          {/* Bio + Packages Two-Column Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl shimmer" />
                <div className="space-y-2">
                  <div className="h-6 w-48 rounded shimmer" />
                  <div className="h-4 w-32 rounded shimmer" />
                </div>
              </div>
              <div className="h-20 w-full rounded-2xl shimmer" />
              <div className="grid grid-cols-3 gap-3">
                <div className="aspect-[4/5] rounded-2xl shimmer" />
                <div className="aspect-[4/5] rounded-2xl shimmer" />
                <div className="aspect-[4/5] rounded-2xl shimmer" />
              </div>
            </div>
            <div>
              <div className="h-80 w-full rounded-3xl shimmer" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!photographer) {
    let previewData: any = null;
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('mtshoots_photographer_profile');
        if (raw) previewData = JSON.parse(raw);
        if (!previewData) {
          const rawReg = localStorage.getItem('mtshoots_registered_photographers');
          if (rawReg) {
            const list = JSON.parse(rawReg);
            if (Array.isArray(list) && list.length > 0) previewData = list[0];
          }
        }
      }
    } catch {}

    const artistName = previewData?.name || (id ? decodeURIComponent(id).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Verified Photographer');
    const artistCategory = previewData?.primaryCategory || 'Fashion & Editorial Photography';
    const artistLocation = previewData?.location || 'Mumbai, India';
    const artistDayRate = previewData?.dayRate || 600000;
    const artistTurnaround = previewData?.turnaroundDays || 23;
    const artistDeposit = previewData?.advanceDeposit || 25;
    const artistBio = previewData?.bio || 'Celebrated visual artist and commercial photographer specializing in high-impact campaigns and editorial storytelling across India.';

    return (
      <div className="min-h-screen bg-[#181615] text-white flex flex-col justify-between selection:bg-[#C85A32] selection:text-white">
        <Navbar />

        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-20 flex flex-col justify-center items-center text-center relative overflow-hidden">
          {/* Animated Ambient Glow Orbs */}
          <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-[#C85A32]/20 blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-[#D9A05B]/15 blur-3xl pointer-events-none animate-pulse delay-1000" />

          {/* Animated Dual-Ring Aperture Visual */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mb-6"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-[#C85A32]/40 bg-[#241815] flex items-center justify-center relative shadow-2xl shadow-[#C85A32]/30">
              {/* Outer rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-[#C85A32]/60"
              />
              {/* Inner glowing camera aperture */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#C85A32] to-[#D9A05B] flex items-center justify-center text-white shadow-lg">
                <Camera className="w-7 h-7" />
              </div>
            </div>
            {/* Sparkle badge */}
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -bottom-2 inset-x-0 flex justify-center"
            >
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EAF4ED] text-[#2D593E] shadow-md border border-[#2D593E]/30 flex items-center gap-1 whitespace-nowrap">
                <Sparkles className="w-3 h-3 text-[#2D593E]" /> Coming Soon &bull; In Curation
              </span>
            </motion.div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3"
          >
            {artistName}
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto leading-relaxed mb-8"
          >
            This verified photographer&rsquo;s complete editorial portfolio and booking calendar are securely stored in the MTShoots Cloud Database and undergoing final directory synchronization.
          </motion.p>

          {/* Live Data Snapshot Card from DB & Storage */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-2xl bg-[#241815]/90 border border-[#422C24] rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-left space-y-6 mb-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#422C24] pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#D9A05B]">
                <ShieldCheck className="w-4 h-4 text-[#4A7C59]" />
                <span>Stored Database Record &bull; Live Preview</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#36221c] text-[#C85A32] border border-[#C85A32]/40">
                {artistCategory}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#181615]/70 border border-[#422C24]">
                <span className="text-[10px] text-stone-400 block uppercase font-bold">Day Rate</span>
                <span className="text-base font-bold text-white font-sans mt-0.5 block">
                  {formatINR(artistDayRate)}
                </span>
                <span className="text-[10px] text-stone-400">/ full day</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#181615]/70 border border-[#422C24]">
                <span className="text-[10px] text-stone-400 block uppercase font-bold">Base Location</span>
                <span className="text-sm font-bold text-white mt-0.5 block truncate">
                  {artistLocation}
                </span>
                <span className="text-[10px] text-[#4A7C59] font-medium flex items-center gap-1 mt-0.5">
                  <Check className="w-2.5 h-2.5" /> Pan-India Travel
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#181615]/70 border border-[#422C24]">
                <span className="text-[10px] text-stone-400 block uppercase font-bold">Turnaround</span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  {artistTurnaround} Business Days
                </span>
                <span className="text-[10px] text-stone-400">High-Res Delivery</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#181615]/70 border border-[#422C24]">
                <span className="text-[10px] text-stone-400 block uppercase font-bold">Booking Deposit</span>
                <span className="text-sm font-bold text-[#C85A32] mt-0.5 block">
                  {artistDeposit}% Advance
                </span>
                <span className="text-[10px] text-stone-400">Escrow Protected</span>
              </div>
            </div>

            {artistBio && (
              <div className="pt-2 text-xs text-stone-300 leading-relaxed border-t border-[#422C24]/60">
                <span className="font-bold text-white block mb-1">Artist Overview:</span>
                <p className="line-clamp-3 text-stone-400">{artistBio}</p>
              </div>
            )}
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 w-full"
          >
            <Link
              to="/photographers"
              className="px-6 py-3.5 rounded-full bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-[#C85A32]/40 hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Browse Active Directory
            </Link>

            <button
              type="button"
              onClick={() => {
                effectiveOpenBooking({
                  photographer: {
                    id: id || 'new-artist',
                    name: artistName,
                    location: artistLocation,
                    baseCity: artistLocation.split(',')[0].trim(),
                    avatar: previewData?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                    heroImage: previewData?.heroImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
                    primaryCategory: artistCategory,
                    specialties: [artistCategory],
                    experienceLevel: 'professional',
                    experienceYears: 10,
                    rating: 5.0,
                    reviewCount: 1,
                    dayRate: artistDayRate,
                    halfDayRate: Math.round(artistDayRate * 0.6),
                    availableNow: true,
                    nextAvailableDate: new Date().toISOString().split('T')[0],
                    clientRoster: ['MTShoots Verified'],
                    bio: artistBio,
                    awards: ['Verified Artist'],
                    equipment: ['Professional Camera System'],
                    cameraFormat: 'High-Resolution Full Frame',
                    turnaroundDays: artistTurnaround,
                    assistantIncluded: true,
                    portfolio: []
                  },
                  selectedDate: new Date().toISOString().split('T')[0],
                  durationType: 'full-day',
                  usageRights: 'commercial-standard',
                  selectedAddOns: [],
                  totalCost: artistDayRate + 5000,
                  shootLocation: artistLocation
                });
              }}
              className="px-6 py-3.5 rounded-full bg-[#241815] hover:bg-[#36221c] border border-[#422C24] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#C85A32]" /> Request Direct Booking
            </button>

            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.share) {
                  navigator.share({
                    title: `${artistName}  -  MTShoots`,
                    url: window.location.href
                  }).catch(() => {});
                } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Profile link copied to clipboard!');
                }
              }}
              className="px-5 py-3.5 rounded-full bg-[#241815] hover:bg-[#36221c] border border-[#422C24] text-stone-300 hover:text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[#D9A05B]" /> Share Profile
            </button>
          </motion.div>
        </main>

        <Footer />
      </div>
    );
  }

  const isSaved = photographer ? (shortlistIds || []).includes(photographer.id) : false;

  // Pricing calculations with defensive fallbacks
  const effectiveDayRate = photographer?.dayRate || 25000;
  const halfDayPrice = photographer?.halfDayRate || Math.round(effectiveDayRate * 0.6);
  const fullDayPrice = effectiveDayRate;
  const twoDayPrice = Math.round(effectiveDayRate * 1.9);

  const getPackagePrice = (pkg: ShootDurationType) => {
    if (pkg === 'half-day') return halfDayPrice;
    if (pkg === 'full-day') return fullDayPrice;
    return twoDayPrice;
  };

  const handleStartBooking = () => {
    const cost = getPackagePrice(selectedPackage) + 5000; // includes base production
    effectiveOpenBooking({
      photographer,
      selectedDate,
      durationType: selectedPackage,
      usageRights: 'commercial-standard',
      selectedAddOns: [],
      totalCost: cost,
      shootLocation: photographer.location || photographer.baseCity || 'Studio'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${photographer.name}  -  MTShoots`,
        text: `Book ${photographer.name}, verified ${photographer.primaryCategory} photographer on MTShoots.`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  const currentPhoto = allPhotos[currentIndex] || allPhotos[0] || {
    url: photographer?.heroImage || photographer?.avatar || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80',
    title: photographer?.name ? `${photographer.name}  -  Signature Portfolio` : 'Signature Portfolio',
    category: photographer?.primaryCategory || 'Commercial'
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181615] flex flex-col">
      <Navbar />

      {/* Breadcrumb + Quick Bar */}
      <div className="border-b border-[#E7E1DA] bg-white/95 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-[#8a726a] min-w-0">
            <Link to="/photographers" className="hover:text-[#C85A32] flex items-center gap-1 shrink-0">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Photographers</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <span className="text-[#8a726a]/60">/</span>
            <span className="text-[#181615] font-semibold truncate max-w-[100px] xs:max-w-[140px] sm:max-w-none">
              {photographer.name}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            <button
              type="button"
              onClick={() => onToggleSave(photographer.id)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer border ${
                isSaved
                  ? 'bg-[#EAF4ED] text-[#2D593E] border-[#2D593E]/20'
                  : 'bg-white text-[#57423b] border-[#E7E1DA] hover:bg-[#F4EFEB]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#2D593E] text-[#2D593E]' : ''}`} />
              <span className="hidden xs:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-[#57423b] border border-[#E7E1DA] hover:bg-[#F4EFEB] flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-[#4A7C59]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden xs:inline">{copiedShare ? 'Copied' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={handleStartBooking}
              className="px-3 sm:px-4 py-1.5 rounded-full bg-[#C85A32] text-white text-xs font-bold hover:bg-[#B24E2A] transition-transform hover:scale-105 shadow-sm cursor-pointer whitespace-nowrap"
            >
              Book Shoot
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 flex-1 w-full space-y-8">
        {/* ============================================================ */}
        {/* 1. UPPER SIDE: FULL WIDTH ARTIST PROFILE CARD                */}
        {/* ============================================================ */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 pt-7 sm:pt-9 border border-[#E7E1DA] shadow-sm w-full space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            <img
              src={photographer.avatar}
              alt={photographer.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80';
              }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#E7E1DA] shadow-md shrink-0 ring-1 ring-black/5"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2.5 pt-0.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#fbf2ee] text-[#C85A32] border border-[#dec0b7] leading-none inline-flex items-center">
                  {photographer.primaryCategory}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF4ED] text-[#2D593E] border border-[#2D593E]/20 flex items-center gap-1 leading-none">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Artist
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF8F5] text-[#57423b] border border-[#E7E1DA] leading-none inline-flex items-center">
                  {photographer.experienceYears}+ Years Exp.
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#181615] truncate">
                {photographer.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#57423b]">
                <div className="flex items-center gap-1 text-[#181615] font-semibold">
                  <Star className="w-4 h-4 fill-[#D9A05B] text-[#D9A05B]" />
                  <span>{photographer.rating}</span>
                  <span className="text-[#8a726a] font-normal">({photographer.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#C85A32]" />
                  <span>{photographer.location}</span>
                </div>
                <div className="flex items-center gap-1 text-[#4A7C59] font-medium">
                  <Calendar className="w-4 h-4" />
                  <span>Available from {photographer.nextAvailableDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio + Specialties Grid */}
          <div className="pt-6 border-t border-[#E7E1DA] grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-2">
              <h3 className="text-xs uppercase font-bold tracking-wider text-[#8a726a]">
                Artist Biography
              </h3>
              <p className="text-sm text-[#57423b] leading-relaxed">
                {photographer.bio}
              </p>
            </div>
            <div className="md:col-span-4 space-y-2">
              <h3 className="text-xs uppercase font-bold tracking-wider text-[#8a726a]">
                Specializations &amp; Styles
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(photographer.specialties || []).map(spec => (
                  <span
                    key={spec}
                    className="px-2.5 py-1 rounded-full text-xs bg-[#FAF8F5] border border-[#E7E1DA] text-[#181615] font-medium hover:border-[#C85A32] transition-colors"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Camera Equipment & Kit Specs */}
          <div className="pt-5 border-t border-[#E7E1DA]">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-[#C85A32]" />
              <h3 className="font-serif text-sm font-bold text-[#181615]">Primary Camera System &amp; Production Kit</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {(photographer.equipment || []).map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4A7C59] shrink-0" />
                  <span className="font-medium text-[#181615] truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. SLIDER BESIDE OF BOOKING SECTION                          */}
        {/* ============================================================ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Photo Gallery Slider */}
          <div className="lg:col-span-7 xl:col-span-8 w-full min-w-0">
            <div className="bg-[#0d0c0b] rounded-3xl overflow-hidden shadow-xl border border-[#2D2421] w-full">
              {/* Main Stage with Auto-Play & Full Image Visibility */}
              <div
                className="relative h-[320px] xs:h-[380px] sm:h-[440px] md:h-[480px] w-full overflow-hidden select-none flex items-center justify-center"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Ambient Blurred Background of Current Photo */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img
                    src={currentPhoto?.url}
                    alt=""
                    className="w-full h-full object-cover blur-2xl opacity-25 scale-110 transition-opacity duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/50" />
                </div>

                {/* Active Image (Full Image Display, Never Cropped) */}
                <div className="relative z-10 w-full h-full flex items-center justify-center p-3 sm:p-5 pb-16 sm:pb-20">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentPhoto?.url || 'fallback'}
                      src={currentPhoto?.url}
                      alt={currentPhoto?.title || photographer.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80';
                      }}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="max-h-full max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl cursor-pointer hover:brightness-105 transition-all"
                      onClick={() => {
                        const nextItem = lightboxItems[currentIndex] ?? {
                          id: `slide-${currentIndex}`,
                          title: currentPhoto?.title || photographer.name,
                          clientOrSeries: photographer.primaryCategory,
                          category: currentPhoto?.category || photographer.primaryCategory,
                          imageUrl: currentPhoto?.url || '',
                          aspectRatio: '16:9',
                          year: '2026',
                          location: photographer.location,
                          techSpecs: currentPhoto?.specs || photographer.cameraFormat
                        };
                        setLightboxItem(nextItem);
                      }}
                    />
                  </AnimatePresence>
                </div>

                {/* Navigation Arrows (Only when >1 photo) */}
                {allPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/85 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border border-white/20 hover:scale-110 shadow-lg"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/85 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border border-white/20 hover:scale-110 shadow-lg"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </>
                )}

                {/* Top Bar inside Slider: Counter Badge */}
                <div className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-4 z-20 flex items-center justify-start pointer-events-auto">
                  {allPhotos.length > 1 ? (
                    <span className="text-xs text-white/90 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 font-mono shadow-sm">
                      {currentIndex + 1} / {allPhotos.length}
                    </span>
                  ) : <div />}
                </div>

                {/* Bottom Caption & Tech Specs Overlay */}
                <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-4 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-white pointer-events-none">
                  <div>
                    <div className="inline-block text-[10px] uppercase font-bold tracking-widest text-[#D9A05B] mb-0.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-[#D9A05B]/30">
                      {currentPhoto?.category || photographer.primaryCategory}
                    </div>
                    <h3 className="font-serif text-sm sm:text-base font-bold drop-shadow-md truncate max-w-md">
                      {currentPhoto?.title}
                    </h3>
                  </div>

                  {/* Dot Indicators */}
                  {allPhotos.length > 1 && (
                    <div className="flex items-center space-x-1.5 pointer-events-auto py-1">
                      {allPhotos.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentIndex(idx)}
                          className={`transition-all rounded-full cursor-pointer ${
                            currentIndex === idx
                              ? 'w-5 h-1.5 bg-[#C85A32]'
                              : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Thumbnail Strip */}
              {allPhotos.length > 1 && (
                <div
                  ref={thumbnailScrollRef}
                  className="py-2.5 px-3 bg-[#0a0908] flex items-center justify-start sm:justify-center gap-2 overflow-x-auto scrollbar-thin border-t border-white/10"
                >
                  {allPhotos.map((photo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative shrink-0 w-11 h-14 sm:w-13 sm:h-16 rounded-xl overflow-hidden transition-all cursor-pointer border-2 bg-black/50 ${
                        currentIndex === idx
                          ? 'border-[#C85A32] scale-105 shadow-lg shadow-[#C85A32]/40 ring-1 ring-[#C85A32]/30 opacity-100'
                          : 'border-white/15 opacity-55 hover:opacity-95 hover:border-white/40'
                      }`}
                      aria-label={`View frame ${idx + 1}`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=400&q=80';
                        }}
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Booking Direct Box */}
          <div className="lg:col-span-5 xl:col-span-4 w-full">
            <div className="sticky top-28 bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#E7E1DA] shadow-xl space-y-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C85A32]">
                  Booking Direct
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <div className="text-2xl sm:text-3xl font-bold text-[#181615] font-sans">
                    {formatINR(getPackagePrice(selectedPackage))}
                  </div>
                  <span className="text-xs text-[#8a726a]">standard commercial</span>
                </div>
              </div>

              {/* Package Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block">
                  Select Shoot Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'half-day' as ShootDurationType, label: 'Half Day', sub: '4 Hours' },
                    { key: 'full-day' as ShootDurationType, label: 'Full Day', sub: '8 Hours' },
                    { key: 'two-day' as ShootDurationType, label: '2-Day', sub: 'Campaign' },
                  ].map(pkg => (
                    <button
                      key={pkg.key}
                      onClick={() => setSelectedPackage(pkg.key)}
                      className={`p-3 rounded-2xl text-center border-2 transition-all cursor-pointer ${
                        selectedPackage === pkg.key
                          ? 'border-[#C85A32] bg-[#fbf2ee] text-[#181615]'
                          : 'border-[#E7E1DA] hover:border-[#dec0b7] bg-white text-[#57423b]'
                      }`}
                    >
                      <div className="text-xs font-bold">{pkg.label}</div>
                      <div className="text-[10px] text-[#8a726a]">{pkg.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#181615] flex items-center justify-between">
                  <span>Target Shoot Date</span>
                  <span className="text-[#4A7C59] font-medium text-[11px]">Direct Calendar</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  max={(() => {
                    const d = new Date();
                    d.setMonth(d.getMonth() + 6);
                    return d.toISOString().split('T')[0];
                  })()}
                  onChange={e => {
                    const val = e.target.value;
                    const todayStr = new Date().toISOString().split('T')[0];
                    const maxDate = new Date();
                    maxDate.setMonth(maxDate.getMonth() + 6);
                    const maxStr = maxDate.toISOString().split('T')[0];
                    if (val < todayStr) {
                      setSelectedDate(todayStr);
                    } else if (val > maxStr) {
                      setSelectedDate(maxStr);
                    } else {
                      setSelectedDate(val);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-[#E7E1DA] text-sm text-[#181615] focus:outline-none focus:border-[#C85A32] bg-[#FAF8F5]"
                />
              </div>

              {/* Cost Summary Breakdown */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E1DA] space-y-2.5 text-xs">
                {photographer.packageTitle && (
                  <div className="pb-2 border-b border-[#E7E1DA]/80">
                    <span className="text-[10px] uppercase font-bold text-[#8a726a] block">Package Tier</span>
                    <span className="font-bold text-[#181615] text-sm">{photographer.packageTitle}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#57423b]">
                  <span>Photographer Day Rate ({selectedPackage}):</span>
                  <span className="font-semibold text-[#181615]">{formatINR(getPackagePrice(selectedPackage))}</span>
                </div>
                <div className="flex justify-between text-[#57423b]">
                  <span>Delivery Turnaround:</span>
                  <span className="font-semibold text-[#181615]">{photographer.turnaroundDays || 3} Business Days</span>
                </div>
                {photographer.advanceDeposit && (
                  <div className="flex justify-between text-[#57423b]">
                    <span>Advance Booking Deposit:</span>
                    <span className="font-semibold text-[#181615]">{photographer.advanceDeposit}% to secure slot</span>
                  </div>
                )}
                <div className="flex justify-between text-[#57423b]">
                  <span>Studio / Location Assist:</span>
                  <span className="font-semibold text-[#181615]">Included</span>
                </div>
                <div className="flex justify-between text-[#57423b]">
                  <span>Platform Production &amp; Escrow:</span>
                  <span className="font-semibold text-[#181615]">₹5,000</span>
                </div>
                <div className="pt-2 border-t border-[#E7E1DA] flex justify-between font-bold text-sm text-[#181615]">
                  <span>Total Estimated:</span>
                  <span className="text-[#C85A32]">{formatINR(getPackagePrice(selectedPackage) + 5000)}</span>
                </div>
                {photographer.travelPolicy && (
                  <div className="pt-2 border-t border-[#E7E1DA]/70 text-[11px] text-[#8a726a]">
                    <span className="font-semibold text-[#57423b]">Travel Policy: </span>
                    {photographer.travelPolicy}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={handleStartBooking}
                  className="w-full py-4 rounded-full bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold text-sm shadow-lg hover:shadow-[#C85A32]/30 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <Calendar className="w-4 h-4" /> Book This Photographer
                </button>
                <button
                  onClick={() => onToggleSave(photographer.id)}
                  className="w-full py-3 rounded-full bg-[#FAF8F5] hover:bg-[#F4EFEB] text-[#181615] font-semibold text-xs border border-[#E7E1DA] transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#2D593E] text-[#2D593E]' : ''}`} />
                  <span>{isSaved ? 'Saved to Shortlist' : 'Add to Shortlist'}</span>
                </button>
              </div>

              {/* Trust badges */}
              <div className="space-y-2 pt-2 text-[11px] text-[#8a726a]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4A7C59] shrink-0" />
                  <span>Verified Identity, Pan India Travel Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#D9A05B] shrink-0" />
                  <span>Free cancellation up to 7 days before shoot</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-[#E7E1DA] shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a726a]">Next part</p>
              <h3 className="font-serif text-2xl font-bold text-[#181615] mt-1">Coming Soon</h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E7E1DA] text-xs font-semibold text-[#57423b]">
              More profile sections in progress
            </span>
          </div>
          <p className="mt-4 text-sm text-[#57423b] leading-relaxed">
            This photographer profile is live and ready for bookings. Additional storytelling and expanded portfolio sections will be released in the next update.
          </p>
        </section>

        {/* ============================================================ */}
        {/* 3. SELECTED WORKS AUTO-LOOP SLIDER + HONORS & AWARDS         */}
        {/* ============================================================ */}
        {Boolean(photographer.portfolio && photographer.portfolio.length > 0) && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Selected Works Auto-loop Slider with Dots Transition */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
            <div
              className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E7E1DA] shadow-sm flex flex-col justify-between h-full relative"
              onMouseEnter={() => setIsWorksAutoLoop(false)}
              onMouseLeave={() => setIsWorksAutoLoop(true)}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#181615]">Selected Works</h3>
                  <p className="text-xs text-[#8a726a] mt-0.5">Click any frame to view in high-resolution lightbox</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#8a726a] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#E7E1DA]">
                    {(photographer.portfolio || []).length > 0
                      ? `${workSlideIndex + 1} / ${(photographer.portfolio || []).length}`
                      : '0 Projects'}
                  </span>
                  {(photographer.portfolio || []).length > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setWorkSlideIndex(
                            p => (p - 1 + (photographer.portfolio || []).length) % (photographer.portfolio || []).length
                          )
                        }
                        className="w-8 h-8 rounded-full border border-[#E7E1DA] bg-white hover:bg-[#FAF8F5] text-[#181615] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                        aria-label="Previous work"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setWorkSlideIndex(p => (p + 1) % (photographer.portfolio || []).length)
                        }
                        className="w-8 h-8 rounded-full border border-[#E7E1DA] bg-white hover:bg-[#FAF8F5] text-[#181615] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                        aria-label="Next work"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Slider Stage with auto-loop */}
              {(photographer.portfolio || []).length > 0 && (
                <div className="space-y-3">
                  <div
                    onClick={() => {
                      const item = (photographer.portfolio || [])[workSlideIndex];
                      if (item) setLightboxItem(item);
                    }}
                    className="group relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] bg-[#181615] border border-[#E7E1DA] cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    {/* Ambient blurred backdrop */}
                    <img
                      src={(photographer.portfolio || [])[workSlideIndex]?.imageUrl}
                      alt=""
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none transition-opacity duration-500"
                    />
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={(photographer.portfolio || [])[workSlideIndex]?.id || workSlideIndex}
                        src={(photographer.portfolio || [])[workSlideIndex]?.imageUrl}
                        alt={(photographer.portfolio || [])[workSlideIndex]?.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80';
                        }}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="relative z-10 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      />
                    </AnimatePresence>

                    {/* Gradient Overlay & Details */}
                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-4 sm:p-6 flex flex-col justify-end text-white">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#D9A05B]">
                        {(photographer.portfolio || [])[workSlideIndex]?.category} • {(photographer.portfolio || [])[workSlideIndex]?.year}
                      </span>
                      <h4 className="font-serif text-base sm:text-lg font-bold">
                        {(photographer.portfolio || [])[workSlideIndex]?.title}
                      </h4>
                      <p className="text-xs text-white/70 font-mono mt-0.5">
                        {(photographer.portfolio || [])[workSlideIndex]?.techSpecs}
                      </p>
                    </div>
                  </div>

                  {/* Dots Transition Indicator inside/below */}
                  {(photographer.portfolio || []).length > 1 && (
                    <div className="flex justify-center items-center gap-1.5 pt-1">
                      {(photographer.portfolio || []).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setWorkSlideIndex(i)}
                          className={`transition-all duration-300 rounded-full cursor-pointer ${
                            workSlideIndex === i ? 'w-6 h-1.5 bg-[#C85A32]' : 'w-1.5 h-1.5 bg-[#E7E1DA] hover:bg-[#8a726a]'
                          }`}
                          aria-label={`Go to project ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Honors, Awards & Selected Clients */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E7E1DA] shadow-sm flex flex-col justify-between h-full space-y-5">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#181615] mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#D9A05B]" /> Honors, Awards &amp; Selected Clients
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#8a726a] mb-2.5">
                      Recognitions
                    </h4>
                    <ul className="space-y-2">
                      {(photographer.awards || []).map((award, i) => (
                        <li key={i} className="text-xs text-[#57423b] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] shrink-0" />
                          <span>{award}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-[#E7E1DA]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#8a726a] mb-2.5">
                      Selected Brands &amp; Clients
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(photographer.clientRoster || []).map((client, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-xs bg-[#FAF8F5] border border-[#E7E1DA] font-medium text-[#181615]"
                        >
                          {client}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E7E1DA] flex items-center justify-between text-xs text-[#8a726a]">
                <span>Commercial Standard Rights</span>
                <span className="font-semibold text-[#4A7C59]">✓ Pan-India Coverage</span>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* ============================================================ */}
        {/* 4. STUDIO MAP & ADDRESS WITH ICON-ONLY CONTROLS INSIDE MAP  */}
        {/* ============================================================ */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E1DA] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E7E1DA] flex items-center justify-center shrink-0 text-[#C85A32]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#181615]">
                  Studio &amp; Production Base
                </h3>
                <p className="text-xs sm:text-sm text-[#8a726a] mt-0.5">
                  {photographer.officeAddress || photographer.officeLocation || photographer.location}
                </p>
              </div>
            </div>
            <div className="text-xs text-[#4A7C59] font-medium flex items-center gap-1.5 shrink-0 bg-[#EAF4ED] px-3 py-1.5 rounded-full border border-[#2D593E]/15">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Physical Studio Location</span>
            </div>
          </div>

          {/* Interactive Google Map with Icon-Only Floating Controls Inside */}
          <div className="relative w-full h-72 sm:h-80 md:h-96 rounded-2xl overflow-hidden border border-[#E7E1DA] bg-[#FAF8F5]">
            {/* Floating Icon-Only Action Buttons Inside The Map */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  (photographer.officeAddress || photographer.officeLocation || photographer.location) + ', India'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-[#181615] hover:text-[#C85A32] shadow-md hover:shadow-lg flex items-center justify-center transition-all backdrop-blur-md border border-[#E7E1DA] hover:scale-105"
                title="Open in Google Maps"
                aria-label="Open in Google Maps"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={handleShare}
                className="w-10 h-10 rounded-xl bg-white/95 hover:bg-white text-[#181615] hover:text-[#C85A32] shadow-md hover:shadow-lg flex items-center justify-center transition-all backdrop-blur-md border border-[#E7E1DA] hover:scale-105 cursor-pointer"
                title="Share Studio Location"
                aria-label="Share Studio Location"
              >
                {copiedShare ? <Check className="w-4 h-4 text-[#4A7C59]" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>

            <iframe
              title={`${photographer.name} Studio Location Map`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                (photographer.officeAddress || photographer.officeLocation || photographer.location) + ', India'
              )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-[#8a726a] pt-1 gap-2">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D9A05B]" />
              <span>Studio visits by advance booking appointment only</span>
            </span>
            <span>{photographer.location}</span>
          </div>
        </section>
      </main>

      {/* Lightbox */}
      {lightboxItem && (
        <MediaLightbox
          item={lightboxItem}
          allItems={lightboxItems}
          onClose={() => setLightboxItem(null)}
          onNavigate={item => setLightboxItem(item)}
          onBookSimilar={handleStartBooking}
        />
      )}

      <Footer />
    </div>
  );
};


export default PhotographerProfilePage;
