import React from 'react';
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
      ? `LKR ${minPrice.toLocaleString()}`
      : `LKR ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;

  return (
    <div
      onClick={() => onSelect(product)}
      className="card-hover overflow-hidden cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Product Image */}
        <div className="relative aspect-3/4 w-full bg-surface-secondary overflow-hidden border-b border-separator">
          <ImageWithFallback
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Category Pill & Stock Tag */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
            <span className="badge bg-white/90 backdrop-blur-md text-label-primary shadow-xs truncate max-w-[58%] !text-3xs !px-2 tracking-normal">
              {product.category?.name || 'Garment'}
            </span>

            {isOutOfStock ? (
              <span className="badge badge-error shrink-0 !text-3xs !px-2 tracking-normal">
                Out of Stock
              </span>
            ) : totalStock <= 5 ? (
              <span className="badge badge-warning shrink-0 !text-3xs !px-2 tracking-normal">
                Low: {totalStock}
              </span>
            ) : null}
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5 space-y-1">
          <div className="text-3xs font-semibold text-label-tertiary uppercase tracking-wider">
            {product.brand?.name || 'Ralypto Label'}
          </div>
          <h3 className="text-sm font-semibold text-label-primary line-clamp-1 group-hover:text-action-500 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 text-2xs text-label-secondary pt-0.5">
            <Layers className="w-3.5 h-3.5 text-label-tertiary" />
            <span>{variantCount} variant{variantCount !== 1 ? 's' : ''} (Size/Colour)</span>
          </div>
        </div>
      </div>

      {/* Footer Price and Action */}
      <div className="p-3.5 pt-0 flex items-center justify-between border-t border-separator/60 mt-2">
        <div>
          <span className="text-3xs text-label-tertiary uppercase font-medium block">Price</span>
          <span className="text-xs sm:text-sm font-bold text-label-primary tabular-nums">{priceDisplay}</span>
        </div>

        <button
          type="button"
          className="w-8 h-8 rounded-lg bg-surface-secondary group-hover:bg-action-500 text-label-secondary group-hover:text-white flex items-center justify-center transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
