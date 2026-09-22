import React from 'react';
import { Camera, Instagram, Twitter, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MTShootsLogo } from './MTShootsLogo';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#181615] text-white">
      {/* Top CTA Strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                Ready to book your shoot?
              </h2>
              <p className="text-sm text-white/60 mt-1">
                Find the perfect photographer for your next project.
              </p>
            </div>
            <Link
              to="/photographers"
              className="shrink-0 px-7 py-3 rounded-full bg-[#C85A32] text-white text-sm font-bold tracking-wide hover:bg-[#B24E2A] transition-all shadow-lg hover:shadow-[#C85A32]/30 hover:scale-[1.03]"
            >
              Explore Photographers →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1 space-y-4">
            <MTShootsLogo size="sm" showTagline={false} darkMode />
            <p className="text-xs text-white/50 leading-relaxed max-w-xs">
              India's premium verified photography network. Connecting clients with professional photographers for every occasion.
            </p>
            <div className="flex items-center space-x-3">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C85A32] transition-colors cursor-pointer" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C85A32] transition-colors cursor-pointer" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C85A32] transition-colors cursor-pointer" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Explore Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C85A32]">Explore</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'All Photographers', to: '/photographers' },
                { label: 'Wedding Photography', to: '/photographers?category=Wedding' },
                { label: 'Fashion & Editorial', to: '/photographers?category=Fashion' },
                { label: 'Commercial & Advertising', to: '/photographers?category=Commercial' },
                { label: 'Portrait Photography', to: '/photographers?category=Portraits' },
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-xs text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Photographers Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C85A32]">For Photographers</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Join as a Photographer', to: '/auth?role=photographer' },
                { label: 'Manage Your Profile', to: '/auth' },
                { label: 'Add Portfolio', to: '/auth' },
                { label: 'Manage Bookings', to: '/bookings' },
                { label: 'Photographer FAQ', to: '/' },
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-xs text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C85A32]">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
                <span className="text-xs text-white/60">hello@mtshoots.in</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
                <span className="text-xs text-white/60">+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
                <span className="text-xs text-white/60">Mumbai, Delhi, Bengaluru & 12+ cities across India</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-white/40">
            © {year} MTShoots. All rights reserved. India's Verified Photography Network.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[11px] text-white/40 hover:text-white/70 transition-colors">Privacy Policy</a>
            <a href="#" className="text-[11px] text-white/40 hover:text-white/70 transition-colors">Terms of Service</a>
            <a href="#" className="text-[11px] text-white/40 hover:text-white/70 transition-colors">Cancellation Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
