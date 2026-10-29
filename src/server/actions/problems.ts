"use server";

import * as problems from "@/server/repositories/problems";
import {
  idSchema,
  problemSchema,
  updateProblemSchema,
} from "@/server/validation/schemas";
import { runAction } from "./run-action";

export async function createProblem(formData: FormData) {
  return runAction(problemSchema, formData, (data) => {
    problems.createProblem(data);
  });
}

export async function updateProblem(formData: FormData) {
  return runAction(updateProblemSchema, formData, ({ id, ...data }) => {
    problems.updateProblem(id, data);
  });
}

export async function deleteProblem(id: number) {
  return runAction(idSchema, { id }, ({ id }) => {
    problems.deleteProblem(id);
  });
}
