"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

type Changes = Record<string, string | number | null | undefined>;

/**
 * Read and update URL search params from a client component.
 * Page state that should survive a refresh (selected sheet, search text…)
 * lives in the URL, so Server Components can render it directly.
 */
export function useParamNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  /**
   * Merge `changes` into the current query string. `null` / `undefined` / `""` removes a param.
   * `beforeNavigate` runs inside the same transition — handy for `useOptimistic`.
   */
  const navigate = useCallback(
    (changes: Changes, beforeNavigate?: () => void) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === undefined || value === "")
          next.delete(key);
        else next.set(key, String(value));
      }
      const query = next.toString();

      startTransition(() => {
        beforeNavigate?.();
        router.replace(query ? `${pathname}?${query}` : pathname);
      });
    },
    [pathname, router, searchParams],
  );

  return { navigate, isPending, searchParams };
}
