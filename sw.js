
const CACHE_NAME = 'nexuspet-v1.9.0-offline-full';

// Lista exaustiva de recursos necessários para o boot sem internet
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/manifest.json',
  '/components/Sidebar.tsx',
  '/components/POSView.tsx',
  '/components/InventoryView.tsx',
  '/components/DashboardView.tsx',
  '/components/SettingsView.tsx',
  '/components/CustomerView.tsx',
  '/components/SalesHistoryView.tsx',
  '/components/ReceiptModal.tsx',
  '/components/LoginView.tsx',
  // Dependências críticas externas
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Libre+Barcode+128&family=Inconsolata:wght@400;700&display=swap',
  'https://esm.sh/react@18.3.1',
  'https://esm.sh/react-dom@18.3.1',
  'https://esm.sh/react-dom@18.3.1/client',
  'https://esm.sh/react@18.3.1/jsx-runtime',
  'https://esm.sh/recharts@2.12.7?external=react,react-dom'
];

// Instalação: Salva TUDO no disco rígido imediatamente
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('NexusPet: Gerando cache offline completo...');
      // Usamos addAll mas com um map para logar erros se algum arquivo falhar
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => console.error('Falha ao cachear:', url, err));
        })
      );
    })
  );
});

// Ativação: Limpa versões velhas e assume o controle
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

// Estratégia: Cache First (Prioriza o disco, se não tiver, busca na rede e salva)
self.addEventListener('fetch', (event) => {
  // Ignorar requisições que não sejam GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Se está no cache, retorna imediatamente (Velocidade máxima)
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. Se não está no cache, tenta buscar na rede
      return fetch(event.request).then((networkResponse) => {
        // Se a resposta for válida, salva no cache para a próxima vez
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // 3. Se falhar a rede (Offline total) e for uma navegação, retorna o index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return null;
      });
    })
  );
});
