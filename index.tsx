
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Registro do Service Worker PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Adicionamos um timestamp para garantir que o navegador busque a versão mais nova do sw.js
    navigator.serviceWorker.register('/sw.js?v=' + Date.now())
      .then((registration) => {
        console.log('NexusPet: ServiceWorker registrado v1.6');
        
        // Verifica atualizações automaticamente
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('NexusPet: Nova versão disponível! Reinicie para atualizar.');
                }
              }
            };
          }
        };
      })
      .catch((error) => {
        console.error('NexusPet: Falha ao registrar ServiceWorker:', error);
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
