import type {
  LinkedProblem,
  PhaseWithSections,
  SectionWithProblems,
  SheetTree,
} from "@/types/domain";

export interface Progress {
  done: number;
  total: number;
  /** 0–100, rounded. */
  percent: number;
}

export function toProgress(done: number, total: number): Progress {
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function countProgress(problems: LinkedProblem[]): Progress {
  return toProgress(problems.filter((p) => p.done).length, problems.length);
}

export function phaseProblems(
  phase: PhaseWithSections<SectionWithProblems>,
): LinkedProblem[] {
  return phase.sections.flatMap((section) => section.problems);
}

export function sheetProblems(sheet: SheetTree): LinkedProblem[] {
  return sheet.phases.flatMap(phaseProblems);
}

export interface SheetStats {
  overall: Progress;
  priority1: Progress;
  remaining: number;
}

export function getSheetStats(sheet: SheetTree): SheetStats {
  const all = sheetProblems(sheet);
  const overall = countProgress(all);
  return {
    overall,
    priority1: countProgress(all.filter((p) => p.priority === 1)),
    remaining: overall.total - overall.done,
  };
}
