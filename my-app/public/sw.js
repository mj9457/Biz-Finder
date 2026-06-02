const CACHE_NAME = "biz-finder-pwa-v1";
const PRECACHE_URLS = [
  "/",
  "/favicon/manifest.json",
  "/favicon/android-icon-192x192.png",
  "/favicon/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
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
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);

        if (event.request.url.startsWith(self.location.origin)) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone()).catch(() => {});
        }

        return response;
      } catch (error) {
        const cachedResponse = await caches.match(event.request);

        if (cachedResponse) {
          return cachedResponse;
        }

        if (event.request.mode === "navigate") {
          return (await caches.match("/")) || Response.error();
        }

        throw error;
      }
    })(),
  );
});
