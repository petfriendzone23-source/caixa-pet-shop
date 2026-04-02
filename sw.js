
const CACHE_NAME = 'nexuspet-offline-v6';

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
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@18.3.1',
  'https://esm.sh/react-dom@18.3.1',
  'https://esm.sh/react@18.3.1/jsx-runtime',
  'https://esm.sh/recharts@2.12.7?external=react,react-dom',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Libre+Barcode+128&family=Inconsolata:wght@400;700&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('NexusPet: Caching initial assets...');
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => console.warn(`NexusPet: Failed to cache ${url}:`, err));
        })
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('NexusPet: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Estratégia Network-First: Tenta a rede, se falhar usa o cache.
// Isso garante que o usuário sempre veja a versão mais nova se tiver internet.
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se a resposta for válida, salva no cache para uso offline futuro
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Se a rede falhar (offline), tenta buscar no cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Se for uma navegação e não tiver no cache, tenta o index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          
          // Se nada funcionar, retorna um erro de rede padrão
          return null;
        });
      })
  );
});
