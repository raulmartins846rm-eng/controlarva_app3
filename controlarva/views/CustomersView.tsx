
import React, { useState } from 'react';
import { UserPlus, Search, Edit2, Trash2, X, Save, AlertCircle, AlertTriangle, Trash } from 'lucide-react';
import { Customer } from '../types';

interface CustomersViewProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const CustomersView: React.FC<CustomersViewProps> = ({ customers, setCustomers }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'createdAt'>>({
    name: '',
    taxId: '',
    address: '',
    phone: '',
    email: '',
    pondCount: 0,
    pondsWithLarvae: 0,
    observations: ''
  });

  // Mask function for CPF/CNPJ
  const maskTaxId = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length <= 11) {
      return v
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      return v
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 18);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setCustomers(prev => prev.map(c => c.id === editingId ? { ...formData, id: c.id, createdAt: c.createdAt } : c));
    } else {
      const newCustomer: Customer = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now()
      };
      setCustomers(prev => [...prev, newCustomer]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      taxId: '',
      address: '',
      phone: '',
      email: '',
      pondCount: 0,
      pondsWithLarvae: 0,
      observations: ''
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      taxId: customer.taxId,
      address: customer.address,
      phone: customer.phone,
      email: customer.email,
      pondCount: customer.pondCount,
      pondsWithLarvae: customer.pondsWithLarvae,
      observations: customer.observations || ''
    });
    setEditingId(customer.id);
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setCustomers(prev => prev.filter(c => c.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.taxId.includes(searchTerm) ||
    c.phone.includes(searchTerm) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Pesquisar por nome, CPF/CNPJ, telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-xl shadow-lg shadow-sky-500/20 transition-all font-bold"
        >
          <UserPlus size={18} />
          Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 hover:shadow-md transition-shadow group relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg group-hover:text-sky-500 transition-colors">{customer.name}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{customer.taxId || 'Sem Documento'}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(customer)} className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-all">
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(customer.id)} 
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  title="Excluir Cliente"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Telefone:</span>
                <span className="font-medium">{customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-medium truncate ml-4">{customer.email || 'Não informado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Viveiros (Total/Larvi):</span>
                <span className="font-medium text-sky-600">{customer.pondCount} / {customer.pondsWithLarvae}</span>
              </div>
              <div className="pt-3 border-t border-slate-50 dark:border-slate-700 text-slate-400 text-xs truncate">
                {customer.address}
              </div>
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 text-slate-400">
              <Search size={32} />
            </div>
            <p className="text-slate-500">Nenhum cliente encontrado com os critérios de busca.</p>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle size={32} />
              </div>
              
              <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white uppercase tracking-tight">Tem certeza?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 px-4 leading-relaxed font-medium">
                Você está prestes a excluir o cadastro deste cliente. 
                <br />
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest mt-3 block">
                  Esta ação é permanente e não poderá ser desfeita.
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
                  <Trash size={16} /> Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {editingId ? <Edit2 size={20} className="text-sky-500" /> : <UserPlus size={20} className="text-sky-500" />}
                {editingId ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">Nome Completo *</label>
                  <input
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="João Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">CPF ou CNPJ</label>
                  <input
                    maxLength={18}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                    placeholder="000.000.000-00"
                    value={formData.taxId}
                    onChange={(e) => setFormData({...formData, taxId: maskTaxId(e.target.value)})}
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">Endereço Completo *</label>
                  <input
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">Telefone *</label>
                  <input
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">E-mail</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="exemplo@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">Total de Viveiros</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={formData.pondCount || ''}
                    onChange={(e) => setFormData({...formData, pondCount: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">Viveiros com Larvi</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={formData.pondsWithLarvae || ''}
                    onChange={(e) => setFormData({...formData, pondsWithLarvae: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">Observações</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Informações adicionais importantes..."
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors uppercase text-xs tracking-widest"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] uppercase text-xs tracking-widest"
                >
                  <Save size={18} />
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersView;
