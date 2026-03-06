// leaderboard.js
const JSONBIN_BIN_ID = '69ab414d43b1c97be9bb547b';
const JSONBIN_API_KEY = '$2a$10$MuOtB.5HKW87SwXwvjAs3.JuHf.s2PDYtL2tN/.60dd1bSLf/i/0C';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

let playerNick = localStorage.getItem('gemvirus_nick') || '';

function getNick() { return playerNick; }

function openNickModal(callback) {
    const existing = localStorage.getItem('gemvirus_nick');
    if (existing) { playerNick = existing; callback(); return; }

    const modal = document.getElementById('nick-modal');
    modal.classList.remove('hidden');
    const confirmBtn = document.getElementById('nick-confirm-btn');
    const input = document.getElementById('nick-input');
    input.value = '';
    input.focus();

    const confirm = () => {
        const val = input.value.trim().slice(0, 20);
        if (!val) { input.style.borderColor = '#e74c3c'; return; }
        playerNick = val;
        localStorage.setItem('gemvirus_nick', val);
        modal.classList.add('hidden');
        confirmBtn.removeEventListener('click', confirm);
        callback();
    };
    confirmBtn.addEventListener('click', confirm);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirm(); });
}

async function fetchScores() {
    try {
        const res = await fetch(JSONBIN_URL + '/latest', {
            headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });
        const data = await res.json();
        return data.record.scores || [];
    } catch(e) {
        console.error('Leaderboard fetch error:', e);
        return [];
    }
}

async function submitScore(nick, score, mode) {
    try {
        const scores = await fetchScores();
        scores.push({ nick, score, mode, date: new Date().toISOString().slice(0, 10) });
        scores.sort((a, b) => b.score - a.score);
        const top = scores.slice(0, 100);
        await fetch(JSONBIN_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_API_KEY },
            body: JSON.stringify({ scores: top })
        });
    } catch(e) { console.error('Leaderboard submit error:', e); }
}

async function showLeaderboard(mode = 'arcade') {
    const modal = document.getElementById('leaderboard-modal');
    const tbody = document.getElementById('leaderboard-tbody');
    const title = document.getElementById('leaderboard-title');
    modal.classList.remove('hidden');
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:20px;">⏳ Loading...</td></tr>`;

    // Update active filter button
    document.querySelectorAll('.lb-filter-btn').forEach(btn => {
        btn.style.opacity = btn.dataset.mode === mode ? '1' : '0.4';
    });

    const scores = await fetchScores();
    let filtered;
    if (mode === 'daily') {
        const today = new Date().toISOString().slice(0, 10);
        filtered = scores.filter(s => s.mode === 'daily' && s.date === today);
        title.innerText = `📅 Daily — ${today}`;
    } else {
        filtered = scores.filter(s => s.mode === 'arcade');
        title.innerText = '🏆 Arcade Leaderboard';
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:20px;">No scores yet!</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.slice(0, 20).map((s, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        const isMe = s.nick === playerNick;
        return `<tr style="${isMe ? 'color:#2ecc71;font-weight:bold;' : ''}">
            <td style="padding:6px 10px;">${medal}</td>
            <td style="padding:6px 10px;">${s.nick}</td>
            <td style="padding:6px 10px;text-align:right;">${s.score.toLocaleString()}</td>
            <td style="padding:6px 10px;color:#95a5a6;font-size:0.85rem;">${s.date}</td>
        </tr>`;
    }).join('');
}

function closeLeaderboard() {
    document.getElementById('leaderboard-modal').classList.add('hidden');
}
