
// Service Worker desativado para restaurar comportamento original
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
self.addEventListener('fetch', (event) => {
  // Apenas busca na rede, sem cache agressivo
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
