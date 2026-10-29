# DSA Quest

A personal DSA practice tracker — **multi-sheet**, priority-based, with auto-backup.
Next.js (App Router) · TypeScript · Tailwind v4 · SQLite (`better-sqlite3`).

- **Tracker** at `/` — pick a sheet, tick problems, filter by status / priority, per-phase progress.
- **Admin** at `/admin` — manage sheets, phases, sections, the global problem pool, and link problems into sections with a priority.
- **Your data is portable**: every start snapshots the DB to `db/seed.sql`; an empty DB is rebuilt from it.

## Quick start

```bash
pnpm install          # or npm install
pnpm dev              # http://localhost:3000
```

First run with no `db/seed.sql` seeds the sample sheet (`db/seed.sample.sql`). Requires Node 22+.

| Script                    | What it does                                                               |
| ------------------------- | -------------------------------------------------------------------------- |
| `dev` / `build` / `start` | Standard Next.js                                                           |
| `test`                    | Vitest (data layer, actions, components) — uses a temp DB, never your data |
| `typecheck` / `lint`      | `tsc --noEmit` / ESLint                                                    |
| `format`                  | Prettier (with Tailwind class sorting)                                     |
| `snapshot`                | Dump DB → `db/seed.sql`                                                    |
| `snapshot:backup`         | …and also write `db/backups/seed.<timestamp>.sql`                          |
| `snapshot:dry`            | Print the SQL, write nothing                                               |

Env overrides (see `.env.example`): `DATA_DIR`, `SEED_PATH`.

## Migrating from the vanilla version

Stop the old server first, then either:

1. **Copy the database** — copy the _whole_ old `data/` folder into `data/` here
   (`problems.db` **and** `problems.db-wal` / `problems.db-shm` — recent changes live in the `-wal` file, so copying only `problems.db` can lose them), **or**
2. **Via seed** — in the old project run `npm run snapshot`, then copy its `seed.sql` to `db/seed.sql` here and start with an empty `data/`.

The schema and seed format are unchanged, so both directions stay compatible.

## Project structure

```
db/                       schema.sql · seed.sample.sql · (seed.sql, backups/ — gitignored)
scripts/snapshot.ts       CLI behind `npm run snapshot`
src/
├─ instrumentation.ts     opens the DB at server start (seed / auto-snapshot)
├─ app/                   routes — thin Server Components that load data and compose UI
│  ├─ page.tsx            tracker
│  └─ admin/{sheets,structure,problems,link}/page.tsx
├─ components/
│  ├─ ui/                 generic building blocks (Button, Card, Dialog, ActionForm, ParamSelect…)
│  ├─ domain/             badges: value → colour mappings
│  ├─ tracker/            TrackerBoard, PhaseCard, SectionBlock, ProblemRow, …
│  └─ admin/              field sets, lists, tree, section picker, link UI
├─ hooks/                 useRunAction · useParamNavigation · useDebouncedCallback
├─ lib/                   pure logic: constants, progress, filters, selection, helpers
├─ server/
│  ├─ db/                 connection, bootstrap, snapshot, singleton `getDb()`
│  ├─ repositories/       all SQL, one file per table (+ sheet-tree for the read model)
│  ├─ validation/         Zod schemas
│  └─ actions/            Server Actions ("use server") — thin: validate → repository
└─ types/                 domain types, ActionResult
tests/
```

### How it fits together

- **Reads**: Server Components call repositories directly — no JSON API, no client fetching.
  The sheet tree loads in 3 queries (the vanilla version fired one request per phase and per section).
- **Writes**: Server Actions. Every one goes through `runAction()` (`server/actions/run-action.ts`):
  validate with Zod → run → friendly error or `refresh()`. They always return `{ ok } | { ok: false, error }`.
- **UI state in the URL**: selected sheet (`?sheet=`), the admin section picker (`?sheet&phase&section`),
  search (`?q=`), and the problem being edited (`?edit=`). Refresh-safe and shareable.
- **Forms**: `<ActionForm>` is the single form component (pending state, toasts, keeps input on error,
  closes its dialog on success). Create and edit forms share one `*Fields` component each.
- **Tracker**: ticking is optimistic (`useOptimistic`); the Server Action persists it.

### Recipes

- **New platform / difficulty / tag colour** → edit `src/lib/constants.ts` (+ the tone map in `components/domain/badges.tsx`). Zod, selects and badges follow.
- **New field on problems** → `db/schema.sql` (+ a migration for existing DBs), `types/domain.ts`, `repositories/problems.ts`, `validation/schemas.ts`, `components/admin/problem-fields.tsx`.
- **New mutation** → repository function → Zod schema → 5-line action using `runAction` → call it from `<ActionForm>` / `<DeleteButton>` / `useRunAction`.
- **JSON API** (e.g. for a mobile app) → add `app/api/.../route.ts` calling the same repositories.

## Differences from the vanilla version

Behaviour changes you may notice (all intentional):

- Collapsed phases **stay collapsed** after ticking a problem (the old version re-opened them).
- Names/notes are **escaped** (the old `innerHTML` rendering was an HTML-injection hole); problem URLs must be `http(s)`.
- Empty phase badges / section tags are no longer rendered as empty pills.
- "Link problem" and "Problems in section" **share one section picker**, and already-linked problems show "Linked" instead of erroring.
- Forms submit with Enter; edit uses dialogs; admin tabs are real routes (`/admin/sheets`, …); the tracker has an "Admin" link.
- A fresh clone just works: `data/` is created automatically and the sample seed is used if there's no `seed.sql`.
- Search treats `%` and `_` literally.

## Security note

There is **no authentication** (same as before) — Server Actions are public endpoints. Fine on localhost;
if you ever deploy this, put auth in front of `/admin` _and_ inside the actions.
