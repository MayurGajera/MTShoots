import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { saveRegisteredPhotographer } from '../data/photographers';
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

export const PhotographerApplyPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [publishedSlug, setPublishedSlug] = useState<string>('');

  // Step 1: Identity & Credentials
  const [fullName, setFullName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [experienceYears, setExperienceYears] = useState(5);
  const [startingRate, setStartingRate] = useState(45000);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);

  // Step 2: Disciplines & Equipment
  const [primaryGenre, setPrimaryGenre] = useState('Wedding & Pre-Wedding');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([
    'Destination Weddings',
    'Bridal Portraits',
    'Candid Moments'
  ]);
  const [cameraBodies, setCameraBodies] = useState('Sony A7 IV, Sony A7R V');
  const [lenses, setLenses] = useState('24-70mm f/2.8 GM II, 85mm f/1.4 GM, 35mm f/1.4 GM');
  const [lighting, setLighting] = useState('Godox AD400 Pro, Godox V1 Speedlights with softboxes');
  const [droneGear, setDroneGear] = useState('DJI Mavic 3 Pro (DGCA Certified Pilot)');

  // Step 3: Packages & Rates
  const [standardTitle, setStandardTitle] = useState('Full-Day Wedding & Reception');
  const [standardRate, setStandardRate] = useState(65000);
  const [standardHours, setStandardHours] = useState(8);
  const [standardDeliverables, setStandardDeliverables] = useState('350+ edited photos, 1 teaser video, online gallery');
  const [turnaroundDays, setTurnaroundDays] = useState(4);

  // Step 4: Visual Showcase & Multiple Photos
  const [portfolioPhotos, setPortfolioPhotos] = useState<UploadedPhoto[]>([
    {
      id: 'photo-1',
      url: SAMPLE_PORTFOLIO_POOL[0],
      caption: 'Heritage Palaces & Royal Bridal Entry',
      tag: 'Wedding',
      isCover: true,
    },
    {
      id: 'photo-2',
      url: SAMPLE_PORTFOLIO_POOL[1],
      caption: 'Golden Hour Sunset Couple Portraits in Goa',
      tag: 'Pre-Wedding',
      isCover: false,
    },
    {
      id: 'photo-3',
      url: SAMPLE_PORTFOLIO_POOL[2],
      caption: 'Regal Varmala Exchange under Floral Chhatri',
      tag: 'Ceremony',
      isCover: false,
    },
    {
      id: 'photo-4',
      url: SAMPLE_PORTFOLIO_POOL[3],
      caption: 'Editorial Bridal Jewellery & Lehanga Details',
      tag: 'Details',
      isCover: false,
    }
  ]);
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

  const handlePublishPhotographer = () => {
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

    saveRegisteredPhotographer(newPhotographer);
    setPublishedSlug(slug);
    setIsPublishing(false);
    setShowSuccessModal(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181615] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
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

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E1DA] flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group shrink-0">
                  <img
                    src={avatarUrl}
                    alt="Profile Avatar"
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md"
                  />
                  <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#C85A32] text-white cursor-pointer hover:bg-[#b04a25] transition-all shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                  </label>
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <div className="text-xs font-bold text-[#181615]">Profile Picture / Studio Logo</div>
                  <p className="text-[11px] text-[#8a726a]">Upload your photo or choose from recommended presets:</p>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    {PRESET_AVATARS.map((pUrl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAvatarUrl(pUrl)}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          avatarUrl === pUrl ? 'border-[#C85A32] scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={pUrl} alt={'Preset ' + i} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Full Legal Name *</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Mayur Gajera" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Brand / Studio Name</label>
                  <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Mayur Gajera Visuals" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Email Address *</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="artist@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Mobile Phone (WhatsApp) *</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181615] mb-1.5">Base Operational City *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E7E1DA] bg-white text-xs font-medium text-[#181615] focus:outline-none focus:border-[#C85A32]"
                  >
                    {INDIAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
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
                  onClick={() => setCurrentStep(2)}
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
                <Button onClick={() => setCurrentStep(3)} className="bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs px-6 py-2.5 rounded-full flex items-center gap-2">
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
                <p className="text-xs text-[#8a726a] mt-1">Define transparent packages in Indian Rupees (₹ INR).</p>
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
                <Button onClick={() => setCurrentStep(4)} className="bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs px-6 py-2.5 rounded-full flex items-center gap-2">
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
                <p className="text-xs text-[#8a726a] mt-1">Upload high-definition photos that will be displayed in your public portfolio gallery.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E1DA] space-y-3">
                <div className="text-xs font-bold text-[#181615]">Add New Portfolio Photo</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                  />
                  <Input
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    placeholder="Short description / title"
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="text-[11px] text-[#8a726a]">
                    Or quick add sample:
                    <button
                      type="button"
                      onClick={() => setNewPhotoUrl(SAMPLE_PORTFOLIO_POOL[Math.floor(Math.random() * SAMPLE_PORTFOLIO_POOL.length)])}
                      className="ml-2 text-[#C85A32] font-semibold underline cursor-pointer"
                    >
                      Fill Sample Image
                    </button>
                  </div>
                  <Button
                    onClick={handleAddPhoto}
                    disabled={!newPhotoUrl.trim()}
                    className="bg-[#181615] hover:bg-[#C85A32] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Gallery</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#181615]">
                    Current Portfolio Photos ({portfolioPhotos.length})
                  </div>
                  <div className="text-[11px] text-[#8a726a]">
                    Click star to mark as Main Cover Photo
                  </div>
                </div>

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
                            className="p-1 rounded-full bg-red-600/90 hover:bg-red-600 text-white cursor-pointer"
                            title="Delete Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[10px] text-white font-medium truncate">{photo.caption}</div>
                      </div>
                      {photo.isCover && (
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#C85A32] text-white text-[9px] font-bold uppercase tracking-wider shadow-xs">
                          Cover
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-[#E7E1DA]">
                <Button variant="outline" onClick={() => setCurrentStep(3)} className="text-xs font-semibold">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={() => setCurrentStep(5)} className="bg-[#C85A32] hover:bg-[#b04a25] text-white font-bold text-xs px-6 py-2.5 rounded-full flex items-center gap-2">
                  <span>Review & Publish</span>
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

      <Footer />

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
                onClick={() => navigate('/photographers')}
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
