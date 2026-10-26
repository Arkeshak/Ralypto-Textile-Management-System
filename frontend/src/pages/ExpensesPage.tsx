import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  X,
  AlertCircle,
  Tag,
  CreditCard,
  Search,
  Calendar,
  Wallet,
  TrendingDown,
  Building2,
  Receipt,
  CheckCircle2,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { Expense } from '../types';
import {
  Drawer,
  Modal,
  PressButton,
  Skeleton,
  stagger,
  fadeUp,
  PageTransition,
  AnimatedList,
  AnimatedRow,
} from '../lib/motion';
import {
  StatCard,
  CardHeader,
  SectionCard,
  PageHeader,
  EmptyState,
} from '../components/ui-pattern';
import { useToastStore } from '../stores/toast.store';

export const ExpensesPage: React.FC = () => {
  const { push: pushToast } = useToastStore();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<{ totalAmount: number; count: number }>({
    totalAmount: 0,
    count: 0,
  });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = [
    'Electricity',
    'Rent',
    'Salaries',
    'Packaging',
    'Marketing',
    'Repairs',
    'Transport',
    'Miscellaneous',
  ];

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const url = categoryFilter ? `/expenses?category=${encodeURIComponent(categoryFilter)}` : '/expenses';
      const res = await api.get(url);
      if (res.success) {
        setExpenses(res.data);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load expenses', err);
      pushToast('Failed to load operational expenses', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  // Client-side search and method filtering
  const filteredExpenses = expenses.filter((e) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      (e.recordedByUser?.name && e.recordedByUser.name.toLowerCase().includes(q));

    const matchesMethod = !methodFilter || e.paymentMethod === methodFilter;

    return matchesSearch && matchesMethod;
  });

  // Calculate metrics
  const totalAmount = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const count = expenses.length;
  const avgExpense = count > 0 ? Math.round(totalAmount / count) : 0;

  // Calculate today's outflows
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayExpenses = expenses.filter((e) => e.expenseDate?.slice(0, 10) === todayStr);
  const todayAmount = todayExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  // Highest category breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (e.amount || 0);
  });
  const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const topCategoryName = topCategoryEntry ? topCategoryEntry[0] : 'General';
  const topCategoryAmount = topCategoryEntry ? topCategoryEntry[1] : 0;

  return (
    <PageTransition routeKey="expenses">
      <div className="min-h-screen bg-[#f3f4f6] text-slate-900 pb-12">
        <div className="mx-auto max-w-[1360px] p-4 sm:p-6 space-y-6">
          {/* Page Header */}
          <PageHeader
            title="Operational Expenses & Petty Cash"
            subtitle="Track boutique rent, electricity, marketing, staff wages, and store cash outflows"
            icon={DollarSign}
            right={
              <PressButton
                onClick={() => setShowAddModal(true)}
                className="min-h-12 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 rounded-xl shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Record Expense</span>
              </PressButton>
            }
          />

          {/* Top 4 Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Recorded Expenses"
              value={totalAmount}
              prefix="Rs "
              icon={DollarSign}
              isHero={true}
              change={`${count} Overhead Outflows`}
              isPositive={false}
            />

            <StatCard
              title="Today's Outflows"
              value={todayAmount}
              prefix="Rs "
              icon={Wallet}
              change={todayAmount > 0 ? `${todayExpenses.length} Outflows Today` : 'No Outflows Today'}
              isPositive={todayAmount === 0}
            />

            <StatCard
              title="Average Outflow Ticket"
              value={avgExpense}
              prefix="Rs "
              icon={Receipt}
              change="Per Overhead Voucher"
              isPositive={true}
            />

            <StatCard
              title={`Top: ${topCategoryName}`}
              value={topCategoryAmount}
              prefix="Rs "
              icon={TrendingDown}
              change={`${Math.round(totalAmount > 0 ? (topCategoryAmount / totalAmount) * 100 : 0)}% of Total Outflows`}
              isPositive={false}
            />
          </div>

          {/* Filters & Search Toolbar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative w-full lg:w-96 shrink-0">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search description, payee, staff, category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full min-h-12 pl-10 pr-9 text-xs sm:text-sm font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder:text-slate-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setMethodFilter('')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !methodFilter
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Methods
                </button>
                <button
                  type="button"
                  onClick={() => setMethodFilter('CASH')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    methodFilter === 'CASH'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-emerald-700 hover:text-emerald-900'
                  }`}
                >
                  Cash at Store
                </button>
                <button
                  type="button"
                  onClick={() => setMethodFilter('BANK_TRANSFER')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    methodFilter === 'BANK_TRANSFER'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-blue-700 hover:text-blue-900'
                  }`}
                >
                  Bank Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setMethodFilter('CARD')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    methodFilter === 'CARD'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-purple-700 hover:text-purple-900'
                  }`}
                >
                  Card
                </button>
              </div>
            </div>

            {/* Category Filter Pills (Horizontal Scroll) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 scrollbar-none border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCategoryFilter('')}
                className={`min-h-9 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  !categoryFilter
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Categories ({expenses.length})
              </button>
              {categories.map((c) => {
                const countInCat = expenses.filter((e) => e.category === c).length;
                const isSelected = categoryFilter === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategoryFilter(c)}
                    className={`min-h-9 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{c}</span>
                    {countInCat > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {countInCat}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-800">{filteredExpenses.length}</strong> of{' '}
              {expenses.length} expense entries
            </span>
            {(search || categoryFilter || methodFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('');
                  setMethodFilter('');
                }}
                className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>

          {/* Expenses Table */}
          {isLoading ? (
            <SectionCard>
              <div className="space-y-3 py-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            </SectionCard>
          ) : filteredExpenses.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No expenses match your filters"
              description={
                search || categoryFilter || methodFilter
                  ? 'Try clearing your search query or switching to another category.'
                  : 'Start recording operational outflows, utilities, and packaging costs.'
              }
              actionLabel="Record Expense"
              onAction={() => setShowAddModal(true)}
            />
          ) : (
            <SectionCard>
              <div className="overflow-x-auto -mx-5 -my-5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-5 min-w-[130px]">Date</th>
                      <th className="py-3.5 px-4 min-w-[140px]">Category</th>
                      <th className="py-3.5 px-4 min-w-[240px]">Description & Payee</th>
                      <th className="py-3.5 px-4 min-w-[140px]">Payment Method</th>
                      <th className="py-3.5 px-4 min-w-[140px]">Recorded By</th>
                      <th className="py-3.5 px-5 min-w-[140px] text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredExpenses.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5 text-slate-500 font-medium whitespace-nowrap">
                          {new Date(e.expenseDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-bold text-slate-700 text-[11px]">
                            <Tag className="w-3 h-3 text-slate-400" />
                            <span>{e.category}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-900 text-xs max-w-sm">
                          {e.description}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              e.paymentMethod === 'CASH'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : e.paymentMethod === 'BANK_TRANSFER'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}
                          >
                            {e.paymentMethod === 'CASH'
                              ? 'Cash at Store'
                              : e.paymentMethod === 'BANK_TRANSFER'
                              ? 'Bank Wire'
                              : 'Company Card'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                          {e.recordedByUser?.name || 'Staff User'}
                        </td>

                        <td className="py-3.5 px-5 text-right font-black text-sm text-slate-900 tabular-nums whitespace-nowrap">
                          Rs {e.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {/* Record Expense Modal */}
          {showAddModal && (
            <AddExpenseModal
              categories={categories}
              onClose={() => setShowAddModal(false)}
              onSuccess={() => {
                setShowAddModal(false);
                fetchExpenses();
                pushToast('Expense voucher recorded successfully', 'ok');
              }}
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
};

// Sub-component: Add Expense Modal
const AddExpenseModal: React.FC<{
  categories: string[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ categories, onClose, onSuccess }) => {
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CARD'>('CASH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) {
      setError('Please provide a description and a valid amount greater than 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await api.post('/expenses', {
        category,
        description: description.trim(),
        amount,
        paymentMethod,
      });

      if (res.success) {
        onSuccess();
      } else {
        throw new Error(res.message || 'Failed to record expense');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while recording expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} title="Record Operational Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Category */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Expense Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full min-h-11 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Description & Payee *</label>
          <input
            type="text"
            required
            placeholder="e.g. CEB Electricity bill for Bambalapitiya showroom"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-11 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Amount & Payment Tender */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Amount (Rs) *</label>
            <input
              type="number"
              min={1}
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full min-h-11 px-3 py-2 text-sm font-black rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 tabular-nums"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Payment Tender</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full min-h-11 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="CASH">Cash at Store</option>
              <option value="BANK_TRANSFER">Bank Wire</option>
              <option value="CARD">Company Card</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-12 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <PressButton
            type="submit"
            disabled={isSubmitting}
            className="flex-1 min-h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-md text-xs font-bold flex items-center justify-center rounded-xl transition-colors"
          >
            {isSubmitting ? 'Recording...' : 'Save Expense Voucher'}
          </PressButton>
        </div>
      </form>
    </Modal>
  );
};

export default ExpensesPage;
