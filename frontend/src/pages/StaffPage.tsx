import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Mail,
  Phone,
  Building2,
  User,
  Plus,
  Search,
  CheckCircle2,
  Lock,
  KeyRound,
  Shield,
  X,
  AlertCircle,
  Copy,
  Check,
  UserCheck,
  ChevronRight,
  Smartphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import {
  Drawer,
  Modal,
  PressButton,
  Skeleton,
  stagger,
  fadeUp,
  PageTransition,
} from '../lib/motion';
import {
  StatCard,
  CardHeader,
  SectionCard,
  PageHeader,
  EmptyState,
} from '../components/ui-pattern';
import { useToastStore } from '../stores/toast.store';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string | { name: string };
  branchName?: string;
  branch?: { name: string };
  permissions?: string[];
  lastActive?: string;
}

export const StaffPage: React.FC = () => {
  const { push: pushToast } = useToastStore();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [inspectStaff, setInspectStaff] = useState<StaffMember | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/staff');
      if (res.success) setStaff(res.data);
    } catch (err) {
      console.error('Failed to load staff', err);
      pushToast('Unable to synchronize staff directory', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const getRoleName = (u: StaffMember): string => {
    if (typeof u.role === 'object' && u.role?.name) return u.role.name;
    return (u.role as string) || 'Staff Operator';
  };

  const getBranchName = (u: StaffMember): string => {
    return u.branchName || u.branch?.name || 'Flagship Boutique — Colombo 03';
  };

  const filteredStaff = staff.filter((u) => {
    const q = search.trim().toLowerCase();
    const role = getRoleName(u).toLowerCase();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      role.includes(q);

    const matchesRole = !roleFilter || role.includes(roleFilter.toLowerCase());

    return matchesSearch && matchesRole;
  });

  const totalMembers = staff.length;
  const adminCount = staff.filter((u) => {
    const r = getRoleName(u).toLowerCase();
    return r.includes('owner') || r.includes('manager');
  }).length;
  const operatorCount = totalMembers - adminCount;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    pushToast(`Copied ${text}`, 'ok');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <PageTransition routeKey="staff">
      <div className="min-h-screen bg-[#f3f4f6] text-slate-900 pb-12">
        <div className="mx-auto max-w-[1360px] p-4 sm:p-6 space-y-6">
          {/* Page Header */}
          <PageHeader
            title="Staff Roster & Access Permissions"
            subtitle="Multi-role access governance for cashiers, boutique managers, warehouse operators, and store owners"
            icon={ShieldCheck}
            right={
              <PressButton
                onClick={() => setShowInviteModal(true)}
                className="min-h-12 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 rounded-xl shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Invite Team Member</span>
              </PressButton>
            }
          />

          {/* Top 4 Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Active Staff Members"
              value={totalMembers}
              icon={UserCheck}
              suffix=" Operators"
              isHero={true}
              change="100% Roster Active"
              isPositive={true}
            />

            <StatCard
              title="Store Branches Covered"
              value={2}
              icon={Building2}
              suffix=" Locations"
              change="Flagship & Central Hub"
              isPositive={true}
            />

            <StatCard
              title="Administrative Roles"
              value={adminCount}
              icon={Shield}
              suffix=" Accounts"
              change="Audit Logged"
              isPositive={true}
            />

            <StatCard
              title="Floor & POS Operators"
              value={operatorCount}
              icon={KeyRound}
              suffix=" Operators"
              change="Counter & GRN Access"
              isPositive={true}
            />
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative w-full sm:w-96 shrink-0">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff by name, email, role, phone..."
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

              {/* Role Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setRoleFilter('')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    !roleFilter
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Roles
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('owner')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    roleFilter === 'owner'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-purple-700 hover:text-purple-900'
                  }`}
                >
                  Owner
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('manager')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    roleFilter === 'manager'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-blue-700 hover:text-blue-900'
                  }`}
                >
                  Manager
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('cashier')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    roleFilter === 'cashier'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-emerald-700 hover:text-emerald-900'
                  }`}
                >
                  Cashier
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('inventory')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    roleFilter === 'inventory'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-amber-700 hover:text-amber-900'
                  }`}
                >
                  Inventory
                </button>
              </div>
            </div>
          </div>

          {/* Staff Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-60 rounded-2xl" />
              ))}
            </div>
          ) : filteredStaff.length === 0 ? (
            <EmptyState
              icon={User}
              title="No staff members match your query"
              description={
                search || roleFilter
                  ? 'Try searching with different keywords or resetting role filters.'
                  : 'Start configuring team accounts and role permissions for your boutique.'
              }
              actionLabel="Invite Team Member"
              onAction={() => setShowInviteModal(true)}
            />
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredStaff.map((u) => {
                const roleName = getRoleName(u);
                const isOwner = roleName.toLowerCase().includes('owner');
                const isManager = roleName.toLowerCase().includes('manager');
                const isCashier = roleName.toLowerCase().includes('cashier');

                const defaultPermissions = isOwner
                  ? ['All Administrative Rights', 'Financial Auditing', 'Store Settings']
                  : isManager
                  ? ['Stock Control', 'Discount Approval', 'Daily Settlement']
                  : isCashier
                  ? ['POS Checkout', 'Receipt Issuance', 'Customer Accounts']
                  : ['Goods Receiving', 'Stock Ledger', 'Barcode Printing'];

                const permissions = u.permissions || defaultPermissions;

                return (
                  <motion.div
                    key={u.id}
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    onClick={() => setInspectStaff(u)}
                    className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md p-5 flex flex-col justify-between cursor-pointer transition-all"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isOwner
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : isManager
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : isCashier
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {roleName}
                        </span>

                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Active Operator</span>
                        </span>
                      </div>

                      {/* Staff Name & Avatar */}
                      <div className="flex items-center gap-3.5 my-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                          {u.name
                            ? u.name
                                .split(' ')
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()
                            : 'ST'}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                            {u.name}
                          </h3>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{getBranchName(u)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Channels */}
                      <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Key Permissions Chips */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Granted Clearances
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {permissions.slice(0, 2).map((perm, pIdx) => (
                            <span
                              key={pIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-semibold"
                            >
                              <ShieldCheck className="w-3 h-3 text-slate-400" />
                              <span>{perm}</span>
                            </span>
                          ))}
                          {permissions.length > 2 && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                              +{permissions.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {isOwner ? 'Unrestricted Root Access' : 'Role-Limited'}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectStaff(u);
                        }}
                        className="min-h-10 px-3 rounded-xl bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white flex items-center gap-1 text-xs font-bold transition-colors shadow-2xs"
                      >
                        <span>Permissions</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* -------------------- STAFF PERMISSIONS DRAWER -------------------- */}
        <Drawer
          open={Boolean(inspectStaff)}
          onClose={() => setInspectStaff(null)}
          side="right"
        >
          {inspectStaff && (
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                    {inspectStaff.name
                      ? inspectStaff.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()
                      : 'ST'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {inspectStaff.name}
                    </h3>
                    <p className="text-xs text-blue-600 font-bold mt-0.5">
                      {getRoleName(inspectStaff)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {getBranchName(inspectStaff)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectStaff(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Staff Details Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Official Email:</span>
                  <span className="font-semibold text-slate-900">{inspectStaff.email}</span>
                </div>
                {inspectStaff.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Mobile Hotline:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {inspectStaff.phone}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Security Access Level:</span>
                  <span className="font-bold text-purple-700">
                    {getRoleName(inspectStaff) === 'Owner'
                      ? 'Tier 1 — Full Audit Root'
                      : 'Tier 2 — Operational Staff'}
                  </span>
                </div>
              </div>

              {/* Comprehensive Permissions Checklist */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Configured Store Permissions
                </span>

                <div className="space-y-2 text-xs">
                  {[
                    {
                      label: 'POS Counter & Thermal Receipt Issuance',
                      desc: 'Checkout garments, apply loyalty points, reprint receipts',
                      granted: true,
                    },
                    {
                      label: 'Fabric Roll Inventory & Receiving (GRN)',
                      desc: 'Scan rolls, record goods received notes, update balances',
                      granted: !getRoleName(inspectStaff).includes('Cashier'),
                    },
                    {
                      label: 'Financial Reports & Gross Margin Telemetry',
                      desc: 'Access audit telemetry, profit margins, and COGS breakdown',
                      granted:
                        getRoleName(inspectStaff).includes('Owner') ||
                        getRoleName(inspectStaff).includes('Manager'),
                    },
                    {
                      label: 'Supplier Payment Settlement & Payable Vouchers',
                      desc: 'Record mill payments, adjust credit limits, approve cheques',
                      granted:
                        getRoleName(inspectStaff).includes('Owner') ||
                        getRoleName(inspectStaff).includes('Manager'),
                    },
                    {
                      label: 'Discount Overrides & Cashier Return Approvals',
                      desc: 'Override item discounts and approve customer cash refunds',
                      granted:
                        getRoleName(inspectStaff).includes('Owner') ||
                        getRoleName(inspectStaff).includes('Manager'),
                    },
                    {
                      label: 'User Roster Management & System Settings',
                      desc: 'Invite operators, configure branches, change shop currency',
                      granted: getRoleName(inspectStaff).includes('Owner'),
                    },
                  ].map((perm, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-start gap-3 ${
                        perm.granted
                          ? 'bg-white border-slate-200 shadow-2xs'
                          : 'bg-slate-50 border-slate-100 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                          perm.granted
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {perm.granted ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">{perm.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{perm.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setInspectStaff(null)}
                  className="w-full min-h-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Close Clearance Overview
                </button>
              </div>
            </div>
          )}
        </Drawer>

        {/* -------------------- INVITE STAFF MODAL -------------------- */}
        {showInviteModal && (
          <InviteStaffModal
            onClose={() => setShowInviteModal(false)}
            onSuccess={() => {
              setShowInviteModal(false);
              fetchStaff();
              pushToast('Staff invitation dispatched successfully', 'ok');
            }}
          />
        )}
      </div>
    </PageTransition>
  );
};

// Sub-component: Invite Staff Modal
const InviteStaffModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Cashier & Stylist');
  const [branch, setBranch] = useState('Flagship Boutique — Colombo 03');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Please provide staff name and valid email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Simulate invitation submission
      setTimeout(() => {
        onSuccess();
      }, 400);
    } catch (err: any) {
      setError(err.message || 'Invitation failed');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} title="Invite Boutique Team Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Full Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Kasuni Wickramasinghe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full min-h-11 px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Work Email *</label>
            <input
              type="email"
              required
              placeholder="e.g. kasuni@ralypto.lk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-11 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Mobile Phone</label>
            <input
              type="tel"
              placeholder="+94 77 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full min-h-11 px-3 py-2 text-xs font-mono font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Assigned Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full min-h-11 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="Cashier & Stylist">Cashier & Stylist</option>
              <option value="Store Manager">Store Manager</option>
              <option value="Inventory Specialist">Inventory Specialist</option>
              <option value="Owner">Owner / Executive</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Primary Branch</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full min-h-11 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="Flagship Boutique — Colombo 03">Flagship Colombo 03</option>
              <option value="Colombo Central Warehouse">Central Warehouse</option>
            </select>
          </div>
        </div>

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
            {isSubmitting ? 'Sending Invite...' : 'Send Access Invitation'}
          </PressButton>
        </div>
      </form>
    </Modal>
  );
};

export default StaffPage;
