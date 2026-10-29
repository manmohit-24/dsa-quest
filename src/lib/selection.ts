import type { SheetStructure } from "@/types/domain";

type PhaseStructure = SheetStructure["phases"][number];
type SectionStructure = PhaseStructure["sections"][number];

export interface Selection {
  sheet: SheetStructure | null;
  phase: PhaseStructure | null;
  section: SectionStructure | null;
}

export interface SelectionParams {
  sheet?: number;
  phase?: number;
  section?: number;
}

/**
 * Resolve a cascading sheet → phase → section selection from URL params,
 * falling back to the first available item at each level.
 * Invalid / mismatched ids silently fall back too, so a stale URL never breaks a page.
 */
export function resolveSelection(
  structure: SheetStructure[],
  params: SelectionParams,
): Selection {
  const sheet =
    structure.find((s) => s.id === params.sheet) ?? structure[0] ?? null;
  const phase =
    sheet?.phases.find((p) => p.id === params.phase) ??
    sheet?.phases[0] ??
    null;
  const section =
    phase?.sections.find((s) => s.id === params.section) ??
    phase?.sections[0] ??
    null;
  return { sheet, phase, section };
}
