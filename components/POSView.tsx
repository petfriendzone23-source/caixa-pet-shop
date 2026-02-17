
import React, { useState, useRef } from 'react';
import { Product, CartItem, Sale, PaymentMethod, PaymentEntry, Customer } from '../types.ts';
import { CATEGORIES } from '../constants.ts';

interface POSViewProps {
  products: Product[];
  paymentMethods: PaymentMethod[];
  customers: Customer[];
  nextSaleNumber: number;
  onCompleteSale: (sale: Sale) => void;
}

const POSView: React.FC<POSViewProps> = ({ products, paymentMethods, customers, nextSaleNumber, onCompleteSale }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payments, setPayments] = useState<{ methodId: string, amount: number }[]>([]);
  
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);

  // Estados para Venda por Valor (Granel)
  const [bulkModalProduct, setBulkModalProduct] = useState<Product | null>(null);
  const [bulkValue, setBulkValue] = useState<string>('');

  const scannerRef = useRef<HTMLInputElement>(null);

  const addToCart = (product: Product, quantity: number = 1) => {
    const isService = product.category === 'Serviços';
    if (!isService && product.stock <= 0 && quantity >= 1) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;

    const product = products.find(p => p.code === barcodeInput);
    if (product) {
      handleProductClick(product);
    } else {
      alert("Produto não encontrado para o código: " + barcodeInput);
    }
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
    const value = parseFloat(bulkValue);
    if (value > 0) {
      const calculatedQty = value / bulkModalProduct.price;
      addToCart(bulkModalProduct, calculatedQty);
      setBulkModalProduct(null);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const isBulk = item.unitType === 'kg';
        const step = isBulk ? 0.1 : 1;
        const newQty = Math.max(0.001, item.quantity + (delta * step));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const updateItemPrice = (id: string, newPrice: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, price: newPrice } : item
    ));
    setEditingPriceId(null);
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const changeAmount = Math.max(0, paidAmount - total);

  const openPayment = () => {
    if (cart.length === 0) return;
    setPayments([{ methodId: paymentMethods[0]?.id || '', amount: total }]);
    setShowPaymentModal(true);
  };

  const formatSaleCode = (num: number) => {
    return num.toString().padStart(6, '0');
  };

  const handleFinalize = () => {
    if (paidAmount < total - 0.01) {
      alert("O valor pago é insuficiente.");
      return;
    }

    const finalPayments: PaymentEntry[] = payments.map(p => {
      const method = paymentMethods.find(m => m.id === p.methodId);
      const feePercent = method?.feePercent || 0;
      const proportion = p.amount / paidAmount;
      const actualPaymentValue = total * proportion;
      const feeAmount = actualPaymentValue * (feePercent / 100);
      
      return {
        method: method?.name || 'Outro',
        amount: p.amount,
        feeAmount: parseFloat(feeAmount.toFixed(2))
      };
    });

    const customer = customers.find(c => c.id === selectedCustomerId);

    const newSale: Sale = {
      id: formatSaleCode(nextSaleNumber),
      items: [...cart],
      total,
      change: changeAmount,
      timestamp: Date.now(),
      payments: finalPayments,
      customerId: customer?.id,
      customerName: customer?.name
    };

    onCompleteSale(newSale);
    setCart([]);
    setShowPaymentModal(false);
    setPayments([]);
    setSelectedCustomerId('');
  };

  const filteredProducts = products.filter(p => 
    (filter === 'Todos' || p.category === filter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex h-full gap-6 print:hidden">
      <div className="flex-1 flex flex-col gap-4">
        {/* Barra Superior do PDV com Scanner */}
        <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleBarcodeSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input 
                type="text" 
                placeholder="Buscar produto ou ler código de barras..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🏷️</span>
              <input 
                ref={scannerRef}
                type="text" 
                placeholder="Scanner..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-orange-100 bg-orange-50 focus:border-orange-500 outline-none text-sm font-bold placeholder:text-orange-300"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
              />
            </div>
          </form>
          
          <div className="h-10 w-px bg-slate-200"></div>

          <div className="flex gap-2 overflow-x-auto pb-1 max-w-[300px]">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-2 rounded-lg text-[10px] font-black whitespace-nowrap transition-colors uppercase tracking-widest ${
                  filter === cat ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {filteredProducts.map(product => {
            const isService = product.category === 'Serviços';
            const isOutOfStock = !isService && product.stock <= 0;
            const isBulk = product.unitType === 'kg';
            
            return (
              <div 
                key={product.id} 
                onClick={() => handleProductClick(product)}
                className={`bg-white p-4 rounded-xl border-2 border-slate-100 shadow-sm hover:border-orange-400 transition-all cursor-pointer flex flex-col justify-between h-44 relative group ${isOutOfStock ? 'opacity-50 grayscale pointer-events-none' : ''}`}
              >
                <div className="absolute top-2 right-2">
                  {isBulk ? (
                    <span className="bg-green-100 text-green-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">⚖️ KG</span>
                  ) : (
                    <span className="bg-blue-100 text-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">📦 UN</span>
                  )}
                </div>
                
                <div>
                  <div className="barcode text-2xl text-slate-300 group-hover:text-orange-200 transition-colors">{product.code}</div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{product.code}</span>
                  <h3 className="font-bold text-slate-800 text-xs line-clamp-2 mt-1">{product.name}</h3>
                </div>

                <div className="mt-auto pt-2 flex justify-between items-end">
                  <div>
                    <p className="text-base font-black text-slate-900 leading-none">R$ {product.price.toFixed(2)}</p>
                    <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">
                      Estoque: {product.stock}
                    </p>
                  </div>
                  <div className="bg-orange-50 text-orange-600 p-1.5 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <span className="text-lg">➕</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-96 bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            🛒 Checkout {cart.length > 0 && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{cart.length}</span>}
          </h2>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificar Cliente</label>
            <select 
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">Cliente Não Identificado</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 opacity-60">
              <span className="text-5xl">🛍️</span>
              <p className="font-medium">Carrinho Vazio</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[9px] font-bold text-slate-400">{item.code}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">✕</button>
                </div>
                <h4 className="text-xs font-bold text-slate-800 leading-tight mb-2">{item.name}</h4>
                
                <div className="flex justify-between items-center gap-2">
                  <div className="flex-1">
                    {editingPriceId === item.id ? (
                      <input 
                        autoFocus
                        type="number" 
                        step="0.01"
                        className="w-full text-sm font-black text-orange-600 border-b-2 border-orange-500 outline-none bg-transparent"
                        defaultValue={item.price}
                        onBlur={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || item.price)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updateItemPrice(item.id, parseFloat((e.target as HTMLInputElement).value) || item.price);
                        }}
                      />
                    ) : (
                      <button 
                        onClick={() => setEditingPriceId(item.id)}
                        className="text-sm font-black text-orange-600 hover:bg-orange-50 px-1 rounded transition-colors flex items-center gap-1"
                      >
                        R$ {item.price.toFixed(2)} <span className="text-[10px] opacity-50">✏️</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-2 py-1 shadow-sm">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-orange-600 font-bold">-</button>
                    <span className="text-xs font-bold min-w-[30px] text-center text-slate-700">
                      {item.unitType === 'kg' ? item.quantity.toFixed(3) : item.quantity}
                    </span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-orange-600 font-bold">+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-900 rounded-b-2xl border-t border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-400 font-medium">Subtotal</span>
            <span className="text-2xl font-black text-white">R$ {total.toFixed(2)}</span>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={openPayment}
            className="w-full py-4 bg-orange-600 text-white rounded-xl font-black text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/20 disabled:opacity-50 disabled:grayscale"
          >
            FINALIZAR VENDA
          </button>
        </div>
      </div>

      {/* Modal Bulk */}
      {bulkModalProduct && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-900">⚖️ Venda Granel</h3>
                <p className="text-[10px] font-bold text-orange-600 uppercase">{bulkModalProduct.name}</p>
              </div>
              <button onClick={() => setBulkModalProduct(null)} className="text-slate-400 text-xl">✕</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="text-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Preço por Kg</p>
                <p className="text-2xl font-black text-slate-800">R$ {bulkModalProduct.price.toFixed(2)}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quanto o cliente quer pagar?</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">R$</span>
                  <input 
                    autoFocus
                    type="number" 
                    step="0.01"
                    className="w-full pl-14 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none text-3xl font-black text-slate-800"
                    placeholder="0,00"
                    value={bulkValue}
                    onChange={(e) => setBulkValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && confirmBulkSale()}
                  />
                </div>
              </div>

              {bulkValue && parseFloat(bulkValue) > 0 && (
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] font-black text-orange-600 uppercase mb-1">Quantidade calculada</p>
                  <p className="text-3xl font-black text-orange-700">
                    {(parseFloat(bulkValue) / bulkModalProduct.price).toFixed(3)} <span className="text-sm">kg</span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => addToCart(bulkModalProduct, 1)}
                  className="py-3 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold hover:bg-slate-50"
                >
                  Adicionar 1 kg
                </button>
                <button 
                  disabled={!bulkValue || parseFloat(bulkValue) <= 0}
                  onClick={confirmBulkSale}
                  className="py-3 rounded-2xl bg-orange-600 text-white font-black hover:bg-orange-700 disabled:opacity-50"
                >
                  Confirmar Valor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl w-full max-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex flex-col">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">💰 Pagamento</h3>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-900 text-2xl">✕</button>
            </div>
            
            <div className="p-8 space-y-6 text-center">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total a Pagar</p>
              <p className="text-4xl font-black text-slate-900">R$ {total.toFixed(2)}</p>

              <div className="space-y-4 text-left">
                {payments.map((p, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="grid grid-cols-2 gap-3">
                      <select 
                        className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold bg-white"
                        value={p.methodId}
                        onChange={(e) => {
                          const newPayments = [...payments];
                          newPayments[idx].methodId = e.target.value;
                          setPayments(newPayments);
                        }}
                      >
                        {paymentMethods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-800 outline-none"
                        value={p.amount || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const newPayments = [...payments];
                          newPayments[idx].amount = val;
                          setPayments(newPayments);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className={`p-4 rounded-2xl ${changeAmount > 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold">{changeAmount > 0 ? 'Troco:' : 'Restante:'}</span>
                  <span className="text-xl font-black">R$ {changeAmount > 0 ? changeAmount.toFixed(2) : Math.abs(total - paidAmount).toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleFinalize}
                disabled={paidAmount < total - 0.01}
                className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-lg hover:bg-orange-700 shadow-xl shadow-orange-100 disabled:opacity-50"
              >
                FINALIZAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSView;
