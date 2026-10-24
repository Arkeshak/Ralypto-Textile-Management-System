import React from 'react';
import { X, Printer, CheckCircle, ArrowRight } from 'lucide-react';
import { Sale } from '../../types';

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
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const business = sale.business || {
    name: 'Luxe Threads Boutique',
    address: '42 Galle Road, Bambalapitiya, Colombo 03',
    phone: '+94 11 258 9632',
    email: 'hello@luxethreads.lk',
    currency: 'LKR',
    receiptFooter: 'Thank you for shopping at Luxe Threads! Exchanges accepted within 7 days with original tags and receipt.',
  };

  const branch = sale.branch || {
    name: 'Flagship Store - Colombo 03',
    code: 'COL-03',
    phone: '+94 11 258 9632',
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-md max-h-[92vh] flex flex-col">
        {/* Modal Top Actions (no-print) */}
        <div className="no-print modal-header">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success-600" />
            <span className="modal-title">Sale Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-primary btn-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print 80mm</span>
            </button>
            <button
              onClick={onClose}
              className="btn-icon"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 80mm Thermal Receipt Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-secondary flex justify-center">
          <div className="printable-receipt-area w-[320px] bg-white p-6 shadow-md rounded-xl text-label-primary font-mono text-xs leading-relaxed border border-separator">
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-separator space-y-1">
              <div className="text-base font-bold tracking-wider uppercase font-sans">
                {business.name}
              </div>
              <div className="text-[11px] font-medium text-label-secondary font-sans">
                {branch.name}
              </div>
              <div className="text-2xs text-label-tertiary font-sans">
                {business.address || 'Colombo, Sri Lanka'}
              </div>
              <div className="text-2xs text-label-tertiary font-sans">
                Tel: {branch.phone || business.phone}
              </div>
            </div>

            {/* Invoice Metadata */}
            <div className="py-2.5 border-b border-dashed border-separator text-2xs space-y-0.5">
              <div className="flex justify-between">
                <span>INVOICE:</span>
                <span className="font-bold">{sale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>
                  {new Date(sale.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}{' '}
                  {new Date(sale.createdAt).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>CASHIER:</span>
                <span>{sale.cashier?.name || 'Staff'}</span>
              </div>
              {sale.customer && (
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span className="truncate max-w-[150px]">{sale.customer.name}</span>
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <div className="py-3 border-b border-dashed border-separator space-y-2">
              <div className="flex justify-between font-bold text-2xs pb-1 border-b border-separator/60">
                <span>ITEM / VARIANT</span>
                <span>AMOUNT</span>
              </div>

              {sale.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5 text-2xs">
                  <div className="font-semibold text-label-primary">{item.productName}</div>
                  <div className="text-3xs text-label-secondary flex justify-between">
                    <span>
                      {item.variantDetails} ({item.quantity} x {item.unitPrice.toLocaleString()})
                    </span>
                    <span className="font-bold text-label-primary tabular-nums">
                      {(item.totalPrice).toLocaleString()}
                    </span>
                  </div>
                  {item.discountAmount > 0 && (
                    <div className="text-3xs text-success-600 font-semibold">
                      Discount: -{item.discountAmount.toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-2.5 border-b border-dashed border-separator space-y-1 text-2xs">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span className="tabular-nums">LKR {sale.subtotal.toLocaleString()}</span>
              </div>
              {sale.discountAmount > 0 && (
                <div className="flex justify-between text-success-600">
                  <span>TOTAL DISCOUNT:</span>
                  <span className="tabular-nums">-LKR {sale.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-separator">
                <span>GRAND TOTAL:</span>
                <span className="tabular-nums">LKR {sale.grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span>PAID ({sale.paymentMethod}):</span>
                <span className="tabular-nums">LKR {sale.paidAmount.toLocaleString()}</span>
              </div>
              {sale.balanceDue > 0 && (
                <div className="flex justify-between font-bold text-error-600">
                  <span>BALANCE DUE:</span>
                  <span className="tabular-nums">LKR {sale.balanceDue.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Barcode simulation & Footer message */}
            <div className="pt-4 text-center space-y-2">
              <div className="inline-block font-mono text-3xs tracking-[4px] px-3 py-1 bg-surface-secondary border border-separator rounded-md font-bold">
                * {sale.invoiceNumber} *
              </div>
              <div className="text-3xs text-label-secondary max-w-[260px] mx-auto italic font-sans">
                {business.receiptFooter || 'Exchange within 7 days with bill & tag.'}
              </div>
              <div className="text-3xs text-label-tertiary pt-1 font-sans">
                Ralypto Fashion Management System
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (no-print) */}
        <div className="no-print modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onNewSale}
            className="btn-primary flex-1"
          >
            <span>Next Sale</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
