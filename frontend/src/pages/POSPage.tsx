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
import { Product, Category, Customer, Sale } from '../types';
import { ProductCard } from '../components/pos/ProductCard';
import { VariantSelectModal } from '../components/pos/VariantSelectModal';
import { CartPanel } from '../components/pos/CartPanel';
import { PaymentModal } from '../components/pos/PaymentModal';
import { ReceiptModal } from '../components/pos/ReceiptModal';

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
          setBarcodeAlert(`"${item.productName} (${item.size}/${item.color})" is out of stock.`);
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
          setBarcodeAlert(`Maximum available stock reached for this item.`);
        } else {
          setBarcodeInput('');
        }
      }
    } catch (err: any) {
      setBarcodeAlert(err.message || `No clothing variant found for barcode: ${code}`);
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
    <div className="h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row overflow-hidden bg-surface-secondary">
      {/* LEFT SECTION: Catalog & Barcode Scanner */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 space-y-4">
        {/* Barcode scanner & Text search row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Barcode Hardware Reader Input */}
          <form onSubmit={handleBarcodeSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-action-500">
              <Barcode className="w-4 h-4" />
            </div>
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan barcode or enter SKU..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="input-field pl-10 pr-20 text-xs sm:text-sm font-medium"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-3xs font-semibold bg-neutral-200 text-label-secondary rounded border border-neutral-300">
                ↵ Enter
              </kbd>
            </div>
          </form>

          {/* Keyword Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-label-tertiary">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search dress name, color, style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 text-xs sm:text-sm font-medium"
            />
          </div>
        </div>

        {/* Barcode Alert Banner */}
        {barcodeAlert && (
          <div className="p-3 bg-error-50 border border-error-100 rounded-xl flex items-center justify-between text-error-700 text-xs font-medium animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-error-600" />
              <span>{barcodeAlert}</span>
            </div>
            <button
              onClick={() => setBarcodeAlert(null)}
              className="text-error-500 hover:text-error-700 ml-2"
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategoryId === 'all'
                ? 'bg-label-primary text-white border-label-primary shadow-xs'
                : 'bg-white text-label-secondary border-separator hover:text-label-primary'
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-action-500 text-white border-action-500 shadow-xs'
                    : 'bg-white text-label-secondary border-separator hover:text-label-primary'
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
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-64 bg-neutral-200/60 rounded-2xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
                <ShoppingBag className="w-6 h-6 text-label-tertiary" />
              </div>
              <div className="font-semibold text-label-primary text-sm">No products found</div>
              <p className="text-xs text-label-secondary mt-1">
                Try adjusting your category filter or search keywords.
              </p>
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
    <div className="modal-overlay">
      <div className="modal-panel max-w-sm">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">New Customer</h3>
            <p className="text-xs text-label-secondary mt-0.5">Quick register for POS receipt & loyalty</p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body space-y-3.5">
          {error && (
            <div className="p-2.5 bg-error-50 border border-error-100 text-error-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="input-label">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ruwanthi Perera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Mobile Phone (Sri Lanka) *</label>
            <input
              type="tel"
              required
              placeholder="e.g. 0771234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field font-mono"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Email (Optional)</label>
            <input
              type="email"
              placeholder="customer@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Store Credit Limit (LKR)</label>
            <input
              type="number"
              placeholder="0"
              value={creditLimit || ''}
              onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
              className="input-field font-semibold"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1"
            >
              {isSubmitting ? 'Saving...' : 'Save & Select'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
