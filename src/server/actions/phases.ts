"use server";

import * as phases from "@/server/repositories/phases";
import {
  idSchema,
  phaseSchema,
  updatePhaseSchema,
} from "@/server/validation/schemas";
import { runAction } from "./run-action";

export async function createPhase(formData: FormData) {
  return runAction(phaseSchema, formData, (data) => {
    phases.createPhase(data);
  });
}

export async function updatePhase(formData: FormData) {
  return runAction(updatePhaseSchema, formData, ({ id, ...data }) => {
    phases.updatePhase(id, data);
  });
}

export async function deletePhase(id: number) {
  return runAction(idSchema, { id }, ({ id }) => {
    phases.deletePhase(id);
  });
}
