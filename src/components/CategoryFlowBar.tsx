'use client';
import React, { useState, useEffect, useRef } from 'react';
import { PHOTOGRAPHY_CATEGORIES, PhotographyCategory } from '../data/categories';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchCategories } from '@/lib/supabase';

interface CategoryFlowBarProps {
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  photographerCountsByCategory: Record<string, number>;
  totalPhotographersCount?: number;
  isLoading?: boolean;
}

export const CategoryFlowBar: React.FC<CategoryFlowBarProps> = ({
  selectedCategory,
  onSelectCategory,
  photographerCountsByCategory,
  totalPhotographersCount,
  isLoading = false
}) => {
  const [categories, setCategories] = useState<PhotographyCategory[]>(PHOTOGRAPHY_CATEGORIES);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoverPreviewPosition, setHoverPreviewPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchCategories().then(dbCats => {
      if (dbCats && dbCats.length > 0) {
        const mapped: PhotographyCategory[] = dbCats.map(c => ({
          id: c.id,
          name: c.name,
          shortName: c.short_name || c.name,
          description: c.description || '',
          image: c.image_url || '',
          popularCount: c.popular_count || '0+ Shoots'
        }));
        setCategories(mapped);
      }
    }).catch(() => {});
  }, []);

  const isAllSelected = !selectedCategory || selectedCategory === 'all' || selectedCategory === 'All Categories';

  return (
    <div className="mb-6 w-full max-w-full min-w-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2 min-w-0">
          <Sparkles className="w-4 h-4 text-[#C85A32] shrink-0" />
          <h2 className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-[#181615] truncate">
            Explore By Photography Genre
          </h2>
          <span className="text-xs text-[#8a726a] font-normal hidden sm:inline">
            (Curated Genre Flow)
          </span>
        </div>
        {!isAllSelected && (
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-semibold text-[#C85A32] hover:text-[#9f3c16] hover:underline cursor-pointer shrink-0 ml-2"
          >
            View All Genres (
            {isLoading ? (
              <span className="inline-block w-4 h-2.5 rounded bg-[#E7E1DA] animate-pulse align-middle mx-0.5" />
            ) : (
              totalPhotographersCount ?? photographerCountsByCategory['all'] ?? 12
            )}
            )
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Scroll category selector left"
          onClick={() => scrollRef.current?.scrollBy({ left: -220, behavior: 'smooth' })}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E7E1DA] bg-white text-[#181615] shadow-sm transition hover:border-[#C85A32]/60 hover:text-[#C85A32]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Category Scroll Stream */}
        <div ref={scrollRef} className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none no-scrollbar w-full min-w-0 px-1 snap-x snap-mandatory">
          {categories.map((cat: PhotographyCategory) => {
          const isAll = cat.id === 'all';
          const isSelected = isAll
            ? isAllSelected
            : (
              selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
              selectedCategory.toLowerCase() === cat.id.toLowerCase() ||
              selectedCategory.toLowerCase() === cat.shortName.toLowerCase()
            );

          const count = isAll
            ? (totalPhotographersCount ?? photographerCountsByCategory['all'] ?? photographerCountsByCategory['All Categories'] ?? 0)
            : (photographerCountsByCategory[cat.name] ?? photographerCountsByCategory[cat.id] ?? 0);

          return (
            <button
              key={cat.id}
              id={`category-flow-btn-${cat.id}`}
              type="button"
              onMouseEnter={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setHoveredCategory(cat.id);
                setHoverPreviewPosition({
                  x: rect.left + rect.width / 2,
                  y: rect.top
                });
              }}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => onSelectCategory(isAll ? 'all' : cat.name)}
              className={`group flex items-center gap-2 px-2.5 py-1.75 rounded-2xl border transition-all duration-200 shrink-0 cursor-pointer text-left snap-start ${
                isSelected
                  ? 'bg-white border-[#C85A32] ring-2 ring-[#C85A32]/20 shadow-md scale-[1.02]'
                  : 'bg-white/80 border-[#E7E1DA] hover:bg-white hover:border-[#dec0b7] hover:shadow-xs'
              }`}
            >
              {/* Category Thumbnail */}
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-[#E7E1DA]/60 bg-[#F4EFEB]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-[#C85A32]/20 backdrop-blur-[1px]" />
                )}
              </div>

              {/* Category Label and Count */}
              <div className="pr-1">
                <div
                  className={`text-[11px] sm:text-xs font-bold leading-tight whitespace-nowrap transition-colors ${
                    isSelected ? 'text-[#C85A32]' : 'text-[#181615] group-hover:text-[#C85A32]'
                  }`}
                >
                  {cat.shortName}
                </div>
                <div className="text-[10px] text-[#8a726a] flex items-center space-x-1 mt-0.5 min-h-[14px]">
                  {isLoading ? (
                    <span className="inline-block w-3.5 h-2.5 rounded bg-[#E7E1DA] animate-pulse" />
                  ) : (
                    <span className="tabular-nums font-medium">
                      {count === 1 ? '1' : count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
          })}
        </div>

        <button
          type="button"
          aria-label="Scroll category selector right"
          onClick={() => scrollRef.current?.scrollBy({ left: 220, behavior: 'smooth' })}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E7E1DA] bg-white text-[#181615] shadow-sm transition hover:border-[#C85A32]/60 hover:text-[#C85A32]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {hoveredCategory && (
        <div
          className="pointer-events-none fixed z-[60]"
          style={{
            left: hoverPreviewPosition.x,
            top: hoverPreviewPosition.y,
            transform: 'translate(-50%, -118%)'
          }}
        >
          <div className="flex items-center justify-center rounded-2xl border border-[#E7E1DA] bg-white/95 p-1.5 shadow-xl backdrop-blur-sm">
            <img
              src={categories.find(cat => cat.id === hoveredCategory)?.image || ''}
              alt={categories.find(cat => cat.id === hoveredCategory)?.name || 'Category'}
              className="h-28 w-28 rounded-xl object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};