
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
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(DEFAULT_COMPANY);
  const [nextSaleNumber, setNextSaleNumber] = useState<number>(1);
  const [currentView, setCurrentView] = useState<View>('pos');
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  useEffect(() => {
    const session = localStorage.getItem('nxpet_session');
    if (session) {
      setIsAuthenticated(true);
      setCurrentUser(session);
    }

    const load = (key: string, def: any) => {
      const item = localStorage.getItem(key);
      try { return item ? JSON.parse(item) : def; } catch { return def; }
    };

    setProducts(load('nxpet_products', INITIAL_PRODUCTS));
    setSales(load('nxpet_sales', []));
    setPaymentMethods(load('nxpet_payments', DEFAULT_PAYMENTS));
    setCustomers(load('nxpet_customers', []));
    setCompanyInfo(load('nxpet_company', DEFAULT_COMPANY));
    setNextSaleNumber(parseInt(localStorage.getItem('nxpet_next_sale_number') || '1'));
  }, []);

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

  const handleLogin = (u: string) => { setIsAuthenticated(true); setCurrentUser(u); localStorage.setItem('nxpet_session', u); };
  const handleLogout = () => { setIsAuthenticated(false); setCurrentUser(null); localStorage.removeItem('nxpet_session'); };

  const handleCompleteSale = (sale: Sale) => {
    setSales(prev => [sale, ...prev]);
    setProducts(prev => prev.map(p => {
      const item = sale.items.find(i => i.id === p.id);
      if (item && p.category !== 'Serviços') return { ...p, stock: Math.max(0, p.stock - item.quantity) };
      return p;
    }));
    setNextSaleNumber(n => n + 1);
    setLastSale(sale);
  };

  const renderView = () => {
    switch (currentView) {
      case 'pos': return <POSView products={products} paymentMethods={paymentMethods} customers={customers} nextSaleNumber={nextSaleNumber} onCompleteSale={handleCompleteSale} editingSale={editingSale} onCancelEdit={() => setEditingSale(null)} />;
      case 'sales': return <SalesHistoryView sales={sales} onOpenReceipt={setLastSale} onEditSale={(s) => { setEditingSale(s); setCurrentView('pos'); }} />;
      case 'inventory': return <InventoryView products={products} onUpdateStock={(id, s) => setProducts(products.map(p => p.id === id ? {...p, stock: s} : p))} onSaveProduct={(p) => setProducts(products.find(x => x.id === p.id) ? products.map(x => x.id === p.id ? p : x) : [p, ...products])} onDeleteProduct={(id) => setProducts(products.filter(p => p.id !== id))} />;
      case 'customers': return <CustomerView customers={customers} onSaveCustomer={(c) => setCustomers(customers.find(x => x.id === c.id) ? customers.map(x => x.id === c.id ? c : x) : [c, ...customers])} onDeleteCustomer={(id) => setCustomers(customers.filter(c => c.id !== id))} />;
      case 'dashboard': return <DashboardView sales={sales} />;
      case 'settings': return <SettingsView paymentMethods={paymentMethods} companyInfo={companyInfo} onAddMethod={(n, f) => setPaymentMethods([...paymentMethods, {id: Math.random().toString(), name: n, feePercent: f, icon: '💰'}])} onRemoveMethod={(id) => setPaymentMethods(paymentMethods.filter(p => p.id !== id))} onUpdateMethodFee={(id, f) => setPaymentMethods(paymentMethods.map(p => p.id === id ? {...p, feePercent: f} : p))} onUpdateCompanyInfo={setCompanyInfo} />;
      default: return null;
    }
  };

  if (!isAuthenticated) return <LoginView onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar currentView={currentView} setView={setCurrentView} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex justify-between items-center p-8 pb-4 print:hidden">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase">
              {currentView === 'pos' ? 'PDV' : currentView === 'sales' ? 'Histórico' : currentView === 'inventory' ? 'Estoque' : currentView === 'customers' ? 'Clientes' : currentView === 'dashboard' ? 'Relatórios' : 'Configurações'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isOnline ? 'Online' : 'Modo Offline'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">{currentUser}</p>
              <p className="text-[9px] text-slate-500 font-black uppercase">Admin</p>
            </div>
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {currentUser?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        {/* ÁREA COM ROLAGEM HABILITADA - RESOLVE O PROBLEMA DE TRAVAMENTO */}
        <section className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar print:overflow-visible">
          {renderView()}
        </section>
      </main>
      {lastSale && <ReceiptModal sale={lastSale} companyInfo={companyInfo} onClose={() => setLastSale(null)} />}
    </div>
  );
};

export default App;
