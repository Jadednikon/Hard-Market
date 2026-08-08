// ============================================================
// HARD MARKET — UI / MAIN CONTROLLER
// ============================================================

let GAME = null;
let SELECTED_CHARACTER = null;
let SELECTED_CAREER = null;

// ---------------- BOOT ----------------
window.addEventListener('DOMContentLoaded', () => {
  renderCharacterCards();
  renderCareerCards();
  const existing = loadGame();
  if (existing) {
    document.getElementById('btn-continue').style.display = '';
    document.getElementById('btn-reset').style.display = '';
  }
});

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function toast(msg) {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; }, 2200);
  setTimeout(() => t.remove(), 2600);
}

// ---------------- CHARACTER / CAREER SELECT ----------------
function renderCharacterCards() {
  const grid = document.getElementById('character-cards');
  grid.innerHTML = CHARACTERS.map(c => `
    <div class="select-card" id="char-card-${c.id}" onclick="selectCharacter('${c.id}')">
      <div class="portrait-frame">${getPortraitSVG(c.id)}</div>
      <div class="select-card-body">
        <div class="select-card-title">${c.name} — ${c.title}</div>
        <div class="select-card-desc">${c.desc}</div>
      </div>
    </div>
  `).join('');
}

function selectCharacter(id) {
  SELECTED_CHARACTER = id;
  document.querySelectorAll('#character-cards .select-card').forEach(el => el.classList.remove('selected'));
  document.getElementById('char-card-' + id).classList.add('selected');
  document.getElementById('btn-character-next').disabled = false;
}

function goToCareerSelect() {
  showScreen('screen-career');
}

function renderCareerCards() {
  const grid = document.getElementById('career-cards');
  grid.innerHTML = CAREER_MODES.map(c => `
    <div class="select-card" id="career-card-${c.id}" onclick="selectCareer('${c.id}')">
      <div class="portrait-frame" style="display:flex;align-items:center;justify-content:center;font-size:1.6rem;">
        ${c.id === 'scrappy' ? '🔧' : c.id === 'owner' ? '🏢' : '🎯'}
      </div>
      <div class="select-card-body">
        <div class="select-card-title">${c.name}</div>
        <div class="select-card-desc">${c.desc}</div>
      </div>
    </div>
  `).join('');
}

function selectCareer(id) {
  SELECTED_CAREER = id;
  document.querySelectorAll('#career-cards .select-card').forEach(el => el.classList.remove('selected'));
  document.getElementById('career-card-' + id).classList.add('selected');
  document.getElementById('btn-career-next').disabled = false;
}

function startNewGameFlow() {
  showScreen('screen-character');
}

function beginGame() {
  GAME = newGameState(SELECTED_CHARACTER, SELECTED_CAREER);
  refreshProspects(GAME);
  log(GAME, `Day 1. New agent, borrowed desk, big dreams.`);
  saveGame(GAME);
  enterOffice();
}

function continueGame() {
  const loaded = loadGame();
  if (!loaded) { toast('No save found.'); return; }
  GAME = loaded;
  enterOffice();
}

function confirmReset() {
  showConfirm('Reset save?', 'This will permanently delete your current agency. This cannot be undone.', () => {
    deleteSave();
    document.getElementById('btn-continue').style.display = 'none';
    document.getElementById('btn-reset').style.display = 'none';
    toast('Save deleted.');
  });
}

// ---------------- OFFICE SCREEN ----------------
function enterOffice() {
  showScreen('screen-office');
  buildOfficeScene();
  refreshTopbar();
  refreshStatStrip();
  if (GAME.flags.justLeveledUp) {
    GAME.flags.justLeveledUp = false;
    showLevelUpModal();
  } else {
    maybeTriggerDailyEvent();
  }
}

function buildOfficeScene() {
  const scene = document.getElementById('office-scene');
  const character = CHARACTERS.find(c => c.id === GAME.meta.characterId);
  scene.innerHTML = `
    <div class="office-bg">${officeBackgroundLevel1()}</div>
    <div id="player-sprite" style="left:50%;top:78%;">${playerSpriteSVG(character)}</div>
  `;
  OFFICE_HOTSPOTS_L1.forEach(h => {
    const el = document.createElement('div');
    el.className = 'hotspot pulse';
    el.style.left = h.left; el.style.top = h.top;
    el.style.width = h.width; el.style.height = h.height;
    el.innerHTML = `${hotspotIconSVG(h.id)}<span class="hotspot-label">${h.label}</span>`;
    el.onclick = () => walkToAndOpen(h);
    scene.appendChild(el);
  });
}

function walkToAndOpen(hotspot) {
  const sprite = document.getElementById('player-sprite');
  sprite.style.left = hotspot.standLeft;
  sprite.style.top = hotspot.standTop;
  setTimeout(() => {
    if (hotspot.id === 'phone') openProspects();
    else if (hotspot.id === 'computer') openMarket();
    else if (hotspot.id === 'files') openClients();
    else if (hotspot.id === 'desk') openNetworking();
  }, 380);
}

function showOfficeHome() {
  setActiveNav('office');
}

function setActiveNav(id) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.nav-btn[data-nav="${id}"]`);
  if (btn) btn.classList.add('active');
}

function refreshTopbar() {
  document.getElementById('topbar-date').textContent =
    `Day ${GAME.meta.day} · Week ${GAME.meta.week} · Level ${GAME.meta.level}`;
}

function barColor(pct, invert = false) {
  const good = invert ? pct < 33 : pct > 66;
  const mid = pct >= 33 && pct <= 66;
  if (good) return 'var(--green)';
  if (mid) return 'var(--gold)';
  return 'var(--red)';
}

function refreshStatStrip() {
  const r = GAME.resources;
  const strip = document.getElementById('stat-strip');
  strip.innerHTML = `
    <div class="stat-row"><span class="stat-label">CASH</span><span class="stat-value" style="color:${r.cash < 0 ? 'var(--red)' : 'var(--cream)'}">$${r.cash.toLocaleString()}</span></div>
    <div class="stat-row"><span class="stat-label">TIME</span><span class="stat-value">${r.time}/${r.timeMax}</span></div>
    <div class="stat-row"><span class="stat-label">BOOK</span><span class="stat-value">$${r.bookPremium.toLocaleString()}</span></div>
    <div class="stat-row"><span class="stat-label">CLIENTS</span><span class="stat-value">${GAME.clients.length}</span></div>
    <div class="stat-row"><span class="stat-label">REP</span><div class="bar-track"><div class="bar-fill" style="width:${r.reputation}%;background:${barColor(r.reputation)}"></div></div></div>
    <div class="stat-row"><span class="stat-label">SANITY</span><div class="bar-track"><div class="bar-fill" style="width:${r.sanity}%;background:${barColor(r.sanity)}"></div></div></div>
    <div class="stat-row"><span class="stat-label">E&amp;O</span><div class="bar-track"><div class="bar-fill" style="width:${r.eoRisk}%;background:${barColor(r.eoRisk, true)}"></div></div></div>
    <div class="stat-row"><span class="stat-label">CARRIER REL.</span><div class="bar-track"><div class="bar-fill" style="width:${avgRelationship()}%;background:${barColor(avgRelationship())}"></div></div></div>
  `;
}

function avgRelationship() {
  const vals = Object.values(GAME.carrierRelationships);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function refreshAll() {
  refreshTopbar();
  refreshStatStrip();
  saveGame(GAME);
}

// ---------------- MODAL SYSTEM ----------------
function openModal(title, bodyHtml, footerHtml = '') {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('modal-footer').innerHTML = footerHtml;
  document.getElementById('modal-overlay').classList.add('active');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  refreshAll();
}
function showConfirm(title, msg, onConfirm) {
  openModal(title, `<p>${msg}</p>`, `
    <button class="btn btn-small" onclick="closeModal()">CANCEL</button>
    <button class="btn btn-small btn-danger" id="confirm-yes-btn">YES</button>
  `);
  document.getElementById('confirm-yes-btn').onclick = () => { closeModal(); onConfirm(); };
}

// ---------------- PROSPECTS / LEADS ----------------
function openProspects() {
  setActiveNav('prospects');
  renderProspectsList();
}
function renderProspectsList() {
  const list = GAME.prospects.map(p => {
    const line = LINES[p.lineId];
    return `<div class="list-item" onclick="openProspectDetail('${p.id}')">
      <div class="li-body">
        <div class="li-title">${p.name}</div>
        <div class="li-sub">${line.name} · Est. $${p.estPremium.toLocaleString()} premium · ${p.urgency} urgency</div>
      </div>
      <span class="li-tag ${line.difficulty.toLowerCase()}">${line.difficulty}</span>
    </div>`;
  }).join('');
  openModal('LEADS', `
    <div class="progress-header"><span>Time left today</span><span>${GAME.resources.time} / ${GAME.resources.timeMax}</span></div>
    ${GAME.prospects.length ? list : '<div class="empty-state">No leads right now. Try Networking at the desk, or end the day for fresh leads.</div>'}
  `, `<button class="btn btn-small" onclick="closeModal()">CLOSE</button>`);
}

function openProspectDetail(id) {
  const p = GAME.prospects.find(x => x.id === id);
  if (!p) return;
  const line = LINES[p.lineId];
  const submitted = !!p.submittedTo;
  let body = `
    <div class="event-header">
      <div class="portrait-frame small">${getPortraitSVG(getClientPortraitId(p.id))}</div>
      <div>
        <div style="font-weight:bold;">${p.name}</div>
        <div class="event-cat">${line.name}</div>
      </div>
    </div>
    <p style="font-style:italic;color:var(--wood);">"${p.quirk}"</p>
    <div class="detail-row"><span class="k">Est. Premium</span><span class="v">$${p.estPremium.toLocaleString()}</span></div>
    <div class="detail-row"><span class="k">Est. Commission</span><span class="v good">$${p.estCommission.toLocaleString()}</span></div>
    <div class="detail-row"><span class="k">Difficulty</span><span class="v">${line.difficulty}</span></div>
    <div class="detail-row"><span class="k">Urgency</span><span class="v">${p.urgency}</span></div>
  `;
  if (p.infoGathered) {
    body += `
      <div class="section-label">Client Profile</div>
      <div class="detail-row"><span class="k">Risk Quality</span><span class="v">${p.traits.riskQuality}/10</span></div>
      <div class="detail-row"><span class="k">Honesty</span><span class="v">${p.traits.honesty}/10</span></div>
      <div class="detail-row"><span class="k">Price Sensitivity</span><span class="v">${p.traits.priceSensitivity}/10</span></div>
    `;
  }

  let footer = '';
  if (!submitted) {
    footer = `
      ${!p.infoGathered ? `<button class="btn btn-small" onclick="doGatherInfo('${p.id}')">GATHER INFO (−1 Time)</button>` : ''}
      <button class="btn btn-small btn-gold" onclick="openCarrierSelect('${p.id}')">SUBMIT TO CARRIER</button>
      <button class="btn btn-small btn-danger" onclick="doWalkAway('${p.id}')">WALK AWAY</button>
    `;
  } else if (!p.uwOutcome) {
    footer = `<button class="btn btn-small btn-gold" onclick="doResolveUW('${p.id}')">CHECK UNDERWRITING</button>`;
    body += `<div class="section-label">Status</div><p>Submitted to ${CARRIERS[p.submittedTo].name} (${p.submissionMode === 'complete' ? 'Complete' : 'Quick'}). Awaiting response.</p>`;
  } else if (p.uwOutcome === 'quote') {
    body += `
      <div class="section-label">Quote Received</div>
      <div class="detail-row"><span class="k">Carrier</span><span class="v">${CARRIERS[p.submittedTo].name}</span></div>
      <div class="detail-row"><span class="k">Final Premium</span><span class="v good">$${p.finalPremium.toLocaleString()}</span></div>
      <div class="detail-row"><span class="k">Your Commission</span><span class="v good">$${Math.round(p.finalPremium * line.commissionRate).toLocaleString()}</span></div>
    `;
    footer = `<button class="btn btn-small btn-primary" onclick="doBind('${p.id}')">PRESENT &amp; BIND</button>`;
  } else if (p.uwOutcome === 'moreinfo') {
    body += `<div class="section-label">Status</div><p>${CARRIERS[p.submittedTo].name} wants more info before quoting.</p>`;
    footer = `
      <button class="btn btn-small btn-gold" onclick="doResubmit('${p.id}', 'complete')">SEND FULL PACKAGE (−3 Time)</button>
      <button class="btn btn-small" onclick="doResubmit('${p.id}', 'quick')">SEND QUICK REPLY (−1 Time)</button>
    `;
  } else if (p.uwOutcome === 'decline') {
    body += `<div class="section-label">Status</div><p>${CARRIERS[p.submittedTo].name} declined this one.</p>`;
    footer = `
      <button class="btn btn-small btn-gold" onclick="doRemarket('${p.id}')">REMARKET TO ANOTHER CARRIER</button>
      <button class="btn btn-small btn-danger" onclick="doWalkAway('${p.id}')">WALK AWAY</button>
    `;
  }
  footer += `<button class="btn btn-small" onclick="openProspects()">BACK</button>`;

  openModal(p.name, body, footer);
}

function doGatherInfo(id) {
  const r = gatherInfo(GAME, id);
  toast(r.msg);
  openProspectDetail(id);
}

function doWalkAway(id) {
  walkAwayFromProspect(GAME, id);
  toast('Passed on this one.');
  openProspects();
}

function openCarrierSelect(id) {
  const p = GAME.prospects.find(x => x.id === id);
  const suggested = bestCarrierFor(p.lineId);
  const body = Object.values(CARRIERS).map(c => `
    <div class="list-item" onclick="chooseCarrierMode('${id}','${c.id}')">
      <div class="li-body">
        <div class="li-title">${c.name} ${c.id === suggested ? '⭐' : ''}</div>
        <div class="li-sub">${c.tagline}</div>
      </div>
      <span class="li-tag ${c.appetiteBias[p.lineId] > 1.05 ? 'easy' : c.appetiteBias[p.lineId] < 0.75 ? 'hard' : 'medium'}">
        ${c.appetiteBias[p.lineId] > 1.05 ? 'GOOD FIT' : c.appetiteBias[p.lineId] < 0.75 ? 'TOUGH' : 'OK FIT'}
      </span>
    </div>
  `).join('');
  openModal('Choose Carrier', body, `<button class="btn btn-small" onclick="openProspectDetail('${id}')">BACK</button>`);
}

function chooseCarrierMode(prospectId, carrierId) {
  openModal('Submission Type', `
    <p><b>Quick Submit</b> — cheap in time, weaker odds, less UW goodwill.</p>
    <p><b>Complete Submission</b> — costs more time, better odds and pricing, builds carrier relationship.</p>
  `, `
    <button class="btn btn-small" onclick="doSubmit('${prospectId}','${carrierId}','quick')">QUICK (−1 Time)</button>
    <button class="btn btn-small btn-gold" onclick="doSubmit('${prospectId}','${carrierId}','complete')">COMPLETE (−3 Time)</button>
  `);
}

function doSubmit(prospectId, carrierId, mode) {
  const r = submitToCarrier(GAME, prospectId, carrierId, mode);
  toast(r.msg);
  if (r.ok) openProspectDetail(prospectId); else openProspectDetail(prospectId);
  refreshAll();
}

function doResubmit(prospectId, mode) {
  const p = GAME.prospects.find(x => x.id === prospectId);
  const cost = mode === 'complete' ? 3 : 1;
  if (GAME.resources.time < cost) { toast('Not enough time.'); return; }
  GAME.resources.time -= cost;
  p.uwBoost = (p.uwBoost || 0) + (mode === 'complete' ? 15 : 3);
  p.uwOutcome = null;
  p.submissionMode = mode;
  toast('Resubmitted.');
  doResolveUW(prospectId);
}

function doRemarket(prospectId) {
  const p = GAME.prospects.find(x => x.id === prospectId);
  p.submittedTo = null;
  p.uwOutcome = null;
  openCarrierSelect(prospectId);
}

function doResolveUW(prospectId) {
  const r = resolveUnderwriting(GAME, prospectId);
  toast(r.msg);
  openProspectDetail(prospectId);
  refreshAll();
}

function doBind(prospectId) {
  const r = bindPolicy(GAME, prospectId);
  toast(r.msg);
  closeModal();
  if (GAME.flags.justLeveledUp) {
    GAME.flags.justLeveledUp = false;
    setTimeout(showLevelUpModal, 400);
  }
  refreshAll();
}

// ---------------- CLIENTS / BOOK ----------------
function openClients() {
  setActiveNav('clients');
  renderClientsList();
}
function renderClientsList() {
  const list = GAME.clients.map(c => {
    const line = LINES[c.lineId];
    return `<div class="list-item" onclick="openClientDetail('${c.id}')">
      <div class="portrait-frame small">${getPortraitSVG(c.portraitId)}</div>
      <div class="li-body">
        <div class="li-title">${c.name}</div>
        <div class="li-sub">${line.name} · $${c.premium.toLocaleString()} · ${CARRIERS[c.carrierId].name}</div>
      </div>
    </div>`;
  }).join('');
  openModal('YOUR BOOK', `
    <div class="progress-header"><span>Total book premium</span><span>$${GAME.resources.bookPremium.toLocaleString()}</span></div>
    ${GAME.clients.length ? list : '<div class="empty-state">No clients yet. Head to Leads to start prospecting.</div>'}
  `, `<button class="btn btn-small" onclick="closeModal()">CLOSE</button>`);
}
function openClientDetail(id) {
  const c = GAME.clients.find(x => x.id === id);
  if (!c) return;
  const line = LINES[c.lineId];
  const body = `
    <div class="event-header">
      <div class="portrait-frame small">${getPortraitSVG(c.portraitId)}</div>
      <div><div style="font-weight:bold;">${c.name}</div><div class="event-cat">${line.name}</div></div>
    </div>
    <div class="detail-row"><span class="k">Carrier</span><span class="v">${CARRIERS[c.carrierId].name}</span></div>
    <div class="detail-row"><span class="k">Premium</span><span class="v">$${c.premium.toLocaleString()}</span></div>
    <div class="detail-row"><span class="k">Your Commission</span><span class="v good">$${c.commission.toLocaleString()}</span></div>
    <div class="detail-row"><span class="k">Loyalty</span><span class="v">${c.loyalty}/10</span></div>
    <div class="detail-row"><span class="k">Claims to Date</span><span class="v">${c.claims}</span></div>
    <div class="detail-row"><span class="k">Next Renewal</span><span class="v">Day ${c.renewalDay}</span></div>
  `;
  openModal(c.name, body, `
    <button class="btn btn-small btn-danger" onclick="doFireClient('${c.id}')">FIRE CLIENT</button>
    <button class="btn btn-small" onclick="openClients()">BACK</button>
  `);
}
function doFireClient(id) {
  const c = GAME.clients.find(x => x.id === id);
  showConfirm('Fire this client?', `Are you sure you want to let ${c.name} go? This removes them from your book immediately.`, () => {
    loseClient(GAME, c, 'fired by agent');
    toast(`${c.name} has been let go.`);
    openClients();
    refreshAll();
  });
}

// ---------------- MARKET ----------------
function openMarket() {
  setActiveNav('market');
  const rows = Object.values(LINES).map(l => {
    const val = GAME.market[l.id];
    const pct = Math.round((val - 1) * 100);
    const dir = pct > 3 ? '▲' : pct < -3 ? '▼' : '–';
    const color = pct > 3 ? 'var(--green)' : pct < -3 ? 'var(--red)' : 'var(--tan)';
    return `<div class="detail-row"><span class="k">${l.name}</span><span class="v" style="color:${color}">${dir} ${pct > 0 ? '+' : ''}${pct}%</span></div>`;
  }).join('');
  const relRows = Object.values(CARRIERS).map(c => `
    <div class="detail-row"><span class="k">${c.name}</span><span class="v">${GAME.carrierRelationships[c.id]}/100</span></div>
  `).join('');
  openModal('MARKET CONDITIONS', `
    <div class="section-label">Appetite by Line</div>
    ${rows}
    <div class="section-label">Carrier Relationships</div>
    ${relRows}
  `, `<button class="btn btn-small" onclick="closeModal()">CLOSE</button>`);
}

// ---------------- NETWORKING / DESK ----------------
function openNetworking() {
  const body = `
    <p>Spend time working the phones for referrals, catching up on admin, or just taking a breather.</p>
  `;
  openModal('DESK', body, `
    <button class="btn btn-small btn-gold" onclick="doNetwork()">NETWORK FOR LEADS (−2 Time)</button>
    <button class="btn btn-small" onclick="doTakeBreather()">TAKE A BREATHER (−1 Time, +Sanity)</button>
    <button class="btn btn-small" onclick="closeModal()">CLOSE</button>
  `);
}
function doNetwork() {
  if (GAME.resources.time < 2) { toast('Not enough time.'); return; }
  GAME.resources.time -= 2;
  const newLeads = randInt(1, 2);
  for (let i = 0; i < newLeads; i++) GAME.prospects.push(generateProspect(GAME.meta.level));
  toast(`Found ${newLeads} new lead${newLeads > 1 ? 's' : ''}.`);
  closeModal();
}
function doTakeBreather() {
  if (GAME.resources.time < 1) { toast('Not enough time.'); return; }
  GAME.resources.time -= 1;
  GAME.resources.sanity = clamp(GAME.resources.sanity + 8, 0, 100);
  toast('You took a breather. Sanity restored a bit.');
  closeModal();
}

// ---------------- STAFF (Level 2 preview) ----------------
const CANDIDATE_POOL = [
  { id: 'cand_sally', name: 'Sally Service', role: 'Account Manager', salary: 58000, skill: 4, impact: 'Improves retention', capacityBonus: 150, retentionBoost: 0.08 },
  { id: 'cand_marcus', name: 'Marcus Webb', role: 'Producer', salary: 62000, skill: 3, impact: 'Adds new leads weekly', capacityBonus: 0, leadBoost: 3 },
  { id: 'cand_dee', name: 'Dee Alvarez', role: 'CSR', salary: 48000, skill: 4, impact: 'Handles routine service calls', capacityBonus: 100, retentionBoost: 0.04 },
];

function openStaff() {
  setActiveNav('staff');
  if (GAME.meta.level < 2) {
    openModal('STAFF', `
      <div class="empty-state">
        You're still running solo at the borrowed desk.<br><br>
        Hiring unlocks once you hit <b>Level 2: The Hustle</b> — grow your book to <b>$${LEVEL_GOALS[1].bookGoal.toLocaleString()}</b> to get there.
        <br><br>Current book: <b>$${GAME.resources.bookPremium.toLocaleString()}</b>
      </div>
    `, `<button class="btn btn-small" onclick="closeModal()">CLOSE</button>`);
    return;
  }
  renderStaffScreen();
}

function renderStaffScreen() {
  const hired = GAME.employees.map(e => `
    <div class="list-item">
      <div class="li-body">
        <div class="li-title">${e.name} — ${e.role}</div>
        <div class="li-sub">${e.impact} · $${e.salary.toLocaleString()}/yr</div>
      </div>
    </div>
  `).join('');
  const candidates = CANDIDATE_POOL.filter(c => !GAME.employees.some(e => e.id === c.id)).map(c => `
    <div class="list-item" onclick="openHireDetail('${c.id}')">
      <div class="li-body">
        <div class="li-title">${c.name}</div>
        <div class="li-sub">${c.role} · $${c.salary.toLocaleString()}/yr</div>
      </div>
      <span class="li-tag">${'★'.repeat(c.skill)}</span>
    </div>
  `).join('');
  openModal('STAFF', `
    <div class="section-label">Your Team</div>
    ${hired || '<div class="empty-state">No employees yet. You still do it all yourself.</div>'}
    <div class="section-label">Candidates</div>
    ${candidates || '<div class="empty-state">No candidates available right now.</div>'}
  `, `<button class="btn btn-small" onclick="closeModal()">CLOSE</button>`);
}

function openHireDetail(id) {
  const c = CANDIDATE_POOL.find(x => x.id === id);
  const body = `
    <div class="event-header">
      <div class="portrait-frame small">${getPortraitSVG(getClientPortraitId(id))}</div>
      <div><div style="font-weight:bold;">${c.name}</div><div class="event-cat">${c.role}</div></div>
    </div>
    <div class="detail-row"><span class="k">Salary</span><span class="v">$${c.salary.toLocaleString()}/yr</span></div>
    <div class="detail-row"><span class="k">Skill</span><span class="v">${'★'.repeat(c.skill)}${'☆'.repeat(5 - c.skill)}</span></div>
    <div class="detail-row"><span class="k">Impact</span><span class="v">${c.impact}</span></div>
  `;
  openModal(c.name, body, `
    <button class="btn btn-small btn-primary" onclick="doHire('${id}')">HIRE</button>
    <button class="btn btn-small" onclick="renderStaffScreen()">BACK</button>
  `);
}

function doHire(id) {
  const c = CANDIDATE_POOL.find(x => x.id === id);
  GAME.employees.push({ ...c, hiredDay: GAME.meta.day });
  toast(`${c.name} joins the agency!`);
  log(GAME, `Hired ${c.name} as ${c.role}.`);
  renderStaffScreen();
  refreshAll();
}

// ---------------- LEVEL UP ----------------
function showLevelUpModal() {
  const goal = LEVEL_GOALS[GAME.meta.level];
  openModal('LEVEL UP!', `
    <div style="text-align:center;">
      <div style="font-size:2rem;margin-bottom:8px;">🎉</div>
      <div style="font-size:1.1rem;font-weight:bold;color:var(--wood);">Level ${GAME.meta.level}${goal ? ': ' + goal.name : ''}</div>
      <p style="margin-top:10px;">Your book has grown. New opportunities — and new problems — are opening up.</p>
      ${GAME.meta.level === 2 ? '<p><b>Unlocked:</b> Hiring your first employee (STAFF tab).</p>' : ''}
    </div>
  `, `<button class="btn btn-small btn-primary" onclick="closeModal()">LET'S GO</button>`);
}

// ---------------- RANDOM EVENTS ----------------
function maybeTriggerDailyEvent() {
  if (Math.random() > 0.7) return; // not every day
  const roll = rollDailyEvent(GAME);
  if (!roll) return;
  showEventModal(roll);
}

function showEventModal({ scenario, subject, isTuesday }) {
  const setupText = typeof scenario.setup === 'function' ? scenario.setup(GAME, subject || {}) : scenario.setup;
  const stars = scenario.stars > 0 ? '★'.repeat(scenario.stars) : '✦';
  const portraitId = subject && subject.portraitId ? subject.portraitId : (subject && subject.id ? getClientPortraitId(subject.id) : null);

  let body = `
    <div class="event-header">
      ${portraitId ? `<div class="portrait-frame small">${getPortraitSVG(portraitId)}</div>` : ''}
      <div>
        <div class="event-stars">${stars}</div>
        <div class="event-cat">${scenario.category}${isTuesday ? ' · TUESDAY' : ''}</div>
      </div>
    </div>
    <p>${setupText}</p>
  `;
  if (isTuesday) body += `<p style="color:var(--red);font-weight:bold;">It's one of those days. More is happening than you have time for.</p>`;

  const footer = scenario.choices.map((choice, i) => {
    const costStr = choice.cost && choice.cost.time ? ` <span class="choice-cost">(−${choice.cost.time} Time)</span>` : '';
    return `<button class="choice-btn" onclick="resolveEventChoice(${i})">${choice.label}${costStr}</button>`;
  }).join('');

  document.getElementById('modal-title').textContent = 'EVENT';
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal-footer').innerHTML = `<div style="width:100%;">${footer}</div>`;
  document.getElementById('modal-overlay').classList.add('active');

  GAME.pendingEvent = { scenario, subject };
}

function resolveEventChoice(index) {
  const { scenario, subject } = GAME.pendingEvent;
  const choice = scenario.choices[index];
  if (choice.cost && choice.cost.time) {
    GAME.resources.time = Math.max(0, GAME.resources.time - choice.cost.time);
  }
  choice.effects(GAME, subject);
  GAME.pendingEvent = null;
  closeModal();
  checkGameOverAndRender();
}

// ---------------- END DAY ----------------
function confirmEndDay() {
  showConfirm('End the day?', `You have ${GAME.resources.time} time left unused. Ending the day resets your time and advances the calendar.`, () => {
    endDay(GAME);
    refreshTopbar();
    refreshStatStrip();
    checkGameOverAndRender();
    if (!GAME.flags.justLeveledUp) {
      setTimeout(maybeTriggerDailyEvent, 300);
    } else {
      GAME.flags.justLeveledUp = false;
      setTimeout(showLevelUpModal, 300);
    }
  });
}

function checkGameOverAndRender() {
  refreshAll();
  const over = isGameOver(GAME);
  if (over.over) {
    showGameOver(over.reason);
  }
}

function showGameOver(reason) {
  const msg = reason === 'bankruptcy'
    ? 'The agency has run out of cash and cannot continue operating.'
    : 'An unresolved E&O exposure has become a catastrophic claim. The agency cannot recover.';
  openModal('GAME OVER', `
    <div style="text-align:center;">
      <div style="font-size:2rem;">💼</div>
      <p>${msg}</p>
      <p>Final book: $${GAME.resources.bookPremium.toLocaleString()} · Clients served: ${GAME.stats.clientsWon}</p>
    </div>
  `, `<button class="btn btn-small btn-danger" onclick="restartAfterGameOver()">START OVER</button>`);
}

function restartAfterGameOver() {
  deleteSave();
  GAME = null;
  closeModal();
  showScreen('screen-title');
  document.getElementById('btn-continue').style.display = 'none';
  document.getElementById('btn-reset').style.display = 'none';
}
