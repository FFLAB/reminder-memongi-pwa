registerServiceWorker() {
  if("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/reminder-pwa/sw.js")
      .then(function() { console.log("Registered service worker"); });
  }
}

document.addEventListener("DOMContentLoaded", function() {
  console.log("dom loaded");
  registerServiceWorker();
});
