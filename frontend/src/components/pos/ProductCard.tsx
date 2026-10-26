import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus } from 'lucide-react';
import { Product } from '../../types';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const variantCount = product.variants?.length || 0;
  const totalStock = product.totalStockOnHand ?? 0;
  const isOutOfStock = totalStock <= 0;

  // Price range if variants differ
  const prices = product.variants?.map((v) => v.sellingPrice) || [];
  const minPrice = prices.length ? Math.min(...prices) : product.basePrice;
  const maxPrice = prices.length ? Math.max(...prices) : product.basePrice;
  const priceDisplay =
    minPrice === maxPrice
      ? `Rs ${minPrice.toLocaleString()}`
      : `Rs ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onClick={() => onSelect(product)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
    >
      <div>
        {/* Product Image */}
        <div className="relative aspect-3/4 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
          <ImageWithFallback
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Category Pill & Stock Tag */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
            <span className="rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-xs truncate max-w-[60%]">
              {product.category?.name || 'Garment'}
            </span>

            {isOutOfStock ? (
              <span className="rounded-full bg-red-100/90 text-red-700 px-2 py-0.5 text-[10px] font-bold tracking-wide">
                Out
              </span>
            ) : totalStock <= 5 ? (
              <span className="rounded-full bg-amber-100/90 text-amber-800 px-2 py-0.5 text-[10px] font-bold tracking-wide">
                Low: {totalStock}
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100/90 text-emerald-800 px-2 py-0.5 text-[10px] font-bold tracking-wide">
                In Stock
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3.5 space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {product.brand?.name || 'Ralypto Label'}
          </p>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 pt-0.5">
            <Layers size={14} className="text-slate-400 shrink-0" />
            <span>
              {variantCount} variant{variantCount !== 1 ? 's' : ''} (Size/Colour)
            </span>
          </div>
        </div>
      </div>

      {/* Footer Price and Action */}
      <div className="p-3.5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Price</span>
          <span className="text-sm sm:text-base font-black text-slate-900 tabular-nums">
            {priceDisplay}
          </span>
        </div>

        <button
          type="button"
          aria-label={`Select ${product.name}`}
          className="h-10 w-10 rounded-xl bg-slate-100 group-hover:bg-blue-600 text-slate-700 group-hover:text-white flex items-center justify-center transition-colors shadow-2xs"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  );
};
