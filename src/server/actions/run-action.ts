import { refresh } from "next/cache";
import type { z } from "zod";
import type { ActionResult } from "@/types/action";

/** Throw inside an action handler to show a friendly message to the user. */
export class ActionError extends Error {}

/**
 * The one place that defines how every Server Action behaves:
 *
 *   1. normalise + validate the input (FormData or a plain object) with Zod
 *   2. run the handler
 *   3. turn any failure into `{ ok: false, error }` (never leak raw errors)
 *   4. on success, `refresh()` so the current page re-renders with fresh data
 *      (the data lives in SQLite, not in Next's cache, so `refresh` is enough)
 *
 * Server Actions are public HTTP endpoints — validate everything, trust nothing.
 */
export async function runAction<S extends z.ZodType>(
  schema: S,
  input: unknown,
  handler: (data: z.output<S>) => void | Promise<void>,
): Promise<ActionResult> {
  const raw =
    input instanceof FormData ? Object.fromEntries(input.entries()) : input;

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    await handler(parsed.data);
  } catch (error) {
    if (error instanceof ActionError)
      return { ok: false, error: error.message };
    console.error("[server action]", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  refresh();
  return { ok: true };
}
