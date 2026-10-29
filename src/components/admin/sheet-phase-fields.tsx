"use client";

import { useState } from "react";
import { Select } from "@/components/ui/input";
import type { SheetStructure } from "@/types/domain";

/**
 * Cascading "Sheet → Phase" selects for the Add Section form.
 * Only the phase select is submitted (`phaseId`); the sheet select just narrows its options.
 */
export function SheetPhaseFields({
  structure,
}: {
  structure: SheetStructure[];
}) {
  const [chosenSheetId, setChosenSheetId] = useState<number | undefined>(
    structure[0]?.id,
  );

  // Fall back gracefully if the chosen sheet was deleted while this form was open.
  const sheet = structure.find((s) => s.id === chosenSheetId) ?? structure[0];

  return (
    <>
      <Select
        aria-label="Sheet"
        value={sheet?.id ?? ""}
        onChange={(event) => setChosenSheetId(Number(event.target.value))}
        options={structure.map((s) => ({ value: s.id, label: s.name }))}
        emptyLabel="No sheets yet"
      />
      <Select
        key={sheet?.id}
        name="phaseId"
        aria-label="Phase"
        options={(sheet?.phases ?? []).map((p) => ({
          value: p.id,
          label: p.title,
        }))}
        emptyLabel="No phases yet"
      />
    </>
  );
}
