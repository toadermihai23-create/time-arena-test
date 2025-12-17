const CACHE_NAME = "timearena-v1.00";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./missions.js",
  "./penalties.js",
  "./rules.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Network-first for opensheet (LIVE data), cache fallback
  if (req.url.includes("opensheet.elk.sh")) {
    event.respondWith(
      fetch(req).then((res) => res).catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
