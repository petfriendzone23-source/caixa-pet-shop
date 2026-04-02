
import React, { useState, useEffect } from 'react';
import { auth, db } from '../src/firebase.ts';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface LoginViewProps {
  onLogin: (username: string) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (password !== confirmPassword) { setError('As senhas não coincidem.'); setIsLoading(false); return; }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); setIsLoading(false); return; }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Salva perfil no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username: username,
        email: email,
        role: 'admin', // Primeiro usuário como admin
        createdAt: Date.now()
      });

      await updateProfile(user, { displayName: username });
      
      setSuccess('Conta criada com sucesso!');
      setIsRegistering(false);
    } catch (e: any) { 
      setError(e.message || 'Erro ao criar conta.'); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin(auth.currentUser?.displayName || email);
    } catch (e: any) { 
      setError('E-mail ou senha inválidos.'); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      setIsRecovering(false);
    } catch (e: any) { 
      setError('Erro ao enviar e-mail de recuperação.'); 
    } finally {
      setIsLoading(false);
    }
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
              {isRegistering ? 'Criar Nova Conta' : isRecovering ? 'Recuperação de Senha' : 'Acesso ao Sistema de PDV'}
            </p>
          </div>

          <form onSubmit={isRegistering ? handleRegister : isRecovering ? handleRecover : handleLogin} className="p-10 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-xl animate-pulse">
                <p className="text-xs font-bold text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-xl">
                <p className="text-xs font-bold text-green-700 dark:text-green-400">{success}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">📧</span>
                  <input 
                    required type="email" 
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-orange-500 dark:bg-slate-800 dark:text-white outline-none transition-all font-bold"
                    placeholder="Seu e-mail" value={email} onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {isRegistering && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nome de Usuário</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">👤</span>
                    <input 
                      required type="text" 
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-orange-500 dark:bg-slate-800 dark:text-white outline-none transition-all font-bold"
                      placeholder="Como quer ser chamado" value={username} onChange={e => setUsername(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {!isRecovering && (
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
              )}

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
              disabled={isLoading}
              className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black text-lg hover:bg-orange-700 shadow-xl shadow-orange-900/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? 'CARREGANDO...' : isRegistering ? 'CRIAR CONTA' : isRecovering ? 'ENVIAR E-MAIL' : 'ACESSAR AGORA'}
              {!isLoading && <span className="text-xl">➔</span>}
            </button>

            {!isRegistering && !isRecovering && (
              <div className="flex justify-between items-center mt-4 text-xs font-bold text-slate-500">
                <button type="button" onClick={() => { setIsRecovering(true); setError(''); setSuccess(''); setPassword(''); }} className="hover:text-orange-500 transition-colors">Esqueci minha senha</button>
                <button type="button" onClick={() => { setIsRegistering(true); setError(''); setSuccess(''); setUsername(''); setPassword(''); }} className="hover:text-orange-500 transition-colors">Criar nova conta</button>
              </div>
            )}

            {(isRegistering || isRecovering) && (
              <div className="mt-4 text-center text-xs font-bold text-slate-500">
                <button type="button" onClick={() => { setIsRegistering(false); setIsRecovering(false); setError(''); setSuccess(''); setPassword(''); setConfirmPassword(''); }} className="hover:text-orange-500 transition-colors">Voltar para o Login</button>
              </div>
            )}
          </form>
        </div>
        
        <div className="mt-8 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
          NexusPet PDV &copy; 2024 - Cloud Real-time Edition
        </div>
      </div>
    </div>
  );
};

export default LoginView;
