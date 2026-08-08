# Hard Market: An Insurance Agency Sim

A pixel-art insurance agency management sim inspired by Drug Wars — build a book of business, survive underwriting, and grow from a borrowed desk into a regional agency.

## Structure
```
index.html          Entry point
css/style.css        All styling (navy/tan/gold retro theme)
js/data.js            Carriers, lines, characters, career modes, prospect generation
js/events.js           Random event / scenario engine (data-driven, easy to extend)
js/engine.js            Core game logic: prospecting → submission → UW → bind, day/week loop, save/load
js/main.js               UI controller: screens, modals, hotspots, rendering
js/art/portraits.js       SVG pixel-art portrait generator (characters, underwriters, clients)
js/art/office.js          SVG office scene + hotspot layout + player sprite
```

## Running locally
Just open `index.html` in a browser, or serve the folder:
```
python3 -m http.server 8000
```

## Deploying to GitHub Pages
Push this folder as the repo root (or `/docs`), enable Pages in repo settings. All paths are relative so it works at any subpath.

## What's implemented (Level 1 + Level 2 preview)
- Title → character select (Alex/Sam/Jordan, each with a gameplay bonus) → career mode (Scrappy/Owner/Captive)
- Borrowed-desk office scene with tappable hotspots (Phone → Leads, Computer → Market, Files → Book, Desk → Networking); player sprite walks to the hotspot before opening it
- Full prospect loop: generate leads → gather info → choose carrier → Quick vs Complete submission → underwriting resolves to Quote/More Info/Decline → bind into persistent book
- Persistent client book with renewals, loyalty-driven retention, rate changes, firing clients
- Data-driven random event engine (★ to ★★★★★ severity, CLIENT/UW/CLAIM/CARRIER/MARKET categories, rare positive events, occasional "Tuesday" overload day)
- Market appetite per line that drifts day to day
- Carrier relationships (Harbor Mutual, Prairie Casualty, Velocity Specialty) with named underwriters
- Day/week/month/year progression, sanity and E&O risk tracking, bankruptcy/E&O game-over states
- localStorage autosave, New Game / Continue / Reset
- Level 2 preview: hitting the $100k book goal levels you up and unlocks hiring your first employee (STAFF tab)
- Mobile-first layout with safe-area insets, large touch targets, no hover-only controls

## Intentionally deferred (Level 2+ systems per the design doc)
- Full employee simulation (skill/speed/accuracy/morale, promotions, mistakes, leaving)
- Departments, specialty markets, contingency income
- Second location / branches / producers
- Acquisitions, M&A, executive KPIs
- Office art evolving per level (currently Level 1 art only)
- Delayed/multi-day follow-up scenario chains (current events resolve same-turn)

## Testing notes
No headless browser was available in this environment to click through the live DOM, but the full game engine (data generation, submission/underwriting math, event resolution, day progression, save/load) was run through a Node VM harness: a 200-day stress simulation with hundreds of bound clients, a bankruptcy path, and 200 resolved random events all completed with zero runtime errors. Worth a manual click-through on your end before you consider it fully verified — if anything looks off visually, it's easy for me to fix now that it's split into small files.
