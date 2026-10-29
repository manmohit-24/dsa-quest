PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- PROBLEMS
-- Global, platform-agnostic. Each problem exists once.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problems (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  difficulty  TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
  url         TEXT,
  platform    TEXT CHECK(platform IN ('leetcode', 'codeforces', 'gfg', 'custom')),
  notes       TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- SHEETS
-- A curated list. e.g. NeetCode 150, Striver, JTG Custom.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sheets (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- PHASES
-- A group within a sheet. e.g. "Phase 1 — JTG Core"
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS phases (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  sheet_id    INTEGER NOT NULL REFERENCES sheets(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  badge       TEXT,
  badge_type  TEXT CHECK(badge_type IN ('danger', 'accent', 'success')),
  order_idx   INTEGER DEFAULT 0
);

-- ------------------------------------------------------------
-- SECTIONS
-- A topic group within a phase. e.g. "Trees", "Linked Lists"
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sections (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  phase_id    INTEGER NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  tag         TEXT,
  tag_type    TEXT CHECK(tag_type IN ('jtg', 'imp', 'ext')),
  order_idx   INTEGER DEFAULT 0
);

-- ------------------------------------------------------------
-- SHEET_PROBLEMS
-- Join table + progress. Problems per section, with priority
-- and done flag. Per-sheet progress naturally from section→phase→sheet.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sheet_problems (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id  INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  problem_id  INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  priority    INTEGER DEFAULT 2 CHECK(priority IN (1, 2, 3)),
  order_idx   INTEGER DEFAULT 0,
  done        INTEGER DEFAULT 0,
  solved_at   DATETIME,
  UNIQUE(section_id, problem_id)
);

-- ------------------------------------------------------------
-- INDEXES
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_phases_sheet    ON phases(sheet_id);
CREATE INDEX IF NOT EXISTS idx_sections_phase  ON sections(phase_id);
CREATE INDEX IF NOT EXISTS idx_sp_section      ON sheet_problems(section_id);
CREATE INDEX IF NOT EXISTS idx_sp_problem      ON sheet_problems(problem_id);
CREATE INDEX IF NOT EXISTS idx_problems_plat   ON problems(platform);
