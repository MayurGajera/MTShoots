'use client';
import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Camera,
  Award,
  ArrowUpDown,
  Check,
  X,
  Star,
  Zap,
  Users,
  RotateCcw
} from 'lucide-react';
import { PHOTOGRAPHY_CATEGORIES, PhotographyCategory } from '../data/categories';
import { fetchCategories } from '@/lib/supabase';

export type BudgetRangeType = 'all' | 'under-50k' | '50k-100k' | '100k-150k' | 'above-150k';
export type ExperienceLevelFilterType = 'all' | 'beginner' | 'professional' | 'master';
export type SortOptionType = 'featured' | 'rate-asc' | 'rate-desc' | 'experience' | 'rating' | 'turnaround';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedExperience: ExperienceLevelFilterType;
  setSelectedExperience: (exp: ExperienceLevelFilterType) => void;
  selectedCity: string;
  setSelectedCity: (c: string) => void;
  budgetRange: BudgetRangeType;
  setBudgetRange: (b: BudgetRangeType) => void;
  onlyAvailableNow: boolean;
  setOnlyAvailableNow: (avail: boolean) => void;
  onlyTopRated: boolean;
  setOnlyTopRated: (top: boolean) => void;
  onlyFastDelivery: boolean;
  setOnlyFastDelivery: (fast: boolean) => void;
  onlyAssistantIncluded: boolean;
  setOnlyAssistantIncluded: (asst: boolean) => void;
  sortBy: SortOptionType;
  setSortBy: (s: SortOptionType) => void;
  cities: string[];
  totalResults: number;
  totalCount: number;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedExperience,
  setSelectedExperience,
  selectedCity,
  setSelectedCity,
  budgetRange,
  setBudgetRange,
  onlyAvailableNow,
  setOnlyAvailableNow,
  onlyTopRated,
  setOnlyTopRated,
  onlyFastDelivery,
  setOnlyFastDelivery,
  onlyAssistantIncluded,
  setOnlyAssistantIncluded,
  sortBy,
  setSortBy,
  cities,
  totalResults,
  totalCount,
  onResetFilters
}) => {
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
  // Compute active filters
  const normalizedSelectedCity = selectedCity === 'All Cities' ? 'All' : selectedCity;

  const activeFilters = [
    searchQuery.trim() !== '',
    selectedCategory !== 'all' && selectedCategory !== 'All Categories',
    selectedExperience !== 'all',
    normalizedSelectedCity !== 'All',
    budgetRange !== 'all',
    onlyAvailableNow,
    onlyTopRated,
    onlyFastDelivery,
    onlyAssistantIncluded
  ].filter(Boolean);

  const activeCount = activeFilters.length;

  return (
    <div className="bg-white rounded-2xl border border-[#E7E1DA] p-3.5 sm:p-4 shadow-sm mb-6 space-y-3">
      {/* =========================================================================
          LINE 1: Universal Search + Category Dropdown + Experience Level Dropdown
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
        {/* Universal Search Input (Col 1-6) */}
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a726a]" />
          <input
            id="photographer-universal-search"
            type="text"
            placeholder="Universal Search (Photographer Name, Category, City, Gear...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-[#F4EFEB]/50 hover:bg-[#F4EFEB] focus:bg-white rounded-xl border border-[#E7E1DA] text-sm text-[#181615] placeholder-[#8a726a] focus:outline-none focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/15 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a726a] hover:text-[#181615] p-1 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category-Wise Dropdown (Col 7-9) */}
        <div className="md:col-span-3 relative">
          <div className="flex items-center space-x-2 px-3 py-2 bg-[#F4EFEB]/50 hover:bg-[#F4EFEB] rounded-xl border border-[#E7E1DA] transition-colors focus-within:border-[#C85A32] focus-within:bg-white">
            <Camera className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
            <div className="flex-1 min-w-0">
              <label htmlFor="category-wise-select" className="sr-only">
                Category
              </label>
              <select
                id="category-wise-select"
                value={(() => {
                  if (!selectedCategory || selectedCategory === 'all' || selectedCategory === 'All Categories') return 'all';
                  const found = categoriesList.find(c =>
                    c.name.toLowerCase() === selectedCategory.toLowerCase() ||
                    c.id.toLowerCase() === selectedCategory.toLowerCase() ||
                    c.shortName.toLowerCase() === selectedCategory.toLowerCase()
                  );
                  return found ? found.name : selectedCategory;
                })()}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent focus:outline-none cursor-pointer text-xs font-medium text-[#181615] truncate"
              >
                <option value="all">Category: All Categories ({totalCount})</option>
                {categoriesList.filter((c) => c.id !== 'all').map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Experience-Based Level Dropdown (Col 10-12) */}
        <div className="md:col-span-3 relative">
          <div className="flex items-center space-x-2 px-3 py-2 bg-[#F4EFEB]/50 hover:bg-[#F4EFEB] rounded-xl border border-[#E7E1DA] transition-colors focus-within:border-[#C85A32] focus-within:bg-white">
            <Award className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
            <div className="flex-1 min-w-0">
              <label htmlFor="experience-level-select" className="sr-only">
                Experience Level
              </label>
              <select
                id="experience-level-select"
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value as ExperienceLevelFilterType)}
                className="w-full bg-transparent focus:outline-none cursor-pointer text-xs font-medium text-[#181615] truncate"
              >
                <option value="all">Level: All Experience Levels</option>
                <option value="beginner">Beginner / Emerging (1 - 3 yrs)</option>
                <option value="professional">Professional Pro (4 - 7 yrs)</option>
                <option value="master">Master Artist (8+ yrs)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          LINE 2: Price-Wise + City + Sort + Quick Toggles + Clear Reset
          ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-[#E7E1DA]/60">
        {/* Left cluster: Price, City, Sort Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Price-Wise Filter Dropdown */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-white rounded-lg border border-[#E7E1DA] text-xs font-medium text-[#181615] hover:border-[#dec0b7] transition-colors">
            <span className="text-[#8a726a] font-normal">Price:</span>
            <select
              id="price-wise-select"
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value as BudgetRangeType)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs font-medium text-[#181615]"
            >
              <option value="all">Any Price</option>
              <option value="under-50k">Under ₹50,000 / day</option>
              <option value="50k-100k">₹50,000  -  ₹1,00,000</option>
              <option value="100k-150k">₹1,00,000  -  ₹1,50,000</option>
              <option value="above-150k">Above ₹1,50,000 / day</option>
            </select>
          </div>

          {/* City / Location Dropdown */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-white rounded-lg border border-[#E7E1DA] text-xs font-medium text-[#181615] hover:border-[#dec0b7] transition-colors">
            <MapPin className="w-3 h-3 text-[#C85A32] shrink-0" />
            <span className="text-[#8a726a] font-normal">City:</span>
            <select
              id="city-location-select"
              value={normalizedSelectedCity}
              onChange={(e) => {
                const nextCity = e.target.value === 'All Cities' ? 'All' : e.target.value;
                setSelectedCity(nextCity);
              }}
              className="bg-transparent focus:outline-none cursor-pointer text-xs font-medium text-[#181615]"
            >
              <option value="All">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-white rounded-lg border border-[#E7E1DA] text-xs font-medium text-[#181615] hover:border-[#dec0b7] transition-colors">
            <ArrowUpDown className="w-3 h-3 text-[#8a726a] shrink-0" />
            <span className="text-[#8a726a] font-normal">Sort:</span>
            <select
              id="sort-order-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOptionType)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs font-medium text-[#181615]"
            >
              <option value="featured">Featured (Recommended)</option>
              <option value="rate-asc">Price: Low to High</option>
              <option value="rate-desc">Price: High to Low</option>
              <option value="experience">Experience: Senior to Emerging</option>
              <option value="rating">Rating: Highest Rated</option>
              <option value="turnaround">Fast Delivery (≤ 3 Days)</option>
            </select>
          </div>
        </div>

        {/* Right cluster: Quick Refinements & Reset */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Available Now Quick Toggle */}
          <button
            type="button"
            id="toggle-available-filter"
            onClick={() => setOnlyAvailableNow(!onlyAvailableNow)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
              onlyAvailableNow
                ? 'bg-[#EAF4ED] text-[#2D593E] border-[#A8D5B5] shadow-2xs font-semibold'
                : 'bg-white text-[#57423b] border-[#E7E1DA] hover:bg-[#F4EFEB]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                onlyAvailableNow ? 'bg-[#4A7C59] animate-pulse' : 'bg-[#8a726a]'
              }`}
            />
            <span>Available</span>
            {onlyAvailableNow && <Check className="w-3 h-3 text-[#2D593E]" />}
          </button>

          {/* Top Rated Quick Toggle */}
          <button
            type="button"
            id="toggle-toprated-filter"
            onClick={() => setOnlyTopRated(!onlyTopRated)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
              onlyTopRated
                ? 'bg-[#FEF6E9] text-[#9A6214] border-[#F4D39A] shadow-2xs font-semibold'
                : 'bg-white text-[#57423b] border-[#E7E1DA] hover:bg-[#F4EFEB]'
            }`}
          >
            <Star className={`w-3 h-3 ${onlyTopRated ? 'fill-[#D9A05B] text-[#D9A05B]' : 'text-[#8a726a]'}`} />
            <span>4.95+</span>
            {onlyTopRated && <Check className="w-3 h-3 text-[#9A6214]" />}
          </button>

          {/* Fast Delivery Quick Toggle */}
          <button
            type="button"
            id="toggle-fastdelivery-filter"
            onClick={() => setOnlyFastDelivery(!onlyFastDelivery)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
              onlyFastDelivery
                ? 'bg-[#fbf2ee] text-[#C85A32] border-[#dec0b7] shadow-2xs font-semibold'
                : 'bg-white text-[#57423b] border-[#E7E1DA] hover:bg-[#F4EFEB]'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>≤3 Days</span>
            {onlyFastDelivery && <Check className="w-3 h-3 text-[#C85A32]" />}
          </button>

          {/* Clear Filters Button */}
          {activeCount > 0 ? (
            <button
              id="clear-all-filters-btn"
              onClick={onResetFilters}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#C85A32] bg-[#fbf2ee] border border-[#dec0b7] hover:bg-[#f6dfd8] cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset ({activeCount})</span>
            </button>
          ) : (
            <span className="text-[11px] text-[#8a726a] px-1">
              Showing {totalResults} of {totalCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
