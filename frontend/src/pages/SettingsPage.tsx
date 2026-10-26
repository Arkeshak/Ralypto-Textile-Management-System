import React, { useState } from 'react';
import {
  Building2,
  Receipt,
  Globe,
  Shield,
  Key,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Store,
  Check,
  Copy,
  Printer,
  Sliders,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { demoStore } from '../services/demoStore';
import {
  PressButton,
  PageTransition,
  stagger,
  fadeUp,
} from '../lib/motion';
import {
  StatCard,
  CardHeader,
  SectionCard,
  PageHeader,
} from '../components/ui-pattern';
import { useToastStore } from '../stores/toast.store';

export const SettingsPage: React.FC = () => {
  const { business } = useAuthStore();
  const { push: pushToast } = useToastStore();

  const [resetSuccess, setResetSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleResetDemo = () => {
    if (
      window.confirm(
        'Reset all demo data back to factory defaults? Any new products, sales, customers, or expenses created during this session will be reverted.'
      )
    ) {
      demoStore.resetToFactory();
      setResetSuccess(true);
      pushToast('Restoring factory demonstration state...', 'ok');
      setTimeout(() => {
        window.location.reload();
      }, 900);
    }
  };

  const copyCreds = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    pushToast(`Copied ${text}`, 'ok');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <PageTransition routeKey="settings">
      <div className="min-h-screen bg-[#f3f4f6] text-slate-900 pb-12">
        <div className="mx-auto max-w-[1360px] p-4 sm:p-6 space-y-6">
          {/* Page Header */}
          <PageHeader
            title="Store Configuration & Governance"
            subtitle="Ralypto Textile boutique profile, branch network, currency localization in Rs, and demo telemetry"
            icon={Store}
          />

          {/* Top 4 Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Flagship Showroom"
              value={1}
              icon={Store}
              suffix=" Flagship"
              isHero={true}
              change="Galle Road, Colombo 03"
              isPositive={true}
            />

            <StatCard
              title="System Currency"
              value={1}
              icon={Globe}
              prefix=""
              suffix=" Currency (Rs)"
              change="Sri Lankan Rupee (Rs)"
              isPositive={true}
            />

            <StatCard
              title="Branch Outlets"
              value={2}
              icon={Building2}
              suffix=" Showrooms"
              change="Colombo & Kandy KCC"
              isPositive={true}
            />

            <StatCard
              title="Receipt Policy Status"
              value={100}
              icon={Shield}
              suffix="%"
              change="80mm Thermal Live"
              isPositive={true}
            />
          </div>

          {/* Demo Reset & Live State Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold border border-white/15">
                  <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                  <span>Interactive Boutique Demonstration Environment</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Ralypto Textile Management OS
                </h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  This demo runs locally in your browser with realistic Sri Lankan textile data. You
                  can checkout sales at POS, inspect fabric rolls, and test virtual try-ons. Click
                  below anytime to restore the initial showcase state.
                </p>
              </div>

              <PressButton
                onClick={handleResetDemo}
                className="min-h-12 px-5 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
              >
                {resetSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Restored! Reloading...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 text-slate-700" />
                    <span>Reset Demo to Factory State</span>
                  </>
                )}
              </PressButton>
            </div>

            {/* Demo Data Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Curated Catalog
                </span>
                <span className="text-sm font-bold text-white">24 Ready-to-Wear Styles</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Physical Stock
                </span>
                <span className="text-sm font-bold text-white">588 Units on Hand</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Sales Audit Trail
                </span>
                <span className="text-sm font-bold text-white">30-Day POS Ledger</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Client Directory
                </span>
                <span className="text-sm font-bold text-white">15 Credit Profiles</span>
              </div>
            </div>
          </div>

          {/* Business Profile */}
          <SectionCard>
            <CardHeader
              title="Official Business Profile"
              subtitle="Registered commercial entity and boutique headquarters"
              icon={Building2}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Trading Name
                </span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {business?.name || 'Ralypto Textile & Boutique'}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Legal Corporate Entity
                </span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {business?.legalName || 'Ralypto Apparel (Pvt) Ltd'}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Flagship Showroom Address
                </span>
                <div className="font-semibold text-slate-800 mt-0.5">
                  {business?.address || '42 Galle Road, Colombo 03, Sri Lanka'}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Concierge Hotline
                </span>
                <div className="font-bold text-slate-900 font-mono mt-0.5">
                  {business?.phone || '+94 11 258 9632'}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Showroom & Branch Locations */}
          <SectionCard>
            <CardHeader
              title="Showroom & Branch Network"
              subtitle="Connected multi-outlet points of presence across Sri Lanka"
              icon={Store}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold mb-1.5">
                    Flagship Showroom
                  </span>
                  <div className="font-bold text-slate-900 text-sm">
                    Colombo 03 — Galle Road
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ready-to-wear showroom, bridal fitting studio & roll rack shelf
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold mb-1.5">
                    Regional Boutique
                  </span>
                  <div className="font-bold text-slate-900 text-sm">
                    Kandy City Centre — Level 2
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Casual collections, saree ethnic wear & bespoke tailoring point
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
            </div>
          </SectionCard>

          {/* Regional Localization & Currency */}
          <SectionCard>
            <CardHeader
              title="Regional & Currency Localization"
              subtitle="Default retail and accounting parameters"
              icon={Globe}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  System Currency
                </span>
                <span className="text-lg font-black text-blue-600 mt-0.5 block">
                  Rs (Sri Lankan Rupee)
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Unified POS and invoicing currency
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Store Timezone
                </span>
                <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">
                  Asia/Colombo
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  UTC+05:30 (Sri Lanka Standard Time)
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Calendar Date Format
                </span>
                <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">
                  DD/MM/YYYY
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Sri Lankan standard commercial format
                </span>
              </div>
            </div>
          </SectionCard>

          {/* Thermal 80mm Receipt Policy */}
          <SectionCard>
            <CardHeader
              title="Thermal 80mm Receipt Policy"
              subtitle="Customer exchange terms printed on Point of Sale bills"
              icon={Receipt}
            />

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700 block">
                Standard Receipt Footer Notice
              </span>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 italic font-serif text-xs leading-relaxed">
                "{business?.receiptFooter ||
                  'Thank you for shopping at Ralypto Textile! Exchanges accepted within 7 days with original sales tag and receipt intact. No cash refunds on cut fabric rolls.'}"
              </div>
            </div>
          </SectionCard>

          {/* Demo Role Credentials Reference */}
          <SectionCard className="border-blue-200 bg-blue-50/20">
            <CardHeader
              title="Demo Evaluation Credentials"
              subtitle="Quick 1-click test accounts for testing different role permissions"
              icon={Key}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div
                onClick={() => copyCreds('owner@ralypto.lk', 'owner')}
                className="p-3.5 bg-white rounded-xl border border-blue-100 shadow-2xs space-y-1 hover:border-blue-400 cursor-pointer transition-all"
                title="Click to copy email"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    Store Owner
                  </span>
                  {copiedKey === 'owner' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
                <div className="font-bold text-slate-900 text-xs font-mono">owner@ralypto.lk</div>
                <div className="text-[11px] text-slate-500 font-mono">password123</div>
              </div>

              <div
                onClick={() => copyCreds('manager@ralypto.lk', 'manager')}
                className="p-3.5 bg-white rounded-xl border border-blue-100 shadow-2xs space-y-1 hover:border-blue-400 cursor-pointer transition-all"
                title="Click to copy email"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Store Manager
                  </span>
                  {copiedKey === 'manager' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
                <div className="font-bold text-slate-900 text-xs font-mono">manager@ralypto.lk</div>
                <div className="text-[11px] text-slate-500 font-mono">password123</div>
              </div>

              <div
                onClick={() => copyCreds('cashier@ralypto.lk', 'cashier')}
                className="p-3.5 bg-white rounded-xl border border-blue-100 shadow-2xs space-y-1 hover:border-blue-400 cursor-pointer transition-all"
                title="Click to copy email"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Front Cashier
                  </span>
                  {copiedKey === 'cashier' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
                <div className="font-bold text-slate-900 text-xs font-mono">cashier@ralypto.lk</div>
                <div className="text-[11px] text-slate-500 font-mono">password123</div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default SettingsPage;
