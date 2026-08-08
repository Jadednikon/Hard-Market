// ============================================================
// HARD MARKET — OFFICE SCENE ART
// Level 1: "The Borrowed Desk" — single small office.
//
// SCENE_ART_URL: set this to a path (e.g. 'assets/office-level1.jpg')
// once you have an AI-generated / illustrated background for this
// level, and buildOfficeScene() in main.js will use it automatically
// in place of the placeholder SVG below — no other code changes needed.
// Recommended: landscape, ~1600x900+ so it stays crisp when scaled.
// ============================================================

const SCENE_ART_URL = 'assets/office-level1.jpg';


function officeBackgroundLevel1() {
  return `<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" preserveAspectRatio="xMidYMax slice" style="width:100%;height:100%;">
    <!-- back wall -->
    <rect x="0" y="0" width="400" height="150" fill="#a9865e"/>
    <rect x="0" y="0" width="400" height="150" fill="url(#wallshade)" opacity="0.15"/>
    <!-- baseboard -->
    <rect x="0" y="140" width="400" height="10" fill="#7a5230"/>
    <!-- floor -->
    <rect x="0" y="150" width="400" height="90" fill="#5a3f26"/>
    <rect x="0" y="150" width="400" height="6" fill="#6b4a2f"/>
    <!-- floor planks -->
    <g opacity="0.25" stroke="#3a2818" stroke-width="1">
      <line x1="0" y1="170" x2="400" y2="170"/>
      <line x1="0" y1="192" x2="400" y2="192"/>
      <line x1="0" y1="214" x2="400" y2="214"/>
      <line x1="60" y1="150" x2="30" y2="240"/>
      <line x1="150" y1="150" x2="130" y2="240"/>
      <line x1="250" y1="150" x2="240" y2="240"/>
      <line x1="340" y1="150" x2="350" y2="240"/>
    </g>

    <!-- window -->
    <rect x="20" y="20" width="60" height="70" fill="#cfe3e8" stroke="#4a3220" stroke-width="4"/>
    <rect x="47" y="20" width="6" height="70" fill="#4a3220"/>
    <rect x="20" y="52" width="60" height="6" fill="#4a3220"/>
    <rect x="24" y="24" width="24" height="24" fill="#9ec4cc" opacity="0.6"/>

    <!-- framed motivational sign -->
    <rect x="100" y="26" width="66" height="40" fill="#f4ecd8" stroke="#4a3220" stroke-width="3"/>
    <text x="133" y="42" font-family="monospace" font-size="9" font-weight="bold" fill="#201a10" text-anchor="middle">HUSTLE</text>
    <text x="133" y="53" font-family="monospace" font-size="6" fill="#5a3f26" text-anchor="middle">CALL · QUOTE</text>
    <text x="133" y="61" font-family="monospace" font-size="6" fill="#5a3f26" text-anchor="middle">CLOSE</text>

    <!-- wall clock -->
    <circle cx="320" cy="45" r="20" fill="#f4ecd8" stroke="#4a3220" stroke-width="3"/>
    <circle cx="320" cy="45" r="2" fill="#201a10"/>
    <line x1="320" y1="45" x2="320" y2="32" stroke="#201a10" stroke-width="2"/>
    <line x1="320" y1="45" x2="328" y2="45" stroke="#201a10" stroke-width="2"/>

    <!-- potted plant -->
    <rect x="360" y="95" width="24" height="16" fill="#7a5230" rx="2"/>
    <circle cx="372" cy="80" r="16" fill="#3a8a5c"/>
    <circle cx="362" cy="88" r="10" fill="#3a8a5c"/>
    <circle cx="382" cy="88" r="10" fill="#3a8a5c"/>

    <!-- desk (large, center-right) -->
    <rect x="150" y="150" width="200" height="14" fill="#8a6a44"/>
    <rect x="150" y="150" width="200" height="6" fill="#a9865e"/>
    <rect x="158" y="164" width="14" height="50" fill="#6b4a2f"/>
    <rect x="328" y="164" width="14" height="50" fill="#6b4a2f"/>
    <rect x="158" y="200" width="184" height="14" fill="#5a3f26"/>

    <!-- desk chair (behind desk, faded) -->
    <rect x="230" y="130" width="40" height="30" fill="#2f3a52" rx="4" opacity="0.9"/>

    <!-- monitor on desk -->
    <g id="hotspot-computer-art">
      <rect x="255" y="118" width="46" height="34" fill="#d9c3a0" rx="2"/>
      <rect x="260" y="122" width="36" height="24" fill="#1c2d52"/>
      <rect x="262" y="124" width="20" height="3" fill="#3a8a5c" opacity="0.8"/>
      <rect x="262" y="129" width="28" height="2" fill="#9fc" opacity="0.5"/>
      <rect x="262" y="133" width="24" height="2" fill="#9fc" opacity="0.5"/>
      <rect x="272" y="152" width="8" height="8" fill="#a9865e"/>
      <rect x="262" y="160" width="28" height="4" fill="#a9865e"/>
    </g>

    <!-- phone on desk -->
    <g id="hotspot-phone-art">
      <rect x="185" y="150" width="24" height="16" fill="#c9414a" rx="2"/>
      <rect x="189" y="140" width="16" height="10" fill="#8a2f38" rx="1"/>
      <circle cx="192" cy="156" r="1.5" fill="#f4ecd8"/>
      <circle cx="197" cy="156" r="1.5" fill="#f4ecd8"/>
      <circle cx="202" cy="156" r="1.5" fill="#f4ecd8"/>
      <circle cx="192" cy="161" r="1.5" fill="#f4ecd8"/>
      <circle cx="197" cy="161" r="1.5" fill="#f4ecd8"/>
      <circle cx="202" cy="161" r="1.5" fill="#f4ecd8"/>
    </g>

    <!-- coffee cup + papers detail -->
    <rect x="215" y="152" width="10" height="12" fill="#f4ecd8" rx="1"/>
    <rect x="215" y="150" width="10" height="3" fill="#5a3f26" opacity="0.6"/>
    <rect x="305" y="156" width="20" height="14" fill="#f4ecd8" opacity="0.9" transform="rotate(-4 315 163)"/>

    <!-- filing cabinet (left) -->
    <g id="hotspot-files-art">
      <rect x="40" y="140" width="46" height="70" fill="#3a3a4a"/>
      <rect x="44" y="150" width="38" height="16" fill="#2a2a38" stroke="#1a1a24" stroke-width="1"/>
      <rect x="44" y="170" width="38" height="16" fill="#2a2a38" stroke="#1a1a24" stroke-width="1"/>
      <rect x="44" y="190" width="38" height="16" fill="#2a2a38" stroke="#1a1a24" stroke-width="1"/>
      <rect x="60" y="156" width="6" height="3" fill="#d4a72c"/>
      <rect x="60" y="176" width="6" height="3" fill="#d4a72c"/>
      <rect x="60" y="196" width="6" height="3" fill="#d4a72c"/>
    </g>

    <!-- desk area / networking hotspot marker (front of desk, open floor) -->
    <g id="hotspot-desk-art">
      <ellipse cx="245" cy="222" rx="26" ry="7" fill="#3a2818" opacity="0.4"/>
    </g>

    <defs>
      <linearGradient id="wallshade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#000" stop-opacity="0.3"/>
        <stop offset="1" stop-color="#000" stop-opacity="0"/>
      </linearGradient>
    </defs>
  </svg>`;
}

// Hotspot definitions: position as % of scene box (left/top), sized for touch.
// Coordinates tuned against assets/office-level1.jpg (red phone, notepad,
// papers tray, filing cabinet, open desk-front floor). If you swap in a
// different piece of art, these will need re-tuning to match.
const OFFICE_HOTSPOTS_L1 = [
  { id: 'phone', label: 'LEADS', left: '27%', top: '49%', width: '11%', height: '16%' },
  { id: 'notepad', label: 'BOOK', left: '46%', top: '53%', width: '12%', height: '11%' },
  { id: 'reports', label: 'MARKET', left: '64%', top: '48%', width: '11%', height: '14%' },
  { id: 'cabinet', label: 'STAFF', left: '4%', top: '23%', width: '15%', height: '48%' },
  { id: 'deskfront', label: 'NETWORK', left: '33%', top: '82%', width: '22%', height: '11%' },
];

function hotspotIconSVG(id) {
  const icons = {
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="#f0c445" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`,
    notepad: `<svg viewBox="0 0 24 24" fill="none" stroke="#f0c445" stroke-width="2"><path d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z"/></svg>`,
    reports: `<svg viewBox="0 0 24 24" fill="none" stroke="#f0c445" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 9l-5 5-4-4-4 4"/></svg>`,
    cabinet: `<svg viewBox="0 0 24 24" fill="none" stroke="#f0c445" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg>`,
    deskfront: `<svg viewBox="0 0 24 24" fill="none" stroke="#f0c445" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0116 0v1"/></svg>`,
  };
  return icons[id] || '';
}

// Simple player sprite (front-facing), color-tinted per character.
function playerSpriteSVG(character) {
  const shirt = character.shirt || '#c9414a';
  const skin = character.skin || '#e0a878';
  const hair = character.hair || '#3a2418';
  return `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <ellipse cx="16" cy="45" rx="10" ry="3" fill="#000" opacity="0.3"/>
    <rect x="10" y="8" width="12" height="12" fill="${skin}"/>
    <rect x="9" y="5" width="14" height="7" fill="${hair}"/>
    <rect x="8" y="20" width="16" height="16" fill="${shirt}"/>
    <rect x="6" y="21" width="4" height="12" fill="${skin}"/>
    <rect x="22" y="21" width="4" height="12" fill="${skin}"/>
    <rect x="10" y="36" width="5" height="10" fill="#2a2a38"/>
    <rect x="17" y="36" width="5" height="10" fill="#2a2a38"/>
    <rect x="9" y="45" width="6" height="3" fill="#1a1a24"/>
    <rect x="17" y="45" width="6" height="3" fill="#1a1a24"/>
  </svg>`;
}
