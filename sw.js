const CACHE_NAME = 'habit-tracker-v5';
const ASSETS = ['./', './index.html', './manifest.json', './icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Cache each asset independently — one failing fetch (e.g. a
      // redirect quirk) used to abort the whole install silently via
      // addAll(), which meant NOTHING got cached and offline never worked.
      Promise.all(
        ASSETS.map((url) =>
          fetch(url, { cache: 'reload' })
            .then((res) => (res && res.ok ? cache.put(url, res) : null))
            .catch(() => null)
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (url.origin !== location.origin || req.method !== 'GET') return;

  // Page loads: try the network, but always fall back to the cached
  // index.html if there's no connection — this is what actually makes
  // "open the app with no internet" work.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  // Other same-origin assets (manifest, icon): stale-while-revalidate.
  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
