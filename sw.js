const CACHE_NAME = "koala-notes-v1";

const urlsToCache = [
    "./",
    "./index.html",
    "./manifest.json",

    "./favicon/favicon.ico",

    "./koala.png",
    "./koalasleep.png",

    "./favicon/android-chrome-192x192.png",
    "/favicon/android-chrome-512x512.png",

    "./sounds/reminder.mp3"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});