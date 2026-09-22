import React from 'react';

export const ShimmerCard: React.FC = () => (
  <article className="bg-white rounded-2xl border border-[#E7E1DA] overflow-hidden flex flex-col">
    {/* Image placeholder */}
    <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full shimmer" />

    {/* Body */}
    <div className="p-5 flex-1 flex flex-col space-y-4">
      <div>
        {/* Badge row */}
        <div className="flex gap-2 mb-3">
          <div className="h-5 w-24 rounded-full shimmer" />
          <div className="h-5 w-20 rounded-full shimmer" />
        </div>
        {/* Name */}
        <div className="h-6 w-40 rounded shimmer mb-2" />
        {/* Bio snippet */}
        <div className="h-4 w-full rounded shimmer mb-1" />
        <div className="h-4 w-3/4 rounded shimmer" />
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[#E7E1DA] flex items-center justify-between">
        <div>
          <div className="h-3 w-16 rounded shimmer mb-1" />
          <div className="h-6 w-24 rounded shimmer" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-lg shimmer" />
          <div className="h-8 w-8 rounded-lg shimmer" />
        </div>
      </div>
    </div>
  </article>
);

export const ShimmerCardGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <ShimmerCard key={i} />
    ))}
  </div>
);

export const ShimmerProfile: React.FC = () => (
  <div className="space-y-6 animate-fadeIn">
    {/* Hero */}
    <div className="h-64 w-full rounded-2xl shimmer" />
    {/* Info row */}
    <div className="flex gap-4">
      <div className="w-20 h-20 rounded-full shimmer shrink-0" />
      <div className="flex-1 space-y-2 pt-2">
        <div className="h-6 w-48 rounded shimmer" />
        <div className="h-4 w-32 rounded shimmer" />
      </div>
    </div>
    {/* Bio */}
    <div className="space-y-2">
      <div className="h-4 w-full rounded shimmer" />
      <div className="h-4 w-full rounded shimmer" />
      <div className="h-4 w-2/3 rounded shimmer" />
    </div>
    {/* Portfolio grid */}
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-xl shimmer" />
      ))}
    </div>
  </div>
);

export const ShimmerBookingCard: React.FC = () => (
  <div className="bg-white rounded-2xl border border-[#E7E1DA] p-5 space-y-4">
    <div className="flex gap-3">
      <div className="w-12 h-12 rounded-full shimmer shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-5 w-36 rounded shimmer" />
        <div className="h-3 w-24 rounded shimmer" />
      </div>
      <div className="h-6 w-20 rounded-full shimmer" />
    </div>
    <div className="h-px bg-[#E7E1DA]" />
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <div className="h-3 w-16 rounded shimmer" />
        <div className="h-4 w-24 rounded shimmer" />
      </div>
      <div className="space-y-1">
        <div className="h-3 w-16 rounded shimmer" />
        <div className="h-4 w-20 rounded shimmer" />
      </div>
    </div>
  </div>
);
