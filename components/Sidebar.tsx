
import React from 'react';
import { View } from '../types.ts';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout }) => {
  const menuItems: { id: View; label: string; icon: string }[] = [
    { id: 'pos', label: 'Venda (PDV)', icon: '🛒' },
    { id: 'sales', label: 'Histórico', icon: '📜' },
    { id: 'inventory', label: 'Estoque', icon: '📦' },
    { id: 'customers', label: 'Clientes', icon: '👥' },
    { id: 'dashboard', label: 'Relatórios', icon: '📊' },
    { id: 'settings', label: 'Ajustes', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col sticky top-0 print:hidden shadow-2xl">
      <div className="p-8">
        <h1 className="text-2xl font-black tracking-tighter flex items-center gap-3 text-orange-500">
          <span className="bg-orange-600 p-2 rounded-xl text-white">🐾</span> NexusPet
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Instalado / Offline</span>
        </div>
      </div>
      <nav className="flex-1 mt-4 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
              currentView === item.id 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-bold text-sm uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="mb-4 px-4">
           <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Status do Disco</p>
           <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full w-[100%]"></div>
           </div>
        </div>
        <button onClick={() => window.confirm('Sair do sistema?') && onLogout()} className="w-full flex items-center gap-4 px-5 py-3 rounded-xl text-red-400 hover:bg-red-500/10 font-bold uppercase text-[10px] transition-colors">
          <span>🚪</span> Sair
        </button>
        <div className="mt-4 text-center">
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">v1.8.0 Stable</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
