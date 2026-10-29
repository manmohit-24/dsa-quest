import { describe, expect, it } from "vitest";
import * as links from "@/server/repositories/links";
import * as phases from "@/server/repositories/phases";
import * as problems from "@/server/repositories/problems";
import * as sections from "@/server/repositories/sections";
import { getSheetTree, getStructure } from "@/server/repositories/sheet-tree";
import * as sheets from "@/server/repositories/sheets";

describe("seeded database", () => {
  it("builds the full sheet tree in the right order", () => {
    const tree = getSheetTree(1)!;
    expect(tree.name).toBe("Test Sheet");
    expect(tree.phases).toHaveLength(1);

    const [arrays, trees] = tree.phases[0]!.sections;
    expect(arrays!.title).toBe("Arrays");
    expect(arrays!.problems.map((p) => p.problem.name)).toEqual([
      "Two Sum",
      "Three Sum",
    ]);
    expect(trees!.problems.map((p) => p.problem.name)).toEqual(["Two Sum"]);
  });

  it("maps booleans and camelCase fields", () => {
    const [first, second] = getSheetTree(1)!.phases[0]!.sections[0]!.problems;
    expect(first).toMatchObject({
      id: 1,
      done: false,
      priority: 1,
      solvedAt: null,
    });
    expect(second).toMatchObject({
      id: 2,
      done: true,
      solvedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(second!.problem.notes).toBe("it's a classic");
  });

  it("returns null for an unknown sheet", () => {
    expect(getSheetTree(9999)).toBeNull();
  });

  it("returns the skeleton for pickers", () => {
    const [sheet] = getStructure();
    expect(sheet!.phases[0]!.sections.map((s) => s.title)).toEqual([
      "Arrays",
      "Trees",
    ]);
  });
});

describe("sheets / phases / sections", () => {
  it("appends phases and sections after the existing ones", () => {
    const sheetId = sheets.createSheet({
      name: "Order Sheet",
      description: "",
    });
    const p1 = phases.createPhase({
      sheetId,
      title: "One",
      badge: "",
      badgeType: "accent",
    });
    const p2 = phases.createPhase({
      sheetId,
      title: "Two",
      badge: "b",
      badgeType: "danger",
    });
    expect(phases.listPhases(sheetId).map((p) => [p.id, p.orderIdx])).toEqual([
      [p1, 1],
      [p2, 2],
    ]);

    sections.createSection({
      phaseId: p1,
      title: "A",
      tag: "",
      tagType: "imp",
    });
    sections.createSection({
      phaseId: p1,
      title: "B",
      tag: "",
      tagType: "ext",
    });
    expect(sections.listSections(p1).map((s) => [s.title, s.orderIdx])).toEqual(
      [
        ["A", 1],
        ["B", 2],
      ],
    );
  });

  it("updates phases and sections", () => {
    const sheetId = sheets.createSheet({ name: "Edit Sheet", description: "" });
    const phaseId = phases.createPhase({
      sheetId,
      title: "Old",
      badge: "",
      badgeType: "accent",
    });
    phases.updatePhase(phaseId, {
      title: "New",
      badge: "Hot",
      badgeType: "danger",
    });
    expect(phases.listPhases(sheetId)[0]).toMatchObject({
      title: "New",
      badge: "Hot",
      badgeType: "danger",
    });

    const sectionId = sections.createSection({
      phaseId,
      title: "S",
      tag: "",
      tagType: "imp",
    });
    sections.updateSection(sectionId, {
      title: "S2",
      tag: "t",
      tagType: "jtg",
    });
    expect(sections.listSections(phaseId)[0]).toMatchObject({
      title: "S2",
      tag: "t",
      tagType: "jtg",
    });
  });

  it("deleting a sheet cascades but keeps problems in the global pool", () => {
    const sheetId = sheets.createSheet({ name: "Doomed", description: "" });
    const phaseId = phases.createPhase({
      sheetId,
      title: "P",
      badge: "",
      badgeType: "accent",
    });
    const sectionId = sections.createSection({
      phaseId,
      title: "S",
      tag: "",
      tagType: "imp",
    });
    const problemId = problems.createProblem({
      name: "Survivor",
      difficulty: "easy",
      platform: "custom",
      url: "",
      notes: "",
    });
    const linkId = links.linkProblem({ sectionId, problemId, priority: 2 })!;

    sheets.deleteSheet(sheetId);

    expect(phases.listPhases(sheetId)).toEqual([]);
    expect(sections.listSections(phaseId)).toEqual([]);
    expect(links.listSectionProblems(sectionId)).toEqual([]);
    expect(linkId).toBeGreaterThan(0);
    expect(problems.listProblems("Survivor")).toHaveLength(1);
  });
});

describe("problems", () => {
  it("searches case-insensitively and treats % and _ literally", () => {
    expect(problems.listProblems("two sum").map((p) => p.name)).toEqual([
      "Two Sum",
    ]);
    expect(problems.listProblems("100%_").map((p) => p.name)).toEqual([
      "Unlinked 100%_Problem",
    ]);
    expect(problems.listProblems("%")).toHaveLength(1); // only the one containing a literal %
    expect(problems.listProblems("nothing-matches")).toEqual([]);
  });

  it("respects the result limit", () => {
    expect(problems.listProblems("", 2)).toHaveLength(2);
  });

  it("updates a problem", () => {
    const id = problems.createProblem({
      name: "Edit me",
      difficulty: "easy",
      platform: "gfg",
      url: "",
      notes: "",
    });
    problems.updateProblem(id, {
      name: "Edited",
      difficulty: "hard",
      platform: "codeforces",
      url: "https://codeforces.com/x",
      notes: "n",
    });
    expect(problems.listProblems("Edited")[0]).toMatchObject({
      difficulty: "hard",
      platform: "codeforces",
      url: "https://codeforces.com/x",
    });
  });

  it("deleting a problem removes its links everywhere", () => {
    const sectionId = 2;
    const problemId = problems.createProblem({
      name: "Short lived",
      difficulty: "easy",
      platform: "custom",
      url: "",
      notes: "",
    });
    links.linkProblem({ sectionId, problemId, priority: 1 });
    expect(
      links
        .listSectionProblems(sectionId)
        .some((l) => l.problem.id === problemId),
    ).toBe(true);

    problems.deleteProblem(problemId);
    expect(
      links
        .listSectionProblems(sectionId)
        .some((l) => l.problem.id === problemId),
    ).toBe(false);
  });
});

describe("links", () => {
  it("refuses to link the same problem to a section twice", () => {
    expect(
      links.linkProblem({ sectionId: 1, problemId: 1, priority: 2 }),
    ).toBeNull();
  });

  it("keeps progress independent per link", () => {
    // Problem 1 is in sections 1 and 2 — ticking one must not tick the other.
    links.setLinkDone(1, true);
    const tree = getSheetTree(1)!;
    expect(tree.phases[0]!.sections[0]!.problems[0]!.done).toBe(true);
    expect(tree.phases[0]!.sections[1]!.problems[0]!.done).toBe(false);

    links.setLinkDone(1, false);
    expect(links.listSectionProblems(1)[0]!.solvedAt).toBeNull();
  });

  it("updates priority and unlinks", () => {
    const problemId = problems.createProblem({
      name: "Linkable",
      difficulty: "easy",
      platform: "custom",
      url: "",
      notes: "",
    });
    const linkId = links.linkProblem({ sectionId: 2, problemId, priority: 3 })!;
    links.updateLinkPriority(linkId, 1);
    expect(
      links.listSectionProblems(2).find((l) => l.id === linkId)!.priority,
    ).toBe(1);

    links.unlinkProblem(linkId);
    expect(
      links.listSectionProblems(2).find((l) => l.id === linkId),
    ).toBeUndefined();
  });
});
