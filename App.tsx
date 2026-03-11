
import React, { useState, useEffect } from 'react';
import { Product, Sale, View, PaymentMethod, Customer, CompanyInfo, Debt, DebtPayment } from './types.ts';
import { INITIAL_PRODUCTS } from './constants.ts';
import Sidebar from './components/Sidebar.tsx';
import POSView from './components/POSView.tsx';
import InventoryView from './components/InventoryView.tsx';
import DashboardView from './components/DashboardView.tsx';
import SettingsView from './components/SettingsView.tsx';
import CustomerView from './components/CustomerView.tsx';
import SalesHistoryView from './components/SalesHistoryView.tsx';
import ReceivablesView from './components/ReceivablesView.tsx';
import ReceiptModal from './components/ReceiptModal.tsx';
import LoginView from './components/LoginView.tsx';
import StorefrontView from './components/StorefrontView.tsx';

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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => localStorage.getItem('nxpet_dark_mode') === 'true');
  const [uiScale, setUiScale] = useState<number>(() => parseFloat(localStorage.getItem('nxpet_ui_scale') || '1'));
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(DEFAULT_COMPANY);
  const [nextSaleNumber, setNextSaleNumber] = useState<number>(1);
  const [currentView, setCurrentView] = useState<View>('pos');
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => localStorage.getItem('nxpet_sidebar_collapsed') === 'true');

  // Sincroniza a classe 'dark' no elemento <html> (necessário para Tailwind darkMode: 'class')
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nxpet_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('nxpet_sidebar_collapsed', isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${uiScale * 16}px`;
    localStorage.setItem('nxpet_ui_scale', uiScale.toString());
  }, [uiScale]);

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
    const session = sessionStorage.getItem('nxpet_session');
    if (session) {
      setIsAuthenticated(true);
      setCurrentUser(session);
    }

    const load = (key: string, def: any) => {
      const item = localStorage.getItem(key);
      try { return item ? JSON.parse(item) : def; } catch { return def; }
    };

    setProducts(load('nxpet_products', INITIAL_PRODUCTS));
    const loadedSales = load('nxpet_sales', []);
    setSales(loadedSales);
    
    const storedNextSale = parseInt(localStorage.getItem('nxpet_next_sale_number') || '1');
    const maxSaleId = loadedSales.reduce((max: number, s: Sale) => Math.max(max, parseInt(s.id) || 0), 0);
    setNextSaleNumber(Math.max(storedNextSale, maxSaleId + 1));
    
    setPaymentMethods(load('nxpet_payments', DEFAULT_PAYMENTS));
    setCustomers(load('nxpet_customers', []));
    setDebts(load('nxpet_debts', []));
    setCompanyInfo(load('nxpet_company', DEFAULT_COMPANY));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('nxpet_products', JSON.stringify(products));
      localStorage.setItem('nxpet_sales', JSON.stringify(sales));
      localStorage.setItem('nxpet_payments', JSON.stringify(paymentMethods));
      localStorage.setItem('nxpet_customers', JSON.stringify(customers));
      localStorage.setItem('nxpet_debts', JSON.stringify(debts));
      localStorage.setItem('nxpet_company', JSON.stringify(companyInfo));
      localStorage.setItem('nxpet_next_sale_number', nextSaleNumber.toString());
    }
  }, [products, sales, paymentMethods, customers, nextSaleNumber, companyInfo, isAuthenticated]);

  const handleLogin = (u: string) => { setIsAuthenticated(true); setCurrentUser(u); sessionStorage.setItem('nxpet_session', u); };
  const handleLogout = () => { setIsAuthenticated(false); setCurrentUser(null); sessionStorage.removeItem('nxpet_session'); };

  const handleCompleteSale = (sale: Sale) => {
    const isEdit = sales.some(s => s.id === sale.id);
    
    if (isEdit) {
      const oldSale = sales.find(s => s.id === sale.id)!;
      // Reverte estoque da venda antiga
      setProducts(prev => prev.map(p => {
        const item = oldSale.items.find(i => i.id === p.id);
        if (item && p.category !== 'Serviços') return { ...p, stock: p.stock + item.quantity };
        return p;
      }));
      
      // Substitui a venda
      setSales(prev => prev.map(s => s.id === sale.id ? sale : s));
    } else {
      setSales(prev => [sale, ...prev]);
      setNextSaleNumber(n => n + 1);
    }

    // Aplica estoque da nova venda (ou venda editada)
    setProducts(prev => prev.map(p => {
      const item = sale.items.find(i => i.id === p.id);
      if (item && p.category !== 'Serviços') return { ...p, stock: Math.max(0, p.stock - item.quantity) };
      return p;
    }));

    setLastSale(sale);
    setEditingSale(null);

    // Se for venda fiado, cria um débito
    if (sale.isCreditSale && sale.customerId) {
      const newDebt: Debt = {
        id: Math.random().toString(36).substr(2, 9),
        saleId: sale.id,
        customerId: sale.customerId,
        customerName: sale.customerName || 'Cliente',
        totalAmount: sale.total,
        remainingAmount: sale.total,
        status: 'pending',
        createdAt: Date.now(),
        payments: []
      };
      setDebts(prev => [newDebt, ...prev]);
    }
  };

  const handleCancelSale = (saleId: string) => {
    const saleToCancel = sales.find(s => s.id === saleId);
    if (!saleToCancel) return;

    if (confirm(`⚠️ Tem certeza que deseja CANCELAR a venda ${saleId}? Esta ação é irreversível e o estoque será restaurado.`)) {
      // Restaura o estoque
      setProducts(prev => prev.map(p => {
        const item = saleToCancel.items.find(i => i.id === p.id);
        if (item && p.category !== 'Serviços') {
          return { ...p, stock: p.stock + item.quantity };
        }
        return p;
      }));

      // Remove a venda
      setSales(prev => prev.filter(s => s.id !== saleId));
      
      // Remove débito associado se existir
      setDebts(prev => prev.filter(d => d.saleId !== saleId));
      
      if (editingSale?.id === saleId) {
        setEditingSale(null);
        setCurrentView('sales');
      }
      
      alert(`Venda ${saleId} cancelada com sucesso.`);
    }
  };

  const handlePayDebt = (debtId: string, payment: DebtPayment) => {
    setDebts(prev => prev.map(d => {
      if (d.id === debtId) {
        const newRemaining = Math.max(0, d.remainingAmount - payment.amount);
        return {
          ...d,
          remainingAmount: newRemaining,
          status: newRemaining === 0 ? 'paid' : 'pending',
          payments: [...d.payments, payment]
        };
      }
      return d;
    }));
  };

  const renderView = () => {
    switch (currentView) {
      case 'pos': return <POSView 
        products={products} 
        paymentMethods={paymentMethods} 
        customers={customers} 
        nextSaleNumber={nextSaleNumber} 
        onCompleteSale={handleCompleteSale} 
        onReorderProducts={setProducts}
        editingSale={editingSale} 
        onCancelEdit={() => setEditingSale(null)} 
        onDeleteSale={handleCancelSale}
      />;
      case 'sales': return <SalesHistoryView 
        sales={sales} 
        onOpenReceipt={setLastSale} 
        onEditSale={(s) => { setEditingSale(s); setCurrentView('pos'); }} 
        onCancelSale={handleCancelSale}
      />;
      case 'inventory': return <InventoryView products={products} sales={sales} onUpdateStock={(id, s) => setProducts(products.map(p => p.id === id ? {...p, stock: s} : p))} onSaveProduct={(p) => setProducts(products.find(x => x.id === p.id) ? products.map(x => x.id === p.id ? p : x) : [p, ...products])} onDeleteProduct={(id) => setProducts(products.filter(p => p.id !== id))} />;
      case 'customers': return <CustomerView customers={customers} onSaveCustomer={(c) => setCustomers(customers.find(x => x.id === c.id) ? customers.map(x => x.id === c.id ? c : x) : [c, ...customers])} onDeleteCustomer={(id) => setCustomers(customers.filter(c => c.id !== id))} />;
      case 'dashboard': return <DashboardView sales={sales} />;
      case 'receivables': return <ReceivablesView debts={debts} onPayDebt={handlePayDebt} onDeleteDebt={(id) => setDebts(debts.filter(d => d.id !== id))} />;
      case 'storefront': return <StorefrontView onEnterSystem={() => setCurrentView('pos')} />;
      case 'settings': return <SettingsView 
        paymentMethods={paymentMethods} 
        companyInfo={companyInfo} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        uiScale={uiScale}
        setUiScale={setUiScale}
        onAddMethod={(n, f) => setPaymentMethods([...paymentMethods, {id: Math.random().toString(), name: n, feePercent: f, icon: '💰'}])} 
        onRemoveMethod={(id) => setPaymentMethods(paymentMethods.filter(p => p.id !== id))} 
        onUpdateMethodFee={(id, f) => setPaymentMethods(paymentMethods.map(p => p.id === id ? {...p, feePercent: f} : p))} 
        onUpdateCompanyInfo={setCompanyInfo} 
      />;
      default: return null;
    }
  };

  if (!isAuthenticated) return <LoginView onLogin={handleLogin} />;

  if (currentView === 'storefront') {
    return (
      <div className="h-screen w-screen overflow-hidden bg-slate-950">
        <StorefrontView onEnterSystem={() => setCurrentView('pos')} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        onLogout={handleLogout} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex justify-between items-center p-8 pb-4 print:hidden">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="NexusPet Logo" className="h-10" />
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
                {currentView === 'pos' ? 'PDV' : currentView === 'sales' ? 'Histórico' : currentView === 'inventory' ? 'Estoque' : currentView === 'customers' ? 'Clientes' : currentView === 'dashboard' ? 'Relatórios' : currentView === 'receivables' ? 'Contas a Receber' : 'Configurações'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{isOnline ? 'Online' : 'Modo Offline'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{currentUser}</p>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">Administrador</p>
            </div>
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {currentUser?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        <section className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar print:overflow-visible">
          {renderView()}
        </section>
      </main>
      {lastSale && <ReceiptModal 
        sale={lastSale} 
        companyInfo={companyInfo} 
        onClose={() => setLastSale(null)} 
        onCancelSale={handleCancelSale}
      />}
    </div>
  );
};

export default App;
