import type { Metadata } from "next";
import { connection } from "next/server";
import { LinkSearchResults } from "@/components/admin/link-search-results";
import { SectionPicker } from "@/components/admin/section-picker";
import { SectionProblemList } from "@/components/admin/section-problem-list";
import { Card, Hint } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ParamSelect } from "@/components/ui/param-select";
import { SearchInput } from "@/components/ui/search-input";
import {
  DEFAULT_PRIORITY,
  PRIORITIES,
  PRIORITY_OPTIONS,
} from "@/lib/constants";
import { intParam, stringParam } from "@/lib/search-params";
import { resolveSelection } from "@/lib/selection";
import { listProblems } from "@/server/repositories/problems";
import { listSectionProblems } from "@/server/repositories/links";
import { getStructure } from "@/server/repositories/sheet-tree";
import type { SearchParamsProps } from "@/types/next";

export const metadata: Metadata = { title: "Link Problems · Admin" };

const SEARCH_LIMIT = 10;

export default async function LinkPage({ searchParams }: SearchParamsProps) {
  await connection();
  const params = await searchParams;

  const structure = getStructure();
  const selection = resolveSelection(structure, {
    sheet: intParam(params, "sheet"),
    phase: intParam(params, "phase"),
    section: intParam(params, "section"),
  });
  const { section } = selection;

  const query = stringParam(params, "q");
  const priority =
    PRIORITIES.find((p) => p === intParam(params, "priority")) ??
    DEFAULT_PRIORITY;

  const linked = section ? listSectionProblems(section.id) : [];
  const results = section && query ? listProblems(query, SEARCH_LIMIT) : [];

  return (
    <>
      <Card title="Section">
        <Hint>
          Choose a section — new problems are linked into it, and its problems
          are listed below.
        </Hint>
        <SectionPicker structure={structure} selection={selection} />
      </Card>

      {section ? (
        <>
          <Card title="Link Problem to Section">
            <Hint>
              Search for an existing problem and add it to “{section.title}”
              with a priority.
            </Hint>
            <div className="mb-2 flex flex-wrap gap-2">
              <SearchInput placeholder="Search problem to add..." />
              <ParamSelect
                param="priority"
                label="Priority"
                value={priority}
                options={PRIORITY_OPTIONS}
              />
            </div>
            <LinkSearchResults
              query={query}
              results={results}
              sectionId={section.id}
              priority={priority}
              linkedProblemIds={new Set(linked.map((item) => item.problem.id))}
            />
          </Card>

          <Card title="Problems in Section">
            <SectionProblemList problems={linked} />
          </Card>
        </>
      ) : (
        <Card title="Link Problem to Section">
          <EmptyState>
            Create a sheet, a phase and a section first (Phases &amp; Sections
            tab).
          </EmptyState>
        </Card>
      )}
    </>
  );
}
