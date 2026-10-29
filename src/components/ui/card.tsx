import type { ReactNode } from "react";

interface CardProps {
  title: string;
  children: ReactNode;
}

/** A titled panel — the building block of every admin page. */
export function Card({ title, children }: CardProps) {
  return (
    <section className="mb-4 rounded-lg border-hairline border-line bg-surface p-5">
      <h2 className="mb-3 text-sm font-medium">{title}</h2>
      {children}
    </section>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-[13px] text-muted">{children}</p>;
}
