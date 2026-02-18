
import React, { useState } from 'react';
import { Product, Modifier } from '../types';

interface ModifierModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: (mods: Modifier[]) => void;
  currencySymbol: string;
}

const ModifierModal: React.FC<ModifierModalProps> = ({ product, onClose, onConfirm, currencySymbol }) => {
  const [selected, setSelected] = useState<Modifier[]>([]);

  const toggleModifier = (mod: Modifier) => {
    setSelected(prev => 
      prev.find(m => m.id === mod.id) 
        ? prev.filter(m => m.id !== mod.id) 
        : [...prev, mod]
    );
  };

  const modTotal = selected.reduce((acc, m) => acc + m.price, 0);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[150] p-6">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">{product.name}</h2>
            <p className="opacity-80">Select required options and extras</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 grid grid-cols-2 gap-4">
          {product.modifiers?.map(mod => {
            const isSelected = selected.find(m => m.id === mod.id);
            return (
              <button
                key={mod.id}
                onClick={() => toggleModifier(mod)}
                className={`p-6 rounded-2xl border-2 text-left transition-all active:scale-95 flex flex-col gap-1 ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' 
                    : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <span className="font-bold text-lg">{mod.name}</span>
                <span className={`text-sm ${isSelected ? 'text-indigo-500' : 'text-gray-400'}`}>
                  {mod.price > 0 ? `+${currencySymbol}${mod.price.toFixed(2)}` : 'FREE'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-8 bg-gray-50 border-t flex flex-col gap-6">
          <div className="flex justify-between items-center">
             <span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Total Adjustments</span>
             <span className="text-2xl font-black text-indigo-600">+{currencySymbol}{modTotal.toFixed(2)}</span>
          </div>
          <button 
            onClick={() => onConfirm(selected)}
            className="w-full bg-indigo-600 text-white py-6 rounded-2xl text-2xl font-black shadow-xl hover:bg-indigo-500 active:scale-95 transition-all"
          >
            CONFIRM & ADD TO ORDER
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModifierModal;
