// daily.js — Daily Challenge & Player Stats

// ── DAILY CHALLENGE ────────────────────────────────────────────────
function getDailyDateKey() {
    return new Date().toISOString().slice(0, 10); // "2026-03-06"
}

function getDailySeed() {
    const key = getDailyDateKey();
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = ((hash << 5) - hash) + key.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

// Simple seeded RNG
function seededRandom(seed) {
    let s = seed;
    return function() {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
    };
}

let dailyRng = null;

function initDailyRng() {
    dailyRng = seededRandom(getDailySeed());
}

function getDailyRandom() {
    if (!dailyRng) initDailyRng();
    return dailyRng();
}

function hasDailyBeenPlayed() {
    return localStorage.getItem('gemvirus_daily_date') === getDailyDateKey();
}

function markDailyPlayed(score) {
    localStorage.setItem('gemvirus_daily_date', getDailyDateKey());
    localStorage.setItem('gemvirus_daily_score', score);
}

function getDailyScore() {
    if (hasDailyBeenPlayed()) return parseInt(localStorage.getItem('gemvirus_daily_score')) || 0;
    return null;
}

async function submitDailyScore(nick, score) {
    try {
        const scores = await fetchScores();
        scores.push({ nick, score, mode: 'daily', date: getDailyDateKey() });
        scores.sort((a, b) => b.score - a.score);
        const top = scores.slice(0, 100);
        await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_API_KEY },
            body: JSON.stringify({ scores: top })
        });
    } catch(e) { console.error('Daily submit error:', e); }
}

async function showDailyLeaderboard() {
    const modal = document.getElementById('leaderboard-modal');
    const tbody = document.getElementById('leaderboard-tbody');
    const title = document.getElementById('leaderboard-title');
    const filterBtns = document.getElementById('lb-filter-btns');
    modal.classList.remove('hidden');
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:20px;">⏳ Loading...</td></tr>`;

    const today = getDailyDateKey();
    title.innerText = `📅 Daily Challenge — ${today}`;
    if (filterBtns) filterBtns.dataset.active = 'daily';

    const scores = await fetchScores();
    const daily = scores.filter(s => s.mode === 'daily' && s.date === today);

    if (daily.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:20px;">No scores yet today. Be the first!</td></tr>`;
        return;
    }

    tbody.innerHTML = daily.slice(0, 20).map((s, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        const isMe = s.nick === playerNick;
        return `<tr style="${isMe ? 'color:#2ecc71;font-weight:bold;' : ''}">
            <td style="padding:6px 10px;">${medal}</td>
            <td style="padding:6px 10px;">${s.nick}</td>
            <td style="padding:6px 10px;text-align:right;">${s.score}</td>
            <td style="padding:6px 10px;color:#95a5a6;font-size:0.85rem;">${s.date}</td>
        </tr>`;
    }).join('');
}

// ── PLAYER STATS ───────────────────────────────────────────────────
function getStats() {
    return JSON.parse(localStorage.getItem('gemvirus_stats')) || {
        gamesPlayed: 0,
        totalScore: 0,
        bestArcade: 0,
        bestDaily: 0,
        arcadeGames: 0,
        storyGames: 0,
        relaxGames: 0,
        dailyGames: 0,
        levelsCompleted: 0
    };
}

function saveStats(stats) {
    localStorage.setItem('gemvirus_stats', JSON.stringify(stats));
}

function recordGameStat(mode, score, levelCompleted = false) {
    const stats = getStats();
    stats.gamesPlayed++;
    stats.totalScore += score;
    if (mode === 'arcade') { stats.arcadeGames++; if (score > stats.bestArcade) stats.bestArcade = score; }
    else if (mode === 'story') { stats.storyGames++; if (levelCompleted) stats.levelsCompleted++; }
    else if (mode === 'relax') { stats.relaxGames++; }
    else if (mode === 'daily') { stats.dailyGames++; if (score > stats.bestDaily) stats.bestDaily = score; }
    saveStats(stats);
}

function getFavoriteMode(stats) {
    const modes = { arcade: stats.arcadeGames, story: stats.storyGames, relax: stats.relaxGames, daily: stats.dailyGames };
    return Object.entries(modes).sort((a,b) => b[1]-a[1])[0][0];
}

function showStatsModal() {
    const stats = getStats();
    const avg = stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0;
    const fav = getFavoriteMode(stats);
    const favLabel = { arcade: '⏱️ Arcade', story: '📖 Story', relax: '☕ Relax', daily: '📅 Daily' }[fav];

    document.getElementById('stats-modal').classList.remove('hidden');
    document.getElementById('stats-content').innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-val">${stats.gamesPlayed}</div><div class="stat-lbl">Games Played</div></div>
            <div class="stat-card"><div class="stat-val">${stats.bestArcade.toLocaleString()}</div><div class="stat-lbl">Best Arcade</div></div>
            <div class="stat-card"><div class="stat-val">${avg.toLocaleString()}</div><div class="stat-lbl">Avg Score</div></div>
            <div class="stat-card"><div class="stat-val">${stats.bestDaily.toLocaleString()}</div><div class="stat-lbl">Best Daily</div></div>
            <div class="stat-card"><div class="stat-val">${stats.levelsCompleted}</div><div class="stat-lbl">Lvls Completed</div></div>
            <div class="stat-card"><div class="stat-val">${favLabel}</div><div class="stat-lbl">Fav Mode</div></div>
        </div>
    `;
}

function closeStatsModal() {
    document.getElementById('stats-modal').classList.add('hidden');
}
