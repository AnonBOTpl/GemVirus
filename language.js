// language.js
// Słownik tłumaczeń dla gry

const TRANSLATIONS = {
    en: {
        title_main: "GEM",
        title_sub: "VIRUS",
        select_mode: "Select Game Mode",
        story_mode: "📖 Story Mode",
        arcade_mode: "⏱️ Arcade Mode",
        relax_mode: "☕ Relax Mode",
        arcade_desc: "30 Moves - High Score",
        relax_desc: "Endless - No pressure",
        settings_btn: "⚙️ Settings",
        
        settings_title: "Settings",
        tile_theme: "Tile Theme:",
        theme_white: "White",
        theme_gray: "Gray",
        board_zoom: "Board Zoom:",
        sound_fx: "Sound Effects:",
        sound_on: "ON",
        sound_off: "OFF",
        language: "Language:",
        close_btn: "Close",
        
        menu_btn: "⬅ Menu",
        restart_btn: "Restart",
        
        score: "Score:",
        best: "Best:",
        combo: "Combo:",
        moves: "Moves:",
        goal: "Goal:",
        
        out_of_moves: "Out of Moves!",
        level_complete: "Level Complete!",
        level_failed: "Level Failed",
        final_score: "Your Final Score:",
        new_record: "New Record! 🎉",
        awesome_job: "Awesome job!",
        you_beat: "YOU BEAT THE GAME!",
        ran_out: "You ran out of moves.",
        
        play_again: "Play Again",
        next_level: "Next Level ➡",
        main_menu: "Main Menu",
        
        virus_text: "VIRUS!",
        lvl_text: "Level",
        shuffling: "NO MOVES! SHUFFLING...",
        max_level: "Record: Level",
        leaderboard_btn: "🏆 Leaderboard",
        stats_btn: "📊 My Stats",
        daily_btn: "📅 Daily Challenge",
        daily_play: "Play today's challenge!",
        level_progress: "Level"
    },
    pl: {
        title_main: "GEM",
        title_sub: "WIRUS",
        select_mode: "Wybierz Tryb Gry",
        story_mode: "📖 Fabuła",
        arcade_mode: "⏱️ Na Punkty",
        relax_mode: "☕ Relaks",
        arcade_desc: "30 Ruchów - Rekord",
        relax_desc: "Nieskończoność - Bez stresu",
        settings_btn: "⚙️ Ustawienia",
        
        settings_title: "Ustawienia",
        tile_theme: "Kolor Kafelków:",
        theme_white: "Biały",
        theme_gray: "Szary",
        board_zoom: "Powiększenie:",
        sound_fx: "Dźwięki:",
        sound_on: "WŁ",
        sound_off: "WYŁ",
        language: "Język:",
        close_btn: "Zamknij",
        
        menu_btn: "⬅ Menu",
        restart_btn: "Od Nowa",
        
        score: "Wynik:",
        best: "Rekord:",
        combo: "Mnożnik:",
        moves: "Ruchy:",
        goal: "Cel:",
        
        out_of_moves: "Koniec Ruchów!",
        level_complete: "Poziom Ukończony!",
        level_failed: "Poziom Przegrany",
        final_score: "Twój Wynik:",
        new_record: "Nowy Rekord! 🎉",
        awesome_job: "Świetna robota!",
        you_beat: "PRZESZEDŁEŚ GRĘ!",
        ran_out: "Skończyły Ci się ruchy.",
        
        play_again: "Zagraj Ponownie",
        next_level: "Następny Poziom ➡",
        main_menu: "Menu Główne",
        
        virus_text: "WIRUS!",
        lvl_text: "Poziom",
        shuffling: "BRAK RUCHÓW! TASOWANIE...",
        max_level: "Rekord: Poziom",
        leaderboard_btn: "🏆 Ranking",
        stats_btn: "📊 Moje Statystyki",
        daily_btn: "📅 Wyzwanie Dnia",
        daily_play: "Zagraj dzisiejsze wyzwanie!",
        level_progress: "Poziom"
    }
};

// Funkcja zwracająca przetłumaczony tekst
function t(key) {
    if(!settings || !settings.lang) return TRANSLATIONS['en'][key] || key;
    return TRANSLATIONS[settings.lang][key] || key;
}

// Aktualizuje wszystkie elementy z atrybutem data-i18n
function updateTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key === 'title') {
            el.innerHTML = t('title_main') + '<span>' + t('title_sub') + '</span>';
        } else {
            el.innerText = t(key);
        }
    });
    
    // Update dynamic text if in menu
    const lvlText = document.getElementById('level-progress-text');
    if (lvlText) {
        lvlText.innerText = `${t('lvl_text')} ${unlockedLevel}`;
    }
}