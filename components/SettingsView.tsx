
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

  // Funções de Backup
  const handleExportBackup = () => {
    const data = {
      products: JSON.parse(localStorage.getItem('nxpet_products') || '[]'),
      sales: JSON.parse(localStorage.getItem('nxpet_sales') || '[]'),
      customers: JSON.parse(localStorage.getItem('nxpet_customers') || '[]'),
      payments: JSON.parse(localStorage.getItem('nxpet_payments') || '[]'),
      company: JSON.parse(localStorage.getItem('nxpet_company') || '{}'),
      users: JSON.parse(localStorage.getItem('nxpet_users') || '[]'), // Incluindo usuários no backup
      nextSaleNumber: localStorage.getItem('nxpet_next_sale_number') || '1',
      version: '1.5.0',
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    
    link.href = url;
    link.download = `nexuspet_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          throw new Error("Arquivo de backup inválido.");
        }

        if (window.confirm("ATENÇÃO: Restaurar este backup irá SOBRESCREVER todos os dados atuais (incluindo usuários e senhas). Deseja continuar?")) {
          localStorage.setItem('nxpet_products', JSON.stringify(data.products));
          localStorage.setItem('nxpet_sales', JSON.stringify(data.sales));
          localStorage.setItem('nxpet_customers', JSON.stringify(data.customers || []));
          localStorage.setItem('nxpet_payments', JSON.stringify(data.payments || []));
          localStorage.setItem('nxpet_company', JSON.stringify(data.company || {}));
          localStorage.setItem('nxpet_users', JSON.stringify(data.users || [])); // Restaurando usuários
          localStorage.setItem('nxpet_next_sale_number', data.nextSaleNumber || '1');
          
          // Limpa a sessão atual para forçar novo login com os dados restaurados
          localStorage.removeItem('nxpet_session');
          
          alert("Backup restaurado com sucesso! O sistema será reiniciado para aplicar as credenciais.");
          window.location.reload();
        }
      } catch (err) {
        alert("Erro ao importar backup: Certifique-se de que o arquivo é um JSON válido do NexusPet.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Limpa o input
  };

  return (
    <div className="max-w-3xl space-y-8 pb-12">
      {/* Dados da Empresa */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
        <div className="mb-6">
          <h3 className="text-xl font-black text-slate-800 mb-1">🏢 Dados da Empresa</h3>
          <p className="text-sm text-slate-500">Estas informações aparecerão no topo de todos os recibos de venda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome da Empresa / Fantasia</label>
            <input 
              type="text" 
              name="name"
              className="px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm font-bold"
              value={companyInfo.name}
              onChange={handleCompanyChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CNPJ / CPF</label>
            <input 
              type="text" 
              name="document"
              placeholder="00.000.000/0000-00"
              className="px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm font-bold"
              value={companyInfo.document}
              onChange={handleCompanyChange}
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Endereço Completo</label>
            <input 
              type="text" 
              name="address"
              placeholder="Rua, Número, Bairro, Cidade - UF"
              className="px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm"
              value={companyInfo.address}
              onChange={handleCompanyChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefone de Contato</label>
            <input 
              type="text" 
              name="phone"
              placeholder="(00) 00000-0000"
              className="px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm"
              value={companyInfo.phone || ''}
              onChange={handleCompanyChange}
            />
          </div>
        </div>
      </div>

      {/* Backup e Restauração */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden p-8 text-white relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl">💾</div>
        <div className="mb-8">
          <h3 className="text-xl font-black mb-1">Backup e Restauração</h3>
          <p className="text-sm text-slate-400">Proteja seus dados exportando um arquivo de segurança externo (JSON).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
            <h4 className="font-bold text-orange-500 mb-2">Exportar Dados</h4>
            <p className="text-xs text-slate-400 mb-4">Cria um arquivo com produtos, vendas, clientes, usuários e configurações.</p>
            <button 
              onClick={handleExportBackup}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-orange-900/20"
            >
              BAIXAR BACKUP COMPLETO
            </button>
          </div>

          <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
            <h4 className="font-bold text-blue-400 mb-2">Restaurar Sistema</h4>
            <p className="text-xs text-slate-400 mb-4">Carrega os dados de um arquivo anterior. Cuidado: isto apaga os dados atuais e desloga o usuário.</p>
            <button 
              onClick={handleImportClick}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-black text-sm transition-all border border-slate-600"
            >
              IMPORTAR ARQUIVO JSON
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept=".json"
              onChange={handleFileImport}
            />
          </div>
        </div>
      </div>

      {/* Formas de Pagamento */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
        <div className="mb-8">
          <h3 className="text-xl font-black text-slate-800 mb-1">💳 Formas de Pagamento e Taxas</h3>
          <p className="text-sm text-slate-500">Gerencie como seus clientes podem pagar e as taxas administrativas.</p>
        </div>

        <form onSubmit={handleMethodSubmit} className="flex flex-col md:flex-row gap-3 mb-8">
          <input 
            type="text" 
            placeholder="Nome (ex: Cartão de Crédito)"
            className="flex-1 px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm"
            value={newMethodName}
            onChange={(e) => setNewMethodName(e.target.value)}
          />
          <div className="relative w-full md:w-32">
            <input 
              type="number" 
              step="0.01"
              placeholder="Taxa %"
              className="w-full px-4 py-3 pr-8 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm font-bold"
              value={newMethodFee}
              onChange={(e) => setNewMethodFee(parseFloat(e.target.value) || 0)}
            />
            <span className="absolute right-3 top-3 text-slate-400 font-bold">%</span>
          </div>
          <button 
            type="submit"
            className="px-6 py-3 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 active:scale-95"
          >
            Adicionar
          </button>
        </form>

        <div className="space-y-3">
          {paymentMethods.map(method => (
            <div key={method.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
              <div className="flex items-center gap-4 flex-1">
                <span className="text-2xl">{method.icon}</span>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700">{method.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Taxa Adm:</span>
                    <input 
                      type="number"
                      step="0.1"
                      className="w-16 bg-white border border-slate-200 rounded px-1 py-0.5 text-[11px] font-black text-orange-600 focus:ring-1 focus:ring-orange-500 outline-none"
                      value={method.feePercent}
                      onChange={(e) => onUpdateMethodFee(method.id, parseFloat(e.target.value) || 0)}
                    />
                    <span className="text-[10px] font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onRemoveMethod(method.id)}
                className="p-2 text-slate-300 hover:text-red-500 transition-all"
              >
                🗑️
              </button>
            </div>
          ))}
          
          {paymentMethods.length === 0 && (
            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              Nenhuma forma de pagamento cadastrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
