(() => {
  /* -----------------------------
     URL + THEME HANDLING
  ------------------------------ */
  const params = new URLSearchParams(window.location.search);
  const gamePk = params.get("gamePk");

  const themeBtn = document.getElementById("themeToggle");
  const logoImg = document.getElementById("logoImg");

  themeBtn.addEventListener("click", () => {
    const body = document.body;
    const isLight = body.classList.contains("light");

    body.classList.toggle("light", !isLight);
    body.classList.toggle("dark", isLight);

    themeBtn.textContent = isLight ? "Light" : "Dark";
    logoImg.src = isLight
      ? "assets/site-logos/logo-light.svg"
      : "assets/site-logos/logo-dark.svg";
    
    // Update team logos based on NEW theme state (after toggle)
    const newIsDark = body.classList.contains("dark");
    updateTeamLogos(newIsDark);
  });

  if (!gamePk) {
    console.error("Missing gamePk in URL");
    return;
  }

  /* -----------------------------
     FETCH MLB GAME DATA
  ------------------------------ */
  const API_URL = `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`;

  async function loadGame() {
    const res = await fetch(API_URL);
    return res.json();
  }

  /* -----------------------------
     EVENT ICON MAPPING FUNCTION
  ------------------------------ */
  const getEventIcon = (eventType) => {
    if (!eventType) return '';
    
    const type = eventType.toLowerCase();
    
    if (type.includes('home run') || type.includes('home_run')) return 'HR';
    else if (type.includes('triple')) return '3B';
    else if (type.includes('double')) return '2B';
    else if (type.includes('single')) return '1B';
    else if (type.includes('walk')) return 'BB';
    else if (type.includes('hit by pitch') || type.includes('hit_by_pitch')) return 'HBP';
    else if (type.includes('sac fly') || type.includes('sac_fly')) return 'SF';
    else if (type.includes('sac bunt') || type.includes('sac_bunt')) return 'SH';
    else if (type.includes('grounded into dp') || type.includes('grounded_into_dp')) return 'GIDP';
    else if (type.includes('double play')) return 'DP';
    else if (type.includes('field error') || type.includes('field_error')) return 'E';
    else if (type.includes('fielders choice') || type.includes('fielders_choice')) return 'FC';
    else if (type.includes('catcher interference')) return 'CI';
    else if (type.includes('strikeout')) return 'K';
    else if (type.includes('forceout')) return 'FC';
    else if (type.includes('groundout')) return 'GO';
    else if (type.includes('flyout')) return 'FO';
    else if (type.includes('lineout')) return 'LO';
    else if (type.includes('pop out')) return 'PO';
    else return eventType.substring(0, 3).toUpperCase();
  };

  /* -----------------------------
     UPDATE TEAM LOGOS FUNCTION
  ------------------------------ */
  let awayTeamId, homeTeamId;
  
  const updateTeamLogos = (isDark) => {
    if (isDark) {
      document.querySelector(".away-logo").src =
        `https://www.mlbstatic.com/team-logos/team-cap-on-dark/${awayTeamId}.svg`;
      document.querySelector(".home-logo").src =
        `https://www.mlbstatic.com/team-logos/team-cap-on-dark/${homeTeamId}.svg`;
    } else {
      document.querySelector(".away-logo").src =
        `https://www.mlbstatic.com/team-logos/${awayTeamId}.svg`;
      document.querySelector(".home-logo").src =
        `https://www.mlbstatic.com/team-logos/${homeTeamId}.svg`;
    }
  };

  /* -----------------------------
     BASE RUNNERS SVG GENERATOR
  ------------------------------ */
  function generateSVGField(count, onBase) {
    const outs = count?.outs ?? 0;
    const out1Fill = outs >= 1 ? '#bf0d3d' : '#f7fafc';
    const out2Fill = outs >= 2 ? '#bf0d3d' : '#f7fafc';
    const out3Fill = outs >= 3 ? '#bf0d3d' : '#f7fafc';

    const firstBaseFill = onBase?.first ? '#bf0d3d' : '#f7fafc';
    const secondBaseFill = onBase?.second ? '#bf0d3d' : '#f7fafc';
    const thirdBaseFill = onBase?.third ? '#bf0d3d' : '#f7fafc';

    return `
      <svg width="60" height="60" viewBox="0 0 58 79" fill="none" xmlns="http://www.w3.org/2000/svg" style="background: #f7fafc;">
        <circle cx="13" cy="61" r="6" fill="${out1Fill}" stroke="#bf0d3d" stroke-width="1" opacity="0.8"/>
        <circle cx="30" cy="61" r="6" fill="${out2Fill}" stroke="#bf0d3d" stroke-width="1" opacity="0.8"/>
        <circle cx="47" cy="61" r="6" fill="${out3Fill}" stroke="#bf0d3d" stroke-width="1" opacity="0.8"/>
        
        <rect x="17.6066" y="29.7071" width="14" height="14" transform="rotate(45 17.6066 29.7071)" fill="${thirdBaseFill}" stroke="#bf0d3d" stroke-width="1" opacity="0.8"/>
        <rect x="29.364" y="17.7071" width="14" height="14" transform="rotate(45 29.364 17.7071)" fill="${secondBaseFill}" stroke="#bf0d3d" stroke-width="1" opacity="0.8"/>
        <rect x="41.6066" y="29.7071" width="14" height="14" transform="rotate(45 41.6066 29.7071)" fill="${firstBaseFill}" stroke="#bf0d3d" stroke-width="1" opacity="0.8"/>
      </svg>
    `;
  }

  /* -----------------------------
     SCOREBUG UPDATE FUNCTION
  ------------------------------ */
  function updateScorebug(data) {
    const scorebugContainer = document.getElementById("scorebug-container");
    const scorebugWrapper = document.getElementById("scorebug-wrapper");
    
    if (!scorebugContainer || !scorebugWrapper) return;

    // Check if the game is finished and hide the scorebug if it is
    const status = data.gameData.status.detailedState;
    if (["Final", "Game Over", "Final: Tied", "Completed Early"].includes(status)) {
      scorebugContainer.innerHTML = "";
      scorebugWrapper.style.display = "none";
      return;
    }

    // Check if the game is in progress
    if (!data.liveData || !data.liveData.plays || !data.liveData.plays.currentPlay) {
      console.log("No live game data available.");
      return;
    }

    // Show scorebug wrapper
    scorebugWrapper.style.display = "";

    const currentPlay = data.liveData.plays.currentPlay;
    const count = currentPlay.count || { balls: 0, strikes: 0, outs: 0 };
    const onBase = data.liveData?.linescore?.offense || {};

    scorebugContainer.innerHTML = `
      <div class="scorebug">
        ${generateSVGField(count, onBase)}
        <div class="balls-strikes" style="color: #2f4858;">
          ${count.balls} - ${count.strikes}
        </div>
      </div>
    `;
  }

  /* -----------------------------
     INIT
  ------------------------------ */
  (async () => {
    const api = await loadGame();
    const { gameData, liveData } = api;

    const away = gameData.teams.away;
    const home = gameData.teams.home;
    const status = gameData.status.detailedState;
    const linescore = liveData.linescore;
    const plays = liveData.plays;

    const phase =
      ["Final", "Game Over", "Completed Early"].includes(status)
        ? "FINAL"
        : ["Pre-Game", "Scheduled"].includes(status)
        ? "PREGAME"
        : "LIVE";

    /* -----------------------------
       HEADER (LOGOS / RECORDS / SCORES)
    ------------------------------ */
    awayTeamId = away.id;
    homeTeamId = home.id;
    
    // Set initial logos - default is light mode (regular logos)
    const isDark = document.body.classList.contains("dark");
    if (isDark) {
      updateTeamLogos(true);
    } else {
      // Light mode - use regular logos
      document.querySelector(".away-logo").src =
        `https://www.mlbstatic.com/team-logos/${awayTeamId}.svg`;
      document.querySelector(".home-logo").src =
        `https://www.mlbstatic.com/team-logos/${homeTeamId}.svg`;
    }

    document.querySelector(".away-record").textContent =
      away.record?.summary ?? "";
    document.querySelector(".home-record").textContent =
      home.record?.summary ?? "";

    document.querySelector(".away-score").textContent =
      linescore?.teams?.away?.runs ?? "";
    document.querySelector(".home-score").textContent =
      linescore?.teams?.home?.runs ?? "";

    document.querySelector(".game-status").textContent = status;

    /* -----------------------------
       LINESCORE / BOXSCORE
    ------------------------------ */
    if (linescore?.innings?.length) {
      const tbody = document.querySelector(".boxscore-table tbody");
      tbody.innerHTML = "";

      const awayInnings = linescore.innings
        .map(i => `<td class="inning-score">${i.away?.runs ?? ""}</td>`)
        .join("");

      const homeInnings = linescore.innings
        .map(i => `<td class="inning-score">${i.home?.runs ?? ""}</td>`)
        .join("");

      tbody.innerHTML = `
        <tr>
          <td class="team-name">${away.abbreviation}</td>
          ${awayInnings}
          <td>${linescore.teams.away.runs}</td>
          <td>${linescore.teams.away.hits}</td>
          <td>${linescore.teams.away.errors}</td>
        </tr>
        <tr>
          <td class="team-name">${home.abbreviation}</td>
          ${homeInnings}
          <td>${linescore.teams.home.runs}</td>
          <td>${linescore.teams.home.hits}</td>
          <td>${linescore.teams.home.errors}</td>
        </tr>
      `;
    }

    /* -----------------------------
       UPDATE SCOREBUG (IF LIVE)
    ------------------------------ */
    if (phase === "LIVE") {
      updateScorebug(api);
    }

    /* -----------------------------
       VIDEO BUTTON VISIBILITY
    ------------------------------ */
    const videoButtons = document.querySelector(".video-buttons");
    if (videoButtons) {
      videoButtons.style.display = phase === "FINAL" ? "flex" : "none";
    }

    /* -----------------------------
       SCORING PLAYS
    ------------------------------ */
    const scoringContainer = document.getElementById("scoring-plays-container");
    if (scoringContainer) {
      scoringContainer.querySelectorAll(".play-item").forEach(p => p.remove());

      if (plays?.scoringPlays?.length) {
        plays.scoringPlays.forEach(idx => {
          const play = plays.allPlays[idx];
          const batter = play.matchup?.batter;
          const playerId = batter?.id ?? "default";
          const eventIcon = getEventIcon(play.result.eventType);

          // Get baserunner information from the play
          const runners = play.runners || [];
          const onBase = {
            first: runners.some(r => r.movement?.end === "1B" || r.movement?.start === "1B"),
            second: runners.some(r => r.movement?.end === "2B" || r.movement?.start === "2B"),
            third: runners.some(r => r.movement?.end === "3B" || r.movement?.start === "3B")
          };

          const el = document.createElement("div");
          el.className = "play-item";

          el.innerHTML = `
            <div class="inning-indicator">
              ${play.about.halfInning} ${play.about.inning}
            </div>

            <div class="player-image-container">
              <img class="player-image"
                src="https://midfield.mlbstatic.com/v1/people/${playerId}/spots/60"
                alt="${batter?.fullName ?? ""}">
              <div class="event-icon">${eventIcon}</div>
            </div>

            <div class="content-wrapper">
              <div class="play-details">
                <div class="event-name">${play.result.event}</div>
                <p class="play-description">${play.result.description}</p>
                <div class="score-update">
                  Score: ${play.result.homeScore} - ${play.result.awayScore}
                </div>
                <div class="rbi-info">
                  RBI: ${play.result.rbi ?? 0}
                </div>
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

            <button class="video-button"
              data-playid="${play.playId}">
              VIDEO
            </button>
          `;

          scoringContainer.appendChild(el);
        });
      }
    }

    /* -----------------------------
       ALL PLAYS
    ------------------------------ */
    const allPlaysContainer = document.getElementById("all-plays-container");
    if (allPlaysContainer) {
      allPlaysContainer.querySelectorAll(".play-item").forEach(p => p.remove());

      if (plays?.allPlays?.length) {
        plays.allPlays.forEach(play => {
          const batter = play.matchup?.batter;
          const playerId = batter?.id ?? "default";
          const eventIcon = getEventIcon(play.result.eventType);

          // Get baserunner information from the play
          const runners = play.runners || [];
          const onBase = {
            first: runners.some(r => r.movement?.end === "1B" || r.movement?.start === "1B"),
            second: runners.some(r => r.movement?.end === "2B" || r.movement?.start === "2B"),
            third: runners.some(r => r.movement?.end === "3B" || r.movement?.start === "3B")
          };

          const el = document.createElement("div");
          el.className = "play-item";

          el.innerHTML = `
            <div class="inning-indicator">
              ${play.about.halfInning} ${play.about.inning}
            </div>

            <div class="player-image-container">
              <img class="player-image"
                src="https://midfield.mlbstatic.com/v1/people/${playerId}/spots/60"
                alt="${batter?.fullName ?? ""}">
              <div class="event-icon">${eventIcon}</div>
            </div>

            <div class="content-wrapper">
              <div class="play-details">
                <div class="event-name">${play.result.event}</div>
                <p class="play-description">${play.result.description}</p>
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

          allPlaysContainer.appendChild(el);
        });
      }
    }
  })();
})();