
const CACHE_NAME = 'nexuspet-pwa-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/types.ts',
  '/constants.ts',
  '/App.tsx',
  'https://cdn.tailwindcss.com'
];

// Instalação: Cacheia os arquivos essenciais do Shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('NexusPet: Fazendo cache dos arquivos básicos...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('NexusPet: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Estratégia de Fetch: Stale-While-Revalidate para assets dinâmicos
// Cache First para bibliotecas externas (esm.sh) e fontes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache especial para dependências do ESM.SH e Google Fonts
  if (url.origin === 'https://esm.sh' || url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Padrão: Tenta cache, se não tiver vai na rede e atualiza o cache
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Não cacheia chamadas de API ou Chrome Extensions
          if (event.request.url.startsWith('http')) {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Fallback para index.html em caso de falha total de rede (navegação)
      if (event.request.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});
