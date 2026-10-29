"use server";

import * as sheets from "@/server/repositories/sheets";
import {
  idSchema,
  sheetSchema,
  updateSheetSchema,
} from "@/server/validation/schemas";
import { runAction } from "./run-action";

export async function createSheet(formData: FormData) {
  return runAction(sheetSchema, formData, (data) => {
    sheets.createSheet(data);
  });
}

export async function updateSheet(formData: FormData) {
  return runAction(updateSheetSchema, formData, ({ id, ...data }) => {
    sheets.updateSheet(id, data);
  });
}

export async function deleteSheet(id: number) {
  return runAction(idSchema, { id }, ({ id }) => {
    sheets.deleteSheet(id);
  });
}
