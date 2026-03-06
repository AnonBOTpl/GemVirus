<div align="center">
  <h1>💎 GemVirus</h1>
  <p>A highly polished, dependency-free vanilla JavaScript Match-3 puzzle game featuring a spreading ice virus, epic power-up combinations, and an integrated Web Audio API synthesizer.</p>

  <a href="https://AnonBOTpl.github.io/GemVirus/">
    <img src="https://img.shields.io/badge/🎮%20PLAY%20THE%20GAME-Click%20Here-2ecc71?style=for-the-badge" alt="Play the Game" />
  </a>
  <br><br>
  
  <p>
    <a href="README_PL.md">🇵🇱 Przeczytaj po polsku (Polish Version)</a>
  </p>
</div>

---

<p align="center"><img src="https://github.com/AnonBOTpl/GemVirus/blob/main/screen.png" alt="GemVirus Gameplay" width="80%"></p>

## 🌟 Features

- **No Dependencies:** Built entirely with pure HTML5, CSS3, and Vanilla JS. No React, no external libraries, no image files.
- **Dynamic Virus Mechanic:** Frozen tiles (`Ice Blocks`) are obstacles. If you don't break them during your turn, the virus spreads to adjacent fruits!
- **Epic Combos & Power-ups:**
  - Match 4 ➡️ **Bomb** (3x3 explosion)
  - Match T or L shape ➡️ **Cross Bomb** (clears a row and column)
  - Match 5 ➡️ **Lightning** (clears all gems of a specific color)
  - **Combine Power-ups!** Swap two power-ups directly to unleash massive chain reactions (e.g., Armageddon, Infection).
- **Procedural Synthesizer Audio:** All sound effects are generated in real-time using the browser's native **Web Audio API**.
- **4 Game Modes:**
  - **📖 Story Mode:** A 20-level campaign with increasing difficulty and specific goals.
  - **⏱️ Arcade Mode:** Classic 30-move limit to get the highest score possible.
  - **📅 Daily Challenge:** One unique board per day — same for all players. Compete on a daily leaderboard!
  - **☕ Relax Mode:** Endless gameplay with no limits and no virus.
- **🏆 Global Leaderboard:** Arcade and Daily Challenge scores saved online. See how you rank against other players.
- **📊 Player Stats:** Track your games played, best scores, average score, levels completed and favourite mode.
- **🎉 Confetti:** Celebrate new records and level completions in style.
- **📱 PWA Support:** Install GemVirus on your phone or desktop like a native app — works offline too.
- **Smart Engine:** Deadlock detector (auto-shuffles if no moves are possible) and a Hint System that suggests a move after 5 seconds of inactivity.
- **Quality of Life:** English/Polish localization, UI Zoom options, Eye-saving Gray Theme, level progress counter in Story mode.

## 🕹️ How to Play

1. **Click** an item to select it.
2. **Click an adjacent item** (up, down, left, right) to swap them.
3. **Form a line of 3** or more matching items to destroy them and earn points.
4. **Break the Ice!** Match items directly next to frozen blocks to shatter the ice. Don't ignore it, or the virus will spread.

## 🛠️ Local Development

To run the game locally, you just need a web browser! No installation required.

1. Clone the repository:
   ```bash
   git clone https://github.com/AnonBOTpl/GemVirus.git
   ```
2. Open the folder and double-click `index.html`.
3. Enjoy!

## 📋 Changelog

### v1.2.0
- Added **Daily Challenge** mode — unique seeded board every day, shared leaderboard
- Expanded **Story Mode** from 10 to **20 levels**
- Added **Global Leaderboard** with Arcade and Daily filters
- Added **Player Stats** panel (games played, best scores, avg score, fav mode)
- Added **Confetti animation** on new records and level completions
- Added **PWA support** — install as a native app, works offline
- Added **level progress counter** (e.g. Level 4/20) in Story Mode HUD
- Fixed full Polish localization for all new UI buttons

### v1.1.0
- Added player **nick system** for leaderboard identification
- Fixed `STARTING_MOVES` not defined error in Arcade mode
- Fixed game-over modal not closing on "Play Again"

### v1.0.0
- Initial release

## 📜 Credits

Created by **AnonBOTpl**. Feel free to fork, modify, and learn from the code!
