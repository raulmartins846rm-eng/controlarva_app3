
import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Search, 
  PlusCircle, 
  Calendar, 
  Trash2, 
  X, 
  Save, 
  Filter,
  AlertTriangle,
  ClipboardList,
  MessageSquare
} from 'lucide-react';
import { Visit } from '../types';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

interface VisitsViewProps {
  visits: Visit[];
  setVisits: React.Dispatch<React.SetStateAction<Visit[]>>;
}

const VisitsView: React.FC<VisitsViewProps> = ({ visits, setVisits }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Visit, 'id'>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    name: '',
    region: '',
    pondCount: 0,
    pondsWithLarvae: 0,
    area: '',
    stockedQuantity: '',
    density: '',
    observations: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newVisit: Visit = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setVisits(prev => [newVisit, ...prev]);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      name: '',
      region: '',
      pondCount: 0,
      pondsWithLarvae: 0,
      area: '',
      stockedQuantity: '',
      density: '',
      observations: ''
    });
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    setVisits(prev => prev.filter(v => v.id !== id));
    setDeleteConfirmId(null);
  };

  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      const visitDate = parseISO(v.date);
      const withinDates = isWithinInterval(visitDate, {
        start: startOfDay(parseISO(startDate)),
        end: endOfDay(parseISO(endDate))
      });
      const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           v.region.toLowerCase().includes(searchTerm.toLowerCase());
      
      return withinDates && matchesSearch;
    });
  }, [visits, startDate, endDate, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Pesquisar por nome ou região..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 px-2">
                <Calendar size={14} className="text-slate-400" />
                <input 
                  type="date" 
                  className="bg-transparent border-none text-xs font-bold outline-none" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="text-slate-300">|</div>
              <div className="flex items-center gap-1.5 px-2">
                <input 
                  type="date" 
                  className="bg-transparent border-none text-xs font-bold outline-none" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={() => setIsFormOpen(true)}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-sky-600/20 transition-all font-bold"
            >
              <PlusCircle size={18} />
              Nova Visita
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Região</th>
                <th className="px-6 py-4 text-center">Viveiros (T/L)</th>
                <th className="px-6 py-4 text-center">Área</th>
                <th className="px-6 py-4 text-center">Qtd. Povoada</th>
                <th className="px-6 py-4 text-center">Densidade</th>
                <th className="px-6 py-4 text-center">OBS</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
              {filteredVisits.map((visit) => (
                <tr key={visit.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-500">
                    {format(parseISO(visit.date), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{visit.name}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{visit.region}</td>
                  <td className="px-6 py-4 text-center font-bold text-sky-600">
                    {visit.pondCount} / {visit.pondsWithLarvae}
                  </td>
                  <td className="px-6 py-4 text-center">{visit.area}</td>
                  <td className="px-6 py-4 text-center">{visit.stockedQuantity}</td>
                  <td className="px-6 py-4 text-center font-black text-emerald-600">{visit.density}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="relative group/obs flex justify-center">
                      {visit.observations && visit.observations.trim() !== '' ? (
                        <>
                          <MessageSquare size={18} className="text-sky-500 cursor-help transition-transform hover:scale-110" />
                          <div className="absolute bottom-full mb-3 hidden group-hover/obs:block z-50 w-64 p-3 bg-slate-800 dark:bg-slate-900 text-white text-[11px] rounded-2xl shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                            <p className="font-bold mb-1 text-sky-400 uppercase tracking-widest text-[9px]">Observações:</p>
                            <p className="leading-relaxed whitespace-pre-wrap">{visit.observations}</p>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800 dark:border-t-slate-900"></div>
                          </div>
                        </>
                      ) : (
                        <MessageSquare size={18} className="text-slate-300 dark:text-slate-600 opacity-50" title="Sem observações" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setDeleteConfirmId(visit.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredVisits.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-20 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <ClipboardList size={40} className="text-slate-200 mb-2" />
                      Nenhum registro de visita encontrado no período.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100 dark:border-slate-700">
            <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-2xl font-black flex items-center gap-3 text-sky-600">
                <MapPin size={24} /> Registrar Visita
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Data da Visita</label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Nome do Prospect</label>
                  <input
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                    placeholder="João da Fazenda..."
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Região</label>
                  <input
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                    placeholder="Ex: Baixo Jaguaribe"
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Total Viveiros</label>
                    <input
                      required
                      type="number"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      value={formData.pondCount || ''}
                      onChange={(e) => setFormData({...formData, pondCount: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Com Larvas</label>
                    <input
                      required
                      type="number"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      value={formData.pondsWithLarvae || ''}
                      onChange={(e) => setFormData({...formData, pondsWithLarvae: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Área (ha/m²)</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Ex: 5ha"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Quant. Povoada</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Ex: 1.200 mil"
                    value={formData.stockedQuantity}
                    onChange={(e) => setFormData({...formData, stockedQuantity: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Densidade (L/m²)</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-black text-emerald-600"
                    placeholder="Ex: 25 L/m²"
                    value={formData.density}
                    onChange={(e) => setFormData({...formData, density: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Observações da Visita</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="O que foi conversado? Há interesse imediato?"
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors uppercase text-xs tracking-widest"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-sky-600 hover:bg-sky-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-sky-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] uppercase text-xs tracking-widest"
                >
                  <Save size={18} />
                  Salvar Visita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmação de Exclusão */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white uppercase tracking-tight">Confirmar Exclusão</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 px-4 leading-relaxed font-medium">
                Deseja remover este registro de visita permanentemente?
              </p>
              <div className="flex w-full gap-4">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 font-bold text-slate-500 uppercase text-xs tracking-widest">Cancelar</button>
                <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black shadow-xl shadow-red-500/30 uppercase text-xs tracking-widest">Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitsView;
