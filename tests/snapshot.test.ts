import fs from "node:fs";
import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { getDb } from "@/server/db";
import { SCHEMA_PATH, SEED_PATH } from "@/server/db/paths";
import { buildSnapshot, writeSnapshot } from "@/server/db/snapshot";

describe("snapshot", () => {
  it("exports SQL that rebuilds an identical database", () => {
    const db = getDb();
    const { sql, problems, links } = buildSnapshot(db);
    expect(problems).toBeGreaterThan(0);
    expect(links).toBeGreaterThan(0);

    const copy = new Database(":memory:");
    copy.pragma("foreign_keys = ON");
    copy.exec(fs.readFileSync(SCHEMA_PATH, "utf8"));
    copy.exec(sql);

    for (const table of [
      "sheets",
      "phases",
      "sections",
      "problems",
      "sheet_problems",
    ]) {
      const count = (d: typeof copy) =>
        (d.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as { c: number })
          .c;
      expect(count(copy), table).toBe(count(db));
    }

    // Quotes survive the round-trip.
    const note = copy
      .prepare("SELECT notes FROM problems WHERE id = 2")
      .get() as { notes: string };
    expect(note.notes).toBe("it's a classic");
  });

  it("dry-run writes nothing; a real run writes seed.sql and an optional backup", () => {
    const db = getDb();
    const before = fs.readFileSync(SEED_PATH, "utf8");

    expect(writeSnapshot(db, { dryRun: true }).written).toBe(false);
    expect(fs.readFileSync(SEED_PATH, "utf8")).toBe(before);

    const result = writeSnapshot(db, { backup: true });
    expect(result.written).toBe(true);
    expect(fs.readFileSync(SEED_PATH, "utf8")).toContain("-- SEED SNAPSHOT");
    expect(result.backupPath && fs.existsSync(result.backupPath)).toBe(true);
  });
});
