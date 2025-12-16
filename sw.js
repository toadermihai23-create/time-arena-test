const CACHE = "timearena-demo-v1.0.4";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./missions.js",
        "./app.js"
      ])
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
