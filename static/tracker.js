// ── State ─────────────────────────────────────────────────────
let currentSheet = null;
let currentFilter = 'all';
let sheetData = null;

// ── Boot ──────────────────────────────────────────────────────
async function boot() {
  const sheets = await api('/api/sheets');
  const select = document.getElementById('sheet-select');
  select.innerHTML = sheets.map(s =>
    `<option value="${s.id}">${s.name}</option>`
  ).join('');
  if (sheets.length) loadSheet(sheets[0].id);
}

async function loadSheet(id) {
  currentSheet = parseInt(id);
  document.getElementById('phases').innerHTML = `<div class="loading">Loading...</div>`;
  sheetData = await api(`/api/sheets/${id}`);
  renderStats();
  renderPhases();
}

// ── API helper ────────────────────────────────────────────────
async function api(url, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return res.json();
}

// ── Filter ────────────────────────────────────────────────────
function setFilter(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderPhases();
}

// ── Stats ─────────────────────────────────────────────────────
function renderStats() {
  if (!sheetData) return;
  let total = 0, done = 0, p1Total = 0, p1Done = 0;
  sheetData.phases.forEach(ph => ph.sections.forEach(sec => sec.problems.forEach(p => {
    total++;
    if (p.done) done++;
    if (p.priority === 1) { p1Total++; if (p.done) p1Done++; }
  })));
  const pct = total ? Math.round(done / total * 100) : 0;
  document.getElementById('stats').innerHTML = `
    <div class="stat"><div class="stat-num">${done}/${total}</div><div class="stat-label">Problems done</div></div>
    <div class="stat"><div class="stat-num">${pct}%</div><div class="stat-label">Overall</div></div>
    <div class="stat"><div class="stat-num">${p1Done}/${p1Total}</div><div class="stat-label">Priority 1 done</div></div>
    <div class="stat"><div class="stat-num">${total - done}</div><div class="stat-label">Remaining</div></div>
  `;
}

// ── Render phases ─────────────────────────────────────────────
function renderPhases() {
  if (!sheetData) return;
  const container = document.getElementById('phases');
  container.innerHTML = '';

  sheetData.phases.forEach((phase, pi) => {
    // Count phase totals
    let phTotal = 0, phDone = 0;
    phase.sections.forEach(sec => sec.problems.forEach(p => {
      phTotal++; if (p.done) phDone++;
    }));
    const phPct = phTotal ? Math.round(phDone / phTotal * 100) : 0;

    // Build sections HTML
    let sectionsHTML = '';
    phase.sections.forEach(sec => {
      const filtered = sec.problems.filter(p => {
        if (currentFilter === 'pending') return !p.done;
        if (currentFilter === 'done')    return p.done;
        if (currentFilter === 'p1')      return p.priority === 1;
        if (currentFilter === 'p2')      return p.priority === 2;
        if (currentFilter === 'p3')      return p.priority === 3;
        return true;
      });
      if (!filtered.length) return;

      const probsHTML = filtered.map(p => `
        <div class="problem-row${p.done ? ' done' : ''}" onclick="toggle(${p.sp_id})">
          <div class="checkbox"><span class="check-icon">✓</span></div>
          <span class="prob-name">${p.name}</span>
          <span class="prob-priority priority-${p.priority}">P${p.priority}</span>
          <span class="prob-diff ${p.difficulty}">${p.difficulty}</span>
          <span class="platform-badge">${p.platform}</span>
          ${p.url ? `<a class="prob-link" href="${p.url}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Open ↗</a>` : ''}
        </div>
      `).join('');

      sectionsHTML += `
        <div class="section">
          <div class="section-title">
            ${sec.title}
            <span class="section-tag tag-${sec.tag_type}">${sec.tag}</span>
          </div>
          ${probsHTML}
        </div>`;
    });

    if (!sectionsHTML) return;

    const phDiv = document.createElement('div');
    phDiv.className = 'phase';
    phDiv.innerHTML = `
      <div class="phase-header" onclick="togglePhase(${pi})">
        <span class="phase-title">${phase.title}</span>
        <span class="phase-badge badge-${phase.badge_type}">${phase.badge}</span>
        <span class="phase-progress">${phDone}/${phTotal}</span>
        <span class="chevron${pi === 0 ? ' open' : ''}" id="chev-${pi}">▼</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${phPct}%"></div>
      </div>
      <div class="phase-body${pi === 0 ? ' open' : ''}" id="body-${pi}">
        ${sectionsHTML}
      </div>
    `;
    container.appendChild(phDiv);
  });
}

// ── Toggle problem done ───────────────────────────────────────
async function toggle(spId) {
  // Find problem in sheetData and flip done
  let target = null;
  sheetData.phases.forEach(ph => ph.sections.forEach(sec => sec.problems.forEach(p => {
    if (p.sp_id === spId) target = p;
  })));
  if (!target) return;

  target.done = target.done ? 0 : 1;

  // Persist to server
  await api('/api/toggle', 'POST', { sp_id: spId, done: !!target.done });

  renderStats();
  renderPhases();
}

// ── Toggle phase open/close ───────────────────────────────────
function togglePhase(idx) {
  const body = document.getElementById(`body-${idx}`);
  const chev = document.getElementById(`chev-${idx}`);
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  chev.classList.toggle('open', !isOpen);
}

// ── Start ─────────────────────────────────────────────────────
boot();
