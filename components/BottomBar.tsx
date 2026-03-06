import React from 'react';

interface BottomBarProps {
  subtotal: number;
  total: number;
  onPay: () => void;
  onShowHistory: () => void;
  disabled: boolean;
  currencySymbol: string;
  tokens: number;
  todayProfit: number;
  todayCost: number;
  todayRevenue: number;
  isMaster?: boolean;
  canSeeProfit?: boolean;
  onOpenProfitHistory?: () => void;
  onOpenExpenses?: () => void;
}

const BottomBar: React.FC<BottomBarProps> = ({ 
  subtotal, total, onPay, onShowHistory, disabled, currencySymbol, tokens,
  todayProfit, todayCost, todayRevenue, isMaster = false, canSeeProfit = false, onOpenProfitHistory, onOpenExpenses
}) => {
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
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-black text-blue-400 tracking-[0.2em] mb-1">TOTAL TO PAY</span>
          <span className="text-5xl font-black tabular-nums">{currencySymbol}{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Right section: Actions */}
      <div className="flex-1 grid grid-cols-5 gap-4">
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
          onClick={onOpenProfitHistory}
          className="flex flex-col items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all active:scale-95"
        >
          <svg className="w-6 h-6 mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z" />
          </svg>
          PROFIT
        </button>

        <button 
          onClick={onOpenExpenses}
          className="flex flex-col items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all active:scale-95"
        >
          <svg className="w-6 h-6 mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          EXPENSES
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
          className={`flex flex-col items-center justify-center rounded-xl font-black text-2xl transition-all shadow-xl active:scale-95 ${disabled || isOutOfTokens ? 'bg-gray-600 text-gray-400 cursor-not-allowed shadow-none' : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/40'}`}
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
