'use client';
import React, { useState, useRef } from 'react';
import { Camera, Sparkles, Upload, Check, Shuffle, RefreshCw } from 'lucide-react';
import { CARTOON_AVATARS, getRandomCartoonAvatar, DEFAULT_CARTOON_AVATAR } from '../data/avatars';

interface AvatarPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  value,
  onChange,
  label = 'Profile Photo or Cartoon Avatar',
  helperText = 'Choose a cartoon character or upload your own photo'
}) => {
  const isCustomUpload = Boolean(value && !value.includes('api.dicebear.com') && !value.includes('images.unsplash.com'));
  const [activeTab, setActiveTab] = useState<'cartoon' | 'upload'>(isCustomUpload ? 'upload' : 'cartoon');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file. Please try another.');
    };
    reader.readAsDataURL(file);
  };

  const handleSurpriseMe = () => {
    const randomAvatar = getRandomCartoonAvatar();
    onChange(randomAvatar);
    setActiveTab('cartoon');
  };

  return (
    <div className='p-4 bg-[#FAF8F5] rounded-2xl border border-[#E7E1DA] space-y-3.5'>
      {/* Header preview & active selection */}
      <div className='flex items-center gap-3.5'>
        <div className='relative shrink-0'>
          <img
            src={value || DEFAULT_CARTOON_AVATAR}
            alt='Avatar Preview'
            className='w-14 h-14 rounded-full object-cover ring-2 ring-[#C85A32] shadow-sm bg-white'
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_CARTOON_AVATAR;
            }}
          />
          <div className='absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#C85A32] text-white flex items-center justify-center shadow-xs'>
            {activeTab === 'upload' ? <Camera className='w-3 h-3' /> : <Sparkles className='w-3 h-3' />}
          </div>
        </div>

        <div className='flex-1 min-w-0'>
          <div className='text-xs font-bold text-[#181615]'>{label}</div>
          <p className='text-[11px] text-[#8a726a] truncate'>{helperText}</p>
        </div>

        <button
          type='button'
          onClick={handleSurpriseMe}
          title='Surprise cartoon avatar'
          className='px-2.5 py-1.5 rounded-lg bg-white border border-[#E7E1DA] text-[#8a726a] hover:text-[#C85A32] hover:border-[#C85A32] text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shrink-0 shadow-2xs'
        >
          <Shuffle className='w-3 h-3 text-[#C85A32]' />
          <span className='hidden sm:inline'>Surprise</span>
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className='flex rounded-xl bg-white border border-[#E7E1DA] p-1 gap-1'>
        <button
          type='button'
          onClick={() => setActiveTab('cartoon')}
          className={'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ' + (activeTab === 'cartoon' ? 'bg-[#fbf2ee] text-[#9F3C16] border border-[#F4C5B5] shadow-2xs' : 'text-[#8a726a] hover:text-[#181615]')}
        >
          <Sparkles className='w-3.5 h-3.5 text-[#C85A32]' />
          <span>Cartoon Avatar</span>
        </button>
        <button
          type='button'
          onClick={() => setActiveTab('upload')}
          className={'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ' + (activeTab === 'upload' ? 'bg-[#fbf2ee] text-[#9F3C16] border border-[#F4C5B5] shadow-2xs' : 'text-[#8a726a] hover:text-[#181615]')}
        >
          <Upload className='w-3.5 h-3.5 text-[#C85A32]' />
          <span>Upload Photo</span>
        </button>
      </div>

      {/* Tab 1: Cartoon Avatars Grid */}
      {activeTab === 'cartoon' && (
        <div className='space-y-2'>
          <div className='text-[10px] uppercase font-bold text-[#8a726a] tracking-wider'>
            Select Cartoon Character:
          </div>
          <div className='grid grid-cols-6 gap-2 sm:gap-2.5 max-h-40 overflow-y-auto p-1'>
            {CARTOON_AVATARS.map((av) => {
              const isSelected = value === av.url;
              return (
                <button
                  key={av.id}
                  type='button'
                  onClick={() => onChange(av.url)}
                  title={av.name}
                  className={'relative rounded-full aspect-square p-0.5 border-2 transition-all cursor-pointer bg-white group ' + (isSelected ? 'border-[#C85A32] ring-2 ring-[#C85A32]/30 scale-105 shadow-sm' : 'border-transparent hover:border-[#dec0b7] hover:scale-105 opacity-80 hover:opacity-100')}
                >
                  <img src={av.url} alt={av.name} className='w-full h-full rounded-full object-cover' />
                  {isSelected && (
                    <div className='absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C85A32] text-white flex items-center justify-center shadow-xs'>
                      <Check className='w-2.5 h-2.5' />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Upload Photo */}
      {activeTab === 'upload' && (
        <div className='space-y-3'>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/jpeg,image/png,image/webp'
            onChange={handleFileUpload}
            className='hidden'
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className='p-4 rounded-xl border-2 border-dashed border-[#dec0b7] hover:border-[#C85A32] bg-white/70 hover:bg-white text-center cursor-pointer transition-all space-y-1.5 group'
          >
            <div className='w-9 h-9 rounded-full bg-[#fbf2ee] text-[#C85A32] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform'>
              <Camera className='w-4 h-4' />
            </div>
            <div className='text-xs font-bold text-[#181615]'>
              {isCustomUpload ? 'Click to change custom photo' : 'Choose photo from device'}
            </div>
            <p className='text-[10px] text-[#8a726a]'>
              Supports PNG, JPG, or WebP up to 5MB
            </p>
          </div>

          {uploadError && (
            <p className='text-[11px] text-red-600 font-medium text-center'>
              {uploadError}
            </p>
          )}

          {isCustomUpload && (
            <div className='flex justify-center gap-2 pt-1'>
              <button
                type='button'
                onClick={() => {
                  onChange(DEFAULT_CARTOON_AVATAR);
                  setActiveTab('cartoon');
                }}
                className='text-[11px] text-[#8a726a] hover:text-red-600 flex items-center gap-1 cursor-pointer font-medium'
              >
                <RefreshCw className='w-3 h-3' />
                <span>Remove custom photo (use cartoon)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
