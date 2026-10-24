import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, X, AlertCircle, Tag, CreditCard } from 'lucide-react';
import { api } from '../services/api';
import { Expense } from '../types';

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<{ totalAmount: number; count: number }>({
    totalAmount: 0,
    count: 0,
  });
  const [categoryFilter, setCategoryFilter] = useState('');
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
      const url = categoryFilter ? `/expenses?category=${categoryFilter}` : '/expenses';
      const res = await api.get(url);
      if (res.success) {
        setExpenses(res.data);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load expenses', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  return (
    <div className="page-wrapper space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Operational Expenses</h1>
          <p className="page-subtitle">
            Record shop rent, electricity, marketing, staff wages, and luxury garment packaging.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Summary KPI & Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="metric-card md:col-span-2 flex-row items-center justify-between">
          <div>
            <span className="kpi-label">Total Recorded Expenses</span>
            <div className="kpi-value text-error-600 mt-1">
              LKR {summary.totalAmount?.toLocaleString() || 0}
            </div>
            <span className="text-2xs text-label-secondary font-medium">
              Across {summary.count || 0} tracked overhead payments
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-error-50 text-error-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Category Filter Card */}
        <div className="card p-5 flex flex-col justify-between">
          <span className="section-label mb-2">Category Filter</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="py-3 px-5 min-w-[120px]">Date</th>
                <th className="py-3 px-4 min-w-[130px]">Category</th>
                <th className="py-3 px-4 min-w-[200px]">Description</th>
                <th className="py-3 px-4 min-w-[140px]">Payment Method</th>
                <th className="py-3 px-4 min-w-[140px]">Recorded By</th>
                <th className="py-3 px-5 min-w-[140px] text-right whitespace-nowrap">Amount (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-separator/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-label-tertiary">
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-label-tertiary">
                    No expenses recorded for this selection.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="py-3.5 px-5 text-label-secondary text-xs whitespace-nowrap">
                      {new Date(e.expenseDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="badge badge-neutral">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-label-primary text-xs max-w-sm">
                      {e.description}
                    </td>
                    <td className="py-3.5 px-4 text-label-secondary text-xs whitespace-nowrap">
                      {e.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 text-label-secondary text-xs whitespace-nowrap">
                      {e.recordedByUser?.name || 'Staff'}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-sm text-label-primary tabular-nums whitespace-nowrap">
                      LKR {e.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <AddExpenseModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchExpenses();
          }}
        />
      )}
    </div>
  );
};

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
    if (amount <= 0 || !description) {
      setError('Please provide description and a valid amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await api.post('/expenses', {
        category,
        description,
        amount,
        paymentMethod,
      });

      if (res.success) {
        onSuccess();
      } else {
        throw new Error(res.message || 'Failed to save expense');
      }
    } catch (err: any) {
      setError(err.message || 'Expense error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-md">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Record Operational Expense</h3>
            <p className="text-xs text-label-secondary mt-0.5">Track overheads and utility costs</p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mx-5 mt-4 bg-error-50 border border-error-100 text-error-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-body space-y-3.5">
          <div className="form-group">
            <label className="input-label">Expense Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="input-label">Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. CEB Electricity bill for Bambalapitiya showroom"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="input-label">Amount (LKR) *</label>
              <input
                type="number"
                min={1}
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="input-field font-bold tabular-nums"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="input-field"
              >
                <option value="CASH">Cash at Store</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CARD">Company Card</option>
              </select>
            </div>
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
              {isSubmitting ? 'Saving...' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
