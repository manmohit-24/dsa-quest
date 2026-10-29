"use client";

import { useState } from "react";
import { PhaseBadge } from "@/components/domain/badges";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/cn";
import { countProgress, phaseProblems } from "@/lib/progress";
import type { PhaseWithSections, SectionWithProblems } from "@/types/domain";
import { SectionBlock } from "./section-block";

interface PhaseCardProps {
  /** The full phase — progress is always computed over everything, filter or not. */
  phase: PhaseWithSections<SectionWithProblems>;
  /** The sections to show (after filtering). */
  sections: SectionWithProblems[];
  onToggle: (linkId: number, done: boolean) => void;
}

/** A collapsible phase with its progress bar and sections. Open/closed state is local. */
export function PhaseCard({ phase, sections, onToggle }: PhaseCardProps) {
  const [open, setOpen] = useState(true);
  const progress = countProgress(phaseProblems(phase));

  return (
    <section className="mb-6">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors select-none hover:bg-surface"
      >
        <span className="flex-1 text-[15px] font-medium">{phase.title}</span>
        <PhaseBadge text={phase.badge} type={phase.badgeType} />
        <span className="text-xs text-muted">
          {progress.done}/{progress.total}
        </span>
        <span
          aria-hidden
          className={cn(
            "inline-block text-[11px] text-subtle transition-transform",
            open && "rotate-180",
          )}
        >
          ▼
        </span>
      </button>

      <ProgressBar percent={progress.percent} className="mx-3 mb-2.5" />

      {open &&
        sections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            onToggle={onToggle}
          />
        ))}
    </section>
  );
}
