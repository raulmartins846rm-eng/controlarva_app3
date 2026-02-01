
import React, { useMemo, useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  ArrowUpRight, 
  AlertCircle, 
  Clock,
  ChevronRight,
  Target,
  Plus,
  Calendar,
  DollarSign,
  Layers,
  Save,
  X,
  Edit3,
  Trophy,
  PartyPopper,
  LineChart as LineChartIcon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { Customer, Sale, Tab, Goal } from '../types';
import { format, parseISO, isAfter, startOfDay, isSameDay, eachDayOfInterval } from 'date-fns';

interface DashboardProps {
  customers: Customer[];
  sales: Sale[];
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  setActiveTab: (tab: Tab) => void;
}

const DashboardView: React.FC<DashboardProps> = ({ customers, sales, goals, setGoals, setActiveTab }) => {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalForm, setGoalForm] = useState<Omit<Goal, 'id' | 'createdAt'>>({
    targetLarvae: 0,
    targetRevenue: 0,
    deadline: format(new Date(), 'yyyy-MM-dd')
  });

  const [displayTargetQty, setDisplayTargetQty] = useState('');
  const [displayTargetRev, setDisplayTargetRev] = useState('');

  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((acc, s) => acc + s.totalValue, 0);
    const totalLarvae = sales.reduce((acc, s) => acc + s.larvaeQuantity, 0);
    const activeCustomers = customers.length;
    
    const sortedSales = [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    const today = new Date();
    const needsContact = sales.filter(s => {
      const saleDate = new Date(s.date);
      const diffTime = Math.abs(today.getTime() - saleDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 85 && !s.dismissedFromAfterSales;
    }).length;

    return { totalRevenue, totalLarvae, activeCustomers, sortedSales, needsContact };
  }, [customers, sales]);

  const currentGoal = useMemo(() => {
    if (goals.length === 0) return null;
    return [...goals].sort((a, b) => b.createdAt - a.createdAt)[0];
  }, [goals]);

  // Dados para o Gráfico de Linha de Evolução da Meta
  const goalEvolutionData = useMemo(() => {
    if (!currentGoal) return [];

    const goalStart = startOfDay(new Date(currentGoal.createdAt));
    const today = startOfDay(new Date());
    
    // Filtra vendas que ocorreram após a criação da meta
    const goalSales = sales.filter(s => {
      const saleDate = parseISO(s.date);
      return isAfter(saleDate, goalStart) || isSameDay(saleDate, goalStart);
    }).sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

    // Se não houver vendas após a meta, mostra apenas o ponto inicial
    if (goalSales.length === 0) {
      return [{ date: format(goalStart, 'dd/MM'), progresso: 0, meta: currentGoal.targetLarvae }];
    }

    let cumulativeLarvae = 0;
    const dataPoints: any[] = [];
    
    // Ponto zero (dia da criação da meta)
    dataPoints.push({
      date: format(goalStart, 'dd/MM'),
      progresso: 0,
      meta: currentGoal.targetLarvae
    });

    goalSales.forEach(sale => {
      cumulativeLarvae += sale.larvaeQuantity;
      dataPoints.push({
        date: format(parseISO(sale.date), 'dd/MM'),
        progresso: cumulativeLarvae,
        meta: currentGoal.targetLarvae
      });
    });

    return dataPoints;
  }, [currentGoal, sales]);

  const maskQuantity = (value: string) => {
    const v = value.replace(/\D/g, '');
    return v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const maskCurrency = (value: string | number) => {
    let v = typeof value === 'number' ? (value * 100).toFixed(0).toString() : value.replace(/\D/g, '');
    if (v === '') return '';
    v = (Number(v) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return v;
  };

  const handleOpenGoalModal = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setGoalForm({
        targetLarvae: goal.targetLarvae,
        targetRevenue: goal.targetRevenue,
        deadline: goal.deadline
      });
      setDisplayTargetQty(maskQuantity(goal.targetLarvae.toString()));
      setDisplayTargetRev(maskCurrency(goal.targetRevenue));
    } else {
      setEditingGoal(null);
      setGoalForm({
        targetLarvae: 0,
        targetRevenue: 0,
        deadline: format(new Date(), 'yyyy-MM-dd')
      });
      setDisplayTargetQty('');
      setDisplayTargetRev('');
    }
    setIsGoalModalOpen(true);
  };

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = parseInt(rawValue) || 0;
    setDisplayTargetQty(maskQuantity(e.target.value));
    setGoalForm({ ...goalForm, targetLarvae: numericValue });
  };

  const handleRevChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = (parseFloat(rawValue) / 100) || 0;
    setDisplayTargetRev(maskCurrency(e.target.value));
    setGoalForm({ ...goalForm, targetRevenue: numericValue });
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoal) {
      setGoals(prev => prev.map(g => g.id === editingGoal.id ? { ...g, ...goalForm } : g));
    } else {
      const newGoal: Goal = {
        ...goalForm,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now()
      };
      setGoals(prev => [...prev, newGoal]);
    }
    setIsGoalModalOpen(false);
  };

  const cards = [
    { label: 'Vendas Totais', value: `R$ ${stats.totalRevenue.toLocaleString()}`, icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Larvas Vendidas', value: `${stats.totalLarvae.toLocaleString()} mil`, icon: TrendingUp, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Total Clientes', value: stats.activeCustomers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Acompanhamentos', value: stats.needsContact, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Seção de Metas Atualizada */}
      <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden relative">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-2xl">
              <Target size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Monitoramento de Metas</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Acompanhe seu progresso rumo ao objetivo</p>
            </div>
          </div>
          <button 
            onClick={() => handleOpenGoalModal()}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-sky-600/20 transition-all font-black text-xs uppercase tracking-widest active:scale-95"
          >
            <Plus size={16} /> Nova Meta
          </button>
        </div>

        <div className="w-full">
          {currentGoal ? (
            (() => {
              const larvaeProgress = Math.min((stats.totalLarvae / currentGoal.targetLarvae) * 100, 100) || 0;
              const revenueProgress = Math.min((stats.totalRevenue / currentGoal.targetRevenue) * 100, 100) || 0;
              const isGoalMet = larvaeProgress >= 100 && revenueProgress >= 100;
              const isExpired = isAfter(new Date(), parseISO(currentGoal.deadline)) && !isGoalMet;

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Coluna Esquerda: Progresso e Celebração */}
                  <div className="lg:col-span-7 space-y-6">
                    {isGoalMet && (
                      <div className="p-6 bg-emerald-500 rounded-3xl shadow-xl shadow-emerald-500/20 text-white flex items-center gap-6 animate-in zoom-in-95 duration-500 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                        <div className="bg-white/20 p-4 rounded-2xl flex-shrink-0">
                          <PartyPopper size={36} className="animate-bounce" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black uppercase leading-tight italic">Meta Batida! Parabéns!</h3>
                          <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Você superou todos os desafios propostos.</p>
                        </div>
                        <Trophy size={80} className="absolute -right-4 -bottom-4 opacity-20 rotate-12" />
                      </div>
                    )}

                    <div className={`p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 relative group transition-all ${isGoalMet ? 'border-emerald-300 ring-4 ring-emerald-500/10' : ''}`}>
                      <button 
                        onClick={() => handleOpenGoalModal(currentGoal)}
                        className="absolute top-6 right-6 p-2.5 text-slate-300 hover:text-sky-500 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all shadow-sm opacity-0 group-hover:opacity-100"
                      >
                        <Edit3 size={18} />
                      </button>
                      
                      <div className="flex items-center gap-3 mb-8">
                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${isExpired ? 'bg-red-100 text-red-600' : isGoalMet ? 'bg-emerald-100 text-emerald-600' : 'bg-sky-500 text-white'}`}>
                          {isExpired ? 'Prazo Encerrado' : isGoalMet ? 'Meta Concluída!' : `Vigência até: ${format(parseISO(currentGoal.deadline), 'dd/MM/yyyy')}`}
                        </span>
                      </div>

                      <div className="space-y-10">
                        {/* Termômetro Larvas */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-end">
                            <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest flex items-center gap-2">
                              <Layers size={14} className="text-sky-500" /> Progresso de Larvas
                            </label>
                            <span className={`text-xl font-black ${larvaeProgress >= 100 ? 'text-emerald-500' : 'text-sky-600'}`}>{larvaeProgress.toFixed(1)}%</span>
                          </div>
                          <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner p-1">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 shadow-sm relative overflow-hidden ${larvaeProgress >= 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600'}`}
                              style={{ width: `${larvaeProgress}%` }}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                            </div>
                          </div>
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-slate-400">Alcance</span>
                            <span className="text-slate-600 dark:text-slate-300">
                              {stats.totalLarvae.toLocaleString()} / {currentGoal.targetLarvae.toLocaleString()} mil
                            </span>
                          </div>
                        </div>

                        {/* Termômetro Receita */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-end">
                            <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest flex items-center gap-2">
                              <DollarSign size={14} className="text-emerald-500" /> Progresso de Receita
                            </label>
                            <span className={`text-xl font-black ${revenueProgress >= 100 ? 'text-emerald-500' : 'text-emerald-600'}`}>{revenueProgress.toFixed(1)}%</span>
                          </div>
                          <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner p-1">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 shadow-sm relative overflow-hidden ${revenueProgress >= 100 ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-teal-400 to-emerald-500'}`}
                              style={{ width: `${revenueProgress}%` }}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                            </div>
                          </div>
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-slate-400">Alcance</span>
                            <span className="text-slate-600 dark:text-slate-300">
                              R$ {stats.totalRevenue.toLocaleString()} / R$ {currentGoal.targetRevenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coluna Direita: Gráfico de Evolução de Linha */}
                  <div className="lg:col-span-5 h-full min-h-[400px] flex flex-col">
                    <div className="flex-1 bg-slate-50 dark:bg-slate-900/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <LineChartIcon size={14} className="text-sky-500" /> Tendência de Larvas
                        </h3>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-sky-500" />
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Real</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-slate-300" />
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Objetivo</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={goalEvolutionData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                              dataKey="date" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fill: '#94a3b8', fontSize: 10}} 
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fill: '#94a3b8', fontSize: 10}}
                              hide
                            />
                            <Tooltip 
                              contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px'}} 
                              formatter={(value: any) => [`${value.toLocaleString()} mil`, 'Volume']}
                            />
                            <ReferenceLine y={currentGoal.targetLarvae} stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth={2} />
                            <Line 
                              type="monotone" 
                              dataKey="progresso" 
                              stroke="#0ea5e9" 
                              strokeWidth={4} 
                              dot={{r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff'}}
                              activeDot={{r: 8, strokeWidth: 0}}
                              animationDuration={2000}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-center text-[9px] font-bold text-slate-400 uppercase mt-4 tracking-tighter italic">Evolução acumulada desde o início da meta</p>
                    </div>
                  </div>

                </div>
              );
            })()
          ) : (
            <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm flex items-center justify-center mb-6 text-slate-200">
                <Target size={40} />
              </div>
              <p className="font-black text-sm uppercase tracking-[0.2em] text-slate-400 mb-2">Nenhuma meta ativa</p>
              <p className="text-xs text-slate-500 mb-6">Defina agora um objetivo para acompanhar seu crescimento.</p>
              <button onClick={() => handleOpenGoalModal()} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-8 py-3 rounded-2xl shadow-sm font-black text-[10px] uppercase tracking-widest hover:bg-sky-50 transition-colors text-sky-600">Criar minha primeira meta</button>
            </div>
          )}
        </div>
      </section>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon size={24} />
              </div>
              <div className="flex items-center text-emerald-500 text-xs font-bold">
                <ArrowUpRight size={14} /> Dinâmico
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{card.label}</h3>
              <p className="text-2xl font-bold mt-1 tracking-tight">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Sales Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-bold text-lg">Vendas Recentes</h3>
            <button 
              onClick={() => setActiveTab('sales')}
              className="text-sky-500 text-sm font-semibold hover:underline flex items-center gap-1"
            >
              Ver Todas <ChevronRight size={16} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Quantidade</th>
                  <th className="px-6 py-4">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {stats.sortedSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{sale.customerName}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{format(new Date(sale.date), 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4">{sale.larvaeQuantity.toLocaleString()} mil</td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">R$ {sale.totalValue.toLocaleString()}</td>
                  </tr>
                ))}
                {stats.sortedSales.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhuma venda registrada ainda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Proximos Contatos */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-bold text-lg">Próximos Contatos</h3>
            <button 
              onClick={() => setActiveTab('aftersales')}
              className="text-sky-500 text-sm font-semibold hover:underline"
            >
              Ver Agenda
            </button>
          </div>
          <div className="p-4 space-y-4">
            {stats.sortedSales.slice(0, 4).map((sale) => (
              <div key={`contact-${sale.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600">
                  <Clock size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm group-hover:text-sky-500 transition-colors">{sale.customerName}</h4>
                  <p className="text-xs text-slate-500">Última venda: {format(new Date(sale.date), 'dd/MM')}</p>
                </div>
                <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded-full uppercase">
                  Pendente
                </div>
              </div>
            ))}
            {stats.sortedSales.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-10">Sem tarefas de acompanhamento.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Nova Meta */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
            <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-2xl font-black flex items-center gap-3 text-sky-600 uppercase tracking-tighter">
                <Target size={24} /> {editingGoal ? 'Editar Meta' : 'Nova Meta Ativa'}
              </h2>
              <button onClick={() => setIsGoalModalOpen(false)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveGoal} className="p-8 space-y-6">
              {!editingGoal && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle size={14} /> Aviso de Substituição
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Ao salvar esta meta, ela passará a ser a meta principal exibida no seu painel.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Qtd. de Larvas (Milheiros)</label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      className="w-full pl-4 pr-12 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-black text-lg"
                      placeholder="Ex: 5.000"
                      value={displayTargetQty}
                      onChange={handleQtyChange}
                    />
                    <Layers size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Valor Total Desejado (R$)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 font-black">R$</span>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-black text-lg text-emerald-600"
                      placeholder="0,00"
                      value={displayTargetRev}
                      onChange={handleRevChange}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Prazo para Bater a Meta</label>
                  <div className="relative">
                    <input
                      required
                      type="date"
                      className="w-full pl-4 pr-12 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                      value={goalForm.deadline}
                      onChange={(e) => setGoalForm({...goalForm, deadline: e.target.value})}
                    />
                    <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors uppercase text-xs tracking-widest"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-sky-600 hover:bg-sky-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-sky-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] uppercase text-xs tracking-widest"
                >
                  <Save size={18} />
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default DashboardView;
