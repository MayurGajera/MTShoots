import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Camera, Star, Shield, Clock, ChevronRight, Play, Search,
  CheckCircle2, Users, Image, Calendar as CalendarIcon, Sparkles, ArrowRight,
  ShieldCheck, Award, Zap, Heart, MapPin, Locate
} from 'lucide-react';
import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MTShootsLogo } from '../components/MTShootsLogo';
import { PhotographerCard } from '../components/PhotographerCard';
import { INITIAL_PHOTOGRAPHERS } from '../data/photographers';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1537944434965-cf4679d1a598?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?auto=format&fit=crop&w=1600&q=85',
];

const CATEGORIES = [
  { name: 'Wedding', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80', count: '120+ photographers' },
  { name: 'Fashion', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80', count: '85+ photographers' },
  { name: 'Portraits', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80', count: '200+ photographers' },
  { name: 'Architecture', image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=400&q=80', count: '60+ photographers' },
  { name: 'Commercial', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80', count: '95+ photographers' },
  { name: 'Food', image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=400&q=80', count: '45+ photographers' },
];

const STATS = [
  { label: 'Verified Photographers', value: '500+', icon: ShieldCheck },
  { label: 'Successful Bookings', value: '12K+', icon: CalendarIcon },
  { label: 'Cities Covered', value: '28+', icon: Camera },
  { label: 'Average Rating', value: '4.9★', icon: Star },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Browse & Discover', description: 'Explore verified photographers by category, location, budget, and live dates. View real portfolios and read verified reviews.', icon: Search },
  { step: '02', title: 'Choose Date & Book', description: 'Select your preferred artist, pick a shoot date from their real-time calendar, and configure your duration & license tier.', icon: CalendarIcon },
  { step: '03', title: 'Shoot & Receive', description: 'Your artist arrives fully equipped. After the shoot, receive fully edited, high-resolution galleries within 3–5 business days.', icon: Image },
];

const TESTIMONIALS = [
  {
    quote: "MTShoots made finding a wedding photographer so effortless. We found Rohan within minutes and our photos look like high fashion editorial.",
    name: "Priya & Arjun Sharma",
    role: "Wedding Photography Client • Mumbai",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    rating: 5,
  },
  {
    quote: "As a fashion director, we needed someone with an exact medium-format aesthetic. We booked Meera through MTShoots and she nailed every single look.",
    name: "Kavya Nair",
    role: "Creative Director, LYRA • Bengaluru",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
    rating: 5,
  },
  {
    quote: "The escrow payment and guaranteed substitute model gave our brand complete peace of mind. We have booked 4 commercial shoots already.",
    name: "Rohit Agarwal",
    role: "Founder, Apex Lifestyle • Delhi NCR",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    rating: 5,
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Search & Calendar Form State
  const [searchCategory, setSearchCategory] = useState('All');
  const [searchCity, setSearchCity] = useState(() => {
    try {
      return localStorage.getItem('mtshoots_city') || '';
    } catch {
      return '';
    }
  });
  const [searchDate, setSearchDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  // Shortlist state for featured cards
  const [shortlistIds, setShortlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('capturely_shortlist');
      return saved ? JSON.parse(saved) : ['darshan-mehta', 'rohan-varma'];
    } catch {
      return ['darshan-mehta', 'rohan-varma'];
    }
  });

  const handleToggleShortlist = (id: string) => {
    const next = shortlistIds.includes(id)
      ? shortlistIds.filter(x => x !== id)
      : [...shortlistIds, id];
    setShortlistIds(next);
    try { localStorage.setItem('capturely_shortlist', JSON.stringify(next)); } catch {}
  };

  // Rotate hero image every 6 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setHeroLoaded(false);
      setHeroIndex(i => (i + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCategory && searchCategory !== 'All') params.set('category', searchCategory);
    if (searchCity.trim()) params.set('city', searchCity.trim());
    if (searchDate) params.set('date', searchDate);
    navigate(`/photographers?${params.toString()}`);
  };

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const data = await resp.json();
          const city = data.address?.city || data.address?.town || data.address?.state_district || '';
          if (city) {
            setSearchCity(city);
            try { localStorage.setItem('mtshoots_city', city); } catch {}
          }
        } catch {}
      });
    }
  };

  const featuredPhotographers = INITIAL_PHOTOGRAPHERS.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181615] flex flex-col">
      {/* Unified Global Navbar */}
      <Navbar />

      {/* ============================================================ */}
      {/* HERO SECTION WITH ROTATING PHOTOGRAPHY & CALENDAR SEARCH BAR */}
      {/* ============================================================ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background Rotating Images with smooth fade */}
        {!heroLoaded && <div className="absolute inset-0 shimmer" />}
        <img
          key={HERO_IMAGES[heroIndex]}
          src={HERO_IMAGES[heroIndex]}
          alt="Professional photography"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 scale-105 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setHeroLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-12 pb-20">
          <div className="max-w-3xl space-y-6">
            {/* Trust Pill */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-semibold shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D9A05B]" />
              <span>India's Verified Professional Photography Network</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.12] tracking-tight"
            >
              Book India's Finest Photographers
              <span className="block text-[#D9A05B] mt-1 font-sans font-extrabold tracking-normal">
                Directly by Date &amp; Location
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-white/85 leading-relaxed max-w-xl"
            >
              From royal weddings and fashion lookbooks to commercial campaigns. Check real-time artist availability, review complete portfolios, and book with 100% escrow protection.
            </motion.p>

            {/* ============================================================ */}
            {/* HERO CALENDAR & LOCATION SEARCH CONSOLE                      */}
            {/* ============================================================ */}
            <motion.form
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onSubmit={handleSearchSubmit}
              className="bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-3xl shadow-2xl border border-white/60 max-w-2xl text-[#181615]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {/* 1. Category */}
                <div className="p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E1DA] flex flex-col justify-center">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[#8a726a] flex items-center gap-1 mb-1">
                    <Camera className="w-3 h-3 text-[#C85A32]" />
                    <span>Specialty</span>
                  </label>
                  <select
                    value={searchCategory}
                    onChange={e => setSearchCategory(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-[#181615] focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="Wedding">Wedding &amp; Pre-Wedding</option>
                    <option value="Fashion">Fashion &amp; Editorial</option>
                    <option value="Portraits">Portraits &amp; Headshots</option>
                    <option value="Architecture">Architecture &amp; Interior</option>
                    <option value="Commercial">Commercial &amp; Brand</option>
                    <option value="Food">Food &amp; Beverage</option>
                    <option value="Automotive">Automotive</option>
                  </select>
                </div>

                {/* 2. City / Location */}
                <div className="p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E1DA] flex flex-col justify-center relative">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[#8a726a] flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C85A32]" />
                      <span>City / State</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      className="text-[10px] text-[#C85A32] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                      title="Detect current location"
                    >
                      <Locate className="w-2.5 h-2.5" /> Near me
                    </button>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Delhi, Jaipur"
                    value={searchCity}
                    onChange={e => setSearchCity(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-[#181615] placeholder-[#8a726a] focus:outline-none"
                  />
                </div>

                {/* 3. Shoot Date Calendar */}
                <div className="p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E1DA] flex flex-col justify-center">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[#8a726a] flex items-center gap-1 mb-1">
                    <CalendarIcon className="w-3 h-3 text-[#C85A32]" />
                    <span>Target Date</span>
                  </label>
                  <input
                    type="date"
                    value={searchDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setSearchDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-[#181615] focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit CTA Button */}
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#57423b]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4A7C59]" />
                  <span>Real-time availability confirmed</span>
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold text-xs shadow-lg hover:shadow-[#C85A32]/30 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] ml-auto"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Available Photographers</span>
                </button>
              </div>
            </motion.form>

            {/* Trust Mini-Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-5 pt-2 text-white/90 text-xs font-medium"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#4A7C59]" />
                <span>100% Identity &amp; Portfolio Vetted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#D9A05B]" />
                <span>3–5 Day High-Res Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#7B9ED9]" />
                <span>Escrow Payment Protection</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Hero image indicator dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setHeroLoaded(false); setHeroIndex(i); }}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === heroIndex ? 'w-6 h-1.5 bg-[#C85A32]' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Hero slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* STATS BAND                                                   */}
      {/* ============================================================ */}
      <section className="bg-white border-y border-[#E7E1DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#181615]">{stat.value}</div>
                <div className="text-xs text-[#8a726a] font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURED VERIFIED PHOTOGRAPHERS (CARDS WITH BEST ANIMATION)  */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C85A32] mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Curated Talent</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#181615]">
              Featured Master Photographers
            </h2>
            <p className="text-sm text-[#57423b] mt-1.5 max-w-lg">
              Award-winning artists currently accepting bookings across India. Click any profile to view their signature slider.
            </p>
          </div>

          <Link
            to="/photographers"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#181615] text-white text-xs font-semibold hover:bg-[#C85A32] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>View All Photographers ({INITIAL_PHOTOGRAPHERS.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Animated Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredPhotographers.map(p => (
            <PhotographerCard
              key={p.id}
              photographer={p}
              onSelect={() => navigate(`/photographers/${p.id}`)}
              onQuickBook={() => navigate(`/photographers/${p.id}`)}
              isSaved={shortlistIds.includes(p.id)}
              onToggleSave={handleToggleShortlist}
            />
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* PHOTOGRAPHY CATEGORIES                                       */}
      {/* ============================================================ */}
      <section className="bg-[#F4EFEB]/60 border-y border-[#E7E1DA] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C85A32] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Browse by Category</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#181615]">
              Specialized by Genre
            </h2>
            <p className="text-sm text-[#57423b] mt-3 max-w-lg mx-auto leading-relaxed">
              Every genre requires unique lighting, lenses, and direction. Find specialists tailored to your brief.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                to={`/photographers?category=${encodeURIComponent(cat.name)}`}
                className="group relative overflow-hidden rounded-3xl aspect-[3/4] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
              >
                <img
                  src={cat.image}
                  alt={`${cat.name} photography`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-serif font-bold text-base leading-tight">{cat.name}</p>
                  <p className="text-white/70 text-[11px] mt-0.5">{cat.count}</p>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-7 h-7 rounded-full bg-[#C85A32] flex items-center justify-center shadow-md">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* HOW IT WORKS                                                 */}
      {/* ============================================================ */}
      <section className="bg-[#181615] text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D9A05B] mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Simple Booking Process</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Book Your Shoot in 3 Simple Steps
            </h2>
            <p className="text-sm text-white/60 mt-3 max-w-lg mx-auto leading-relaxed">
              No back-and-forth negotiations or surprise fees. Everything transparently organized.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            {HOW_IT_WORKS.map((step, idx) => (
              <div key={step.step} className="relative text-center group">
                {idx < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden sm:block absolute top-10 left-[60%] w-[80%] h-px border-t-2 border-dashed border-white/15" />
                )}
                <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/15 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#C85A32] transition-colors duration-300">
                  <step.icon className="w-8 h-8 text-[#D9A05B] group-hover:text-white transition-colors" />
                </div>
                <div className="text-[11px] font-bold text-[#D9A05B] tracking-widest mb-2">STEP {step.step}</div>
                <h3 className="font-serif text-xl font-bold text-white mb-2.5">{step.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TESTIMONIALS                                                 */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C85A32] mb-3">
            <Star className="w-3.5 h-3.5 fill-[#D9A05B] text-[#D9A05B]" />
            <span>Verified Reviews</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#181615]">
            Loved by Brands &amp; Couples Alike
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-7 border border-[#E7E1DA] shadow-sm hover:shadow-xl transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D9A05B] text-[#D9A05B]" />
                  ))}
                </div>
                <p className="text-sm text-[#57423b] italic leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3.5 mt-6 pt-5 border-t border-[#E7E1DA]">
                <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover" />
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#181615]">{t.name}</h4>
                  <p className="text-xs text-[#8a726a]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};
