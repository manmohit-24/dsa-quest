import { beforeEach, describe, expect, it, vi } from "vitest";

// `refresh()` only works inside a real Server Action request.
const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/cache", () => ({ refresh }));

import {
  linkProblem,
  unlinkProblem,
  updateLinkPriority,
} from "@/server/actions/links";
import { createPhase } from "@/server/actions/phases";
import { createProblem, updateProblem } from "@/server/actions/problems";
import { createSection } from "@/server/actions/sections";
import { createSheet, deleteSheet, updateSheet } from "@/server/actions/sheets";
import { toggleProblem } from "@/server/actions/tracker";
import * as links from "@/server/repositories/links";
import * as problems from "@/server/repositories/problems";
import { getStructure } from "@/server/repositories/sheet-tree";
import * as sheets from "@/server/repositories/sheets";

function form(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) fd.set(key, value);
  return fd;
}

beforeEach(() => refresh.mockClear());

describe("sheet actions", () => {
  it("creates a sheet from FormData and refreshes the page", async () => {
    const result = await createSheet(
      form({ name: "  From form  ", description: "d" }),
    );
    expect(result).toEqual({ ok: true });
    expect(refresh).toHaveBeenCalledOnce();
    expect(
      sheets.listSheets().find((s) => s.name === "From form"),
    ).toBeDefined();
  });

  it("rejects an empty name without touching the DB or refreshing", async () => {
    const before = sheets.listSheets().length;
    const result = await createSheet(form({ name: "   " }));
    expect(result).toEqual({ ok: false, error: "Sheet name is required" });
    expect(sheets.listSheets()).toHaveLength(before);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("updates and deletes", async () => {
    await createSheet(form({ name: "Temp" }));
    const { id } = sheets.listSheets().find((s) => s.name === "Temp")!;

    expect(
      await updateSheet(
        form({ id: String(id), name: "Renamed", description: "x" }),
      ),
    ).toEqual({
      ok: true,
    });
    expect(sheets.listSheets().find((s) => s.id === id)!.name).toBe("Renamed");

    expect(await deleteSheet(id)).toEqual({ ok: true });
    expect(sheets.listSheets().find((s) => s.id === id)).toBeUndefined();
  });
});

describe("phase & section actions", () => {
  it("applies defaults for badge type / tag type", async () => {
    await createSheet(form({ name: "Defaults" }));
    const sheetId = sheets.listSheets().find((s) => s.name === "Defaults")!.id;

    expect(
      await createPhase(form({ sheetId: String(sheetId), title: "P" })),
    ).toEqual({ ok: true });
    const phase = getStructure().find((s) => s.id === sheetId)!.phases[0]!;
    expect(phase).toMatchObject({ title: "P", badge: "", badgeType: "accent" });

    expect(
      await createSection(form({ phaseId: String(phase.id), title: "S" })),
    ).toEqual({ ok: true });
    const section = getStructure().find((s) => s.id === sheetId)!.phases[0]!
      .sections[0]!;
    expect(section).toMatchObject({ title: "S", tag: "", tagType: "imp" });
  });

  it("explains missing parents instead of throwing", async () => {
    expect(await createPhase(form({ sheetId: "", title: "P" }))).toEqual({
      ok: false,
      error: "Sheet is required",
    });
    expect(await createSection(form({ phaseId: "", title: "S" }))).toEqual({
      ok: false,
      error: "Phase is required",
    });
  });

  it("reports a foreign-key failure as a generic error, not a crash", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await createPhase(
      form({ sheetId: "99999", title: "Orphan" }),
    );
    expect(result).toEqual({
      ok: false,
      error: "Something went wrong. Please try again.",
    });
    spy.mockRestore();
  });
});

describe("problem actions", () => {
  it("validates enums and URLs", async () => {
    expect(
      await createProblem(form({ name: "X", difficulty: "impossible" })).then(
        (r) => r.ok,
      ),
    ).toBe(false);

    const badUrl = await createProblem(
      form({ name: "X", url: "javascript:alert(1)" }),
    );
    expect(badUrl).toEqual({
      ok: false,
      error: "URL must start with http:// or https://",
    });
  });

  it("creates with defaults and updates", async () => {
    expect(await createProblem(form({ name: "Defaulted" }))).toEqual({
      ok: true,
    });
    const created = problems.listProblems("Defaulted")[0]!;
    expect(created).toMatchObject({
      difficulty: "medium",
      platform: "leetcode",
      url: "",
    });

    const result = await updateProblem(
      form({
        id: String(created.id),
        name: "Defaulted!",
        difficulty: "hard",
        platform: "gfg",
      }),
    );
    expect(result).toEqual({ ok: true });
    expect(problems.listProblems("Defaulted!")[0]).toMatchObject({
      difficulty: "hard",
      platform: "gfg",
    });
  });
});

describe("link actions", () => {
  it("links, rejects duplicates with a friendly message, re-prioritises and unlinks", async () => {
    await createProblem(form({ name: "Link target" }));
    const problemId = problems.listProblems("Link target")[0]!.id;
    const payload = {
      sectionId: "2",
      problemId: String(problemId),
      priority: "3",
    };

    expect(await linkProblem(form(payload))).toEqual({ ok: true });
    expect(await linkProblem(form(payload))).toEqual({
      ok: false,
      error: "Problem already in this section",
    });

    const link = links
      .listSectionProblems(2)
      .find((l) => l.problem.id === problemId)!;
    expect(link.priority).toBe(3);

    expect(await updateLinkPriority(link.id, 1)).toEqual({ ok: true });
    expect(
      links.listSectionProblems(2).find((l) => l.id === link.id)!.priority,
    ).toBe(1);

    expect(await updateLinkPriority(link.id, 7 as 1)).toMatchObject({
      ok: false,
    });

    expect(await unlinkProblem(link.id)).toEqual({ ok: true });
  });
});

describe("tracker action", () => {
  it("toggles done on and off", async () => {
    expect(await toggleProblem(3, true)).toEqual({ ok: true });
    expect(links.listSectionProblems(2).find((l) => l.id === 3)).toMatchObject({
      done: true,
    });

    expect(await toggleProblem(3, false)).toEqual({ ok: true });
    expect(links.listSectionProblems(2).find((l) => l.id === 3)).toMatchObject({
      done: false,
      solvedAt: null,
    });
  });

  it("rejects bad input", async () => {
    expect(await toggleProblem(0, true)).toMatchObject({ ok: false });
    expect(await toggleProblem(1, "yes" as unknown as boolean)).toMatchObject({
      ok: false,
    });
  });
});
