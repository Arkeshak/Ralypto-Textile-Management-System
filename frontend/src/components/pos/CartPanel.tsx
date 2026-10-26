import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  User,
  PauseCircle,
  ShoppingBag,
  Percent,
} from 'lucide-react';
import { animate } from 'framer-motion';
import { useCartStore } from '../../stores/cart.store';
import { Customer } from '../../types';
import { AnimatedList, AnimatedRow, PressButton } from '../../lib/motion';

interface CartPanelProps {
  customers: Customer[];
  onOpenPayment: () => void;
  onOpenNewCustomer: () => void;
}

function AnimatedTotal({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const controls = animate(display, value, {
      duration: 0.3,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return <span>Rs {display.toLocaleString()}</span>;
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
    <div className="card h-full flex flex-col overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm">
      {/* 1. Customer Selector Topbar */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/80">
        <div className="relative">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 relative">
              <div
                onClick={() => setShowCustomerDropdown(true)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer hover:border-blue-500 transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">
                    {selectedCustomer
                      ? `${selectedCustomer.name} (${selectedCustomer.phone})`
                      : 'Walk-in Customer'}
                  </span>
                </div>
                {selectedCustomer && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-2xs font-bold">
                    {selectedCustomer.loyaltyPoints} pts
                  </span>
                )}
              </div>
            </div>

            {selectedCustomer ? (
              <button
                type="button"
                onClick={() => setCustomer(null)}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
                title="Clear selected customer"
              >
                Clear
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenNewCustomer}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold whitespace-nowrap transition-colors"
              >
                + Client
              </button>
            )}
          </div>

          {/* Customer Dropdown */}
          {showCustomerDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowCustomerDropdown(false)}
              />
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 space-y-1">
                <input
                  type="text"
                  placeholder="Search client by name or phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomer(null);
                      setShowCustomerDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
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
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{c.name}</div>
                        <div className="text-[11px] text-slate-400">{c.phone}</div>
                      </div>
                      <div className="text-right text-[11px]">
                        <span className="text-emerald-600 font-bold">{c.loyaltyPoints} pts</span>
                        {c.outstandingBalance > 0 && (
                          <div className="text-red-600 font-bold tabular-nums">
                            Due: Rs {c.outstandingBalance.toLocaleString()}
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

      {/* 2. Cart Items List with AnimatedList + AnimatedRow */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <ShoppingBag className="w-7 h-7 text-slate-400" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1">Cart is Empty</h4>
            <p className="text-xs text-slate-500 max-w-[220px]">
              Scan barcode or tap garment cards to ring up sale items.
            </p>

            {/* Held carts banner */}
            {heldCarts.length > 0 && (
              <div className="mt-6 w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-2">
                  <PauseCircle className="w-4 h-4 text-amber-600" />
                  <span>Held Orders ({heldCarts.length})</span>
                </div>
                {heldCarts.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between text-xs py-1 border-t border-amber-200/60 first:border-0"
                  >
                    <span className="font-semibold text-amber-900 truncate">
                      {h.customer?.name || 'Walk-in'} ({h.items.length} items)
                    </span>
                    <button
                      onClick={() => recallCart(h.id)}
                      className="px-2.5 py-1 rounded bg-amber-600 text-white font-bold text-xs hover:bg-amber-700"
                    >
                      Recall
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <AnimatedList>
            {items.map((item) => (
              <AnimatedRow key={item.variantId} className="mb-2">
                <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2 hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {item.productName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
                          {item.size}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1">
                          {item.colorHex && (
                            <span
                              className="w-2 h-2 rounded-full inline-block border border-slate-300"
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
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-l-lg transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-r-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-extrabold text-slate-900 tabular-nums">
                        Rs {((item.unitPrice * item.quantity) - item.discountAmount).toLocaleString()}
                      </div>
                      {item.discountAmount > 0 && (
                        <div className="text-[10px] text-emerald-600 font-bold tabular-nums">
                          -Rs {item.discountAmount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </AnimatedRow>
            ))}
          </AnimatedList>
        )}
      </div>

      {/* 3. Financial Summary & Checkout Action */}
      {items.length > 0 && (
        <div className="p-4 border-t border-slate-200 bg-slate-50/60 space-y-3">
          {/* Quick hold & clear */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <button
              onClick={holdCurrentCart}
              className="flex items-center gap-1 hover:text-amber-600 transition-colors"
            >
              <PauseCircle className="w-4 h-4" />
              <span>Hold Cart</span>
            </button>
            <button
              onClick={clearCart}
              className="flex items-center gap-1 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>

          {/* Subtotal & Discounts */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Subtotal ({totalUnits} items)</span>
              <span className="font-bold text-slate-900 tabular-nums">Rs {subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-600 items-center">
              <span className="flex items-center gap-1">
                <span>Discount</span>
                <button
                  type="button"
                  onClick={() => setShowOverallDiscountInput(!showOverallDiscountInput)}
                  className="text-blue-600 hover:underline font-bold text-xs"
                >
                  {overallDiscount > 0 ? `Rs ${overallDiscount}` : '+ Add'}
                </button>
              </span>
              <span className="font-bold text-emerald-600 tabular-nums">
                -Rs {discounts.toLocaleString()}
              </span>
            </div>

            {showOverallDiscountInput && (
              <div className="pt-1">
                <input
                  type="number"
                  placeholder="Discount in Rs"
                  value={overallDiscount || ''}
                  onChange={(e) => setOverallDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-800">Total Payable</span>
              <span className="text-xl font-black text-blue-600 tabular-nums">
                <AnimatedTotal value={grandTotal} />
              </span>
            </div>
          </div>

          {/* Primary Checkout Button (Min 48px) */}
          <PressButton
            type="button"
            onClick={onOpenPayment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center justify-center gap-2"
          >
            <span>Proceed to Payment</span>
            <span>&bull;</span>
            <AnimatedTotal value={grandTotal} />
          </PressButton>
        </div>
      )}
    </div>
  );
};
export default CartPanel;
