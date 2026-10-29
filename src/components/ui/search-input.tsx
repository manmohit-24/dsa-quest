"use client";

import { useParamNavigation } from "@/hooks/use-param-navigation";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { Input } from "./input";

interface SearchInputProps {
  placeholder: string;
  /** Query-string key to sync with. */
  param?: string;
}

/** A debounced search box that writes to the URL (`?q=…`) — the page filters on the server. */
export function SearchInput({ placeholder, param = "q" }: SearchInputProps) {
  const { navigate, searchParams } = useParamNavigation();
  const search = useDebouncedCallback(
    (value: string) => navigate({ [param]: value.trim() }),
    250,
  );

  return (
    <Input
      type="search"
      aria-label={placeholder}
      placeholder={placeholder}
      defaultValue={searchParams.get(param) ?? ""}
      onChange={(event) => search(event.target.value)}
    />
  );
}
