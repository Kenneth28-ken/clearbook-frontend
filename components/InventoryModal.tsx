
import React, { useState, useMemo } from 'react';
import { Product, TransactionRecord, Expense } from '../types';

interface InventoryModalProps {
  products: Product[];
  history: TransactionRecord[];
  expenses?: Expense[];
  onAddExpense?: (expense: Omit<Expense, 'id' | 'timestamp'>) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
  onEditProduct: (product: Product) => void;
  onUpdateProductField: (productId: string, field: keyof Product, value: any) => void;
  onAddNewProduct: () => void;
  onClose: () => void;
  currencySymbol: string;
  isTerminalLocked?: boolean;
  isMaster?: boolean;
  isManagerOverride?: boolean;
  onSetManagerOverride?: (val: boolean) => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ 
  products, 
  history,
  expenses = [],
  onAddExpense,
  onUpdateStock, 
  onEditProduct, 
  onUpdateProductField,
  onAddNewProduct,
  onClose, 
  currencySymbol,
  isTerminalLocked = false,
  isMaster = false,
  isManagerOverride = false,
  onSetManagerOverride
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(isMaster || isManagerOverride);
  const [password, setPassword] = useState('');
  const [showPassPrompt, setShowPassPrompt] = useState(false);
  const [viewMode, setViewMode] = useState<'STOCK' | 'ANALYTICS'>('STOCK');
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(7);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

  const MASTER_KEY = "961996";

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim().toLowerCase() === MASTER_KEY.toLowerCase()) {
      setIsAuthorized(true);
      if (onSetManagerOverride) onSetManagerOverride(true);
      setShowPassPrompt(false);
      setError('');
    } else {
      setError('Unauthorized Access Code');
      setPassword('');
    }
  };

  const profitChartData = useMemo(() => {
    if (viewMode !== 'ANALYTICS') return [];
    
    const days = Array.from({ length: timeRange }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const data = days.map(date => {
      let dailyRevenue = 0;
      let dailyCogs = 0;
      let dailyExpenses = 0;

      history
        .filter(tx => tx.timestamp.toISOString().split('T')[0] === date)
        .forEach(tx => {
          dailyRevenue += tx.total;
          tx.items.forEach(item => {
            dailyCogs += (item.costPrice || 0) * item.quantity;
          });
        });
      
      expenses
        .filter(ex => ex.timestamp.toISOString().split('T')[0] === date)
        .forEach(ex => {
          dailyExpenses += ex.amount;
        });

      return { 
        date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        revenue: dailyRevenue,
        cogs: dailyCogs,
        expenses: dailyExpenses,
        profit: dailyRevenue - dailyCogs - dailyExpenses
      };
    });

    return data;
  }, [history, expenses, viewMode, timeRange]);

  const maxProfit = Math.max(...profitChartData.map(d => Math.max(d.profit, d.revenue, d.expenses)), 1);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseCategory || !onAddExpense) return;
    onAddExpense({
      amount: parseFloat(expenseAmount),
      category: expenseCategory,
      description: expenseDescription
    });
    setExpenseAmount('');
    setExpenseCategory('');
    setExpenseDescription('');
    setShowAddExpense(false);
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inventoryStats = useMemo(() => {
    let totalCost = 0;
    let totalValue = 0;
    products.forEach(p => {
      totalCost += (p.costPrice || 0) * p.stock;
      totalValue += p.price * p.stock;
    });
    return { totalCost, totalValue, totalProfit: totalValue - totalCost };
  }, [products]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[300] p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative">
        
        {/* Security Overlay */}
        {showPassPrompt && (
          <div className="absolute inset-0 bg-gray-900/95 z-[400] flex items-center justify-center p-6 backdrop-blur-md">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center animate-in zoom-in-95">
               <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
               </div>
               <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Manager Authentication</h2>
               <p className="text-gray-500 font-bold text-sm mb-8 uppercase tracking-widest">Code Required to Unlock</p>
               
               <form onSubmit={handleUnlock} className="space-y-6">
                  <input 
                    autoFocus
                    type="password"
                    placeholder="••••"
                    className="w-full p-6 bg-gray-50 border-4 border-gray-100 rounded-[2rem] text-2xl font-black text-center outline-none focus:border-blue-600 text-gray-900 shadow-inner tracking-widest"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {error && <p className="text-red-600 font-black text-xs uppercase animate-pulse">{error}</p>}
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setShowPassPrompt(false)} className="flex-1 py-5 bg-gray-100 text-gray-500 font-black rounded-2xl uppercase text-[10px] tracking-widest">CANCEL</button>
                    <button type="submit" className="flex-2 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl uppercase text-[10px] tracking-widest">UNLOCK EDITING</button>
                  </div>
               </form>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={`p-6 sm:p-8 text-white flex justify-between items-center shrink-0 ${isTerminalLocked ? 'bg-red-900' : 'bg-gray-900'}`}>
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-600 rounded-2xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
             </div>
             <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">Stock Registry</h2>
                <div className="flex items-center gap-2">
                   <span className="opacity-60 text-[10px] font-bold uppercase tracking-widest text-white">
                     {isAuthorized ? 'Authorized Editor' : 'Read-Only Mode'}
                   </span>
                </div>
             </div>
          </div>

          {/* Quick Stats Summary (Lean) - Master Overload Only */}
          {isMaster && (
            <div className="hidden lg:flex items-center gap-6 bg-white/5 px-6 py-3 rounded-[1.5rem] border border-white/10">
               <div className="text-center">
                  <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Cost</div>
                  <div className="text-sm font-black text-orange-400">{currencySymbol}{inventoryStats.totalCost.toLocaleString()}</div>
               </div>
               <div className="w-px h-8 bg-white/10"></div>
               <div className="text-center">
                  <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Value</div>
                  <div className="text-sm font-black text-blue-400">{currencySymbol}{inventoryStats.totalValue.toLocaleString()}</div>
               </div>
               <div className="w-px h-8 bg-white/10"></div>
               <div className="text-center">
                  <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Potential Profit</div>
                  <div className="text-sm font-black text-green-400">{currencySymbol}{inventoryStats.totalProfit.toLocaleString()}</div>
               </div>
            </div>
          )}
          
          <div className="flex items-center gap-4">
             {isAuthorized && (
               <div className="flex bg-white/10 p-1 rounded-2xl border border-white/10">
                  <button 
                    onClick={() => setViewMode('STOCK')}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'STOCK' ? 'bg-white text-gray-900 shadow-lg' : 'text-white/60 hover:text-white'}`}
                  >
                    Inventory
                  </button>
                  <button 
                    onClick={() => setViewMode('ANALYTICS')}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'ANALYTICS' ? 'bg-white text-gray-900 shadow-lg' : 'text-white/60 hover:text-white'}`}
                  >
                    Analytics
                  </button>
               </div>
             )}
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
          </div>
        </div>

        {viewMode === 'STOCK' ? (
          <>
            {/* Search */}
            <div className="p-4 sm:p-6 bg-white border-b flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <div className="relative flex-1 w-full">
                <input 
                  type="text" 
                  placeholder="Search registry..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-blue-500 transition-colors text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                 {!isAuthorized && !isTerminalLocked && (
                   <button 
                     onClick={() => setShowPassPrompt(true)}
                     className="px-6 py-4 bg-amber-500 text-amber-950 rounded-xl font-black flex items-center gap-3 hover:bg-amber-400 active:scale-95 transition-all shadow-lg uppercase text-xs tracking-tight whitespace-nowrap"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                     Manager Override
                   </button>
                 )}
                 
                 {isAuthorized && !isTerminalLocked && (
                   <button 
                     onClick={onAddNewProduct}
                     className="px-6 py-4 bg-blue-600 text-white rounded-xl font-black flex items-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-lg uppercase text-xs tracking-tight whitespace-nowrap"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                     Add Item
                   </button>
                 )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(product => {
                  const isLow = product.stock < 10;
                  const canEdit = isAuthorized && !isTerminalLocked;

                  return (
                    <div key={product.id} className={`bg-white p-5 rounded-[2.5rem] border-2 shadow-sm transition-all group ${isLow ? 'border-red-200 bg-red-50/10' : 'border-gray-100 hover:border-blue-200'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 pr-4">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">{product.category}</span>
                          
                          {!canEdit ? (
                            <div className="text-lg font-black text-gray-900 uppercase truncate leading-tight">{product.name}</div>
                          ) : (
                            <input 
                              type="text"
                              value={product.name}
                              onChange={(e) => onUpdateProductField(product.id, 'name', e.target.value)}
                              className="w-full text-lg font-black text-gray-900 leading-tight bg-transparent border-b-2 border-transparent focus:border-blue-500 outline-none transition-all hover:bg-gray-100 rounded px-1 -ml-1"
                            />
                          )}

                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                               <span className="text-[10px] font-black text-blue-600 leading-none">SELL: {currencySymbol}{product.price.toFixed(2)}</span>
                            </div>
                            {isAuthorized && (
                              <div className="flex items-center gap-1 border-l pl-2 border-gray-100">
                                 <span className="text-[10px] font-black text-orange-600 leading-none">COST: {currencySymbol}{(product.costPrice || 0).toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {canEdit && (
                          <button onClick={() => onEditProduct(product)} className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-50 hover:text-blue-600">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                        )}
                      </div>

                      <div className={`p-5 rounded-[1.5rem] border ${!canEdit ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex items-center justify-between mb-3">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Level</label>
                           {isLow && <span className="text-[8px] font-black text-red-600 uppercase animate-pulse">Low Stock</span>}
                        </div>
                        
                        <div className="flex items-center gap-3">
                           {canEdit && (
                             <button 
                               onClick={() => onUpdateStock(product.id, Math.max(0, product.stock - 1))}
                               className="w-11 h-11 bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center font-black text-xl hover:text-red-600 active:scale-90 transition-all text-gray-400 shadow-sm"
                             >
                               -
                             </button>
                           )}
                           <div className={`flex-1 min-w-0 bg-gray-50 border-2 rounded-xl py-2 px-2 text-center text-3xl font-black tabular-nums transition-all ${
                               isLow ? 'border-red-200 text-red-600 bg-red-50' : 'border-gray-100 text-gray-900'
                             }`}>
                             {product.stock}
                           </div>
                           {canEdit && (
                             <button 
                               onClick={() => onUpdateStock(product.id, product.stock + 1)}
                               className="w-11 h-11 bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center font-black text-xl hover:text-blue-600 active:scale-90 transition-all text-gray-400 shadow-sm"
                             >
                               +
                             </button>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 bg-gray-50 flex flex-col p-10 animate-in fade-in zoom-in-95 overflow-y-auto custom-scrollbar">
             <div className="mb-10 flex justify-between items-end">
                <div>
                   <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Income & Expenses</h3>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Track revenue, cost of goods, and custom expenses</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex bg-gray-200 p-1 rounded-xl">
                     {[7, 30, 90].map(days => (
                       <button
                         key={days}
                         onClick={() => setTimeRange(days as 7 | 30 | 90)}
                         className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === days ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                       >
                         {days} Days
                       </button>
                     ))}
                   </div>
                   <button 
                     onClick={() => setShowAddExpense(true)}
                     className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-lg uppercase text-xs tracking-tight"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                     Add Expense
                   </button>
                </div>
             </div>

             <div className="flex gap-6 mb-8">
                <div className="flex-1 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Revenue</div>
                   <div className="text-3xl font-black text-blue-600 tracking-tighter">
                      {currencySymbol}{profitChartData.reduce((acc, d) => acc + d.revenue, 0).toLocaleString()}
                   </div>
                </div>
                <div className="flex-1 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Expenses (COGS + Custom)</div>
                   <div className="text-3xl font-black text-orange-600 tracking-tighter">
                      {currencySymbol}{profitChartData.reduce((acc, d) => acc + d.cogs + d.expenses, 0).toLocaleString()}
                   </div>
                </div>
                <div className="flex-1 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Net Profit</div>
                   <div className="text-3xl font-black text-green-600 tracking-tighter">
                      {currencySymbol}{profitChartData.reduce((acc, d) => acc + d.profit, 0).toLocaleString()}
                   </div>
                </div>
             </div>

             <div className="flex-1 min-h-[300px] bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col">
               <div className="flex items-center gap-6 mb-6">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-[10px] font-black text-gray-500 uppercase">Revenue</span></div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span className="text-[10px] font-black text-gray-500 uppercase">Expenses</span></div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-[10px] font-black text-gray-500 uppercase">Profit</span></div>
               </div>
               
               <div className="flex-1 flex items-end justify-between gap-2 overflow-x-auto custom-scrollbar pb-4">
                  {profitChartData.map((d, idx) => {
                    const revHeight = (d.revenue / maxProfit) * 100;
                    const expHeight = ((d.cogs + d.expenses) / maxProfit) * 100;
                    const profHeight = (Math.max(0, d.profit) / maxProfit) * 100;
                    
                    return (
                      <div key={idx} className="flex flex-col items-center group min-w-[40px] flex-1">
                         <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-16 bg-gray-900 text-white p-2 rounded-xl font-black text-[10px] shadow-xl z-10 whitespace-nowrap pointer-events-none">
                            <div>Rev: {currencySymbol}{d.revenue.toFixed(0)}</div>
                            <div>Exp: {currencySymbol}{(d.cogs + d.expenses).toFixed(0)}</div>
                            <div className="text-green-400">Prof: {currencySymbol}{d.profit.toFixed(0)}</div>
                         </div>
                         <div className="flex items-end gap-1 w-full h-full justify-center">
                           <div className="w-1/3 bg-blue-500 rounded-t-sm transition-all hover:bg-blue-400 min-h-[4px]" style={{ height: `${Math.max(2, revHeight)}%` }}></div>
                           <div className="w-1/3 bg-orange-500 rounded-t-sm transition-all hover:bg-orange-400 min-h-[4px]" style={{ height: `${Math.max(2, expHeight)}%` }}></div>
                           <div className="w-1/3 bg-green-500 rounded-t-sm transition-all hover:bg-green-400 min-h-[4px]" style={{ height: `${Math.max(2, profHeight)}%` }}></div>
                         </div>
                         <div className="mt-4 text-center">
                            <div className="text-[8px] font-black text-gray-400 uppercase rotate-45 origin-left whitespace-nowrap">{d.date}</div>
                         </div>
                      </div>
                    );
                  })}
               </div>
             </div>
             
             {showAddExpense && (
               <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
                 <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                   <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-6">Record Expense</h3>
                   <form onSubmit={handleCreateExpense} className="space-y-4">
                     <div>
                       <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Amount ({currencySymbol})</label>
                       <input type="number" step="0.01" required value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black outline-none focus:border-blue-500 transition-colors" placeholder="0.00" />
                     </div>
                     <div>
                       <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Category</label>
                       <select required value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black outline-none focus:border-blue-500 transition-colors uppercase text-sm">
                         <option value="">Select Category</option>
                         <option value="Rent">Rent</option>
                         <option value="Utilities">Utilities</option>
                         <option value="Payroll">Payroll</option>
                         <option value="Marketing">Marketing</option>
                         <option value="Supplies">Supplies</option>
                         <option value="Maintenance">Maintenance</option>
                         <option value="Other">Other</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Description (Optional)</label>
                       <input type="text" value={expenseDescription} onChange={e => setExpenseDescription(e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-blue-500 transition-colors" placeholder="Brief description..." />
                     </div>
                     <div className="flex gap-4 mt-8">
                       <button type="button" onClick={() => setShowAddExpense(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-xl uppercase text-xs tracking-widest hover:bg-gray-200">Cancel</button>
                       <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl shadow-xl uppercase text-xs tracking-widest hover:bg-blue-700">Save Expense</button>
                     </div>
                   </form>
                 </div>
               </div>
             )}
          </div>
        )}

        <div className="p-6 sm:p-10 bg-white border-t flex flex-col sm:flex-row justify-between items-center shrink-0 gap-6">
           <p className="text-[11px] font-bold uppercase tracking-tight text-gray-400 max-w-lg leading-relaxed">
             Sync is live. Changes to inventory levels or pricing update instantly on all connected tablets.
           </p>
           <button 
             onClick={onClose}
             className="w-full sm:w-auto px-16 py-5 bg-gray-900 text-white font-black text-xl rounded-[2rem] hover:bg-black active:scale-95 transition-all shadow-2xl uppercase tracking-tighter"
           >
             RETURN TO POS
           </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;