import type { SheetTree } from "@/types/domain";

/** Immutably flip one problem's `done` flag — used for optimistic updates. */
export function setProblemDone(
  sheet: SheetTree,
  linkId: number,
  done: boolean,
): SheetTree {
  return {
    ...sheet,
    phases: sheet.phases.map((phase) => ({
      ...phase,
      sections: phase.sections.map((section) => ({
        ...section,
        problems: section.problems.map((item) =>
          item.id === linkId
            ? {
                ...item,
                done,
                solvedAt: done ? new Date().toISOString() : null,
              }
            : item,
        ),
      })),
    })),
  };
}
