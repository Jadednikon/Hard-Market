// ============================================================
// HARD MARKET — DATA LAYER
// Pure data + state, no rendering. Designed to expand through Level 10.
// ============================================================

const CARRIERS = {
  harbor: {
    id: 'harbor', name: 'Harbor Mutual',
    tagline: 'Conservative. Preferred personal lines. Strong claims service.',
    color: '#2f5d8a',
    likes: ['auto', 'home'], appetiteBias: { auto: 1.15, home: 1.2, gl: 0.7, restaurant: 0.6, apartment: 0.8, nemt: 0.3 },
    prefersComplete: true, baseAppetite: 1.0,
  },
  prairie: {
    id: 'prairie', name: 'Prairie Casualty',
    tagline: 'Main-street commercial. Good contractor & property appetite. Loss-sensitive.',
    color: '#7a5230',
    likes: ['gl', 'apartment', 'restaurant'], appetiteBias: { auto: 0.7, home: 0.6, gl: 1.25, restaurant: 1.1, apartment: 1.15, nemt: 0.6 },
    prefersComplete: true, baseAppetite: 1.0,
  },
  velocity: {
    id: 'velocity', name: 'Velocity Specialty',
    tagline: 'Hard-to-place E&S. Expensive but flexible. Wants a coherent story.',
    color: '#8a2f4d',
    likes: ['nemt', 'restaurant'], appetiteBias: { auto: 0.5, home: 0.4, gl: 0.9, restaurant: 1.1, apartment: 0.7, nemt: 1.3 },
    prefersComplete: false, baseAppetite: 0.85,
  },
};

const UNDERWRITERS = [
  { id: 'uw_marge', name: 'Marge Feldstein', carrier: 'harbor', quirk: 'Loves complete submissions. Hates surprises.', relationship: 10 },
  { id: 'uw_dale', name: 'Dale Whitcomb', carrier: 'prairie', quirk: 'Gruff but fair. Answers the phone himself.', relationship: 10 },
  { id: 'uw_priya', name: 'Priya Anand', carrier: 'velocity', quirk: 'Wants the story, not just the app.', relationship: 10 },
];

const LINES = {
  auto:       { id: 'auto', name: 'Personal Auto', difficulty: 'EASY', premiumRange: [1200, 2400], commissionRate: 0.12 },
  home:       { id: 'home', name: 'Homeowners', difficulty: 'EASY', premiumRange: [1600, 3200], commissionRate: 0.12 },
  gl:         { id: 'gl', name: 'Contractor GL', difficulty: 'MEDIUM', premiumRange: [5000, 12000], commissionRate: 0.15 },
  restaurant: { id: 'restaurant', name: 'Restaurant', difficulty: 'MEDIUM', premiumRange: [8000, 20000], commissionRate: 0.15 },
  apartment:  { id: 'apartment', name: 'Small Apartment/LRO', difficulty: 'MEDIUM', premiumRange: [14000, 28000], commissionRate: 0.14 },
  nemt:       { id: 'nemt', name: 'NEMT / Specialty', difficulty: 'HARD', premiumRange: [30000, 65000], commissionRate: 0.18 },
};

const CHARACTERS = [
  { id: 'alex', name: 'Alex', title: 'The Hustler', desc: '+20% lead generation.', bonus: { leadGen: 1.2 }, skin: '#e0a878', hair: '#3a2418', shirt: '#c9414a' },
  { id: 'sam', name: 'Sam', title: 'The Coverage Nerd', desc: '+15% underwriting/submission success.', bonus: { uwSuccess: 1.15 }, skin: '#f0c8a0', hair: '#1a1a1a', shirt: '#2f5d8a' },
  { id: 'jordan', name: 'Jordan', title: 'The People Person', desc: '+15% client loyalty/retention.', bonus: { retention: 1.15 }, skin: '#c98a5e', hair: '#5c3a21', shirt: '#3a8a5c' },
];

const CAREER_MODES = [
  { id: 'scrappy', name: 'Scrappy Independent', desc: 'Forgiving. More leads, broad carrier access, friendlier UW.', leadMult: 1.3, uwMult: 1.15, startCash: 2200 },
  { id: 'owner', name: 'Agency Owner', desc: 'The standard, canonical experience.', leadMult: 1.0, uwMult: 1.0, startCash: 2000 },
  { id: 'captive', name: 'Captive Agent', desc: 'Hard. Strong brand & bundling, but one carrier, corporate targets.', leadMult: 0.8, uwMult: 0.9, startCash: 1800, captive: true },
];

const FIRST_NAMES = ['Danny','Priya','Wanda','Marcus','Teresa','Kyle','Renee','Omar','Linda','Greg','Sofia','Chad','Wendy','Terrence','Bianca','Hank','Lucia','Nate','Carol','Deshawn'];
const LAST_NAMES = ['Kowalski','Nguyen','Feldman','Ortiz','Brennan','Okafor','Vance','Delgado','Whitfield','Marsh','Petrov','Castillo','Hoffman','Reyes','Larsen'];
const BIZ_NAMES = ['Sunrise','Lakeside','Cream City','North Shore','Copper Peak','Harborview','Blue Collar','Fresh Start','Union','Riverside','Milltown','Oakhill','Prime','Steady State'];
const BIZ_SUFFIX = { gl: ['Contracting LLC','Builders Inc','Roofing Co','Electric LLC'], restaurant: ['Diner','Tavern','Grill','Kitchen','Cafe'], apartment: ['Apartments LLC','Properties LLC','Realty Holdings'], nemt: ['Transport LLC','NEMT Services','Rides LLC'] };

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateClientName(lineId) {
  if (lineId === 'auto' || lineId === 'home') return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  const suffix = BIZ_SUFFIX[lineId] ? pick(BIZ_SUFFIX[lineId]) : 'LLC';
  return `${pick(BIZ_NAMES)} ${suffix}`;
}

function generateProspect(level = 1) {
  const availableLines = level >= 1 ? ['auto','home','gl','restaurant','apartment'] : ['auto','home'];
  if (level >= 1 && Math.random() < 0.15) availableLines.push('nemt');
  const lineId = pick(availableLines);
  const line = LINES[lineId];
  const premium = randInt(line.premiumRange[0], line.premiumRange[1]);
  return {
    id: 'p_' + Math.random().toString(36).slice(2, 9),
    name: generateClientName(lineId),
    lineId,
    estPremium: premium,
    estCommission: Math.round(premium * line.commissionRate),
    urgency: pick(['low','low','medium','medium','high']),
    difficulty: line.difficulty,
    traits: {
      loyalty: randInt(3, 9),
      priceSensitivity: randInt(2, 9),
      organization: randInt(2, 9),
      honesty: randInt(4, 10),
      riskQuality: randInt(3, 9),
    },
    infoGathered: false,
    quirk: pick([
      'I just need the cheapest insurance. Also, I need it today.',
      'My old agent never called me back. Not once.',
      'I heard you guys are pretty good.',
      'This is for my brother-in-law\'s place too, maybe.',
      'I have a claim from three years ago, is that a problem?',
      'Whatever gets it done fastest.',
      'I just want someone who picks up the phone.',
    ]),
  };
}

// ============================================================
// GAME STATE
// ============================================================

function newGameState(characterId, careerId) {
  const character = CHARACTERS.find(c => c.id === characterId);
  const career = CAREER_MODES.find(c => c.id === careerId);
  return {
    meta: { characterId, careerId, day: 1, week: 1, month: 1, year: 1, level: 1, createdAt: Date.now() },
    resources: {
      cash: career.startCash,
      time: 10, timeMax: 10,
      reputation: 10,
      sanity: 100,
      eoRisk: 0,
      bookPremium: 0,
    },
    carrierRelationships: { harbor: 10, prairie: 10, velocity: 10 },
    clients: [],
    employees: [],
    prospects: [],
    market: { auto: 1.0, home: 1.0, gl: 1.0, restaurant: 1.0, apartment: 1.0, nemt: 1.0 },
    log: [],
    flags: {},
    pendingEvent: null,
    stats: { clientsWon: 0, clientsLost: 0, claimsHandled: 0, totalCommissionEarned: 0 },
  };
}
