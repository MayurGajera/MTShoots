'use client';
import React from 'react';
import { PHOTOGRAPHY_CATEGORIES, PhotographyCategory } from '../data/categories';
import { Sparkles } from 'lucide-react';

interface CategoryFlowBarProps {
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  photographerCountsByCategory: Record<string, number>;
  totalPhotographersCount?: number;
}

export const CategoryFlowBar: React.FC<CategoryFlowBarProps> = ({
  selectedCategory,
  onSelectCategory,
  photographerCountsByCategory,
  totalPhotographersCount
}) => {
  const isAllSelected = !selectedCategory || selectedCategory === 'all' || selectedCategory === 'All Categories';

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#C85A32]" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-[#181615]">
            Explore By Photography Genre
          </h2>
          <span className="text-xs text-[#8a726a] font-normal hidden sm:inline">
            (Curated Genre Flow)
          </span>
        </div>
        {!isAllSelected && (
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-semibold text-[#C85A32] hover:text-[#9f3c16] hover:underline cursor-pointer"
          >
            View All Genres ({totalPhotographersCount ?? photographerCountsByCategory['all'] ?? 14})
          </button>
        )}
      </div>

      {/* Category Scroll Stream */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none no-scrollbar">
        {PHOTOGRAPHY_CATEGORIES.map((cat: PhotographyCategory) => {
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
              onClick={() => onSelectCategory(isAll ? 'all' : cat.name)}
              className={`group flex items-center space-x-2.5 px-3 py-2 rounded-2xl border transition-all duration-200 shrink-0 cursor-pointer text-left ${
                isSelected
                  ? 'bg-white border-[#C85A32] ring-2 ring-[#C85A32]/20 shadow-md scale-[1.02]'
                  : 'bg-white/80 border-[#E7E1DA] hover:bg-white hover:border-[#dec0b7] hover:shadow-xs'
              }`}
            >
              {/* Category Thumbnail */}
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#E7E1DA]/60 bg-[#F4EFEB]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-[#C85A32]/20 backdrop-blur-[1px]" />
                )}
              </div>

              {/* Category Label and Count */}
              <div className="pr-1.5">
                <div
                  className={`text-xs font-bold leading-tight whitespace-nowrap transition-colors ${
                    isSelected ? 'text-[#C85A32]' : 'text-[#181615] group-hover:text-[#C85A32]'
                  }`}
                >
                  {cat.shortName}
                </div>
                <div className="text-[11px] text-[#8a726a] flex items-center space-x-1 mt-0.5">
                  <span className="tabular-nums font-medium">
                    {count === 1 ? '1 Photographer' : `${count} Photographers`}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
