// ============================================================
// HARD MARKET — SCENARIO / RANDOM EVENT ENGINE
// Schema: id, category, minLevel, weight, tags, setup, choices[]
// choices: { label, effects (fn(state)), followUp (optional delayed) }
// ============================================================

const EVENT_CATEGORIES = ['CLIENT','UW','CLAIM','CARRIER','MARKET','EMPLOYEE','OPPORTUNITY'];

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function requiresClient(state) { return state.clients.length > 0; }

const SCENARIOS = [
  // ★ Routine
  {
    id: 'ev_cert_request', category: 'CLIENT', stars: 1, minLevel: 1, tags: ['CERTIFICATE'],
    condition: requiresClient,
    setup: (state, c) => `${c.name} needs a certificate of insurance emailed over. Nothing fancy, just proof for a vendor.`,
    choices: [
      { label: 'Send it now (−1 Time)', cost: { time: 1 },
        effects: (state) => { state.resources.reputation = clamp(state.resources.reputation + 1, 0, 100); log(state, 'Certificate sent. Client happy.'); } },
      { label: 'Tell them to expect it tomorrow', cost: {},
        effects: (state) => { log(state, 'You put them off a day. Mildly annoyed, but fine.'); } },
    ],
  },
  {
    id: 'ev_id_card', category: 'CLIENT', stars: 1, minLevel: 1, tags: [],
    condition: requiresClient,
    setup: (state, c) => `${c.name} lost their ID card again and needs a new one texted over.`,
    choices: [
      { label: 'Text it over (−1 Time)', cost: { time: 1 }, effects: (state) => { log(state, 'Done. Easy.'); } },
      { label: 'Ignore for now', cost: {}, effects: (state) => { state.resources.reputation = clamp(state.resources.reputation - 1, 0, 100); } },
    ],
  },

  // ★★ Annoying
  {
    id: 'ev_lender_missing_clause', category: 'CLIENT', stars: 2, minLevel: 1, tags: ['CERTIFICATE','BILLING'],
    condition: requiresClient,
    setup: (state, c) => `${c.name}'s lender needs evidence of insurance, but they never gave you the mortgagee clause. Closing is soon.`,
    choices: [
      { label: 'Call client for the clause (−2 Time)', cost: { time: 2 },
        effects: (state) => { state.resources.reputation = clamp(state.resources.reputation + 1, 0, 100); log(state, 'Got the clause, evidence issued in time.'); } },
      { label: 'Send it without the clause and hope', cost: { time: 1 },
        effects: (state) => { state.resources.eoRisk = clamp(state.resources.eoRisk + 5, 0, 100); log(state, 'You sent it anyway. That could come back around.'); } },
    ],
  },
  {
    id: 'ev_billing_dispute', category: 'CLIENT', stars: 2, minLevel: 1, tags: ['BILLING'],
    condition: requiresClient,
    setup: (state, c) => `${c.name} says they were double-billed and they are NOT happy about it.`,
    choices: [
      { label: 'Investigate and fix (−2 Time)', cost: { time: 2 },
        effects: (state) => { state.resources.reputation = clamp(state.resources.reputation + 2, 0, 100); log(state, 'Billing error found and corrected. Client relieved.'); } },
      { label: 'Tell them to call the carrier directly', cost: {},
        effects: (state) => { state.resources.reputation = clamp(state.resources.reputation - 3, 0, 100); log(state, 'They did not love that answer.'); } },
    ],
  },
  {
    id: 'ev_new_vehicle', category: 'CLIENT', stars: 2, minLevel: 1, tags: [],
    condition: (state) => state.clients.some(c => c.lineId === 'auto'),
    setup: (state, c) => `${c.name} bought a car yesterday and needs it added before they drive it home.`,
    choices: [
      { label: 'Add it now (−2 Time)', cost: { time: 2 }, effects: (state) => { log(state, 'Vehicle added. Crisis averted.'); state.resources.reputation = clamp(state.resources.reputation + 1, 0, 100); } },
      { label: 'Tell them they have 30 days, it can wait', cost: {}, effects: (state) => { log(state, 'Technically true. They were not thrilled.'); } },
    ],
  },

  // ★★★ Problem
  {
    id: 'ev_unscheduled_driver', category: 'CLIENT', stars: 3, minLevel: 1, tags: ['E&O'],
    condition: (state) => state.clients.some(c => c.lineId === 'gl' || c.lineId === 'restaurant'),
    setup: (state, c) => `Turns out ${c.name} has an employee driving for deliveries who was never disclosed. There's no coverage for it right now.`,
    choices: [
      { label: 'Fix it immediately with carrier (−3 Time)', cost: { time: 3 },
        effects: (state) => { state.resources.eoRisk = clamp(state.resources.eoRisk - 5, 0, 100); log(state, 'Endorsement added, exposure closed.'); } },
      { label: 'Note it for renewal', cost: { time: 1 },
        effects: (state) => { state.resources.eoRisk = clamp(state.resources.eoRisk + 10, 0, 100); log(state, 'You kicked the can. That gap is still open.'); } },
    ],
  },
  {
    id: 'ev_rate_increase', category: 'CLIENT', stars: 3, minLevel: 1, tags: ['RENEWAL'],
    condition: requiresClient,
    setup: (state, c) => `${c.name}'s renewal came back with a 34% rate increase. They're on the phone, and they're loud.`,
    choices: [
      { label: 'Remarket to another carrier (−3 Time)', cost: { time: 3 },
        effects: (state) => { state.resources.reputation = clamp(state.resources.reputation + 2, 0, 100); log(state, 'Found a better option. Client calmed down.'); } },
      { label: 'Explain the market and hold the line (−1 Time)', cost: { time: 1 },
        effects: (state) => { const roll = Math.random(); if (roll > 0.5) { log(state, 'They accepted it, grumbling.'); } else { loseClient(state, c, 'rate shock'); } } },
    ],
  },

  // ★★★★ Serious
  {
    id: 'ev_claim_something_happened', category: 'CLAIM', stars: 4, minLevel: 1, tags: ['CLAIM'],
    condition: requiresClient,
    setup: (state, c) => `${c.name} calls: "So... something happened." A real claim. Could be bad.`,
    choices: [
      { label: 'Walk them through FNOL properly (−3 Time)', cost: { time: 3 },
        effects: (state) => { state.stats.claimsHandled++; state.resources.reputation = clamp(state.resources.reputation + 3, 0, 100); log(state, 'Claim filed cleanly. Client felt taken care of.'); } },
      { label: 'Give them the claims number and move on (−1 Time)', cost: { time: 1 },
        effects: (state) => { state.stats.claimsHandled++; state.resources.reputation = clamp(state.resources.reputation - 1, 0, 100); log(state, 'Handled, but impersonally.'); } },
    ],
  },
  {
    id: 'ev_cancellation_threat', category: 'CLIENT', stars: 4, minLevel: 1, tags: ['RENEWAL'],
    condition: requiresClient,
    setup: (state, c) => `${c.name} says their policy was "randomly cancelled" — despite three notices you sent about unpaid premium.`,
    choices: [
      { label: 'Call carrier, try to reinstate (−3 Time)', cost: { time: 3 },
        effects: (state) => { const roll = Math.random(); if (roll > 0.4) { log(state, 'Reinstated. Barely.'); } else { loseClient(state, c, 'non-pay cancellation'); } } },
      { label: 'Explain the notices were sent, offer to rewrite', cost: { time: 2 },
        effects: (state) => { log(state, 'They were embarrassed but stayed.'); state.resources.reputation = clamp(state.resources.reputation - 1, 0, 100); } },
    ],
  },

  // ★★★★★ OH NO
  {
    id: 'ev_undisclosed_claim', category: 'CLAIM', stars: 5, minLevel: 1, tags: ['E&O','CLAIM'],
    condition: requiresClient,
    setup: (state, c) => `A claim just came in for ${c.name} — and it turns out there's exposure that was never disclosed on the original application. This could be an E&O problem.`,
    choices: [
      { label: 'Loop in carrier honestly and document everything (−4 Time)', cost: { time: 4 },
        effects: (state) => { state.resources.eoRisk = clamp(state.resources.eoRisk + 8, 0, 100); state.resources.reputation = clamp(state.resources.reputation + 1, 0, 100); log(state, 'Handled transparently. Ugly, but the right way.'); } },
      { label: 'Try to quietly patch it before anyone notices (−2 Time)', cost: { time: 2 },
        effects: (state) => { state.resources.eoRisk = clamp(state.resources.eoRisk + 20, 0, 100); log(state, 'You papered over it. That never goes well long-term.'); } },
    ],
  },

  // Rare positive
  {
    id: 'ev_proactive_renewal', category: 'OPPORTUNITY', stars: 0, minLevel: 1, tags: ['RENEWAL'], rare: true,
    condition: requiresClient,
    setup: (state, c) => `${c.name} emails you their updated info for renewal — before you even asked. A rare miracle.`,
    choices: [
      { label: 'Thank them and process it (−1 Time)', cost: { time: 1 },
        effects: (state) => { state.resources.reputation = clamp(state.resources.reputation + 2, 0, 100); state.resources.sanity = clamp(state.resources.sanity + 3, 0, 100); log(state, 'A good day. You will remember this client fondly.'); } },
    ],
  },
  {
    id: 'ev_referral', category: 'OPPORTUNITY', stars: 0, minLevel: 1, tags: [], rare: true,
    condition: requiresClient,
    setup: (state, c) => `${c.name} refers a friend who needs a quote. Free lead.`,
    choices: [
      { label: 'Add to prospects', cost: {},
        effects: (state) => { state.prospects.push(generateProspect(state.meta.level)); log(state, 'New prospect added from referral.'); } },
    ],
  },

  // UW events
  {
    id: 'ev_uw_wants_more', category: 'UW', stars: 2, minLevel: 1, tags: ['UW'],
    condition: (state) => state.prospects.some(p => p.submittedTo),
    setup: (state, p) => `${UNDERWRITERS.find(u => u.carrier === p.submittedTo)?.name || 'Underwriting'} wants loss runs, an owner resume, and photos before quoting ${p.name}.`,
    choices: [
      { label: 'Gather it and resend (−3 Time)', cost: { time: 3 },
        effects: (state, p) => { if (p) { p.uwBoost = (p.uwBoost || 0) + 15; } log(state, 'Package sent. Better odds now.'); } },
      { label: 'Send a quick reply and hope', cost: { time: 1 },
        effects: (state, p) => { if (p) { p.uwBoost = (p.uwBoost || 0) - 5; } log(state, 'Light response sent. UW may push back again.'); } },
    ],
  },

  // Market events
  {
    id: 'ev_market_tightening', category: 'MARKET', stars: 0, minLevel: 1, tags: [],
    condition: () => true,
    setup: () => `Market update: underwriting appetite is tightening across the board.`,
    choices: [
      { label: 'Noted (OK)', cost: {},
        effects: (state) => { Object.keys(state.market).forEach(k => { state.market[k] = clamp(state.market[k] - 0.05, 0.5, 1.5); }); } },
    ],
  },
  {
    id: 'ev_market_loosening', category: 'MARKET', stars: 0, minLevel: 1, tags: [], rare: true,
    condition: () => true,
    setup: () => `Market update: a carrier just loosened appetite in a key class. Good timing.`,
    choices: [
      { label: 'Noted (OK)', cost: {},
        effects: (state) => { const line = pick(Object.keys(state.market)); state.market[line] = clamp(state.market[line] + 0.15, 0.5, 1.5); } },
    ],
  },
];

function log(state, msg) {
  state.log.unshift({ day: state.meta.day, msg });
  if (state.log.length > 50) state.log.pop();
}

function loseClient(state, client, reason) {
  state.clients = state.clients.filter(c => c.id !== client.id);
  state.resources.bookPremium = Math.max(0, state.resources.bookPremium - client.premium);
  state.stats.clientsLost++;
  log(state, `Lost ${client.name} (${reason}).`);
}

// Roll for a random event at start of day. Returns event instance or null.
function rollDailyEvent(state) {
  const isTuesday = state.meta.day % 7 === 2 && Math.random() < 0.3;
  const eligible = SCENARIOS.filter(s => s.minLevel <= state.meta.level && (!s.condition || s.condition(state)));
  if (eligible.length === 0) return null;

  const rareRoll = Math.random();
  const pool = rareRoll < 0.12 ? eligible.filter(s => s.rare) : eligible.filter(s => !s.rare);
  const finalPool = pool.length ? pool : eligible;
  const scenario = pick(finalPool);

  let subject = null;
  if (scenario.category === 'CLIENT' || scenario.category === 'CLAIM') {
    subject = pick(state.clients.length ? state.clients : [{ name: 'a client' }]);
  } else if (scenario.category === 'UW') {
    subject = pick(state.prospects.filter(p => p.submittedTo));
  }

  return { scenario, subject, isTuesday };
}
