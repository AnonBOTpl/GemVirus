// globals.js
const BOARD_SIZE = 8;
const STARTING_MOVES = 30;
const GEM_TYPES = ['\uD83C\uDF4E', '\uD83D\uDC8E', '\uD83C\uDF47', '\uD83C\uDF4B', '\uD83C\uDF52']; 

let board = []; 
let iceBoard = []; 
let domBoard = []; 

let selectedTile = null;
let isProcessingSwap = false; 
let isGameOver = false; 

let gameMode = 'menu'; 
let score = 0;
let movesLeft = 0;

let bestScore = localStorage.getItem('match3_bestScore') || 0; 
// Postep kampanii jest teraz TRWALY - zapisywany w localStorage, zeby powrot do
// menu ani zamkniecie strony go nie kasowaly.
// Migracja: gracze sprzed tej zmiany maja zapisany tylko 'match3_maxLevel'
// (rekord) - traktujemy go jako punkt startowy, zeby nikt nie stracil postepu.
let maxLevelReached = parseInt(localStorage.getItem('match3_maxLevel')) || 1;
let unlockedLevel = parseInt(localStorage.getItem('match3_unlockedLevel')) || maxLevelReached || 1;

function saveCampaignProgress() {
    localStorage.setItem('match3_unlockedLevel', unlockedLevel);
    localStorage.setItem('match3_maxLevel', maxLevelReached);
}

// Reset kampanii - gracz zaczyna fabule od poczatku.
// Rekord (maxLevelReached) celowo ZOSTAJE, to pamiatka osiagniecia.
function resetCampaignProgress() {
    unlockedLevel = 1;
    localStorage.setItem('match3_unlockedLevel', 1);
}
let currentLevelData = null;

let iceBrokenThisTurn = 0;
let iceRemaining = 0;

let hintTimer = null; // Timer for Hint System

// Zapis i odczyt ustawień
let settings = JSON.parse(localStorage.getItem('match3_settings')) || {
    theme: 'white', 
    zoom: 1, 
    sound: true, 
    lang: 'en' 
};

function saveSettings() {
    localStorage.setItem('match3_settings', JSON.stringify(settings));
}

function getRand() {
    if (gameMode === 'daily' && typeof getDailyRandom === 'function') {
        return getDailyRandom();
    }
    return Math.random();
}
