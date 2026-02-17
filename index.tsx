
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Registrar Service Worker para Offline com recarregamento forçado na ativação
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('NexusPet: Proteção Offline Ativa');
        
        // Se houver uma atualização, avisa o usuário ou recarrega
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Nova versão disponível. Reiniciando para aplicar...');
                window.location.reload();
              }
            };
          }
        };
      })
      .catch(err => console.log('NexusPet: Erro ao preparar modo offline', err));
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
