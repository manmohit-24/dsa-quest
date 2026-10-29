import type { SearchParams } from "@/types/next";

/** `?a=1&a=2` gives an array — we only ever want the first value. */
export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Parse a positive integer search param, or `undefined` if absent / invalid. */
export function intParam(
  params: SearchParams,
  key: string,
): number | undefined {
  const raw = firstParam(params[key]);
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

export function stringParam(params: SearchParams, key: string): string {
  return firstParam(params[key])?.trim() ?? "";
}
