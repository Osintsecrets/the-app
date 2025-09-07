const CACHE = 'dash-cache-v4';
const CORE = [
  './',
  './index.html',
  './feeds.html',
  './library.html',
  './styles.css',
  './js/ui.js',
  './js/app.js',
  './js/feeds.js',
  './js/library.js',
  './manifest.webmanifest',
  './data/feeds.json',
  './data/bookmarks.json',
  './data/sources.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const fetchPromise = fetch(e.request).then(res => {
          const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});
