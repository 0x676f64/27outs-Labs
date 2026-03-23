(() => {
  // ─────────────────────────────────────────────────────────
  //  CONSTANTS
  // ─────────────────────────────────────────────────────────
  const API_BASE  = 'https://statsapi.mlb.com/api/v1.1';
  const API_V1    = 'https://statsapi.mlb.com/api/v1';
  const LOGO_BASE = 'https://www.mlbstatic.com/team-logos';
  const IMG_BASE  = 'https://midfield.mlbstatic.com/v1/people';

  const FINAL_STATUSES   = ['Final','Game Over','Final: Tied','Completed Early','Suspended: Rain','Suspended','Cancelled'];
  const PREGAME_STATUSES = ['Pre-Game','Scheduled','Warmup','Delayed','Postponed'];
  const POLL_INTERVAL_MS = 8000;

  // ─────────────────────────────────────────────────────────
  //  PITCH TYPE CONFIG — color, full name, abbreviation
  // ─────────────────────────────────────────────────────────
  const PITCH_MAP = {
    FF: { label:'4-Seam',   abbr:'FF', color:'#e63946' },
    FA: { label:'4-Seam',   abbr:'FF', color:'#e63946' },
    FT: { label:'2-Seam',   abbr:'FT', color:'#c1121f' },
    SI: { label:'Sinker',   abbr:'SI', color:'#c1121f' },
    FC: { label:'Cutter',   abbr:'FC', color:'#f4a261' },
    SL: { label:'Slider',   abbr:'SL', color:'#2a9d8f' },
    ST: { label:'Sweeper',  abbr:'ST', color:'#fb8500' },
    SV: { label:'Slurve',   abbr:'SV', color:'#3a86ff' },
    CU: { label:'Curveball',abbr:'CU', color:'#457b9d' },
    KC: { label:'Knuck-Cur',abbr:'KC', color:'#457b9d' },
    CS: { label:'Slow Cur', abbr:'CS', color:'#457b9d' },
    CH: { label:'Changeup', abbr:'CH', color:'#8338ec' },
    FS: { label:'Splitter', abbr:'FS', color:'#06d6a0' },
    FO: { label:'Forkball', abbr:'FO', color:'#06d6a0' },
    SC: { label:'Screwball',abbr:'SC', color:'#06d6a0' },
    KN: { label:'Knuckle',  abbr:'KN', color:'#adb5bd' },
    EP: { label:'Eephus',   abbr:'EP', color:'#adb5bd' },
    PO: { label:'Pitchout', abbr:'PO', color:'#6c757d' },
    IN: { label:'Int. Ball', abbr:'IN', color:'#6c757d' },
  };

  const pitchInfo = (code) => PITCH_MAP[code] || { label: code || '?', abbr: code || '?', color:'#94a3b8' };

  // ─────────────────────────────────────────────────────────
  //  LEAGUE-AVG BY COUNT (2024 actuals — fallback)
  //  Source: Stathead/Baseball Savant public leaderboard data
  // ─────────────────────────────────────────────────────────
  const LEAGUE_AVG_BY_COUNT = {
    '0-0': .248, '0-1': .215, '0-2': .141,
    '1-0': .273, '1-1': .234, '1-2': .158,
    '2-0': .299, '2-1': .262, '2-2': .178,
    '3-0': .330, '3-1': .303, '3-2': .216,
  };

  // ─────────────────────────────────────────────────────────
  //  STATE
  // ─────────────────────────────────────────────────────────
  let awayTeamId, homeTeamId;
  let videoMatcher    = null;
  let pollTimer       = null;
  let lastPlayIndex   = -1;   // detect new pitches without full re-render
  let lastGameState   = '';   // detect inning/score changes
  let batterCountCache = {};  // { playerId: { '0-0': .248, ... } }

  // ─────────────────────────────────────────────────────────
  //  UTILS
  // ─────────────────────────────────────────────────────────
  const getUrlParam  = (n) => new URLSearchParams(window.location.search).get(n);
  const isDark       = ()  => document.body.classList.contains('dark');
  const getPhase     = (s) => FINAL_STATUSES.includes(s) ? 'FINAL' : PREGAME_STATUSES.includes(s) ? 'PREGAME' : 'LIVE';
  const logoUrl      = (id, dark) => dark ? `${LOGO_BASE}/team-cap-on-dark/${id}.svg` : `${LOGO_BASE}/${id}.svg`;
  const fmtAvg       = (n) => n != null ? (n < 1 ? '.'+String(Math.round(n*1000)).padStart(3,'0') : n.toFixed(3)) : '---';

  // ─────────────────────────────────────────────────────────
  //  EVENT ICON MAP
  // ─────────────────────────────────────────────────────────
  const EVENT_ICON_MAP = {
    'home run':'HR','home_run':'HR','triple':'3B','double':'2B','single':'1B',
    'walk':'BB','hit by pitch':'HBP','hit_by_pitch':'HBP',
    'sac fly':'SAC','sac_fly':'SAC','sac bunt':'SH','sac_bunt':'SH',
    'grounded into dp':'GIDP','grounded_into_dp':'GIDP',
    'field error':'E','field_error':'E','fielders choice':'FC','fielders_choice':'FC',
    'catcher interference':'CI','strikeout':'K','forceout':'FO','force_out':'FO',
    'groundout':'OUT','field_out':'OUT','flyout':'OUT','lineout':'OUT','pop out':'OUT',
  };
  const getEventIcon = (t) => {
    if (!t) return '?';
    const l = t.toLowerCase();
    for (const [k, v] of Object.entries(EVENT_ICON_MAP)) if (l.includes(k)) return v;
    return t.substring(0,3).toUpperCase();
  };

  // ─────────────────────────────────────────────────────────
  //  BASE RUNNER DIAMOND SVG
  //  Palette: occupied = #bf0d3d (red), empty = transparent with
  //  navy border in light mode / slate border in dark mode.
  //  Diamond oriented like a real field — 2B at top, 1B right, 3B left.
  // ─────────────────────────────────────────────────────────
  const buildRunnerSVG = (offense = {}) => {
    const on1   = !!offense.first;
    const on2   = !!offense.second;
    const on3   = !!offense.third;
    const dark  = isDark();

    // Occupied: red fill, bright red stroke
    // Empty: transparent fill, theme-aware outline so it reads on both backgrounds
    const fill   = (on) => on ? '#bf0d3d' : 'transparent';
    const stroke = (on) => on
      ? '#e63946'
      : dark ? 'rgba(226,232,240,0.35)' : 'rgba(4,30,66,0.35)';
    const sw  = 1.8;
    const bs  = 7;   // half-size of each base diamond (smaller = more space)

    // Each base is a square rotated 45° around its own center (cx,cy)
    const base = (cx, cy, active) =>
      `<rect x="${cx - bs}" y="${cy - bs}" width="${bs * 2}" height="${bs * 2}"
        transform="rotate(45 ${cx} ${cy})"
        fill="${fill(active)}" stroke="${stroke(active)}" stroke-width="${sw}" rx="1"/>`;

    // ViewBox: 64×58 — wider to give bases more breathing room
    // Centers: 2B(32,8) 3B(10,30) 1B(54,30)
    return `<svg class="lab-runners-svg" width="64" height="58"
      viewBox="0 0 64 58" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${base(32,  8, on2)}
      ${base(10, 30, on3)}
      ${base(54, 30, on1)}
    </svg>`;
  };

  // ─────────────────────────────────────────────────────────
  //  BATTER SVG SILHOUETTES  (restyled to navy/red palette)
  //  Paths from provided document; .f = bat/detail, .e = body
  // ─────────────────────────────────────────────────────────
  const BATTER_RIGHT_SVG = `<svg class="batter-svg" width="52" height="150" viewBox="0 4 170 486" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill="#bf0d3d" d="M146.94,96.6c23.31,13.83,19.38,9.82,19.38,9.82,0,0,2.54-.65,1.58,1.98-.99,2.7-1.91,4.41-3.22,5.85-.96,1.05-2.31-1.11-2.31-2.3s-17.4-10.71-17.4-10.71"/>
  <path fill="#041e42" stroke="#2d3f5e" stroke-width="1" d="M163.54,107.7c.79-3.56-5.93-7.9-11.85-11.46-1.97-1.18-3.8-1.23-5.38-.76l-9.64-5.56v-5.93c-.4-18.18-21.73-17.39-25.69-16.99-3.91,.39-28.75,8.15-20.4,28.64-11.95,2.93-27.14,10.42-34.13,14.83-7.51,4.74-9.09,30.43-9.88,52.16-.79,21.73-8.3,45.05-9.09,47.02-.79,1.98,.4,6.32,1.58,8.3s-1.19,3.56-1.19,3.56c0,0-7.9,1.98-13.44,18.57-5.53,16.6-.57,29.5,1.98,33.98,2.12,3.73,12.19,17.34,16.2,22.13,1.3,1.55,17.78,30.03,20.15,35.17s1.19,17.39,.79,17.78-3.52,3.97-6.33,8.52c-2.82,4.58-8.69,18.74-14.22,32.57s-15.02,51.77-15.02,51.77c0,0-6.72,23.31-3.56,28.85,3.16,5.53,23.71,3.16,31.61,2.37s20.15,4.35,29.24,3.56,16.2-2.77,17.78-9.09-18.33-8.4-28.85-16.11c-6.86-5.03-11.87-7.79-13.84-10.16-1.98-2.37,2.1-7.88,4.38-10.69,1.25-1.53,4.32-8.09,5.12-9.27,.79-1.19,18.97-45.05,19.76-46.63,.22-.43,1.43-2.47,3.14-5.41-3.56,21.65-9.46,32.68-9.46,32.68,0,0-6.72,13.83-2.37,19.36s15.41,2.77,24.5,2.77,16.99,3.16,23.31,1.98,15.02-6.72,15.81-9.88-8.96-5.24-13.44-6.32c-6.27-1.52-7.34,.87-16.43-10.98s-.18-38.72-.18-38.72c0,0,7.47-18.94,8.23-27.16,.68-7.25-4.27-23.12-10.6-46.82s-15.41-28.06-16.99-30.82-.79-10.67-.79-10.67c0,0,3.16,1.58,5.93,1.98s5.53-4.74,11.46-17.39c5.93-12.65,8.3-35.56,8.69-38.73,.4-3.16,4.35-13.04,4.35-13.04,0,0,17.78,4.74,21.73,5.14s11.85,1.98,14.23-1.98c2.37-3.95,2.37-16.2,2.37-24.1s-6.32-28.06-6.72-30.03,1.19-5.93,1.98-7.11c.79-1.19,4.35-8.3,5.14-11.85Z"/>
  <path fill="#bf0d3d" d="M144.1,101.73s-34.4-21.36-34.76-21.3c0,0-40.7-24.5-48.21-28.06C53.62,48.82,9.59,19.08,1.86,14.44c-3.95-2.37,1.98-9.88,1.98-9.88C8.37-.06,8.97-.57,12.92,2.19c2.07,1.45,42.68,26.48,59.67,39.52s41.72,35.8,63.49,48.72"/>
</svg>`;

  const BATTER_LEFT_SVG  = `<svg class="batter-svg" width="52" height="150" viewBox="0 4 170 486" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(170,0) scale(-1,1)">
  <path fill="#bf0d3d" d="M146.94,96.6c23.31,13.83,19.38,9.82,19.38,9.82,0,0,2.54-.65,1.58,1.98-.99,2.7-1.91,4.41-3.22,5.85-.96,1.05-2.31-1.11-2.31-2.3s-17.4-10.71-17.4-10.71"/>
  <path fill="#041e42" stroke="#2d3f5e" stroke-width="1" d="M163.54,107.7c.79-3.56-5.93-7.9-11.85-11.46-1.97-1.18-3.8-1.23-5.38-.76l-9.64-5.56v-5.93c-.4-18.18-21.73-17.39-25.69-16.99-3.91,.39-28.75,8.15-20.4,28.64-11.95,2.93-27.14,10.42-34.13,14.83-7.51,4.74-9.09,30.43-9.88,52.16-.79,21.73-8.3,45.05-9.09,47.02-.79,1.98,.4,6.32,1.58,8.3s-1.19,3.56-1.19,3.56c0,0-7.9,1.98-13.44,18.57-5.53,16.6-.57,29.5,1.98,33.98,2.12,3.73,12.19,17.34,16.2,22.13,1.3,1.55,17.78,30.03,20.15,35.17s1.19,17.39,.79,17.78-3.52,3.97-6.33,8.52c-2.82,4.58-8.69,18.74-14.22,32.57s-15.02,51.77-15.02,51.77c0,0-6.72,23.31-3.56,28.85,3.16,5.53,23.71,3.16,31.61,2.37s20.15,4.35,29.24,3.56,16.2-2.77,17.78-9.09-18.33-8.4-28.85-16.11c-6.86-5.03-11.87-7.79-13.84-10.16-1.98-2.37,2.1-7.88,4.38-10.69,1.25-1.53,4.32-8.09,5.12-9.27,.79-1.19,18.97-45.05,19.76-46.63,.22-.43,1.43-2.47,3.14-5.41-3.56,21.65-9.46,32.68-9.46,32.68,0,0-6.72,13.83-2.37,19.36s15.41,2.77,24.5,2.77,16.99,3.16,23.31,1.98,15.02-6.72,15.81-9.88-8.96-5.24-13.44-6.32c-6.27-1.52-7.34,.87-16.43-10.98s-.18-38.72-.18-38.72c0,0,7.47-18.94,8.23-27.16,.68-7.25-4.27-23.12-10.6-46.82s-15.41-28.06-16.99-30.82-.79-10.67-.79-10.67c0,0,3.16,1.58,5.93,1.98s5.53-4.74,11.46-17.39c5.93-12.65,8.3-35.56,8.69-38.73,.4-3.16,4.35-13.04,4.35-13.04,0,0,17.78,4.74,21.73,5.14s11.85,1.98,14.23-1.98c2.37-3.95,2.37-16.2,2.37-24.1s-6.32-28.06-6.72-30.03,1.19-5.93,1.98-7.11c.79-1.19,4.35-8.3,5.14-11.85Z"/>
  <path fill="#bf0d3d" d="M144.1,101.73s-34.4-21.36-34.76-21.3c0,0-40.7-24.5-48.21-28.06C53.62,48.82,9.59,19.08,1.86,14.44c-3.95-2.37,1.98-9.88,1.98-9.88C8.37-.06,8.97-.57,12.92,2.19c2.07,1.45,42.68,26.48,59.67,39.52s41.72,35.8,63.49,48.72"/>
  </g>
</svg>`;

  // ─────────────────────────────────────────────────────────
  //  STRIKE ZONE SVG builder
  //  pX: horizontal (-1.5 to +1.5 ft, 0 = plate center)
  //  pZ: vertical (roughly 1.5 to 4.5 ft from ground)
  //  Positive pX = catcher's right (away from RHB)
  // ─────────────────────────────────────────────────────────
  const ZONE_W=92,ZONE_H=122,SZ_LEFT=12,SZ_RIGHT=80,SZ_TOP=10,SZ_BOT=106,SZ_CX=46,PX_PER_FT=48,PZ_BOT_FT=1.5,PZ_TOP_FT=3.5;

  // Map real coordinates to SVG pixels
  mapPx = (pX) => SZ_CX + pX * PX_PER_FT;
  const mapPz = (pZ) => SZ_BOT - (pZ - PZ_BOT_FT) / (PZ_TOP_FT - PZ_BOT_FT) * (SZ_BOT - SZ_TOP);

  const buildStrikeZoneSVG = (pitches = [], currentCount = {}) => {
    const zW = SZ_RIGHT - SZ_LEFT;
    const zH = SZ_BOT   - SZ_TOP;
    const z3 = zW / 3, z3h = zH / 3;

    // Build pitch dots
    const dots = pitches.map((p, i) => {
      const px = p.pitchData?.coordinates?.pX;
      const pz = p.pitchData?.coordinates?.pZ;
      if (px == null || pz == null) return '';
      const cx = mapPx(px);
      const cy = mapPz(pz);
      const info = pitchInfo(p.details?.type?.code);
      const isLast = i === pitches.length - 1;
      const num = i + 1;
      return `
        <circle cx="${cx}" cy="${cy}" r="${isLast ? 8 : 6}"
          fill="${info.color}"
          stroke="${isLast ? '#fff' : 'rgba(255,255,255,0.4)'}"
          stroke-width="${isLast ? 2 : 1}"
          opacity="${isLast ? 1 : 0.72}"
          class="pitch-dot${isLast ? ' pitch-dot-latest' : ''}"
          data-num="${num}" data-type="${info.label}" data-velo="${p.pitchData?.startSpeed?.toFixed(1) ?? '?'}"/>
        <text x="${cx}" y="${cy + 0.5}" text-anchor="middle" dominant-baseline="middle"
          font-size="${isLast ? 8 : 7}" font-weight="700" fill="white"
          font-family="DM Mono, monospace" pointer-events="none">${num}</text>`;
    }).join('');

    return `<svg class="sz-svg" width="113" height="150" viewBox="0 0 ${ZONE_W} ${ZONE_H}"
      xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible;">

      <rect x="${SZ_LEFT}" y="${SZ_TOP}" width="${zW}" height="${zH}"
        fill="rgba(191,13,61,0.05)" stroke="#bf0d3d" stroke-width="1.5"/>
      <line x1="${SZ_LEFT+z3}"   y1="${SZ_TOP}" x2="${SZ_LEFT+z3}"   y2="${SZ_BOT}" stroke="rgba(191,13,61,0.28)" stroke-width="0.8" stroke-dasharray="3,2"/>
      <line x1="${SZ_LEFT+z3*2}" y1="${SZ_TOP}" x2="${SZ_LEFT+z3*2}" y2="${SZ_BOT}" stroke="rgba(191,13,61,0.28)" stroke-width="0.8" stroke-dasharray="3,2"/>
      <line x1="${SZ_LEFT}" y1="${SZ_TOP+z3h}"   x2="${SZ_RIGHT}" y2="${SZ_TOP+z3h}"   stroke="rgba(191,13,61,0.28)" stroke-width="0.8" stroke-dasharray="3,2"/>
      <line x1="${SZ_LEFT}" y1="${SZ_TOP+z3h*2}" x2="${SZ_RIGHT}" y2="${SZ_TOP+z3h*2}" stroke="rgba(191,13,61,0.28)" stroke-width="0.8" stroke-dasharray="3,2"/>
      <polygon points="${SZ_LEFT},${SZ_BOT+8} ${SZ_RIGHT},${SZ_BOT+8} ${SZ_RIGHT},${SZ_BOT+16} ${SZ_CX},${SZ_BOT+26} ${SZ_LEFT},${SZ_BOT+16}"
        fill="white" stroke="rgba(148,163,184,0.55)" stroke-width="1.4"/>
      ${dots}
    </svg>`;
  };

  // ─────────────────────────────────────────────────────────
  //  COUNT-BASED AVG — fetch batter's split by count
  // ─────────────────────────────────────────────────────────
  const fetchBatterCountStats = async (batterId) => {
    if (batterCountCache[batterId]) return batterCountCache[batterId];
    try {
      const url = `${API_V1}/people/${batterId}/stats?stats=byCount&group=hitting&season=2025&gameType=R`;
      const res = await fetch(url);
      const d   = await res.json();
      const splits = d.stats?.[0]?.splits || [];
      const map = {};
      splits.forEach(s => {
        const count = s.split?.description; // e.g. "0-0 count"
        const key   = count?.replace(' count','').replace(' Count','').trim();
        if (key && s.stat?.avg) map[key] = parseFloat(s.stat.avg);
      });
      // If count stats not available, use season avg as 0-0
      if (!Object.keys(map).length) {
        const seasonUrl = `${API_V1}/people/${batterId}/stats?stats=season&group=hitting&season=2025&gameType=R`;
        const sr = await fetch(seasonUrl);
        const sd = await sr.json();
        const avg = parseFloat(sd.stats?.[0]?.splits?.[0]?.stat?.avg || 0);
        map['0-0'] = avg || null;
        batterCountCache[batterId] = map;
        return map;
      }
      batterCountCache[batterId] = map;
      return map;
    } catch (e) {
      console.warn('[CountAvg] Failed for', batterId, e.message);
      return {};
    }
  };

  const getCountAvg = async (batterId, balls, strikes) => {
    const key = `${balls}-${strikes}`;
    try {
      const stats = await fetchBatterCountStats(batterId);
      if (stats[key] != null) return { avg: stats[key], source: 'batter' };
    } catch(e) {}
    // Fall back to league average
    const lgAvg = LEAGUE_AVG_BY_COUNT[key];
    return lgAvg ? { avg: lgAvg, source: 'league' } : null;
  };

  // ─────────────────────────────────────────────────────────
  //  LIVE AT-BAT MODULE
  // ─────────────────────────────────────────────────────────
  const renderLiveAtBat = async (data) => {
    const container = document.getElementById('live-at-bat');
    if (!container) return;

    const status = data.gameData?.status?.detailedState;
    if (getPhase(status) !== 'LIVE') {
      container.style.display = 'none';
      return;
    }
    container.style.display = '';

    const cp      = data.liveData?.plays?.currentPlay;
    const ls      = data.liveData?.linescore;
    const offense = ls?.offense || {};
    if (!cp) return;

    const batter   = cp.matchup?.batter;
    const pitcher  = cp.matchup?.pitcher;
    const batSide  = cp.matchup?.batSide?.code; // 'R' or 'L'
    const count    = cp.count || { balls:0, strikes:0, outs:0 };
    const pitches  = cp.playEvents?.filter(e => e.isPitch) || [];
    const batterId = batter?.id;
    const pitcherId = pitcher?.id;

    // ── Count-based batting avg ──────────────────────────
    let countAvgHtml = '';
    if (batterId) {
      const ca = await getCountAvg(batterId, count.balls, count.strikes);
      if (ca) {
        const src   = ca.source === 'batter' ? 'Batter' : 'Lg Avg';
        const color = ca.avg >= .280 ? '#10b981' : ca.avg >= .220 ? '#eab308' : '#ef4444';
        countAvgHtml = `<div class="cab-stat">
          <span class="cab-lbl">${src} ${count.balls}-${count.strikes} AVG</span>
          <span class="cab-val" style="color:${color}">${fmtAvg(ca.avg)}</span>
        </div>`;
      }
    }

    // ── Current pitcher game stats ───────────────────────
    let pitcherStatHtml = '';
    if (pitcherId) {
      const pbp  = data.liveData?.boxscore?.teams;
      const allP = { ...pbp?.away?.players, ...pbp?.home?.players };
      const pd   = allP?.[`ID${pitcherId}`];
      if (pd) {
        const ps = pd.stats?.pitching || {};
        const ip = ps.inningsPitched ?? '0.0';
        const k  = ps.strikeOuts ?? 0;
        const bb = ps.baseOnBalls ?? 0;
        const pc = ps.numberOfPitches ?? pitches.length;
        pitcherStatHtml = `
          <div class="pitcher-mini">
            <img src="${IMG_BASE}/${pitcherId}/spots/60" class="pitcher-mini-photo"
              onerror="this.style.display='none'" alt="${pitcher?.fullName}">
            <div class="pitcher-mini-info">
              <div class="pitcher-mini-name">${pitcher?.fullName ?? 'Pitcher'}</div>
              <div class="pitcher-mini-stats">
                <span class="pms-item"><span class="pms-lbl">IP</span>${ip}</span>
                <span class="pms-item"><span class="pms-lbl">K</span>${k}</span>
                <span class="pms-item"><span class="pms-lbl">BB</span>${bb}</span>
                <span class="pms-item"><span class="pms-lbl">PC</span>${pc}</span>
              </div>
            </div>
          </div>`;
      }
    }

    // ── Pitch log ────────────────────────────────────────
    const pitchRows = pitches.map((p, i) => {
      const info   = pitchInfo(p.details?.type?.code);
      const velo   = p.pitchData?.startSpeed?.toFixed(1) ?? '--';
      const spin   = p.pitchData?.breaks?.spinRate ? Math.round(p.pitchData.breaks.spinRate) : '--';
      const desc   = p.details?.description ?? '';
      const isStr  = p.details?.isStrike;
      const isBall = p.details?.isInPlay ? false : !isStr;
      const resultCls = p.details?.isInPlay ? 'pr-contact' : isStr ? 'pr-strike' : 'pr-ball';
      const resultLbl = p.details?.isInPlay ? 'IN PLAY' : isStr ? 'STRIKE' : 'BALL';
      const px = p.pitchData?.coordinates?.pX;
      const pz = p.pitchData?.coordinates?.pZ;
      const inZone = px != null && pz != null &&
        Math.abs(px) < 0.85 && pz > 1.6 && pz < 3.5;
      return `<div class="pitch-row" data-idx="${i}">
        <div class="pr-num">${i+1}</div>
        <div class="pr-badge" style="background:${info.color}">${info.abbr}</div>
        <div class="pr-meta">
          <div class="pr-type">${info.label}</div>
          <div class="pr-velo">${velo} mph · ${spin} rpm</div>
        </div>
        <div class="pr-result ${resultCls}">${resultLbl}</div>
      </div>`;
    }).reverse().join(''); // newest pitch first

    // ── Last pitch description ───────────────────────────
    const lastPitch = pitches[pitches.length - 1];
    const lastDesc  = lastPitch?.details?.description || cp.result?.description || '';
    const resultEvt = cp.result?.event || '';

    // ── Half-inning / outs display ───────────────────────
    const half    = ls?.inningHalf === 'Top' ? '▲' : '▼';
    const inning  = ls?.currentInningOrdinal || '';
    const outs    = count.outs ?? 0;

    // ── Render ───────────────────────────────────────────
    container.innerHTML = `
    <div class="lab-header">
      <div class="lab-context">
        <span class="lab-inning">${half} ${inning}</span>
        <div class="lab-outs">
          ${[0,1,2].map(i => `<div class="lab-out-dot ${i < outs ? 'on' : ''}"></div>`).join('')}
          <span class="lab-outs-lbl">${outs} out${outs !== 1 ? 's' : ''}</span>
        </div>
      </div>
      <div class="lab-players">
        <div class="lab-batter-info">
          <img src="${IMG_BASE}/${batterId}/spots/60" class="lab-headshot"
            onerror="this.src='https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_60,q_auto:best/v1/people/generic/headshot/67/current.png'"
            alt="${batter?.fullName}">
          <div>
            <div class="lab-batter-name">${batter?.fullName ?? 'Batter'}</div>
            <div class="lab-batter-meta">
              <span class="lab-hand-badge">${batSide === 'L' ? 'LHB' : 'RHB'}</span>
              ${countAvgHtml}
            </div>
          </div>
        </div>
        <div class="lab-vs">vs</div>
        <div class="lab-pitcher-mini">${pitcher?.fullName ?? ''}</div>
      </div>
      <!-- Base runners — right side of header -->
      <div class="lab-runners">
        ${buildRunnerSVG(offense)}
      </div>
    </div>

    <div class="lab-body">

      <!-- LEFT: strike zone + batter silhouette -->
      <div class="lab-zone-col">
        <div class="lab-zone-wrap">
          <!-- Batter silhouettes — show only the correct side -->
          <div class="lab-batter-silhouette ${batSide === 'L' ? 'lhb' : 'rhb'}">
            ${batSide === 'L' ? BATTER_LEFT_SVG : BATTER_RIGHT_SVG}
          </div>
          <div class="lab-zone-svg">
            ${buildStrikeZoneSVG(pitches, count)}
          </div>
        </div>

        <!-- Count pills -->
        <div class="lab-count">
          <div class="count-group">
            ${[0,1,2,3].map(i => `<div class="count-dot ball-dot ${i < count.balls ? 'on' : ''}"></div>`).join('')}
            <span class="count-lbl">B</span>
          </div>
          <div class="count-divider"></div>
          <div class="count-group">
            ${[0,1,2].map(i => `<div class="count-dot strike-dot ${i < count.strikes ? 'on' : ''}"></div>`).join('')}
            <span class="count-lbl">S</span>
          </div>
        </div>

        <!-- Last pitch description -->
        ${lastDesc ? `<div class="lab-last-desc">${lastDesc}</div>` : ''}
        ${resultEvt ? `<div class="lab-result-event">${resultEvt}</div>` : ''}
      </div>

      <!-- RIGHT: pitch log + pitcher stats -->
      <div class="lab-right-col">

        <!-- Pitcher stats -->
        ${pitcherStatHtml}

        <!-- Pitch log header with mobile tab toggle -->
        <div class="lab-pitchlog-header">
          <span class="lab-pitchlog-title">THIS AT-BAT</span>
          <span class="lab-pitch-count">${pitches.length} pitch${pitches.length !== 1 ? 'es' : ''}</span>
        </div>

        <div class="lab-pitchlog" id="lab-pitchlog">
          ${pitchRows || '<div class="lab-no-pitches">Waiting for first pitch…</div>'}
        </div>

      </div>

    </div>`;
  };

  // ─────────────────────────────────────────────────────────
  //  BASE RUNNERS
  // ─────────────────────────────────────────────────────────
  const getBaseRunners = (runners = []) => ({
    first:  runners.some(r => r.movement?.end === '1B' || r.movement?.start === '1B'),
    second: runners.some(r => r.movement?.end === '2B' || r.movement?.start === '2B'),
    third:  runners.some(r => r.movement?.end === '3B' || r.movement?.start === '3B'),
  });

  const generateSVGField = (count, onBase) => {
    const o   = count?.outs ?? 0;
    const on  = (active) => active ? '#bf0d3d' : 'transparent';
    const str = (active) => active ? '#e63946' : 'rgba(148,163,184,0.4)';
    const sw  = 1.5;
    const bs  = 6; // base half-size (smaller diamonds)

    const base = (cx, cy, active) =>
      `<rect x="${cx-bs}" y="${cy-bs}" width="${bs*2}" height="${bs*2}"
        transform="rotate(45 ${cx} ${cy})"
        fill="${on(active)}" stroke="${str(active)}" stroke-width="${sw}"/>`;

    return `<svg width="58" height="52" viewBox="0 0 58 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 2B top -->
      ${base(29, 9,  onBase?.second)}
      <!-- 3B left -->
      ${base(12, 24, onBase?.third)}
      <!-- 1B right -->
      ${base(46, 24, onBase?.first)}
      <!-- Outs — 3 dots centered below bases -->
      <circle cx="17" cy="44" r="4.5" fill="${on(o>=1)}" stroke="${str(o>=1)}" stroke-width="1.3"/>
      <circle cx="29" cy="44" r="4.5" fill="${on(o>=2)}" stroke="${str(o>=2)}" stroke-width="1.3"/>
      <circle cx="41" cy="44" r="4.5" fill="${on(o>=3)}" stroke="${str(o>=3)}" stroke-width="1.3"/>
    </svg>`;
  };

  // ─────────────────────────────────────────────────────────
  //  HIT DATA
  // ─────────────────────────────────────────────────────────
  const getHitData = (play) => {
    if (!play) return null;
    const e = play.playEvents?.find(e => e.hitData);
    return e?.hitData || play.hitData || null;
  };
  const formatHitData = (hd) => !hd
    ? { launchSpeed:'--', launchAngle:'--', totalDistance:'--' }
    : {
        launchSpeed:   hd.launchSpeed   ? `${hd.launchSpeed.toFixed(1)} mph` : '--',
        launchAngle:   hd.launchAngle   ? `${Math.round(hd.launchAngle)}°`   : '--',
        totalDistance: hd.totalDistance ? `${hd.totalDistance} ft`           : '--',
      };

  // ─────────────────────────────────────────────────────────
  //  LOGO HELPERS
  // ─────────────────────────────────────────────────────────
  const updateTeamLogos = (dark) => {
    if (!awayTeamId || !homeTeamId) return;
    document.querySelectorAll('.away-logo').forEach(el => el.src = logoUrl(awayTeamId, dark));
    document.querySelectorAll('.home-logo').forEach(el => el.src = logoUrl(homeTeamId, dark));
  };

  // ─────────────────────────────────────────────────────────
  //  WIN PROB THEME UPDATE
  // ─────────────────────────────────────────────────────────
  const updateWinProbTheme = (dark) => {
    const ic = dark ? '#e2e8f0' : '#041e42';
    const gc = dark ? 'rgba(226,232,240,0.1)' : 'rgba(4,30,66,0.12)';
    const lc = dark ? 'rgba(226,232,240,1)' : 'rgba(4,30,66,1)';

    document.querySelectorAll('#win-prob-container text').forEach(el => {
      if (el.getAttribute('font-family') === 'DM Mono' && !isNaN(el.textContent.trim()))
        el.setAttribute('fill', ic);
    });
    document.querySelectorAll('#win-prob-container line').forEach(el => {
      const dash = el.getAttribute('stroke-dasharray');
      if (dash?.includes('3,3')) el.setAttribute('stroke', gc);
      else if (!dash && el.getAttribute('stroke') !== '#bbb') el.setAttribute('stroke', ic);
    });
    // Update the probability line and hover dot dynamically
    document.querySelectorAll('#win-prob-container polyline').forEach(el => {
      el.setAttribute('stroke', lc);
    });
    document.querySelectorAll('#win-prob-container circle[id^="wp-dot-"]').forEach(el => {
      el.setAttribute('stroke', lc);
    });
  };

  // ─────────────────────────────────────────────────────────
  //  THEME TOGGLE
  // ─────────────────────────────────────────────────────────
  const initThemeToggle = () => {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const saved = localStorage.getItem('xlabs-theme') || 'dark';
    const dark  = saved === 'dark';
    document.body.classList.toggle('dark',  dark);
    document.body.classList.toggle('light', !dark);
    const icD = document.getElementById('ic-d');
    const icL = document.getElementById('ic-l');
    const tl  = document.getElementById('tl');
    if (icD) icD.style.display = dark ? ''     : 'none';
    if (icL) icL.style.display = dark ? 'none' : '';
    if (tl)  tl.textContent    = dark ? 'Light' : 'Dark';
    btn.addEventListener('click', () => {
      const nowDark = document.body.classList.toggle('dark');
      document.body.classList.toggle('light', !nowDark);
      if (icD) icD.style.display = nowDark ? ''     : 'none';
      if (icL) icL.style.display = nowDark ? 'none' : '';
      if (tl)  tl.textContent    = nowDark ? 'Light' : 'Dark';
      localStorage.setItem('xlabs-theme', nowDark ? 'dark' : 'light');
      updateTeamLogos(nowDark);
      updateWinProbTheme(nowDark);
    });
  };

  // ─────────────────────────────────────────────────────────
  //  GAME HEADER
  // ─────────────────────────────────────────────────────────
  const renderHeader = (gameData, liveData) => {
    const { away, home } = gameData.teams;
    awayTeamId = away.id; homeTeamId = home.id;
    updateTeamLogos(isDark());
    document.querySelector('.away-record').textContent = away?.record ? `${away.record.wins}-${away.record.losses}` : '';
    document.querySelector('.home-record').textContent = home?.record ? `${home.record.wins}-${home.record.losses}` : '';
    document.querySelector('.away-score').textContent  = liveData.linescore?.teams?.away?.runs ?? '0';
    document.querySelector('.home-score').textContent  = liveData.linescore?.teams?.home?.runs ?? '0';
    const status = gameData.status.detailedState;
    const ls     = liveData.linescore;
    let txt;
    if      (PREGAME_STATUSES.includes(status)) txt = `${gameData.datetime.time} ${gameData.datetime.ampm}`;
    else if (status === 'In Progress') {
      const half    = ls?.inningHalf === 'Top' ? '▲' : ls?.inningHalf === 'Bottom' ? '▼' : '';
      const ordinal = ls?.currentInningOrdinal || '';
      txt = `${half} ${ordinal}`.trim() || 'Live';
    }
    else if (FINAL_STATUSES.includes(status)) {
      const innings = ls?.currentInning ?? ls?.innings?.length ?? 9;
      txt = innings === 9 ? 'Final' : `Final/${innings}`;
    }
    else txt = status;
    document.querySelector('.game-status').textContent = txt;
  };

  // ─────────────────────────────────────────────────────────
  //  LINESCORE TABLE
  // ─────────────────────────────────────────────────────────
  const renderBoxscore = (gameData, liveData) => {
    const ls    = liveData.linescore;
    const tbody = document.querySelector('.boxscore-table tbody');
    if (!tbody) return;
    const dark  = isDark();
    const aLogo = logoUrl(awayTeamId, dark);
    const hLogo = logoUrl(homeTeamId, dark);
    const { away, home } = gameData.teams;
    if (!ls?.innings?.length) {
      const blanks = Array(9).fill('<td class="inning-score">-</td>').join('');
      tbody.innerHTML = `
        <tr><td class="team-name"><img src="${aLogo}" alt="${away.abbreviation}" class="box-team-logo away-logo"></td>${blanks}<td>-</td><td>-</td><td>-</td></tr>
        <tr><td class="team-name"><img src="${hLogo}" alt="${home.abbreviation}" class="box-team-logo home-logo"></td>${blanks}<td>-</td><td>-</td><td>-</td></tr>`;
      return;
    }
    const max = Math.max(9, ls.innings.length);
    let ai = '', hi = '';
    for (let i = 0; i < max; i++) {
      const inn = ls.innings[i];
      ai += inn ? `<td class="inning-score">${inn.away?.runs ?? '-'}</td>` : '<td class="inning-score">-</td>';
      hi += inn ? `<td class="inning-score">${inn.home?.runs ?? '-'}</td>` : '<td class="inning-score">-</td>';
    }
    tbody.innerHTML = `
      <tr><td class="team-name"><img src="${aLogo}" alt="${away.abbreviation}" class="box-team-logo away-logo"></td>${ai}
        <td>${ls.teams.away.runs??0}</td><td>${ls.teams.away.hits??0}</td><td>${ls.teams.away.errors??0}</td></tr>
      <tr><td class="team-name"><img src="${hLogo}" alt="${home.abbreviation}" class="box-team-logo home-logo"></td>${hi}
        <td>${ls.teams.home.runs??0}</td><td>${ls.teams.home.hits??0}</td><td>${ls.teams.home.errors??0}</td></tr>`;
  };

  // ─────────────────────────────────────────────────────────
  //  PITCHING DECISIONS
  // ─────────────────────────────────────────────────────────
  const renderPitchingDecisions = (data) => {
    const wrapper = document.querySelector('.linescore-wrapper');
    if (!wrapper) return;
    wrapper.querySelector('.pitching-decisions')?.remove();
    const d = data.liveData?.decisions;
    if (!d?.winner && !d?.loser) return;
    const row = (label, person) => person
      ? `<div class="decision-item"><span class="decision-label">${label}</span><span class="decision-name">${person.fullName}</span></div>` : '';
    const div = document.createElement('div');
    div.className = 'pitching-decisions';
    div.innerHTML = row('W', d.winner) + row('L', d.loser) + row('SV', d.save);
    wrapper.appendChild(div);
  };

  // ─────────────────────────────────────────────────────────
  //  TOP PERFORMERS
  // ─────────────────────────────────────────────────────────
  const renderTopPerformers = (data) => {
    const c = document.querySelector('.top-performers-case');
    if (!c) return;
    const s = data.gameData?.status?.detailedState;
    if (s !== 'Game Over' && s !== 'Final') { c.style.display = 'none'; return; }
    c.style.display = 'flex';
    c.innerHTML = '';
    const performers = data.liveData?.boxscore?.topPerformers;
    if (!performers?.length) { c.innerHTML = '<div class="no-data">No top performers available.</div>'; return; }
    performers.forEach(({ player: p }) => {
      const div = document.createElement('div');
      div.className = 'top-performer-player';
      div.innerHTML = `
        <div class="performer-image">
          <img src="https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${p.person.id}/headshot/67/current"
               alt="${p.person.fullName}">
        </div>
        <div class="performer-name">${p.person.fullName}</div>
        <div class="performer-stats">${p.stats?.batting?.summary || p.stats?.pitching?.summary || 'N/A'}</div>`;
      c.appendChild(div);
    });
  };

  // ─────────────────────────────────────────────────────────
  //  PLAYS
  // ─────────────────────────────────────────────────────────
  const createPlayItem = (play, showStatcast = false, showScoringInfo = false) => {
    const batter = play.matchup?.batter;
    const pid    = batter?.id ?? 'default';
    const hd     = formatHitData(getHitData(play));
    const el     = document.createElement('div');
    el.className = 'play-item';
    el.style.position = 'relative';
    el.innerHTML = `
      <div class="inning-indicator">${play.about.halfInning} ${play.about.inning}</div>
      <div class="player-image-container">
        <img class="player-image" src="${IMG_BASE}/${pid}/spots/60" alt="${batter?.fullName ?? ''}">
        <div class="event-icon">${getEventIcon(play.result.eventType)}</div>
      </div>
      <div class="content-wrapper">
        <div class="play-details">
          <div class="event-name">${play.result.event}</div>
          <p class="play-description">${play.result.description}</p>
          ${showScoringInfo ? `
            <div class="score-update">Score: ${play.result.homeScore} - ${play.result.awayScore}</div>
            <div class="rbi-info">RBI: ${play.result.rbi ?? 0}</div>` : ''}
          ${showStatcast ? `
            <div class="statcast-stats">
              <div class="stat-item"><div>Exit Velo</div><div>${hd.launchSpeed}</div></div>
              <div class="stat-item"><div>Angle</div><div>${hd.launchAngle}</div></div>
              <div class="stat-item"><div>Distance</div><div>${hd.totalDistance}</div></div>
            </div>` : ''}
        </div>
        <div class="game-situation">
          <div class="count-info">${play.count.balls}-${play.count.strikes}</div>
          <div class="field-display">${generateSVGField(play.count, getBaseRunners(play.runners))}</div>
        </div>
      </div>`;
    return el;
  };

  const renderScoringPlays = (plays, gamePkId, vm) => {
    const c = document.getElementById('scoring-plays-container');
    if (!c) return;
    c.querySelectorAll('.play-item, .no-scoring-msg').forEach(p => p.remove());
    c.style.display = '';
    if (!plays?.scoringPlays?.length) {
      const msg = document.createElement('div');
      msg.className = 'no-scoring-msg';
      msg.style.cssText = 'text-align:center;padding:28px 12px;font-family:var(--font-mono);font-size:11px;color:var(--text-muted);opacity:.7;';
      msg.textContent = 'No runs scored yet';
      c.appendChild(msg);
      return;
    }
    plays.scoringPlays.forEach(idx => {
      const el = createPlayItem(plays.allPlays[idx], true, true);
      c.appendChild(el);
      vm?.addVideoButtonToPlay(el, gamePkId, plays.allPlays[idx]);
    });
  };

  const renderAllPlays = (plays) => {
    const c = document.getElementById('all-plays-container');
    if (!c) return;
    c.querySelectorAll('.play-item, .no-plays-msg').forEach(p => p.remove());
    c.style.display = '';
    if (!plays?.allPlays?.length) {
      const msg = document.createElement('div');
      msg.className = 'no-plays-msg';
      msg.style.cssText = 'text-align:center;padding:28px 12px;font-family:var(--font-mono);font-size:11px;color:var(--text-muted);opacity:.7;';
      msg.textContent = 'No plays yet';
      c.appendChild(msg);
      return;
    }
    [...plays.allPlays].reverse().forEach(play => c.appendChild(createPlayItem(play, true, false)));
  };

  // ─────────────────────────────────────────────────────────
  //  VIDEO BUTTONS
  // ─────────────────────────────────────────────────────────
  const initVideoButtons = async (gamePkId) => {
    if (!videoMatcher) return;
    const cBtn = document.querySelector('[data-video-type="condensed"]');
    const rBtn = document.querySelector('[data-video-type="recap"]');
    if (!cBtn && !rBtn) return;
    try {
      const content    = await videoMatcher.fetchGameContent(gamePkId);
      const highlights = content?.highlights?.highlights?.items || [];
      if (!highlights.length) { cBtn && (cBtn.style.display='none'); rBtn && (rBtn.style.display='none'); return; }
      const bestUrl = (pbs) => {
        if (!pbs?.length) return null;
        const mp4 = pbs.filter(p => {
          const n = (p.name||'').toLowerCase(), u = (p.url||'').toLowerCase();
          return (n.includes('mp4avc') || u.includes('.mp4')) && !n.includes('m3u8') && !u.includes('.m3u8');
        });
        if (!mp4.length) return null;
        for (const q of ['2500K','1800K','1200K','800K']) { const m = mp4.find(p => p.name?.includes(q)); if (m) return m.url; }
        return mp4[0].url;
      };
      const attach = (btn, hl, label) => {
        if (!btn || !hl) return;
        const url = bestUrl(hl.playbacks);
        if (!url) return;
        btn.addEventListener('click', async () => {
          const orig = btn.innerHTML; btn.disabled = true; btn.textContent = 'Loading…';
          try {
            videoMatcher.createVideoPlayer({ id: hl.guid||label, guid: hl.guid, title: hl.title||label, description: hl.description||'', url, duration: hl.duration||0 }, document.body, btn);
            setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 500);
          } catch { btn.innerHTML = orig; btn.disabled = false; }
        });
      };
      attach(cBtn, highlights[1], 'condensed');
      attach(rBtn, highlights[0], 'recap');
    } catch (e) { console.error('Video buttons:', e); }
  };

  // ─────────────────────────────────────────────────────────
  //  LIVE POLL — smart diff, only re-renders changed parts
  // ─────────────────────────────────────────────────────────
  const startPolling = (gamePk) => {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(async () => {
      try {
        const data   = await fetch(`${API_BASE}/game/${gamePk}/feed/live`).then(r => r.json());
        const { gameData, liveData } = data;
        const status = gameData.status.detailedState;
        const phase  = getPhase(status);

        // Always update header (score/inning changes frequently)
        renderHeader(gameData, liveData);
        renderBoxscore(gameData, liveData);

        if (phase === 'LIVE') {
          // Check if current play index changed (new pitch or new AB)
          const cp       = liveData.plays?.currentPlay;
          const pitches  = cp?.playEvents?.filter(e => e.isPitch) || [];
          const newState = `${cp?.about?.atBatIndex}-${pitches.length}-${cp?.count?.balls}-${cp?.count?.strikes}`;
          if (newState !== lastGameState) {
            lastGameState = newState;
            window._gameDataCache = data;
            renderLiveAtBat(data);
          }

          // Update plays only when there's a new completed play
          const allPlays = liveData.plays?.allPlays || [];
          if (allPlays.length !== lastPlayIndex) {
            lastPlayIndex = allPlays.length;
            renderScoringPlays(liveData.plays, gamePk, videoMatcher);
            renderAllPlays(liveData.plays);
          }
        } else if (phase === 'FINAL') {
          // Game ended — stop polling, show final state
          clearInterval(pollTimer);
          const lab = document.getElementById('live-at-bat');
          if (lab) lab.style.display = 'none';
          renderPitchingDecisions(data);
          renderTopPerformers(data);
          const vb = document.querySelector('.video-buttons');
          if (vb) vb.style.display = 'flex';
          if (videoMatcher) await initVideoButtons(gamePk);
          renderScoringPlays(liveData.plays, gamePk, videoMatcher);
          renderAllPlays(liveData.plays);
          window.renderGameTabs?.('FINAL');
        }
      } catch(e) {
        console.warn('[Poll] Error:', e.message);
      }
    }, POLL_INTERVAL_MS);
  };

  // ─────────────────────────────────────────────────────────
  //  INIT
  // ─────────────────────────────────────────────────────────
  const init = async () => {
    const gamePk = getUrlParam('gamePk');
    if (!gamePk) { console.error('No gamePk'); return; }

    window._gamePkCache = gamePk;
    if (window.MLBVideoMatcher) videoMatcher = new window.MLBVideoMatcher();
    initThemeToggle();

    try {
      const data = await fetch(`${API_BASE}/game/${gamePk}/feed/live`).then(r => r.json());
      const { gameData, liveData } = data;
      const phase  = getPhase(gameData.status.detailedState);
      window._gameDataCache = data;

      renderHeader(gameData, liveData);
      renderBoxscore(gameData, liveData);
      renderPitchingDecisions(data);
      renderTopPerformers(data);

      window.renderGameTabs?.(phase);

      if (phase === 'LIVE') {
        await renderLiveAtBat(data);
        lastPlayIndex = liveData.plays?.allPlays?.length ?? 0;
        const cp = liveData.plays?.currentPlay;
        const pitches = cp?.playEvents?.filter(e => e.isPitch) || [];
        lastGameState = `${cp?.about?.atBatIndex}-${pitches.length}-${cp?.count?.balls}-${cp?.count?.strikes}`;
        startPolling(gamePk);
      } else {
        const lab = document.getElementById('live-at-bat');
        if (lab) lab.style.display = 'none';
      }

      if (phase !== 'PREGAME') {
        renderScoringPlays(liveData.plays, gamePk, videoMatcher);
        renderAllPlays(liveData.plays);
      }

      if (typeof loadBoxScore === 'function') await loadBoxScore(data);
      if (phase === 'FINAL' && videoMatcher) await initVideoButtons(gamePk);

    } catch(err) {
      console.error('Init error:', err);
    }
  };

  init();
  window.addEventListener('beforeunload', () => { if (pollTimer) clearInterval(pollTimer); });
})();