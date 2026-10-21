// Кешируем только интерфейс приложения, но не персональные дневниковые записи.
const CACHE = 'ritm-mobile-v2-2-1';
const CORE = ['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('ritm-mobile-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(fetch(req).then(resp => {
    if (resp.ok && CORE.some(path => new URL(path,self.registration.scope).href === req.url)) {
      const copy = resp.clone(); caches.open(CACHE).then(cache => cache.put(req,copy));
    }
    return resp;
  }).catch(() => caches.match(req).then(result => result || caches.match('./index.html'))));
});
