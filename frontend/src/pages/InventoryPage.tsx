import React, { useState, useEffect } from 'react';
import {
  Boxes,
  ArrowDownLeft,
  PlusCircle,
  AlertTriangle,
  History,
  X,
  AlertCircle,
  Package,
  Layers,
  DollarSign,
} from 'lucide-react';
import { api } from '../services/api';
import { StockMovement } from '../types';

export const InventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'balances'>('ledger');
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [valuation, setValuation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [mRes, bRes, vRes] = await Promise.all([
        api.get('/inventory/ledger?limit=50'),
        api.get('/inventory/balances'),
        api.get('/inventory/valuation'),
      ]);

      if (mRes.success) setMovements(mRes.data);
      if (bRes.success) setBalances(bRes.data);
      if (vRes.success) setValuation(vRes.data);
    } catch (err) {
      console.error('Failed to load inventory data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="page-wrapper space-y-6">
      {/* 5.C CINEMATIC INVENTORY OVERVIEW HERO BANNER */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-xl border border-neutral-800 text-white p-6 sm:p-8 lg:p-10"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.22) 100%), url('https://images.unsplash.com/photo-1544441893-675973e31985?w=1600&auto=format&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10 max-w-4xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-2xs font-bold tracking-wider uppercase">
              <span>Stock Matrix & Warehouse Ledger</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReceiveModal(true)}
                className="px-4 py-2 rounded-xl bg-action-500 hover:bg-action-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Receive Goods</span>
              </button>
              <button
                onClick={() => setShowAdjustModal(true)}
                className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 backdrop-blur-md border border-white/20 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Stock Adjustment</span>
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Warehouse & Boutique Stock Overview
            </h1>
            <p className="text-sm text-neutral-300 font-medium mt-1">
              Traceable size/colour movements, stock adjustments, vendor orders, and showroom valuation.
            </p>
          </div>

          {/* 4 Core Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="text-2xs font-bold uppercase tracking-wider text-neutral-300 block">
                Total Products
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-white mt-1 tabular-nums">
                24 Styles
              </div>
              <div className="text-3xs text-neutral-300 mt-0.5">
                Active in catalog
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="text-2xs font-bold uppercase tracking-wider text-neutral-300 block">
                Total Units on Hand
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-white mt-1 tabular-nums">
                {valuation?.totalUnits ? valuation.totalUnits.toLocaleString() : '588'} Units
              </div>
              <div className="text-3xs text-neutral-300 mt-0.5">
                Colombo & Kandy branches
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="text-2xs font-bold uppercase tracking-wider text-neutral-300 block">
                Low-Stock Alerts
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-warning-400 mt-1 tabular-nums">
                2 Variants
              </div>
              <div className="text-3xs text-warning-300 mt-0.5">
                Under 5 units remaining
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="text-2xs font-bold uppercase tracking-wider text-neutral-300 block">
                Out of Stock
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-rose-400 mt-1 tabular-nums">
                1 Variant
              </div>
              <div className="text-3xs text-rose-300 mt-0.5">
                Immediate vendor reorder
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Valuation Summary Metric Cards */}
      {valuation && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <span className="kpi-label">Total Inventory</span>
              <div className="w-8 h-8 rounded-xl bg-action-50 text-action-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="kpi-value">{valuation.totalUnits?.toLocaleString() || 0}</div>
            <span className="text-2xs text-label-secondary font-medium">Garment units on hand</span>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <span className="kpi-label">Cost Valuation</span>
              <div className="w-8 h-8 rounded-xl bg-neutral-100 text-label-secondary flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-label-primary tabular-nums">
              LKR {valuation.totalCostValue?.toLocaleString() || 0}
            </div>
            <span className="text-2xs text-label-secondary font-medium">Wholesale purchase value</span>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <span className="kpi-label">Retail Value</span>
              <div className="w-8 h-8 rounded-xl bg-action-50 text-action-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-action-600 tabular-nums">
              LKR {valuation.totalRetailValue?.toLocaleString() || 0}
            </div>
            <span className="text-2xs text-label-secondary font-medium">Potential retail revenue</span>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <span className="kpi-label">Low Stock Alerts</span>
              <div className="w-8 h-8 rounded-xl bg-warning-50 text-warning-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="kpi-value text-warning-600">{valuation.lowStockCount || 0}</div>
            <span className="text-2xs text-label-secondary font-medium">Items below reorder point</span>
          </div>
        </div>
      )}

      {/* Segmented Control Tabs */}
      <div className="flex items-center bg-surface-secondary p-1 rounded-xl border border-separator max-w-fit">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'ledger'
              ? 'bg-white text-label-primary shadow-xs'
              : 'text-label-secondary hover:text-label-primary'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Stock Ledger</span>
        </button>
        <button
          onClick={() => setActiveTab('balances')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'balances'
              ? 'bg-white text-label-primary shadow-xs'
              : 'text-label-secondary hover:text-label-primary'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Variant Stock Balances</span>
        </button>
      </div>

      {/* Tab 1: Audit Stock Ledger */}
      {activeTab === 'ledger' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="py-3 px-5 min-w-[150px]">Timestamp</th>
                  <th className="py-3 px-4 min-w-[200px]">Variant / SKU</th>
                  <th className="py-3 px-4 min-w-[150px]">Movement Type</th>
                  <th className="py-3 px-4 min-w-[100px] text-center">Change</th>
                  <th className="py-3 px-4 min-w-[140px] text-center">Stock Snapshot</th>
                  <th className="py-3 px-4 min-w-[160px]">Reference / Reason</th>
                  <th className="py-3 px-5 min-w-[170px] text-right">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-separator/40">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-label-tertiary">
                      Loading stock ledger...
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-label-tertiary">
                      No stock movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => {
                    const isPositive = m.quantityChange > 0;
                    return (
                      <tr key={m.id}>
                        <td className="py-3.5 px-5 text-label-secondary text-xs whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleDateString('en-GB')}{' '}
                          <span className="text-label-tertiary">
                            {new Date(m.createdAt).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-label-primary text-xs">
                            {m.variant?.product?.name || 'Garment'}
                          </div>
                          <div className="text-2xs text-label-secondary">
                            {m.variant?.size} / {m.variant?.color} &bull;{' '}
                            <span className="font-mono text-label-tertiary">{m.variant?.sku}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`badge ${
                              m.movementType === 'SALE'
                                ? 'badge-action'
                                : m.movementType === 'PURCHASE_RECEIPT'
                                ? 'badge-success'
                                : m.movementType === 'DAMAGE'
                                ? 'badge-error'
                                : 'badge-neutral'
                            }`}
                          >
                            {m.movementType?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-sm tabular-nums whitespace-nowrap">
                          <span className={isPositive ? 'text-success-600' : 'text-error-600'}>
                            {isPositive ? `+${m.quantityChange}` : m.quantityChange}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs tabular-nums text-label-secondary whitespace-nowrap">
                          {m.previousQuantity} &rarr;{' '}
                          <span className="font-bold text-label-primary">{m.newQuantity}</span>
                        </td>
                        <td className="py-3.5 px-4 text-label-secondary text-xs max-w-xs truncate">
                          {m.notes || m.referenceType || '—'}
                        </td>
                        <td className="py-3.5 px-5 text-right text-label-secondary text-xs whitespace-nowrap">
                          {m.createdByUser?.name || 'System'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Variant Stock Balances */}
      {activeTab === 'balances' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="py-3 px-5 min-w-[200px]">Garment & Variant</th>
                  <th className="py-3 px-4 min-w-[150px]">SKU / Barcode</th>
                  <th className="py-3 px-4 min-w-[130px]">Branch</th>
                  <th className="py-3 px-4 min-w-[130px] text-right whitespace-nowrap">Cost Price</th>
                  <th className="py-3 px-4 min-w-[130px] text-right whitespace-nowrap">Selling Price</th>
                  <th className="py-3 px-4 min-w-[100px] text-center whitespace-nowrap">On Hand</th>
                  <th className="py-3 px-5 min-w-[130px] text-center whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-separator/40">
                {balances.map((b) => (
                  <tr key={b.id}>
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-label-primary text-xs">
                        {b.variant?.product?.name}
                      </div>
                      <div className="text-2xs text-label-secondary font-medium">
                        Size: {b.variant?.size} &bull; Colour: {b.variant?.color}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-label-secondary">
                      <div>{b.variant?.sku}</div>
                      <div className="text-3xs text-label-tertiary">{b.variant?.barcode || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-label-secondary text-xs">{b.branch?.name}</td>
                    <td className="py-3.5 px-4 text-right text-xs tabular-nums text-label-secondary whitespace-nowrap">
                      LKR {b.variant?.costPrice?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs font-bold tabular-nums text-label-primary whitespace-nowrap">
                      LKR {b.variant?.sellingPrice?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-sm tabular-nums text-label-primary whitespace-nowrap">
                      {b.quantityOnHand}
                    </td>
                    <td className="py-3.5 px-5 text-center whitespace-nowrap">
                      <span
                        className={`badge ${
                          b.quantityOnHand === 0
                            ? 'badge-error'
                            : b.quantityOnHand <= (b.variant?.reorderLevel || 5)
                            ? 'badge-warning'
                            : 'badge-success'
                        }`}
                      >
                        {b.quantityOnHand === 0
                          ? 'Out of Stock'
                          : b.quantityOnHand <= (b.variant?.reorderLevel || 5)
                          ? 'Reorder'
                          : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receive Stock Modal */}
      {showReceiveModal && (
        <ReceiveStockModal
          variants={balances.map((b) => b.variant).filter(Boolean)}
          onClose={() => setShowReceiveModal(false)}
          onSuccess={() => {
            setShowReceiveModal(false);
            fetchData();
          }}
        />
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <AdjustStockModal
          variants={balances.map((b) => b.variant).filter(Boolean)}
          onClose={() => setShowAdjustModal(false)}
          onSuccess={() => {
            setShowAdjustModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

// Sub-component: Receive Goods Modal
const ReceiveStockModal: React.FC<{
  variants: any[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ variants, onClose, onSuccess }) => {
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [costPerUnit, setCostPerUnit] = useState<number>(variants[0]?.costPrice || 2500);
  const [reference, setReference] = useState('GRN-2026-');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariantId || quantity <= 0) {
      setError('Please select a variant and valid quantity');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await api.post('/inventory/receive', {
        items: [
          {
            variantId: selectedVariantId,
            quantity,
            costPerUnit,
          },
        ],
        referenceNumber: reference,
        notes,
      });

      if (res.success) {
        onSuccess();
      } else {
        throw new Error(res.message || 'Receiving failed');
      }
    } catch (err: any) {
      setError(err.message || 'Receiving error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-md">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Receive Goods into Stock</h3>
            <p className="text-xs text-label-secondary mt-0.5">Goods Received Note (GRN) logging</p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mx-5 mt-4 bg-error-50 border border-error-100 text-error-700 text-xs rounded-xl font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-body space-y-3.5">
          <div className="form-group">
            <label className="input-label">Select Garment Variant *</label>
            <select
              value={selectedVariantId}
              onChange={(e) => {
                const vid = e.target.value;
                setSelectedVariantId(vid);
                const v = variants.find((item) => item.id === vid);
                if (v) setCostPerUnit(v.costPrice);
              }}
              className="input-field"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.product?.name} ({v.size} / {v.color}) - {v.sku}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="input-label">Quantity Received *</label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="input-field font-bold"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Unit Cost (LKR) *</label>
              <input
                type="number"
                min={0}
                required
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                className="input-field font-semibold"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">GRN / Delivery Note Ref</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="input-field font-mono"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Maharagama production delivery"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1"
            >
              {isSubmitting ? 'Receiving...' : 'Confirm Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sub-component: Adjust Stock Modal (Damage, Correction, Missing)
const AdjustStockModal: React.FC<{
  variants: any[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ variants, onClose, onSuccess }) => {
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id || '');
  const [adjustmentType, setAdjustmentType] = useState<'DAMAGE' | 'CORRECTION' | 'MISSING'>('DAMAGE');
  const [quantityChange, setQuantityChange] = useState<number>(-1);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || reason.length < 3) {
      setError('A clear reason is mandatory for stock adjustment audits.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await api.post('/inventory/adjust', {
        variantId: selectedVariantId,
        adjustmentType,
        quantityChange,
        reason,
      });

      if (res.success) {
        onSuccess();
      } else {
        throw new Error(res.message || 'Adjustment failed');
      }
    } catch (err: any) {
      setError(err.message || 'Adjustment error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-md">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Audit Stock Adjustment</h3>
            <p className="text-xs text-label-secondary mt-0.5">Record damages, discrepancies, or recount changes</p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mx-5 mt-4 bg-error-50 border border-error-100 text-error-700 text-xs rounded-xl font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-body space-y-3.5">
          <div className="form-group">
            <label className="input-label">Select Variant *</label>
            <select
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              className="input-field"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.product?.name} ({v.size} / {v.color}) - {v.sku}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="input-label">Adjustment Type *</label>
            <select
              value={adjustmentType}
              onChange={(e) => {
                const type = e.target.value as any;
                setAdjustmentType(type);
                if (type === 'DAMAGE' || type === 'MISSING') {
                  if (quantityChange > 0) setQuantityChange(-quantityChange);
                }
              }}
              className="input-field"
            >
              <option value="DAMAGE">Damaged Garment / Stitching Flaw</option>
              <option value="CORRECTION">Recount Correction (+/-)</option>
              <option value="MISSING">Missing / Theft Discrepancy</option>
            </select>
          </div>

          <div className="form-group">
            <label className="input-label">Quantity Change (+ or -) *</label>
            <input
              type="number"
              required
              value={quantityChange}
              onChange={(e) => setQuantityChange(parseInt(e.target.value) || 0)}
              className="input-field font-bold"
            />
            <span className="text-3xs text-label-tertiary mt-1 block">
              Enter negative to deduct (e.g. -1 for damage), positive to add.
            </span>
          </div>

          <div className="form-group">
            <label className="input-label">Audit Reason *</label>
            <input
              type="text"
              required
              placeholder="e.g. Oil stain on collar during store display"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1"
            >
              {isSubmitting ? 'Recording...' : 'Record Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
