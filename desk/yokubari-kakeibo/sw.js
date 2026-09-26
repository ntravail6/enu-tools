const CACHE_VERSION = 'kakeibo-v3';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Kosugi+Maru&display=swap'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Skip Google Auth/API requests - always go to network
  const url = e.request.url;
  if (url.includes('accounts.google.com') || url.includes('googleapis.com') || url.includes('gstatic.com/gsi')) {
    return; // let network handle
  }
  // Cache-first strategy for others
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request).then((response) => {
      // Optionally cache new responses
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
