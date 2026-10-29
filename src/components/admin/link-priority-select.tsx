"use client";

import { Select } from "@/components/ui/input";
import { useRunAction } from "@/hooks/use-run-action";
import { SHORT_PRIORITY_OPTIONS, type Priority } from "@/lib/constants";
import { updateLinkPriority } from "@/server/actions/links";

/** Change a linked problem's priority in place. */
export function LinkPrioritySelect({
  linkId,
  priority,
}: {
  linkId: number;
  priority: Priority;
}) {
  const { run, isPending } = useRunAction();

  return (
    <Select
      fluid={false}
      aria-label="Priority"
      className="w-[130px]"
      defaultValue={priority}
      disabled={isPending}
      options={SHORT_PRIORITY_OPTIONS}
      onChange={(event) =>
        run(
          () =>
            updateLinkPriority(linkId, Number(event.target.value) as Priority),
          {
            success: "Priority updated ✓",
          },
        )
      }
    />
  );
}
