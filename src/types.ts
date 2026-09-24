export type AspectRatioType = '4:5' | '3:2' | '1:1' | '16:9';

export interface PortfolioItem {
  id: string;
  title: string;
  clientOrSeries: string;
  category: string;
  imageUrl: string;
  aspectRatio: AspectRatioType;
  year: string;
  location: string;
  techSpecs: string;
  story?: string;
}

export type ExperienceLevel = 'all' | 'beginner' | 'professional' | 'master';

export interface Photographer {
  id: string;
  name: string;
  location: string;
  officeLocation?: string;
  officeAddress?: string;
  officeMapUrl?: string;
  avatar: string;
  heroImage: string;
  primaryCategory: string;
  specialties: string[];
  experienceLevel: 'beginner' | 'professional' | 'master';
  experienceYears: number;
  rating: number;
  reviewCount: number;
  dayRate: number;
  halfDayRate: number;
  availableNow: boolean;
  nextAvailableDate: string;
  clientRoster: string[];
  bio: string;
  awards: string[];
  equipment: string[];
  cameraFormat: string;
  baseCity: string;
  portfolio: PortfolioItem[];
  homeSliderPhotos?: string[];
  turnaroundDays: number;
  assistantIncluded: boolean;
  coverImage?: string;
  packageTitle?: string;
  advanceDeposit?: number | string;
  travelPolicy?: string;
}

export type ShootDurationType = 'half-day' | 'full-day' | 'two-day' | 'three-day';
export type UsageRightsTier = 'editorial' | 'commercial-standard' | 'commercial-global' | 'enterprise-buyout';

export interface BookingAddOn {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface BookingRequest {
  id: string;
  photographerId: string;
  photographerName: string;
  photographerAvatar: string;
  campaignTitle: string;
  clientBrand: string;
  artDirectorName: string;
  artDirectorEmail: string;
  shootDate: string;
  callTime: string;
  locationName: string;
  locationAddress: string;
  durationType: ShootDurationType;
  usageRights: UsageRightsTier;
  selectedAddOns: string[];
  dayRate: number;
  durationCost: number;
  usageCost: number;
  addOnsCost: number;
  productionFee: number;
  totalCost: number;
  status: 'confirmed' | 'pending' | 'in-production';
  createdAt: string;
  notes?: string;
  shotListOverview?: string;
  photoshootStyle?: string;
}
