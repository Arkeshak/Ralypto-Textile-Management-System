import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Barcode,
  ShoppingBag,
  AlertCircle,
  X,
  User,
  Plus,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../stores/auth.store';
import { useCartStore } from '../stores/cart.store';
import { useToastStore } from '../stores/toast.store';
import { Product, Category, Customer, Sale } from '../types';
import { ProductCard } from '../components/pos/ProductCard';
import { VariantSelectModal } from '../components/pos/VariantSelectModal';
import { CartPanel } from '../components/pos/CartPanel';
import { PaymentModal } from '../components/pos/PaymentModal';
import { ReceiptModal } from '../components/pos/ReceiptModal';
import { Modal, PressButton } from '../lib/motion';

interface POSPageProps {
  onTryOnProduct?: (product: Product) => void;
}

export const POSPage: React.FC<POSPageProps> = ({ onTryOnProduct }) => {
  const { activeBranchId } = useAuthStore();
  const { addItem } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [barcodeAlert, setBarcodeAlert] = useState<string | null>(null);

  // Modals state
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState<boolean>(false);

  // Barcode input ref for quick autofocus
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch initial products & categories
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [prodsRes, catsRes, custsRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/customers'),
      ]);

      if (prodsRes.success) setProducts(prodsRes.data);
      if (catsRes.success) setCategories(catsRes.data);
      if (custsRes.success) setCustomers(custsRes.data);
    } catch (err) {
      console.error('Failed to load POS data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeBranchId]);

  const { push: pushToast } = useToastStore();

  // 2. Barcode scanner fast handle
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    try {
      setBarcodeAlert(null);
      const res = await api.get(`/products/search-barcode/${encodeURIComponent(code)}`);

      if (res.success && res.data) {
        const item = res.data;
        if (item.stockOnHand <= 0) {
          pushToast(`"${item.productName} (${item.size}/${item.color})" is out of stock.`, 'warn');
          return;
        }

        const success = addItem({
          variantId: item.variantId,
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          barcode: item.barcode,
          size: item.size,
          color: item.color,
          colorHex: item.colorHex,
          unitPrice: item.sellingPrice,
          unitCost: item.costPrice,
          stockOnHand: item.stockOnHand,
          imageUrl: item.imageUrl,
        });

        if (!success) {
          pushToast(`Maximum available stock reached for ${item.productName}.`, 'warn');
        } else {
          pushToast(`Scanned: ${item.productName} (${item.size})`, 'ok');
          setBarcodeInput('');
        }
      }
    } catch (err: any) {
      pushToast(err.message || `No clothing variant found for barcode: ${code}`, 'error');
    }
  };

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.variants?.some(
        (v) =>
          v.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (v.barcode && v.barcode.includes(searchQuery)) ||
          v.color?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row overflow-hidden bg-[#f3f4f6]">
      {/* LEFT SECTION: Catalog & Barcode Scanner */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 space-y-4">
        {/* Barcode scanner & Text search row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Barcode Hardware Reader Input */}
          <form onSubmit={handleBarcodeSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600">
              <Barcode className="w-5 h-5" />
            </div>
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan barcode or enter SKU..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full min-h-12 pl-11 pr-20 text-sm font-semibold rounded-xl bg-white border border-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <kbd className="px-2 py-0.5 text-xs font-bold bg-slate-100 text-slate-500 rounded border border-slate-200">
                ↵ Enter
              </kbd>
            </div>
          </form>

          {/* Keyword Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search dress name, color, style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-12 pl-11 pr-4 text-sm font-semibold rounded-xl bg-white border border-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
            />
          </div>
        </div>

        {/* Barcode Alert Banner */}
        {barcodeAlert && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{barcodeAlert}</span>
            </div>
            <button
              onClick={() => setBarcodeAlert(null)}
              className="text-red-500 hover:text-red-700 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Category Shortcut Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategoryId('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategoryId === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Collections
          </button>
          {categories.map((c) => {
            const isSelected = selectedCategoryId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategoryId(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-64 bg-slate-200/70 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="font-bold text-slate-800 text-base">No products found</div>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Try adjusting your category filter or search keywords.
              </p>
              <button
                onClick={() => {
                  setSelectedCategoryId('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Show All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(prod) => setActiveModalProduct(prod)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Cart and Checkout Panel */}
      <div className="w-full lg:w-96 xl:w-[420px] p-4 lg:p-6 lg:pl-0 h-auto lg:h-full shrink-0 flex flex-col">
        <CartPanel
          customers={customers}
          onOpenPayment={() => setShowPaymentModal(true)}
          onOpenNewCustomer={() => setShowNewCustomerModal(true)}
        />
      </div>

      {/* MODALS */}
      {/* 1. Variant Picker (Size & Color) */}
      {activeModalProduct && (
        <VariantSelectModal
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
          onTryOn={onTryOnProduct}
          onAdded={() => {
            setTimeout(() => barcodeInputRef.current?.focus(), 100);
          }}
        />
      )}

      {/* 2. Payment Checkout */}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(sale) => {
            setShowPaymentModal(false);
            setCompletedSale(sale);
          }}
        />
      )}

      {/* 3. Completed Sale & Receipt Modal */}
      {completedSale && (
        <ReceiptModal
          sale={completedSale}
          onClose={() => setCompletedSale(null)}
          onNewSale={() => {
            setCompletedSale(null);
            setTimeout(() => barcodeInputRef.current?.focus(), 100);
          }}
        />
      )}

      {/* 4. Quick Add Customer Modal */}
      {showNewCustomerModal && (
        <QuickAddCustomerModal
          onClose={() => setShowNewCustomerModal(false)}
          onCreated={(newCust) => {
            setCustomers([newCust, ...customers]);
            setShowNewCustomerModal(false);
          }}
        />
      )}
    </div>
  );
};

// Sub-component: Quick Register Customer Modal
interface QuickAddCustomerModalProps {
  onClose: () => void;
  onCreated: (customer: Customer) => void;
}

const QuickAddCustomerModal: React.FC<QuickAddCustomerModalProps> = ({
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [creditLimit, setCreditLimit] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      setError('Customer name and phone number are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await api.post('/customers', {
        name,
        phone,
        email: email || undefined,
        creditLimit,
      });

      if (res.success && res.data) {
        onCreated(res.data);
      } else {
        throw new Error(res.message || 'Failed to create customer');
      }
    } catch (err: any) {
      setError(err.message || 'Could not register customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} title="New Client Registration">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Full Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Ruwanthi Perera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Mobile Phone (Sri Lanka) *</label>
          <input
            type="tel"
            required
            placeholder="e.g. 0771234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Email (Optional)</label>
          <input
            type="email"
            placeholder="customer@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Credit Limit (Rs)</label>
          <input
            type="number"
            placeholder="0"
            value={creditLimit || ''}
            onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-12 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <PressButton
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md text-xs font-bold flex items-center justify-center"
          >
            {isSubmitting ? 'Saving...' : 'Save & Select'}
          </PressButton>
        </div>
      </form>
    </Modal>
  );
};
