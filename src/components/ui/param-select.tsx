"use client";

import { useOptimistic } from "react";
import { useParamNavigation } from "@/hooks/use-param-navigation";
import type { Option } from "@/lib/constants";
import { Select } from "./input";

interface ParamSelectProps {
  /** The query-string key this select controls, e.g. `"sheet"`. */
  param: string;
  value: string | number | undefined;
  options: readonly Option<string | number>[];
  /** Accessible name. */
  label: string;
  /** Child params to clear when this one changes (sheet → phase → section). */
  resetParams?: string[];
  emptyLabel?: string;
  className?: string;
}

/**
 * A <select> whose value lives in the URL. Changing it navigates, and the Server
 * Component re-renders with the new selection. It updates instantly (optimistically)
 * while the server catches up.
 */
export function ParamSelect({
  param,
  value,
  options,
  label,
  resetParams = [],
  emptyLabel,
  className,
}: ParamSelectProps) {
  const { navigate } = useParamNavigation();
  const [shown, setShown] = useOptimistic(String(value ?? ""));

  return (
    <Select
      aria-label={label}
      value={shown}
      options={options}
      emptyLabel={emptyLabel}
      className={className}
      onChange={(event) => {
        const next = event.target.value;
        const resets = Object.fromEntries(
          resetParams.map((key) => [key, null]),
        );
        navigate({ ...resets, [param]: next }, () => setShown(next));
      }}
    />
  );
}
