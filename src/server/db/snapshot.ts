import fs from "node:fs";
import path from "node:path";
import type { DB } from "./connection";
import { BACKUP_DIR, SEED_PATH } from "./paths";

/**
 * DB → seed.sql exporter.
 *
 * The output format is identical to the original `snapshot.js`, so existing
 * seed files keep working in both directions.
 */

export interface SnapshotOptions {
  /** Return the SQL without writing anything. */
  dryRun?: boolean;
  /** Also write a timestamped copy to `db/backups/`. */
  backup?: boolean;
}

export interface SnapshotResult {
  sql: string;
  problems: number;
  links: number;
  written: boolean;
  backupPath?: string;
}

/** Quote a value as a SQL literal. */
function q(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function selectAll<T>(db: DB, sql: string): T[] {
  return db.prepare(sql).all() as T[];
}

export function buildSnapshot(db: DB): {
  sql: string;
  problems: number;
  links: number;
} {
  const lines: string[] = [
    "-- ============================================================",
    "-- SEED SNAPSHOT",
    `-- Generated: ${new Date().toISOString()}`,
    "-- DO NOT EDIT MANUALLY unless you know what you're doing.",
    "-- To regenerate: npm run snapshot",
    "-- ============================================================",
    "",
  ];

  const sheets = selectAll<{
    id: number;
    name: string;
    description: string | null;
  }>(db, "SELECT * FROM sheets ORDER BY id");
  if (sheets.length) {
    lines.push("-- SHEETS");
    for (const s of sheets) {
      lines.push(
        `INSERT INTO sheets (id, name, description) VALUES (${s.id}, ${q(s.name)}, ${q(s.description)});`,
      );
    }
    lines.push("");
  }

  const phases = selectAll<{
    id: number;
    sheet_id: number;
    title: string;
    badge: string | null;
    badge_type: string | null;
    order_idx: number;
  }>(db, "SELECT * FROM phases ORDER BY sheet_id, order_idx");
  if (phases.length) {
    lines.push("-- PHASES");
    for (const p of phases) {
      lines.push(
        `INSERT INTO phases (id, sheet_id, title, badge, badge_type, order_idx) VALUES (${p.id}, ${p.sheet_id}, ${q(p.title)}, ${q(p.badge)}, ${q(p.badge_type)}, ${p.order_idx});`,
      );
    }
    lines.push("");
  }

  const sections = selectAll<{
    id: number;
    phase_id: number;
    title: string;
    tag: string | null;
    tag_type: string | null;
    order_idx: number;
  }>(db, "SELECT * FROM sections ORDER BY phase_id, order_idx");
  if (sections.length) {
    lines.push("-- SECTIONS");
    for (const s of sections) {
      lines.push(
        `INSERT INTO sections (id, phase_id, title, tag, tag_type, order_idx) VALUES (${s.id}, ${s.phase_id}, ${q(s.title)}, ${q(s.tag)}, ${q(s.tag_type)}, ${s.order_idx});`,
      );
    }
    lines.push("");
  }

  const problems = selectAll<{
    id: number;
    name: string;
    difficulty: string | null;
    url: string | null;
    platform: string | null;
    notes: string | null;
  }>(db, "SELECT * FROM problems ORDER BY id");
  if (problems.length) {
    lines.push("-- PROBLEMS");
    for (const p of problems) {
      lines.push(
        `INSERT INTO problems (id, name, difficulty, url, platform, notes) VALUES (${p.id}, ${q(p.name)}, ${q(p.difficulty)}, ${q(p.url)}, ${q(p.platform)}, ${q(p.notes)});`,
      );
    }
    lines.push("");
  }

  const links = selectAll<{
    id: number;
    section_id: number;
    problem_id: number;
    priority: number;
    order_idx: number;
    done: number;
    solved_at: string | null;
  }>(db, "SELECT * FROM sheet_problems ORDER BY section_id, order_idx");
  if (links.length) {
    lines.push("-- SHEET_PROBLEMS (links + progress)");
    for (const r of links) {
      lines.push(
        `INSERT INTO sheet_problems (id, section_id, problem_id, priority, order_idx, done, solved_at) VALUES (${r.id}, ${r.section_id}, ${r.problem_id}, ${r.priority}, ${r.order_idx}, ${r.done}, ${q(r.solved_at)});`,
      );
    }
    lines.push("");
  }

  return {
    sql: lines.join("\n"),
    problems: problems.length,
    links: links.length,
  };
}

export function writeSnapshot(
  db: DB,
  options: SnapshotOptions = {},
): SnapshotResult {
  const { sql, problems, links } = buildSnapshot(db);

  if (options.dryRun) {
    return { sql, problems, links, written: false };
  }

  fs.mkdirSync(path.dirname(SEED_PATH), { recursive: true });
  fs.writeFileSync(SEED_PATH, sql, "utf8");

  let backupPath: string | undefined;
  if (options.backup) {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 16);
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    backupPath = path.join(BACKUP_DIR, `seed.${timestamp}.sql`);
    fs.writeFileSync(backupPath, sql, "utf8");
  }

  return { sql, problems, links, written: true, backupPath };
}
