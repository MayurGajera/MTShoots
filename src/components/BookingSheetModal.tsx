'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, User, Mail, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Photographer, BookingRequest, ShootDurationType, UsageRightsTier } from '../types';
import { AVAILABLE_ADDONS } from '../data/photographers';
import { fetchAddOns, DbAddOn } from '@/lib/supabase';
import { formatINR } from '../utils/format';
import { useScrollLock } from '../hooks/useScrollLock';

interface BookingSheetModalProps {
  initialConfig?: {
    photographer: Photographer;
    selectedDate: string;
    durationType: ShootDurationType;
    usageRights: UsageRightsTier;
    selectedAddOns: string[];
    totalCost: number;
    shootLocation: string;
  } | null;
  photographers: Photographer[];
  onClose: () => void;
  onConfirmBooking: (booking: BookingRequest) => void;
}

export const BookingSheetModal: React.FC<BookingSheetModalProps> = ({
  initialConfig,
  photographers,
  onClose,
  onConfirmBooking
}) => {
  useScrollLock(true);

  const [addOnsList, setAddOnsList] = useState(AVAILABLE_ADDONS);

  useEffect(() => {
    fetchAddOns().then(dbAddOns => {
      if (dbAddOns && dbAddOns.length > 0) {
        setAddOnsList(dbAddOns.map(a => ({
          id: a.id,
          name: a.name,
          price: a.price,
          description: a.description || ''
        })));
      }
    }).catch(() => {});
  }, []);

  const defaultPhotographer = initialConfig?.photographer || photographers[0];

  const [selectedPhotographerId, setSelectedPhotographerId] = useState<string>(
    defaultPhotographer.id
  );
  const currentPhotographer =
    photographers.find((p) => p.id === selectedPhotographerId) || defaultPhotographer;

  const [artDirectorName, setArtDirectorName] = useState<string>('');
  const [artDirectorEmail, setArtDirectorEmail] = useState<string>('');
  const [shootDate, setShootDate] = useState<string>(initialConfig?.selectedDate || '2026-09-30');
  const [callTime, setCallTime] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>(
    initialConfig?.shootLocation || currentPhotographer.officeLocation || currentPhotographer.location
  );
  const [locationAddress, setLocationAddress] = useState<string>(
    currentPhotographer.officeAddress || currentPhotographer.location
  );
  const [durationType, setDurationType] = useState<ShootDurationType>(
    initialConfig?.durationType || 'full-day'
  );
  const [usageRights, setUsageRights] = useState<UsageRightsTier>(
    initialConfig?.usageRights || 'commercial-standard'
  );
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(
    initialConfig?.selectedAddOns || []
  );
  const [notes, setNotes] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [cancellationAccepted, setCancellationAccepted] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const locationOptions = useMemo(() => {
    const opts = [
      {
        label: 'Studio / Office',
        value: currentPhotographer.officeLocation || currentPhotographer.location,
        address: currentPhotographer.officeAddress || currentPhotographer.location
      },
      {
        label: 'Main shoot city',
        value: currentPhotographer.location,
        address: currentPhotographer.location
      }
    ];
    return opts;
  }, [currentPhotographer]);

  const durationMultiplier = durationType === 'half-day' ? 0.6 : durationType === 'full-day' ? 1 : durationType === 'two-day' ? 1.9 : 2.7;
  const durationCost = Math.round(currentPhotographer.dayRate * durationMultiplier);

  const usageMultiplier = usageRights === 'editorial' ? 0.25 : usageRights === 'commercial-standard' ? 0.45 : usageRights === 'commercial-global' ? 0.75 : 1.2;
  const usageCost = Math.round(currentPhotographer.dayRate * usageMultiplier);

  const addOnsCost = selectedAddOns.reduce((sum, id) => {
    const item = addOnsList.find((a) => a.id === id);
    return sum + (item ? item.price : 0);
  }, 0);

  const productionFee = 5000;
  const totalCost = durationCost + usageCost + addOnsCost + productionFee;

  const handleLocationChoice = (value: string) => {
    setSelectedLocation(value);
    const matched = locationOptions.find((option) => option.value === value);
    if (matched) setLocationAddress(matched.address);
  };

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!artDirectorName.trim() || artDirectorName.trim().length < 2) {
      errors.name = 'Please enter your name (minimum 2 characters)';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!artDirectorEmail.trim() || !emailRegex.test(artDirectorEmail.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (!shootDate) {
      errors.date = 'Please select a shoot date';
    }
    if (!callTime.trim()) {
      errors.time = 'Please enter call time (e.g. 09:00 AM)';
    }
    if (!termsAccepted || !privacyAccepted || !cancellationAccepted) {
      errors.terms = 'Please accept all policy terms to proceed';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    if (!termsAccepted || !privacyAccepted || !cancellationAccepted) {
      return;
    }

    const randomNum = Math.floor(100 + Math.random() * 900);
    const campaignTitle = `${currentPhotographer.primaryCategory} shoot`;
    const clientBrand = currentPhotographer.name;
    const newBooking: BookingRequest = {
      id: `CS-2026-IND-${randomNum}`,
      photographerId: currentPhotographer.id,
      photographerName: currentPhotographer.name,
      photographerAvatar: currentPhotographer.avatar,
      campaignTitle,
      clientBrand,
      artDirectorName,
      artDirectorEmail,
      shootDate,
      callTime,
      locationName: selectedLocation,
      locationAddress,
      durationType,
      usageRights,
      selectedAddOns,
      dayRate: currentPhotographer.dayRate,
      durationCost,
      usageCost,
      addOnsCost,
      productionFee,
      totalCost,
      status: 'confirmed',
      createdAt: new Date().toISOString().split('T')[0],
      notes,
      shotListOverview: 'Shot 01: Key portrait set. Shot 02-05: Styling details, movement frames, and location coverage.'
    };

    onConfirmBooking(newBooking);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#181615]/80 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-[#E7E1DA] overflow-hidden shadow-2xl animate-fadeIn my-8 overscroll-contain">
        <div className="bg-[#FAF8F5] px-6 py-5 border-b border-[#E7E1DA] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#C85A32]">
              Booking Details
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#181615]">
              Complete Your Booking
            </h2>
            <p className="text-xs text-[#8a726a] mt-0.5">
              Confirm your shoot date, location, and contact details.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F4EFEB] text-[#181615] transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block mb-1.5">
              Selected Photographer
            </label>
            <select
              value={selectedPhotographerId}
              onChange={(e) => setSelectedPhotographerId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E7E1DA] bg-[#FAF8F5] text-sm text-[#181615] font-medium focus:outline-none focus:border-[#C85A32] cursor-pointer"
            >
              {photographers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}  -  {formatINR(p.dayRate)}/day ({p.location})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block mb-1.5">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8a726a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={artDirectorName}
                  onChange={(e) => { setArtDirectorName(e.target.value); if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' })); }}
                  placeholder="e.g. Priya Sharma"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E7E1DA] text-sm text-[#181615] placeholder:text-stone-400 placeholder:font-normal focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block mb-1.5">
                Your Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8a726a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={artDirectorEmail}
                  onChange={(e) => { setArtDirectorEmail(e.target.value); if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' })); }}
                  placeholder="e.g. priya.sharma@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E7E1DA] text-sm text-[#181615] placeholder:text-stone-400 placeholder:font-normal focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block mb-1.5">
                Shoot Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#8a726a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  min={(() => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - 6);
                    return d.toISOString().split('T')[0];
                  })()}
                  value={shootDate}
                  onChange={(e) => setShootDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E7E1DA] text-sm text-[#181615] focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block mb-1.5">
                Start Time (Call Time)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-[#8a726a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={callTime}
                  onChange={(e) => { setCallTime(e.target.value); if (formErrors.time) setFormErrors(prev => ({ ...prev, time: '' })); }}
                  placeholder="e.g. 07:00 AM IST"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E7E1DA] text-sm text-[#181615] placeholder:text-stone-400 placeholder:font-normal focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block">
              Preferred Shoot Location
            </label>
            <div className="space-y-2">
              {locationOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    selectedLocation === option.value ? 'border-[#C85A32] bg-[#fbf2ee]' : 'border-[#E7E1DA] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <input
                    type="radio"
                    name="selected-location"
                    checked={selectedLocation === option.value}
                    onChange={() => handleLocationChoice(option.value)}
                    className="mt-1 text-[#C85A32]"
                  />
                  <div className="flex-1">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#181615]">
                      <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                      {option.label}
                    </span>
                    <span className="mt-1 block text-[11px] text-[#8a726a]">{option.address}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block mb-1.5">
              Address for Production Team
            </label>
            <input
              type="text"
              required
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E7E1DA] text-sm text-[#181615] focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#181615] block mb-1.5">
              Shot List &amp; Special Instructions
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E7E1DA] text-xs text-[#181615] focus:outline-none focus:border-[#C85A32] leading-relaxed"
            />
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#57423b] block">Total Price</span>
              <span className="font-serif text-2xl font-bold text-[#181615] tabular-nums">
                {formatINR(totalCost)}
              </span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-[#EAF4ED] text-[#2D593E] font-medium">
              Instant Confirmation
            </span>
          </div>

          <div className="rounded-2xl border border-[#E7E1DA] bg-[#FAF8F5] p-4 sm:p-5 space-y-3.5">
            <div className="flex items-start gap-2.5 text-xs text-[#181615]">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded text-[#C85A32] cursor-pointer"
              />
              <label className="leading-relaxed">
                I agree to the <a href="/terms" target="_blank" rel="noreferrer" className="font-bold underline text-[#C85A32] hover:text-[#B24E2A]">Terms and Conditions</a> for photography booking and shoot execution.
              </label>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-[#181615]">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-0.5 rounded text-[#C85A32] cursor-pointer"
              />
              <label className="leading-relaxed">
                I agree to the <a href="/privacy" target="_blank" rel="noreferrer" className="font-bold underline text-[#C85A32] hover:text-[#B24E2A]">Privacy Policy</a> and understand my contact details are used for booking coordination only.
              </label>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-[#181615]">
              <input
                type="checkbox"
                checked={cancellationAccepted}
                onChange={(e) => setCancellationAccepted(e.target.checked)}
                className="mt-0.5 rounded text-[#C85A32] cursor-pointer"
              />
              <label className="leading-relaxed">
                I accept the <a href="/cancellation" target="_blank" rel="noreferrer" className="font-bold underline text-[#C85A32] hover:text-[#B24E2A]">Cancellation &amp; Refund Slabs</a> including rescheduling policies.
              </label>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-[#E7E1DA] text-xs font-semibold text-[#57423b] hover:bg-[#FAF8F5] cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="confirm-booking-submit-btn"
              type="submit"
              disabled={!termsAccepted || !privacyAccepted || !cancellationAccepted}
              className="px-6 py-2.5 rounded-lg bg-[#C85A32] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#B24E2A] transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
