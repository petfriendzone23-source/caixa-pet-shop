
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
  const [bulkModalProduct, setBulkModalProduct] = useState<Product | null>(null);
  const [bulkValue, setBulkValue] = useState<string>('');
  const scannerRef = useRef<HTMLInputElement>(null);

  const addToCart = (product: Product, quantity: number = 1) => {
    const isService = product.category === 'Serviços';
    if (!isService && product.stock <= 0 && quantity >= 1) return;

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
    const value = parseFloat(bulkValue);
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
    onCompleteSale({
      id: nextSaleNumber.toString().padStart(6, '0'),
      items: [...cart],
      total,
      change: changeAmount,
      timestamp: Date.now(),
      payments: payments.map(p => ({
        method: paymentMethods.find(m => m.id === p.methodId)?.name || 'Outro',
        amount: p.amount,
        feeAmount: 0
      })),
      customerId: customer?.id,
      customerName: customer?.name
    });
    setCart([]);
    setShowPaymentModal(false);
  };

  const filteredProducts = products.filter(p => 
    (filter === 'Todos' || p.category === filter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex h-full gap-6">
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="bg-white p-4 rounded-2xl border flex gap-4">
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="flex-1 px-4 py-2 border rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <form onSubmit={handleBarcodeSubmit}>
            <input 
              ref={scannerRef}
              type="text" 
              placeholder="Scanner" 
              className="w-40 px-4 py-2 border-2 border-orange-100 rounded-xl font-bold"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
            />
          </form>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 overflow-y-auto">
          {filteredProducts.map(p => (
            <div key={p.id} onClick={() => handleProductClick(p)} className="bg-white p-4 rounded-xl border hover:border-orange-500 cursor-pointer">
              <p className="text-[10px] font-bold text-slate-400">{p.code}</p>
              <h3 className="font-bold text-xs h-8 line-clamp-2">{p.name}</h3>
              <p className="mt-2 font-black">R$ {p.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-80 bg-white rounded-2xl border flex flex-col shadow-lg">
        <div className="p-4 border-b">
          <h2 className="font-bold">🛒 Carrinho</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.map(item => (
            <div key={item.id} className="text-xs p-2 border-b">
              <p className="font-bold">{item.name}</p>
              <div className="flex justify-between items-center mt-1">
                <span>{item.quantity.toFixed(item.unitType === 'kg' ? 3 : 0)} x R${item.price.toFixed(2)}</span>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500">✕</button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-slate-900 text-white rounded-b-2xl">
          <div className="flex justify-between mb-4">
            <span className="font-bold">Total</span>
            <span className="text-xl font-black">R$ {total.toFixed(2)}</span>
          </div>
          <button disabled={cart.length === 0} onClick={() => { setPayments([{methodId: paymentMethods[0].id, amount: total}]); setShowPaymentModal(true); }} className="w-full py-3 bg-orange-600 rounded-xl font-bold disabled:opacity-50">PAGAR</button>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Pagamento</h3>
            <p className="text-3xl font-black mb-6">R$ {total.toFixed(2)}</p>
            <div className="space-y-4 mb-6">
              {payments.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <select className="flex-1 p-2 border rounded-lg" value={p.methodId} onChange={e => {
                    const n = [...payments]; n[i].methodId = e.target.value; setPayments(n);
                  }}>
                    {paymentMethods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <input type="number" className="w-24 p-2 border rounded-lg" value={p.amount} onChange={e => {
                    const n = [...payments]; n[i].amount = parseFloat(e.target.value) || 0; setPayments(n);
                  }} />
                </div>
              ))}
            </div>
            <button onClick={handleFinalize} className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold">CONCLUIR</button>
            <button onClick={() => setShowPaymentModal(false)} className="w-full py-3 mt-2 text-slate-500 font-bold">CANCELAR</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSView;
