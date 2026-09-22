import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Camera, MapPin, Calendar, Sparkles } from 'lucide-react';
import { PortfolioItem } from '../types';
import { useScrollLock } from '../hooks/useScrollLock';

interface MediaLightboxProps {
  item: PortfolioItem | null;
  allItems: PortfolioItem[];
  onClose: () => void;
  onNavigate: (item: PortfolioItem) => void;
  onBookSimilar?: () => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  item,
  allItems,
  onClose,
  onNavigate,
  onBookSimilar
}) => {
  useScrollLock(!!item);

  if (!item) return null;

  const currentIndex = allItems.findIndex((i) => i.id === item.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allItems.length - 1;

  const handlePrev = () => {
    if (hasPrev) onNavigate(allItems[currentIndex - 1]);
  };

  const handleNext = () => {
    if (hasNext) onNavigate(allItems[currentIndex + 1]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) handlePrev();
      if (e.key === 'ArrowRight' && hasNext) handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, hasPrev, hasNext]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181615]/95 backdrop-blur-md transition-opacity">
      {/* Top Floating Controls */}
      <div className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between z-20 text-white">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold tracking-widest uppercase text-[#D9A05B]">
            Portfolio Master Lightbox
          </span>
          <span className="text-xs text-white/50">
            {currentIndex + 1} / {allItems.length}
          </span>
        </div>

        <button
          id="close-lightbox-btn"
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Close Lightbox (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Prev Navigation Button */}
      {hasPrev && (
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all backdrop-blur-sm"
          title="Previous Image (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Navigation Button */}
      {hasNext && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all backdrop-blur-sm"
          title="Next Image (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Image Stage */}
      <div className="relative max-w-5xl max-h-[80vh] mx-auto p-4 flex flex-col items-center justify-center">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/10"
          referrerPolicy="no-referrer"
        />

        <div className="w-full mt-4 bg-[#FAF8F5]/90 backdrop-blur-md rounded-xl p-4 text-[#181615] border border-[#E7E1DA] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C85A32]">
                {item.category}
              </span>
              <span className="text-xs text-[#8a726a]">• {item.year}</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#181615]">{item.title}</h3>
            <div className="flex items-center gap-x-2 text-xs text-[#57423b]">
              <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>{item.location}</span>
            </div>
          </div>

          {onBookSimilar && (
            <button
              onClick={() => {
                onClose();
                onBookSimilar();
              }}
              className="shrink-0 px-4 py-2 rounded-md bg-[#C85A32] text-white text-xs font-semibold hover:bg-[#B24E2A] transition-all shadow-sm"
            >
              Book For Similar Shoot
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
