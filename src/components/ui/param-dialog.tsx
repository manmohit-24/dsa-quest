"use client";

import { useParamNavigation } from "@/hooks/use-param-navigation";
import { Button } from "./button";
import { Dialog } from "./dialog";
import type { ReactNode } from "react";

/**
 * URL-driven dialogs for long lists: the page renders ONE dialog for `?<param>=<id>`
 * instead of shipping a hidden form with every row.
 */

export function EditParamButton({
  id,
  param = "edit",
}: {
  id: number;
  param?: string;
}) {
  const { navigate } = useParamNavigation();
  return (
    <Button size="sm" onClick={() => navigate({ [param]: id })}>
      Edit
    </Button>
  );
}

/** Closing it (Esc, backdrop, Cancel or a successful save) removes the param from the URL. */
export function ParamDialog({
  title,
  param = "edit",
  children,
}: {
  title: string;
  param?: string;
  children: ReactNode;
}) {
  const { navigate } = useParamNavigation();
  return (
    <Dialog title={title} onClose={() => navigate({ [param]: null })}>
      {children}
    </Dialog>
  );
}
