
import React, { useState, useRef } from 'react';
import { PaymentMethod, CompanyInfo } from '../types';

interface SettingsViewProps {
  paymentMethods: PaymentMethod[];
  companyInfo: CompanyInfo;
  onAddMethod: (name: string, fee: number) => void;
  onRemoveMethod: (id: string) => void;
  onUpdateMethodFee: (id: string, fee: number) => void;
  onUpdateCompanyInfo: (info: CompanyInfo) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  paymentMethods, companyInfo, onAddMethod, onRemoveMethod, onUpdateMethodFee, onUpdateCompanyInfo
}) => {
  const [newMethodName, setNewMethodName] = useState('');
  const [newMethodFee, setNewMethodFee] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      products: JSON.parse(localStorage.getItem('nxpet_products') || '[]'),
      sales: JSON.parse(localStorage.getItem('nxpet_sales') || '[]'),
      customers: JSON.parse(localStorage.getItem('nxpet_customers') || '[]'),
      payments: JSON.parse(localStorage.getItem('nxpet_payments') || '[]'),
      company: JSON.parse(localStorage.getItem('nxpet_company') || '{}'),
      nextSaleNumber: localStorage.getItem('nxpet_next_sale_number') || '1',
      date: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexuspet_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    alert("Backup exportado com sucesso!");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (confirm("⚠️ Isso apagará os dados atuais. Confirmar restauração?")) {
          localStorage.setItem('nxpet_products', JSON.stringify(data.products || []));
          localStorage.setItem('nxpet_sales', JSON.stringify(data.sales || []));
          localStorage.setItem('nxpet_customers', JSON.stringify(data.customers || []));
          localStorage.setItem('nxpet_payments', JSON.stringify(data.payments || []));
          localStorage.setItem('nxpet_company', JSON.stringify(data.company || {}));
          localStorage.setItem('nxpet_next_sale_number', data.nextSaleNumber || '1');
          alert("Sistema restaurado com sucesso! Recarregando...");
          window.location.reload();
        }
      } catch (err) {
        alert("Erro ao ler arquivo: Formato inválido.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-10 text-9xl">💾</div>
        <h3 className="text-2xl font-black mb-6 uppercase">Segurança e Dados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <button onClick={handleExport} className="p-8 bg-white/5 rounded-[32px] border border-white/10 hover:bg-white/10 transition-all text-left">
            <span className="text-3xl mb-4 block">📥</span>
            <h4 className="font-bold text-lg">Exportar Backup</h4>
            <p className="text-xs text-slate-400 mt-2">Salva todos os seus dados em um arquivo no seu computador.</p>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="p-8 bg-white/5 rounded-[32px] border border-white/10 hover:bg-white/10 transition-all text-left">
            <span className="text-3xl mb-4 block">📤</span>
            <h4 className="font-bold text-lg">Importar Backup</h4>
            <p className="text-xs text-slate-400 mt-2">Recupera dados de um arquivo salvo anteriormente.</p>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm">
        <h3 className="text-xl font-black mb-6 uppercase text-slate-800">🏢 Informações da Empresa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input className="px-5 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-orange-500 font-bold" placeholder="Nome da Empresa" value={companyInfo.name} onChange={e => onUpdateCompanyInfo({...companyInfo, name: e.target.value})} />
          <input className="px-5 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-orange-500 font-bold" placeholder="CNPJ / CPF" value={companyInfo.document} onChange={e => onUpdateCompanyInfo({...companyInfo, document: e.target.value})} />
          <input className="px-5 py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-orange-500 font-bold md:col-span-2" placeholder="Endereço Completo" value={companyInfo.address} onChange={e => onUpdateCompanyInfo({...companyInfo, address: e.target.value})} />
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm">
        <h3 className="text-xl font-black mb-6 uppercase text-slate-800">💳 Taxas de Pagamento</h3>
        <div className="space-y-4">
          {paymentMethods.map(m => (
            <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="font-bold uppercase text-slate-600 text-sm">{m.icon} {m.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400">TAXA %</span>
                <input type="number" className="w-20 px-3 py-1 rounded-lg border-2 border-slate-200 font-black text-orange-600 outline-none" value={m.feePercent} onChange={e => onUpdateMethodFee(m.id, parseFloat(e.target.value) || 0)} />
                <button onClick={() => onRemoveMethod(m.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg ml-2">🗑️</button>
              </div>
            </div>
          ))}
          <div className="pt-4 flex gap-2">
            <input className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-100 outline-none text-sm" placeholder="Nova Forma (Ex: Vale)" value={newMethodName} onChange={e => setNewMethodName(e.target.value)} />
            <button onClick={() => { onAddMethod(newMethodName, 0); setNewMethodName(''); }} className="px-6 py-3 bg-slate-900 text-white font-black rounded-xl uppercase text-xs">Adicionar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
