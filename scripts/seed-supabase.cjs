/**
 * MTShoots — Automated Supabase Database Seeder
 * Populates verified photographers, portfolio images, and bookings into Supabase
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('../node_modules/@supabase/supabase-js');

// 1. Load environment variables from .env.local or .env
function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  const fallbackEnv = path.join(__dirname, '../.env');
  const chosen = fs.existsSync(envPath) ? envPath : fallbackEnv;

  if (fs.existsSync(chosen)) {
    const raw = fs.readFileSync(chosen, 'utf8');
    raw.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (!process.env[match[1].trim()]) {
          process.env[match[1].trim()] = val;
        }
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Read photographers and bookings from data file
const photographersDataFile = path.join(__dirname, '../src/data/photographers.ts');
const rawCode = fs.readFileSync(photographersDataFile, 'utf8');

// Extract INITIAL_PHOTOGRAPHERS array via JSON extraction or eval
const matchPhotographers = rawCode.match(/export const INITIAL_PHOTOGRAPHERS: Photographer\[\] = ([\s\S]*?);\n\nexport const INITIAL_BOOKINGS/);
const matchBookings = rawCode.match(/export const INITIAL_BOOKINGS: BookingRequest\[\] = ([\s\S]*?);\n\nexport const AVAILABLE_ADDONS/);

async function seed() {
  console.log('🌱 Connecting to Supabase at:', supabaseUrl);

  // Check if tables exist
  const testQuery = await supabase.from('photographers').select('id').limit(1);
  if (testQuery.error && testQuery.error.code === 'PGRST205') {
    console.error('\n❌ Tables do not exist yet in your Supabase project.');
    console.log('👉 Please open your Supabase Dashboard -> SQL Editor,');
    console.log('👉 Paste the contents of supabase/migrations/20260922_init.sql and click RUN.');
    console.log('👉 Then re-run this seeder: npm run db:seed\n');
    process.exit(1);
  }

  // Load photographers from compiled / TS data
  // Using dynamic evaluation of the photographers data
  let photographers = [];
  let bookings = [];

  try {
    // Parse objects using Function
    const evalCode = rawCode
      .replace(/import .*/g, '')
      .replace(/export const AVAILABLE_ADDONS .*/s, '')
      .replace(/: [A-Z][a-zA-Z<>|\[\]]+/g, '');
    
    const context = {};
    const runner = new Function(evalCode + '\nreturn { INITIAL_PHOTOGRAPHERS, INITIAL_BOOKINGS };');
    const result = runner();
    photographers = result.INITIAL_PHOTOGRAPHERS;
    bookings = result.INITIAL_BOOKINGS;
  } catch (err) {
    console.warn('Fallback parser for photographers data...', err.message);
  }

  console.log(`📸 Seeding ${photographers.length} verified photographers with portfolios...`);

  for (const p of photographers) {
    const row = {
      id: p.id,
      name: p.name,
      location: p.location,
      base_city: p.baseCity || p.location,
      office_location: p.officeLocation || null,
      office_address: p.officeAddress || null,
      office_map_url: p.officeMapUrl || null,
      avatar: p.avatar,
      hero_image: p.heroImage,
      primary_category: p.primaryCategory,
      specialties: p.specialties || [],
      experience_level: p.experienceLevel || 'professional',
      experience_years: p.experienceYears || 5,
      rating: p.rating || 4.95,
      review_count: p.reviewCount || 0,
      day_rate: p.dayRate,
      half_day_rate: p.halfDayRate,
      available_now: p.availableNow ?? true,
      next_available_date: p.nextAvailableDate ? new Date(p.nextAvailableDate).toISOString().split('T')[0] : null,
      client_roster: p.clientRoster || [],
      bio: p.bio,
      awards: p.awards || [],
      equipment: p.equipment || [],
      camera_format: p.cameraFormat || '',
      home_slider_photos: p.homeSliderPhotos || [],
      turnaround_days: p.turnaroundDays || 3,
      assistant_included: p.assistantIncluded ?? true,
      portfolio: p.portfolio || [],
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('photographers')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error(`⚠️ Error upserting photographer ${p.name} (${p.id}):`, error.message);
    } else {
      console.log(`  ✓ ${p.name} (${p.baseCity}) — ${(p.portfolio || []).length} portfolio photos`);
    }
  }

  console.log(`\n📅 Seeding ${bookings.length} initial bookings...`);
  for (const b of bookings) {
    const bRow = {
      id: b.id,
      photographer_id: b.photographerId,
      photographer_name: b.photographerName,
      photographer_avatar: b.photographerAvatar || null,
      campaign_title: b.campaignTitle,
      client_brand: b.clientBrand,
      art_director_name: b.artDirectorName,
      art_director_email: b.artDirectorEmail,
      shoot_date: b.shootDate,
      call_time: b.callTime || '08:00 AM',
      location_name: b.locationName,
      location_address: b.locationAddress,
      duration_type: b.durationType,
      usage_rights: b.usageRights,
      selected_add_ons: b.selectedAddOns || [],
      day_rate: b.dayRate,
      duration_cost: b.durationCost,
      usage_cost: b.usageCost,
      add_ons_cost: b.addOnsCost,
      production_fee: b.productionFee,
      total_cost: b.totalCost,
      status: b.status || 'confirmed',
      notes: b.notes || null,
      shot_list_overview: b.shotListOverview || null,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('bookings')
      .upsert(bRow, { onConflict: 'id' });

    if (error) {
      console.error(`⚠️ Error upserting booking ${b.campaignTitle}:`, error.message);
    } else {
      console.log(`  ✓ Booking: ${b.campaignTitle} (${b.shootDate})`);
    }
  }

  console.log('\n🎉 Supabase database seeding completed successfully!');
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
