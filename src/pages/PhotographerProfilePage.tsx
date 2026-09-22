'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from '@/lib/navigation';
import { useApp } from '@/context/AppContext';
import {
  Camera, Star, MapPin, Calendar, Clock, Award, ShieldCheck,
  Heart, Share2, ArrowLeft, ChevronLeft, ChevronRight, Check,
  Sparkles, CheckCircle2, Maximize2, ExternalLink, Zap, Info,
  Sliders, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_PHOTOGRAPHERS, AVAILABLE_ADDONS } from '../data/photographers';
import { Photographer, PortfolioItem, ShootDurationType, UsageRightsTier } from '../types';
import { formatINR } from '../utils/format';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MediaLightbox } from '../components/MediaLightbox';

interface PhotographerProfilePageProps {
  onOpenBooking: (config: {
    photographer: Photographer;
    selectedDate: string;
    durationType: ShootDurationType;
    usageRights: UsageRightsTier;
    selectedAddOns: string[];
    totalCost: number;
    shootLocation: string;
  }) => void;
  shortlistIds: string[];
  onToggleSave: (id: string) => void;
}

export const PhotographerProfilePage: React.FC<PhotographerProfilePageProps> = ({
  onOpenBooking,
  shortlistIds,
  onToggleSave
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const photographer = INITIAL_PHOTOGRAPHERS.find(p => p.id === id);

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

    // Hero image first
    if (photographer.heroImage) {
      list.push({
        url: photographer.heroImage,
        title: `${photographer.name}  -  Signature Frame`,
        category: photographer.primaryCategory,
        specs: photographer.cameraFormat
      });
      seen.add(normalizeUrl(photographer.heroImage));
    }

    // Home slider photos
    if (photographer.homeSliderPhotos) {
      photographer.homeSliderPhotos.forEach((img, i) => {
        const norm = normalizeUrl(img);
        if (img && !seen.has(norm)) {
          list.push({
            url: img,
            title: `${photographer.primaryCategory} Series #${i + 1}`,
            category: photographer.primaryCategory,
            specs: photographer.cameraFormat
          });
          seen.add(norm);
        }
      });
    }

    // Portfolio items
    if (photographer.portfolio) {
      photographer.portfolio.forEach(item => {
        const norm = normalizeUrl(item.imageUrl);
        if (item.imageUrl && !seen.has(norm)) {
          list.push({
            url: item.imageUrl,
            title: item.title,
            category: item.category,
            specs: item.techSpecs,
            item
          });
          seen.add(norm);
        }
      });
    }

    return list;
  }, [photographer]);

  // Slider State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  // Booking quick config state
  const [selectedPackage, setSelectedPackage] = useState<ShootDurationType>('full-day');
  const [selectedDate, setSelectedDate] = useState<string>(
    photographer?.nextAvailableDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [activeTab, setActiveTab] = useState<'portfolio' | 'about' | 'gear' | 'pricing'>('portfolio');

  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

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
    setCurrentIndex(prev => (prev + 1) % allPhotos.length);
  }, [allPhotos.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + allPhotos.length) % allPhotos.length);
  }, [allPhotos.length]);

  if (!photographer) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto my-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#fbf2ee] flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-[#C85A32]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#181615] mb-2">Photographer Not Found</h2>
          <p className="text-sm text-[#57423b] mb-6">
            The photographer profile you are looking for does not exist or has been relocated.
          </p>
          <Link
            to="/photographers"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C85A32] text-white text-sm font-semibold hover:bg-[#B24E2A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Browse All Photographers
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isSaved = shortlistIds.includes(photographer.id);

  // Pricing calculations
  const halfDayPrice = photographer.halfDayRate || Math.round(photographer.dayRate * 0.6);
  const fullDayPrice = photographer.dayRate;
  const twoDayPrice = Math.round(photographer.dayRate * 1.9);

  const getPackagePrice = (pkg: ShootDurationType) => {
    if (pkg === 'half-day') return halfDayPrice;
    if (pkg === 'full-day') return fullDayPrice;
    return twoDayPrice;
  };

  const handleStartBooking = () => {
    const cost = getPackagePrice(selectedPackage) + 5000; // includes base production
    onOpenBooking({
      photographer,
      selectedDate,
      durationType: selectedPackage,
      usageRights: 'commercial-standard',
      selectedAddOns: [],
      totalCost: cost,
      shootLocation: photographer.location
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

  const currentPhoto = allPhotos[currentIndex] || allPhotos[0];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181615] flex flex-col">
      <Navbar />

      {/* Breadcrumb + Quick Bar */}
      <div className="border-b border-[#E7E1DA] bg-white/70 backdrop-blur-sm sticky top-16 sm:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-[#8a726a]">
            <Link to="/photographers" className="hover:text-[#C85A32] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Photographers
            </Link>
            <span>/</span>
            <span className="text-[#181615] font-semibold truncate max-w-[140px] sm:max-w-none">
              {photographer.name}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => onToggleSave(photographer.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isSaved
                  ? 'bg-[#EAF4ED] text-[#2D593E] border-[#2D593E]/20'
                  : 'bg-white text-[#57423b] border-[#E7E1DA] hover:bg-[#F4EFEB]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#2D593E] text-[#2D593E]' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-[#57423b] border border-[#E7E1DA] hover:bg-[#F4EFEB] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-[#4A7C59]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedShare ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={handleStartBooking}
              className="px-4 py-1.5 rounded-full bg-[#C85A32] text-white text-xs font-bold hover:bg-[#B24E2A] transition-transform hover:scale-105 shadow-sm cursor-pointer"
            >
              Book Shoot
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 w-full space-y-10">

        {/* ============================================================ */}
        {/* UNIQUE PHOTO SLIDER (FULL IMAGES VISIBLE + AMBIENT BACKDROP) */}
        {/* ============================================================ */}
        <section className="max-w-5xl mx-auto bg-[#0d0c0b] rounded-3xl overflow-hidden shadow-2xl border border-[#2D2421]">
          {/* Main Stage with Auto-Play & Full Image Visibility */}
          <div
            className="relative h-[480px] sm:h-[560px] md:h-[620px] w-full overflow-hidden select-none flex items-center justify-center"
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
            <div className="relative z-10 w-full h-full flex items-center justify-center p-3 sm:p-5 pb-20 sm:pb-24">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPhoto?.url || 'fallback'}
                  src={currentPhoto?.url}
                  alt={currentPhoto?.title || photographer.name}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="max-h-full max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl cursor-pointer hover:brightness-105 transition-all"
                  onClick={() => {
                    if (currentPhoto?.item) {
                      setLightboxItem(currentPhoto.item);
                    } else {
                      setLightboxItem({
                        id: `slide-${currentIndex}`,
                        title: currentPhoto?.title || photographer.name,
                        clientOrSeries: photographer.primaryCategory,
                        category: photographer.primaryCategory,
                        imageUrl: currentPhoto?.url || '',
                        aspectRatio: '16:9',
                        year: '2026',
                        location: photographer.location,
                        techSpecs: currentPhoto?.specs || photographer.cameraFormat
                      });
                    }
                  }}
                />
              </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/85 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border border-white/20 hover:scale-110 shadow-lg"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/85 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border border-white/20 hover:scale-110 shadow-lg"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Top Bar inside Slider: Counter Badge & Fullscreen Lightbox trigger */}
            <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-auto">
              <span className="text-xs text-white/90 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 font-mono shadow-sm">
                {currentIndex + 1} / {allPhotos.length}
              </span>

              <button
                type="button"
                onClick={() => {
                  if (currentPhoto?.item) {
                    setLightboxItem(currentPhoto.item);
                  }
                }}
                className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105 border border-white/20 cursor-pointer shadow-sm"
                title="View Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Caption & Tech Specs Overlay */}
            <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 text-white pointer-events-none">
              <div>
                <div className="inline-block text-[10px] uppercase font-bold tracking-widest text-[#D9A05B] mb-1 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-[#D9A05B]/30">
                  {currentPhoto?.category || photographer.primaryCategory}
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold drop-shadow-md">
                  {currentPhoto?.title}
                </h3>
                {currentPhoto?.specs && (
                  <p className="text-[11px] text-white/70 font-mono drop-shadow-sm">
                    {currentPhoto.specs}
                  </p>
                )}
              </div>

              {/* Dot Indicators */}
              <div className="flex items-center space-x-1.5 pointer-events-auto py-1">
                {allPhotos.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`transition-all rounded-full cursor-pointer ${
                      currentIndex === idx
                        ? 'w-6 h-1.5 bg-[#C85A32]'
                        : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Thumbnail Strip (Manual Click Navigation) */}
          <div
            ref={thumbnailScrollRef}
            className="py-3.5 px-4 bg-[#0a0908] flex items-center justify-start sm:justify-center gap-2.5 sm:gap-3 overflow-x-auto scrollbar-thin border-t border-white/10"
          >
            {allPhotos.map((photo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative shrink-0 w-13 h-18 sm:w-15 sm:h-20 rounded-xl overflow-hidden transition-all cursor-pointer border-2 bg-black/50 ${
                  currentIndex === idx
                    ? 'border-[#C85A32] scale-105 shadow-lg shadow-[#C85A32]/40 ring-2 ring-[#C85A32]/30 opacity-100'
                    : 'border-white/15 opacity-55 hover:opacity-95 hover:border-white/40'
                }`}
                aria-label={`View frame ${idx + 1}`}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover object-top"
                />
              </button>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* ARTIST PROFILE HEADER & OVERVIEW GRID                         */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Artist Bio, Categories, Gear, Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E1DA] shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <img
                  src={photographer.avatar}
                  alt={photographer.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#E7E1DA] shadow-md shrink-0"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fbf2ee] text-[#C85A32] border border-[#dec0b7]">
                      {photographer.primaryCategory}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF4ED] text-[#2D593E] border border-[#2D593E]/20 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Artist
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF8F5] text-[#57423b] border border-[#E7E1DA]">
                      {photographer.experienceYears}+ Years Exp.
                    </span>
                  </div>

                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181615]">
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

              {/* Bio */}
              <div className="mt-6 pt-6 border-t border-[#E7E1DA]">
                <h3 className="text-xs uppercase font-bold tracking-wider text-[#8a726a] mb-2">
                  Artist Biography
                </h3>
                <p className="text-sm text-[#57423b] leading-relaxed">
                  {photographer.bio}
                </p>
              </div>

              {/* Specialties */}
              <div className="mt-6">
                <h3 className="text-xs uppercase font-bold tracking-wider text-[#8a726a] mb-2.5">
                  Specializations & Styles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {photographer.specialties.map(spec => (
                    <span
                      key={spec}
                      className="px-3 py-1 rounded-full text-xs bg-[#FAF8F5] border border-[#E7E1DA] text-[#181615] font-medium hover:border-[#C85A32] transition-colors"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Camera Equipment & Production Kit */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E1DA] shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#fbf2ee] flex items-center justify-center">
                  <Camera className="w-4 h-4 text-[#C85A32]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#181615]">Camera Equipment &amp; Kit</h3>
                  <p className="text-xs text-[#8a726a]">Professional calibrated gear included in all bookings</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {photographer.equipment.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E1DA] flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#4A7C59] shrink-0" />
                    <span className="text-xs font-medium text-[#181615]">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-[#E7E1DA] flex flex-wrap items-center justify-between text-xs text-[#57423b] gap-2">
                <div>
                  <span className="font-semibold text-[#181615]">Primary Camera System: </span>
                  <span>{photographer.cameraFormat}</span>
                </div>
                <div>
                  <span className="font-semibold text-[#181615]">Turnaround: </span>
                  <span>{photographer.turnaroundDays} Business Days</span>
                </div>
                <div>
                  <span className="font-semibold text-[#181615]">Assistant: </span>
                  <span>{photographer.assistantIncluded ? 'Included' : 'Available as Add-On'}</span>
                </div>
              </div>
            </div>

            {/* Awards & Client Roster */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E1DA] shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#181615] mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#D9A05B]" /> Honors, Awards &amp; Selected Clients
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8a726a] mb-2.5">
                    Recognitions
                  </h4>
                  <ul className="space-y-2">
                    {photographer.awards.map((award, i) => (
                      <li key={i} className="text-xs text-[#57423b] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
                        <span>{award}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8a726a] mb-2.5">
                    Selected Brands &amp; Clients
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {photographer.clientRoster.map((client, i) => (
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

            {/* Portfolio Grid Breakdown */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E1DA] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#181615]">Selected Works</h3>
                  <p className="text-xs text-[#8a726a] mt-0.5">Click any image to view in high resolution lightbox</p>
                </div>
                <span className="text-xs font-mono text-[#8a726a] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E7E1DA]">
                  {photographer.portfolio.length} Projects
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {photographer.portfolio.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setLightboxItem(item)}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] bg-[#181615] border border-[#E7E1DA] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Ambient blurred backdrop */}
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-110 pointer-events-none"
                    />
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="relative z-10 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end text-white">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#D9A05B]">
                        {item.category} • {item.year}
                      </span>
                      <h4 className="font-serif text-base font-bold">{item.title}</h4>
                      <p className="text-xs text-white/70 font-mono mt-0.5">{item.techSpecs}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Sticky Booking Box & Packages */}
          <div className="space-y-6">
            <div className="sticky top-32 bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#E7E1DA] shadow-xl space-y-6">
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
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E7E1DA] text-sm text-[#181615] focus:outline-none focus:border-[#C85A32] bg-[#FAF8F5]"
                />
              </div>

              {/* Cost Summary Breakdown */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E1DA] space-y-2 text-xs">
                <div className="flex justify-between text-[#57423b]">
                  <span>Photographer Day Rate ({selectedPackage}):</span>
                  <span className="font-semibold text-[#181615]">{formatINR(getPackagePrice(selectedPackage))}</span>
                </div>
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
        </div>
      </main>

      {/* Lightbox */}
      {lightboxItem && (
        <MediaLightbox
          item={lightboxItem}
          allItems={photographer.portfolio}
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
