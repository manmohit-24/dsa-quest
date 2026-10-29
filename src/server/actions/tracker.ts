"use server";

import * as links from "@/server/repositories/links";
import { toggleSchema } from "@/server/validation/schemas";
import { runAction } from "./run-action";

/** Tick / untick a problem in the tracker. */
export async function toggleProblem(linkId: number, done: boolean) {
  return runAction(toggleSchema, { linkId, done }, (data) => {
    links.setLinkDone(data.linkId, data.done);
  });
}
