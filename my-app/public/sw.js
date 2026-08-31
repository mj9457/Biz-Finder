const CACHE_NAME = "biz-finder-pwa-v5";
const CACHE_PREFIX = "biz-finder-pwa-";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

// Deliberately no fetch listener: navigations, RSC payloads, API requests, and
// assets go directly to the network. This prevents a service worker FetchEvent
// from ever affecting /companies query-string transitions.
