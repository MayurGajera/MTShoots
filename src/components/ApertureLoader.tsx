import React from 'react';

interface ApertureLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  fullScreen?: boolean;
}

export const ApertureLoader: React.FC<ApertureLoaderProps> = ({
  size = 'md',
  label,
  fullScreen = false
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const loader = (
    <div className="flex flex-col items-center justify-center gap-3 select-none">
      <div className={`relative ${sizeMap[size]} flex items-center justify-center`} aria-label="Loading" role="status">
        <img
          src="/camera-loader.svg"
          alt="Camera loading animation"
          className="w-full h-full object-contain drop-shadow-sm"
          loading="eager"
        />
      </div>
      {label && (
        <p className="font-sans text-xs text-[#8a726a] font-semibold tracking-wide uppercase animate-pulse text-center">
          {label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[300] bg-[#FAF8F5]/95 backdrop-blur-md flex items-center justify-center">
        {loader}
      </div>
    );
  }

  return loader;
};

/** Inline button spinner  -  tiny aperture for button loading states */
export const ButtonSpinner: React.FC<{ className?: string; text?: string }> = ({ className = '', text }) => (
  <span className="inline-flex items-center gap-2">
    <div
      className={`inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full ${className}`}
      style={{ animation: 'aperture-spin 0.7s linear infinite' }}
      aria-hidden="true"
    />
    {text && <span>{text}</span>}
  </span>
);