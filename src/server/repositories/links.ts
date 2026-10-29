import "server-only";
import { getDb } from "@/server/db";
import type { Priority } from "@/lib/constants";
import type { LinkedProblem, LinkInput, Problem } from "@/types/domain";

/**
 * A "link" is a `sheet_problems` row: one problem placed in one section,
 * carrying its own priority and done-state.
 */

export const LINKED_PROBLEM_SELECT = `
  SELECT
    sp.id,
    sp.section_id AS sectionId,
    sp.priority,
    sp.order_idx AS orderIdx,
    sp.done,
    sp.solved_at AS solvedAt,
    p.id AS problemId,
    p.name,
    p.difficulty,
    p.url,
    p.platform,
    p.notes,
    p.created_at AS problemCreatedAt
  FROM sheet_problems sp
  JOIN problems p ON p.id = sp.problem_id
`;

export interface LinkedProblemRow {
  id: number;
  sectionId: number;
  priority: Priority;
  orderIdx: number;
  done: number;
  solvedAt: string | null;
  problemId: number;
  name: string;
  difficulty: Problem["difficulty"];
  url: string | null;
  platform: Problem["platform"];
  notes: string | null;
  problemCreatedAt: string;
}

export function mapLinkedProblem(row: LinkedProblemRow): LinkedProblem {
  return {
    id: row.id,
    sectionId: row.sectionId,
    priority: row.priority,
    orderIdx: row.orderIdx,
    done: row.done === 1,
    solvedAt: row.solvedAt,
    problem: {
      id: row.problemId,
      name: row.name,
      difficulty: row.difficulty,
      url: row.url,
      platform: row.platform,
      notes: row.notes,
      createdAt: row.problemCreatedAt,
    },
  };
}

export function listSectionProblems(sectionId: number): LinkedProblem[] {
  const rows = getDb()
    .prepare(
      `${LINKED_PROBLEM_SELECT} WHERE sp.section_id = ? ORDER BY sp.order_idx`,
    )
    .all(sectionId) as LinkedProblemRow[];
  return rows.map(mapLinkedProblem);
}

/** Returns the new link id, or `null` if the problem is already in that section. */
export function linkProblem(input: LinkInput): number | null {
  const db = getDb();
  const { next } = db
    .prepare(
      "SELECT COALESCE(MAX(order_idx), 0) + 1 AS next FROM sheet_problems WHERE section_id = ?",
    )
    .get(input.sectionId) as { next: number };

  const result = db
    .prepare(
      `INSERT INTO sheet_problems (section_id, problem_id, priority, order_idx)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (section_id, problem_id) DO NOTHING`,
    )
    .run(input.sectionId, input.problemId, input.priority, next);

  return result.changes === 0 ? null : Number(result.lastInsertRowid);
}

export function updateLinkPriority(linkId: number, priority: Priority): void {
  getDb()
    .prepare("UPDATE sheet_problems SET priority = ? WHERE id = ?")
    .run(priority, linkId);
}

export function unlinkProblem(linkId: number): void {
  getDb().prepare("DELETE FROM sheet_problems WHERE id = ?").run(linkId);
}

export function setLinkDone(linkId: number, done: boolean): void {
  getDb()
    .prepare("UPDATE sheet_problems SET done = ?, solved_at = ? WHERE id = ?")
    .run(done ? 1 : 0, done ? new Date().toISOString() : null, linkId);
}
