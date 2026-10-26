import React, { useState, useEffect, Suspense } from 'react';
import { useAuthStore } from './stores/auth.store';
import { useToastStore } from './stores/toast.store';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/layout/Layout';
import { POSPage } from './pages/POSPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { InventoryPage } from './pages/InventoryPage';
import { SalesPage } from './pages/SalesPage';
import { CustomersPage } from './pages/CustomersPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ReportsPage } from './pages/ReportsPage';
import { StaffPage } from './pages/StaffPage';
import { SettingsPage } from './pages/SettingsPage';
import { AIFashionStudioPage } from './pages/AIFashionStudioPage';
import { ProductionPage } from './pages/ProductionPage';
import { Product } from './types';
import { CreditCard, HelpCircle } from 'lucide-react';
import {
  MotionProvider,
  PageTransition,
  ToastHost,
  Skeleton,
} from './lib/motion';

// Step 5: Lazy-load Dashboard and Closet routes so Recharts never loads on counter/POS screens
const DashboardV16 = React.lazy(() => import('./features/dashboard/DashboardV16'));
const ClosetShowcase = React.lazy(() => import('./features/catalogue/ClosetShowcase'));

export const App: React.FC = () => {
  const { user, isLoading, initAuth } = useAuthStore();
  const { items: toastItems, dismiss: dismissToast } = useToastStore();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedTryOnProduct, setSelectedTryOnProduct] = useState<Product | null>(null);

  const handleLaunchTryOn = (product: Product) => {
    setSelectedTryOnProduct(product);
    setCurrentTab('ai-studio');
  };

  useEffect(() => {
    initAuth();
  }, []);

  // Golden Rule: Each role opens to its dedicated home screen
  useEffect(() => {
    if (!user) return;
    const role = (user.role || '').toUpperCase();
    if (role === 'CASHIER' || role === 'SALES') {
      setCurrentTab('pos');
    } else if (role === 'STOREKEEPER') {
      setCurrentTab('inventory');
    } else if (role === 'SUPERVISOR') {
      setCurrentTab('production');
    } else {
      setCurrentTab('dashboard');
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-6 p-6">
        <Skeleton className="w-16 h-16 rounded-2xl bg-slate-800" />
        <div className="space-y-2 text-center w-full max-w-xs">
          <Skeleton className="h-6 w-3/4 mx-auto rounded-lg bg-slate-800" />
          <Skeleton className="h-4 w-1/2 mx-auto rounded-lg bg-slate-800/60" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <MotionProvider>
        <LoginPage />
        <ToastHost items={toastItems} onDismiss={dismissToast} />
      </MotionProvider>
    );
  }

  const isOwnerOrManager =
    user.role?.toUpperCase() === 'OWNER' ||
    user.role?.toUpperCase() === 'MANAGER' ||
    user.role === 'Admin';

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        // Show DashboardV16 only for Owner and Manager. Other roles keep their role home screen.
        if (isOwnerOrManager) {
          return (
            <Suspense
              fallback={
                <div className="p-6 space-y-6 max-w-7xl mx-auto">
                  <Skeleton className="h-12 w-64 rounded-xl" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Skeleton className="h-72 rounded-2xl" />
                    <Skeleton className="h-72 rounded-2xl" />
                  </div>
                </div>
              }
            >
              <DashboardV16 onNavigate={(tab) => setCurrentTab(tab)} />
            </Suspense>
          );
        }
        // Fallback for non-management accessing dashboard
        return <POSPage onTryOnProduct={handleLaunchTryOn} />;

      case 'closet':
        return (
          <Suspense
            fallback={
              <div className="p-6 space-y-6 max-w-5xl mx-auto">
                <Skeleton className="h-10 w-48 mx-auto rounded-xl" />
                <Skeleton className="h-[400px] w-full rounded-3xl" />
              </div>
            }
          >
            <ClosetShowcase onSelectProduct={() => setCurrentTab('pos')} />
          </Suspense>
        );

      case 'production':
        return <ProductionPage />;

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
        return <ProductsPage onTryOnProduct={handleLaunchTryOn} />;
      case 'categories':
        return (
          <CategoriesPage
            onSelectProduct={handleLaunchTryOn}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        );
      case 'inventory':
        return <InventoryPage />;
      case 'sales':
        return <SalesPage initialTab="invoices" />;
      case 'returns':
        return <SalesPage initialTab="returns" />;
      case 'customers':
        return <CustomersPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'expenses':
        return isOwnerOrManager ? <ExpensesPage /> : <POSPage />;
      case 'reports':
        return isOwnerOrManager ? <ReportsPage /> : <POSPage />;
      case 'staff':
        return isOwnerOrManager ? <StaffPage /> : <POSPage />;
      case 'branches':
        return isOwnerOrManager ? <SettingsPage /> : <POSPage />;
      case 'settings':
        return isOwnerOrManager ? <SettingsPage /> : <POSPage />;
      case 'subscription':
        return (
          <div className="p-8 max-w-2xl mx-auto space-y-6 text-center">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <CreditCard className="w-12 h-12 text-blue-600 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">Ralypto Retail SaaS Subscription</h3>
              <p className="text-sm text-slate-600">
                Active Tier:{' '}
                <span className="font-bold text-emerald-600">Standard Boutique Plan</span> (Multi-branch,
                Unlimited Variants & Stock Ledger).
              </p>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="p-8 max-w-2xl mx-auto space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span>POS & Inventory Shortcuts</span>
            </h3>
            <div className="space-y-3 text-sm text-slate-700 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Fast Barcode Scanner:</span>
                <span className="font-mono font-bold text-slate-900">Auto-focused on POS screen</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Confirm Sale Tender:</span>
                <span className="font-mono font-bold text-slate-900">Enter key</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Print 80mm Thermal Receipt:</span>
                <span className="font-mono font-bold text-slate-900">Ctrl + P / Click Print 80mm</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>Hold / Recall Order:</span>
                <span className="font-mono font-bold text-slate-900">Cart action menu</span>
              </div>
            </div>
          </div>
        );
      default:
        return isOwnerOrManager ? (
          <Suspense fallback={<Skeleton className="h-96 rounded-2xl m-6" />}>
            <DashboardV16 onNavigate={(tab) => setCurrentTab(tab)} />
          </Suspense>
        ) : (
          <POSPage onTryOnProduct={handleLaunchTryOn} />
        );
    }
  };

  return (
    <MotionProvider>
      <Layout currentTab={currentTab} onSelectTab={setCurrentTab}>
        <PageTransition routeKey={currentTab}>
          {renderContent()}
        </PageTransition>
      </Layout>
      <ToastHost items={toastItems} onDismiss={dismissToast} />
    </MotionProvider>
  );
};
export default App;
