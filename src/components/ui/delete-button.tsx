"use client";

import { useRunAction } from "@/hooks/use-run-action";
import type { ActionResult } from "@/types/action";
import { Button } from "./button";

interface DeleteButtonProps {
  /** A Server Action taking the record's id, e.g. `deleteSheet`. */
  action: (id: number) => Promise<ActionResult>;
  id: number;
  /** Shown in the confirmation prompt — say what will (not) be lost. */
  confirmMessage: string;
  successMessage?: string;
  label?: string;
}

export function DeleteButton({
  action,
  id,
  confirmMessage,
  successMessage = "Deleted",
  label = "Delete",
}: DeleteButtonProps) {
  const { run, isPending } = useRunAction();

  return (
    <Button
      variant="danger"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (window.confirm(confirmMessage))
          run(() => action(id), { success: successMessage });
      }}
    >
      {label}
    </Button>
  );
}
