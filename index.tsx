
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Registro do Service Worker PWA com lógica de Auto-Update
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('NexusPet: SW v1.8 Registrado');
        
        // Força a verificação de atualização no servidor a cada carregamento de página
        registration.update();

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                console.log('NexusPet: Nova versão v1.8 detectada e instalada.');
              }
            });
          }
        });
      });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
