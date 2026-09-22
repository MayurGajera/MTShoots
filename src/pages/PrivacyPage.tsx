'use client';
import React from 'react';
import { Link } from '@/lib/navigation';
import { Shield, Lock, Eye, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181615] flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex-1 w-full space-y-10">
        <div className="space-y-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-[#8a726a] hover:text-[#C85A32] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF4ED] border border-[#2D593E]/20 text-[#2D593E] text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" /> Data Protection
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#181615]">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#8a726a]">
            Effective Date: September 21, 2026 • Compliant with Digital Personal Data Protection (DPDP) Act, India
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E7E1DA] shadow-sm space-y-8 text-sm text-[#57423b] leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#181615]">1. Information We Collect</h2>
            <p>
              To facilitate seamless photography bookings and communications, MTShoots collects the following types of information:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Personal Identification:</strong> Full name, verified email address, phone number, and location preference.</li>
              <li><strong>Photographer Credentials:</strong> Portfolio media, camera gear lists, experience certifications, and payment disbursement accounts.</li>
              <li><strong>Booking Details:</strong> Shoot dates, locations, brand names, shot lists, and call times.</li>
              <li><strong>Device &amp; Telemetry:</strong> Anonymized usage logs, location coordinates for nearby artist discovery, and PWA installation state.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#181615]">2. How We Use Your Data</h2>
            <p>
              Your data is strictly utilized to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Match clients with available local photographers in real-time.</li>
              <li>Coordinate shoot logistics, call times, and contact handshakes.</li>
              <li>Securely process escrow transactions and generate GST invoices.</li>
              <li>Protect the community against unauthorized bookings or fraud.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#181615]">3. Data Security &amp; Encryption</h2>
            <p>
              We implement industry-leading 256-bit TLS encryption in transit and rest. We do not sell your personal contact numbers or photo gallery links to third-party marketing companies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#181615]">4. Your Privacy Rights</h2>
            <p>
              You have the right to request a copy of your stored booking records, update inaccurate profile information, or request complete account erasure by contacting privacy@mtshoots.in.
            </p>
          </section>

          <div className="pt-6 border-t border-[#E7E1DA] flex flex-wrap gap-4 text-xs">
            <Link to="/terms" className="text-[#C85A32] font-semibold hover:underline">
              View Terms &amp; Conditions →
            </Link>
            <Link to="/cancellation" className="text-[#C85A32] font-semibold hover:underline">
              View Cancellation Policy →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};


export default PrivacyPage;
