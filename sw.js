
const CACHE_NAME = 'nexuspet-offline-v5';

// Lista completa de arquivos locais e dependências externas para serem salvos para uso offline
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/types.ts',
  '/constants.ts',
  '/App.tsx',
  '/components/Sidebar.tsx',
  '/components/POSView.tsx',
  '/components/InventoryView.tsx',
  '/components/DashboardView.tsx',
  '/components/SettingsView.tsx',
  '/components/CustomerView.tsx',
  '/components/SalesHistoryView.tsx',
  '/components/ReceiptModal.tsx',
  '/components/LoginView.tsx',
  // Dependências Externas (CDNs) - Crucial para funcionar sem internet
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@18.3.1',
  'https://esm.sh/react-dom@18.3.1',
  'https://esm.sh/react@18.3.1/jsx-runtime',
  'https://esm.sh/recharts@2.12.7?external=react,react-dom',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Libre+Barcode+128&family=Inconsolata:wght@400;700&display=swap'
];

// Instalação: Baixa TUDO e guarda no cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('NexusPet: Preparando ambiente para uso 100% Offline...');
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

// Intercepção de Rede
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  // Estratégia Network-First para navegação (HTML principal)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then(response => {
            return response || caches.match('/');
          });
        })
    );
    return;
  }

  // Estratégia Stale-While-Revalidate para outros recursos
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Se falhar a rede e não tiver cache, o erro será tratado pelo navegador
        return null;
      });

      // Se temos no cache, entrega imediatamente e deixa a rede atualizar em background
      if (cachedResponse) {
        return cachedResponse;
      }

      // Se não temos no cache, espera a rede
      return fetchPromise;
    })
  );
});
