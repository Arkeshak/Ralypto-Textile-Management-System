import React, { useState } from 'react';
import {
  Banknote,
  CreditCard,
  Building,
  UserCheck,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';
import { useCartStore } from '../../stores/cart.store';
import { useAuthStore } from '../../stores/auth.store';
import { api } from '../../services/api';
import { Sale } from '../../types';
import { Modal, PressButton } from '../../lib/motion';

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
        throw new Error('A client must be selected for Credit sales.');
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
    <Modal open={true} onClose={onClose} title="Payment Tender">
      <div className="space-y-4">
        {/* Total due banner */}
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">Total Payable</span>
            <span className="text-2xl font-black text-blue-900 tabular-nums">
              Rs {grandTotal.toLocaleString()}
            </span>
          </div>
          {selectedCustomer && (
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-600 block">Customer</span>
              <span className="text-xs font-bold text-slate-900">{selectedCustomer.name}</span>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Payment Method Selector */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            Payment Method
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'CASH', label: 'Cash', icon: Banknote },
              { id: 'CARD', label: 'Card', icon: CreditCard },
              { id: 'BANK_TRANSFER', label: 'Transfer', icon: Building },
              { id: 'CREDIT', label: 'Credit', icon: UserCheck },
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
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px]">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash Tender Calculation */}
        {paymentMethod === 'CASH' && (
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Tendered Cash (Rs)</span>
              <span className="text-xs text-blue-600 font-bold tabular-nums">
                Exact: Rs {grandTotal.toLocaleString()}
              </span>
            </div>

            <input
              type="number"
              value={tenderedAmount || ''}
              onChange={(e) => setTenderedAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-base font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums"
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickTenders.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTenderedAmount(amt)}
                  className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs tabular-nums"
                >
                  Rs {amt.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Change Due Display */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">Change Due:</span>
              <span className="text-base font-black text-emerald-600 tabular-nums">
                Rs {changeDue.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Reference notes for Transfer/Card */}
        {(paymentMethod === 'CARD' || paymentMethod === 'BANK_TRANSFER') && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              {paymentMethod === 'CARD' ? 'Card Approval Code' : 'Bank Reference / Transfer ID'}
            </label>
            <input
              type="text"
              placeholder="e.g. TXN-89412"
              value={referenceNote}
              onChange={(e) => setReferenceNote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-12 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <PressButton
            type="button"
            disabled={isSubmitting}
            onClick={handleCompleteSale}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-1.5 text-xs font-bold"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirm & Print</span>
              </>
            )}
          </PressButton>
        </div>
      </div>
    </Modal>
  );
};
