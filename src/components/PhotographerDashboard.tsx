import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar, Clock, MapPin, CheckCircle2, AlertCircle, XCircle,
  User, FileText, Mail, MessageSquare,
  ArrowUpDown, Sparkles, Camera
} from "lucide-react";
import { formatINR } from "../utils/format";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export interface PhotographerEnquiry {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  campaignTitle: string;
  shootDate: string;
  callTime: string;
  locationName: string;
  locationAddress: string;
  durationType: string;
  usageRights: string;
  durationCost: number;
  usageCost: number;
  addOnsCost: number;
  productionFee: number;
  totalCost: number;
  status: 'pending' | 'confirmed' | 'in_production' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
  discipline?: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
  pending: {
    label: "Pending Action",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: AlertCircle
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle2
  },
  in_production: {
    label: "In Production",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: Sparkles
  },
  completed: {
    label: "Completed",
    bg: "bg-stone-100",
    text: "text-stone-700",
    border: "border-stone-200",
    icon: CheckCircle2
  },
  cancelled: {
    label: "Declined",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: XCircle
  }
};

const DEFAULT_ENQUIRIES: PhotographerEnquiry[] = [
  {
    id: "ENQ-2026-DEL-108",
    clientName: "Aarav Singhania",
    clientEmail: "aarav.singhania@example.com",
    clientPhone: "+91 98201 44552",
    campaignTitle: "Luxury Heritage Wedding & Reception",
    shootDate: "2026-10-18",
    callTime: "09:00 AM",
    locationName: "The Leela Palace, New Delhi",
    locationAddress: "Diplomatic Enclave, Chanakyapuri, New Delhi, 110023",
    durationType: "full-day",
    usageRights: "personal",
    durationCost: 75000,
    usageCost: 5000,
    addOnsCost: 5000,
    productionFee: 0,
    totalCost: 85000,
    status: 'pending',
    createdAt: "2026-09-22",
    notes: "Require coverage of traditional ceremony and evening cocktail reception. Drone permits arranged.",
    discipline: "Wedding"
  },
  {
    id: "CS-2026-UDR-245",
    clientName: "Meera & Siddharth",
    clientEmail: "meera.s@example.com",
    clientPhone: "+91 98112 33441",
    campaignTitle: "Golden Hour Pre-Wedding Destination Shoot",
    shootDate: "2026-10-25",
    callTime: "03:30 PM",
    locationName: "City Palace Lake Shore, Udaipur",
    locationAddress: "Old City, Udaipur, Rajasthan, 313001",
    durationType: "half-day",
    usageRights: "personal",
    durationCost: 55000,
    usageCost: 5000,
    addOnsCost: 5000,
    productionFee: 0,
    totalCost: 65000,
    status: 'confirmed',
    createdAt: "2026-09-20",
    notes: "Romantic sunset portraits by the lake. Looking for cinematic tone grading and drone shots.",
    discipline: "Pre-Wedding"
  },
  {
    id: "PRD-2026-BOM-032",
    clientName: "Rohit Verma (Studio Lumina)",
    clientEmail: "rohit.v@studiolumina.in",
    clientPhone: "+91 99200 88771",
    campaignTitle: "Spring/Summer Lookbook Editorial",
    shootDate: "2026-11-04",
    callTime: "10:00 AM",
    locationName: "Mehboob Studios, Bandra West",
    locationAddress: "Hill Road, Bandra West, Mumbai, Maharashtra 400050",
    durationType: "full-day",
    usageRights: "commercial",
    durationCost: 40000,
    usageCost: 8000,
    addOnsCost: 0,
    productionFee: 0,
    totalCost: 48000,
    status: 'in_production',
    createdAt: "2026-09-18",
    notes: "Fashion apparel brand catalog. White seamless cyclorama and ambient high-key lighting required.",
    discipline: "Fashion"
  }
];

export const PhotographerDashboard: React.FC<{
  user?: any;
  onOpenNewBooking?: () => void;
}> = ({ user }) => {
  const [enquiries, setEnquiries] = useState<PhotographerEnquiry[]>([]);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'in_production' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date_asc' | 'date_desc' | 'cost_desc' | 'created_desc'>('date_asc');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mtshoots_photographer_enquiries');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEnquiries(parsed);
          setSelectedEnquiryId(parsed[0].id);
          return;
        }
      }
      setEnquiries(DEFAULT_ENQUIRIES);
      localStorage.setItem('mtshoots_photographer_enquiries', JSON.stringify(DEFAULT_ENQUIRIES));
      setSelectedEnquiryId(DEFAULT_ENQUIRIES[0].id);
    } catch {
      setEnquiries(DEFAULT_ENQUIRIES);
      setSelectedEnquiryId(DEFAULT_ENQUIRIES[0].id);
    }
  }, []);

  const saveEnquiries = (updated: PhotographerEnquiry[]) => {
    setEnquiries(updated);
    try {
      localStorage.setItem('mtshoots_photographer_enquiries', JSON.stringify(updated));
    } catch {}
  };

  const handleUpdateStatus = (id: string, newStatus: PhotographerEnquiry['status'], successMsg: string) => {
    const updated = enquiries.map(enq => enq.id === id ? { ...enq, status: newStatus } : enq);
    saveEnquiries(updated);
    showToast(successMsg);

    try {
      const stored = localStorage.getItem('capturely_bookings');
      if (stored) {
        const bookings = JSON.parse(stored);
        if (Array.isArray(bookings)) {
          const updatedBookings = bookings.map((b: any) => b.id === id ? { ...b, status: newStatus } : b);
          localStorage.setItem('capturely_bookings', JSON.stringify(updatedBookings));
          window.dispatchEvent(new CustomEvent('bookings-updated'));
        }
      }
    } catch {}
  };

  const metrics = useMemo(() => {
    const pendingCount = enquiries.filter(e => e.status === 'pending').length;
    const confirmedCount = enquiries.filter(e => e.status === 'confirmed').length;
    const inProductionCount = enquiries.filter(e => e.status === 'in_production').length;
    const totalBookedValue = enquiries
      .filter(e => e.status === 'confirmed' || e.status === 'in_production' || e.status === 'completed')
      .reduce((sum, e) => sum + (e.totalCost || 0), 0);

    return {
      total: enquiries.length,
      pending: pendingCount,
      confirmed: confirmedCount,
      inProduction: inProductionCount,
      bookedValue: totalBookedValue
    };
  }, [enquiries]);

  const filteredEnquiries = useMemo(() => {
    let list = enquiries.filter(enq => {
      if (statusFilter === 'all') return true;
      return enq.status === statusFilter;
    });

    return list.sort((a, b) => {
      if (sortBy === 'date_asc') return new Date(a.shootDate).getTime() - new Date(b.shootDate).getTime();
      if (sortBy === 'date_desc') return new Date(b.shootDate).getTime() - new Date(a.shootDate).getTime();
      if (sortBy === 'cost_desc') return b.totalCost - a.totalCost;
      if (sortBy === 'created_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
  }, [enquiries, statusFilter, sortBy]);

  const activeEnquiry = useMemo(() => {
    return enquiries.find(e => e.id === selectedEnquiryId) || filteredEnquiries[0] || null;
  }, [enquiries, selectedEnquiryId, filteredEnquiries]);

  const photographerName = user?.fullName || 'Photographer';

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar />

      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#181615] text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Photographer Welcome Header */}
        <div className="bg-gradient-to-r from-[#181615] via-[#2A2421] to-[#181615] text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-md border border-[#E7E1DA]/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold uppercase tracking-wider mb-2 border border-white/15">
                <Camera className="w-3.5 h-3.5 text-[#C85A32]" />
                Photographer Portal
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Welcome back, {photographerName}
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 mt-1">
                Manage your client enquiries, confirmed shoot schedules, and shoot logistics in one place.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/10 rounded-2xl px-4 py-3 border border-white/10 backdrop-blur-xs text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-300 block">Confirmed Bookings</span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-white">{formatINR(metrics.bookedValue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top 4 Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-[#E7E1DA] shadow-xs">
            <div className="flex items-center justify-between text-[#8a726a] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Enquiries</span>
              <FileText className="w-4 h-4 text-[#8a726a]" />
            </div>
            <p className="font-serif text-2xl font-bold text-[#181615]">{metrics.total}</p>
            <p className="text-[11px] text-[#8a726a] mt-1">All client requests received</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E7E1DA] shadow-xs">
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Action</span>
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="font-serif text-2xl font-bold text-amber-700">{metrics.pending}</p>
            <p className="text-[11px] text-[#8a726a] mt-1">Requires your confirmation</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E7E1DA] shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Confirmed Shoots</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="font-serif text-2xl font-bold text-emerald-700">{metrics.confirmed}</p>
            <p className="text-[11px] text-[#8a726a] mt-1">Locked into calendar</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E7E1DA] shadow-xs">
            <div className="flex items-center justify-between text-blue-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">In Production</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="font-serif text-2xl font-bold text-blue-700">{metrics.inProduction}</p>
            <p className="text-[11px] text-[#8a726a] mt-1">Editing & delivery phase</p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-2xl border border-[#E7E1DA] p-4 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All', count: metrics.total },
              { id: 'pending', label: 'Pending Action', count: metrics.pending },
              { id: 'confirmed', label: 'Confirmed', count: metrics.confirmed },
              { id: 'in_production', label: 'In Production', count: metrics.inProduction },
              { id: 'completed', label: 'Completed', count: enquiries.filter(e => e.status === 'completed').length }
            ].map(tab => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#181615] text-white shadow-xs'
                      : 'text-[#8a726a] hover:bg-[#FAF8F5] hover:text-[#181615]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    active ? 'bg-white/20 text-white' : 'bg-[#E7E1DA] text-[#57423b]'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8a726a]" />
            <span className="text-xs text-[#8a726a] font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FAF8F5] border border-[#E7E1DA] text-xs font-semibold text-[#181615] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C85A32] cursor-pointer"
            >
              <option value="date_asc">Shoot Date (Upcoming First)</option>
              <option value="date_desc">Shoot Date (Latest First)</option>
              <option value="cost_desc">Highest Value (INR)</option>
              <option value="created_desc">Newest Enquiry First</option>
            </select>
          </div>
        </div>

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Enquiries List */}
          <div className="lg:col-span-5 space-y-3">
            {filteredEnquiries.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E7E1DA] p-10 text-center">
                <FileText className="w-8 h-8 text-[#8a726a] mx-auto mb-2 opacity-50" />
                <p className="font-bold text-sm text-[#181615]">No enquiries found</p>
                <p className="text-xs text-[#8a726a] mt-1">There are no shoots matching this filter.</p>
              </div>
            ) : (
              filteredEnquiries.map(enquiry => {
                const status = STATUS_CONFIG[enquiry.status] || STATUS_CONFIG.pending;
                const isSelected = activeEnquiry?.id === enquiry.id;
                const StatusIcon = status.icon;

                return (
                  <div
                    key={enquiry.id}
                    onClick={() => setSelectedEnquiryId(enquiry.id)}
                    className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer text-left relative ${
                      isSelected
                        ? 'border-[#C85A32] ring-2 ring-[#C85A32]/20 shadow-md'
                        : 'border-[#E7E1DA] hover:border-[#C85A32]/40 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[10px] font-mono text-[#8a726a] uppercase tracking-wider block">{enquiry.id}</span>
                        <h3 className="font-bold text-sm sm:text-base text-[#181615] leading-snug mt-0.5">{enquiry.clientName}</h3>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${status.bg} ${status.text} ${status.border} shrink-0`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>

                    <p className="text-xs text-[#57423b] font-medium line-clamp-1 mb-3">
                      {enquiry.campaignTitle}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#8a726a] pt-3 border-t border-[#FAF8F5]">
                      <div className="flex items-center gap-1.5 truncate">
                        <Calendar className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
                        <span className="truncate font-medium text-[#181615]">{enquiry.shootDate}</span>
                      </div>
                      <div className="flex items-center justify-end font-serif font-bold text-sm text-[#181615]">
                        {formatINR(enquiry.totalCost)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detailed View */}
          <div className="lg:col-span-7">
            {activeEnquiry ? (
              <div className="bg-white rounded-3xl border border-[#E7E1DA] shadow-sm overflow-hidden sticky top-24">
                {/* Detail Header */}
                <div className="bg-[#FAF8F5] border-b border-[#E7E1DA] p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-[#8a726a] uppercase tracking-wider">{activeEnquiry.id}</span>
                        <span className="text-xs text-[#8a726a]">Received on {activeEnquiry.createdAt}</span>
                      </div>
                      <h2 className="font-serif text-2xl font-bold text-[#181615]">{activeEnquiry.campaignTitle}</h2>
                    </div>

                    {(() => {
                      const status = STATUS_CONFIG[activeEnquiry.status] || STATUS_CONFIG.pending;
                      const StatusIcon = status.icon;
                      return (
                        <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${status.bg} ${status.text} ${status.border}`}>
                          <StatusIcon className="w-4 h-4" />
                          {status.label}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Client Information Card */}
                  <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#E7E1DA]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a726a] mb-3">Client Details</p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#181615] text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {activeEnquiry.clientName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#181615]">{activeEnquiry.clientName}</p>
                          <p className="text-xs text-[#8a726a]">{activeEnquiry.clientEmail}</p>
                          <p className="text-xs text-[#57423b] font-medium mt-0.5">{activeEnquiry.clientPhone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${activeEnquiry.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${activeEnquiry.clientName}, this is ${photographerName} regarding your shoot enquiry (${activeEnquiry.id}) on MTShoots.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                        <a
                          href={`mailto:${activeEnquiry.clientEmail}?subject=${encodeURIComponent(`Regarding Shoot Booking ${activeEnquiry.id}`)}`}
                          className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E7E1DA] hover:bg-white text-[#181615] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Email
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Shoot Logistics Grid */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a726a] mb-3">Shoot Logistics</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA] flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-[#8a726a]">Shoot Date</p>
                          <p className="text-sm font-semibold text-[#181615] mt-0.5">{activeEnquiry.shootDate}</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA] flex items-start gap-3">
                        <Clock className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-[#8a726a]">Call Time & Duration</p>
                          <p className="text-sm font-semibold text-[#181615] mt-0.5 capitalize">
                            {activeEnquiry.callTime} ({activeEnquiry.durationType.replace('-', ' ')})
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA] flex items-start gap-3 sm:col-span-2">
                        <MapPin className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-[#8a726a]">Venue & Address</p>
                          <p className="text-sm font-semibold text-[#181615] mt-0.5">{activeEnquiry.locationName}</p>
                          <p className="text-xs text-[#8a726a] mt-0.5">{activeEnquiry.locationAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {activeEnquiry.notes && (
                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E1DA]">
                      <p className="text-[10px] uppercase font-bold text-[#8a726a] mb-1">Client Notes & Special Requirements</p>
                      <p className="text-xs text-[#57423b] leading-relaxed">{activeEnquiry.notes}</p>
                    </div>
                  )}

                  {/* Financials & Payout */}
                  <div className="border border-[#E7E1DA] rounded-2xl overflow-hidden">
                    <div className="bg-[#FAF8F5] px-4 py-3 border-b border-[#E7E1DA] flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#181615]">Financial Summary</span>
                      <span className="text-xs text-[#8a726a]">Direct Client Billing</span>
                    </div>
                    <div className="p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[#57423b]">
                        <span className="capitalize">Photographer Fee ({activeEnquiry.durationType.replace('-', ' ')})</span>
                        <span className="font-medium text-[#181615]">{formatINR(activeEnquiry.durationCost)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#57423b]">
                        <span className="capitalize">Commercial Usage Rights ({activeEnquiry.usageRights})</span>
                        <span className="font-medium text-[#181615]">{formatINR(activeEnquiry.usageCost)}</span>
                      </div>
                      {activeEnquiry.addOnsCost > 0 && (
                        <div className="flex items-center justify-between text-[#57423b]">
                          <span>Add-ons / Equipment</span>
                          <span className="font-medium text-[#181615]">{formatINR(activeEnquiry.addOnsCost)}</span>
                        </div>
                      )}
                      <div className="border-t border-[#E7E1DA] pt-2 flex items-center justify-between text-sm font-bold text-[#181615]">
                        <span>Total Payout</span>
                        <span className="font-serif text-lg text-[#181615]">{formatINR(activeEnquiry.totalCost)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Action Controls */}
                  <div className="pt-2">
                    {activeEnquiry.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(activeEnquiry.id, 'confirmed', 'Shoot confirmed! Client has been notified.')}
                          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Accept & Confirm Shoot
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(activeEnquiry.id, 'cancelled', 'Enquiry declined.')}
                          className="w-full sm:w-auto py-3 px-5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {activeEnquiry.status === 'confirmed' && (
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(activeEnquiry.id, 'in_production', 'Shoot status updated to In Production.')}
                          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#181615] hover:bg-[#2A2421] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                        >
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          Mark Shoot In Production
                        </button>

                        <a
                          href={`https://wa.me/${activeEnquiry.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${activeEnquiry.clientName}, looking forward to our shoot on ${activeEnquiry.shootDate}! Please let me know if you need to coordinate any call time details.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Chat on WhatsApp
                        </a>
                      </div>
                    )}

                    {activeEnquiry.status === 'in_production' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(activeEnquiry.id, 'completed', 'Shoot marked as Completed and Delivered!')}
                        className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark as Completed & Photos Delivered
                      </button>
                    )}

                    {activeEnquiry.status === 'completed' && (
                      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-600 font-medium">
                        This shoot has been completed and final media delivered.
                      </div>
                    )}

                    {activeEnquiry.status === 'cancelled' && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center text-xs text-rose-600 font-medium">
                        This enquiry was declined.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#E7E1DA] p-12 text-center">
                <FileText className="w-12 h-12 text-[#8a726a] mx-auto mb-3 opacity-40" />
                <h3 className="font-bold text-base text-[#181615]">Select an enquiry</h3>
                <p className="text-xs text-[#8a726a] mt-1">Click any enquiry or booking from the left list to view details.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PhotographerDashboard;
