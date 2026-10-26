import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Filter,
  AlertTriangle,
  Scissors,
  Shirt,
  Sparkles,
  ShieldCheck,
  Package,
  Clock,
  Printer,
  CheckCircle2,
  Calendar,
  UserCheck,
  Activity,
  BarChart3,
  Search,
  X,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StageBoard,
  Batch,
  Drawer,
  Modal,
  PressButton,
  AnimatedList,
  AnimatedRow,
} from '../lib/motion';
import {
  StatCard,
  CardHeader,
  PillTabs,
  ProgressBar,
  PageHeader,
  EmptyState,
} from '../components/ui-pattern';
import { useToastStore } from '../stores/toast.store';
import { ProductionBatch } from '../types';

const PRODUCTION_STAGES = [
  'Pattern & Cutting',
  'Sewing & Stitching',
  'Finishing & Ironing',
  'Quality Check (QC)',
  'Packing & Dispatch',
];

const INITIAL_PRODUCTION_BATCHES: ProductionBatch[] = [
  {
    id: 'b1',
    batchCode: 'BAT-2026-081',
    style: 'Island Breeze Pure Linen Shirt (Navy)',
    category: "Men's Wear",
    qty: 150,
    due: 'Oct 28',
    stage: 0, // Pattern & Cutting
    priority: 'NORMAL',
    lineOperator: 'Cutting Table #1 (K. Bandara)',
    fabricRoll: 'Roll #ROL-402 — Natural Navy Linen 60s',
    yardageAllocated: 225,
    sizeBreakdown: { S: 30, M: 60, L: 40, XL: 20 },
    notes: 'Laser marker pattern calibrated for minimal collar shrinkage.',
    startedAt: '2026-10-24',
  },
  {
    id: 'b2',
    batchCode: 'BAT-2026-079',
    style: 'Mulberry Silk Saree Blouse (Maroon)',
    category: 'Sarees & Ethnic',
    qty: 45,
    due: 'Oct 26',
    stage: 1, // Sewing & Stitching
    late: true,
    priority: 'URGENT',
    lineOperator: 'Artisan Stitching Unit #3 (F. Zahra)',
    fabricRoll: 'Roll #ROL-318 — Raw Mulberry Silk (Maroon)',
    yardageAllocated: 70,
    sizeBreakdown: { S: 10, M: 20, L: 15, XL: 0 },
    notes: 'Intricate piping along neck border. Expedited for Colombo wedding party.',
    startedAt: '2026-10-22',
  },
  {
    id: 'b3',
    batchCode: 'BAT-2026-082',
    style: 'Artisan Cotton Kurta (Indigo Chambray)',
    category: "Men's Wear",
    qty: 80,
    due: 'Oct 30',
    stage: 1, // Sewing & Stitching
    priority: 'NORMAL',
    lineOperator: 'Sewing Line #2 (M. Gunawardena)',
    fabricRoll: 'Roll #ROL-290 — Handwoven Combed Cotton',
    yardageAllocated: 140,
    sizeBreakdown: { S: 15, M: 35, L: 20, XL: 10 },
    notes: 'Pre-treated slub cotton with wooden coconut button plackets.',
    startedAt: '2026-10-23',
  },
  {
    id: 'b4',
    batchCode: 'BAT-2026-077',
    style: 'Floral Chiffon Tiered Maxi Gown',
    category: "Women's Wear",
    qty: 110,
    due: 'Nov 02',
    stage: 2, // Finishing & Ironing
    priority: 'NORMAL',
    lineOperator: 'Pressing & Steam Station #1 (T. Perera)',
    fabricRoll: 'Roll #ROL-501 — Blush Pink Chiffon Print',
    yardageAllocated: 330,
    sizeBreakdown: { S: 25, M: 45, L: 30, XL: 10 },
    notes: 'Delicate steam finishing. Flute sleeves hand-pressed.',
    startedAt: '2026-10-21',
  },
  {
    id: 'b5',
    batchCode: 'BAT-2026-075',
    style: 'Embroidered Tunic Kurti (Coral)',
    category: "Women's Wear",
    qty: 60,
    due: 'Oct 25',
    stage: 3, // Quality Assurance (QC)
    late: true,
    priority: 'EXPEDITE',
    lineOperator: 'Senior QC Inspector (N. Wickramasinghe)',
    fabricRoll: 'Roll #ROL-412 — Combed Cotton Slub',
    yardageAllocated: 95,
    sizeBreakdown: { S: 15, M: 25, L: 15, XL: 5 },
    notes: 'Yoke mirror embroidery thread tension verification required.',
    startedAt: '2026-10-20',
  },
  {
    id: 'b6',
    batchCode: 'BAT-2026-074',
    style: 'Luxe Formal Tailored Trouser (Black)',
    category: "Men's Wear",
    qty: 200,
    due: 'Nov 05',
    stage: 4, // Packing & Dispatch
    priority: 'NORMAL',
    lineOperator: 'Packaging & Barcode Line #1 (K. Jayawardena)',
    fabricRoll: 'Roll #ROL-188 — Italian Poly-Viscose Blend',
    yardageAllocated: 280,
    sizeBreakdown: { S: 30, M: 80, L: 60, XL: 30 },
    notes: 'Passed all 12 QC checkpoints. Boxed with retail barcoded hangers for Flagship Colombo.',
    startedAt: '2026-10-19',
  },
];

export const ProductionPage: React.FC = () => {
  const { push: pushToast } = useToastStore();
  const [batches, setBatches] = useState<ProductionBatch[]>(INITIAL_PRODUCTION_BATCHES);
  const [activeTab, setActiveTab] = useState<'board' | 'requisitions' | 'metrics'>('board');

  // Filters
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'late' | 'ready'>('all');

  // Drawer & Modal States
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Batch Form State
  const [newStyle, setNewStyle] = useState('Classic Linen Mandarin Collar Shirt');
  const [newCategory, setNewCategory] = useState("Men's Wear");
  const [newQty, setNewQty] = useState('100');
  const [newDue, setNewDue] = useState('Nov 12');
  const [newPriority, setNewPriority] = useState<'NORMAL' | 'EXPEDITE' | 'URGENT'>('NORMAL');
  const [newLineOperator, setNewLineOperator] = useState('Cutting Table #2 (R. Silva)');
  const [newFabricRoll, setNewFabricRoll] = useState('Roll #ROL-430 — Organic White Linen');
  const [newYardage, setNewYardage] = useState('180');
  const [newNotes, setNewNotes] = useState('Avurudu seasonal pre-cut run');

  // Sizing Breakdown
  const [sizeS, setSizeS] = useState('20');
  const [sizeM, setSizeM] = useState('40');
  const [sizeL, setSizeL] = useState('30');
  const [sizeXL, setSizeXL] = useState('10');

  // Handlers for Stage Movement
  const handleMoveBatch = (id: string, nextStage: number) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, stage: nextStage } : b))
    );

    const targetBatch = batches.find((b) => b.id === id);
    const targetStageName = PRODUCTION_STAGES[nextStage] || 'Next Stage';
    pushToast(
      `Moved "${targetBatch?.style || 'Batch'}" to ${targetStageName}`,
      nextStage === PRODUCTION_STAGES.length - 1 ? 'ok' : 'info'
    );
  };

  const handleMoveBackward = (id: string, prevStage: number) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, stage: prevStage } : b))
    );

    const targetBatch = batches.find((b) => b.id === id);
    const prevStageName = PRODUCTION_STAGES[prevStage] || 'Previous Stage';
    pushToast(
      `Returned "${targetBatch?.style || 'Batch'}" to ${prevStageName} for rework`,
      'warn'
    );
  };

  const handleInspectBatch = (batch: Batch) => {
    const fullBatch = batches.find((b) => b.id === batch.id) || (batch as ProductionBatch);
    setSelectedBatch(fullBatch);
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(newQty) || 50;
    const yardage = Number(newYardage) || 100;

    const newBatchItem: ProductionBatch = {
      id: `b-${Date.now()}`,
      batchCode: `BAT-2026-${Math.floor(100 + Math.random() * 900)}`,
      style: newStyle,
      category: newCategory,
      qty,
      due: newDue,
      stage: 0, // Starts at Pattern & Cutting
      priority: newPriority,
      lineOperator: newLineOperator,
      fabricRoll: newFabricRoll,
      yardageAllocated: yardage,
      sizeBreakdown: {
        S: Number(sizeS) || 0,
        M: Number(sizeM) || 0,
        L: Number(sizeL) || 0,
        XL: Number(sizeXL) || 0,
      },
      notes: newNotes,
      startedAt: new Date().toISOString().split('T')[0],
    };

    setBatches((prev) => [newBatchItem, ...prev]);
    pushToast(`Created Job Ticket ${newBatchItem.batchCode}`, 'ok');
    setShowCreateModal(false);
  };

  // Metrics Calculations
  const totalPcs = batches.reduce((acc, b) => acc + b.qty, 0);
  const lateCount = batches.filter((b) => b.late).length;
  const urgentCount = batches.filter((b) => b.priority === 'URGENT' || b.priority === 'EXPEDITE').length;
  const readyPcs = batches
    .filter((b) => b.stage === PRODUCTION_STAGES.length - 1)
    .reduce((acc, b) => acc + b.qty, 0);
  const totalYardage = batches.reduce((acc, b) => acc + (b.yardageAllocated || 0), 0);

  // Filtered Batches
  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.style.toLowerCase().includes(search.toLowerCase()) ||
      b.batchCode.toLowerCase().includes(search.toLowerCase()) ||
      (b.lineOperator && b.lineOperator.toLowerCase().includes(search.toLowerCase())) ||
      (b.fabricRoll && b.fabricRoll.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (priorityFilter === 'urgent') return b.priority === 'URGENT' || b.priority === 'EXPEDITE';
    if (priorityFilter === 'late') return b.late === true;
    if (priorityFilter === 'ready') return b.stage === PRODUCTION_STAGES.length - 1;

    return true;
  });

  const tabs = [
    { id: 'board', label: 'Production Stage Board', icon: Layers, badge: `${batches.length} Batches` },
    { id: 'requisitions', label: 'Batch Requisitions & Fabric Cuts', icon: Scissors, badge: `${totalYardage} Yds Cut` },
    { id: 'metrics', label: 'Floor Efficiency & QA Metrics', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 pb-12">
      <div className="mx-auto max-w-[1400px] p-4 sm:p-6 space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Garment Production Floor & Stage Board"
          subtitle="Real-time batch routing, cutting table allocation, line throughput, and quality control"
          icon={Layers}
          right={
            <div className="flex items-center gap-2">
              <PressButton
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>New Batch Order</span>
              </PressButton>

              <PressButton
                onClick={() => {
                  window.print();
                  pushToast('Printing floor production schedule', 'ok');
                }}
                className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-slate-200 shadow-2xs"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Job Cards</span>
              </PressButton>
            </div>
          }
        />

        {/* 4 Stat Cards on Top */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total In-Production Units"
            value={totalPcs}
            suffix=" Pieces"
            icon={Layers}
            isHero={true}
            change={`${batches.length} Active Floor Batches`}
          />

          <StatCard
            title="Urgent / At-Risk Batches"
            value={lateCount + urgentCount}
            suffix=" Batches"
            icon={AlertTriangle}
            isPositive={false}
            change="Requires Line Expediting"
          />

          <StatCard
            title="QA First-Pass Inspection Rate"
            value={98.4}
            suffix="%"
            icon={CheckCircle2}
            isPositive={true}
            change="Floor Defect Standard Met"
          />

          <StatCard
            title="Completed & Ready for Store"
            value={readyPcs}
            suffix=" Finished"
            icon={Package}
            isPositive={true}
            change="Flagship Colombo 03 Allocation"
          />
        </div>

        {/* Segmented Pill Tabs Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PillTabs
            tabs={tabs}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as any)}
            layoutId="production-section-tabs"
            variant="dark"
          />

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search style, batch code, roll..."
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

        {/* ==================== TAB 1: PRODUCTION STAGE BOARD (KANBAN) ==================== */}
        {activeTab === 'board' && (
          <div className="space-y-4">
            {/* Quick Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider pl-1">
                Filter:
              </span>
              {(['all', 'urgent', 'late', 'ready'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setPriorityFilter(filterKey)}
                  className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                    priorityFilter === filterKey
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {filterKey === 'all' && `All Batches (${batches.length})`}
                  {filterKey === 'urgent' && `Urgent / Expedited (${urgentCount})`}
                  {filterKey === 'late' && `Overdue Deadline (${lateCount})`}
                  {filterKey === 'ready' && `Ready for Packing (${batches.filter((b) => b.stage === PRODUCTION_STAGES.length - 1).length})`}
                </button>
              ))}
            </div>

            {/* StageBoard Kanban Component */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <StageBoard
                stages={PRODUCTION_STAGES}
                batches={filteredBatches}
                onMove={handleMoveBatch}
                onMoveBackward={handleMoveBackward}
                onInspect={handleInspectBatch}
              />
            </div>
          </div>
        )}

        {/* ==================== TAB 2: BATCH REQUISITIONS & FABRIC CUTS ==================== */}
        {activeTab === 'requisitions' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardHeader
                  icon={Scissors}
                  title="Fabric Allocation & Job Requisition Master"
                  subtitle="Detailed roll usage, cutting table breakdown, and size distribution matrices"
                />

                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  Total Allocated: <strong className="text-slate-900">{totalYardage} Yards</strong>
                </span>
              </div>

              {/* Batches Table View */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Batch Code</th>
                      <th className="py-3 px-4">Garment Style</th>
                      <th className="py-3 px-4">Fabric Roll Allocation</th>
                      <th className="py-3 px-4 text-center">Sizing Breakdown</th>
                      <th className="py-3 px-4 text-right">Units</th>
                      <th className="py-3 px-4 text-center">Current Stage</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batches.map((b) => {
                      const isReady = b.stage === PRODUCTION_STAGES.length - 1;
                      const progressPct = Math.round(((b.stage + 1) / PRODUCTION_STAGES.length) * 100);

                      return (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            {b.batchCode}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div>
                              <span>{b.style}</span>
                              <span className="block text-[11px] font-normal text-slate-500">
                                {b.category} • Due: {b.due}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            <div>
                              <span>{b.fabricRoll}</span>
                              <span className="block text-[11px] font-bold text-blue-600">
                                {b.yardageAllocated} Yards Allocated
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-2.5 py-1 rounded-lg">
                              <span>S:{b.sizeBreakdown.S}</span>
                              <span className="text-slate-400">|</span>
                              <span>M:{b.sizeBreakdown.M}</span>
                              <span className="text-slate-400">|</span>
                              <span>L:{b.sizeBreakdown.L}</span>
                              <span className="text-slate-400">|</span>
                              <span>XL:{b.sizeBreakdown.XL}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-slate-900 font-mono">
                            {b.qty} pcs
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                isReady
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : b.late
                                  ? 'bg-red-100 text-red-700 border-red-200'
                                  : 'bg-blue-100 text-blue-800 border-blue-200'
                              }`}
                            >
                              {PRODUCTION_STAGES[b.stage]} ({progressPct}%)
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedBatch(b)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
                            >
                              Job Ticket
                            </button>
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

        {/* ==================== TAB 3: LINE EFFICIENCY & QA METRICS ==================== */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* QA Yield Card */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-6">
                <CardHeader
                  icon={ShieldCheck}
                  title="Floor Quality Assurance & Yield Breakdown"
                  subtitle="Inspection performance, stitch consistency, and defect rate monitoring"
                />

                {/* First Pass Yield Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span>First-Pass Inspection Pass Rate</span>
                    </span>
                    <span className="text-emerald-700 font-mono font-bold">
                      98.4% (Target: 98.0%)
                    </span>
                  </div>
                  <ProgressBar pct={98.4} color="#10b981" height="h-3" />
                  <p className="text-xs text-slate-500">
                    Calculated over 645 garments across cutting, sewing, and seam tension inspection stations.
                  </p>
                </div>

                {/* Fabric Scrap / Wastage Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>Marker Pattern Fabric Scrap Ratio</span>
                    </span>
                    <span className="text-blue-700 font-mono font-bold">
                      1.6% Wastage (Industry: 3.5%)
                    </span>
                  </div>
                  <ProgressBar pct={16} color="#3b82f6" height="h-3" />
                  <p className="text-xs text-slate-500">
                    Digital computer-aided markers on natural linen rolls achieved 98.4% fabric utilization.
                  </p>
                </div>

                {/* Minor Rework Tier */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <span>Minor Floor Rework (Hem / Button Alignment)</span>
                    </span>
                    <span className="text-amber-700 font-mono font-bold">
                      1.2% Rework
                    </span>
                  </div>
                  <ProgressBar pct={12} color="#f59e0b" height="h-3" />
                  <p className="text-xs text-slate-500">
                    Returned to sewing stations under supervised 24-hour corrective loop.
                  </p>
                </div>
              </div>

              {/* Station Productivity Summary */}
              <div className="space-y-4">
                <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Line Productivity
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                      Optimal Velocity
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400">Cycle Time per Finished Garment</span>
                    <p className="text-3xl font-black text-white">
                      24.5 mins
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Includes laser cutting, seam stitching, steam pressing, and retail tagging.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1.5">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-[#c6f432]" />
                      <span>Operator Line Oversight</span>
                    </p>
                    <p>
                      Supervised by Senior Floor Manager with live batch handover verification between Cutting and Sewing units.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 font-medium space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ISO Quality Compliance</span>
                  </span>
                  <p>
                    100% of finished garments pass pull-strength testing and double-needle hem standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== BATCH JOB TICKET DRAWER ==================== */}
      <Drawer
        open={Boolean(selectedBatch)}
        onClose={() => setSelectedBatch(null)}
        side="right"
      >
        {selectedBatch && (
          <div className="space-y-6">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider inline-block mb-1.5">
                Production Job Ticket
              </span>
              <h2 className="text-2xl font-black text-slate-900">{selectedBatch.style}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                  {selectedBatch.batchCode}
                </span>
                <span className="text-xs text-slate-500">• {selectedBatch.category}</span>
              </div>
            </div>

            {/* Total Units & Stage Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-3 border border-slate-800">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                Batch Run Size
              </span>
              <div className="text-3xl font-black text-white tabular-nums">
                {selectedBatch.qty.toLocaleString()} Pieces
              </div>
              <div className="text-xs text-slate-300 pt-2 border-t border-slate-800/80 flex justify-between items-center">
                <span>Target Due: {selectedBatch.due}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                  {PRODUCTION_STAGES[selectedBatch.stage]}
                </span>
              </div>
            </div>

            {/* Sizing Breakdown Matrix */}
            <div className="space-y-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Size Distribution Ratio</span>
                <Shirt className="w-4 h-4 text-slate-400" />
              </h3>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Size S</span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {selectedBatch.sizeBreakdown.S}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Size M</span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {selectedBatch.sizeBreakdown.M}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Size L</span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {selectedBatch.sizeBreakdown.L}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Size XL</span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {selectedBatch.sizeBreakdown.XL}
                  </span>
                </div>
              </div>
            </div>

            {/* Fabric Roll Allocation Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                Fabric Yardage & Allocation
              </span>
              <p className="font-bold text-slate-900">{selectedBatch.fabricRoll}</p>
              <p className="text-slate-600">
                Allocated Yardage:{' '}
                <strong className="text-blue-600">{selectedBatch.yardageAllocated} Yards</strong>
              </p>
              {selectedBatch.notes && (
                <p className="text-slate-500 pt-1 border-t border-slate-200 italic">
                  "{selectedBatch.notes}"
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                  pushToast('Printing job card ticket PDF', 'ok');
                }}
                className="w-full min-h-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Job Ticket PDF</span>
              </button>

              {selectedBatch.stage < PRODUCTION_STAGES.length - 1 && (
                <PressButton
                  type="button"
                  onClick={() => {
                    handleMoveBatch(selectedBatch.id, selectedBatch.stage + 1);
                    setSelectedBatch({ ...selectedBatch, stage: selectedBatch.stage + 1 });
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white min-h-12 px-6 text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
                >
                  <span>Advance to {PRODUCTION_STAGES[selectedBatch.stage + 1]}</span>
                  <ArrowRight className="w-4 h-4" />
                </PressButton>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* ==================== CREATE NEW BATCH ORDER MODAL ==================== */}
      {showCreateModal && (
        <Modal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Garment Production Batch"
        >
          <form onSubmit={handleCreateBatch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Garment Style & Design *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pure Linen Casual Shirt (Sky Blue)"
                value={newStyle}
                onChange={(e) => setNewStyle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Men's Wear">Men's Wear</option>
                  <option value="Women's Wear">Women's Wear</option>
                  <option value="Sarees & Ethnic">Sarees & Ethnic</option>
                  <option value="Kids' Wear">Kids' Wear</option>
                  <option value="Modest Fashion">Modest Fashion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Due Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nov 15"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Total Quantity (Pcs) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Floor Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="NORMAL">Normal Priority</option>
                  <option value="EXPEDITE">Expedited Run</option>
                  <option value="URGENT">Urgent (Express)</option>
                </select>
              </div>
            </div>

            {/* Sizing Breakdown Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Size Breakdown (Pcs)
              </label>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">S</span>
                  <input
                    type="number"
                    value={sizeS}
                    onChange={(e) => setSizeS(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">M</span>
                  <input
                    type="number"
                    value={sizeM}
                    onChange={(e) => setSizeM(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">L</span>
                  <input
                    type="number"
                    value={sizeL}
                    onChange={(e) => setSizeL(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">XL</span>
                  <input
                    type="number"
                    value={sizeXL}
                    onChange={(e) => setSizeXL(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-center"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Fabric Roll Allocation
                </label>
                <input
                  type="text"
                  placeholder="Roll #ROL-430 — Organic Linen"
                  value={newFabricRoll}
                  onChange={(e) => setNewFabricRoll(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Yardage Required (Yds)
                </label>
                <input
                  type="number"
                  value={newYardage}
                  onChange={(e) => setNewYardage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Floor Station / Tailor
              </label>
              <input
                type="text"
                placeholder="Cutting Table #2 (R. Silva)"
                value={newLineOperator}
                onChange={(e) => setNewLineOperator(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cutting & Tailoring Notes
              </label>
              <textarea
                rows={2}
                placeholder="Marker specifications, seam allowance, or buttons..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <PressButton
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
              >
                Launch Batch Order
              </PressButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
