/**
 * MTShoots - Automated Supabase Database Seeder
 * Uses esbuild to compile the TypeScript data file at runtime.
 * Upserts photographers & bookings; skips if data already exists.
 */

const fs = require("fs");
const path = require("path");

// ─── Load .env ───────────────────────────────────────────────────────────────
function loadEnv() {
  const candidates = [
    path.join(__dirname, "../.env.local"),
    path.join(__dirname, "../.env"),
  ];
  const file = candidates.find(f => fs.existsSync(f));
  if (!file) return;
  const raw = fs.readFileSync(file, "utf8");
  raw.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  });
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// ─── Load Data: Use esbuild to compile the TS data file ──────────────────────
async function loadPhotographerData() {
  let esbuild;
  try {
    esbuild = require("./node_modules/esbuild");
  } catch {
    esbuild = require("../node_modules/esbuild");
  }

  const dataFile = path.join(__dirname, "../src/data/photographers.ts");
  
  // Bundle the TypeScript file to CommonJS format in memory
  const result = await esbuild.build({
    entryPoints: [dataFile],
    bundle: false,
    format: "cjs",
    platform: "node",
    target: "node18",
    write: false,           // Don't write to disk
    loader: { ".ts": "ts" },
  });

  const code = result.outputFiles[0].text;
  
  // Execute the compiled code in a module-like context
  const mod = { exports: {} };
  const fn = new Function("module", "exports", "require", "__dirname", "__filename", code);
  fn(mod, mod.exports, require, __dirname, __filename);
  
  return {
    photographers: mod.exports.INITIAL_PHOTOGRAPHERS || [],
    bookings: mod.exports.INITIAL_BOOKINGS || [],
  };
}

// ─── Supabase Client ──────────────────────────────────────────────────────────
function getSupabaseClient() {
  let createClient;
  const sbPaths = [
    "@supabase/supabase-js",
    path.join(__dirname, "../node_modules/@supabase/supabase-js"),
  ];
  for (const p of sbPaths) {
    try { createClient = require(p).createClient; break; } catch {}
  }
  if (!createClient) throw new Error("@supabase/supabase-js not found");
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ─── Main Seed ────────────────────────────────────────────────────────────────
async function seed() {
  console.log("Connecting to Supabase at:", SUPABASE_URL);
  const supabase = getSupabaseClient();

  // Check if tables exist
  const { error: tableErr } = await supabase.from("photographers").select("id").limit(1);
  if (tableErr && (tableErr.code === "PGRST205" || tableErr.message?.includes("relation"))) {
    console.error("\nError: Tables do not exist yet. Run the migration SQL first.");
    console.log("  supabase/migrations/20260922_init.sql");
    process.exit(1);
  }

  // Check existing count
  const { count: existingCount } = await supabase
    .from("photographers")
    .select("id", { count: "exact", head: true });

  if (existingCount && existingCount > 0) {
    console.log(`Database already has ${existingCount} photographers. Skipping seed.`);
    return;
  }

  // Load data
  console.log("Loading photographer data from TypeScript source...");
  const { photographers, bookings } = await loadPhotographerData();
  console.log(`Seeding ${photographers.length} photographers and ${bookings.length} bookings...`);

  // Upsert photographers
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
      experience_level: p.experienceLevel || "professional",
      experience_years: p.experienceYears || 5,
      rating: p.rating || 4.95,
      review_count: p.reviewCount || 0,
      day_rate: p.dayRate,
      half_day_rate: p.halfDayRate,
      available_now: p.availableNow ?? true,
      next_available_date: p.nextAvailableDate ? new Date(p.nextAvailableDate).toISOString().split("T")[0] : null,
      client_roster: p.clientRoster || [],
      bio: p.bio,
      awards: p.awards || [],
      equipment: p.equipment || [],
      camera_format: p.cameraFormat || "",
      home_slider_photos: p.homeSliderPhotos || [],
      turnaround_days: p.turnaroundDays || 3,
      assistant_included: p.assistantIncluded ?? true,
      portfolio: p.portfolio || [],
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("photographers").upsert(row, { onConflict: "id" });
    if (error) {
      console.error(`  Error seeding ${p.name}:`, error.message);
    } else {
      console.log(`  OK: ${p.name} (${p.baseCity}) - ${(p.portfolio || []).length} portfolio items`);
    }
  }

  // Upsert bookings
  if (bookings.length > 0) {
    console.log(`\nSeeding ${bookings.length} bookings...`);
    for (const b of bookings) {
      const row = {
        id: b.id,
        photographer_id: b.photographerId || null,
        photographer_name: b.photographerName,
        photographer_avatar: b.photographerAvatar || null,
        campaign_title: b.campaignTitle,
        client_brand: b.clientBrand,
        art_director_name: b.artDirectorName,
        art_director_email: b.artDirectorEmail,
        shoot_date: b.shootDate,
        call_time: b.callTime || "08:00 AM",
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
        status: b.status || "confirmed",
        notes: b.notes || null,
        shot_list_overview: b.shotListOverview || null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("bookings").upsert(row, { onConflict: "id" });
      if (error) console.error(`  Error seeding booking ${b.campaignTitle}:`, error.message);
      else console.log(`  OK: Booking - ${b.campaignTitle}`);
    }
  }

  console.log("\nSeeding completed successfully!");
}

seed().catch(err => {
  console.error("Fatal seed error:", err.message);
  process.exit(1);
});