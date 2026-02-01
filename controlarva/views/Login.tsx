
import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';
import { Settings } from '../types';
import { ShrimpLogoIcon } from '../App';

interface LoginProps {
  onLogin: () => void;
  settings: Settings;
}

const Login: React.FC<LoginProps> = ({ onLogin, settings }) => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin();
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${settings.theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="mb-6 relative text-sky-600 dark:text-sky-400 animate-in zoom-in-50 duration-700">
            <ShrimpLogoIcon className="h-32 w-32 drop-shadow-2xl" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-sky-700 dark:text-sky-400 mb-2 filter drop-shadow-sm">Controlarva</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] ml-1">Gestão de Larvas de Camarão</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 ml-2">Usuário</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><User size={18} /></div>
                <input type="text" required className="block w-full pl-12 pr-4 py-4 border-2 border-slate-50 dark:border-slate-900 rounded-2xl bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-sky-500 transition-all font-bold" placeholder="Seu usuário" value={user} onChange={(e) => setUser(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 ml-2">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Lock size={18} /></div>
                <input type="password" required className="block w-full pl-12 pr-4 py-4 border-2 border-slate-50 dark:border-slate-900 rounded-2xl bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-sky-500 transition-all font-bold" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-black py-5 px-4 rounded-[1.5rem] shadow-xl shadow-sky-600/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 text-lg">
              {isLoading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : 'ACESSAR PAINEL'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] font-black text-slate-400 mt-12 tracking-widest uppercase">
          Versão 2.4.0 • <button className="text-sky-600 dark:text-sky-400 hover:underline">Central de Ajuda</button>
        </p>
      </div>
    </div>
  );
};

export default Login;
