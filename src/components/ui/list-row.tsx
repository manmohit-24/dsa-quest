import type { ReactNode } from "react";

/** One row in an admin list: content on the left, actions on the right. */
export function ListRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 border-hairline border-b border-line py-2 last:border-b-0">
      {children}
    </div>
  );
}

export function RowActions({ children }: { children: ReactNode }) {
  return <div className="flex shrink-0 items-center gap-1.5">{children}</div>;
}
