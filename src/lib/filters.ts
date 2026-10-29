import type {
  LinkedProblem,
  PhaseWithSections,
  SectionWithProblems,
} from "@/types/domain";

export type FilterKey = "all" | "pending" | "done" | "p1" | "p2" | "p3";

export const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "done", label: "Done" },
  { key: "p1", label: "Priority 1" },
  { key: "p2", label: "Priority 2" },
  { key: "p3", label: "Priority 3" },
];

const PREDICATES: Record<FilterKey, (item: LinkedProblem) => boolean> = {
  all: () => true,
  pending: (item) => !item.done,
  done: (item) => item.done,
  p1: (item) => item.priority === 1,
  p2: (item) => item.priority === 2,
  p3: (item) => item.priority === 3,
};

export function matchesFilter(item: LinkedProblem, filter: FilterKey): boolean {
  return PREDICATES[filter](item);
}

/** Sections of a phase that still have at least one problem after filtering. */
export function visibleSections(
  phase: PhaseWithSections<SectionWithProblems>,
  filter: FilterKey,
): SectionWithProblems[] {
  return phase.sections
    .map((section) => ({
      ...section,
      problems: section.problems.filter((item) => matchesFilter(item, filter)),
    }))
    .filter((section) => section.problems.length > 0);
}
