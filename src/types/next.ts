export type SearchParams = Record<string, string | string[] | undefined>;

/** Props for a page that reads `searchParams` (async in Next 15+). */
export interface SearchParamsProps {
  searchParams: Promise<SearchParams>;
}
