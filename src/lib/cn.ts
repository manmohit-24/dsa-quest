import clsx, { type ClassValue } from "clsx";

/** Tiny className helper: `cn("a", cond && "b")`. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
