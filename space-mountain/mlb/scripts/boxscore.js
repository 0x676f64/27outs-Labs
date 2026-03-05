// boxscore.js

/**
 * Load and display the boxscore data from MLB API
 * @param {Object} data - The full game data from MLB API
 */
async function loadBoxScore(data) {
    const boxScoreContainer = document.getElementById('boxscore-container');

    if (!boxScoreContainer) {
        console.error('Boxscore container not found');
        return;
    }

    try {
        const { gameData, liveData } = data;
        const { away, home } = gameData.teams;
        const boxscore = liveData.boxscore;

        if (!boxscore) {
            boxScoreContainer.innerHTML = `<div class="no-data">Box score data not yet available.</div>`;
            return;
        }

        const awayTeamId = away.id;
        const homeTeamId = home.id;

        const darkMode = document.body.classList.contains('dark');
        const getLogoUrl = (teamId) => darkMode
            ? `https://www.mlbstatic.com/team-logos/team-cap-on-dark/${teamId}.svg`
            : `https://www.mlbstatic.com/team-logos/${teamId}.svg`;

        const fullHTML = `
            <!-- Mobile View (≤820px): tabbed away/home -->
            <div class="mobile-boxscore">
                <div class="tab-navigation">
                    <button class="tab-button-boxscore active" data-tab="away">
                        <img src="${getLogoUrl(awayTeamId)}" alt="${away.name}">
                        <span>${away.name}</span>
                    </button>
                    <button class="tab-button-boxscore" data-tab="home">
                        <img src="${getLogoUrl(homeTeamId)}" alt="${home.name}">
                        <span>${home.name}</span>
                    </button>
                </div>
                <div class="tab-content active" id="away-content">
                    ${createTeamContent(boxscore.teams.away, awayTeamId, away.name)}
                </div>
                <div class="tab-content" id="home-content">
                    ${createTeamContent(boxscore.teams.home, homeTeamId, home.name)}
                </div>
            </div>

            <!-- Desktop View (>820px): side by side -->
            <div class="desktop-boxscore">
                <div class="team-column">
                    <div class="team-header">
                        <img src="${getLogoUrl(awayTeamId)}" alt="${away.name}">
                        <span>${away.name}</span>
                    </div>
                    ${createTeamContent(boxscore.teams.away, awayTeamId, away.name)}
                </div>
                <div class="team-column">
                    <div class="team-header">
                        <img src="${getLogoUrl(homeTeamId)}" alt="${home.name}">
                        <span>${home.name}</span>
                    </div>
                    ${createTeamContent(boxscore.teams.home, homeTeamId, home.name)}
                </div>
            </div>
        `;

        boxScoreContainer.innerHTML = fullHTML;
        setupTabHandlers();

    } catch (error) {
        console.error('Error loading box score:', error);
        boxScoreContainer.innerHTML = `<div class="error">Error loading box score data.</div>`;
    }
}

/**
 * Build batting + pitching HTML for one team
 * @param {Object} teamData - Team boxscore data
 * @param {Number} teamId   - MLB team ID (unused here but available for future use)
 * @param {String} teamName - Team name for fallback display
 * @returns {string} HTML
 */
function createTeamContent(teamData, teamId, teamName) {
    if (!teamData) return `<div class="no-data">No data available for ${teamName || 'this team'}.</div>`;

    const batters  = teamData.batters  || [];
    const pitchers = teamData.pitchers || [];
    const players  = teamData.players  || {};

    // ── BATTING ──────────────────────────────────────
    const battingRows = batters
        .map(playerId => {
            const pd = players[`ID${playerId}`];
            if (!pd) return null;

            const person      = pd.person;
            const stats       = pd.stats?.batting       || {};
            const seasonStats = pd.seasonStats?.batting || {};
            const position    = pd.position?.abbreviation || '';
            const atBats      = stats.atBats ?? 0;

            // Skip pitchers who never batted
            if (position === 'P' && atBats === 0) return null;

            return `
                <tr>
                    <td class="player-col">
                        <img src="https://midfield.mlbstatic.com/v1/people/${person.id}/spots/60"
                             alt="${person.fullName}"
                             class="player-headshot"
                             onerror="this.src='https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_60,q_auto:best/v1/people/generic/headshot/67/current.png'">
                        <div class="player-info">
                            <span class="player-name">${person.fullName}</span>
                            <span class="player-position">${position}</span>
                        </div>
                    </td>
                    <td>${atBats}                  </td>
                    <td>${stats.runs          ?? 0}</td>
                    <td>${stats.hits          ?? 0}</td>
                    <td>${stats.rbi           ?? 0}</td>
                    <td>${stats.baseOnBalls   ?? 0}</td>
                    <td>${stats.strikeOuts    ?? 0}</td>
                    <td>${seasonStats.avg     || '.---'}</td>
                </tr>
            `;
        })
        .filter(Boolean)
        .join('');

    // ── PITCHING ─────────────────────────────────────
    const pitchingRows = pitchers
        .map(playerId => {
            const pd = players[`ID${playerId}`];
            if (!pd) return '';

            const person      = pd.person;
            const stats       = pd.stats?.pitching       || {};
            const seasonStats = pd.seasonStats?.pitching || {};

            return `
                <tr>
                    <td class="player-col">
                        <img src="https://midfield.mlbstatic.com/v1/people/${person.id}/spots/60"
                             alt="${person.fullName}"
                             class="player-headshot"
                             onerror="this.src='https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_60,q_auto:best/v1/people/generic/headshot/67/current.png'">
                        <div class="player-info">
                            <span class="player-name">${person.fullName}</span>
                            <span class="player-position">P</span>
                        </div>
                    </td>
                    <td>${stats.inningsPitched ?? '0.0'}</td>
                    <td>${stats.hits           ?? 0}</td>
                    <td>${stats.runs           ?? 0}</td>
                    <td>${stats.earnedRuns     ?? 0}</td>
                    <td>${stats.baseOnBalls    ?? 0}</td>
                    <td>${stats.strikeOuts     ?? 0}</td>
                    <td>${seasonStats.era      || '-.--'}</td>
                </tr>
            `;
        })
        .join('');

    return `
        <!-- BATTING -->
        <div class="stats-section-title">Batting</div>
        <div class="stats-table-wrapper">
            <table class="stats-table">
                <thead>
                    <tr>
                        <th style="text-align:left; min-width:160px;">Player</th>
                        <th>AB</th>
                        <th>R</th>
                        <th>H</th>
                        <th>RBI</th>
                        <th>BB</th>
                        <th>SO</th>
                        <th>AVG</th>
                    </tr>
                </thead>
                <tbody>
                    ${battingRows || '<tr><td colspan="8" class="no-data">No batting data</td></tr>'}
                </tbody>
            </table>
        </div>

        <!-- PITCHING -->
        <div class="stats-section-title" style="margin-top:20px;">Pitching</div>
        <div class="stats-table-wrapper">
            <table class="stats-table">
                <thead>
                    <tr>
                        <th style="text-align:left; min-width:160px;">Player</th>
                        <th>IP</th>
                        <th>H</th>
                        <th>R</th>
                        <th>ER</th>
                        <th>BB</th>
                        <th>SO</th>
                        <th>ERA</th>
                    </tr>
                </thead>
                <tbody>
                    ${pitchingRows || '<tr><td colspan="8" class="no-data">No pitching data</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Wire up the mobile away/home tab buttons inside the box score panel
 */
function setupTabHandlers() {
    const tabButtons = document.querySelectorAll('.tab-button-boxscore');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetTab = this.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));

            this.classList.add('active');
            const targetEl = document.getElementById(`${targetTab}-content`);
            if (targetEl) targetEl.classList.add('active');
        });
    });
}

/**
 * Swap team logos when the light/dark theme changes.
 * Called automatically via MutationObserver.
 */
function updateBoxscoreLogos() {
    const darkMode = document.body.classList.contains('dark');

    document.querySelectorAll('.tab-button-boxscore img, .team-header img').forEach(img => {
        const match = img.src.match(/team-logos\/(?:team-cap-on-dark\/)?(\d+)\.svg/);
        if (!match) return;
        const teamId = match[1];
        const newSrc = darkMode
            ? `https://www.mlbstatic.com/team-logos/team-cap-on-dark/${teamId}.svg`
            : `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
        if (img.src !== newSrc) img.src = newSrc;
    });
}

// Auto-update logos on theme toggle
if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(mutations => {
        mutations.forEach(m => {
            if (m.type === 'attributes' && m.attributeName === 'class') {
                updateBoxscoreLogos();
            }
        });
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
}