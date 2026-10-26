import React, { useState } from 'react';
import { ShoppingBag, AlertCircle, Sparkles, Check } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../stores/cart.store';
import { Modal, PressButton } from '../../lib/motion';

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
      stockOnHand: activeVariant.stockOnHand ?? 10,
      imageUrl: product.imageUrl,
    });

    if (success) {
      onAdded();
      onClose();
    } else {
      setErrorMsg('Failed to add item to cart. Stock limit reached.');
    }
  };

  return (
    <Modal open={Boolean(product)} onClose={onClose} title={product.name}>
      <div className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Size Selector */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
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
                  className={`min-w-10 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
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
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
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
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs shrink-0"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="truncate">{c}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Details & Stock Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[11px] text-slate-500">
              SKU: <span className="font-mono text-slate-800 font-bold">{activeVariant?.sku || 'N/A'}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Barcode: <span className="font-mono text-slate-700">{activeVariant?.barcode || 'N/A'}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-extrabold text-slate-900 tabular-nums">
              Rs {(activeVariant?.sellingPrice || product.basePrice).toLocaleString()}
            </div>
            <div className="mt-0.5">
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isOutOfStock
                    ? 'bg-red-100 text-red-700'
                    : stockOnHand <= 3
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isOutOfStock ? 'Out of stock' : `${stockOnHand} in stock`}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-2 pt-2">
          {onTryOn && (
            <button
              type="button"
              onClick={() => {
                const prod = product;
                onClose();
                onTryOn(prod);
              }}
              className="px-3 py-2 rounded-xl text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Try-On</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-12 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <PressButton
            type="button"
            disabled={isOutOfStock || !activeVariant}
            onClick={handleAddToCart}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-md flex items-center justify-center gap-1.5 text-xs font-bold"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Cart</span>
          </PressButton>
        </div>
      </div>
    </Modal>
  );
};
