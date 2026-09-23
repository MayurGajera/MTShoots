'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from '@/lib/navigation';
import { Search, ArrowLeft, Calendar as CalendarIcon, X, Camera, ShieldCheck } from 'lucide-react';
import { Photographer, PortfolioItem } from '../types';
import { INITIAL_PHOTOGRAPHERS, getAllPhotographers } from '../data/photographers';
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
import { PHOTOGRAPHY_CATEGORIES, PhotographyCategory } from '../data/categories';
import { fetchCategories } from '@/lib/supabase';

export const PhotographersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [categoriesList, setCategoriesList] = useState<PhotographyCategory[]>(PHOTOGRAPHY_CATEGORIES);

  useEffect(() => {
    fetchCategories().then(dbCats => {
      if (dbCats && dbCats.length > 0) {
        const mapped = dbCats.map(c => ({
          id: c.id,
          name: c.name,
          shortName: c.short_name || c.name,
          description: c.description || '',
          image: c.image_url || '',
          popularCount: c.popular_count || '0+ Shoots'
        }));
        setCategoriesList(mapped);
      }
    }).catch(() => {});
  }, []);

  // Photographers data - load dynamic photographers from Supabase DB with fallback
  const [photographers, setPhotographers] = useState<Photographer[]>(() => getAllPhotographers());
  const [isLoading, setIsLoading] = useState<boolean>(() => getAllPhotographers().length === 0);

  // Load photographers from Supabase DB
  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (getAllPhotographers().length === 0) {
        setIsLoading(true);
      }
      try {
        const remote = await loadPhotographers();
        if (isMounted && remote && remote.length > 0) {
          setPhotographers(remote);
        }
      } catch (err) {
        console.warn('Error loading photographers from Supabase:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Bookings state
  const [bookings, setBookings] = useState<BookingRequest[]>(() => {
    try {
      if (typeof window === 'undefined') return [];
      const saved = localStorage.getItem('capturely_bookings');
      return saved ? JSON.parse(saved) : (INITIAL_BOOKINGS || []);
    } catch { return INITIAL_BOOKINGS || []; }
  });

  // Shortlist
  const [shortlistIds, setShortlistIds] = useState<string[]>(() => {
    try {
      if (typeof window === 'undefined') return [];
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
    return (p.specialties || []).some(s => {
      const sLower = s.toLowerCase();
      return sLower === needle || sLower.includes(needle) || needle.includes(sLower);
    });
  };

  // Filters - initialize from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedExperience, setSelectedExperience] = useState<ExperienceLevelFilterType>('all');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'All');
  const [targetDate, setTargetDate] = useState<string>(searchParams.get('date') || '');
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
    const dateParam = searchParams.get('date');
    if (dateParam) setTargetDate(dateParam);
    const search = searchParams.get('search');
    if (search !== null) setSearchQuery(search);
  }, [searchParams]);

  // Keep synced with registered photographers storage events
  useEffect(() => {
    const handleUpdate = () => {
      setPhotographers(getAllPhotographers());
    };
    window.addEventListener('photographers-updated', handleUpdate);
    return () => window.removeEventListener('photographers-updated', handleUpdate);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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
    setTargetDate('');
    setBudgetRange('all');
    setOnlyAvailableNow(false);
    setOnlyTopRated(false);
    setOnlyFastDelivery(false);
    setOnlyAssistantIncluded(false);
    setSortBy('featured');
    navigate('/photographers', { replace: true });
  };

  const cities = useMemo(() => Array.from(new Set((photographers || []).map(p => p.baseCity).filter(Boolean))).sort(), [photographers]);

  const photographerCountsByCategory = useMemo(() => {
    const counts: Record<string, number> = {
      all: (photographers || []).length,
      'All Categories': (photographers || []).length
    };
    categoriesList.forEach(cat => {
      if (cat.id === 'all') {
        counts[cat.id] = (photographers || []).length;
        counts[cat.name] = (photographers || []).length;
      } else {
        const matching = (photographers || []).filter(p => isPhotographerInCategory(p, cat.name) || isPhotographerInCategory(p, cat.id)).length;
        counts[cat.id] = matching;
        counts[cat.name] = matching;
      }
    });
    return counts;
  }, [photographers, categoriesList]);

  const filteredPhotographers = useMemo(() => {
    return (photographers || []).filter(p => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (![p.name, p.location, p.baseCity, p.primaryCategory, ...(p.specialties || []), p.experienceLevel, p.bio, p.cameraFormat, ...(p.equipment || []), ...(p.clientRoster || [])].some(v => v?.toLowerCase().includes(q))) return false;
      }
      if (selectedCategory !== 'all' && selectedCategory !== 'All Categories') {
        if (!isPhotographerInCategory(p, selectedCategory)) return false;
      }
      if (selectedExperience !== 'all' && p.experienceLevel !== selectedExperience) return false;
      if (selectedCity && selectedCity !== 'All' && selectedCity !== 'All Cities' && selectedCity.trim() !== '') {
        const cityLower = selectedCity.toLowerCase();
        const matchesBase = p.baseCity && p.baseCity.toLowerCase().includes(cityLower);
        const matchesLoc = p.location && p.location.toLowerCase().includes(cityLower);
        const cityInLoc = cityLower.includes((p.baseCity || '').toLowerCase());
        if (!matchesBase && !matchesLoc && !cityInLoc) return false;
      }
      if (targetDate && (p as any).blackoutDates && (p as any).blackoutDates.includes(targetDate)) {
        return false;
      }
      const dayRate = p.dayRate || 0;
      if (budgetRange === 'under-50k' && dayRate >= 50000) return false;
      if (budgetRange === '50k-100k' && (dayRate < 50000 || dayRate > 100000)) return false;
      if (budgetRange === '100k-150k' && (dayRate < 100000 || dayRate > 150000)) return false;
      if (budgetRange === 'above-150k' && dayRate <= 150000) return false;
      if (onlyAvailableNow && !p.availableNow) return false;
      if (onlyTopRated && (p.rating || 0) < 4.95) return false;
      if (onlyFastDelivery && (p.turnaroundDays || 3) > 3) return false;
      if (onlyAssistantIncluded && !p.assistantIncluded) return false;
      return true;
    }).sort((a, b) => {
      const aRate = a.dayRate || 0;
      const bRate = b.dayRate || 0;
      if (sortBy === 'rate-asc') return aRate - bRate;
      if (sortBy === 'rate-desc') return bRate - aRate;
      if (sortBy === 'experience') return (b.experienceYears || 0) - (a.experienceYears || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'turnaround') return (a.turnaroundDays || 0) - (b.turnaroundDays || 0);
      return 0;
    });
  }, [photographers, searchQuery, selectedCategory, selectedExperience, selectedCity, targetDate, budgetRange, onlyAvailableNow, onlyTopRated, onlyFastDelivery, onlyAssistantIncluded, sortBy]);

  const handleToggleShortlist = (id: string) => {
    if (shortlistIds.includes(id)) {
      setShortlistIds(shortlistIds.filter(x => x !== id));
      triggerToast('Removed from shortlist');
    } else {
      setShortlistIds([...shortlistIds, id]);
      triggerToast('Added to shortlist');
    }
  };

  const handleQuickBook = (p: Photographer) => {
    setBookingConfig({
      photographer: p,
      selectedDate: targetDate || p.nextAvailableDate,
      durationType: 'full-day',
      usageRights: 'commercial-standard',
      selectedAddOns: [],
      totalCost: (p.dayRate || 25000) + 5000,
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
    triggerToast('Booking confirmed! Check your bookings.');
  };

  const allPortfolioItems = useMemo(() => (photographers || []).flatMap(p => p.portfolio || []), [photographers]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181615] flex flex-col pb-24 md:pb-0">
      <Navbar
        currentTab="roster"
        setCurrentTab={() => {}}
        bookingCount={bookings.length}
        shortlistCount={shortlistIds.length}
        onOpenNewBooking={() => { setBookingConfig(null); setIsBookingModalOpen(true); }}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 min-w-0 overflow-x-hidden">
        <div className="relative py-6 sm:py-8 border-b border-[#E7E1DA] mb-6 page-enter">
          <div className="flex items-center gap-3 mb-3">
            <Link to="/" className="flex items-center gap-1 text-xs text-[#8a726a] hover:text-[#C85A32] transition-colors cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
          </div>
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#fbf2ee] border border-[#dec0b7] text-[11px] font-bold tracking-widest uppercase text-[#9f3c16]">
              <Camera className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
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

        <CategoryFlowBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          photographerCountsByCategory={photographerCountsByCategory}
          totalPhotographersCount={photographers.length}
        />

        {targetDate && (
          <div className="mb-4 flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF6F2] border border-[#F4C5B5] text-[#9F3C16] text-xs shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-white shadow-2xs">
                <CalendarIcon className="w-4 h-4 text-[#C85A32]" />
              </span>
              <span>
                Filtering available photographers for shoot date: <strong className="font-bold text-[#181615]">{targetDate}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setTargetDate('');
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('date');
                navigate('/photographers?' + newParams.toString(), { replace: true });
              }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-[#FAF8F5] border border-[#E7E1DA] text-xs font-bold text-[#C85A32] shadow-2xs transition-all cursor-pointer"
            >
              <span>Clear Date</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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

        {isLoading ? (
          <div className="mt-8">
            <ShimmerCardGrid count={6} />
          </div>
        ) : filteredPhotographers.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#E7E1DA] mt-6 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#fbf2ee] text-[#C85A32] flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#181615] mb-2">No Photographers Found</h3>
            <p className="text-sm text-[#8a726a] max-w-md mx-auto mb-6">
              We could not find any photographers matching your exact filter criteria. Try expanding your search or clearing date/city filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredPhotographers.map((photographer) => (
              <PhotographerCard
                key={photographer.id}
                photographer={photographer}
                onSelect={() => setSelectedPhotographer(photographer)}
                onQuickBook={() => handleQuickBook(photographer)}
                isSaved={shortlistIds.includes(photographer.id)}
                onToggleSave={() => handleToggleShortlist(photographer.id)}
                targetDate={targetDate}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {selectedPhotographer && (
        <PhotographerDetailModal
          photographer={selectedPhotographer}
          onClose={() => setSelectedPhotographer(null)}
          onStartBooking={handleStartBookingFromDetail}
          isSaved={shortlistIds.includes(selectedPhotographer.id)}
          onToggleSave={() => handleToggleShortlist(selectedPhotographer.id)}
          onOpenLightbox={(item) => setLightboxItem(item)}
        />
      )}

      {isBookingModalOpen && (
        <BookingSheetModal
          onClose={() => { setIsBookingModalOpen(false); setBookingConfig(null); }}
          photographer={bookingConfig?.photographer}
          photographers={photographers}
          initialConfig={bookingConfig || (targetDate ? { selectedDate: targetDate } as any : undefined)}
          onConfirmBooking={handleConfirmBooking}
        />
      )}

      {lightboxItem && (
        <MediaLightbox
          item={lightboxItem}
          allItems={allPortfolioItems}
          onClose={() => setLightboxItem(null)}
          onNavigate={(item) => setLightboxItem(item)}
        />
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181615] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};


export default PhotographersPage;
