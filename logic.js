// logic.js
function findMatchGroups() {
    let horizontalLines = []; let verticalLines = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        let matchLen = 1;
        for (let c = 0; c < BOARD_SIZE; c++) {
            let current = getBase(board[r][c]);
            let next = c < BOARD_SIZE - 1 ? getBase(board[r][c+1]) : null;
            if (current !== null && current === next && getPower(board[r][c]) !== 'color') { matchLen++; } 
            else {
                if (matchLen >= 3) {
                    let coords = []; for(let i=0; i<matchLen; i++) coords.push({r, c: c - i});
                    horizontalLines.push({ color: current, coords: coords, isHorizontal: true, isVertical: false });
                }
                matchLen = 1;
            }
        }
    }
    for (let c = 0; c < BOARD_SIZE; c++) {
        let matchLen = 1;
        for (let r = 0; r < BOARD_SIZE; r++) {
            let current = getBase(board[r][c]);
            let next = r < BOARD_SIZE - 1 ? getBase(board[r+1][c]) : null;
            if (current !== null && current === next && getPower(board[r][c]) !== 'color') { matchLen++; } 
            else {
                if (matchLen >= 3) {
                    let coords = []; for(let i=0; i<matchLen; i++) coords.push({r: r - i, c});
                    verticalLines.push({ color: current, coords: coords, isHorizontal: false, isVertical: true });
                }
                matchLen = 1;
            }
        }
    }

    let lines = [...horizontalLines, ...verticalLines];
    let groups = [];
    while(lines.length > 0) {
        let currentLine = lines.pop();
        let merged = true; let isIntersection = false;
        currentLine.maxStraightLine = currentLine.coords.length;

        while(merged) {
            merged = false;
            for(let i = 0; i < lines.length; i++) {
                if(lines[i].color === currentLine.color && currentLine.coords.some(c1 => lines[i].coords.some(c2 => c1.r===c2.r && c1.c===c2.c))) {
                    if ((currentLine.isHorizontal && lines[i].isVertical) || (currentLine.isVertical && lines[i].isHorizontal) || isIntersection) isIntersection = true;
                    if (lines[i].coords.length > currentLine.maxStraightLine) currentLine.maxStraightLine = lines[i].coords.length;
                    currentLine.coords = [...currentLine.coords, ...lines[i].coords];
                    lines.splice(i, 1);
                    merged = true; break;
                }
            }
        }
        currentLine.coords = currentLine.coords.filter((v, i, a) => a.findIndex(t => (t.r === v.r && t.c === v.c)) === i);
        currentLine.powerToSpawn = null;
        if (currentLine.maxStraightLine >= 5) currentLine.powerToSpawn = 'color'; 
        else if (isIntersection) currentLine.powerToSpawn = 'cross'; 
        else if (currentLine.maxStraightLine === 4) currentLine.powerToSpawn = 'bomb';  
        groups.push(currentLine);
    }
    return groups;
}

function executeSwapAnimation(tile1, tile2) {
    isProcessingSwap = true; 
    iceBrokenThisTurn = 0; 

    const gem1 = board[tile1.row][tile1.col];
    const gem2 = board[tile2.row][tile2.col];
    board[tile1.row][tile1.col] = gem2; board[tile2.row][tile2.col] = gem1;
    const dom1 = domBoard[tile1.row][tile1.col]; const dom2 = domBoard[tile2.row][tile2.col];
    domBoard[tile1.row][tile1.col] = dom2; domBoard[tile2.row][tile2.col] = dom1;
    updateTilePosition(dom1, tile2.row, tile2.col); updateTilePosition(dom2, tile1.row, tile1.col);

    setTimeout(() => {
        let p1 = getPower(gem1); let p2 = getPower(gem2);
        const groups = findMatchGroups();

        if (p1 !== 'none' && p2 !== 'none') {
            if(gameMode !== 'relax') movesLeft--;
            updateScoreUI(1); handleEpicCombo(tile1, tile2, gem1, gem2); return; 
        }

        let isColorBombSwap = false; let targetColor = null; let bombCoord = null;
        if (p2 === 'color' && getBase(gem1) !== null) { isColorBombSwap = true; targetColor = getBase(gem1); bombCoord = tile1; } 
        else if (p1 === 'color' && getBase(gem2) !== null) { isColorBombSwap = true; targetColor = getBase(gem2); bombCoord = tile2; }

        if (groups.length > 0 || isColorBombSwap) {
            if(gameMode !== 'relax') movesLeft--;
            updateScoreUI(1);
            if (isColorBombSwap) {
                playSound('electric'); let colorCoords = [];
                for(let r=0; r<BOARD_SIZE; r++) for(let c=0; c<BOARD_SIZE; c++) {
                    if (getBase(board[r][c]) === targetColor || (r===bombCoord.row && c===bombCoord.col)) colorCoords.push({r,c});
                }
                groups.push({ color: 'color_bomb', coords: colorCoords, isColorBombTrigger: true });
            }
            processDestruction(groups, 1, [tile1, tile2]);
        } else {
            playSound('error'); 
            board[tile1.row][tile1.col] = gem1; board[tile2.row][tile2.col] = gem2;
            domBoard[tile1.row][tile1.col] = dom1; domBoard[tile2.row][tile2.col] = dom2;
            updateTilePosition(dom1, tile1.row, tile1.col); updateTilePosition(dom2, tile2.row, tile2.col);
            dom1.classList.add('shake'); dom2.classList.add('shake');
            setTimeout(() => { dom1.classList.remove('shake'); dom2.classList.remove('shake'); isProcessingSwap = false; }, 300); 
        }
    }, 300);
}

function handleEpicCombo(tile1, tile2, gem1, gem2) {
    playSound('electric'); 
    let p1 = getPower(gem1); let p2 = getPower(gem2);
    let group = { color: 'epic', coords: [], isEpicTrigger: true };

    if (p1 === 'color' && p2 === 'color') {
        for(let r=0; r<BOARD_SIZE; r++) for(let c=0; c<BOARD_SIZE; c++) group.coords.push({r,c});
        createFloatingText(tile2.row, tile2.col, "ARMAGEDDON!");
    } 
    else if ((p1 === 'color' && (p2 === 'bomb' || p2 === 'cross')) || (p2 === 'color' && (p1 === 'bomb' || p1 === 'cross'))) {
        let counts = {};
        for(let r=0; r<BOARD_SIZE; r++) for(let c=0; c<BOARD_SIZE; c++) { let b = getBase(board[r][c]); if (b && getPower(board[r][c]) === 'none') counts[b] = (counts[b]||0)+1; }
        let targetColor = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, GEM_TYPES[0]);
        let powerupToSpawn = p1 === 'color' ? p2 : p1; 
        group.coords.push({r: tile1.row, c: tile1.col}, {r: tile2.row, c: tile2.col});
        for(let r=0; r<BOARD_SIZE; r++) for(let c=0; c<BOARD_SIZE; c++) {
            if (getBase(board[r][c]) === targetColor) { board[r][c] = `${targetColor}-${powerupToSpawn}`; applyGemVisuals(domBoard[r][c], r, c); group.coords.push({r,c}); }
        }
        createFloatingText(tile2.row, tile2.col, "INFECTION!");
    }
    else if (p1 === 'bomb' && p2 === 'bomb') {
        for(let r=tile2.row-2; r<=tile2.row+2; r++) for(let c=tile2.col-2; c<=tile2.col+2; c++) group.coords.push({r,c});
        createFloatingText(tile2.row, tile2.col, "BIG BOMB!");
    }
    else if (p1 === 'cross' && p2 === 'cross') {
        for(let i=0; i<BOARD_SIZE; i++) {
            group.coords.push({r: tile2.row, c: i}); group.coords.push({r: i, c: tile2.col});
            if (tile2.row - 1 >= 0) group.coords.push({r: tile2.row - 1, c: i}); if (tile2.row + 1 < BOARD_SIZE) group.coords.push({r: tile2.row + 1, c: i});
            if (tile2.col - 1 >= 0) group.coords.push({r: i, c: tile2.col - 1}); if (tile2.col + 1 < BOARD_SIZE) group.coords.push({r: i, c: tile2.col + 1});
        }
        createFloatingText(tile2.row, tile2.col, "MEGA CROSS!");
    }
    else if ((p1 === 'bomb' && p2 === 'cross') || (p1 === 'cross' && p2 === 'bomb')) {
        for(let i=0; i<BOARD_SIZE; i++) {
            group.coords.push({r: tile2.row, c: i}); group.coords.push({r: i, c: tile2.col});
            if (tile2.row - 1 >= 0) group.coords.push({r: tile2.row - 1, c: i}); if (tile2.row + 1 < BOARD_SIZE) group.coords.push({r: tile2.row + 1, c: i});
            if (tile2.col - 1 >= 0) group.coords.push({r: i, c: tile2.col - 1}); if (tile2.col + 1 < BOARD_SIZE) group.coords.push({r: i, c: tile2.col + 1});
        }
        createFloatingText(tile2.row, tile2.col, "COMBO BOMB!");
    }
    setTimeout(() => { processDestruction([group], 1, []); }, 400);
}

function processDestruction(groups, comboMultiplier, swapCoords = []) {
    let pendingSpawns = []; let initialDestroyCoords = []; let iceToBreak = new Set();
    groups.forEach(group => {
        group.coords.forEach(coord => {
            const neighbors = [{r: coord.r-1, c: coord.c}, {r: coord.r+1, c: coord.c}, {r: coord.r, c: coord.c-1}, {r: coord.r, c: coord.c+1}];
            neighbors.forEach(n => { if(n.r>=0 && n.r<BOARD_SIZE && n.c>=0 && n.c<BOARD_SIZE && iceBoard[n.r][n.c]) iceToBreak.add(`${n.r},${n.c}`); });
        });
    });

    groups.forEach(group => {
        let spawnCoord = group.coords[0]; 
        if (swapCoords.length > 0) {
            const intersection = group.coords.find(c => (c.r === swapCoords[0].row && c.c === swapCoords[0].col) || (c.r === swapCoords[1].row && c.c === swapCoords[1].col));
            if (intersection) spawnCoord = intersection;
        }
        if (!group.isColorBombTrigger && !group.isEpicTrigger && group.powerToSpawn) {
             pendingSpawns.push({ r: spawnCoord.r, c: spawnCoord.c, gem: group.powerToSpawn === 'color' ? '⚡-color' : `${group.color}-${group.powerToSpawn}` });
        }
        initialDestroyCoords.push(...group.coords);
    });

    let queue = [...initialDestroyCoords]; let destroyedSet = new Set(); let finalDestroyList = [];

    while(queue.length > 0) {
        let current = queue.shift();
        if (current.r < 0 || current.r >= BOARD_SIZE || current.c < 0 || current.c >= BOARD_SIZE) continue;
        let key = `${current.r},${current.c}`;
        if (destroyedSet.has(key)) continue; 
        if (iceBoard[current.r][current.c]) { iceToBreak.add(key); destroyedSet.add(key); continue; }
        if (board[current.r][current.c] === null) continue; 
        
        destroyedSet.add(key); finalDestroyList.push(current);
        let power = getPower(board[current.r][current.c]);
        
        if (power === 'bomb') { playSound('explosion'); for(let rr = current.r - 1; rr <= current.r + 1; rr++) for(let cc = current.c - 1; cc <= current.c + 1; cc++) queue.push({r: rr, c: cc}); } 
        else if (power === 'cross') { playSound('explosion'); for(let i = 0; i < BOARD_SIZE; i++) { queue.push({r: current.r, c: i}); queue.push({r: i, c: current.c}); } } 
        else if (power === 'color') { playSound('electric'); let randomColor = GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)]; for(let r=0; r<BOARD_SIZE; r++) for(let c=0; c<BOARD_SIZE; c++) if (getBase(board[r][c]) === randomColor) queue.push({r,c}); }
    }

    if (iceToBreak.size > 0) {
        playSound('ice');
        iceBrokenThisTurn += iceToBreak.size; 
        iceToBreak.forEach(key => {
            let r = parseInt(key.split(',')[0]); let c = parseInt(key.split(',')[1]);
            iceBoard[r][c] = false; iceRemaining--;
            const domTile = domBoard[r][c];
            if (domTile) { domTile.classList.add('ice-break'); setTimeout(() => { domTile.classList.remove('ice-break'); applyGemVisuals(domTile, r, c); }, 300); }
            score += 50; createFloatingText(r, c, "+50", "ice-text");
        });
    }

    const pointsEarned = finalDestroyList.length * 10 * comboMultiplier; score += pointsEarned;
    updateScoreUI(comboMultiplier); playSound('match', comboMultiplier);
    if (finalDestroyList.length > 0 && pointsEarned > 0) {
        let centerR = Math.floor(finalDestroyList.reduce((acc, val) => acc + val.r, 0) / finalDestroyList.length); let centerC = Math.floor(finalDestroyList.reduce((acc, val) => acc + val.c, 0) / finalDestroyList.length);
        createFloatingText(centerR, centerC, `+${pointsEarned}`);
    }

    finalDestroyList.forEach(coord => {
        board[coord.r][coord.c] = null;
        const domTile = domBoard[coord.r][coord.c];
        if (domTile) { domTile.classList.add('fade-out'); setTimeout(() => { domTile.remove(); }, 300); }
        domBoard[coord.r][coord.c] = null;
    });

    pendingSpawns.forEach(spawn => {
        board[spawn.r][spawn.c] = spawn.gem; 
        const tile = document.createElement('div'); applyGemVisuals(tile, spawn.r, spawn.c); 
        tile.addEventListener('click', function() { handleTileClick(this); });
        document.getElementById('game-board').appendChild(tile); domBoard[spawn.r][spawn.c] = tile;
        updateTilePosition(tile, spawn.r, spawn.c); tile.style.transform = 'scale(0)'; setTimeout(() => { tile.style.transform = 'scale(1)'; }, 50);
    });

    setTimeout(() => { applyGravity(); setTimeout(() => { spawnNewGems();
        setTimeout(() => {
            const cascadeGroups = findMatchGroups();
            if (cascadeGroups.length > 0) {
                processDestruction(cascadeGroups, comboMultiplier + 1);
            } else {
                setTimeout(() => {
                    updateScoreUI(1); 
                    if (gameMode !== 'relax' && iceBrokenThisTurn === 0 && iceRemaining > 0) {
                        spreadVirusIce();
                        updateScoreUI(1);
                    }
                    checkWinLossConditions();
                    
                    // Option 1: Check for deadlock after everything settles (only if game isn't over)
                    if (!isGameOver) {
                        checkDeadlockAndShuffle();
                    }
                }, 500); 
            }
        }, 350); 
    }, 350); }, 300);
}

function spreadVirusIce() {
    let candidates = [];
    for(let r=0; r<BOARD_SIZE; r++) {
        for(let c=0; c<BOARD_SIZE; c++) {
            if (iceBoard[r][c]) {
                const neighbors = [{r: r-1, c}, {r: r+1, c}, {r, c: c-1}, {r, c: c+1}];
                neighbors.forEach(n => {
                    if(n.r>=0 && n.r<BOARD_SIZE && n.c>=0 && n.c<BOARD_SIZE && !iceBoard[n.r][n.c] && board[n.r][n.c] !== null) {
                        candidates.push(n);
                    }
                });
            }
        }
    }
    if (candidates.length > 0) {
        let target = candidates[Math.floor(Math.random() * candidates.length)];
        iceBoard[target.r][target.c] = true;
        iceRemaining++;
        
        if (gameMode === 'story' && currentLevelData && currentLevelData.targetIce > 0) {
            if (!currentLevelData.virusSpawned) currentLevelData.virusSpawned = 0;
            currentLevelData.virusSpawned++;
        }

        playSound('error'); 
        const domTile = domBoard[target.r][target.c];
        applyGemVisuals(domTile, target.r, target.c);
        domTile.classList.add('shake');
        createFloatingText(target.r, target.c, t('virus_text'), "ice-text");
    }
}

function checkWinLossConditions() {
    let win = false;
    let lose = false;

    if (gameMode === 'story' && currentLevelData) {
        let scoreMet = score >= currentLevelData.targetScore;
        let iceMet = currentLevelData.targetIce === 0 || iceRemaining === 0; 
        if (scoreMet && iceMet) win = true;
        else if (movesLeft <= 0) lose = true;
    } 
    else if (gameMode === 'arcade' || gameMode === 'daily') {
        if (movesLeft <= 0) lose = true;
    }

    if (win) showGameOver(true);
    else if (lose) showGameOver(false);
    else isProcessingSwap = false; 
}

function applyGravity() {
    for (let c = 0; c < BOARD_SIZE; c++) {
        for (let r = BOARD_SIZE - 1; r >= 0; r--) {
            if (board[r][c] === null && !iceBoard[r][c]) {
                for (let rAbove = r - 1; rAbove >= 0; rAbove--) {
                    if (board[rAbove][c] !== null && !iceBoard[rAbove][c]) {
                        board[r][c] = board[rAbove][c]; board[rAbove][c] = null;
                        const fallingDom = domBoard[rAbove][c]; domBoard[r][c] = fallingDom; domBoard[rAbove][c] = null;
                        updateTilePosition(fallingDom, r, c); break;
                    }
                }
            }
        }
    }
}

function spawnNewGems() {
    const boardElement = document.getElementById('game-board');
    for (let c = 0; c < BOARD_SIZE; c++) {
        for (let r = 0; r < BOARD_SIZE; r++) {
            if (board[r][c] === null && !iceBoard[r][c]) {
                const newGem = getRandomGem(); board[r][c] = newGem;
                const tile = document.createElement('div'); applyGemVisuals(tile, r, c);
                tile.addEventListener('click', function() { handleTileClick(this); });
                tile.style.top = `${(r - BOARD_SIZE) * 12.5}%`; tile.style.left = `${c * 12.5}%`;
                boardElement.appendChild(tile); domBoard[r][c] = tile;
                tile.offsetHeight; updateTilePosition(tile, r, c);
            }
        }
    }
}

// --- OPTION 1 & 2: HINTS AND SHUFFLING LOGIC ---

// Clones the board to simulate a swap without touching real data
function simulateSwapAndCheckMatch(r1, c1, r2, c2) {
    if (r1 < 0 || r1 >= BOARD_SIZE || c1 < 0 || c1 >= BOARD_SIZE ||
        r2 < 0 || r2 >= BOARD_SIZE || c2 < 0 || c2 >= BOARD_SIZE) return false;
    
    // Cannot swap ice
    if (iceBoard[r1][c1] || iceBoard[r2][c2]) return false;
    
    let gem1 = board[r1][c1];
    let gem2 = board[r2][c2];
    
    // Any powerup direct swap is a valid move (Epic Combo)
    if (getPower(gem1) !== 'none' && getPower(gem2) !== 'none') return true;
    
    // Color bomb swap is always valid if the other is a base gem
    if ((getPower(gem1) === 'color' && getBase(gem2) !== null) || (getPower(gem2) === 'color' && getBase(gem1) !== null)) return true;

    // Temporarily swap
    board[r1][c1] = gem2;
    board[r2][c2] = gem1;
    
    // Check if matches exist
    let groups = findMatchGroups();
    
    // Revert swap
    board[r1][c1] = gem1;
    board[r2][c2] = gem2;
    
    return groups.length > 0;
}

// Finds all valid moves currently on the board
function getAvailableMoves() {
    let validMoves = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            // Check right neighbor
            if (c < BOARD_SIZE - 1 && simulateSwapAndCheckMatch(r, c, r, c+1)) {
                validMoves.push([{r,c}, {r, c: c+1}]);
            }
            // Check bottom neighbor
            if (r < BOARD_SIZE - 1 && simulateSwapAndCheckMatch(r, c, r+1, c)) {
                validMoves.push([{r,c}, {r: r+1, c}]);
            }
        }
    }
    return validMoves;
}

function checkDeadlockAndShuffle() {
    let moves = getAvailableMoves();
    if (moves.length === 0) {
        // No moves left! Shuffle the board!
        isProcessingSwap = true;
        createFloatingText(3, 3, t('shuffling'), "combo-active");
        playSound('explosion');
        
        setTimeout(() => {
            shuffleBoard();
        }, 1000);
    }
}

function shuffleBoard() {
    // Collect all movable gems
    let movableGems = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (!iceBoard[r][c] && board[r][c] !== null) {
                movableGems.push(board[r][c]);
            }
        }
    }
    
    // Fisher-Yates shuffle
    for (let i = movableGems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [movableGems[i], movableGems[j]] = [movableGems[j], movableGems[i]];
    }
    
    // Put them back
    let i = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (!iceBoard[r][c] && board[r][c] !== null) {
                board[r][c] = movableGems[i++];
            }
        }
    }
    
    // Re-render and re-position visually
    createDOMBoard(); 
    
    // If the shuffle created matches or STILL has no moves, resolve it
    const matches = findMatchGroups();
    if (matches.length > 0) {
        // Automatically destroy the matches created by shuffle
        setTimeout(() => { processDestruction(matches, 1); }, 500);
    } else {
        // If still no moves after shuffle (very rare), shuffle again
        if (getAvailableMoves().length === 0) {
             setTimeout(shuffleBoard, 500);
        } else {
             isProcessingSwap = false;
        }
    }
}