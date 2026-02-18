
import React from 'react';

interface BottomBarProps {
  subtotal: number;
  tax: number;
  total: number;
  onPay: () => void;
  onShowHistory: () => void;
  disabled: boolean;
  currencySymbol: string;
  tokens: number; // New
}

const BottomBar: React.FC<BottomBarProps> = ({ subtotal, tax, total, onPay, onShowHistory, disabled, currencySymbol, tokens }) => {
  const isOutOfTokens = tokens <= 0;

  return (
    <div className="h-32 bg-gray-900 text-white flex shrink-0 p-4 gap-4 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      {/* Left section: Totals */}
      <div className="w-1/3 flex items-center gap-8 px-6 bg-gray-800 rounded-xl">
        <div className="flex flex-col gap-1 text-gray-400 uppercase font-bold text-xs">
          <div className="flex justify-between w-40">
            <span>Subtotal</span>
            <span className="text-gray-200">{currencySymbol}{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-40">
            <span>Tax (10%)</span>
            <span className="text-gray-200">{currencySymbol}{tax.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-black text-blue-400 tracking-[0.2em] mb-1">TOTAL TO PAY</span>
          <span className="text-5xl font-black tabular-nums">{currencySymbol}{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Right section: Actions */}
      <div className="flex-1 grid grid-cols-4 gap-4">
        <button 
          onClick={onShowHistory}
          className="flex flex-col items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all active:scale-95"
        >
          <svg className="w-6 h-6 mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          HISTORY
        </button>
        <button 
          className="flex flex-col items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all active:scale-95"
          disabled={disabled}
        >
          <svg className="w-6 h-6 mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          HOLD
        </button>
        
        {/* Token Alert Indicator */}
        <div className="flex flex-col items-center justify-center bg-gray-800 border border-gray-700 rounded-xl">
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Status</span>
           {isOutOfTokens ? (
             <div className="flex flex-col items-center animate-pulse">
               <span className="text-red-500 font-black text-sm uppercase leading-none">RECHARGE</span>
               <span className="text-[8px] font-bold text-red-400 uppercase mt-1">Keys Inactive</span>
             </div>
           ) : (
             <div className="flex flex-col items-center">
                <span className="text-green-500 font-black text-sm uppercase leading-none">{tokens} TOKENS</span>
                <span className="text-[8px] font-bold text-green-400 uppercase mt-1">Ready to Sale</span>
             </div>
           )}
        </div>

        <button 
          onClick={onPay}
          disabled={disabled || isOutOfTokens}
          className={`flex flex-col items-center justify-center rounded-xl font-black text-2xl transition-all shadow-xl active:scale-95 ${
            disabled || isOutOfTokens
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed shadow-none' 
              : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/40'
          }`}
        >
          <span className="text-sm font-bold opacity-80 mb-1 uppercase">
            {isOutOfTokens ? 'NO TOKENS' : 'PAY NOW'}
          </span>
          {currencySymbol}{total.toFixed(2)}
        </button>
      </div>
    </div>
  );
};

export default BottomBar;
