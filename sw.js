
const CACHE_NAME = 'nexuspet-v2.0.0';

// Recursos vitais para o primeiro carregamento
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/manifest.json',
  '/constants.ts',
  '/types.ts',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@18.3.1',
  'https://esm.sh/react-dom@18.3.1',
  'https://esm.sh/react-dom@18.3.1/client',
  'https://esm.sh/react@18.3.1/jsx-runtime'
];

// Instalação
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('NexusPet: Fazendo download do sistema para o disco...');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Ativação
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Interceptação de Requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 1. Lógica para NAVEGAÇÃO (Abrir o site/app)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // 2. Lógica para RECURSOS (JS, Módulos, CSS, Fontes)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Se já temos no cache, entrega ele (Instantâneo)
      if (cachedResponse) {
        return cachedResponse;
      }

      // Se não temos, busca na rede e salva no cache para a próxima vez
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && !request.url.includes('esm.sh') && !request.url.includes('cdn')) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Se a rede falhar e não tivermos cache, apenas falha (ou retorna um fallback se for imagem)
        return null;
      });
    })
  );
});
