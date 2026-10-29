import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Every test file gets its own throwaway database + seed file, so tests never
 * touch your real data/problems.db or db/seed.sql.
 * (Runs before the app modules are imported, which read these env vars.)
 */
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dsa-quest-test-"));

process.env.DATA_DIR = dir;
process.env.SEED_PATH = path.join(dir, "seed.sql");

fs.writeFileSync(
  process.env.SEED_PATH,
  `
INSERT INTO sheets (id, name, description) VALUES (1, 'Test Sheet', 'A sheet for tests');
INSERT INTO phases (id, sheet_id, title, badge, badge_type, order_idx) VALUES (1, 1, 'Phase 1', 'Core', 'danger', 1);
INSERT INTO sections (id, phase_id, title, tag, tag_type, order_idx) VALUES
  (1, 1, 'Arrays', 'imp', 'imp', 1),
  (2, 1, 'Trees', 'ext', 'ext', 2);
INSERT INTO problems (id, name, difficulty, url, platform, notes) VALUES
  (1, 'Two Sum', 'easy', 'https://leetcode.com/problems/two-sum', 'leetcode', NULL),
  (2, 'Three Sum', 'medium', 'https://leetcode.com/problems/3sum', 'leetcode', 'it''s a classic'),
  (3, 'Unlinked 100%_Problem', 'hard', '', 'custom', NULL);
INSERT INTO sheet_problems (id, section_id, problem_id, priority, order_idx, done, solved_at) VALUES
  (1, 1, 1, 1, 1, 0, NULL),
  (2, 1, 2, 2, 2, 1, '2026-01-01T00:00:00.000Z'),
  (3, 2, 1, 3, 1, 0, NULL);
`,
);
