"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "./button";

const DialogContext = createContext<{ close: () => void } | null>(null);

/** Lets a form rendered inside a dialog close it (e.g. after a successful save). */
export function useDialog() {
  return useContext(DialogContext);
}

interface DialogProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** A modal built on the native `<dialog>`: focus trap, Esc and backdrop for free. */
export function Dialog({ title, onClose, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // Padding lives on the inner div, so a click that lands on <dialog> itself is a backdrop click.
      onClick={(event) => {
        if (event.target === ref.current) ref.current.close();
      }}
      className="m-auto w-[90%] max-w-[480px] min-w-[min(340px,90%)] rounded-lg bg-background p-0 text-foreground backdrop:bg-black/40"
    >
      <div className="p-6">
        <h3 id={titleId} className="mb-4 text-[15px] font-medium">
          {title}
        </h3>
        <DialogContext value={{ close: () => ref.current?.close() }}>
          {children}
        </DialogContext>
      </div>
    </dialog>
  );
}

interface EditDialogProps {
  title: string;
  /** Label of the button that opens the dialog. */
  trigger?: string;
  children: ReactNode;
}

/** A small button that opens `children` in a dialog. Content is only mounted while open. */
export function EditDialog({
  title,
  trigger = "Edit",
  children,
}: EditDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        {trigger}
      </Button>
      {open && (
        <Dialog title={title} onClose={() => setOpen(false)}>
          {children}
        </Dialog>
      )}
    </>
  );
}

export function DialogCancelButton() {
  const dialog = useDialog();
  return <Button onClick={() => dialog?.close()}>Cancel</Button>;
}
