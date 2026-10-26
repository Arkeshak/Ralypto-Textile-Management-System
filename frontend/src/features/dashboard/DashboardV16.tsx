import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BarChart3,
  ChevronDown,
  Download,
  Info,
  LayoutDashboard,
  Package,
  Percent,
  Receipt,
  Users,
  Wallet,
  Filter,
  Trophy,
  Inbox,
  Handshake,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/auth.store';
import { Skeleton, stagger, fadeUp } from '../../lib/motion';
import {
  StatCard,
  CardHeader,
  SectionCard,
  PillTabs,
  ListRow,
  EmptyState,
  PageHeader,
} from '../../components/ui-pattern';

function DarkTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-slate-900 px-3.5 py-2.5 text-white shadow-lg">
      <p className="text-base font-bold leading-tight">
        Rs {Number(payload[0].value).toLocaleString('en-US')}
      </p>
      <p className="text-sm text-slate-300 mt-0.5">{label}</p>
    </div>
  );
}

interface DashboardV16Props {
  onNavigate?: (tab: string) => void;
}

export default function DashboardV16({ onNavigate }: DashboardV16Props) {
  const { user, activeBranchId } = useAuthStore();
  const [period, setPeriod] = useState<'Day' | 'Week' | 'Month'>('Month');
  const [activeNavTab, setActiveNavTab] = useState('dashboard');
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  // TanStack Query for real dashboard metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboardMetrics', period, activeBranchId],
    queryFn: async () => {
      const res = await api.get(`/dashboard/metrics?period=${period.toLowerCase()}`);
      return res?.data ?? null;
    },
    staleTime: 30000,
  });

  const multiplier = period === 'Day' ? 0.08 : period === 'Week' ? 0.32 : 1;
  const baseRevenue = metrics?.summary?.monthRevenue
    ? Math.round(metrics.summary.monthRevenue * multiplier)
    : 158000;
  const baseOrders = metrics?.summary?.todayTransactions
    ? Math.round(metrics.summary.todayTransactions * 24 * multiplier)
    : 342;
  const collectionRate = 92.4;
  const avgInvoice = baseOrders > 0 ? Math.round(baseRevenue / baseOrders) : 4850;

  const stats = [
    { title: 'Revenue', icon: Wallet, value: baseRevenue, prefix: 'Rs ', change: '+8.1%', isHero: true },
    { title: 'New orders', icon: Package, value: baseOrders, change: '+12%', isHero: false },
    { title: 'Collection rate', icon: Percent, value: collectionRate, suffix: '%', decimals: 1, change: '+3.4%', isHero: false },
    { title: 'Avg. invoice', icon: Receipt, value: avgInvoice, prefix: 'Rs ', change: '+4.2%', isHero: false },
  ];

  const revenueTrend = (metrics?.last7DaysTrend || [
    { date: 'Oct 1', revenue: 42000, count: 8 },
    { date: 'Oct 5', revenue: 58000, count: 12 },
    { date: 'Oct 9', revenue: 64000, count: 15 },
    { date: 'Oct 13', revenue: 98000, count: 22 },
    { date: 'Oct 17', revenue: 84000, count: 18 },
    { date: 'Oct 21', revenue: 112000, count: 25 },
    { date: 'Oct 25', revenue: 128000, count: 29 },
  ]).map((t: any) => ({
    d: t.date?.replace('2026-', '') || t.d,
    v: Math.round((t.revenue || t.v || 50000) * (period === 'Day' ? 0.2 : period === 'Week' ? 0.6 : 1)),
  }));

  const vsTarget = revenueTrend.map((r: any) => ({
    d: r.d,
    revenue: r.v,
    target: Math.round(r.v * 0.95),
  }));

  const sources = [
    { name: 'Wholesale (B2B)', value: 42, color: '#c6f432' },
    { name: 'Retail Counter', value: 28, color: '#2f5bff' },
    { name: 'WhatsApp Orders', value: 18, color: '#6d83ff' },
    { name: 'Walk-in Store', value: 9, color: '#b9c4ff' },
    { name: 'Other Channels', value: 3, color: '#94a3b8' },
  ];

  const funnel = [
    { label: 'Quotations', value: Math.round(1240 * multiplier), pct: 100, note: '' },
    { label: 'Orders', value: Math.round(620 * multiplier), pct: 50, note: '50%' },
    { label: 'Invoiced', value: Math.round(310 * multiplier), pct: 25, note: '50%' },
    { label: 'Paid', value: Math.round(124 * multiplier), pct: 10, note: '40%' },
  ];

  const reps = [
    { name: 'Kamal David', value: Math.round(433750 * multiplier), pct: 100, color: '#2f5bff' },
    { name: 'Aisha Khan', value: Math.round(219000 * multiplier), pct: 50, color: '#2f5bff' },
    { name: 'Leo Martins', value: Math.round(104200 * multiplier), pct: 24, color: '#22c55e' },
    { name: 'Nimal Perera', value: Math.round(62000 * multiplier), pct: 14, color: '#f59e0b' },
  ];

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'sales', label: 'Sales & Deals', icon: Handshake },
    { id: 'reports', label: 'Analytic & Reports', icon: BarChart3 },
    { id: 'inventory', label: 'Stock Ledger', icon: Package },
  ];

  const handleNavTabChange = (id: string) => {
    setActiveNavTab(id);
    if (onNavigate && id !== 'dashboard') {
      onNavigate(id);
    }
  };

  const userName = user?.name || 'Kamal David';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 pb-12">
      {/* Top Header Bar */}
      <header className="mx-auto flex max-w-[1360px] items-center justify-between px-6 py-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-30 mb-6 shadow-2xs">
        <div className="flex items-center gap-3 text-base font-bold text-slate-900">
          <div className="h-6 w-6 -skew-x-12 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-black">
            R
          </div>
          <span>Ralypto Textile OS</span>
        </div>

        <PillTabs
          tabs={navTabs}
          activeId={activeNavTab}
          onChange={handleNavTabChange}
          layoutId="dashboard-top-nav"
          variant="dark"
          className="hidden md:inline-flex"
        />

        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-sm font-bold text-white shadow-sm">
            {userInitials}
          </span>
          <div className="hidden sm:block text-left">
            <span className="text-sm font-bold text-slate-900 block leading-tight">{userName}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{user?.role || 'Owner'}</span>
          </div>
        </div>
      </header>

      <motion.main
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-[1360px] space-y-6 px-6"
      >
        {/* Title row & Filter Controls via PageHeader */}
        <PageHeader
          title="Analytic Performance"
          subtitle="Real-time multi-branch textile sales, invoices, and team performance"
          icon={Info}
          right={
            <div className="flex items-center gap-3 relative">
              <div className="relative">
                <button
                  onClick={() => setShowPeriodMenu((prev) => !prev)}
                  className="flex h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <span>Filter: {period}</span>
                  <ChevronDown size={16} className="text-slate-500" />
                </button>
                {showPeriodMenu && (
                  <div className="absolute right-0 top-14 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-40">
                    {(['Day', 'Week', 'Month'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setPeriod(p);
                          setShowPeriodMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                          period === p ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {p} view
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                aria-label="Download statement report"
                onClick={() => window.print()}
                className="grid h-12 w-12 place-items-center rounded-xl bg-white text-slate-700 shadow-sm border border-slate-200 hover:text-blue-600 transition-colors"
              >
                <Download size={18} />
              </button>
            </div>
          }
        />

        {/* Loading state skeleton */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-36 rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Skeleton className="h-80 rounded-2xl" />
              <Skeleton className="h-80 rounded-2xl" />
            </div>
          </div>
        ) : (
          <>
            {/* Stat Cards with shared StatCard */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s) => (
                <StatCard
                  key={s.title}
                  title={s.title}
                  value={s.value}
                  icon={s.icon}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  decimals={s.decimals}
                  change={s.change}
                  isHero={s.isHero}
                />
              ))}
            </div>

            {/* Charts Row with shared SectionCard and CardHeader */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Area Chart: Revenue */}
              <SectionCard>
                <CardHeader icon={BarChart3} title="Revenue Stream" sub={`Net sales for ${period}`} />
                {revenueTrend.length === 0 ? (
                  <EmptyState
                    title="No sales yet"
                    description="Make your first invoice to view revenue streams."
                  />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueTrend} margin={{ left: -10, right: 8, top: 8 }}>
                        <defs>
                          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2f5bff" stopOpacity={0.24} />
                            <stop offset="100%" stopColor="#2f5bff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#eef0f3" />
                        <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fontSize: 13, fill: '#64748b' }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 13, fill: '#64748b' }} tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
                        <Tooltip content={<DarkTip />} cursor={{ stroke: '#2f5bff', strokeWidth: 1.5 }} />
                        <Area type="monotone" dataKey="v" stroke="#2f5bff" strokeWidth={2.5} fill="url(#revFill)" animationDuration={1400} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </SectionCard>

              {/* Line Chart: Revenue vs Target */}
              <SectionCard>
                <CardHeader
                  icon={BarChart3}
                  title="Revenue vs Target"
                  sub="Target pacing trajectory"
                  right={
                    <div className="flex gap-4 text-sm font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Revenue</span>
                      <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-slate-900" /> Target</span>
                    </div>
                  }
                />
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vsTarget} margin={{ left: -10, right: 8, top: 8 }}>
                      <CartesianGrid vertical={false} stroke="#eef0f3" />
                      <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fontSize: 13, fill: '#64748b' }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 13, fill: '#64748b' }} tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
                      <Tooltip content={<DarkTip />} />
                      <Line type="monotone" dataKey="target" stroke="#0f172a" strokeWidth={2} dot={false} animationDuration={1400} />
                      <Line type="monotone" dataKey="revenue" stroke="#2f5bff" strokeWidth={2.5} dot={false} animationDuration={1400} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </div>

            {/* Bottom Row: Donut, Funnel, Top Reps */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Sales Channels Donut */}
              <SectionCard className="flex flex-col justify-between h-full">
                <div>
                  <CardHeader icon={Users} title="Sales Channels" sub="Share of orders this period" />
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                    <div className="relative h-40 w-40 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sources}
                            dataKey="value"
                            innerRadius={48}
                            outerRadius={70}
                            paddingAngle={3}
                            cornerRadius={6}
                            stroke="none"
                            startAngle={90}
                            endAngle={-270}
                            animationDuration={1200}
                          >
                            {sources.map((s) => (
                              <Cell key={s.name} fill={s.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 grid place-items-center text-center pointer-events-none">
                        <div>
                          <p className="text-2xl font-black text-slate-900 leading-none">42%</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Wholesale</p>
                        </div>
                      </div>
                    </div>
                    <ul className="flex-1 w-full space-y-1.5 text-xs">
                      {sources.map((s, i) => (
                        <li
                          key={s.name}
                          className={`flex items-center justify-between gap-3 rounded-xl px-2.5 py-1.5 ${
                            i === 0 ? 'bg-slate-100 font-bold' : ''
                          }`}
                        >
                          <span className="flex items-center gap-2 text-slate-700 min-w-0">
                            <i className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                            <span className="truncate">{s.name}</span>
                          </span>
                          <span className="font-extrabold text-slate-900 tabular-nums shrink-0 ml-auto pl-2">
                            {s.value}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </SectionCard>

              {/* Sales Funnel */}
              <SectionCard className="flex flex-col justify-between h-full">
                <div>
                  <CardHeader
                    icon={Filter}
                    title="Sales Funnel"
                    sub="Quotation to paid conversion"
                    right={
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion</p>
                        <p className="text-sm font-black text-emerald-600">10.0%</p>
                      </div>
                    }
                  />
                  <ul className="space-y-3.5 pt-2">
                    {funnel.map((f, i) => (
                      <li key={f.label} className="grid grid-cols-[82px_1fr_42px] items-center gap-2.5 text-xs sm:text-sm">
                        <span className="font-bold text-slate-700 truncate">{f.label}</span>
                        <div className="h-6 rounded-lg bg-slate-100 overflow-hidden flex items-center">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.max(f.pct, 16)}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.9, delay: i * 0.1, ease: 'easeOut' }}
                            className="flex h-full items-center justify-end rounded-lg bg-blue-600 px-2 text-xs font-bold text-white shadow-xs min-w-[44px]"
                          >
                            <span className="tabular-nums">{f.value}</span>
                          </motion.div>
                        </div>
                        <span className="text-right font-extrabold text-slate-500 tabular-nums text-xs">
                          {f.note || '100%'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </SectionCard>

              {/* Top Sales Staff with shared ListRow */}
              <SectionCard className="flex flex-col justify-between h-full">
                <div>
                  <CardHeader icon={Trophy} title="Top Sales Staff" sub="Closed-won value per representative" />
                  <div className="space-y-4 pt-1">
                    {reps.map((r, i) => (
                      <ListRow
                        key={r.name}
                        name={r.name}
                        valueText={`Rs ${r.value.toLocaleString('en-US')}`}
                        pct={r.pct}
                        avatarText={r.name[0]}
                        avatarColor={r.color}
                        delay={i * 0.1}
                      />
                    ))}
                  </div>
                </div>
              </SectionCard>
            </div>
          </>
        )}
      </motion.main>
    </div>
  );
}
