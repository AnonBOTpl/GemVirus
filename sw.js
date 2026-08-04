// sw.js — GemVirus Service Worker
//
// !!! WAZNE PRZY KAZDEJ AKTUALIZACJI GRY !!!
// Podbij numer ponizej (v2 -> v3 -> v4...). Nazwa cache musi sie ZMIENIC,
// inaczej przegladarka gracza w nieskonczonosc podaje stare pliki i nikt
// nie zobaczy poprawek.
const CACHE = 'gemvirus-v2';

const ASSETS = [
    './', './index.html', './style.css', './manifest.json',
    './globals.js', './language.js', './levels.js',
    './audio.js', './visuals.js', './logic.js',
    './game.js', './leaderboard.js', './daily.js'
];

self.addEventListener('install', e => {
    // Pliki pobieramy z pominieciem cache przegladarki - inaczej przy podbiciu
    // wersji mozna zapisac do nowego pudelka... stare pliki.
    e.waitUntil(
        caches.open(CACHE)
            .then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' }))))
            // Gdyby ktorykolwiek plik sie nie pobral, nie blokujemy instalacji -
            // brakujace dociagnie sie normalnie z sieci przy uzyciu.
            .catch(() => caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}))
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k.startsWith('gemvirus-') && k !== CACHE)
                    .map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    // Tylko GET - POST/PUT (wysylanie wynikow) nie moze isc przez cache.
    if (e.request.method !== 'GET') return;

    // JSONBin (ranking) - zawsze z sieci, cache tylko jako awaryjna pustka.
    if (e.request.url.includes('jsonbin.io')) {
        e.respondWith(fetch(e.request).catch(() => new Response('[]', {
            headers: { 'Content-Type': 'application/json' }
        })));
        return;
    }

    // Pliki gry: najpierw siec, cache jako zapas (offline).
    // Dzieki temu odswiezenie strony ZAWSZE pokazuje aktualna wersje,
    // a gra nadal dziala bez internetu.
    e.respondWith(
        fetch(e.request)
            .then(res => {
                // Udana odpowiedz odkladamy do pudelka na later.
                if (res && res.ok && res.type === 'basic') {
                    const copy = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
                }
                return res;
            })
            .catch(() => caches.match(e.request).then(cached => cached
                || caches.match('./index.html')))
    );
});
