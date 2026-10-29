"use client";

import { useCallback, useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import type { ActionResult } from "@/types/action";

interface RunOptions {
  /** Toast shown on success. */
  success?: string;
  onSuccess?: () => void;
}

/**
 * Run a Server Action inside a transition and toast the outcome.
 * Every button / form that mutates data goes through this, so loading and
 * error handling behave identically everywhere.
 */
export function useRunAction() {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const run = useCallback(
    (action: () => Promise<ActionResult>, options: RunOptions = {}) => {
      startTransition(async () => {
        try {
          const result = await action();
          if (result.ok) {
            if (options.success) toast(options.success);
            options.onSuccess?.();
          } else {
            toast(result.error, "error");
          }
        } catch {
          toast("Couldn't reach the server. Is it still running?", "error");
        }
      });
    },
    [toast],
  );

  return { run, isPending };
}
