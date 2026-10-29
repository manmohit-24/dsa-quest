import { z } from "zod";
import {
  BADGE_TYPES,
  DEFAULT_BADGE_TYPE,
  DEFAULT_DIFFICULTY,
  DEFAULT_PLATFORM,
  DEFAULT_PRIORITY,
  DEFAULT_TAG_TYPE,
  DIFFICULTIES,
  PLATFORMS,
  TAG_TYPES,
} from "@/lib/constants";

/* ── Field builders ──────────────────────────────────────────── */

/** A positive integer id (form fields arrive as strings, hence `coerce`). */
const id = (label: string) =>
  z.coerce
    .number({ error: `${label} is required` })
    .int({ error: `${label} is required` })
    .positive({ error: `${label} is required` });

const requiredText = (message: string) =>
  z.string({ error: message }).trim().min(1, message);

const optionalText = z.string().trim().default("");

/** Only http(s) links — the value ends up in an `href`. */
const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || /^https?:\/\//i.test(value), {
    error: "URL must start with http:// or https://",
  })
  .default("");

const priority = z.coerce
  .number({ error: "Priority is required" })
  .pipe(
    z.union([z.literal(1), z.literal(2), z.literal(3)], {
      error: "Priority must be 1, 2 or 3",
    }),
  )
  .default(DEFAULT_PRIORITY);

/* ── Schemas ─────────────────────────────────────────────────── */

export const idSchema = z.object({ id: id("Id") });

export const sheetSchema = z.object({
  name: requiredText("Sheet name is required"),
  description: optionalText,
});
export const updateSheetSchema = sheetSchema.extend({ id: id("Sheet") });

export const phaseSchema = z.object({
  sheetId: id("Sheet"),
  title: requiredText("Phase title is required"),
  badge: optionalText,
  badgeType: z.enum(BADGE_TYPES).default(DEFAULT_BADGE_TYPE),
});
export const updatePhaseSchema = phaseSchema
  .omit({ sheetId: true })
  .extend({ id: id("Phase") });

export const sectionSchema = z.object({
  phaseId: id("Phase"),
  title: requiredText("Section title is required"),
  tag: optionalText,
  tagType: z.enum(TAG_TYPES).default(DEFAULT_TAG_TYPE),
});
export const updateSectionSchema = sectionSchema
  .omit({ phaseId: true })
  .extend({ id: id("Section") });

export const problemSchema = z.object({
  name: requiredText("Problem name is required"),
  difficulty: z.enum(DIFFICULTIES).default(DEFAULT_DIFFICULTY),
  platform: z.enum(PLATFORMS).default(DEFAULT_PLATFORM),
  url: optionalUrl,
  notes: optionalText,
});
export const updateProblemSchema = problemSchema.extend({ id: id("Problem") });

export const linkSchema = z.object({
  sectionId: id("Section"),
  problemId: id("Problem"),
  priority,
});

export const linkPrioritySchema = z.object({
  linkId: id("Link"),
  priority,
});

export const toggleSchema = z.object({
  linkId: id("Problem"),
  done: z.boolean(),
});
