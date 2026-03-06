// game.js
function updateDailyStatus() {
    const el = document.getElementById('daily-status-text');
    if (!el) return;
    if (hasDailyBeenPlayed()) {
        const s = getDailyScore();
        el.innerText = `✅ Done! Your score: ${s ? s.toLocaleString() : '?'}`;
        el.style.color = '#2ecc71';
    } else {
        el.innerText = "Play today's challenge!";
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

function startGameMode(mode, levelId = null) {
    if (mode === 'arcade' && !getNick()) {
        openNickModal(() => startGameMode(mode, levelId));
        return;
    }
    initAudio();
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
    while (findMatchGroups().length > 0) generateBoard(iceToSpawn);
    
    // Ensure initial board is not deadlocked
    while(getAvailableMoves().length === 0) {
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
        let rr = Math.floor(Math.random() * BOARD_SIZE);
        let cc = Math.floor(Math.random() * BOARD_SIZE);
        if (!iceBoard[rr][cc]) {
            iceBoard[rr][cc] = true;
            placed++;
        }
    }
}

function getRandomGem() {
    return GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
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
        const move = validMoves[Math.floor(Math.random() * validMoves.length)];
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
    
    // Warn if quitting a LIVE match (Arcade/Story)
    let shouldWarn = !isGameOver && (gameMode === 'story' || gameMode === 'arcade');
    
    // Also warn if they are in the post-game screen of Story mode and have made progress
    if (isGameOver && gameMode === 'story' && unlockedLevel > 1) {
        shouldWarn = true;
    }

    if (shouldWarn) {
        const confirmExit = confirm(t('language') === 'Polski' ? "Jesteś pewien? Stracisz postęp w grze/kampanii." : "Are you sure? You will lose your game/campaign progress.");
        if (!confirmExit) return;
    }

    if (gameMode === 'story') {
        unlockedLevel = 1;
    }

    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('gameplay-area').classList.add('hidden');
    document.getElementById('game-over-modal').classList.add('hidden');
    
    document.getElementById('level-progress-text').innerText = `${t('lvl_text')} ${unlockedLevel}`;
    document.getElementById('max-level-text').innerText = `${t('max_level')} ${maxLevelReached}`;
    updateDailyStatus();
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
document.getElementById('restart-btn').addEventListener('click', () => { document.getElementById('game-over-modal').classList.add('hidden'); startGameMode(gameMode, currentLevelData?.id); });
document.getElementById('play-again-btn').addEventListener('click', () => { startGameMode(gameMode, currentLevelData?.id); });
document.getElementById('next-level-btn').addEventListener('click', () => {
    document.getElementById('game-over-modal').classList.add('hidden');
    startGameMode('story', currentLevelData.id + 1);
});
document.getElementById('menu-btn').addEventListener('click', returnToMenu);
document.getElementById('menu-return-btn').addEventListener('click', returnToMenu);

document.addEventListener('DOMContentLoaded', () => {
    applySettings(); // Boot initial settings
});