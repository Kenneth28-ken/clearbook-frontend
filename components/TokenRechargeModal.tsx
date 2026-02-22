
import React, { useState } from 'react';

interface TokenRechargeModalProps {
  onClose: () => void;
  onRecharge: (amount: number, type: 'SALES' | 'WHATSAPP') => void;
  currencySymbol: string;
}

const TokenRechargeModal: React.FC<TokenRechargeModalProps> = ({ onClose, onRecharge, currencySymbol }) => {
  const [masterKey, setMasterKey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(100);
  const [refillType, setRefillType] = useState<'SALES' | 'WHATSAPP'>('SALES');
  const [error, setError] = useState('');

  const MASTER_KEY = "961996";
  
  // Pricing: Sales = 200 per unit, WhatsApp = 100 per unit
  const unitPrice = refillType === 'SALES' ? 200 : 100;
  const totalPrice = rechargeAmount * unitPrice;

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterKey.trim().toLowerCase() === MASTER_KEY.toLowerCase()) {
      setIsAuthorized(true);
      setError('');
    } else {
      setError('Invalid Authorization Key');
      setMasterKey('');
    }
  };

  const handleRecharge = () => {
    onRecharge(rechargeAmount, refillType);
    onClose();
  };

  // Phase 1: Security PIN Lock (Expanded)
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-[500] p-4 sm:p-10 overflow-y-auto">
        <div className="bg-white rounded-[3.5rem] w-full max-w-3xl overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300">
          <div className="p-8 sm:p-12 bg-gray-900 text-white flex justify-between items-center">
             <button 
                onClick={onClose}
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-all group"
             >
                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 border border-white/5">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                   </svg>
                </div>
                <span className="font-black text-xs uppercase tracking-[0.2em]">Return to Sales</span>
             </button>
             <div className="text-right">
                <h2 className="text-2xl font-black uppercase tracking-tight">Security Access</h2>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.3em]">Administrator Authentication</p>
             </div>
          </div>

          <div className="p-10 sm:p-24 flex flex-col items-center">
             <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-blue-900/40">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
             </div>
             
             <form onSubmit={handleAuthorize} className="w-full max-w-md space-y-10">
                <div className="text-center">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] block mb-8">Enter Secret Admin Code</label>
                   <input 
                     autoFocus
                     type="password"
                     placeholder="••••"
                     className="w-full p-8 bg-gray-50 border-4 border-gray-100 rounded-[3rem] text-4xl font-black text-center outline-none focus:border-blue-600 focus:bg-white transition-all text-gray-900 shadow-inner tracking-widest"
                     value={masterKey}
                     onChange={(e) => setMasterKey(e.target.value)}
                   />
                </div>

                {error && (
                  <div className="p-5 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase text-center border-2 border-red-100 animate-shake">
                     {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={!masterKey}
                  className={`w-full py-8 rounded-[2.5rem] text-xl font-black shadow-2xl transition-all active:scale-95 uppercase tracking-[0.2em] ${
                    masterKey ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  UNLOCK REFILL CONSOLE
                </button>
             </form>
          </div>
        </div>
      </div>
    );
  }

  // Phase 2: Expanded & Optimized Recharge Dashboard (Laptop Friendly)
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex items-center justify-center z-[500] p-4 sm:p-10 overflow-y-auto">
      <div className="bg-white rounded-[4rem] w-full max-w-6xl h-full max-h-[92vh] overflow-hidden shadow-[0_0_180px_rgba(0,0,0,0.8)] flex flex-col animate-in slide-in-from-bottom-12 duration-500 border-[12px] border-white/10">
        
        {/* Header - Expansive with Back Button */}
        <div className="px-10 py-10 sm:px-16 sm:py-12 bg-gray-900 text-white flex justify-between items-center shrink-0 border-b border-white/5">
           <div className="flex items-center gap-10">
              <button 
                onClick={() => setIsAuthorized(false)}
                className="flex items-center gap-4 text-gray-400 hover:text-white transition-all group"
                title="Return to Security Screen"
              >
                 <div className="p-4 bg-white/5 rounded-[1.5rem] group-hover:bg-white/10 border border-white/5 shadow-inner">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                 </div>
                 <div className="hidden lg:block text-left">
                    <span className="font-black text-xs uppercase tracking-widest block">Previous Return</span>
                    <span className="text-[9px] font-bold opacity-30 uppercase">To Pin Auth</span>
                 </div>
              </button>
              
              <div className="h-16 w-px bg-white/10 hidden lg:block"></div>
              
              <div>
                 <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none">Token Recharge</h2>
                 <p className="text-blue-400 font-bold text-[11px] uppercase tracking-[0.3em] mt-3">Acquire System Operational Credits</p>
              </div>
           </div>

           <button 
            onClick={onClose} 
            className="p-4 hover:bg-red-600 hover:text-white rounded-full transition-all text-gray-600 border-2 border-transparent hover:border-red-400 group"
           >
              <svg className="w-10 h-10 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
           </button>
        </div>

        {/* Scrollable Main Content - Optimized for wide screens */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 sm:p-16 bg-gray-50/50 space-y-12">
           
           {/* Section 1: Account Selection (Grid) */}
           <div className="space-y-6">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] block px-4">1. Select Target Account</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <button 
                   onClick={() => setRefillType('SALES')}
                   className={`p-10 rounded-[3rem] border-4 transition-all flex items-center gap-10 text-left group relative overflow-hidden ${
                     refillType === 'SALES' ? 'bg-blue-600 border-blue-400 text-white shadow-3xl shadow-blue-900/30' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-100'
                   }`}
                 >
                    <div className={`p-6 rounded-[1.5rem] transition-colors ${refillType === 'SALES' ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                       <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                       </svg>
                    </div>
                    <div>
                       <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60">Operations Channel</span>
                       <h4 className="font-black text-3xl uppercase tracking-tighter leading-none mt-2">Terminal Sales</h4>
                       <p className={`text-xs mt-3 font-bold uppercase ${refillType === 'SALES' ? 'text-blue-100' : 'text-gray-400'}`}>Units for Checkout & Printing</p>
                    </div>
                    {refillType === 'SALES' && <div className="absolute top-4 right-6 text-[10px] font-black bg-white/20 px-4 py-1 rounded-full uppercase">Selected</div>}
                 </button>

                 <button 
                   onClick={() => setRefillType('WHATSAPP')}
                   className={`p-10 rounded-[3rem] border-4 transition-all flex items-center gap-10 text-left group relative overflow-hidden ${
                     refillType === 'WHATSAPP' ? 'bg-green-600 border-green-400 text-white shadow-3xl shadow-green-900/30' : 'bg-white border-gray-100 text-gray-400 hover:border-green-100'
                   }`}
                 >
                    <div className={`p-6 rounded-[1.5rem] transition-colors ${refillType === 'WHATSAPP' ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-green-50 group-hover:text-green-600'}`}>
                       <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                       </svg>
                    </div>
                    <div>
                       <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60">CRM Marketing</span>
                       <h4 className="font-black text-3xl uppercase tracking-tighter leading-none mt-2">WhatsApp Hub</h4>
                       <p className={`text-xs mt-3 font-bold uppercase ${refillType === 'WHATSAPP' ? 'text-green-100' : 'text-gray-400'}`}>Units for CRM Messages</p>
                    </div>
                    {refillType === 'WHATSAPP' && <div className="absolute top-4 right-6 text-[10px] font-black bg-white/20 px-4 py-1 rounded-full uppercase">Selected</div>}
                 </button>
              </div>
           </div>

           {/* Section 2: Refill Amount (Expansive Grid) */}
           <div className="space-y-6">
              <div className="flex justify-between items-center px-6">
                 <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">2. Choose Credit Volume</label>
                 <div className="flex gap-4">
                    <span className={`text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest border transition-all ${refillType === 'SALES' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                      Sales Price: ₦200 / Unit
                    </span>
                    <span className={`text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest border transition-all ${refillType === 'WHATSAPP' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                      WA Price: ₦100 / Unit
                    </span>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                 {[50, 100, 500, 1000, 2500, 5000].map(amt => (
                   <button
                     key={amt}
                     onClick={() => setRechargeAmount(amt)}
                     className={`p-8 rounded-[2.5rem] border-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
                       rechargeAmount === amt 
                        ? (refillType === 'SALES' ? 'bg-blue-600 border-blue-600' : 'bg-green-600 border-green-600') + ' text-white shadow-2xl scale-110 z-10' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                     }`}
                   >
                      <span className="text-3xl font-black">{amt.toLocaleString()}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Units</span>
                   </button>
                 ))}
              </div>
           </div>

           {/* Section 3: Professional Invoice Bill (Wide Optimized) */}
           <div className="bg-gray-900 rounded-[4rem] p-10 sm:p-16 text-white shadow-[0_30px_100px_rgba(0,0,0,0.4)] relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-96 h-96 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] transition-colors duration-700 ${refillType === 'SALES' ? 'bg-blue-400' : 'bg-green-400'}`}></div>
              <div className={`absolute bottom-0 left-0 w-64 h-64 opacity-5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px] transition-colors duration-700 ${refillType === 'SALES' ? 'bg-blue-400' : 'bg-green-400'}`}></div>
              
              <div className="flex flex-col lg:flex-row justify-between items-center gap-16 relative z-10">
                 <div className="text-center lg:text-left flex-1">
                    <div className={`text-[11px] font-black uppercase tracking-[0.5em] mb-4 transition-colors ${refillType === 'SALES' ? 'text-blue-400' : 'text-green-400'}`}>Payment Subtotal</div>
                    <div className="text-7xl sm:text-8xl font-black tabular-nums text-white leading-none tracking-tighter">
                       <span className={`text-4xl mr-4 transition-colors ${refillType === 'SALES' ? 'text-blue-400' : 'text-green-400'}`}>{currencySymbol}</span>
                       {totalPrice.toLocaleString()}
                    </div>
                    <p className="text-[11px] text-gray-500 font-bold uppercase mt-8 tracking-[0.3em] leading-relaxed">Fees applied immediately to your business wallet.</p>
                 </div>

                 <div className="hidden lg:block h-32 w-px bg-white/10 mx-10"></div>

                 <div className="text-center lg:text-right flex-1">
                    <div className="text-[11px] font-black text-gray-500 uppercase tracking-[0.5em] mb-4">Unit Allocation</div>
                    <div className={`text-5xl sm:text-6xl font-black uppercase tracking-tight transition-colors ${refillType === 'SALES' ? 'text-blue-400' : 'text-green-400'}`}>
                       +{rechargeAmount.toLocaleString()} Credits
                    </div>
                    <div className="mt-4 flex flex-col lg:items-end">
                       <div className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">Target: {refillType} LEDGER</div>
                       <div className="mt-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase text-gray-400">Rate: 1 Unit = {currencySymbol}{unitPrice}</div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Action: Expansive Confirm Button */}
           <div className="pt-6 pb-20 px-4">
             <button 
               onClick={handleRecharge}
               className={`w-full py-10 text-white font-black text-3xl rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.4)] active:scale-95 transition-all flex items-center justify-center gap-8 uppercase tracking-tighter group relative overflow-hidden ${
                  refillType === 'SALES' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'
               }`}
             >
               <span className="relative z-10">AUTHORIZE & ADD CREDITS</span>
               <div className="p-3 bg-white/20 rounded-full group-hover:scale-125 transition-transform relative z-10">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
               </div>
               
               {/* Button Hover Glow */}
               <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
             </button>
             
             <p className="text-center mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] opacity-40">
               Secured Transaction • Verified by ClearBook Protocol
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TokenRechargeModal;
