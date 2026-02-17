
import React, { useState } from 'react';
import { Customer } from '../types';

interface CustomerViewProps {
  customers: Customer[];
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

const CustomerView: React.FC<CustomerViewProps> = ({ customers, onSaveCustomer, onDeleteCustomer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState<Customer>({
    id: '',
    name: '',
    phone: '',
    email: '',
    document: ''
  });

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData(customer);
    } else {
      setEditingCustomer(null);
      setFormData({
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        phone: '',
        email: '',
        document: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Nome e Telefone são obrigatórios.");
      return;
    }
    onSaveCustomer(formData);
    setIsModalOpen(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) ||
    c.document?.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800">👥 Cadastro de Clientes</h2>
            <p className="text-xs text-slate-500 mt-1">Gerencie sua base de contatos e fidelização</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Buscar cliente..."
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-500 outline-none flex-1 md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button 
              onClick={() => openModal()}
              className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 flex items-center gap-2 whitespace-nowrap"
            >
              <span className="text-xl">+</span> Novo Cliente
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Nome do Cliente</th>
                <th className="px-6 py-4">Telefone / WhatsApp</th>
                <th className="px-6 py-4">CPF / Documento</th>
                <th className="px-6 py-4">E-mail</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-800 text-sm">{customer.name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm font-medium">{customer.phone}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-mono">{customer.document || '---'}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{customer.email || '---'}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => openModal(customer)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">✏️</button>
                      <button onClick={() => onDeleteCustomer(customer.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Nenhum cliente encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-900">{editingCustomer ? '📝 Editar Cliente' : '👥 Novo Cliente'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-2xl">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Nome Completo *</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Telefone / WhatsApp *</label>
                <input 
                  required
                  type="text" 
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">CPF / Documento</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm font-mono"
                  value={formData.document}
                  onChange={e => setFormData({...formData, document: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">E-mail</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-100 text-slate-500 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-orange-600 text-white font-black hover:bg-orange-700 shadow-xl shadow-orange-100 transition-all active:scale-95"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerView;
