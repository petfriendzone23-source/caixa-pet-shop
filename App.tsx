
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

// Firebase Imports
import { db, auth } from './src/firebase.ts';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocFromServer,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

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
  const [layoutMode, setLayoutMode] = useState<'auto' | 'desktop' | 'mobile'>(() => (localStorage.getItem('nxpet_layout_mode') as 'auto' | 'desktop' | 'mobile') || 'auto');
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobileLayout = layoutMode === 'mobile' || (layoutMode === 'auto' && isMobileScreen);
  
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
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  // Test Connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'settings', 'connection_test'));
      } catch (error: any) {
        if (error.message?.includes('the client is offline')) {
          setFirebaseError("Erro de conexão com o Firebase. Verifique sua internet ou configuração.");
        }
      }
    };
    testConnection();
  }, []);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user.email);
        sessionStorage.setItem('nxpet_session', user.email || 'user');
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        sessionStorage.removeItem('nxpet_session');
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Listeners
  useEffect(() => {
    if (!isAuthenticated || !isAuthReady) return;

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const docs = snapshot.docs.map(d => d.data() as Product);
      if (docs.length > 0) setProducts(docs);
      else if (products.length === 0) {
        // Initialize with defaults if empty
        INITIAL_PRODUCTS.forEach(p => setDoc(doc(db, 'products', p.id), p));
      }
    });

    const unsubSales = onSnapshot(query(collection(db, 'sales'), orderBy('timestamp', 'desc')), (snapshot) => {
      setSales(snapshot.docs.map(d => d.data() as Sale));
    });

    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      setCustomers(snapshot.docs.map(d => d.data() as Customer));
    });

    const unsubPayments = onSnapshot(collection(db, 'paymentMethods'), (snapshot) => {
      const docs = snapshot.docs.map(d => d.data() as PaymentMethod);
      if (docs.length > 0) setPaymentMethods(docs);
      else {
        DEFAULT_PAYMENTS.forEach(p => setDoc(doc(db, 'paymentMethods', p.id), p));
      }
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) setCompanyInfo(docSnap.data() as CompanyInfo);
      else setDoc(doc(db, 'settings', 'global'), DEFAULT_COMPANY);
    });

    return () => {
      unsubProducts();
      unsubSales();
      unsubCustomers();
      unsubPayments();
      unsubSettings();
    };
  }, [isAuthenticated, isAuthReady]);

  // Sincroniza a classe 'dark' no elemento <html>
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
    localStorage.setItem('nxpet_layout_mode', layoutMode);
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      if (layoutMode === 'desktop') {
        // Force desktop viewport on mobile devices
        viewportMeta.setAttribute('content', 'width=1280, initial-scale=0.1, maximum-scale=2.0, user-scalable=yes');
      } else {
        // Default responsive viewport
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    }
  }, [layoutMode]);

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
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('nxpet_next_sale_number', nextSaleNumber.toString());
    }
  }, [nextSaleNumber, isAuthenticated]);

  const handleLogin = (u: string) => { 
    setIsAuthenticated(true); 
    setCurrentUser(u); 
  };
  
  const handleLogout = async () => { 
    try {
      await auth.signOut();
      setIsAuthenticated(false); 
      setCurrentUser(null); 
      sessionStorage.removeItem('nxpet_session');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleCompleteSale = async (sale: Sale) => {
    const isEdit = sales.some(s => s.id === sale.id);
    
    try {
      if (isEdit) {
        const oldSale = sales.find(s => s.id === sale.id)!;
        // Reverte estoque da venda antiga
        for (const item of oldSale.items) {
          const p = products.find(prod => prod.id === item.id);
          if (p && p.category !== 'Serviços') {
            await updateDoc(doc(db, 'products', p.id), { stock: p.stock + item.quantity });
          }
        }
        // Substitui a venda
        await setDoc(doc(db, 'sales', sale.id), sale);
      } else {
        await setDoc(doc(db, 'sales', sale.id), sale);
      }

      // Aplica estoque da nova venda
      for (const item of sale.items) {
        const p = products.find(prod => prod.id === item.id);
        if (p && p.category !== 'Serviços') {
          await updateDoc(doc(db, 'products', p.id), { stock: Math.max(0, p.stock - item.quantity) });
        }
      }

      setLastSale(sale);
      setEditingSale(null);
    } catch (error) {
      console.error("Erro ao completar venda:", error);
      alert("Erro ao salvar venda no Firebase.");
    }
  };

  const handleCancelSale = async (saleId: string) => {
    const saleToCancel = sales.find(s => s.id === saleId);
    if (!saleToCancel) return;

    if (confirm(`⚠️ Tem certeza que deseja CANCELAR a venda ${saleId}? Esta ação é irreversível e o estoque será restaurado.`)) {
      try {
        // Restaura o estoque
        for (const item of saleToCancel.items) {
          const p = products.find(prod => prod.id === item.id);
          if (p && p.category !== 'Serviços') {
            await updateDoc(doc(db, 'products', p.id), { stock: p.stock + item.quantity });
          }
        }

        // Remove a venda
        await deleteDoc(doc(db, 'sales', saleId));
        
        if (editingSale?.id === saleId) {
          setEditingSale(null);
          setCurrentView('sales');
        }
        
        alert(`Venda ${saleId} cancelada com sucesso.`);
      } catch (error) {
        console.error("Erro ao cancelar venda:", error);
      }
    }
  };

  const handlePayDebt = (debtId: string, payment: DebtPayment) => {
    setDebts(prev => prev.map(d => {
      if (d.id === debtId) {
        const newRemaining = Math.max(0, d.remainingAmount - payment.amount);
        // Usamos 0.01 para evitar problemas de precisão com números decimais
        const isPaid = newRemaining < 0.01;
        return {
          ...d,
          remainingAmount: isPaid ? 0 : newRemaining,
          status: isPaid ? 'paid' : 'pending',
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
      case 'inventory': return <InventoryView 
        products={products} 
        sales={sales} 
        onUpdateStock={(id, s) => updateDoc(doc(db, 'products', id), { stock: s })} 
        onSaveProduct={(p) => setDoc(doc(db, 'products', p.id), p)} 
        onDeleteProduct={(id) => deleteDoc(doc(db, 'products', id))} 
      />;
      case 'customers': return <CustomerView 
        customers={customers} 
        onSaveCustomer={(c) => setDoc(doc(db, 'customers', c.id), c)} 
        onDeleteCustomer={(id) => deleteDoc(doc(db, 'customers', id))} 
      />;
      case 'dashboard': return <DashboardView sales={sales} />;
      case 'receivables': return <ReceivablesView debts={debts} onPayDebt={handlePayDebt} onDeleteDebt={(id) => setDebts(debts.filter(d => d.id !== id))} />;
      case 'storefront': return <StorefrontView onEnterSystem={() => setCurrentView('pos')} />;
      case 'settings': return <SettingsView 
        products={products}
        paymentMethods={paymentMethods} 
        companyInfo={companyInfo} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        uiScale={uiScale}
        setUiScale={setUiScale}
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
        onAddMethod={(n, f) => {
          const id = Math.random().toString(36).substr(2, 9);
          setDoc(doc(db, 'paymentMethods', id), { id, name: n, feePercent: f, icon: '💰' });
        }} 
        onRemoveMethod={(id) => deleteDoc(doc(db, 'paymentMethods', id))} 
        onUpdateMethodFee={(id, f) => updateDoc(doc(db, 'paymentMethods', id), { feePercent: f })} 
        onUpdateCompanyInfo={(info) => setDoc(doc(db, 'settings', 'global'), info)} 
      />;
      default: return null;
    }
  };

  if (firebaseError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 p-4 text-center">
        <div className="bg-red-900/20 border border-red-500/50 p-8 rounded-3xl max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Erro de Configuração</h2>
          <p className="text-slate-400 text-sm mb-6">{firebaseError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginView onLogin={handleLogin} />;

  if (currentView === 'storefront') {
    return (
      <div className={`h-screen w-screen overflow-hidden bg-slate-950 ${layoutMode === 'mobile' ? 'max-w-[480px] mx-auto border-x-4 border-slate-800 shadow-2xl relative' : ''}`}>
        <StorefrontView onEnterSystem={() => setCurrentView('pos')} />
      </div>
    );
  }

  return (
    <div className={`flex ${isMobileLayout ? 'flex-col' : 'flex-row'} h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500 ${layoutMode === 'mobile' ? 'max-w-[480px] mx-auto border-x-4 border-slate-200 dark:border-slate-800 shadow-2xl relative' : ''}`}>
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        onLogout={handleLogout} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileLayout={isMobileLayout}
      />
      <main className={`flex-1 flex flex-col min-w-0 overflow-hidden ${isMobileLayout ? 'pb-32' : ''}`}>
        <header className={`flex justify-between items-center ${isMobileLayout ? 'p-4 pb-2' : 'p-8 pb-4'} print:hidden`}>
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="NexusPet Logo" className={`${isMobileLayout ? 'h-8' : 'h-10'}`} />
            <div>
              <h2 className={`${isMobileLayout ? 'text-xl' : 'text-3xl'} font-extrabold text-slate-900 dark:text-white tracking-tight uppercase`}>
                {currentView === 'pos' ? 'PDV' : currentView === 'sales' ? 'Histórico' : currentView === 'inventory' ? 'Estoque' : currentView === 'customers' ? 'Clientes' : currentView === 'dashboard' ? 'Relatórios' : currentView === 'receivables' ? 'Contas a Receber' : 'Configurações'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{isOnline ? 'Online' : 'Modo Offline'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!isMobileLayout && (
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{currentUser}</p>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">Administrador</p>
              </div>
            )}
            <div className={`${isMobileLayout ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-lg'} bg-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
              {currentUser?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        <section className={`flex-1 overflow-y-auto ${isMobileLayout ? 'px-4 pb-4' : 'px-8 pb-8'} custom-scrollbar print:overflow-visible`}>
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
