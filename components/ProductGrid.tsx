
import React from 'react';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  category: string;
  search: string;
  onSelect: (p: Product) => void;
  currencySymbol: string;
  isEditMode?: boolean;
  onEditProduct?: (p: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  category, 
  search, 
  onSelect, 
  currencySymbol,
  isEditMode,
  onEditProduct
}) => {
  const filtered = products.filter(p => {
    const matchesCategory = category === 'All' || p.category === category;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filtered.map(product => {
        const isOutOfStock = product.stock <= 0;
        return (
        <div key={product.id} className="relative group h-40">
          <button
            onClick={() => !isOutOfStock && onSelect(product)}
            disabled={isOutOfStock}
            className={`${product.color || 'bg-white'} p-4 w-full h-full rounded-2xl shadow-sm border border-gray-200 flex flex-col items-start text-left transition-all ${isOutOfStock ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-md hover:border-blue-300 active:scale-95'} relative overflow-hidden`}
          >
            <span className="text-xs font-black text-gray-400 uppercase tracking-tighter mb-1">{product.category}</span>
            <h3 className="font-bold text-gray-800 leading-tight mb-auto line-clamp-2">{product.name}</h3>
            
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-lg font-black text-gray-900">{currencySymbol}{product.price.toFixed(2)}</span>
              <span className="text-[10px] font-bold text-gray-400">/ {product.type === 'WEIGHT' ? 'kg' : 'unit'}</span>
            </div>

            {product.modifiers && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              </div>
            )}
            
            {isOutOfStock && (
               <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center z-20 backdrop-blur-[1px]">
                  <div className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-sm transform -rotate-12 border border-white/20">
                     Out of Stock
                  </div>
               </div>
            )}

            <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"></div>
          </button>

          {/* Edit Overlay Trigger */}
          {isEditMode && onEditProduct && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEditProduct(product);
              }}
              className="absolute top-2 right-2 p-2 bg-yellow-500 text-gray-900 rounded-lg shadow-xl border border-yellow-300 z-10 hover:bg-yellow-400 active:scale-90 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
      );
      })}
    </div>
  );
};

export default ProductGrid;
