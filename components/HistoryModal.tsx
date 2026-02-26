
import React, { useState, useMemo } from 'react';
import { TransactionRecord, SystemMode } from '../types';

import { Staff } from '../types';

interface HistoryModalProps {
  history: TransactionRecord[];
  onClose: () => void;
  onReprint: (transaction: TransactionRecord) => void;
  onDeleteTransaction: (transactionId: string) => void;
  currencySymbol: string;
  currentStaff: Staff | null;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ history, onClose, onReprint, onDeleteTransaction, currencySymbol, currentStaff }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modeFilter, setModeFilter] = useState<'ALL' | SystemMode>('ALL');

  const setQuickDate = (range: 'today' | 'yesterday' | 'week') => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (range === 'today') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (range === 'yesterday') {
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
    } else if (range === 'week') {
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const filteredHistory = useMemo(() => {
    return history.filter(tx => {
      const matchesSearch = tx.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (tx.customerName && tx.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
      const txDate = new Date(tx.timestamp);
      
      let matchesDate = true;
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (txDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (txDate > end) matchesDate = false;
      }

      const matchesMode = modeFilter === 'ALL' || tx.mode === modeFilter;

      return matchesSearch && matchesDate && matchesMode;
    });
  }, [history, searchQuery, startDate, endDate, modeFilter]);

  // Grouping logic
  const groupedHistory = useMemo(() => {
    const groups: Record<string, TransactionRecord[]> = {};
    filteredHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).forEach(tx => {
      const dateKey = tx.timestamp.toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tx);
    });
    return groups;
  }, [filteredHistory]);

  const totalRevenue = filteredHistory.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="fixed inset-0 bg-white z-[1000] flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gray-900 text-white px-8 py-6 flex justify-between items-center shrink-0 shadow-xl">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Sales Ledger</h2>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Transaction History & Analytics</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
            <p className="text-4xl font-black tabular-nums text-green-400">{currencySymbol}{totalRevenue.toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-lg">Close Ledger</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden bg-gray-50">
        {/* Sidebar Filters */}
        <div className="w-80 border-r bg-white p-8 flex flex-col gap-8 overflow-y-auto">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Search Transactions</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="ID, Customer, Staff..."
                className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold outline-none transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="w-5 h-5 absolute left-3.5 top-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Filter by Mode</label>
            <div className="grid grid-cols-1 gap-2">
              {['ALL', SystemMode.RESTAURANT, SystemMode.SUPERMARKET].map(mode => (
                <button 
                  key={mode} 
                  onClick={() => setModeFilter(mode as any)}
                  className={`py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all text-left flex justify-between items-center ${modeFilter === mode ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  {mode === SystemMode.SUPERMARKET ? 'RETAIL' : mode}
                  {modeFilter === mode && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Quick Date Range</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Today', value: 'today' },
                { label: 'Yesterday', value: 'yesterday' },
                { label: 'Last 7 Days', value: 'week' },
                { label: 'All Time', value: 'all' }
              ].map(range => (
                <button 
                  key={range.value} 
                  onClick={() => {
                    if (range.value === 'all') {
                      setStartDate('');
                      setEndDate('');
                    } else {
                      setQuickDate(range.value as any);
                    }
                  }}
                  className={`py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all text-left flex justify-between items-center ${range.value === 'all' && !startDate && !endDate ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {Object.keys(groupedHistory).length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 uppercase font-black">
              <svg className="w-24 h-24 mb-6 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              <p className="tracking-[0.5em]">No Transactions Found</p>
            </div>
          ) : (
            <div className="space-y-12 max-w-6xl mx-auto">
              {Object.entries(groupedHistory).map(([date, txs]) => (
                <div key={date} className="animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{date}</h3>
                    <div className="h-px flex-1 bg-gray-200"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white px-4 py-1 rounded-full border shadow-sm">
                      {txs.length} Sales
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {txs.map((tx) => (
                      <div key={tx.id} className="bg-white rounded-3xl p-6 shadow-sm border border-transparent hover:border-blue-500 transition-all group flex items-center gap-8">
                        <div className="w-20 h-20 bg-gray-50 rounded-2xl flex flex-col items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                          <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">TXID</span>
                          <span className="text-sm font-black text-gray-900">#{tx.id}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${tx.mode === SystemMode.RESTAURANT ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}`}>
                               {tx.mode}
                             </span>
                             <span className="text-[10px] font-bold text-gray-400 uppercase">
                               {tx.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                             {tx.couponApplied && (
                               <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                 5% Coupon
                               </span>
                             )}
                          </div>
                          <h4 className="text-lg font-black text-gray-900 uppercase truncate">
                            {tx.customerName || 'Walk-in Customer'}
                          </h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Sold by {tx.sellerName} • {tx.items.length} Items
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Paid</p>
                          <p className="text-2xl font-black text-gray-900 tabular-nums">
                            {currencySymbol}{tx.total.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onReprint(tx)}
                            className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="Reprint Receipt"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </button>
                          {currentStaff?.role === 'Manager' && (
                            <button 
                              onClick={() => onDeleteTransaction(tx.id)}
                              className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                              title="Delete Transaction"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
