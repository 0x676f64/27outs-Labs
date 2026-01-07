// Copy this complete JavaScript file to replace your game-box.js

(() => {
  // ===========================
  // CONSTANTS & CONFIG
  // ===========================
  const API_BASE = 'https://statsapi.mlb.com/api/v1.1';
  const LOGO_BASE = 'https://www.mlbstatic.com/team-logos';
  const PLAYER_IMAGE_BASE = 'https://midfield.mlbstatic.com/v1/people';
  
  const FINAL_STATUSES = ['Final', 'Game Over', 'Final: Tied', 'Completed Early'];
  const PREGAME_STATUSES = ['Pre-Game', 'Scheduled'];

  // ===========================
  // STATE
  // ===========================
  let awayTeamId, homeTeamId;
  let videoMatcher = null;
  
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
  // EVENT ICON MAPPING
  // ===========================
  const EVENT_ICON_MAP = {
    'home run': 'HR',
    'home_run': 'HR',
    'triple': '3B',
    'double': '2B',
    'single': '1B',
    'walk': 'BB',
    'hit by pitch': 'HBP',
    'hit_by_pitch': 'HBP',
    'sac fly': 'SAC',
    'sac_fly': 'SAC',
    'sac bunt': 'SH',
    'sac_bunt': 'SH',
    'grounded into dp': 'GIDP',
    'grounded_into_dp': 'GIDP',
    'double play': 'DP',
    'field error': 'E',
    'field_error': 'E',
    'fielders choice': 'FC',
    'fielders_choice': 'FC',
    'catcher interference': 'CI',
    'strikeout': 'K',
    'forceout': 'FO',
    'force_out': 'FO',
    'groundout': 'OUT',
    'field_out': 'OUT',
    'flyout': 'OUT',
    'lineout': 'OUT',
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
  // HIT DATA EXTRACTION
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
    if (!hitData) {
      return {
        launchSpeed: '--',
        launchAngle: '--',
        totalDistance: '--'
      };
    }
    
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
  const getLogoUrl = (teamId, darkMode) => {
    const base = darkMode 
      ? `${LOGO_BASE}/team-cap-on-dark/${teamId}.svg`
      : `${LOGO_BASE}/${teamId}.svg`;
    return base;
  };

  const updateTeamLogos = (darkMode) => {
    if (!awayTeamId || !homeTeamId) return;
    
    const awayUrl = getLogoUrl(awayTeamId, darkMode);
    const homeUrl = getLogoUrl(homeTeamId, darkMode);
    
    document.querySelectorAll('.away-logo').forEach(logo => {
      logo.src = awayUrl;
    });
    
    document.querySelectorAll('.home-logo').forEach(logo => {
      logo.src = homeUrl;
    });
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
      logoImg.src = isLight
        ? 'assets/site-logos/logo-light.svg'
        : 'assets/site-logos/logo-dark.svg';
      
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
    if (!currentPlay) {
      console.log('No live game data available.');
      return;
    }

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
        <div class="stat-item">
          <div>Exit Velo</div>
          <div>${hitData.launchSpeed}</div>
        </div>
        <div class="stat-item">
          <div>Angle</div>
          <div>${hitData.launchAngle}</div>
        </div>
        <div class="stat-item">
          <div>Distance</div>
          <div>${hitData.totalDistance}</div>
       </div>
      </div>
    ` : '';

    const scoringInfo = showScoringInfo ? `
      <div class="score-update">
        Score: ${play.result.homeScore} - ${play.result.awayScore}
      </div>
      <div class="rbi-info">
        RBI: ${play.result.rbi ?? 0}
      </div>
    ` : '';

    el.innerHTML = `
      <div class="inning-indicator">
        ${play.about.halfInning} ${play.about.inning}
      </div>

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
          <div class="count-info">
            ${play.count.balls}-${play.count.strikes}
          </div>
          <div class="field-display">
            ${generateSVGField(play.count, onBase)}
          </div>
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

    container.innerHTML = '';

    const topPerformers = data.liveData?.boxscore?.topPerformers;

    if (!topPerformers || topPerformers.length === 0) {
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

    const existingDecisions = wrapper.querySelector('.pitching-decisions');
    if (existingDecisions) {
      existingDecisions.remove();
    }

    const decisions = data.liveData?.decisions;
    if (!decisions) return;

    const winner = decisions.winner;
    const loser = decisions.loser;
    const save = decisions.save;

    if (!winner && !loser) return;

    const decisionsDiv = document.createElement('div');
    decisionsDiv.className = 'pitching-decisions';

    let decisionsHTML = '';

    if (winner) {
      decisionsHTML += `
        <div class="decision-item">
          <div class="decision-info">
            <span class="decision-label">W:</span>
            <span class="decision-name">${winner.fullName}</span>
          </div>
        </div>
      `;
    }

    if (loser) {
      decisionsHTML += `
        <div class="decision-item">
          <div class="decision-info">
            <span class="decision-label">L:</span>
            <span class="decision-name">${loser.fullName}</span>
          </div>
        </div>
      `;
    }

    if (save) {
      decisionsHTML += `
        <div class="decision-item">
          <div class="decision-info">
            <span class="decision-label">SV:</span>
            <span class="decision-name">${save.fullName}</span>
          </div>
        </div>
      `;
    }

    decisionsDiv.innerHTML = decisionsHTML;
    wrapper.appendChild(decisionsDiv);
  };

  // ===========================
  // RENDER FUNCTIONS
  // ===========================
  const renderHeader = (gameData, liveData) => {
    const { away, home } = gameData.teams;
    const status = gameData.status.detailedState;
    const linescore = liveData.linescore;

    awayTeamId = away.id;
    homeTeamId = home.id;

    const awayRecord = away?.record ? `${away.record.wins}-${away.record.losses}` : '';
    const homeRecord = home?.record ? `${home.record.wins}-${home.record.losses}` : '';
    
    updateTeamLogos(isDarkMode());

    document.querySelector('.away-record').textContent = awayRecord;
    document.querySelector('.home-record').textContent = homeRecord;
    document.querySelector('.away-score').textContent = linescore?.teams?.away?.runs ?? '';
    document.querySelector('.home-score').textContent = linescore?.teams?.home?.runs ?? '';
    document.querySelector('.game-status').textContent = status;
  };

  const renderBoxscore = (gameData, liveData) => {
    const linescore = liveData.linescore;
    const { away, home } = gameData.teams;
    
    if (!linescore?.innings?.length) return;

    const tbody = document.querySelector('.boxscore-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    const awayInnings = linescore.innings
      .map(i => `<td class="inning-score">${i.away?.runs ?? ''}</td>`)
      .join('');

    const homeInnings = linescore.innings
      .map(i => `<td class="inning-score">${i.home?.runs ?? ''}</td>`)
      .join('');

    const darkMode = isDarkMode();
    const awayLogoUrl = getLogoUrl(awayTeamId, darkMode);
    const homeLogoUrl = getLogoUrl(homeTeamId, darkMode);

    tbody.innerHTML = `
      <tr>
        <td class="team-name">
          <img src="${awayLogoUrl}" alt="${away.abbreviation}" class="box-team-logo away-logo">
        </td>
        ${awayInnings}
        <td>${linescore.teams.away.runs}</td>
        <td>${linescore.teams.away.hits}</td>
        <td>${linescore.teams.away.errors}</td>
      </tr>
      <tr>
        <td class="team-name">
          <img src="${homeLogoUrl}" alt="${home.abbreviation}" class="box-team-logo home-logo">
        </td>
        ${homeInnings}
        <td>${linescore.teams.home.runs}</td>
        <td>${linescore.teams.home.hits}</td>
        <td>${linescore.teams.home.errors}</td>
      </tr>
    `;
  };

  const renderScoringPlays = (plays, gamePk, videoMatcher) => {
    const container = document.getElementById('scoring-plays-container');
    if (!container) return;

    container.querySelectorAll('.play-item').forEach(p => p.remove());

    if (!plays?.scoringPlays?.length) return;

    plays.scoringPlays.forEach(idx => {
      const play = plays.allPlays[idx];
      const el = createPlayItem(play, true, true);
      container.appendChild(el);
      
      if (videoMatcher) {
        videoMatcher.addVideoButtonToPlay(el, gamePk, play);
      }
    });
  };

  const renderAllPlays = (plays) => {
    const container = document.getElementById('all-plays-container');
    if (!container) return;

    container.querySelectorAll('.play-item').forEach(p => p.remove());

    if (!plays?.allPlays?.length) return;

    plays.allPlays.forEach(play => {
      const el = createPlayItem(play, true, false);
      container.appendChild(el);
    });
  };

  // ===========================
  // VIDEO BUTTONS
  // ===========================
  const initVideoButtons = async (gamePk) => {
    if (!videoMatcher) return;

    const condensedBtn = document.querySelector('[data-video-type="condensed"]');
    const recapBtn = document.querySelector('[data-video-type="recap"]');

    if (!condensedBtn && !recapBtn) return;

    try {
      const gameContent = await videoMatcher.fetchGameContent(gamePk);
      if (!gameContent) return;

      const highlights = gameContent?.highlights?.highlights?.items || [];
      
      if (highlights.length === 0) {
        if (condensedBtn) condensedBtn.style.display = 'none';
        if (recapBtn) recapBtn.style.display = 'none';
        return;
      }

      const getBestPlaybackUrl = (playbacks) => {
        if (!playbacks || playbacks.length === 0) return null;
        
        const mp4Playbacks = playbacks.filter(p => {
          const name = (p.name || '').toLowerCase();
          const url = (p.url || '').toLowerCase();
          const isMP4 = name.includes('mp4avc') || url.includes('.mp4');
          const isNotM3U8 = !name.includes('m3u8') && !url.includes('.m3u8');
          return isMP4 && isNotM3U8;
        });

        if (mp4Playbacks.length === 0) return null;

        const preferredQualities = ['2500K', '1800K', '1200K', '800K'];
        for (const quality of preferredQualities) {
          const qualityPlayback = mp4Playbacks.find(p => p.name && p.name.includes(quality));
          if (qualityPlayback) return qualityPlayback.url;
        }

        return mp4Playbacks[0].url;
      };

      if (condensedBtn && highlights[1]) {
        const condensedUrl = getBestPlaybackUrl(highlights[1].playbacks);
        
        if (condensedUrl) {
          condensedBtn.addEventListener('click', async () => {
            const originalText = condensedBtn.textContent;
            condensedBtn.disabled = true;
            condensedBtn.textContent = 'Loading...';

            try {
              const video = {
                id: highlights[1].guid || 'condensed_0',
                guid: highlights[1].guid,
                title: highlights[1].title || 'Condensed Game',
                description: highlights[1].description || '',
                url: condensedUrl,
                duration: highlights[1].duration || 0
              };

              videoMatcher.createVideoPlayer(video, document.body, condensedBtn);
              
              setTimeout(() => {
                condensedBtn.textContent = originalText;
                condensedBtn.disabled = false;
              }, 500);
              
            } catch (error) {
              console.error('Error playing condensed game:', error);
              condensedBtn.textContent = originalText;
              condensedBtn.disabled = false;
            }
          });
        }
      }

      if (recapBtn && highlights[0]) {
        const recapUrl = getBestPlaybackUrl(highlights[0].playbacks);
        
        if (recapUrl) {
          recapBtn.addEventListener('click', async () => {
            const originalText = recapBtn.textContent;
            recapBtn.disabled = true;
            recapBtn.textContent = 'Loading...';

            try {
              const video = {
                id: highlights[0].guid || 'recap_1',
                guid: highlights[0].guid,
                title: highlights[0].title || 'Game Recap',
                description: highlights[0].description || '',
                url: recapUrl,
                duration: highlights[0].duration || 0
              };

              videoMatcher.createVideoPlayer(video, document.body, recapBtn);
              
              setTimeout(() => {
                recapBtn.textContent = originalText;
                recapBtn.disabled = false;
              }, 500);
              
            } catch (error) {
              console.error('Error playing game recap:', error);
              recapBtn.textContent = originalText;
              recapBtn.disabled = false;
            }
          });
        }
      }

    } catch (error) {
      console.error('Error initializing video buttons:', error);
    }
  };

  // ===========================
  // API
  // ===========================
  const fetchGameData = async (gamePk) => {
    const url = `${API_BASE}/game/${gamePk}/feed/live`;
    const res = await fetch(url);
    return res.json();
  };

  // ===========================
  // INITIALIZATION
  // ===========================
  const init = async () => {
    const gamePk = getUrlParam('gamePk');
    
    if (!gamePk) {
      console.error('Missing gamePk in URL');
      return;
    }

    if (window.MLBVideoMatcher) {
      videoMatcher = new window.MLBVideoMatcher();
    }

    initThemeToggle();

    try {
      const data = await fetchGameData(gamePk);
      const { gameData, liveData } = data;
      const status = gameData.status.detailedState;
      const phase = getGamePhase(status);

      renderHeader(gameData, liveData);
      renderBoxscore(gameData, liveData);
      renderPitchingDecisions(data);
      renderTopPerformers(data);
      
      if (phase === 'LIVE') {
        updateScorebug(data);
      }

      const videoButtons = document.querySelector('.video-buttons');
      if (videoButtons) {
        videoButtons.style.display = phase === 'FINAL' ? 'flex' : 'none';
      }

      renderScoringPlays(liveData.plays, gamePk, videoMatcher);
      renderAllPlays(liveData.plays);

      if (typeof loadBoxScore === 'function') {
        await loadBoxScore(data);
      }

      if (phase === 'FINAL' && videoMatcher) {
        await initVideoButtons(gamePk);
      }

    } catch (error) {
      console.error('Error loading game data:', error);
    }
  };

  init();
})();