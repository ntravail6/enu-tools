/* =============================================================
   株ログ — Service Worker
   キャッシュ戦略: Cache First + Network Fallback
   ============================================================= */
const CACHE_NAME = 'kabulog-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './stocks.json',
];

// Google Fonts はネットワーク優先（キャッシュフォールバック）
const FONT_CACHE = 'kabulog-fonts-v1';

/* ----- Install ----- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* ----- Activate: 古いキャッシュを削除 ----- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== FONT_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ----- Fetch ----- */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Google API 関連はキャッシュしない（認証トークンが必要なため）
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('accounts.google.com') ||
    url.hostname.includes('gstatic.com')
  ) {
    // Google Fonts CSS/WOFF2 だけはキャッシュする
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
      event.respondWith(
        caches.open(FONT_CACHE).then((cache) =>
          cache.match(request).then((cached) => {
            const fetched = fetch(request).then((response) => {
              if (response.ok) cache.put(request, response.clone());
              return response;
            }).catch(() => cached);
            return cached || fetched;
          })
        )
      );
      return;
    }
    // その他の Google API はネットワークのみ
    return;
  }

  // アプリ本体: Cache First
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // オフラインでキャッシュもない場合
        if (request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
