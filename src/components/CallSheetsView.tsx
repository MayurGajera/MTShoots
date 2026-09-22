'use client';
import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  MapPin,
  Printer,
  Share2,
  CheckCircle2,
  Camera,
  ShieldCheck,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sun,
  AlertCircle
} from 'lucide-react';
import { BookingRequest, Photographer } from '../types';
import { formatINR } from '../utils/format';

interface CallSheetsViewProps {
  bookings: BookingRequest[];
  photographers: Photographer[];
  onSelectPhotographer: (p: Photographer) => void;
  onNewBookingClick: () => void;
}

export const CallSheetsView: React.FC<CallSheetsViewProps> = ({
  bookings,
  photographers,
  onSelectPhotographer,
  onNewBookingClick
}) => {
  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    bookings[0]?.id || ''
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeBooking = bookings.find((b) => b.id === selectedBookingId) || bookings[0];
  const assignedPhotographer = activeBooking
    ? photographers.find((p) => p.id === activeBooking.photographerId)
    : null;

  const handleShare = (id: string) => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E7E1DA] p-12 text-center max-w-xl mx-auto my-12 shadow-sm">
        <FileText className="w-12 h-12 text-[#8a726a] mx-auto mb-4" />
        <h3 className="font-serif text-2xl font-bold text-[#181615] mb-2">No Bookings Yet</h3>
        <p className="text-xs text-[#57423b] mb-6 leading-relaxed">
          You have not booked any shoots yet. Browse our verified photographers and book your first shoot to automatically generate a digital call sheet.
        </p>
        <button
          onClick={onNewBookingClick}
          className="px-6 py-2.5 rounded-lg bg-[#C85A32] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#B24E2A] transition-all cursor-pointer"
        >
          Browse Photographers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E1DA]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C85A32]">
              Production &amp; Bookings
            </span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#181615] mt-1">
            Bookings &amp; Call Sheets
          </h2>
          <p className="text-xs text-[#8a726a] mt-0.5">
            View shoot schedules, location directions, team contacts, and photo licenses
          </p>
        </div>

        <button
          onClick={onNewBookingClick}
          className="px-4 py-2.5 rounded-lg bg-[#181615] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#342f2d] transition-all shadow-sm shrink-0 cursor-pointer"
        >
          + Book a New Shoot
        </button>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Call Sheet Selector List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a726a] block px-1">
            All Bookings ({bookings.length})
          </span>

          {bookings.map((booking) => {
            const isSelected = booking.id === activeBooking?.id;
            return (
              <div
                key={booking.id}
                onClick={() => setSelectedBookingId(booking.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white border-[#C85A32] shadow-md ring-1 ring-[#C85A32]/20'
                    : 'bg-white border-[#E7E1DA] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-[#C85A32]">
                    {booking.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      booking.status === 'confirmed'
                        ? 'bg-[#EAF4ED] text-[#2D593E]'
                        : 'bg-[#FBF3E8] text-[#8C531B]'
                    }`}
                  >
                    {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </span>
                </div>

                <h4 className="font-serif text-base font-semibold text-[#181615] line-clamp-1">
                  {booking.campaignTitle}
                </h4>
                <p className="text-xs text-[#57423b] mb-2">{booking.clientBrand}</p>

                <div className="flex items-center justify-between text-xs text-[#8a726a] pt-2 border-t border-[#E7E1DA]">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-[#C85A32]" />
                    {booking.shootDate}
                  </span>
                  <span className="font-bold text-[#181615] tabular-nums font-sans">
                    {formatINR(booking.totalCost)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Full Official Call Sheet Monograph (8 cols) */}
        {activeBooking && (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E7E1DA] overflow-hidden shadow-lg print:border-none print:shadow-none">
            {/* Call Sheet Print / Action Bar */}
            <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#E7E1DA] flex items-center justify-between print:hidden">
              <div className="flex items-center space-x-2 text-xs text-[#57423b]">
                <FileText className="w-4 h-4 text-[#C85A32]" />
                <span>Printable Shoot Schedule &amp; Call Sheet</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleShare(activeBooking.id)}
                  className="px-3 py-1.5 rounded-md border border-[#E7E1DA] bg-white text-xs font-semibold text-[#181615] hover:bg-[#FAF8F5] flex items-center space-x-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>{copiedId === activeBooking.id ? 'Copied Link!' : 'Copy Share Link'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-md bg-[#181615] text-white text-xs font-semibold hover:bg-[#342f2d] flex items-center space-x-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Call Sheet</span>
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-6 sm:p-8 lg:p-10 space-y-8 font-sans">
              {/* Document Header */}
              <div className="border-b-2 border-[#181615] pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#C85A32] font-bold block">
                    OFFICIAL SHOOT CALL SHEET
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181615] tracking-tight mt-1">
                    {activeBooking.campaignTitle}
                  </h1>
                  <p className="text-sm font-semibold text-[#57423b] mt-1">
                    Client / Brand: <span className="text-[#181615]">{activeBooking.clientBrand}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right font-mono text-xs">
                  <div className="text-base font-bold text-[#181615]">{activeBooking.id}</div>
                  <div className="text-[#8a726a]">Booked On: {activeBooking.createdAt}</div>
                  <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded bg-[#EAF4ED] text-[#2D593E] font-bold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    STATUS: CONFIRMED
                  </div>
                </div>
              </div>

              {/* Crucial Production Parameters (Grid 3 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a726a] block">
                    Shoot Date &amp; Start Time
                  </span>
                  <div className="text-sm font-bold text-[#181615] mt-1 flex items-center">
                    <Calendar className="w-4 h-4 text-[#C85A32] mr-1.5 shrink-0" />
                    {activeBooking.shootDate}
                  </div>
                  <div className="text-xs font-semibold text-[#C85A32] mt-0.5 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 shrink-0" />
                    Start Time: {activeBooking.callTime}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a726a] block">
                    Sunrise &amp; Best Light
                  </span>
                  <div className="text-sm font-bold text-[#181615] mt-1 flex items-center">
                    <Sun className="w-4 h-4 text-[#D9A05B] mr-1.5 shrink-0" />
                    Sunrise: 06:48 AM IST
                  </div>
                  <div className="text-xs text-[#57423b] mt-0.5">
                    Golden Hour: 06:50–07:45 AM • Clear Sky 24°C
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a726a] block">
                    Primary Contact
                  </span>
                  <div className="text-sm font-bold text-[#181615] mt-1 flex items-center">
                    <User className="w-4 h-4 text-[#181615] mr-1.5 shrink-0" />
                    {activeBooking.artDirectorName}
                  </div>
                  <div className="text-xs text-[#57423b] mt-0.5">{activeBooking.artDirectorEmail}</div>
                </div>
              </div>

              {/* Location & GPS Section */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8a726a] block">
                  Shoot Location &amp; Directions
                </span>
                <div className="p-4 rounded-xl border border-[#E7E1DA] bg-white flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-[#C85A32] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#181615]">{activeBooking.locationName}</h4>
                    <p className="text-xs text-[#57423b] mt-0.5">{activeBooking.locationAddress}</p>
                    <p className="text-[11px] text-[#8a726a] mt-1">
                      Main entrance on ground floor. Equipment unloading permitted at designated vehicle gate.
                    </p>
                  </div>
                </div>
              </div>

              {/* Creative & Technical Personnel */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8a726a] block">
                  Confirmed Team on Shoot
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-[#E7E1DA] bg-[#FAF8F5] flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={activeBooking.photographerAvatar}
                        alt={activeBooking.photographerName}
                        className="w-10 h-10 rounded-full object-cover border border-[#E7E1DA]"
                      />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#8a726a] block">
                          Lead Photographer
                        </span>
                        <span className="text-xs font-bold text-[#181615]">
                          {activeBooking.photographerName}
                        </span>
                      </div>
                    </div>
                    {assignedPhotographer && (
                      <button
                        onClick={() => onSelectPhotographer(assignedPhotographer)}
                        className="text-xs text-[#C85A32] hover:underline font-semibold flex items-center cursor-pointer"
                      >
                        View Profile
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </button>
                    )}
                  </div>

                  <div className="p-3 rounded-lg border border-[#E7E1DA] bg-[#FAF8F5] flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#dec0b7] flex items-center justify-center font-bold text-[#181615] text-xs">
                      1A
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#8a726a] block">
                        Photo Assistant &amp; Screen Tech
                      </span>
                      <span className="text-xs font-bold text-[#181615]">
                        Assigned by Studio
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shot List & Creative Notes */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8a726a] block">
                  Shot List &amp; Notes
                </span>
                <div className="p-4 rounded-xl border border-[#E7E1DA] bg-[#FAF8F5] space-y-2 text-xs text-[#181615]">
                  <p className="font-medium leading-relaxed">{activeBooking.notes}</p>
                  {activeBooking.shotListOverview && (
                    <div className="pt-2 border-t border-[#E7E1DA] font-mono text-[11px] text-[#57423b]">
                      {activeBooking.shotListOverview}
                    </div>
                  )}
                </div>
              </div>

              {/* Deliverables & Photo Access */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8a726a] block">
                  Shoot Deliverables &amp; Image Access
                </span>
                <div className="p-4 rounded-xl border border-[#E7E1DA] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-[#181615] block">
                      Full-Resolution Digital Gallery ({activeBooking.usageRights.replace('-', ' ')})
                    </span>
                    <span className="text-[11px] text-[#57423b]">
                      Color-graded, print-ready files delivered within {assignedPhotographer?.turnaroundDays || 3} business days.
                    </span>
                  </div>
                  <span className="font-bold font-mono text-sm text-[#C85A32] tabular-nums shrink-0">
                    Total Amount: {formatINR(activeBooking.totalCost)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
