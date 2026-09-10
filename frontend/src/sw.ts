/*
PackDrashiti - Service Worker Offline Contingency (SIH26034)
Provides offline caching for PWA shell assets, fonts, icons, and API fallback records
to guarantee continuous operation during live jury demonstrations.
*/

const CACHE_NAME = 'packdrashiti-v1.0.0';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
];

// Install Event: Cache Core Application Shell
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return (self as any).skipWaiting();
    })
  );
});

// Activate Event: Purge Stale Caches
self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      return (self as any).clients.claim();
    })
  );
});

// Fetch Event: Network-First for API Requests, Cache-First for Static Shell
self.addEventListener('fetch', (event: any) => {
  const requestUrl = new URL(event.request.url);

  // API requests: Network First with Graceful Fallback
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return new Response(
              JSON.stringify({
                status: 'offline_fallback',
                message: 'PackDrashiti is operating in offline contingency mode.',
              }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
              }
            );
          });
        })
    );
    return;
  }

  // Static Assets: Cache First, Network Fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
