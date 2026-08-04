// game.js
function updateDailyStatus() {
    const el = document.getElementById('daily-status-text');
    if (!el) return;
    if (hasDailyBeenPlayed()) {
        const s = getDailyScore();
        el.innerText = `${t('daily_done')} ${s ? formatScore(s) : '?'}`;
        el.style.color = '#2ecc71';
    } else {
        el.innerText = t('daily_play');
        el.style.color = '';
    }
}

function startDailyChallenge() {
    if (!getNick()) {
        openNickModal(() => startDailyChallenge());
        return;
    }
    if (hasDailyBeenPlayed()) {
        showLeaderboard('daily');
        return;
    }
    initDailyRng();
    startGameMode('daily');
}

// Przyspiesza koncowa detonacje power-upow. NIE pomija wybuchow - one nadal
// zachodza po kolei i naliczaja punkty tak samo, tylko animacje leca szybciej.
// Dzieki temu koncowy wynik jest identyczny, jakby gracz obejrzal calosc.
function skipEndgameAnimation() {
    animSpeed = 8;
    const btn = document.getElementById('skip-endgame-btn');
    if (btn) btn.classList.add('hidden');
}

function startGameMode(mode, levelId = null) {
    if (mode === 'arcade' && !getNick()) {
        openNickModal(() => startGameMode(mode, levelId));
        return;
    }
    initAudio();
    resetAnimSpeed(); // wracamy do normalnego tempa animacji i chowamy "Przyspiesz"
    gameMode = mode;
    score = 0;
    iceRemaining = 0;
    isGameOver = false;
    isProcessingSwap = false; 
    selectedTile = null;

    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('gameplay-area').classList.remove('hidden');
    document.getElementById('best-container').classList.add('hidden');
    document.getElementById('goal-container').classList.add('hidden');
    document.getElementById('level-counter-container').classList.add('hidden');
    
    let iceToSpawn = 0;

    if (mode === 'arcade') {
        movesLeft = STARTING_MOVES;
        iceToSpawn = 8; 
        document.getElementById('best-container').classList.remove('hidden');
        document.getElementById('best-display').innerText = bestScore;
    } 
    else if (mode === 'relax') {
        movesLeft = Infinity;
        iceToSpawn = 0; 
    }
    else if (mode === 'daily') {
        movesLeft = STARTING_MOVES;
        iceToSpawn = 10;
        currentLevelData = { id: 0, targetScore: 5000, targetIce: 10, virusSpawned: 0 };
        document.getElementById('goal-container').classList.remove('hidden');
    } 
    else if (mode === 'story') {
        const lvl = levelId || unlockedLevel;
        currentLevelData = STORY_LEVELS.find(l => l.id === lvl);
        if(!currentLevelData) currentLevelData = STORY_LEVELS[STORY_LEVELS.length-1]; 
        
        currentLevelData.virusSpawned = 0;
        
        movesLeft = currentLevelData.moves;
        iceToSpawn = currentLevelData.iceCount;
        
        document.getElementById('goal-container').classList.remove('hidden');
        document.getElementById('level-counter-container').classList.remove('hidden');
        document.getElementById('level-counter-display').innerText = `${currentLevelData.id}/${STORY_LEVELS.length}`;
        
        // Dynamically get the language specific description
        const descKey = `desc_${settings.lang}`;
        const descText = currentLevelData[descKey] || currentLevelData['desc_en'];
        
        setTimeout(() => createFloatingText(3, 3, descText, "ice-text"), 1000);
    }

    updateScoreUI(1); 
    generateBoard(iceToSpawn);
    while (findMatchGroups().length > 0 || getAvailableMoves().length === 0) {
        generateBoard(iceToSpawn);
    }
    
    createDOMBoard();
    resetHintTimer();
}

function generateBoard(iceCount) {
    board = [];
    iceBoard = [];
    iceRemaining = iceCount;

    for (let r = 0; r < BOARD_SIZE; r++) {
        let row = []; let iceRow = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
            row.push(getRandomGem());
            iceRow.push(false); 
        }
        board.push(row); iceBoard.push(iceRow);
    }

    let placed = 0;
    while(placed < iceCount) {
        let rr = Math.floor(getRand() * BOARD_SIZE);
        let cc = Math.floor(getRand() * BOARD_SIZE);
        if (!iceBoard[rr][cc]) {
            iceBoard[rr][cc] = true;
            placed++;
        }
    }
}

function getRandomGem() {
    return GEM_TYPES[Math.floor(getRand() * GEM_TYPES.length)];
}

function handleTileClick(clickedDomElement) {
    initAudio(); 
    resetHintTimer(); // User interacted, delay the hint
    if (isProcessingSwap || isGameOver) return; 

    const r = parseInt(clickedDomElement.dataset.row);
    const c = parseInt(clickedDomElement.dataset.col);
    const clickedTileCoords = { row: r, col: c };
    
    if (iceBoard[r][c]) {
        playSound('error');
        clickedDomElement.classList.add('shake');
        setTimeout(() => clickedDomElement.classList.remove('shake'), 300);
        return;
    }

    if (!selectedTile) {
        selectedTile = clickedTileCoords;
        highlightSelectedTile();
        playSound('click'); 
    } else {
        if (selectedTile.row === r && selectedTile.col === c) {
            selectedTile = null;
            clearHighlights();
            playSound('click'); 
        } else if (areAdjacent(selectedTile, clickedTileCoords)) {
            clearHighlights();
            playSound('swap'); 
            executeSwapAnimation(selectedTile, clickedTileCoords);
            selectedTile = null; 
        } else {
            selectedTile = clickedTileCoords;
            highlightSelectedTile();
            playSound('click');
        }
    }
}

// --- STEROWANIE PRZESUNIECIEM PALCA / MYSZA (swipe) ---
// Dziala OBOK dotychczasowego klikania - klik-klik nadal dziala tak samo.
// Zasada: zapamietujemy punkt startu, a po puszczeniu sprawdzamy, w ktora
// strone gracz pociagnal i zamieniamy klejnot z sasiadem w tym kierunku.
let swipeStart = null;
let swipeJustHappened = false; // blokuje klik doklejany przez przegladarke po gescie
const SWIPE_MIN_PX = 20; // ponizej tego traktujemy gest jako zwykly klik

function getSwipePoint(ev) {
    const p = (ev.changedTouches && ev.changedTouches[0]) || ev;
    return { x: p.clientX, y: p.clientY };
}

function onSwipeStart(ev, domTile) {
    if (isProcessingSwap || isGameOver) return;
    const p = getSwipePoint(ev);
    swipeStart = { x: p.x, y: p.y, tile: domTile };

    // Wizualne "zlapanie" klejnotu - obwodka pojawia sie od razu.
    const r = parseInt(domTile.dataset.row);
    const c = parseInt(domTile.dataset.col);
    if (!iceBoard[r][c]) domTile.classList.add('grabbed');
}

// Podglad kierunku w trakcie ciagniecia: slabsza obwodka na sasiedzie,
// w ktorego strone gracz aktualnie ciagnie.
function onSwipeMove(ev) {
    if (!swipeStart) return;
    const p = getSwipePoint(ev);
    const dx = p.x - swipeStart.x;
    const dy = p.y - swipeStart.y;

    clearSwipeTargetHighlight();
    if (Math.abs(dx) < SWIPE_MIN_PX && Math.abs(dy) < SWIPE_MIN_PX) return;

    const t = getSwipeTarget(swipeStart.tile, dx, dy);
    if (!t) return;
    const dom = document.querySelector(`.tile[data-row="${t.row}"][data-col="${t.col}"]`);
    if (dom) dom.classList.add('swipe-target');
}

// Wspolne dla podgladu i wykonania ruchu: sasiad w dominujacym kierunku.
function getSwipeTarget(startTile, dx, dy) {
    const r = parseInt(startTile.dataset.row);
    const c = parseInt(startTile.dataset.col);
    let target;
    if (Math.abs(dx) > Math.abs(dy)) {
        target = { row: r, col: c + (dx > 0 ? 1 : -1) };
    } else {
        target = { row: r + (dy > 0 ? 1 : -1), col: c };
    }
    if (target.row < 0 || target.row >= BOARD_SIZE) return null;
    if (target.col < 0 || target.col >= BOARD_SIZE) return null;
    if (iceBoard[target.row][target.col]) return null;
    return target;
}

function clearSwipeTargetHighlight() {
    document.querySelectorAll('.tile.swipe-target')
        .forEach(el => el.classList.remove('swipe-target'));
}

// Sprzata obie obwodki gestu (chwyt + podglad celu).
function clearSwipeHighlights() {
    document.querySelectorAll('.tile.grabbed')
        .forEach(el => el.classList.remove('grabbed'));
    clearSwipeTargetHighlight();
}

function onSwipeEnd(ev) {
    if (!swipeStart) return;
    const start = swipeStart;
    swipeStart = null;
    clearSwipeHighlights(); // obwodki znikaja z chwila puszczenia

    if (isProcessingSwap || isGameOver) return;

    const p = getSwipePoint(ev);
    const dx = p.x - start.x;
    const dy = p.y - start.y;

    // Za krotki ruch = to byl klik, obsluzy go handleTileClick.
    if (Math.abs(dx) < SWIPE_MIN_PX && Math.abs(dy) < SWIPE_MIN_PX) return;

    const r = parseInt(start.tile.dataset.row);
    const c = parseInt(start.tile.dataset.col);
    if (iceBoard[r][c]) {
        playSound('error');
        start.tile.classList.add('shake');
        setTimeout(() => start.tile.classList.remove('shake'), 300);
        return;
    }

    const target = getSwipeTarget(start.tile, dx, dy);
    if (!target) {
        playSound('error');
        return;
    }

    // Gest zastepuje ewentualne wczesniejsze zaznaczenie.
    swipeJustHappened = true;
    selectedTile = null;
    clearHighlights();
    resetHintTimer();
    playSound('swap');
    executeSwapAnimation({ row: r, col: c }, target);
}

// Podpinane do kazdego kafelka przy tworzeniu planszy.
function attachTileControls(tile) {
    tile.addEventListener('click', function() {
        // Po przesunieciu przegladarka i tak wysyla klik - ignorujemy go,
        // zeby gest nie zaznaczyl przy okazji kolejnego klejnotu.
        if (swipeJustHappened) { swipeJustHappened = false; return; }
        handleTileClick(this);
    });
    tile.addEventListener('pointerdown', function(ev) { onSwipeStart(ev, this); });
    tile.addEventListener('pointerup', onSwipeEnd);
    tile.addEventListener('pointercancel', () => { swipeStart = null; clearSwipeHighlights(); });
}

// --- OPTION 2: HINT SYSTEM ---
function resetHintTimer() {
    if (hintTimer) clearTimeout(hintTimer);
    
    // Remove any active hint visual
    document.querySelectorAll('.hint-active').forEach(el => el.classList.remove('hint-active'));
    
    // Set new timer for 5 seconds
    if (!isGameOver) {
        hintTimer = setTimeout(showHint, 5000);
    }
}

function showHint() {
    if (isProcessingSwap || isGameOver || selectedTile !== null) {
        resetHintTimer(); // Try again later if busy
        return;
    }
    
    const validMoves = getAvailableMoves(); // from logic.js
    if (validMoves.length > 0) {
        // Pick a random valid move to hint
        const move = validMoves[Math.floor(getRand() * validMoves.length)];
        const dom1 = domBoard[move[0].r][move[0].c];
        const dom2 = domBoard[move[1].r][move[1].c];
        
        if (dom1) dom1.classList.add('hint-active');
        if (dom2) dom2.classList.add('hint-active');
    }
}

function areAdjacent(tile1, tile2) {
    const rowDiff = Math.abs(tile1.row - tile2.row);
    const colDiff = Math.abs(tile1.col - tile2.col);
    return (rowDiff + colDiff) === 1;
}

function clearHighlights() {
    document.querySelectorAll('.tile.selected').forEach(t => t.classList.remove('selected'));
}

function highlightSelectedTile() {
    clearHighlights();
    if (selectedTile) {
        const domTile = domBoard[selectedTile.row][selectedTile.col];
        if (domTile) domTile.classList.add('selected');
    }
}

function returnToMenu() {
    initAudio();
    if (hintTimer) clearTimeout(hintTimer);
    
    // Ostrzegamy tylko o utracie TRWAJACEJ partii - postep kampanii jest juz
    // zapisywany, wiec powrot do menu go nie kasuje.
    let shouldWarn = !isGameOver && (gameMode === 'story' || gameMode === 'arcade');

    if (shouldWarn) {
        const confirmExit = confirm(t('confirm_quit'));
        if (!confirmExit) return;
    }

    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('gameplay-area').classList.add('hidden');
    document.getElementById('game-over-modal').classList.add('hidden');
    
    updateCampaignUI();
    updateDailyStatus();
}

// Odswieza teksty i widocznosc przycisku resetu na kafelku kampanii.
function updateCampaignUI() {
    document.getElementById('level-progress-text').innerText = `${t('lvl_text')} ${unlockedLevel}`;
    document.getElementById('max-level-text').innerText = `${t('max_level')} ${maxLevelReached}`;

    // Reset ma sens tylko wtedy, gdy jest co resetowac.
    const resetBtn = document.getElementById('reset-campaign-btn');
    if (resetBtn) resetBtn.classList.toggle('hidden', unlockedLevel <= 1);
}

// Reset kampanii z potwierdzeniem (przycisk w kafelku Story Mode).
function confirmResetCampaign(event) {
    // Kafelek jest przyciskiem startujacym gre - nie pozwalamy, zeby klikniecie
    // resetu odpalilo takze rozgrywke.
    if (event) event.stopPropagation();
    initAudio();
    if (confirm(t('confirm_reset'))) {
        resetCampaignProgress();
        updateCampaignUI();
    }
}

// --- SETTINGS LOGIC ---
function openSettings() {
    initAudio();
    document.getElementById('settings-modal').classList.remove('hidden');
    
    document.getElementById('setting-theme').value = settings.theme;
    document.getElementById('setting-zoom').value = settings.zoom;
    document.getElementById('setting-sound').value = settings.sound.toString();
    document.getElementById('setting-lang').value = settings.lang;
}

function closeSettings() {
    document.getElementById('settings-modal').classList.add('hidden');
}

function changeSetting(key, value) {
    settings[key] = value;
    saveSettings();
    applySettings();
}

function applySettings() {
    // Zoom
    document.body.classList.remove('zoom-1', 'zoom-2', 'zoom-3');
    document.body.classList.add(`zoom-${settings.zoom}`);
    
    // Theme
    document.body.classList.remove('theme-white', 'theme-gray');
    document.body.classList.add(`theme-${settings.theme}`);
    
    // Language
    updateTranslations();
}

// Boot up listeners
document.body.addEventListener('click', initAudio, { once: true });
// Puszczenie przycisku/palca poza plansza konczy gest - inaczej zostalby
// "zawieszony" i mieszal przy kolejnym ruchu.
document.addEventListener('pointerup', onSwipeEnd);
// Podglad kierunku - sledzimy globalnie, bo kursor w trakcie ciagniecia
// wychodzi poza kafelek, na ktorym gest sie zaczal.
document.addEventListener('pointermove', onSwipeMove);
document.getElementById('restart-btn').addEventListener('click', () => { document.getElementById('game-over-modal').classList.add('hidden'); startGameMode(gameMode, currentLevelData?.id); });
document.getElementById('play-again-btn').addEventListener('click', () => { document.getElementById('game-over-modal').classList.add('hidden'); startGameMode(gameMode, currentLevelData?.id); });
document.getElementById('next-level-btn').addEventListener('click', () => {
    document.getElementById('game-over-modal').classList.add('hidden');
    startGameMode('story', currentLevelData.id + 1);
});
document.getElementById('menu-btn').addEventListener('click', returnToMenu);
document.getElementById('menu-return-btn').addEventListener('click', returnToMenu);

document.addEventListener('DOMContentLoaded', () => {
    applySettings(); // Boot initial settings
    updateCampaignUI(); // Pokaz zapisany postep i ewentualny przycisk resetu
});