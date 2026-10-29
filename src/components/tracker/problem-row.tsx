import {
  DifficultyBadge,
  PlatformBadge,
  PriorityBadge,
} from "@/components/domain/badges";
import { cn } from "@/lib/cn";
import type { LinkedProblem } from "@/types/domain";

interface ProblemRowProps {
  item: LinkedProblem;
  onToggle: (linkId: number, done: boolean) => void;
}

/**
 * One problem. The whole row is a <label>, so clicking anywhere ticks it —
 * but it's a real checkbox underneath, so keyboard and screen readers work too.
 * The "Open ↗" link sits inside the label without toggling it (links are interactive content).
 */
export function ProblemRow({ item, onToggle }: ProblemRowProps) {
  const { problem, done } = item;

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-surface",
        done && "opacity-45",
      )}
    >
      <input
        type="checkbox"
        checked={done}
        onChange={() => onToggle(item.id, !done)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="grid size-[17px] shrink-0 place-items-center rounded-[4px] border-hairline border-line-strong text-[10px] leading-none font-semibold text-transparent transition peer-checked:border-success-fill peer-checked:bg-success-fill peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-accent"
      >
        ✓
      </span>

      <span
        className={cn("flex-1 text-sm", done && "text-subtle line-through")}
      >
        {problem.name}
      </span>

      <PriorityBadge priority={item.priority} />
      <DifficultyBadge difficulty={problem.difficulty} />
      <PlatformBadge platform={problem.platform} />

      {problem.url && (
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs whitespace-nowrap text-accent no-underline hover:underline"
        >
          Open ↗
        </a>
      )}
    </label>
  );
}
