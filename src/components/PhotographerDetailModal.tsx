'use client';
import React, { useState } from 'react';
import {
  X,
  Star,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Camera,
  Award,
  ChevronRight,
  Heart,
  FileText,
  Share2
} from 'lucide-react';
import { Photographer, PortfolioItem, ShootDurationType, UsageRightsTier } from '../types';
import { AVAILABLE_ADDONS } from '../data/photographers';
import { formatINR } from '../utils/format';

interface PhotographerDetailModalProps {
  photographer: Photographer;
  onClose: () => void;
  onStartBooking: (config: {
    photographer: Photographer;
    selectedDate: string;
    durationType: ShootDurationType;
    usageRights: UsageRightsTier;
    selectedAddOns: string[];
    totalCost: number;
    shootLocation: string;
  }) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onOpenLightbox: (item: PortfolioItem) => void;
}

export const PhotographerDetailModal: React.FC<PhotographerDetailModalProps> = ({
  photographer,
  onClose,
  onStartBooking,
  isSaved,
  onToggleSave,
  onOpenLightbox
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-29');
  const [durationType, setDurationType] = useState<ShootDurationType>('full-day');
  const [usageRights] = useState<UsageRightsTier>('commercial-standard');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(['medium-format']);
  const [isCallSheetStripExpanded, setIsCallSheetStripExpanded] = useState(true);
  const [activePortfolioTab, setActivePortfolioTab] = useState<string>('all');
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [shootLocation, setShootLocation] = useState<string>(photographer.officeLocation || photographer.location);

  const durationMultiplier = durationType === 'half-day' ? 0.6 : durationType === 'full-day' ? 1 : durationType === 'two-day' ? 1.9 : 2.7;
  const baseRate = Math.round(photographer.dayRate * durationMultiplier);
  const usageMultiplier = usageRights === 'editorial' ? 0.25 : usageRights === 'commercial-standard' ? 0.45 : usageRights === 'commercial-global' ? 0.75 : 1.2;
  const usageCost = Math.round(photographer.dayRate * usageMultiplier);

  const addOnsTotal = selectedAddOns.reduce((sum, addOnId) => {
    const item = AVAILABLE_ADDONS.find((a) => a.id === addOnId);
    return sum + (item ? item.price : 0);
  }, 0);

  const productionFee = 5000;
  const totalCost = baseRate + usageCost + addOnsTotal + productionFee;

  const toggleAddOn = (id: string) => {
    if (selectedAddOns.includes(id)) {
      setSelectedAddOns(selectedAddOns.filter((item) => item !== id));
    } else {
      setSelectedAddOns([...selectedAddOns, id]);
    }
  };

  const locationOptions = [
    {
      value: photographer.officeLocation || photographer.location,
      label: 'Studio / Office',
      description: photographer.officeAddress || photographer.location
    },
    {
      value: photographer.location,
      label: 'Main shoot city',
      description: photographer.location
    }
  ];

  const daysInMonth = 30;
  const startDayOfWeek = 2;
  const calendarDays: Array<{ day: number; dateStr: string; isPast: boolean; isAvailable: boolean; isSelected: boolean } | null> = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `2026-09-${day.toString().padStart(2, '0')}`;
    const isPast = day < 21;
    const isAvailable = !isPast && day % 2 === 0;
    const isSelected = selectedDate === dateStr;
    calendarDays.push({ day, dateStr, isPast, isAvailable, isSelected });
  }

  const displayedPortfolio = activePortfolioTab === 'all'
    ? photographer.portfolio
    : photographer.portfolio.filter((p) => p.category === activePortfolioTab);

  const uniqueCategories = Array.from(new Set(photographer.portfolio.map((p) => p.category)));

  const handleShareProfile = async () => {
    const shareText = `${photographer.name}  -  ${photographer.location}  -  ${window.location.href}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1800);
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#181615]/75 backdrop-blur-sm flex justify-center p-0 md:p-4 lg:p-6 animate-fadeIn">
      <div className="bg-[#FAF8F5] w-full max-w-7xl min-h-screen md:min-h-0 md:rounded-2xl border border-[#E7E1DA] overflow-hidden shadow-2xl flex flex-col my-auto">
        <div className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md px-6 py-4 border-b border-[#E7E1DA] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#57423b]">
              Photographer Profile &amp; Booking
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleShareProfile}
              className="p-2 rounded-full bg-white border border-[#E7E1DA] text-[#181615] hover:bg-[#F4EFEB] transition-colors cursor-pointer"
              title="Share profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onToggleSave(photographer.id)}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isSaved
                  ? 'bg-[#C85A32] text-white border-[#C85A32]'
                  : 'bg-white text-[#181615] border-[#E7E1DA] hover:bg-[#F4EFEB]'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save to Shortlist'}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              id="close-photographer-modal-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-white border border-[#E7E1DA] text-[#181615] hover:bg-[#F4EFEB] transition-colors cursor-pointer"
              title="Close Profile"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-[#E7E1DA] space-y-8 overflow-y-auto">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <img
                src={photographer.avatar}
                alt={photographer.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-[#E7E1DA] shadow-md shrink-0"
              />
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF4ED] text-[#2D593E] border border-[#D1E6D6] flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4A7C59]"></span>
                    <span>Verified Professional Photographer</span>
                  </span>
                  {photographer.primaryCategory && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fbf2ee] text-[#C85A32] border border-[#dec0b7] flex items-center space-x-1">
                      <Camera className="w-3 h-3 text-[#C85A32]" />
                      <span>{photographer.primaryCategory}</span>
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF6E9] text-[#9A6214] border border-[#F4D39A] flex items-center space-x-1">
                    <Award className="w-3 h-3" />
                    <span className="capitalize">{photographer.experienceLevel} Tier ({photographer.experienceYears}y exp)</span>
                  </span>
                  <span className="text-xs text-[#8a726a]">• {photographer.cameraFormat}</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181615] tracking-tight">
                  {photographer.name}
                </h1>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#57423b]">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-[#C85A32] mr-1" />
                    {photographer.location}
                  </span>
                  <span className="flex items-center">
                    <Star className="w-3.5 h-3.5 text-[#D9A05B] fill-[#D9A05B] mr-1" />
                    <strong>{photographer.rating}</strong>
                    <span className="text-[#8a726a] ml-0.5">({photographer.reviewCount} client reviews)</span>
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 text-[#57423b] mr-1" />
                    Delivers photos in {photographer.turnaroundDays} days
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {photographer.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F4EFEB] text-[#181615] border border-[#E7E1DA]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider font-bold text-[#8a726a]">
                About the Photographer &amp; Style
              </h3>
              <p className="text-sm sm:text-base text-[#181615] leading-relaxed font-body">
                {photographer.bio}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-[#E7E1DA]">
                <div className="flex items-center space-x-2 text-xs uppercase tracking-wider font-bold text-[#8a726a] mb-2">
                  <Camera className="w-4 h-4 text-[#C85A32]" />
                  <span>Camera Gear &amp; Equipment</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#57423b]">
                  {photographer.equipment.map((item, idx) => (
                    <li key={idx} className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E7E1DA]">
                <div className="flex items-center space-x-2 text-xs uppercase tracking-wider font-bold text-[#8a726a] mb-2">
                  <Award className="w-4 h-4 text-[#D9A05B]" />
                  <span>Awards &amp; Recognition</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#57423b]">
                  {photographer.awards.map((award, idx) => (
                    <li key={idx} className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D9A05B]"></span>
                      <span>{award}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E7E1DA] bg-white p-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#8a726a]">Office &amp; studio</p>
                  <h3 className="font-serif text-2xl font-bold text-[#181615]">Professional location</h3>
                </div>
                <button
                  type="button"
                  onClick={() => window.open(photographer.officeMapUrl || `https://www.google.com/maps?q=${encodeURIComponent(photographer.officeLocation || photographer.location)}`, '_blank', 'noopener,noreferrer')}
                  className="px-3 py-1.5 rounded-md border border-[#E7E1DA] bg-[#FAF8F5] text-xs font-semibold text-[#181615] hover:bg-[#F4EFEB]"
                >
                  Open in Maps
                </button>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="overflow-hidden rounded-xl border border-[#E7E1DA] bg-[#F4EFEB]">
                  <iframe
                    title={`${photographer.name} office map`}
                    src={photographer.officeMapUrl || `https://www.google.com/maps?q=${encodeURIComponent(photographer.officeLocation || photographer.location)}&output=embed`}
                    className="h-52 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl bg-[#FAF8F5] border border-[#E7E1DA] p-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#8a726a]">Office address</p>
                    <p className="mt-2 text-sm font-semibold text-[#181615]">{photographer.officeLocation || photographer.location}</p>
                    <p className="mt-1 text-xs text-[#57423b]">{photographer.officeAddress || photographer.location}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `${photographer.name} office: ${photographer.officeLocation || photographer.location}  -  ${photographer.officeMapUrl || `https://www.google.com/maps?q=${encodeURIComponent(photographer.officeLocation || photographer.location)}`}`;
                      navigator.clipboard?.writeText(text).catch(() => window.alert('Unable to copy the map link on this device.'));
                    }}
                    className="w-full rounded-lg bg-[#181615] px-3 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-[#342f2d]"
                  >
                    Share office location
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#dec0b7] bg-[#fbf2ee] overflow-hidden">
              <button
                type="button"
                onClick={() => setIsCallSheetStripExpanded(!isCallSheetStripExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#f5ece8] transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-4 h-4 text-[#C85A32]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9f3c16]">
                    What's Included in This Shoot
                  </span>
                </div>
                <span className="text-xs text-[#8a726a] font-medium">
                  {isCallSheetStripExpanded ? 'Hide Details' : 'Show Details'}
                </span>
              </button>

              {isCallSheetStripExpanded && (
                <div className="p-4 pt-0 border-t border-[#dec0b7]/40 text-xs text-[#57423b] space-y-2.5 mt-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 bg-white/70 rounded-lg p-3">
                    <div>
                      <span className="text-[10px] uppercase text-[#8a726a] font-bold block">Assistant</span>
                      <span className="font-semibold text-[#181615]">
                        {photographer.assistantIncluded ? 'Included in Rate' : 'Available Add-on'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[#8a726a] font-bold block">Standard Day</span>
                      <span className="font-semibold text-[#181615]">8 Hours on Location</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[#8a726a] font-bold block">Insurance</span>
                      <span className="font-semibold text-[#181615]">Comprehensive Gear &amp; Liability</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[#8a726a] font-bold block">Live Preview</span>
                      <span className="font-semibold text-[#181615]">Live Laptop Screen Available</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#8a726a] leading-relaxed">
                    * Every booking automatically generates a complete shoot schedule, location coordinates, and team contact sheet.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-[#E7E1DA]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#181615]">
                    Portfolio &amp; Selected Photos
                  </h3>
                  <p className="text-xs text-[#8a726a]">
                    View their latest work and pick a preferred shoot look.
                  </p>
                </div>

                {uniqueCategories.length > 1 && (
                  <div className="flex gap-1.5 overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setActivePortfolioTab('all')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        activePortfolioTab === 'all'
                          ? 'bg-[#181615] text-white'
                          : 'bg-[#F4EFEB] text-[#57423b] hover:bg-[#eae6e1]'
                      }`}
                    >
                      All ({photographer.portfolio.length})
                    </button>
                    {uniqueCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActivePortfolioTab(cat)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                          activePortfolioTab === cat
                            ? 'bg-[#181615] text-white'
                            : 'bg-[#F4EFEB] text-[#57423b] hover:bg-[#eae6e1]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(showAllPhotos ? displayedPortfolio : displayedPortfolio.slice(0, 4)).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onOpenLightbox(item)}
                    className="group relative bg-white rounded-xl border border-[#E7E1DA] overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#F4EFEB]">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500 ease-out"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100" />

                      <div className="absolute inset-x-3 bottom-3 text-white">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9A05B]">
                          {item.category}
                        </span>
                        <h4 className="font-serif text-sm font-semibold mt-1">{item.title}</h4>
                      </div>
                    </div>

                    <div className="p-3 bg-white">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#181615] truncate mr-2">{item.location}</span>
                        <span className="text-[11px] text-[#8a726a] shrink-0">{item.year}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {displayedPortfolio.length > 4 && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllPhotos((current) => !current)}
                    className="px-4 py-2 rounded-full border border-[#E7E1DA] bg-white text-xs font-bold uppercase tracking-[0.12em] text-[#181615] hover:bg-[#FAF8F5]"
                  >
                    {showAllPhotos ? 'Show Less' : 'See All Photos'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 bg-white space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E7E1DA]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-wider font-bold text-[#C85A32]">
                    Book This Photographer
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#EAF4ED] text-[#2D593E]">
                    Select a Date
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="font-serif text-3xl font-bold text-[#181615] tabular-nums">
                      {formatINR(photographer.dayRate)}
                    </span>
                    <span className="text-xs text-[#8a726a] font-sans"> / day rate baseline</span>
                  </div>
                  <span className="text-xs text-[#57423b]">Standard 8-Hour Day</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#181615] flex items-center space-x-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>Choose Shoot Date</span>
                  </label>
                  <span className="text-xs font-semibold text-[#57423b]">September 2026</span>
                </div>

                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E7E1DA]">
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#8a726a] uppercase pb-1.5 border-b border-[#E7E1DA]">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 pt-1.5 text-xs text-center">
                    {calendarDays.map((cell, idx) => {
                      if (!cell) {
                        return <div key={`empty-${idx}`} className="h-8" />;
                      }

                      const { day, dateStr, isPast, isAvailable, isSelected } = cell;

                      return (
                        <button
                          key={dateStr}
                          type="button"
                          disabled={isPast || !isAvailable}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`h-8 rounded-md flex flex-col items-center justify-center relative transition-all ${
                            isSelected
                              ? 'bg-[#C85A32] text-white font-bold shadow-sm'
                              : isAvailable && !isPast
                              ? 'hover:bg-[#EAF4ED] text-[#181615] font-medium cursor-pointer'
                              : 'text-[#dec0b7] cursor-not-allowed'
                          }`}
                        >
                          <span className="text-[11px] leading-none">{day}</span>
                          {isAvailable && !isSelected && (
                            <span className="w-1 h-1 rounded-full bg-[#4A7C59] mt-0.5"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8a726a] px-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4A7C59]"></span>
                    <span>Available Date</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded bg-[#C85A32]"></span>
                    <span>Selected Date: <strong>{selectedDate}</strong></span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block">
                  Shoot Length
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDurationType('half-day')}
                    className={`p-2.5 rounded-lg text-left border transition-all text-xs cursor-pointer ${
                      durationType === 'half-day'
                        ? 'border-[#C85A32] bg-[#fbf2ee] font-semibold text-[#9f3c16]'
                        : 'border-[#E7E1DA] hover:bg-[#FAF8F5] text-[#57423b]'
                    }`}
                  >
                    <span className="block font-bold">Half-Day (4 Hours)</span>
                    <span className="text-[11px] text-[#8a726a]">Quick portraits or lookbook</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDurationType('full-day')}
                    className={`p-2.5 rounded-lg text-left border transition-all text-xs relative cursor-pointer ${
                      durationType === 'full-day'
                        ? 'border-[#C85A32] bg-[#fbf2ee] font-semibold text-[#9f3c16]'
                        : 'border-[#E7E1DA] hover:bg-[#FAF8F5] text-[#57423b]'
                    }`}
                  >
                    <span className="absolute top-1 right-1.5 px-1 py-0.2 rounded text-[9px] bg-[#C85A32] text-white font-bold">
                      Standard
                    </span>
                    <span className="block font-bold">Full-Day (8 Hours)</span>
                    <span className="text-[11px] text-[#8a726a]">Standard fashion or brand shoot</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDurationType('two-day')}
                    className={`p-2.5 rounded-lg text-left border transition-all text-xs cursor-pointer ${
                      durationType === 'two-day'
                        ? 'border-[#C85A32] bg-[#fbf2ee] font-semibold text-[#9f3c16]'
                        : 'border-[#E7E1DA] hover:bg-[#FAF8F5] text-[#57423b]'
                    }`}
                  >
                    <span className="block font-bold">2-Day Shoot</span>
                    <span className="text-[11px] text-[#8a726a]">Multiple locations &amp; outfits</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDurationType('three-day')}
                    className={`p-2.5 rounded-lg text-left border transition-all text-xs cursor-pointer ${
                      durationType === 'three-day'
                        ? 'border-[#C85A32] bg-[#fbf2ee] font-semibold text-[#9f3c16]'
                        : 'border-[#E7E1DA] hover:bg-[#FAF8F5] text-[#57423b]'
                    }`}
                  >
                    <span className="block font-bold">3-Day Campaign</span>
                    <span className="text-[11px] text-[#8a726a]">Large multi-day production</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block">
                  Preferred shoot location
                </label>
                <div className="space-y-2">
                  {locationOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        shootLocation === option.value ? 'border-[#C85A32] bg-[#fbf2ee]' : 'border-[#E7E1DA] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="selected-shoot-location"
                        value={option.value}
                        checked={shootLocation === option.value}
                        onChange={() => setShootLocation(option.value)}
                        className="mt-1 text-[#C85A32]"
                      />
                      <div className="flex-1">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-[#181615]">
                          <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                          {option.label}
                        </span>
                        <span className="mt-1 block text-[11px] text-[#8a726a]">{option.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block">
                  Optional Add-Ons (Crew &amp; Equipment)
                </label>
                <div className="space-y-1.5">
                  {AVAILABLE_ADDONS.map((addOn) => {
                    const isChecked = selectedAddOns.includes(addOn.id);
                    return (
                      <label
                        key={addOn.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all text-xs ${
                          isChecked ? 'border-[#C85A32] bg-[#fbf2ee]' : 'border-[#E7E1DA] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAddOn(addOn.id)}
                            className="rounded text-[#C85A32] focus:ring-[#C85A32]"
                          />
                          <div>
                            <span className="font-semibold text-[#181615] block">{addOn.name}</span>
                            <span className="text-[10px] text-[#8a726a] line-clamp-1">{addOn.description}</span>
                          </div>
                        </div>
                        <span className="font-bold text-[#181615] shrink-0 ml-2">
                          +{formatINR(addOn.price)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA] space-y-2 text-xs">
                <div className="flex justify-between text-[#57423b]">
                  <span>Photographer Fee ({durationType.replace('-', ' ')})</span>
                  <span className="tabular-nums font-semibold">{formatINR(baseRate)}</span>
                </div>
                <div className="flex justify-between text-[#57423b]">
                  <span>Photo Deliverables &amp; Usage</span>
                  <span className="tabular-nums font-semibold">{formatINR(usageCost)}</span>
                </div>
                {addOnsTotal > 0 && (
                  <div className="flex justify-between text-[#57423b]">
                    <span>Selected Add-ons ({selectedAddOns.length})</span>
                    <span className="tabular-nums font-semibold">+{formatINR(addOnsTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#57423b]">
                  <span>Platform Service &amp; Support</span>
                  <span className="tabular-nums font-semibold">{formatINR(productionFee)}</span>
                </div>

                <div className="pt-2 border-t border-[#E7E1DA] flex justify-between items-baseline font-bold text-sm text-[#181615]">
                  <span>Estimated Total</span>
                  <span className="font-serif text-xl text-[#C85A32] tabular-nums">
                    {formatINR(totalCost)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E7E1DA] space-y-2">
              <button
                id="request-call-sheet-btn"
                type="button"
                onClick={() =>
                  onStartBooking({
                    photographer,
                    selectedDate,
                    durationType,
                    usageRights,
                    selectedAddOns,
                    totalCost,
                    shootLocation
                  })
                }
                className="w-full py-3.5 px-4 rounded-lg bg-[#C85A32] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#B24E2A] transition-all shadow-md active:scale-98 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Continue to Shoot Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-center text-[11px] text-[#8a726a]">
                No payment is charged yet. You can review all details and team contact info next.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
