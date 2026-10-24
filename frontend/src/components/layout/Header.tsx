import React, { useState, useEffect } from 'react';
import {
  Menu,
  Building2,
  ShoppingBag,
  ChevronDown,
  Check,
  Wifi,
  Search,
  RotateCcw,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  title: string;
  onQuickSale: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  title,
  onQuickSale,
}) => {
  const { branches, activeBranchId, setActiveBranch, business } = useAuthStore();
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Colombo',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="h-14 bg-white/90 border-b border-separator px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30"
      style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      {/* Left: Mobile menu + Page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="btn-icon lg:hidden shrink-0"
          aria-label="Toggle navigation"
        >
          <Menu strokeWidth={1.75} className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base font-semibold text-label-primary tracking-tight truncate leading-tight">
            {title}
          </h1>
          <div className="hidden sm:flex items-center gap-1.5 text-2xs text-label-secondary mt-0.5">
            <span className="font-medium">{business?.currency || 'LKR'}</span>
            <span className="text-separator">·</span>
            <Wifi strokeWidth={2} className="w-2.5 h-2.5 text-success-500" />
            <span>Online</span>
            <span className="text-separator">·</span>
            <span className="font-mono">{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Branch Selector */}
        {branches.length > 0 && (
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowBranchMenu(!showBranchMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-separator bg-surface-secondary hover:bg-surface-tertiary text-label-secondary text-xs font-medium transition-colors duration-150"
            >
              <Building2 strokeWidth={1.75} className="w-3.5 h-3.5 text-action-500" />
              <span className="max-w-[120px] truncate">{activeBranch?.name || 'Branch'}</span>
              <ChevronDown strokeWidth={2} className="w-3 h-3 text-label-tertiary" />
            </button>

            {showBranchMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowBranchMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-separator rounded-xl shadow-lg z-50 py-1 animate-scale-in origin-top-right">
                  <div className="px-3 py-2 border-b border-separator">
                    <p className="section-label">Store Branches</p>
                  </div>
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setActiveBranch(b.id);
                        setShowBranchMenu(false);
                      }}
                      className="w-full px-3 py-2.5 text-left text-xs flex items-center justify-between hover:bg-surface-secondary transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-label-primary">{b.name}</div>
                        <div className="text-label-secondary mt-0.5">
                          {b.code}{b.isMain ? ' · Flagship' : ''}
                        </div>
                      </div>
                      {b.id === activeBranch?.id && (
                        <Check strokeWidth={2.5} className="w-3.5 h-3.5 text-action-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Demo Mode Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-3xs font-extrabold uppercase tracking-wider select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
          <span>Demo Data Mode</span>
        </div>

        {/* Reset Demo Data Action */}
        <button
          onClick={() => {
            if (window.confirm('Reset all demo data back to original presentation state? (Restores initial products, sales, and analytics)')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-separator text-2xs font-semibold text-label-secondary hover:text-label-primary hover:bg-surface-secondary transition-colors"
          title="Reset all demo data to factory state"
        >
          <RotateCcw className="w-3 h-3 text-label-tertiary" />
          <span>Reset Demo</span>
        </button>

        {/* Quick POS button */}
        <button
          onClick={onQuickSale}
          className="btn-primary btn-sm flex items-center gap-1.5 shadow-action-sm"
          aria-label="Open Point of Sale"
        >
          <ShoppingBag strokeWidth={2} className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Sale</span>
        </button>
      </div>
    </header>
  );
};
