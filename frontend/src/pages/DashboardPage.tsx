import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  Users,
  ArrowUpRight,
  Receipt,
  Sparkles,
  BarChart3,
  RefreshCw,
  ShoppingCart,
  PlusCircle,
  Boxes,
  ArrowRight,
  ChevronRight,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import { useAuthStore } from '../stores/auth.store';
import { DashboardMetrics } from '../types';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

// Custom tooltip for chart
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-separator rounded-xl shadow-lg px-3.5 py-3 text-xs">
      <div className="font-semibold text-label-secondary mb-1.5">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-label-secondary">{p.name}:</span>
          <span className="font-bold text-label-primary">LKR {Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { activeBranchId, user } = useAuthStore();
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/dashboard/metrics');
      if (res.success && res.data) setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [activeBranchId]);

  const firstName = user?.name?.split(' ')[0] || 'Nadeeka';

  // Loading skeleton
  if (isLoading || !data) {
    return (
      <div className="page-wrapper space-y-6">
        <div className="skeleton h-64 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="skeleton h-72 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const { summary, last7DaysTrend, recentSales, lowStockAlerts } = data;

  const primaryMetrics = [
    {
      id: 'revenue',
      label: "Today's Revenue",
      value: `LKR ${summary.todayRevenue.toLocaleString()}`,
      sub: `${summary.todayTransactions} transactions`,
      icon: ShoppingBag,
      color: '#0071E3',
      bg: 'rgba(0,113,227,0.08)',
      nav: 'pos',
    },
    {
      id: 'profit',
      label: "Today's Gross Profit",
      value: `LKR ${summary.todayGrossProfit.toLocaleString()}`,
      sub: '46% average retail margin',
      icon: TrendingUp,
      color: '#34C759',
      bg: 'rgba(52,199,89,0.08)',
      nav: 'reports',
    },
    {
      id: 'inventory',
      label: 'Inventory Cost Value',
      value: `LKR ${summary.inventoryCostValue.toLocaleString()}`,
      sub: `${summary.totalInventoryUnits.toLocaleString()} units across showroom`,
      icon: Boxes,
      color: '#5856D6',
      bg: 'rgba(88,86,214,0.08)',
      nav: 'inventory',
    },
    {
      id: 'alerts',
      label: 'Reorder Watchlist',
      value: `${summary.lowStockCount + summary.outOfStockCount} Items`,
      sub: `${summary.outOfStockCount} out of stock`,
      icon: AlertTriangle,
      color: '#FF9F0A',
      bg: 'rgba(255,159,10,0.08)',
      nav: 'inventory',
      urgent: summary.outOfStockCount > 0,
    },
  ];

  // Category Showcases with Photographic Panels as specified in prompt section 5.D
  const categoryPanels = [
    {
      title: "Women's Wear",
      subtitle: 'Summer florals, wrap midi & maxi gowns',
      count: '7 Styles',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
      categorySlug: 'womens-wear',
    },
    {
      title: 'Sarees & Ethnic',
      subtitle: 'Kanchipuram silk, handloom combed cotton',
      count: '5 Styles',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
      categorySlug: 'sarees-ethnic',
    },
    {
      title: "Men's Wear",
      subtitle: 'Pure linen shirts, executive chinos & blazers',
      count: '5 Styles',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
      categorySlug: 'mens-wear',
    },
    {
      title: 'Modest Fashion',
      subtitle: 'Nida front-open abayas & pleated satin robes',
      count: '4 Styles',
      image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&auto=format&fit=crop&q=80',
      categorySlug: 'modest-fashion',
    },
    {
      title: "Kids' Wear",
      subtitle: 'Princess tulle dresses & linen shorts sets',
      count: '3 Styles',
      image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=80',
      categorySlug: 'kids-wear',
    },
    {
      title: 'Textiles & Accessories',
      subtitle: 'Raw silk bolts, handloom yardage & leather belts',
      count: '6 Styles',
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80',
      categorySlug: 'fabrics-textiles',
    },
  ];

  return (
    <div className="page-wrapper space-y-8">

      {/* ============================================================== */}
      {/* 5.A CINEMATIC DASHBOARD WELCOME HERO WITH BLACK GRADIENT OVERLAY */}
      {/* ============================================================== */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-xl border border-neutral-800 text-white p-6 sm:p-8 lg:p-10 transition-all duration-300"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.65) 48%, rgba(0,0,0,0.22) 100%), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Ambient glow highlight */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Top Brand Pill & Live Indicator */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-2xs font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Luxe Threads · Live Boutique Demo
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-2xs font-semibold backdrop-blur-md">
              Flagship Colombo 03 & Kandy Showrooms
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Your Store at a Glance
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 font-medium max-w-2xl leading-relaxed">
              Welcome back, {firstName}. Today’s retail sales, inventory movements, and customer ledger are in healthy sync across both boutiques.
            </p>
          </div>

          {/* Core Illustrative Demo Metrics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="text-2xs font-bold uppercase tracking-wider text-neutral-300 block">
                Today's Sales
              </span>
              <div className="text-2xl lg:text-3xl font-extrabold text-white mt-1 tabular-nums">
                LKR {summary.todayRevenue.toLocaleString()}
              </div>
              <div className="text-2xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+14.2% vs yesterday</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="text-2xs font-bold uppercase tracking-wider text-neutral-300 block">
                Orders Processed
              </span>
              <div className="text-2xl lg:text-3xl font-extrabold text-white mt-1 tabular-nums">
                {summary.todayTransactions}
              </div>
              <div className="text-2xs text-neutral-300 font-medium mt-1">
                Average basket: LKR {Math.round(summary.todayRevenue / (summary.todayTransactions || 1)).toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="text-2xs font-bold uppercase tracking-wider text-neutral-300 block">
                Items Sold Today
              </span>
              <div className="text-2xl lg:text-3xl font-extrabold text-white mt-1 tabular-nums">
                67
              </div>
              <div className="text-2xs text-indigo-300 font-medium mt-1">
                Ready-to-wear & textile bolts
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('pos')}
              className="px-5 py-3 rounded-xl bg-action-500 hover:bg-action-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-action-500/25 transition-all duration-150 active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Create New Sale</span>
            </button>

            <button
              onClick={() => onNavigate('products')}
              className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-2 backdrop-blur-md border border-white/20 transition-all duration-150"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Garment</span>
            </button>

            <button
              onClick={() => onNavigate('ai-studio')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all duration-150"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI Fashion Studio</span>
            </button>

            <button
              onClick={fetchMetrics}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white transition-colors border border-white/10"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Primary KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryMetrics.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => onNavigate(m.nav)}
              className="card p-5 text-left group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-action-500 focus:ring-offset-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: m.bg }}
                >
                  <Icon strokeWidth={2} style={{ color: m.color, width: 20, height: 20 }} />
                </div>
                <ArrowUpRight strokeWidth={1.75} className="w-4 h-4 text-label-tertiary opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 mt-0.5" />
              </div>
              <div className="mt-4">
                <div className={`text-2xl font-bold tracking-tight tabular-nums ${m.urgent ? 'text-warning-600' : 'text-label-primary'}`}>
                  {m.value}
                </div>
                <div className="section-label mt-0.5 normal-case tracking-normal text-label-secondary text-xs font-medium">
                  {m.sub}
                </div>
              </div>
              <div className="section-label mt-3">{m.label}</div>
            </button>
          );
        })}
      </div>

      {/* ── Secondary Financial Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Customer Receivables', value: `LKR ${summary.customerReceivables.toLocaleString()}`, sub: 'Outstanding store credit', icon: Users, color: '#5856D6' },
          { label: 'Supplier Payables', value: `LKR ${summary.supplierPayables.toLocaleString()}`, sub: 'Due to textile mills & weavers', icon: Receipt, color: '#FF9F0A' },
          { label: 'Month Net Profit', value: `LKR ${summary.monthNetProfit.toLocaleString()}`, sub: 'After rent, utilities & wages', icon: TrendingUp, color: '#34C759' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="flex items-center justify-between p-4 bg-white border border-separator rounded-2xl shadow-xs">
            <div>
              <p className="section-label">{label}</p>
              <p className="text-base font-bold text-label-primary mt-1 tabular-nums">{value}</p>
              <p className="text-2xs text-label-secondary mt-0.5">{sub}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}12` }}>
              <Icon strokeWidth={1.75} style={{ color, width: 18, height: 18 }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart + Low Stock ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="lg:col-span-2 card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-label-primary">Revenue & Profit Trend</h3>
              <p className="text-xs text-label-secondary mt-0.5">Past 7 days · Sri Lankan Rupees (LKR)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-label-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-action-500 inline-block" />
                Revenue
              </span>
              <span className="flex items-center gap-1.5 text-label-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-success-500 inline-block" />
                Gross Profit
              </span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7DaysTrend} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0071E3" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0071E3" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34C759" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#AEAEB2', fontFamily: 'Plus Jakarta Sans' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  width={55}
                  tick={{ fontSize: 11, fill: '#AEAEB2', fontFamily: 'Plus Jakarta Sans' }}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Revenue"
                  stroke="#0071E3"
                  strokeWidth={2.5}
                  fill="url(#salesGrad)"
                  dot={{ r: 3, fill: '#0071E3', strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="#34C759"
                  strokeWidth={2.5}
                  fill="url(#profitGrad)"
                  dot={{ r: 3, fill: '#34C759', strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-label-primary flex items-center gap-2">
                  <AlertTriangle strokeWidth={2} className="w-4 h-4 text-warning-500" />
                  Reorder Watchlist
                </h3>
                <p className="text-xs text-label-secondary mt-0.5">Variants below threshold</p>
              </div>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs font-semibold text-action-500 hover:text-action-600 transition-colors"
              >
                View all
              </button>
            </div>

            <div className="space-y-0 divide-y divide-separator/60">
              {lowStockAlerts.length === 0 ? (
                <div className="empty-state py-8">
                  <div className="empty-state-icon">
                    <Package strokeWidth={1.5} className="w-6 h-6 text-success-500" />
                  </div>
                  <p className="empty-state-title text-sm">All Stocked Up</p>
                  <p className="empty-state-desc text-xs">All inventory variants are healthy.</p>
                </div>
              ) : (
                lowStockAlerts.map((alert, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-label-primary truncate">{alert.productName}</div>
                      <div className="text-2xs text-label-secondary mt-0.5 truncate">
                        {alert.variantDetails} · SKU: {alert.sku}
                      </div>
                    </div>
                    <span className={`badge shrink-0 ${
                      alert.stock === 0 ? 'badge-error' : 'badge-warning'
                    }`}>
                      {alert.stock === 0 ? 'Out of Stock' : `${alert.stock} left`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('inventory')}
            className="btn-secondary btn-sm w-full justify-center mt-4 gap-1.5"
          >
            <BarChart3 strokeWidth={1.75} className="w-3.5 h-3.5" />
            <span>Manage Inventory & Orders</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5.D PRODUCT CATEGORY SHOWCASES (PHOTOGRAPHIC HERO CARDS)        */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-label-primary tracking-tight">
              Curated Textile & Fashion Collections
            </h3>
            <p className="text-xs text-label-secondary mt-0.5">
              Explore inventory and styling across primary retail departments
            </p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-semibold text-action-500 hover:text-action-600 flex items-center gap-1"
          >
            <span>Complete Catalogue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryPanels.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('products')}
              className="group relative rounded-2xl overflow-hidden aspect-16/10 min-h-[190px] cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 border border-separator/40 hover:-translate-y-1 select-none"
            >
              {/* Background image with hover zoom */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('${cat.image}')` }}
              />

              {/* Layered dark black gradient overlay */}
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.85) 100%)',
                }}
              />

              {/* Top Tag */}
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase border border-white/20">
                  {cat.count}
                </span>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between">
                <div>
                  <h4 className="text-white font-bold text-base leading-snug drop-shadow-xs">
                    {cat.title}
                  </h4>
                  <p className="text-neutral-200 text-xs font-medium line-clamp-1 drop-shadow-xs mt-0.5">
                    {cat.subtitle}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md group-hover:bg-white text-white group-hover:text-neutral-900 flex items-center justify-center shrink-0 transition-all duration-200">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Invoices Table ── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-separator">
          <div>
            <h3 className="text-sm font-semibold text-label-primary">Recent Boutique Invoices</h3>
            <p className="text-xs text-label-secondary mt-0.5">Latest settled POS transactions</p>
          </div>
          <button
            onClick={() => onNavigate('sales')}
            className="text-xs font-semibold text-action-500 hover:text-action-600 flex items-center gap-1 transition-colors"
          >
            <span>All sales ledger</span>
            <ArrowUpRight strokeWidth={2} className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="py-3 px-5 min-w-[130px]">Invoice</th>
                <th className="py-3 px-4 min-w-[160px]">Customer</th>
                <th className="hidden md:table-cell py-3 px-4 min-w-[120px]">Cashier</th>
                <th className="hidden sm:table-cell py-3 px-4 min-w-[110px]">Payment</th>
                <th className="py-3 px-4 min-w-[130px] text-right whitespace-nowrap">Total Amount</th>
                <th className="py-3 px-5 min-w-[110px] text-center whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-label-secondary text-sm">
                    No transactions yet today.
                  </td>
                </tr>
              ) : (
                recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="py-3.5 px-5">
                      <span className="font-mono text-xs font-semibold text-action-500 whitespace-nowrap">
                        {sale.invoiceNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {sale.customer?.name || (
                        <span className="text-label-secondary">Walk-in Boutique Client</span>
                      )}
                    </td>
                    <td className="hidden md:table-cell py-3.5 px-4 text-label-secondary text-xs">
                      {sale.cashier?.name || 'Sanduni Fernando'}
                    </td>
                    <td className="hidden sm:table-cell py-3.5 px-4">
                      <span className="badge badge-neutral text-2xs">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold tabular-nums whitespace-nowrap">
                      LKR {sale.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-center whitespace-nowrap">
                      <span className={`badge ${
                        sale.paymentStatus === 'PAID' ? 'badge-success' :
                        sale.paymentStatus === 'PARTIAL' ? 'badge-warning' :
                        'badge-neutral'
                      }`}>
                        {sale.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
