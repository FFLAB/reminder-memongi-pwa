self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open("reminder-cache").then(function(cache) {
      return cache.add("/reminder-pwa/index.html");
    })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
