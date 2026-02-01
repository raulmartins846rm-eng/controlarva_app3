
import React, { useState, useMemo } from 'react';
import { Search, Calendar, Phone, MessageSquare, Clock, PlusCircle, Hourglass, X, Save, Trash2, AlertTriangle, Layers } from 'lucide-react';
import { Sale, Customer } from '../types';
import { format, differenceInDays, addDays, parseISO, isAfter, startOfDay } from 'date-fns';

interface AfterSalesViewProps {
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  customers: Customer[];
  interval: number;
  onNewSaleClick: (customerId: string, saleIdToReplace?: string) => void;
}

const AfterSalesView: React.FC<AfterSalesViewProps> = ({ sales, setSales, customers, interval, onNewSaleClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'waiting' | 'critical'>('all');
  const [postponeModal, setPostponeModal] = useState<{saleId: string, customerName: string} | null>(null);
  const [dismissModal, setDismissModal] = useState<{saleId: string, customerName: string} | null>(null);
  const [postponeDays, setPostponeDays] = useState('15');

  const processedItems = useMemo(() => {
    const today = startOfDay(new Date());
    
    return sales.filter(sale => !sale.dismissedFromAfterSales).map(sale => {
      const saleDate = parseISO(sale.date);
      const daysSinceSale = differenceInDays(today, saleDate);
      
      let status: 'safe' | 'waiting' | 'critical' = 'safe';
      const isExpired = daysSinceSale >= interval;
      
      const postponedUntil = sale.postponedUntil ? parseISO(sale.postponedUntil) : null;
      const isPostponedActive = postponedUntil && isAfter(postponedUntil, today);

      if (!isExpired) {
        status = 'safe'; 
      } else if (isPostponedActive) {
        status = 'waiting'; 
      } else {
        status = 'critical'; 
      }

      return {
        ...sale,
        daysSinceSale,
        status,
        postponedUntilDate: postponedUntil
      };
    }).filter(item => {
      const matchesSearch = item.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      // Ordenação: Do mais novo (menor dias decorridos / data maior) para o mais velho
      // a.daysSinceSale - b.daysSinceSale coloca os menores números (mais recentes) no topo
      return a.daysSinceSale - b.daysSinceSale;
    });
  }, [sales, searchTerm, statusFilter, interval]);

  const handlePostpone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postponeModal) return;
    const days = parseInt(postponeDays) || 0;
    const newDate = addDays(new Date(), days);
    setSales(prev => prev.map(s => 
      s.id === postponeModal.saleId ? { ...s, postponedUntil: format(newDate, 'yyyy-MM-dd') } : s
    ));
    setPostponeModal(null);
  };

  const handleConfirmDismiss = () => {
    if (!dismissModal) return;
    setSales(prev => prev.map(s => 
      s.id === dismissModal.saleId ? { ...s, dismissedFromAfterSales: true } : s
    ));
    setDismissModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Pesquisar cliente ou venda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
          <button onClick={() => setStatusFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${statusFilter === 'all' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
            Todos ({processedItems.length})
          </button>
          <button onClick={() => setStatusFilter('safe')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${statusFilter === 'safe' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-emerald-500 border border-emerald-100'}`}>
            <div className="w-2 h-2 rounded-full bg-emerald-400" /> Em Dia
          </button>
          <button onClick={() => setStatusFilter('waiting')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${statusFilter === 'waiting' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-amber-500 border border-amber-100'}`}>
            <div className="w-2 h-2 rounded-full bg-amber-400" /> Adiado
          </button>
          <button onClick={() => setStatusFilter('critical')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${statusFilter === 'critical' ? 'bg-red-500 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-red-500 border border-red-100'}`}>
            <div className="w-2 h-2 rounded-full bg-red-400" /> Contatar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedItems.map(item => {
          const statusColors = {
            safe: 'border-emerald-500 bg-emerald-50/20 text-emerald-700',
            waiting: 'border-amber-500 bg-amber-50/20 text-amber-700',
            critical: 'border-red-500 bg-red-50/20 text-red-700',
          };
          const statusBadges = {
            safe: 'bg-emerald-500',
            waiting: 'bg-amber-500',
            critical: 'bg-red-500',
          };

          return (
            <div key={item.id} className={`relative rounded-3xl border-l-[6px] shadow-sm p-6 bg-white dark:bg-slate-800 ${statusColors[item.status]} transition-all hover:scale-[1.02] border-t border-r border-b border-slate-100 dark:border-slate-700`}>
              <button 
                onClick={() => setDismissModal({ saleId: item.id, customerName: item.customerName })}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                title="Arquivar card"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex justify-between items-start mb-4 pr-8">
                <div>
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white leading-tight">{item.customerName}</h3>
                  <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase text-white ${statusBadges[item.status]}`}>
                    {item.status === 'safe' ? 'Dentro do Prazo' : item.status === 'waiting' ? 'Atendimento Adiado' : 'HORA DE CONTATAR'}
                  </div>
                </div>
                <div className={`p-3 rounded-2xl bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 ${item.status === 'safe' ? 'text-emerald-500' : item.status === 'waiting' ? 'text-amber-500' : 'text-red-500'}`}>
                  {item.status === 'safe' ? <Clock size={24} /> : item.status === 'waiting' ? <Hourglass size={24} /> : <Phone size={24} />}
                </div>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <div className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Layers size={10} /> {item.larvaeQuantity.toLocaleString()} Larvas
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500"><Calendar size={16} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Data da Venda</p>
                    <p className="font-bold text-slate-700 dark:text-slate-200">{format(parseISO(item.date), 'dd/MM/yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500"><Clock size={16} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Idade da Larva</p>
                    <p className="font-bold text-slate-700 dark:text-slate-200">{item.daysSinceSale} dias de povoamento</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => onNewSaleClick(item.customerId, item.id)} 
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 text-white font-black text-xs hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                  title="Realizar nova venda para este cliente e renovar o ciclo deste card"
                >
                  <PlusCircle size={14} /> NOVA VENDA
                </button>
                {item.status === 'critical' ? (
                  <button onClick={() => setPostponeModal({saleId: item.id, customerName: item.customerName})} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 text-white font-black text-xs hover:bg-amber-600 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"><Hourglass size={14} /> ADIAR</button>
                ) : (
                  <button onClick={() => window.open(`https://wa.me/${item.phone.replace(/\D/g,'')}`)} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-all"><MessageSquare size={14} /> WHATSAPP</button>
                )}
              </div>
            </div>
          );
        })}
        {processedItems.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 text-slate-400">
              <Clock size={32} />
            </div>
            <p className="text-slate-500">Nenhum acompanhamento pendente encontrado.</p>
          </div>
        )}
      </div>

      {/* Modal Confirmar Arquivamento do Card */}
      {dismissModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle size={32} />
              </div>
              
              <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">Deseja arquivar?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 px-4 leading-relaxed">
                O card desta venda de <strong>{dismissModal.customerName}</strong> sairá da lista de acompanhamento.
                <br /><br />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full">
                  O registro da venda permanece no sistema.
                </span>
              </p>
              
              <div className="flex w-full gap-4">
                <button 
                  onClick={() => setDismissModal(null)} 
                  className="flex-1 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95"
                >
                  CANCELAR
                </button>
                <button 
                  onClick={handleConfirmDismiss} 
                  className="flex-1 py-4 rounded-2xl bg-sky-600 text-white font-black hover:bg-sky-700 shadow-xl shadow-sky-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Save size={18} /> CONFIRMAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adiar */}
      {postponeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
                <Hourglass className="text-amber-500" /> Adiar Contato
              </h3>
              <button onClick={() => setPostponeModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-6">Dias extras para o próximo contato com <strong>{postponeModal.customerName}</strong>.</p>
            <form onSubmit={handlePostpone} className="space-y-6">
              <input type="number" autoFocus className="w-full text-4xl font-black text-center py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-amber-500 outline-none text-amber-600" value={postponeDays} onChange={(e) => setPostponeDays(e.target.value)} />
              <div className="flex gap-3">
                <button type="button" onClick={() => setPostponeModal(null)} className="flex-1 py-4 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold text-slate-500">CANCELAR</button>
                <button type="submit" className="flex-[2] py-4 rounded-2xl bg-amber-500 text-white font-black hover:bg-amber-600 shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2"><Save size={18} /> SALVAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AfterSalesView;
