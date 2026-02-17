
import React from 'react';
import { Sale, CompanyInfo } from '../types';

interface ReceiptModalProps {
  sale: Sale;
  companyInfo: CompanyInfo;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, companyInfo, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const totalPaid = sale.payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden print:shadow-none print:w-full">
        <div className="p-8 print:p-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{companyInfo.name}</h2>
            <p className="text-xs text-slate-500">CNPJ/CPF: {companyInfo.document}</p>
            <p className="text-[10px] text-slate-400 uppercase">{companyInfo.address}</p>
          </div>

          <div className="border-t border-b border-dashed border-slate-300 py-3 mb-4 flex justify-between text-[10px] font-mono text-slate-600 uppercase">
            <span>Venda: #{sale.id}</span>
            <span>{new Date(sale.timestamp).toLocaleString('pt-BR')}</span>
          </div>

          <div className="space-y-3 mb-6">
            {sale.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 text-xs font-medium text-slate-800">
                <div className="col-span-6 flex flex-col">
                  <span className="truncate">{item.name}</span>
                  <span className="text-[9px] text-slate-400">R$ {item.price.toFixed(2)}</span>
                </div>
                <span className="col-span-2 text-center">
                  {item.unitType === 'kg' ? item.quantity.toFixed(3) : item.quantity}
                </span>
                <span className="col-span-4 text-right font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-slate-300 pt-4 space-y-2">
            <div className="flex justify-between items-center text-sm font-black text-slate-900 mb-2">
              <span className="uppercase tracking-widest text-xs">Total</span>
              <span className="text-xl">R$ {sale.total.toFixed(2)}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between text-[10px] text-slate-500 italic uppercase">
              <span>Pagamento: {sale.payments.map(p => p.method).join(', ')}</span>
              {sale.change && <span>Troco: R$ {sale.change.toFixed(2)}</span>}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-1">
            <div className="barcode text-5xl text-black">{sale.id}</div>
            <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Obrigado pela preferência!</div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 flex gap-3 print:hidden">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
          >
            Nova Venda
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 shadow-lg shadow-orange-100 transition-colors"
          >
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
