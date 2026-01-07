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
        const linescore = liveData.linescore;
        const boxscore = liveData.boxscore;

        if (!boxscore) {
            console.warn('No boxscore data available');
            return;
        }

        const awayTeamId = away.id;
        const homeTeamId = home.id;
        const awayAbbr = away.abbreviation;
        const homeAbbr = home.abbreviation;
        
        const innings = linescore.innings || [];
        
        // Get dark mode status
        const darkMode = document.body.classList.contains('dark');
        const getLogoUrl = (teamId) => {
            return darkMode 
                ? `https://www.mlbstatic.com/team-logos/team-cap-on-dark/${teamId}.svg`
                : `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
        };
        
        const fullHTML = `
        <!-- Mobile/Tablet View (≤820px) -->
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
                ${createTeamContent(boxscore.teams.away, awayTeamId)}
            </div>
            <div class="tab-content" id="home-content">
                ${createTeamContent(boxscore.teams.home, homeTeamId)}
            </div>
        </div>
        
        <!-- Desktop View (>820px) -->
        <div class="desktop-boxscore">
            <div class="team-column">
                <div class="team-header">
                    <img src="${getLogoUrl(awayTeamId)}" alt="${away.name}">
                    <span>${away.name}</span>
                </div>
                ${createTeamContent(boxscore.teams.away, awayTeamId)}
            </div>
            
            <div class="team-column">
                <div class="team-header">
                    <img src="${getLogoUrl(homeTeamId)}" alt="${home.name}">
                    <span>${home.name}</span>
                </div>
                ${createTeamContent(boxscore.teams.home, homeTeamId)}
            </div>
        </div>
        `;
        
        boxScoreContainer.innerHTML = fullHTML;
        setupTabHandlers();
        
    } catch (error) {
        console.error("Error loading box score:", error);
        boxScoreContainer.innerHTML = "<p>Error loading box score data.</p>";
    }
}

/**
 * Create HTML content for batting and pitching stats for a team
 * @param {Object} teamData - Team boxscore data from MLB API
 * @param {Number} teamId - Team ID for logo
 * @returns {string} HTML string for the team content
 */
function createTeamContent(teamData, teamId) {
    if (!teamData) return '<p>No team data available</p>';

    const batters = teamData.batters || [];
    const pitchers = teamData.pitchers || [];
    const players = teamData.players || {};
    
    // Build batting table - filter out pitchers with 0 at bats
    const battingRows = batters
        .map(playerId => {
            const playerData = players[`ID${playerId}`];
            if (!playerData) return null;
            
            const person = playerData.person;
            const stats = playerData.stats?.batting || {};
            const seasonStats = playerData.seasonStats?.batting || {};
            const position = playerData.position?.abbreviation || '';
            const atBats = stats.atBats || 0;
            
            // Filter out pitchers with 0 at bats
            if (position === 'P' && atBats === 0) {
                return null;
            }
            
            return {
                html: `
                    <tr>
                        <td class="player-col">
                            <img src="https://midfield.mlbstatic.com/v1/people/${person.id}/spots/60" 
                                 alt="${person.fullName}" 
                                 class="player-headshot"
                                 onerror="this.src='https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_60,q_auto:best/v1/people/generic/headshot/67/current.png'">
                            <div class="player-info">
                                <div class="player-name">${person.fullName}</div>
                                <div class="player-position">${position}</div>
                            </div>
                        </td>
                        <td>${atBats}</td>
                        <td>${stats.runs || 0}</td>
                        <td>${stats.hits || 0}</td>
                        <td>${stats.rbi || 0}</td>
                        <td>${stats.baseOnBalls || 0}</td>
                        <td>${stats.strikeOuts || 0}</td>
                        <td>${seasonStats.avg || '.000'}</td>
                    </tr>
                `
            };
        })
        .filter(row => row !== null)
        .map(row => row.html)
        .join('');

    // Build pitching table - use season ERA
    const pitchingRows = pitchers.map(playerId => {
        const playerData = players[`ID${playerId}`];
        if (!playerData) return '';
        
        const person = playerData.person;
        const stats = playerData.stats?.pitching || {};
        const seasonStats = playerData.seasonStats?.pitching || {};
        
        return `
            <tr>
                <td class="player-col">
                    <img src="https://midfield.mlbstatic.com/v1/people/${person.id}/spots/60" 
                         alt="${person.fullName}" 
                         class="player-headshot"
                         onerror="this.src='https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_60,q_auto:best/v1/people/generic/headshot/67/current.png'">
                    <div class="player-info">
                        <div class="player-name">${person.fullName}</div>
                        <div class="player-position">P</div>
                    </div>
                </td>
                <td>${stats.inningsPitched || '0.0'}</td>
                <td>${stats.hits || 0}</td>
                <td>${stats.runs || 0}</td>
                <td>${stats.earnedRuns || 0}</td>
                <td>${stats.baseOnBalls || 0}</td>
                <td>${stats.strikeOuts || 0}</td>
                <td>${seasonStats.era || '0.00'}</td>
            </tr>
        `;
    }).join('');
    
    return `
        <div class="stats-section">
            <h3 class="stats-header">Batting</h3>
            <div class="stats-table-wrapper">
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th class="player-col">Player</th>
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
                        ${battingRows}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="stats-section">
            <h3 class="stats-header">Pitching</h3>
            <div class="stats-table-wrapper">
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th class="player-col">Player</th>
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
                        ${pitchingRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * Setup event handlers for tab navigation
 */
function setupTabHandlers() {
    const tabButtons = document.querySelectorAll('.tab-button-boxscore');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(`${targetTab}-content`).classList.add('active');
        });
    });
}

/**
 * Update team logos based on theme changes
 */
function updateBoxscoreLogos() {
    const darkMode = document.body.classList.contains('dark');
    const logoImages = document.querySelectorAll('.tab-button-boxscore img, .team-header img');
    
    logoImages.forEach(img => {
        const currentSrc = img.src;
        const teamIdMatch = currentSrc.match(/team-logos\/(?:team-cap-on-dark\/)?(\d+)\.svg/);
        
        if (teamIdMatch) {
            const teamId = teamIdMatch[1];
            const newSrc = darkMode 
                ? `https://www.mlbstatic.com/team-logos/team-cap-on-dark/${teamId}.svg`
                : `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
            
            if (img.src !== newSrc) {
                img.src = newSrc;
            }
        }
    });
}

// Listen for theme changes
if (typeof MutationObserver !== 'undefined') {
    const themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                updateBoxscoreLogos();
            }
        });
    });
    
    // Start observing the body element for class changes
    themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
}