"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/admin/sheets", label: "Sheets" },
  { href: "/admin/structure", label: "Phases & Sections" },
  { href: "/admin/problems", label: "Problems" },
  { href: "/admin/link", label: "Link Problems" },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin sections"
      className="mb-6 flex gap-1 border-hairline border-b border-line"
    >
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px rounded-t-lg border-b-2 px-4 py-[7px] text-[13px] no-underline transition",
              active
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:bg-surface hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
