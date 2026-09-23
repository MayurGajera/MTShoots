'use client';
import React from 'react';
import { Link, useNavigate } from '@/lib/navigation';
import { Clock, RefreshCw, AlertTriangle, ArrowLeft, CheckCircle2, ShieldCheck, Calendar } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const CancellationPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181615] flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex-1 w-full space-y-10">
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a726a] hover:text-[#C85A32] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fbf2ee] border border-[#dec0b7] text-[#C85A32] text-xs font-bold uppercase tracking-wider">
            <RefreshCw className="w-3.5 h-3.5" /> Booking Protection
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#181615]">
            Cancellation &amp; Refund Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#8a726a]">
            Clear, transparent policies designed to protect both clients and professional artists.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E7E1DA] shadow-sm space-y-8 text-sm text-[#57423b] leading-relaxed">
          {/* Refund Slabs Table */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#181615]">
              Standard Cancellation Slabs
            </h2>
            <p>
              Photographers block dates exclusively on their production calendars once confirmed. To ensure fair compensation for reserved dates while offering client flexibility, our tiered cancellation timeline applies:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#E7E1DA] rounded-2xl overflow-hidden">
                <thead className="bg-[#FAF8F5] border-b border-[#E7E1DA] text-[#181615] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Cancellation Notice</th>
                    <th className="p-4">Refund Amount</th>
                    <th className="p-4">Processing Time</th>
                    <th className="p-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E1DA]">
                  <tr className="bg-white hover:bg-[#FAF8F5]/50 transition-colors">
                    <td className="p-4 font-semibold text-[#181615]">More than 7 days prior</td>
                    <td className="p-4 text-[#2D593E] font-bold">100% Full Refund</td>
                    <td className="p-4">3 - 5 Business Days</td>
                    <td className="p-4 text-[#8a726a]">Minus standard payment gateway fee (2%)</td>
                  </tr>
                  <tr className="bg-white hover:bg-[#FAF8F5]/50 transition-colors">
                    <td className="p-4 font-semibold text-[#181615]">3 to 7 days prior</td>
                    <td className="p-4 text-[#C85A32] font-bold">75% Refund</td>
                    <td className="p-4">3 - 5 Business Days</td>
                    <td className="p-4 text-[#8a726a]">25% retained for artist date lock</td>
                  </tr>
                  <tr className="bg-white hover:bg-[#FAF8F5]/50 transition-colors">
                    <td className="p-4 font-semibold text-[#181615]">48 to 72 hours prior</td>
                    <td className="p-4 text-[#C85A32] font-bold">50% Refund</td>
                    <td className="p-4">3 - 5 Business Days</td>
                    <td className="p-4 text-[#8a726a]">Half-rate reserved date compensation</td>
                  </tr>
                  <tr className="bg-white hover:bg-[#FAF8F5]/50 transition-colors">
                    <td className="p-4 font-semibold text-[#181615]">Under 48 hours / No-Show</td>
                    <td className="p-4 text-[#181615] font-bold">No Refund</td>
                    <td className="p-4"> - </td>
                    <td className="p-4 text-[#8a726a]">Full session rate paid to artist</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Rescheduling */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#181615] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#C85A32]" /> Free Date Rescheduling
            </h2>
            <p>
              Need to shift your shoot date due to client schedules, venue changes, or sickness?
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You can reschedule for <strong>FREE</strong> up to 72 hours before the shoot date, subject to the photographer&apos;s mutual availability.</li>
              <li>Rescheduled dates must occur within 90 days of the original booking.</li>
            </ul>
          </section>

          {/* Weather & Force Majeure */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#181615] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#D9A05B]" /> Weather &amp; Outdoor Shoot Disruptions
            </h2>
            <p>
              In cases of heavy rain, natural cyclones, severe air quality advisories, or civic lockdowns preventing outdoor photography:
            </p>
            <p>
              Both client and photographer can mutually agree to reschedule at zero penalty, or move to an indoor studio location. If no alternative date is possible, a 100% refund is issued.
            </p>
          </section>

          {/* Artist Cancellation Guarantee */}
          <section className="space-y-3 p-5 rounded-2xl bg-[#EAF4ED] border border-[#2D593E]/20 text-[#2D593E]">
            <h3 className="font-serif text-lg font-bold flex items-center gap-2 text-[#2D593E]">
              <ShieldCheck className="w-5 h-5" /> 100% Artist Replacement Guarantee
            </h3>
            <p className="text-xs sm:text-sm text-[#2D593E]/90 leading-relaxed">
              If a booked photographer becomes unavailable due to an emergency, MTShoots guarantees to either match you with a vetted equal-or-higher tier artist at no additional charge, or immediately refund 100% of your escrow deposit.
            </p>
          </section>

          <div className="pt-6 border-t border-[#E7E1DA] flex flex-wrap gap-4 text-xs">
            <Link to="/terms" className="text-[#C85A32] font-semibold hover:underline">
              View Terms &amp; Conditions →
            </Link>
            <Link to="/privacy" className="text-[#C85A32] font-semibold hover:underline">
              View Privacy Policy →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};


export default CancellationPage;
