const cacheName = "news-pwa-v1";
const filesToCache = [
  "/index.html",
  "/css/styles.css",
  "/js/app.js",
  "/js/pdf.js",
  "/manifest.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((resp) => {
      return resp || fetch(e.request);
    })
  );
});
