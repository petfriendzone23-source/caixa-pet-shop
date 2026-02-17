
import React, { useState, useMemo } from 'react';
import { Sale } from '../types';
import { CATEGORIES } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardViewProps {
  sales: Sale[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ sales }) => {
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const filteredSalesByDate = useMemo(() => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime() + 86399999;
    return sales.filter(s => s.timestamp >= start && s.timestamp <= end);
  }, [sales, startDate, endDate]);

  const dreData = useMemo(() => {
    let revenue = 0;
    let cogs = 0;
    let financialFees = 0;
    const productStats: Record<string, { qty: number, rev: number, cost: number, category: string }> = {};

    filteredSalesByDate.forEach(sale => {
      const itemsInCat = selectedCategory === 'Todos' 
        ? sale.items 
        : sale.items.filter(item => item.category === selectedCategory);

      if (itemsInCat.length === 0) return;

      const saleCategoryTotal = itemsInCat.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      revenue += saleCategoryTotal;

      const proportion = saleCategoryTotal / sale.total;
      const totalSaleFee = sale.payments.reduce((sum, p) => sum + (p.feeAmount || 0), 0);
      financialFees += (totalSaleFee * proportion);

      itemsInCat.forEach(item => {
        const itemCostTotal = (item.costPrice || 0) * item.quantity;
        const itemRevTotal = item.price * item.quantity;
        cogs += itemCostTotal;

        if (!productStats[item.name]) {
          productStats[item.name] = { qty: 0, rev: 0, cost: 0, category: item.category };
        }
        productStats[item.name].qty += item.quantity;
        productStats[item.name].rev += itemRevTotal;
        productStats[item.name].cost += itemCostTotal;
      });
    });

    const grossProfit = revenue - cogs;
    const netOperatingProfit = grossProfit - financialFees;
    const netMargin = revenue > 0 ? (netOperatingProfit / revenue) * 100 : 0;

    return {
      revenue,
      cogs,
      grossProfit,
      financialFees,
      netOperatingProfit,
      margin: netMargin,
      productStats: Object.entries(productStats)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.rev - a.rev)
    };
  }, [filteredSalesByDate, selectedCategory]);

  const chartData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredSalesByDate.forEach(s => {
      const itemsInCat = selectedCategory === 'Todos' 
        ? s.items 
        : s.items.filter(item => item.category === selectedCategory);
      
      const totalInCat = itemsInCat.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (totalInCat <= 0) return;

      const date = new Date(s.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      data[date] = (data[date] || 0) + totalInCat;
    });
    return Object.entries(data).map(([date, value]) => ({ date, value }));
  }, [filteredSalesByDate, selectedCategory]);

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-end gap-6">
        <div className="flex-1">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            📊 Painel de Resultados
          </h3>
          <p className="text-xs text-slate-500">Lucro real descontando CMV e taxas financeiras</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</label>
            <select 
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 bg-white min-w-[150px]"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Inicial</label>
            <input 
              type="date" 
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Final</label>
            <input 
              type="date" 
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500 group hover:shadow-lg transition-all">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Receita Bruta</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">R$ {dreData.revenue.toFixed(2)}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-red-400 group hover:shadow-lg transition-all">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Taxas Operadoras</p>
          <h3 className="text-2xl font-black text-red-500 mt-1">- R$ {dreData.financialFees.toFixed(2)}</h3>
          <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Descontadas das vendas</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-green-500 group hover:shadow-lg transition-all">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Lucro Líquido Real</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">R$ {dreData.netOperatingProfit.toFixed(2)}</h3>
          <p className="text-[9px] text-green-600 font-bold mt-1 uppercase tracking-tighter">Após CMV e Taxas</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-orange-500 group hover:shadow-lg transition-all">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Margem Final</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{dreData.margin.toFixed(1)}%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            📈 Vendas Diárias ({selectedCategory})
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length > 0 ? chartData : [{date: '---', value: 0}]}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Vendido']}
                />
                <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl">📉</div>
          <h3 className="text-xl font-black mb-8 uppercase tracking-widest border-b border-slate-800 pb-4">Demonstrativo de Resultados</h3>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Receita Operacional ({selectedCategory})</span>
              <span className="text-xl font-black text-white">R$ {dreData.revenue.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-red-300">
              <span className="font-bold uppercase tracking-wider text-xs">(-) CMV (Custo de Mercadoria)</span>
              <span className="text-lg font-bold">R$ ({dreData.cogs.toFixed(2)})</span>
            </div>

            <div className="flex justify-between items-center text-red-400">
              <span className="font-bold uppercase tracking-wider text-[10px]">(-) Taxas Financeiras Proporcionais</span>
              <span className="text-md font-bold">R$ ({dreData.financialFees.toFixed(2)})</span>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="text-orange-500 font-black uppercase tracking-widest text-sm">Resultado Líquido</span>
                <span className="text-2xl font-black text-orange-500">R$ {dreData.netOperatingProfit.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Lucratividade</p>
                <p className="text-xl font-black text-green-400">{dreData.margin.toFixed(2)}%</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Produtos Únicos</p>
                <p className="text-xl font-black">{dreData.productStats.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Análise Individual de Produtos ({selectedCategory})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-4">Nome do Item</th>
                <th className="px-8 py-4">Categoria</th>
                <th className="px-8 py-4 text-center">Vendas</th>
                <th className="px-8 py-4 text-right">Faturamento</th>
                <th className="px-8 py-4 text-right">Lucro Estimado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dreData.productStats.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-4 font-bold text-slate-800 text-sm uppercase">{item.name}</td>
                  <td className="px-8 py-4">
                    <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded text-slate-500">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-center text-sm font-black text-slate-600">
                    {item.qty.toFixed(item.category === 'Ração' ? 3 : 0)}
                  </td>
                  <td className="px-8 py-4 text-right font-black text-slate-900 text-sm">R$ {item.rev.toFixed(2)}</td>
                  <td className="px-8 py-4 text-right text-green-600 text-sm font-black italic">R$ {(item.rev - item.cost).toFixed(2)}</td>
                </tr>
              ))}
              {dreData.productStats.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-300 font-black uppercase italic tracking-widest text-xs opacity-50">
                    Nenhum dado registrado para estes filtros.
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

export default DashboardView;
