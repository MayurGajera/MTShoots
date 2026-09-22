import React, { useState, useCallback, useRef } from 'react';
import { Star, MapPin, Heart, ArrowRight, ShieldCheck, Clock, Sparkles, Award, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Photographer } from '../types';
import { formatINR } from '../utils/format';
import { Button } from './ui/button';

interface PhotographerCardProps {
  photographer: Photographer;
  onSelect?: (p: Photographer) => void;
  onQuickBook: (p: Photographer) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onOpenLightboxImage?: (imgUrl: string, title: string) => void;
}

export const PhotographerCard: React.FC<PhotographerCardProps> = ({
  photographer,
  onSelect,
  onQuickBook,
  isSaved,
  onToggleSave
}) => {
  const navigate = useNavigate();

  // Build slider images from homeSliderPhotos + heroImage fallback
  const sliderImages: string[] = (() => {
    const photos = photographer.homeSliderPhotos && photographer.homeSliderPhotos.length > 0
      ? photographer.homeSliderPhotos
      : [photographer.heroImage];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const img of photos) {
      if (img && !seen.has(img)) { seen.add(img); result.push(img); }
    }
    return result;
  })();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const goNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setImgLoaded(false);
    setCurrentIndex(i => (i + 1) % sliderImages.length);
  }, [sliderImages.length]);

  const goPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setImgLoaded(false);
    setCurrentIndex(i => (i - 1 + sliderImages.length) % sliderImages.length);
  }, [sliderImages.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(touchDeltaX.current) > 10) setIsDragging(true);
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 50) {
      setImgLoaded(false);
      if (touchDeltaX.current < 0) {
        setCurrentIndex(i => (i + 1) % sliderImages.length);
      } else {
        setCurrentIndex(i => (i - 1 + sliderImages.length) % sliderImages.length);
      }
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleCardNavigate = () => {
    if (isDragging) return;
    if (onSelect) onSelect(photographer);
    navigate(`/photographers/${photographer.id}`);
  };

  const getExperienceBadge = () => {
    switch (photographer.experienceLevel) {
      case 'master':
        return { label: 'Master', className: 'bg-[#FBF3E8] text-[#8C531B] border-[#F0D5B8]' };
      case 'professional':
        return { label: 'Pro', className: 'bg-[#EAF4ED] text-[#2D593E] border-[#D1E6D6]' };
      default:
        return { label: 'Emerging', className: 'bg-[#FAF8F5] text-[#57423b] border-[#E7E1DA]' };
    }
  };

  const expBadge = getExperienceBadge();
  const hasMultipleImages = sliderImages.length > 1;

  return (
    <motion.article
      id={`photographer-card-${photographer.id}`}
      whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
      className="group bg-white rounded-3xl border border-[#E7E1DA] overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-2xl hover:border-[#dec0b7]"
    >
      {/* ── Image Slider ── */}
      <div
        className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden bg-[#181615] cursor-pointer select-none"
        onClick={handleCardNavigate}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Ambient blurred backdrop for seamless color tones */}
        <img
          src={sliderImages[currentIndex]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-110 pointer-events-none"
        />

        {/* Current image */}
        {!imgLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}
        <img
          key={sliderImages[currentIndex]}
          src={sliderImages[currentIndex]}
          alt={`${photographer.name} — ${photographer.primaryCategory} photography`}
          className={`relative z-10 w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
            setImgLoaded(true);
          }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-85 group-hover:opacity-70 transition-opacity" />

        {/* ── Slider Controls ── */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/75 cursor-pointer shadow-md"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/75 cursor-pointer shadow-md"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-12 inset-x-0 z-20 flex items-center justify-center gap-1 pointer-events-none">
              {sliderImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Top Bar: Availability + Save ── */}
        <div className="absolute top-3.5 inset-x-3.5 z-20 flex items-center justify-between pointer-events-none">
          {photographer.availableNow ? (
            <span className="pointer-events-auto inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF4ED]/95 backdrop-blur-md text-[#2D593E] shadow-sm border border-[#D1E6D6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4A7C59] animate-pulse" />
              <span>Available Now</span>
            </span>
          ) : (
            <span className="pointer-events-auto inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FBF3E8]/95 backdrop-blur-md text-[#8C531B] shadow-sm border border-[#E7E1DA]">
              <Clock className="w-3 h-3" />
              <span>From {photographer.nextAvailableDate}</span>
            </span>
          )}

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleSave(photographer.id); }}
            title={isSaved ? 'Remove from Saved' : 'Save Photographer'}
            className={`pointer-events-auto w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-md ${
              isSaved ? 'bg-[#C85A32] text-white scale-105' : 'bg-black/40 text-white hover:bg-black/60 hover:scale-105'
            }`}
          >
            <Heart className={`w-4 h-4 transition-transform ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* ── Bottom: Location + Rating ── */}
        <div className="absolute bottom-3.5 inset-x-3.5 z-20 text-white flex items-end justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-xs text-white/95 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>{photographer.location}</span>
            </div>
            <div className="text-[11px] text-white/70 mt-0.5 tracking-wider uppercase font-semibold">
              {photographer.cameraFormat}
            </div>
          </div>

          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-xs text-white font-medium">
            <Star className="w-3.5 h-3.5 text-[#D9A05B] fill-[#D9A05B]" />
            <span className="font-bold">{photographer.rating}</span>
            <span className="text-white/60 text-[11px]">({photographer.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            {photographer.primaryCategory && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fbf2ee] text-[#C85A32] border border-[#dec0b7]">
                <Camera className="w-3 h-3" />
                <span>{photographer.primaryCategory}</span>
              </span>
            )}
            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${expBadge.className}`}>
              <Award className="w-3 h-3" />
              <span>{expBadge.label}</span>
            </span>
          </div>

          {/* Name + Verified */}
          <div className="flex items-baseline justify-between gap-2">
            <Link
              to={`/photographers/${photographer.id}`}
              className="font-serif text-xl font-bold text-[#181615] hover:text-[#C85A32] transition-colors leading-tight"
            >
              {photographer.name}
            </Link>
            <div className="flex items-center text-xs text-[#4A7C59] font-semibold shrink-0" title="Verified Photographer">
              <ShieldCheck className="w-4 h-4 mr-0.5" />
              <span>Verified</span>
            </div>
          </div>

          {/* Short bio */}
          <p className="mt-2 text-xs text-[#57423b] line-clamp-2 leading-relaxed">
            {photographer.bio}
          </p>
        </div>

        {/* ── Price + Action ── */}
        <div className="pt-3.5 border-t border-[#E7E1DA] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#8a726a] font-bold block">
              Starting from
            </span>
            <span className="text-lg font-bold text-[#181615] tabular-nums font-sans">
              {formatINR(photographer.dayRate)}
              <span className="text-xs font-normal text-[#8a726a]"> /day</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              id={`book-photographer-${photographer.id}`}
              variant="terracotta"
              size="sm"
              onClick={() => onQuickBook(photographer)}
              className="text-xs font-bold px-3.5 cursor-pointer hover:scale-[1.03] transition-transform shadow-sm"
            >
              Book Now
            </Button>
            <Link
              to={`/photographers/${photographer.id}`}
              className="h-8 w-8 rounded-full border border-[#E7E1DA] flex items-center justify-center text-[#181615] hover:bg-[#F4EFEB] hover:border-[#C85A32] transition-all cursor-pointer"
              title="View full profile"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
};
