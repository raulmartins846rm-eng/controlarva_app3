
import React from 'react';
import { Moon, Sun, Bell, User, Lock, Smartphone, Palette, Shield } from 'lucide-react';
import { AppTheme, Settings } from '../types';

interface SettingsViewProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings }) => {
  const updateSettings = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Profile Section */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-sky-100 dark:bg-sky-900/30 rounded-3xl flex items-center justify-center text-sky-600 dark:text-sky-400 text-4xl font-black">
            {settings.userName.charAt(0)}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold">{settings.userName}</h3>
            <p className="text-slate-500">{settings.email}</p>
            <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full uppercase">Administrador</span>
              <span className="px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-xs font-bold rounded-full uppercase">Vendedor Master</span>
            </div>
          </div>
          <button className="px-6 py-2 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20">
            Editar Perfil
          </button>
        </div>
      </section>

      {/* App Customization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Palette className="text-sky-500" />
            <h4 className="font-bold text-lg">Customização</h4>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Tema do Sistema</p>
                <p className="text-sm text-slate-500">Alternar entre claro e escuro</p>
              </div>
              <button 
                onClick={() => updateSettings('theme', settings.theme === AppTheme.LIGHT ? AppTheme.DARK : AppTheme.LIGHT)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all hover:scale-110"
              >
                {settings.theme === AppTheme.LIGHT ? <Moon size={24} /> : <Sun size={24} />}
              </button>
            </div>

            <div className="pt-4 border-t border-slate-50 dark:border-slate-700">
              <p className="font-semibold mb-2">Ciclo de Contato (Dias)</p>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="1" 
                  max="120" 
                  value={settings.contactIntervalDays}
                  onChange={(e) => updateSettings('contactIntervalDays', parseInt(e.target.value))}
                  className="flex-1 accent-sky-500" 
                />
                <span className="w-12 text-center font-bold text-sky-500">{settings.contactIntervalDays.toString().padStart(2, '0')}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 italic">Define quando os cartões de pós-venda mudam de cor.</p>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="text-amber-500" />
            <h4 className="font-bold text-lg">Notificações</h4>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="font-semibold group-hover:text-sky-500 transition-colors">Alertas de Pós-Venda</p>
                <p className="text-sm text-slate-500">Notificar quando um contato expirar</p>
              </div>
              <input type="checkbox" defaultChecked className="w-6 h-6 rounded border-slate-300 text-sky-500 focus:ring-sky-500" />
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="font-semibold group-hover:text-sky-500 transition-colors">Relatórios Semanais</p>
                <p className="text-sm text-slate-500">Resumo por email toda segunda-feira</p>
              </div>
              <input type="checkbox" className="w-6 h-6 rounded border-slate-300 text-sky-500 focus:ring-sky-500" />
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="font-semibold group-hover:text-sky-500 transition-colors">Novos Leads</p>
                <p className="text-sm text-slate-500">Sinalizar clientes em potencial</p>
              </div>
              <input type="checkbox" defaultChecked className="w-6 h-6 rounded border-slate-300 text-sky-500 focus:ring-sky-500" />
            </label>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-emerald-500" />
            <h4 className="font-bold text-lg">Segurança & Conta</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
              <div className="p-3 bg-sky-50 dark:bg-sky-900/30 text-sky-600 rounded-xl">
                <Lock size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold group-hover:text-sky-600">Alterar Senha</p>
                <p className="text-xs text-slate-500">Atualize sua senha periodicamente</p>
              </div>
            </button>

            <button className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                <Smartphone size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold group-hover:text-purple-600">Dispositivos Conectados</p>
                <p className="text-xs text-slate-500">Gerenciar acessos em outros aparelhos</p>
              </div>
            </button>
          </div>
        </section>
      </div>
      
      <div className="text-center pt-8 text-slate-400 text-xs uppercase font-bold tracking-[0.2em]">
        Controlarva v2.4.0 • Desenvolvido com carinho para produtores
      </div>
    </div>
  );
};

export default SettingsView;
