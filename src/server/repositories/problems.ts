import "server-only";
import { getDb } from "@/server/db";
import type { Problem, ProblemInput } from "@/types/domain";

export const PROBLEM_COLUMNS = `
  id,
  name,
  difficulty,
  url,
  platform,
  notes,
  created_at AS createdAt
`;

/** Escape `%`, `_` and `\` so user input is matched literally by LIKE. */
function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/** All problems, or those whose name contains `query` (case-insensitive). */
export function listProblems(query = "", limit?: number): Problem[] {
  const term = query.trim();
  const sql = `
    SELECT ${PROBLEM_COLUMNS} FROM problems
    ${term ? "WHERE name LIKE ? ESCAPE '\\'" : ""}
    ORDER BY name
    ${limit ? `LIMIT ${Math.floor(limit)}` : ""}
  `;
  const stmt = getDb().prepare(sql);
  return (term ? stmt.all(`%${escapeLike(term)}%`) : stmt.all()) as Problem[];
}

export function getProblem(id: number): Problem | undefined {
  return getDb()
    .prepare(`SELECT ${PROBLEM_COLUMNS} FROM problems WHERE id = ?`)
    .get(id) as Problem | undefined;
}

export function createProblem(input: ProblemInput): number {
  const result = getDb()
    .prepare(
      `INSERT INTO problems (name, difficulty, url, platform, notes)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(input.name, input.difficulty, input.url, input.platform, input.notes);
  return Number(result.lastInsertRowid);
}

export function updateProblem(id: number, input: ProblemInput): void {
  getDb()
    .prepare(
      `UPDATE problems
       SET name = ?, difficulty = ?, url = ?, platform = ?, notes = ?
       WHERE id = ?`,
    )
    .run(
      input.name,
      input.difficulty,
      input.url,
      input.platform,
      input.notes,
      id,
    );
}

/** Cascades: removes the problem from every sheet it was linked into. */
export function deleteProblem(id: number): void {
  getDb().prepare("DELETE FROM problems WHERE id = ?").run(id);
}
