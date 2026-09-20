# dsa-quest

My DSA practice tracker — multi-sheet, priority-based, with auto-backup. Built to stop opening 5 tabs and forgetting where I left off.

---

## What it does

- **Multi-sheet support** — maintain separate sheets (NeetCode, Striver, custom) with independent progress
- **Priority system** — tag problems as P1 / P2 / P3 within each sheet's context
- **Admin panel** — create and manage sheets, phases, sections, and problems without touching any code or SQL
- **Platform agnostic** — LeetCode, Codeforces, GFG, or any custom URL
- **Auto-backup** — `seed.sql` is updated on every server start, so your data is never just in the DB
- **Progress persistence** — checkboxes save to SQLite, survive restarts, restore from seed if DB is wiped

---

## Stack

- **Backend** — Node.js + Express
- **Database** — SQLite via `better-sqlite3`
- **Frontend** — Vanilla HTML / CSS / JS (no framework)

---

## Getting started

```bash
# Clone
git clone https://github.com/manmohit24/dsa-quest.git
cd dsa-quest

# Copy sample seed.sql
cp seed.sample.sql seed.sql

# Install dependencies
npm install

# Start (auto-creates and seeds DB on first run)
npm start

# Open tracker
http://localhost:3000

# Open admin panel
http://localhost:3000/admin
```

---

## Project structure

```
dsa-quest/
  server.js       ← Express API + routes
  db.js           ← SQLite connection, auto-seed, auto-snapshot
  snapshot.js     ← DB → seed.sql exporter
  schema.sql      ← Table definitions
  seed.sql        ← Source of truth for problem data (auto-updated)
  seed.sample.sql ← Sample seed.sql with neetcode 75
  static/
    index.html    ← Tracker UI
    style.css     ← Shared styles
    tracker.js    ← Tracker logic
    admin.html    ← Admin panel
    admin.css     ← Admin styles
    admin.js      ← Admin logic
```

---

## How data flows

```
seed.sql  ──(first run)──▶  problems.db  ──(every start)──▶  seed.sql
                                  ▲
                            admin panel
                          (add/edit/link)
```

- First run: DB is empty → seeded from `seed.sql`
- Every subsequent run: DB → `seed.sql` auto-snapshot
- If DB is ever lost: `npm start` restores everything from `seed.sql`

---

## Snapshot commands

```bash
npm run snapshot          # manually update seed.sql from DB
npm run snapshot:backup   # update seed.sql + save timestamped backup
npm run snapshot:dry      # preview output without writing anything
```

---

## Adding problems

**Via admin panel** (recommended) — go to `/admin` and use the UI.

**Via seed.sql** (bulk import) — edit `seed.sql` directly, then:

```bash
# Wipe DB and re-seed (loses progress)
rm problems.db && npm start

# Or just add problems through admin to keep progress
```

---

## Database schema

```
sheets
  └── phases          (sheet_id)
        └── sections  (phase_id)
              └── sheet_problems (section_id + problem_id)
                        ↑
                   problems (global pool)

sheet_problems holds: priority, done, solved_at
Progress is per-sheet — same problem in two sheets = independent checkboxes
```

---

## Platforms supported

`leetcode` · `codeforces` · `gfg` · `custom`

---

## License

MIT
