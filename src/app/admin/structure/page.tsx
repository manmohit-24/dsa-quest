import type { Metadata } from "next";
import { connection } from "next/server";
import { PhaseFields } from "@/components/admin/phase-fields";
import { SectionFields } from "@/components/admin/section-fields";
import { SheetPhaseFields } from "@/components/admin/sheet-phase-fields";
import { StructureTree } from "@/components/admin/structure-tree";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/input";
import { ParamSelect } from "@/components/ui/param-select";
import { intParam } from "@/lib/search-params";
import { resolveSelection } from "@/lib/selection";
import { createPhase } from "@/server/actions/phases";
import { createSection } from "@/server/actions/sections";
import { getStructure } from "@/server/repositories/sheet-tree";
import type { SearchParamsProps } from "@/types/next";

export const metadata: Metadata = { title: "Phases & Sections · Admin" };

export default async function StructurePage({
  searchParams,
}: SearchParamsProps) {
  await connection();
  const params = await searchParams;

  const structure = getStructure();
  const { sheet } = resolveSelection(structure, {
    sheet: intParam(params, "sheet"),
  });
  const sheetOptions = structure.map((s) => ({ value: s.id, label: s.name }));

  return (
    <>
      <Card title="Add Phase">
        <ActionForm
          action={createPhase}
          successMessage="Phase added ✓"
          clearOnSuccess
        >
          <Select
            name="sheetId"
            aria-label="Sheet"
            options={sheetOptions}
            emptyLabel="Create a sheet first"
          />
          <PhaseFields />
          <SubmitButton>Add Phase</SubmitButton>
        </ActionForm>
      </Card>

      <Card title="Add Section">
        <ActionForm
          action={createSection}
          successMessage="Section added ✓"
          clearOnSuccess
        >
          <SheetPhaseFields structure={structure} />
          <SectionFields />
          <SubmitButton>Add Section</SubmitButton>
        </ActionForm>
      </Card>

      <Card title="Browse Phases & Sections">
        {sheet ? (
          <>
            <div className="mb-2 flex flex-wrap gap-2">
              <ParamSelect
                param="sheet"
                label="Sheet"
                value={sheet.id}
                options={sheetOptions}
              />
            </div>
            <StructureTree sheet={sheet} />
          </>
        ) : (
          <EmptyState>No sheets yet.</EmptyState>
        )}
      </Card>
    </>
  );
}
