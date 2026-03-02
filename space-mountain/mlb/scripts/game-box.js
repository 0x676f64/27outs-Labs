(() => {
  // ===========================
  // CONSTANTS & CONFIG
  // ===========================
  const API_BASE = 'https://statsapi.mlb.com/api/v1.1';
  const API_BASE_V1 = 'https://statsapi.mlb.com/api/v1';
  const LOGO_BASE = 'https://www.mlbstatic.com/team-logos';
  const PLAYER_IMAGE_BASE = 'https://midfield.mlbstatic.com/v1/people';

  const FINAL_STATUSES = ['Final', 'Game Over', 'Final: Tied', 'Completed Early', 'Suspended: Rain'];
  const PREGAME_STATUSES = ['Pre-Game', 'Scheduled', 'Warmup', 'Delayed', 'Postponed'];

  // ===========================
  // MLB TEAM COLORS
  // ===========================
  const MLB_TEAM_COLORS = {
    108: { primary: '#BA0021', secondary: '#003263' },
    109: { primary: '#A71930', secondary: '#000000' },
    110: { primary: '#DF4601', secondary: '#000000' },
    111: { primary: '#BD3039', secondary: '#0C2340' },
    112: { primary: '#0E3386', secondary: '#CC3433' },
    113: { primary: '#C6011F', secondary: '#000000' },
    114: { primary: '#00385D', secondary: '#E50022' },
    115: { primary: '#333366', secondary: '#C4CED4' },
    116: { primary: '#0C2340', secondary: '#FA4616' },
    117: { primary: '#EB6E1F', secondary: '#002D62' },
    118: { primary: '#004687', secondary: '#C09A5B' },
    119: { primary: '#005A9C', secondary: '#EF3E42' },
    120: { primary: '#AB0003', secondary: '#14225A' },
    121: { primary: '#002D72', secondary: '#FF5910' },
    133: { primary: '#003831', secondary: '#EFB21E' },
    134: { primary: '#FDB827', secondary: '#FDB827' },
    135: { primary: '#2F241D', secondary: '#FFC425' },
    136: { primary: '#005C5C', secondary: '#005C5C' },
    137: { primary: '#FD5A1E', secondary: '#27251F' },
    138: { primary: '#C41E3A', secondary: '#0C2340' },
    139: { primary: '#092C5C', secondary: '#8FBCE6' },
    140: { primary: '#003278', secondary: '#C0111F' },
    141: { primary: '#134A8E', secondary: '#1D2D5C' },
    142: { primary: '#002B5C', secondary: '#D31145' },
    143: { primary: '#E81828', secondary: '#002D72' },
    144: { primary: '#CE1141', secondary: '#13274F' },
    145: { primary: '#27251F', secondary: '#C4CED4' },
    146: { primary: '#00A3E0', secondary: '#FF6600' },
    147: { primary: '#0C2340', secondary: '#0C2340' },
    158: { primary: '#12284B', secondary: '#FFC52F' },
  };

  const getTeamColor = (teamId) => {
    const colors = MLB_TEAM_COLORS[teamId];
    return colors ? colors.primary : '#041e42';
  };

  // ===========================
  // STATE
  // ===========================
  let awayTeamId, homeTeamId;
  let videoMatcher = null;
  let currentGameData = null;
  let gamePk = null;

  // ===========================
  // UTILITY FUNCTIONS
  // ===========================
  const getUrlParam = (name) => new URLSearchParams(window.location.search).get(name);
  const isDarkMode = () => document.body.classList.contains('dark');
  const getGamePhase = (status) => {
    if (FINAL_STATUSES.includes(status)) return 'FINAL';
    if (PREGAME_STATUSES.includes(status)) return 'PREGAME';
    return 'LIVE';
  };

  // ===========================
  // TAB SYSTEM
  // ===========================
  const TAB_STYLES = `
    <style>
      .game-tabs {
        display: flex;
        gap: 0;
        border-bottom: 2px solid rgba(4, 30, 66, 0.12);
        margin: 0 0 20px 0;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        position: sticky;
        top: 0;
        background: var(--bg, #fff);
        z-index: 50;
        padding: 0 4px;
      }
      .game-tabs::-webkit-scrollbar { display: none; }

      .game-tab-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 12px 18px;
        font-family: 'Rubik', sans-serif;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        color: #041e4270;
        background: transparent;
        border: none;
        border-bottom: 3px solid transparent;
        margin-bottom: -2px;
        cursor: pointer;
        white-space: nowrap;
        transition: color 0.2s, border-color 0.2s;
      }
      .game-tab-btn:hover {
        color: #041e42;
      }
      .game-tab-btn.active {
        color: #bf0d3d;
        border-bottom-color: #bf0d3d;
      }
      .game-tab-btn svg {
        width: 14px;
        height: 14px;
        opacity: 0.7;
      }
      .game-tab-btn.active svg {
        opacity: 1;
      }

      .game-tab-panel {
        display: none;
        animation: fadeTabIn 0.25s ease;
      }
      .game-tab-panel.active {
        display: block;
      }
      @keyframes fadeTabIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Strike Zone Overlay */
      .strike-zone-section {
        display: flex;
        justify-content: center;
        padding: 24px 0 16px;
        position: relative;
      }
      .strike-zone-wrapper {
        position: relative;
        width: 340px;
      }
      .strike-zone-title {
        text-align: center;
        font-family: 'Rubik', sans-serif;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: #041e4260;
        margin-bottom: 12px;
      }
      .sz-svg {
        display: block;
        margin: 0 auto;
      }

      /* Plays section spacing */
      #game-overview-tab .scoring-plays-section,
      #game-overview-tab .all-plays-section {
        margin-top: 24px;
      }
      .section-divider {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 28px 0 16px;
      }
      .section-divider-label {
        font-family: 'Rubik', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: #041e4280;
        white-space: nowrap;
      }
      .section-divider-line {
        flex: 1;
        height: 1px;
        background: rgba(4,30,66,0.1);
      }

      /* Win Prob Tab */
      #win-prob-container {
        padding: 8px 4px 16px;
        font-family: 'Rubik', sans-serif;
      }

      /* Boxscore Tab */
      #boxscore-tab .linescore-wrapper {
        margin-bottom: 20px;
      }
    </style>
  `;

  const renderTabs = (phase) => {
    const tabContainer = document.getElementById('game-tabs-container');
    if (!tabContainer) return;

    const tabs = [
      { id: 'game-overview', label: 'Overview', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>` },
      { id: 'boxscore', label: 'Box Score', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/></svg>` },
      ...(phase !== 'PREGAME' ? [{ id: 'win-prob', label: 'Win Prob', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` }] : []),
    ];

    tabContainer.innerHTML = TAB_STYLES + `
      <nav class="game-tabs" role="tablist">
        ${tabs.map((t, i) => `
          <button class="game-tab-btn${i === 0 ? ' active' : ''}" 
                  data-tab="${t.id}" 
                  role="tab" 
                  aria-selected="${i === 0}">
            ${t.icon}
            ${t.label}
          </button>
        `).join('')}
      </nav>
    `;

    tabContainer.querySelectorAll('.game-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
  };

  const switchTab = (tabId) => {
    document.querySelectorAll('.game-tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabId);
      b.setAttribute('aria-selected', b.dataset.tab === tabId);
    });
    document.querySelectorAll('.game-tab-panel').forEach(p => {
      p.classList.toggle('active', p.id === `${tabId}-tab`);
    });

    if (tabId === 'win-prob' && currentGameData) {
      loadWinProbability(gamePk, currentGameData);
    }
  };

  // ===========================
  // STRIKE ZONE SVG
  // ===========================
  const renderStrikeZoneSection = () => {
    return `
      <div class="strike-zone-section">
        <div class="strike-zone-wrapper">
          <div class="strike-zone-title">Strike Zone</div>
          <svg class="sz-svg" width="340" height="320" viewBox="0 0 340 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Batter silhouette (right-handed) -->
            <g opacity="0.18">
              <!-- Body -->
              <ellipse cx="252" cy="180" rx="22" ry="38" fill="#041e42"/>
              <!-- Head -->
              <circle cx="252" cy="128" r="18" fill="#041e42"/>
              <!-- Legs -->
              <rect x="236" y="214" width="12" height="52" rx="6" fill="#041e42"/>
              <rect x="252" y="214" width="12" height="52" rx="6" fill="#041e42"/>
              <!-- Arms holding bat -->
              <rect x="200" y="162" width="55" height="10" rx="5" fill="#041e42" transform="rotate(-8 200 162)"/>
              <!-- Bat -->
              <rect x="148" y="145" width="56" height="7" rx="3.5" fill="#041e42" transform="rotate(-15 148 145)"/>
              <!-- Front foot stance -->
              <ellipse cx="242" cy="268" rx="14" ry="6" fill="#041e42"/>
              <ellipse cx="260" cy="268" rx="14" ry="6" fill="#041e42"/>
            </g>

            <!-- Home plate -->
            <polygon points="170,285 150,270 150,250 190,250 190,270" fill="white" stroke="#041e4240" stroke-width="1.5"/>

            <!-- Strike zone box -->
            <rect x="130" y="130" width="80" height="120" rx="3"
              fill="rgba(4,30,66,0.03)" 
              stroke="#bf0d3d" 
              stroke-width="2"
              stroke-dasharray="5,3"/>

            <!-- Zone grid lines -->
            <line x1="130" y1="170" x2="210" y2="170" stroke="#bf0d3d" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.5"/>
            <line x1="130" y1="210" x2="210" y2="210" stroke="#bf0d3d" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.5"/>
            <line x1="156.6" y1="130" x2="156.6" y2="250" stroke="#bf0d3d" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.5"/>
            <line x1="183.3" y1="130" x2="183.3" y2="250" stroke="#bf0d3d" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.5"/>

            <!-- Zone labels -->
            <text x="170" y="120" text-anchor="middle" font-family="Rubik" font-size="9" fill="#041e4260" font-weight="600" letter-spacing="0.5">HIGH</text>
            <text x="170" y="268" text-anchor="middle" font-family="Rubik" font-size="9" fill="#041e4260" font-weight="600" letter-spacing="0.5">LOW</text>
            <text x="118" y="195" text-anchor="middle" font-family="Rubik" font-size="9" fill="#041e4260" font-weight="600" letter-spacing="0.5" transform="rotate(-90 118 195)">INSIDE</text>
            <text x="224" y="195" text-anchor="middle" font-family="Rubik" font-size="9" fill="#041e4260" font-weight="600" letter-spacing="0.5" transform="rotate(90 224 195)">OUTSIDE</text>

            <!-- Pitcher's mound dot -->
            <circle cx="170" cy="50" r="5" fill="#041e4230" stroke="#041e4250" stroke-width="1"/>
            <text x="170" y="38" text-anchor="middle" font-family="Rubik" font-size="8" fill="#041e4260" letter-spacing="0.5">PITCHER</text>

            <!-- Dashed pitch path -->
            <line x1="170" y1="55" x2="170" y2="190" stroke="#041e4220" stroke-width="1.5" stroke-dasharray="4,4"/>
          </svg>
          <div style="text-align:center; font-family:'Rubik',sans-serif; font-size:10px; color:#041e4250; margin-top:4px; letter-spacing:0.5px;">
            Live pitch tracking coming soon
          </div>
        </div>
      </div>
    `;
  };

  // ===========================
  // EVENT ICON MAPPING
  // ===========================
  const EVENT_ICON_MAP = {
    'home run': 'HR', 'home_run': 'HR',
    'triple': '3B', 'double': '2B', 'single': '1B',
    'walk': 'BB',
    'hit by pitch': 'HBP', 'hit_by_pitch': 'HBP',
    'sac fly': 'SAC', 'sac_fly': 'SAC',
    'sac bunt': 'SH', 'sac_bunt': 'SH',
    'grounded into dp': 'GIDP', 'grounded_into_dp': 'GIDP',
    'double play': 'DP',
    'field error': 'E', 'field_error': 'E',
    'fielders choice': 'FC', 'fielders_choice': 'FC',
    'catcher interference': 'CI',
    'strikeout': 'K',
    'forceout': 'FO', 'force_out': 'FO',
    'groundout': 'OUT', 'field_out': 'OUT',
    'flyout': 'OUT', 'lineout': 'OUT',
    'pop out': 'OUT'
  };

  const getEventIcon = (eventType) => {
    if (!eventType) return '';
    const type = eventType.toLowerCase();
    for (const [key, icon] of Object.entries(EVENT_ICON_MAP)) {
      if (type.includes(key)) return icon;
    }
    return eventType.substring(0, 3).toUpperCase();
  };

  // ===========================
  // HIT DATA
  // ===========================
  const getHitData = (play) => {
    if (!play) return null;
    if (play.playEvents?.length) {
      const hitEvent = play.playEvents.find(e => e.hitData);
      if (hitEvent?.hitData) return hitEvent.hitData;
    }
    return play.hitData || null;
  };

  const formatHitData = (hitData) => {
    if (!hitData) return { launchSpeed: '--', launchAngle: '--', totalDistance: '--' };
    return {
      launchSpeed: hitData.launchSpeed ? `${hitData.launchSpeed.toFixed(1)} MPH` : '--',
      launchAngle: hitData.launchAngle ? `${Math.round(hitData.launchAngle)}°` : '--',
      totalDistance: hitData.totalDistance ? `${hitData.totalDistance} ft` : '--'
    };
  };

  // ===========================
  // BASE RUNNERS & FIELD
  // ===========================
  const getBaseRunners = (runners = []) => ({
    first: runners.some(r => r.movement?.end === '1B' || r.movement?.start === '1B'),
    second: runners.some(r => r.movement?.end === '2B' || r.movement?.start === '2B'),
    third: runners.some(r => r.movement?.end === '3B' || r.movement?.start === '3B')
  });

  const generateSVGField = (count, onBase) => {
    const outs = count?.outs ?? 0;
    const fills = {
      out1: outs >= 1 ? '#bf0d3d' : '#f7fafc',
      out2: outs >= 2 ? '#bf0d3d' : '#f7fafc',
      out3: outs >= 3 ? '#bf0d3d' : '#f7fafc',
      first: onBase?.first ? '#bf0d3d' : '#f7fafc',
      second: onBase?.second ? '#bf0d3d' : '#f7fafc',
      third: onBase?.third ? '#bf0d3d' : '#f7fafc'
    };
    return `
      <svg width="60" height="60" viewBox="0 0 58 79" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="13" cy="61" r="6" fill="${fills.out1}" stroke="#bf0d3d" stroke-width="1" opacity="0.8"/>
        <circle cx="30" cy="61" r="6" fill="${fills.out2}" stroke="#bf0d3d" stroke-width="1" opacity="0.8"/>
        <circle cx="47" cy="61" r="6" fill="${fills.out3}" stroke="#bf0d3d" stroke-width="1" opacity="0.8"/>
        <rect x="17.6066" y="29.7071" width="14" height="14" transform="rotate(45 17.6066 29.7071)" fill="${fills.third}" stroke="#bf0d3d" stroke-width="1" opacity="0.8"/>
        <rect x="29.364" y="17.7071" width="14" height="14" transform="rotate(45 29.364 17.7071)" fill="${fills.second}" stroke="#bf0d3d" stroke-width="1" opacity="0.8"/>
        <rect x="41.6066" y="29.7071" width="14" height="14" transform="rotate(45 41.6066 29.7071)" fill="${fills.first}" stroke="#bf0d3d" stroke-width="1" opacity="0.8"/>
      </svg>
    `;
  };

  // ===========================
  // LOGO MANAGEMENT
  // ===========================
  const getLogoUrl = (teamId, darkMode) => darkMode
    ? `${LOGO_BASE}/team-cap-on-dark/${teamId}.svg`
    : `${LOGO_BASE}/${teamId}.svg`;

  const updateTeamLogos = (darkMode) => {
    if (!awayTeamId || !homeTeamId) return;
    const awayUrl = getLogoUrl(awayTeamId, darkMode);
    const homeUrl = getLogoUrl(homeTeamId, darkMode);
    document.querySelectorAll('.away-logo').forEach(logo => logo.src = awayUrl);
    document.querySelectorAll('.home-logo').forEach(logo => logo.src = homeUrl);
  };

  // ===========================
  // THEME TOGGLE
  // ===========================
  const initThemeToggle = () => {
    const themeBtn = document.getElementById('themeToggle');
    const logoImg = document.getElementById('logoImg');
    if (!themeBtn || !logoImg) return;
    const body = document.body;
    body.classList.add('dark');
    body.classList.remove('light');
    themeBtn.textContent = 'Light';
    logoImg.src = 'assets/site-logos/logo-light.svg';
    themeBtn.addEventListener('click', () => {
      const isLight = body.classList.contains('light');
      body.classList.toggle('light', !isLight);
      body.classList.toggle('dark', isLight);
      themeBtn.textContent = isLight ? 'Light' : 'Dark';
      logoImg.src = isLight ? 'assets/site-logos/logo-light.svg' : 'assets/site-logos/logo-dark.svg';
      updateTeamLogos(body.classList.contains('dark'));
    });
  };

  // ===========================
  // SCOREBUG
  // ===========================
  const updateScorebug = (data) => {
    const container = document.getElementById('scorebug-container');
    const wrapper = document.getElementById('scorebug-wrapper');
    if (!container || !wrapper) return;
    const status = data.gameData.status.detailedState;
    if (FINAL_STATUSES.includes(status)) {
      container.innerHTML = '';
      wrapper.style.display = 'none';
      return;
    }
    const currentPlay = data.liveData?.plays?.currentPlay;
    if (!currentPlay) return;
    wrapper.style.display = '';
    const count = currentPlay.count || { balls: 0, strikes: 0, outs: 0 };
    const onBase = data.liveData?.linescore?.offense || {};
    container.innerHTML = `
      <div class="scorebug">
        ${generateSVGField(count, onBase)}
        <div class="balls-strikes" style="color: #2f4858;">
          ${count.balls} - ${count.strikes}
        </div>
      </div>
    `;
  };

  // ===========================
  // PLAY ITEM CREATION
  // ===========================
  const createPlayItem = (play, showStatcast = false, showScoringInfo = false) => {
    const batter = play.matchup?.batter;
    const playerId = batter?.id ?? 'default';
    const eventIcon = getEventIcon(play.result.eventType);
    const onBase = getBaseRunners(play.runners);
    const hitData = formatHitData(getHitData(play));

    const el = document.createElement('div');
    el.className = 'play-item';
    el.style.position = 'relative';

    const statcastStats = showStatcast ? `
      <div class="statcast-stats">
        <div class="stat-item"><div>Exit Velo</div><div>${hitData.launchSpeed}</div></div>
        <div class="stat-item"><div>Angle</div><div>${hitData.launchAngle}</div></div>
        <div class="stat-item"><div>Distance</div><div>${hitData.totalDistance}</div></div>
      </div>
    ` : '';

    const scoringInfo = showScoringInfo ? `
      <div class="score-update">Score: ${play.result.homeScore} - ${play.result.awayScore}</div>
      <div class="rbi-info">RBI: ${play.result.rbi ?? 0}</div>
    ` : '';

    el.innerHTML = `
      <div class="inning-indicator">${play.about.halfInning} ${play.about.inning}</div>
      <div class="player-image-container">
        <img class="player-image"
          src="${PLAYER_IMAGE_BASE}/${playerId}/spots/60"
          alt="${batter?.fullName ?? ''}">
        <div class="event-icon">${eventIcon}</div>
      </div>
      <div class="content-wrapper">
        <div class="play-details">
          <div class="event-name">${play.result.event}</div>
          <p class="play-description">${play.result.description}</p>
          ${scoringInfo}
          ${statcastStats}
        </div>
        <div class="game-situation">
          <div class="count-info">${play.count.balls}-${play.count.strikes}</div>
          <div class="field-display">${generateSVGField(play.count, onBase)}</div>
        </div>
      </div>
    `;
    return el;
  };

  // ===========================
  // TOP PERFORMERS
  // ===========================
  const renderTopPerformers = (data) => {
    const container = document.querySelector('.top-performers-case');
    if (!container) return;
    const detailedState = data.gameData?.status?.detailedState;
    const isGameOver = detailedState === 'Game Over' || detailedState === 'Final';
    if (!isGameOver) { container.style.display = 'none'; return; }
    container.style.display = 'flex';
    container.innerHTML = '';
    const topPerformers = data.liveData?.boxscore?.topPerformers;
    if (!topPerformers?.length) {
      container.innerHTML = '<div class="no-data">No top performers available</div>';
      return;
    }
    topPerformers.forEach(performer => {
      const player = performer.player;
      const playerId = player.person.id;
      const playerName = player.person.fullName;
      const battingSummary = player.stats?.batting?.summary;
      const pitchingSummary = player.stats?.pitching?.summary;
      const statSummary = battingSummary || pitchingSummary || 'No stats available';
      const playerDiv = document.createElement('div');
      playerDiv.className = 'top-performer-player';
      playerDiv.innerHTML = `
        <div class="performer-image">
          <img src="https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${playerId}/headshot/67/current"
               alt="${playerName}"
               onerror="this.src='https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/generic/headshot/67/current.png'">
        </div>
        <div class="performer-name">${playerName}</div>
        <div class="performer-stats">${statSummary}</div>
      `;
      container.appendChild(playerDiv);
    });
  };

  // ===========================
  // PITCHING DECISIONS
  // ===========================
  const renderPitchingDecisions = (data) => {
    const wrapper = document.querySelector('.linescore-wrapper');
    if (!wrapper) return;
    const existing = wrapper.querySelector('.pitching-decisions');
    if (existing) existing.remove();
    const decisions = data.liveData?.decisions;
    if (!decisions) return;
    const { winner, loser, save } = decisions;
    if (!winner && !loser) return;
    const decisionsDiv = document.createElement('div');
    decisionsDiv.className = 'pitching-decisions';
    let html = '';
    if (winner) html += `<div class="decision-item"><div class="decision-info"><span class="decision-label">W:</span><span class="decision-name">${winner.fullName}</span></div></div>`;
    if (loser) html += `<div class="decision-item"><div class="decision-info"><span class="decision-label">L:</span><span class="decision-name">${loser.fullName}</span></div></div>`;
    if (save) html += `<div class="decision-item"><div class="decision-info"><span class="decision-label">SV:</span><span class="decision-name">${save.fullName}</span></div></div>`;
    decisionsDiv.innerHTML = html;
    wrapper.appendChild(decisionsDiv);
  };

  // ===========================
  // RENDER FUNCTIONS
  // ===========================
  const renderHeader = (gameData, liveData) => {
    const { away, home } = gameData.teams;
    const datetime = gameData.datetime;
    const linescore = liveData.linescore;
    const status = gameData.status.detailedState;
    awayTeamId = away.id;
    homeTeamId = home.id;
    const awayRecord = away?.record ? `${away.record.wins}-${away.record.losses}` : '';
    const homeRecord = home?.record ? `${home.record.wins}-${home.record.losses}` : '';
    updateTeamLogos(isDarkMode());
    document.querySelector('.away-record').textContent = awayRecord;
    document.querySelector('.home-record').textContent = homeRecord;
    document.querySelector('.away-score').textContent = linescore?.teams?.away?.runs ?? '0';
    document.querySelector('.home-score').textContent = linescore?.teams?.home?.runs ?? '0';
    let statusText = PREGAME_STATUSES.includes(status)
      ? `${datetime.time} ${datetime.ampm}`
      : status;
    document.querySelector('.game-status').textContent = statusText;
  };

  const renderBoxscore = (gameData, liveData) => {
    const linescore = liveData.linescore;
    const { away, home } = gameData.teams;
    const tbody = document.querySelector('.boxscore-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const darkMode = isDarkMode();
    const awayLogoUrl = getLogoUrl(awayTeamId, darkMode);
    const homeLogoUrl = getLogoUrl(homeTeamId, darkMode);

    if (!linescore?.innings?.length) {
      const emptyInnings = Array(9).fill('<td class="inning-score">-</td>').join('');
      tbody.innerHTML = `
        <tr>
          <td class="team-name"><img src="${awayLogoUrl}" alt="${away.abbreviation}" class="box-team-logo away-logo"></td>
          ${emptyInnings}<td>-</td><td>-</td><td>-</td>
        </tr>
        <tr>
          <td class="team-name"><img src="${homeLogoUrl}" alt="${home.abbreviation}" class="box-team-logo home-logo"></td>
          ${emptyInnings}<td>-</td><td>-</td><td>-</td>
        </tr>
      `;
      return;
    }

    const maxInnings = Math.max(9, linescore.innings.length);
    let awayInnings = '', homeInnings = '';
    for (let i = 0; i < maxInnings; i++) {
      const inning = linescore.innings[i];
      if (inning) {
        awayInnings += `<td class="inning-score">${inning.away?.runs ?? '-'}</td>`;
        homeInnings += `<td class="inning-score">${inning.home?.runs ?? '-'}</td>`;
      } else {
        awayInnings += `<td class="inning-score">-</td>`;
        homeInnings += `<td class="inning-score">-</td>`;
      }
    }
    tbody.innerHTML = `
      <tr>
        <td class="team-name"><img src="${awayLogoUrl}" alt="${away.abbreviation}" class="box-team-logo away-logo"></td>
        ${awayInnings}
        <td>${linescore.teams.away.runs ?? 0}</td>
        <td>${linescore.teams.away.hits ?? 0}</td>
        <td>${linescore.teams.away.errors ?? 0}</td>
      </tr>
      <tr>
        <td class="team-name"><img src="${homeLogoUrl}" alt="${home.abbreviation}" class="box-team-logo home-logo"></td>
        ${homeInnings}
        <td>${linescore.teams.home.runs ?? 0}</td>
        <td>${linescore.teams.home.hits ?? 0}</td>
        <td>${linescore.teams.home.errors ?? 0}</td>
      </tr>
    `;
  };

  const renderScoringPlays = (plays, gameId, vm) => {
    const container = document.getElementById('scoring-plays-container');
    if (!container) return;
    container.querySelectorAll('.play-item').forEach(p => p.remove());
    if (!plays?.scoringPlays?.length) { container.style.display = 'none'; return; }
    container.style.display = '';
    plays.scoringPlays.forEach(idx => {
      const play = plays.allPlays[idx];
      const el = createPlayItem(play, true, true);
      container.appendChild(el);
      if (vm) vm.addVideoButtonToPlay(el, gameId, play);
    });
  };

  const renderAllPlays = (plays) => {
    const container = document.getElementById('all-plays-container');
    if (!container) return;
    container.querySelectorAll('.play-item').forEach(p => p.remove());
    if (!plays?.allPlays?.length) { container.style.display = 'none'; return; }
    container.style.display = '';
    plays.allPlays.forEach(play => {
      const el = createPlayItem(play, true, false);
      container.appendChild(el);
    });
  };

  // ===========================
  // WIN PROBABILITY CHART
  // ===========================
  const loadWinProbability = async (pk, cachedGameData) => {
    let winProbContainer = document.getElementById('win-prob-container');
    if (!winProbContainer) return;

    winProbContainer.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:center; padding:48px; gap:12px; color:#041e4260;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite;">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <style>@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}</style>
        <span style="font-family:Rubik;font-size:13px;font-weight:500;">Loading Win Probability...</span>
      </div>
    `;

    try {
      const [wpResponse] = await Promise.all([
        fetch(`${API_BASE_V1}/game/${pk}/winProbability`)
      ]);

      const wpData = await wpResponse.json();
      const gameDataObj = cachedGameData.gameData;

      const awayTeam = gameDataObj.teams.away;
      const homeTeam = gameDataObj.teams.home;
      const awayId = awayTeam.id;
      const homeId = homeTeam.id;
      const awayColor = getTeamColor(awayId);
      const homeColor = getTeamColor(homeId);
      const awayName = awayTeam.name;
      const homeName = homeTeam.name;
      const awayAbbr = awayTeam.abbreviation || awayTeam.teamName;
      const homeAbbr = homeTeam.abbreviation || homeTeam.teamName;

      if (!wpData || wpData.length === 0) {
        winProbContainer.innerHTML = `
          <div style="text-align:center; padding:48px; font-family:Rubik; font-size:13px; color:#041e4260;">
            Win probability data is not available for this game.
          </div>`;
        return;
      }

      const latest = wpData[wpData.length - 1];
      const homeProb = Math.round(latest.homeTeamWinProbability);
      const awayProb = Math.round(latest.awayTeamWinProbability);

      const W = 520, H = 200;
      const PL = 36, PR = 16, PT = 16, PB = 28;
      const CW = W - PL - PR;
      const CH = H - PT - PB;

      const total = wpData.length;
      const stepX = CW / (total - 1 || 1);

      const pts = wpData.map((d, i) => ({
        x: PL + i * stepX,
        y: PT + (CH / 2) + ((d.homeTeamWinProbability - 50) / 50) * (CH / 2),
        homeProb: d.homeTeamWinProbability,
        awayProb: d.awayTeamWinProbability,
        added: d.homeTeamWinProbabilityAdded,
        event: d.result?.event || '',
        description: d.result?.description || '',
        inning: d.about?.inning || '',
        isTop: d.about?.isTopInning,
      }));

      const linePoints = pts.map(p => `${p.x},${p.y}`).join(' ');
      const midY = PT + CH / 2;
      const polyPoints = [`${PL},${midY}`, ...pts.map(p => `${p.x},${p.y}`), `${PL + CW},${midY}`].join(' ');

      let inningLines = '';
      let lastInning = 0;
      pts.forEach(p => {
        if (p.inning && p.inning !== lastInning && p.isTop) {
          lastInning = p.inning;
          const x = p.x;
          inningLines += `
            <line x1="${x}" y1="${PT}" x2="${x}" y2="${PT + CH}" stroke="rgba(4,30,66,0.12)" stroke-width="1" stroke-dasharray="3,3"/>
            <line x1="${x}" y1="${PT + CH}" x2="${x}" y2="${PT + CH + 5}" stroke="#041e42" stroke-width="1"/>
            <text x="${x}" y="${PT + CH + 15}" text-anchor="middle" font-size="8" fill="#041e42" font-family="Rubik">${p.inning}</text>
          `;
        }
      });

      const tooltipId = `wp-tooltip-${pk}`;

      winProbContainer.innerHTML = `
        <style>
          #${tooltipId} {
            position: absolute;
            background: #041e42;
            color: white;
            padding: 8px 10px;
            border-radius: 8px;
            font-size: 11px;
            font-family: Rubik, sans-serif;
            pointer-events: none;
            display: none;
            max-width: 200px;
            line-height: 1.5;
            z-index: 100;
            border-left: 3px solid #bf0d3d;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          }
          #${tooltipId} .tt-event { font-weight: 700; font-size: 12px; color: #bf0d3d; margin-bottom: 2px; }
          #${tooltipId} .tt-desc { color: #ccc; font-size: 10px; margin-bottom: 4px; }
          #${tooltipId} .tt-probs { display: flex; justify-content: space-between; gap: 10px; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 4px; }
          #${tooltipId} .tt-away { color: ${awayColor}; font-weight: 600; filter: brightness(2.0); }
          #${tooltipId} .tt-home { color: ${homeColor}; font-weight: 600; filter: brightness(2.0); }
          #${tooltipId} .tt-added-pos { color: #4caf50; font-size: 10px; }
          #${tooltipId} .tt-added-neg { color: #ff6b6b; font-size: 10px; }
        </style>

        <div style="text-align:center; font-weight:600; font-size:12px; color:#041e428a; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-family:Rubik;">
          Win Probability
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding:0 4px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <img src="${LOGO_BASE}/${awayId}.svg" style="width:24px; height:24px;">
            <span style="font-size:20px; font-weight:700; color:#041e42; font-family:Rubik;">${awayProb}%</span>
          </div>
          <div style="font-size:10px; color:#999; font-weight:500; letter-spacing:0.5px; font-family:Rubik;">WIN PROBABILITY</div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:20px; font-weight:700; color:#bf0d3d; font-family:Rubik;">${homeProb}%</span>
            <img src="${LOGO_BASE}/${homeId}.svg" style="width:24px; height:24px;">
          </div>
        </div>

        <div style="display:flex; height:6px; border-radius:3px; overflow:hidden; margin:0 4px 12px 4px;">
          <div style="width:${awayProb}%; background:${awayColor};"></div>
          <div style="width:${homeProb}%; background:${homeColor};"></div>
        </div>

        <div style="position:relative; width:100%;">
          <div id="${tooltipId}"></div>
          <svg id="wp-svg-${pk}" width="100%" viewBox="0 0 ${W} ${H}" style="overflow:visible; display:block;">
            <rect x="${PL}" y="${PT}" width="${CW}" height="${CH}" fill="#f7fafc" rx="4"/>

            <polygon points="${polyPoints}" fill="${awayColor}" clip-path="url(#clip-top-${pk})" opacity="0.3"/>
            <polygon points="${polyPoints}" fill="${homeColor}" clip-path="url(#clip-bottom-${pk})" opacity="0.3"/>

            <defs>
              <clipPath id="clip-top-${pk}">
                <rect x="${PL}" y="${PT}" width="${CW}" height="${CH / 2}"/>
              </clipPath>
              <clipPath id="clip-bottom-${pk}">
                <rect x="${PL}" y="${PT + CH / 2}" width="${CW}" height="${CH / 2}"/>
              </clipPath>
            </defs>

            <line x1="${PL}" y1="${PT + CH / 2}" x2="${PL + CW}" y2="${PT + CH / 2}" stroke="#bbb" stroke-width="1" stroke-dasharray="4,3"/>
            <text x="${PL - 4}" y="${PT + CH / 2 + 4}" text-anchor="end" font-size="8" fill="#999" font-family="Rubik">50%</text>

            <text x="${PL - 4}" y="${PT + 5}" text-anchor="end" font-size="8" fill="${awayColor}" font-family="Rubik">${awayAbbr}</text>
            <text x="${PL - 4}" y="${PT + CH + 4}" text-anchor="end" font-size="8" fill="${homeColor}" font-family="Rubik">${homeAbbr}</text>
            <text x="${PL - 4}" y="${PT + 14}" text-anchor="end" font-size="7" fill="#999" font-family="Rubik">100%</text>
            <text x="${PL - 4}" y="${PT + CH - 2}" text-anchor="end" font-size="7" fill="#999" font-family="Rubik">100%</text>

            ${inningLines}

            <polyline points="${linePoints}" fill="none" stroke="#333" stroke-width="1.5" stroke-linejoin="round"/>

            ${pts.map((p, i) => {
              const x = i === 0 ? PL : pts[i - 1].x + (p.x - pts[i - 1].x) / 2;
              const nextX = i === pts.length - 1 ? PL + CW : p.x + (pts[i + 1].x - p.x) / 2;
              const w = nextX - x;
              const addedClass = p.added >= 0 ? 'tt-added-pos' : 'tt-added-neg';
              const addedSign = p.added >= 0 ? '+' : '';
              const safeDesc = (p.description || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
              const safeEvent = (p.event || '').replace(/'/g, "\\'");
              const inningLabel = p.inning ? `${p.isTop ? 'Top' : 'Bot'} ${p.inning}` : '';
              return `<rect 
                x="${x}" y="${PT}" width="${w}" height="${CH}"
                fill="transparent"
                class="wp-hover-zone"
                data-x="${p.x}" data-y="${p.y}"
                data-home="${p.homeProb.toFixed(1)}"
                data-away="${p.awayProb.toFixed(1)}"
                data-added="${p.added !== undefined ? p.added.toFixed(1) : 'N/A'}"
                data-added-class="${addedClass}"
                data-added-sign="${addedSign}"
                data-event="${safeEvent}"
                data-desc="${safeDesc}"
                data-inning="${inningLabel}"
                style="cursor:crosshair;"
              />`;
            }).join('')}

            <circle id="wp-dot-${pk}" cx="0" cy="0" r="4" fill="white" stroke="#333" stroke-width="2" style="display:none; pointer-events:none;"/>
            <text x="${PL + CW / 2}" y="${H - 2}" text-anchor="middle" font-size="9" fill="#041e42" font-family="Rubik">Inning</text>
          </svg>
        </div>

        <div style="display:flex; justify-content:center; gap:20px; margin-top:6px; font-size:11px; font-family:Rubik;">
          <div style="display:flex; align-items:center; gap:5px;">
            <div style="width:14px; height:4px; background:${awayColor}; border-radius:2px;"></div>
            <span>${awayName}</span>
          </div>
          <div style="display:flex; align-items:center; gap:5px;">
            <div style="width:14px; height:4px; background:${homeColor}; border-radius:2px;"></div>
            <span>${homeName}</span>
          </div>
        </div>
      `;

      const svg = document.getElementById(`wp-svg-${pk}`);
      const tooltip = document.getElementById(tooltipId);
      const dot = document.getElementById(`wp-dot-${pk}`);
      const hoverZones = svg.querySelectorAll('.wp-hover-zone');
      const svgWrapper = svg.parentElement;

      hoverZones.forEach(zone => {
        zone.addEventListener('mouseenter', () => {
          const cx = parseFloat(zone.dataset.x);
          const cy = parseFloat(zone.dataset.y);
          dot.setAttribute('cx', cx);
          dot.setAttribute('cy', cy);
          dot.style.display = 'block';
          const addedLine = zone.dataset.added !== 'N/A'
            ? `<span class="${zone.dataset.addedClass}">${zone.dataset.addedSign}${zone.dataset.added}% WP shift</span>`
            : '';
          tooltip.innerHTML = `
            ${zone.dataset.inning ? `<div style="font-size:9px;color:#888;margin-bottom:2px;">${zone.dataset.inning}</div>` : ''}
            ${zone.dataset.event ? `<div class="tt-event">${zone.dataset.event}</div>` : ''}
            ${zone.dataset.desc ? `<div class="tt-desc">${zone.dataset.desc}</div>` : ''}
            ${addedLine}
            <div class="tt-probs">
              <span class="tt-away">${awayAbbr} ${zone.dataset.away}%</span>
              <span class="tt-home">${homeAbbr} ${zone.dataset.home}%</span>
            </div>
          `;
          tooltip.style.display = 'block';
        });

        zone.addEventListener('mousemove', (e) => {
          const rect = svgWrapper.getBoundingClientRect();
          let left = e.clientX - rect.left + 12;
          let top = e.clientY - rect.top - 10;
          if (left + 200 > rect.width) left = e.clientX - rect.left - 212;
          if (top < 0) top = 0;
          tooltip.style.left = `${left}px`;
          tooltip.style.top = `${top}px`;
        });

        zone.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
          dot.style.display = 'none';
        });
      });

    } catch (error) {
      console.error('Error loading win probability:', error);
      winProbContainer.innerHTML = '<p style="text-align:center;color:#666;padding:20px;font-family:Rubik;">Error loading win probability data.</p>';
    }
  };

  // ===========================
  // VIDEO BUTTONS
  // ===========================
  const initVideoButtons = async (pk) => {
    if (!videoMatcher) return;
    const condensedBtn = document.querySelector('[data-video-type="condensed"]');
    const recapBtn = document.querySelector('[data-video-type="recap"]');
    if (!condensedBtn && !recapBtn) return;

    try {
      const gameContent = await videoMatcher.fetchGameContent(pk);
      if (!gameContent) return;
      const highlights = gameContent?.highlights?.highlights?.items || [];
      if (highlights.length === 0) {
        if (condensedBtn) condensedBtn.style.display = 'none';
        if (recapBtn) recapBtn.style.display = 'none';
        return;
      }

      const getBestPlaybackUrl = (playbacks) => {
        if (!playbacks?.length) return null;
        const mp4Playbacks = playbacks.filter(p => {
          const name = (p.name || '').toLowerCase();
          const url = (p.url || '').toLowerCase();
          return (name.includes('mp4avc') || url.includes('.mp4')) && !name.includes('m3u8') && !url.includes('.m3u8');
        });
        if (mp4Playbacks.length === 0) return null;
        for (const q of ['2500K', '1800K', '1200K', '800K']) {
          const match = mp4Playbacks.find(p => p.name?.includes(q));
          if (match) return match.url;
        }
        return mp4Playbacks[0].url;
      };

      if (condensedBtn && highlights[1]) {
        const url = getBestPlaybackUrl(highlights[1].playbacks);
        if (url) {
          condensedBtn.addEventListener('click', async () => {
            const orig = condensedBtn.textContent;
            condensedBtn.disabled = true;
            condensedBtn.textContent = 'Loading...';
            try {
              videoMatcher.createVideoPlayer({ id: highlights[1].guid || 'condensed_0', guid: highlights[1].guid, title: highlights[1].title || 'Condensed Game', description: highlights[1].description || '', url, duration: highlights[1].duration || 0 }, document.body, condensedBtn);
              setTimeout(() => { condensedBtn.textContent = orig; condensedBtn.disabled = false; }, 500);
            } catch { condensedBtn.textContent = orig; condensedBtn.disabled = false; }
          });
        }
      }

      if (recapBtn && highlights[0]) {
        const url = getBestPlaybackUrl(highlights[0].playbacks);
        if (url) {
          recapBtn.addEventListener('click', async () => {
            const orig = recapBtn.textContent;
            recapBtn.disabled = true;
            recapBtn.textContent = 'Loading...';
            try {
              videoMatcher.createVideoPlayer({ id: highlights[0].guid || 'recap_1', guid: highlights[0].guid, title: highlights[0].title || 'Game Recap', description: highlights[0].description || '', url, duration: highlights[0].duration || 0 }, document.body, recapBtn);
              setTimeout(() => { recapBtn.textContent = orig; recapBtn.disabled = false; }, 500);
            } catch { recapBtn.textContent = orig; recapBtn.disabled = false; }
          });
        }
      }
    } catch (error) {
      console.error('Error initializing video buttons:', error);
    }
  };

  // ===========================
  // INJECT TAB LAYOUT INTO DOM
  // ===========================
  const buildTabLayout = () => {
    // We need to inject a tabs container and reorganize existing content into panels.
    // Insert the tabs container right after the main game header/scorebug area.
    // The existing content needs to be wrapped in panels.

    // Find the main content area
    const popupContainer = document.getElementById('popup-container');
    if (!popupContainer) return;

    // Create tabs nav container if not present
    if (!document.getElementById('game-tabs-container')) {
      const tabsNav = document.createElement('div');
      tabsNav.id = 'game-tabs-container';

      // Find a good insertion point — after linescore-wrapper if present, else at start of popup
      const linescoreWrapper = document.querySelector('.linescore-wrapper');
      if (linescoreWrapper) {
        linescoreWrapper.insertAdjacentElement('afterend', tabsNav);
      } else {
        popupContainer.prepend(tabsNav);
      }
    }

    // Create Overview tab panel
    if (!document.getElementById('game-overview-tab')) {
      const overviewPanel = document.createElement('div');
      overviewPanel.id = 'game-overview-tab';
      overviewPanel.className = 'game-tab-panel active';

      // Move strike zone + scoring plays + all plays into this panel
      const strikeZoneDiv = document.createElement('div');
      strikeZoneDiv.className = 'strike-zone-section-container';
      strikeZoneDiv.innerHTML = renderStrikeZoneSection();
      overviewPanel.appendChild(strikeZoneDiv);

      // Move top performers if present
      const topPerformers = document.querySelector('.top-performers-case');
      if (topPerformers) overviewPanel.appendChild(topPerformers);

      // Move scoring plays if present
      const scoringPlaysSection = document.querySelector('.scoring-plays-section');
      if (scoringPlaysSection) {
        const divider = document.createElement('div');
        divider.className = 'section-divider';
        divider.innerHTML = `<span class="section-divider-label">Scoring Plays</span><span class="section-divider-line"></span>`;
        overviewPanel.appendChild(divider);
        overviewPanel.appendChild(scoringPlaysSection);
      } else {
        // If sections don't exist yet, add a placeholder container
        const scoringDiv = document.createElement('div');
        scoringDiv.innerHTML = `
          <div class="section-divider">
            <span class="section-divider-label">Scoring Plays</span>
            <span class="section-divider-line"></span>
          </div>
          <div id="scoring-plays-placeholder"></div>
        `;
        overviewPanel.appendChild(scoringDiv);
      }

      // Move all plays if present
      const allPlaysSection = document.querySelector('.all-plays-section');
      if (allPlaysSection) {
        const divider = document.createElement('div');
        divider.className = 'section-divider';
        divider.innerHTML = `<span class="section-divider-label">All Plays</span><span class="section-divider-line"></span>`;
        overviewPanel.appendChild(divider);
        overviewPanel.appendChild(allPlaysSection);
      }

      document.getElementById('game-tabs-container').insertAdjacentElement('afterend', overviewPanel);
    }

    // Create Box Score tab panel
    if (!document.getElementById('boxscore-tab')) {
      const boxscorePanel = document.createElement('div');
      boxscorePanel.id = 'boxscore-tab';
      boxscorePanel.className = 'game-tab-panel';

      // Move boxscore content (lineup, full batting stats) into this panel
      // Look for existing boxscore/lineup containers
      const lineupContainer = document.querySelector('.lineup-container, .boxscore-detail, #boxscore-detail-container, .tab-content');
      if (lineupContainer) {
        boxscorePanel.appendChild(lineupContainer);
      } else {
        boxscorePanel.innerHTML = `<div id="boxscore-detail-container" style="padding:16px 0;"><div style="text-align:center;font-family:Rubik;color:#041e4260;font-size:13px;padding:32px;">Detailed box score will appear here.</div></div>`;
      }

      document.getElementById('game-overview-tab').insertAdjacentElement('afterend', boxscorePanel);
    }

    // Create Win Prob tab panel
    if (!document.getElementById('win-prob-tab')) {
      const wpPanel = document.createElement('div');
      wpPanel.id = 'win-prob-tab';
      wpPanel.className = 'game-tab-panel';
      wpPanel.innerHTML = `<div id="win-prob-container"></div>`;
      document.getElementById('boxscore-tab').insertAdjacentElement('afterend', wpPanel);
    }
  };

  // ===========================
  // API
  // ===========================
  const fetchGameData = async (pk) => {
    const url = `${API_BASE}/game/${pk}/feed/live`;
    const res = await fetch(url);
    return res.json();
  };

  // ===========================
  // INITIALIZATION
  // ===========================
  const init = async () => {
    gamePk = getUrlParam('gamePk');
    if (!gamePk) { console.error('Missing gamePk in URL'); return; }

    if (window.MLBVideoMatcher) videoMatcher = new window.MLBVideoMatcher();

    initThemeToggle();

    try {
      const data = await fetchGameData(gamePk);
      const { gameData, liveData } = data;
      const status = gameData.status.detailedState;
      const phase = getGamePhase(status);

      currentGameData = data;

      renderHeader(gameData, liveData);
      renderBoxscore(gameData, liveData);
      renderPitchingDecisions(data);
      renderTopPerformers(data);

      if (phase === 'LIVE') updateScorebug(data);

      const videoButtons = document.querySelector('.video-buttons');
      if (videoButtons) videoButtons.style.display = phase === 'FINAL' ? 'flex' : 'none';

      // Build tab layout (moves existing DOM sections into panels)
      buildTabLayout();

      // Render tab navigation
      renderTabs(phase);

      // Render plays into their containers
      renderScoringPlays(liveData.plays, gamePk, videoMatcher);
      renderAllPlays(liveData.plays);

      if (typeof loadBoxScore === 'function') await loadBoxScore(data);

      if (phase === 'FINAL' && videoMatcher) await initVideoButtons(gamePk);

    } catch (error) {
      console.error('Error loading game data:', error);
    }
  };

  init();
})();