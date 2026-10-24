import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Coins,
  CreditCard,
  UserCheck,
  X,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { api } from '../services/api';
import { Customer } from '../types';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);

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

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const totalClients = customers.length;
  const totalOutstanding = customers.reduce((acc, c) => acc + (c.outstandingBalance || 0), 0);
  const totalPoints = customers.reduce((acc, c) => acc + (c.loyaltyPoints || 0), 0);
  const clientsWithCredit = customers.filter((c) => (c.outstandingBalance || 0) > 0).length;

  return (
    <div className="page-wrapper space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Client Directory & Credit Ledger</h1>
          <p className="page-subtitle">
            Loyalty points, customer outstanding balances, credit limits, and payment receipts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>New Client</span>
        </button>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="kpi-label">Registered Clients</span>
            <div className="w-8 h-8 rounded-xl bg-action-50 text-action-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">{totalClients}</div>
          <span className="text-2xs text-label-secondary font-medium">Active customer accounts</span>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="kpi-label">Outstanding Debt</span>
            <div className="w-8 h-8 rounded-xl bg-error-50 text-error-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-error-600 tabular-nums">
            LKR {totalOutstanding.toLocaleString()}
          </div>
          <span className="text-2xs text-label-secondary font-medium">
            Across {clientsWithCredit} credit accounts
          </span>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="kpi-label">Loyalty Points</span>
            <div className="w-8 h-8 rounded-xl bg-success-50 text-success-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value text-success-600">{totalPoints.toLocaleString()}</div>
          <span className="text-2xs text-label-secondary font-medium">Circulating rewards points</span>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="kpi-label">Credit Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-neutral-100 text-label-secondary flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">{clientsWithCredit}</div>
          <span className="text-2xs text-label-secondary font-medium">Clients with pending dues</span>
        </div>
      </div>

      {/* Search */}
      <div className="card p-3.5 flex items-center justify-between">
        <div className="search-field w-full max-w-md">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by customer name, mobile phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="py-3 px-5 min-w-[200px]">Client Name</th>
                <th className="py-3 px-4 min-w-[160px]">Contact Info</th>
                <th className="py-3 px-4 min-w-[120px] text-center">Loyalty Points</th>
                <th className="py-3 px-4 min-w-[130px] text-right whitespace-nowrap">Credit Limit</th>
                <th className="py-3 px-4 min-w-[140px] text-right whitespace-nowrap">Outstanding Due</th>
                <th className="py-3 px-5 min-w-[160px] text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-separator/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-label-tertiary">
                    Loading customer directory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-label-tertiary">
                    No clients found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-label-primary text-xs">{c.name}</div>
                      {c.address && (
                        <div className="text-2xs text-label-tertiary line-clamp-1">{c.address}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs text-label-primary">{c.phone}</div>
                      {c.email && (
                        <div className="text-3xs text-label-tertiary">{c.email}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="badge badge-success">
                        {c.loyaltyPoints} pts
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs tabular-nums text-label-secondary whitespace-nowrap">
                      LKR {c.creditLimit.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {c.outstandingBalance > 0 ? (
                        <span className="font-bold text-xs text-error-600 tabular-nums">
                          LKR {c.outstandingBalance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-label-tertiary text-xs">LKR 0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end min-h-[30px]">
                        {c.outstandingBalance > 0 ? (
                          <button
                            onClick={() => setPaymentCustomer(c)}
                            className="btn-secondary btn-sm !text-success-700 bg-success-50/60 hover:bg-success-100/60 border-success-200 !py-1 !px-2.5 text-xs"
                          >
                            Receive Payment
                          </button>
                        ) : (
                          <span className="text-2xs text-label-tertiary font-medium">No balance due</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receive Customer Credit Payment Modal */}
      {paymentCustomer && (
        <div className="modal-overlay">
          <div className="modal-panel max-w-sm">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Record Credit Payment</h3>
                <p className="text-xs text-label-secondary mt-0.5">Settle client balance</p>
              </div>
              <button onClick={() => setPaymentCustomer(null)} className="btn-icon">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 mx-5 mt-4 bg-surface-secondary rounded-xl text-xs space-y-1 border border-separator">
              <div className="font-semibold text-label-primary">{paymentCustomer.name}</div>
              <div className="text-label-secondary text-2xs">
                Current Due:{' '}
                <span className="text-error-600 font-bold tabular-nums">
                  LKR {paymentCustomer.outstandingBalance.toLocaleString()}
                </span>
              </div>
            </div>

            <CustomerPaymentForm
              customer={paymentCustomer}
              onClose={() => setPaymentCustomer(null)}
              onSuccess={() => {
                setPaymentCustomer(null);
                fetchCustomers();
              }}
            />
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <AddCustomerFullModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchCustomers();
          }}
        />
      )}
    </div>
  );
};

const CustomerPaymentForm: React.FC<{
  customer: Customer;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ customer, onClose, onSuccess }) => {
  const [amount, setAmount] = useState<number>(customer.outstandingBalance);
  const [method, setMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CARD'>('CASH');
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Payment amount must be greater than zero');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await api.post(`/customers/${customer.id}/payments`, {
        amount,
        paymentMethod: method,
        reference,
      });

      if (res.success) {
        onSuccess();
      } else {
        throw new Error(res.message || 'Payment recording failed');
      }
    } catch (err: any) {
      setError(err.message || 'Payment error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="modal-body space-y-3.5">
      {error && (
        <div className="p-2.5 bg-error-50 border border-error-100 text-error-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="input-label">Payment Amount (LKR) *</label>
        <input
          type="number"
          required
          min={1}
          max={customer.outstandingBalance}
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          className="input-field font-bold text-base tabular-nums"
        />
      </div>

      <div className="form-group">
        <label className="input-label">Payment Method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as any)}
          className="input-field"
        >
          <option value="CASH">Cash at Store Counter</option>
          <option value="BANK_TRANSFER">Bank Transfer (Commercial / Sampath)</option>
          <option value="CARD">Credit / Debit Card</option>
        </select>
      </div>

      <div className="form-group">
        <label className="input-label">Reference / Note</label>
        <input
          type="text"
          placeholder="e.g. Received by cashier"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="modal-footer !p-0 !border-0 pt-2">
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
          {isSubmitting ? 'Recording...' : 'Confirm Payment'}
        </button>
      </div>
    </form>
  );
};

const AddCustomerFullModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await api.post('/customers', {
        name,
        phone,
        email: email || undefined,
        address: address || undefined,
        creditLimit,
        notes: notes || undefined,
      });

      if (res.success) {
        onSuccess();
      } else {
        throw new Error(res.message || 'Failed to create customer');
      }
    } catch (err: any) {
      setError(err.message || 'Creation error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-md">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Add New Client</h3>
            <p className="text-xs text-label-secondary mt-0.5">Register client profile & credit allowance</p>
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
            <label className="input-label">Client Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Nimalka De Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Mobile Phone (Sri Lanka) *</label>
            <input
              type="tel"
              required
              placeholder="e.g. 0771234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field font-mono"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Email Address (Optional)</label>
            <input
              type="email"
              placeholder="nimalka@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Delivery Address (Optional)</label>
            <input
              type="text"
              placeholder="e.g. 24 Duplication Road, Colombo 04"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Authorized Credit Limit (LKR)</label>
            <input
              type="number"
              min={0}
              value={creditLimit}
              onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
              className="input-field font-semibold"
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
              {isSubmitting ? 'Saving...' : 'Register Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
