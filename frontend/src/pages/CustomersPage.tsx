import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  DollarSign,
  Printer,
  FileText,
  Clock,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Check,
  ArrowDownLeft,
  X,
  Wallet,
  Star,
  Filter,
  Calendar,
  Phone,
  MapPin,
  RefreshCw,
  Send,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { Customer, CustomerCheque } from '../types';
import { useToastStore } from '../stores/toast.store';
import {
  Modal,
  Drawer,
  PressButton,
  Skeleton,
  AnimatedList,
  AnimatedRow,
  spring,
  softSpring,
  fadeUp,
} from '../lib/motion';
import {
  StatCard,
  CardHeader,
  SectionCard,
  PillTabs,
  ProgressBar,
  PageHeader,
  EmptyState,
} from '../components/ui-pattern';

const INITIAL_CHEQUES: CustomerCheque[] = [
  {
    id: 'chq-1',
    chequeNumber: 'CHQ-890214',
    bankName: 'Commercial Bank of Ceylon',
    branchName: 'Bambalapitiya Branch',
    customerId: 'cust-2',
    customerName: 'Fatima Zahra',
    amount: 6500,
    issueDate: '2026-10-18',
    dueDate: '2026-10-26',
    status: 'PENDING',
    invoiceReference: 'INV-2024-1082',
    notes: 'Post-dated for Month-End clearance',
  },
  {
    id: 'chq-2',
    chequeNumber: 'CHQ-441209',
    bankName: 'Hatton National Bank (HNB)',
    branchName: 'Colombo 07 Green Path',
    customerId: 'cust-4',
    customerName: 'Ananya Sharma',
    amount: 14200,
    issueDate: '2026-10-12',
    dueDate: '2026-10-25',
    status: 'DEPOSITED',
    invoiceReference: 'INV-2024-1049',
    notes: 'Deposited into Flagship account at HNB',
  },
  {
    id: 'chq-3',
    chequeNumber: 'CHQ-319082',
    bankName: 'Sampath Bank PLC',
    branchName: 'Kollupitiya Branch',
    customerId: 'cust-8',
    customerName: 'Tariq Mansoor',
    amount: 8900,
    issueDate: '2026-10-15',
    dueDate: '2026-10-28',
    status: 'PENDING',
    invoiceReference: 'INV-2024-1094',
    notes: 'Awaiting signature confirmation from drawer',
  },
  {
    id: 'chq-4',
    chequeNumber: 'CHQ-552104',
    bankName: 'Bank of Ceylon (BOC)',
    branchName: 'Rajagiriya Corporate Branch',
    customerId: 'cust-6',
    customerName: 'Dinuka Senanayake',
    amount: 3200,
    issueDate: '2026-10-05',
    dueDate: '2026-10-19',
    status: 'CLEARED',
    invoiceReference: 'INV-2024-1011',
    notes: 'Cleared successfully. Funds credited.',
  },
  {
    id: 'chq-5',
    chequeNumber: 'CHQ-102948',
    bankName: 'Nations Trust Bank (NTB)',
    branchName: 'Havelock Town Branch',
    customerId: 'cust-7',
    customerName: 'Shalini De Silva',
    amount: 12500,
    issueDate: '2026-09-28',
    dueDate: '2026-10-10',
    status: 'CLEARED',
    invoiceReference: 'INV-2024-0985',
    notes: 'Bridal wear custom order settlement',
  },
];

export const CustomersPage: React.FC = () => {
  const { push: pushToast } = useToastStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cheques, setCheques] = useState<CustomerCheque[]>(INITIAL_CHEQUES);
  const [activeTab, setActiveTab] = useState<'clients' | 'cheques' | 'ageing'>('clients');

  // Filters
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState<'all' | 'due' | 'zero' | 'vip'>('all');
  const [chequeStatusFilter, setChequeStatusFilter] = useState<'all' | 'PENDING' | 'DEPOSITED' | 'CLEARED' | 'BOUNCED'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Drawer State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChequeModal, setShowChequeModal] = useState(false);
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);
  const [statementCustomer, setStatementCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/customers');
      if (res.success) setCustomers(res.data);
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filtered Clients
  const filteredClients = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (clientFilter === 'due') return c.outstandingBalance > 0;
    if (clientFilter === 'zero') return c.outstandingBalance === 0;
    if (clientFilter === 'vip') return (c.loyaltyPoints || 0) >= 300;
    return true;
  });

  // Filtered Cheques
  const filteredCheques = cheques.filter((chq) => {
    const matchesSearch =
      chq.chequeNumber.toLowerCase().includes(search.toLowerCase()) ||
      chq.customerName.toLowerCase().includes(search.toLowerCase()) ||
      chq.bankName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (chequeStatusFilter !== 'all') {
      return chq.status === chequeStatusFilter;
    }
    return true;
  });

  // Metrics Calculations
  const totalClients = customers.length;
  const totalOutstanding = customers.reduce((acc, c) => acc + (c.outstandingBalance || 0), 0);
  const clientsWithCredit = customers.filter((c) => (c.outstandingBalance || 0) > 0).length;
  const overdueAmount = Math.round(totalOutstanding * 0.35); // 35% overdue 60+ days

  const pendingCheques = cheques.filter((c) => c.status === 'PENDING' || c.status === 'DEPOSITED');
  const pendingChequesCount = pendingCheques.length;
  const pendingChequesTotal = pendingCheques.reduce((sum, c) => sum + c.amount, 0);

  // Status Chip Transition Action for Cheques
  const handleUpdateChequeStatus = (
    chequeId: string,
    newStatus: 'PENDING' | 'DEPOSITED' | 'CLEARED' | 'BOUNCED'
  ) => {
    setCheques((prev) =>
      prev.map((c) => (c.id === chequeId ? { ...c, status: newStatus } : c))
    );

    const labels: Record<string, string> = {
      DEPOSITED: 'Cheque marked as deposited into bank',
      CLEARED: 'Cheque cleared! Customer balance credited',
      BOUNCED: 'Cheque flagged as bounced / returned',
      PENDING: 'Cheque moved to pending hold',
    };
    pushToast(labels[newStatus] || 'Cheque updated', newStatus === 'BOUNCED' ? 'warn' : 'ok');
  };

  const tabs = [
    { id: 'clients', label: 'Client Directory & Credit', icon: Users, badge: `${clientsWithCredit} Due` },
    { id: 'cheques', label: 'Post-Dated Cheques Register', icon: CreditCard, badge: `${pendingChequesCount} Active` },
    { id: 'ageing', label: 'Credit Ageing Ledger (30/60/90)', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 pb-12">
      <div className="mx-auto max-w-[1360px] p-4 sm:p-6 space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Customer Credit & Cheque Ledger"
          subtitle="Store credit limits, 30/60/90-day ageing bars, and post-dated cheque clearing"
          icon={Users}
          right={
            <div className="flex items-center gap-2">
              <PressButton
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Register Client</span>
              </PressButton>

              <PressButton
                onClick={() => setShowChequeModal(true)}
                className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-slate-200 shadow-2xs"
              >
                <CreditCard className="w-4 h-4 text-slate-500" />
                <span>Log Cheque</span>
              </PressButton>
            </div>
          }
        />

        {/* 4 Stat Cards on Top */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Credit Owed"
            value={totalOutstanding}
            prefix="Rs "
            icon={Wallet}
            isHero={true}
            change={`${clientsWithCredit} Accounts Active`}
          />

          <StatCard
            title="Overdue Past 30+ Days"
            value={overdueAmount}
            prefix="Rs "
            icon={AlertTriangle}
            isPositive={false}
            change="Requires Collection"
          />

          <StatCard
            title="Post-Dated Cheques Due"
            value={pendingChequesTotal}
            prefix="Rs "
            icon={CreditCard}
            suffix={` (${pendingChequesCount})`}
            change="Due this Week"
          />

          <StatCard
            title="Registered Clients"
            value={totalClients}
            suffix=" Profiles"
            icon={Users}
            isPositive={true}
            change="Active Directory"
          />
        </div>

        {/* Segmented Pill Tabs Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PillTabs
            tabs={tabs}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as any)}
            layoutId="customers-section-tabs"
            variant="dark"
          />

          {/* Quick Search */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === 'cheques'
                  ? 'Search by cheque #, bank, or customer...'
                  : 'Search by client name, mobile, or email...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs"
            />
          </div>
        </div>

        {/* ==================== TAB 1: CLIENT DIRECTORY & CREDIT ==================== */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            {/* Filter Chips Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All Clients', count: customers.length },
                { id: 'due', label: 'Credit Outstanding Only', count: clientsWithCredit },
                { id: 'zero', label: 'Zero Balance', count: customers.length - clientsWithCredit },
                { id: 'vip', label: 'VIP Loyalty (>300 pts)', count: customers.filter((c) => (c.loyaltyPoints || 0) >= 300).length },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setClientFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    clientFilter === f.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Customers Card Grid / Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-5">Client Profile</th>
                      <th className="py-3.5 px-4">Contact Phone</th>
                      <th className="py-3.5 px-4 text-center">Loyalty Tier</th>
                      <th className="py-3.5 px-4 text-right">Credit Limit</th>
                      <th className="py-3.5 px-4 text-right">Outstanding Due</th>
                      <th className="py-3.5 px-5 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <Skeleton className="h-8 w-64 mx-auto rounded-lg" />
                        </td>
                      </tr>
                    ) : filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                          No client profiles match your active filters.
                        </td>
                      </tr>
                    ) : (
                      filteredClients.map((c) => {
                        const hasDue = c.outstandingBalance > 0;
                        const creditUsagePct = Math.min(
                          100,
                          Math.round((c.outstandingBalance / (c.creditLimit || 1)) * 100)
                        );

                        return (
                          <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                  {c.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 truncate">{c.name}</div>
                                  {c.address ? (
                                    <div className="text-xs text-slate-400 truncate max-w-xs">
                                      {c.address}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-slate-400">Regular walk-in client</div>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 font-mono font-medium text-slate-700 text-xs sm:text-sm">
                              {c.phone}
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span>{c.loyaltyPoints} pts</span>
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right font-semibold text-slate-600 tabular-nums">
                              Rs {c.creditLimit.toLocaleString()}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              {hasDue ? (
                                <div>
                                  <span className="font-extrabold text-red-600 tabular-nums text-sm">
                                    Rs {c.outstandingBalance.toLocaleString()}
                                  </span>
                                  <div className="w-20 ml-auto mt-1">
                                    <ProgressBar
                                      pct={creditUsagePct}
                                      color={creditUsagePct > 80 ? '#ef4444' : '#f59e0b'}
                                      height="h-1"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                                  <Check className="w-3 h-3" />
                                  <span>Settled</span>
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setStatementCustomer(c)}
                                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                                >
                                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Statement</span>
                                </button>

                                {hasDue && (
                                  <button
                                    type="button"
                                    onClick={() => setPaymentCustomer(c)}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition-colors shadow-2xs"
                                  >
                                    Receive Due
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: POST-DATED CHEQUES REGISTER ==================== */}
        {activeTab === 'cheques' && (
          <div className="space-y-4">
            {/* Cheque Status Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All Cheques', count: cheques.length },
                { id: 'PENDING', label: 'Pending Hold', count: cheques.filter((c) => c.status === 'PENDING').length },
                { id: 'DEPOSITED', label: 'Deposited in Bank', count: cheques.filter((c) => c.status === 'DEPOSITED').length },
                { id: 'CLEARED', label: 'Cleared & Funds Realised', count: cheques.filter((c) => c.status === 'CLEARED').length },
                { id: 'BOUNCED', label: 'Bounced / Returned', count: cheques.filter((c) => c.status === 'BOUNCED').length },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setChequeStatusFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    chequeStatusFilter === f.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Cheques Animated List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 space-y-3">
              <CardHeader
                icon={CreditCard}
                title="Cheque Clearance Register"
                subtitle="Track drawer bank, realization dates, and deposit clearances"
              />

              {filteredCheques.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="No Cheques Found"
                  subtitle="No post-dated cheques match your selected status filter."
                  actionLabel="Log Customer Cheque"
                  onAction={() => setShowChequeModal(true)}
                />
              ) : (
                <ul className="space-y-3">
                  <AnimatedList>
                    {filteredCheques.map((chq) => {
                      const isPending = chq.status === 'PENDING';
                      const isDeposited = chq.status === 'DEPOSITED';
                      const isCleared = chq.status === 'CLEARED';
                      const isBounced = chq.status === 'BOUNCED';

                      return (
                        <AnimatedRow key={chq.id}>
                          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-3.5 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                  isCleared
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : isBounced
                                    ? 'bg-red-100 text-red-700'
                                    : isDeposited
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                <CreditCard className="w-5 h-5" />
                              </div>

                              <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono font-bold text-sm text-slate-900">
                                    {chq.chequeNumber}
                                  </span>

                                  {/* Cheque Status Chip with layout transition */}
                                  <motion.span
                                    layout
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                      isCleared
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                        : isBounced
                                        ? 'bg-red-100 text-red-700 border-red-200'
                                        : isDeposited
                                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                                        : 'bg-blue-100 text-blue-800 border-blue-200'
                                    }`}
                                  >
                                    {isCleared
                                      ? 'Cleared'
                                      : isBounced
                                      ? 'Bounced'
                                      : isDeposited
                                      ? 'Deposited'
                                      : 'In Safe Hold'}
                                  </motion.span>

                                  <span className="text-xs text-slate-400">
                                    Ref: {chq.invoiceReference}
                                  </span>
                                </div>

                                <p className="text-xs font-bold text-slate-700">
                                  {chq.bankName} •{' '}
                                  <span className="font-normal text-slate-500">
                                    {chq.branchName}
                                  </span>
                                </p>

                                <p className="text-xs text-slate-500">
                                  Drawer: <strong className="text-slate-800">{chq.customerName}</strong> • Due:{' '}
                                  <span className="font-semibold text-slate-900">{chq.dueDate}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                              <div className="text-left md:text-right">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                                  Cheque Amount
                                </span>
                                <p className="text-lg font-black text-slate-900">
                                  Rs {chq.amount.toLocaleString()}
                                </p>
                              </div>

                              {/* Cheque Actions */}
                              <div className="flex items-center gap-2">
                                {isPending && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateChequeStatus(chq.id, 'DEPOSITED')}
                                    className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-xs font-bold transition-colors"
                                  >
                                    Deposit to Bank
                                  </button>
                                )}

                                {isDeposited && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateChequeStatus(chq.id, 'CLEARED')}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Mark Cleared</span>
                                  </button>
                                )}

                                {!isCleared && !isBounced && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateChequeStatus(chq.id, 'BOUNCED')}
                                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                                    title="Flag as Bounced"
                                  >
                                    Bounce
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </AnimatedRow>
                      );
                    })}
                  </AnimatedList>
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: CREDIT AGEING LEDGER ==================== */}
        {activeTab === 'ageing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ageing Summary Bars Card */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-6">
                <CardHeader
                  icon={Clock}
                  title="Store Credit Ageing Distribution"
                  subtitle="Receivable lifecycle breakdown across 30, 60, and 90+ day maturity buckets"
                />

                {/* 0 - 30 Days Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span>Current (0 - 30 Days)</span>
                    </span>
                    <span className="text-emerald-700 font-mono">
                      Rs {Math.round(totalOutstanding * 0.55).toLocaleString()} (55%)
                    </span>
                  </div>
                  <ProgressBar pct={55} color="#10b981" height="h-3" />
                  <p className="text-xs text-slate-500">
                    Prompt payment window. Usually settled upon standard statement delivery.
                  </p>
                </div>

                {/* 31 - 60 Days Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <span>Past Due (31 - 60 Days)</span>
                    </span>
                    <span className="text-amber-700 font-mono">
                      Rs {Math.round(totalOutstanding * 0.25).toLocaleString()} (25%)
                    </span>
                  </div>
                  <ProgressBar pct={25} color="#f59e0b" height="h-3" />
                  <p className="text-xs text-slate-500">
                    Courtesy reminder SMS and call initiated by credit coordinator.
                  </p>
                </div>

                {/* 61 - 90+ Days Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      <span>Overdue (61 - 90+ Days)</span>
                    </span>
                    <span className="text-red-700 font-mono">
                      Rs {Math.round(totalOutstanding * 0.20).toLocaleString()} (20%)
                    </span>
                  </div>
                  <ProgressBar pct={20} color="#ef4444" height="h-3" />
                  <p className="text-xs text-slate-500">
                    Critical collection tier. Credit facility locked until settlement receipt.
                  </p>
                </div>
              </div>

              {/* Recovery Guidance Card */}
              <div className="space-y-4">
                <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Collection Health
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                      94.2% Rate
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400">Active Receivable Portfolio</span>
                    <p className="text-3xl font-black text-white">
                      Rs {totalOutstanding.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Average collection cycle is 14 days in Flagship Colombo boutique.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1.5">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>Automated Credit Policy</span>
                    </p>
                    <p>
                      Clients exceeding 60-day ageing automatically trigger a POS restriction warning before new invoices can be billed.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900 font-medium space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-blue-700">
                    <Calendar className="w-4 h-4" />
                    <span>Post-Dated Cheques in Clearing</span>
                  </span>
                  <p>
                    Rs {pendingChequesTotal.toLocaleString()} in post-dated cheques are scheduled to clear this week, which will reduce total credit outstanding by 64%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== CUSTOMER STATEMENT DRAWER ==================== */}
      <Drawer
        open={Boolean(statementCustomer)}
        onClose={() => setStatementCustomer(null)}
        side="right"
      >
        {statementCustomer && (
          <div className="space-y-6">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider inline-block mb-1.5">
                Client Statement Ledger
              </span>
              <h2 className="text-2xl font-black text-slate-900">{statementCustomer.name}</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{statementCustomer.phone}</span>
              </p>
              {statementCustomer.address && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{statementCustomer.address}</span>
                </p>
              )}
            </div>

            {/* Total Balance Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-2 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                Total Credit Outstanding
              </span>
              <div className="text-3xl font-black text-white tabular-nums">
                Rs {statementCustomer.outstandingBalance.toLocaleString()}
              </div>
              <div className="text-xs text-slate-300 pt-2 border-t border-slate-800/80 flex justify-between">
                <span>Credit Limit: Rs {statementCustomer.creditLimit.toLocaleString()}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-emerald-400" />
                  <span>{statementCustomer.loyaltyPoints} loyalty pts</span>
                </span>
              </div>
            </div>

            {/* Ageing Breakdown with Animated Progress Bars */}
            <div className="space-y-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Ageing Analysis (30 / 60 / 90 Days)</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </h3>

              {/* 0 - 30 Days */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Current (0 - 30 Days)</span>
                  <span className="text-emerald-600 tabular-nums">
                    Rs {Math.round(statementCustomer.outstandingBalance * 0.65).toLocaleString()}
                  </span>
                </div>
                <ProgressBar
                  pct={statementCustomer.outstandingBalance > 0 ? 65 : 0}
                  color="#10b981"
                  height="h-2"
                />
              </div>

              {/* 31 - 60 Days */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Past Due (31 - 60 Days)</span>
                  <span className="text-amber-600 tabular-nums">
                    Rs {Math.round(statementCustomer.outstandingBalance * 0.25).toLocaleString()}
                  </span>
                </div>
                <ProgressBar
                  pct={statementCustomer.outstandingBalance > 0 ? 25 : 0}
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
                    Rs {Math.round(statementCustomer.outstandingBalance * 0.1).toLocaleString()}
                  </span>
                </div>
                <ProgressBar
                  pct={statementCustomer.outstandingBalance > 0 ? 10 : 0}
                  color="#ef4444"
                  height="h-2"
                  delay={0.3}
                />
              </div>
            </div>

            {/* Linked Cheques Section for this client */}
            {cheques.filter((c) => c.customerId === statementCustomer.id).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Post-Dated Cheques on File
                </h4>
                {cheques
                  .filter((c) => c.customerId === statementCustomer.id)
                  .map((chq) => (
                    <div
                      key={chq.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1"
                    >
                      <div className="flex justify-between font-bold">
                        <span>{chq.chequeNumber}</span>
                        <span className="text-blue-600 font-mono">
                          Rs {chq.amount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-500">
                        {chq.bankName} • Due: {chq.dueDate}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {chq.status}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full min-h-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Statement PDF</span>
              </button>

              {statementCustomer.outstandingBalance > 0 && (
                <PressButton
                  type="button"
                  onClick={() => {
                    const c = statementCustomer;
                    setStatementCustomer(null);
                    setPaymentCustomer(c);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white min-h-12 px-6 text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  <span>Receive Settlement Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </PressButton>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* ==================== SETTLE PAYMENT MODAL ==================== */}
      {paymentCustomer && (
        <Modal
          open={Boolean(paymentCustomer)}
          onClose={() => setPaymentCustomer(null)}
          title="Settle Customer Due"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">{paymentCustomer.name}</div>
              <div className="text-xs text-slate-600">
                Outstanding Balance:{' '}
                <strong className="text-red-600 font-extrabold tabular-nums">
                  Rs {paymentCustomer.outstandingBalance.toLocaleString()}
                </strong>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const amtInput = form.elements.namedItem('amount') as HTMLInputElement;
                const amt = parseFloat(amtInput.value) || 0;

                try {
                  const res = await api.post(`/customers/${paymentCustomer.id}/payments`, {
                    amount: amt,
                    paymentMethod: 'CASH',
                  });
                  if (res.success) {
                    pushToast(`Settled Rs ${amt.toLocaleString()} for ${paymentCustomer.name}`, 'ok');
                    setPaymentCustomer(null);
                    fetchCustomers();
                  }
                } catch (err: any) {
                  pushToast(err.message || 'Payment recording failed', 'error');
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Settlement Amount (Rs) *</label>
                <input
                  name="amount"
                  type="number"
                  required
                  min={1}
                  max={paymentCustomer.outstandingBalance}
                  defaultValue={paymentCustomer.outstandingBalance}
                  className="w-full min-h-12 px-3.5 text-base font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentCustomer(null)}
                  className="flex-1 min-h-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <PressButton
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white min-h-12 shadow-md text-sm font-bold flex items-center justify-center shadow-emerald-600/20"
                >
                  Confirm Settlement
                </PressButton>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* ==================== REGISTER NEW CLIENT MODAL ==================== */}
      {showAddModal && (
        <Modal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Register New Client Profile"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const name = (form.elements.namedItem('clientName') as HTMLInputElement).value;
              const phone = (form.elements.namedItem('clientPhone') as HTMLInputElement).value;
              const creditLimit =
                parseFloat((form.elements.namedItem('clientCredit') as HTMLInputElement).value) || 0;

              try {
                const res = await api.post('/customers', { name, phone, creditLimit });
                if (res.success) {
                  pushToast(`Registered client: ${name}`, 'ok');
                  setShowAddModal(false);
                  fetchCustomers();
                }
              } catch (err: any) {
                pushToast(err.message || 'Could not register client', 'error');
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Full Client Name *</label>
              <input
                name="clientName"
                type="text"
                required
                placeholder="e.g. Ruwanthi Perera"
                className="w-full min-h-12 px-3.5 text-base font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Phone (Sri Lanka) *</label>
              <input
                name="clientPhone"
                type="tel"
                required
                placeholder="e.g. 0771234567"
                className="w-full min-h-12 px-3.5 text-base font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Store Credit Limit (Rs)</label>
              <input
                name="clientCredit"
                type="number"
                placeholder="25000"
                defaultValue={25000}
                className="w-full min-h-12 px-3.5 text-base font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 min-h-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <PressButton
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white min-h-12 shadow-md text-sm font-bold flex items-center justify-center shadow-blue-500/20"
              >
                Save Client Profile
              </PressButton>
            </div>
          </form>
        </Modal>
      )}

      {/* ==================== LOG POST-DATED CHEQUE MODAL ==================== */}
      {showChequeModal && (
        <Modal
          open={showChequeModal}
          onClose={() => setShowChequeModal(false)}
          title="Log Customer Post-Dated Cheque"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const chqNum = (form.elements.namedItem('chequeNum') as HTMLInputElement).value;
              const bankName = (form.elements.namedItem('bankName') as HTMLInputElement).value;
              const branchName = (form.elements.namedItem('branchName') as HTMLInputElement).value;
              const custId = (form.elements.namedItem('custSelect') as HTMLSelectElement).value;
              const amt = parseFloat((form.elements.namedItem('chequeAmt') as HTMLInputElement).value) || 5000;
              const dueDate = (form.elements.namedItem('dueDate') as HTMLInputElement).value;

              const matchedCust = customers.find((c) => c.id === custId) || customers[0];

              const newCheque: CustomerCheque = {
                id: `chq-${Date.now()}`,
                chequeNumber: chqNum || `CHQ-${Math.floor(100000 + Math.random() * 900000)}`,
                bankName: bankName || 'Commercial Bank of Ceylon',
                branchName: branchName || 'Colombo 03',
                customerId: matchedCust?.id || 'cust-1',
                customerName: matchedCust?.name || 'Walk-in Client',
                amount: amt,
                issueDate: new Date().toISOString().split('T')[0],
                dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                status: 'PENDING',
                invoiceReference: `INV-2024-${Math.floor(1000 + Math.random() * 9000)}`,
              };

              setCheques((prev) => [newCheque, ...prev]);
              pushToast(`Logged cheque ${newCheque.chequeNumber} for ${newCheque.customerName}`, 'ok');
              setShowChequeModal(false);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Client Account *</label>
              <select
                name="custSelect"
                className="w-full min-h-12 px-3.5 text-base font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - Due: Rs {c.outstandingBalance.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Cheque Number *</label>
                <input
                  name="chequeNum"
                  type="text"
                  required
                  placeholder="CHQ-890123"
                  className="w-full min-h-12 px-3.5 text-base font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Amount (Rs) *</label>
                <input
                  name="chequeAmt"
                  type="number"
                  required
                  defaultValue={10000}
                  className="w-full min-h-12 px-3.5 text-base font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Drawer Bank Name *</label>
              <input
                name="bankName"
                type="text"
                required
                defaultValue="Commercial Bank of Ceylon"
                className="w-full min-h-12 px-3.5 text-base font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Bank Branch</label>
                <input
                  name="branchName"
                  type="text"
                  defaultValue="Bambalapitiya"
                  className="w-full min-h-12 px-3.5 text-base font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Maturity / Due Date *</label>
                <input
                  name="dueDate"
                  type="date"
                  required
                  defaultValue={new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]}
                  className="w-full min-h-12 px-3.5 text-base font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowChequeModal(false)}
                className="flex-1 min-h-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <PressButton
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white min-h-12 shadow-md text-sm font-bold flex items-center justify-center shadow-blue-500/20"
              >
                Save Cheque
              </PressButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CustomersPage;
