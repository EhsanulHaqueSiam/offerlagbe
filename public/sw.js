const CACHE_VERSION = "offerlagbe-v3";
const SHELL_CACHE = CACHE_VERSION + "-shell";
const ASSETS_CACHE = CACHE_VERSION + "-assets";
const FONTS_CACHE = CACHE_VERSION + "-fonts";
const IMAGES_CACHE = CACHE_VERSION + "-images";
const TILES_CACHE = CACHE_VERSION + "-tiles";

const IMAGES_MAX = 100;
const TILES_MAX = 500;

const SHELL_ASSETS = ["/", "/offline.html", "/icon-192.svg", "/icon-512.svg", "/manifest.json"];

// LRU eviction: delete oldest entries when cache exceeds max size
async function evictLRU(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    const deleteCount = keys.length - maxItems;
    await Promise.all(keys.slice(0, deleteCount).map((k) => cache.delete(k)));
  }
}

// Strip query params from Convex storage URLs so token rotation doesn't bust cache
function normalizeStorageUrl(url) {
  const u = new URL(url);
  u.search = "";
  return u.toString();
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip WebSocket
  if (url.protocol === "ws:" || url.protocol === "wss:") return;

  // Convex URLs — only cache storage images, skip API/WebSocket calls
  if (url.hostname.includes("convex")) {
    if (url.pathname.startsWith("/api/storage/")) {
      // Cache Convex images — cache-first with normalized URL (strip token)
      const normalizedUrl = normalizeStorageUrl(url);
      const cacheKey = new Request(normalizedUrl);
      event.respondWith(
        caches.open(IMAGES_CACHE).then((cache) =>
          cache.match(cacheKey).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
              if (response.ok) {
                cache.put(cacheKey, response.clone());
                evictLRU(IMAGES_CACHE, IMAGES_MAX);
              }
              return response;
            });
          }),
        ),
      );
      return;
    }
    // Skip all other Convex calls (API, sync, etc.)
    return;
  }

  // OpenFreeMap tiles — cache-first (tiles rarely change)
  if (url.hostname === "tiles.openfreemap.org") {
    event.respondWith(
      caches.open(TILES_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone());
              evictLRU(TILES_CACHE, TILES_MAX);
            }
            return response;
          });
        }),
      ),
    );
    return;
  }

  // Vite build assets (/assets/*.js, /assets/*.css) — cache-first (content-hashed)
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(ASSETS_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      }),
    );
    return;
  }

  // Google Fonts — cache-first
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(FONTS_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      }),
    );
    return;
  }

  // Navigation requests — network-first, fallback to offline page
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/offline.html"))),
    );
    return;
  }

  // Everything else — network-first with cache fallback (same-origin only)
  if (url.origin === location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request)),
    );
  }
});

// Push notification handler
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "New Offer";
    const options = {
      body: data.body || "",
      icon: "/icon-192.svg",
      badge: "/icon-192.svg",
      data: { url: data.url || "/" },
      tag: data.tag || "offer-notification",
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    // Fallback for plain text push
    event.waitUntil(
      self.registration.showNotification("OfferLagbe", {
        body: event.data.text(),
        icon: "/icon-192.svg",
      }),
    );
  }
});

// Notification click handler — open the offer page
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if found
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new tab
      return self.clients.openWindow(url);
    }),
  );
});
