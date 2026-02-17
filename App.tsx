
import React, { useState, useEffect } from 'react';
import { Product, Sale, View, PaymentMethod, Customer, CompanyInfo } from './types';
import { INITIAL_PRODUCTS } from './constants';
import Sidebar from './components/Sidebar';
import POSView from './components/POSView';
import InventoryView from './components/InventoryView';
import DashboardView from './components/DashboardView';
import SettingsView from './components/SettingsView';
import CustomerView from './components/CustomerView';
import SalesHistoryView from './components/SalesHistoryView';
import ReceiptModal from './components/ReceiptModal';
import LoginView from './components/LoginView';

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
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(DEFAULT_COMPANY);
  const [nextSaleNumber, setNextSaleNumber] = useState<number>(1);
  const [currentView, setCurrentView] = useState<View>('pos');
  const [lastSale, setLastSale] = useState<Sale | null>(null);

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
        return <POSView products={products} paymentMethods={paymentMethods} customers={customers} nextSaleNumber={nextSaleNumber} onCompleteSale={handleCompleteSale} />;
      case 'sales':
        return <SalesHistoryView sales={sales} onOpenReceipt={(sale) => setLastSale(sale)} />;
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
      case 'pos': return 'Ponto de Venda';
      case 'sales': return 'Consulta de Vendas';
      case 'inventory': return 'Estoque e Catálogo';
      case 'customers': return 'Clientes';
      case 'dashboard': return 'Relatórios';
      case 'settings': return 'Configurações';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentView={currentView} setView={setCurrentView} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col p-8 print:p-0">
        <header className="flex justify-between items-center mb-8 print:hidden">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{getViewTitle()}</h2>
            <p className="text-slate-500 mt-1">{companyInfo.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <img className="h-10 w-10 rounded-full border-2 border-orange-500" src={`https://ui-avatars.com/api/?name=${currentUser}&background=f97316&color=fff`} alt="User" />
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">{currentUser}</p>
              <p className="text-xs text-slate-500">Operador</p>
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
