
import React, { useState, useEffect } from 'react';
import { Product, Sale, View, PaymentMethod, Customer, CompanyInfo } from './types.ts';
import { INITIAL_PRODUCTS } from './constants.ts';
import Sidebar from './components/Sidebar.tsx';
import POSView from './components/POSView.tsx';
import InventoryView from './components/InventoryView.tsx';
import DashboardView from './components/DashboardView.tsx';
import SettingsView from './components/SettingsView.tsx';
import CustomerView from './components/CustomerView.tsx';
import SalesHistoryView from './components/SalesHistoryView.tsx';
import ReceiptModal from './components/ReceiptModal.tsx';
import LoginView from './components/LoginView.tsx';

const DEFAULT_PAYMENTS: PaymentMethod[] = [
  { id: 'p1', name: 'Dinheiro', icon: '💵', feePercent: 0 },
  { id: 'p2', name: 'Cartão de Débito', icon: '💳', feePercent: 1.9 },
  { id: 'p3', name: 'Cartão de Crédito', icon: '💳', feePercent: 3.5 },
  { id: 'p4', name: 'Pix', icon: '📱', feePercent: 0 }
];

const DEFAULT_COMPANY: CompanyInfo = {
  name: 'NexusPet Shop',
  document: '00.000.000/0001-00',
  address: 'Rua dos Pets, 123 - Centro',
  phone: '(00) 00000-0000'
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [swStatus, setSwStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(DEFAULT_COMPANY);
  const [nextSaleNumber, setNextSaleNumber] = useState<number>(1);
  const [currentView, setCurrentView] = useState<View>('pos');
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  // Monitorar status da internet e do Service Worker
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setSwStatus('ready'));
    } else {
      setSwStatus('ready'); // Fallback para navegadores sem SW (não funcionará offline)
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carregamento inicial do banco de dados local
  useEffect(() => {
    const session = localStorage.getItem('nxpet_session');
    if (session) {
      setIsAuthenticated(true);
      setCurrentUser(session);
    }

    const loadFromStorage = (key: string, defaultValue: any) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    };

    setProducts(loadFromStorage('nxpet_products', INITIAL_PRODUCTS));
    setSales(loadFromStorage('nxpet_sales', []));
    setPaymentMethods(loadFromStorage('nxpet_payments', DEFAULT_PAYMENTS));
    setCustomers(loadFromStorage('nxpet_customers', []));
    setCompanyInfo(loadFromStorage('nxpet_company', DEFAULT_COMPANY));

    const savedNextNumber = localStorage.getItem('nxpet_next_sale_number');
    if (savedNextNumber) {
      setNextSaleNumber(parseInt(savedNextNumber) || 1);
    }
  }, []);

  // Sincronização automática para o disco rígido (via LocalStorage)
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('nxpet_products', JSON.stringify(products));
      localStorage.setItem('nxpet_sales', JSON.stringify(sales));
      localStorage.setItem('nxpet_payments', JSON.stringify(paymentMethods));
      localStorage.setItem('nxpet_customers', JSON.stringify(customers));
      localStorage.setItem('nxpet_company', JSON.stringify(companyInfo));
      localStorage.setItem('nxpet_next_sale_number', nextSaleNumber.toString());
    }
  }, [products, sales, paymentMethods, customers, nextSaleNumber, companyInfo, isAuthenticated]);

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
    localStorage.setItem('nxpet_session', username);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('nxpet_session');
    setCurrentView('pos');
  };

  const handleCompleteSale = (sale: Sale) => {
    setSales(prev => [sale, ...prev]);
    setProducts(prev => prev.map(p => {
      const soldItem = sale.items.find(item => item.id === p.id);
      if (soldItem) {
        const newStock = p.category === 'Serviços' ? p.stock : Math.max(0, p.stock - soldItem.quantity);
        return { ...p, stock: newStock };
      }
      return p;
    }));
    setNextSaleNumber(prev => prev + 1);
    setLastSale(sale);
  };

  const handleUpdateSale = (updatedSale: Sale) => {
    if (!editingSale) return;
    setProducts(prev => {
      const newProducts = [...prev];
      editingSale.items.forEach(oldItem => {
        const pIdx = newProducts.findIndex(p => p.id === oldItem.id);
        if (pIdx > -1 && newProducts[pIdx].category !== 'Serviços') {
          newProducts[pIdx].stock += oldItem.quantity;
        }
      });
      updatedSale.items.forEach(newItem => {
        const pIdx = newProducts.findIndex(p => p.id === newItem.id);
        if (pIdx > -1 && newProducts[pIdx].category !== 'Serviços') {
          newProducts[pIdx].stock = Math.max(0, newProducts[pIdx].stock - newItem.quantity);
        }
      });
      return newProducts;
    });
    setSales(prev => prev.map(s => s.id === editingSale.id ? updatedSale : s));
    setEditingSale(null);
    setCurrentView('sales');
  };

  const handleDeleteSale = (saleId: string) => {
    const saleToDelete = sales.find(s => s.id === saleId);
    if (!saleToDelete) return;
    if (window.confirm(`⚠️ EXCLUIR DEFINITIVAMENTE: A venda #${saleId} será apagada e o estoque será devolvido.`)) {
      setProducts(prev => {
        const newProducts = [...prev];
        saleToDelete.items.forEach(item => {
          const pIdx = newProducts.findIndex(p => p.id === item.id);
          if (pIdx > -1 && newProducts[pIdx].category !== 'Serviços') {
            newProducts[pIdx].stock += item.quantity;
          }
        });
        return newProducts;
      });
      setSales(prev => prev.filter(s => s.id !== saleId));
      setEditingSale(null);
      setCurrentView('sales');
    }
  };

  const handleStartEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setCurrentView('pos');
  };

  const handleUpdateStock = (id: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
  };

  const handleSaveProduct = (product: Product) => {
    setProducts(prev => {
      const index = prev.findIndex(p => p.id === product.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = product;
        return updated;
      }
      return [product, ...prev];
    });
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Excluir este produto?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSaveCustomer = (customer: Customer) => {
    setCustomers(prev => {
      const index = prev.findIndex(c => c.id === customer.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = customer;
        return updated;
      }
      return [customer, ...prev];
    });
  };

  const handleDeleteCustomer = (id: string) => {
    if (window.confirm('Excluir este cliente?')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleAddPayment = (name: string, feePercent: number) => {
    const newMethod: PaymentMethod = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      icon: '💰',
      feePercent: feePercent
    };
    setPaymentMethods(prev => [...prev, newMethod]);
  };

  const handleRemovePayment = (id: string) => {
    setPaymentMethods(prev => prev.filter(m => m.id !== id));
  };

  const handleUpdatePaymentFee = (id: string, feePercent: number) => {
    setPaymentMethods(prev => prev.map(m => m.id === id ? { ...m, feePercent } : m));
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'pos':
        return <POSView products={products} paymentMethods={paymentMethods} customers={customers} nextSaleNumber={nextSaleNumber} onCompleteSale={editingSale ? handleUpdateSale : handleCompleteSale} editingSale={editingSale} onCancelEdit={() => { setEditingSale(null); setCurrentView('sales'); }} onDeleteSale={handleDeleteSale} />;
      case 'sales':
        return <SalesHistoryView sales={sales} onOpenReceipt={(sale) => setLastSale(sale)} onEditSale={handleStartEditSale} />;
      case 'inventory':
        return <InventoryView products={products} onUpdateStock={handleUpdateStock} onSaveProduct={handleSaveProduct} onDeleteProduct={handleDeleteProduct} />;
      case 'customers':
        return <CustomerView customers={customers} onSaveCustomer={handleSaveCustomer} onDeleteCustomer={handleDeleteCustomer} />;
      case 'dashboard':
        return <DashboardView sales={sales} />;
      case 'settings':
        return <SettingsView paymentMethods={paymentMethods} companyInfo={companyInfo} onAddMethod={handleAddPayment} onRemoveMethod={handleRemovePayment} onUpdateMethodFee={handleUpdatePaymentFee} onUpdateCompanyInfo={setCompanyInfo} />;
      default:
        return <POSView products={products} paymentMethods={paymentMethods} customers={customers} nextSaleNumber={nextSaleNumber} onCompleteSale={handleCompleteSale} />;
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'pos': return editingSale ? `Editando Venda #${editingSale.id}` : 'Ponto de Venda';
      case 'sales': return 'Consulta de Vendas';
      case 'inventory': return 'Estoque e Catálogo';
      case 'customers': return 'Clientes';
      case 'dashboard': return 'Relatórios';
      case 'settings': return 'Configurações';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentView={currentView} setView={(v) => { setEditingSale(null); setCurrentView(v); }} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col p-8 print:p-0">
        
        {/* Banner de Sincronização */}
        {!isOnline && (
          <div className="mb-6 bg-orange-600 text-white px-6 py-3 rounded-2xl flex items-center justify-between shadow-lg animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-black text-sm uppercase tracking-widest">Modo Offline Ativado</p>
                <p className="text-[10px] font-bold opacity-80">Você pode continuar vendendo. Os dados serão salvos no computador.</p>
              </div>
            </div>
          </div>
        )}

        {isOnline && swStatus === 'loading' && (
          <div className="mb-6 bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-xl">⏳</span>
              <div>
                <p className="font-black text-sm uppercase tracking-widest">Preparando Modo Offline</p>
                <p className="text-[10px] font-bold opacity-80">Baixando arquivos necessários. Por favor, não feche agora...</p>
              </div>
            </div>
          </div>
        )}

        <header className="flex justify-between items-center mb-8 print:hidden">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{getViewTitle()}</h2>
            <div className="flex items-center gap-3 mt-1 font-bold">
               <p className="text-slate-500">{companyInfo.name}</p>
               <span className="text-slate-300">|</span>
               {isOnline ? (
                 <span className="text-green-600 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">● Conectado</span>
               ) : (
                 <span className="text-orange-600 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">▲ Local</span>
               )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <img className="h-10 w-10 rounded-full border-2 border-orange-500" src={`https://ui-avatars.com/api/?name=${currentUser}&background=f97316&color=fff`} alt="User" />
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">{currentUser}</p>
              <p className="text-xs text-slate-500 uppercase font-black text-[9px] tracking-widest">Administrador</p>
            </div>
          </div>
        </header>
        <section className="flex-1 overflow-hidden print:overflow-visible">
          {renderView()}
        </section>
      </main>
      {lastSale && <ReceiptModal sale={lastSale} companyInfo={companyInfo} onClose={() => setLastSale(null)} />}
    </div>
  );
};

export default App;
