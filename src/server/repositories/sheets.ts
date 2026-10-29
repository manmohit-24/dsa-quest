import "server-only";
import { getDb } from "@/server/db";
import type { Sheet, SheetInput } from "@/types/domain";

const SELECT =
  "SELECT id, name, description, created_at AS createdAt FROM sheets";

export function listSheets(): Sheet[] {
  return getDb().prepare(`${SELECT} ORDER BY id`).all() as Sheet[];
}

export function createSheet(input: SheetInput): number {
  const result = getDb()
    .prepare("INSERT INTO sheets (name, description) VALUES (?, ?)")
    .run(input.name, input.description);
  return Number(result.lastInsertRowid);
}

export function updateSheet(id: number, input: SheetInput): void {
  getDb()
    .prepare("UPDATE sheets SET name = ?, description = ? WHERE id = ?")
    .run(input.name, input.description, id);
}

/** Cascades to phases, sections and links. Problems stay in the global pool. */
export function deleteSheet(id: number): void {
  getDb().prepare("DELETE FROM sheets WHERE id = ?").run(id);
}
