
import React, { useState, useMemo } from 'react';
import { Product, CartItem, ItemType, MobileOrder } from '../types';
import { TAX_RATE } from '../constants';

interface CustomerMenuViewProps {
  products: Product[];
  currencySymbol: string;
  onSendOrder: (order: MobileOrder) => void;
  isTerminalLocked?: boolean; // New
}

const CustomerMenuView: React.FC<CustomerMenuViewProps> = ({ products, currencySymbol, onSendOrder, isTerminalLocked = false }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isOrdered, setIsOrdered] = useState(false);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = products.filter(p => 
    selectedCategory === 'All' || p.category === selectedCategory
  );

  const addToCart = (product: Product) => {
    if (isTerminalLocked) return;
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.cartId === existing.cartId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        cartId: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        name: product.name,
        price: product.price,
        costPrice: product.costPrice || 0,
        quantity: 1,
        type: product.type,
        selectedModifiers: [],
        taxRate: TAX_RATE
      }];
    });
  };

  const updateQty = (cartId: string, delta: number) => {
    if (isTerminalLocked) return;
    setCart(prev => prev.map(i => {
      if (i.cartId === cartId) {
        return { ...i, quantity: Math.max(0, i.quantity + delta) };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const total = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  const handleSend = () => {
    if (!tableNumber || cart.length === 0 || isTerminalLocked) return;
    
    const order: MobileOrder = {
      id: Math.random().toString(36).substr(2, 5).toUpperCase(),
      items: cart,
      customerName: customerName || `Guest @ Table ${tableNumber}`,
      tableNumber: tableNumber,
      timestamp: new Date()
    };

    onSendOrder(order);
    setIsOrdered(true);
  };

  if (isTerminalLocked) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
         <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-8">
           <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
           </svg>
         </div>
         <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Service Paused</h1>
         <p className="text-gray-500 font-bold mb-10 max-w-xs uppercase text-xs tracking-widest leading-loose">
           This terminal is currently undergoing maintenance or subscription renewal. Please contact an attendant for assistance.
         </p>
      </div>
    );
  }

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center animate-in fade-in zoom-in-95 duration-500">
         <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 shadow-xl">
           <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
           </svg>
         </div>
         <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Order Received!</h1>
         <p className="text-gray-500 font-bold mb-10 max-w-xs">Your order has been sent to the kitchen. An attendant will be with you shortly.</p>
         <button 
           onClick={() => setIsOrdered(false)}
           className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-sm"
         >
           Order More
         </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white px-6 py-6 shadow-sm border-b sticky top-0 z-50">
         <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black">C</div>
               <span className="font-black text-xl tracking-tighter text-gray-900">Clear <span className="text-indigo-600">Book</span></span>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Table</span>
               <input 
                 type="text" 
                 placeholder="Table #" 
                 className="text-right font-black text-indigo-600 text-xl bg-transparent outline-none w-20"
                 value={tableNumber}
                 onChange={(e) => setTableNumber(e.target.value)}
               />
            </div>
         </div>
         
         <div className="flex overflow-x-auto gap-2 no-scrollbar py-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                  selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
         </div>
      </header>

      <main className="flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pb-40">
         {filteredProducts.map(p => (
           <div key={p.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex gap-4 animate-in slide-in-from-bottom-2">
              <div className="w-24 h-24 bg-gray-50 rounded-2xl shrink-0 flex items-center justify-center text-gray-300 font-black text-xs uppercase tracking-tighter overflow-hidden">
                 <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center">
                    IMG
                 </div>
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                 <div>
                    <h3 className="font-black text-gray-900 text-lg leading-tight uppercase line-clamp-1">{p.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{p.category}</p>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-indigo-600">{currencySymbol}{p.price.toFixed(2)}</span>
                    <button 
                      onClick={() => addToCart(p)}
                      className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 active:scale-90 transition-all"
                    >
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                       </svg>
                    </button>
                 </div>
              </div>
           </div>
         ))}
      </main>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent z-[60] animate-in slide-in-from-bottom-10">
           <div className="bg-gray-900 rounded-[2.5rem] p-6 shadow-2xl border-4 border-white/20">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Your Selections</div>
                    <div className="text-3xl font-black text-white">{currencySymbol}{total.toFixed(2)}</div>
                 </div>
                 <div className="text-right">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">{cart.length} Items Selected</div>
                    <div className="flex -space-x-2">
                       {cart.slice(0, 3).map(i => (
                         <div key={i.cartId} className="w-8 h-8 rounded-full border-2 border-gray-900 bg-indigo-600 text-white text-[10px] flex items-center justify-center font-black">
                            {i.name.charAt(0)}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="Your Name (Optional)"
                      className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-4 text-white font-bold placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                 </div>
                 <button 
                   onClick={handleSend}
                   disabled={!tableNumber}
                   className={`px-8 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 ${
                     tableNumber ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-900' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                   }`}
                 >
                   Send Order
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                   </svg>
                 </button>
              </div>
              {!tableNumber && (
                <p className="text-[10px] text-red-400 font-bold uppercase text-center mt-4 tracking-widest animate-pulse">Please enter Table Number to complete order</p>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMenuView;
