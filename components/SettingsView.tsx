
import React, { useState, useRef } from 'react';
import { PaymentMethod, CompanyInfo, Product, Sale, Customer } from '../types';

interface SettingsViewProps {
  paymentMethods: PaymentMethod[];
  companyInfo: CompanyInfo;
  onAddMethod: (name: string, fee: number) => void;
  onRemoveMethod: (id: string) => void;
  onUpdateMethodFee: (id: string, fee: number) => void;
  onUpdateCompanyInfo: (info: CompanyInfo) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  paymentMethods, 
  companyInfo,
  onAddMethod, 
  onRemoveMethod, 
  onUpdateMethodFee,
  onUpdateCompanyInfo
}) => {
  const [newMethodName, setNewMethodName] = useState('');
  const [newMethodFee, setNewMethodFee] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMethodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMethodName.trim()) {
      onAddMethod(newMethodName.trim(), newMethodFee);
      setNewMethodName('');
      setNewMethodFee(0);
    }
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdateCompanyInfo({ ...companyInfo, [name]: value });
  };

  const handleExportBackup = () => {
    const data = {
      products: JSON.parse(localStorage.getItem('nxpet_products') || '[]'),
      sales: JSON.parse(localStorage.getItem('nxpet_sales') || '[]'),
      customers: JSON.parse(localStorage.getItem('nxpet_customers') || '[]'),
      payments: JSON.parse(localStorage.getItem('nxpet_payments') || '[]'),
      company: JSON.parse(localStorage.getItem('nxpet_company') || '{}'),
      users: JSON.parse(localStorage.getItem('nxpet_users') || '[]'),
      nextSaleNumber: localStorage.getItem('nxpet_next_sale_number') || '1',
      version: '1.5.0',
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    
    link.href = url;
    link.download = `backup_nexuspet_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert("Backup gerado e salvo na sua pasta de Downloads!");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        if (!data.products || !data.sales) {
          throw new Error("Arquivo inválido.");
        }

        if (window.confirm("⚠️ ATENÇÃO: Isso apagará os dados atuais e restaurará os do arquivo. Confirmar?")) {
          localStorage.setItem('nxpet_products', JSON.stringify(data.products));
          localStorage.setItem('nxpet_sales', JSON.stringify(data.sales));
          localStorage.setItem('nxpet_customers', JSON.stringify(data.customers || []));
          localStorage.setItem('nxpet_payments', JSON.stringify(data.payments || []));
          localStorage.setItem('nxpet_company', JSON.stringify(data.company || {}));
          localStorage.setItem('nxpet_users', JSON.stringify(data.users || []));
          localStorage.setItem('nxpet_next_sale_number', data.nextSaleNumber || '1');
          
          alert("Sistema restaurado com sucesso!");
          window.location.reload();
        }
      } catch (err) {
        alert("Erro ao importar backup: Arquivo corrompido ou inválido.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div className="bg-slate-900 rounded-[40px] border border-slate-800 shadow-2xl overflow-hidden p-10 text-white relative">
        <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl">💾</div>
        <div className="mb-10 relative z-10">
          <h3 className="text-3xl font-black mb-2 uppercase tracking-tighter">Backup Geral do Sistema</h3>
          <p className="text-slate-400 font-medium">Salve todas as suas informações em um arquivo externo no seu computador.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-all">
            <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-2xl mb-4">📥</div>
            <h4 className="font-black text-xl mb-2">Exportar Dados</h4>
            <p className="text-sm text-slate-400 mb-6">Gera um arquivo .JSON com tudo o que você cadastrou.</p>
            <button 
              onClick={handleExportBackup}
              className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-orange-900/40 uppercase tracking-widest"
            >
              Salvar Backup no PC
            </button>
          </div>

          <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-all">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-4">📤</div>
            <h4 className="font-black text-xl mb-2">Restaurar Dados</h4>
            <p className="text-sm text-slate-400 mb-6">Recupera informações de um arquivo salvo anteriormente.</p>
            <button 
              onClick={handleImportClick}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-sm transition-all border border-slate-700 uppercase tracking-widest"
            >
              Abrir Arquivo de Backup
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileImport} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden p-10">
        <div className="mb-8">
          <h3 className="text-2xl font-black text-slate-900 mb-1 tracking-tighter uppercase">🏢 Dados da Empresa</h3>
          <p className="text-sm text-slate-500 font-medium">Informações exibidas na notinha de venda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome Fantasia</label>
            <input 
              type="text" 
              name="name"
              className="px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm font-bold bg-slate-50 focus:bg-white transition-all"
              value={companyInfo.name}
              onChange={handleCompanyChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CNPJ / CPF</label>
            <input 
              type="text" 
              name="document"
              className="px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm font-bold bg-slate-50 focus:bg-white transition-all"
              value={companyInfo.document}
              onChange={handleCompanyChange}
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Endereço de Atendimento</label>
            <input 
              type="text" 
              name="address"
              className="px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm font-medium bg-slate-50 focus:bg-white transition-all"
              value={companyInfo.address}
              onChange={handleCompanyChange}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden p-10">
        <div className="mb-8">
          <h3 className="text-2xl font-black text-slate-900 mb-1 tracking-tighter uppercase">💳 Formas de Pagamento</h3>
          <p className="text-sm text-slate-500 font-medium">As taxas cadastradas aqui são descontadas do seu lucro líquido.</p>
        </div>

        <form onSubmit={handleMethodSubmit} className="flex flex-col md:flex-row gap-3 mb-10">
          <input 
            type="text" 
            placeholder="Nome (Ex: Cartão de Crédito)"
            className="flex-1 px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm font-bold bg-slate-50 focus:bg-white transition-all"
            value={newMethodName}
            onChange={(e) => setNewMethodName(e.target.value)}
          />
          <div className="relative w-full md:w-40">
            <input 
              type="number" 
              step="0.01"
              placeholder="Taxa %"
              className="w-full px-5 py-4 pr-10 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm font-black bg-slate-50 focus:bg-white transition-all"
              value={newMethodFee}
              onChange={(e) => setNewMethodFee(parseFloat(e.target.value) || 0)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
          </div>
          <button 
            type="submit"
            className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95"
          >
            ADICIONAR
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map(method => (
            <div key={method.id} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:border-orange-100">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{method.icon}</span>
                <div className="flex flex-col">
                  <span className="font-black text-slate-800 text-sm uppercase">{method.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Taxa Adm:</span>
                    <input 
                      type="number"
                      step="0.1"
                      className="w-16 bg-white border-2 border-slate-200 rounded-lg px-2 py-0.5 text-xs font-black text-orange-600 focus:border-orange-500 outline-none"
                      value={method.feePercent}
                      onChange={(e) => onUpdateMethodFee(method.id, parseFloat(e.target.value) || 0)}
                    />
                    <span className="text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onRemoveMethod(method.id)}
                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
