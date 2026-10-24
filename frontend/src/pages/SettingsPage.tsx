import React, { useState } from 'react';
import { Building2, Receipt, Globe, Shield, Key, RotateCcw, CheckCircle2, Sparkles, Store } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { demoStore } from '../services/demoStore';

export const SettingsPage: React.FC = () => {
  const { business } = useAuthStore();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetDemo = () => {
    if (window.confirm('Reset all demo data back to factory defaults? Any new products, sales or expenses created during this session will be reverted.')) {
      demoStore.resetToFactory();
      setResetSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 900);
    }
  };

  return (
    <div className="page-wrapper max-w-4xl space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Configuration & Demo Center</h1>
          <p className="page-subtitle">
            Luxe Threads Boutique profile, Colombo timezone, LKR currency localization, and interactive demo controls.
          </p>
        </div>
      </div>

      {/* Demo Reset & Live State Banner */}
      <div className="card p-6 bg-linear-to-r from-action-900 via-neutral-900 to-black text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 text-2xs font-medium border border-white/15">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Interactive Demonstration Environment</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Luxe Threads Demo Operating System</h3>
            <p className="text-xs text-white/70 max-w-xl">
              This demo runs locally in your browser with realistic Sri Lankan textile data. You can perform sales at POS, update stock, and test virtual try-ons. Click below anytime to restore the initial showcase state.
            </p>
          </div>

          <button
            onClick={handleResetDemo}
            className="px-4 py-2.5 rounded-xl bg-white text-neutral-950 font-semibold text-xs hover:bg-neutral-100 transition-all shadow-md active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            {resetSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Restored! Reloading...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 text-neutral-700" />
                <span>Reset Demo to Factory State</span>
              </>
            )}
          </button>
        </div>

        {/* Demo Data Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
          <div>
            <span className="text-3xs text-white/50 uppercase tracking-wider block">Curated Catalog</span>
            <span className="text-sm font-bold text-white">24 Fashion Styles</span>
          </div>
          <div>
            <span className="text-3xs text-white/50 uppercase tracking-wider block">Available Stock</span>
            <span className="text-sm font-bold text-white">588 Units on Hand</span>
          </div>
          <div>
            <span className="text-3xs text-white/50 uppercase tracking-wider block">Sales Transactions</span>
            <span className="text-sm font-bold text-white">30-Day Audit Trail</span>
          </div>
          <div>
            <span className="text-3xs text-white/50 uppercase tracking-wider block">Customer Directory</span>
            <span className="text-sm font-bold text-white">15 Credit Profiles</span>
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-separator/60">
          <div className="w-8 h-8 rounded-xl bg-action-50 text-action-600 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-label-primary text-sm">Business Profile</h3>
            <p className="text-2xs text-label-secondary">Official commercial entity details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-surface-secondary/50 rounded-xl border border-separator/40">
            <span className="text-2xs text-label-tertiary block font-medium">TRADING NAME</span>
            <div className="font-semibold text-label-primary text-sm mt-0.5">
              {business?.name || 'Luxe Threads Boutique'}
            </div>
          </div>

          <div className="p-3 bg-surface-secondary/50 rounded-xl border border-separator/40">
            <span className="text-2xs text-label-tertiary block font-medium">LEGAL ENTITY</span>
            <div className="font-semibold text-label-primary text-sm mt-0.5">
              {business?.legalName || 'Luxe Threads Apparel (Pvt) Ltd'}
            </div>
          </div>

          <div className="p-3 bg-surface-secondary/50 rounded-xl border border-separator/40">
            <span className="text-2xs text-label-tertiary block font-medium">FLAGSHIP SHOWROOM</span>
            <div className="font-medium text-label-primary mt-0.5">
              {business?.address || '42 Galle Road, Colombo 03, Sri Lanka'}
            </div>
          </div>

          <div className="p-3 bg-surface-secondary/50 rounded-xl border border-separator/40">
            <span className="text-2xs text-label-tertiary block font-medium">CONCIERGE HOTLINE</span>
            <div className="font-medium text-label-primary font-mono mt-0.5">
              {business?.phone || '+94 11 258 9632'}
            </div>
          </div>
        </div>
      </div>

      {/* Showroom Locations */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-separator/60">
          <div className="w-8 h-8 rounded-xl bg-action-50 text-action-600 flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-label-primary text-sm">Showroom & Branch Locations</h3>
            <p className="text-2xs text-label-secondary">Connected multi-outlet points of presence</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-surface-secondary/60 rounded-xl border border-separator/40 flex items-start justify-between">
            <div>
              <span className="badge badge-action mb-1">Flagship Store</span>
              <div className="font-semibold text-label-primary text-sm">Colombo 03 — Galle Road</div>
              <p className="text-2xs text-label-secondary mt-0.5">Showroom, Bridal Studio & Haute Couture</p>
            </div>
            <span className="text-2xs font-semibold text-success-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
              Online
            </span>
          </div>

          <div className="p-3.5 bg-surface-secondary/60 rounded-xl border border-separator/40 flex items-start justify-between">
            <div>
              <span className="badge badge-neutral mb-1">Branch Store</span>
              <div className="font-semibold text-label-primary text-sm">Kandy City Centre — Level 2</div>
              <p className="text-2xs text-label-secondary mt-0.5">Casual Collections, Sarees & Ready-to-Wear</p>
            </div>
            <span className="text-2xs font-semibold text-success-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Regional Localization */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-separator/60">
          <div className="w-8 h-8 rounded-xl bg-action-50 text-action-600 flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-label-primary text-sm">Regional & Currency Localization</h3>
            <p className="text-2xs text-label-secondary">Standard Sri Lankan retail settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-surface-secondary/60 rounded-xl border border-separator/40">
            <span className="text-2xs text-label-tertiary block font-medium">CURRENCY</span>
            <span className="text-base font-bold text-action-600">
              {business?.currency || 'LKR'}
            </span>
            <span className="text-3xs text-label-secondary block">Sri Lankan Rupee (₨)</span>
          </div>

          <div className="p-3.5 bg-surface-secondary/60 rounded-xl border border-separator/40">
            <span className="text-2xs text-label-tertiary block font-medium">TIMEZONE</span>
            <span className="text-base font-bold text-label-primary font-mono">
              {business?.timezone || 'Asia/Colombo'}
            </span>
            <span className="text-3xs text-label-secondary block">UTC+05:30 (Sri Lanka Standard Time)</span>
          </div>

          <div className="p-3.5 bg-surface-secondary/60 rounded-xl border border-separator/40">
            <span className="text-2xs text-label-tertiary block font-medium">DATE FORMAT</span>
            <span className="text-base font-bold text-label-primary font-mono">
              DD/MM/YYYY
            </span>
            <span className="text-3xs text-label-secondary block">British / Sri Lankan standard</span>
          </div>
        </div>
      </div>

      {/* Thermal Receipt Settings */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-separator/60">
          <div className="w-8 h-8 rounded-xl bg-action-50 text-action-600 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-label-primary text-sm">Thermal 80mm Receipt Policy</h3>
            <p className="text-2xs text-label-secondary">Printed policy message on sales bills</p>
          </div>
        </div>

        <div className="text-xs space-y-2">
          <label className="input-label">Exchange Policy Message</label>
          <div className="p-4 bg-surface-secondary/60 rounded-xl border border-separator text-label-secondary italic font-serif">
            "{business?.receiptFooter || 'Thank you for choosing Luxe Threads Boutique! Exchange within 7 days with original tag and receipt.'}"
          </div>
        </div>
      </div>

      {/* Demo Credentials Box */}
      <div className="card p-6 space-y-4 bg-action-50/30 border-action-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-action-100 text-action-600 flex items-center justify-center">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <span className="section-label !text-action-800">Demo Role Credentials</span>
            <p className="text-2xs text-action-700">Pre-configured test accounts for instant 1-click evaluation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-action-100 shadow-2xs space-y-0.5">
            <span className="badge badge-action">Store Owner</span>
            <div className="font-medium text-label-primary text-xs pt-1 font-mono">owner@luxethreads.lk</div>
            <div className="text-2xs text-label-tertiary font-mono">password123</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-action-100 shadow-2xs space-y-0.5">
            <span className="badge badge-neutral">Store Manager</span>
            <div className="font-medium text-label-primary text-xs pt-1 font-mono">manager@luxethreads.lk</div>
            <div className="text-2xs text-label-tertiary font-mono">password123</div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-action-100 shadow-2xs space-y-0.5">
            <span className="badge badge-neutral">Front Cashier</span>
            <div className="font-medium text-label-primary text-xs pt-1 font-mono">cashier@luxethreads.lk</div>
            <div className="text-2xs text-label-tertiary font-mono">password123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

