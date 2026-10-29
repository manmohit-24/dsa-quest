"use server";

import * as sections from "@/server/repositories/sections";
import {
  idSchema,
  sectionSchema,
  updateSectionSchema,
} from "@/server/validation/schemas";
import { runAction } from "./run-action";

export async function createSection(formData: FormData) {
  return runAction(sectionSchema, formData, (data) => {
    sections.createSection(data);
  });
}

export async function updateSection(formData: FormData) {
  return runAction(updateSectionSchema, formData, ({ id, ...data }) => {
    sections.updateSection(id, data);
  });
}

export async function deleteSection(id: number) {
  return runAction(idSchema, { id }, ({ id }) => {
    sections.deleteSection(id);
  });
}
