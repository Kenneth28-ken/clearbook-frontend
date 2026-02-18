
import React, { useState } from 'react';
import { Product } from '../types';

interface WeightModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: (weight: number) => void;
  currencySymbol: string;
}

const WeightModal: React.FC<WeightModalProps> = ({ product, onClose, onConfirm, currencySymbol }) => {
  const [weight, setWeight] = useState('0');

  const handleNumClick = (val: string) => {
    setWeight(prev => {
      if (prev === '0' && val !== '.') return val;
      if (val === '.' && prev.includes('.')) return prev;
      return prev + val;
    });
  };

  const calculatedTotal = parseFloat(weight) * product.price;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[150] p-6">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex">
        {/* Scale Display */}
        <div className="w-1/2 bg-gray-100 p-10 flex flex-col justify-between items-center text-center">
           <div>
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-gray-800">{product.name}</h2>
              <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1">Manual Weight Entry</p>
           </div>

           <div className="w-full">
              <div className="text-xs font-bold text-gray-400 mb-1">PRICE PER KG</div>
              <div className="text-3xl font-black text-gray-900 mb-6">{currencySymbol}{product.price.toFixed(2)}</div>
              
              <div className="h-px bg-gray-300 mb-6"></div>

              <div className="text-xs font-bold text-blue-500 mb-1">TOTAL LINE PRICE</div>
              <div className="text-5xl font-black text-blue-600">{currencySymbol}{calculatedTotal.toFixed(2)}</div>
           </div>

           <button onClick={onClose} className="text-gray-400 font-bold hover:text-red-500 underline uppercase text-sm">Cancel Entry</button>
        </div>

        {/* Numpad */}
        <div className="flex-1 p-10 flex flex-col gap-6">
           <div className="bg-gray-900 text-white p-6 rounded-2xl flex items-end justify-between shadow-inner">
              <span className="text-xl font-bold opacity-40 uppercase tracking-tighter">WEIGHT</span>
              <div>
                <span className="text-6xl font-black tabular-nums">{weight}</span>
                <span className="text-2xl font-bold opacity-60 ml-2">KG</span>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-4 flex-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '.'].map(n => (
                <button
                  key={n}
                  onClick={() => handleNumClick(n.toString())}
                  className="bg-white border-2 border-gray-100 rounded-2xl text-2xl font-bold hover:bg-gray-50 active:bg-blue-50 transition-all active:scale-95 shadow-sm"
                >
                  {n}
                </button>
              ))}
              <button onClick={() => setWeight('0')} className="bg-red-50 text-red-600 rounded-2xl text-xl font-black border-2 border-red-100 hover:bg-red-100">CLEAR</button>
           </div>

           <button 
             onClick={() => onConfirm(parseFloat(weight))}
             disabled={parseFloat(weight) <= 0}
             className={`w-full py-6 rounded-2xl text-2xl font-black shadow-xl transition-all ${
               parseFloat(weight) > 0 ? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
             }`}
           >
             ADD {weight} KG TO ORDER
           </button>
        </div>
      </div>
    </div>
  );
};

export default WeightModal;
