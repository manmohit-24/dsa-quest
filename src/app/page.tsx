import Link from "next/link";
import { connection } from "next/server";
import { TrackerBoard } from "@/components/tracker/tracker-board";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ParamSelect } from "@/components/ui/param-select";
import { intParam } from "@/lib/search-params";
import { getSheetTree } from "@/server/repositories/sheet-tree";
import { listSheets } from "@/server/repositories/sheets";
import type { SearchParamsProps } from "@/types/next";

export default async function TrackerPage({ searchParams }: SearchParamsProps) {
  await connection(); // read the DB per request, never at build time
  const params = await searchParams;

  const sheets = listSheets();
  const selected =
    sheets.find((s) => s.id === intParam(params, "sheet")) ?? sheets[0];
  const sheet = selected ? getSheetTree(selected.id) : null;

  return (
    <>
      <PageHeader
        title="DSA Tracker"
        description={
          <>
            Platform-agnostic. Multi-sheet. Source lives in{" "}
            <code className="rounded bg-surface-strong px-1.5 py-px text-xs">
              seed.sql
            </code>
            .
          </>
        }
        actions={
          <>
            {sheets.length > 0 && (
              <ParamSelect
                param="sheet"
                label="Sheet"
                value={selected?.id}
                options={sheets.map((s) => ({ value: s.id, label: s.name }))}
                className="min-w-[200px]"
              />
            )}
            <Link href="/admin" className={buttonStyles({ variant: "ghost" })}>
              Admin
            </Link>
          </>
        }
      />

      {sheet ? (
        // Re-key per sheet so filter / open-state never leak between sheets.
        <TrackerBoard key={sheet.id} sheet={sheet} />
      ) : (
        <EmptyState>
          No sheets yet.{" "}
          <Link href="/admin/sheets" className="text-accent hover:underline">
            Create one in the admin panel
          </Link>
          .
        </EmptyState>
      )}
    </>
  );
}
