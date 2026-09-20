import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import snapshot from "./snapshot.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "problems.db");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");
const SEED_PATH = path.join(__dirname, "seed.sql");

const db = new Database(DB_PATH);

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

// Apply schema (safe — CREATE TABLE IF NOT EXISTS)
const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
db.exec(schema);

// Seed only if DB is empty
const { c: sheetCount } = db.prepare("SELECT COUNT(*) AS c FROM sheets").get();

if (sheetCount === 0) {
  console.log("📦 Empty database — applying seed...");

  const seed = fs.readFileSync(SEED_PATH, "utf8");
  db.exec(seed);

  const { c: total } = db.prepare("SELECT COUNT(*) AS c FROM problems").get();

  console.log(`✅ Seeded ${total} problems.`);
} else {
  const { c: total } = db.prepare("SELECT COUNT(*) AS c FROM problems").get();

  console.log(`✅ Database ready — ${total} problems loaded.`);

  // Auto-snapshot current state back to seed.sql on every start
  try {
    snapshot();
  } catch (error) {
    console.warn("⚠️ Auto-snapshot failed:", error.message);
  }
}

export { db };
