import type {
  BadgeType,
  Difficulty,
  Platform,
  Priority,
  TagType,
} from "@/lib/constants";

/* ── Entities (what the repositories return) ─────────────────── */

export interface Sheet {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface Phase {
  id: number;
  sheetId: number;
  title: string;
  badge: string | null;
  badgeType: BadgeType | null;
  orderIdx: number;
}

export interface Section {
  id: number;
  phaseId: number;
  title: string;
  tag: string | null;
  tagType: TagType | null;
  orderIdx: number;
}

/** A problem in the global pool — exists once, independent of any sheet. */
export interface Problem {
  id: number;
  name: string;
  difficulty: Difficulty | null;
  url: string | null;
  platform: Platform | null;
  notes: string | null;
  createdAt: string;
}

/**
 * A problem placed in a section of a sheet (a `sheet_problems` row).
 * Priority and progress live here, so the same problem in two sheets
 * has independent checkboxes.
 */
export interface LinkedProblem {
  /** `sheet_problems.id` — the id used for toggling / re-prioritising / unlinking. */
  id: number;
  sectionId: number;
  priority: Priority;
  orderIdx: number;
  done: boolean;
  solvedAt: string | null;
  problem: Problem;
}

/* ── Trees ───────────────────────────────────────────────────── */

export interface SectionWithProblems extends Section {
  problems: LinkedProblem[];
}

export interface PhaseWithSections<S extends Section = Section> extends Phase {
  sections: S[];
}

/** A sheet with everything needed to render the tracker. */
export interface SheetTree extends Sheet {
  phases: PhaseWithSections<SectionWithProblems>[];
}

/** A sheet's skeleton (no problems) — used by the admin pickers and tree. */
export interface SheetStructure extends Sheet {
  phases: PhaseWithSections[];
}

/* ── Write inputs ────────────────────────────────────────────── */

export interface SheetInput {
  name: string;
  description: string;
}

export interface PhaseInput {
  sheetId: number;
  title: string;
  badge: string;
  badgeType: BadgeType;
}

export interface SectionInput {
  phaseId: number;
  title: string;
  tag: string;
  tagType: TagType;
}

export interface ProblemInput {
  name: string;
  difficulty: Difficulty;
  platform: Platform;
  url: string;
  notes: string;
}

export interface LinkInput {
  sectionId: number;
  problemId: number;
  priority: Priority;
}
