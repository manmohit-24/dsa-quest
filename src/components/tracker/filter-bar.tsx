import { cn } from "@/lib/cn";
import { FILTERS, type FilterKey } from "@/lib/filters";

interface FilterBarProps {
  value: FilterKey;
  onChange: (filter: FilterKey) => void;
}

export function FilterBar({ value, onChange }: FilterBarProps) {
  return (
    <div
      role="group"
      aria-label="Filter problems"
      className="mb-6 flex flex-wrap gap-2"
    >
      {FILTERS.map((filter) => {
        const active = filter.key === value;
        return (
          <button
            key={filter.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter.key)}
            className={cn(
              "cursor-pointer rounded-full border-hairline px-3.5 py-[5px] font-[inherit] text-[13px] transition",
              active
                ? "border-accent-line bg-accent-soft text-accent"
                : "border-line-strong bg-transparent text-muted hover:bg-surface-strong",
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
