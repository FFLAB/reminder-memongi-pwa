document.addEventListener("DOMContentLoaded", function() {
  console.log("dom loaded");

  if("serviceWorker" in navigator) {
    navigator.serviceWorker.register("../sw.js")
      .then(function() { console.log("Registered service worker"); });
  }
});
