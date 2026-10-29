import type { ReactNode } from "react";
import type { ActionResult } from "@/types/action";
import { ActionForm, SubmitButton } from "./action-form";
import { DialogCancelButton, EditDialog } from "./dialog";

interface EditRecordProps {
  title: string;
  /** The `update…` Server Action; receives the form fields plus a hidden `id`. */
  action: (formData: FormData) => Promise<ActionResult>;
  id: number;
  /** The form's fields, pre-filled with the record's current values. */
  children: ReactNode;
}

/** Pre-filled form with Save / Cancel. Must be rendered inside a `<Dialog>`. */
export function EditRecordForm({
  action,
  id,
  children,
}: Omit<EditRecordProps, "title">) {
  return (
    <ActionForm action={action} successMessage="Saved ✓" layout="stack">
      <input type="hidden" name="id" value={id} />
      {children}
      <div className="mt-1 flex gap-2">
        <SubmitButton>Save</SubmitButton>
        <DialogCancelButton />
      </div>
    </ActionForm>
  );
}

/**
 * "Edit" button → dialog with a pre-filled form. Fine for short lists; the form ships
 * with every row, so for long lists use `EditParamButton` + `ParamDialog` instead.
 */
export function EditRecordDialog({ title, ...form }: EditRecordProps) {
  return (
    <EditDialog title={title}>
      <EditRecordForm {...form} />
    </EditDialog>
  );
}
