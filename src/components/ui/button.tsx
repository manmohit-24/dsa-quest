import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

const BASE =
  "inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-lg border-hairline font-[inherit] transition disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  primary: "border-accent bg-accent text-on-accent hover:opacity-85",
  secondary:
    "border-line-strong bg-transparent text-foreground hover:bg-surface-strong",
  ghost:
    "border-line-strong bg-transparent text-muted hover:bg-surface-strong hover:text-foreground",
  danger: "border-danger bg-transparent text-danger hover:bg-danger-soft",
};

const SIZES: Record<Size, string> = {
  md: "px-4 py-[7px] text-[13px]",
  sm: "px-2.5 py-1 text-xs",
};

interface StyleOptions {
  variant?: Variant;
  size?: Size;
  className?: string;
}

/** Button look for any element — e.g. a `<Link>` that should look like a button. */
export function buttonStyles({
  variant = "secondary",
  size = "md",
  className,
}: StyleOptions = {}) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, StyleOptions {}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  );
}
