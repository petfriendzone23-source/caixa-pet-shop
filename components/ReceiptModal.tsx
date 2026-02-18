
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

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 print:p-0 print:bg-white print:static print:inset-auto">
      {/* O container principal ganha a classe 'print-container' referenciada no CSS global */}
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden print:shadow-none print:w-full print:rounded-none print-container">
        <div className="p-8 print:p-4 font-mono-receipt">
          <div className="text-center mb-6 border-b border-dashed border-slate-300 pb-4">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{companyInfo.name}</h2>
            <p className="text-[10px] text-slate-500 font-bold">CNPJ/CPF: {companyInfo.document}</p>
            <p className="text-[9px] text-slate-400 uppercase leading-tight">{companyInfo.address}</p>
            {companyInfo.phone && <p className="text-[9px] text-slate-400">{companyInfo.phone}</p>}
          </div>

          <div className="py-2 mb-4 flex justify-between text-[10px] font-bold text-slate-700 uppercase">
            <span>DOC: #{sale.id}</span>
            <span>{new Date(sale.timestamp).toLocaleString('pt-BR')}</span>
          </div>

          <div className="text-[11px] font-bold border-b border-slate-200 pb-1 mb-2 grid grid-cols-12 text-slate-400 uppercase">
            <span className="col-span-6">ITEM</span>
            <span className="col-span-2 text-center">QTD</span>
            <span className="col-span-4 text-right">TOTAL</span>
          </div>

          <div className="space-y-2 mb-6 border-b border-dashed border-slate-300 pb-4">
            {sale.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 text-[11px] leading-tight text-slate-800">
                <div className="col-span-6 flex flex-col">
                  <span className="font-bold uppercase">{item.name}</span>
                  <span className="text-[9px] text-slate-500">
                    {item.subgroup && `${item.subgroup} | `}R$ {item.price.toFixed(2)}
                  </span>
                </div>
                <span className="col-span-2 text-center self-center font-bold">
                  {item.unitType === 'kg' ? item.quantity.toFixed(3) : item.quantity}
                </span>
                <span className="col-span-4 text-right self-center font-black">R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1 mb-4">
            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
              <span className="uppercase">Subtotal</span>
              <span>R$ {sale.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-1 border-t border-slate-100">
              <span className="uppercase tracking-widest text-xs">Total à Pagar</span>
              <span className="text-lg">R$ {sale.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-slate-50 print:bg-transparent p-3 rounded-xl border border-slate-100 print:border-none print:p-0 mb-4">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Pagamento realizado:</p>
            <div className="space-y-1">
              {sale.payments.map((p, idx) => (
                <div key={idx} className="flex justify-between text-[10px] font-bold text-slate-700">
                  <span>{p.method}</span>
                  <span>R$ {p.amount.toFixed(2)}</span>
                </div>
              ))}
              {sale.change && sale.change > 0 && (
                <div className="flex justify-between text-[10px] font-black text-green-600 border-t border-green-100 pt-1 mt-1">
                  <span>TROCO</span>
                  <span>R$ {sale.change.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {sale.customerName && (
            <div className="mb-6 text-[10px] border-t border-slate-100 pt-2">
              <span className="font-black text-slate-400 uppercase mr-1">Cliente:</span>
              <span className="font-bold text-slate-700 uppercase">{sale.customerName}</span>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-1 border-t border-dashed border-slate-300 pt-6">
            <div className="barcode text-5xl text-black leading-none">{sale.id}</div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">Obrigado pela preferência!</p>
            <p className="text-[7px] text-slate-300 mt-1 font-bold italic">NexusPet PDV v1.5.0</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 flex gap-3 print:hidden border-t border-slate-100">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase hover:bg-slate-100 transition-colors"
          >
            Fechar
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 px-4 py-3 rounded-xl bg-orange-600 text-white font-black text-xs uppercase hover:bg-orange-700 shadow-lg shadow-orange-100 transition-colors flex items-center justify-center gap-2"
          >
            <span>🖨️</span> Imprimir Notinha
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
