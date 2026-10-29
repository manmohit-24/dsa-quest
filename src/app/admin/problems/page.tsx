import type { Metadata } from "next";
import { connection } from "next/server";
import { ProblemFields } from "@/components/admin/problem-fields";
import { ProblemList } from "@/components/admin/problem-list";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Card } from "@/components/ui/card";
import { EditRecordForm } from "@/components/ui/edit-record-dialog";
import { ParamDialog } from "@/components/ui/param-dialog";
import { SearchInput } from "@/components/ui/search-input";
import { intParam, stringParam } from "@/lib/search-params";
import { createProblem, updateProblem } from "@/server/actions/problems";
import { getProblem, listProblems } from "@/server/repositories/problems";
import type { SearchParamsProps } from "@/types/next";

export const metadata: Metadata = { title: "Problems · Admin" };

export default async function ProblemsPage({
  searchParams,
}: SearchParamsProps) {
  await connection();
  const params = await searchParams;
  const query = stringParam(params, "q");
  const editingId = intParam(params, "edit");
  const problems = listProblems(query);
  const editing = editingId ? getProblem(editingId) : undefined;

  return (
    <>
      <Card title="Create Problem">
        <ActionForm
          action={createProblem}
          successMessage="Problem created ✓"
          clearOnSuccess
        >
          <ProblemFields />
          <SubmitButton>Create</SubmitButton>
        </ActionForm>
      </Card>

      <Card title="All Problems">
        <div className="mb-2 flex gap-2">
          <SearchInput placeholder="Search problems..." />
        </div>
        <ProblemList problems={problems} />
      </Card>

      {editing && (
        <ParamDialog title="Edit Problem" key={editing.id}>
          <EditRecordForm action={updateProblem} id={editing.id}>
            <ProblemFields problem={editing} />
          </EditRecordForm>
        </ParamDialog>
      )}
    </>
  );
}
