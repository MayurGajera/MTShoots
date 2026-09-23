import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Photographer, BookingRequest } from '../types';
import { INITIAL_PHOTOGRAPHERS, INITIAL_BOOKINGS, getAllPhotographers, getStoredRegisteredPhotographers } from '../data/photographers';

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
    return getAllPhotographers();
  }

  try {
    const { data, error } = await client.from('photographers').select('*');
    if (error || !data || data.length === 0) {
      return getAllPhotographers();
    }

    // Map database snake_case columns to TypeScript camelCase
    const remoteList: Photographer[] = data.map((row: any) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      baseCity: row.base_city || row.baseCity || row.location,
      officeLocation: row.office_location || undefined,
      officeAddress: row.office_address || undefined,
      officeMapUrl: row.office_map_url || undefined,
      avatar: row.avatar,
      heroImage: row.hero_image || row.heroImage,
      coverImage: row.hero_image || row.heroImage,
      primaryCategory: row.primary_category || row.primaryCategory || (row.specialties?.[0] || 'Commercial & Advertising'),
      specialties: row.specialties || [],
      experienceLevel: (row.experience_level || row.experienceLevel || 'professional') as any,
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
      homeSliderPhotos: row.home_slider_photos || [],
      turnaroundDays: Number(row.turnaround_days) || 3,
      assistantIncluded: row.assistant_included ?? true,
      portfolio: row.portfolio || []
    }));

    // Merge with any locally stored registered photographers so new profiles always appear
    const localRegistered = getStoredRegisteredPhotographers();
    const combined = [...remoteList];
    for (const local of localRegistered) {
      if (!combined.some(c => c.id === local.id)) {
        combined.unshift(local);
      }
    }
    return combined.length > 0 ? combined : getAllPhotographers();
  } catch (err) {
    console.warn('Failed to fetch photographers from Supabase, falling back to all local:', err);
    return getAllPhotographers();
  }
}

/**
 * Save / Upsert Photographer to Supabase database
 */
export async function savePhotographerToSupabase(photographer: Photographer): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const record = {
      id: photographer.id,
      name: photographer.name,
      location: photographer.location || (photographer.baseCity ? (photographer.baseCity + ', India') : 'Mumbai, India'),
      base_city: photographer.baseCity || photographer.location?.split(',')[0]?.trim() || 'Mumbai',
      office_location: photographer.officeLocation || null,
      office_address: photographer.officeAddress || null,
      office_map_url: photographer.officeMapUrl || null,
      avatar: photographer.avatar,
      hero_image: photographer.heroImage || photographer.coverImage || photographer.portfolio?.[0]?.imageUrl || photographer.avatar,
      primary_category: photographer.primaryCategory || photographer.specialties?.[0] || 'Commercial & Advertising',
      specialties: photographer.specialties || [photographer.primaryCategory].filter(Boolean),
      experience_level: photographer.experienceLevel || 'professional',
      experience_years: Number(photographer.experienceYears) || 5,
      rating: Number(photographer.rating) || 4.95,
      review_count: Number(photographer.reviewCount) || 1,
      day_rate: Number(photographer.dayRate) || 85000,
      half_day_rate: Number(photographer.halfDayRate) || Math.round((Number(photographer.dayRate) || 85000) * 0.6),
      available_now: photographer.availableNow ?? true,
      next_available_date: photographer.nextAvailableDate || new Date().toISOString().split('T')[0],
      client_roster: photographer.clientRoster || [],
      bio: photographer.bio || '',
      awards: photographer.awards || [],
      equipment: photographer.equipment || [],
      camera_format: photographer.cameraFormat || '',
      home_slider_photos: photographer.homeSliderPhotos || [],
      turnaround_days: Number(photographer.turnaroundDays) || 3,
      assistant_included: photographer.assistantIncluded ?? true,
      portfolio: photographer.portfolio || [],
      updated_at: new Date().toISOString()
    };

    const { error } = await client
      .from('photographers')
      .upsert(record, { onConflict: 'id' });

    if (error) {
      console.warn('savePhotographerToSupabase error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('savePhotographerToSupabase exception:', err);
    return false;
  }
}

/**
 * Fetch a single Photographer by ID or Slug with fallback
 */
export async function getPhotographerById(id: string): Promise<Photographer | null> {
  // 1. Check local memory and registered profiles first for instant render
  const localList = getAllPhotographers();
  const localMatch = localList.find(p => p.id === id || p.id === decodeURIComponent(id));
  if (localMatch) return localMatch;

  // 2. Query Supabase database
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('photographers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      location: data.location,
      baseCity: data.base_city || data.baseCity || data.location,
      officeLocation: data.office_location,
      officeAddress: data.office_address,
      officeMapUrl: data.office_map_url,
      avatar: data.avatar,
      heroImage: data.hero_image,
      coverImage: data.hero_image,
      primaryCategory: data.primary_category || data.specialties?.[0] || 'Commercial & Advertising',
      specialties: data.specialties || [],
      experienceLevel: (data.experience_level || 'professional') as any,
      experienceYears: Number(data.experience_years) || 5,
      rating: Number(data.rating) || 4.95,
      reviewCount: Number(data.review_count) || 0,
      dayRate: Number(data.day_rate) || 85000,
      halfDayRate: Number(data.half_day_rate) || 50000,
      availableNow: data.available_now ?? true,
      nextAvailableDate: data.next_available_date || new Date().toISOString().split('T')[0],
      clientRoster: data.client_roster || [],
      bio: data.bio || '',
      awards: data.awards || [],
      equipment: data.equipment || [],
      cameraFormat: data.camera_format || '',
      homeSliderPhotos: data.home_slider_photos || [],
      turnaroundDays: Number(data.turnaround_days) || 3,
      assistantIncluded: data.assistant_included ?? true,
      portfolio: data.portfolio || []
    };
  } catch {
    return null;
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

// ─── Types for new tables ─────────────────────────────────────────────────────

export interface DbCategory {
  id: string;
  name: string;
  short_name: string;
  description: string;
  image_url: string;
  popular_count: string;
  sort_order: number;
  is_active: boolean;
}

export interface DbCity {
  id: string;
  name: string;
  state: string;
  is_active: boolean;
  sort_order: number;
  photographer_count: number;
}

export interface DbAddOn {
  id: string;
  name: string;
  price: number;
  description: string;
  is_active: boolean;
  sort_order: number;
}

export interface DbTestimonial {
  id: string;
  quote: string;
  author_name: string;
  author_role: string;
  author_avatar: string;
  rating: number;
  is_featured: boolean;
  sort_order: number;
}

export interface DbUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  role: 'customer' | 'photographer' | 'admin';
  is_verified: boolean;
  photographer_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DbUserAddress {
  id: string;
  user_id: string;
  label: string;
  street: string | null;
  city: string;
  state: string | null;
  pincode: string | null;
  landmark: string | null;
  is_default: boolean;
  created_at: string;
}

export interface DbUserDevice {
  id: string;
  user_id: string;
  device_name: string;
  device_type: 'web' | 'ios' | 'android' | 'desktop';
  device_fingerprint: string | null;
  user_agent: string | null;
  last_seen_at: string;
  is_active: boolean;
  created_at: string;
}

// ─── Static fallback data ─────────────────────────────────────────────────────
import { PHOTOGRAPHY_CATEGORIES } from '../data/categories';
import { AVAILABLE_ADDONS } from '../data/photographers';

const FALLBACK_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Nagpur',
  'Indore', 'Bhopal', 'Vadodara', 'Goa', 'Kochi', 'Chandigarh',
  'Jodhpur', 'Udaipur', 'Mysuru', 'Coimbatore', 'Amritsar', 'Guwahati',
];

// ─── Categories ───────────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<DbCategory[]> {
  const client = getSupabaseClient();
  if (!client) return PHOTOGRAPHY_CATEGORIES.map((c, i) => ({
    id: c.id, name: c.name, short_name: c.shortName,
    description: c.description || '', image_url: c.image || '',
    popular_count: c.popularCount || '0+ Shoots',
    sort_order: i, is_active: true,
  }));

  try {
    const { data, error } = await client
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error || !data?.length) throw error || new Error('empty');
    return data;
  } catch {
    return PHOTOGRAPHY_CATEGORIES.map((c, i) => ({
      id: c.id, name: c.name, short_name: c.shortName,
      description: c.description || '', image_url: c.image || '',
      popular_count: c.popularCount || '0+ Shoots',
      sort_order: i, is_active: true,
    }));
  }
}

// ─── Cities ───────────────────────────────────────────────────────────────────

export async function fetchCities(): Promise<string[]> {
  const client = getSupabaseClient();
  if (!client) return FALLBACK_CITIES;

  try {
    const { data, error } = await client
      .from('cities')
      .select('name')
      .eq('is_active', true)
      .order('sort_order');
    if (error || !data?.length) throw error || new Error('empty');
    return data.map((r: { name: string }) => r.name);
  } catch {
    return FALLBACK_CITIES;
  }
}

export async function fetchCitiesWithMeta(): Promise<DbCity[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  try {
    const { data, error } = await client.from('cities').select('*').eq('is_active', true).order('sort_order');
    return error ? [] : (data || []);
  } catch { return []; }
}

// ─── Add-Ons ──────────────────────────────────────────────────────────────────

export async function fetchAddOns(): Promise<DbAddOn[]> {
  const client = getSupabaseClient();
  if (!client) return AVAILABLE_ADDONS.map((a, i) => ({
    id: a.id, name: a.name, price: a.price,
    description: a.description || '', is_active: true, sort_order: i,
  }));

  try {
    const { data, error } = await client
      .from('add_ons')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error || !data?.length) throw error || new Error('empty');
    return data;
  } catch {
    return AVAILABLE_ADDONS.map((a, i) => ({
      id: a.id, name: a.name, price: a.price,
      description: a.description || '', is_active: true, sort_order: i,
    }));
  }
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export async function fetchTestimonials(featuredOnly = false): Promise<DbTestimonial[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    let query = client.from('testimonials').select('*').order('sort_order');
    if (featuredOnly) query = query.eq('is_featured', true);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch { return []; }
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(userData: {
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  city?: string;
  role?: 'customer' | 'photographer';
}): Promise<DbUser | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('users')
      .upsert({
        ...userData,
        role: userData.role || 'customer',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' })
      .select()
      .single();
    if (error) { console.warn('upsertUser error:', error.message); return null; }
    return data;
  } catch { return null; }
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('users').select('*').eq('email', email).single();
    if (error) return null;
    return data;
  } catch { return null; }
}

// ─── User Addresses ───────────────────────────────────────────────────────────

export async function getUserAddresses(userId: string): Promise<DbUserAddress[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  try {
    const { data, error } = await client.from('user_addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false });
    return error ? [] : (data || []);
  } catch { return []; }
}

export async function addUserAddress(address: Omit<DbUserAddress, 'id' | 'created_at'>): Promise<DbUserAddress | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    // If setting as default, unset others first
    if (address.is_default) {
      await client.from('user_addresses').update({ is_default: false }).eq('user_id', address.user_id);
    }
    const { data, error } = await client.from('user_addresses').insert(address).select().single();
    return error ? null : data;
  } catch { return null; }
}

export async function deleteUserAddress(addressId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('user_addresses').delete().eq('id', addressId);
    return !error;
  } catch { return false; }
}

// ─── User Devices (Multi-device tracking) ────────────────────────────────────

export async function getUserDevices(userId: string): Promise<DbUserDevice[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  try {
    const { data, error } = await client.from('user_devices').select('*').eq('user_id', userId).eq('is_active', true).order('last_seen_at', { ascending: false });
    return error ? [] : (data || []);
  } catch { return []; }
}

export async function registerOrUpdateDevice(userId: string, deviceInfo: {
  device_name: string;
  device_type?: 'web' | 'ios' | 'android' | 'desktop';
  device_fingerprint?: string;
  user_agent?: string;
}): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    if (deviceInfo.device_fingerprint) {
      // Update existing device
      const { data: existing } = await client
        .from('user_devices')
        .select('id')
        .eq('user_id', userId)
        .eq('device_fingerprint', deviceInfo.device_fingerprint)
        .single();

      if (existing) {
        await client.from('user_devices').update({ last_seen_at: new Date().toISOString(), is_active: true }).eq('id', existing.id);
        return true;
      }
    }

    // Insert new device
    await client.from('user_devices').insert({
      user_id: userId,
      device_name: deviceInfo.device_name,
      device_type: deviceInfo.device_type || 'web',
      device_fingerprint: deviceInfo.device_fingerprint || null,
      user_agent: deviceInfo.user_agent || null,
      last_seen_at: new Date().toISOString(),
      is_active: true,
    });
    return true;
  } catch { return false; }
}

export async function deactivateDevice(deviceId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('user_devices').update({ is_active: false }).eq('id', deviceId);
    return !error;
  } catch { return false; }
}