
import React, { useState, useEffect } from 'react';

interface StorefrontViewProps {
  onEnterSystem: () => void;
}

const StorefrontView: React.FC<StorefrontViewProps> = ({ onEnterSystem }) => {
  const [logo, setLogo] = useState<string | null>(() => localStorage.getItem('nxpet_storefront_logo'));
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogo(base64String);
        localStorage.setItem('nxpet_storefront_logo', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    localStorage.removeItem('nxpet_storefront_logo');
  };

  return (
    <div className="relative h-screen w-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center text-center p-8 w-full max-w-5xl">
        {logo ? (
          <div className="relative group mb-12 w-full flex justify-center">
            <img 
              src={logo} 
              alt="Sua Logo" 
              className="max-h-[500px] md:max-h-[600px] w-auto max-w-full object-contain drop-shadow-[0_0_80px_rgba(249,115,22,0.2)] transition-all duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={removeLogo}
              className="absolute top-0 right-[10%] bg-red-500/20 hover:bg-red-500 text-white/50 hover:text-white w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg flex items-center justify-center backdrop-blur-md"
              title="Remover Logo"
            >
              ✕
            </button>
          </div>
        ) : (
          <label className="cursor-pointer group flex flex-col items-center p-20 border-4 border-dashed border-slate-800 rounded-[60px] hover:border-orange-500/50 hover:bg-orange-500/5 transition-all duration-500 mb-12 w-full max-w-2xl">
            <div className="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center text-6xl mb-8 group-hover:scale-110 transition-transform shadow-2xl">
              🖼️
            </div>
            <span className="text-slate-300 font-black uppercase tracking-[0.2em] text-lg">Sua Logo Aqui</span>
            <span className="text-slate-600 text-xs mt-4 uppercase font-bold tracking-widest">Clique para carregar a identidade da sua loja</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
          </label>
        )}

        <div className="space-y-10">
          {!logo && (
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase opacity-50">
              Bem-vindo
            </h1>
          )}
          
          <div className="pt-4">
            <button 
              onClick={onEnterSystem}
              className="px-16 py-6 bg-white hover:bg-orange-600 text-black hover:text-white font-black text-2xl uppercase tracking-[0.2em] rounded-full shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:shadow-orange-900/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-6 mx-auto group"
            >
              Entrar <span className="group-hover:translate-x-2 transition-transform">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row justify-between items-center md:items-end border-t border-slate-900 pt-8 gap-8 md:gap-0">
        <div className="text-center md:text-left">
          <p className="text-slate-600 font-black uppercase tracking-widest text-[9px] mb-2">Data e Hora</p>
          <div className="flex flex-col">
            <span className="text-white font-bold text-xl">
              {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <span className="text-5xl md:text-7xl font-black text-white tracking-tighter mt-1">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="text-center md:text-right flex flex-col items-center md:items-end">
          <p className="text-slate-600 font-black uppercase tracking-widest text-[9px] mb-2">Tecnologia</p>
          <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity cursor-default">
            <span className="text-xl">🐾</span>
            <span className="text-white font-black tracking-tighter uppercase text-sm">NexusPet</span>
          </div>
        </div>
      </div>

      {/* Floating Badge */}
      <div className="absolute top-12 right-12 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-full backdrop-blur-md hidden md:block">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="text-orange-500 font-black uppercase text-[10px] tracking-widest">Sistema Ativo</span>
        </div>
      </div>
    </div>
  );
};

export default StorefrontView;
