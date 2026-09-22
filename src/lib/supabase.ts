import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Photographer, BookingRequest } from '../types';
import { INITIAL_PHOTOGRAPHERS, INITIAL_BOOKINGS } from '../data/photographers';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.trim().length > 0 &&
    supabaseAnonKey &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseUrl.includes('placeholder')
  );
};

// Lazy client instantiation to avoid runtime crashes if keys are empty
let _supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!_supabaseClient) {
    try {
      _supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return _supabaseClient;
};

// Ready-to-execute PostgreSQL Schema for Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- PROVENANCE x SUPABASE POSTGRESQL SCHEMA (Deploy on Supabase & Vercel)
-- ==============================================================================

-- 1. Photographers Table
CREATE TABLE IF NOT EXISTS public.photographers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    base_city TEXT NOT NULL,
    avatar TEXT NOT NULL,
    hero_image TEXT NOT NULL,
    specialties TEXT[] NOT NULL DEFAULT '{}',
    rating NUMERIC(3,2) DEFAULT 4.95,
    review_count INTEGER DEFAULT 0,
    day_rate INTEGER NOT NULL,
    half_day_rate INTEGER NOT NULL,
    available_now BOOLEAN DEFAULT true,
    next_available_date DATE,
    client_roster TEXT[] NOT NULL DEFAULT '{}',
    bio TEXT NOT NULL,
    awards TEXT[] DEFAULT '{}',
    equipment TEXT[] DEFAULT '{}',
    camera_format TEXT,
    turnaround_days INTEGER DEFAULT 3,
    assistant_included BOOLEAN DEFAULT true,
    portfolio JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bookings & Call Sheets Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    photographer_id TEXT REFERENCES public.photographers(id) ON DELETE SET NULL,
    photographer_name TEXT NOT NULL,
    photographer_avatar TEXT,
    campaign_title TEXT NOT NULL,
    client_brand TEXT NOT NULL,
    art_director_name TEXT NOT NULL,
    art_director_email TEXT NOT NULL,
    shoot_date DATE NOT NULL,
    call_time TEXT NOT NULL,
    location_name TEXT NOT NULL,
    location_address TEXT NOT NULL,
    duration_type TEXT NOT NULL,
    usage_rights TEXT NOT NULL,
    selected_add_ons TEXT[] DEFAULT '{}',
    day_rate INTEGER NOT NULL,
    duration_cost INTEGER NOT NULL,
    usage_cost INTEGER NOT NULL,
    add_ons_cost INTEGER NOT NULL,
    production_fee INTEGER NOT NULL,
    total_cost INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed',
    notes TEXT,
    shot_list_overview TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Shortlist Table
CREATE TABLE IF NOT EXISTS public.shortlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id TEXT NOT NULL,
    session_id TEXT NOT NULL DEFAULT 'default_session',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(photographer_id, session_id)
);

-- Enable Row Level Security (RLS) for public demo reading and writing
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on photographers" 
ON public.photographers FOR SELECT USING (true);

CREATE POLICY "Allow public read/insert on bookings" 
ON public.bookings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access on shortlists" 
ON public.shortlists FOR ALL USING (true) WITH CHECK (true);
`;

/**
 * Test connectivity with Supabase
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  url?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      message: 'Supabase credentials are not yet configured in environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY). Running in local client mode.'
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      message: 'Supabase client could not be initialized with the provided credentials.'
    };
  }

  try {
    const { data, error } = await client.from('photographers').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        // Relation does not exist - connected to project, but table needs to be created
        return {
          connected: true,
          message: 'Connected to Supabase project! Note: Tables are not yet created. Run the provided SQL Schema in your Supabase SQL Editor.',
          url: supabaseUrl
        };
      }
      return {
        connected: false,
        message: `Supabase returned error: ${error.message} (Code: ${error.code})`,
        url: supabaseUrl
      };
    }
    return {
      connected: true,
      message: 'Successfully connected to live Supabase PostgreSQL database!',
      url: supabaseUrl
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Failed to connect: ${err.message || String(err)}`,
      url: supabaseUrl
    };
  }
}

/**
 * Load Photographers from Supabase with graceful fallback
 */
export async function loadPhotographers(): Promise<Photographer[]> {
  const client = getSupabaseClient();
  if (!client) {
    return INITIAL_PHOTOGRAPHERS;
  }

  try {
    const { data, error } = await client.from('photographers').select('*');
    if (error || !data || data.length === 0) {
      return INITIAL_PHOTOGRAPHERS;
    }

    // Map database snake_case columns to TypeScript camelCase if needed
    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      baseCity: row.base_city || row.baseCity || row.location,
      avatar: row.avatar,
      heroImage: row.hero_image || row.heroImage,
      primaryCategory: row.primary_category || row.primaryCategory || (row.specialties?.[0] || 'Commercial & Advertising'),
      specialties: row.specialties || [],
      experienceLevel: (row.experience_level || row.experienceLevel || 'professional') as 'beginner' | 'professional' | 'master',
      experienceYears: Number(row.experience_years || row.experienceYears) || 6,
      rating: Number(row.rating) || 4.95,
      reviewCount: Number(row.review_count) || 0,
      dayRate: Number(row.day_rate) || 85000,
      halfDayRate: Number(row.half_day_rate) || 50000,
      availableNow: row.available_now ?? true,
      nextAvailableDate: row.next_available_date || '2026-09-24',
      clientRoster: row.client_roster || [],
      bio: row.bio || '',
      awards: row.awards || [],
      equipment: row.equipment || [],
      cameraFormat: row.camera_format || row.cameraFormat || '',
      turnaroundDays: row.turnaround_days || 3,
      assistantIncluded: row.assistant_included ?? true,
      portfolio: row.portfolio || []
    }));
  } catch (err) {
    console.warn('Failed to fetch photographers from Supabase, falling back to initial data:', err);
    return INITIAL_PHOTOGRAPHERS;
  }
}

/**
 * Save booking to Supabase with local fallback
 */
export async function saveBookingToSupabase(booking: BookingRequest): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) {
    return false;
  }

  try {
    const { error } = await client.from('bookings').insert({
      id: booking.id,
      photographer_id: booking.photographerId,
      photographer_name: booking.photographerName,
      photographer_avatar: booking.photographerAvatar,
      campaign_title: booking.campaignTitle,
      client_brand: booking.clientBrand,
      art_director_name: booking.artDirectorName,
      art_director_email: booking.artDirectorEmail,
      shoot_date: booking.shootDate,
      call_time: booking.callTime,
      location_name: booking.locationName,
      location_address: booking.locationAddress,
      duration_type: booking.durationType,
      usage_rights: booking.usageRights,
      selected_add_ons: booking.selectedAddOns,
      day_rate: booking.dayRate,
      duration_cost: booking.durationCost,
      usage_cost: booking.usageCost,
      add_ons_cost: booking.addOnsCost,
      production_fee: booking.productionFee,
      total_cost: booking.totalCost,
      status: booking.status,
      notes: booking.notes,
      shot_list_overview: booking.shotListOverview,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.warn('Supabase booking save error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase booking save exception:', err);
    return false;
  }
}
