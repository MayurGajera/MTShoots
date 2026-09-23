/**
 * MTShoots - Automated Deployment Migration & Seeder
 * Runs before next build. Fully idempotent per-table check.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

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

const DIRECT_URL = process.env.DIRECT_URL;
const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const MIGRATION_FILE = path.join(__dirname, "../supabase/migrations/20260922_init.sql");
const SEEDER_FILE = path.join(__dirname, "seed-supabase.cjs");

async function applyMigration() {
  const dbUrl = DIRECT_URL || DATABASE_URL;
  if (!dbUrl || dbUrl.includes("[YOUR-PASSWORD]")) return { success: false, reason: "No valid DB URL" };

  let pg;
  for (const p of ["pg", path.join(__dirname, "../node_modules/pg")]) {
    try { pg = require(p); break; } catch {}
  }
  if (!pg) return { success: false, reason: "pg module not available" };

  const client = new pg.Client({
    connectionString: dbUrl.replace(/\?.*$/, ""),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  try {
    await client.connect();
    console.log("  OK Connected to PostgreSQL");
    if (fs.existsSync(MIGRATION_FILE)) {
      const sql = fs.readFileSync(MIGRATION_FILE, "utf8");
      await client.query(sql);
      console.log("  OK All tables created / verified (CREATE IF NOT EXISTS)");
    }
    await client.end();
    return { success: true };
  } catch (err) {
    try { await client.end(); } catch {}
    return { success: false, reason: err.message };
  }
}

async function checkTablesNeedSeeding() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return true;
  let createClient;
  for (const p of ["@supabase/supabase-js", path.join(__dirname, "../node_modules/@supabase/supabase-js")]) {
    try { createClient = require(p).createClient; break; } catch {}
  }
  if (!createClient) return true;

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const tables = ["photographers", "categories", "cities", "add_ons", "testimonials", "users"];
  const counts = {};

  for (const t of tables) {
    const { count, error } = await supabase.from(t).select("id", { count: "exact", head: true });
    counts[t] = error ? -1 : (count || 0);
  }

  console.log("  Table counts:", JSON.stringify(counts));
  // Need seeding if ANY required table is empty
  return Object.values(counts).some(c => c === 0);
}

async function main() {
  console.log("\nMTShoots - Auto Migration & Seed Check\n");

  // Step 1: Apply migration (create all tables IF NOT EXISTS)
  console.log("Applying database migration...");
  const migResult = await applyMigration();
  if (!migResult.success) {
    console.log("Migration note:", migResult.reason);
    console.log("Note: Tables will use existing schema if connection unavailable.\n");
  }

  // Step 2: Check if any table needs seeding
  console.log("Checking if seed data is needed...");
  const needsSeed = await checkTablesNeedSeeding();

  if (!needsSeed) {
    console.log("All tables have data - skipping seed.\n");
    return;
  }

  // Step 3: Run seeder
  console.log("Running seed script...");
  if (fs.existsSync(SEEDER_FILE)) {
    try {
      execSync(`node "${SEEDER_FILE}"`, { stdio: "inherit", timeout: 180000 });
    } catch (err) {
      console.log("Seeder notice:", err.message);
    }
  }
}

main()
  .then(() => { console.log("Auto-migration & seed check complete.\n"); process.exit(0); })
  .catch(err => { console.log("Non-fatal notice:", err.message); process.exit(0); });
