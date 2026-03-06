import React, { useState, useEffect } from 'react';
import { CartItem } from '../types';

const CustomerDisplayView: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [advertisement, setAdvertisement] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('₦');

  const updateStateFromStorage = () => {
    const storedCart = localStorage.getItem('cb_active_cart');
    const storedAd = localStorage.getItem('cb_advertisement_text');
    const storedCurrency = localStorage.getItem('cb_currency');

    if (storedCart) setCart(JSON.parse(storedCart));
    if (storedAd) setAdvertisement(storedAd);
    if (storedCurrency) setCurrencySymbol(storedCurrency);
  };

  useEffect(() => {
    updateStateFromStorage();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'cb_active_cart' || event.key === 'cb_advertisement_text' || event.key === 'cb_currency') {
        updateStateFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex font-sans">
      {/* Cart Section */}
      <div className="w-1/2 bg-black p-12 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center font-black text-white text-lg">CB</div>
          <h1 className="text-2xl font-black tracking-tighter">YOUR ORDER</h1>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-4 -mr-4 custom-scrollbar-dark">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-600">
              <p className="text-lg font-bold">Waiting for items...</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartId} className="flex items-center justify-between bg-gray-900 p-4 rounded-2xl animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-800 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg">
                    {item.quantity}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-white">{item.name}</p>
                    <p className="text-sm text-gray-400">{currencySymbol}{item.price.toFixed(2)} each</p>
                  </div>
                </div>
                <p className="font-black text-2xl text-blue-400">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))
          )}
        </div>

        <div className="mt-auto pt-10 border-t-2 border-gray-800">
            <div className="space-y-4 text-lg">
                <div className="flex justify-between font-medium text-gray-300">
                    <span>Subtotal</span>
                    <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-4xl text-white mt-4 border-t border-gray-700 pt-4">
                    <span>Total</span>
                    <span className="text-blue-400">{currencySymbol}{total.toFixed(2)}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Advertisement Section */}
      <div className="w-1/2 bg-gray-900 flex items-center justify-center p-20">
        <div className="text-center">
          <p className="text-6xl font-black leading-tight tracking-tighter text-white">
            {advertisement || 'Welcome!'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerDisplayView;
