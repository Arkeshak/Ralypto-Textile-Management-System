import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  FileText,
  Scissors,
  CheckCircle2,
  Plus,
  Trash2,
  Barcode,
  Calendar,
  Building2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Layers,
  AlertCircle,
  Hash,
  Eye,
  Percent,
} from 'lucide-react';
import {
  AnimatedList,
  AnimatedRow,
  PressButton,
  spring,
  softSpring,
  fadeUp,
} from '../../lib/motion';
import {
  SectionCard,
  CardHeader,
  ProgressBar,
  StatCard,
} from '../ui-pattern';
import { DEMO_SUPPLIERS } from '../../data/mockData';
import { useToastStore } from '../../stores/toast.store';

export interface ReceivedRollItem {
  id: string;
  lot: string;
  type: string;
  colorName: string;
  colorHex: string;
  totalLength: number;
  remaining: number;
  widthInches: number;
  costPerMeter: number;
  barcode: string;
}

interface ReceiveFabricGRNProps {
  onCancel?: () => void;
  onSuccess?: (receivedRolls: ReceivedRollItem[]) => void;
}

const PRESET_FABRICS = [
  'Pure European Linen (60s)',
  'Mulberry Raw Silk',
  'Imperial Cotton Twill',
  'Georgette Chiffon',
  'Artisanal Handloom Cotton',
  'Rayon Twill Yardage',
  'Ceylon Hand-Waxed Batik',
  'Royal Stretch Poplin',
];

const PRESET_COLORS = [
  { name: 'Imperial Navy', hex: '#1e293b' },
  { name: 'Crimson Maroon', hex: '#881337' },
  { name: 'Natural Ecru', hex: '#d7c4b7' },
  { name: 'Emerald Green', hex: '#047857' },
  { name: 'Golden Mustard', hex: '#d97706' },
  { name: 'Sky Blue', hex: '#0284c7' },
  { name: 'Royal Violet', hex: '#6b21a8' },
  { name: 'Blush Pink', hex: '#db2777' },
];

export const ReceiveFabricGRN: React.FC<ReceiveFabricGRNProps> = ({
  onCancel,
  onSuccess,
}) => {
  const { push: pushToast } = useToastStore();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Supplier & Delivery Document
  const [selectedSupplierId, setSelectedSupplierId] = useState(DEMO_SUPPLIERS[0]?.id || 'sup-1');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-RW-${Math.floor(1000 + Math.random() * 9000)}`);
  const [grnReference] = useState(`GRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [receivingBranch, setReceivingBranch] = useState('Flagship Boutique — Colombo 03');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [carrierVehicle, setCarrierVehicle] = useState('WP CB-4892 (Express Logistics)');
  const [supplierNotes, setSupplierNotes] = useState('Delivered via covered container. Inspected at loading bay.');

  // Step 2: Intake Rolls
  const [intakeRolls, setIntakeRolls] = useState<ReceivedRollItem[]>([
    {
      id: `roll-grn-${Date.now()}-1`,
      lot: 'LOT-LIN-402',
      type: 'Pure European Linen (60s)',
      colorName: 'Natural Ecru',
      colorHex: '#d7c4b7',
      totalLength: 60,
      remaining: 60,
      widthInches: 58,
      costPerMeter: 1650,
      barcode: `794000${Math.floor(800 + Math.random() * 100)}`,
    },
    {
      id: `roll-grn-${Date.now()}-2`,
      lot: 'LOT-SLK-109',
      type: 'Mulberry Raw Silk',
      colorName: 'Crimson Maroon',
      colorHex: '#881337',
      totalLength: 45,
      remaining: 45,
      widthInches: 44,
      costPerMeter: 3400,
      barcode: `794000${Math.floor(800 + Math.random() * 100)}`,
    },
  ]);

  // Form state for adding new roll
  const [newFabricType, setNewFabricType] = useState(PRESET_FABRICS[0]);
  const [newLotNumber, setNewLotNumber] = useState(`LOT-COL-${Math.floor(100 + Math.random() * 900)}`);
  const [newWidth, setNewWidth] = useState(58);
  const [newLength, setNewLength] = useState(50);
  const [newCost, setNewCost] = useState(1450);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  // Step 3: Quality Check
  const [weaveDensityPassed, setWeaveDensityPassed] = useState(true);
  const [shadeConsistencyPassed, setShadeConsistencyPassed] = useState(true);
  const [defectFreePassed, setDefectFreePassed] = useState(true);
  const [gsmVerified, setGsmVerified] = useState(true);
  const [inspectionPassRate, setInspectionPassRate] = useState(100);
  const [inspectorName, setInspectorName] = useState('Kasun Perera (Inventory Specialist)');

  // Step 4: Final Confirmation & Success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Supplier lookup
  const selectedSupplier = DEMO_SUPPLIERS.find((s) => s.id === selectedSupplierId) || DEMO_SUPPLIERS[0];

  // Calculated totals
  const totalMeters = intakeRolls.reduce((sum, r) => sum + r.totalLength, 0);
  const totalCostValue = intakeRolls.reduce((sum, r) => sum + r.totalLength * r.costPerMeter, 0);

  const handleAddRoll = () => {
    if (newLength <= 0 || newCost <= 0) {
      pushToast('Length and cost must be greater than zero', 'warn');
      return;
    }

    const newRoll: ReceivedRollItem = {
      id: `roll-grn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      lot: newLotNumber.trim() || `LOT-GEN-${Math.floor(100 + Math.random() * 900)}`,
      type: newFabricType,
      colorName: selectedColor.name,
      colorHex: selectedColor.hex,
      totalLength: newLength,
      remaining: newLength,
      widthInches: newWidth,
      costPerMeter: newCost,
      barcode: `794000${Math.floor(800 + Math.random() * 100)}`,
    };

    setIntakeRolls((prev) => [newRoll, ...prev]);
    pushToast(`Added ${newRoll.type} (${newRoll.totalLength}m) to intake list`, 'ok');

    // Generate fresh lot for next entry
    setNewLotNumber(`LOT-COL-${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleRemoveRoll = (id: string) => {
    setIntakeRolls((prev) => prev.filter((r) => r.id !== id));
    pushToast('Roll removed from intake list', 'info');
  };

  const handleConfirmGRN = async () => {
    if (intakeRolls.length === 0) {
      pushToast('Cannot submit GRN without any fabric rolls', 'warn');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate confirmation with brief realistic delay
      await new Promise((res) => setTimeout(res, 600));

      setIsConfirmed(true);
      pushToast(`${grnReference} created: ${intakeRolls.length} rolls (${totalMeters}m) added to warehouse stock!`, 'ok');

      if (onSuccess) {
        onSuccess(intakeRolls);
      }
    } catch (err: any) {
      pushToast(err.message || 'Failed to submit GRN', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, label: 'Supplier & Delivery', desc: 'Invoice & consignment info' },
    { number: 2, label: 'Fabric Roll Intake', desc: 'Specifications & roll entries' },
    { number: 3, label: 'Quality Inspection', desc: 'Weave, shade & usable balance' },
    { number: 4, label: 'Review & Commit', desc: 'Barcodes & warehouse posting' },
  ];

  return (
    <div className="space-y-6">
      {/* ----------------- STEPPER NAVIGATION ----------------- */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Goods Received Note Flow
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {grnReference}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Receive Fabric into Warehouse Stock
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Destination:</span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">
              {receivingBranch}
            </span>
          </div>
        </div>

        {/* 4 Step Progress Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {steps.map((s) => {
            const isActive = currentStep === s.number;
            const isDone = currentStep > s.number || isConfirmed;

            return (
              <button
                key={s.number}
                type="button"
                onClick={() => {
                  if (!isConfirmed && s.number <= currentStep + 1) {
                    setCurrentStep(s.number as any);
                  }
                }}
                disabled={isConfirmed}
                className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : isDone
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100/60'
                    : 'bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isActive
                      ? 'bg-white text-blue-600'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.number}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                    {s.label}
                  </p>
                  <p className={`text-[11px] truncate ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                    {s.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ----------------- STEP CONTENT CONTAINER ----------------- */}
      <AnimatePresence mode="wait">
        {/* ================= STEP 1: SUPPLIER & DOCUMENT ================= */}
        {currentStep === 1 && !isConfirmed && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={softSpring}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Form Details */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-5">
                <CardHeader
                  icon={Building2}
                  title="Consignment & Delivery Document"
                  subtitle="Verify supplier commercial invoice and vehicle gate entry"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Textile Mill / Supplier *
                    </label>
                    <select
                      value={selectedSupplierId}
                      onChange={(e) => setSelectedSupplierId(e.target.value)}
                      className="w-full min-h-12 px-3.5 text-base font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {DEMO_SUPPLIERS.map((sup) => (
                        <option key={sup.id} value={sup.id}>
                          {sup.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Supplier Invoice / Delivery Note # *
                    </label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full min-h-12 px-3.5 text-base font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. INV-RW-8491"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Arrival Date *
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full min-h-12 px-3.5 text-base font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Receiving Warehouse / Branch *
                    </label>
                    <select
                      value={receivingBranch}
                      onChange={(e) => setReceivingBranch(e.target.value)}
                      className="w-full min-h-12 px-3.5 text-base font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Flagship Boutique — Colombo 03">Flagship Boutique — Colombo 03</option>
                      <option value="Central Cutting Warehouse — Maharagama">Central Cutting Warehouse — Maharagama</option>
                      <option value="Kandy Production Hub — Katugastota">Kandy Production Hub — Katugastota</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Carrier Vehicle / Driver Reference
                  </label>
                  <input
                    type="text"
                    value={carrierVehicle}
                    onChange={(e) => setCarrierVehicle(e.target.value)}
                    className="w-full min-h-12 px-3.5 text-base font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Vehicle number or logistics provider"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Gate & Unloading Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={supplierNotes}
                    onChange={(e) => setSupplierNotes(e.target.value)}
                    className="w-full p-3 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Physical package condition, container seal integrity, etc."
                  />
                </div>
              </div>

              {/* Right Column: Supplier Contact Summary Card */}
              <div className="space-y-4">
                <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                      Authorised Supplier
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                      Active Vendor
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedSupplier.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedSupplier.address}</p>
                  </div>

                  <div className="space-y-2 text-xs pt-2">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Contact Person:</span>
                      <span className="font-semibold text-white">{selectedSupplier.contactPerson}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-semibold text-white">{selectedSupplier.phone}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Outstanding Balance:</span>
                      <span className="font-bold text-amber-400">
                        Rs {selectedSupplier.outstandingBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Auto-generates GRN voucher with 30-day supplier credit terms.</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs font-medium text-blue-900 flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>
                    Storekeeper policy: Confirm supplier packing list matches physical delivery before proceeding to roll intake.
                  </span>
                </div>
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="flex justify-end gap-3 pt-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 min-h-12 rounded-xl border border-slate-200 text-base font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              )}
              <PressButton
                onClick={() => setCurrentStep(2)}
                className="bg-blue-600 hover:bg-blue-700 text-white min-h-12 px-8 text-base font-bold flex items-center gap-2 shadow-md shadow-blue-500/20"
              >
                <span>Continue to Roll Intake</span>
                <ArrowRight className="w-4 h-4" />
              </PressButton>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 2: FABRIC ROLL INTAKE ================= */}
        {currentStep === 2 && !isConfirmed && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={softSpring}
            className="space-y-6"
          >
            {/* Quick Roll Intake Entry Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
              <CardHeader
                icon={Scissors}
                title="Log Incoming Fabric Roll"
                subtitle="Enter roll dye lot, initial length, width, and cost to add to intake list"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Fabric Composition *</label>
                  <select
                    value={newFabricType}
                    onChange={(e) => setNewFabricType(e.target.value)}
                    className="w-full min-h-12 px-3 text-base font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {PRESET_FABRICS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Dye Lot / Shade Batch # *</label>
                  <input
                    type="text"
                    value={newLotNumber}
                    onChange={(e) => setNewLotNumber(e.target.value)}
                    className="w-full min-h-12 px-3.5 text-base font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="LOT-2024-C08"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Roll Width (Inches) *</label>
                  <select
                    value={newWidth}
                    onChange={(e) => setNewWidth(Number(e.target.value))}
                    className="w-full min-h-12 px-3 text-base font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={44}>44" Standard Saree / Blouse</option>
                    <option value={58}>58" Suit & Dress Width</option>
                    <option value={60}>60" Wide Bolt</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Measured Meters *</label>
                  <input
                    type="number"
                    min={1}
                    value={newLength}
                    onChange={(e) => setNewLength(Number(e.target.value))}
                    className="w-full min-h-12 px-3.5 text-base font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Color Swatch & Unit Cost Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end pt-1">
                <div className="lg:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Fabric Shade & Swatch: {selectedColor.name}</span>
                    <span className="font-mono text-slate-400">{selectedColor.hex}</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                          selectedColor.name === c.name
                            ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-xs border border-black/10 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Cost per Meter (Rs) *</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={100}
                      value={newCost}
                      onChange={(e) => setNewCost(Number(e.target.value))}
                      className="w-full min-h-12 px-3.5 text-base font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                    <PressButton
                      type="button"
                      onClick={handleAddRoll}
                      className="bg-slate-900 hover:bg-slate-800 text-white min-h-12 px-5 text-sm font-bold flex items-center gap-1.5 shrink-0 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Roll</span>
                    </PressButton>
                  </div>
                </div>
              </div>
            </div>

            {/* Intake Rolls Animated List */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Consignment Intake List ({intakeRolls.length} Rolls)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rolls currently logged on this GRN consignment
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Intake</span>
                    <p className="text-base font-black text-blue-600">{totalMeters} Meters</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Intake Value</span>
                    <p className="text-base font-black text-slate-900">Rs {totalCostValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {intakeRolls.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                  <Scissors className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No rolls added to this GRN yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Use the form above to add fabric rolls to this receiving voucher
                  </p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  <AnimatedList>
                    {intakeRolls.map((roll, idx) => (
                      <AnimatedRow key={roll.id}>
                        <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span
                              className="w-8 h-8 rounded-xl shadow-xs border border-black/10 shrink-0 flex items-center justify-center text-white text-[11px] font-bold"
                              style={{ backgroundColor: roll.colorHex }}
                            >
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-slate-900 truncate">
                                  {roll.type}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase">
                                  {roll.lot}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">
                                  ({roll.colorName} • {roll.widthInches}")
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                                Barcode: {roll.barcode}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 pl-2">
                            <div className="text-right">
                              <p className="text-base font-black text-slate-900">
                                {roll.totalLength} m
                              </p>
                              <p className="text-xs text-slate-500">
                                @ Rs {roll.costPerMeter.toLocaleString()} / m
                              </p>
                            </div>

                            <div className="text-right hidden sm:block min-w-[90px]">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase">Subtotal</span>
                              <p className="text-sm font-bold text-slate-900">
                                Rs {(roll.totalLength * roll.costPerMeter).toLocaleString()}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveRoll(roll.id)}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Remove roll"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </AnimatedRow>
                    ))}
                  </AnimatedList>
                </ul>
              )}
            </div>

            {/* Step 2 Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-6 min-h-12 rounded-xl border border-slate-200 text-base font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Supplier</span>
              </button>

              <PressButton
                onClick={() => {
                  if (intakeRolls.length === 0) {
                    pushToast('Please add at least one roll before continuing', 'warn');
                    return;
                  }
                  setCurrentStep(3);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white min-h-12 px-8 text-base font-bold flex items-center gap-2 shadow-md shadow-blue-500/20"
              >
                <span>Proceed to Quality Check</span>
                <ArrowRight className="w-4 h-4" />
              </PressButton>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 3: QUALITY CHECK & BALANCE BAR ================= */}
        {currentStep === 3 && !isConfirmed && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={softSpring}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Inspection Criteria */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-5">
                <CardHeader
                  icon={ShieldCheck}
                  title="Fabric Inspection & Usable Yield"
                  subtitle="Verify weave density, color uniformity and fabric flaw tolerances"
                />

                {/* Inspection Checklist Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    {
                      id: 'density',
                      title: 'Weave Density & Tensile Spec',
                      desc: 'Check warp/weft thread count and seam burst strength',
                      state: weaveDensityPassed,
                      set: setWeaveDensityPassed,
                    },
                    {
                      id: 'shade',
                      title: 'Dye Lot Shade Consistency',
                      desc: 'Edge-to-edge and end-to-end tone consistency across roll',
                      state: shadeConsistencyPassed,
                      set: setShadeConsistencyPassed,
                    },
                    {
                      id: 'defect',
                      title: 'Flaw & Oil Stain Clearance',
                      desc: 'Check for knots, snags, uneven selvedges and chemical marks',
                      state: defectFreePassed,
                      set: setDefectFreePassed,
                    },
                    {
                      id: 'gsm',
                      title: 'Pre-Shrunk & GSM Certification',
                      desc: 'Verified fabric weight complies with garment pattern tolerance',
                      state: gsmVerified,
                      set: setGsmVerified,
                    },
                  ].map((check) => (
                    <button
                      key={check.id}
                      type="button"
                      onClick={() => check.set(!check.state)}
                      className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        check.state
                          ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
                          : 'border-amber-200 bg-amber-50/70 text-amber-950'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          check.state ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                        }`}
                      >
                        {check.state ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{check.title}</p>
                        <p className="text-xs opacity-80 mt-0.5">{check.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Usable Yield Rate Control */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-bold text-slate-800">
                        Usable Yield Acceptance Rate
                      </label>
                      <p className="text-xs text-slate-500">
                        Allowance for cutting table trim, end-of-roll clamping and selvedge waste
                      </p>
                    </div>
                    <span className="text-xl font-extrabold text-emerald-600 font-mono">
                      {inspectionPassRate}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min={90}
                    max={100}
                    step={1}
                    value={inspectionPassRate}
                    onChange={(e) => setInspectionPassRate(Number(e.target.value))}
                    className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                    <span>90% (Strict Trim Allowance)</span>
                    <span>95% (Standard)</span>
                    <span>100% (Zero Flaw / Full Bolt)</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-700">Authorised Quality Inspector</label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full min-h-12 px-3.5 text-base font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Right Column: Animated Balance Bar Card */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Consignment Balance Bar
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      Grade A Verified
                    </span>
                  </div>

                  {/* Big Number Summary */}
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Net Usable Fabric Balance</span>
                    <p className="text-3xl font-black text-slate-900">
                      {Math.round((totalMeters * inspectionPassRate) / 100)} m
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      of {totalMeters} m measured consignment length
                    </p>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">Usable Ratio</span>
                      <span className="text-emerald-600 font-mono">{inspectionPassRate}%</span>
                    </div>
                    {/* Golden Rule: Balance bar animates width with duration */}
                    <ProgressBar pct={inspectionPassRate} color="#10b981" height="h-3" />
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Gross Received:</span>
                      <span className="font-bold text-slate-900">{totalMeters} m</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Usable Allowance:</span>
                      <span className="font-bold text-emerald-600">
                        {Math.round((totalMeters * inspectionPassRate) / 100)} m
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">End-Cut Tolerance:</span>
                      <span className="font-bold text-amber-600">
                        {totalMeters - Math.round((totalMeters * inspectionPassRate) / 100)} m
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-slate-100">
                      <span className="text-slate-500">Warehouse Valuation:</span>
                      <span className="font-bold text-slate-900">
                        Rs {totalCostValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 font-medium flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    Quality criteria verified. Rolls will be allocated individual barcode tags upon committing.
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3 Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 min-h-12 rounded-xl border border-slate-200 text-base font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Intake</span>
              </button>

              <PressButton
                onClick={() => setCurrentStep(4)}
                className="bg-blue-600 hover:bg-blue-700 text-white min-h-12 px-8 text-base font-bold flex items-center gap-2 shadow-md shadow-blue-500/20"
              >
                <span>Review & Allocate Barcodes</span>
                <ArrowRight className="w-4 h-4" />
              </PressButton>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 4: REVIEW & COMMIT ================= */}
        {currentStep === 4 && !isConfirmed && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={softSpring}
            className="space-y-6"
          >
            {/* Summary Metrics Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Consignment Length"
                value={totalMeters}
                icon={Scissors}
                suffix=" m"
                isHero={true}
              />
              <StatCard
                title="Total Fabric Rolls"
                value={intakeRolls.length}
                icon={Layers}
                suffix=" Rolls"
              />
              <StatCard
                title="Warehouse Valuation"
                value={totalCostValue}
                icon={FileText}
                prefix="Rs "
              />
              <StatCard
                title="Inspection Pass Rate"
                value={inspectionPassRate}
                icon={ShieldCheck}
                suffix="%"
              />
            </div>

            {/* Consignment Document & Allocated Barcodes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Document Overview */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
                <CardHeader
                  icon={FileText}
                  title="GRN Document Details"
                  subtitle="Verify formal warehouse receiving record before committing"
                />

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">GRN Reference:</span>
                    <span className="font-mono font-bold text-blue-600">{grnReference}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Supplier:</span>
                    <span className="font-bold text-slate-900">{selectedSupplier.name}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Supplier Invoice #:</span>
                    <span className="font-mono font-bold text-slate-800">{invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Receiving Branch:</span>
                    <span className="font-semibold text-slate-800">{receivingBranch}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Arrival Date:</span>
                    <span className="font-semibold text-slate-800">{deliveryDate}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Inspector:</span>
                    <span className="font-semibold text-slate-800">{inspectorName}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Carrier Vehicle:</span>
                    <span className="font-semibold text-slate-800">{carrierVehicle}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <span className="font-bold">Remarks: </span>
                  {supplierNotes}
                </div>
              </div>

              {/* Barcode Tag Preview Cards */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-4">
                <CardHeader
                  icon={Barcode}
                  title="Allocated Roll Barcode Tags"
                  subtitle="Each roll is assigned an immutable barcode for cutting table tracking"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {intakeRolls.map((roll, idx) => (
                    <div
                      key={roll.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: roll.colorHex }}
                          />
                          <span className="text-xs font-bold text-slate-900 truncate">
                            Roll #{idx + 1}
                          </span>
                        </div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                          {roll.lot}
                        </span>
                      </div>

                      <div className="py-2 space-y-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{roll.type}</p>
                        <p className="text-xs text-slate-500">
                          {roll.totalLength} Meters • {roll.widthInches}" Width
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="font-mono text-xs font-bold text-slate-900">
                          {roll.barcode}
                        </div>
                        <span className="text-xs font-bold text-slate-600">
                          Rs {roll.costPerMeter.toLocaleString()} / m
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 4 Commit Action */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-full sm:w-auto px-6 min-h-12 rounded-xl border border-slate-200 text-base font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Inspection</span>
              </button>

              <PressButton
                onClick={handleConfirmGRN}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white min-h-12 px-10 text-base font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
              >
                {isSubmitting ? (
                  <span>Posting to Warehouse Ledger...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-lime-300" />
                    <span>Confirm & Post GRN into Stock</span>
                  </>
                )}
              </PressButton>
            </div>
          </motion.div>
        )}

        {/* ================= SUCCESS STATE WITH DRAWN SVG CHECKMARK ================= */}
        {isConfirmed && (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
            className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-100 text-center max-w-2xl mx-auto space-y-6"
          >
            {/* Animated SVG Checkmark */}
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-12 h-12" viewBox="0 0 52 52">
                <circle
                  cx="26"
                  cy="26"
                  r="25"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  className="opacity-20"
                />
                <motion.path
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 27l8 8 16-16"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                />
              </svg>
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                Voucher Successfully Posted
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Goods Received Note Registered
              </h2>
              <p className="text-base text-slate-600">
                <strong className="text-slate-900">{grnReference}</strong> has been committed to the warehouse ledger. All {intakeRolls.length} fabric rolls are now live and available for cutting and shelf display.
              </p>
            </div>

            {/* Quick Metrics Receipt Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm grid grid-cols-3 gap-2">
              <div>
                <span className="text-xs text-slate-500">Rolls Received</span>
                <p className="text-lg font-bold text-slate-900">{intakeRolls.length}</p>
              </div>
              <div className="border-x border-slate-200">
                <span className="text-xs text-slate-500">Meters Added</span>
                <p className="text-lg font-bold text-emerald-600">{totalMeters} m</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Consignment Value</span>
                <p className="text-lg font-bold text-slate-900">Rs {totalCostValue.toLocaleString()}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <PressButton
                onClick={() => {
                  window.print();
                }}
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 min-h-12 px-6 text-sm font-bold flex items-center justify-center gap-2 shadow-xs"
              >
                <Barcode className="w-4 h-4 text-slate-500" />
                <span>Print Roll Barcode Labels</span>
              </PressButton>

              <PressButton
                onClick={() => {
                  if (onCancel) onCancel();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white min-h-12 px-8 text-base font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                <span>View Fabric Roll Ledger &rarr;</span>
              </PressButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
