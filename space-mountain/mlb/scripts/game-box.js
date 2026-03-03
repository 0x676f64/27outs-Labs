(() => {
  // ===========================
  // CONSTANTS
  // ===========================
  const API_BASE  = 'https://statsapi.mlb.com/api/v1.1';
  const LOGO_BASE = 'https://www.mlbstatic.com/team-logos';
  const IMG_BASE  = 'https://midfield.mlbstatic.com/v1/people';

  const FINAL_STATUSES   = ['Final', 'Game Over', 'Final: Tied', 'Completed Early', 'Suspended: Rain'];
  const PREGAME_STATUSES = ['Pre-Game', 'Scheduled', 'Warmup', 'Delayed', 'Postponed'];

  // ===========================
  // STATE
  // ===========================
  let awayTeamId, homeTeamId;
  let videoMatcher = null;

  // ===========================
  // UTILS
  // ===========================
  const getUrlParam  = (name) => new URLSearchParams(window.location.search).get(name);
  const isDarkMode   = ()     => document.body.classList.contains('dark');
  const getGamePhase = (s)    => FINAL_STATUSES.includes(s) ? 'FINAL' : PREGAME_STATUSES.includes(s) ? 'PREGAME' : 'LIVE';

  // ===========================
  // EVENT ICONS
  // ===========================
  const EVENT_ICON_MAP = {
    'home run':'HR','home_run':'HR','triple':'3B','double':'2B','single':'1B',
    'walk':'BB','hit by pitch':'HBP','hit_by_pitch':'HBP',
    'sac fly':'SAC','sac_fly':'SAC','sac bunt':'SH','sac_bunt':'SH',
    'grounded into dp':'GIDP','grounded_into_dp':'GIDP','double play':'DP',
    'field error':'E','field_error':'E','fielders choice':'FC','fielders_choice':'FC',
    'catcher interference':'CI','strikeout':'K','forceout':'FO','force_out':'FO',
    'groundout':'OUT','field_out':'OUT','flyout':'OUT','lineout':'OUT','pop out':'OUT',
  };

  const getEventIcon = (t) => {
    if (!t) return '';
    const l = t.toLowerCase();
    for (const [k, v] of Object.entries(EVENT_ICON_MAP)) if (l.includes(k)) return v;
    return t.substring(0, 3).toUpperCase();
  };

  // ===========================
  // HIT DATA
  // ===========================
  const getHitData = (play) => {
    if (!play) return null;
    const e = play.playEvents?.find(e => e.hitData);
    return e?.hitData || play.hitData || null;
  };

  const formatHitData = (hd) => !hd ? { launchSpeed:'--', launchAngle:'--', totalDistance:'--' } : {
    launchSpeed:   hd.launchSpeed   ? `${hd.launchSpeed.toFixed(1)} MPH` : '--',
    launchAngle:   hd.launchAngle   ? `${Math.round(hd.launchAngle)}°`   : '--',
    totalDistance: hd.totalDistance ? `${hd.totalDistance} ft`           : '--',
  };

  // ===========================
  // SVG FIELD DIAGRAM
  // ===========================
  const getBaseRunners = (runners = []) => ({
    first:  runners.some(r => r.movement?.end === '1B' || r.movement?.start === '1B'),
    second: runners.some(r => r.movement?.end === '2B' || r.movement?.start === '2B'),
    third:  runners.some(r => r.movement?.end === '3B' || r.movement?.start === '3B'),
  });

  const generateSVGField = (count, onBase) => {
    const o = count?.outs ?? 0;
    const c = (active) => active ? '#bf0d3d' : '#f7fafc';
    return `<svg width="60" height="60" viewBox="0 0 58 79" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="61" r="6" fill="${c(o>=1)}" stroke="#bf0d3d" stroke-width="1" opacity=".8"/>
      <circle cx="30" cy="61" r="6" fill="${c(o>=2)}" stroke="#bf0d3d" stroke-width="1" opacity=".8"/>
      <circle cx="47" cy="61" r="6" fill="${c(o>=3)}" stroke="#bf0d3d" stroke-width="1" opacity=".8"/>
      <rect x="17.6066" y="29.7071" width="14" height="14" transform="rotate(45 17.6066 29.7071)"
            fill="${c(onBase?.third)}"  stroke="#bf0d3d" stroke-width="1" opacity=".8"/>
      <rect x="29.364"  y="17.7071" width="14" height="14" transform="rotate(45 29.364 17.7071)"
            fill="${c(onBase?.second)}" stroke="#bf0d3d" stroke-width="1" opacity=".8"/>
      <rect x="41.6066" y="29.7071" width="14" height="14" transform="rotate(45 41.6066 29.7071)"
            fill="${c(onBase?.first)}"  stroke="#bf0d3d" stroke-width="1" opacity=".8"/>
    </svg>`;
  };

  // ===========================
  // LOGOS
  // ===========================
  const getLogoUrl     = (id, dark) => dark ? `${LOGO_BASE}/team-cap-on-dark/${id}.svg` : `${LOGO_BASE}/${id}.svg`;
  const updateTeamLogos = (dark) => {
    if (!awayTeamId || !homeTeamId) return;
    document.querySelectorAll('.away-logo').forEach(el => el.src = getLogoUrl(awayTeamId, dark));
    document.querySelectorAll('.home-logo').forEach(el => el.src = getLogoUrl(homeTeamId, dark));
  };

  // ===========================
  // THEME TOGGLE
  // ===========================
  const initThemeToggle = () => {
    const btn    = document.getElementById('themeToggle');
    const logoEl = document.getElementById('logoImg');
    if (!btn || !logoEl) return;
    document.body.classList.add('dark');
    document.body.classList.remove('light');
    btn.textContent = 'Light';
    logoEl.src = 'assets/site-logos/logo-light.svg';
    btn.addEventListener('click', () => {
      const wasLight = document.body.classList.contains('light');
      document.body.classList.toggle('light', !wasLight);
      document.body.classList.toggle('dark',   wasLight);
      btn.textContent = wasLight ? 'Light' : 'Dark';
      logoEl.src = wasLight ? 'assets/site-logos/logo-light.svg' : 'assets/site-logos/logo-dark.svg';
      updateTeamLogos(document.body.classList.contains('dark'));
    });
  };

  // ===========================
  // SCOREBUG
  // ===========================
  const updateScorebug = (data) => {
    const container = document.getElementById('scorebug-container');
    const wrapper   = document.getElementById('scorebug-wrapper');
    if (!container || !wrapper) return;
    if (FINAL_STATUSES.includes(data.gameData.status.detailedState)) {
      container.innerHTML = ''; wrapper.style.display = 'none'; return;
    }
    const cp = data.liveData?.plays?.currentPlay;
    if (!cp) return;
    wrapper.style.display = '';
    const count  = cp.count || { balls:0, strikes:0, outs:0 };
    const onBase = data.liveData?.linescore?.offense || {};
    container.innerHTML = `
      <div class="scorebug">
        ${generateSVGField(count, onBase)}
        <div class="balls-strikes">${count.balls} - ${count.strikes}</div>
      </div>`;
  };

  // ===========================
  // PLAY ITEM
  // ===========================
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

  // ===========================
  // TOP PERFORMERS
  // ===========================
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
               alt="${p.person.fullName}"
               onerror="this.src='https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/generic/headshot/67/current.png'">
        </div>
        <div class="performer-name">${p.person.fullName}</div>
        <div class="performer-stats">${p.stats?.batting?.summary || p.stats?.pitching?.summary || 'N/A'}</div>`;
      c.appendChild(div);
    });
  };

  // ===========================
  // PITCHING DECISIONS
  // ===========================
  const renderPitchingDecisions = (data) => {
    const wrapper = document.querySelector('.linescore-wrapper');
    if (!wrapper) return;
    wrapper.querySelector('.pitching-decisions')?.remove();
    const d = data.liveData?.decisions;
    if (!d?.winner && !d?.loser) return;
    const row  = (label, person) => person
      ? `<div class="decision-item"><span class="decision-label">${label}:</span><span class="decision-name">${person.fullName}</span></div>` : '';
    const div  = document.createElement('div');
    div.className = 'pitching-decisions';
    div.innerHTML = row('W', d.winner) + row('L', d.loser) + row('SV', d.save);
    wrapper.appendChild(div);
  };

  // ===========================
  // GAME HEADER
  // ===========================
  const renderHeader = (gameData, liveData) => {
    const { away, home } = gameData.teams;
    awayTeamId = away.id; homeTeamId = home.id;
    updateTeamLogos(isDarkMode());
    document.querySelector('.away-record').textContent = away?.record ? `${away.record.wins}-${away.record.losses}` : '';
    document.querySelector('.home-record').textContent = home?.record ? `${home.record.wins}-${home.record.losses}` : '';
    document.querySelector('.away-score').textContent  = liveData.linescore?.teams?.away?.runs ?? '0';
    document.querySelector('.home-score').textContent  = liveData.linescore?.teams?.home?.runs ?? '0';
    const status = gameData.status.detailedState;
    document.querySelector('.game-status').textContent = PREGAME_STATUSES.includes(status)
      ? `${gameData.datetime.time} ${gameData.datetime.ampm}` : status;
  };

  // ===========================
  // LINESCORE TABLE
  // ===========================
  const renderBoxscore = (gameData, liveData) => {
    const linescore = liveData.linescore;
    const { away, home } = gameData.teams;
    const tbody = document.querySelector('.boxscore-table tbody');
    if (!tbody) return;
    const dark = isDarkMode();
    const aLogo = getLogoUrl(awayTeamId, dark);
    const hLogo = getLogoUrl(homeTeamId, dark);

    if (!linescore?.innings?.length) {
      const blanks = Array(9).fill('<td class="inning-score">-</td>').join('');
      tbody.innerHTML = `
        <tr><td class="team-name"><img src="${aLogo}" alt="${away.abbreviation}" class="box-team-logo away-logo"></td>${blanks}<td>-</td><td>-</td><td>-</td></tr>
        <tr><td class="team-name"><img src="${hLogo}" alt="${home.abbreviation}" class="box-team-logo home-logo"></td>${blanks}<td>-</td><td>-</td><td>-</td></tr>`;
      return;
    }

    const max = Math.max(9, linescore.innings.length);
    let ai = '', hi = '';
    for (let i = 0; i < max; i++) {
      const inn = linescore.innings[i];
      ai += inn ? `<td class="inning-score">${inn.away?.runs ?? '-'}</td>` : '<td class="inning-score">-</td>';
      hi += inn ? `<td class="inning-score">${inn.home?.runs ?? '-'}</td>` : '<td class="inning-score">-</td>';
    }
    tbody.innerHTML = `
      <tr><td class="team-name"><img src="${aLogo}" alt="${away.abbreviation}" class="box-team-logo away-logo"></td>${ai}
        <td>${linescore.teams.away.runs??0}</td><td>${linescore.teams.away.hits??0}</td><td>${linescore.teams.away.errors??0}</td></tr>
      <tr><td class="team-name"><img src="${hLogo}" alt="${home.abbreviation}" class="box-team-logo home-logo"></td>${hi}
        <td>${linescore.teams.home.runs??0}</td><td>${linescore.teams.home.hits??0}</td><td>${linescore.teams.home.errors??0}</td></tr>`;
  };

  // ===========================
  // PLAYS
  // ===========================
  const renderScoringPlays = (plays, gamePkId, vm) => {
    const c = document.getElementById('scoring-plays-container');
    if (!c) return;
    c.querySelectorAll('.play-item').forEach(p => p.remove());
    if (!plays?.scoringPlays?.length) { c.style.display = 'none'; return; }
    c.style.display = '';
    plays.scoringPlays.forEach(idx => {
      const el = createPlayItem(plays.allPlays[idx], true, true);
      c.appendChild(el);
      vm?.addVideoButtonToPlay(el, gamePkId, plays.allPlays[idx]);
    });
  };

  const renderAllPlays = (plays) => {
    const c = document.getElementById('all-plays-container');
    if (!c) return;
    c.querySelectorAll('.play-item').forEach(p => p.remove());
    if (!plays?.allPlays?.length) { c.style.display = 'none'; return; }
    c.style.display = '';
    plays.allPlays.forEach(play => c.appendChild(createPlayItem(play, true, false)));
  };

  // ===========================
  // VIDEO BUTTONS
  // ===========================
  const initVideoButtons = async (gamePkId) => {
    if (!videoMatcher) return;
    const cBtn = document.querySelector('[data-video-type="condensed"]');
    const rBtn = document.querySelector('[data-video-type="recap"]');
    if (!cBtn && !rBtn) return;
    try {
      const content    = await videoMatcher.fetchGameContent(gamePkId);
      const highlights = content?.highlights?.highlights?.items || [];
      if (!highlights.length) {
        cBtn && (cBtn.style.display = 'none');
        rBtn && (rBtn.style.display = 'none');
        return;
      }
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
            videoMatcher.createVideoPlayer({ id: hl.guid || label, guid: hl.guid, title: hl.title || label, description: hl.description || '', url, duration: hl.duration || 0 }, document.body, btn);
            setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 500);
          } catch { btn.innerHTML = orig; btn.disabled = false; }
        });
      };
      attach(cBtn, highlights[1], 'condensed');
      attach(rBtn, highlights[0], 'recap');
    } catch (e) { console.error('Video buttons:', e); }
  };

  // ===========================
  // INIT
  // ===========================
  const init = async () => {
    const gamePk = getUrlParam('gamePk');
    if (!gamePk) { console.error('Missing gamePk in URL'); return; }

    // Expose for lazy win-prob tab (accessed by inline script in game-box.html)
    window._gamePkCache    = gamePk;

    if (window.MLBVideoMatcher) videoMatcher = new window.MLBVideoMatcher();
    initThemeToggle();

    try {
      const data = await fetch(`${API_BASE}/game/${gamePk}/feed/live`).then(r => r.json());
      const { gameData, liveData } = data;
      const phase = getGamePhase(gameData.status.detailedState);

      window._gameDataCache = data;   // cache for win prob

      renderHeader(gameData, liveData);
      renderBoxscore(gameData, liveData);       // linescore row only
      renderPitchingDecisions(data);
      renderTopPerformers(data);

      if (phase === 'LIVE') updateScorebug(data);

      const vb = document.querySelector('.video-buttons');
      if (vb) vb.style.display = phase === 'FINAL' ? 'flex' : 'none';

      // Inject tab nav buttons (renderGameTabs defined in game-box.html <script>)
      window.renderGameTabs?.(phase);

      // Overview tab plays
      renderScoringPlays(liveData.plays, gamePk, videoMatcher);
      renderAllPlays(liveData.plays);

      // Box Score tab: batting + pitching tables (owned entirely by boxscore.js)
      if (typeof loadBoxScore === 'function') await loadBoxScore(data);

      if (phase === 'FINAL' && videoMatcher) await initVideoButtons(gamePk);

    } catch (err) {
      console.error('Error loading game data:', err);
    }
  };

  init();
})();