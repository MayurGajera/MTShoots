const CACHE_NAME = 'mtshoots-v4';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-192-maskable.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  '/icons/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon.ico'
];

// Install: cache static shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches & claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for HTML page navigation, safe cache/network for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and cross-origin APIs
  if (request.method !== 'GET') return;
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return;
  if (url.hostname.includes('supabase.co')) return;
  if (url.hostname.includes('unsplash.com')) return;
  if (url.hostname.includes('dicebear.com')) return;
  if (url.hostname.includes('fonts.googleapis.com')) return;
  if (url.hostname.includes('fonts.gstatic.com')) return;

  // IMPORTANT: For page navigations (HTML pages like /photographers/[id]), ALWAYS use Network-First!
  // This guarantees fresh dynamic pages and prevents stale cached routing errors.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          // If network failed, look for cached version
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match('/');
          if (fallback) return fallback;
          // Guaranteed valid Response object to prevent "Failed to convert value to Response"
          return new Response('Network offline. Please check your internet connection.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // For static assets: Cache-first with network fallback.
  // ALWAYS return a valid Response so the ServiceWorker promise never rejects.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Return valid fallback response instead of undefined
          return new Response('', {
            status: 408,
            statusText: 'Request timed out'
          });
        });
    })
  );
});
