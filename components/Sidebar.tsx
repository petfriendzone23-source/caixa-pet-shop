
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
        <h1 className="text-2xl font-black tracking-tighter flex items-center gap-3">
          <span className="bg-orange-600 p-2 rounded-xl shadow-lg shadow-orange-900/40">🐾</span> NexusPet
        </h1>
      </div>
      
      <nav className="flex-1 mt-4 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group ${
              currentView === item.id 
                ? 'bg-orange-600 text-white shadow-xl shadow-orange-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className={`text-xl transition-transform group-hover:scale-110 ${currentView === item.id ? 'scale-110' : ''}`}>
              {item.icon}
            </span>
            <span className="font-bold text-sm uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 space-y-4">
        <button 
          onClick={() => {
            if(window.confirm('Deseja realmente sair do sistema?')) onLogout();
          }}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm uppercase tracking-widest"
        >
          <span className="text-xl">🚪</span>
          Sair do Sistema
        </button>
        
        <div className="px-5 py-4 border-t border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          v1.5.0 - NexusPet Pro
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
