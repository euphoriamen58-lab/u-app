// Guarda la app en el teléfono para que funcione sin internet.
// Si cambias algo en la app, sube el número de versión para que el iPhone baje la nueva.
const VERSION = 'ulima-replica-v5';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nombres) => Promise.all(nombres.filter((n) => n !== VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Primero intenta internet (siempre pregunta si hay una versión nueva); si no hay conexión, usa la copia guardada.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const navegacion = e.request.mode === 'navigate';
  e.respondWith(
    fetch(e.request, navegacion ? { cache: 'no-cache' } : undefined)
      .then((r) => {
        if (r.ok && new URL(e.request.url).origin === location.origin) {
          const copia = r.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copia));
        }
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('./index.html')))
  );
});
