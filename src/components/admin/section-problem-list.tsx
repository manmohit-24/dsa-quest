import {
  DifficultyBadge,
  PlatformBadge,
  PriorityBadge,
} from "@/components/domain/badges";
import { DeleteButton } from "@/components/ui/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow, RowActions } from "@/components/ui/list-row";
import { unlinkProblem } from "@/server/actions/links";
import type { LinkedProblem } from "@/types/domain";
import { LinkPrioritySelect } from "./link-priority-select";

export function SectionProblemList({
  problems,
}: {
  problems: LinkedProblem[];
}) {
  if (problems.length === 0)
    return <EmptyState>No problems linked yet.</EmptyState>;

  return (
    <div>
      {problems.map((item) => (
        <ListRow key={item.id}>
          <div className="flex flex-1 flex-wrap items-center gap-2 text-sm">
            {item.problem.name}
            <DifficultyBadge difficulty={item.problem.difficulty} />
            <PlatformBadge platform={item.problem.platform} />
            <PriorityBadge priority={item.priority} />
          </div>
          <RowActions>
            {/* `key` remounts the select if the server value changes underneath it. */}
            <LinkPrioritySelect
              key={item.priority}
              linkId={item.id}
              priority={item.priority}
            />
            <DeleteButton
              action={unlinkProblem}
              id={item.id}
              label="Remove"
              successMessage="Removed ✓"
              confirmMessage="Remove this problem from the section?"
            />
          </RowActions>
        </ListRow>
      ))}
    </div>
  );
}
