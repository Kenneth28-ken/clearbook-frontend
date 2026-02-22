
import React, { useState } from 'react';
import { Product, ItemType } from '../types';
import { CATEGORIES } from '../constants';

interface AddProductModalProps {
  onAdd: (product: Product) => void;
  onClose: () => void;
  currencySymbol: string;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onAdd, onClose, currencySymbol }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [type, setType] = useState<ItemType>(ItemType.UNIT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      price: parseFloat(price),
      costPrice: parseFloat(costPrice) || 0,
      category,
      type,
      stock: parseInt(stock) || 0,
      color: 'bg-white',
    };

    onAdd(newProduct);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200] p-6">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
        <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
          <h2 className="text-xl font-black uppercase tracking-tight">Add New Item</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Item Name</label>
              <input 
                autoFocus
                type="text" 
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="e.g. Fresh Tomatoes"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">Selling Price ({currencySymbol})</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest block mb-2">Cost Price ({currencySymbol})</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  placeholder="0.00"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Pricing Type</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-gray-900"
                  value={type}
                  onChange={(e) => setType(e.target.value as ItemType)}
                >
                  <option value={ItemType.UNIT}>Per Unit</option>
                  <option value={ItemType.WEIGHT}>Per KG</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Category</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-gray-900"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Initial Stock Level</label>
              <input 
                type="number" 
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
            >
              CANCEL
            </button>
            <button 
              type="submit"
              className="flex-2 py-4 bg-blue-600 text-white font-black text-lg rounded-xl hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-200"
            >
              SAVE PRODUCT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;