import type { SheetStats } from "@/lib/progress";

interface StatProps {
  value: string | number;
  label: string;
}

function Stat({ value, label }: StatProps) {
  return (
    <div className="min-w-[110px] flex-1 rounded-lg bg-surface-strong px-[18px] py-3">
      <div className="text-[22px] font-medium">{value}</div>
      <div className="mt-0.5 text-xs text-muted">{label}</div>
    </div>
  );
}

export function StatsRow({ stats }: { stats: SheetStats }) {
  const { overall, priority1, remaining } = stats;
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <Stat value={`${overall.done}/${overall.total}`} label="Problems done" />
      <Stat value={`${overall.percent}%`} label="Overall" />
      <Stat
        value={`${priority1.done}/${priority1.total}`}
        label="Priority 1 done"
      />
      <Stat value={remaining} label="Remaining" />
    </div>
  );
}
