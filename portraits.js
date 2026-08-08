// ============================================================
// HARD MARKET — PORTRAIT ART LIBRARY
// Each function returns an SVG string, 64x64 viewBox pixel-art style.
// Built from simple rects so it stays dependency-free and crisp.
// ============================================================

// Helper: build a pixel-grid character face quickly from rows of hex colors.
// Not used directly for full portraits (too rigid) — portraits are hand-composed below.

function svgWrap(inner, vb = 64) {
  return `<svg viewBox="0 0 ${vb} ${vb}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${inner}</svg>`;
}

// Generic head+shoulders portrait builder.
// opts: skin, hair, hairStyle('short'|'bald'|'bun'|'curly'|'part'), shirt, accessory, expression
function personPortrait(opts) {
  const { skin = '#e0a878', hair = '#3a2418', shirt = '#c9414a', hairStyle = 'short',
          accessory = null, glasses = false, beard = false, bgColor = '#1c2d52', mood = 'neutral' } = opts;

  let hairShape = '';
  if (hairStyle === 'short') {
    hairShape = `<rect x="18" y="8" width="28" height="10" fill="${hair}"/><rect x="16" y="12" width="4" height="10" fill="${hair}"/><rect x="44" y="12" width="4" height="10" fill="${hair}"/>`;
  } else if (hairStyle === 'bald') {
    hairShape = `<rect x="18" y="10" width="28" height="4" fill="${hair}" opacity="0.3"/>`;
  } else if (hairStyle === 'bun') {
    hairShape = `<rect x="18" y="8" width="28" height="9" fill="${hair}"/><rect x="26" y="4" width="12" height="6" fill="${hair}"/><rect x="16" y="14" width="4" height="12" fill="${hair}"/><rect x="44" y="14" width="4" height="12" fill="${hair}"/>`;
  } else if (hairStyle === 'curly') {
    hairShape = `<rect x="16" y="7" width="32" height="12" fill="${hair}"/><rect x="14" y="12" width="6" height="14" fill="${hair}"/><rect x="44" y="12" width="6" height="14" fill="${hair}"/>`;
  } else if (hairStyle === 'part') {
    hairShape = `<rect x="18" y="8" width="14" height="9" fill="${hair}"/><rect x="33" y="8" width="13" height="9" fill="${hair}"/><rect x="16" y="12" width="4" height="9" fill="${hair}"/><rect x="44" y="12" width="4" height="9" fill="${hair}"/>`;
  } else if (hairStyle === 'long') {
    hairShape = `<rect x="17" y="8" width="30" height="10" fill="${hair}"/><rect x="14" y="14" width="6" height="26" fill="${hair}"/><rect x="44" y="14" width="6" height="26" fill="${hair}"/>`;
  }

  let mouth = '<rect x="26" y="34" width="12" height="2" fill="#5a3a2a"/>';
  if (mood === 'happy') mouth = '<rect x="24" y="33" width="4" height="2" fill="#5a3a2a"/><rect x="28" y="35" width="8" height="2" fill="#5a3a2a"/><rect x="36" y="33" width="4" height="2" fill="#5a3a2a"/>';
  if (mood === 'stern') mouth = '<rect x="25" y="35" width="14" height="2" fill="#5a3a2a"/>';
  if (mood === 'worried') mouth = '<rect x="26" y="36" width="12" height="2" fill="#5a3a2a"/><rect x="24" y="34" width="4" height="2" fill="#5a3a2a"/><rect x="36" y="34" width="4" height="2" fill="#5a3a2a"/>';

  return svgWrap(`
    <rect width="64" height="64" fill="${bgColor}"/>
    <rect x="14" y="16" width="36" height="34" fill="${skin}"/>
    <rect x="12" y="46" width="40" height="18" fill="${shirt}"/>
    ${hairShape}
    ${beard ? `<rect x="18" y="36" width="28" height="8" fill="${hair}" opacity="0.85"/>` : ''}
    <rect x="21" y="27" width="5" height="5" fill="#201a10"/>
    <rect x="38" y="27" width="5" height="5" fill="#201a10"/>
    ${glasses ? `<rect x="18" y="25" width="12" height="9" fill="none" stroke="#201a10" stroke-width="1.5"/><rect x="34" y="25" width="12" height="9" fill="none" stroke="#201a10" stroke-width="1.5"/><rect x="30" y="28" width="4" height="1.5" fill="#201a10"/>` : ''}
    <rect x="29" y="30" width="6" height="4" fill="${skin}" stroke="#c9906a" stroke-width="0.5"/>
    ${mouth}
    ${accessory || ''}
  `);
}

// ---- Playable Characters ----
const PORTRAITS = {
  alex: () => personPortrait({ skin: '#e0a878', hair: '#2a1a10', shirt: '#c9414a', hairStyle: 'short', mood: 'happy', bgColor: '#1c2d52' }),
  sam: () => personPortrait({ skin: '#f0c8a0', hair: '#1a1a1a', shirt: '#2f5d8a', hairStyle: 'part', glasses: true, mood: 'neutral', bgColor: '#1c2d52' }),
  jordan: () => personPortrait({ skin: '#c98a5e', hair: '#4a2e18', shirt: '#3a8a5c', hairStyle: 'curly', mood: 'happy', bgColor: '#1c2d52' }),

  // Underwriters
  uw_marge: () => personPortrait({ skin: '#f0d0a8', hair: '#8a8a8a', shirt: '#3a3a5a', hairStyle: 'bun', glasses: true, mood: 'stern', bgColor: '#2f5d8a' }),
  uw_dale: () => personPortrait({ skin: '#e0b088', hair: '#6a6a6a', shirt: '#5a4a3a', hairStyle: 'bald', beard: true, mood: 'stern', bgColor: '#7a5230' }),
  uw_priya: () => personPortrait({ skin: '#c98858', hair: '#1a1010', shirt: '#8a2f4d', hairStyle: 'long', mood: 'neutral', bgColor: '#8a2f4d' }),

  // Generic client archetypes (reused across generated prospects)
  client_m1: () => personPortrait({ skin: '#e0a878', hair: '#3a2418', shirt: '#5a7a8a', hairStyle: 'short', mood: 'neutral' }),
  client_m2: () => personPortrait({ skin: '#c98a5e', hair: '#1a1a1a', shirt: '#6a8a5a', hairStyle: 'bald', beard: true, mood: 'worried' }),
  client_m3: () => personPortrait({ skin: '#f0c8a0', hair: '#7a5a3a', shirt: '#8a6a4a', hairStyle: 'curly', mood: 'happy' }),
  client_f1: () => personPortrait({ skin: '#e8c0a0', hair: '#4a2e18', shirt: '#9a5a6a', hairStyle: 'long', mood: 'neutral' }),
  client_f2: () => personPortrait({ skin: '#c98858', hair: '#1a1010', shirt: '#5a6a8a', hairStyle: 'bun', mood: 'happy' }),
  client_f3: () => personPortrait({ skin: '#f0d0a8', hair: '#8a5a2a', shirt: '#7a5a8a', hairStyle: 'part', glasses: true, mood: 'worried' }),
  client_biz1: () => personPortrait({ skin: '#e0a878', hair: '#5a5a5a', shirt: '#3a3a3a', hairStyle: 'short', beard: true, mood: 'stern' }),
  client_biz2: () => personPortrait({ skin: '#c98a5e', hair: '#2a2a2a', shirt: '#4a4a6a', hairStyle: 'bun', mood: 'neutral' }),
};

const CLIENT_ARCHETYPES = ['client_m1','client_m2','client_m3','client_f1','client_f2','client_f3','client_biz1','client_biz2'];

function getPortraitSVG(id) {
  if (PORTRAITS[id]) return PORTRAITS[id]();
  // fallback deterministic archetype from string hash
  let hash = 0;
  for (let i = 0; i < String(id).length; i++) hash = (hash * 31 + String(id).charCodeAt(i)) >>> 0;
  const archetype = CLIENT_ARCHETYPES[hash % CLIENT_ARCHETYPES.length];
  return PORTRAITS[archetype]();
}

function getClientPortraitId(clientId) {
  let hash = 0;
  for (let i = 0; i < String(clientId).length; i++) hash = (hash * 31 + String(clientId).charCodeAt(i)) >>> 0;
  return CLIENT_ARCHETYPES[hash % CLIENT_ARCHETYPES.length];
}
