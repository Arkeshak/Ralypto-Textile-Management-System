import React, { useEffect } from 'react';
import { X, Printer, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sale } from '../../types';
import { useToastStore } from '../../stores/toast.store';
import { PressButton } from '../../lib/motion';

interface ReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
  onNewSale: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  onClose,
  onNewSale,
}) => {
  const { push: pushToast } = useToastStore();

  useEffect(() => {
    if (sale) {
      pushToast(
        `Payment successful! Receipt ${sale.invoiceNumber} recorded · Rs ${Number(sale.grandTotal).toLocaleString()}`,
        'ok'
      );
    }
  }, [sale]);

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const business = sale.business || {
    name: 'Ralypto Textile Boutique',
    address: '42 Galle Road, Bambalapitiya, Colombo 03',
    phone: '+94 11 258 9632',
    email: 'hello@ralypto.lk',
    currency: 'Rs',
    receiptFooter: 'Thank you for shopping at Ralypto! Exchanges accepted within 7 days with original tags and receipt.',
  };

  const branch = sale.branch || {
    name: 'Flagship Store - Colombo 03',
    code: 'COL-03',
    phone: '+94 11 258 9632',
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4 overflow-y-auto">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Sale Completed Receipt"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="w-full max-w-md max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Modal Top Actions (no-print) */}
        <div className="no-print p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Check icon draws with pathLength 0 -> 1 */}
            <motion.svg
              className="w-7 h-7 text-emerald-600"
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.circle
                cx="26"
                cy="26"
                r="23"
                stroke="currentColor"
                strokeWidth="3.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
              <motion.path
                d="M15 27 L23 35 L37 17"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.35, delay: 0.2, ease: 'easeOut' }}
              />
            </motion.svg>
            <div>
              <span className="text-base font-bold text-slate-900 block leading-tight">Sale Completed</span>
              <span className="text-xs text-slate-500">Receipt #{sale.invoiceNumber}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print 80mm</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              aria-label="Close receipt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 80mm Thermal Receipt Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
          <div className="printable-receipt-area w-[320px] bg-white p-6 shadow-md rounded-2xl text-slate-900 font-mono text-xs leading-relaxed border border-slate-200">
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
              <div className="text-base font-bold tracking-wider uppercase font-sans">
                {business.name}
              </div>
              <div className="text-xs font-semibold text-slate-600 font-sans">
                {branch.name}
              </div>
              <div className="text-[11px] text-slate-400 font-sans">
                {business.address || 'Colombo, Sri Lanka'}
              </div>
              <div className="text-[11px] text-slate-400 font-sans">
                Tel: {branch.phone || business.phone}
              </div>
            </div>

            {/* Invoice Metadata */}
            <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span>INVOICE:</span>
                <span className="font-bold">{sale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>
                  {new Date(sale.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  {new Date(sale.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>CASHIER:</span>
                <span>{sale.cashier?.name || 'Staff User'}</span>
              </div>
              <div className="flex justify-between">
                <span>CUSTOMER:</span>
                <span>{sale.customer ? sale.customer.name : 'Walk-in Customer'}</span>
              </div>
            </div>

            {/* Itemized Lines */}
            <div className="py-3 border-b border-dashed border-slate-300">
              <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-slate-200 mb-1.5">
                <span>ITEM & SIZE</span>
                <span>QTY x PRICE</span>
                <span className="text-right">TOTAL</span>
              </div>
              <div className="space-y-1.5">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-semibold text-slate-800 truncate">
                      {item.productName}
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>{item.variantDetails}</span>
                      <span>
                        {item.quantity} x Rs {item.unitPrice.toLocaleString()}
                      </span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        Rs {(item.quantity * item.unitPrice - item.discountAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span className="tabular-nums">Rs {sale.subtotal.toLocaleString()}</span>
              </div>
              {sale.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>DISCOUNT:</span>
                  <span className="tabular-nums">-Rs {sale.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-200">
                <span>TOTAL:</span>
                <span className="tabular-nums">Rs {sale.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Tender */}
            <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-1">
              {sale.payments?.map((p, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>PAID VIA {p.paymentMethod}:</span>
                  <span className="font-bold tabular-nums">Rs {p.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Footer Notice */}
            <div className="pt-3 text-center text-[10px] text-slate-500 font-sans space-y-1">
              <p>{business.receiptFooter}</p>
              <p className="font-mono text-[9px] text-slate-400">Powered by Ralypto Textile OS</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="no-print p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <PressButton
            onClick={onNewSale}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-1.5 text-xs font-bold"
          >
            <span>Start New Sale</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </PressButton>
        </div>
      </motion.div>
    </div>
  );
};
