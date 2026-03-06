<div align="center">
  <h1>💎 GemVirus</h1>
  <p>Wysoko dopracowana gra logiczna Match-3 stworzona całkowicie w czystym (Vanilla) JavaScript. Posiada mechanikę rozrastającego się wirusa, epickie kombinacje Power-Upów oraz wbudowany syntezator dźwięków Web Audio API.</p>

  <a href="https://AnonBOTpl.github.io/GemVirus/">
    <img src="https://img.shields.io/badge/🎮%20ZAGRAJ%20TERAZ-Kliknij%20Tutaj-2ecc71?style=for-the-badge" alt="Play the Game" />
  </a>
  <br><br>
  
  <p>
    <a href="README.md">🇬🇧 Read in English (Wersja Angielska)</a>
  </p>
</div>

---

## 🌟 Główne Funkcje

- **Brak Zależności (Zero Dependencies):** Zbudowane w 100% z użyciem HTML5, CSS3 i Vanilla JS. Brak frameworków oraz zewnętrznych plików graficznych.
- **Mechanika Wirusa (Ice Blocks):** Zamrożone kafelki to przeszkody. Jeśli w swojej turze nie rozbijesz lodu, wirus rozprzestrzeni się na sąsiednie owoce!
- **Epickie Combosy i Power-Upy:**
  - Dopasuj 4 ➡️ **Bomba** (eksplozja 3x3)
  - Dopasuj w kształt T lub L ➡️ **Bomba Krzyżowa** (niszczy cały rząd i kolumnę)
  - Dopasuj 5 w linii ➡️ **Błyskawica** (niszczy wszystkie owoce danego koloru)
  - **Łącz Power-Upy!** Zamień dwa specjalne owoce miejscami, aby wywołać reakcję łańcuchową (np. Armagedon niszczący całą planszę).
- **Proceduralne Audio:** Wszystkie efekty dźwiękowe (kliknięcia, wybuchy, uderzenia) są generowane w czasie rzeczywistym przez natywne **Web Audio API** przeglądarki.
- **3 Tryby Gry:**
  - **📖 Tryb Fabularny (Story):** Kampania (10 poziomów) z rosnącym poziomem trudności.
  - **⏱️ Tryb Arcade:** Klasyczne 30 ruchów, walka o High Score z zapisem rekordu.
  - **☕ Tryb Relaks:** Nieskończona rozgrywka, bez limitu ruchów i bez wirusa.
- **Inteligentny Silnik:** System detekcji "Deadlocka" (automatyczne tasowanie planszy, jeśli brak ruchów) oraz System Podpowiedzi (wskazuje dozwolony ruch po 5 sekundach bezczynności).
- **Ustawienia (Quality of Life):** Lokalizacja EN/PL, przybliżanie planszy (Zoom) oraz ciemny motyw kafelków niemęczący wzroku.

## 🕹️ Jak Grać

1. **Kliknij** owoc, aby go zaznaczyć.
2. **Kliknij sąsiada** (góra, dół, lewo, prawo), aby zamienić je miejscami.
3. **Ułóż linię 3** (lub więcej) takich samych owoców, aby zniknęły.
4. **Rozbij Lód!** Układaj dopasowania tuż obok zamrożonych bloków, aby skruszyć lód. Nie ignoruj go, inaczej wirus zaleje planszę.

## 🛠️ Uruchomienie Lokalne

Aby zagrać lokalnie, nie potrzebujesz serwera ani instalacji. Wystarczy przeglądarka internetowa!

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/AnonBOTpl/GemVirus.git
   ```
2. Otwórz folder i kliknij dwukrotnie plik `index.html`.
3. Gotowe!

## 📜 Autor

Stworzone przez **AnonBOTpl**. Zachęcam do modyfikowania i uczenia się z kodu!