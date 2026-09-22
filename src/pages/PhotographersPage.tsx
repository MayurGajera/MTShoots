import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { Photographer, PortfolioItem } from '../types';
import { INITIAL_PHOTOGRAPHERS } from '../data/photographers';
import { isSupabaseConfigured, loadPhotographers } from '../lib/supabase';
import { FilterBar, BudgetRangeType, ExperienceLevelFilterType, SortOptionType } from '../components/FilterBar';
import { CategoryFlowBar } from '../components/CategoryFlowBar';
import { PhotographerCard } from '../components/PhotographerCard';
import { PhotographerDetailModal } from '../components/PhotographerDetailModal';
import { BookingSheetModal } from '../components/BookingSheetModal';
import { MediaLightbox } from '../components/MediaLightbox';
import { ShimmerCardGrid } from '../components/ShimmerCard';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BookingRequest, ShootDurationType, UsageRightsTier } from '../types';
import { INITIAL_BOOKINGS } from '../data/photographers';
import { PHOTOGRAPHY_CATEGORIES } from '../data/categories';

export const PhotographersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Photographers data
  const [photographers, setPhotographers] = useState<Photographer[]>(INITIAL_PHOTOGRAPHERS);
  const [isLoading, setIsLoading] = useState(true);

  // Bookings state
  const [bookings, setBookings] = useState<BookingRequest[]>(() => {
    try {
      const saved = localStorage.getItem('capturely_bookings');
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch { return INITIAL_BOOKINGS; }
  });

  // Shortlist
  const [shortlistIds, setShortlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('capturely_shortlist');
      return saved ? JSON.parse(saved) : ['darshan-mehta', 'rohan-varma'];
    } catch { return ['darshan-mehta', 'rohan-varma']; }
  });

  // UI state
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

  // Category matching helper
  const isPhotographerInCategory = (p: Photographer, categoryIdentifier: string): boolean => {
    if (!categoryIdentifier || categoryIdentifier === 'all' || categoryIdentifier === 'All Categories') {
      return true;
    }
    const needle = categoryIdentifier.toLowerCase().trim();
    const primary = (p.primaryCategory || '').toLowerCase();
    if (primary === needle || primary.includes(needle) || needle.includes(primary)) {
      return true;
    }
    return p.specialties.some(s => {
      const sLower = s.toLowerCase();
      return sLower === needle || sLower.includes(needle) || needle.includes(sLower);
    });
  };

  // Filters — initialize from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedExperience, setSelectedExperience] = useState<ExperienceLevelFilterType>('all');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'All');
  const [budgetRange, setBudgetRange] = useState<BudgetRangeType>('all');
  const [onlyAvailableNow, setOnlyAvailableNow] = useState(false);
  const [onlyTopRated, setOnlyTopRated] = useState(false);
  const [onlyFastDelivery, setOnlyFastDelivery] = useState(false);
  const [onlyAssistantIncluded, setOnlyAssistantIncluded] = useState(false);
  const [sortBy, setSortBy] = useState<SortOptionType>('featured');

  // Keep state synced with URL search params changes
  useEffect(() => {
    const cat = searchParams.get('category');
    setSelectedCategory(cat || 'all');
    const city = searchParams.get('city');
    if (city) setSelectedCity(city);
    const search = searchParams.get('search');
    if (search !== null) setSearchQuery(search);
  }, [searchParams]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load photographers
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      if (isSupabaseConfigured()) {
        try {
          const remote = await loadPhotographers();
          if (remote && remote.length > 0) setPhotographers(remote);
        } catch {
          // Fallback to initial data already set
        }
      }
      setIsLoading(false);
    }
    load();
  }, []);

  // Persist bookings
  useEffect(() => {
    try { localStorage.setItem('capturely_bookings', JSON.stringify(bookings)); } catch {}
  }, [bookings]);

  // Persist shortlist
  useEffect(() => {
    try { localStorage.setItem('capturely_shortlist', JSON.stringify(shortlistIds)); } catch {}
  }, [shortlistIds]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedExperience('all');
    setSelectedCity('All');
    setBudgetRange('all');
    setOnlyAvailableNow(false);
    setOnlyTopRated(false);
    setOnlyFastDelivery(false);
    setOnlyAssistantIncluded(false);
    setSortBy('featured');
  };

  const cities = useMemo(() => Array.from(new Set(photographers.map(p => p.baseCity))).sort(), [photographers]);

  const photographerCountsByCategory = useMemo(() => {
    const counts: Record<string, number> = {
      all: photographers.length,
      'All Categories': photographers.length
    };
    PHOTOGRAPHY_CATEGORIES.forEach(cat => {
      if (cat.id === 'all') {
        counts[cat.id] = photographers.length;
        counts[cat.name] = photographers.length;
      } else {
        const matching = photographers.filter(p => isPhotographerInCategory(p, cat.name) || isPhotographerInCategory(p, cat.id)).length;
        counts[cat.id] = matching;
        counts[cat.name] = matching;
      }
    });
    return counts;
  }, [photographers]);

  const filteredPhotographers = useMemo(() => {
    return photographers.filter(p => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (![p.name, p.location, p.baseCity, p.primaryCategory, ...p.specialties, p.experienceLevel, p.bio, p.cameraFormat, ...p.equipment, ...p.clientRoster].some(v => v?.toLowerCase().includes(q))) return false;
      }
      if (selectedCategory !== 'all' && selectedCategory !== 'All Categories') {
        if (!isPhotographerInCategory(p, selectedCategory)) return false;
      }
      if (selectedExperience !== 'all' && p.experienceLevel !== selectedExperience) return false;
      if (selectedCity !== 'All') {
        const cityLower = selectedCity.toLowerCase();
        const matchesBase = p.baseCity && p.baseCity.toLowerCase().includes(cityLower);
        const matchesLoc = p.location && p.location.toLowerCase().includes(cityLower);
        const cityInLoc = cityLower.includes((p.baseCity || '').toLowerCase());
        if (!matchesBase && !matchesLoc && !cityInLoc) return false;
      }
      if (budgetRange === 'under-50k' && p.dayRate >= 50000) return false;
      if (budgetRange === '50k-100k' && (p.dayRate < 50000 || p.dayRate > 100000)) return false;
      if (budgetRange === '100k-150k' && (p.dayRate < 100000 || p.dayRate > 150000)) return false;
      if (budgetRange === 'above-150k' && p.dayRate <= 150000) return false;
      if (onlyAvailableNow && !p.availableNow) return false;
      if (onlyTopRated && p.rating < 4.95) return false;
      if (onlyFastDelivery && p.turnaroundDays > 3) return false;
      if (onlyAssistantIncluded && !p.assistantIncluded) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'rate-asc') return a.dayRate - b.dayRate;
      if (sortBy === 'rate-desc') return b.dayRate - a.dayRate;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'turnaround') return a.turnaroundDays - b.turnaroundDays;
      return 0;
    });
  }, [photographers, searchQuery, selectedCategory, selectedExperience, selectedCity, budgetRange, onlyAvailableNow, onlyTopRated, onlyFastDelivery, onlyAssistantIncluded, sortBy]);

  const handleToggleShortlist = (id: string) => {
    if (shortlistIds.includes(id)) {
      setShortlistIds(shortlistIds.filter(x => x !== id));
      triggerToast('Photographer removed from saved.');
    } else {
      setShortlistIds([...shortlistIds, id]);
      triggerToast('Photographer saved!');
    }
  };

  const handleQuickBook = (p: Photographer) => {
    setBookingConfig({
      photographer: p,
      selectedDate: p.nextAvailableDate,
      durationType: 'full-day',
      usageRights: 'commercial-standard',
      selectedAddOns: ['medium-format'],
      totalCost: p.dayRate + Math.round(p.dayRate * 0.45) + 18000 + 5000,
      shootLocation: p.officeLocation || p.location
    });
    setIsBookingModalOpen(true);
  };

  const handleStartBookingFromDetail = (config: typeof bookingConfig) => {
    setBookingConfig(config);
    setSelectedPhotographer(null);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = (newBooking: BookingRequest) => {
    setBookings([newBooking, ...bookings]);
    setIsBookingModalOpen(false);
    setBookingConfig(null);
    triggerToast(`Booking confirmed! Check your bookings.`);
  };

  const allPortfolioItems = useMemo(() => photographers.flatMap(p => p.portfolio), [photographers]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181615] flex flex-col pb-24 md:pb-0">
      <Navbar
        currentTab="roster"
        setCurrentTab={() => {}}
        bookingCount={bookings.length}
        shortlistCount={shortlistIds.length}
        onOpenNewBooking={() => { setBookingConfig(null); setIsBookingModalOpen(true); }}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Page Header */}
        <div className="relative py-6 sm:py-8 border-b border-[#E7E1DA] mb-6 page-enter">
          <div className="flex items-center gap-3 mb-3">
            <Link to="/" className="flex items-center gap-1 text-xs text-[#8a726a] hover:text-[#C85A32] transition-colors cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
          </div>
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#fbf2ee] border border-[#dec0b7] text-[11px] font-bold tracking-widest uppercase text-[#9f3c16]">
              <span>✦</span>
              <span>MTShoots • Verified Professional Photographers</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#181615] leading-[1.15]">
              Discover Expert Photographers
            </h1>
            <p className="text-sm sm:text-base text-[#57423b] leading-relaxed">
              Browse verified photographers for weddings, fashion, portraits, architecture, food, and commercial campaigns. Check live availability and book your shoot in minutes.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-[#E7E1DA]/80">
            {[
              { label: 'Verified Talent', value: '100% Vetted Artists' },
              { label: 'Turnaround', value: '3 to 5 Business Days' },
              { label: 'Photo Delivery', value: 'Full High-Res Gallery' },
              { label: 'Direct Booking', value: 'Instant Confirmation' },
            ].map(s => (
              <div key={s.label} className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a726a]">{s.label}</span>
                <div className="text-sm font-bold text-[#181615]">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Bar */}
        <CategoryFlowBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          photographerCountsByCategory={photographerCountsByCategory}
          totalPhotographersCount={photographers.length}
        />

        {/* Filter Bar */}
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedExperience={selectedExperience}
          setSelectedExperience={setSelectedExperience}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          budgetRange={budgetRange}
          setBudgetRange={setBudgetRange}
          onlyAvailableNow={onlyAvailableNow}
          setOnlyAvailableNow={setOnlyAvailableNow}
          onlyTopRated={onlyTopRated}
          setOnlyTopRated={setOnlyTopRated}
          onlyFastDelivery={onlyFastDelivery}
          setOnlyFastDelivery={setOnlyFastDelivery}
          onlyAssistantIncluded={onlyAssistantIncluded}
          setOnlyAssistantIncluded={setOnlyAssistantIncluded}
          sortBy={sortBy}
          setSortBy={setSortBy}
          cities={cities}
          totalResults={filteredPhotographers.length}
          totalCount={photographers.length}
          onResetFilters={handleResetFilters}
        />

        {/* Photographers Grid */}
        {isLoading ? (
          <ShimmerCardGrid count={9} />
        ) : filteredPhotographers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-12">
            {filteredPhotographers.map(p => (
              <PhotographerCard
                key={p.id}
                photographer={p}
                onSelect={(artist) => navigate(`/photographers/${artist.id}`)}
                onQuickBook={handleQuickBook}
                isSaved={shortlistIds.includes(p.id)}
                onToggleSave={handleToggleShortlist}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E7E1DA] p-12 text-center max-w-md mx-auto my-12 shadow-sm animate-scaleIn">
            <Search className="w-10 h-10 text-[#8a726a] mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-[#181615] mb-1">No Photographers Found</h3>
            <p className="text-xs text-[#57423b] mb-4">
              Try adjusting your filters or search to explore the full roster.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-full bg-[#C85A32] text-white text-xs font-semibold hover:bg-[#B24E2A] cursor-pointer transition-all"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>

      <Footer />

      {/* Photographer Detail Modal */}
      {selectedPhotographer && (
        <PhotographerDetailModal
          photographer={selectedPhotographer}
          onClose={() => setSelectedPhotographer(null)}
          onStartBooking={handleStartBookingFromDetail}
          isSaved={shortlistIds.includes(selectedPhotographer.id)}
          onToggleSave={handleToggleShortlist}
          onOpenLightbox={item => setLightboxItem(item)}
        />
      )}

      {/* Media Lightbox */}
      {lightboxItem && (
        <MediaLightbox
          item={lightboxItem}
          allItems={allPortfolioItems}
          onClose={() => setLightboxItem(null)}
          onNavigate={item => setLightboxItem(item)}
          onBookSimilar={() => {
            const artist = photographers.find(p => p.portfolio.some(i => i.id === lightboxItem.id));
            if (artist) handleQuickBook(artist);
          }}
        />
      )}

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <BookingSheetModal
          initialConfig={bookingConfig}
          photographers={photographers}
          onClose={() => { setIsBookingModalOpen(false); setBookingConfig(null); }}
          onConfirmBooking={handleConfirmBooking}
        />
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 bg-[#181615] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#dec0b7]/30 flex items-center space-x-2.5 animate-bounce-short">
          <span className="w-2 h-2 rounded-full bg-[#4A7C59]" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
