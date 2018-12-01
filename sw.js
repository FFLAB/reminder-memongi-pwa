"use strict";

const cacheFiles = [
  "/reminder-pwa/",
  "/reminder-pwa/manifest.webmanifest",
  "/reminder-pwa/js/app.js",
  "/reminder-pwa/js/reminder.js",
  "/reminder-pwa/css/styles.css",
  "/reminder-pwa/img/favicon.ico",
  "/reminder-pwa/img/logo-192.png",
  "/reminder-pwa/img/logo-512.png"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log("add to cache");
      return cache.addAll(cacheFiles);
    })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      let found = (response ? "found" : "MISSING");
      console.log("cache-get," + found + ":", event.request.url);
      return response || fetch(event.request);
    })
  );
});
