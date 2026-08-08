// ============================================================
// HARD MARKET — ENGINE
// State mutation, save/load, day progression, core action resolvers.
// No DOM here except localStorage.
// ============================================================

const SAVE_KEY = 'hardmarket_save_v1';

function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error('Save failed', e);
    return false;
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Load failed', e);
    return null;
  }
}

function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

// ---- Prospecting ----
function refreshProspects(state, count = null) {
  const character = CHARACTERS.find(c => c.id === state.meta.characterId);
  const career = CAREER_MODES.find(c => c.id === state.meta.careerId);
  const leadMult = (character.bonus.leadGen || 1) * career.leadMult;
  const n = count !== null ? count : Math.max(3, Math.round(4 * leadMult));
  const fresh = [];
  for (let i = 0; i < n; i++) fresh.push(generateProspect(state.meta.level));
  state.prospects = fresh;
}

function gatherInfo(state, prospectId) {
  const p = state.prospects.find(x => x.id === prospectId);
  if (!p || p.infoGathered) return { ok: false, msg: 'Nothing to gather.' };
  if (state.resources.time < 1) return { ok: false, msg: 'Not enough time.' };
  state.resources.time -= 1;
  p.infoGathered = true;
  // Gathering info reveals more accurate traits and can slightly improve odds
  p.uwBoost = (p.uwBoost || 0) + 5;
  return { ok: true, msg: `Learned more about ${p.name}.` };
}

function bestCarrierFor(lineId) {
  let best = null; let bestScore = -1;
  Object.values(CARRIERS).forEach(c => {
    const score = (c.appetiteBias[lineId] || 0.5);
    if (score > bestScore) { bestScore = score; best = c.id; }
  });
  return best;
}

// mode: 'quick' | 'complete'
function submitToCarrier(state, prospectId, carrierId, mode) {
  const p = state.prospects.find(x => x.id === prospectId);
  if (!p) return { ok: false, msg: 'Prospect not found.' };
  const cost = mode === 'complete' ? 3 : 1;
  if (state.resources.time < cost) return { ok: false, msg: 'Not enough time.' };
  state.resources.time -= cost;
  p.submittedTo = carrierId;
  p.submissionMode = mode;
  p.submittedDay = state.meta.day;
  return { ok: true, msg: `Submitted ${p.name} to ${CARRIERS[carrierId].name} (${mode === 'complete' ? 'Complete' : 'Quick'} submission).` };
}

// Resolve underwriting outcome immediately (simplified — could be made async/delayed later)
function resolveUnderwriting(state, prospectId) {
  const p = state.prospects.find(x => x.id === prospectId);
  if (!p || !p.submittedTo) return { ok: false, result: 'error', msg: 'Not submitted yet.' };

  const carrier = CARRIERS[p.submittedTo];
  const line = LINES[p.lineId];
  const character = CHARACTERS.find(c => c.id === state.meta.characterId);
  const career = CAREER_MODES.find(c => c.id === state.meta.careerId);

  let score = 50;
  score += (carrier.appetiteBias[p.lineId] - 1) * 40;
  score += (state.market[p.lineId] - 1) * 30;
  score += (p.traits.riskQuality - 5) * 4;
  score += (p.traits.honesty - 5) * 2;
  score += p.submissionMode === 'complete' ? (carrier.prefersComplete ? 15 : 8) : -5;
  score += (p.uwBoost || 0);
  score += (state.carrierRelationships[p.submittedTo] - 10) * 1.5;
  score += ((character.bonus.uwSuccess || 1) - 1) * 100;
  score *= career.uwMult;

  if (career.captive && p.submittedTo !== 'harbor') score -= 25; // captive agents effectively locked to one carrier in flavor terms

  score = clamp(score, 2, 96);
  const roll = Math.random() * 100;

  if (roll < score * 0.55) {
    p.uwOutcome = 'quote';
    p.finalPremium = Math.round(p.estPremium * (0.9 + Math.random() * 0.25));
    return { ok: true, result: 'quote', msg: `${carrier.name} came back with a quote for ${p.name}.` };
  } else if (roll < score * 0.55 + 25) {
    p.uwOutcome = 'moreinfo';
    p.uwBoost = (p.uwBoost || 0) + 10;
    return { ok: true, result: 'moreinfo', msg: `${carrier.name} wants more information before quoting ${p.name}.` };
  } else {
    p.uwOutcome = 'decline';
    return { ok: true, result: 'decline', msg: `${carrier.name} declined ${p.name}. Time to remarket or move on.` };
  }
}

function bindPolicy(state, prospectId) {
  const p = state.prospects.find(x => x.id === prospectId);
  if (!p || p.uwOutcome !== 'quote') return { ok: false, msg: 'No active quote to bind.' };
  const line = LINES[p.lineId];
  const commission = Math.round(p.finalPremium * line.commissionRate);

  const client = {
    id: 'c_' + Math.random().toString(36).slice(2, 9),
    name: p.name,
    lineId: p.lineId,
    carrierId: p.submittedTo,
    premium: p.finalPremium,
    commission,
    traits: p.traits,
    loyalty: p.traits.loyalty,
    boundDay: state.meta.day,
    renewalDay: state.meta.day + 90 + randInt(-10, 10),
    claims: 0,
    portraitId: getClientPortraitId(p.id),
  };

  state.clients.push(client);
  state.resources.cash += commission;
  state.resources.bookPremium += client.premium;
  state.resources.reputation = clamp(state.resources.reputation + 2, 0, 100);
  state.carrierRelationships[p.submittedTo] = clamp(state.carrierRelationships[p.submittedTo] + 1, 0, 100);
  state.stats.clientsWon++;
  state.stats.totalCommissionEarned += commission;
  state.prospects = state.prospects.filter(x => x.id !== prospectId);
  log(state, `Bound ${client.name} — $${client.premium.toLocaleString()} premium, $${commission.toLocaleString()} commission.`);

  checkLevelProgress(state);
  return { ok: true, msg: `Policy bound! +$${commission.toLocaleString()} commission.`, client };
}

function walkAwayFromProspect(state, prospectId) {
  state.prospects = state.prospects.filter(x => x.id !== prospectId);
}

// ---- Level progression ----
const LEVEL_GOALS = {
  1: { bookGoal: 100000, name: 'The Borrowed Desk' },
  2: { bookGoal: 300000, name: 'The Hustle' },
};

function checkLevelProgress(state) {
  const goal = LEVEL_GOALS[state.meta.level];
  if (!goal) return;
  if (state.resources.bookPremium >= goal.bookGoal) {
    state.meta.level += 1;
    state.flags.justLeveledUp = true;
    log(state, `LEVEL UP! Welcome to Level ${state.meta.level}.`);
  }
}

// ---- Day / Week progression ----
function endDay(state) {
  // Apply light passive drift to existing clients & finances
  const character = CHARACTERS.find(c => c.id === state.meta.characterId);
  let expenses = 15; // small daily overhead flavor
  state.resources.cash -= expenses;

  // Sanity drift
  const timeUsed = state.resources.timeMax - state.resources.time;
  if (timeUsed >= state.resources.timeMax) {
    state.resources.sanity = clamp(state.resources.sanity - 3, 0, 100);
  } else if (timeUsed <= state.resources.timeMax / 2) {
    state.resources.sanity = clamp(state.resources.sanity + 2, 0, 100);
  }

  // E&O slowly decays if low activity, grows risk of an event if high
  if (state.resources.eoRisk > 60 && Math.random() < 0.15) {
    state.resources.eoRisk = clamp(state.resources.eoRisk - 10, 0, 100);
    state.resources.cash -= 500;
    log(state, 'A minor E&O issue was resolved quietly. Cost you $500.');
  }

  // Renewal checks
  state.clients.forEach(c => {
    if (c.renewalDay <= state.meta.day) {
      const retentionBonus = (character.bonus.retention || 1);
      const chance = clamp((c.loyalty / 10) * retentionBonus, 0.2, 0.97);
      if (Math.random() < chance) {
        const bump = 1 + (Math.random() * 0.12 - 0.02);
        c.premium = Math.round(c.premium * bump);
        c.commission = Math.round(c.premium * LINES[c.lineId].commissionRate);
        state.resources.cash += c.commission;
        state.resources.bookPremium += Math.round(c.premium - c.premium / bump);
        c.renewalDay = state.meta.day + 90 + randInt(-10, 10);
        log(state, `${c.name} renewed. +$${c.commission.toLocaleString()} commission.`);
      } else {
        loseClient(state, c, 'non-renewal');
      }
    }
  });

  // Market drift (small random walk)
  Object.keys(state.market).forEach(k => {
    state.market[k] = clamp(state.market[k] + (Math.random() * 0.06 - 0.03), 0.6, 1.4);
  });

  state.meta.day += 1;
  if ((state.meta.day - 1) % 7 === 0) {
    state.meta.week += 1;
  }
  if (state.meta.week > 4) {
    state.meta.week = 1;
    state.meta.month += 1;
  }
  if (state.meta.month > 12) {
    state.meta.month = 1;
    state.meta.year += 1;
  }

  state.resources.time = state.resources.timeMax;
  refreshProspects(state);

  checkLevelProgress(state);
  saveGame(state);
}

function isGameOver(state) {
  if (state.resources.cash < -3000) return { over: true, reason: 'bankruptcy' };
  if (state.resources.eoRisk >= 100) return { over: true, reason: 'eo' };
  return { over: false };
}
