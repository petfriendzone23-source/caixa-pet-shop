
import React, { useState, useRef } from 'react';
import { PaymentMethod, CompanyInfo, Product } from '../types';
import Barcode from 'react-barcode';

interface SettingsViewProps {
  products: Product[];
  paymentMethods: PaymentMethod[];
  companyInfo: CompanyInfo;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  uiScale: number;
  setUiScale: (val: number) => void;
  onAddMethod: (name: string, fee: number) => void;
  onRemoveMethod: (id: string) => void;
  onUpdateMethodFee: (id: string, fee: number) => void;
  onUpdateCompanyInfo: (info: CompanyInfo) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  products, paymentMethods, companyInfo, isDarkMode, setIsDarkMode, uiScale, setUiScale, onAddMethod, onRemoveMethod, onUpdateMethodFee, onUpdateCompanyInfo
}) => {
  const [activeTab, setActiveTab] = useState<'company' | 'payments' | 'appearance' | 'data' | 'labels'>('company');
  const [newMethodName, setNewMethodName] = useState('');
  const [newMethodFee, setNewMethodFee] = useState<number>(0);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [labelSearch, setLabelSearch] = useState('');
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

  const tabs = [
    { id: 'company', label: 'Empresa', icon: '🏢' },
    { id: 'payments', label: 'Pagamentos', icon: '💳' },
    { id: 'appearance', label: 'Aparência', icon: '🎨' },
    { id: 'labels', label: 'Etiquetas', icon: '🏷️' },
    { id: 'data', label: 'Dados', icon: '💾' },
  ] as const;

  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handlePrintLabels = () => {
    if (selectedProducts.length === 0) {
      alert("Selecione ao menos um produto para imprimir etiquetas.");
      return;
    }
    document.body.classList.add('printing-labels');
    window.print();
    document.body.classList.remove('printing-labels');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(labelSearch.toLowerCase()) || 
    p.code.toLowerCase().includes(labelSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl space-y-6">
      {/* Menu de Abas */}
      <div className="flex flex-wrap gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-[24px] font-black uppercase text-xs transition-all ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm scale-[1.02]' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo das Abas */}
      <div className="transition-all duration-300">
        {activeTab === 'company' && (
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-black mb-6 uppercase text-slate-800 dark:text-white">🏢 Informações da Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nome da Empresa</label>
                <input className="px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white outline-none focus:border-orange-500 font-bold" placeholder="Ex: Pet Shop Nexus" value={companyInfo.name} onChange={e => onUpdateCompanyInfo({...companyInfo, name: e.target.value})} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">CNPJ / CPF</label>
                <input className="px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white outline-none focus:border-orange-500 font-bold" placeholder="00.000.000/0000-00" value={companyInfo.document} onChange={e => onUpdateCompanyInfo({...companyInfo, document: e.target.value})} />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Endereço Completo</label>
                <input className="px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white outline-none focus:border-orange-500 font-bold" placeholder="Rua, Número, Bairro, Cidade - UF" value={companyInfo.address} onChange={e => onUpdateCompanyInfo({...companyInfo, address: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-black mb-6 uppercase text-slate-800 dark:text-white">💳 Taxas de Pagamento</h3>
            <div className="space-y-4">
              {paymentMethods.map(m => (
                <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <span className="font-bold uppercase text-slate-600 dark:text-slate-300 text-sm">{m.icon} {m.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">TAXA %</span>
                    <input type="number" className="w-20 px-3 py-1 rounded-lg border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-orange-500 font-black text-orange-600 outline-none" value={m.feePercent} onChange={e => onUpdateMethodFee(m.id, parseFloat(e.target.value) || 0)} />
                    <button onClick={() => onRemoveMethod(m.id)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg ml-2">🗑️</button>
                  </div>
                </div>
              ))}
              <div className="pt-4 flex gap-2">
                <input className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white outline-none text-sm" placeholder="Nova Forma (Ex: Vale)" value={newMethodName} onChange={e => setNewMethodName(e.target.value)} />
                <button onClick={() => { onAddMethod(newMethodName, 0); setNewMethodName(''); }} className="px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-xl uppercase text-xs">Adicionar</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-black mb-6 uppercase text-slate-800 dark:text-white flex items-center gap-2">
              <span>🎨</span> Aparência e Tema
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Modo Noturno</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ative para reduzir o cansaço visual em ambientes escuros.</p>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-16 h-8 rounded-full transition-all relative ${isDarkMode ? 'bg-orange-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${isDarkMode ? 'left-9' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">Escala da Interface (Resolução)</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ajuste o tamanho dos elementos para melhor visualização.</p>
                  </div>
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-black text-sm">
                    {Math.round(uiScale * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="0.75" 
                    max="1.5" 
                    step="0.05" 
                    value={uiScale} 
                    onChange={(e) => setUiScale(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                  <div className="flex gap-2">
                    {[0.8, 1.0, 1.2].map(val => (
                      <button 
                        key={val}
                        onClick={() => setUiScale(val)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${uiScale === val ? 'bg-orange-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}`}
                      >
                        {val === 0.8 ? 'Pequeno' : val === 1.0 ? 'Normal' : 'Grande'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'labels' && (
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors animate-in fade-in slide-in-from-bottom-4 print:hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase text-slate-800 dark:text-white flex items-center gap-2">
                <span>🏷️</span> Gerador de Etiquetas
              </h3>
              <button 
                onClick={handlePrintLabels}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl uppercase text-xs shadow-lg shadow-orange-900/20 transition-all active:scale-95"
              >
                🖨️ Imprimir Selecionadas ({selectedProducts.length})
              </button>
            </div>

            <div className="mb-6">
              <input 
                type="text" 
                placeholder="Buscar produto por nome ou código..." 
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white outline-none focus:border-orange-500 font-bold"
                value={labelSearch}
                onChange={(e) => setLabelSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => toggleProductSelection(product.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                    selectedProducts.includes(product.id)
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedProducts.includes(product.id) ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300'}`}>
                    {selectedProducts.includes(product.id) && '✓'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-800 dark:text-white">{product.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.code} • R$ {product.price.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-1 rounded border border-slate-100 scale-75 origin-right">
                    <Barcode value={product.code} width={1} height={30} fontSize={10} margin={0} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Área de Impressão (Oculta na tela, visível no print) */}
        <div className="hidden print:block print:bg-white print:text-black">
          <div className="flex flex-col items-center w-[58mm] mx-auto">
            {products.filter(p => selectedProducts.includes(p.id)).map(product => (
              <div key={product.id} className="w-full border-b border-dashed border-slate-300 py-6 flex flex-col items-center justify-center text-center break-inside-avoid">
                <div className="flex justify-center w-full overflow-hidden">
                  <Barcode 
                    value={product.code} 
                    width={1.2} 
                    height={60} 
                    fontSize={12}
                    margin={0}
                    displayValue={true}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {activeTab === 'data' && (
          <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4">
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
        )}
      </div>
    </div>
  );
};

export default SettingsView;
