
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, PlusCircle, Trash2, Calendar, CreditCard, ChevronDown, X, AlertTriangle, Trash, Calculator } from 'lucide-react';
import { Sale, Customer, PaymentType } from '../types';
import { format } from 'date-fns';

interface SalesViewProps {
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  customers: Customer[];
  preselectedCustomerId?: string | null;
  replacingSaleId?: string | null;
  onSaleCreated?: () => void;
}

const SalesView: React.FC<SalesViewProps> = ({ 
  sales, 
  setSales, 
  customers, 
  preselectedCustomerId, 
  replacingSaleId,
  onSaleCreated 
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Sale Form State
  const [formData, setFormData] = useState<Omit<Sale, 'id'>>({
    customerId: '',
    customerName: '',
    larvaeQuantity: 0,
    pricePerThousand: 0,
    totalValue: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentType: 'Dinheiro',
    pondsStocked: 0,
    phone: '',
    observations: ''
  });

  // Display states for masked inputs
  const [displayQty, setDisplayQty] = useState('');
  const [displayPricePerThousand, setDisplayPricePerThousand] = useState('');
  const [displayValue, setDisplayValue] = useState('');

  // Handle pre-selection from After Sales
  useEffect(() => {
    if (preselectedCustomerId) {
      const customer = customers.find(c => c.id === preselectedCustomerId);
      if (customer) {
        setFormData(prev => ({
          ...prev,
          customerId: customer.id,
          customerName: customer.name,
          phone: customer.phone
        }));
        setIsFormOpen(true);
      }
    }
  }, [preselectedCustomerId, customers]);

  // Mask function for Quantity (1.000)
  const maskQuantity = (value: string) => {
    const v = value.replace(/\D/g, '');
    return v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Mask function for Currency (1.250,50)
  const maskCurrency = (value: string | number) => {
    let v = typeof value === 'number' ? (value * 100).toFixed(0).toString() : value.replace(/\D/g, '');
    v = (Number(v) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return v;
  };

  // Auto-calculate total value: Qty (milheiros) * Price (per milheiro)
  useEffect(() => {
    const total = formData.larvaeQuantity * formData.pricePerThousand;
    setFormData(prev => ({ ...prev, totalValue: total }));
    setDisplayValue(maskCurrency(total));
  }, [formData.larvaeQuantity, formData.pricePerThousand]);

  const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customer = customers.find(c => c.id === e.target.value);
    if (customer) {
      setFormData({
        ...formData,
        customerId: customer.id,
        customerName: customer.name,
        phone: customer.phone
      });
    }
  };

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = parseInt(rawValue) || 0;
    setDisplayQty(maskQuantity(e.target.value));
    setFormData({ ...formData, larvaeQuantity: numericValue });
  };

  const handlePricePerThousandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = (parseFloat(rawValue) / 100) || 0;
    setDisplayPricePerThousand(maskCurrency(e.target.value));
    setFormData({ ...formData, pricePerThousand: numericValue });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = (parseFloat(rawValue) / 100) || 0;
    setDisplayValue(maskCurrency(e.target.value));
    setFormData({ ...formData, totalValue: numericValue });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) {
      alert('Por favor, selecione um cliente.');
      return;
    }

    const newSale: Sale = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9)
    };

    setSales(prev => {
      let updatedSales = [...prev, newSale];
      
      if (replacingSaleId) {
        updatedSales = updatedSales.map(s => 
          s.id === replacingSaleId ? { ...s, dismissedFromAfterSales: true } : s
        );
      }
      
      return updatedSales;
    });

    if (onSaleCreated) onSaleCreated();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      customerName: '',
      larvaeQuantity: 0,
      pricePerThousand: 0,
      totalValue: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      paymentType: 'Dinheiro',
      pondsStocked: 0,
      phone: '',
      observations: ''
    });
    setDisplayQty('');
    setDisplayPricePerThousand('');
    setDisplayValue('');
    setIsFormOpen(false);
    if (onSaleCreated) onSaleCreated();
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setSales(prev => prev.filter(s => s.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const filteredSales = sales.filter(s => 
    s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.paymentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Pesquisar por cliente, pagamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          <PlusCircle size={18} />
          Registrar Venda
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Qtd. (Milheiros)</th>
                <th className="px-6 py-4">Valor Total</th>
                <th className="px-6 py-4">Pagamento</th>
                <th className="px-6 py-4 text-center">Viveiros</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar size={14} />
                      {format(new Date(sale.date), 'dd/MM/yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-white">{sale.customerName}</p>
                    <p className="text-xs text-slate-400">{sale.phone}</p>
                  </td>
                  <td className="px-6 py-4 font-medium">{sale.larvaeQuantity.toLocaleString()} mil</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">R$ {sale.totalValue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300">
                      <CreditCard size={12} />
                      {sale.paymentType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                    {sale.pondsStocked}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleDeleteClick(sale.id)} 
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      title="Excluir venda"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <ShoppingCart size={40} className="text-slate-200 mb-2" />
                      Nenhum registro de venda encontrado.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-900/20">
              <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-600">
                <PlusCircle size={20} />
                {replacingSaleId ? 'Renovar Ciclo de Venda' : 'Registrar Nova Venda'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="text-slate-500" size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8">
              {replacingSaleId && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-700 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Renovação de Ciclo</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Esta venda substituirá o card atual de <strong>{formData.customerName}</strong> no pós-venda.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">Cliente</label>
                  <div className="relative">
                    <select
                      required
                      disabled={!!replacingSaleId}
                      className={`w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none ${replacingSaleId ? 'opacity-70 cursor-not-allowed' : ''}`}
                      value={formData.customerId}
                      onChange={handleSelectCustomer}
                    >
                      <option value="">Selecione um cliente...</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.taxId})</option>
                      ))}
                    </select>
                    {!replacingSaleId && <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">Quantidade (Milheiros)</label>
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="Ex: 1.000"
                    value={displayQty}
                    onChange={handleQtyChange}
                  />
                  <p className="text-[10px] text-slate-400 ml-1 italic">Insira o volume em milhares (ex: 500 para 500 mil larvas)</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">Valor do Milheiro (R$)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      placeholder="0,00"
                      value={displayPricePerThousand}
                      onChange={handlePricePerThousandChange}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1 flex items-center gap-1">
                    Valor Total (R$) <span className="text-[10px] text-emerald-500 font-black italic">(Cálculo: Qtd x Preço Milheiro)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">R$</span>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      className="w-full pl-12 pr-12 py-3 rounded-xl border border-emerald-100 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-900/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-black text-emerald-700 dark:text-emerald-400 text-lg shadow-inner"
                      placeholder="0,00"
                      value={displayValue}
                      onChange={handleValueChange}
                    />
                    <Calculator size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">Data da Venda</label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">Forma de Pagamento</label>
                  <div className="relative">
                    <select
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                      value={formData.paymentType}
                      onChange={(e) => setFormData({...formData, paymentType: e.target.value as PaymentType})}
                    >
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="PIX">PIX</option>
                      <option value="Cartão">Cartão</option>
                      <option value="Boleto">Boleto</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">Viveiros Povoados</label>
                  <input
                    required
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.pondsStocked || ''}
                    onChange={(e) => setFormData({...formData, pondsStocked: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">Telefone do Cliente</label>
                  <input
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                    value={formData.phone}
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">Observações</label>
                  <textarea
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Detalhes sobre a entrega, qualidade, etc."
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <ShoppingCart size={18} />
                  {replacingSaleId ? 'Renovar Ciclo' : 'Salvar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão Personalizado */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle size={32} />
              </div>
              
              <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white uppercase tracking-tight">Confirmação</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 px-4 leading-relaxed font-medium">
                Tem certeza que deseja excluir a venda?
                <br />
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest mt-3 block">
                  Esta ação não poderá ser desfeita.
                </span>
              </p>
              
              <div className="flex w-full gap-4">
                <button 
                  onClick={() => setDeleteConfirmId(null)} 
                  className="flex-1 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95 uppercase tracking-wider text-xs"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 shadow-xl shadow-red-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all uppercase tracking-wider text-xs"
                >
                  <Trash size={16} /> Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesView;
