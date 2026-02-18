
import React, { useState, useMemo } from 'react';
import { Sale } from '../types';

interface SalesHistoryViewProps {
  sales: Sale[];
  onOpenReceipt: (sale: Sale) => void;
  onEditSale: (sale: Sale) => void;
  onCancelSale: (saleId: string) => void;
}

const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({ sales, onOpenReceipt, onEditSale, onCancelSale }) => {
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.timestamp).toISOString().split('T')[0];
      const matchesDate = !filterDate || saleDate === filterDate;
      const matchesSearch = sale.id.toLowerCase().includes(search.toLowerCase()) || 
                           (sale.customerName?.toLowerCase().includes(search.toLowerCase()));
      
      return matchesDate && matchesSearch;
    });
  }, [sales, filterDate, search]);

  const dailyTotal = filteredSales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-end gap-6">
        <div className="flex-1">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            📜 Histórico de Transações
          </h3>
          <p className="text-xs text-slate-500 mt-1">Consulte vendas passadas e reimprima comprovantes</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase">Data da Venda</label>
            <input 
              type="date" 
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase">Buscar Código/Cliente</label>
            <input 
              type="text" 
              placeholder="Ex: 000001"
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 bg-white w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Resumo do Filtro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total no Período</p>
          <h3 className="text-2xl font-black text-white mt-1">R$ {dailyTotal.toFixed(2)}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Transações</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{filteredSales.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Ticket Médio</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            R$ {filteredSales.length > 0 ? (dailyTotal / filteredSales.length).toFixed(2) : '0.00'}
          </h3>
        </div>
      </div>

      {/* Tabela de Vendas */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-4">Código</th>
                <th className="px-8 py-4">Data/Hora</th>
                <th className="px-8 py-4">Cliente</th>
                <th className="px-8 py-4">Pagamento</th>
                <th className="px-8 py-4 text-right">Valor Total</th>
                <th className="px-8 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map((sale) => (
                <tr key={`${sale.id}-${sale.timestamp}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-4 font-mono text-[11px] font-bold text-slate-600 bg-slate-50/50">
                    {sale.id}
                  </td>
                  <td className="px-8 py-4 text-xs font-medium text-slate-500">
                    {new Date(sale.timestamp).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-8 py-4 font-bold text-slate-800 text-sm">
                    {sale.customerName || <span className="text-slate-300 font-normal">Consumidor Final</span>}
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex flex-wrap gap-1">
                      {sale.payments.map((p, idx) => (
                        <span key={idx} className="text-[9px] font-black bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-100">
                          {p.method}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right font-black text-slate-900 text-sm">
                    R$ {sale.total.toFixed(2)}
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => onOpenReceipt(sale)}
                        className="p-2 hover:bg-orange-50 text-orange-600 rounded-xl transition-all border border-transparent hover:border-orange-200 flex items-center gap-2 text-[10px] font-black uppercase"
                        title="Ver Recibo"
                      >
                        🖨️
                      </button>
                      <button 
                        onClick={() => onEditSale(sale)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-all border border-transparent hover:border-blue-200 flex items-center gap-2 text-[10px] font-black uppercase"
                        title="Editar Venda"
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        onClick={() => onCancelSale(sale.id)}
                        className="p-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl transition-all border border-red-100 hover:border-red-600 flex items-center gap-2 text-[10px] font-black uppercase shadow-sm"
                        title="Cancelar Venda"
                      >
                        🗑️ Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <span className="text-5xl">🔎</span>
                      <p className="font-bold text-slate-500 italic">Nenhuma venda encontrada para esta consulta.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesHistoryView;
