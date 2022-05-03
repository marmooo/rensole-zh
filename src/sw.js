var CACHE_NAME = "2022-05-03 10:15";
var urlsToCache = [
  "/rensole-zh/",
  "/rensole-zh/index.js",
  "/rensole-zh/pronounce.tsv",
  "/rensole-zh/sql.js-httpvfs/sql-wasm.wasm",
  "/rensole-zh/sql.js-httpvfs/sqlite.worker.js",
  "/rensole-zh/favicon/favicon.svg",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css",
  "https://cdn.jsdelivr.net/npm/mathjs@10.4.3/lib/browser/math.js",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      }),
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }),
  );
});

self.addEventListener("activate", function (event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
