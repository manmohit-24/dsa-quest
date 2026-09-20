import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "static")));

// ── Tracker API ───────────────────────────────────────────────

app.get("/api/sheets", (req, res) => {
  res.json(db.prepare("SELECT * FROM sheets ORDER BY id").all());
});

app.get("/api/sheets/:id", (req, res) => {
  const sheetId = parseInt(req.params.id);
  const sheet = db.prepare("SELECT * FROM sheets WHERE id = ?").get(sheetId);

  if (!sheet) {
    return res.status(404).json({ error: "Sheet not found" });
  }

  const phases = db
    .prepare("SELECT * FROM phases WHERE sheet_id = ? ORDER BY order_idx")
    .all(sheetId);

  sheet.phases = phases.map((phase) => {
    const sections = db
      .prepare("SELECT * FROM sections WHERE phase_id = ? ORDER BY order_idx")
      .all(phase.id);

    phase.sections = sections.map((section) => {
      section.problems = db
        .prepare(
          `
          SELECT
            sp.id AS sp_id,
            sp.priority,
            sp.order_idx,
            sp.done,
            sp.solved_at,
            p.id AS problem_id,
            p.name,
            p.difficulty,
            p.url,
            p.platform,
            p.notes
          FROM sheet_problems sp
          JOIN problems p ON p.id = sp.problem_id
          WHERE sp.section_id = ?
          ORDER BY sp.order_idx
          `,
        )
        .all(section.id);

      return section;
    });

    return phase;
  });

  res.json(sheet);
});

app.post("/api/toggle", (req, res) => {
  const { sp_id, done } = req.body;

  if (sp_id == null || done == null) {
    return res.status(400).json({ error: "Missing fields" });
  }

  db.prepare(
    "UPDATE sheet_problems SET done = ?, solved_at = ? WHERE id = ?",
  ).run(done ? 1 : 0, done ? new Date().toISOString() : null, sp_id);

  res.json({ ok: true });
});

// ── Admin API — Sheets ────────────────────────────────────────

app.post("/api/admin/sheets", (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name required" });
  }

  const r = db
    .prepare("INSERT INTO sheets (name, description) VALUES (?, ?)")
    .run(name, description || "");

  res.json({ id: r.lastInsertRowid });
});

app.put("/api/admin/sheets/:id", (req, res) => {
  const { name, description } = req.body;

  db.prepare("UPDATE sheets SET name = ?, description = ? WHERE id = ?").run(
    name,
    description || "",
    req.params.id,
  );

  res.json({ ok: true });
});

app.delete("/api/admin/sheets/:id", (req, res) => {
  db.prepare("DELETE FROM sheets WHERE id = ?").run(req.params.id);

  res.json({ ok: true });
});

// ── Admin API — Phases ────────────────────────────────────────

app.get("/api/admin/sheets/:id/phases", (req, res) => {
  res.json(
    db
      .prepare("SELECT * FROM phases WHERE sheet_id = ? ORDER BY order_idx")
      .all(req.params.id),
  );
});

app.post("/api/admin/phases", (req, res) => {
  const { sheet_id, title, badge, badge_type, order_idx } = req.body;

  if (!sheet_id || !title) {
    return res.status(400).json({ error: "sheet_id and title required" });
  }

  const maxOrder =
    db
      .prepare("SELECT MAX(order_idx) as m FROM phases WHERE sheet_id = ?")
      .get(sheet_id).m || 0;

  const r = db
    .prepare(
      `
      INSERT INTO phases
        (sheet_id, title, badge, badge_type, order_idx)
      VALUES (?, ?, ?, ?, ?)
      `,
    )
    .run(
      sheet_id,
      title,
      badge || "",
      badge_type || "accent",
      order_idx ?? maxOrder + 1,
    );

  res.json({ id: r.lastInsertRowid });
});

app.put("/api/admin/phases/:id", (req, res) => {
  const { title, badge, badge_type } = req.body;

  db.prepare(
    `
    UPDATE phases
    SET title = ?, badge = ?, badge_type = ?
    WHERE id = ?
    `,
  ).run(title, badge || "", badge_type || "accent", req.params.id);

  res.json({ ok: true });
});

app.delete("/api/admin/phases/:id", (req, res) => {
  db.prepare("DELETE FROM phases WHERE id = ?").run(req.params.id);

  res.json({ ok: true });
});

// ── Admin API — Sections ──────────────────────────────────────

app.get("/api/admin/phases/:id/sections", (req, res) => {
  res.json(
    db
      .prepare("SELECT * FROM sections WHERE phase_id = ? ORDER BY order_idx")
      .all(req.params.id),
  );
});

app.post("/api/admin/sections", (req, res) => {
  const { phase_id, title, tag, tag_type } = req.body;

  if (!phase_id || !title) {
    return res.status(400).json({ error: "phase_id and title required" });
  }

  const maxOrder =
    db
      .prepare("SELECT MAX(order_idx) as m FROM sections WHERE phase_id = ?")
      .get(phase_id).m || 0;

  const r = db
    .prepare(
      `
      INSERT INTO sections
        (phase_id, title, tag, tag_type, order_idx)
      VALUES (?, ?, ?, ?, ?)
      `,
    )
    .run(phase_id, title, tag || "", tag_type || "imp", maxOrder + 1);

  res.json({ id: r.lastInsertRowid });
});

app.put("/api/admin/sections/:id", (req, res) => {
  const { title, tag, tag_type } = req.body;

  db.prepare(
    `
    UPDATE sections
    SET title = ?, tag = ?, tag_type = ?
    WHERE id = ?
    `,
  ).run(title, tag || "", tag_type || "imp", req.params.id);

  res.json({ ok: true });
});

app.delete("/api/admin/sections/:id", (req, res) => {
  db.prepare("DELETE FROM sections WHERE id = ?").run(req.params.id);

  res.json({ ok: true });
});

// ── Admin API — Problems (global) ─────────────────────────────

app.get("/api/admin/problems", (req, res) => {
  const q = req.query.q || "";

  const problems = q
    ? db
        .prepare("SELECT * FROM problems WHERE name LIKE ? ORDER BY name")
        .all(`%${q}%`)
    : db.prepare("SELECT * FROM problems ORDER BY name").all();

  res.json(problems);
});

app.post("/api/admin/problems", (req, res) => {
  const { name, difficulty, url, platform, notes } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name required" });
  }

  const r = db
    .prepare(
      `
      INSERT INTO problems
        (name, difficulty, url, platform, notes)
      VALUES (?, ?, ?, ?, ?)
      `,
    )
    .run(
      name,
      difficulty || "medium",
      url || "",
      platform || "leetcode",
      notes || "",
    );

  res.json({ id: r.lastInsertRowid });
});

app.put("/api/admin/problems/:id", (req, res) => {
  const { name, difficulty, url, platform, notes } = req.body;

  db.prepare(
    `
    UPDATE problems
    SET
      name = ?,
      difficulty = ?,
      url = ?,
      platform = ?,
      notes = ?
    WHERE id = ?
    `,
  ).run(
    name,
    difficulty,
    url || "",
    platform || "leetcode",
    notes || "",
    req.params.id,
  );

  res.json({ ok: true });
});

app.delete("/api/admin/problems/:id", (req, res) => {
  db.prepare("DELETE FROM problems WHERE id = ?").run(req.params.id);

  res.json({ ok: true });
});

// ── Admin API — Link/Unlink problems to sections ──────────────

app.post("/api/admin/link", (req, res) => {
  const { section_id, problem_id, priority } = req.body;

  if (!section_id || !problem_id) {
    return res
      .status(400)
      .json({ error: "section_id and problem_id required" });
  }

  const maxOrder =
    db
      .prepare(
        `
        SELECT MAX(order_idx) as m
        FROM sheet_problems
        WHERE section_id = ?
        `,
      )
      .get(section_id).m || 0;

  try {
    const r = db
      .prepare(
        `
        INSERT INTO sheet_problems
          (section_id, problem_id, priority, order_idx)
        VALUES (?, ?, ?, ?)
        `,
      )
      .run(section_id, problem_id, priority || 2, maxOrder + 1);

    res.json({ id: r.lastInsertRowid });
  } catch (e) {
    res.status(409).json({
      error: "Problem already in this section",
    });
  }
});

app.put("/api/admin/link/:sp_id", (req, res) => {
  const { priority } = req.body;

  db.prepare("UPDATE sheet_problems SET priority = ? WHERE id = ?").run(
    priority,
    req.params.sp_id,
  );

  res.json({ ok: true });
});

app.delete("/api/admin/link/:sp_id", (req, res) => {
  db.prepare("DELETE FROM sheet_problems WHERE id = ?").run(req.params.sp_id);

  res.json({ ok: true });
});

// ── Serve admin page ──────────────────────────────────────────

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "admin.html"));
});

// ── Start server ──────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 DSA Tracker  →  http://localhost:${PORT}`);
  console.log(`🔧 Admin Panel  →  http://localhost:${PORT}/admin\n`);
});
