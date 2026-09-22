import React from 'react';

interface ApertureLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullScreen?: boolean;
}

export const ApertureLoader: React.FC<ApertureLoaderProps> = ({
  size = 'md',
  label,
  fullScreen = false
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const loader = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`relative ${sizeMap[size]}`} aria-label="Loading" role="status">
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-[#C85A32]/20"
          style={{ animation: 'aperture-spin 2s linear infinite reverse' }}
        />
        {/* Inner aperture blades */}
        <div
          className={`aperture-loader ${sizeMap[size]}`}
          aria-hidden="true"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aperture-loader-blade" />
          ))}
        </div>
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#C85A32] opacity-80" />
        </div>
      </div>
      {label && (
        <p className="text-xs text-[#8a726a] font-medium animate-pulse">{label}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-sm flex items-center justify-center">
        {loader}
      </div>
    );
  }

  return loader;
};

/** Inline button spinner — tiny aperture for button loading states */
export const ButtonSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full ${className}`}
    style={{ animation: 'aperture-spin 0.7s linear infinite' }}
    aria-hidden="true"
  />
);
