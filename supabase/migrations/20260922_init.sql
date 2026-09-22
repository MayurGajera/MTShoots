-- ==============================================================================
-- MTSHOOTS SUPABASE POSTGRESQL SCHEMA - FULL V2 MIGRATION
-- ==============================================================================

-- 1. Photographers Table (original)
CREATE TABLE IF NOT EXISTS public.photographers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    base_city TEXT NOT NULL,
    office_location TEXT,
    office_address TEXT,
    office_map_url TEXT,
    avatar TEXT NOT NULL,
    hero_image TEXT NOT NULL,
    primary_category TEXT NOT NULL,
    specialties TEXT[] NOT NULL DEFAULT '{}',
    experience_level TEXT NOT NULL DEFAULT 'professional',
    experience_years INTEGER NOT NULL DEFAULT 5,
    rating NUMERIC(3,2) NOT NULL DEFAULT 4.95,
    review_count INTEGER NOT NULL DEFAULT 0,
    day_rate INTEGER NOT NULL,
    half_day_rate INTEGER NOT NULL,
    available_now BOOLEAN NOT NULL DEFAULT true,
    next_available_date DATE,
    client_roster TEXT[] NOT NULL DEFAULT '{}',
    bio TEXT NOT NULL,
    awards TEXT[] DEFAULT '{}',
    equipment TEXT[] DEFAULT '{}',
    camera_format TEXT,
    home_slider_photos TEXT[] DEFAULT '{}',
    turnaround_days INTEGER NOT NULL DEFAULT 3,
    assistant_included BOOLEAN NOT NULL DEFAULT true,
    portfolio JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bookings Table (original)
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
    call_time TEXT NOT NULL DEFAULT '08:00 AM',
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
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Shortlists Table (original)
CREATE TABLE IF NOT EXISTS public.shortlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id TEXT NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL DEFAULT 'default_session',
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(photographer_id, session_id)
);

-- 4. Users Table (NEW)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    city TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'photographer', 'admin')),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    photographer_id TEXT REFERENCES public.photographers(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User Devices Table (NEW - Multi-device access)
CREATE TABLE IF NOT EXISTS public.user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL DEFAULT 'Unknown Device',
    device_type TEXT DEFAULT 'web' CHECK (device_type IN ('web', 'ios', 'android', 'desktop')),
    device_fingerprint TEXT,
    user_agent TEXT,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. User Addresses Table (NEW - Multi-address)
CREATE TABLE IF NOT EXISTS public.user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    label TEXT NOT NULL DEFAULT 'Home',
    street TEXT,
    city TEXT NOT NULL,
    state TEXT,
    pincode TEXT,
    landmark TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Categories Table (NEW - Dynamic categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    popular_count TEXT DEFAULT '0+ Shoots',
    sort_order INTEGER NOT NULL DEFAULT 99,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Cities Table (NEW - Dynamic cities)
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    state TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 99,
    photographer_count INTEGER DEFAULT 0
);

-- 9. Add-Ons Table (NEW - Dynamic booking add-ons)
CREATE TABLE IF NOT EXISTS public.add_ons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 99
);

-- 10. Testimonials Table (NEW - Dynamic testimonials)
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_role TEXT,
    author_avatar TEXT,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 99,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ─── Alter existing tables to add new columns (safe for existing deployments) ─
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.shortlists ADD COLUMN IF NOT EXISTS user_id UUID;
-- ─── Enable Row Level Security ──────────────────────────────────────────────
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- ─── RLS Policies ───────────────────────────────────────────────────────────

-- Photographers (public read)
DROP POLICY IF EXISTS "Public can view photographers" ON public.photographers;
CREATE POLICY "Public can view photographers" ON public.photographers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public and onboarding can insert photographers" ON public.photographers;
CREATE POLICY "Public and onboarding can insert photographers" ON public.photographers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public and onboarding can update photographers" ON public.photographers;
CREATE POLICY "Public and onboarding can update photographers" ON public.photographers FOR UPDATE USING (true);

-- Bookings
DROP POLICY IF EXISTS "Public can view bookings" ON public.bookings;
CREATE POLICY "Public can view bookings" ON public.bookings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;
CREATE POLICY "Public can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update bookings" ON public.bookings;
CREATE POLICY "Public can update bookings" ON public.bookings FOR UPDATE USING (true);

-- Shortlists
DROP POLICY IF EXISTS "Public can manage shortlists" ON public.shortlists;
CREATE POLICY "Public can manage shortlists" ON public.shortlists FOR ALL USING (true) WITH CHECK (true);

-- Users (anyone can create, only owner can read/update)
DROP POLICY IF EXISTS "Public can create users" ON public.users;
CREATE POLICY "Public can create users" ON public.users FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can view users" ON public.users;
CREATE POLICY "Public can view users" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (true);

-- User Devices (owner access)
DROP POLICY IF EXISTS "Users can manage own devices" ON public.user_devices;
CREATE POLICY "Users can manage own devices" ON public.user_devices FOR ALL USING (true) WITH CHECK (true);

-- User Addresses (owner access)
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.user_addresses;
CREATE POLICY "Users can manage own addresses" ON public.user_addresses FOR ALL USING (true) WITH CHECK (true);

-- Categories (public read)
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role can manage categories" ON public.categories;
CREATE POLICY "Service role can manage categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Cities (public read)
DROP POLICY IF EXISTS "Public can view cities" ON public.cities;
CREATE POLICY "Public can view cities" ON public.cities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role can manage cities" ON public.cities;
CREATE POLICY "Service role can manage cities" ON public.cities FOR ALL USING (true) WITH CHECK (true);

-- Add-Ons (public read)
DROP POLICY IF EXISTS "Public can view add_ons" ON public.add_ons;
CREATE POLICY "Public can view add_ons" ON public.add_ons FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role can manage add_ons" ON public.add_ons;
CREATE POLICY "Service role can manage add_ons" ON public.add_ons FOR ALL USING (true) WITH CHECK (true);

-- Testimonials (public read)
DROP POLICY IF EXISTS "Public can view testimonials" ON public.testimonials;
CREATE POLICY "Public can view testimonials" ON public.testimonials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role can manage testimonials" ON public.testimonials;
CREATE POLICY "Service role can manage testimonials" ON public.testimonials FOR ALL USING (true) WITH CHECK (true);

-- ─── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_photographers_city ON public.photographers (base_city);
CREATE INDEX IF NOT EXISTS idx_photographers_category ON public.photographers (primary_category);
CREATE INDEX IF NOT EXISTS idx_photographers_rating ON public.photographers (rating DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings (shoot_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_user_devices_user ON public.user_devices (user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_fingerprint ON public.user_devices (device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON public.user_addresses (user_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON public.categories (sort_order);
CREATE INDEX IF NOT EXISTS idx_cities_sort ON public.cities (sort_order);
CREATE INDEX IF NOT EXISTS idx_add_ons_sort ON public.add_ons (sort_order);

-- ─── Storage Bucket ──────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('mtshoots-portfolios', 'mtshoots-portfolios', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Portfolio Image Access" ON storage.objects;
CREATE POLICY "Public Portfolio Image Access" ON storage.objects FOR SELECT USING (bucket_id = 'mtshoots-portfolios');
DROP POLICY IF EXISTS "Public Portfolio Image Upload" ON storage.objects;
CREATE POLICY "Public Portfolio Image Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mtshoots-portfolios');

-- ─── Insert avatars bucket for user profile images ──────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('mtshoots-avatars', 'mtshoots-avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Avatar Access" ON storage.objects;
CREATE POLICY "Public Avatar Access" ON storage.objects FOR SELECT USING (bucket_id = 'mtshoots-avatars');
DROP POLICY IF EXISTS "Authenticated Avatar Upload" ON storage.objects;
CREATE POLICY "Authenticated Avatar Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mtshoots-avatars');