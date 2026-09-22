-- ==============================================================================
-- MTSHOOTS SUPABASE POSTGRESQL SCHEMA & STORAGE MIGRATION
-- Run this script in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Create Photographers Table
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

-- 2. Create Bookings & Call Sheets Table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Shortlists Table
CREATE TABLE IF NOT EXISTS public.shortlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photographer_id TEXT NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL DEFAULT 'default_session',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(photographer_id, session_id)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Public can view photographers" ON public.photographers;
CREATE POLICY "Public can view photographers" 
ON public.photographers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public and onboarding can insert photographers" ON public.photographers;
CREATE POLICY "Public and onboarding can insert photographers" 
ON public.photographers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public and onboarding can update photographers" ON public.photographers;
CREATE POLICY "Public and onboarding can update photographers" 
ON public.photographers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can view bookings" ON public.bookings;
CREATE POLICY "Public can view bookings" 
ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;
CREATE POLICY "Public can create bookings" 
ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can manage shortlists" ON public.shortlists;
CREATE POLICY "Public can manage shortlists" 
ON public.shortlists FOR ALL USING (true) WITH CHECK (true);

-- 6. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_photographers_city ON public.photographers (base_city);
CREATE INDEX IF NOT EXISTS idx_photographers_category ON public.photographers (primary_category);
CREATE INDEX IF NOT EXISTS idx_photographers_rating ON public.photographers (rating DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings (shoot_date);

-- 7. Supabase Storage Bucket Setup (for photographer avatars & portfolio uploads)
INSERT INTO storage.buckets (id, name, public)
VALUES ('mtshoots-portfolios', 'mtshoots-portfolios', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Portfolio Image Access" ON storage.objects;
CREATE POLICY "Public Portfolio Image Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'mtshoots-portfolios');

DROP POLICY IF EXISTS "Public Portfolio Image Upload" ON storage.objects;
CREATE POLICY "Public Portfolio Image Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'mtshoots-portfolios');
