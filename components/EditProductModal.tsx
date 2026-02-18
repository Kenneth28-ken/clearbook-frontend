
import React, { useState } from 'react';
import { Product, ItemType } from '../types';
import { CATEGORIES } from '../constants';

interface EditProductModalProps {
  product: Product;
  onUpdate: (product: Product) => void;
  onClose: () => void;
  currencySymbol: string;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onUpdate, onClose, currencySymbol }) => {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());
  const [stock, setStock] = useState(product.stock.toString()); // NEW
  const [category, setCategory] = useState(product.category);
  const [type, setType] = useState<ItemType>(product.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    const updatedProduct: Product = {
      ...product,
      name,
      price: parseFloat(price),
      stock: parseInt(stock) || 0, // NEW
      category,
      type,
    };

    onUpdate(updatedProduct);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[250] p-6">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-yellow-500 text-gray-900 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
             </svg>
             <h2 className="text-xl font-black uppercase">Edit Product</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">Item Name</label>
              <input 
                autoFocus
                type="text" 
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">Price ({currencySymbol})</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">Stock Level</label>
                <input 
                  type="number" 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">Pricing Type</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none"
                  value={type}
                  onChange={(e) => setType(e.target.value as ItemType)}
                >
                  <option value={ItemType.UNIT}>Per Unit</option>
                  <option value={ItemType.WEIGHT}>Per KG</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">Category</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
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
              className="flex-2 py-4 bg-yellow-500 text-gray-900 font-black text-lg rounded-xl hover:bg-yellow-400 transition-all active:scale-95 shadow-lg shadow-yellow-200"
            >
              UPDATE CHANGES
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
