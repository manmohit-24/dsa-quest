/**
 * Single source of truth for every enum-like value in the app.
 * Used by the Zod schemas, the <select> options and the badge components,
 * so adding a new platform (or difficulty, tag type...) is a one-line change.
 */

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export const PLATFORMS = ["leetcode", "codeforces", "gfg", "custom"] as const;
export const PRIORITIES = [1, 2, 3] as const;
export const BADGE_TYPES = ["danger", "accent", "success"] as const;
export const TAG_TYPES = ["jtg", "imp", "ext"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];
export type Platform = (typeof PLATFORMS)[number];
export type Priority = (typeof PRIORITIES)[number];
export type BadgeType = (typeof BADGE_TYPES)[number];
export type TagType = (typeof TAG_TYPES)[number];

export interface Option<T extends string | number = string> {
  value: T;
  label: string;
}

export const DIFFICULTY_OPTIONS: Option<Difficulty>[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export const PLATFORM_OPTIONS: Option<Platform>[] = [
  { value: "leetcode", label: "LeetCode" },
  { value: "codeforces", label: "Codeforces" },
  { value: "gfg", label: "GFG" },
  { value: "custom", label: "Custom" },
];

export const PRIORITY_OPTIONS: Option<Priority>[] = [
  { value: 1, label: "Priority 1 — Must" },
  { value: 2, label: "Priority 2 — Important" },
  { value: 3, label: "Priority 3 — Good to have" },
];

export const SHORT_PRIORITY_OPTIONS: Option<Priority>[] = [
  { value: 1, label: "P1 — Must" },
  { value: 2, label: "P2 — Important" },
  { value: 3, label: "P3 — Good to have" },
];

export const BADGE_TYPE_OPTIONS: Option<BadgeType>[] = [
  { value: "danger", label: "danger (red)" },
  { value: "accent", label: "accent (blue)" },
  { value: "success", label: "success (green)" },
];

export const TAG_TYPE_OPTIONS: Option<TagType>[] = [
  { value: "jtg", label: "jtg (red)" },
  { value: "imp", label: "imp (orange)" },
  { value: "ext", label: "ext (green)" },
];

export const DEFAULT_PRIORITY: Priority = 2;
export const DEFAULT_DIFFICULTY: Difficulty = "medium";
export const DEFAULT_PLATFORM: Platform = "leetcode";
export const DEFAULT_BADGE_TYPE: BadgeType = "accent";
export const DEFAULT_TAG_TYPE: TagType = "imp";
