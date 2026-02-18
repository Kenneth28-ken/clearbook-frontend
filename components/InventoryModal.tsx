
import React, { useState } from 'react';
import { Product } from '../types';

interface InventoryModalProps {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onEditProduct: (product: Product) => void;
  onUpdateProductField: (productId: string, field: keyof Product, value: any) => void;
  onAddNewProduct: () => void;
  onClose: () => void;
  currencySymbol: string;
  isTerminalLocked?: boolean;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ 
  products, 
  onUpdateStock, 
  onEditProduct, 
  onUpdateProductField,
  onAddNewProduct,
  onClose, 
  currencySymbol,
  isTerminalLocked = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassPrompt, setShowPassPrompt] = useState(false);
  const [error, setError] = useState('');

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '000') {
      setIsAuthorized(true);
      setShowPassPrompt(false);
      setError('');
    } else {
      setError('Unauthorized Access Code');
    }
  };

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
                    placeholder="•••"
                    className="w-full p-6 bg-gray-50 border-4 border-gray-100 rounded-[2rem] text-5xl font-black text-center outline-none focus:border-blue-600 text-gray-900 shadow-inner"
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
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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

                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm font-black text-gray-900 leading-none">{currencySymbol}</span>
                        {!canEdit ? (
                          <span className="text-base font-black text-blue-600 leading-none">{product.price.toFixed(2)}</span>
                        ) : (
                          <input 
                            type="number"
                            step="0.01"
                            value={product.price}
                            onChange={(e) => onUpdateProductField(product.id, 'price', parseFloat(e.target.value) || 0)}
                            className="w-24 text-base font-black text-blue-600 bg-transparent border-b-2 border-transparent focus:border-blue-500 outline-none transition-all hover:bg-gray-100 rounded px-1"
                          />
                        )}
                        <span className="text-[9px] font-bold text-gray-400 uppercase">/ {product.type === 'WEIGHT' ? 'kg' : 'unit'}</span>
                      </div>
                    </div>
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
