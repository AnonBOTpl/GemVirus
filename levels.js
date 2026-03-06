// levels.js
const STORY_LEVELS = [
    { id: 1, moves: 15, iceCount: 0, targetScore: 800, targetIce: 0, desc_en: "Welcome! Score 800 points.", desc_pl: "Witaj! Zdobądź 800 punktów." },
    { id: 2, moves: 18, iceCount: 4, targetScore: 1000, targetIce: 4, desc_en: "Break the Ice blocks! Match next to them.", desc_pl: "Rozbij lód! Dopasuj owoce obok nich." },
    { id: 3, moves: 20, iceCount: 8, targetScore: 2000, targetIce: 8, desc_en: "Watch out! The Ice spreads if ignored!", desc_pl: "Uważaj! Lód zaraża jeśli go zignorujesz!" },
    { id: 4, moves: 20, iceCount: 0, targetScore: 4000, targetIce: 0, desc_en: "No Ice! Create Bombs (Match 4 or T-shape).", desc_pl: "Brak lodu! Twórz Bomby (Połącz 4 lub literę T)." },
    { id: 5, moves: 25, iceCount: 12, targetScore: 3000, targetIce: 12, desc_en: "Use Bombs to clear the Ice quickly!", desc_pl: "Użyj bomb, aby szybko wyczyścić lód!" },
    { id: 6, moves: 25, iceCount: 5, targetScore: 6000, targetIce: 5, desc_en: "Match 5 in a row to create Lightning ⚡!", desc_pl: "Połącz 5 w rzędzie by stworzyć Błyskawicę ⚡!" },
    { id: 7, moves: 15, iceCount: 15, targetScore: 2500, targetIce: 15, desc_en: "Heavy Infection! You have very few moves.", desc_pl: "Ciężka infekcja! Masz bardzo mało ruchów." },
    { id: 8, moves: 28, iceCount: 20, targetScore: 4500, targetIce: 20, desc_en: "It's taking over! Don't let the ice spread!", desc_pl: "Przejmuje kontrolę! Nie pozwól by lód się rozrósł!" },
    { id: 9, moves: 30, iceCount: 25, targetScore: 6000, targetIce: 25, desc_en: "Epic Combos needed! Try combining two Power-Ups!", desc_pl: "Epickie Combosy! Połącz dwa Power-Upy ze sobą!" },
    { id: 10, moves: 35, iceCount: 32, targetScore: 10000, targetIce: 32, desc_en: "BOSS LEVEL: Clear the frozen wasteland!", desc_pl: "BOSS: Oczyść te zamarznięte pustkowia!" },
    { id: 11, moves: 22, iceCount: 10, targetScore: 8000, targetIce: 10, desc_en: "Chapter 2 begins! Score big with combos.", desc_pl: "Rozdział 2! Zdobywaj punkty kombinacjami." },
    { id: 12, moves: 20, iceCount: 18, targetScore: 5000, targetIce: 18, desc_en: "Ice is everywhere! Prioritize breaking it.", desc_pl: "Lód wszędzie! Skup się na rozbijaniu." },
    { id: 13, moves: 18, iceCount: 0, targetScore: 12000, targetIce: 0, desc_en: "Score attack! No ice, just pure combos.", desc_pl: "Atak na punkty! Bez lodu, tylko combosy." },
    { id: 14, moves: 25, iceCount: 22, targetScore: 7000, targetIce: 22, desc_en: "The virus mutates — it spreads faster now!", desc_pl: "Wirus mutuje — teraz rozprzestrzenia się szybciej!" },
    { id: 15, moves: 30, iceCount: 15, targetScore: 15000, targetIce: 15, desc_en: "Halfway there! Score high AND clear the ice.", desc_pl: "Połowa drogi! Zdobądź dużo punktów I wyczyść lód." },
    { id: 16, moves: 20, iceCount: 28, targetScore: 6000, targetIce: 28, desc_en: "Near total freeze! You need Lightning fast.", desc_pl: "Prawie całkowite zamrożenie! Potrzebujesz Błyskawicy." },
    { id: 17, moves: 25, iceCount: 20, targetScore: 18000, targetIce: 20, desc_en: "Combo master required. Chain everything!", desc_pl: "Potrzebny mistrz combo. Łącz wszystko!" },
    { id: 18, moves: 15, iceCount: 30, targetScore: 8000, targetIce: 30, desc_en: "Nightmare mode! Few moves, massive infection.", desc_pl: "Koszmarny poziom! Mało ruchów, ogromna infekcja." },
    { id: 19, moves: 35, iceCount: 35, targetScore: 20000, targetIce: 35, desc_en: "Final stretch! Score 20k AND kill the virus.", desc_pl: "Ostatnia prosta! 20k punktów I wyeliminuj wirusa." },
    { id: 20, moves: 40, iceCount: 40, targetScore: 30000, targetIce: 40, desc_en: "🔥 FINAL BOSS: The virus fights back. End it!", desc_pl: "🔥 OSTATNI BOSS: Wirus odpowiada. Zniszcz go!" }
];
