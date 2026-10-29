import "server-only";
import { getDb } from "@/server/db";
import type { Phase, PhaseInput } from "@/types/domain";

export const PHASE_COLUMNS = `
  id,
  sheet_id AS sheetId,
  title,
  badge,
  badge_type AS badgeType,
  order_idx AS orderIdx
`;

export function listPhases(sheetId: number): Phase[] {
  return getDb()
    .prepare(
      `SELECT ${PHASE_COLUMNS} FROM phases WHERE sheet_id = ? ORDER BY order_idx`,
    )
    .all(sheetId) as Phase[];
}

/** Appended after the sheet's existing phases. */
export function createPhase(input: PhaseInput): number {
  const db = getDb();
  const { next } = db
    .prepare(
      "SELECT COALESCE(MAX(order_idx), 0) + 1 AS next FROM phases WHERE sheet_id = ?",
    )
    .get(input.sheetId) as { next: number };

  const result = db
    .prepare(
      `INSERT INTO phases (sheet_id, title, badge, badge_type, order_idx)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(input.sheetId, input.title, input.badge, input.badgeType, next);
  return Number(result.lastInsertRowid);
}

export function updatePhase(
  id: number,
  input: Omit<PhaseInput, "sheetId">,
): void {
  getDb()
    .prepare(
      "UPDATE phases SET title = ?, badge = ?, badge_type = ? WHERE id = ?",
    )
    .run(input.title, input.badge, input.badgeType, id);
}

export function deletePhase(id: number): void {
  getDb().prepare("DELETE FROM phases WHERE id = ?").run(id);
}
