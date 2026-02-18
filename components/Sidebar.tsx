
import React, { useState, useEffect } from 'react';
import { View } from '../types.ts';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const menuItems: { id: View; label: string; icon: string }[] = [
    { id: 'pos', label: 'Venda (PDV)', icon: '🛒' },
    { id: 'sales', label: 'Histórico', icon: '📜' },
    { id: 'inventory', label: 'Estoque', icon: '📦' },
    { id: 'customers', label: 'Clientes', icon: '👥' },
    { id: 'dashboard', label: 'Relatórios', icon: '📊' },
    { id: 'settings', label: 'Ajustes', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-slate-900 dark:bg-black text-white h-screen flex flex-col sticky top-0 print:hidden shadow-2xl transition-colors duration-500">
      <div className="p-8">
        <h1 className="text-2xl font-black tracking-tighter flex items-center gap-3">
          <span className="bg-orange-600 p-2 rounded-xl shadow-lg shadow-orange-900/20">🐾</span> NexusPet
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sistema Ativo</span>
        </div>
      </div>
      
      <nav className="flex-1 mt-4 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
              currentView === item.id 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30' 
                : 'text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-bold text-sm uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 dark:border-slate-900 space-y-2">
        {deferredPrompt && (
          <button 
            onClick={handleInstallClick}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest transition-all shadow-lg animate-pulse"
          >
            💻 Instalar App
          </button>
        )}
        
        <button 
          onClick={() => window.confirm('Sair do sistema?') && onLogout()} 
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 font-bold uppercase text-xs transition-all"
        >
          <span>🚪</span> Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
