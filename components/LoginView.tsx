
import React, { useState, useEffect } from 'react';

interface LoginViewProps {
  onLogin: (username: string) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem('nxpet_users');
      if (!savedUsers || savedUsers === '[]') {
        setIsRegistering(true);
      }
    } catch (e) {
      setIsRegistering(true);
    }
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); return; }
    if (password.length < 4) { setError('A senha deve ter pelo menos 4 caracteres.'); return; }
    try {
      const newUser = { username, password };
      localStorage.setItem('nxpet_users', JSON.stringify([newUser]));
      setIsRegistering(false);
      alert('Usuário mestre criado!');
    } catch (e) { setError('Erro ao salvar usuário.'); }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const savedUsersStr = localStorage.getItem('nxpet_users');
      if (!savedUsersStr) { setError('Nenhum usuário cadastrado.'); return; }
      const users = JSON.parse(savedUsersStr);
      const user = users.find((u: any) => u.username === username && u.password === password);
      if (user) { onLogin(username); } else { setError('Credenciais inválidas.'); }
    } catch (e) { setError('Erro interno.'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden font-inter transition-colors duration-500">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md z-10">
        <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors duration-500">
          <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-600 rounded-3xl shadow-xl shadow-orange-500/20 mb-6 text-4xl transform -rotate-6">
              🐾
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">NexusPet</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
              {isRegistering ? 'Configuração do Administrador' : 'Acesso ao Sistema de PDV'}
            </p>
          </div>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="p-10 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-xl animate-pulse">
                <p className="text-xs font-bold text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Usuário</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">👤</span>
                  <input 
                    required type="text" 
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-orange-500 dark:bg-slate-800 dark:text-white outline-none transition-all font-bold"
                    placeholder="Seu usuário" value={username} onChange={e => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Senha</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
                  <input 
                    required type="password" 
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-orange-500 dark:bg-slate-800 dark:text-white outline-none transition-all font-bold"
                    placeholder="Sua senha" value={password} onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {isRegistering && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Confirmar Senha</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🛡️</span>
                    <input 
                      required type="password" 
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-orange-500 dark:bg-slate-800 dark:text-white outline-none transition-all font-bold"
                      placeholder="Repita a senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black text-lg hover:bg-orange-700 shadow-xl shadow-orange-900/20 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {isRegistering ? 'CRIAR CONTA MESTRE' : 'ACESSAR AGORA'}
              <span className="text-xl">➔</span>
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
          NexusPet PDV &copy; 2024 - Offline Professional Edition
        </div>
      </div>
    </div>
  );
};

export default LoginView;
