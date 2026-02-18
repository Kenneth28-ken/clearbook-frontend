
import React from 'react';
import { CartItem, Attendant, SystemMode } from '../types';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  currencySymbol: string;
  currentServer: Attendant | null;
  onOpenServerSelect: () => void;
  onRemoveServer: () => void;
  onParkToHub?: (label?: string) => void;
  systemMode: SystemMode;
  tableLabel?: string;
  onUpdateTableLabel?: (val: string) => void;
}

const Cart: React.FC<CartProps> = ({ 
  items, 
  onUpdateQuantity, 
  onRemove, 
  currencySymbol,
  currentServer,
  onOpenServerSelect,
  onRemoveServer,
  onParkToHub,
  systemMode,
  tableLabel = '',
  onUpdateTableLabel
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* Server Assignment Header - Restaurant Only */}
      {systemMode === SystemMode.RESTAURANT && (
        <div className="px-4 py-3 bg-gray-100 border-b flex flex-col gap-3 shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentServer ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-500'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
              </div>
              <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase leading-none mb-0.5">Assigned Attendant</div>
                  <div className="text-sm font-bold text-gray-800 leading-none">
                    {currentServer ? currentServer.name : 'NO SERVER SELECTED'}
                  </div>
              </div>
            </div>
            {currentServer ? (
              <button 
                onClick={onRemoveServer}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <button 
                onClick={onOpenServerSelect}
                className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg hover:bg-indigo-700 transition-colors uppercase tracking-tight shadow-md"
              >
                Assign Server
              </button>
            )}
          </div>

          {/* Table / Reference Field */}
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Table # / Label..."
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
              value={tableLabel}
              onChange={(e) => onUpdateTableLabel?.(e.target.value)}
            />
            {items.length > 0 && onParkToHub && (
              <button 
                onClick={() => onParkToHub(tableLabel)}
                className="px-4 py-2 bg-orange-400 text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-orange-100 border border-orange-300"
              >
                Park To Hub
              </button>
            )}
          </div>
        </div>
      )}

      <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center shrink-0">
        <h2 className="font-bold text-gray-600 uppercase text-xs tracking-wider">Current Order</h2>
        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
          {items.length} ITEMS
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="font-medium">No items in cart</p>
            <p className="text-xs uppercase tracking-widest opacity-60">Scan barcode or select items</p>
          </div>
        ) : (
          <div className="divide-y">
            {items.map(item => (
              <div key={item.cartId} className="p-4 hover:bg-gray-50 group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {currencySymbol}{item.price.toFixed(2)} / {item.type.toLowerCase()}
                      {item.selectedModifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.selectedModifiers.map(m => (
                            <span key={m.id} className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded italic">+{m.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemove(item.cartId)}
                    className="p-1.5 text-red-300 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1 border">
                    <button 
                      onClick={() => onUpdateQuantity(item.cartId, -1)}
                      className="w-10 h-10 flex items-center justify-center bg-white border rounded shadow-sm text-xl font-bold hover:bg-gray-50 active:scale-95 text-gray-900"
                    >
                      -
                    </button>
                    <div className="px-4 font-mono font-bold text-lg min-w-[3rem] text-center text-gray-900">
                      {item.type === 'WEIGHT' ? item.quantity.toFixed(3) : item.quantity}
                    </div>
                    <button 
                      onClick={() => onUpdateQuantity(item.cartId, 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white border rounded shadow-sm text-xl font-bold hover:bg-gray-50 active:scale-95 text-gray-900"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
