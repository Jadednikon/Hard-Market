// ============================================================
// HARD MARKET — UI / MAIN CONTROLLER (GBA dialogue-box edition)
// All in-game interaction routes through the docked dialogue box.
// A simple navigation stack gives us Pokemon-style BACK behavior.
// ============================================================

let GAME = null;
let SELECTED_CHARACTER = null;
let SELECTED_CAREER = null;
let NAV_STACK = []; // stack of render functions (no-arg closures) for BACK navigation

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
  if (window.confirm('Reset save?\n\nThis will permanently delete your current agency. This cannot be undone.')) {
    deleteSave();
    document.getElementById('btn-continue').style.display = 'none';
    document.getElementById('btn-reset').style.display = 'none';
    toast('Save deleted.');
  }
}

// ---------------- OFFICE SCREEN ----------------
function enterOffice() {
  showScreen('screen-office');
  buildOfficeScene();
  refreshTopbar();
  refreshStatStrip();
  NAV_STACK = [];
  if (GAME.flags.justLeveledUp) {
    GAME.flags.justLeveledUp = false;
    pushDialogue(renderLevelUp);
  } else {
    const eventRoll = maybeGetDailyEvent();
    if (eventRoll) {
      pushDialogue(() => renderEvent(eventRoll));
    } else {
      renderMainMenu();
    }
  }
}

function buildOfficeScene() {
  const scene = document.getElementById('office-scene');
  // Static scene art. Drop a real illustrated PNG/JPG in assets/ and point
  // SCENE_ART_URL at it (see js/art/office.js) to replace the placeholder
  // SVG with zero other changes.
  const artHtml = (typeof SCENE_ART_URL !== 'undefined' && SCENE_ART_URL)
    ? `<img class="scene-art" src="${SCENE_ART_URL}" alt="Office scene">`
    : `<div class="office-bg">${officeBackgroundLevel1()}</div>`;
  scene.innerHTML = artHtml + `<div class="npc-portrait-inset" id="npc-portrait-inset"></div>`;

  OFFICE_HOTSPOTS_L1.forEach(h => {
    const el = document.createElement('div');
    el.className = 'scene-marker';
    // Store the tuned percentages as data attrs; actual px position gets
    // computed against the real rendered image bounds (see below), since
    // the image can be letterboxed (object-fit: contain, in landscape)
    // and simple % of the container would drift off the artwork.
    el.dataset.pctLeft = parseFloat(h.left);
    el.dataset.pctTop = parseFloat(h.top);
    el.dataset.pctWidth = parseFloat(h.width);
    el.dataset.pctHeight = parseFloat(h.height);
    el.innerHTML = `${hotspotIconSVG(h.id)}<span class="scene-marker-label">${h.label}</span>`;
    el.onclick = () => onSceneMarkerTap(h.id);
    scene.appendChild(el);
  });

  const img = scene.querySelector('img.scene-art');
  if (img) {
    if (img.complete) repositionSceneMarkers();
    else img.addEventListener('load', repositionSceneMarkers);
  } else {
    repositionSceneMarkers(); // SVG placeholder fills the box edge-to-edge, no letterbox math needed
  }
}

// Recomputes marker pixel positions against the ACTUAL visible image content
// rectangle (accounting for object-fit letterboxing), not just the raw
// container box — otherwise markers drift off the art whenever the box's
// aspect ratio doesn't match the image's.
let _sceneResizeQueued = false;
function repositionSceneMarkers() {
  const scene = document.getElementById('office-scene');
  if (!scene) return;
  const img = scene.querySelector('img.scene-art');
  const containerW = scene.clientWidth;
  const containerH = scene.clientHeight;
  if (!containerW || !containerH) return;

  let contentW = containerW, contentH = containerH, offsetX = 0, offsetY = 0;

  if (img) {
    const isLandscapeSplit = window.matchMedia('(orientation: landscape)').matches;
    const naturalW = img.naturalWidth || 1672;
    const naturalH = img.naturalHeight || 941;
    const imgAspect = naturalW / naturalH;
    const containerAspect = containerW / containerH;

    // landscape uses object-fit:contain (whole image always visible, letterboxed);
    // portrait uses object-fit:cover (image fills the box, edges may crop)
    const fitsByHeight = isLandscapeSplit ? (containerAspect > imgAspect) : (containerAspect <= imgAspect);
    if (fitsByHeight) {
      contentH = containerH;
      contentW = containerH * imgAspect;
    } else {
      contentW = containerW;
      contentH = containerW / imgAspect;
    }
    offsetX = (containerW - contentW) / 2;
    offsetY = (containerH - contentH) / 2;
  }

  scene.querySelectorAll('.scene-marker').forEach(el => {
    const pctLeft = parseFloat(el.dataset.pctLeft) || 0;
    const pctTop = parseFloat(el.dataset.pctTop) || 0;
    const pctW = parseFloat(el.dataset.pctWidth) || 5;
    const pctH = parseFloat(el.dataset.pctHeight) || 5;
    el.style.left = (offsetX + (pctLeft / 100) * contentW) + 'px';
    el.style.top = (offsetY + (pctTop / 100) * contentH) + 'px';
    el.style.width = ((pctW / 100) * contentW) + 'px';
    el.style.height = ((pctH / 100) * contentH) + 'px';
  });
}

window.addEventListener('resize', () => {
  if (_sceneResizeQueued) return;
  _sceneResizeQueued = true;
  requestAnimationFrame(() => { _sceneResizeQueued = false; repositionSceneMarkers(); });
});
window.addEventListener('orientationchange', () => setTimeout(repositionSceneMarkers, 150));

function onSceneMarkerTap(id) {
  if (id === 'phone') openProspects();
  else if (id === 'reports') openMarket();
  else if (id === 'notepad') openClients();
  else if (id === 'cabinet') openStaff();
  else if (id === 'deskfront') openNetworking();
}

function setNpcPortrait(portraitId) {
  const el = document.getElementById('npc-portrait-inset');
  if (!el) return;
  if (portraitId) {
    el.innerHTML = getPortraitSVG(portraitId);
    el.classList.add('show');
  } else {
    el.innerHTML = '';
    el.classList.remove('show');
  }
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

// ================================================================
// DIALOGUE BOX ENGINE
// Every screen is a "render function" with no args that repaints
// dlg-title / dlg-body / dlg-menu. pushDialogue() adds it to a back
// stack; dlgBack() pops and re-renders the previous one (or the main
// menu if the stack is empty).
// ================================================================

function setDialogue(title, bodyHtml, menuHtml, opts = {}) {
  document.getElementById('dlg-title').textContent = title;
  document.getElementById('dlg-body').innerHTML = bodyHtml;
  document.getElementById('dlg-menu').innerHTML = menuHtml;
  document.getElementById('dlg-back-btn').style.display = NAV_STACK.length > 0 ? '' : 'none';
  if (opts.npcPortrait !== undefined) setNpcPortrait(opts.npcPortrait);
}

// Push current-and-new: call with the render fn for the screen you're navigating TO.
function pushDialogue(renderFn) {
  NAV_STACK.push(renderFn);
  renderFn();
}

// Replace the top of the stack without growing it (for refreshing the same screen in place)
function repaintTop(renderFn) {
  if (NAV_STACK.length === 0) { pushDialogue(renderFn); return; }
  NAV_STACK[NAV_STACK.length - 1] = renderFn;
  renderFn();
}

function dlgBack() {
  NAV_STACK.pop();
  if (NAV_STACK.length === 0) {
    renderMainMenu();
  } else {
    NAV_STACK[NAV_STACK.length - 1]();
    document.getElementById('dlg-back-btn').style.display = NAV_STACK.length > 0 ? '' : 'none';
  }
}

// closeModal() is kept as an alias so any legacy call sites behave sensibly:
// it returns all the way to the main menu, like pressing B repeatedly.
function closeModal() {
  NAV_STACK = [];
  renderMainMenu();
  refreshAll();
}

function menuRow(label, onclickAttr, opts = {}) {
  const subHtml = opts.sub ? `<div class="menu-row-sub">${opts.sub}</div>` : '';
  const rightHtml = opts.tag ? `<span class="row-tag ${opts.tagClass || ''}">${opts.tag}</span>`
    : opts.cost ? `<span class="row-cost">${opts.cost}</span>` : '';
  const mod = opts.mod ? ` mr-${opts.mod}` : '';
  return `<button class="menu-row${mod}" onclick="${onclickAttr}">
    <div class="menu-row-body"><div class="menu-row-title">${label}</div>${subHtml}</div>
    ${rightHtml}
  </button>`;
}

// ---------------- MAIN MENU (idle / default state) ----------------
function renderMainMenu() {
  NAV_STACK = [];
  const flavor = pick([
    'The phone could ring any minute.',
    'Another day at the borrowed desk.',
    "Coffee's cold. Book's not gonna build itself.",
    'The market never sleeps. Neither do you, apparently.',
  ]);
  const body = `<div class="dialogue-text">${flavor}</div>`;
  const menu =
    menuRow('Work the Phones', 'openProspects()', { sub: `${GAME.prospects.length} lead${GAME.prospects.length === 1 ? '' : 's'} waiting` }) +
    menuRow('Review Your Book', 'openClients()', { sub: `${GAME.clients.length} client${GAME.clients.length === 1 ? '' : 's'}` }) +
    menuRow('Check the Market', 'openMarket()') +
    menuRow('Staff', 'openStaff()') +
    menuRow('Network at the Desk', 'openNetworking()') +
    menuRow('End the Day', 'confirmEndDay()', { mod: 'gold' });
  setDialogue('OFFICE', body, menu, { npcPortrait: null });
}

// ---------------- PROSPECTS / LEADS ----------------
function openProspects() {
  pushDialogue(renderProspectsList);
}
function renderProspectsList() {
  const body = `<div class="dialogue-text">Time left today: <b>${GAME.resources.time} / ${GAME.resources.timeMax}</b></div>` +
    (GAME.prospects.length ? '' : '<div class="empty-state">No leads right now. Try networking at the desk, or end the day for fresh ones.</div>');
  const menu = GAME.prospects.map(p => {
    const line = LINES[p.lineId];
    return menuRow(p.name, `openProspectDetail('${p.id}')`, {
      sub: `${line.name} · Est. $${p.estPremium.toLocaleString()}`,
      tag: line.difficulty, tagClass: line.difficulty.toLowerCase(),
    });
  }).join('');
  setDialogue('LEADS', body, menu, { npcPortrait: null });
}

function openProspectDetail(id) {
  pushDialogue(() => renderProspectDetail(id));
}
function renderProspectDetail(id) {
  const p = GAME.prospects.find(x => x.id === id);
  if (!p) { dlgBack(); return; }
  const line = LINES[p.lineId];
  const submitted = !!p.submittedTo;
  const portraitId = getClientPortraitId(p.id);

  let body = `
    <div class="dialogue-text" style="font-style:italic;color:var(--wood);">"${p.quirk}"</div>
    <div class="detail-row"><span class="k">Line</span><span class="v">${line.name}</span></div>
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

  let menu = '';
  if (!submitted) {
    if (!p.infoGathered) menu += menuRow('Gather Info', `doGatherInfo('${p.id}')`, { cost: '−1 Time' });
    menu += menuRow('Submit to Carrier', `openCarrierSelect('${p.id}')`, { mod: 'gold' });
    menu += menuRow('Walk Away', `doWalkAway('${p.id}')`, { mod: 'danger' });
  } else if (!p.uwOutcome) {
    body += `<div class="section-label">Status</div><div class="dialogue-text">Submitted to ${CARRIERS[p.submittedTo].name} (${p.submissionMode === 'complete' ? 'Complete' : 'Quick'}). Awaiting response.</div>`;
    menu += menuRow('Check Underwriting', `doResolveUW('${p.id}')`, { mod: 'gold' });
  } else if (p.uwOutcome === 'quote') {
    body += `
      <div class="section-label">Quote Received</div>
      <div class="detail-row"><span class="k">Carrier</span><span class="v">${CARRIERS[p.submittedTo].name}</span></div>
      <div class="detail-row"><span class="k">Final Premium</span><span class="v good">$${p.finalPremium.toLocaleString()}</span></div>
      <div class="detail-row"><span class="k">Your Commission</span><span class="v good">$${Math.round(p.finalPremium * line.commissionRate).toLocaleString()}</span></div>
    `;
    menu += menuRow('Present & Bind', `doBind('${p.id}')`, { mod: 'primary' });
  } else if (p.uwOutcome === 'moreinfo') {
    body += `<div class="section-label">Status</div><div class="dialogue-text">${CARRIERS[p.submittedTo].name} wants more info before quoting.</div>`;
    menu += menuRow('Send Full Package', `doResubmit('${p.id}','complete')`, { cost: '−3 Time', mod: 'gold' });
    menu += menuRow('Send Quick Reply', `doResubmit('${p.id}','quick')`, { cost: '−1 Time' });
  } else if (p.uwOutcome === 'decline') {
    body += `<div class="section-label">Status</div><div class="dialogue-text">${CARRIERS[p.submittedTo].name} declined this one.</div>`;
    menu += menuRow('Remarket to Another Carrier', `doRemarket('${p.id}')`, { mod: 'gold' });
    menu += menuRow('Walk Away', `doWalkAway('${p.id}')`, { mod: 'danger' });
  }

  setDialogue(p.name, body, menu, { npcPortrait: portraitId });
}

function doGatherInfo(id) {
  const r = gatherInfo(GAME, id);
  toast(r.msg);
  repaintTop(() => renderProspectDetail(id));
}

function doWalkAway(id) {
  walkAwayFromProspect(GAME, id);
  toast('Passed on this one.');
  dlgBack();
}

function openCarrierSelect(id) {
  pushDialogue(() => renderCarrierSelect(id));
}
function renderCarrierSelect(id) {
  const p = GAME.prospects.find(x => x.id === id);
  if (!p) { dlgBack(); return; }
  const suggested = bestCarrierFor(p.lineId);
  const body = `<div class="dialogue-text">Which carrier should get this one?</div>`;
  const menu = Object.values(CARRIERS).map(c => {
    const fit = c.appetiteBias[p.lineId] > 1.05 ? 'GOOD FIT' : c.appetiteBias[p.lineId] < 0.75 ? 'TOUGH' : 'OK FIT';
    const fitClass = c.appetiteBias[p.lineId] > 1.05 ? 'easy' : c.appetiteBias[p.lineId] < 0.75 ? 'hard' : 'medium';
    return menuRow(`${c.name}${c.id === suggested ? ' ⭐' : ''}`, `chooseCarrierMode('${id}','${c.id}')`, {
      sub: c.tagline, tag: fit, tagClass: fitClass,
    });
  }).join('');
  setDialogue('Choose Carrier', body, menu);
}

function chooseCarrierMode(prospectId, carrierId) {
  pushDialogue(() => renderSubmissionMode(prospectId, carrierId));
}
function renderSubmissionMode(prospectId, carrierId) {
  const body = `
    <div class="dialogue-text"><b>Quick Submit</b> — cheap in time, weaker odds, less UW goodwill.</div>
    <div class="dialogue-text"><b>Complete Submission</b> — costs more time, better odds and pricing, builds carrier relationship.</div>
  `;
  const menu =
    menuRow('Quick Submit', `doSubmit('${prospectId}','${carrierId}','quick')`, { cost: '−1 Time' }) +
    menuRow('Complete Submission', `doSubmit('${prospectId}','${carrierId}','complete')`, { cost: '−3 Time', mod: 'gold' });
  setDialogue('Submission Type', body, menu);
}

function doSubmit(prospectId, carrierId, mode) {
  const r = submitToCarrier(GAME, prospectId, carrierId, mode);
  toast(r.msg);
  NAV_STACK = NAV_STACK.slice(0, -2); // drop carrier-select + mode screens
  pushDialogue(() => renderProspectDetail(prospectId));
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
  pushDialogue(() => renderCarrierSelect(prospectId));
}

function doResolveUW(prospectId) {
  const r = resolveUnderwriting(GAME, prospectId);
  toast(r.msg);
  repaintTop(() => renderProspectDetail(prospectId));
  refreshAll();
}

function doBind(prospectId) {
  const r = bindPolicy(GAME, prospectId);
  toast(r.msg);
  refreshAll();
  if (GAME.flags.justLeveledUp) {
    GAME.flags.justLeveledUp = false;
    NAV_STACK = [];
    setTimeout(() => pushDialogue(renderLevelUp), 300);
  } else {
    NAV_STACK = [];
    renderMainMenu();
  }
}

// ---------------- CLIENTS / BOOK ----------------
function openClients() {
  pushDialogue(renderClientsList);
}
function renderClientsList() {
  const body = `<div class="dialogue-text">Total book premium: <b>$${GAME.resources.bookPremium.toLocaleString()}</b></div>` +
    (GAME.clients.length ? '' : '<div class="empty-state">No clients yet. Work the phones to start prospecting.</div>');
  const menu = GAME.clients.map(c => {
    const line = LINES[c.lineId];
    return menuRow(c.name, `openClientDetail('${c.id}')`, { sub: `${line.name} · $${c.premium.toLocaleString()} · ${CARRIERS[c.carrierId].name}` });
  }).join('');
  setDialogue('YOUR BOOK', body, menu, { npcPortrait: null });
}

function openClientDetail(id) {
  pushDialogue(() => renderClientDetail(id));
}
function renderClientDetail(id) {
  const c = GAME.clients.find(x => x.id === id);
  if (!c) { dlgBack(); return; }
  const line = LINES[c.lineId];
  const body = `
    <div class="detail-row"><span class="k">Line</span><span class="v">${line.name}</span></div>
    <div class="detail-row"><span class="k">Carrier</span><span class="v">${CARRIERS[c.carrierId].name}</span></div>
    <div class="detail-row"><span class="k">Premium</span><span class="v">$${c.premium.toLocaleString()}</span></div>
    <div class="detail-row"><span class="k">Your Commission</span><span class="v good">$${c.commission.toLocaleString()}</span></div>
    <div class="detail-row"><span class="k">Loyalty</span><span class="v">${c.loyalty}/10</span></div>
    <div class="detail-row"><span class="k">Claims to Date</span><span class="v">${c.claims}</span></div>
    <div class="detail-row"><span class="k">Next Renewal</span><span class="v">Day ${c.renewalDay}</span></div>
  `;
  const menu = menuRow('Fire Client', `doFireClient('${c.id}')`, { mod: 'danger' });
  setDialogue(c.name, body, menu, { npcPortrait: c.portraitId });
}
function doFireClient(id) {
  const c = GAME.clients.find(x => x.id === id);
  pushDialogue(() => renderConfirm(
    'Fire this client?',
    `Are you sure you want to let ${c.name} go? This removes them from your book immediately.`,
    () => {
      loseClient(GAME, c, 'fired by agent');
      toast(`${c.name} has been let go.`);
      NAV_STACK = [];
      pushDialogue(renderClientsList);
      refreshAll();
    }
  ));
}

// Generic in-dialogue Yes/No confirm screen (used once pushed onto the stack)
function renderConfirm(title, msg, onYes) {
  const body = `<div class="dialogue-text">${msg}</div>`;
  window.__pendingConfirmYes = onYes;
  const menu =
    menuRow('Yes', `__runPendingConfirm()`, { mod: 'danger' }) +
    menuRow('Cancel', `dlgBack()`);
  setDialogue(title, body, menu);
}
function __runPendingConfirm() {
  const fn = window.__pendingConfirmYes;
  window.__pendingConfirmYes = null;
  if (fn) fn();
}

// ---------------- MARKET ----------------
function openMarket() {
  pushDialogue(renderMarket);
}
function renderMarket() {
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
  const body = `<div class="section-label">Appetite by Line</div>${rows}<div class="section-label">Carrier Relationships</div>${relRows}`;
  setDialogue('MARKET CONDITIONS', body, '', { npcPortrait: null });
}

// ---------------- NETWORKING / DESK ----------------
function openNetworking() {
  pushDialogue(renderNetworking);
}
function renderNetworking() {
  const body = `<div class="dialogue-text">Spend time working the phones for referrals, catching up on admin, or just taking a breather.</div>`;
  const menu =
    menuRow('Network for Leads', 'doNetwork()', { cost: '−2 Time', mod: 'gold' }) +
    menuRow('Take a Breather', 'doTakeBreather()', { cost: '−1 Time, +Sanity' });
  setDialogue('DESK', body, menu, { npcPortrait: null });
}
function doNetwork() {
  if (GAME.resources.time < 2) { toast('Not enough time.'); return; }
  GAME.resources.time -= 2;
  const newLeads = randInt(1, 2);
  for (let i = 0; i < newLeads; i++) GAME.prospects.push(generateProspect(GAME.meta.level));
  toast(`Found ${newLeads} new lead${newLeads > 1 ? 's' : ''}.`);
  refreshAll();
  dlgBack();
}
function doTakeBreather() {
  if (GAME.resources.time < 1) { toast('Not enough time.'); return; }
  GAME.resources.time -= 1;
  GAME.resources.sanity = clamp(GAME.resources.sanity + 8, 0, 100);
  toast('You took a breather. Sanity restored a bit.');
  refreshAll();
  dlgBack();
}

// ---------------- STAFF (Level 2 preview) ----------------
const CANDIDATE_POOL = [
  { id: 'cand_sally', name: 'Sally Service', role: 'Account Manager', salary: 58000, skill: 4, impact: 'Improves retention', capacityBonus: 150, retentionBoost: 0.08 },
  { id: 'cand_marcus', name: 'Marcus Webb', role: 'Producer', salary: 62000, skill: 3, impact: 'Adds new leads weekly', capacityBonus: 0, leadBoost: 3 },
  { id: 'cand_dee', name: 'Dee Alvarez', role: 'CSR', salary: 48000, skill: 4, impact: 'Handles routine service calls', capacityBonus: 100, retentionBoost: 0.04 },
];

function openStaff() {
  pushDialogue(renderStaffScreen);
}
function renderStaffScreen() {
  if (GAME.meta.level < 2) {
    const body = `<div class="empty-state">
      You're still running solo at the borrowed desk.<br><br>
      Hiring unlocks once you hit <b>Level 2: The Hustle</b> — grow your book to <b>$${LEVEL_GOALS[1].bookGoal.toLocaleString()}</b> to get there.
      <br><br>Current book: <b>$${GAME.resources.bookPremium.toLocaleString()}</b>
    </div>`;
    setDialogue('STAFF', body, '', { npcPortrait: null });
    return;
  }
  const hiredHtml = GAME.employees.length
    ? GAME.employees.map(e => `<div class="detail-row"><span class="k">${e.name} — ${e.role}</span><span class="v">$${e.salary.toLocaleString()}/yr</span></div>`).join('')
    : '<div class="empty-state">No employees yet. You still do it all yourself.</div>';
  const body = `<div class="section-label">Your Team</div>${hiredHtml}<div class="section-label">Candidates</div>`;
  const candidates = CANDIDATE_POOL.filter(c => !GAME.employees.some(e => e.id === c.id));
  const menu = candidates.length
    ? candidates.map(c => menuRow(c.name, `openHireDetail('${c.id}')`, { sub: `${c.role} · $${c.salary.toLocaleString()}/yr`, tag: '★'.repeat(c.skill) })).join('')
    : '';
  setDialogue('STAFF', body + (candidates.length ? '' : '<div class="empty-state">No candidates available right now.</div>'), menu, { npcPortrait: null });
}

function openHireDetail(id) {
  pushDialogue(() => renderHireDetail(id));
}
function renderHireDetail(id) {
  const c = CANDIDATE_POOL.find(x => x.id === id);
  const body = `
    <div class="detail-row"><span class="k">Role</span><span class="v">${c.role}</span></div>
    <div class="detail-row"><span class="k">Salary</span><span class="v">$${c.salary.toLocaleString()}/yr</span></div>
    <div class="detail-row"><span class="k">Skill</span><span class="v">${'★'.repeat(c.skill)}${'☆'.repeat(5 - c.skill)}</span></div>
    <div class="detail-row"><span class="k">Impact</span><span class="v">${c.impact}</span></div>
  `;
  const menu = menuRow('Hire', `doHire('${id}')`, { mod: 'primary' });
  setDialogue(c.name, body, menu, { npcPortrait: getClientPortraitId(id) });
}
function doHire(id) {
  const c = CANDIDATE_POOL.find(x => x.id === id);
  GAME.employees.push({ ...c, hiredDay: GAME.meta.day });
  toast(`${c.name} joins the agency!`);
  log(GAME, `Hired ${c.name} as ${c.role}.`);
  refreshAll();
  NAV_STACK = [];
  pushDialogue(renderStaffScreen);
}

// ---------------- LEVEL UP ----------------
function renderLevelUp() {
  const goal = LEVEL_GOALS[GAME.meta.level];
  const body = `
    <div style="text-align:center;">
      <div style="font-size:1.8rem;margin-bottom:6px;">🎉</div>
      <div style="font-size:1rem;font-weight:bold;color:var(--wood);">Level ${GAME.meta.level}${goal ? ': ' + goal.name : ''}</div>
      <div class="dialogue-text" style="margin-top:8px;">Your book has grown. New opportunities — and new problems — are opening up.</div>
      ${GAME.meta.level === 2 ? '<div class="dialogue-text"><b>Unlocked:</b> Hiring your first employee (via Staff).</div>' : ''}
    </div>
  `;
  const menu = menuRow("Let's Go", 'closeModal()', { mod: 'primary' });
  setDialogue('LEVEL UP!', body, menu, { npcPortrait: null });
}

// ---------------- RANDOM EVENTS ----------------
function maybeGetDailyEvent() {
  if (Math.random() > 0.7) return null;
  return rollDailyEvent(GAME);
}

function renderEvent(roll) {
  const { scenario, subject, isTuesday } = roll;
  const setupText = typeof scenario.setup === 'function' ? scenario.setup(GAME, subject || {}) : scenario.setup;
  const stars = scenario.stars > 0 ? '★'.repeat(scenario.stars) : '✦';
  const portraitId = subject && subject.portraitId ? subject.portraitId : (subject && subject.id ? getClientPortraitId(subject.id) : null);

  let body = `
    <div class="dialogue-header-row">
      <div><div class="dialogue-stars">${stars}</div><div class="dialogue-cat">${scenario.category}${isTuesday ? ' · TUESDAY' : ''}</div></div>
    </div>
    <div class="dialogue-text">${setupText}</div>
  `;
  if (isTuesday) body += `<div class="dialogue-text" style="color:var(--red);font-weight:bold;">It's one of those days. More is happening than you have time for.</div>`;

  const menu = scenario.choices.map((choice, i) => {
    return menuRow(choice.label, `resolveEventChoice(${i})`, choice.cost && choice.cost.time ? { cost: `−${choice.cost.time} Time` } : {});
  }).join('');

  setDialogue('EVENT', body, menu, { npcPortrait: portraitId });
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
  checkGameOverAndRender();
  NAV_STACK = [];
  renderMainMenu();
}

// ---------------- END DAY ----------------
function confirmEndDay() {
  pushDialogue(() => renderConfirm(
    'End the day?',
    `You have ${GAME.resources.time} time left unused. Ending the day resets your time and advances the calendar.`,
    () => {
      endDay(GAME);
      refreshTopbar();
      refreshStatStrip();
      checkGameOverAndRender();
      NAV_STACK = [];
      if (GAME.flags.justLeveledUp) {
        GAME.flags.justLeveledUp = false;
        pushDialogue(renderLevelUp);
      } else {
        const eventRoll = maybeGetDailyEvent();
        if (eventRoll) pushDialogue(() => renderEvent(eventRoll));
        else renderMainMenu();
      }
    }
  ));
}

function checkGameOverAndRender() {
  refreshAll();
  const over = isGameOver(GAME);
  if (over.over) {
    NAV_STACK = [];
    pushDialogue(() => renderGameOver(over.reason));
  }
}

function renderGameOver(reason) {
  const msg = reason === 'bankruptcy'
    ? 'The agency has run out of cash and cannot continue operating.'
    : 'An unresolved E&O exposure has become a catastrophic claim. The agency cannot recover.';
  const body = `
    <div style="text-align:center;">
      <div style="font-size:1.8rem;">💼</div>
      <div class="dialogue-text">${msg}</div>
      <div class="dialogue-text">Final book: $${GAME.resources.bookPremium.toLocaleString()} · Clients served: ${GAME.stats.clientsWon}</div>
    </div>
  `;
  const menu = menuRow('Start Over', 'restartAfterGameOver()', { mod: 'danger' });
  setDialogue('GAME OVER', body, menu, { npcPortrait: null });
}

function restartAfterGameOver() {
  deleteSave();
  GAME = null;
  NAV_STACK = [];
  showScreen('screen-title');
  document.getElementById('btn-continue').style.display = 'none';
  document.getElementById('btn-reset').style.display = 'none';
}
