import React, { useState, useMemo } from 'react';
import { Expense } from '../types';

interface ExpensesModalProps {
  expenses: Expense[];
  onClose: () => void;
  currencySymbol: string;
}

const ExpensesModal: React.FC<ExpensesModalProps> = ({ expenses, onClose, currencySymbol }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [timeRange, setTimeRange] = useState<7 | 30 | 90 | 365>(30);

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date(now.setDate(now.getDate() - timeRange));

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.timestamp);
      const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            expense.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || expense.category === categoryFilter;
      const matchesTime = expenseDate >= cutoffDate;

      return matchesSearch && matchesCategory && matchesTime;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [expenses, searchTerm, categoryFilter, timeRange]);

  const categories = useMemo(() => {
    const cats = new Set(expenses.map(e => e.category));
    return ['All', ...Array.from(cats)];
  }, [expenses]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const expensesByCategory = useMemo(() => {
    const breakdown: Record<string, number> = {};
    filteredExpenses.forEach(expense => {
      breakdown[expense.category] = (breakdown[expense.category] || 0) + expense.amount;
    });
    return Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[500] p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-5xl h-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 bg-gray-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-orange-600 rounded-2xl shadow-lg shadow-orange-900/50">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Expense Breakdown</h2>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Detailed Financial Analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors text-white border-2 border-white/10">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {[7, 30, 90, 365].map(days => (
              <button
                key={days}
                onClick={() => setTimeRange(days as any)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${timeRange === days ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'}`}
              >
                {days === 365 ? '1 Year' : `${days} Days`}
              </button>
            ))}
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-3 bg-white border-2 border-gray-200 rounded-xl text-xs font-bold uppercase outline-none focus:border-blue-500 text-gray-700"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="relative flex-1 md:w-64">
              <input 
                type="text" 
                placeholder="Search expenses..."
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-xs outline-none focus:border-blue-500 transition-colors text-gray-900 uppercase"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-100">
          
          {/* Left: List */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-3">
            {filteredExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-black uppercase tracking-widest text-sm">No expenses found</p>
              </div>
            ) : (
              filteredExpenses.map(expense => (
                <div key={expense.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-black text-xs uppercase border border-orange-100">
                      {expense.category.substring(0, 2)}
                    </div>
                    <div>
                      <div className="font-black text-gray-900 text-sm uppercase tracking-tight">{expense.category}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        {new Date(expense.timestamp).toLocaleDateString()} • {expense.description || 'No Description'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-gray-900 tabular-nums tracking-tight">
                      <span className="text-xs text-gray-400 mr-1">{currencySymbol}</span>
                      {expense.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right: Summary */}
          <div className="w-full md:w-96 bg-white border-l border-gray-200 p-8 overflow-y-auto custom-scrollbar flex flex-col gap-8 shadow-xl z-10">
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Expenses</h3>
              <div className="text-5xl font-black text-gray-900 tracking-tighter tabular-nums leading-none">
                <span className="text-2xl text-gray-300 mr-2">{currencySymbol}</span>
                {totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2">Category Breakdown</h3>
              <div className="space-y-4">
                {expensesByCategory.map(([cat, amount]) => {
                  const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-xs font-black text-gray-700 uppercase tracking-tight">{cat}</span>
                        <span className="text-xs font-bold text-gray-900 tabular-nums">
                          {currencySymbol}{amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-right mt-1">
                        <span className="text-[9px] font-bold text-gray-400">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-12 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpensesModal;
