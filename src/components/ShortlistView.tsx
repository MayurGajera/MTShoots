import React from 'react';
import { Bookmark, Trash2, ArrowRight, Heart, Star, MapPin } from 'lucide-react';
import { Photographer } from '../types';
import { formatINR } from '../utils/format';

interface ShortlistViewProps {
  savedPhotographers: Photographer[];
  onSelectPhotographer: (p: Photographer) => void;
  onRemoveFromShortlist: (id: string) => void;
  onBrowseRosterClick: () => void;
  onQuickBook: (p: Photographer) => void;
}

export const ShortlistView: React.FC<ShortlistViewProps> = ({
  savedPhotographers,
  onSelectPhotographer,
  onRemoveFromShortlist,
  onBrowseRosterClick,
  onQuickBook
}) => {
  if (savedPhotographers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E7E1DA] p-12 text-center max-w-xl mx-auto my-12 shadow-sm">
        <Bookmark className="w-12 h-12 text-[#8a726a] mx-auto mb-4" />
        <h3 className="font-serif text-2xl font-bold text-[#181615] mb-2">
          No Saved Photographers Yet
        </h3>
        <p className="text-xs text-[#57423b] mb-6 leading-relaxed">
          Click the heart icon on any photographer card to save them here. This makes it easy to compare daily rates, styles, and availability before booking.
        </p>
        <button
          onClick={onBrowseRosterClick}
          className="px-6 py-2.5 rounded-lg bg-[#C85A32] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#B24E2A] transition-all cursor-pointer"
        >
          Browse Photographers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E7E1DA]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C85A32]">
              Saved Collection
            </span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#181615] mt-1">
            Saved Photographers ({savedPhotographers.length})
          </h2>
          <p className="text-xs text-[#8a726a] mt-0.5">
            Compare rates and check available dates for your upcoming shoots
          </p>
        </div>
      </div>

      {/* Grid of Shortlisted Photographers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedPhotographers.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-[#E7E1DA] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-[4/5] sm:aspect-[3/4] bg-[#181615] overflow-hidden cursor-pointer" onClick={() => onSelectPhotographer(p)}>
              <img
                src={p.heroImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-110 pointer-events-none"
              />
              <img
                src={p.heroImage}
                alt={p.name}
                className="relative z-10 w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromShortlist(p.id);
                }}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-[#8a726a] hover:text-[#C85A32] hover:bg-white shadow-sm transition-colors cursor-pointer"
                title="Remove from saved"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <h3
                    onClick={() => onSelectPhotographer(p)}
                    className="font-serif text-xl font-bold text-[#181615] hover:text-[#C85A32] cursor-pointer"
                  >
                    {p.name}
                  </h3>
                  <div className="flex items-center text-xs font-medium text-[#181615]">
                    <Star className="w-3.5 h-3.5 text-[#D9A05B] fill-[#D9A05B] mr-1" />
                    <span>{p.rating}</span>
                  </div>
                </div>

                <div className="flex items-center text-xs text-[#57423b] mt-1">
                  <MapPin className="w-3 h-3 text-[#C85A32] mr-1" />
                  <span>{p.location}</span>
                </div>

                <p className="text-xs text-[#8a726a] mt-2 line-clamp-2">{p.bio}</p>
              </div>

              <div className="pt-3 border-t border-[#E7E1DA] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-[#8a726a] font-bold block">
                    Day Rate (8h)
                  </span>
                  <span className="font-bold text-base text-[#181615] tabular-nums">
                    {formatINR(p.dayRate)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onQuickBook(p)}
                    className="px-3.5 py-1.5 rounded-md bg-[#C85A32] text-white text-xs font-semibold hover:bg-[#B24E2A] transition-colors cursor-pointer"
                  >
                    Book Date
                  </button>
                  <button
                    onClick={() => onSelectPhotographer(p)}
                    className="p-1.5 rounded-md border border-[#E7E1DA] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                    title="View full profile"
                  >
                    <ArrowRight className="w-4 h-4 text-[#181615]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
