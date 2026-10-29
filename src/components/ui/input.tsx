import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { Option } from "@/lib/constants";

const FIELD =
  "rounded-lg border-hairline border-line-strong bg-background px-2.5 py-[7px] font-[inherit] text-[13px] text-foreground outline-none focus:border-accent disabled:opacity-60";

/** Default: grow to fill the row (min 140px). Pass `fluid={false}` for a fixed-width control. */
const FLUID = "min-w-[140px] flex-1";

interface FluidProps {
  fluid?: boolean;
}

export function Input({
  fluid = true,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & FluidProps) {
  return <input className={cn(FIELD, fluid && FLUID, className)} {...props} />;
}

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>, FluidProps {
  options: readonly Option<string | number>[];
  /** Shown (disabled) when `options` is empty, e.g. "No phases yet". */
  emptyLabel?: string;
}

export function Select({
  options,
  emptyLabel = "Nothing to choose yet",
  fluid = true,
  className,
  ...props
}: SelectProps) {
  const isEmpty = options.length === 0;
  return (
    <select
      className={cn(FIELD, "cursor-pointer", fluid && FLUID, className)}
      {...props}
      disabled={isEmpty || props.disabled}
    >
      {isEmpty ? (
        <option value="">{emptyLabel}</option>
      ) : (
        options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))
      )}
    </select>
  );
}
