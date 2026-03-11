import React, { useState } from 'react';
import { Debt, DebtPayment } from '../types';

interface ReceivablesViewProps {
  debts: Debt[];
  onPayDebt: (debtId: string, payment: DebtPayment) => void;
  onDeleteDebt: (debtId: string) => void;
}

const ReceivablesView: React.FC<ReceivablesViewProps> = ({ debts, onPayDebt, onDeleteDebt }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('pending');
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');

  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         debt.saleId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || debt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPending = debts.reduce((sum, d) => d.status === 'pending' ? sum + d.remainingAmount : sum, 0);

  const handlePayment = () => {
    if (!selectedDebt || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Por favor, insira um valor válido.");
      return;
    }

    if (amount > selectedDebt.remainingAmount) {
      if (!confirm(`O valor R$ ${amount.toFixed(2)} é maior que a dívida R$ ${selectedDebt.remainingAmount.toFixed(2)}. Deseja prosseguir e quitar a dívida?`)) {
        return;
      }
    }

    const payment: DebtPayment = {
      id: Math.random().toString(36).substr(2, 9),
      amount: Math.min(amount, selectedDebt.remainingAmount),
      date: Date.now(),
      method: paymentMethod
    };

    onPayDebt(selectedDebt.id, payment);
    setPaymentAmount('');
    setSelectedDebt(null);
    alert("Pagamento registrado com sucesso!");
  };

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-600 p-8 rounded-[40px] text-white shadow-xl shadow-orange-200 dark:shadow-none">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total a Receber</p>
          <h3 className="text-3xl font-black mt-2">R$ {totalPending.toFixed(2)}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Contas Pendentes</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {debts.filter(d => d.status === 'pending').length}
          </h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total de Clientes</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {new Set(debts.map(d => d.customerId)).size}
          </h3>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por cliente ou código da venda..." 
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white outline-none focus:border-orange-500 font-bold"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'paid'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-4 rounded-2xl font-black uppercase text-[10px] transition-all ${
                filterStatus === status 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 hover:bg-slate-200'
              }`}
            >
              {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : 'Quitados'}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Contas */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-6">Cliente</th>
                <th className="px-8 py-6">Venda</th>
                <th className="px-8 py-6">Data</th>
                <th className="px-8 py-6">Valor Total</th>
                <th className="px-8 py-6">Restante</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDebts.map(debt => (
                <tr key={debt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white">{debt.customerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {debt.customerId}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      #{debt.saleId}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs text-slate-500">
                    {new Date(debt.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-8 py-6 font-bold text-slate-900 dark:text-white">
                    R$ {debt.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-8 py-6 font-black text-orange-600">
                    R$ {debt.remainingAmount.toFixed(2)}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                      debt.status === 'paid' 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {debt.status === 'paid' ? 'Quitada' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                      {debt.status === 'pending' && (
                        <button 
                          onClick={() => setSelectedDebt(debt)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 dark:shadow-none"
                        >
                          Pagar
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          if (confirm("Deseja ver o histórico de pagamentos desta conta?")) {
                            alert(debt.payments.length > 0 
                              ? debt.payments.map(p => `${new Date(p.date).toLocaleDateString()} - R$ ${p.amount.toFixed(2)} (${p.method})`).join('\n')
                              : "Nenhum pagamento realizado ainda."
                            );
                          }
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                        title="Histórico"
                      >
                        📜
                      </button>
                      <button 
                        onClick={() => onDeleteDebt(debt.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-xl transition-all"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDebts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-slate-400 italic">
                    Nenhuma conta encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Pagamento */}
      {selectedDebt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-md p-10 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Registrar Pagamento</h3>
              <button onClick={() => setSelectedDebt(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-2xl">✕</button>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Cliente</p>
                <p className="font-bold text-slate-900 dark:text-white">{selectedDebt.customerName}</p>
                <div className="flex justify-between mt-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Total</p>
                    <p className="font-bold text-slate-900 dark:text-white">R$ {selectedDebt.totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-orange-400 uppercase">Restante</p>
                    <p className="font-black text-orange-600">R$ {selectedDebt.remainingAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Valor do Pagamento</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white outline-none focus:border-orange-500 font-black text-xl"
                      placeholder="0,00"
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => setPaymentAmount(selectedDebt.remainingAmount.toString())}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase rounded-lg text-slate-500 hover:bg-slate-200"
                    >
                      Quitar Total
                    </button>
                    <button 
                      onClick={() => setPaymentAmount((selectedDebt.remainingAmount / 2).toFixed(2))}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase rounded-lg text-slate-500 hover:bg-slate-200"
                    >
                      Pagar Metade
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Forma de Pagamento</label>
                  <select 
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white outline-none focus:border-orange-500 font-bold appearance-none"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                  >
                    <option>Dinheiro</option>
                    <option>Pix</option>
                    <option>Cartão de Débito</option>
                    <option>Cartão de Crédito</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                className="w-full py-5 bg-orange-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-orange-100 dark:shadow-none hover:bg-orange-700 transition-all active:scale-[0.98] mt-4"
              >
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivablesView;
