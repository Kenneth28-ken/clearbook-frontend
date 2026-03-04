
import React, { useState } from 'react';
import { Product, ItemType, Modifier } from '../types';

interface AddProductModalProps {
  onAdd: (product: Product) => void;
  onClose: () => void;
  currencySymbol: string;
  categories: string[];
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onAdd, onClose, currencySymbol, categories }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState(categories.length > 1 ? categories[1] : categories[0]);
  const [type, setType] = useState<ItemType>(ItemType.UNIT);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [newModifierName, setNewModifierName] = useState('');
  const [newModifierPrice, setNewModifierPrice] = useState('');

  const handleAddModifier = () => {
    if (!newModifierName) return;
    const newMod: Modifier = {
      id: Math.random().toString(36).substr(2, 9),
      name: newModifierName,
      price: parseFloat(newModifierPrice) || 0,
    };
    setModifiers([...modifiers, newMod]);
    setNewModifierName('');
    setNewModifierPrice('');
  };

  const handleRemoveModifier = (id: string) => {
    setModifiers(modifiers.filter(m => m.id !== id));
  };

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
      barcode,
      color: 'bg-white',
      createdAt: Date.now(),
      modifiers: modifiers.length > 0 ? modifiers : undefined,
    };

    onAdd(newProduct);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[400] p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-200 my-8">
        <div className="p-6 bg-blue-600 text-white flex justify-between items-center sticky top-0 z-10">
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
                  {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Barcode (Optional)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Scan or enter barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
              </div>
            </div>

            {/* Variations / Modifiers Section */}
            <div className="pt-4 border-t border-gray-100">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Variations (Sizes, Colors, etc.)</label>
              
              {modifiers.length > 0 && (
                <div className="mb-4 space-y-2">
                  {modifiers.map(mod => (
                    <div key={mod.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <div>
                        <span className="font-bold text-gray-900">{mod.name}</span>
                        {mod.price > 0 && <span className="ml-2 text-sm text-blue-600 font-bold">(+{currencySymbol}{mod.price.toFixed(2)})</span>}
                      </div>
                      <button type="button" onClick={() => handleRemoveModifier(mod.id)} className="text-red-500 hover:text-red-700 p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. Size: XL"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={newModifierName}
                  onChange={(e) => setNewModifierName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddModifier(); } }}
                />
                <input 
                  type="number" 
                  step="0.01"
                  placeholder={`+${currencySymbol}0.00`}
                  className="w-24 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={newModifierPrice}
                  onChange={(e) => setNewModifierPrice(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddModifier(); } }}
                />
                <button 
                  type="button"
                  onClick={handleAddModifier}
                  disabled={!newModifierName}
                  className="px-4 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Add variations like sizes or colors. You can optionally add an extra cost for the variation.</p>
            </div>
          </div>

          <div className="pt-4 flex gap-4 sticky bottom-0 bg-white pb-2">
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