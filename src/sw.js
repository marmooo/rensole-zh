const CACHE_NAME = "2025-04-06 01:35";
const urlsToCache = [
  "/rensole-zh/",
  "/rensole-zh/index.js",
  "/rensole-zh/pronounce.tsv",
  "/rensole-zh/sql.js-httpvfs/sql-wasm.wasm",
  "/rensole-zh/sql.js-httpvfs/sqlite.worker.js",
  "/rensole-zh/mp3/incorrect1.mp3",
  "/rensole-zh/mp3/correct3.mp3",
  "/rensole-zh/favicon/favicon.svg",
  "https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});
