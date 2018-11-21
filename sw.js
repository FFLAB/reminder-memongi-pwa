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
      console.log("get from cache: ", event.request.url);
      return response || fetch(event.request);
    })
  );
});
