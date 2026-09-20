const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));

// ── GET /api/sheets ───────────────────────────────────────────
// List all sheets
app.get('/api/sheets', (req, res) => {
  const sheets = db.prepare('SELECT * FROM sheets ORDER BY id').all();
  res.json(sheets);
});

// ── GET /api/sheets/:id ───────────────────────────────────────
// Full sheet data: phases → sections → problems + done status
app.get('/api/sheets/:id', (req, res) => {
  const sheetId = parseInt(req.params.id);

  const sheet = db.prepare('SELECT * FROM sheets WHERE id = ?').get(sheetId);
  if (!sheet) return res.status(404).json({ error: 'Sheet not found' });

  const phases = db.prepare(
    'SELECT * FROM phases WHERE sheet_id = ? ORDER BY order_idx'
  ).all(sheetId);

  sheet.phases = phases.map(phase => {
    const sections = db.prepare(
      'SELECT * FROM sections WHERE phase_id = ? ORDER BY order_idx'
    ).all(phase.id);

    phase.sections = sections.map(section => {
      const problems = db.prepare(`
        SELECT
          sp.id         AS sp_id,
          sp.priority,
          sp.order_idx,
          sp.done,
          sp.solved_at,
          p.id          AS problem_id,
          p.name,
          p.difficulty,
          p.url,
          p.platform,
          p.notes
        FROM sheet_problems sp
        JOIN problems p ON p.id = sp.problem_id
        WHERE sp.section_id = ?
        ORDER BY sp.order_idx
      `).all(section.id);

      section.problems = problems;
      return section;
    });

    return phase;
  });

  res.json(sheet);
});

// ── POST /api/toggle ──────────────────────────────────────────
// Toggle done status for a sheet_problem row
app.post('/api/toggle', (req, res) => {
  const { sp_id, done } = req.body;
  if (sp_id == null || done == null) {
    return res.status(400).json({ error: 'Missing sp_id or done' });
  }

  db.prepare(`
    UPDATE sheet_problems
    SET done = ?, solved_at = ?
    WHERE id = ?
  `).run(done ? 1 : 0, done ? new Date().toISOString() : null, sp_id);

  res.json({ ok: true });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 DSA Tracker running at http://localhost:${PORT}\n`);
});
