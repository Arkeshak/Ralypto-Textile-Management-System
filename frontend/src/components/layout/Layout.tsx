import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  children: React.ReactNode;
}

const tabTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  'ai-studio': 'AI Fashion Studio',
  pos: 'Point of Sale',
  products: 'Products & Variants',
  inventory: 'Inventory',
  categories: 'Categories',
  sales: 'Sales & Invoices',
  returns: 'Returns',
  customers: 'Customers',
  suppliers: 'Suppliers',
  expenses: 'Expenses',
  reports: 'Reports',
  staff: 'Staff',
  branches: 'Branches',
  settings: 'Settings',
  subscription: 'Billing',
  help: 'Help',
};

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onSelectTab,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-secondary flex">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main content area — offset by sidebar width on large screens */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-sidebar">
        {/* Sticky header */}
        <Header
          title={tabTitles[currentTab] || currentTab}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onQuickSale={() => onSelectTab('pos')}
        />

        {/* Scrollable page content */}
        <main
          className="flex-1 overflow-y-auto"
          id="main-content"
          role="main"
        >
          {children}
        </main>
      </div>
    </div>
  );
};
