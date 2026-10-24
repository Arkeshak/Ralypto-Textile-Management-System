import React, { useState } from 'react';
import { X, Check, ShoppingBag, AlertCircle, Sparkles } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useCartStore } from '../../stores/cart.store';

interface VariantSelectModalProps {
  product: Product | null;
  onClose: () => void;
  onAdded: () => void;
  onTryOn?: (product: Product) => void;
}

export const VariantSelectModal: React.FC<VariantSelectModalProps> = ({
  product,
  onClose,
  onAdded,
  onTryOn,
}) => {
  const { addItem } = useCartStore();

  if (!product) return null;

  // Extract unique sizes and colors
  const sizes = Array.from(new Set(product.variants?.map((v) => v.size) || []));
  const colors = Array.from(new Set(product.variants?.map((v) => v.color) || []));

  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Find matching variant
  const activeVariant = product.variants?.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const stockOnHand = activeVariant?.stockOnHand ?? 0;
  const isOutOfStock = stockOnHand <= 0;

  const handleAddToCart = () => {
    if (!activeVariant) {
      setErrorMsg('Please select a valid size and color combination.');
      return;
    }

    if (isOutOfStock) {
      setErrorMsg('This size and colour variant is currently out of stock.');
      return;
    }

    const success = addItem({
      variantId: activeVariant.id,
      productId: product.id,
      productName: product.name,
      sku: activeVariant.sku,
      barcode: activeVariant.barcode,
      size: activeVariant.size,
      color: activeVariant.color,
      colorHex: activeVariant.colorHex,
      unitPrice: activeVariant.sellingPrice,
      unitCost: activeVariant.costPrice,
      stockOnHand,
      imageUrl: product.imageUrl,
    });

    if (!success) {
      setErrorMsg(`Cannot add more. Reached maximum available stock (${stockOnHand}).`);
      return;
    }

    onAdded();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-md">
        {/* Header */}
        <div className="modal-header">
          <div className="flex gap-3">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-12 h-12 rounded-xl object-cover border border-separator bg-surface-secondary shrink-0 shadow-2xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-surface-secondary border border-separator flex items-center justify-center text-label-tertiary text-xl shrink-0">
                👗
              </div>
            )}
            <div>
              <span className="badge badge-action !text-3xs mb-0.5">
                {product.category?.name || 'Garment'}
              </span>
              <h3 className="modal-title leading-tight line-clamp-1">
                {product.name}
              </h3>
              <div className="text-2xs text-label-secondary font-medium">
                {product.brand?.name || 'In-House Collection'}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Variant Selection Form */}
        <div className="modal-body space-y-4">
          {errorMsg && (
            <div className="p-3 bg-error-50 border border-error-100 rounded-xl flex items-center gap-2 text-error-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Size Selector */}
          <div>
            <label className="section-label mb-2 block">
              Select Size
            </label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => {
                const isSelected = selectedSize === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSelectedSize(s);
                      setErrorMsg(null);
                    }}
                    className={`min-w-10 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-action-500 text-white border-action-500 shadow-sm'
                        : 'bg-white text-label-secondary border-separator hover:text-label-primary hover:bg-neutral-50'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="section-label mb-2 block">
              Select Colour
            </label>
            <div className="grid grid-cols-2 gap-2">
              {colors.map((c) => {
                const isSelected = selectedColor === c;
                const variantForColor = product.variants?.find((v) => v.color === c);
                const hex = variantForColor?.colorHex || '#1E293B';

                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedColor(c);
                      setErrorMsg(null);
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'border-action-500 bg-action-50/50 text-label-primary font-semibold ring-2 ring-action-500/20'
                        : 'border-separator bg-white hover:bg-neutral-50 text-label-secondary hover:text-label-primary'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-separator shadow-2xs shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="truncate">{c}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-action-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details & Stock Box */}
          <div className="p-3.5 rounded-xl bg-surface-secondary border border-separator flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-2xs text-label-tertiary">
                SKU: <span className="font-mono text-label-primary font-semibold">{activeVariant?.sku || 'N/A'}</span>
              </div>
              <div className="text-2xs text-label-tertiary">
                Barcode: <span className="font-mono text-label-secondary">{activeVariant?.barcode || 'N/A'}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-label-primary tabular-nums">
                LKR {(activeVariant?.sellingPrice || product.basePrice).toLocaleString()}
              </div>
              <div className="mt-0.5">
                <span
                  className={`badge ${
                    isOutOfStock
                      ? 'badge-error'
                      : stockOnHand <= 3
                      ? 'badge-warning'
                      : 'badge-success'
                  }`}
                >
                  {isOutOfStock ? 'Out of stock' : `${stockOnHand} in stock`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {onTryOn && (
            <button
              type="button"
              onClick={() => {
                const prod = product;
                onClose();
                onTryOn(prod);
              }}
              className="btn-secondary text-action-600 bg-action-50 border-action-100"
            >
              <Sparkles className="w-3.5 h-3.5 text-action-500" />
              <span>Try-On</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isOutOfStock || !activeVariant}
            onClick={handleAddToCart}
            className="btn-primary flex-1"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
