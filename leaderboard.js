// leaderboard.js
const JSONBIN_BIN_ID = '69ab414d43b1c97be9bb547b';
// Access Key (READ + UPDATE only — no DELETE, no CREATE).
// Nadal widoczny publicznie, ale nie pozwala skasowac bina ani grzebac w koncie.
// Docelowo: proxy serwerowe, zeby klucz w ogole nie trafial do klienta.
const JSONBIN_API_KEY = '$2a$10$UfCIixC6Mw9g7rX0XQoky.8JK8nFRBbFrdR2NF/coON/fBdonsDcK';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

let playerNick = localStorage.getItem('gemvirus_nick') || '';

// Zabezpieczenie XSS: zamienia znaki specjalne HTML na ich bezpieczne odpowiedniki,
// dzieki czemu nick gracza jest zawsze wyswietlany jako TEKST, a nigdy wykonywany
// jako kod. Uzywac ZAWSZE przy wstawianiu danych od gracza do innerHTML.
function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"'`=\/]/g, ch => ({
        '&': '&amp;',  '<': '&lt;',   '>': '&gt;',
        '"': '&quot;', "'": '&#39;',  '`': '&#96;',
        '=': '&#61;',  '/': '&#47;'
    })[ch]);
}

// Wynik moze przyjsc z sieci jako tekst - wymuszamy liczbe, zeby uniknac bledu
// przy formatowaniu i zeby nikt nie przemycil kodu w polu ze wynikiem.
function formatScore(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString() : '0';
}

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
            headers: { 'X-Access-Key': JSONBIN_API_KEY }
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
            headers: { 'Content-Type': 'application/json', 'X-Access-Key': JSONBIN_API_KEY },
            body: JSON.stringify({ scores: top })
        });
    } catch(e) { console.error('Leaderboard submit error:', e); }
}

async function showLeaderboard(mode = 'arcade') {
    const modal = document.getElementById('leaderboard-modal');
    const tbody = document.getElementById('leaderboard-tbody');
    const title = document.getElementById('leaderboard-title');
    modal.classList.remove('hidden');
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:20px;">${t('loading')}</td></tr>`;

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
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:20px;">${t('no_scores')}</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.slice(0, 20).map((s, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        const isMe = s.nick === playerNick;
        return `<tr style="${isMe ? 'color:#2ecc71;font-weight:bold;' : ''}">
            <td style="padding:6px 10px;">${medal}</td>
            <td style="padding:6px 10px;">${escapeHtml(s.nick)}</td>
            <td style="padding:6px 10px;text-align:right;">${formatScore(s.score)}</td>
            <td style="padding:6px 10px;color:#95a5a6;font-size:0.85rem;">${escapeHtml(s.date)}</td>
        </tr>`;
    }).join('');
}

function closeLeaderboard() {
    document.getElementById('leaderboard-modal').classList.add('hidden');
}
