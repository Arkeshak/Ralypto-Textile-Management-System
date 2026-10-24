import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Shirt,
  Boxes,
  Tags,
  Receipt,
  RotateCcw,
  Users,
  Truck,
  DollarSign,
  UserCheck,
  BarChart3,
  Building2,
  Settings,
  HelpCircle,
  CreditCard,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const navigationSections = [
  {
    group: 'Operations',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'ai-studio', label: 'AI Fashion Studio', icon: Sparkles, badge: 'AI' },
      { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
      { id: 'sales', label: 'Sales & Invoices', icon: Receipt },
      { id: 'returns', label: 'Returns', icon: RotateCcw },
    ],
  },
  {
    group: 'Catalogue',
    items: [
      { id: 'products', label: 'Products', icon: Shirt },
      { id: 'inventory', label: 'Inventory', icon: Boxes },
      { id: 'categories', label: 'Categories', icon: Tags },
    ],
  },
  {
    group: 'Relationships',
    items: [
      { id: 'customers', label: 'Customers', icon: Users },
      { id: 'suppliers', label: 'Suppliers', icon: Truck },
    ],
  },
  {
    group: 'Finance',
    items: [
      { id: 'expenses', label: 'Expenses', icon: DollarSign },
      { id: 'reports', label: 'Reports', icon: BarChart3 },
      { id: 'staff', label: 'Staff', icon: UserCheck },
      { id: 'branches', label: 'Branches', icon: Building2 },
    ],
  },
  {
    group: 'Account',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'subscription', label: 'Billing', icon: CreditCard },
      { id: 'help', label: 'Help', icon: HelpCircle },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, business, logout } = useAuthStore();

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    onCloseMobile();
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'US';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 flex flex-col
          w-sidebar bg-white border-r border-separator
          transition-transform duration-300 ease-apple
          lg:translate-x-0
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ boxShadow: isOpenMobile ? '4px 0 24px rgba(0,0,0,0.08)' : 'none' }}
        role="navigation"
        aria-label="Primary navigation"
      >
        {/* ── Brand Mark ── */}
        <div className="h-14 flex items-center px-5 border-b border-separator shrink-0">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-extrabold select-none tracking-tight shadow-xs"
              style={{ background: 'linear-gradient(135deg, #0071E3 0%, #5AC8FA 100%)' }}
              aria-hidden="true"
            >
              LT
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-label-primary leading-tight tracking-tight truncate">
                Luxe Threads
              </div>
              <div className="text-3xs text-label-secondary font-semibold uppercase tracking-wider truncate max-w-[130px]">
                Textile Demo OS
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-none">
          {navigationSections.map((section) => (
            <div key={section.group}>
              {/* Section label */}
              <div className="section-label px-2 mb-1.5">
                {section.group}
              </div>

              {/* Nav items */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`nav-item w-full ${isActive ? 'active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="nav-icon shrink-0" strokeWidth={isActive ? 2 : 1.75} />
                      <span className="flex-1 text-left text-[13px]">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`
                            text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full
                            ${item.id === 'ai-studio'
                              ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white'
                              : 'bg-action-50 text-action-600'
                            }
                          `}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── User Footer ── */}
        <div className="p-3 border-t border-separator shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-surface-secondary transition-colors duration-150 group">
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-action-600 shrink-0 select-none"
              style={{ background: 'rgba(0,113,227,0.1)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-label-primary truncate">
                {user?.name || 'Staff User'}
              </div>
              <div className="text-2xs text-label-secondary truncate capitalize">
                {user?.role?.toLowerCase().replace('_', ' ') || 'cashier'}
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 rounded-lg text-label-tertiary hover:text-error-500 hover:bg-error-50 transition-colors duration-150 opacity-0 group-hover:opacity-100 shrink-0"
              aria-label="Sign out"
            >
              <LogOut strokeWidth={1.75} className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
