import type { Metadata } from "next";
import { connection } from "next/server";
import { SheetFields } from "@/components/admin/sheet-fields";
import { SheetList } from "@/components/admin/sheet-list";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { createSheet } from "@/server/actions/sheets";
import { listSheets } from "@/server/repositories/sheets";

export const metadata: Metadata = { title: "Sheets · Admin" };

export default async function SheetsPage() {
  await connection();
  const sheets = listSheets();

  return (
    <>
      <Card title="Create Sheet">
        <ActionForm
          action={createSheet}
          successMessage="Sheet created ✓"
          clearOnSuccess
        >
          <SheetFields />
          <SubmitButton>Create</SubmitButton>
        </ActionForm>
      </Card>

      <Card title="All Sheets">
        <SheetList sheets={sheets} />
      </Card>
    </>
  );
}
