
import React, { useState } from 'react';
import { PaymentRecord } from '../types';

interface CheckoutModalProps {
  total: number;
  onClose: () => void;
  onComplete: (payments: PaymentRecord[]) => void;
  currencySymbol: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ total, onClose, onComplete, currencySymbol }) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [currentAmount, setCurrentAmount] = useState('0');
  const [activeMethod, setActiveMethod] = useState<'CASH' | 'CARD' | 'MOBILE'>('CASH');

  const paidAmount = payments.reduce((acc, p) => acc + p.amount, 0);
  const remaining = Math.max(0, total - paidAmount);
  const change = Math.max(0, paidAmount - total);

  const handleNumClick = (val: string) => {
    setCurrentAmount(prev => {
      if (prev === '0' && val !== '.') return val;
      if (val === '.' && prev.includes('.')) return prev;
      return prev + val;
    });
  };

  const handleBackspace = () => {
    setCurrentAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  const addPayment = () => {
    const amount = parseFloat(currentAmount);
    if (amount > 0) {
      setPayments(prev => [...prev, { method: activeMethod, amount }]);
      setCurrentAmount('0');
    }
  };

  const handleComplete = () => {
    if (paidAmount >= total) {
      onComplete(payments);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 sm:p-10 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-6xl flex flex-col md:flex-row overflow-hidden shadow-2xl border-4 border-white/20 max-h-[95vh]">
        
        {/* Left: Summary Panel */}
        <div className="w-full md:w-[380px] bg-gray-100 p-6 sm:p-10 flex flex-col border-r-2 border-gray-200 overflow-y-auto custom-scrollbar">
          <button onClick={onClose} className="mb-6 flex items-center gap-3 text-gray-400 hover:text-gray-900 font-black uppercase text-xs tracking-widest transition-colors group">
            <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-gray-900 group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            Back
          </button>

          <div className="space-y-6 flex-1">
             <div>
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-1">Total Bill</label>
               <div className="text-3xl font-black text-gray-900 tabular-nums leading-none">
                 <span className="text-lg opacity-30 mr-1">{currencySymbol}</span>
                 {total.toFixed(2)}
               </div>
             </div>
             
             <div className="h-px bg-gray-200"></div>

             {remaining > 0 ? (
               <div>
                 <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] block mb-1">Balance Due</label>
                 <div className="text-4xl font-black text-blue-600 tabular-nums leading-none tracking-tighter">
                   <span className="text-xl opacity-40 mr-1">{currencySymbol}</span>
                   {remaining.toFixed(2)}
                 </div>
               </div>
             ) : (
               <div className="animate-bounce">
                 <label className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] block mb-1">Change</label>
                 <div className="text-4xl font-black text-green-600 tabular-nums leading-none tracking-tighter">
                   <span className="text-xl opacity-40 mr-1">{currencySymbol}</span>
                   {change.toFixed(2)}
                 </div>
               </div>
             )}

             <div className="pt-4 border-t border-dashed border-gray-300">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Splits</label>
                <div className="space-y-2">
                  {payments.map((p, i) => (
                    <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${p.method === 'CASH' ? 'bg-green-500' : p.method === 'CARD' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                        <span className="font-black text-[9px] uppercase text-gray-800">{p.method}</span>
                      </div>
                      <span className="font-mono font-black text-xs text-gray-900">{currencySymbol}{p.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          <button 
            onClick={handleComplete}
            disabled={paidAmount < total}
            className={`w-full mt-6 py-5 rounded-2xl text-lg font-black shadow-xl transition-all active:scale-95 ${
              paidAmount >= total 
                ? 'bg-gray-900 text-white hover:bg-black shadow-gray-400' 
                : 'bg-gray-300 text-gray-100 cursor-not-allowed'
            }`}
          >
            FINALIZE SALE
          </button>
        </div>

        {/* Right: Payment Input Area */}
        <div className="flex-1 flex flex-col p-6 sm:p-10 bg-white overflow-y-auto custom-scrollbar">
          <div className="flex gap-3 mb-6 shrink-0">
            {[
              { id: 'CASH', label: 'CASH', color: 'green' },
              { id: 'CARD', label: 'CARD', color: 'blue' },
              { id: 'MOBILE', label: 'TRANSFER', color: 'orange' }
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setActiveMethod(method.id as any)}
                className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest border-2 transition-all active:scale-95 ${
                  activeMethod === method.id 
                    ? `border-${method.color}-600 bg-${method.color}-50 text-${method.color}-700 shadow-lg` 
                    : 'border-gray-100 text-gray-400 hover:bg-gray-50'
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div className="shrink-0">
              <div 
                className="p-6 rounded-2xl flex justify-between items-center transition-all border-4 bg-gray-900 text-white border-blue-500 shadow-xl"
              >
                 <span className="text-sm font-black uppercase tracking-widest opacity-40">Entry</span>
                 <div className="flex items-baseline gap-2">
                   <span className="text-xl font-black opacity-30">{currencySymbol}</span>
                   <span className="text-5xl font-black tabular-nums">{currentAmount}</span>
                 </div>
              </div>
            </div>

            <div className="flex-1 min-h-[300px]">
              <div className="grid grid-cols-3 gap-3 h-full pb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(val => (
                  <button
                    key={val}
                    onClick={() => handleNumClick(val.toString())}
                    className="bg-gray-50 border border-gray-100 rounded-xl text-3xl font-black text-gray-900 hover:bg-white hover:border-blue-500 transition-all active:scale-90"
                  >
                    {val}
                  </button>
                ))}
                <button onClick={() => setCurrentAmount('0')} className="bg-red-50 text-red-600 rounded-xl text-lg font-black border border-red-100">CLR</button>
                <button onClick={() => handleNumClick('0')} className="bg-gray-50 border border-gray-100 rounded-xl text-3xl font-black text-gray-900">0</button>
                <button onClick={handleBackspace} className="bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-900">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                   </svg>
                </button>
              </div>

              <button 
                onClick={addPayment}
                className={`w-full py-6 rounded-2xl text-xl font-black flex items-center justify-center gap-4 shadow-xl transition-all active:scale-95 border-b-4 ${
                  activeMethod === 'CASH' ? 'bg-green-600 border-green-800 text-white' : 
                  activeMethod === 'CARD' ? 'bg-blue-600 border-blue-800 text-white' : 
                  'bg-orange-600 border-orange-800 text-gray-900'
                }`}
              >
                <span>CONFIRM {activeMethod}</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
