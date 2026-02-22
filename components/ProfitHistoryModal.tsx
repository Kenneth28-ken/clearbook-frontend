
import React, { useState, useMemo } from 'react';
import { TransactionRecord, Product } from '../types';

interface ProfitHistoryModalProps {
  history: TransactionRecord[];
  products: Product[];
  onClose: () => void;
  currencySymbol: string;
}

const ProfitHistoryModal: React.FC<ProfitHistoryModalProps> = ({ history, products, onClose, currencySymbol }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showStaleList, setShowStaleList] = useState(false);

  const staleProducts = useMemo(() => {
    const lastSaleMap: Record<string, Date> = {};
    history.forEach(tx => {
      tx.items.forEach(item => {
        if (!lastSaleMap[item.productId] || tx.timestamp > lastSaleMap[item.productId]) {
          lastSaleMap[item.productId] = tx.timestamp;
        }
      });
    });

    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    return products.filter(p => {
      const lastSale = lastSaleMap[p.id];
      return !lastSale || lastSale < sixtyDaysAgo;
    });
  }, [history, products]);

  const profitData = useMemo(() => {
    const items: any[] = [];
    history.forEach(tx => {
      tx.items.forEach(item => {
        const costPrice = item.costPrice || 0;
        const sellingPrice = item.price;
        const qty = item.quantity;
        const totalCost = costPrice * qty;
        const totalRevenue = sellingPrice * qty;
        const totalProfit = totalRevenue - totalCost;

        items.push({
          id: `${tx.id}-${item.cartId}`,
          txId: tx.id,
          name: item.name,
          costPrice,
          sellingPrice,
          quantity: qty,
          totalCost,
          totalRevenue,
          totalProfit,
          timestamp: tx.timestamp
        });
      });
    });
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [history]);

  const filteredData = profitData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.txId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totals = useMemo(() => {
    return filteredData.reduce((acc, curr) => ({
      cost: acc.cost + curr.totalCost,
      revenue: acc.revenue + curr.totalRevenue,
      profit: acc.profit + curr.totalProfit
    }), { cost: 0, revenue: 0, profit: 0 });
  }, [filteredData]);

  return (
    <div className="fixed inset-0 bg-black z-[500] flex flex-col overflow-hidden animate-in fade-in duration-300">
      <div className="flex-1 flex flex-col bg-zinc-950">
        
        {/* Header */}
        <div className="p-8 bg-zinc-900 text-white flex justify-between items-center shrink-0 border-b border-zinc-800 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-green-600 rounded-2xl shadow-[0_0_30px_rgba(22,163,74,0.3)] text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Profit & Performance</h2>
              <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Financial Intelligence Dashboard
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-all text-white border-2 border-zinc-700 shadow-xl active:scale-90">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stale Inventory Alert */}
        {staleProducts.length > 0 && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 p-6 px-10 flex items-center justify-between animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-amber-500 rounded-2xl text-black shadow-lg shadow-amber-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <span className="text-amber-500 font-black text-sm uppercase tracking-[0.2em]">Stale Inventory Intelligence</span>
                <p className="text-zinc-400 text-xs font-bold uppercase mt-1 tracking-tight">
                  {staleProducts.length} items have zero sales in the last 60 days (2 months). These products are losing attention.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3 overflow-hidden">
                {staleProducts.slice(0, 5).map(p => (
                  <div key={p.id} className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-[10px] font-black text-white uppercase shadow-xl" title={p.name}>
                    {p.name.charAt(0)}
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowStaleList(true)}
                  className="px-6 py-4 bg-zinc-800 text-white font-black rounded-2xl hover:bg-zinc-700 transition-all active:scale-95 uppercase tracking-widest text-[10px] border border-zinc-700 shadow-xl"
                >
                  View Items
                </button>
                <button 
                  onClick={() => {
                    alert(`Strategic Recommendation: Apply a 15-25% discount to ${staleProducts[0].name} and ${staleProducts.length > 1 ? 'other stale items' : 'related products'} to stimulate demand.`);
                  }}
                  className="px-8 py-4 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-400 transition-all active:scale-95 uppercase tracking-widest text-[10px] shadow-xl shadow-amber-500/10"
                >
                  Create Clearance Offer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="p-6 bg-zinc-900/30 border-b border-zinc-800">
          <div className="relative max-w-3xl mx-auto">
            <input 
              type="text" 
              placeholder="Filter by item name or transaction ID..."
              className="w-full pl-14 pr-6 py-4 bg-zinc-950 border-2 border-zinc-800 rounded-2xl font-black outline-none focus:border-green-500 transition-all uppercase text-white shadow-inner text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black">
          <div className="w-full border-collapse">
            <div className="grid grid-cols-6 gap-6 px-8 py-4 border-b border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
              <div className="col-span-2">Item / Transaction ID</div>
              <div className="text-right">Unit Cost</div>
              <div className="text-right">Unit Sell</div>
              <div className="text-right">Total Cost</div>
              <div className="text-right">Net Profit</div>
            </div>
            
            <div className="divide-y divide-zinc-900">
              {filteredData.map(item => (
                <div key={item.id} className="grid grid-cols-6 gap-6 px-8 py-6 hover:bg-zinc-900/40 transition-all items-center group rounded-xl">
                  <div className="col-span-2">
                    <div className="font-black text-white text-xl uppercase truncate tracking-tight group-hover:text-green-400 transition-colors">{item.name}</div>
                    <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">TX: #{item.txId} • QTY: {item.quantity}</div>
                  </div>
                  <div className="text-right font-mono text-xs text-zinc-500">{currencySymbol}{item.costPrice.toFixed(2)}</div>
                  <div className="text-right font-mono text-xs text-white">{currencySymbol}{item.sellingPrice.toFixed(2)}</div>
                  <div className="text-right font-mono text-xs text-orange-500/60">{currencySymbol}{item.totalCost.toFixed(2)}</div>
                  <div className="text-right font-mono text-3xl font-black text-green-500 tabular-nums">
                    <span className="text-xs opacity-40 mr-1">{currencySymbol}</span>
                    {item.totalProfit.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="p-10 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center shrink-0 shadow-[0_-20px_100px_rgba(0,0,0,0.5)]">
          <div className="flex gap-16">
            <div>
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Total Cost</div>
              <div className="text-4xl font-black text-orange-500 tabular-nums tracking-tighter">
                <span className="text-lg opacity-50 mr-2">{currencySymbol}</span>
                {totals.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="w-px h-16 bg-zinc-800"></div>
            <div>
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Total Revenue</div>
              <div className="text-4xl font-black text-blue-500 tabular-nums tracking-tighter">
                <span className="text-lg opacity-50 mr-2">{currencySymbol}</span>
                {totals.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="w-px h-16 bg-zinc-800"></div>
            <div>
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Net Profit</div>
              <div className="text-6xl font-black text-green-500 tabular-nums tracking-tighter leading-none drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <span className="text-xl opacity-50 mr-2">{currencySymbol}</span>
                {totals.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="px-16 py-6 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all shadow-2xl active:scale-95 uppercase tracking-widest text-xs border-b-4 border-zinc-300"
          >
            Close Report
          </button>
        </div>
      </div>

      {/* Stale Items List Overlay */}
      {showStaleList && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[600] flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
          <div className="bg-zinc-950 border border-zinc-800 rounded-[3rem] w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/50">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Stale Inventory List</h3>
                <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mt-1">Items with zero sales in 60+ days</p>
              </div>
              <button onClick={() => setShowStaleList(false)} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-all text-white border border-zinc-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
              {staleProducts.map(p => (
                <div key={p.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between group hover:bg-zinc-900 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg font-black text-white uppercase">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-lg font-black text-white uppercase tracking-tight">{p.name}</div>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{p.category} • STOCK: {p.stock}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-zinc-400 uppercase mb-1">Price</div>
                    <div className="text-xl font-black text-white tabular-nums">{currencySymbol}{p.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 border-t border-zinc-900 bg-zinc-950/50 flex justify-center">
              <button 
                onClick={() => setShowStaleList(false)}
                className="px-12 py-5 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all shadow-xl uppercase tracking-widest text-xs active:scale-95"
              >
                Close List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitHistoryModal;
