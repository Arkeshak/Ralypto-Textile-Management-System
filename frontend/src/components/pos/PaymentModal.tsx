import React, { useState } from 'react';
import {
  X,
  Banknote,
  CreditCard,
  Building,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useCartStore } from '../../stores/cart.store';
import { useAuthStore } from '../../stores/auth.store';
import { api } from '../../services/api';
import { Sale } from '../../types';

interface PaymentModalProps {
  onClose: () => void;
  onSuccess: (sale: Sale) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, onSuccess }) => {
  const {
    items,
    selectedCustomer,
    overallDiscount,
    notes,
    clearCart,
    getGrandTotal,
  } = useCartStore();

  const { activeBranchId } = useAuthStore();
  const grandTotal = getGrandTotal();

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'BANK_TRANSFER' | 'CREDIT'>('CASH');
  const [tenderedAmount, setTenderedAmount] = useState<number>(grandTotal);
  const [referenceNote, setReferenceNote] = useState<string>('');
  const [saleNotes, setSaleNotes] = useState<string>(notes || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sri Lanka tender presets
  const quickTenders = [grandTotal, 1000, 2000, 5000, 10000].filter(
    (val, idx, self) => self.indexOf(val) === idx && val >= grandTotal
  );

  const changeDue = Math.max(0, tenderedAmount - grandTotal);

  const handleCompleteSale = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (paymentMethod === 'CREDIT' && !selectedCustomer) {
        throw new Error('A customer must be selected for Credit sales.');
      }

      const salePayload = {
        branchId: activeBranchId,
        customerId: selectedCustomer?.id || null,
        overallDiscountAmount: overallDiscount,
        notes: saleNotes,
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
          discountAmount: i.discountAmount,
        })),
        payments: [
          {
            paymentMethod,
            amount: grandTotal,
            referenceNote: referenceNote || undefined,
          },
        ],
      };

      const res = await api.post('/sales', salePayload);

      if (res.success && res.data) {
        clearCart();
        onSuccess(res.data);
      } else {
        throw new Error(res.message || 'Failed to complete sale transaction');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-lg">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Payment Checkout</h3>
            <div className="text-xs text-label-secondary mt-0.5">
              Total Payable:{' '}
              <span className="font-bold text-action-600 tabular-nums">
                LKR {grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="modal-body space-y-5">
          {errorMessage && (
            <div className="p-3 bg-error-50 border border-error-100 rounded-xl flex items-center gap-2 text-error-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="section-label mb-2 block">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'CASH', label: 'Cash', icon: Banknote },
                { id: 'CARD', label: 'Card', icon: CreditCard },
                { id: 'BANK_TRANSFER', label: 'Transfer', icon: Building },
                { id: 'CREDIT', label: 'Store Credit', icon: UserCheck },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.id as any);
                      setErrorMessage(null);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-action-500 text-white border-action-500 shadow-sm ring-2 ring-action-500/20'
                        : 'bg-white text-label-secondary border-separator hover:bg-neutral-50 hover:text-label-primary'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-3xs">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Tender Calculation */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-3 p-4 rounded-xl bg-surface-secondary border border-separator">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-label-primary">Tendered Cash Amount</span>
                <span className="text-2xs text-action-600 font-semibold tabular-nums">
                  Exact: LKR {grandTotal.toLocaleString()}
                </span>
              </div>

              <input
                type="number"
                value={tenderedAmount || ''}
                onChange={(e) => setTenderedAmount(parseFloat(e.target.value) || 0)}
                className="input-field text-base font-bold tabular-nums"
              />

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickTenders.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTenderedAmount(amt)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-separator text-2xs font-semibold text-label-secondary hover:text-label-primary hover:border-neutral-400 shadow-2xs tabular-nums"
                  >
                    LKR {amt.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Change Due Box */}
              <div className="p-3 bg-white rounded-xl border border-separator flex items-center justify-between">
                <span className="text-xs font-medium text-label-secondary">Change Due</span>
                <span className="text-base font-bold text-success-600 tabular-nums">
                  LKR {changeDue.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Card / Bank Reference Field */}
          {(paymentMethod === 'CARD' || paymentMethod === 'BANK_TRANSFER') && (
            <div className="form-group">
              <label className="input-label">
                {paymentMethod === 'CARD' ? 'Card Approval Code / Last 4 Digits' : 'Bank Reference Number'}
              </label>
              <input
                type="text"
                placeholder={paymentMethod === 'CARD' ? 'e.g. VISA-4819' : 'e.g. TXN-98213812'}
                value={referenceNote}
                onChange={(e) => setReferenceNote(e.target.value)}
                className="input-field font-mono"
              />
            </div>
          )}

          {/* Credit Sale Info */}
          {paymentMethod === 'CREDIT' && (
            <div className="p-4 rounded-xl bg-warning-50 border border-warning-100 text-xs text-warning-800 space-y-1.5">
              <div className="font-semibold flex items-center gap-1.5 text-warning-900">
                <UserCheck className="w-4 h-4 text-warning-700" />
                <span>Credit Sale to Registered Client</span>
              </div>
              {selectedCustomer ? (
                <div className="space-y-1 pt-1">
                  <div>Client: <span className="font-semibold">{selectedCustomer.name}</span></div>
                  <div>
                    Outstanding Balance:{' '}
                    <span className="font-semibold text-error-600 tabular-nums">
                      LKR {selectedCustomer.outstandingBalance.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    Credit Limit:{' '}
                    <span className="font-semibold tabular-nums">
                      LKR {selectedCustomer.creditLimit.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-error-600 font-medium">
                  Please select a customer on the cart panel before choosing Credit sale.
                </div>
              )}
            </div>
          )}

          {/* Order Notes */}
          <div className="form-group">
            <label className="input-label">
              Receipt Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Gift wrapped, VIP promo discount"
              value={saleNotes}
              onChange={(e) => setSaleNotes(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || (paymentMethod === 'CREDIT' && !selectedCustomer)}
            onClick={handleCompleteSale}
            className="btn-primary"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Sale...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Print Receipt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
