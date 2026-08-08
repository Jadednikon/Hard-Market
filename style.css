  :root {
    --navy-deep: #0b1220;
    --navy: #14213d;
    --navy-mid: #1c2d52;
    --navy-light: #2f5d8a;
    --tan: #d9c3a0;
    --tan-dark: #b89a6e;
    --wood: #6b4a2f;
    --wood-dark: #4a3220;
    --cream: #f4ecd8;
    --cream-dark: #e2d3ae;
    --gold: #d4a72c;
    --gold-bright: #f0c445;
    --green: #3a8a5c;
    --red: #c9414a;
    --ink: #201a10;
    --safe-top: env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
    --safe-left: env(safe-area-inset-left, 0px);
    --safe-right: env(safe-area-inset-right, 0px);
  }

  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

  html, body {
    margin: 0; padding: 0; height: 100%; overflow: hidden;
    background: var(--navy-deep);
    font-family: 'Courier New', monospace;
    color: var(--cream);
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
  }

  #game-root {
    position: fixed; inset: 0;
    padding-top: var(--safe-top); padding-bottom: var(--safe-bottom);
    padding-left: var(--safe-left); padding-right: var(--safe-right);
    display: flex; flex-direction: column;
    background: linear-gradient(180deg, var(--navy-deep) 0%, var(--navy) 100%);
  }

  .pixel-font {
    font-family: 'Courier New', monospace;
    font-weight: bold;
    letter-spacing: 0.5px;
  }

  /* ============ SCREEN SYSTEM ============ */
  .screen {
    position: absolute; inset: 0;
    display: none;
    flex-direction: column;
    padding-top: calc(var(--safe-top));
    padding-bottom: calc(var(--safe-bottom));
  }
  .screen.active { display: flex; }

  /* ============ TITLE SCREEN ============ */
  #screen-title {
    align-items: center; justify-content: center;
    background:
      radial-gradient(ellipse at 50% 20%, rgba(212,167,44,0.15), transparent 60%),
      linear-gradient(180deg, var(--navy-deep) 0%, var(--navy) 60%, var(--navy-mid) 100%);
    text-align: center;
    padding: 20px;
    overflow-y: auto;
  }
  .title-logo {
    font-size: clamp(2.2rem, 10vw, 4rem);
    color: var(--gold-bright);
    text-shadow: 4px 4px 0 var(--red), 8px 8px 0 rgba(0,0,0,0.4);
    letter-spacing: 2px;
    line-height: 1;
    margin-bottom: 6px;
    animation: title-in 0.6s ease-out;
  }
  .title-sub {
    font-size: clamp(0.7rem, 3vw, 1rem);
    color: var(--tan);
    letter-spacing: 4px;
    margin-bottom: 8px;
  }
  .title-tagline {
    font-size: clamp(0.65rem, 2.6vw, 0.85rem);
    color: var(--gold);
    margin-bottom: 28px;
    font-style: italic;
  }
  @keyframes title-in {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .btn {
    font-family: 'Courier New', monospace;
    font-weight: bold;
    font-size: 1rem;
    padding: 14px 28px;
    border: 3px solid var(--gold);
    background: var(--navy-mid);
    color: var(--cream);
    border-radius: 4px;
    cursor: pointer;
    min-height: 48px;
    min-width: 200px;
    box-shadow: 0 4px 0 var(--wood-dark), 0 4px 12px rgba(0,0,0,0.4);
    transition: transform 0.08s, box-shadow 0.08s;
    margin: 6px;
  }
  .btn:active {
    transform: translateY(4px);
    box-shadow: 0 0 0 var(--wood-dark);
  }
  .btn-primary { background: var(--green); border-color: #5fc487; }
  .btn-danger { background: var(--red); border-color: #e08088; }
  .btn-gold { background: var(--gold); color: var(--ink); border-color: var(--gold-bright); }
  .btn-small { font-size: 0.8rem; padding: 10px 16px; min-width: unset; min-height: 40px; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .title-menu { display: flex; flex-direction: column; align-items: center; }

  /* ============ SELECT SCREENS ============ */
  .select-screen {
    align-items: center; padding: 16px; overflow-y: auto;
    background: linear-gradient(180deg, var(--navy-deep), var(--navy));
  }
  .select-header {
    font-size: clamp(1.1rem, 5vw, 1.6rem);
    color: var(--gold-bright);
    margin: 10px 0 4px;
    text-align: center;
  }
  .select-subheader { color: var(--tan); font-size: 0.75rem; margin-bottom: 16px; text-align: center; }
  .card-grid {
    display: flex; flex-direction: column; gap: 12px;
    width: 100%; max-width: 480px;
  }
  .select-card {
    background: var(--cream);
    color: var(--ink);
    border: 3px solid var(--wood-dark);
    border-radius: 6px;
    padding: 12px;
    display: flex; align-items: center; gap: 12px;
    cursor: pointer;
    box-shadow: 0 3px 0 var(--wood-dark);
  }
  .select-card.selected {
    border-color: var(--gold);
    background: var(--cream-dark);
    box-shadow: 0 0 0 3px var(--gold), 0 3px 0 var(--wood-dark);
  }
  .select-card svg { width: 64px; height: 64px; flex-shrink: 0; image-rendering: pixelated; }
  .select-card-body { flex: 1; text-align: left; }
  .select-card-title { font-weight: bold; font-size: 0.95rem; }
  .select-card-sub { font-size: 0.7rem; color: var(--wood); margin: 2px 0 4px; }
  .select-card-desc { font-size: 0.72rem; color: var(--ink); }

  /* ============ OFFICE / MAIN SCREEN ============ */
  #screen-office { background: var(--navy-deep); }

  .topbar {
    background: var(--navy);
    border-bottom: 3px solid var(--gold);
    padding: 6px 10px;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.65rem;
    flex-shrink: 0;
  }
  .topbar-title { color: var(--gold-bright); font-size: 0.75rem; }
  .topbar-date { color: var(--tan); }

  .office-scene {
    position: relative;
    flex: 1;
    min-height: 0;
    background: linear-gradient(180deg, #3a2e1f 0%, #4a3826 55%, #6b4a2f 100%);
    overflow: hidden;
  }
  .office-scene svg.office-bg { position: absolute; inset: 0; width: 100%; height: 100%; }

  .hotspot {
    position: absolute;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    -webkit-tap-highlight-color: transparent;
  }
  .hotspot-label {
    position: absolute;
    bottom: -18px; left: 50%; transform: translateX(-50%);
    font-size: 0.55rem;
    color: var(--gold-bright);
    background: rgba(11,18,32,0.85);
    padding: 2px 6px;
    border-radius: 3px;
    white-space: nowrap;
    pointer-events: none;
  }
  .hotspot svg { width: 100%; height: 100%; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.5)); }
  .hotspot.pulse svg { animation: pulse 1.6s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { filter: drop-shadow(0 0 2px var(--gold)); } 50% { filter: drop-shadow(0 0 10px var(--gold-bright)); } }

  #player-sprite {
    position: absolute;
    width: 13%; max-width: 70px;
    transition: left 0.5s ease, top 0.5s ease;
    z-index: 5;
  }
  #player-sprite svg { width: 100%; filter: drop-shadow(0 3px 4px rgba(0,0,0,0.5)); }

  .stat-strip {
    background: var(--navy-mid);
    border-top: 2px solid var(--wood);
    padding: 8px 10px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 14px;
    font-size: 0.62rem;
    flex-shrink: 0;
  }
  .stat-row { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
  .stat-label { color: var(--tan); }
  .stat-value { color: var(--cream); font-weight: bold; }
  .bar-track { flex: 1; height: 8px; background: var(--navy-deep); border-radius: 4px; overflow: hidden; border: 1px solid var(--wood-dark); }
  .bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }

  .nav-bar {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    background: var(--navy);
    border-top: 3px solid var(--gold);
    flex-shrink: 0;
  }
  .nav-btn {
    background: none; border: none; color: var(--tan);
    font-family: 'Courier New', monospace;
    padding: 8px 2px;
    font-size: 0.55rem;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    cursor: pointer;
    min-height: 52px;
  }
  .nav-btn.active { color: var(--gold-bright); }
  .nav-btn svg { width: 20px; height: 20px; }

  /* ============ MODALS / PANELS ============ */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    display: none;
    align-items: center; justify-content: center;
    z-index: 100;
    padding: 16px;
    padding-top: calc(16px + var(--safe-top));
    padding-bottom: calc(16px + var(--safe-bottom));
  }
  .modal-overlay.active { display: flex; }
  .modal-box {
    background: var(--cream);
    color: var(--ink);
    border: 4px solid var(--navy);
    border-radius: 8px;
    max-width: 480px;
    width: 100%;
    max-height: 100%;
    display: flex; flex-direction: column;
    box-shadow: 0 10px 40px rgba(0,0,0,0.6);
  }
  .modal-header {
    background: var(--navy);
    color: var(--gold-bright);
    padding: 10px 14px;
    font-size: 0.8rem;
    border-radius: 4px 4px 0 0;
    display: flex; justify-content: space-between; align-items: center;
  }
  .modal-close {
    background: none; border: none; color: var(--tan);
    font-size: 1.1rem; cursor: pointer; padding: 4px 8px;
  }
  .modal-body {
    padding: 14px;
    overflow-y: auto;
    font-size: 0.8rem;
    line-height: 1.5;
  }
  .modal-footer {
    padding: 10px 14px;
    border-top: 2px solid var(--tan-dark);
    display: flex; gap: 8px; justify-content: flex-end;
    flex-wrap: wrap;
  }

  .list-item {
    background: white;
    border: 2px solid var(--tan-dark);
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 8px;
    display: flex; justify-content: space-between; align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  .list-item:active { background: var(--cream-dark); }
  .li-body { flex: 1; }
  .li-title { font-weight: bold; font-size: 0.82rem; }
  .li-sub { font-size: 0.68rem; color: var(--wood); margin-top: 2px; }
  .li-tag {
    font-size: 0.6rem; padding: 2px 6px; border-radius: 3px;
    background: var(--navy-mid); color: var(--gold-bright);
    white-space: nowrap;
  }
  .li-tag.easy { background: var(--green); color: white; }
  .li-tag.medium { background: var(--gold); color: var(--ink); }
  .li-tag.hard { background: var(--red); color: white; }
  .li-tag.insane { background: #6b1030; color: white; }

  .detail-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed var(--tan-dark); font-size: 0.78rem; }
  .detail-row .k { color: var(--wood); }
  .detail-row .v { font-weight: bold; }
  .detail-row .v.good { color: var(--green); }
  .detail-row .v.bad { color: var(--red); }

  .empty-state { text-align: center; padding: 30px 14px; color: var(--wood); font-size: 0.78rem; }

  .toast-container { position: fixed; top: calc(10px + var(--safe-top)); left: 0; right: 0; z-index: 200; display: flex; flex-direction: column; align-items: center; gap: 6px; pointer-events: none; }
  .toast {
    background: var(--navy); color: var(--gold-bright);
    border: 2px solid var(--gold);
    padding: 8px 14px; border-radius: 5px;
    font-size: 0.72rem; max-width: 90%;
    box-shadow: 0 4px 10px rgba(0,0,0,0.4);
    animation: toast-in 0.25s ease-out;
  }
  @keyframes toast-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

  .portrait-frame {
    width: 72px; height: 72px; flex-shrink: 0;
    background: var(--navy-mid);
    border: 3px solid var(--gold);
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .portrait-frame svg { width: 100%; height: 100%; }
  .portrait-frame.small { width: 44px; height: 44px; border-width: 2px; }

  .event-header { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; }
  .event-stars { color: var(--gold); font-size: 0.9rem; letter-spacing: 2px; }
  .event-cat { font-size: 0.6rem; color: var(--wood); text-transform: uppercase; letter-spacing: 1px; }

  .choice-btn {
    display: block; width: 100%; text-align: left;
    background: white; border: 2px solid var(--tan-dark); border-radius: 5px;
    padding: 10px 12px; margin-bottom: 8px; font-family: 'Courier New', monospace;
    font-size: 0.78rem; color: var(--ink); cursor: pointer;
  }
  .choice-btn:active { background: var(--cream-dark); }
  .choice-cost { color: var(--wood); font-size: 0.68rem; margin-left: 4px; }

  .section-label { font-size: 0.7rem; color: var(--wood); text-transform: uppercase; letter-spacing: 1px; margin: 12px 0 6px; }
  .section-label:first-child { margin-top: 0; }

  .progress-header {
    display: flex; justify-content: space-between; align-items: center;
    background: var(--navy-mid); padding: 8px 12px; border-radius: 5px; margin-bottom: 10px;
    color: var(--cream); font-size: 0.7rem;
  }

  #screen-loading { align-items: center; justify-content: center; background: var(--navy-deep); }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: var(--wood); border-radius: 3px; }

  @media (min-width: 700px) {
    .modal-box { max-width: 560px; }
  }
