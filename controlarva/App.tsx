
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingCart, 
  RefreshCcw, 
  BarChart3, 
  Settings as SettingsIcon, 
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  MapPin
} from 'lucide-react';
import { AppTheme, Tab, Customer, Sale, Settings, Visit, Goal } from './types';
import Login from './views/Login';
import DashboardView from './views/DashboardView';
import CustomersView from './views/CustomersView';
import SalesView from './views/SalesView';
import AfterSalesView from './views/AfterSalesView';
import VisitsView from './views/VisitsView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';

// ==================================================================================
// INSTRUÇÃO PARA O USUÁRIO:
// 1. Faça upload da sua imagem no Google Drive.
// 2. Clique em "Compartilhar" e mude para "Qualquer pessoa com o link".
// 3. Copie o link e cole dentro das aspas abaixo.
// Exemplo: const CUSTOM_LOGO_URL = "https://drive.google.com/file/d/12345abcde/view?usp=sharing";
// ==================================================================================
const CUSTOM_LOGO_URL = ""; 

// Função auxiliar para tratar links do Google Drive
const getOptimizedImageUrl = (url: string) => {
  if (!url) return '';
  
  // Verifica se é um link do Google Drive e extrai o ID para criar um link direto
  if (url.includes('drive.google.com') && url.includes('/d/')) {
    try {
      const id = url.split('/d/')[1].split('/')[0];
      return `https://drive.google.com/uc?export=view&id=${id}`;
    } catch (e) {
      return url;
    }
  }
  return url;
};

export const ShrimpLogoIcon = ({ className = "w-12 h-12" }: { className?: string }) => {
  const imageUrl = getOptimizedImageUrl(CUSTOM_LOGO_URL);

  // Se o usuário forneceu uma imagem, usa a tag <img>
  if (imageUrl) {
    return (
      <img 
        src={imageUrl} 
        alt="Logo Controlarva" 
        className={`${className} object-contain`} 
        // Adiciona um fallback caso a imagem quebre, volta para o SVG
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          // A lógica visual de fallback seria manipulada pelo pai ou CSS, 
          // mas aqui garantimos que a imagem quebrada suma.
        }}
      />
    );
  }

  // Caso contrário (ou se a URL estiver vazia), renderiza o ícone vetorial padrão
  return (
    <svg viewBox="0 0 120 120" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shrimpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#00AEEF', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0054A6', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Antenas (Saindo da cabeça no topo do C) */}
      <path d="M 85 30 C 95 20, 110 20, 115 25" stroke="#00AEEF" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M 82 35 C 95 30, 105 35, 110 40" stroke="#00AEEF" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />

      {/* Corpo do Camarão formando a letra C */}
      <path 
        d="M 90 35 
           C 80 10, 40 10, 25 40 
           C 10 70, 20 100, 50 105 
           C 75 108, 90 95, 95 80" 
        fill="none" 
        stroke="url(#shrimpGradient)" 
        strokeWidth="16" 
        strokeLinecap="round"
        filter="url(#softGlow)"
      />

      {/* Segmentos do corpo (linhas brancas para dar textura de casca) */}
      <path d="M 32 32 C 28 36, 25 40, 24 45" stroke="white" strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round" />
      <path d="M 20 60 C 22 60, 25 60, 28 60" stroke="white" strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round" />
      <path d="M 28 85 C 32 88, 36 90, 40 92" stroke="white" strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round" />

      {/* Cabeça/Olho (Início do C) */}
      <circle cx="82" cy="38" r="5" fill="#003366" />
      <circle cx="84" cy="36" r="1.5" fill="white" />
      
      {/* Detalhe da Cauda (Fim do C) */}
      <path d="M 95 80 L 88 82 L 94 86" fill="url(#shrimpGradient)" opacity="0.8" />
    </svg>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [preselectedCustomerId, setPreselectedCustomerId] = useState<string | null>(null);
  const [replacingSaleId, setReplacingSaleId] = useState<string | null>(null);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [settings, setSettings] = useState<Settings>({
    theme: AppTheme.LIGHT,
    contactIntervalDays: 85,
    userName: 'Vendedor Master',
    email: 'contato@controlarva.com'
  });

  useEffect(() => {
    const savedCustomers = localStorage.getItem('controlarva_customers');
    const savedSales = localStorage.getItem('controlarva_sales');
    const savedVisits = localStorage.getItem('controlarva_visits');
    const savedGoals = localStorage.getItem('controlarva_goals');
    const savedSettings = localStorage.getItem('controlarva_settings');
    const savedAuth = localStorage.getItem('controlarva_auth');

    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedVisits) setVisits(JSON.parse(savedVisits));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedAuth) setIsAuthenticated(JSON.parse(savedAuth));
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      if (parsed.theme === AppTheme.DARK) document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('controlarva_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('controlarva_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('controlarva_visits', JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem('controlarva_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('controlarva_auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('controlarva_settings', JSON.stringify(settings));
    if (settings.theme === AppTheme.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === AppTheme.LIGHT ? AppTheme.DARK : AppTheme.LIGHT }));
  };

  const logout = () => setIsAuthenticated(false);

  const navigateToNewSale = (customerId: string, saleIdToReplace?: string) => {
    setPreselectedCustomerId(customerId);
    if (saleIdToReplace) {
      setReplacingSaleId(saleIdToReplace);
    }
    setActiveTab('sales');
  };

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} settings={settings} />;

  const navItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'customers', label: 'Meus Clientes', icon: Users },
    { id: 'sales', label: 'Vendas Realizadas', icon: ShoppingCart },
    { id: 'aftersales', label: 'Pós-Venda', icon: RefreshCcw },
    { id: 'visits', label: 'Visitas', icon: MapPin },
    { id: 'reports', label: 'Relatórios PDF', icon: BarChart3 },
    { id: 'settings', label: 'Minha Conta', icon: SettingsIcon },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${settings.theme === AppTheme.DARK ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-slate-50 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="text-sky-600 dark:text-sky-400">
                <ShrimpLogoIcon className="w-14 h-14" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter text-sky-700 dark:text-sky-400 leading-none">Controlarva</span>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mt-1">Gestão de Larvas</span>
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-6 space-y-2">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id as Tab); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${activeTab === item.id ? 'bg-sky-600 text-white shadow-xl shadow-sky-600/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                <item.icon size={22} className={activeTab === item.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                <span className="font-black text-sm uppercase tracking-wide">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-6 border-t border-slate-50 dark:border-slate-700 space-y-3">
            <button onClick={toggleTheme} className="w-full flex items-center gap-4 px-5 py-3 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-bold text-sm">
              {settings.theme === AppTheme.LIGHT ? <Moon size={20} /> : <Sun size={20} />}
              MODO {settings.theme === AppTheme.LIGHT ? 'ESCURO' : 'CLARO'}
            </button>
            <button onClick={logout} className="w-full flex items-center gap-4 px-5 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-bold text-sm">
              <LogOut size={20} /> SAIR DO APP
            </button>
          </div>
        </div>
      </aside>
      <main className="lg:ml-72 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Menu size={24} /></button>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{navItems.find(n => n.id === activeTab)?.label}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black uppercase text-sky-600 dark:text-sky-400 tracking-widest">{settings.userName}</p>
              <p className="text-[10px] text-slate-400 font-bold">ADMINISTRADOR</p>
            </div>
            <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center text-sky-600 dark:text-sky-400 font-black border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden">
               {settings.userName.charAt(0)}
            </div>
          </div>
        </header>
        <div className="p-8 flex-1 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <DashboardView customers={customers} sales={sales} goals={goals} setGoals={setGoals} setActiveTab={setActiveTab} />}
          {activeTab === 'customers' && <CustomersView customers={customers} setCustomers={setCustomers} />}
          {activeTab === 'sales' && (
            <SalesView 
              sales={sales} 
              setSales={setSales} 
              customers={customers} 
              preselectedCustomerId={preselectedCustomerId} 
              replacingSaleId={replacingSaleId}
              onSaleCreated={() => {
                setPreselectedCustomerId(null);
                setReplacingSaleId(null);
              }} 
            />
          )}
          {activeTab === 'aftersales' && <AfterSalesView sales={sales} setSales={setSales} customers={customers} interval={settings.contactIntervalDays} onNewSaleClick={navigateToNewSale} />}
          {activeTab === 'visits' && <VisitsView visits={visits} setVisits={setVisits} />}
          {activeTab === 'reports' && <ReportsView sales={sales} customers={customers} />}
          {activeTab === 'settings' && <SettingsView settings={settings} setSettings={setSettings} />}
        </div>
      </main>
    </div>
  );
};

export default App;
