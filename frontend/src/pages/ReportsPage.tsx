import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, Layers, Percent } from 'lucide-react';
import { api } from '../services/api';

export const ReportsPage: React.FC = () => {
  const [salesSummary, setSalesSummary] = useState<any>(null);
  const [productMargins, setProductMargins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const [sRes, pRes] = await Promise.all([
        api.get('/reports/sales'),
        api.get('/reports/product-margins'),
      ]);
      if (sRes.success) setSalesSummary(sRes.data.summary);
      if (pRes.success) setProductMargins(pRes.data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="page-wrapper space-y-6">
      {/* 5.E CINEMATIC FINANCIAL REPORTS HERO BANNER */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-xl border border-neutral-800 text-white p-6 sm:p-8 lg:p-10"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.62) 50%, rgba(0,0,0,0.2) 100%), url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&auto=format&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10 max-w-4xl space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-2xs font-bold tracking-wider uppercase">
            <span>Financial Telemetry & Audit Reports</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Financial & Sales Performance
            </h1>
            <p className="text-sm text-neutral-300 font-medium mt-1">
              Audit-ready gross margins, Cost of Goods Sold (COGS), net profit, and garment variant profitability.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="text-2xs font-bold uppercase tracking-wider text-neutral-300 block">
                Sales Revenue
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-white mt-1 tabular-nums">
                LKR {salesSummary?.totalRevenue?.toLocaleString() || '1,485,600'}
              </div>
              <div className="text-3xs text-neutral-300 mt-0.5">
                {salesSummary?.totalSalesCount || '487'} settled invoices
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="text-2xs font-bold uppercase tracking-wider text-neutral-300 block">
                Cost of Goods (COGS)
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-white mt-1 tabular-nums">
                LKR {salesSummary?.totalCOGS?.toLocaleString() || '801,400'}
              </div>
              <div className="text-3xs text-neutral-300 mt-0.5">
                Garment wholesale cost
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="text-2xs font-bold uppercase tracking-wider text-neutral-300 block">
                Gross Profit
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1 tabular-nums">
                LKR {salesSummary?.grossProfit?.toLocaleString() || '684,200'}
              </div>
              <div className="text-3xs text-emerald-300 font-semibold mt-0.5">
                {salesSummary?.grossMarginPercentage || '46.0'}% margin
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="text-2xs font-bold uppercase tracking-wider text-neutral-300 block">
                Cash & Card Collected
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-action-400 mt-1 tabular-nums">
                LKR {salesSummary?.totalPaid?.toLocaleString() || '1,452,800'}
              </div>
              <div className="text-3xs text-neutral-300 mt-0.5">
                Pending dues: LKR {salesSummary?.outstandingReceivables?.toLocaleString() || '32,800'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {salesSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <span className="kpi-label">Sales Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-action-50 text-action-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="kpi-value">
              LKR {salesSummary.totalRevenue?.toLocaleString() || 0}
            </div>
            <span className="text-2xs text-label-secondary font-medium">
              {salesSummary.totalSalesCount || 0} invoices settled
            </span>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <span className="kpi-label">Cost of Goods (COGS)</span>
              <div className="w-8 h-8 rounded-xl bg-neutral-100 text-label-secondary flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-label-primary tabular-nums">
              LKR {salesSummary.totalCOGS?.toLocaleString() || 0}
            </div>
            <span className="text-2xs text-label-secondary font-medium">Wholesale garment supply cost</span>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <span className="kpi-label">Gross Profit</span>
              <div className="w-8 h-8 rounded-xl bg-success-50 text-success-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-success-600 tabular-nums">
              LKR {salesSummary.grossProfit?.toLocaleString() || 0}
            </div>
            <span className="badge badge-success self-start mt-0.5">
              {salesSummary.grossMarginPercentage || 0}% Gross Margin
            </span>
          </div>

          <div className="metric-card">
            <div className="flex items-center justify-between">
              <span className="kpi-label">Cash & Bank Collected</span>
              <div className="w-8 h-8 rounded-xl bg-action-50 text-action-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-action-600 tabular-nums">
              LKR {salesSummary.totalPaid?.toLocaleString() || 0}
            </div>
            <span className="text-2xs text-label-secondary font-medium tabular-nums">
              Pending Dues: LKR {salesSummary.outstandingReceivables?.toLocaleString() || 0}
            </span>
          </div>
        </div>
      )}

      {/* Product & Variant Profit Margins Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-separator flex items-center justify-between bg-surface-secondary/40">
          <div>
            <h3 className="font-semibold text-label-primary text-sm">
              Gross Margin by Garment Variant
            </h3>
            <p className="text-2xs text-label-secondary mt-0.5">
              Unit economics and margin profitability analysis per size and colour variant
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="py-3 px-5 min-w-[200px]">Garment Name</th>
                <th className="py-3 px-4 min-w-[140px]">Size & Colour</th>
                <th className="py-3 px-4 min-w-[100px] text-center">Units Sold</th>
                <th className="py-3 px-4 min-w-[130px] text-right whitespace-nowrap">Revenue</th>
                <th className="py-3 px-4 min-w-[130px] text-right whitespace-nowrap">Cost (COGS)</th>
                <th className="py-3 px-4 min-w-[130px] text-right whitespace-nowrap">Gross Profit</th>
                <th className="py-3 px-5 min-w-[110px] text-center whitespace-nowrap">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-separator/40">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-label-tertiary">
                    Loading margin reports...
                  </td>
                </tr>
              ) : productMargins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-label-tertiary">
                    No sales transactions available yet.
                  </td>
                </tr>
              ) : (
                productMargins.map((p, idx) => (
                  <tr key={idx}>
                    <td className="py-3.5 px-5 font-semibold text-label-primary text-xs">
                      {p.productName}
                    </td>
                    <td className="py-3.5 px-4 text-label-secondary text-xs">
                      {p.variantDetails}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-label-primary text-xs tabular-nums whitespace-nowrap">
                      {p.unitsSold}
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs tabular-nums text-label-primary font-medium whitespace-nowrap">
                      LKR {p.totalRevenue?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs tabular-nums text-label-secondary whitespace-nowrap">
                      LKR {p.totalCost?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-xs text-success-600 tabular-nums whitespace-nowrap">
                      LKR {p.grossProfit?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-center whitespace-nowrap">
                      <span className="badge badge-success">
                        {p.marginPercentage}%
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
