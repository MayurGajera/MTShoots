/**
 * MTShoots - Migrate images to Supabase Storage and update PostgreSQL DB
 * 
 * 1. Iterates over all photographers in Supabase DB.
 * 2. Uploads avatar to bucket 'mtshoots-avatars'.
 * 3. Uploads heroImage, homeSliderPhotos, and portfolio images to bucket 'mtshoots-portfolios'.
 * 4. Updates photographer record in Supabase database with persistent public storage URLs.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

function loadEnv() {
  const candidates = [path.join(__dirname, '../.env.local'), path.join(__dirname, '../.env')];
  const file = candidates.find(f => fs.existsSync(f));
  if (!file) return;
  fs.readFileSync(file, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
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
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === 'https:' ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      // Handle redirect (e.g. 301, 302)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchBuffer(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({
        buffer: Buffer.concat(chunks),
        contentType: res.headers['content-type'] || 'image/jpeg'
      }));
    }).on('error', reject);
  });
}

async function uploadToStorage(bucket, storagePath, url) {
  if (!url || typeof url !== 'string') return url;
  // If already in Supabase Storage, skip upload
  if (url.includes(SUPABASE_URL) && url.includes('/storage/v1/object/public/')) {
    return url;
  }

  try {
    const { buffer, contentType } = await fetchBuffer(url);
    const { error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType,
        upsert: true
      });

    if (error) {
      console.warn(`  [Warning] Storage upload failed for ${storagePath}: ${error.message}`);
      return url;
    }

    const { data: pubData } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    return pubData.publicUrl;
  } catch (err) {
    console.warn(`  [Warning] Could not fetch ${url}: ${err.message}`);
    return url;
  }
}

async function runMigration() {
  console.log('=== Starting Image Migration to Supabase Storage ===\n');

  // Ensure buckets exist and are public
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketNames = (buckets || []).map(b => b.name);
  if (!bucketNames.includes('mtshoots-avatars')) {
    await supabase.storage.createBucket('mtshoots-avatars', { public: true });
    console.log('Created bucket: mtshoots-avatars');
  }
  if (!bucketNames.includes('mtshoots-portfolios')) {
    await supabase.storage.createBucket('mtshoots-portfolios', { public: true });
    console.log('Created bucket: mtshoots-portfolios');
  }

  // Fetch photographers from Supabase
  const { data: photographers, error } = await supabase
    .from('photographers')
    .select('*');

  if (error || !photographers) {
    console.error('Error fetching photographers:', error);
    process.exit(1);
  }

  console.log(`Found ${photographers.length} photographers in DB. Beginning migration...\n`);

  for (const p of photographers) {
    console.log(`Processing: ${p.name} (${p.id})`);

    // 1. Avatar
    let newAvatar = p.avatar;
    if (p.avatar && !p.avatar.includes(SUPABASE_URL)) {
      const avatarPath = `${p.id}/avatar.jpg`;
      newAvatar = await uploadToStorage('mtshoots-avatars', avatarPath, p.avatar);
      console.log(`  Avatar uploaded -> ${newAvatar}`);
    }

    // 2. Hero Image
    let newHero = p.hero_image;
    if (p.hero_image && !p.hero_image.includes(SUPABASE_URL)) {
      const heroPath = `${p.id}/hero.jpg`;
      newHero = await uploadToStorage('mtshoots-portfolios', heroPath, p.hero_image);
      console.log(`  Hero image uploaded -> ${newHero}`);
    }

    // 3. Home Slider Photos
    let newHomeSliders = Array.isArray(p.home_slider_photos) ? [...p.home_slider_photos] : [];
    for (let i = 0; i < newHomeSliders.length; i++) {
      const photoUrl = newHomeSliders[i];
      if (photoUrl && !photoUrl.includes(SUPABASE_URL)) {
        const sliderPath = `${p.id}/slider-${i + 1}.jpg`;
        newHomeSliders[i] = await uploadToStorage('mtshoots-portfolios', sliderPath, photoUrl);
      }
    }

    // 4. Portfolio items
    let newPortfolio = Array.isArray(p.portfolio) ? [...p.portfolio] : [];
    for (let i = 0; i < newPortfolio.length; i++) {
      const item = { ...newPortfolio[i] };
      if (item.imageUrl && !item.imageUrl.includes(SUPABASE_URL)) {
        const portPath = `${p.id}/portfolio-${item.id || i + 1}.jpg`;
        item.imageUrl = await uploadToStorage('mtshoots-portfolios', portPath, item.imageUrl);
      }
      newPortfolio[i] = item;
    }

    // Update in Supabase PostgreSQL
    const { error: updateErr } = await supabase
      .from('photographers')
      .update({
        avatar: newAvatar,
        hero_image: newHero,
        home_slider_photos: newHomeSliders,
        portfolio: newPortfolio
      })
      .eq('id', p.id);

    if (updateErr) {
      console.error(`  Error updating DB for ${p.id}: ${updateErr.message}`);
    } else {
      console.log(`  [Success] DB updated with storage URLs for ${p.id}\n`);
    }
  }

  console.log('=== Image Migration to Supabase Storage Complete ===');
}

runMigration().catch(err => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
