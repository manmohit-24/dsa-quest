import "server-only";
import { getDb } from "@/server/db";
import type { Section, SectionInput } from "@/types/domain";

export const SECTION_COLUMNS = `
  id,
  phase_id AS phaseId,
  title,
  tag,
  tag_type AS tagType,
  order_idx AS orderIdx
`;

export function listSections(phaseId: number): Section[] {
  return getDb()
    .prepare(
      `SELECT ${SECTION_COLUMNS} FROM sections WHERE phase_id = ? ORDER BY order_idx`,
    )
    .all(phaseId) as Section[];
}

/** Appended after the phase's existing sections. */
export function createSection(input: SectionInput): number {
  const db = getDb();
  const { next } = db
    .prepare(
      "SELECT COALESCE(MAX(order_idx), 0) + 1 AS next FROM sections WHERE phase_id = ?",
    )
    .get(input.phaseId) as { next: number };

  const result = db
    .prepare(
      `INSERT INTO sections (phase_id, title, tag, tag_type, order_idx)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(input.phaseId, input.title, input.tag, input.tagType, next);
  return Number(result.lastInsertRowid);
}

export function updateSection(
  id: number,
  input: Omit<SectionInput, "phaseId">,
): void {
  getDb()
    .prepare(
      "UPDATE sections SET title = ?, tag = ?, tag_type = ? WHERE id = ?",
    )
    .run(input.title, input.tag, input.tagType, id);
}

/** Cascades to the section's links. Problems stay in the global pool. */
export function deleteSection(id: number): void {
  getDb().prepare("DELETE FROM sections WHERE id = ?").run(id);
}
