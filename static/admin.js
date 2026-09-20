// ── Helpers ───────────────────────────────────────────────────

async function api(url, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return res.json();
}

function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function diffBadge(d) {
  return `<span class="prob-diff ${d}">${d}</span>`;
}
function platformBadge(p) {
  return `<span class="platform-badge">${p}</span>`;
}
function priorityBadge(p) {
  return `<span class="prob-priority priority-${p}">P${p}</span>`;
}

// ── Tabs ──────────────────────────────────────────────────────

function showTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
  document.querySelectorAll('.tab-btn').forEach(b => {
    if (b.textContent.toLowerCase().includes(name === 'link' ? 'link' : name === 'phases' ? 'phase' : name))
      b.classList.add('active');
  });
}

// ── Boot ──────────────────────────────────────────────────────

let allSheets = [];

async function boot() {
  allSheets = await api('/api/sheets');
  populateSheetSelects();
  loadSheetsList();
  loadProblems();
  loadBrowse();
  loadPhasesForSection();
  loadPhasesForLink();
  loadPhasesForView();
}

function populateSheetSelects() {
  const selects = ['phase-sheet', 'section-sheet', 'browse-sheet', 'link-sheet', 'view-sheet'];
  selects.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = allSheets.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  });
}

// ── SHEETS ────────────────────────────────────────────────────

async function loadSheetsList() {
  allSheets = await api('/api/sheets');
  populateSheetSelects();
  const el = document.getElementById('sheets-list');
  if (!allSheets.length) { el.innerHTML = '<div class="empty-state">No sheets yet.</div>'; return; }
  el.innerHTML = allSheets.map(s => `
    <div class="list-row" id="sheet-row-${s.id}">
      <div class="list-row-name">
        <strong>${s.name}</strong>
        <span class="list-row-meta"> — ${s.description || 'no description'}</span>
      </div>
      <div class="list-row-actions">
        <button class="btn btn-sm" onclick="editSheet(${s.id}, '${esc(s.name)}', '${esc(s.description || '')}')">Edit</button>
        <button class="btn btn-danger" onclick="deleteSheet(${s.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

async function createSheet() {
  const name = document.getElementById('sheet-name').value.trim();
  const desc = document.getElementById('sheet-desc').value.trim();
  if (!name) return toast('Sheet name is required');
  await api('/api/admin/sheets', 'POST', { name, description: desc });
  document.getElementById('sheet-name').value = '';
  document.getElementById('sheet-desc').value = '';
  toast('Sheet created ✓');
  loadSheetsList();
}

function editSheet(id, name, desc) {
  const row = document.getElementById(`sheet-row-${id}`);
  row.innerHTML = `
    <input class="edit-input" id="edit-sheet-name-${id}" value="${name}" />
    <input class="edit-input" id="edit-sheet-desc-${id}" value="${desc}" placeholder="Description" />
    <div class="list-row-actions">
      <button class="btn btn-primary btn-sm" onclick="saveSheet(${id})">Save</button>
      <button class="btn btn-sm" onclick="loadSheetsList()">Cancel</button>
    </div>
  `;
}

async function saveSheet(id) {
  const name = document.getElementById(`edit-sheet-name-${id}`).value.trim();
  const desc = document.getElementById(`edit-sheet-desc-${id}`).value.trim();
  if (!name) return toast('Name required');
  await api(`/api/admin/sheets/${id}`, 'PUT', { name, description: desc });
  toast('Saved ✓');
  loadSheetsList();
}

async function deleteSheet(id) {
  if (!confirm('Delete this sheet? All its phases and sections will be removed. Problems remain in the global pool.')) return;
  await api(`/api/admin/sheets/${id}`, 'DELETE');
  toast('Sheet deleted');
  loadSheetsList();
}

// ── PHASES ────────────────────────────────────────────────────

async function createPhase() {
  const sheet_id = document.getElementById('phase-sheet').value;
  const title = document.getElementById('phase-title').value.trim();
  const badge = document.getElementById('phase-badge').value.trim();
  const badge_type = document.getElementById('phase-badge-type').value;
  if (!title) return toast('Phase title required');
  await api('/api/admin/phases', 'POST', { sheet_id, title, badge, badge_type });
  document.getElementById('phase-title').value = '';
  document.getElementById('phase-badge').value = '';
  toast('Phase added ✓');
  loadBrowse();
  loadPhasesForSection();
  loadPhasesForLink();
  loadPhasesForView();
}

// ── SECTIONS ──────────────────────────────────────────────────

async function loadPhasesForSection() {
  const sheetId = document.getElementById('section-sheet').value;
  if (!sheetId) return;
  const phases = await api(`/api/admin/sheets/${sheetId}/phases`);
  document.getElementById('section-phase').innerHTML =
    phases.map(p => `<option value="${p.id}">${p.title}</option>`).join('') ||
    '<option disabled>No phases yet</option>';
}

async function createSection() {
  const phase_id = document.getElementById('section-phase').value;
  const title = document.getElementById('section-title').value.trim();
  const tag = document.getElementById('section-tag').value.trim();
  const tag_type = document.getElementById('section-tag-type').value;
  if (!title) return toast('Section title required');
  await api('/api/admin/sections', 'POST', { phase_id, title, tag, tag_type });
  document.getElementById('section-title').value = '';
  document.getElementById('section-tag').value = '';
  toast('Section added ✓');
  loadBrowse();
  loadSectionsForLink();
  loadSectionsForView();
}

// ── BROWSE TREE ───────────────────────────────────────────────

async function loadBrowse() {
  const sheetId = document.getElementById('browse-sheet').value;
  if (!sheetId) return;
  const phases = await api(`/api/admin/sheets/${sheetId}/phases`);
  const el = document.getElementById('browse-tree');
  if (!phases.length) { el.innerHTML = '<div class="empty-state">No phases yet.</div>'; return; }

  let html = '';
  for (const ph of phases) {
    const sections = await api(`/api/admin/phases/${ph.id}/sections`);
    html += `
      <div class="tree-phase">
        <div class="tree-phase-title">
          📁 ${ph.title}
          <span class="phase-badge badge-${ph.badge_type}">${ph.badge}</span>
          <button class="btn btn-sm" onclick="editPhase(${ph.id}, '${esc(ph.title)}', '${esc(ph.badge)}', '${ph.badge_type}')">Edit</button>
          <button class="btn btn-danger" onclick="deletePhase(${ph.id})">Delete</button>
        </div>
        ${sections.map(s => `
          <div class="tree-section">
            <span class="tree-section-name">📂 ${s.title} <span class="section-tag tag-${s.tag_type}">${s.tag}</span></span>
            <button class="btn btn-sm" onclick="editSection(${s.id}, '${esc(s.title)}', '${esc(s.tag)}', '${s.tag_type}')">Edit</button>
            <button class="btn btn-danger" onclick="deleteSection(${s.id})">Delete</button>
          </div>
        `).join('')}
        ${!sections.length ? '<div class="tree-section" style="color:var(--text-muted)">No sections yet</div>' : ''}
      </div>`;
  }
  el.innerHTML = html;
}

function editPhase(id, title, badge, badge_type) {
  const modal = buildModal(`
    <h3 style="margin-bottom:1rem;font-size:15px;">Edit Phase</h3>
    <div class="form-row" style="flex-direction:column;">
      <input class="input" id="m-phase-title" value="${title}" placeholder="Title" />
      <input class="input" id="m-phase-badge" value="${badge}" placeholder="Badge text" />
      <select class="input" id="m-phase-badge-type">
        <option value="danger" ${badge_type==='danger'?'selected':''}>danger (red)</option>
        <option value="accent" ${badge_type==='accent'?'selected':''}>accent (blue)</option>
        <option value="success" ${badge_type==='success'?'selected':''}>success (green)</option>
      </select>
      <div style="display:flex;gap:8px;margin-top:4px;">
        <button class="btn btn-primary" onclick="savePhase(${id})">Save</button>
        <button class="btn" onclick="closeModal()">Cancel</button>
      </div>
    </div>
  `);
}

async function savePhase(id) {
  const title = document.getElementById('m-phase-title').value.trim();
  const badge = document.getElementById('m-phase-badge').value.trim();
  const badge_type = document.getElementById('m-phase-badge-type').value;
  await api(`/api/admin/phases/${id}`, 'PUT', { title, badge, badge_type });
  closeModal(); toast('Saved ✓'); loadBrowse();
}

async function deletePhase(id) {
  if (!confirm('Delete this phase and all its sections?')) return;
  await api(`/api/admin/phases/${id}`, 'DELETE');
  toast('Phase deleted'); loadBrowse();
}

function editSection(id, title, tag, tag_type) {
  buildModal(`
    <h3 style="margin-bottom:1rem;font-size:15px;">Edit Section</h3>
    <div class="form-row" style="flex-direction:column;">
      <input class="input" id="m-sec-title" value="${title}" placeholder="Title" />
      <input class="input" id="m-sec-tag" value="${tag}" placeholder="Tag text" />
      <select class="input" id="m-sec-tag-type">
        <option value="jtg" ${tag_type==='jtg'?'selected':''}>jtg (red)</option>
        <option value="imp" ${tag_type==='imp'?'selected':''}>imp (orange)</option>
        <option value="ext" ${tag_type==='ext'?'selected':''}>ext (green)</option>
      </select>
      <div style="display:flex;gap:8px;margin-top:4px;">
        <button class="btn btn-primary" onclick="saveSection(${id})">Save</button>
        <button class="btn" onclick="closeModal()">Cancel</button>
      </div>
    </div>
  `);
}

async function saveSection(id) {
  const title = document.getElementById('m-sec-title').value.trim();
  const tag = document.getElementById('m-sec-tag').value.trim();
  const tag_type = document.getElementById('m-sec-tag-type').value;
  await api(`/api/admin/sections/${id}`, 'PUT', { title, tag, tag_type });
  closeModal(); toast('Saved ✓'); loadBrowse();
}

async function deleteSection(id) {
  if (!confirm('Delete this section? Problems will be unlinked but not deleted.')) return;
  await api(`/api/admin/sections/${id}`, 'DELETE');
  toast('Section deleted'); loadBrowse();
}

// ── PROBLEMS ──────────────────────────────────────────────────

let problemsCache = [];

async function loadProblems(q = '') {
  problemsCache = await api(`/api/admin/problems${q ? '?q=' + encodeURIComponent(q) : ''}`);
  renderProblems();
}

function renderProblems() {
  const el = document.getElementById('problems-list');
  if (!problemsCache.length) { el.innerHTML = '<div class="empty-state">No problems found.</div>'; return; }
  el.innerHTML = problemsCache.map(p => `
    <div class="list-row" id="prob-row-${p.id}">
      <div class="list-row-name">
        ${p.name}
        ${diffBadge(p.difficulty)}
        ${platformBadge(p.platform)}
        ${p.url ? `<a href="${p.url}" target="_blank" class="prob-link" style="margin-left:4px;">↗</a>` : ''}
      </div>
      <div class="list-row-actions">
        <button class="btn btn-sm" onclick="editProblem(${p.id})">Edit</button>
        <button class="btn btn-danger" onclick="deleteProblem(${p.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function searchProblems() {
  const q = document.getElementById('prob-search').value.trim();
  loadProblems(q);
}

async function createProblem() {
  const name = document.getElementById('prob-name').value.trim();
  if (!name) return toast('Problem name required');
  await api('/api/admin/problems', 'POST', {
    name,
    difficulty: document.getElementById('prob-difficulty').value,
    platform: document.getElementById('prob-platform').value,
    url: document.getElementById('prob-url').value.trim(),
    notes: document.getElementById('prob-notes').value.trim(),
  });
  ['prob-name','prob-url','prob-notes'].forEach(id => document.getElementById(id).value = '');
  toast('Problem created ✓');
  loadProblems();
}

function editProblem(id) {
  const p = problemsCache.find(x => x.id === id);
  if (!p) return;
  buildModal(`
    <h3 style="margin-bottom:1rem;font-size:15px;">Edit Problem</h3>
    <div class="form-row" style="flex-direction:column;">
      <input class="input" id="m-prob-name" value="${esc(p.name)}" placeholder="Name" />
      <select class="input" id="m-prob-diff">
        <option value="easy" ${p.difficulty==='easy'?'selected':''}>Easy</option>
        <option value="medium" ${p.difficulty==='medium'?'selected':''}>Medium</option>
        <option value="hard" ${p.difficulty==='hard'?'selected':''}>Hard</option>
      </select>
      <select class="input" id="m-prob-plat">
        <option value="leetcode" ${p.platform==='leetcode'?'selected':''}>LeetCode</option>
        <option value="codeforces" ${p.platform==='codeforces'?'selected':''}>Codeforces</option>
        <option value="gfg" ${p.platform==='gfg'?'selected':''}>GFG</option>
        <option value="custom" ${p.platform==='custom'?'selected':''}>Custom</option>
      </select>
      <input class="input" id="m-prob-url" value="${esc(p.url||'')}" placeholder="URL" />
      <input class="input" id="m-prob-notes" value="${esc(p.notes||'')}" placeholder="Notes" />
      <div style="display:flex;gap:8px;margin-top:4px;">
        <button class="btn btn-primary" onclick="saveProblem(${id})">Save</button>
        <button class="btn" onclick="closeModal()">Cancel</button>
      </div>
    </div>
  `);
}

async function saveProblem(id) {
  await api(`/api/admin/problems/${id}`, 'PUT', {
    name: document.getElementById('m-prob-name').value.trim(),
    difficulty: document.getElementById('m-prob-diff').value,
    platform: document.getElementById('m-prob-plat').value,
    url: document.getElementById('m-prob-url').value.trim(),
    notes: document.getElementById('m-prob-notes').value.trim(),
  });
  closeModal(); toast('Saved ✓'); loadProblems();
}

async function deleteProblem(id) {
  if (!confirm('Delete this problem globally? It will be removed from all sheets.')) return;
  await api(`/api/admin/problems/${id}`, 'DELETE');
  toast('Problem deleted'); loadProblems();
}

// ── LINK ──────────────────────────────────────────────────────

async function loadPhasesForLink() {
  const sheetId = document.getElementById('link-sheet').value;
  if (!sheetId) return;
  const phases = await api(`/api/admin/sheets/${sheetId}/phases`);
  document.getElementById('link-phase').innerHTML =
    phases.map(p => `<option value="${p.id}">${p.title}</option>`).join('') ||
    '<option disabled>No phases</option>';
  loadSectionsForLink();
}

async function loadSectionsForLink() {
  const phaseId = document.getElementById('link-phase').value;
  if (!phaseId) return;
  const sections = await api(`/api/admin/phases/${phaseId}/sections`);
  document.getElementById('link-section').innerHTML =
    sections.map(s => `<option value="${s.id}">${s.title}</option>`).join('') ||
    '<option disabled>No sections</option>';
}

let linkSearchTimeout;
function searchLink() {
  clearTimeout(linkSearchTimeout);
  linkSearchTimeout = setTimeout(async () => {
    const q = document.getElementById('link-search').value.trim();
    if (!q) { document.getElementById('link-results').innerHTML = ''; return; }
    const results = await api(`/api/admin/problems?q=${encodeURIComponent(q)}`);
    const el = document.getElementById('link-results');
    if (!results.length) { el.innerHTML = '<div class="empty-state">No problems found.</div>'; return; }
    el.innerHTML = results.slice(0, 10).map(p => `
      <div class="search-result" onclick="linkProblem(${p.id})">
        <span class="search-result-name">${p.name}</span>
        ${diffBadge(p.difficulty)}
        ${platformBadge(p.platform)}
        <span style="font-size:12px;color:var(--text-accent);">+ Add</span>
      </div>
    `).join('');
  }, 250);
}

async function linkProblem(problemId) {
  const section_id = document.getElementById('link-section').value;
  const priority = document.getElementById('link-priority').value;
  if (!section_id) return toast('Select a section first');
  const res = await api('/api/admin/link', 'POST', { section_id, problem_id: problemId, priority });
  if (res.error) return toast(res.error);
  toast('Problem linked ✓');
  document.getElementById('link-search').value = '';
  document.getElementById('link-results').innerHTML = '';
  loadSectionProblems();
}

// ── VIEW SECTION PROBLEMS ─────────────────────────────────────

async function loadPhasesForView() {
  const sheetId = document.getElementById('view-sheet').value;
  if (!sheetId) return;
  const phases = await api(`/api/admin/sheets/${sheetId}/phases`);
  document.getElementById('view-phase').innerHTML =
    phases.map(p => `<option value="${p.id}">${p.title}</option>`).join('') ||
    '<option disabled>No phases</option>';
  loadSectionsForView();
}

async function loadSectionsForView() {
  const phaseId = document.getElementById('view-phase').value;
  if (!phaseId) return;
  const sections = await api(`/api/admin/phases/${phaseId}/sections`);
  document.getElementById('view-section').innerHTML =
    sections.map(s => `<option value="${s.id}">${s.title}</option>`).join('') ||
    '<option disabled>No sections</option>';
  loadSectionProblems();
}

async function loadSectionProblems() {
  const sectionId = document.getElementById('view-section').value;
  if (!sectionId) return;
  const sheetId = document.getElementById('view-sheet').value;

  const res = await api(`/api/sheets/${sheetId}`);
  let problems = [];
  res.phases.forEach(ph => ph.sections.forEach(sec => {
    if (String(sec.id) === String(sectionId)) problems = sec.problems;
  }));

  const el = document.getElementById('section-problems');
  if (!problems.length) { el.innerHTML = '<div class="empty-state">No problems linked yet.</div>'; return; }
  el.innerHTML = problems.map(p => `
    <div class="list-row">
      <div class="list-row-name">
        ${p.name}
        ${diffBadge(p.difficulty)}
        ${platformBadge(p.platform)}
        ${priorityBadge(p.priority)}
      </div>
      <div class="list-row-actions">
        <select class="input" style="min-width:unset;width:130px;" onchange="updatePriority(${p.sp_id}, this.value)">
          <option value="1" ${p.priority==1?'selected':''}>P1 — Must</option>
          <option value="2" ${p.priority==2?'selected':''}>P2 — Important</option>
          <option value="3" ${p.priority==3?'selected':''}>P3 — Good to have</option>
        </select>
        <button class="btn btn-danger" onclick="unlinkProblem(${p.sp_id})">Remove</button>
      </div>
    </div>
  `).join('');
}

async function updatePriority(spId, priority) {
  await api(`/api/admin/link/${spId}`, 'PUT', { priority: parseInt(priority) });
  toast('Priority updated ✓');
}

async function unlinkProblem(spId) {
  if (!confirm('Remove this problem from the section?')) return;
  await api(`/api/admin/link/${spId}`, 'DELETE');
  toast('Removed ✓');
  loadSectionProblems();
}

// ── Modal ─────────────────────────────────────────────────────

function buildModal(html) {
  let overlay = document.getElementById('modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;z-index:100;
    `;
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div style="background:var(--bg);border-radius:var(--radius);padding:1.5rem;min-width:340px;max-width:480px;width:90%;">
      ${html}
    </div>`;
  overlay.style.display = 'flex';
}

function closeModal() {
  const o = document.getElementById('modal-overlay');
  if (o) o.style.display = 'none';
}

// ── Escape helper ─────────────────────────────────────────────
function esc(s) { return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

// ── Boot ──────────────────────────────────────────────────────
boot();
