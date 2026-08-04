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
- **Proceduralne Audio:** Wszystkie efekty dźwiękowe są generowane w czasie rzeczywistym przez natywne **Web Audio API** przeglądarki.
- **4 Tryby Gry:**
  - **📖 Tryb Fabularny (Story):** Kampania z **20 poziomami** i rosnącym poziomem trudności.
  - **⏱️ Tryb Arcade:** Klasyczne 30 ruchów, walka o High Score z zapisem rekordu.
  - **📅 Wyzwanie Dnia:** Jedna unikalna plansza każdego dnia — taka sama dla wszystkich graczy. Rywalizuj w dziennym rankingu!
  - **☕ Tryb Relaks:** Nieskończona rozgrywka, bez limitu ruchów i bez wirusa.
- **🏆 Globalny Ranking:** Wyniki z Arcade i Wyzwania Dnia zapisywane online. Sprawdź swoje miejsce wśród innych graczy.
- **📊 Statystyki Gracza:** Śledź liczbę rozgrywek, rekordy, średni wynik, ukończone poziomy i ulubiony tryb.
- **🎉 Konfetti:** Świętuj nowe rekordy i ukończone poziomy z efektem konfetti.
- **📱 Wsparcie PWA:** Zainstaluj GemVirus na telefonie lub komputerze jak prawdziwą aplikację — działa też offline.
- **🖱️ Przesuwanie lub Klikanie:** Przeciągnij owoc w stronę sąsiada albo użyj klasycznego klik-klik. Działa myszką, palcem i rysikiem.
- **💾 Zapisywana Kampania:** Postęp w trybie Fabularnym jest zapisywany — zamknij kartę i wróć tam, gdzie skończyłeś. Reset dostępny w menu.
- **Inteligentny Silnik:** System detekcji "Deadlocka" oraz System Podpowiedzi (wskazuje ruch po 5 sekundach bezczynności).
- **Ustawienia (Quality of Life):** Lokalizacja EN/PL, przybliżanie planszy (Zoom), ciemny motyw kafelków, licznik poziomu w trybie Story (np. Poziom 4/20).

## 🕹️ Jak Grać

1. **Przesuń** owoc w stronę sąsiada, z którym chcesz go zamienić — albo **kliknij** owoc, a potem kliknij sąsiada.
2. **Ułóż linię 3** (lub więcej) takich samych owoców, aby zniknęły.
3. **Rozbij Lód!** Układaj dopasowania tuż obok zamrożonych bloków, aby skruszyć lód. Nie ignoruj go, inaczej wirus zaleje planszę.
4. Gdy skończą się ruchy, pozostałe Power-Upy wybuchają automatycznie. Nie chcesz czekać? Kliknij **⏩ Przyspiesz** — wynik będzie dokładnie taki sam.

## 🛠️ Uruchomienie Lokalne

Aby zagrać lokalnie, nie potrzebujesz serwera ani instalacji. Wystarczy przeglądarka internetowa!

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/AnonBOTpl/GemVirus.git
   ```
2. Otwórz folder i kliknij dwukrotnie plik `index.html`.
3. Gotowe!

## 📋 Historia Zmian (Changelog)

### v1.3.0
- Dodano **sterowanie przesuwaniem** — przeciągnij owoc w stronę sąsiada, aby zamienić je miejscami. Działa myszką, palcem i rysikiem, obok dotychczasowego klikania
- Dodano przycisk **⏩ Przyspiesz** podczas końcowej detonacji Power-Upów — skraca same animacje, wynik pozostaje bez zmian
- Dodano przycisk **resetu kampanii** na kafelku trybu Fabularnego (rekord zostaje zachowany)
- **Postęp kampanii jest teraz zapisywany** — powrót do menu ani zamknięcie strony nie cofa już do poziomu 1
- Naprawiono okno końcowe pozostające otwarte po kliknięciu **Zagraj Ponownie**, przez co nowa plansza była zasłonięta
- Naprawiono **aktualizacje nie docierające do graczy**: service worker zapisywał pliki pod stałą nazwą i w nieskończoność podawał starą wersję. Teraz wersjonowany i pobierający najpierw z sieci, więc odświeżenie zawsze pokazuje aktualną grę (offline nadal działa)
- Nicki graczy są teraz **zabezpieczane przed wyświetleniem** — spreparowany nick mógł wcześniej uruchomić kod w przeglądarkach innych graczy
- Zastąpiono **klucz główny** JSONBin kluczem o ograniczonych uprawnieniach, dzięki czemu rankingu nie da się już usunąć z poziomu kodu strony
- Uzupełniono **polską lokalizację** — ranking, Wyzwanie Dnia, panel statystyk i nagłówki tabel były częściowo po angielsku

### v1.2.0
- Dodano tryb **Wyzwanie Dnia** — unikalna plansza każdego dnia, wspólny ranking
- Rozszerzono **Tryb Fabularny** z 10 do **20 poziomów**
- Dodano **Globalny Ranking** z filtrami Arcade i Wyzwanie Dnia
- Dodano panel **Statystyk Gracza** (rozgrywki, rekordy, średni wynik, ulubiony tryb)
- Dodano **animację konfetti** przy nowych rekordach i ukończeniu poziomu
- Dodano **wsparcie PWA** — instalacja jako aplikacja, tryb offline
- Dodano **licznik poziomu** (np. Poziom 4/20) w HUD trybu Story
- Poprawiono pełną lokalizację polską dla wszystkich nowych przycisków

### v1.1.0
- Dodano system **nicku gracza** dla rankingu
- Naprawiono błąd `STARTING_MOVES` w trybie Arcade
- Naprawiono okno game-over nie zamykające się po "Zagraj Ponownie"

### v1.0.0
- Pierwsze wydanie

## 📜 Autor

Stworzone przez **AnonBOTpl**. Zachęcam do modyfikowania i uczenia się z kodu!
