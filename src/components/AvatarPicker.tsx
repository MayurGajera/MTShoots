'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, User, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface AvatarPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  optional?: boolean;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  value,
  onChange,
  label = 'Profile Photo',
  helperText = 'Upload a photo from your device or leave blank for default avatar',
  optional = true
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.onerror = () => {
      setError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E7E1DA] transition-all">
      {/* Label and Optional badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <label className="text-xs font-bold text-[#181615]">
          {label}
        </label>
        {optional && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8a726a] bg-white px-2 py-0.5 rounded-full border border-[#E7E1DA]">
            Optional
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
        {/* Profile Photo Circle Preview / Drag Target */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative shrink-0 w-20 h-20 rounded-full cursor-pointer transition-all group ${
            isDragging ? 'scale-105 ring-4 ring-[#C85A32]/40' : 'hover:ring-4 hover:ring-[#C85A32]/20'
          }`}
          title="Click to upload profile photo"
        >
          {value ? (
            <>
              <img
                src={value}
                alt="Profile Preview"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-[#C85A32]/30 shadow-sm"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-5 h-5" />
              </div>
            </>
          ) : (
            <div className="w-20 h-20 rounded-full bg-white border-2 border-dashed border-[#E7E1DA] group-hover:border-[#C85A32] flex flex-col items-center justify-center text-[#8a726a] group-hover:text-[#C85A32] transition-colors shadow-2xs">
              <User className="w-7 h-7 stroke-[1.75]" />
              <Camera className="w-3.5 h-3.5 -mt-1 opacity-75" />
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Action Buttons & Helper Text */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <p className="text-xs text-[#57423b] font-medium leading-relaxed">
            {value ? 'Profile photo selected.' : helperText}
          </p>
          <p className="text-[11px] text-[#8a726a] mt-0.5">
            PNG, JPG, or WebP up to 5MB. If left blank, your profile will show a default user icon.
          </p>

          <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F4EFEB] border border-[#E7E1DA] hover:border-[#C85A32] text-xs font-semibold text-[#181615] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>{value ? 'Change Photo' : 'Upload Photo'}</span>
            </button>

            {value && (
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 border border-[#E7E1DA] hover:border-red-300 text-xs font-semibold text-red-600 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
