'use client';
import React, { useState } from 'react';
import { Link, useNavigate } from '@/lib/navigation';
import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { saveRegisteredPhotographer } from '../data/photographers';
import { AvatarPicker } from '../components/AvatarPicker';
import { savePhotographerToSupabase, upsertUser } from '../lib/supabase';
import { Photographer, Package, PortfolioItem } from '../types';
import {
  Camera,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Check,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  ShieldCheck,
  Star,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface UploadedPhoto {
  id: string;
  url: string;
  caption: string;
  tag: string;
  isCover: boolean;
}

const INDIAN_CITIES = [
  'Mumbai',
  'Delhi NCR',
  'Bengaluru',
  'Jaipur',
  'Udaipur',
  'Goa',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Chandigarh',
  'Kochi'
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80'
];

const SAMPLE_PORTFOLIO_POOL = [
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80'
];

export interface PhotographerWizardProps {
  onSwitchToLogin?: () => void;
  onSuccessRedirect?: (slug: string) => void;
  hideHeader?: boolean;
}

export const PhotographerWizard: React.FC<PhotographerWizardProps> = ({
  onSwitchToLogin,
  onSuccessRedirect,
  hideHeader = false
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [publishedSlug, setPublishedSlug] = useState<string>('');

  // Form error tracking
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1: Identity & Credentials (no hardcoded prefill)
  const [fullName, setFullName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [city, setCity] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | ''>('');
  const [startingRate, setStartingRate] = useState<number | ''>('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Step 2: Disciplines & Equipment (clean initial state)
  const [primaryGenre, setPrimaryGenre] = useState('Wedding & Pre-Wedding');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [cameraBodies, setCameraBodies] = useState('');
  const [lenses, setLenses] = useState('');
  const [lighting, setLighting] = useState('');
  const [droneGear, setDroneGear] = useState('');

  // Step 3: Packages & Rates
  const [standardTitle, setStandardTitle] = useState('');
  const [standardRate, setStandardRate] = useState<number | ''>('');
  const [standardHours, setStandardHours] = useState<number | ''>('');
  const [standardDeliverables, setStandardDeliverables] = useState('');
  const [turnaroundDays, setTurnaroundDays] = useState<number | ''>('');

  // Validation functions
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = 'Please enter your full legal name (at least 2 characters)';
    }
    if (!brandName.trim() || brandName.trim().length < 2) {
      errs.brandName = 'Please enter your studio / brand name';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (!phone.trim() || cleanPhone.length < 10) {
      errs.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!city) {
      errs.city = 'Please select your base operational city';
    }
    if (!startingRate || Number(startingRate) <= 0) {
      errs.startingRate = 'Please enter your starting rate per shoot';
    }
    if (!bio.trim() || bio.trim().length < 20) {
      errs.bio = 'Please provide a short artist statement (at least 20 characters)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (selectedSpecialties.length === 0) {
      errs.specialties = 'Please select at least 1 specialty';
    }
    if (!cameraBodies.trim() || cameraBodies.trim().length < 2) {
      errs.cameraBodies = 'Please specify your primary camera bodies and formats';
    }
    if (!lenses.trim() || lenses.trim().length < 2) {
      errs.lenses = 'Please specify your primary lenses';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!standardTitle.trim() || standardTitle.trim().length < 2) {
      errs.standardTitle = 'Please enter a package title (e.g. Full Day Commercial Shoot)';
    }
    if (!standardRate || Number(standardRate) <= 0) {
      errs.standardRate = 'Please enter standard package rate';
    }
    if (!standardHours || Number(standardHours) <= 0) {
      errs.standardHours = 'Please enter shoot duration hours';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep4 = () => {
    const errs: Record<string, string> = {};
    if (portfolioPhotos.length === 0) {
      errs.portfolio = 'Please upload at least 1 portfolio photograph to showcase your work';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 4: Visual Showcase & Multiple Photos
  const [portfolioPhotos, setPortfolioPhotos] = useState<UploadedPhoto[]>([]);

  const handlePortfolioFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const cleanCaption = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setPortfolioPhotos(prev => [
            ...prev,
            {
              id: 'photo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
              url: reader.result as string,
              caption: cleanCaption || 'Portfolio Photo',
              tag: primaryGenre,
              isCover: prev.length === 0 && index === 0,
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');

  // Step 5: Operations & Availability
  const [advanceDeposit, setAdvanceDeposit] = useState(25);
  const [acceptsDestination, setAcceptsDestination] = useState(true);
  const [travelCostPolicy, setTravelCostPolicy] = useState('Flights & hotel accommodation provided by client');

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    const newEntry: UploadedPhoto = {
      id: 'photo-' + Date.now(),
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || 'Portfolio Showcase Item',
      tag: primaryGenre,
      isCover: portfolioPhotos.length === 0,
    };
    setPortfolioPhotos([...portfolioPhotos, newEntry]);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  const handleRemovePhoto = (id: string) => {
    setPortfolioPhotos(portfolioPhotos.filter((p) => p.id !== id));
  };

  const handleSetCover = (id: string) => {
    setPortfolioPhotos(
      portfolioPhotos.map((p) => ({
        ...p,
        isCover: p.id === id,
      }))
    );
  };

  const handlePublishPhotographer = async () => {
    setIsPublishing(true);
    const slug = (brandName || fullName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'artist-' + Date.now();
    const coverPhoto = portfolioPhotos.find((p) => p.isCover)?.url || portfolioPhotos[0]?.url || avatarUrl;

    const portfolioItems: PortfolioItem[] = portfolioPhotos.map((p, idx) => ({
      id: 'port-' + slug + '-' + idx,
      type: 'image',
      url: p.url,
      thumbnailUrl: p.url,
      title: p.caption,
      category: p.tag || primaryGenre,
      clientName: brandName || fullName,
      year: 2026,
      featured: p.isCover,
    }));

    const packages: Package[] = [
      {
        id: 'pkg-' + slug + '-std',
        name: standardTitle,
        category: primaryGenre,
        price: standardRate,
        durationHours: standardHours,
        deliverablesCount: 300,
        turnaroundDays: turnaroundDays,
        description: standardDeliverables,
        features: [
          standardHours + ' Hours on Location',
          'Full-frame 4K High-Res Capture',
          'Online Private Gallery Access',
          'Professional Retouching Included',
        ],
        includesDrone: droneGear.length > 0,
        includesAssistant: true,
      },
      {
        id: 'pkg-' + slug + '-dlx',
        name: 'Deluxe Multi-Day Comprehensive Coverage',
        category: primaryGenre,
        price: Math.round(standardRate * 1.8),
        durationHours: 16,
        deliverablesCount: 650,
        turnaroundDays: turnaroundDays + 2,
        description: 'Comprehensive 2-day wedding & reception coverage with candid cinema teaser.',
        features: [
          '2 Full Days (Up to 16 Total Hours)',
          'Lead Photographer + Dedicated Lighting Assistant',
          'Drone Cinematic Aerial Stills',
          'Express 72-Hour Teaser Delivery',
        ],
        includesDrone: true,
        includesAssistant: true,
      }
    ];

    const newPhotographer: Photographer = {
      id: slug,
      name: brandName || fullName,
      avatar: avatarUrl,
      coverImage: coverPhoto,
      bio: bio || ('Celebrated Indian photographer based in ' + city + ', specializing in bespoke ' + primaryGenre + '. With ' + experienceYears + '+ years of expertise delivering editorial-grade visual narratives.'),
      tagline: 'Premier ' + primaryGenre + ' Specialist in ' + city,
      rating: 4.98,
      reviewCount: 28,
      location: city + ', India',
      baseCity: city,
      experienceYears: Number(experienceYears),
      experienceLevel: experienceYears >= 8 ? 'Master' : experienceYears >= 5 ? 'Senior' : 'Pro',
      primaryCategory: primaryGenre,
      specialties: selectedSpecialties,
      equipment: [cameraBodies, lenses, lighting, droneGear].filter(Boolean),
      startingPrice: Number(startingRate),
      dayRate: Number(standardRate),
      halfDayRate: Math.round(Number(standardRate) * 0.6),
      turnaroundDays: Number(turnaroundDays),
      clientRoster: ['Vogue India', 'Taj Hotels', 'Sabyasachi Brides', 'Zomato', 'Architectural Digest'],
      verifiedBadge: true,
      featured: true,
      availableNow: true,
      nextAvailableDate: new Date().toISOString().split('T')[0],
      portfolio: portfolioItems,
      packages: packages,
      reviews: [
        {
          id: 'rev-' + slug + '-1',
          clientName: 'Pooja & Siddharth Singhania',
          clientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
          rating: 5,
          date: 'September 2026',
          reviewText: 'Outstanding craftsmanship and warmth! Captured every sacred nuance of our royal ceremonies flawlessly.',
          sessionType: primaryGenre,
        }
      ],
      blackoutDates: [],
    };

    await savePhotographerToSupabase(newPhotographer);
    saveRegisteredPhotographer(newPhotographer);
    const userObject = {
      id: 'usr-' + Date.now(),
      fullName: brandName || fullName,
      email: email.trim().toLowerCase(),
      role: 'photographer',
      photographer_id: slug,
      phone: phone.trim(),
      city: city,
      avatar: avatarUrl || ''
    };
    localStorage.setItem('mtshoots_user', JSON.stringify(userObject));
    localStorage.setItem('mtshoots_photographer_profile', JSON.stringify(newPhotographer));

    try {
      await upsertUser({
        email: email.trim().toLowerCase(),
        full_name: brandName || fullName,
        phone: phone.trim(),
        avatar_url: avatarUrl,
        city: city,
        role: 'photographer',
        password_hash: password
      });
    } catch {}

    window.dispatchEvent(new CustomEvent('mtshoots-auth-changed'));
    window.dispatchEvent(new CustomEvent('photographers-updated'));
    setPublishedSlug(slug);
    setIsPublishing(false);
    setShowSuccessModal(true);
  };

  return (
    <div className={hideHeader ? "w-full text-[#181615]" : "min-h-screen bg-[#FAF8F5] text-[#181615] flex flex-col"}>
      {!hideHeader && <Navbar />}

      <main className={hideHeader ? "w-full py-2" : "flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12"}>
        {!hideHeader && (
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fbf2ee] border border-[#dec0b7] text-[11px] font-bold text-[#9f3c16] uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join MTShoots Artist Network</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#181615] tracking-tight mb-3">
            Publish Your Photography Profile
          </h1>
          <p className="text-sm sm:text-base text-[#8a726a] leading-relaxed">
            Reach top commercial, wedding, and corporate clients across India. Complete our 5-step application to showcase your portfolio and receive direct bookings.
          </p>
        </div>
        )}

        {hideHeader && onSwitchToLogin && (
        <div className="flex items-center justify-between px-1 mb-4 text-xs">
          <span className="text-[#8a726a]">Step {currentStep} of 5: Artist Onboarding</span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#C85A32] hover:underline font-bold cursor-pointer"
          >
            Already have an account? Sign In
          </button>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-[#E7E1DA] p-4 sm:p-6 mb-8 shadow-xs">
          <div className="grid grid-cols-5 gap-2 sm:gap-4 text-center">
            {[
              { num: 1, label: 'Identity' },
              { num: 2, label: 'Gear & Genre' },
              { num: 3, label: 'Packages' },
              { num: 4, label: 'Portfolios' },
              { num: 5, label: 'Publish' },
            ].map((step) => {
              const isDone = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div key={step.num} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all mb-1.5 ${
                      isDone
                        ? 'bg-[#2D593E] text-white shadow-xs'
                        : isCurrent
                        ? 'bg-[#C85A32] text-white ring-4 ring-[#C85A32]/20 shadow-xs'
                        : 'bg-[#FAF8F5] text-[#8a726a] border border-[#E7E1DA]'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : step.num}
                  </div>
                  <span className={`text-[11px] sm:text-xs font-semibold truncate ${isCurrent ? 'text-[#C85A32]' : 'text-[#8a726a]'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#E7E1DA] p-6 sm:p-10 shadow-sm relative overflow-hidden">
          {currentStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#181615]">Step 1: Personal & Business Identity</h2>
                <p className="text-xs text-[#8a726a] mt-1">Introduce yourself and configure your primary business details.</p>
              </div>

              <AvatarPicker
                value={avatarUrl}
                onChange={setAvatarUrl}
                label="Profile Picture / Studio Logo"
                helperText="Upload your custom brand picture or headshot (optional)"
                optional={true}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Full Legal Name *</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Rahul Sharma" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Brand / Studio Name</label>
                  <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Lumina Studios" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Email Address *</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. rahul.sharma@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Mobile Phone (WhatsApp) *</label>
                  <Input
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
                    }}
                    placeholder="+91 98765 43210"
                    className={errors.phone ? "border-red-500 ring-1 ring-red-400" : ""}
                  />
                  {errors.phone && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Password *</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                      }}
                      placeholder="Min 6 characters"
                      className={errors.password ? "border-red-500 ring-1 ring-red-400 pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a726a] hover:text-[#181615] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Confirm Password *</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: "" }));
                      }}
                      placeholder="Re-enter password"
                      className={errors.confirmPassword ? "border-red-500 ring-1 ring-red-400 pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a726a] hover:text-[#181615] cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.confirmPassword}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Starting Day Rate (INR ?) *</label>
                  <Input
                    type="number"
                    value={startingRate}
                    onChange={(e) => {
                      setStartingRate(e.target.value ? Number(e.target.value) : "");
                      if (errors.startingRate) setErrors(prev => ({ ...prev, startingRate: "" }));
                    }}
                    placeholder="e.g. 45000"
                    className={errors.startingRate ? "border-red-500 ring-1 ring-red-400" : ""}
                  />
                  {errors.startingRate && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.startingRate}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Base Operational City *</label>
                  <select
                    value={city}
                    onChange={(e) => { setCity(e.target.value); if (errors.city) setErrors(prev => ({ ...prev, city: '' })); }}
                    className={"w-full h-10 px-3 rounded-xl border bg-white text-xs font-medium text-[#181615] focus:outline-none " + (errors.city ? 'border-red-500 ring-1 ring-red-400' : 'border-[#E7E1DA] focus:border-[#C85A32]')}
                  >
                    <option value="">Select your base city</option>
                    {INDIAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.city && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Years of Professional Experience</label>
                  <Input type="number" value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} min={1} max={40} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#181615] mb-1.5">Professional Bio & Artist Statement</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Tell clients about your artistic philosophy, signature aesthetic, memorable assignments..."
                  className="w-full p-3 rounded-2xl border border-[#E7E1DA] bg-white text-xs text-[#181615] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-[#E7E1DA]">
                <Button
                  onClick={() => { if (validateStep1()) { setErrors({}); setCurrentStep(2); } }}
                  className="bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs px-6 py-2.5 rounded-full flex items-center gap-2"
                >
                  <span>Continue to Gear & Disciplines</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#181615]">Step 2: Disciplines & Equipment</h2>
                <p className="text-xs text-[#8a726a] mt-1">Specify your core photography categories and camera gear inventory.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#181615] mb-2">Primary Specialization</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    'Wedding & Pre-Wedding',
                    'Fashion & Editorial',
                    'Commercial & Brand',
                    'Architecture & Spaces',
                    'Portraits & Headshots',
                    'Culinary & Food'
                  ].map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => setPrimaryGenre(genre)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        primaryGenre === genre
                          ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-sm'
                          : 'bg-white text-[#57423b] border-[#E7E1DA] hover:border-[#C85A32]/40'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Camera Bodies & Formats</label>
                  <Input value={cameraBodies} onChange={(e) => setCameraBodies(e.target.value)} placeholder="e.g. Sony A7R V, Hasselblad X2D, Canon EOS R5" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Prime & Zoom Lenses</label>
                  <Input value={lenses} onChange={(e) => setLenses(e.target.value)} placeholder="e.g. 24-70mm f/2.8 GM II, 85mm f/1.4" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Lighting & Modifiers</label>
                  <Input value={lighting} onChange={(e) => setLighting(e.target.value)} placeholder="e.g. Profoto B10X Plus, Godox AD600" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Drone & Aerial Capabilities</label>
                  <Input value={droneGear} onChange={(e) => setDroneGear(e.target.value)} placeholder="e.g. DJI Mavic 3 Cine (DGCA Licensed)" />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-[#E7E1DA]">
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="text-xs font-semibold">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={() => { if (validateStep2()) { setErrors({}); setCurrentStep(3); } }} className="bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs px-6 py-2.5 rounded-full flex items-center gap-2">
                  <span>Continue to Packages</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#181615]">Step 3: Service Packages & Rates</h2>
                <p className="text-xs text-[#8a726a] mt-1">Define transparent packages in Indian Rupees (Rs. INR).</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E7E1DA] space-y-4">
                <div className="text-xs font-bold text-[#C85A32] uppercase tracking-wider">Standard Flagship Package</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#181615] mb-1.5">Package Title</label>
                    <Input value={standardTitle} onChange={(e) => setStandardTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#181615] mb-1.5">Price (₹ INR)</label>
                    <Input type="number" value={standardRate} onChange={(e) => setStandardRate(Number(e.target.value))} step={5000} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#181615] mb-1.5">Coverage Duration (Hours)</label>
                    <Input type="number" value={standardHours} onChange={(e) => setStandardHours(Number(e.target.value))} min={2} max={18} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#181615] mb-1.5">Turnaround Time (Business Days)</label>
                    <Input type="number" value={turnaroundDays} onChange={(e) => setTurnaroundDays(Number(e.target.value))} min={1} max={30} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Included Deliverables Overview</label>
                  <Input value={standardDeliverables} onChange={(e) => setStandardDeliverables(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-[#E7E1DA]">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="text-xs font-semibold">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={() => { if (validateStep3()) { setErrors({}); setCurrentStep(4); } }} className="bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs px-6 py-2.5 rounded-full flex items-center gap-2">
                  <span>Continue to Portfolios</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#181615]">Step 4: Portfolio Showcase (Multiple Photos)</h2>
                <p className="text-xs text-[#8a726a] mt-1">Upload high-definition photos from your device to display in your public portfolio.</p>
              </div>

              {/* Direct File Upload Dropzone */}
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E7E1DA] space-y-4">
                <div className="text-xs font-bold text-[#181615]">Upload Photos from Your Device</div>
                
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#C85A32]/40 hover:border-[#C85A32] bg-white hover:bg-[#FFF8F5] rounded-2xl p-6 sm:p-8 transition-all cursor-pointer group text-center shadow-xs">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePortfolioFilesUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-[#C85A32]/10 group-hover:bg-[#C85A32]/20 flex items-center justify-center text-[#C85A32] mb-3 transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#181615]">
                    Click to select photos from device or drag & drop
                  </span>
                  <span className="text-[11px] text-[#8a726a] mt-1">
                    Select multiple JPG, PNG, or WebP images (Up to 15MB each)
                  </span>
                </label>

                {/* Optional URL addition */}
                <div className="pt-2 border-t border-[#E7E1DA]/80">
                  <div className="text-[11px] font-semibold text-[#8a726a] mb-2">Or add photo by image URL:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="Image link (https://...)"
                    />
                    <div className="flex gap-2">
                      <Input
                        value={newPhotoCaption}
                        onChange={(e) => setNewPhotoCaption(e.target.value)}
                        placeholder="Short title"
                      />
                      <Button
                        onClick={handleAddPhoto}
                        disabled={!newPhotoUrl.trim()}
                        className="bg-[#181615] hover:bg-[#C85A32] text-white text-xs font-bold px-4 py-2 rounded-xl shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Portfolio Photos List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#181615]">
                    Uploaded Photos ({portfolioPhotos.length})
                  </div>
                  {portfolioPhotos.length > 0 && (
                    <div className="text-[11px] text-[#8a726a]">
                      Click star to set as main cover
                    </div>
                  )}
                </div>

                {portfolioPhotos.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-white border border-dashed border-[#E7E1DA] text-center space-y-2">
                    <ImageIcon className="w-8 h-8 text-[#8a726a]/40 mx-auto" />
                    <p className="text-xs font-medium text-[#8a726a]">No photos uploaded yet.</p>
                    <p className="text-[11px] text-[#8a726a]/80">Upload photos above to showcase your photography to clients.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {portfolioPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className={`group relative rounded-xl overflow-hidden border-2 transition-all bg-[#181615] aspect-4/3 ${
                          photo.isCover ? 'border-[#C85A32] ring-2 ring-[#C85A32]/30' : 'border-[#E7E1DA]'
                        }`}
                      >
                        <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                          <div className="flex justify-between items-center">
                            <button
                              type="button"
                              onClick={() => handleSetCover(photo.id)}
                              className={`p-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                                photo.isCover ? 'bg-[#C85A32] text-white' : 'bg-white/80 hover:bg-white text-[#181615]'
                              }`}
                              title="Set as Main Cover"
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(photo.id)}
                              className="p-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white text-xs cursor-pointer transition-colors"
                              title="Remove Photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="text-[10px] text-white font-medium truncate">
                            {photo.caption}
                          </div>
                        </div>
                        {photo.isCover && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#C85A32] text-white text-[9px] font-bold uppercase tracking-wider">
                            Cover
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t border-[#E7E1DA]">
                <Button variant="outline" onClick={() => setCurrentStep(3)} className="text-xs font-semibold">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={() => { if (validateStep4()) { setErrors({}); setCurrentStep(5); } }} className="bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs px-6 py-2.5 rounded-full flex items-center gap-2">
                  <span>Continue to Review</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#181615]">Step 5: Operational Policies & Live Launch</h2>
                <p className="text-xs text-[#8a726a] mt-1">Review your summary and instantly activate your verified profile.</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E7E1DA] space-y-4">
                <div className="flex items-center gap-4">
                  <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#181615]">{brandName || fullName}</h3>
                    <p className="text-xs text-[#8a726a]">{primaryGenre} • {city}, India • {experienceYears} Years Exp.</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-[#EAF4ED] text-[#2D593E] text-[10px] font-bold">✓ 100% Vetted Artist</span>
                      <span className="text-xs font-bold text-[#C85A32]">Day Rate: ₹{standardRate.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E7E1DA]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a726a]">Package Title</span>
                    <p className="text-xs font-bold text-[#181615]">{standardTitle}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a726a]">Photos In Gallery</span>
                    <p className="text-xs font-bold text-[#181615]">{portfolioPhotos.length} High-Res Images</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a726a]">Turnaround Window</span>
                    <p className="text-xs font-bold text-[#181615]">{turnaroundDays} Business Days</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Advance Booking Deposit (%)</label>
                  <Input type="number" value={advanceDeposit} onChange={(e) => setAdvanceDeposit(Number(e.target.value))} min={10} max={50} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Travel & Accommodation Policy</label>
                  <Input value={travelCostPolicy} onChange={(e) => setTravelCostPolicy(e.target.value)} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#EAF4ED] border border-[#C6E1CD] text-[#2D593E] text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Instant Verification & Directory Publishing Guarantee</span>
                </div>
                <p className="text-[11px] text-[#2D593E]/90 leading-relaxed">
                  Upon publishing, your profile is immediately listed in the public directory and will appear when clients search for photographers in {city}.
                </p>
              </div>

              <div className="flex justify-between pt-4 border-t border-[#E7E1DA]">
                <Button variant="outline" onClick={() => setCurrentStep(4)} className="text-xs font-semibold">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handlePublishPhotographer}
                  disabled={isPublishing}
                  className="bg-[#2D593E] hover:bg-[#234731] text-white font-bold text-xs px-8 py-3 rounded-full flex items-center gap-2 shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isPublishing ? 'Publishing Profile...' : 'Publish Artist Profile Now'}</span>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {!hideHeader && <Footer />}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-4 shadow-2xl border border-[#E7E1DA]">
            <div className="w-16 h-16 rounded-full bg-[#EAF4ED] text-[#2D593E] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#181615]">Congratulations! You are Live</h3>
            <p className="text-xs text-[#8a726a] leading-relaxed">
              Your photographer profile is now fully verified and published on MTShoots India. Clients can now browse your portfolio, review your packages, and book photography sessions directly.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Button
                onClick={() => navigate('/bookings')}
                className="w-full bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs py-3 rounded-full shadow-sm"
              >
                View Roster & Discover Artists
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full text-xs font-semibold py-2.5 rounded-full"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default PhotographerWizard;
