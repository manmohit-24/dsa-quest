import { ParamSelect } from "@/components/ui/param-select";
import type { Selection } from "@/lib/selection";
import type { SheetStructure } from "@/types/domain";

interface SectionPickerProps {
  structure: SheetStructure[];
  selection: Selection;
}

/**
 * Cascading Sheet → Phase → Section picker, driven entirely by the URL
 * (`?sheet=&phase=&section=`). Changing a level clears the levels below it.
 */
export function SectionPicker({ structure, selection }: SectionPickerProps) {
  const { sheet, phase, section } = selection;

  return (
    <div className="flex flex-wrap gap-2">
      <ParamSelect
        param="sheet"
        label="Sheet"
        value={sheet?.id}
        resetParams={["phase", "section"]}
        options={structure.map((s) => ({ value: s.id, label: s.name }))}
        emptyLabel="No sheets yet"
      />
      <ParamSelect
        param="phase"
        label="Phase"
        value={phase?.id}
        resetParams={["section"]}
        options={(sheet?.phases ?? []).map((p) => ({
          value: p.id,
          label: p.title,
        }))}
        emptyLabel="No phases"
      />
      <ParamSelect
        param="section"
        label="Section"
        value={section?.id}
        options={(phase?.sections ?? []).map((s) => ({
          value: s.id,
          label: s.title,
        }))}
        emptyLabel="No sections"
      />
    </div>
  );
}
