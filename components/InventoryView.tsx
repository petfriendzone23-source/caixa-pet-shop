
import React, { useState } from 'react';
import { Product, Sale } from '../types';
import { CATEGORIES, PRODUCT_COLORS, SUBGROUPS_RACAO } from '../constants';

interface InventoryViewProps {
  products: Product[];
  sales: Sale[];
  onUpdateStock: (id: string, newStock: number) => void;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ products, sales, onUpdateStock, onSaveProduct, onDeleteProduct }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductHistory, setSelectedProductHistory] = useState<{ product: Product, history: any[] } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10); // 10 produtos por página

  const [formData, setFormData] = useState<Product>({
    id: '',
    code: '',
    name: '',
    category: 'Ração',
    subgroup: 'Golden',
    costPrice: 0,
    price: 0,
    stock: 0,
    unitType: 'un',
    backgroundColor: '#ffffff'
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.subgroup?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de paginação
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const generateBarcode = () => {
    let barcode = '';
    for (let i = 0; i < 13; i++) {
      barcode += Math.floor(Math.random() * 10).toString();
    }
    setFormData(prev => ({ ...prev, code: barcode }));
  };

  const generateAutoCode = () => {
    const prefix = formData.category.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newCode = `${prefix}${randomNum}`;
    setFormData(prev => ({ ...prev, code: newCode }));
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      const newId = Math.random().toString(36).substr(2, 9);
      setFormData({
        id: newId,
        code: '',
        name: '',
        category: 'Ração',
        subgroup: 'Golden',
        costPrice: 0,
        price: 0,
        stock: 0,
        unitType: 'un',
        backgroundColor: '#ffffff'
      });
    }
    setIsModalOpen(true);
  };

  const openHistoryModal = (product: Product) => {
    const history = sales
      .filter(sale => sale.items.some(item => item.id === product.id))
      .map(sale => {
        const item = sale.items.find(i => i.id === product.id);
        return {
          saleId: sale.id,
          date: sale.timestamp,
          quantity: item?.quantity || 0,
          price: item?.price || 0,
          total: (item?.quantity || 0) * (item?.price || 0)
        };
      })
      .sort((a, b) => b.date - a.date);

    setSelectedProductHistory({ product, history });
    setIsHistoryModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) {
      alert("Por favor, insira ou gere um código para o produto.");
      return;
    }
    onSaveProduct(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800">📦 Estoque e Catálogo</h2>
            <p className="text-xs text-slate-500 mt-1">Gerencie produtos e subgrupos de marcas</p>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="text" 
              placeholder="Buscar item..." 
              className="px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button 
              onClick={() => openModal()}
              className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 flex items-center gap-2"
            >
              <span className="text-xl">+</span> Novo Item
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Cor</th>
                <th className="px-6 py-4">Código / Barras</th>
                <th className="px-6 py-4">Nome / Marca</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4">Estoque</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div 
                      className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" 
                      style={{ backgroundColor: product.backgroundColor || '#ffffff' }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        {product.code}
                      </span>
                      <span className="barcode text-slate-900" title={product.code}>
                        {product.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm">{product.name}</span>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[9px] text-slate-400 uppercase font-black px-1.5 py-0.5 bg-slate-100 rounded">
                          {product.category}
                        </span>
                        {product.subgroup && (
                          <span className="text-[9px] text-orange-500 uppercase font-black px-1.5 py-0.5 bg-orange-50 rounded border border-orange-100">
                            {product.subgroup}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase ${product.unitType === 'kg' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {product.unitType === 'kg' ? 'KG' : 'UN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-900 text-sm">
                    R$ {product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-black ${product.stock < 5 ? 'text-red-500' : 'text-slate-700'}`}>
                      {product.stock} {product.unitType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => openHistoryModal(product)} className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors" title="Histórico de Vendas">📜</button>
                      <button onClick={() => openModal(product)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Editar">✏️</button>
                      <button onClick={() => onDeleteProduct(product.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Excluir">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginação */}
        {totalPages > 1 && (
          <div className="p-6 flex justify-between items-center bg-slate-50/50 border-t border-slate-100">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs uppercase hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            <span className="text-sm text-slate-600">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs uppercase hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo →
            </button>
          </div>
        )}
      </div>

      {isHistoryModalOpen && selectedProductHistory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  📜 Histórico de Vendas
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Produto: <span className="text-orange-600 font-bold">{selectedProductHistory.product.name}</span>
                </p>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-2xl transition-colors">✕</button>
            </div>
            
            <div className="overflow-y-auto p-0 flex-1 custom-scrollbar">
              {selectedProductHistory.history.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <p className="text-4xl mb-4">📭</p>
                  <p className="font-bold uppercase tracking-widest text-xs">Nenhuma venda registrada para este item</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 sticky top-0">
                    <tr>
                      <th className="px-6 py-4">Data / Hora</th>
                      <th className="px-6 py-4">Nota (ID)</th>
                      <th className="px-6 py-4 text-right">Qtd. Vendida</th>
                      <th className="px-6 py-4 text-right">Preço Un.</th>
                      <th className="px-6 py-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedProductHistory.history.map((record, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-xs">
                              {new Date(record.date).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(record.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            #{record.saleId}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-700">
                          {record.quantity} {selectedProductHistory.product.unitType}
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-slate-500">
                          R$ {record.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">
                          R$ {record.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Total Vendido: <span className="text-slate-900 text-sm ml-2">{selectedProductHistory.history.reduce((acc, curr) => acc + curr.quantity, 0).toFixed(2)} {selectedProductHistory.product.unitType}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh] border border-slate-200 custom-scrollbar">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <h3 className="text-xl font-black text-slate-900">{editingProduct ? '📝 Editar Item' : '✨ Novo Item'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-2xl transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Cor de Exibição no PDV</label>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_COLORS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setFormData({ ...formData, backgroundColor: color.hex })}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        formData.backgroundColor === color.hex 
                          ? 'border-orange-500 scale-110 shadow-lg' 
                          : 'border-slate-100 hover:border-slate-300'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Tipo de Venda</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, unitType: 'un'})}
                      className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all ${formData.unitType === 'un' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-100 text-slate-400'}`}
                    >
                      📦 Unidade
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, unitType: 'kg'})}
                      className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all ${formData.unitType === 'kg' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-100 text-slate-400'}`}
                    >
                      ⚖️ Granel (Kg)
                    </button>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Código de Barras / SKU</label>
                  <div className="flex gap-2">
                    <input 
                      required
                      type="text" 
                      className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-orange-500 outline-none font-mono text-sm"
                      value={formData.code}
                      onChange={e => setFormData({...formData, code: e.target.value})}
                    />
                    <button type="button" onClick={generateBarcode} className="px-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase">Barcode</button>
                    <button type="button" onClick={generateAutoCode} className="px-3 bg-slate-100 rounded-xl font-bold text-[10px] uppercase">Auto</button>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Nome do Item</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Categoria</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm bg-white"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Subgrupo / Marca</label>
                  {formData.category === 'Ração' ? (
                    <select 
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm bg-white"
                      value={formData.subgroup}
                      onChange={e => setFormData({...formData, subgroup: e.target.value})}
                    >
                      {SUBGROUPS_RACAO.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="Ex: Marca"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm"
                      value={formData.subgroup || ''}
                      onChange={e => setFormData({...formData, subgroup: e.target.value})}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Estoque Inicial</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: parseFloat(e.target.value) || 0})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Custo (R$)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-orange-500 outline-none text-sm"
                    value={formData.costPrice}
                    onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value) || 0})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Preço de Venda (R$)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-orange-500 outline-none text-lg font-black text-orange-600"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                  />
                </div>

                {/* Painel de Lucratividade */}
                <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lucro por Unidade</p>
                    <p className="text-lg font-black text-green-600">
                      R$ {(formData.price - formData.costPrice).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Margem (Markup)</p>
                    <p className={`text-lg font-black ${formData.costPrice > 0 && (formData.price - formData.costPrice) / formData.costPrice > 0.3 ? 'text-green-600' : 'text-orange-500'}`}>
                      {formData.costPrice > 0 
                        ? (((formData.price - formData.costPrice) / formData.costPrice) * 100).toFixed(1) 
                        : '0.0'}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-100 text-slate-500 font-bold">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-orange-600 text-white font-black hover:bg-orange-700 shadow-xl shadow-orange-100">Salvar Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
