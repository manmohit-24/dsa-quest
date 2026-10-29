import "server-only";
import { getDb } from "@/server/db";
import type {
  Phase,
  PhaseWithSections,
  Section,
  SectionWithProblems,
  Sheet,
  SheetStructure,
  SheetTree,
} from "@/types/domain";
import {
  LINKED_PROBLEM_SELECT,
  mapLinkedProblem,
  type LinkedProblemRow,
} from "./links";
import { PHASE_COLUMNS } from "./phases";
import { SECTION_COLUMNS } from "./sections";

/** Group `items` by a numeric key, preserving their (already sorted) order. */
function groupBy<T>(items: T[], key: (item: T) => number): Map<number, T[]> {
  const groups = new Map<number, T[]>();
  for (const item of items) {
    const k = key(item);
    const bucket = groups.get(k);
    if (bucket) bucket.push(item);
    else groups.set(k, [item]);
  }
  return groups;
}

/**
 * Everything the tracker needs for one sheet — phases → sections → problems —
 * in three queries (the original fired one per phase and one per section).
 */
export function getSheetTree(sheetId: number): SheetTree | null {
  const db = getDb();

  const sheet = db
    .prepare(
      "SELECT id, name, description, created_at AS createdAt FROM sheets WHERE id = ?",
    )
    .get(sheetId) as Sheet | undefined;
  if (!sheet) return null;

  const phases = db
    .prepare(
      `SELECT ${PHASE_COLUMNS} FROM phases WHERE sheet_id = ? ORDER BY order_idx`,
    )
    .all(sheetId) as Phase[];

  const sections = db
    .prepare(
      `SELECT ${SECTION_COLUMNS} FROM sections
       WHERE phase_id IN (SELECT id FROM phases WHERE sheet_id = ?)
       ORDER BY order_idx`,
    )
    .all(sheetId) as Section[];

  const linkRows = db
    .prepare(
      `${LINKED_PROBLEM_SELECT}
       JOIN sections s ON s.id = sp.section_id
       JOIN phases ph ON ph.id = s.phase_id
       WHERE ph.sheet_id = ?
       ORDER BY sp.order_idx`,
    )
    .all(sheetId) as LinkedProblemRow[];

  const problemsBySection = groupBy(
    linkRows.map(mapLinkedProblem),
    (item) => item.sectionId,
  );
  const sectionsByPhase = groupBy(sections, (section) => section.phaseId);

  return {
    ...sheet,
    phases: phases.map((phase): PhaseWithSections<SectionWithProblems> => ({
      ...phase,
      sections: (sectionsByPhase.get(phase.id) ?? []).map((section) => ({
        ...section,
        problems: problemsBySection.get(section.id) ?? [],
      })),
    })),
  };
}

/** Every sheet's skeleton (sheet → phases → sections, no problems), for pickers and trees. */
export function getStructure(): SheetStructure[] {
  const db = getDb();

  const sheets = db
    .prepare(
      "SELECT id, name, description, created_at AS createdAt FROM sheets ORDER BY id",
    )
    .all() as Sheet[];
  const phases = db
    .prepare(`SELECT ${PHASE_COLUMNS} FROM phases ORDER BY order_idx`)
    .all() as Phase[];
  const sections = db
    .prepare(`SELECT ${SECTION_COLUMNS} FROM sections ORDER BY order_idx`)
    .all() as Section[];

  const sectionsByPhase = groupBy(sections, (section) => section.phaseId);
  const phasesBySheet = groupBy(phases, (phase) => phase.sheetId);

  return sheets.map((sheet) => ({
    ...sheet,
    phases: (phasesBySheet.get(sheet.id) ?? []).map((phase) => ({
      ...phase,
      sections: sectionsByPhase.get(phase.id) ?? [],
    })),
  }));
}
