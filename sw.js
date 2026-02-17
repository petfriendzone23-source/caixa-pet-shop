
const CACHE_NAME = 'nexuspet-v1.5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './constants.ts',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Libre+Barcode+128&family=Inconsolata:wght@400;700&display=swap'
];

// Instalação: Salva arquivos essenciais no cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('NexusPet: Fazendo cache dos arquivos offline...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('NexusPet: Limpando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptação: Responde com cache se estiver offline
self.addEventListener('fetch', (event) => {
  // Ignora requisições de extensões ou esquemas não-http
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Se estiver no cache, retorna. Se não, busca na rede.
      return response || fetch(event.request).then((networkResponse) => {
        // Opcional: Adiciona dinamicamente novos arquivos ao cache
        return caches.open(CACHE_NAME).then((cache) => {
          if (event.request.method === 'GET' && !event.request.url.includes('chrome-extension')) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      }).catch(() => {
        // Se falhar rede e cache (ex: página não cacheada), retorna algo básico ou erro
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
