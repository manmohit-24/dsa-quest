/**
 * snapshot.js
 * Dumps current DB state → seed.sql
 *
 * Usage:
 *   node snapshot.js              → overwrites seed.sql
 *   node snapshot.js --backup     → writes seed.YYYY-MM-DD-HH-MM.sql too
 *   node snapshot.js --dry-run    → prints to console, doesn't write
 */

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "problems.db");
const SEED_PATH = path.join(__dirname, "seed.sql");

function snapshot({ dryRun = false, backup = false } = {}) {
  if (!fs.existsSync(DB_PATH)) {
    console.error("❌ problems.db not found. Run the server first.");
    process.exit(1);
  }

  const db = new Database(DB_PATH);
  db.pragma("foreign_keys = ON");

  const lines = [];

  lines.push("-- ============================================================");
  lines.push("-- SEED SNAPSHOT");
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push("-- DO NOT EDIT MANUALLY unless you know what you're doing.");
  lines.push("-- To regenerate: node snapshot.js");
  lines.push("-- ============================================================");
  lines.push("");

  // ── Sheets ──────────────────────────────────────────────────

  const sheets = db.prepare("SELECT * FROM sheets ORDER BY id").all();

  if (sheets.length) {
    lines.push("-- SHEETS");

    sheets.forEach((s) => {
      lines.push(
        `INSERT INTO sheets (id, name, description) VALUES (${s.id}, ${q(s.name)}, ${q(s.description)});`,
      );
    });

    lines.push("");
  }

  // ── Phases ──────────────────────────────────────────────────

  const phases = db
    .prepare("SELECT * FROM phases ORDER BY sheet_id, order_idx")
    .all();

  if (phases.length) {
    lines.push("-- PHASES");

    phases.forEach((p) => {
      lines.push(
        `INSERT INTO phases (id, sheet_id, title, badge, badge_type, order_idx) VALUES (${p.id}, ${p.sheet_id}, ${q(p.title)}, ${q(p.badge)}, ${q(p.badge_type)}, ${p.order_idx});`,
      );
    });

    lines.push("");
  }

  // ── Sections ────────────────────────────────────────────────

  const sections = db
    .prepare("SELECT * FROM sections ORDER BY phase_id, order_idx")
    .all();

  if (sections.length) {
    lines.push("-- SECTIONS");

    sections.forEach((s) => {
      lines.push(
        `INSERT INTO sections (id, phase_id, title, tag, tag_type, order_idx) VALUES (${s.id}, ${s.phase_id}, ${q(s.title)}, ${q(s.tag)}, ${q(s.tag_type)}, ${s.order_idx});`,
      );
    });

    lines.push("");
  }

  // ── Problems ────────────────────────────────────────────────

  const problems = db.prepare("SELECT * FROM problems ORDER BY id").all();

  if (problems.length) {
    lines.push("-- PROBLEMS");

    problems.forEach((p) => {
      lines.push(
        `INSERT INTO problems (id, name, difficulty, url, platform, notes) VALUES (${p.id}, ${q(p.name)}, ${q(p.difficulty)}, ${q(p.url)}, ${q(p.platform)}, ${q(p.notes)});`,
      );
    });

    lines.push("");
  }

  // ── Sheet Problems ──────────────────────────────────────────

  const sp = db
    .prepare("SELECT * FROM sheet_problems ORDER BY section_id, order_idx")
    .all();

  if (sp.length) {
    lines.push("-- SHEET_PROBLEMS (links + progress)");

    sp.forEach((r) => {
      lines.push(
        `INSERT INTO sheet_problems (id, section_id, problem_id, priority, order_idx, done, solved_at) VALUES (${r.id}, ${r.section_id}, ${r.problem_id}, ${r.priority}, ${r.order_idx}, ${r.done}, ${q(r.solved_at)});`,
      );
    });

    lines.push("");
  }

  db.close();

  const output = lines.join("\n");

  if (dryRun) {
    console.log(output);
    console.log("\n[dry-run] Nothing written.");
    return;
  }

  // Write seed.sql
  fs.writeFileSync(SEED_PATH, output, "utf8");

  console.log(
    `✅ seed.sql updated (${problems.length} problems, ${sp.length} links)`,
  );

  // Optional backup
  if (backup) {
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 16);

    const backupPath = path.join(__dirname, `seed.${ts}.sql`);

    fs.writeFileSync(backupPath, output, "utf8");

    console.log(`📦 Backup written: seed.${ts}.sql`);
  }
}

// ── SQL string escape ─────────────────────────────────────────

function q(val) {
  if (val === null || val === undefined) {
    return "NULL";
  }

  return `'${String(val).replace(/'/g, "''")}'`;
}

// ── CLI ───────────────────────────────────────────────────────

const isMainModule =
  process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isMainModule) {
  const args = process.argv.slice(2);

  snapshot({
    dryRun: args.includes("--dry-run"),
    backup: args.includes("--backup"),
  });
}

export default snapshot;
