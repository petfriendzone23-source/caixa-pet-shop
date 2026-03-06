
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
      <div className="z-10 flex flex-col items-center text-center p-8 max-w-4xl">
        {logo ? (
          <div className="relative group mb-8">
            <img 
              src={logo} 
              alt="Store Logo" 
              className="max-h-[300px] md:max-h-[400px] max-w-full object-contain drop-shadow-[0_20px_50px_rgba(249,115,22,0.3)] transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={removeLogo}
              className="absolute -top-4 -right-4 bg-red-500 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg flex items-center justify-center print:hidden"
            >
              ✕
            </button>
          </div>
        ) : (
          <label className="cursor-pointer group flex flex-col items-center p-12 border-4 border-dashed border-slate-800 rounded-[40px] hover:border-orange-500/50 hover:bg-orange-500/5 transition-all duration-300 mb-8">
            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">
              🖼️
            </div>
            <span className="text-slate-400 font-black uppercase tracking-widest text-sm">Clique para adicionar sua Logo</span>
            <span className="text-slate-600 text-[10px] mt-2 uppercase font-bold">Formatos: PNG, JPG ou SVG</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
          </label>
        )}

        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase">
            Bem-vindo à <span className="text-orange-500 italic">NexusPet</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-sm md:text-base">
            Atendimento em instantes • Qualidade e Carinho
          </p>
          
          <div className="pt-8">
            <button 
              onClick={onEnterSystem}
              className="px-12 py-5 bg-orange-600 hover:bg-orange-700 text-white font-black text-xl uppercase tracking-widest rounded-2xl shadow-2xl shadow-orange-900/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-4 mx-auto"
            >
              Acessar Sistema <span>🚀</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row justify-between items-center md:items-end border-t border-slate-900 pt-8 gap-6 md:gap-0">
        <div className="text-center md:text-left">
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-1">Data de Hoje</p>
          <p className="text-white font-bold text-lg">
            {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="text-center md:text-right">
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-1">Horário Local</p>
          <p className="text-6xl md:text-8xl font-black text-white tracking-tighter">
            {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
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
