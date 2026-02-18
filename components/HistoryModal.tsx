
import React, { useState, useMemo } from 'react';
import { TransactionRecord, SystemMode } from '../types';

interface HistoryModalProps {
  history: TransactionRecord[];
  onClose: () => void;
  onVoid: (id: string) => void;
  onViewReceipt: (tx: TransactionRecord) => void;
  isManager: boolean;
  currencySymbol: string;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ history, onClose, onVoid, onViewReceipt, isManager, currencySymbol }) => {
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
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[150] p-6">
      <div className="bg-black rounded-[2.5rem] w-full max-w-6xl h-[92vh] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col border border-zinc-800">
        {/* Header */}
        <div className="p-8 bg-black text-white flex justify-between items-center shrink-0 border-b border-zinc-900">
          <div className="flex items-center gap-5">
             <div className="p-3.5 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </div>
             <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Financial Ledger</h2>
                <p className="opacity-50 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mt-1">Audit Log & Performance Registry</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 bg-black hover:bg-zinc-800 border-2 border-zinc-800 rounded-full transition-all text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-8 bg-black border-b border-zinc-900 space-y-8 shrink-0">
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex-1 min-w-[280px]">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-3">Transaction Search</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="SEARCH TXID OR CUSTOMER..." 
                  className="w-full pl-14 pr-4 py-5 bg-zinc-900 border-2 border-zinc-800 rounded-2xl font-black outline-none focus:border-white transition-all uppercase text-white shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">System Mode Filter</label>
              <div className="flex gap-2 bg-zinc-900 p-1.5 rounded-2xl border-2 border-zinc-800">
                 <button onClick={() => setModeFilter('ALL')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${modeFilter === 'ALL' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>All Modes</button>
                 <button onClick={() => setModeFilter(SystemMode.SUPERMARKET)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${modeFilter === SystemMode.SUPERMARKET ? 'bg-green-600 text-white' : 'text-zinc-500 hover:text-white'}`}>Retail</button>
                 <button onClick={() => setModeFilter(SystemMode.RESTAURANT)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${modeFilter === SystemMode.RESTAURANT ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-white'}`}>Restaurant</button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Period</label>
              <div className="flex items-center gap-3">
                 <input 
                   type="date" 
                   className="px-5 py-4 bg-zinc-900 border-2 border-zinc-800 rounded-2xl font-bold outline-none focus:border-white transition-all text-xs text-white color-scheme-dark"
                   value={startDate}
                   onChange={(e) => setStartDate(e.target.value)}
                   style={{ colorScheme: 'dark' }}
                 />
                 <span className="text-zinc-700 font-black text-xs">TO</span>
                 <input 
                   type="date" 
                   className="px-5 py-4 bg-zinc-900 border-2 border-zinc-800 rounded-2xl font-bold outline-none focus:border-white transition-all text-xs text-white color-scheme-dark"
                   value={endDate}
                   onChange={(e) => setEndDate(e.target.value)}
                   style={{ colorScheme: 'dark' }}
                 />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-zinc-900/50">
             <button onClick={() => setQuickDate('today')} className="px-6 py-4 bg-black border-2 border-zinc-800 text-white rounded-2xl text-[10px] font-black uppercase hover:border-white transition-all active:scale-95 shadow-lg">Today</button>
             <button onClick={() => setQuickDate('yesterday')} className="px-6 py-4 bg-black border-2 border-zinc-800 text-white rounded-2xl text-[10px] font-black uppercase hover:border-white transition-all active:scale-95 shadow-lg">Yesterday</button>
             <button onClick={() => setQuickDate('week')} className="px-6 py-4 bg-black border-2 border-zinc-800 text-white rounded-2xl text-[10px] font-black uppercase hover:border-white transition-all active:scale-95 shadow-lg">Last 7D</button>
             {(startDate || endDate || searchQuery || modeFilter !== 'ALL') && (
               <button 
                 onClick={() => { setStartDate(''); setEndDate(''); setSearchQuery(''); setModeFilter('ALL'); }}
                 className="px-6 py-4 bg-black border-2 border-red-900/40 text-red-500 rounded-2xl text-[10px] font-black uppercase hover:bg-red-900/20 transition-all active:scale-95 shadow-lg"
               >
                 Clear Filters
               </button>
             )}
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-black">
          {Object.keys(groupedHistory).length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-800 space-y-6">
              <svg className="w-32 h-32 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-2xl font-black uppercase tracking-[0.3em] opacity-30">Archive Empty</p>
            </div>
          ) : (
            <div className="space-y-12">
              {(Object.entries(groupedHistory) as [string, TransactionRecord[]][]).map(([date, txs]) => (
                <div key={date} className="space-y-6">
                   <div className="flex items-center gap-6">
                      <h3 className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.5em] whitespace-nowrap">{date}</h3>
                      <div className="h-px bg-zinc-900 flex-1"></div>
                      <div className="bg-zinc-900 px-4 py-1.5 rounded-full border border-zinc-800">
                        <span className="text-zinc-600 font-black text-[9px] uppercase tracking-widest">{txs.length} TRANSACTIONS</span>
                      </div>
                   </div>
                   
                   <div className="space-y-5">
                      {txs.map((tx: TransactionRecord) => (
                        <div key={tx.id} className="bg-zinc-950 p-7 rounded-[2.5rem] border-2 border-zinc-900 hover:border-white/20 hover:bg-zinc-900/50 transition-all grid grid-cols-12 items-center gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-2xl">
                          <div className="col-span-2">
                            <div className="font-mono font-black text-2xl text-white">#{tx.id}</div>
                            <div className="text-sm text-zinc-400 font-black uppercase mt-1 tracking-tighter">
                              {tx.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div className="col-span-4">
                            <div className="flex items-center gap-4">
                               <div className="w-14 h-14 rounded-2xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-xl font-black text-white uppercase shadow-lg">
                                  {tx.customerName ? tx.customerName.charAt(0) : tx.sellerName.charAt(0)}
                               </div>
                               <div className="min-w-0">
                                  <div className="font-black text-white text-xl truncate uppercase tracking-tight leading-none mb-1">
                                     {tx.customerName ? `CUSTOMER: ${tx.customerName}` : 'WALK-IN GUEST'}
                                  </div>
                                  <div className="text-zinc-500 font-black text-[10px] uppercase tracking-widest">
                                     Sold By: {tx.sellerName}
                                  </div>
                                  <div className={`text-[8px] font-black px-2 py-0.5 rounded-full inline-block mt-2 ${tx.mode === SystemMode.RESTAURANT ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' : 'bg-green-600/20 text-green-400 border border-green-600/30'}`}>
                                    {tx.mode}
                                  </div>
                               </div>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-sm font-black text-zinc-300 leading-relaxed">
                               {tx.items.length} Items Sold
                               <span className="text-zinc-500 uppercase italic truncate block text-[10px] font-bold">
                                  {tx.items.slice(0, 1).map(i => i.name).join(', ')}{tx.items.length > 1 ? '...' : ''}
                               </span>
                            </div>
                          </div>
                          <div className="col-span-2 text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              {tx.payments.map((p, idx) => (
                                <span key={idx} className="bg-black text-white text-[9px] font-black px-3 py-1.5 rounded-xl border border-zinc-800 uppercase tracking-tight">
                                  {p.method}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="col-span-2 text-right">
                            <div className="text-3xl font-black text-white tracking-tighter tabular-nums leading-none">
                               <span className="text-sm opacity-30 mr-1.5">{currencySymbol}</span>
                               {tx.total.toFixed(2)}
                            </div>
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <button 
                              onClick={() => onViewReceipt(tx)}
                              className="p-4 bg-zinc-900 text-white hover:bg-zinc-800 border-2 border-zinc-800 rounded-2xl transition-all active:scale-90 shadow-xl"
                              title="Inspect Receipt"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-10 bg-black border-t border-zinc-900 flex justify-between items-center shrink-0 shadow-[0_-20px_100px_rgba(0,0,0,0.8)] relative z-10">
          <div className="flex gap-16">
            <div>
              <span className="text-[11px] font-black text-zinc-600 uppercase block tracking-[0.4em] mb-2">
                Total Revenue ({modeFilter})
              </span>
              <div className="flex items-baseline gap-2">
                 <span className="text-2xl font-black text-white opacity-40 leading-none">{currencySymbol}</span>
                 <span className="text-6xl font-black text-white tabular-nums tracking-tighter leading-none">
                   {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </span>
              </div>
            </div>
            <div className="border-l border-zinc-900 pl-16">
              <span className="text-[11px] font-black text-zinc-600 uppercase block tracking-[0.4em] mb-2">Filtered Count</span>
              <span className="text-6xl font-black text-white tabular-nums tracking-tighter leading-none">{filteredHistory.length}</span>
            </div>
          </div>
          <div className="flex gap-5">
             <button className="px-10 py-6 bg-black border-2 border-zinc-800 text-white font-black rounded-3xl hover:border-white transition-all active:scale-95 uppercase tracking-widest text-xs shadow-2xl">
               Print Z-Report
             </button>
             <button 
               onClick={onClose}
               className="px-14 py-6 bg-white text-black font-black rounded-3xl hover:bg-zinc-200 transition-all shadow-2xl active:scale-95 uppercase tracking-widest text-xs"
             >
               Return to POS
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
