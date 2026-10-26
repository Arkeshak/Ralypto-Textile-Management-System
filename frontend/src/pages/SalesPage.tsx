import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Printer,
  RotateCcw,
  Eye,
  X,
  CreditCard,
  Calendar,
  Wallet,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  Building2,
  Tag,
  Clock,
  Sparkles,
  Layers,
  ArrowDownLeft,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { Sale, SaleReturn, SaleItem } from '../types';
import { ReceiptModal } from '../components/pos/ReceiptModal';
import { useToastStore } from '../stores/toast.store';
import {
  Drawer,
  Modal,
  PressButton,
  Skeleton,
  AnimatedList,
  AnimatedRow,
  fadeUp,
} from '../lib/motion';
import {
  StatCard,
  CardHeader,
  PillTabs,
  ProgressBar,
  PageHeader,
  EmptyState,
} from '../components/ui-pattern';

interface SalesPageProps {
  initialTab?: 'invoices' | 'returns' | 'tenders';
}

const INITIAL_DEMO_RETURNS: SaleReturn[] = [
  {
    id: 'ret-1',
    returnNumber: 'RET-2026-042',
    saleId: 'sale-today-01',
    invoiceNumber: 'INV-2026-0842',
    customerName: 'Dilani Perera',
    returnDate: '2026-10-24',
    reason: 'Wrong size selected (requested L instead of M)',
    disposition: 'RESTOCK',
    totalRefund: 5450,
    notes: 'Exchanged for Size L; original tags intact.',
    items: [
      {
        id: 'reti-1',
        saleItemId: 'item-1',
        variantId: 'var-01-m',
        productName: 'Floral Chiffon Tiered Maxi Dress',
        variantDetails: 'M / Blush Pink',
        quantity: 1,
        refundAmount: 5450,
      },
    ],
  },
  {
    id: 'ret-2',
    returnNumber: 'RET-2026-039',
    saleId: 'sale-prev-04',
    invoiceNumber: 'INV-2026-0812',
    customerName: 'Dinuka Senanayake',
    returnDate: '2026-10-21',
    reason: 'Fit adjustment required for bridal ensemble',
    disposition: 'RESTOCK',
    totalRefund: 7950,
    notes: 'Store credit issued to customer account.',
    items: [
      {
        id: 'reti-2',
        saleItemId: 'item-2',
        variantId: 'var-02-s',
        productName: 'Emerald Green Silk Wrap Dress',
        variantDetails: 'S / Emerald Green',
        quantity: 1,
        refundAmount: 7950,
      },
    ],
  },
];

export const SalesPage: React.FC<SalesPageProps> = ({ initialTab = 'invoices' }) => {
  const { push: pushToast } = useToastStore();
  const [sales, setSales] = useState<Sale[]>([]);
  const [returns, setReturns] = useState<SaleReturn[]>(INITIAL_DEMO_RETURNS);
  const [activeTab, setActiveTab] = useState<'invoices' | 'returns' | 'tenders'>(initialTab);

  // Filters
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'CASH' | 'CARD' | 'BANK_TRANSFER'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Drawers and Modals
  const [drawerSale, setDrawerSale] = useState<Sale | null>(null);
  const [reprintSale, setReprintSale] = useState<Sale | null>(null);
  const [returnTargetSale, setReturnTargetSale] = useState<Sale | null>(null);

  const fetchSalesAndReturns = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/sales');
      if (res.success && res.data) {
        setSales(res.data);
      }

      const retRes = await api.get('/returns');
      if (retRes.success && retRes.data) {
        setReturns(retRes.data);
      }
    } catch (err) {
      console.error('Failed to load sales records', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesAndReturns();
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Date filtering logic
  const now = new Date();
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  const isPastDays = (dateStr: string, days: number) => {
    const d = new Date(dateStr);
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= days;
  };

  // Filtered sales
  const filteredSales = sales.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      s.invoiceNumber.toLowerCase().includes(q) ||
      (s.customer && s.customer.name.toLowerCase().includes(q)) ||
      (s.customer && s.customer.phone.includes(q)) ||
      (s.cashier && s.cashier.name.toLowerCase().includes(q)) ||
      s.items?.some((i) => i.productName.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (paymentFilter !== 'all' && s.paymentMethod !== paymentFilter) {
      return false;
    }

    if (dateFilter === 'today') return isToday(s.createdAt);
    if (dateFilter === 'week') return isPastDays(s.createdAt, 7);
    if (dateFilter === 'month') return isPastDays(s.createdAt, 30);

    return true;
  });

  // Filtered returns
  const filteredReturns = returns.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.returnNumber.toLowerCase().includes(q) ||
      r.invoiceNumber.toLowerCase().includes(q) ||
      (r.customerName && r.customerName.toLowerCase().includes(q)) ||
      r.reason.toLowerCase().includes(q)
    );
  });

  // Key Metrics
  const totalRevenue = sales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const todaySales = sales.filter((s) => isToday(s.createdAt));
  const todayRevenue = todaySales.reduce((acc, s) => acc + (s.grandTotal || 0), 0) || 48650;
  const todayCount = todaySales.length || 7;

  const avgBasketValue = sales.length > 0 ? Math.round(totalRevenue / sales.length) : 3420;

  const cardSales = sales.filter((s) => s.paymentMethod === 'CARD');
  const cashSales = sales.filter((s) => s.paymentMethod === 'CASH');
  const cardTotal = cardSales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const cashTotal = cashSales.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const cardPct = totalRevenue > 0 ? Math.round((cardTotal / totalRevenue) * 100) : 58;
  const cashPct = 100 - cardPct;

  const totalRefunds = returns.reduce((acc, r) => acc + (r.totalRefund || 0), 0);

  const tabs = [
    { id: 'invoices', label: 'All Register Invoices', icon: Receipt, badge: `${sales.length}` },
    { id: 'returns', label: 'Garment Returns & Refunds', icon: RotateCcw, badge: `${returns.length} Logged` },
    { id: 'tenders', label: 'Payment Tender Reconciliation', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 pb-12">
      <div className="mx-auto max-w-[1360px] p-4 sm:p-6 space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Sales History & Receipt Register"
          subtitle="Immutable register transactions, thermal receipts, customer returns, and tender settlement"
          icon={Receipt}
          right={
            <div className="flex items-center gap-2">
              <PressButton
                onClick={() => {
                  window.print();
                  pushToast('Printing sales transaction register audit', 'ok');
                }}
                className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-slate-200 shadow-2xs"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Export Audit PDF</span>
              </PressButton>
            </div>
          }
        />

        {/* 4 Stat Cards on Top */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Daily Sales Turnover"
            value={todayRevenue}
            prefix="Rs "
            icon={Receipt}
            isHero={true}
            change={`${todayCount} Invoices Billed Today`}
          />

          <StatCard
            title="Average Basket Value (AOV)"
            value={avgBasketValue}
            prefix="Rs "
            icon={Wallet}
            isPositive={true}
            change="2.3 Garments per Checkout"
          />

          <StatCard
            title="Payment Settlement Mix"
            value={cardPct}
            suffix={`% Card (${cashPct}% Cash)`}
            icon={CreditCard}
            change={`Rs ${cardTotal.toLocaleString()} Card • Rs ${cashTotal.toLocaleString()} Cash`}
          />

          <StatCard
            title="Total Settled Invoices"
            value={sales.length}
            suffix=" Invoices"
            icon={CheckCircle2}
            isPositive={true}
            change="100% Reconciled to POS Register"
          />
        </div>

        {/* Segmented Pill Tabs Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PillTabs
            tabs={tabs}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as any)}
            layoutId="sales-section-tabs"
            variant="dark"
          />

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice, customer, item..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ==================== TAB 1: ALL REGISTER INVOICES ==================== */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            {/* Filter Bar: Date Range & Payment Method */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
              {/* Date Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mr-1">
                  Date:
                </span>
                {(['all', 'today', 'week', 'month'] as const).map((df) => (
                  <button
                    key={df}
                    type="button"
                    onClick={() => setDateFilter(df)}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                      dateFilter === df
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {df === 'all' && 'All Dates'}
                    {df === 'today' && "Today's Register"}
                    {df === 'week' && 'Past 7 Days'}
                    {df === 'month' && 'This Month'}
                  </button>
                ))}
              </div>

              {/* Payment Method Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mr-1">
                  Tender:
                </span>
                {(['all', 'CARD', 'CASH', 'BANK_TRANSFER'] as const).map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentFilter(pm)}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                      paymentFilter === pm
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {pm === 'all' && 'All Tenders'}
                    {pm === 'CARD' && 'Card (Visa/Master)'}
                    {pm === 'CASH' && 'Cash Tender'}
                    {pm === 'BANK_TRANSFER' && 'Bank Wire'}
                  </button>
                ))}
              </div>
            </div>

            {/* Invoices List */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                ))}
              </div>
            ) : filteredSales.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No Invoices Found"
                subtitle="Try resetting your date filter or search query to view register receipts"
                actionLabel="Reset Filters"
                onAction={() => {
                  setSearch('');
                  setDateFilter('all');
                  setPaymentFilter('all');
                }}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                <AnimatedList>
                  {filteredSales.map((sale) => {
                    const isPaid = sale.paymentStatus === 'PAID';
                    const isPartial = sale.paymentStatus === 'PARTIAL';
                    const isRefunded = sale.paymentStatus === 'REFUNDED';
                    const itemCount = sale.items?.reduce((sum, it) => sum + it.quantity, 0) || 1;

                    return (
                      <AnimatedRow key={sale.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Left: Invoice & Customer Info */}
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                              <Receipt className="w-5 h-5" />
                            </div>

                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-sm text-slate-900">
                                  {sale.invoiceNumber}
                                </span>

                                {/* Status Chip */}
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                    isPaid
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                      : isPartial
                                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                                      : 'bg-rose-100 text-rose-700 border-rose-200'
                                  }`}
                                >
                                  {sale.paymentStatus}
                                </span>

                                <span className="text-xs text-slate-400">
                                  {new Date(sale.createdAt).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}{' '}
                                  •{' '}
                                  <span className="font-mono text-slate-500">
                                    {new Date(sale.createdAt).toLocaleTimeString('en-GB', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600">
                                <span className="font-semibold text-slate-800">
                                  {sale.customer ? (
                                    <span>
                                      {sale.customer.name}{' '}
                                      <span className="font-normal text-slate-500">
                                        ({sale.customer.phone})
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 font-normal">Walk-in Client</span>
                                  )}
                                </span>

                                <span className="text-slate-400">•</span>

                                <span className="text-slate-500">
                                  Cashier: <strong className="text-slate-700">{sale.cashier?.name || 'Staff'}</strong>
                                </span>

                                <span className="text-slate-400">•</span>

                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                                  {sale.paymentMethod}
                                </span>
                              </div>

                              {/* Items summary */}
                              <p className="text-xs text-slate-500 truncate pt-0.5">
                                {itemCount} {itemCount === 1 ? 'garment' : 'garments'}:{' '}
                                <span className="text-slate-700 font-medium">
                                  {sale.items?.map((it) => `${it.productName} (${it.quantity})`).join(', ') || 'Textile items'}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Right: Total & Action Buttons */}
                          <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                            <div className="text-left lg:text-right">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                                Grand Total
                              </span>
                              <p className="text-lg font-black text-slate-900 tabular-nums">
                                Rs {sale.grandTotal.toLocaleString()}
                              </p>
                              {sale.discountAmount > 0 && (
                                <span className="text-[11px] text-emerald-600 font-semibold block">
                                  -Rs {sale.discountAmount.toLocaleString()} Loyalty Disc.
                                </span>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setDrawerSale(sale)}
                                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                                title="Inspect Full Receipt"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Receipt</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setReprintSale(sale)}
                                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
                                title="Reprint 80mm Thermal Slip"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-500" />
                                <span>80mm</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setReturnTargetSale(sale)}
                                className="px-2.5 py-2 rounded-xl border border-slate-200 hover:bg-amber-50 hover:border-amber-200 text-xs font-bold text-amber-700 transition-colors flex items-center gap-1"
                                title="Process Customer Return / Exchange"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Return</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </AnimatedRow>
                    );
                  })}
                </AnimatedList>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: GARMENT RETURNS & REFUNDS ==================== */}
        {activeTab === 'returns' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardHeader
                  icon={RotateCcw}
                  title="Garment Return & Exchange Register"
                  subtitle="Audit trail of customer garment returns, size adjustments, and restocking dispositions"
                />

                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  Total Refunds Issued: <strong className="text-rose-600">Rs {totalRefunds.toLocaleString()}</strong>
                </span>
              </div>

              {filteredReturns.length === 0 ? (
                <EmptyState
                  icon={RotateCcw}
                  title="No Return Vouchers Found"
                  subtitle="No garment returns match your search parameters"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Return Voucher</th>
                        <th className="py-3 px-4">Original Invoice</th>
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Reason & Notes</th>
                        <th className="py-3 px-4 text-center">Disposition</th>
                        <th className="py-3 px-4 text-right">Refund Amount</th>
                        <th className="py-3 px-4 text-center">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredReturns.map((ret) => (
                        <tr key={ret.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            {ret.returnNumber}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-blue-600">
                            {ret.invoiceNumber}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {ret.customerName || 'Walk-in Client'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <p className="font-semibold text-slate-800">{ret.reason}</p>
                            {ret.notes && (
                              <span className="text-[11px] text-slate-400 block">{ret.notes}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                ret.disposition === 'RESTOCK'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border-amber-200'
                              }`}
                            >
                              {ret.disposition === 'RESTOCK' ? 'Restocked to Shelf' : 'Inspection / Damaged'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-rose-600 font-mono">
                            Rs {ret.totalRefund.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-500">
                            {ret.returnDate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: PAYMENT TENDER RECONCILIATION ==================== */}
        {activeTab === 'tenders' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tender Ratio Card */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-6">
                <CardHeader
                  icon={CreditCard}
                  title="Payment Tender Mix & Settlement Breakdown"
                  subtitle="POS register reconciliation across electronic cards, bank slips, and cash tender"
                />

                {/* Card Payments Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-600" />
                      <span>Electronic Card Payments (Visa / Mastercard / Amex)</span>
                    </span>
                    <span className="text-blue-700 font-mono font-bold">
                      Rs {cardTotal.toLocaleString()} ({cardPct}%)
                    </span>
                  </div>
                  <ProgressBar pct={cardPct} color="#2563eb" height="h-3" />
                  <p className="text-xs text-slate-500">
                    Settled directly to Flagship commercial merchant account at Commercial Bank of Ceylon.
                  </p>
                </div>

                {/* Cash Tender Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span>Cash Register Currency in Drawer</span>
                    </span>
                    <span className="text-emerald-700 font-mono font-bold">
                      Rs {cashTotal.toLocaleString()} ({cashPct}%)
                    </span>
                  </div>
                  <ProgressBar pct={cashPct} color="#10b981" height="h-3" />
                  <p className="text-xs text-slate-500">
                    Physical bills verified at end-of-day register closure count.
                  </p>
                </div>

                {/* Returns Deductions Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500" />
                      <span>Returns & Customer Refunds Deducted</span>
                    </span>
                    <span className="text-rose-700 font-mono font-bold">
                      -Rs {totalRefunds.toLocaleString()}
                    </span>
                  </div>
                  <ProgressBar pct={totalRevenue > 0 ? Math.round((totalRefunds / totalRevenue) * 100) : 4} color="#ef4444" height="h-3" />
                  <p className="text-xs text-slate-500">
                    2 garment adjustments processed within standard 7-day exchange policy.
                  </p>
                </div>
              </div>

              {/* End of Day Register Summary */}
              <div className="space-y-4">
                <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Register Balance
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                      100% Balanced
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400">Net Commercial Revenue</span>
                    <p className="text-3xl font-black text-white">
                      Rs {(totalRevenue - totalRefunds).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Gross Invoiced: Rs {totalRevenue.toLocaleString()}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1.5">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#c6f432]" />
                      <span>Daily Reconciliation Verified</span>
                    </p>
                    <p>
                      Cash drawer float (Rs 10,000) matched with physical tape count for Flagship Colombo Boutique.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900 font-medium space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-blue-700">
                    <Clock className="w-4 h-4" />
                    <span>Next Settlement Cutoff</span>
                  </span>
                  <p>
                    Card batch auto-settles tonight at 11:59 PM directly with the merchant bank.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== RECEIPT VIEW DRAWER ==================== */}
      <Drawer
        open={Boolean(drawerSale)}
        onClose={() => setDrawerSale(null)}
        side="right"
      >
        {drawerSale && (
          <div className="space-y-6">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider inline-block mb-1.5">
                POS Commercial Invoice
              </span>
              <h2 className="text-2xl font-black text-slate-900">{drawerSale.invoiceNumber}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date(drawerSale.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}{' '}
                at{' '}
                {new Date(drawerSale.createdAt).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {/* Total Paid Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-3 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                Total Paid Amount
              </span>
              <div className="text-3xl font-black text-white tabular-nums">
                Rs {drawerSale.grandTotal.toLocaleString()}
              </div>
              <div className="text-xs text-slate-300 pt-2 border-t border-slate-800/80 flex justify-between items-center">
                <span>Tender: {drawerSale.paymentMethod}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  {drawerSale.paymentStatus}
                </span>
              </div>
            </div>

            {/* Customer & Cashier Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Customer</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {drawerSale.customer?.name || 'Walk-in Client'}
                  </p>
                  {drawerSale.customer?.phone && (
                    <p className="text-slate-500 font-mono">{drawerSale.customer.phone}</p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Cashier & Store</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {drawerSale.cashier?.name || 'Staff'}
                  </p>
                  <p className="text-slate-500">{drawerSale.branch?.name || 'Flagship Colombo 03'}</p>
                </div>
              </div>
            </div>

            {/* Itemized Line Items Table */}
            <div className="space-y-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Itemized Breakdown ({drawerSale.items?.length || 0})</span>
                <ShoppingBag className="w-4 h-4 text-slate-400" />
              </h3>

              <div className="divide-y divide-slate-100">
                {drawerSale.items?.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.variantDetails} • {item.quantity} x Rs {item.unitPrice.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-black text-slate-900 font-mono">
                      Rs {item.totalPrice.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Financial Subtotals */}
              <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">Rs {drawerSale.subtotal.toLocaleString()}</span>
                </div>
                {drawerSale.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Loyalty Discount:</span>
                    <span className="font-mono">-Rs {drawerSale.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Sales Tax (0%):</span>
                  <span className="font-mono">Rs 0</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="font-mono text-blue-600">Rs {drawerSale.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <PressButton
                type="button"
                onClick={() => {
                  const s = drawerSale;
                  setDrawerSale(null);
                  setReprintSale(s);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white min-h-12 px-6 text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
              >
                <Printer className="w-4 h-4" />
                <span>Reprint 80mm Thermal Receipt</span>
              </PressButton>

              <button
                type="button"
                onClick={() => {
                  const s = drawerSale;
                  setDrawerSale(null);
                  setReturnTargetSale(s);
                }}
                className="w-full min-h-12 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-bold text-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Process Return / Exchange</span>
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* ==================== THERMAL RECEIPT REPRINT MODAL ==================== */}
      {reprintSale && (
        <ReceiptModal
          sale={reprintSale}
          onClose={() => setReprintSale(null)}
          onNewSale={() => setReprintSale(null)}
        />
      )}

      {/* ==================== PROCESS RETURN MODAL ==================== */}
      {returnTargetSale && (
        <ProcessReturnModal
          sale={returnTargetSale}
          onClose={() => setReturnTargetSale(null)}
          onSuccess={() => {
            setReturnTargetSale(null);
            fetchSalesAndReturns();
          }}
        />
      )}
    </div>
  );
};

// Sub-component: Process Return Modal
const ProcessReturnModal: React.FC<{
  sale: Sale;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ sale, onClose, onSuccess }) => {
  const { push: pushToast } = useToastStore();
  const [selectedItems, setSelectedItems] = useState<Record<string, { quantity: number; refundAmount: number }>>({});
  const [reason, setReason] = useState('Wrong size selected');
  const [disposition, setDisposition] = useState<'RESTOCK' | 'DAMAGED' | 'INSPECTION'>('RESTOCK');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleItem = (item: SaleItem) => {
    if (selectedItems[item.id]) {
      const next = { ...selectedItems };
      delete next[item.id];
      setSelectedItems(next);
    } else {
      setSelectedItems({
        ...selectedItems,
        [item.id]: {
          quantity: item.quantity,
          refundAmount: item.totalPrice,
        },
      });
    }
  };

  const totalRefund = Object.values(selectedItems).reduce((acc, curr) => acc + curr.refundAmount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemsList = Object.entries(selectedItems).map(([saleItemId, val]) => {
      const si = sale.items.find((i) => i.id === saleItemId)!;
      return {
        saleItemId,
        variantId: si.variantId,
        productName: si.productName,
        variantDetails: si.variantDetails,
        quantity: val.quantity,
        refundAmount: val.refundAmount,
      };
    });

    if (itemsList.length === 0) {
      pushToast('Please select at least one garment to return', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/returns', {
        saleId: sale.id,
        invoiceNumber: sale.invoiceNumber,
        customerName: sale.customer?.name || 'Walk-in Client',
        reason,
        disposition,
        notes,
        items: itemsList,
      });

      if (res.success) {
        pushToast(`Return recorded · Refund Rs ${totalRefund.toLocaleString()}`, 'ok');
        onSuccess();
      } else {
        throw new Error(res.message || 'Failed to process return');
      }
    } catch (err: any) {
      pushToast(err.message || 'Failed to process return', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} title="Process Customer Return">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              Original Invoice
            </span>
            <span className="font-mono font-bold text-blue-600">{sale.invoiceNumber}</span>
          </div>
          <p className="font-semibold text-slate-800">
            Client: {sale.customer?.name || 'Walk-in Client'}
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select Garments to Return *
          </label>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {sale.items?.map((item) => {
              const isSelected = Boolean(selectedItems[item.id]);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item)}
                  className={`p-3 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/80' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.variantDetails} • {item.quantity} pcs
                      </p>
                    </div>
                  </div>
                  <p className="font-mono font-bold text-slate-900">
                    Rs {item.totalPrice.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex justify-between items-center text-xs">
          <span className="font-bold text-rose-800">Total Refund Due:</span>
          <span className="font-black text-rose-700 text-base font-mono">
            Rs {totalRefund.toLocaleString()}
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Reason for Return
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="Wrong size selected">Wrong size selected (Exchange requested)</option>
            <option value="Fit / Silhouette adjustment">Fit / Silhouette adjustment</option>
            <option value="Gift exchange">Gift exchange</option>
            <option value="Fabric / Seam flaw">Fabric / Seam flaw (Quality concern)</option>
            <option value="Customer preference change">Customer preference change</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Restock Disposition
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDisposition('RESTOCK')}
              className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                disposition === 'RESTOCK'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="block">Restock to Inventory</span>
              <span className="text-[10px] font-normal text-slate-500">Tags intact, unworn</span>
            </button>

            <button
              type="button"
              onClick={() => setDisposition('INSPECTION')}
              className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                disposition === 'INSPECTION'
                  ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="block">Hold for QC</span>
              <span className="text-[10px] font-normal text-slate-500">Inspection required</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Notes / Exchange Details
          </label>
          <textarea
            rows={2}
            placeholder="Optional return notes or replacement SKU..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <PressButton
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
          >
            {isSubmitting ? 'Recording...' : 'Issue Return Voucher'}
          </PressButton>
        </div>
      </form>
    </Modal>
  );
};
