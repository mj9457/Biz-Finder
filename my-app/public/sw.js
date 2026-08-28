const CACHE_NAME = "biz-finder-pwa-v4";
const PRECACHE_URLS = [
  "/favicon/manifest.json",
  "/favicon/android-icon-192x192.png",
  "/favicon/icon-512x512.png",
];
const PRECACHE_PATHS = new Set(PRECACHE_URLS);

function isPrecachedRequest(request) {
  const url = new URL(request.url);

  return (
    url.origin === self.location.origin && PRECACHE_PATHS.has(url.pathname)
  );
}

async function getPrecachedResponse(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);

  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone()).catch(() => {});
  }

  return response;
}

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

  // Serving the PWA manifest and install icons cache-first prevents filter URL
  // changes from revalidating those static assets.
  if (isPrecachedRequest(event.request)) {
    event.respondWith(getPrecachedResponse(event.request));
    return;
  }

  // Do not intercept navigations, RSC payloads, API calls, or JavaScript
  // chunks. They must always use the network so different deployments can
  // never mix a stale page shell with the current list component.
});
