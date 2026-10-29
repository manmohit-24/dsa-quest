import { DifficultyBadge, PlatformBadge } from "@/components/domain/badges";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { EmptyState } from "@/components/ui/empty-state";
import type { Priority } from "@/lib/constants";
import { linkProblem } from "@/server/actions/links";
import type { Problem } from "@/types/domain";

interface LinkSearchResultsProps {
  query: string;
  results: Problem[];
  sectionId: number;
  priority: Priority;
  /** Problem ids already in this section — shown as "Linked" instead of an Add button. */
  linkedProblemIds: Set<number>;
}

export function LinkSearchResults({
  query,
  results,
  sectionId,
  priority,
  linkedProblemIds,
}: LinkSearchResultsProps) {
  if (!query) return null;
  if (results.length === 0) return <EmptyState>No problems found.</EmptyState>;

  return (
    <div>
      {results.map((problem) => (
        <div
          key={problem.id}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-surface-strong"
        >
          <span className="flex-1 text-sm">{problem.name}</span>
          <DifficultyBadge difficulty={problem.difficulty} />
          <PlatformBadge platform={problem.platform} />

          {linkedProblemIds.has(problem.id) ? (
            <span className="w-[52px] text-right text-xs text-subtle">
              Linked
            </span>
          ) : (
            <ActionForm
              action={linkProblem}
              successMessage="Problem linked ✓"
              layout="stack"
            >
              <input type="hidden" name="sectionId" value={sectionId} />
              <input type="hidden" name="problemId" value={problem.id} />
              <input type="hidden" name="priority" value={priority} />
              <SubmitButton variant="secondary">+ Add</SubmitButton>
            </ActionForm>
          )}
        </div>
      ))}
    </div>
  );
}
