
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Suprimir avisos de deprecation do Recharts (defaultProps em componentes de função)
const error = console.error;
console.error = (...args: any[]) => {
  if (/defaultProps/.test(args[0])) return;
  error(...args);
};

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
