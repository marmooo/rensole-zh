const cacheName = "2026-05-11 00:00";
const urlsToCache = [
  "/rensole-zh/index.js",
  "/rensole-zh/pronounce.tsv",
  "/rensole-zh/sql.js-httpvfs/sql-wasm.wasm",
  "/rensole-zh/sql.js-httpvfs/sqlite.worker.js",
  "/rensole-zh/mp3/incorrect1.mp3",
  "/rensole-zh/mp3/correct3.mp3",
  "/rensole-zh/favicon/favicon.svg",
  "https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css",
];

async function preCache() {
  const cache = await caches.open(cacheName);
  await Promise.all(
    urlsToCache.map((url) =>
      cache.add(url).catch((err) => console.warn("Failed to cache", url, err))
    ),
  );
  self.skipWaiting();
}

async function handleFetch(event) {
  const cached = await caches.match(event.request);
  return cached || fetch(event.request);
}

async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((name) => name !== cacheName ? caches.delete(name) : null),
  );
  self.clients.claim();
}

self.addEventListener("install", (event) => {
  event.waitUntil(preCache());
});
self.addEventListener("fetch", (event) => {
  event.respondWith(handleFetch(event));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(cleanOldCaches());
});
