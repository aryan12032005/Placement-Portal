const CACHE_NAME = 'internhub-v2';
const urlsToCache = [
  '/icons/icon.svg'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(err => {
          console.log('Cache addAll error:', err);
        });
      })
  );
  self.skipWaiting();
});

// Activate event - clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first for HTML, cache for assets
self.addEventListener('fetch', (event) => {
  // Skip non-http(s) requests (like chrome-extension://)
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // For HTML pages - always go to network first (don't cache routes)
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // For other assets - cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone and cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                try {
                  cache.put(event.request, responseToCache);
                } catch (e) {
                  console.log('Cache put error:', e);
                }
              });
            return response;
          }
        ).catch(err => {
          console.log('Fetch error:', err);
        });
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
