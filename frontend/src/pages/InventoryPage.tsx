import React, { useState, useEffect } from 'react';
import {
  Boxes,
  ArrowDownLeft,
  PlusCircle,
  AlertTriangle,
  History,
  Package,
  Layers,
  Scissors,
  Check,
  Search,
  Grid,
  Sparkles,
  X,
  Ruler,
  Info,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { StockMovement } from '../types';
import { useAuthStore } from '../stores/auth.store';
import { useToastStore } from '../stores/toast.store';
import {
  Drawer,
  Modal,
  PressButton,
  Skeleton,
  stagger,
  fadeUp,
} from '../lib/motion';
import {
  StatCard,
  CardHeader,
  SectionCard,
  PillTabs,
  PageHeader,
  EmptyState,
} from '../components/ui-pattern';
import type { FabricRoll as ClosetRoll } from '../features/catalogue/ClosetShowcase';
import { ReceiveFabricGRN, ReceivedRollItem } from '../components/inventory/ReceiveFabricGRN';

const ClosetShowcase = React.lazy(() => import('../features/catalogue/ClosetShowcase'));

export interface FabricRollItem {
  id: string;
  lot: string;
  type: string;
  colorName: string;
  colorHex: string;
  totalLength: number;
  remaining: number;
  widthInches: number;
  costPerMeter: number;
}

export interface InventoryPageProps {
  initialTab?: 'rolls' | 'grn' | 'balances' | 'ledger';
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ initialTab = 'rolls' }) => {
  const { user } = useAuthStore();
  const { push: pushToast } = useToastStore();

  const isManagement =
    user?.role?.toUpperCase() === 'OWNER' ||
    user?.role?.toUpperCase() === 'MANAGER' ||
    user?.role === 'Admin';

  const [activeTab, setActiveTab] = useState<'rolls' | 'grn' | 'balances' | 'ledger'>(initialTab);
  const [shelfViewMode, setShelfViewMode] = useState<'grid' | 'shelf'>('grid');
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [valuation, setValuation] = useState<any>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Drawer & Modals state
  const [selectedRoll, setSelectedRoll] = useState<FabricRollItem | null>(null);
  const [customCutMeters, setCustomCutMeters] = useState<number>(2.5);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Fabric rolls data
  const [rolls, setRolls] = useState<FabricRollItem[]>([
    {
      id: 'roll-1',
      lot: 'LOT-NAVY-01',
      type: 'Imperial Cotton Twill',
      colorName: 'Imperial Navy',
      colorHex: '#1e293b',
      totalLength: 50,
      remaining: 38.5,
      widthInches: 58,
      costPerMeter: 1250,
    },
    {
      id: 'roll-2',
      lot: 'LOT-SILK-02',
      type: 'Mulberry Raw Silk',
      colorName: 'Crimson Maroon',
      colorHex: '#881337',
      totalLength: 30,
      remaining: 12.0,
      widthInches: 44,
      costPerMeter: 3400,
    },
    {
      id: 'roll-3',
      lot: 'LOT-LINEN-03',
      type: 'Natural Organic Linen',
      colorName: 'Natural Ecru',
      colorHex: '#d7c4b7',
      totalLength: 60,
      remaining: 54.0,
      widthInches: 56,
      costPerMeter: 2100,
    },
    {
      id: 'roll-4',
      lot: 'LOT-POLY-04',
      type: 'Emerald Poly Weave',
      colorName: 'Forest Emerald',
      colorHex: '#064e3b',
      totalLength: 40,
      remaining: 4.5,
      widthInches: 60,
      costPerMeter: 950,
    },
    {
      id: 'roll-5',
      lot: 'LOT-MUST-05',
      type: 'Handloom Cotton',
      colorName: 'Mustard Spice',
      colorHex: '#d97706',
      totalLength: 45,
      remaining: 28.0,
      widthInches: 48,
      costPerMeter: 1650,
    },
    {
      id: 'roll-6',
      lot: 'LOT-ROSE-06',
      type: 'Chiffon Georgette',
      colorName: 'Dusty Rose',
      colorHex: '#e11d48',
      totalLength: 55,
      remaining: 19.5,
      widthInches: 52,
      costPerMeter: 1450,
    },
  ]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [mRes, bRes, vRes] = await Promise.all([
        api.get('/inventory/ledger?limit=50'),
        api.get('/inventory/balances'),
        api.get('/inventory/valuation'),
      ]);

      if (mRes.success) setMovements(mRes.data);
      if (bRes.success) setBalances(bRes.data);
      if (vRes.success) setValuation(vRes.data);
    } catch (err) {
      console.error('Failed to load inventory data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCutRoll = (rollId: string, cutMeters: number) => {
    if (cutMeters <= 0) return;

    setRolls((prev) =>
      prev.map((r) => {
        if (r.id === rollId) {
          const newRemaining = Math.max(0, Math.round((r.remaining - cutMeters) * 10) / 10);
          const updated = { ...r, remaining: newRemaining };
          if (selectedRoll?.id === rollId) {
            setSelectedRoll(updated);
          }
          return updated;
        }
        return r;
      })
    );

    pushToast(`Cut ${cutMeters}m from roll. New balance updated.`, 'ok');
  };

  // Filtered rolls
  const filteredRolls = rolls.filter(
    (r) =>
      !filterQuery ||
      r.lot.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.type.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.colorName.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // Filtered garment balances
  const filteredBalances = balances.filter(
    (b) =>
      !filterQuery ||
      b.variant?.product?.name?.toLowerCase().includes(filterQuery.toLowerCase()) ||
      b.variant?.sku?.toLowerCase().includes(filterQuery.toLowerCase()) ||
      b.variant?.color?.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // Stats calculation
  const totalRollMeters = Math.round(rolls.reduce((sum, r) => sum + r.remaining, 0));
  const totalCostValuation = rolls.reduce((sum, r) => sum + r.remaining * r.costPerMeter, 0);
  const lowRollsCount = rolls.filter((r) => r.remaining <= 10).length;

  const handleRollsReceived = (newRolls: ReceivedRollItem[]) => {
    const formatted: FabricRollItem[] = newRolls.map((r) => ({
      id: r.id,
      lot: r.lot,
      type: r.type,
      colorName: r.colorName,
      colorHex: r.colorHex,
      totalLength: r.totalLength,
      remaining: r.remaining,
      widthInches: r.widthInches,
      costPerMeter: r.costPerMeter,
    }));
    setRolls((prev) => [...formatted, ...prev]);
  };

  const tabs = [
    { id: 'rolls', label: 'Fabric Rolls & Shelf', icon: Scissors },
    { id: 'grn', label: 'Receive Fabric (GRN)', icon: ArrowDownLeft, badge: 'Intake' },
    { id: 'balances', label: 'Variant Stock Matrix', icon: Boxes },
    { id: 'ledger', label: 'Movement Audit Log', icon: History },
  ];

  // Convert rolls to ClosetRoll format for Shelf view
  const closetRolls: ClosetRoll[] = rolls.map((r) => ({
    id: r.id,
    name: r.type,
    color: r.colorHex,
    shadeLot: r.lot,
    fabricType: `${r.colorName} (${r.widthInches}")`,
    lengthMeters: r.remaining,
    inStock: r.remaining > 0,
  }));

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 pb-12">
      <div className="mx-auto max-w-[1360px] p-4 sm:p-6 space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Stock & Fabric Roll Ledger"
          subtitle="Real-time multi-branch fabric rolls, dye lots, cut balances, and variant matrix"
          icon={Boxes}
          right={
            <div className="flex items-center gap-2">
              <PressButton
                onClick={() => setActiveTab('grn')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Receive Fabric (GRN)</span>
              </PressButton>

              <PressButton
                onClick={() => setShowAdjustModal(true)}
                className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-slate-200 shadow-2xs"
              >
                <PlusCircle className="w-4 h-4 text-slate-500" />
                <span>Stock Adjustment</span>
              </PressButton>
            </div>
          }
        />

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Fabric Rolls"
            value={rolls.length}
            icon={Scissors}
            suffix=" Rolls"
            isHero={true}
          />

          <StatCard
            title="Available Roll Fabric"
            value={totalRollMeters}
            icon={Layers}
            suffix=" m"
          />

          {isManagement ? (
            <StatCard
              title="Roll Cost Valuation"
              value={totalCostValuation}
              icon={DollarSign}
              prefix="Rs "
            />
          ) : (
            <StatCard
              title="Total Matrix Units"
              value={valuation?.totalUnits || 1240}
              icon={Package}
              suffix=" pcs"
            />
          )}

          <StatCard
            title="Low Stock Rolls"
            value={lowRollsCount}
            icon={AlertTriangle}
            suffix=" Rolls"
            isPositive={lowRollsCount === 0}
            change={lowRollsCount > 0 ? 'Needs Reorder' : 'Healthy'}
          />
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PillTabs
            tabs={tabs}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as any)}
            layoutId="inventory-section-tabs"
            variant="dark"
          />

          {/* Sub-view toggle when on Fabric Rolls tab */}
          {activeTab === 'rolls' && (
            <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setShelfViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  shelfViewMode === 'grid'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Card Grid</span>
              </button>

              <button
                type="button"
                onClick={() => setShelfViewMode('shelf')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  shelfViewMode === 'shelf'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>3D Shelf View</span>
              </button>
            </div>
          )}
        </div>

        {/* -------------------- TAB 1: FABRIC ROLLS & SHELF -------------------- */}
        {activeTab === 'rolls' && (
          <div className="space-y-4">
            {shelfViewMode === 'shelf' ? (
              /* Shelf View: 3D interactive carousel */
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs font-semibold text-blue-900">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Swipe or use Left/Right arrow keys to spin the fabric rolls. Click any roll to open its cut ledger in Drawer.</span>
                  </span>
                  <button
                    onClick={() => setShelfViewMode('grid')}
                    className="font-bold underline hover:text-blue-700"
                  >
                    Switch to Grid View
                  </button>
                </div>

                <React.Suspense fallback={<Skeleton className="h-[400px] w-full rounded-3xl" />}>
                  <ClosetShowcase
                    initialMode="rolls"
                    customRolls={closetRolls}
                    onSelectProduct={(roll) => {
                      const matched = rolls.find((r) => r.id === roll.id);
                      if (matched) setSelectedRoll(matched);
                    }}
                  />
                </React.Suspense>
              </div>
            ) : (
              /* Card Grid View */
              <div className="space-y-4">
                {/* Search / Filter Row */}
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search roll by dye lot, fabric type, or colour..."
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                      className="w-full min-h-11 pl-10 pr-4 text-xs sm:text-sm font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {filteredRolls.length} Active Rolls
                  </span>
                </div>

                {filteredRolls.length === 0 ? (
                  <EmptyState
                    icon={Scissors}
                    title="No fabric rolls found"
                    description="No rolls matched your filter keywords. Try searching another dye lot or shade."
                    actionLabel="Clear Filter"
                    onAction={() => setFilterQuery('')}
                  />
                ) : (
                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {filteredRolls.map((roll) => {
                      const pct = Math.round((roll.remaining / roll.totalLength) * 100);
                      const isOutOfStock = roll.remaining <= 0;
                      const isLow = roll.remaining > 0 && roll.remaining <= 10;

                      return (
                        <motion.div
                          key={roll.id}
                          layout
                          variants={fadeUp}
                          whileHover={{ y: -4 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          onClick={() => setSelectedRoll(roll)}
                          className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-4"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              {/* Circular Colour Swatch */}
                              <span
                                className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200 shrink-0"
                                style={{ backgroundColor: roll.colorHex }}
                                title={roll.colorName}
                              />
                              <div>
                                <span className="font-mono text-xs font-bold text-blue-600 block">
                                  {roll.lot}
                                </span>
                                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight mt-0.5">
                                  {roll.type}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                  {roll.colorName} &bull; {roll.widthInches}&quot; width
                                </p>
                              </div>
                            </div>

                            {/* Status Chip */}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${
                                isOutOfStock
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : isLow
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {isOutOfStock ? 'Empty Roll' : isLow ? 'Low Stock' : 'In Stock'}
                            </span>
                          </div>

                          {/* Balance Progress Bar (Animates from 0 with whileInView) */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-500">Balance:</span>
                              <span className="font-extrabold text-slate-900 tabular-nums">
                                <span className="text-sm font-black text-emerald-600">
                                  {roll.remaining} m
                                </span>{' '}
                                <span className="text-slate-400 font-normal">/ {roll.totalLength} m</span>
                              </span>
                            </div>

                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${pct}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                className={`h-full rounded-full ${
                                  pct <= 15
                                    ? 'bg-red-500'
                                    : pct <= 35
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                              />
                            </div>

                            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                              <span>{pct}% remaining</span>
                              <span>Cut: {Math.round((roll.totalLength - roll.remaining) * 10) / 10} m</span>
                            </div>
                          </div>

                          {/* Action Footer */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:underline">
                              <span>View Roll Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCutRoll(roll.id, 2.5);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold transition-colors"
                              >
                                -2.5m
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCutRoll(roll.id, 5.0);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold transition-colors"
                              >
                                -5m
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        )}

        {/* -------------------- TAB: RECEIVE FABRIC (GRN) STEP CARDS FLOW -------------------- */}
        {activeTab === 'grn' && (
          <ReceiveFabricGRN
            onCancel={() => setActiveTab('rolls')}
            onSuccess={(newRolls) => {
              handleRollsReceived(newRolls);
            }}
          />
        )}

        {/* -------------------- TAB: VARIANT STOCK MATRIX -------------------- */}
        {activeTab === 'balances' && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter garment name, size, colour, or SKU..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full min-h-11 pl-10 pr-4 text-xs sm:text-sm font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
              </div>
              <span className="text-xs font-bold text-slate-500">
                {filteredBalances.length} Garments
              </span>
            </div>

            {filteredBalances.length === 0 ? (
              <EmptyState
                icon={Boxes}
                title="No garment variants found"
                description="Try searching by other keywords or clear filter."
                actionLabel="Reset Search"
                onAction={() => setFilterQuery('')}
              />
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredBalances.map((b) => {
                  const out = b.quantityOnHand === 0;
                  const low = b.quantityOnHand > 0 && b.quantityOnHand <= (b.variant?.reorderLevel || 5);
                  const colorHex = b.variant?.colorHex || '#1e293b';

                  return (
                    <motion.div
                      key={b.id}
                      layout
                      variants={fadeUp}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-7 h-7 rounded-full border border-slate-200 shadow-2xs shrink-0"
                            style={{ backgroundColor: colorHex }}
                          />
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm leading-tight">
                              {b.variant?.product?.name || 'Garment'}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                              {b.variant?.size} &bull; {b.variant?.color} &bull;{' '}
                              <span className="font-mono text-slate-400">{b.variant?.sku}</span>
                            </p>
                          </div>
                        </div>

                        {/* Status Chip */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                            out
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : low
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {out ? 'Out of Stock' : low ? 'Low Stock' : 'In Stock'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Selling Price</span>
                          <strong className="text-slate-900 font-bold tabular-nums">
                            Rs {b.variant?.sellingPrice?.toLocaleString()}
                          </strong>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[11px]">On Hand</span>
                          <strong className="text-base font-black text-blue-600 tabular-nums">
                            {b.quantityOnHand} pcs
                          </strong>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        )}

        {/* -------------------- TAB 3: STOCK AUDIT LEDGER -------------------- */}
        {activeTab === 'ledger' && (
          <SectionCard>
            <CardHeader
              icon={History}
              title="Stock Audit Movement Ledger"
              sub="Complete immutable trail of sales, supplier GRNs, roll cuts, and adjustments"
            />
            <div className="overflow-x-auto -mx-5 -mb-5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Timestamp</th>
                    <th className="py-3.5 px-4">Variant / SKU</th>
                    <th className="py-3.5 px-4">Movement Type</th>
                    <th className="py-3.5 px-4 text-center">Change</th>
                    <th className="py-3.5 px-4 text-center">Snapshot</th>
                    <th className="py-3.5 px-4">Reference</th>
                    <th className="py-3.5 px-5 text-right">Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <Skeleton className="h-8 w-64 mx-auto rounded-lg" />
                      </td>
                    </tr>
                  ) : movements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                        No stock movements recorded yet.
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => {
                      const isPositive = m.quantityChange > 0;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-5 text-slate-500 font-mono">
                            {new Date(m.createdAt).toLocaleDateString('en-GB')}{' '}
                            <span className="text-slate-400">
                              {new Date(m.createdAt).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">
                              {m.variant?.product?.name || 'Garment'}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {m.variant?.size} / {m.variant?.color} &bull;{' '}
                              <span className="font-mono text-slate-400">{m.variant?.sku}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                m.movementType === 'SALE'
                                  ? 'bg-blue-100 text-blue-700'
                                  : m.movementType === 'PURCHASE_RECEIPT'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {m.movementType?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-extrabold text-sm tabular-nums">
                            <span className={isPositive ? 'text-emerald-600' : 'text-red-600'}>
                              {isPositive ? `+${m.quantityChange}` : m.quantityChange}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                            {m.previousQuantity} &rarr;{' '}
                            <strong className="text-slate-900">{m.newQuantity}</strong>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {m.referenceId || m.notes || 'Routine entry'}
                          </td>
                          <td className="py-3.5 px-5 text-right font-semibold text-slate-700">
                            {m.createdByUser?.name || 'Staff User'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
      </div>

      {/* -------------------- ROLL DETAILS DRAWER -------------------- */}
      <Drawer
        open={Boolean(selectedRoll)}
        onClose={() => setSelectedRoll(null)}
        side="right"
      >
        {selectedRoll && (
          <div className="space-y-6">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span
                  className="w-12 h-12 rounded-2xl border-2 border-white shadow-md ring-2 ring-slate-200 shrink-0"
                  style={{ backgroundColor: selectedRoll.colorHex }}
                />
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600 block">
                    {selectedRoll.lot}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {selectedRoll.type}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedRoll.colorName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRoll(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Roll Specification Table */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Fabric Width:</span>
                <span className="font-bold text-slate-900">{selectedRoll.widthInches}&quot; (Inches)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Initial Roll Length:</span>
                <span className="font-bold text-slate-900">{selectedRoll.totalLength} meters</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Current Balance:</span>
                <span className="font-black text-emerald-600 text-sm">
                  {selectedRoll.remaining} meters
                </span>
              </div>
              {isManagement && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Cost per Meter:</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    Rs {selectedRoll.costPerMeter.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Cut Length Balance Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline text-xs">
                <span className="font-bold text-slate-700">Remaining Balance Progress</span>
                <span className="text-xs font-black text-slate-900 tabular-nums">
                  {Math.round((selectedRoll.remaining / selectedRoll.totalLength) * 100)}%
                </span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.round((selectedRoll.remaining / selectedRoll.totalLength) * 100)}%`,
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    selectedRoll.remaining <= 10
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>
            </div>

            {/* Quick Cut Fabric Actions */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Record Roll Cut (Meters)
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[1.0, 2.5, 5.0, 10.0].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleCutRoll(selectedRoll.id, m)}
                    className="py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
                  >
                    -{m} m
                  </button>
                ))}
              </div>

              {/* Custom cut input */}
              <div className="flex gap-2 pt-1">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max={selectedRoll.remaining}
                    value={customCutMeters || ''}
                    onChange={(e) => setCustomCutMeters(parseFloat(e.target.value) || 0)}
                    placeholder="Custom cut length"
                    className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    meters
                  </span>
                </div>
                <PressButton
                  onClick={() => handleCutRoll(selectedRoll.id, customCutMeters)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4"
                >
                  <Scissors className="w-3.5 h-3.5 mr-1" />
                  <span>Cut</span>
                </PressButton>
              </div>
            </div>

            {/* Roll Actions */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => setSelectedRoll(null)}
                className="w-full min-h-12 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* -------------------- RECEIVE GOODS MODAL (GRN) -------------------- */}
      {showReceiveModal && (
        <Modal
          open={showReceiveModal}
          onClose={() => setShowReceiveModal(false)}
          title="Receive Goods into Warehouse (GRN)"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const vid = (form.elements.namedItem('variantSelect') as HTMLSelectElement).value;
              const qty = parseInt((form.elements.namedItem('recvQty') as HTMLInputElement).value) || 10;
              const cost = parseFloat((form.elements.namedItem('recvCost') as HTMLInputElement).value) || 2500;

              try {
                const res = await api.post('/inventory/receive', {
                  items: [{ variantId: vid, quantity: qty, costPerUnit: cost }],
                  reference: 'GRN-' + Date.now().toString().slice(-4),
                });
                if (res.success) {
                  pushToast(`Received ${qty} pcs into stock (GRN)`, 'ok');
                  setShowReceiveModal(false);
                  fetchData();
                }
              } catch (err: any) {
                pushToast(err.message || 'Receiving failed', 'error');
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Select Garment Variant *</label>
              <select
                name="variantSelect"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {balances.map((b) => (
                  <option key={b.id} value={b.variant?.id || b.id}>
                    {b.variant?.product?.name} ({b.variant?.size}/{b.variant?.color}) - {b.variant?.sku}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Quantity (pcs) *</label>
                <input
                  name="recvQty"
                  type="number"
                  min={1}
                  defaultValue={10}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Unit Cost (Rs) *</label>
                <input
                  name="recvCost"
                  type="number"
                  min={0}
                  defaultValue={2500}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReceiveModal(false)}
                className="flex-1 min-h-12 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <PressButton
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md text-xs font-bold flex items-center justify-center"
              >
                Confirm Receipt
              </PressButton>
            </div>
          </form>
        </Modal>
      )}

      {/* -------------------- STOCK ADJUSTMENT MODAL -------------------- */}
      {showAdjustModal && (
        <Modal
          open={showAdjustModal}
          onClose={() => setShowAdjustModal(false)}
          title="Stock Adjustment (Damage / Correction)"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const vid = (form.elements.namedItem('adjVariant') as HTMLSelectElement).value;
              const qty = parseInt((form.elements.namedItem('adjQty') as HTMLInputElement).value) || -1;
              const reason = (form.elements.namedItem('adjReason') as HTMLInputElement).value;

              try {
                const res = await api.post('/inventory/adjust', {
                  variantId: vid,
                  quantityChange: qty,
                  reason,
                });
                if (res.success) {
                  pushToast('Stock adjustment recorded successfully', 'ok');
                  setShowAdjustModal(false);
                  fetchData();
                }
              } catch (err: any) {
                pushToast(err.message || 'Adjustment failed', 'error');
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Select Variant</label>
              <select
                name="adjVariant"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {balances.map((b) => (
                  <option key={b.id} value={b.variant?.id || b.id}>
                    {b.variant?.product?.name} ({b.variant?.size}/{b.variant?.color})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Quantity Change (+ or -) *</label>
              <input
                name="adjQty"
                type="number"
                defaultValue={-1}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Reason / Notes</label>
              <input
                name="adjReason"
                type="text"
                placeholder="e.g. Fabric defect / dye stain"
                defaultValue="Fabric stain found during inspection"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="flex-1 min-h-12 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <PressButton
                type="submit"
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white shadow-md text-xs font-bold flex items-center justify-center"
              >
                Save Adjustment
              </PressButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default InventoryPage;
