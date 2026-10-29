import fs from "node:fs";
import type { DB } from "./connection";
import { SCHEMA_PATH, SEED_PATH, SEED_SAMPLE_PATH } from "./paths";
import { writeSnapshot } from "./snapshot";

function count(db: DB, table: "sheets" | "problems"): number {
  const row = db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as {
    c: number;
  };
  return row.c;
}

/** `seed.sql` if you have one, otherwise the committed sample sheet. */
function resolveSeedPath(): string {
  if (fs.existsSync(SEED_PATH)) return SEED_PATH;
  console.log("ℹ️  No seed.sql found — falling back to seed.sample.sql");
  return SEED_SAMPLE_PATH;
}

/**
 * Prepare a freshly opened database:
 *   1. apply the schema (idempotent — `CREATE TABLE IF NOT EXISTS`)
 *   2. empty DB  → seed it from seed.sql
 *      non-empty → snapshot it back to seed.sql (auto-backup on every start)
 */
export function initializeDatabase(db: DB): void {
  db.exec(fs.readFileSync(SCHEMA_PATH, "utf8"));

  if (count(db, "sheets") === 0) {
    console.log("📦 Empty database — applying seed...");
    const seed = fs.readFileSync(resolveSeedPath(), "utf8");
    db.transaction(() => db.exec(seed))();
    console.log(`✅ Seeded ${count(db, "problems")} problems.`);
    return;
  }

  console.log(`✅ Database ready — ${count(db, "problems")} problems loaded.`);
  try {
    writeSnapshot(db);
  } catch (error) {
    console.warn(
      "⚠️ Auto-snapshot failed:",
      error instanceof Error ? error.message : error,
    );
  }
}
