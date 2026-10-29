import { cn } from "@/lib/cn";

interface ProgressBarProps {
  /** 0–100 */
  percent: number;
  className?: string;
}

export function ProgressBar({ percent, className }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn(
        "h-[3px] overflow-hidden rounded-sm bg-surface-strong",
        className,
      )}
    >
      <div
        className="h-full rounded-sm bg-success-fill transition-[width] duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
