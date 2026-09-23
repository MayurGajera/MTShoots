'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Check, X, Sparkles } from 'lucide-react';
import { fetchCities } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectCity?: (city: string) => void;
  placeholder?: string;
  inputClassName?: string;
  className?: string;
}

const DEFAULT_MAJOR_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Indore',
  'Chandigarh', 'Kochi', 'Goa', 'Udaipur', 'Vadodara', 'Bhopal'
];

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onChange,
  onSelectCity,
  placeholder = 'e.g. Mumbai, Delhi, Jaipur',
  inputClassName = '',
  className = ''
}) => {
  const { selectedCity } = useApp();
  const [cities, setCities] = useState<string[]>(DEFAULT_MAJOR_CITIES);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCities().then(remote => {
      if (remote && remote.length > 0) {
        setCities(remote);
      }
    }).catch(() => {});
  }, []);

  // Filter cities based on user input
  const trimmed = value.trim().toLowerCase();
  const filtered = trimmed
    ? cities.filter(c => c.toLowerCase().includes(trimmed))
    : cities.slice(0, 10);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: string) => {
    onChange(city);
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (onSelectCity) {
      onSelectCity(city);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % Math.min(filtered.length, 8));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + Math.min(filtered.length, 8)) % Math.min(filtered.length, 8));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        e.preventDefault();
        handleSelect(filtered[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className={`w-full bg-transparent focus:outline-none ${inputClassName}`}
        />
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              inputRef.current?.focus();
            }}
            className="p-1 rounded-full hover:bg-stone-200/50 text-[#8a726a] hover:text-[#181615] transition-colors"
            title="Clear city"
            aria-label="Clear city"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Suggestion Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-full min-w-[260px] max-w-sm bg-white rounded-2xl shadow-2xl border border-[#E7E1DA] overflow-hidden z-[100] animate-fadeIn">
          <div className="p-2 border-b border-[#E7E1DA]/60 bg-[#FAF8F5]/80 flex items-center justify-between text-[11px] font-semibold text-[#8a726a]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C85A32]" />
              {trimmed ? 'Matching Cities' : 'Popular Photography Hubs'}
            </span>
            <span className="text-[10px] text-[#8a726a]/70">Pan-India</span>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-[#E7E1DA]/40">
            {filtered.length > 0 ? (
              filtered.slice(0, 12).map((city, idx) => {
                const isSelected = selectedCity?.toLowerCase() === city.toLowerCase() || value.toLowerCase() === city.toLowerCase();
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleSelect(city)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer text-xs ${
                      isHighlighted ? 'bg-[#fbf2ee] text-[#C85A32]' : isSelected ? 'bg-[#FAF8F5] text-[#181615] font-bold' : 'hover:bg-[#FAF8F5] text-[#181615]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#C85A32]' : 'text-[#8a726a]'}`} />
                      <span className="font-medium">{city}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-[#8a726a]">
                <p>No exact city found for &ldquo;{value}&rdquo;</p>
                <button
                  type="button"
                  onClick={() => handleSelect(value.trim())}
                  className="mt-2 text-xs font-bold text-[#C85A32] hover:underline"
                >
                  Use &ldquo;{value.trim()}&rdquo; anyway
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
