/**
 * MTShoots - Complete Supabase Database Seeder v2
 * Seeds: photographers, bookings, categories, cities, add_ons, testimonials
 * Idempotent: upserts with conflict handling
 */
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const candidates = [path.join(__dirname, "../.env.local"), path.join(__dirname, "../.env")];
  const file = candidates.find(f => fs.existsSync(f));
  if (!file) return;
  fs.readFileSync(file, "utf8").split("\n").forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  });
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) { console.error("Missing Supabase env vars"); process.exit(1); }

function getSupabase() {
  let createClient;
  for (const p of ["@supabase/supabase-js", path.join(__dirname, "../node_modules/@supabase/supabase-js")]) {
    try { createClient = require(p).createClient; break; } catch {}
  }
  if (!createClient) throw new Error("@supabase/supabase-js not found");
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

async function loadTsData() {
  let esbuild;
  for (const p of ["esbuild", path.join(__dirname, "../node_modules/esbuild")]) {
    try { esbuild = require(p); break; } catch {}
  }
  if (!esbuild) throw new Error("esbuild not found");

  const result = await esbuild.build({
    entryPoints: [path.join(__dirname, "../src/data/photographers.ts")],
    bundle: false, format: "cjs", platform: "node", target: "node18",
    write: false, loader: { ".ts": "ts" },
  });
  const code = result.outputFiles[0].text;
  const mod = { exports: {} };
  new Function("module", "exports", "require", "__dirname", "__filename", code)(mod, mod.exports, require, __dirname, __filename);

  const catResult = await esbuild.build({
    entryPoints: [path.join(__dirname, "../src/data/categories.ts")],
    bundle: false, format: "cjs", platform: "node", target: "node18",
    write: false, loader: { ".ts": "ts" },
  });
  const catCode = catResult.outputFiles[0].text;
  const catMod = { exports: {} };
  new Function("module", "exports", "require", "__dirname", "__filename", catCode)(catMod, catMod.exports, require, __dirname, __filename);

  return {
    photographers: mod.exports.INITIAL_PHOTOGRAPHERS || [],
    bookings: mod.exports.INITIAL_BOOKINGS || [],
    addOns: mod.exports.AVAILABLE_ADDONS || [],
    categories: catMod.exports.PHOTOGRAPHY_CATEGORIES || [],
  };
}

const CITIES_DATA = [
  { name: "Mumbai", state: "Maharashtra", sort_order: 1 },
  { name: "Delhi", state: "Delhi", sort_order: 2 },
  { name: "Bengaluru", state: "Karnataka", sort_order: 3 },
  { name: "Hyderabad", state: "Telangana", sort_order: 4 },
  { name: "Chennai", state: "Tamil Nadu", sort_order: 5 },
  { name: "Kolkata", state: "West Bengal", sort_order: 6 },
  { name: "Pune", state: "Maharashtra", sort_order: 7 },
  { name: "Ahmedabad", state: "Gujarat", sort_order: 8 },
  { name: "Jaipur", state: "Rajasthan", sort_order: 9 },
  { name: "Surat", state: "Gujarat", sort_order: 10 },
  { name: "Lucknow", state: "Uttar Pradesh", sort_order: 11 },
  { name: "Kanpur", state: "Uttar Pradesh", sort_order: 12 },
  { name: "Nagpur", state: "Maharashtra", sort_order: 13 },
  { name: "Indore", state: "Madhya Pradesh", sort_order: 14 },
  { name: "Bhopal", state: "Madhya Pradesh", sort_order: 15 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", sort_order: 16 },
  { name: "Vadodara", state: "Gujarat", sort_order: 17 },
  { name: "Rajkot", state: "Gujarat", sort_order: 18 },
  { name: "Varanasi", state: "Uttar Pradesh", sort_order: 19 },
  { name: "Amritsar", state: "Punjab", sort_order: 20 },
  { name: "Navi Mumbai", state: "Maharashtra", sort_order: 21 },
  { name: "Thane", state: "Maharashtra", sort_order: 22 },
  { name: "Coimbatore", state: "Tamil Nadu", sort_order: 23 },
  { name: "Kochi", state: "Kerala", sort_order: 24 },
  { name: "Guwahati", state: "Assam", sort_order: 25 },
  { name: "Chandigarh", state: "Chandigarh", sort_order: 26 },
  { name: "Jodhpur", state: "Rajasthan", sort_order: 27 },
  { name: "Madurai", state: "Tamil Nadu", sort_order: 28 },
  { name: "Raipur", state: "Chhattisgarh", sort_order: 29 },
  { name: "Goa", state: "Goa", sort_order: 30 },
  { name: "Udaipur", state: "Rajasthan", sort_order: 31 },
  { name: "Shimla", state: "Himachal Pradesh", sort_order: 32 },
  { name: "Darjeeling", state: "West Bengal", sort_order: 33 },
  { name: "Mysuru", state: "Karnataka", sort_order: 34 },
  { name: "Patna", state: "Bihar", sort_order: 35 },
  { name: "New Delhi", state: "Delhi", sort_order: 36 },
  { name: "Agra", state: "Uttar Pradesh", sort_order: 37 },
  { name: "Nashik", state: "Maharashtra", sort_order: 38 },
  { name: "Faridabad", state: "Haryana", sort_order: 39 },
  { name: "Meerut", state: "Uttar Pradesh", sort_order: 40 },
];

const TESTIMONIALS_DATA = [
  {
    quote: "MTShoots made finding a wedding photographer so effortless. We found Rohan within minutes and our photos look like high fashion editorial.",
    author_name: "Priya & Arjun Sharma",
    author_role: "Wedding Photography Client — Mumbai",
    author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    rating: 5, is_featured: true, sort_order: 1
  },
  {
    quote: "As a fashion director, we needed someone with an exact medium-format aesthetic. We booked Meera through MTShoots and she nailed every single look.",
    author_name: "Kavya Nair",
    author_role: "Creative Director, LYRA — Bengaluru",
    author_avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
    rating: 5, is_featured: true, sort_order: 2
  },
  {
    quote: "The escrow payment and guaranteed substitute model gave our brand complete peace of mind. We have booked 4 commercial shoots already.",
    author_name: "Rohit Agarwal",
    author_role: "Founder, Apex Lifestyle — Delhi NCR",
    author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    rating: 5, is_featured: true, sort_order: 3
  },
  {
    quote: "Incredible portfolio quality and the booking process was seamless. The photographer delivered exactly what we envisioned for our product launch.",
    author_name: "Sneha Mehta",
    author_role: "Brand Manager, Lenskart — Mumbai",
    author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    rating: 5, is_featured: false, sort_order: 4
  },
];

async function upsertBatch(supabase, table, rows, conflictCol, label) {
  if (!rows.length) { console.log(`  Skipping ${label} (no data)`); return; }
  const { error } = await supabase.from(table).upsert(rows, { onConflict: conflictCol, ignoreDuplicates: false });
  if (error) console.error(`  Error seeding ${label}:`, error.message);
  else console.log(`  OK: ${rows.length} ${label} seeded`);
}

async function seed() {
  console.log("Connecting to Supabase:", SUPABASE_URL);
  const supabase = getSupabase();

  // Check tables exist
  const { error: tableErr } = await supabase.from("photographers").select("id").limit(1);
  if (tableErr && (tableErr.code === "PGRST205" || (tableErr.message || "").includes("relation"))) {
    console.error("Tables not found. Run migration SQL first.");
    process.exit(1);
  }

  // Check existing photographer count
  const { count: pgCount } = await supabase.from("photographers").select("id", { count: "exact", head: true });
  if (pgCount && pgCount > 0) {
    console.log(`Photographers already seeded (${pgCount}). Checking other tables...`);
  }

  // Load TypeScript data
  console.log("Loading data from TypeScript source files...");
  const { photographers, bookings, addOns, categories } = await loadTsData();
  console.log(`Loaded: ${photographers.length} photographers, ${bookings.length} bookings, ${addOns.length} add-ons, ${categories.length} categories`);

  // 1. Seed Photographers
  if (!pgCount || pgCount === 0) {
    const pgRows = photographers.map(p => ({
      id: p.id, name: p.name, location: p.location,
      base_city: p.baseCity || p.location,
      office_location: p.officeLocation || null,
      office_address: p.officeAddress || null,
      office_map_url: p.officeMapUrl || null,
      avatar: p.avatar, hero_image: p.heroImage,
      primary_category: p.primaryCategory,
      specialties: p.specialties || [],
      experience_level: p.experienceLevel || "professional",
      experience_years: p.experienceYears || 5,
      rating: p.rating || 4.95, review_count: p.reviewCount || 0,
      day_rate: p.dayRate, half_day_rate: p.halfDayRate,
      available_now: p.availableNow ?? true,
      next_available_date: p.nextAvailableDate ? new Date(p.nextAvailableDate).toISOString().split("T")[0] : null,
      client_roster: p.clientRoster || [], bio: p.bio,
      awards: p.awards || [], equipment: p.equipment || [],
      camera_format: p.cameraFormat || "",
      home_slider_photos: p.homeSliderPhotos || [],
      turnaround_days: p.turnaroundDays || 3,
      assistant_included: p.assistantIncluded ?? true,
      portfolio: p.portfolio || [],
      updated_at: new Date().toISOString(),
    }));
    for (const row of pgRows) {
      const { error } = await supabase.from("photographers").upsert(row, { onConflict: "id" });
      if (error) console.error(`  Error: ${row.name}:`, error.message);
      else console.log(`  OK: ${row.name} (${row.base_city}) - ${(row.portfolio || []).length} portfolio items`);
    }
  }

  // 2. Seed Bookings
  const { count: bkCount } = await supabase.from("bookings").select("id", { count: "exact", head: true });
  if (!bkCount || bkCount === 0) {
    const bkRows = bookings.map(b => ({
      id: b.id, photographer_id: b.photographerId || null,
      photographer_name: b.photographerName,
      photographer_avatar: b.photographerAvatar || null,
      campaign_title: b.campaignTitle, client_brand: b.clientBrand,
      art_director_name: b.artDirectorName, art_director_email: b.artDirectorEmail,
      shoot_date: b.shootDate, call_time: b.callTime || "08:00 AM",
      location_name: b.locationName, location_address: b.locationAddress,
      duration_type: b.durationType, usage_rights: b.usageRights,
      selected_add_ons: b.selectedAddOns || [],
      day_rate: b.dayRate, duration_cost: b.durationCost,
      usage_cost: b.usageCost, add_ons_cost: b.addOnsCost,
      production_fee: b.productionFee, total_cost: b.totalCost,
      status: b.status || "confirmed",
      notes: b.notes || null, shot_list_overview: b.shotListOverview || null,
      updated_at: new Date().toISOString(),
    }));
    await upsertBatch(supabase, "bookings", bkRows, "id", "bookings");
  } else {
    console.log(`  Bookings already seeded (${bkCount}). Skipping.`);
  }

  // 3. Seed Categories
  const { count: catCount } = await supabase.from("categories").select("id", { count: "exact", head: true });
  if (!catCount || catCount === 0) {
    const catRows = categories.map((c, i) => ({
      id: c.id, name: c.name, short_name: c.shortName || c.name,
      description: c.description || "", image_url: c.image || "",
      popular_count: c.popularCount || "0+ Shoots",
      sort_order: i, is_active: true,
    }));
    await upsertBatch(supabase, "categories", catRows, "id", "categories");
  } else {
    console.log(`  Categories already seeded (${catCount}). Skipping.`);
  }

  // 4. Seed Cities
  const { count: cityCount } = await supabase.from("cities").select("id", { count: "exact", head: true });
  if (!cityCount || cityCount === 0) {
    await upsertBatch(supabase, "cities", CITIES_DATA, "name", "cities");
  } else {
    console.log(`  Cities already seeded (${cityCount}). Skipping.`);
  }

  // 5. Seed Add-Ons
  const { count: aoCount } = await supabase.from("add_ons").select("id", { count: "exact", head: true });
  if (!aoCount || aoCount === 0) {
    const aoRows = addOns.map((a, i) => ({
      id: a.id, name: a.name, price: a.price,
      description: a.description || "", is_active: true, sort_order: i,
    }));
    await upsertBatch(supabase, "add_ons", aoRows, "id", "add-ons");
  } else {
    console.log(`  Add-ons already seeded (${aoCount}). Skipping.`);
  }

  // 6. Seed Testimonials
  const { count: testCount } = await supabase.from("testimonials").select("id", { count: "exact", head: true });
  if (!testCount || testCount === 0) {
    // Use plain insert (no unique conflict column needed)
    const { error: testErr } = await supabase.from("testimonials").insert(TESTIMONIALS_DATA);
    if (testErr) console.error("  Error seeding testimonials:", testErr.message);
    else console.log(`  OK: ${TESTIMONIALS_DATA.length} testimonials seeded`);
  } else {
    console.log(`  Testimonials already seeded (${testCount}). Skipping.`);
  }

  
  // 7. Seed Users with Multi-Device and Multi-Address support
  const { count: usersCount } = await supabase.from('users').select('id', { count: 'exact', head: true });
  if (!usersCount || usersCount === 0) {
    const SEED_USERS = [
      {
        email: 'customer@mtshoots.com',
        full_name: 'Priya Sharma',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        phone: '+91 98201 12345',
        city: 'Mumbai',
        role: 'customer',
        is_verified: true,
        addresses: [
          { label: 'Home (Default)', street: '1402 Sea Face Towers, Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', landmark: 'Near Carter Road Promenade', is_default: true },
          { label: 'Studio Office', street: 'Level 5, One International Centre, Lower Parel', city: 'Mumbai', state: 'Maharashtra', pincode: '400013', landmark: 'Senapati Bapat Marg', is_default: false },
          { label: 'Vacation Villa', street: 'Villa 8, Candolim Hills', city: 'Goa', state: 'Goa', pincode: '403515', landmark: 'Candolim Beach Rd', is_default: false }
        ],
        devices: [
          { device_name: 'Priya iPhone 15 Pro', device_type: 'ios', device_fingerprint: 'fp_priya_ios_15', user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)', is_active: true },
          { device_name: 'MacBook Pro M3 Max', device_type: 'desktop', device_fingerprint: 'fp_priya_mac_01', user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', is_active: true },
          { device_name: 'iPad Pro 12.9', device_type: 'ios', device_fingerprint: 'fp_priya_ipad_02', user_agent: 'Mozilla/5.0 (iPad; CPU OS 17_4)', is_active: false }
        ]
      },
      {
        email: 'admin@mtshoots.com',
        full_name: 'Mayur Tarapara',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        phone: '+91 99000 00001',
        city: 'Mumbai',
        role: 'admin',
        is_verified: true,
        addresses: [
          { label: 'MTShoots HQ', street: 'Floor 12, World Crest, Lower Parel', city: 'Mumbai', state: 'Maharashtra', pincode: '400013', landmark: 'Next to Palladium Mall', is_default: true }
        ],
        devices: [
          { device_name: 'Admin Windows Workstation', device_type: 'desktop', device_fingerprint: 'fp_admin_win_01', user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', is_active: true },
          { device_name: 'Admin Samsung Galaxy S24 Ultra', device_type: 'android', device_fingerprint: 'fp_admin_android_02', user_agent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B)', is_active: true }
        ]
      },
      {
        email: 'darshan@mehtaphotos.com',
        full_name: 'Darshan Mehta',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        phone: '+91 98210 54321',
        city: 'Mumbai',
        role: 'photographer',
        photographer_id: 'darshan-mehta',
        is_verified: true,
        addresses: [
          { label: 'Darshan Mehta Studio', street: 'Unit 204, Laxmi Industrial Estate, Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400053', landmark: 'Near Fun Republic Mall', is_default: true }
        ],
        devices: [
          { device_name: 'Darshan Studio iMac', device_type: 'desktop', device_fingerprint: 'fp_darshan_imac', user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4)', is_active: true }
        ]
      }
    ];

    for (const u of SEED_USERS) {
      const { addresses, devices, ...userFields } = u;
      const { data: createdUser, error: uErr } = await supabase
        .from('users')
        .upsert(userFields, { onConflict: 'email' })
        .select()
        .single();
      
      if (uErr) {
        console.error('  Error upserting user', u.email, uErr.message);
        continue;
      }

      if (createdUser && createdUser.id) {
        for (const addr of addresses) {
          const addrRow = { ...addr, user_id: createdUser.id };
          const { error: aErr } = await supabase.from('user_addresses').insert(addrRow);
          if (aErr) console.error('    Error inserting address:', aErr.message);
        }
        for (const dev of devices) {
          const devRow = { ...dev, user_id: createdUser.id };
          const { error: dErr } = await supabase.from('user_devices').insert(devRow);
          if (dErr) console.error('    Error inserting device:', dErr.message);
        }
      }
    }
    console.log('  OK: ' + SEED_USERS.length + ' users seeded with multi-device and multi-address data');
  } else {
    console.log('  Users already seeded (' + usersCount + '). Skipping.');
  }

  console.log("\nAll seeding complete!");
}

seed().catch(err => { console.error("Fatal seed error:", err.message); process.exit(1); });