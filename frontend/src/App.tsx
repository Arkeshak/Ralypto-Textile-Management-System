import React, { useState, useEffect } from 'react';
import { useAuthStore } from './stores/auth.store';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { POSPage } from './pages/POSPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { SalesPage } from './pages/SalesPage';
import { CustomersPage } from './pages/CustomersPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ReportsPage } from './pages/ReportsPage';
import { StaffPage } from './pages/StaffPage';
import { SettingsPage } from './pages/SettingsPage';
import { AIFashionStudioPage } from './pages/AIFashionStudioPage';
import { Product } from './types';
import { Shirt, HelpCircle, CreditCard, Building2, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { user, isLoading, initAuth } = useAuthStore();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedTryOnProduct, setSelectedTryOnProduct] = useState<Product | null>(null);

  const handleLaunchTryOn = (product: Product) => {
    setSelectedTryOnProduct(product);
    setCurrentTab('ai-studio');
  };

  useEffect(() => {
    initAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-action-500 animate-spin flex items-center justify-center font-bold text-base shadow-xl shadow-action-500/25">
          LT
        </div>
        <div className="text-sm font-semibold tracking-wide text-neutral-300">
          Loading Luxe Threads Textile OS...
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'ai-studio':
        return (
          <AIFashionStudioPage
            initialProduct={selectedTryOnProduct}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        );
      case 'pos':
        return <POSPage onTryOnProduct={handleLaunchTryOn} />;
      case 'products':
      case 'categories':
        return <ProductsPage onTryOnProduct={handleLaunchTryOn} />;
      case 'inventory':
        return <InventoryPage />;
      case 'sales':
      case 'returns':
        return <SalesPage />;
      case 'customers':
        return <CustomersPage />;
      case 'suppliers':
        return <InventoryPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'staff':
        return <StaffPage />;
      case 'branches':
        return <SettingsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'subscription':
        return (
          <div className="p-8 max-w-2xl mx-auto space-y-4 text-center">
            <CreditCard className="w-12 h-12 text-blue-600 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">Ralypto Retail SaaS Subscription</h3>
            <p className="text-xs text-slate-500">
              Active Tier: <span className="font-bold text-emerald-600">Standard Boutique Plan</span> (Multi-branch, Unlimited Variants & Stock Ledger).
            </p>
          </div>
        );
      case 'help':
        return (
          <div className="p-8 max-w-2xl mx-auto space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span>POS & Inventory Shortcuts</span>
            </h3>
            <div className="space-y-2 text-xs text-slate-700 bg-white p-6 rounded-2xl border border-slate-200">
              <div className="flex justify-between py-1 border-b">
                <span>Fast Barcode Scanner:</span>
                <span className="font-mono font-bold">Auto-focused on POS screen</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Confirm Sale Tender:</span>
                <span className="font-mono font-bold">Enter key</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Print 80mm Receipt:</span>
                <span className="font-mono font-bold">Ctrl + P / Click Print 80mm</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Hold / Recall Order:</span>
                <span className="font-mono font-bold">Cart action menu</span>
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <Layout currentTab={currentTab} onSelectTab={setCurrentTab}>
      {renderContent()}
    </Layout>
  );
};
