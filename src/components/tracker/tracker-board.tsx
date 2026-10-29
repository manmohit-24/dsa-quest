"use client";

import { useOptimistic, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { useRunAction } from "@/hooks/use-run-action";
import { visibleSections, type FilterKey } from "@/lib/filters";
import { getSheetStats } from "@/lib/progress";
import { setProblemDone } from "@/lib/sheet-tree";
import { toggleProblem } from "@/server/actions/tracker";
import type { SheetTree } from "@/types/domain";
import { FilterBar } from "./filter-bar";
import { PhaseCard } from "./phase-card";
import { StatsRow } from "./stats-row";

/**
 * The interactive part of the tracker: stats, filters and phases for one sheet.
 *
 * Ticking a problem updates the UI immediately (`useOptimistic`) while the Server Action
 * persists it; when the server responds, fresh props replace the optimistic state.
 */
export function TrackerBoard({ sheet }: { sheet: SheetTree }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [optimisticSheet, applyToggle] = useOptimistic(
    sheet,
    (current, change: { linkId: number; done: boolean }) =>
      setProblemDone(current, change.linkId, change.done),
  );
  const { run } = useRunAction();

  function handleToggle(linkId: number, done: boolean) {
    run(async () => {
      applyToggle({ linkId, done });
      return toggleProblem(linkId, done);
    });
  }

  const phases = optimisticSheet.phases
    .map((phase) => ({ phase, sections: visibleSections(phase, filter) }))
    .filter(({ sections }) => sections.length > 0);

  return (
    <>
      <StatsRow stats={getSheetStats(optimisticSheet)} />
      <FilterBar value={filter} onChange={setFilter} />

      {phases.length === 0 ? (
        <EmptyState>
          {optimisticSheet.phases.length === 0
            ? "This sheet has no phases yet."
            : "No problems match this filter."}
        </EmptyState>
      ) : (
        phases.map(({ phase, sections }) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            sections={sections}
            onToggle={handleToggle}
          />
        ))
      )}
    </>
  );
}
