import type { ReactNode } from "react";

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="p-6 text-center text-[13px] text-subtle">{children}</div>
  );
}
