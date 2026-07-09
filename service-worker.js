const CACHE_NAME = 'tiemtra-v6';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only handle http and https requests to prevent Chrome extension or local file failures
  if (!e.request.url.startsWith('http')) return;

  // Bypass service worker for audio files to avoid Range request/206 status issues
  if (e.request.url.match(/\.(mp3|ogg|wav)$/i)) {
    return; // Let the browser handle audio requests directly from network
  }

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Cache new successful responses for offline use
        if (response.status === 200 && e.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
