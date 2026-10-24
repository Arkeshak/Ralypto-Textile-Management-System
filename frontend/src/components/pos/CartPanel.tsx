import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  User,
  PauseCircle,
  ShoppingBag,
  Percent,
} from 'lucide-react';
import { useCartStore } from '../../stores/cart.store';
import { Customer } from '../../types';

interface CartPanelProps {
  customers: Customer[];
  onOpenPayment: () => void;
  onOpenNewCustomer: () => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({
  customers,
  onOpenPayment,
  onOpenNewCustomer,
}) => {
  const {
    items,
    selectedCustomer,
    overallDiscount,
    heldCarts,
    updateQuantity,
    removeItem,
    clearCart,
    setCustomer,
    setOverallDiscount,
    holdCurrentCart,
    recallCart,
    getSubtotal,
    getTotalDiscounts,
    getGrandTotal,
    getTotalUnits,
  } = useCartStore();

  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showOverallDiscountInput, setShowOverallDiscountInput] = useState(false);

  const subtotal = getSubtotal();
  const discounts = getTotalDiscounts();
  const grandTotal = getGrandTotal();
  const totalUnits = getTotalUnits();

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  return (
    <div className="card h-full flex flex-col overflow-hidden">
      {/* 1. Customer Selector Topbar */}
      <div className="p-3.5 border-b border-separator bg-surface-secondary/60">
        <div className="relative">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 relative">
              <div
                onClick={() => setShowCustomerDropdown(true)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-separator rounded-xl text-xs font-semibold text-label-primary cursor-pointer hover:border-action-500 transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-5 h-5 rounded-full bg-action-50 text-action-600 flex items-center justify-center shrink-0">
                    <User className="w-3 h-3" />
                  </div>
                  <span className="truncate">
                    {selectedCustomer
                      ? `${selectedCustomer.name} (${selectedCustomer.phone})`
                      : 'Walk-in Customer'}
                  </span>
                </div>
                {selectedCustomer && (
                  <span className="badge badge-action">
                    {selectedCustomer.loyaltyPoints} pts
                  </span>
                )}
              </div>
            </div>

            {selectedCustomer ? (
              <button
                type="button"
                onClick={() => setCustomer(null)}
                className="btn-ghost btn-sm !px-2.5 text-label-secondary"
                title="Clear selected customer"
              >
                Clear
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenNewCustomer}
                className="btn-secondary btn-sm !px-2.5 whitespace-nowrap"
              >
                + Client
              </button>
            )}
          </div>

          {/* Customer Dropdown */}
          {showCustomerDropdown && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowCustomerDropdown(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-separator rounded-2xl shadow-xl z-40 p-2.5 space-y-1.5 animate-slide-up">
                <input
                  type="text"
                  placeholder="Search customer name or phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="input-field text-xs py-1.5"
                  autoFocus
                />
                <div className="max-h-48 overflow-y-auto divide-y divide-separator/40 py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomer(null);
                      setShowCustomerDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-label-primary hover:bg-surface-secondary rounded-lg flex items-center justify-between"
                  >
                    <span>Walk-in Customer (Default)</span>
                  </button>
                  {filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCustomer(c);
                        setShowCustomerDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-surface-secondary rounded-lg transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-label-primary">{c.name}</div>
                        <div className="text-2xs text-label-tertiary">{c.phone}</div>
                      </div>
                      <div className="text-right text-2xs">
                        <span className="text-success-600 font-semibold">{c.loyaltyPoints} pts</span>
                        {c.outstandingBalance > 0 && (
                          <div className="text-error-600 font-bold tabular-nums">
                            Due: LKR {c.outstandingBalance.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-label-tertiary">
            <div className="w-12 h-12 rounded-2xl bg-surface-secondary flex items-center justify-center mb-3">
              <ShoppingBag className="w-6 h-6 text-label-tertiary" />
            </div>
            <h4 className="text-sm font-semibold text-label-primary mb-1">Cart is Empty</h4>
            <p className="text-xs text-label-secondary max-w-[200px]">
              Scan a barcode or tap on any clothing garment to ring up a sale.
            </p>

            {/* Held carts banner */}
            {heldCarts.length > 0 && (
              <div className="mt-6 w-full p-3 bg-warning-50 border border-warning-100 rounded-xl text-left">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-warning-700 mb-2">
                  <PauseCircle className="w-4 h-4 text-warning-600" />
                  <span>Held Orders ({heldCarts.length})</span>
                </div>
                {heldCarts.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between text-xs py-1 border-t border-warning-200/60 first:border-0"
                  >
                    <span className="font-medium text-warning-800 truncate">
                      {h.customer?.name || 'Walk-in'} ({h.items.length} items)
                    </span>
                    <button
                      onClick={() => recallCart(h.id)}
                      className="px-2 py-0.5 rounded bg-warning-600 text-white font-bold text-2xs hover:bg-warning-700"
                    >
                      Recall
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.variantId}
              className="p-3 bg-surface-secondary/50 border border-separator/80 rounded-xl space-y-2 hover:border-separator transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-label-primary leading-snug">
                    {item.productName}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="badge badge-action !text-3xs">
                      {item.size}
                    </span>
                    <span className="badge badge-neutral !text-3xs flex items-center gap-1">
                      {item.colorHex && (
                        <span
                          className="w-1.5 h-1.5 rounded-full border border-separator"
                          style={{ backgroundColor: item.colorHex }}
                        />
                      )}
                      {item.color}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.variantId)}
                  className="text-label-tertiary hover:text-error-600 p-1 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Price, Quantity, Line Total */}
              <div className="flex items-center justify-between pt-1 border-t border-separator/40">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    className="w-6 h-6 rounded-lg bg-white border border-separator flex items-center justify-center text-label-secondary hover:text-label-primary active:scale-95 transition-all"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-label-primary tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    disabled={item.quantity >= item.stockOnHand}
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    className="w-6 h-6 rounded-lg bg-white border border-separator disabled:opacity-40 flex items-center justify-center text-label-secondary hover:text-label-primary active:scale-95 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <span className="text-2xs text-label-tertiary ml-1 tabular-nums">
                    @ LKR {item.unitPrice.toLocaleString()}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-label-primary tabular-nums">
                    LKR {(item.unitPrice * item.quantity - item.discountAmount).toLocaleString()}
                  </div>
                  {item.discountAmount > 0 && (
                    <div className="text-3xs text-success-600 font-semibold tabular-nums">
                      -LKR {item.discountAmount.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. Financial Summary & Checkout Action */}
      {items.length > 0 && (
        <div className="p-4 border-t border-separator bg-surface-secondary/40 space-y-3">
          {/* Quick hold & clear */}
          <div className="flex items-center justify-between text-2xs font-semibold text-label-secondary">
            <button
              onClick={holdCurrentCart}
              className="flex items-center gap-1 hover:text-warning-600 transition-colors"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>Hold Cart</span>
            </button>
            <button
              onClick={clearCart}
              className="flex items-center gap-1 hover:text-error-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          {/* Subtotal & Discounts */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-label-secondary">
              <span>Subtotal ({totalUnits} items)</span>
              <span className="font-semibold text-label-primary tabular-nums">LKR {subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-label-secondary items-center">
              <span className="flex items-center gap-1">
                <span>Discount</span>
                <button
                  type="button"
                  onClick={() => setShowOverallDiscountInput(!showOverallDiscountInput)}
                  className="text-action-500 hover:underline font-semibold text-2xs"
                >
                  {overallDiscount > 0 ? `LKR ${overallDiscount}` : '+ Add'}
                </button>
              </span>
              <span className="font-semibold text-success-600 tabular-nums">
                -LKR {discounts.toLocaleString()}
              </span>
            </div>

            {showOverallDiscountInput && (
              <div className="pt-1">
                <input
                  type="number"
                  placeholder="Discount in LKR"
                  value={overallDiscount || ''}
                  onChange={(e) => setOverallDiscount(parseFloat(e.target.value) || 0)}
                  className="input-field text-xs py-1"
                />
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-separator/80">
              <span className="text-xs font-bold text-label-primary">Total Payable</span>
              <span className="text-lg font-bold text-action-600 tabular-nums">LKR {grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            type="button"
            onClick={onOpenPayment}
            className="btn-primary w-full !py-3 text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Proceed to Payment</span>
            <span>&bull;</span>
            <span className="tabular-nums">LKR {grandTotal.toLocaleString()}</span>
          </button>
        </div>
      )}
    </div>
  );
};
