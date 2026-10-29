import { DifficultyBadge, PlatformBadge } from "@/components/domain/badges";
import { DeleteButton } from "@/components/ui/delete-button";
import { EditParamButton } from "@/components/ui/param-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow, RowActions } from "@/components/ui/list-row";
import { deleteProblem } from "@/server/actions/problems";
import type { Problem } from "@/types/domain";

export function ProblemList({ problems }: { problems: Problem[] }) {
  if (problems.length === 0) return <EmptyState>No problems found.</EmptyState>;

  return (
    <div>
      {problems.map((problem) => (
        <ListRow key={problem.id}>
          <div className="flex flex-1 flex-wrap items-center gap-2 text-sm">
            {problem.name}
            <DifficultyBadge difficulty={problem.difficulty} />
            <PlatformBadge platform={problem.platform} />
            {problem.url && (
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${problem.name}`}
                className="text-xs text-accent no-underline hover:underline"
              >
                ↗
              </a>
            )}
          </div>
          <RowActions>
            <EditParamButton id={problem.id} />
            <DeleteButton
              action={deleteProblem}
              id={problem.id}
              successMessage="Problem deleted"
              confirmMessage="Delete this problem globally? It will be removed from all sheets."
            />
          </RowActions>
        </ListRow>
      ))}
    </div>
  );
}
