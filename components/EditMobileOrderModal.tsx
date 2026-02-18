
import React, { useState } from 'react';
import { MobileOrder, Product, CartItem, ItemType } from '../types';
import { TAX_RATE } from '../constants';

interface EditMobileOrderModalProps {
  order: MobileOrder;
  products: Product[];
  onUpdate: (order: MobileOrder) => void;
  onClose: () => void;
  currencySymbol: string;
}

const EditMobileOrderModal: React.FC<EditMobileOrderModalProps> = ({ 
  order, 
  products, 
  onUpdate, 
  onClose, 
  currencySymbol 
}) => {
  const [localItems, setLocalItems] = useState<CartItem[]>([...order.items]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItemToOrder = (product: Product) => {
    // Basic add logic for mobile order edit
    const existing = localItems.find(i => i.productId === product.id && i.selectedModifiers.length === 0);
    if (existing && product.type === ItemType.UNIT) {
      setLocalItems(prev => prev.map(i => 
        i.cartId === existing.cartId ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      const newItem: CartItem = {
        cartId: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        type: product.type,
        selectedModifiers: [],
        taxRate: TAX_RATE
      };
      setLocalItems(prev => [...prev, newItem]);
    }
  };

  const removeItem = (cartId: string) => {
    setLocalItems(prev => prev.filter(i => i.cartId !== cartId));
  };

  const updateQty = (cartId: string, delta: number) => {
    setLocalItems(prev => prev.map(i => {
      if (i.cartId === cartId) {
        return { ...i, quantity: Math.max(0.1, i.quantity + delta) };
      }
      return i;
    }));
  };

  const handleSave = () => {
    onUpdate({ ...order, items: localItems });
  };

  const total = localItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[350] p-6">
      <div className="bg-white rounded-3xl w-full max-w-6xl h-[85vh] overflow-hidden shadow-2xl flex">
        {/* Left: Product Selection */}
        <div className="w-1/2 flex flex-col border-r bg-gray-50">
          <div className="p-6 bg-white border-b">
            <h2 className="text-lg font-black uppercase mb-4">Add Items to Order</h2>
            <div className="relative">
              <input 
                type="text"
                placeholder="Search catalog..."
                className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-3 custom-scrollbar">
            {filteredProducts.map(p => (
              <button 
                key={p.id}
                onClick={() => addItemToOrder(p)}
                className="p-4 bg-white border border-gray-200 rounded-2xl text-left hover:border-blue-500 hover:shadow-md transition-all active:scale-95 group"
              >
                <div className="text-[10px] font-black text-gray-400 uppercase mb-1">{p.category}</div>
                <div className="font-bold text-gray-800 mb-2 line-clamp-1">{p.name}</div>
                <div className="text-blue-600 font-black">{currencySymbol}{p.price.toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Current Mobile Items */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-6 border-b flex justify-between items-center">
             <div>
                <div className="text-xs font-black text-orange-600 uppercase tracking-widest">Editing Order</div>
                <h2 className="text-xl font-black text-gray-900">{order.customerName}</h2>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
             {localItems.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-gray-300">
                  <p className="font-bold">No items in this order</p>
               </div>
             ) : (
               localItems.map(item => (
                 <div key={item.cartId} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex-1">
                       <div className="font-bold text-gray-800">{item.name}</div>
                       <div className="text-xs text-gray-400 font-mono">{currencySymbol}{item.price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center bg-white border rounded-xl p-1">
                          <button onClick={() => updateQty(item.cartId, -1)} className="w-8 h-8 flex items-center justify-center font-black hover:bg-gray-50">-</button>
                          <span className="w-10 text-center font-bold">{item.quantity}</span>
                          <button onClick={() => updateQty(item.cartId, 1)} className="w-8 h-8 flex items-center justify-center font-black hover:bg-gray-50">+</button>
                       </div>
                       <div className="w-20 text-right font-black text-gray-900">
                          {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                       </div>
                       <button 
                         onClick={() => removeItem(item.cartId)}
                         className="text-red-300 hover:text-red-600 p-2"
                       >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                       </button>
                    </div>
                 </div>
               ))
             )}
          </div>

          <div className="p-8 bg-gray-50 border-t flex flex-col gap-6 shrink-0">
             <div className="flex justify-between items-center">
                <span className="text-gray-400 font-black uppercase tracking-widest text-sm">Updated Total</span>
                <span className="text-4xl font-black text-blue-600">{currencySymbol}{total.toFixed(2)}</span>
             </div>
             <div className="flex gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-white border-2 border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all"
                >
                  DISCARD CHANGES
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-2 py-4 bg-orange-600 text-white font-black text-xl rounded-2xl hover:bg-orange-500 shadow-xl shadow-orange-900/20 active:scale-95 transition-all"
                >
                  SAVE & UPDATE ORDER
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMobileOrderModal;
