import React, { useState, useEffect } from 'react';
import {
  Truck,
  Building2,
  Search,
  Plus,
  Package,
  Clock,
  Printer,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
  Phone,
  Mail,
  MapPin,
  Wallet,
  ArrowDownLeft,
  X,
  CreditCard,
  FileText,
  Boxes,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { Supplier, PurchaseOrder, PurchaseOrderItem } from '../types';
import { useToastStore } from '../stores/toast.store';
import {
  Modal,
  Drawer,
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

const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-081',
    supplierId: 'sup-1',
    supplierName: 'Colombo Apparel Millers',
    orderDate: '2026-10-18',
    expectedDeliveryDate: '2026-10-27',
    status: 'SHIPPED',
    totalAmount: 45000,
    paidAmount: 0,
    paymentStatus: 'UNPAID',
    deliveryTracking: 'Southern Express Consignment #TRK-9801',
    notes: 'Floral chiffon yardage (450m) & combed cotton bolts (15 rolls)',
    items: [
      { id: 'poi-1', description: 'Floral Chiffon Yardage 44"', quantity: 450, unit: 'Meters', unitPrice: 70, totalPrice: 31500 },
      { id: 'poi-2', description: 'Combed Cotton Bolt (30 Yards)', quantity: 15, unit: 'Bolts', unitPrice: 900, totalPrice: 13500 },
    ],
  },
  {
    id: 'po-2',
    poNumber: 'PO-2026-082',
    supplierId: 'sup-3',
    supplierName: 'Ceylon Silk Mills',
    orderDate: '2026-10-20',
    expectedDeliveryDate: '2026-10-30',
    status: 'ORDERED',
    totalAmount: 68500,
    paidAmount: 20000,
    paymentStatus: 'PARTIAL',
    deliveryTracking: 'Direct Mill Dispatch — Katugastota Transport',
    notes: 'Mulberry raw silk & champagne gold bridal weave',
    items: [
      { id: 'poi-3', description: 'Pure Raw Silk Yardage (Natural Ivory)', quantity: 20, unit: 'Yards', unitPrice: 1750, totalPrice: 35000 },
      { id: 'poi-4', description: 'Champagne Gold Silk Bolt', quantity: 19, unit: 'Yards', unitPrice: 1763, totalPrice: 33500 },
    ],
  },
  {
    id: 'po-3',
    poNumber: 'PO-2026-083',
    supplierId: 'sup-4',
    supplierName: 'Tropical Textile Importers',
    orderDate: '2026-10-22',
    expectedDeliveryDate: '2026-11-03',
    status: 'ORDERED',
    totalAmount: 12000,
    paidAmount: 0,
    paymentStatus: 'UNPAID',
    deliveryTracking: 'Colombo Port Clearance Docket #CP-4402',
    notes: 'Pre-washed European natural linen rolls (40 rolls)',
    items: [
      { id: 'poi-5', description: 'Natural Oatmeal Pure Linen Roll', quantity: 40, unit: 'Rolls', unitPrice: 300, totalPrice: 12000 },
    ],
  },
  {
    id: 'po-4',
    poNumber: 'PO-2026-079',
    supplierId: 'sup-5',
    supplierName: 'Southern Linen Weavers',
    orderDate: '2026-10-08',
    expectedDeliveryDate: '2026-10-18',
    status: 'RECEIVED',
    totalAmount: 38000,
    paidAmount: 38000,
    paymentStatus: 'PAID',
    deliveryTracking: 'Delivered to Colombo Central Warehouse',
    notes: 'Handwoven linen bolts inspected and booked under GRN-2026-041',
    grnNumber: 'GRN-2026-041',
    items: [
      { id: 'poi-6', description: 'Oatmeal Linen Bolts (30 yds)', quantity: 20, unit: 'Bolts', unitPrice: 1900, totalPrice: 38000 },
    ],
  },
  {
    id: 'po-5',
    poNumber: 'PO-2026-078',
    supplierId: 'sup-2',
    supplierName: 'Lanka Handloom Artisans',
    orderDate: '2026-10-04',
    expectedDeliveryDate: '2026-10-12',
    status: 'RECEIVED',
    totalAmount: 24000,
    paidAmount: 24000,
    paymentStatus: 'PAID',
    deliveryTracking: 'Delivered via Gampaha Express Freight',
    notes: 'Handloom artisanal cotton bolts approved under GRN-2026-039',
    grnNumber: 'GRN-2026-039',
    items: [
      { id: 'poi-7', description: 'Handcrafted Combed Cotton (Gampaha)', quantity: 15, unit: 'Bolts', unitPrice: 1600, totalPrice: 24000 },
    ],
  },
  {
    id: 'po-6',
    poNumber: 'PO-2026-084',
    supplierId: 'sup-1',
    supplierName: 'Colombo Apparel Millers',
    orderDate: '2026-10-24',
    expectedDeliveryDate: '2026-11-09',
    status: 'DRAFT',
    totalAmount: 18500,
    paidAmount: 0,
    paymentStatus: 'UNPAID',
    notes: 'Draft requisition for upcoming festive collection replenishment',
    items: [
      { id: 'poi-8', description: 'Indigo Chambray Cotton Twill', quantity: 200, unit: 'Meters', unitPrice: 92.5, totalPrice: 18500 },
    ],
  },
];

export const SuppliersPage: React.FC = () => {
  const { push: pushToast } = useToastStore();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [activeTab, setActiveTab] = useState<'mills' | 'orders' | 'ageing'>('mills');

  // Filters
  const [search, setSearch] = useState('');
  const [millFilter, setMillFilter] = useState<'all' | 'due' | 'zero'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'DRAFT' | 'ORDERED' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Drawer State
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showCreatePOModal, setShowCreatePOModal] = useState(false);
  const [disburseSupplier, setDisburseSupplier] = useState<Supplier | null>(null);
  const [statementSupplier, setStatementSupplier] = useState<Supplier | null>(null);

  // Form States
  const [disburseAmount, setDisburseAmount] = useState<string>('');
  const [disburseMethod, setDisburseMethod] = useState<'CHEQUE' | 'BANK_TRANSFER' | 'CASH'>('BANK_TRANSFER');
  const [disburseRef, setDisburseRef] = useState<string>('');
  const [disburseNotes, setDisburseNotes] = useState<string>('');

  const [newPoSupplierId, setNewPoSupplierId] = useState<string>('');
  const [newPoItemDesc, setNewPoItemDesc] = useState<string>('');
  const [newPoQty, setNewPoQty] = useState<string>('50');
  const [newPoUnit, setNewPoUnit] = useState<string>('Meters');
  const [newPoUnitPrice, setNewPoUnitPrice] = useState<string>('850');
  const [newPoExpectedDate, setNewPoExpectedDate] = useState<string>('2026-11-10');
  const [newPoNotes, setNewPoNotes] = useState<string>('');

  const [newSupplierName, setNewSupplierName] = useState<string>('');
  const [newSupplierContact, setNewSupplierContact] = useState<string>('');
  const [newSupplierPhone, setNewSupplierPhone] = useState<string>('');
  const [newSupplierEmail, setNewSupplierEmail] = useState<string>('');
  const [newSupplierAddress, setNewSupplierAddress] = useState<string>('');
  const [newSupplierCreditTerms, setNewSupplierCreditTerms] = useState<string>('30');
  const [newSupplierCategory, setNewSupplierCategory] = useState<string>('Fabric Mill');

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/suppliers');
      if (res.success) {
        setSuppliers(res.data);
      }
    } catch (err) {
      console.error('Failed to load suppliers', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Filtered Suppliers
  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(search.toLowerCase())) ||
      s.phone.includes(search) ||
      (s.address && s.address.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (millFilter === 'due') return s.outstandingBalance > 0;
    if (millFilter === 'zero') return s.outstandingBalance === 0;
    return true;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      (po.notes && po.notes.toLowerCase().includes(search.toLowerCase())) ||
      (po.deliveryTracking && po.deliveryTracking.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (orderStatusFilter !== 'all') {
      return po.status === orderStatusFilter;
    }
    return true;
  });

  // Metrics Calculations
  const totalSuppliers = suppliers.length;
  const totalPayables = suppliers.reduce((acc, s) => acc + (s.outstandingBalance || 0), 0);
  const suppliersWithBalance = suppliers.filter((s) => (s.outstandingBalance || 0) > 0).length;
  const overduePayables = Math.round(totalPayables * 0.36); // Overdue 60+ days portion

  const activeOrders = orders.filter((o) => o.status === 'ORDERED' || o.status === 'SHIPPED');
  const activeOrdersCount = activeOrders.length;
  const activeOrdersTotal = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Status Chip Transition Action for Purchase Orders
  const handleUpdateOrderStatus = (
    orderId: string,
    newStatus: 'DRAFT' | 'ORDERED' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED'
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    const labels: Record<string, string> = {
      ORDERED: 'Purchase order sent to textile mill',
      SHIPPED: 'Consignment marked in transit with carrier',
      RECEIVED: 'Fabric received! Verified in GRN ledger',
      CANCELLED: 'Purchase order voided',
      DRAFT: 'Order saved as draft',
    };
    pushToast(labels[newStatus] || 'Order updated', newStatus === 'CANCELLED' ? 'warn' : 'ok');
  };

  // Handle Settle / Disburse Payment
  const handleConfirmDisbursement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disburseSupplier) return;

    const amount = Number(disburseAmount);
    if (!amount || amount <= 0) {
      pushToast('Please enter a valid disbursement amount', 'error');
      return;
    }

    try {
      await api.post(`/suppliers/${disburseSupplier.id}/pay`, {
        amount,
        paymentMethod: disburseMethod,
        referenceNumber: disburseRef,
        notes: disburseNotes,
      });

      // Update local state
      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === disburseSupplier.id
            ? { ...s, outstandingBalance: Math.max(0, s.outstandingBalance - amount) }
            : s
        )
      );

      pushToast(`Disbursed Rs ${amount.toLocaleString()} to ${disburseSupplier.name}`, 'ok');
      setDisburseSupplier(null);
      setDisburseAmount('');
      setDisburseRef('');
      setDisburseNotes('');
    } catch {
      pushToast('Failed to record mill disbursement', 'error');
    }
  };

  // Handle Create Purchase Order
  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === newPoSupplierId) || suppliers[0];
    if (!sup) {
      pushToast('Please select a supplier', 'error');
      return;
    }

    const qty = Number(newPoQty) || 1;
    const unitPrice = Number(newPoUnitPrice) || 1;
    const total = qty * unitPrice;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: sup.id,
      supplierName: sup.name,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: newPoExpectedDate || '2026-11-15',
      status: 'ORDERED',
      totalAmount: total,
      paidAmount: 0,
      paymentStatus: 'UNPAID',
      notes: newPoNotes || `${newPoItemDesc} (${qty} ${newPoUnit})`,
      items: [
        {
          id: `poi-${Date.now()}`,
          description: newPoItemDesc || 'Textile Consignment',
          quantity: qty,
          unit: newPoUnit,
          unitPrice,
          totalPrice: total,
        },
      ],
    };

    setOrders((prev) => [newPO, ...prev]);
    pushToast(`Created Purchase Order ${newPO.poNumber}`, 'ok');
    setShowCreatePOModal(false);
    setNewPoItemDesc('');
    setNewPoNotes('');
  };

  // Handle Register New Supplier
  const handleRegisterSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) {
      pushToast('Supplier name is required', 'error');
      return;
    }

    try {
      const res = await api.post('/suppliers', {
        name: newSupplierName,
        contactPerson: newSupplierContact,
        phone: newSupplierPhone || '0770000000',
        email: newSupplierEmail,
        address: newSupplierAddress,
        creditTerms: Number(newSupplierCreditTerms) || 30,
        category: newSupplierCategory,
        outstandingBalance: 0,
      });

      if (res.success && res.data) {
        setSuppliers((prev) => [res.data, ...prev]);
        pushToast(`Registered ${res.data.name} in mill directory`, 'ok');
        setShowAddSupplierModal(false);
        setNewSupplierName('');
        setNewSupplierContact('');
        setNewSupplierPhone('');
        setNewSupplierEmail('');
        setNewSupplierAddress('');
      }
    } catch {
      pushToast('Failed to register supplier', 'error');
    }
  };

  const tabs = [
    { id: 'mills', label: 'Mill Directory & Payables', icon: Building2, badge: `${suppliersWithBalance} Due` },
    { id: 'orders', label: 'Purchase Orders & Shipments', icon: Package, badge: `${activeOrdersCount} Open` },
    { id: 'ageing', label: 'Payables Ageing Ledger (30/60/90)', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 pb-12">
      <div className="mx-auto max-w-[1360px] p-4 sm:p-6 space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Mill & Supplier Payables Ledger"
          subtitle="Textile mill credit terms, 30/60/90-day payable ageing bars, and purchase order tracking"
          icon={Truck}
          right={
            <div className="flex items-center gap-2">
              <PressButton
                onClick={() => {
                  if (suppliers.length > 0 && !newPoSupplierId) {
                    setNewPoSupplierId(suppliers[0].id);
                  }
                  setShowCreatePOModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>New Purchase Order</span>
              </PressButton>

              <PressButton
                onClick={() => setShowAddSupplierModal(true)}
                className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-slate-200 shadow-2xs"
              >
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>Register Mill</span>
              </PressButton>
            </div>
          }
        />

        {/* 4 Stat Cards on Top */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Payables Owed"
            value={totalPayables}
            prefix="Rs "
            icon={Wallet}
            isHero={true}
            change={`${suppliersWithBalance} Accounts Active`}
          />

          <StatCard
            title="Overdue Past 30+ Days"
            value={overduePayables}
            prefix="Rs "
            icon={AlertTriangle}
            isPositive={false}
            change="Disbursement Required"
          />

          <StatCard
            title="Active Purchase Orders"
            value={activeOrdersTotal}
            prefix="Rs "
            icon={Truck}
            suffix={` (${activeOrdersCount} POs)`}
            change="In Transit & Production"
            isPositive={true}
          />

          <StatCard
            title="Verified Mills & Vendors"
            value={totalSuppliers}
            suffix=" Vendors"
            icon={Building2}
            isPositive={true}
            change="100% Quality Audited"
          />
        </div>

        {/* Segmented Pill Tabs Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PillTabs
            tabs={tabs}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as any)}
            layoutId="suppliers-section-tabs"
            variant="dark"
          />

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search mills, PO#, fabrics..."
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

        {/* ==================== TAB 1: MILL DIRECTORY & PAYABLES ==================== */}
        {activeTab === 'mills' && (
          <div className="space-y-4">
            {/* Quick Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider pl-1">
                Filter:
              </span>
              {(['all', 'due', 'zero'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setMillFilter(filterKey)}
                  className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                    millFilter === filterKey
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {filterKey === 'all' && `All Mills (${suppliers.length})`}
                  {filterKey === 'due' && `Due Balance (${suppliersWithBalance})`}
                  {filterKey === 'zero' && `Settled (${suppliers.length - suppliersWithBalance})`}
                </button>
              ))}
            </div>

            {/* Suppliers Animated List */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                ))}
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No Textile Mills Found"
                subtitle="Try adjusting your search query or registering a new fabric mill"
                actionLabel="Register Mill"
                onAction={() => setShowAddSupplierModal(true)}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                <AnimatedList>
                  {filteredSuppliers.map((supplier) => {
                    const hasDue = (supplier.outstandingBalance || 0) > 0;
                    return (
                      <AnimatedRow key={supplier.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Left: Supplier Info */}
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                              <Building2 className="w-5 h-5" />
                            </div>

                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-slate-900 text-base">
                                  {supplier.name}
                                </h3>

                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  {supplier.category || 'Fabric Mill'}
                                </span>

                                {supplier.creditTerms && (
                                  <span className="text-[11px] font-semibold text-slate-500 bg-blue-50/60 px-2 py-0.5 rounded-full border border-blue-100/80">
                                    {supplier.creditTerms} Days Credit
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
                                {supplier.contactPerson && (
                                  <span className="font-medium text-slate-700">
                                    Contact: {supplier.contactPerson}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 font-mono">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{supplier.phone}</span>
                                </span>
                                {supplier.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <span>{supplier.email}</span>
                                  </span>
                                )}
                              </div>

                              {supplier.address && (
                                <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  <span>{supplier.address}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Balance & Actions */}
                          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                            <div className="text-left md:text-right">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                                Mill Payable
                              </span>
                              <div className="flex items-center gap-2">
                                <p
                                  className={`text-lg font-black tabular-nums ${
                                    hasDue ? 'text-rose-600' : 'text-emerald-600'
                                  }`}
                                >
                                  Rs {supplier.outstandingBalance.toLocaleString()}
                                </p>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    hasDue
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}
                                >
                                  {hasDue ? 'Payment Due' : 'Settled'}
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setStatementSupplier(supplier)}
                                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                                title="Open Supplier Statement & Ageing"
                              >
                                <FileText className="w-3.5 h-3.5 text-slate-500" />
                                <span>Statement</span>
                              </button>

                              {hasDue && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDisburseSupplier(supplier);
                                    setDisburseAmount(supplier.outstandingBalance.toString());
                                  }}
                                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                                >
                                  <ArrowDownLeft className="w-3.5 h-3.5" />
                                  <span>Disburse</span>
                                </button>
                              )}
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

        {/* ==================== TAB 2: PURCHASE ORDERS & SHIPMENTS ==================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Order Status Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider pl-1">
                Status:
              </span>
              {(['all', 'DRAFT', 'ORDERED', 'SHIPPED', 'RECEIVED', 'CANCELLED'] as const).map(
                (statusKey) => (
                  <button
                    key={statusKey}
                    type="button"
                    onClick={() => setOrderStatusFilter(statusKey)}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                      orderStatusFilter === statusKey
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {statusKey === 'all' && `All Orders (${orders.length})`}
                    {statusKey === 'DRAFT' && 'Drafts'}
                    {statusKey === 'ORDERED' && 'Ordered'}
                    {statusKey === 'SHIPPED' && 'In Transit'}
                    {statusKey === 'RECEIVED' && 'Received (GRN)'}
                    {statusKey === 'CANCELLED' && 'Cancelled'}
                  </button>
                )
              )}
            </div>

            {/* Purchase Orders List */}
            {filteredOrders.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No Purchase Orders Found"
                subtitle="There are no purchase orders matching your status filter"
                actionLabel="Create Purchase Order"
                onAction={() => setShowCreatePOModal(true)}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                <AnimatedList>
                  {filteredOrders.map((po) => {
                    const isDraft = po.status === 'DRAFT';
                    const isOrdered = po.status === 'ORDERED';
                    const isShipped = po.status === 'SHIPPED';
                    const isReceived = po.status === 'RECEIVED';
                    const isCancelled = po.status === 'CANCELLED';

                    return (
                      <AnimatedRow key={po.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Left: PO Details */}
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                                isReceived
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                  : isShipped
                                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                                  : isOrdered
                                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                                  : isDraft
                                  ? 'bg-slate-100 text-slate-600 border-slate-300'
                                  : 'bg-red-50 text-red-600 border-red-200'
                              }`}
                            >
                              <Package className="w-5 h-5" />
                            </div>

                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-sm text-slate-900">
                                  {po.poNumber}
                                </span>

                                {/* Animated Purchase Order Status Chip */}
                                <motion.span
                                  layout
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                    isReceived
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                      : isShipped
                                      ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                      : isOrdered
                                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                                      : isDraft
                                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                                      : 'bg-red-100 text-red-700 border-red-200'
                                  }`}
                                >
                                  {isReceived
                                    ? 'Goods Received (GRN)'
                                    : isShipped
                                    ? 'In Transit — Shipped'
                                    : isOrdered
                                    ? 'Ordered — In Weaving'
                                    : isDraft
                                    ? 'Draft Order'
                                    : 'Cancelled'}
                                </motion.span>

                                {po.grnNumber && (
                                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {po.grnNumber}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>{po.supplierName}</span>
                                <span className="text-slate-400">•</span>
                                <span className="font-normal text-slate-500">Ordered: {po.orderDate}</span>
                              </p>

                              <p className="text-xs text-slate-600">
                                Items: <strong className="text-slate-900">{po.notes}</strong>
                              </p>

                              {po.deliveryTracking && (
                                <p className="text-[11px] text-indigo-700 font-medium flex items-center gap-1">
                                  <Truck className="w-3 h-3 shrink-0" />
                                  <span>{po.deliveryTracking}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Amount & Status Transition Action */}
                          <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                            <div className="text-left md:text-right">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                                PO Value
                              </span>
                              <p className="text-lg font-black text-slate-900 tabular-nums">
                                Rs {po.totalAmount.toLocaleString()}
                              </p>
                              <span className="text-[11px] text-slate-500">
                                Due: {po.expectedDeliveryDate}
                              </span>
                            </div>

                            {/* Status Advancement Buttons */}
                            <div className="flex items-center gap-2">
                              {isDraft && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrderStatus(po.id, 'ORDERED')}
                                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-2xs"
                                >
                                  Transmit to Mill &rarr;
                                </button>
                              )}

                              {isOrdered && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrderStatus(po.id, 'SHIPPED')}
                                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Mark Shipped</span>
                                </button>
                              )}

                              {isShipped && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrderStatus(po.id, 'RECEIVED')}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Log GRN Receipt</span>
                                </button>
                              )}

                              {!isReceived && !isCancelled && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrderStatus(po.id, 'CANCELLED')}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                                  title="Cancel PO"
                                >
                                  Void
                                </button>
                              )}
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

        {/* ==================== TAB 3: PAYABLES AGEING LEDGER ==================== */}
        {activeTab === 'ageing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ageing Summary Distribution Bars Card */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-6">
                <CardHeader
                  icon={Clock}
                  title="Mill Payables Ageing Distribution"
                  subtitle="Outstanding vendor liability breakdown across 30, 60, and 90+ day maturity buckets"
                />

                {/* 0 - 30 Days Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span>Current Mill Terms (0 - 30 Days)</span>
                    </span>
                    <span className="text-emerald-700 font-mono">
                      Rs {Math.round(totalPayables * 0.52).toLocaleString()} (52%)
                    </span>
                  </div>
                  <ProgressBar pct={52} color="#10b981" height="h-3" />
                  <p className="text-xs text-slate-500">
                    Within approved textile supplier trade credit window. No interest penalties apply.
                  </p>
                </div>

                {/* 31 - 60 Days Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <span>Past Due Credit (31 - 60 Days)</span>
                    </span>
                    <span className="text-amber-700 font-mono">
                      Rs {Math.round(totalPayables * 0.28).toLocaleString()} (28%)
                    </span>
                  </div>
                  <ProgressBar pct={28} color="#f59e0b" height="h-3" />
                  <p className="text-xs text-slate-500">
                    Scheduled for upcoming bi-weekly settlement disbursement run.
                  </p>
                </div>

                {/* 61 - 90+ Days Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      <span>Critical Overdue (61 - 90+ Days)</span>
                    </span>
                    <span className="text-red-700 font-mono">
                      Rs {Math.round(totalPayables * 0.20).toLocaleString()} (20%)
                    </span>
                  </div>
                  <ProgressBar pct={20} color="#ef4444" height="h-3" />
                  <p className="text-xs text-slate-500">
                    Requires immediate RTGS/SLIPS transfer to maintain priority roll dispatch terms.
                  </p>
                </div>
              </div>

              {/* Working Capital & Vendor Credit Card */}
              <div className="space-y-4">
                <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Mill Credit Health
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                      Grade AAA Mill Rating
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400">Total Outstanding Payables</span>
                    <p className="text-3xl font-black text-white">
                      Rs {totalPayables.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Average settlement cycle is 21 days with Colombo and Kandy textile mills.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1.5">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#c6f432]" />
                      <span>Procurement Trade Guarantee</span>
                    </p>
                    <p>
                      Accounts maintained within 45 days receive preferential 3% early settlement rebates on raw silk yardage and linen bolts.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900 font-medium space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-blue-700">
                    <Calendar className="w-4 h-4" />
                    <span>Next Disbursement Run</span>
                  </span>
                  <p>
                    Rs 45,000 to Colombo Apparel Millers is queued for clearance this Friday, October 30th.
                  </p>
                </div>
              </div>
            </div>

            {/* Mill by Mill Ageing Matrix Breakdown */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center justify-between">
                <span>Vendor Ageing Breakdown by Mill</span>
                <span className="text-xs font-normal text-slate-500">Values in Sri Lankan Rupees (Rs)</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Mill Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">0 - 30 Days</th>
                      <th className="py-3 px-4 text-right">31 - 60 Days</th>
                      <th className="py-3 px-4 text-right">61 - 90+ Days</th>
                      <th className="py-3 px-4 text-right">Total Payable</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {suppliers.map((s) => {
                      const bal = s.outstandingBalance || 0;
                      const c30 = Math.round(bal * 0.55);
                      const c60 = Math.round(bal * 0.25);
                      const c90 = Math.round(bal * 0.20);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                          <td className="py-3 px-4 text-slate-500">{s.category || 'Fabric Mill'}</td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-600">
                            {c30 > 0 ? `Rs ${c30.toLocaleString()}` : '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-amber-600">
                            {c60 > 0 ? `Rs ${c60.toLocaleString()}` : '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-rose-600">
                            {c90 > 0 ? `Rs ${c90.toLocaleString()}` : '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-slate-900 font-mono">
                            {bal > 0 ? `Rs ${bal.toLocaleString()}` : 'Rs 0'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                bal > 0
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {bal > 0 ? 'Due' : 'Cleared'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== SUPPLIER STATEMENT DRAWER ==================== */}
      <Drawer
        open={Boolean(statementSupplier)}
        onClose={() => setStatementSupplier(null)}
        side="right"
      >
        {statementSupplier && (
          <div className="space-y-6">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider inline-block mb-1.5">
                Mill Statement Ledger
              </span>
              <h2 className="text-2xl font-black text-slate-900">{statementSupplier.name}</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{statementSupplier.phone}</span>
              </p>
              {statementSupplier.address && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{statementSupplier.address}</span>
                </p>
              )}
            </div>

            {/* Total Balance Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-2 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                Total Payable Liability
              </span>
              <div className="text-3xl font-black text-white tabular-nums">
                Rs {statementSupplier.outstandingBalance.toLocaleString()}
              </div>
              <div className="text-xs text-slate-300 pt-2 border-t border-slate-800/80 flex justify-between">
                <span>Credit Terms: {statementSupplier.creditTerms || 30} Days Net</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Audited Mill Account</span>
                </span>
              </div>
            </div>

            {/* Ageing Breakdown with Animated Progress Bars */}
            <div className="space-y-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Payable Ageing Analysis (30 / 60 / 90 Days)</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </h3>

              {/* 0 - 30 Days */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Current (0 - 30 Days)</span>
                  <span className="text-emerald-600 tabular-nums">
                    Rs {Math.round(statementSupplier.outstandingBalance * 0.60).toLocaleString()}
                  </span>
                </div>
                <ProgressBar
                  pct={statementSupplier.outstandingBalance > 0 ? 60 : 0}
                  color="#10b981"
                  height="h-2"
                />
              </div>

              {/* 31 - 60 Days */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Past Due (31 - 60 Days)</span>
                  <span className="text-amber-600 tabular-nums">
                    Rs {Math.round(statementSupplier.outstandingBalance * 0.25).toLocaleString()}
                  </span>
                </div>
                <ProgressBar
                  pct={statementSupplier.outstandingBalance > 0 ? 25 : 0}
                  color="#f59e0b"
                  height="h-2"
                  delay={0.15}
                />
              </div>

              {/* 61 - 90+ Days */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Overdue (61 - 90+ Days)</span>
                  <span className="text-red-600 tabular-nums">
                    Rs {Math.round(statementSupplier.outstandingBalance * 0.15).toLocaleString()}
                  </span>
                </div>
                <ProgressBar
                  pct={statementSupplier.outstandingBalance > 0 ? 15 : 0}
                  color="#ef4444"
                  height="h-2"
                  delay={0.3}
                />
              </div>
            </div>

            {/* Linked Purchase Orders for this Mill */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Purchase Orders on File
              </h4>
              {orders.filter((po) => po.supplierId === statementSupplier.id).length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No purchase orders on file for this mill.</p>
              ) : (
                orders
                  .filter((po) => po.supplierId === statementSupplier.id)
                  .map((po) => (
                    <div
                      key={po.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1"
                    >
                      <div className="flex justify-between font-bold">
                        <span>{po.poNumber}</span>
                        <span className="text-blue-600 font-mono">
                          Rs {po.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-500">
                        {po.notes} • Expected: {po.expectedDeliveryDate}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        {po.status}
                      </span>
                    </div>
                  ))
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                  pushToast('Printing supplier statement PDF', 'ok');
                }}
                className="w-full min-h-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Mill Statement PDF</span>
              </button>

              {statementSupplier.outstandingBalance > 0 && (
                <PressButton
                  type="button"
                  onClick={() => {
                    const s = statementSupplier;
                    setStatementSupplier(null);
                    setDisburseSupplier(s);
                    setDisburseAmount(s.outstandingBalance.toString());
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white min-h-12 px-6 text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
                >
                  <span>Disburse Payment Now</span>
                  <ArrowRight className="w-4 h-4" />
                </PressButton>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* ==================== DISBURSE PAYMENT MODAL ==================== */}
      {disburseSupplier && (
        <Modal
          open={Boolean(disburseSupplier)}
          onClose={() => setDisburseSupplier(null)}
          title="Disburse Supplier Payment"
        >
          <form onSubmit={handleConfirmDisbursement} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="text-slate-500 font-medium">Recipient Vendor:</span>
              <p className="text-sm font-bold text-slate-900">{disburseSupplier.name}</p>
              <p className="text-rose-600 font-bold">
                Total Due: Rs {disburseSupplier.outstandingBalance.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Disbursement Amount (Rs) *
              </label>
              <input
                type="number"
                required
                min="1"
                max={disburseSupplier.outstandingBalance}
                value={disburseAmount}
                onChange={(e) => setDisburseAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-base font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Disbursement Channel
              </label>
              <select
                value={disburseMethod}
                onChange={(e) => setDisburseMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="BANK_TRANSFER">Bank Wire (SLIPS / RTGS)</option>
                <option value="CHEQUE">Company Cheque</option>
                <option value="CASH">Cash Voucher</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reference / Cheque Number
              </label>
              <input
                type="text"
                placeholder="e.g. SLIPS-90214 or CHQ-44820"
                value={disburseRef}
                onChange={(e) => setDisburseRef(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Settlement Notes
              </label>
              <textarea
                rows={2}
                placeholder="Optional payment notes..."
                value={disburseNotes}
                onChange={(e) => setDisburseNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDisburseSupplier(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <PressButton
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
              >
                Confirm Disbursement
              </PressButton>
            </div>
          </form>
        </Modal>
      )}

      {/* ==================== CREATE PURCHASE ORDER MODAL ==================== */}
      {showCreatePOModal && (
        <Modal
          open={showCreatePOModal}
          onClose={() => setShowCreatePOModal(false)}
          title="Create Fabric Purchase Order"
        >
          <form onSubmit={handleCreatePO} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Textile Mill / Supplier *
              </label>
              <select
                required
                value={newPoSupplierId}
                onChange={(e) => setNewPoSupplierId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category || 'Fabric Mill'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Fabric Item Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pure Linen Fabric Rolls (Blush Pink)"
                value={newPoItemDesc}
                onChange={(e) => setNewPoItemDesc(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newPoQty}
                  onChange={(e) => setNewPoQty(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Unit
                </label>
                <select
                  value={newPoUnit}
                  onChange={(e) => setNewPoUnit(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Meters">Meters</option>
                  <option value="Rolls">Rolls</option>
                  <option value="Bolts">Bolts</option>
                  <option value="Yards">Yards</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Unit Cost (Rs)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newPoUnitPrice}
                  onChange={(e) => setNewPoUnitPrice(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-600">Calculated PO Total:</span>
              <span className="font-black text-slate-900 text-sm font-mono">
                Rs {((Number(newPoQty) || 0) * (Number(newPoUnitPrice) || 0)).toLocaleString()}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Delivery Date
              </label>
              <input
                type="date"
                value={newPoExpectedDate}
                onChange={(e) => setNewPoExpectedDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Order Notes
              </label>
              <textarea
                rows={2}
                placeholder="Logistics, freight, or quality specs..."
                value={newPoNotes}
                onChange={(e) => setNewPoNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreatePOModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <PressButton
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
              >
                Issue Purchase Order
              </PressButton>
            </div>
          </form>
        </Modal>
      )}

      {/* ==================== REGISTER SUPPLIER MODAL ==================== */}
      {showAddSupplierModal && (
        <Modal
          open={showAddSupplierModal}
          onClose={() => setShowAddSupplierModal(false)}
          title="Register Fabric Mill / Supplier"
        >
          <form onSubmit={handleRegisterSupplier} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mill / Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Handloom Mills (Pvt) Ltd"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Sunimal Silva"
                  value={newSupplierContact}
                  onChange={(e) => setNewSupplierContact(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Vendor Category
                </label>
                <select
                  value={newSupplierCategory}
                  onChange={(e) => setNewSupplierCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Fabric Mill">Fabric Mill</option>
                  <option value="Silk Weavers">Silk Weavers</option>
                  <option value="Linen Importers">Linen Importers</option>
                  <option value="Artisan Handloom">Artisan Handloom</option>
                  <option value="Dyeing & Finishing">Dyeing & Finishing</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+94 11 285 4120"
                  value={newSupplierPhone}
                  onChange={(e) => setNewSupplierPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Credit Terms (Days)
                </label>
                <input
                  type="number"
                  value={newSupplierCreditTerms}
                  onChange={(e) => setNewSupplierCreditTerms(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="orders@textilemill.lk"
                value={newSupplierEmail}
                onChange={(e) => setNewSupplierEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mill Factory / Dispatch Address
              </label>
              <input
                type="text"
                placeholder="e.g. 15 Industrial Zone, Katugastota, Kandy"
                value={newSupplierAddress}
                onChange={(e) => setNewSupplierAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddSupplierModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <PressButton
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
              >
                Register Mill Profile
              </PressButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
