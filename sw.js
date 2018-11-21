self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open("reminder-cache").then(function(cache) {
      console.log("add to cache");
      return cache.add("/reminder-pwa/index.html");
    })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      let found = (response ? "found" : "MISSING");
      console.log("cache-get " + found + ":", event.request.url);
      return response || fetch(event.request);
    })
  );
});
