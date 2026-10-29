// @vitest-environment jsdom
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SheetTree } from "@/types/domain";

const { toggleProblem } = vi.hoisted(() => ({
  toggleProblem: vi.fn(async () => ({ ok: true }) as const),
}));
vi.mock("@/server/actions/tracker", () => ({ toggleProblem }));

import { TrackerBoard } from "@/components/tracker/tracker-board";

function item(
  id: number,
  name: string,
  priority: 1 | 2 | 3,
  done: boolean,
  sectionId: number,
) {
  return {
    id,
    sectionId,
    priority,
    orderIdx: id,
    done,
    solvedAt: null,
    problem: {
      id,
      name,
      difficulty: "easy" as const,
      url: id === 1 ? "https://example.com/1" : null,
      platform: "leetcode" as const,
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
      title: "Phase One",
      badge: "Core",
      badgeType: "danger",
      orderIdx: 1,
      sections: [
        {
          id: 1,
          phaseId: 1,
          title: "Arrays",
          tag: null,
          tagType: null,
          orderIdx: 1,
          problems: [
            item(1, "Two Sum", 1, false, 1),
            item(2, "Three Sum", 2, true, 1),
          ],
        },
      ],
    },
    {
      id: 2,
      sheetId: 1,
      title: "Phase Two",
      badge: null,
      badgeType: null,
      orderIdx: 2,
      sections: [
        {
          id: 2,
          phaseId: 2,
          title: "Trees",
          tag: null,
          tagType: null,
          orderIdx: 1,
          problems: [item(3, "Invert Tree", 3, false, 2)],
        },
      ],
    },
  ],
};

beforeEach(() => toggleProblem.mockClear());
afterEach(cleanup);

describe("<TrackerBoard />", () => {
  it("shows stats, phases and problems", () => {
    render(<TrackerBoard sheet={sheet} />);
    expect(screen.getByText("1/3")).toBeTruthy(); // problems done
    expect(screen.getByText("33%")).toBeTruthy();
    expect(screen.getByText("Phase One")).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: /Two Sum/ })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Open ↗" }).getAttribute("href"),
    ).toBe("https://example.com/1");
  });

  it("ticks optimistically (before the server responds) and calls the Server Action", async () => {
    // Hold the action open so we can observe the optimistic state.
    let release: () => void = () => {};
    toggleProblem.mockImplementationOnce(
      () =>
        new Promise(
          (resolve) => (release = () => resolve({ ok: true } as const)),
        ),
    );

    const user = userEvent.setup();
    render(<TrackerBoard sheet={sheet} />);

    const box = screen.getByRole("checkbox", {
      name: /Two Sum/,
    }) as HTMLInputElement;
    expect(box.checked).toBe(false);
    await user.click(box);

    await waitFor(() => expect(toggleProblem).toHaveBeenCalledWith(1, true));
    expect(screen.getByText("2/3")).toBeTruthy(); // stats updated immediately
    expect(
      (screen.getByRole("checkbox", { name: /Two Sum/ }) as HTMLInputElement)
        .checked,
    ).toBe(true);

    release();
  });

  it("clicking the row label (not just the box) toggles, but the link does not", async () => {
    const user = userEvent.setup();
    render(<TrackerBoard sheet={sheet} />);

    await user.click(screen.getByText("Invert Tree"));
    await waitFor(() => expect(toggleProblem).toHaveBeenCalledWith(3, true));

    toggleProblem.mockClear();
    const link = screen.getByRole("link", { name: "Open ↗" });
    link.addEventListener("click", (e) => e.preventDefault()); // don't navigate in jsdom
    await user.click(link);
    expect(toggleProblem).not.toHaveBeenCalled();
  });

  it("filters by status and priority, hiding empty phases", async () => {
    const user = userEvent.setup();
    render(<TrackerBoard sheet={sheet} />);

    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByText("Two Sum")).toBeNull();
    expect(screen.getByText("Three Sum")).toBeTruthy();
    expect(screen.queryByText("Phase Two")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Priority 3" }));
    expect(screen.getByText("Phase Two")).toBeTruthy();
    expect(screen.queryByText("Phase One")).toBeNull();
  });

  it("keeps a phase's progress based on all problems even while filtered", async () => {
    const user = userEvent.setup();
    render(<TrackerBoard sheet={sheet} />);
    await user.click(screen.getByRole("button", { name: "Pending" }));
    const header = screen.getByRole("button", { name: /Phase One/ });
    expect(within(header).getByText("1/2")).toBeTruthy();
  });

  it("collapses and expands a phase, and keeps it collapsed after ticking something else", async () => {
    const user = userEvent.setup();
    render(<TrackerBoard sheet={sheet} />);

    await user.click(screen.getByRole("button", { name: /Phase One/ }));
    expect(screen.queryByText("Two Sum")).toBeNull();

    await user.click(screen.getByText("Invert Tree"));
    await waitFor(() => expect(toggleProblem).toHaveBeenCalled());
    expect(screen.queryByText("Two Sum")).toBeNull(); // the original re-opened every phase here
  });

  it("explains an empty filter result", async () => {
    const user = userEvent.setup();
    render(<TrackerBoard sheet={{ ...sheet, phases: [] }} />);
    expect(screen.getByText("This sheet has no phases yet.")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Done" }));
  });
});
