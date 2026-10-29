/** What every Server Action returns, so the client can toast the outcome uniformly. */
export type ActionResult = { ok: true } | { ok: false; error: string };
