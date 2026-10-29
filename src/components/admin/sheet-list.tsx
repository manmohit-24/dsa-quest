import { DeleteButton } from "@/components/ui/delete-button";
import { EditRecordDialog } from "@/components/ui/edit-record-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow, RowActions } from "@/components/ui/list-row";
import { deleteSheet, updateSheet } from "@/server/actions/sheets";
import type { Sheet } from "@/types/domain";
import { SheetFields } from "./sheet-fields";

export function SheetList({ sheets }: { sheets: Sheet[] }) {
  if (sheets.length === 0) return <EmptyState>No sheets yet.</EmptyState>;

  return (
    <div>
      {sheets.map((sheet) => (
        <ListRow key={sheet.id}>
          <div className="flex-1 text-sm">
            <strong className="font-medium">{sheet.name}</strong>
            <span className="text-xs text-subtle">
              {" "}
              — {sheet.description || "no description"}
            </span>
          </div>
          <RowActions>
            <EditRecordDialog
              title="Edit Sheet"
              action={updateSheet}
              id={sheet.id}
            >
              <SheetFields sheet={sheet} />
            </EditRecordDialog>
            <DeleteButton
              action={deleteSheet}
              id={sheet.id}
              successMessage="Sheet deleted"
              confirmMessage="Delete this sheet? All its phases and sections will be removed. Problems remain in the global pool."
            />
          </RowActions>
        </ListRow>
      ))}
    </div>
  );
}
