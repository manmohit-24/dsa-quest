import { PhaseBadge, SectionTag } from "@/components/domain/badges";
import { DeleteButton } from "@/components/ui/delete-button";
import { EditRecordDialog } from "@/components/ui/edit-record-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { RowActions } from "@/components/ui/list-row";
import { deletePhase, updatePhase } from "@/server/actions/phases";
import { deleteSection, updateSection } from "@/server/actions/sections";
import type { SheetStructure } from "@/types/domain";
import { PhaseFields } from "./phase-fields";
import { SectionFields } from "./section-fields";

/** Phases and their sections for one sheet, with edit / delete on each. */
export function StructureTree({ sheet }: { sheet: SheetStructure }) {
  if (sheet.phases.length === 0) return <EmptyState>No phases yet.</EmptyState>;

  return (
    <div>
      {sheet.phases.map((phase) => (
        <div key={phase.id} className="mb-4">
          <div className="flex items-center gap-2 py-1 text-[13px] font-medium text-muted">
            <span>📁 {phase.title}</span>
            <PhaseBadge text={phase.badge} type={phase.badgeType} />
            <div className="ml-auto">
              <RowActions>
                <EditRecordDialog
                  title="Edit Phase"
                  action={updatePhase}
                  id={phase.id}
                >
                  <PhaseFields phase={phase} />
                </EditRecordDialog>
                <DeleteButton
                  action={deletePhase}
                  id={phase.id}
                  successMessage="Phase deleted"
                  confirmMessage="Delete this phase and all its sections?"
                />
              </RowActions>
            </div>
          </div>

          {phase.sections.map((section) => (
            <div
              key={section.id}
              className="ml-2 flex items-center gap-2 border-l-2 border-line py-1 pl-4 text-[13px]"
            >
              <span className="flex flex-1 items-center gap-2">
                📂 {section.title}
                <SectionTag text={section.tag} type={section.tagType} />
              </span>
              <RowActions>
                <EditRecordDialog
                  title="Edit Section"
                  action={updateSection}
                  id={section.id}
                >
                  <SectionFields section={section} />
                </EditRecordDialog>
                <DeleteButton
                  action={deleteSection}
                  id={section.id}
                  successMessage="Section deleted"
                  confirmMessage="Delete this section? Problems will be unlinked but not deleted."
                />
              </RowActions>
            </div>
          ))}

          {phase.sections.length === 0 && (
            <div className="ml-2 border-l-2 border-line py-1 pl-4 text-[13px] text-subtle">
              No sections yet
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
