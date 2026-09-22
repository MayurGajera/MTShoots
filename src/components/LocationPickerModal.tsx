'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Locate, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useScrollLock } from '../hooks/useScrollLock';

const MAJOR_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
  'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam', 'Prayagraj', 'Patna',
  'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad',
  'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad',
  'Amritsar', 'Navi Mumbai', 'Thane', 'Coimbatore', 'Kochi',
  'Guwahati', 'Chandigarh', 'Jodhpur', 'Madurai', 'Raipur',
  'Goa', 'Udaipur', 'Shimla', 'Darjeeling', 'Mysuru',
];

interface LocationPickerModalProps {
  onSelect: (city: string) => void;
  onDismiss: () => void;
  initialCity?: string;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  onSelect,
  onDismiss,
  initialCity
}) => {
  const [query, setQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useScrollLock(true);

  useEffect(() => {
    // Try to auto-detect location
    if (!initialCity) {
      setIsDetecting(true);
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const resp = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
              );
              const data = await resp.json();
              const city = data.address?.city || data.address?.town || data.address?.county || '';
              if (city) setDetectedCity(city);
            } catch {}
            setIsDetecting(false);
          },
          () => {
            setPermissionDenied(true);
            setIsDetecting(false);
          },
          { timeout: 5000 }
        );
      } else {
        setIsDetecting(false);
      }
    }
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const filtered = query.trim()
    ? MAJOR_CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : MAJOR_CITIES;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-[#E7E1DA]"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#181615] to-[#2D2421] px-6 pt-8 pb-6 text-white">
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-[#C85A32] flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold">Your Location</h2>
              <p className="text-white/60 text-xs mt-0.5">Find photographers near you</p>
            </div>
          </div>

          {/* Detected city */}
          <AnimatePresence>
            {isDetecting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-xs text-white/70 mt-2"
              >
                <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                <span>Detecting your location...</span>
              </motion.div>
            )}
            {detectedCity && !isDetecting && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelect(detectedCity)}
                className="mt-3 w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-colors text-left cursor-pointer border border-white/20"
              >
                <Locate className="w-4 h-4 text-[#D9A05B] shrink-0" />
                <div>
                  <div className="text-sm font-semibold">{detectedCity}</div>
                  <div className="text-xs text-white/60">Detected near you • Use this location</div>
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a726a]" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search city..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7E1DA] text-sm text-[#181615] focus:outline-none focus:border-[#C85A32] transition-colors"
            />
          </div>
        </div>

        {/* City List */}
        <div className="px-5 pb-2 max-h-56 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-[#8a726a] text-center py-4">No city found. Try a different spelling.</p>
          ) : (
            filtered.map(city => (
              <button
                key={city}
                onClick={() => onSelect(city)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#F4EFEB] text-left transition-colors cursor-pointer group"
              >
                <MapPin className="w-4 h-4 text-[#8a726a] shrink-0 group-hover:text-[#C85A32] transition-colors" />
                <span className="text-sm font-medium text-[#181615]">{city}</span>
              </button>
            ))
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-5 pt-3 border-t border-[#E7E1DA] mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#57423b]">
              <Camera className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Are you a photographer?</span>
            </div>
            <button
              onClick={onDismiss}
              className="text-xs font-semibold text-[#C85A32] hover:underline cursor-pointer"
            >
              Skip for now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
