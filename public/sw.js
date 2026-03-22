// Minimal no-op service worker to avoid 404 checks on this origin.
// Some browsers continue requesting /sw.js after earlier local PWA testing.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
