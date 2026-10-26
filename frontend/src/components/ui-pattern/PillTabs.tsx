import React from 'react';
import { motion } from 'framer-motion';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  badge?: string | number;
}

export interface PillTabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  layoutId?: string;
  variant?: 'dark' | 'light';
  className?: string;
}

export const PillTabs: React.FC<PillTabsProps> = ({
  tabs,
  activeId,
  onChange,
  layoutId = 'pill-thumb',
  variant = 'dark',
  className = '',
}) => {
  return (
    <nav
      role="tablist"
      className={`relative inline-flex gap-1 rounded-full p-1 shadow-inner ${
        variant === 'dark' ? 'bg-slate-100' : 'bg-slate-200/80'
      } ${className}`}
    >
      {tabs.map((t) => {
        const isActive = activeId === t.id;
        const Icon = t.icon;

        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.id)}
            className="relative flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className={`absolute inset-0 rounded-full shadow-sm ${
                  variant === 'dark' ? 'bg-slate-900' : 'bg-white'
                }`}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span
              className={`relative z-10 flex items-center gap-2 ${
                isActive
                  ? variant === 'dark'
                    ? 'text-white'
                    : 'text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {Icon && <Icon size={16} />}
              <span>{t.label}</span>
              {t.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
