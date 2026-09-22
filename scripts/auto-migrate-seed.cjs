/**
 * MTShoots - Automated Deployment Migration & Seeder
 * Runs before next build on Vercel or locally.
 * Idempotent: Skips migration/seeding if data or tables already exist.
 * Uses direct PostgreSQL connection (pg) and falls back to Supabase REST.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ─── Load environment variables ───────────────────────────────────────────────
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

const DIRECT_URL = process.env.DIRECT_URL;
const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const MIGRATION_FILE = path.join(__dirname, "../supabase/migrations/20260922_init.sql");
const SEEDER_FILE = path.join(__dirname, "seed-supabase.cjs");

// ─── Direct PostgreSQL (preferred) ───────────────────────────────────────────
async function runViaPostgres() {
  const dbUrl = DIRECT_URL || DATABASE_URL;
  if (!dbUrl || dbUrl.includes("[YOUR-PASSWORD]") || dbUrl.includes("your-project-id")) {
    return { success: false, reason: "No valid DATABASE_URL configured" };
  }

  let pg;
  const pgPaths = ["pg", path.join(__dirname, "../node_modules/pg")];
  for (const p of pgPaths) {
    try { pg = require(p); break; } catch {}
  }
  if (!pg) return { success: false, reason: "pg module not available" };

  // Remove query string for direct connection (not pgbouncer)
  const cleanUrl = dbUrl.replace(/\?.*$/, "");
  const client = new pg.Client({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
    console.log("  OK Connected to PostgreSQL directly");

    // Apply migration (all CREATE TABLE IF NOT EXISTS — fully idempotent)
    if (fs.existsSync(MIGRATION_FILE)) {
      const sql = fs.readFileSync(MIGRATION_FILE, "utf8");
      await client.query(sql);
      console.log("  OK Migration schema applied / verified");
    } else {
      console.log("  Note: Migration file not found at:", MIGRATION_FILE);
    }

    const res = await client.query("SELECT COUNT(*) as count FROM public.photographers");
    const count = parseInt(res.rows[0].count, 10);
    await client.end();
    return { success: true, photographerCount: count };
  } catch (err) {
    try { await client.end(); } catch {}
    return { success: false, reason: err.message };
  }
}

// ─── Supabase REST fallback ───────────────────────────────────────────────────
async function checkViaSupabaseRest() {
  if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes("your-project-id")) {
    return { exists: false, count: 0, reason: "Supabase env vars not set" };
  }

  let createClient;
  const sbPaths = ["@supabase/supabase-js", path.join(__dirname, "../node_modules/@supabase/supabase-js")];
  for (const p of sbPaths) {
    try { createClient = require(p).createClient; break; } catch {}
  }
  if (!createClient) return { exists: false, count: 0, reason: "@supabase/supabase-js not available" };

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { error, count } = await supabase
    .from("photographers")
    .select("id", { count: "exact", head: true });

  if (error) {
    const tablesMissing = error.code === "PGRST205" || (error.message || "").includes("relation");
    return { exists: !tablesMissing, count: 0, error: error.message };
  }
  return { exists: true, count: count || 0 };
}

// ─── Run seeder as child process (synchronous) ───────────────────────────────
function runSeeder() {
  if (!fs.existsSync(SEEDER_FILE)) {
    console.log("  Note: Seeder file not found:", SEEDER_FILE);
    return;
  }
  console.log("  Running seed script...");
  try {
    execSync(`node "${SEEDER_FILE}"`, { stdio: "inherit", timeout: 120000 });
  } catch (err) {
    console.log("  Seeder notice:", err.message);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\nMTShoots - Auto Migration & Seed Check\n");

  // Attempt direct PostgreSQL
  console.log("Attempting direct PostgreSQL connection...");
  const pgResult = await runViaPostgres();

  if (pgResult.success) {
    if (pgResult.photographerCount > 0) {
      console.log(`DB has ${pgResult.photographerCount} photographers - skipping seed.\n`);
      return;
    }
    console.log("DB empty - running initial seed...");
    runSeeder();
    return;
  }

  console.log("PostgreSQL note:", pgResult.reason);

  // Fallback to Supabase REST
  console.log("Checking via Supabase REST API...");
  const sbResult = await checkViaSupabaseRest();

  if (!sbResult.exists) {
    if (sbResult.error) {
      console.log("Supabase note:", sbResult.error);
    }
    console.log("Tables not yet created. Migration SQL will be applied on first run with pg.");
    console.log("Tip: Run 'supabase/migrations/20260922_init.sql' in Supabase SQL Editor\n");
    return;
  }

  if (sbResult.count > 0) {
    console.log(`Supabase has ${sbResult.count} photographers - skipping seed.\n`);
    return;
  }

  console.log("Tables exist but empty - running initial seed...");
  runSeeder();
}

main()
  .then(() => {
    console.log("Auto-migration & seed check complete.\n");
    process.exit(0);
  })
  .catch(err => {
    console.log("Non-fatal notice:", err.message);
    process.exit(0); // Non-fatal - don't block the build
  });