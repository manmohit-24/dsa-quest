import { describe, expect, it } from "vitest";
import { matchesFilter, visibleSections } from "@/lib/filters";
import { getSheetStats, toProgress } from "@/lib/progress";
import { resolveSelection } from "@/lib/selection";
import { setProblemDone } from "@/lib/sheet-tree";
import type { LinkedProblem, SheetStructure, SheetTree } from "@/types/domain";

function link(id: number, priority: 1 | 2 | 3, done: boolean): LinkedProblem {
  return {
    id,
    sectionId: 1,
    priority,
    orderIdx: id,
    done,
    solvedAt: null,
    problem: {
      id,
      name: `P${id}`,
      difficulty: "easy",
      url: null,
      platform: "leetcode",
      notes: null,
      createdAt: "",
    },
  };
}

const sheet: SheetTree = {
  id: 1,
  name: "S",
  description: null,
  createdAt: "",
  phases: [
    {
      id: 1,
      sheetId: 1,
      title: "Ph",
      badge: null,
      badgeType: null,
      orderIdx: 1,
      sections: [
        {
          id: 1,
          phaseId: 1,
          title: "A",
          tag: null,
          tagType: null,
          orderIdx: 1,
          problems: [link(1, 1, true), link(2, 1, false), link(3, 2, false)],
        },
        {
          id: 2,
          phaseId: 1,
          title: "Empty",
          tag: null,
          tagType: null,
          orderIdx: 2,
          problems: [],
        },
      ],
    },
  ],
};

describe("progress", () => {
  it("rounds percentages and handles empty totals", () => {
    expect(toProgress(1, 3)).toEqual({ done: 1, total: 3, percent: 33 });
    expect(toProgress(0, 0).percent).toBe(0);
  });

  it("computes sheet stats", () => {
    const stats = getSheetStats(sheet);
    expect(stats.overall).toMatchObject({ done: 1, total: 3 });
    expect(stats.priority1).toMatchObject({ done: 1, total: 2 });
    expect(stats.remaining).toBe(2);
  });
});

describe("filters", () => {
  const items = [link(1, 1, true), link(2, 2, false)];

  it("matches each filter", () => {
    expect(items.filter((i) => matchesFilter(i, "all"))).toHaveLength(2);
    expect(
      items.filter((i) => matchesFilter(i, "done")).map((i) => i.id),
    ).toEqual([1]);
    expect(
      items.filter((i) => matchesFilter(i, "pending")).map((i) => i.id),
    ).toEqual([2]);
    expect(
      items.filter((i) => matchesFilter(i, "p2")).map((i) => i.id),
    ).toEqual([2]);
  });

  it("drops sections that end up empty", () => {
    const phase = sheet.phases[0]!;
    expect(visibleSections(phase, "all").map((s) => s.id)).toEqual([1]);
    expect(visibleSections(phase, "p3")).toEqual([]);
  });
});

describe("setProblemDone", () => {
  it("flips one problem without mutating the original", () => {
    const next = setProblemDone(sheet, 2, true);
    expect(next.phases[0]!.sections[0]!.problems[1]!.done).toBe(true);
    expect(next.phases[0]!.sections[0]!.problems[1]!.solvedAt).not.toBeNull();
    expect(sheet.phases[0]!.sections[0]!.problems[1]!.done).toBe(false);
  });
});

describe("resolveSelection", () => {
  const structure: SheetStructure[] = [
    {
      id: 1,
      name: "A",
      description: null,
      createdAt: "",
      phases: [
        {
          id: 10,
          sheetId: 1,
          title: "P",
          badge: null,
          badgeType: null,
          orderIdx: 1,
          sections: [
            {
              id: 100,
              phaseId: 10,
              title: "S1",
              tag: null,
              tagType: null,
              orderIdx: 1,
            },
            {
              id: 101,
              phaseId: 10,
              title: "S2",
              tag: null,
              tagType: null,
              orderIdx: 2,
            },
          ],
        },
      ],
    },
    { id: 2, name: "B", description: null, createdAt: "", phases: [] },
  ];

  it("falls back to the first item at every level", () => {
    const sel = resolveSelection(structure, {});
    expect([sel.sheet?.id, sel.phase?.id, sel.section?.id]).toEqual([
      1, 10, 100,
    ]);
  });

  it("honours valid params and ignores stale ones", () => {
    expect(resolveSelection(structure, { section: 101 }).section?.id).toBe(101);
    expect(
      resolveSelection(structure, { sheet: 999, section: 999 }).section?.id,
    ).toBe(100);
  });

  it("handles a sheet with no phases", () => {
    const sel = resolveSelection(structure, { sheet: 2 });
    expect(sel.sheet?.id).toBe(2);
    expect(sel.phase).toBeNull();
    expect(sel.section).toBeNull();
  });

  it("handles an empty structure", () => {
    expect(resolveSelection([], {})).toEqual({
      sheet: null,
      phase: null,
      section: null,
    });
  });
});
