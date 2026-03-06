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
            launchConfetti();
        }
        recordGameStat('arcade', score);
        if (score > 0) {
            submitScore(getNick(), score, 'arcade');
        }
    } else if (gameMode === 'story') {
        if (isVictory) {
            playSound('match', 3); 
            title.innerText = t('level_complete');
            title.style.color = "#2ecc71";
            subtitle.innerText = t('awesome_job');
            launchConfetti();
            recordGameStat('story', score, true);
            
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
    
    if (gameMode === 'daily') {
        playSound('match', 3);
        title.innerText = '📅 Daily Complete!';
        title.style.color = '#e67e22';
        subtitle.innerText = 'Daily challenge finished!';
        launchConfetti();
        markDailyPlayed(score);
        recordGameStat('daily', score);
        submitScore(getNick(), score, 'daily');
    }

    modal.classList.remove('hidden');
}
// ── CONFETTI ──────────────────────────────────────────────────────
function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = 'block';

    const colors = ['#e74c3c','#2ecc71','#3498db','#f39c12','#9b59b6','#1abc9c','#e67e22'];
    const pieces = Array.from({length: 120}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        w: 8 + Math.random() * 8,
        h: 5 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4
    }));

    let frame = 0;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
            ctx.restore();
            p.x += p.vx; p.y += p.vy; p.angle += p.spin;
        });
        frame++;
        if (frame < 180) requestAnimationFrame(draw);
        else canvas.style.display = 'none';
    }
    draw();
}
