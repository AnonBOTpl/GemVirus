// visuals.js
function createFloatingText(r, c, text, colorClass = '') {
    const boardElement = document.getElementById('game-board');
    const floatEl = document.createElement('div');
    floatEl.classList.add('floating-text');
    if (colorClass) floatEl.classList.add(colorClass);
    floatEl.innerText = text;
    floatEl.style.top = `${(r * 12.5) + 6.25}%`; 
    floatEl.style.left = `${(c * 12.5) + 6.25}%`;
    boardElement.appendChild(floatEl);
    setTimeout(() => floatEl.remove(), 1200);
}

function getBase(gemStr) { return gemStr ? gemStr.split('-')[0] : null; }
function getPower(gemStr) { return gemStr && gemStr.includes('-') ? gemStr.split('-')[1] : 'none'; }

function applyGemVisuals(tileDom, r, c) {
    const gemString = board[r][c];
    const isFrozen = iceBoard[r][c];
    
    if (!gemString) {
        tileDom.textContent = '';
        tileDom.className = 'tile';
        return;
    }
    const base = getBase(gemString);
    const power = getPower(gemString);
    
    tileDom.className = 'tile'; 
    if (isFrozen) tileDom.classList.add('frozen'); 
    
    if (power === 'color') {
        tileDom.textContent = '⚡';
        tileDom.classList.add('power-color');
    } else {
        tileDom.textContent = base;
        if (power === 'bomb') tileDom.classList.add('power-bomb');
        if (power === 'cross') tileDom.classList.add('power-cross');
    }
}

function createDOMBoard() {
    const boardElement = document.getElementById('game-board');
    boardElement.innerHTML = ''; 
    domBoard = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
        let domRow = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
            const tile = document.createElement('div');
            applyGemVisuals(tile, r, c);
            tile.addEventListener('click', function() { handleTileClick(this); });
            boardElement.appendChild(tile);
            domRow.push(tile);
            updateTilePosition(tile, r, c);
        }
        domBoard.push(domRow);
    }
}

function updateTilePosition(tileDom, row, col) {
    if (!tileDom) return;
    tileDom.dataset.row = row;
    tileDom.dataset.col = col;
    tileDom.style.top = `${row * 12.5}%`;
    tileDom.style.left = `${col * 12.5}%`;
}

function updateScoreUI(currentCombo) {
    document.getElementById('score-display').innerText = score;
    
    const comboElement = document.getElementById('combo-display');
    comboElement.innerText = `${currentCombo}x`;
    if (currentCombo > 1) comboElement.classList.add('combo-active');
    else comboElement.classList.remove('combo-active');
    
    const movesElement = document.getElementById('moves-display');
    if (gameMode === 'relax') {
        movesElement.innerText = "∞";
        movesElement.classList.remove('low-moves');
    } else {
        movesElement.innerText = movesLeft;
        if (movesLeft <= 5 && movesLeft > 0) movesElement.classList.add('low-moves');
        else movesElement.classList.remove('low-moves');
    }
    
    if (gameMode === 'story' && currentLevelData) {
        let goalText = "";
        
        if (currentLevelData.targetScore > 0) {
            goalText += `${score}/${currentLevelData.targetScore} `;
        }
        
        if (currentLevelData.targetIce > 0) {
            let totalIceEverExisted = currentLevelData.targetIce + (currentLevelData.virusSpawned || 0);
            let iceDestroyed = totalIceEverExisted - iceRemaining;
            if (iceDestroyed < 0) iceDestroyed = 0; 
            goalText += `🧊 ${iceDestroyed}/${totalIceEverExisted}`;
        }
        
        document.getElementById('goal-display').innerText = goalText;
    }
}

function showGameOver(isVictory = false) {
    isGameOver = true;
    isProcessingSwap = true; 
    
    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('end-title');
    const subtitle = document.getElementById('end-subtitle');
    const recordMsg = document.getElementById('new-record-msg');
    const playBtn = document.getElementById('play-again-btn');
    const nextBtn = document.getElementById('next-level-btn');
    
    document.getElementById('final-score-display').innerText = score;
    recordMsg.classList.add('hidden');
    nextBtn.classList.add('hidden');
    playBtn.classList.remove('hidden');
    
    if (gameMode === 'arcade') {
        playSound('gameover');
        title.innerText = t('out_of_moves');
        title.style.color = "#e74c3c";
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('match3_bestScore', bestScore);
            document.getElementById('best-display').innerText = bestScore;
            recordMsg.classList.remove('hidden');
        }
    } else if (gameMode === 'story') {
        if (isVictory) {
            playSound('match', 3); 
            title.innerText = t('level_complete');
            title.style.color = "#2ecc71";
            subtitle.innerText = t('awesome_job');
            
            if (currentLevelData.id === unlockedLevel && STORY_LEVELS.length > unlockedLevel) {
                unlockedLevel++;
                
                // Option 4: Save max level reached
                if (unlockedLevel > maxLevelReached) {
                    maxLevelReached = unlockedLevel;
                    localStorage.setItem('match3_maxLevel', maxLevelReached);
                }
            }
            
            if (currentLevelData.id < STORY_LEVELS.length) {
                nextBtn.classList.remove('hidden');
                playBtn.classList.add('hidden');
            } else {
                subtitle.innerText = t('you_beat');
            }
        } else {
            playSound('gameover');
            title.innerText = t('level_failed');
            title.style.color = "#e74c3c";
            subtitle.innerText = t('ran_out');
        }
    }
    
    modal.classList.remove('hidden');
}