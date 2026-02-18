
import React, { useState, useRef, useEffect } from 'react';
import { Product, CartItem, Sale, PaymentMethod, PaymentEntry, Customer } from '../types.ts';
import { CATEGORIES } from '../constants.ts';

interface POSViewProps {
  products: Product[];
  paymentMethods: PaymentMethod[];
  customers: Customer[];
  nextSaleNumber: number;
  onCompleteSale: (sale: Sale) => void;
  editingSale?: Sale | null;
  onCancelEdit?: () => void;
  onDeleteSale?: (saleId: string) => void;
}

const POSView: React.FC<POSViewProps> = ({ products, paymentMethods, customers, nextSaleNumber, onCompleteSale, editingSale, onCancelEdit, onDeleteSale }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payments, setPayments] = useState<{ methodId: string, amount: number }[]>([]);
  const [bulkModalProduct, setBulkModalProduct] = useState<Product | null>(null);
  const [bulkValue, setBulkValue] = useState<string>('');
  const scannerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingSale) {
      setCart(editingSale.items);
      setSelectedCustomerId(editingSale.customerId || '');
      const mappedPayments = editingSale.payments.map(p => {
        const method = paymentMethods.find(m => m.name === p.method);
        return {
          methodId: method?.id || paymentMethods[0].id,
          amount: p.amount
        };
      });
      setPayments(mappedPayments);
    } else {
      setCart([]);
      setSelectedCustomerId('');
      setPayments([]);
    }
  }, [editingSale, paymentMethods]);

  const addToCart = (product: Product, quantity: number = 1) => {
    const isService = product.category === 'Serviços';
    const originalQty = editingSale?.items.find(i => i.id === product.id)?.quantity || 0;
    const effectiveStock = isService ? 999 : product.stock + originalQty;

    if (!isService && effectiveStock <= 0 && quantity >= 1) {
      alert(`Produto "${product.name}" está sem estoque!`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;
    const product = products.find(p => p.code === barcodeInput);
    if (product) handleProductClick(product);
    setBarcodeInput('');
    scannerRef.current?.focus();
  };

  const handleProductClick = (product: Product) => {
    if (product.unitType === 'kg') {
      setBulkModalProduct(product);
      setBulkValue('');
    } else {
      addToCart(product, 1);
    }
  };

  const confirmBulkSale = () => {
    if (!bulkModalProduct || !bulkValue) return;
    const value = parseFloat(bulkValue.replace(',', '.'));
    if (value > 0) {
      const calculatedQty = value / bulkModalProduct.price;
      addToCart(bulkModalProduct, calculatedQty);
      setBulkModalProduct(null);
    }
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const changeAmount = Math.max(0, paidAmount - total);

  const handleFinalize = () => {
    if (paidAmount < total - 0.01) return alert("Pagamento insuficiente");
    const customer = customers.find(c => c.id === selectedCustomerId);
    
    const paymentEntries: PaymentEntry[] = payments.map(p => {
      const method = paymentMethods.find(m => m.id === p.methodId);
      const feePercent = method?.feePercent || 0;
      const feeAmount = (p.amount * feePercent) / 100;
      
      return {
        method: method?.name || 'Outro',
        amount: p.amount,
        feeAmount: feeAmount
      };
    });

    onCompleteSale({
      id: editingSale ? editingSale.id : nextSaleNumber.toString().padStart(6, '0'),
      items: [...cart],
      total,
      change: changeAmount,
      timestamp: editingSale ? editingSale.timestamp : Date.now(),
      payments: paymentEntries,
      customerId: customer?.id,
      customerName: customer?.name
    });

    if (!editingSale) {
      setCart([]);
      setPayments([]);
    }
    setShowPaymentModal(false);
  };

  const filteredProducts = products.filter(p => 
    (filter === 'Todos' || p.category === filter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || 
     p.code.toLowerCase().includes(search.toLowerCase()) ||
     p.subgroup?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex h-full gap-6">
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 flex flex-wrap gap-4 items-center shadow-sm transition-colors">
          <div className="flex-1 flex gap-2">
             <input 
              type="text" 
              placeholder="Buscar por nome, marca ou código..." 
              className="flex-1 px-4 py-2 border dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <form onSubmit={handleBarcodeSubmit} className="hidden md:block">
              <input 
                ref={scannerRef}
                type="text" 
                placeholder="Scanner de Barras" 
                className="w-44 px-4 py-2 border-2 border-orange-100 dark:border-orange-900/30 dark:bg-slate-800 dark:text-white rounded-xl font-bold focus:border-orange-500 outline-none"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
              />
            </form>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filter === cat ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 overflow-y-auto pr-2 custom-scrollbar">
          {filteredProducts.map(p => {
            const originalQty = editingSale?.items.find(i => i.id === p.id)?.quantity || 0;
            const effectiveStock = p.category === 'Serviços' ? 999 : p.stock + originalQty;
            const outOfStock = p.category !== 'Serviços' && effectiveStock <= 0;
            
            return (
              <div 
                key={p.id} 
                onClick={() => !outOfStock && handleProductClick(p)} 
                className={`group relative p-4 rounded-2xl border-2 transition-all flex flex-col justify-between h-36 ${outOfStock ? 'opacity-50 grayscale cursor-not-allowed border-slate-100 dark:border-slate-800' : 'hover:border-orange-500 cursor-pointer border-transparent shadow-sm hover:shadow-md'}`}
                style={{ backgroundColor: p.backgroundColor || '#ffffff' }}
              >
                <div className="dark:mix-blend-multiply opacity-90">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{p.code}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${p.unitType === 'kg' ? 'bg-green-100/50 text-green-700' : 'bg-blue-100/50 text-blue-700'}`}>
                      {p.unitType}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs leading-tight text-slate-800 line-clamp-1">{p.name}</h3>
                  {p.subgroup && (
                    <p className="text-[9px] font-black text-orange-500 uppercase mt-1 tracking-wider">{p.subgroup}</p>
                  )}
                </div>
                
                <div className="flex justify-between items-end mt-2 dark:mix-blend-multiply opacity-90">
                  <p className="font-black text-slate-900 text-sm">R$ {p.price.toFixed(2)}</p>
                  {p.category !== 'Serviços' && (
                    <span className={`text-[9px] font-bold ${effectiveStock < 5 ? 'text-red-500' : 'text-slate-400'}`}>
                      Est: {effectiveStock.toFixed(p.unitType === 'kg' ? 1 : 0)}
                    </span>
                  )}
                </div>

                {outOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-black/40 rounded-2xl">
                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">SEM ESTOQUE</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-96 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-xl overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex justify-between items-center">
            <h2 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
              <span className="text-xl">🛒</span> Carrinho
            </h2>
            <div className="flex gap-2">
              {editingSale && (
                <button 
                  onClick={onCancelEdit}
                  className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black px-2 py-1 rounded-full uppercase hover:bg-slate-300 transition-colors"
                >
                  Voltar
                </button>
              )}
              <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black px-2 py-1 rounded-full uppercase">
                {cart.length} itens
              </span>
            </div>
          </div>
          <select 
            className="w-full mt-4 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 dark:text-white transition-colors"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
          >
            <option value="">Consumidor Final</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 gap-2 opacity-50">
              <span className="text-4xl">🛒</span>
              <p className="text-xs font-bold uppercase tracking-widest">Carrinho Vazio</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="group flex gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-orange-100 dark:hover:border-orange-900/30 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {item.quantity.toFixed(item.unitType === 'kg' ? 3 : 0)} {item.unitType} x R${item.price.toFixed(2)}
                    </span>
                    <span className="font-black text-slate-900 dark:text-white text-xs">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)} 
                  className="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-900 dark:bg-black text-white">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-slate-400 text-xs uppercase font-black tracking-widest">
              <span>Subtotal</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-black text-sm uppercase tracking-widest">Total Geral</span>
              <span className="text-3xl font-black text-orange-500">R$ {total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <button 
              disabled={cart.length === 0} 
              onClick={() => { 
                if (payments.length === 0) setPayments([{methodId: paymentMethods[0].id, amount: total}]); 
                setShowPaymentModal(true); 
              }} 
              className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed ${editingSale ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/40' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-900/40'}`}
            >
              {editingSale ? 'SALVAR ALTERAÇÕES' : 'FINALIZAR VENDA'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Venda a Granel */}
      {bulkModalProduct && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="text-center mb-6">
              <span className="text-4xl">⚖️</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2">Venda por Peso</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{bulkModalProduct.name}</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Valor em Reais (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">R$</span>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="0,00"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white outline-none text-xl font-black text-slate-800"
                    value={bulkValue}
                    onChange={e => setBulkValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && confirmBulkSale()}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={confirmBulkSale} className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black">ADICIONAR</button>
              <button onClick={() => setBulkModalProduct(null)} className="w-full py-3 text-slate-400 font-bold">CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Finalizar Pagamento</h3>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 mb-8 flex justify-between items-center transition-colors">
              <span className="text-slate-500 dark:text-slate-400 font-black uppercase text-xs tracking-widest">Total a Pagar</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">R$ {total.toFixed(2)}</span>
            </div>

            <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {payments.map((p, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="flex-1 relative">
                    <select 
                      className="w-full pl-4 pr-10 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 outline-none text-sm font-bold bg-white dark:bg-slate-800 dark:text-white appearance-none transition-colors" 
                      value={p.methodId} 
                      onChange={e => {
                        const n = [...payments]; 
                        n[i].methodId = e.target.value; 
                        setPayments(n);
                      }}
                    >
                      {paymentMethods.map(m => <option key={m.id} value={m.id}>{m.icon} {m.name}</option>)}
                    </select>
                  </div>
                  <div className="w-32 relative">
                    <input 
                      type="number" 
                      className="w-full px-3 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white outline-none text-sm font-black transition-colors" 
                      value={p.amount} 
                      onChange={e => {
                        const n = [...payments]; 
                        n[i].amount = parseFloat(e.target.value) || 0; 
                        setPayments(n);
                      }} 
                    />
                  </div>
                </div>
              ))}
              <button onClick={() => setPayments([...payments, { methodId: paymentMethods[0].id, amount: 0 }])} className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">+ Adicionar Pagamento</button>
            </div>

            <div className="flex flex-col gap-3">
              <button disabled={paidAmount < total - 0.01} onClick={handleFinalize} className="w-full py-5 bg-orange-600 text-white rounded-[24px] font-black text-lg disabled:opacity-50 transition-all">CONCLUIR VENDA</button>
              <button onClick={() => setShowPaymentModal(false)} className="w-full py-3 text-slate-400 font-bold">VOLTAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSView;
