import { SectionTag } from "@/components/domain/badges";
import type { SectionWithProblems } from "@/types/domain";
import { ProblemRow } from "./problem-row";

interface SectionBlockProps {
  section: SectionWithProblems;
  onToggle: (linkId: number, done: boolean) => void;
}

export function SectionBlock({ section, onToggle }: SectionBlockProps) {
  return (
    <div className="mb-3">
      <h3 className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-muted">
        {section.title}
        <SectionTag text={section.tag} type={section.tagType} />
      </h3>
      {section.problems.map((item) => (
        <ProblemRow key={item.id} item={item} onToggle={onToggle} />
      ))}
    </div>
  );
}
