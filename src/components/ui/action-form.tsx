"use client";

import {
  createContext,
  useContext,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRunAction } from "@/hooks/use-run-action";
import { cn } from "@/lib/cn";
import type { ActionResult } from "@/types/action";
import { Button } from "./button";
import { useDialog } from "./dialog";

const PendingContext = createContext(false);

interface ActionFormProps {
  /** A Server Action taking the form's `FormData`. */
  action: (formData: FormData) => Promise<ActionResult>;
  /** Toast shown on success. */
  successMessage?: string;
  /**
   * Clear the text inputs after a successful submit (selects are kept, so you can add
   * several items to the same sheet/phase in a row).
   */
  clearOnSuccess?: boolean;
  /** `row` wraps fields inline (create forms); `stack` lays them out vertically (dialogs). */
  layout?: "row" | "stack";
  children: ReactNode;
}

function clearTextFields(form: HTMLFormElement) {
  form
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input:not([type="hidden"]), textarea',
    )
    .forEach((field) => {
      field.value = "";
    });
}

/**
 * The one form component for every mutation: submits to a Server Action, shows a
 * pending state, toasts the result, and closes the surrounding dialog on success.
 * (Submitting via onSubmit rather than `action=` keeps the user's input when validation fails.)
 */
export function ActionForm({
  action,
  successMessage,
  clearOnSuccess = false,
  layout = "row",
  children,
}: ActionFormProps) {
  const { run, isPending } = useRunAction();
  const dialog = useDialog();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    run(() => action(formData), {
      success: successMessage,
      onSuccess: () => {
        if (clearOnSuccess) clearTextFields(form);
        dialog?.close();
      },
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex gap-2",
        layout === "row" ? "mb-2 flex-wrap items-start" : "flex-col",
      )}
    >
      <PendingContext value={isPending}>{children}</PendingContext>
    </form>
  );
}

interface SubmitButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

/** Disabled while the surrounding `ActionForm` is submitting. */
export function SubmitButton({
  children,
  variant = "primary",
}: SubmitButtonProps) {
  const pending = useContext(PendingContext);
  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {children}
    </Button>
  );
}
