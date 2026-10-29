"use server";

import type { Priority } from "@/lib/constants";
import * as links from "@/server/repositories/links";
import {
  idSchema,
  linkPrioritySchema,
  linkSchema,
} from "@/server/validation/schemas";
import { ActionError, runAction } from "./run-action";

/** Put an existing problem into a section. */
export async function linkProblem(formData: FormData) {
  return runAction(linkSchema, formData, (data) => {
    if (links.linkProblem(data) === null) {
      throw new ActionError("Problem already in this section");
    }
  });
}

export async function updateLinkPriority(linkId: number, priority: Priority) {
  return runAction(linkPrioritySchema, { linkId, priority }, (data) => {
    links.updateLinkPriority(data.linkId, data.priority);
  });
}

/** Remove a problem from a section (the problem itself is kept). */
export async function unlinkProblem(id: number) {
  return runAction(idSchema, { id }, ({ id }) => {
    links.unlinkProblem(id);
  });
}
