
const CACHE_NAME = 'nexuspet-offline-v4';

// Lista completa de arquivos locais e dependências externas para serem salvos para uso offline
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.svg',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Libre+Barcode+128&family=Inconsolata:wght@400;700&display=swap'
];

// Instalação: Baixa TUDO e guarda no cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('NexusPet: Preparando ambiente para uso 100% Offline...');
      // Tentamos baixar um por um para não falhar o cache inteiro se uma URL mudar
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => console.warn(`NexusPet: Falha ao cachear dependência ${url}:`, err));
        })
      );
    })
  );
});

// Ativação: Limpa lixo de versões anteriores
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
  return self.clients.claim();
});

// Intercepção de Rede: Estratégia Cache-First (Prioridade total ao Offline)
self.addEventListener('fetch', (event) => {
  // Ignorar extensões de navegador e chrome-extension
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Se está no cache, entrega imediatamente (Mesmo com internet ligada, para ser rápido)
      if (cachedResponse) {
        return cachedResponse;
      }

      // Se não está no cache, tenta baixar e salva para a próxima vez
      return fetch(event.request).then((networkResponse) => {
        // Verifica se a resposta é válida antes de salvar
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Se falhar a rede E não tiver no cache, tenta entregar o index.html (SPA Fallback)
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
