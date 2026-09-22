import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181615] flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex-1 w-full space-y-10">
        <div className="space-y-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-[#8a726a] hover:text-[#C85A32] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fbf2ee] border border-[#dec0b7] text-[#C85A32] text-xs font-bold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" /> Legal Terms
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#181615]">
            Terms &amp; Conditions
          </h1>
          <p className="text-xs sm:text-sm text-[#8a726a]">
            Effective Date: September 21, 2026 • Last updated: September 2026
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E7E1DA] shadow-sm space-y-8 text-sm text-[#57423b] leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#181615]">1. Overview &amp; Acceptance</h2>
            <p>
              Welcome to MTShoots (&quot;MTShoots&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). MTShoots operates a premier online marketplace connecting clients (brands, individuals, corporations, art directors) with verified professional photographers and cinematographers across India.
            </p>
            <p>
              By accessing, browsing, registering, or booking photography services through MTShoots, you agree to be bound by these Terms and Conditions and our Cancellation and Privacy Policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#181615]">2. Booking &amp; Escrow Payments</h2>
            <p>
              All bookings made via MTShoots are subject to confirmation by the artist. When a booking is confirmed:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>A booking deposit or full session payment is authorized via secure encrypted payment gateways.</li>
              <li>Funds are held safely in escrow and are only released to the photographer after scheduled shoot completion and delivery of agreed previews or proofs.</li>
              <li>Clients must provide precise shoot briefs, location permissions, call times, and subject details in advance.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#181615]">3. Deliverables, Licensing &amp; Copyright</h2>
            <p>
              Unless otherwise specified in a custom enterprise contract:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The photographer retains foundational moral and intellectual copyright under the Indian Copyright Act, 1957.</li>
              <li>The client is granted an exclusive or standard commercial license according to the selected Usage Rights tier (Editorial, Commercial Standard, Global, or Buyout).</li>
              <li>Final edited files are delivered via MTShoots cloud storage within the agreed turnaround window (typically 3–5 business days).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#181615]">4. Photographer Standards &amp; Verification</h2>
            <p>
              All photographers listed on MTShoots undergo portfolio vetting, identity verification, and equipment inspection. MTShoots enforces strict punctuality and delivery standards. Artists failing to uphold quality or professional conduct will be removed from the directory.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#181615]">5. Limitation of Liability</h2>
            <p>
              In the rare event of equipment failure, weather disruption, or emergency preventing shoot completion, MTShoots guarantees a priority substitute verified artist or a 100% immediate refund of all escrowed fees.
            </p>
          </section>

          <div className="pt-6 border-t border-[#E7E1DA] flex flex-wrap gap-4 text-xs">
            <Link to="/cancellation" className="text-[#C85A32] font-semibold hover:underline">
              View Cancellation &amp; Refund Policy →
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
