import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Sparkles,
  Eye,
  X,
  AlertCircle,
  Package,
  Layers,
  Tag,
  Check,
  Grid,
  List as ListIcon,
  Copy,
  TrendingUp,
  AlertTriangle,
  Barcode as BarcodeIcon,
  SlidersHorizontal,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { Product, Category, Brand, ProductVariant } from '../types';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import {
  Drawer,
  Modal,
  PressButton,
  Skeleton,
  stagger,
  fadeUp,
  PageTransition,
} from '../lib/motion';
import {
  StatCard,
  CardHeader,
  SectionCard,
  PageHeader,
  EmptyState,
} from '../components/ui-pattern';
import { useToastStore } from '../stores/toast.store';

interface ProductsPageProps {
  onTryOnProduct?: (product: Product) => void;
  initialCategory?: string;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  onTryOnProduct,
  initialCategory = 'ALL',
}) => {
  const { push: pushToast } = useToastStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [inspectProduct, setInspectProduct] = useState<Product | null>(null);
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [pRes, cRes, bRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/brands'),
      ]);
      if (pRes.success) setProducts(pRes.data);
      if (cRes.success) setCategories(cRes.data);
      if (bRes.success) setBrands(bRes.data);
    } catch (err) {
      console.error('Failed to load products', err);
      pushToast('Unable to synchronize products catalogue', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered catalogue logic
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const totalStock = p.totalStockOnHand ?? 0;

    let matchesStock = true;
    if (stockFilter === 'IN_STOCK') {
      matchesStock = totalStock > 5;
    } else if (stockFilter === 'LOW_STOCK') {
      matchesStock = totalStock > 0 && totalStock <= 5;
    } else if (stockFilter === 'OUT_OF_STOCK') {
      matchesStock = totalStock === 0;
    }

    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      p.variants?.some(
        (v) =>
          v.sku?.toLowerCase().includes(q) ||
          v.barcode?.toLowerCase().includes(q) ||
          v.color?.toLowerCase().includes(q) ||
          v.size?.toLowerCase().includes(q)
      );

    return matchesCategory && matchesStock && matchesSearch;
  });

  // KPI Calculations
  const totalProducts = products.length;
  const totalVariants = products.reduce((acc, p) => acc + (p.variants?.length || 0), 0);
  const totalStockUnits = products.reduce((acc, p) => acc + (p.totalStockOnHand ?? 0), 0);
  const lowStockCount = products.filter(
    (p) => (p.totalStockOnHand ?? 0) > 0 && (p.totalStockOnHand ?? 0) <= 5
  ).length;
  const outOfStockCount = products.filter((p) => (p.totalStockOnHand ?? 0) === 0).length;
  const lowAndOutCount = lowStockCount + outOfStockCount;

  const copyToClipboard = (text: string, sku: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSku(sku);
    pushToast(`SKU ${sku} copied to clipboard`, 'ok');
    setTimeout(() => setCopiedSku(null), 2000);
  };

  return (
    <PageTransition routeKey="products-catalogue">
      <div className="min-h-screen bg-[#f3f4f6] text-slate-900 pb-12">
        <div className="mx-auto max-w-[1360px] p-4 sm:p-6 space-y-6">
          {/* Page Header */}
          <PageHeader
            title="Garment Catalogue & SKU Matrix"
            subtitle="Manage ready-to-wear fashion collections, size-colour matrix, barcodes, and live inventory"
            icon={Package}
            right={
              <PressButton
                onClick={() => setShowAddModal(true)}
                className="min-h-12 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 rounded-xl shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Garment</span>
              </PressButton>
            }
          />

          {/* Top 4 Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Active Garment Styles"
              value={totalProducts}
              icon={Package}
              suffix=" Styles"
              isHero={true}
              change={`${totalProducts} Active in POS`}
              isPositive={true}
            />

            <StatCard
              title="Total SKU Matrix"
              value={totalVariants}
              icon={Layers}
              suffix=" SKUs"
              change={`${categories.length} Categories`}
              isPositive={true}
            />

            <StatCard
              title="Inventory on Hand"
              value={totalStockUnits}
              icon={TrendingUp}
              suffix=" Units"
              change={totalStockUnits > 0 ? 'Live Stock' : 'Zero Stock'}
              isPositive={totalStockUnits > 0}
            />

            <StatCard
              title="Low & Out of Stock"
              value={lowAndOutCount}
              icon={AlertTriangle}
              suffix=" Alerts"
              isPositive={lowAndOutCount === 0}
              change={
                lowAndOutCount > 0
                  ? `${outOfStockCount} Out • ${lowStockCount} Low`
                  : 'Healthy Stock'
              }
            />
          </div>

          {/* Filter & Search Toolbar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative w-full lg:w-96 shrink-0">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search garment title, SKU, barcode, colour, size..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full min-h-12 pl-10 pr-9 text-sm font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 transition-all placeholder:text-slate-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Stock Filter Chips & View Mode Toggle */}
              <div className="flex items-center gap-2 justify-between lg:justify-end flex-wrap">
                {/* Stock Level Selector */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setStockFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      stockFilter === 'ALL'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockFilter('IN_STOCK')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      stockFilter === 'IN_STOCK'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-emerald-700 hover:text-emerald-900'
                    }`}
                  >
                    In Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockFilter('LOW_STOCK')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      stockFilter === 'LOW_STOCK'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'text-amber-700 hover:text-amber-900'
                    }`}
                  >
                    Low ({lowStockCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockFilter('OUT_OF_STOCK')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      stockFilter === 'OUT_OF_STOCK'
                        ? 'bg-red-600 text-white shadow-2xs'
                        : 'text-red-700 hover:text-red-900'
                    }`}
                  >
                    Out ({outOfStockCount})
                  </button>
                </div>

                {/* Grid / Table View Switcher */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg text-xs transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-lg text-xs transition-all ${
                      viewMode === 'table'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Table View"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Pills (Horizontal Scrolling) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`min-h-9 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  selectedCategory === 'ALL'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Categories ({products.length})
              </button>
              {categories.map((c) => {
                const count = products.filter((p) => p.categoryId === c.id).length;
                const isSelected = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.id)}
                    className={`min-h-9 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-800">{filteredProducts.length}</strong> of{' '}
              {totalProducts} garments
            </span>
            {(search || selectedCategory !== 'ALL' || stockFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('ALL');
                  setStockFilter('ALL');
                }}
                className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>

          {/* Content Area */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No garments match your filters"
              description={
                search || selectedCategory !== 'ALL' || stockFilter !== 'ALL'
                  ? 'Try clearing your search query or switching to another category.'
                  : 'Start your boutique catalogue by adding your first ready-to-wear dress style.'
              }
              actionLabel="Add Garment"
              onAction={() => setShowAddModal(true)}
            />
          ) : viewMode === 'table' ? (
            /* TABLE VIEW */
            <SectionCard>
              <div className="overflow-x-auto -mx-5 -my-5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-5">Garment Details</th>
                      <th className="py-3.5 px-4">Category & Brand</th>
                      <th className="py-3.5 px-4">Size & Colour Matrix</th>
                      <th className="py-3.5 px-4 text-right">Retail Price</th>
                      <th className="py-3.5 px-4 text-right">Unit Cost</th>
                      <th className="py-3.5 px-4 text-center">Gross Margin</th>
                      <th className="py-3.5 px-4 text-center">Stock on Hand</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredProducts.map((p) => {
                      const totalStock = p.totalStockOnHand ?? 0;
                      const marginPct =
                        p.basePrice > 0
                          ? Math.round(((p.basePrice - p.baseCost) / p.basePrice) * 100)
                          : 0;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <ImageWithFallback
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-12 h-14 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0 shadow-2xs"
                              />
                              <div>
                                <div
                                  className="font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer text-sm"
                                  onClick={() => setInspectProduct(p)}
                                >
                                  {p.name}
                                </div>
                                <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs mt-0.5">
                                  {p.description || 'Ready-to-wear boutique apparel'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800 text-xs">
                              {p.category?.name || 'General Wear'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {p.brand?.name || 'In-House Label'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                              {p.variants?.slice(0, 3).map((v) => (
                                <span
                                  key={v.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700"
                                >
                                  {v.colorHex && (
                                    <span
                                      className="w-2.5 h-2.5 rounded-full border border-slate-300 shadow-2xs"
                                      style={{ backgroundColor: v.colorHex }}
                                    />
                                  )}
                                  <span>
                                    {v.size} / {v.color}
                                  </span>
                                </span>
                              ))}
                              {(p.variants?.length || 0) > 3 && (
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                                  +{(p.variants?.length || 0) - 3} more
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right font-black text-slate-900 tabular-nums text-sm whitespace-nowrap">
                            Rs {p.basePrice.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 text-right font-semibold text-slate-600 tabular-nums text-xs whitespace-nowrap">
                            Rs {p.baseCost.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                              {marginPct}%
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                totalStock === 0
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : totalStock <= 5
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {totalStock === 0 ? 'Out of stock' : `${totalStock} in stock`}
                            </span>
                          </td>

                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {onTryOnProduct && (
                                <button
                                  type="button"
                                  onClick={() => onTryOnProduct(p)}
                                  className="min-h-9 px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1 transition-colors"
                                  title="Try On in Virtual Fitting Room"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Try On</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setInspectProduct(p)}
                                className="min-h-9 px-3 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1 transition-colors shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>Matrix</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          ) : (
            /* GRID VIEW */
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filteredProducts.map((p) => {
                const totalStock = p.totalStockOnHand ?? 0;
                const isOutOfStock = totalStock <= 0;
                const isLow = totalStock > 0 && totalStock <= 5;
                const marginPct =
                  p.basePrice > 0
                    ? Math.round(((p.basePrice - p.baseCost) / p.basePrice) * 100)
                    : 0;

                return (
                  <motion.div
                    key={p.id}
                    layout
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    onClick={() => setInspectProduct(p)}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                  >
                    <div>
                      {/* Garment Image Showcase */}
                      <div className="relative aspect-[4/5] w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                        <ImageWithFallback
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
                          <span className="rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-xs truncate max-w-[55%]">
                            {p.category?.name || 'Garment'}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide border shadow-2xs ${
                              isOutOfStock
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : isLow
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {isOutOfStock ? 'Out of stock' : `${totalStock} in stock`}
                          </span>
                        </div>

                        {/* Brand Tag (Bottom Left of Image) */}
                        {p.brand?.name && (
                          <div className="absolute bottom-2.5 left-2.5 pointer-events-none">
                            <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold tracking-wide">
                              {p.brand.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="p-4 space-y-2.5">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {p.name}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {p.description || 'Exclusive boutique garment collection'}
                          </p>
                        </div>

                        {/* Variant Color Swatches & Sizes */}
                        <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                          {p.variants?.slice(0, 4).map((v) => (
                            <span
                              key={v.id}
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700"
                            >
                              {v.colorHex && (
                                <span
                                  className="w-2 h-2 rounded-full border border-slate-300 shrink-0"
                                  style={{ backgroundColor: v.colorHex }}
                                />
                              )}
                              <span>{v.size}</span>
                            </span>
                          ))}
                          {(p.variants?.length || 0) > 4 && (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                              +{p.variants.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price, Margin & Action Footer */}
                    <div className="p-4 pt-0">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Retail Price
                          </span>
                          <span className="text-base sm:text-lg font-black text-slate-900 tabular-nums">
                            Rs {p.basePrice.toLocaleString()}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Margin
                          </span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {marginPct}%
                          </span>
                        </div>
                      </div>

                      {/* Interactive Buttons */}
                      <div className="flex items-center gap-2 pt-3">
                        {onTryOnProduct && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTryOnProduct(p);
                            }}
                            className="min-h-10 px-3 flex-1 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 flex items-center justify-center gap-1.5 text-xs font-bold transition-colors"
                            title="Try On in AI Virtual Studio"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Try On</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectProduct(p);
                          }}
                          className={`min-h-10 px-3 rounded-xl bg-slate-900 hover:bg-blue-600 text-white flex items-center justify-center gap-1.5 text-xs font-bold transition-colors shadow-2xs ${
                            onTryOnProduct ? 'flex-1' : 'w-full'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>SKU Matrix</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* -------------------- VARIANT MATRIX DRAWER -------------------- */}
        <Drawer
          open={Boolean(inspectProduct)}
          onClose={() => setInspectProduct(null)}
          side="right"
        >
          {inspectProduct && (
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <ImageWithFallback
                    src={inspectProduct.imageUrl}
                    alt={inspectProduct.name}
                    className="w-16 h-20 rounded-2xl object-cover border border-slate-200 bg-slate-100 shadow-sm shrink-0"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {inspectProduct.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {inspectProduct.category?.name || 'Garment'} &bull;{' '}
                      {inspectProduct.brand?.name || 'In-House Label'}
                    </p>
                    <span className="inline-block mt-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {inspectProduct.variants?.length || 0} Size/Color SKUs
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectProduct(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Financial & Stock Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block text-[11px]">
                    Retail Selling Price
                  </span>
                  <span className="text-base font-black text-slate-900 tabular-nums">
                    Rs {inspectProduct.basePrice.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[11px]">
                    Supplier Unit Cost
                  </span>
                  <span className="text-base font-semibold text-slate-700 tabular-nums">
                    Rs {inspectProduct.baseCost.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[11px]">
                    Gross Margin
                  </span>
                  <span className="text-sm font-bold text-emerald-700 tabular-nums">
                    Rs {(inspectProduct.basePrice - inspectProduct.baseCost).toLocaleString()} (
                    {inspectProduct.basePrice > 0
                      ? Math.round(
                          ((inspectProduct.basePrice - inspectProduct.baseCost) /
                            inspectProduct.basePrice) *
                            100
                        )
                      : 0}
                    %)
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-semibold block text-[11px]">
                    Total Available Stock
                  </span>
                  <span
                    className={`text-sm font-black tabular-nums ${
                      (inspectProduct.totalStockOnHand ?? 0) === 0
                        ? 'text-red-600'
                        : (inspectProduct.totalStockOnHand ?? 0) <= 5
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {inspectProduct.totalStockOnHand ?? 0} pcs on hand
                  </span>
                </div>
              </div>

              {/* Variant Matrix Table in Drawer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Size, Colour & Barcode Breakdown
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Click SKU to copy
                  </span>
                </div>

                <div className="space-y-2">
                  {inspectProduct.variants?.map((v) => {
                    const out = (v.stockOnHand ?? 0) === 0;
                    const low = (v.stockOnHand ?? 0) > 0 && (v.stockOnHand ?? 0) <= 3;
                    return (
                      <div
                        key={v.id}
                        className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {v.colorHex && (
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 shadow-2xs"
                                style={{ backgroundColor: v.colorHex }}
                              />
                            )}
                            <span className="font-bold text-xs text-slate-900">
                              {v.size} &bull; {v.color}
                            </span>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              out
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : low
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {out ? 'Out of stock' : `${v.stockOnHand ?? 0} in stock`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(v.sku, v.sku)}
                              className="font-mono text-slate-700 hover:text-blue-600 flex items-center gap-1 font-semibold"
                              title="Click to copy SKU"
                            >
                              <span>{v.sku}</span>
                              {copiedSku === v.sku ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 opacity-40 hover:opacity-100" />
                              )}
                            </button>

                            {v.barcode && (
                              <span className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
                                <BarcodeIcon className="w-3 h-3" />
                                <span>{v.barcode}</span>
                              </span>
                            )}
                          </div>

                          <span className="font-black text-slate-900 tabular-nums">
                            Rs {v.sellingPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                {onTryOnProduct && (
                  <PressButton
                    onClick={() => {
                      const prod = inspectProduct;
                      setInspectProduct(null);
                      onTryOnProduct(prod);
                    }}
                    className="w-full min-h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 rounded-xl shadow-md transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Try Garment in AI Fashion Studio</span>
                  </PressButton>
                )}
                <button
                  type="button"
                  onClick={() => setInspectProduct(null)}
                  className="w-full min-h-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Close Matrix
                </button>
              </div>
            </div>
          )}
        </Drawer>

        {/* -------------------- ADD GARMENT MODAL -------------------- */}
        {showAddModal && (
          <AddProductModal
            categories={categories}
            brands={brands}
            onClose={() => setShowAddModal(false)}
            onCreated={() => {
              setShowAddModal(false);
              fetchData();
              pushToast('New garment and SKU matrix created successfully', 'ok');
            }}
          />
        )}
      </div>
    </PageTransition>
  );
};

// Sub-component: Add Product Modal with Multi-Variant Matrix Generator
interface AddProductModalProps {
  categories: Category[];
  brands: Brand[];
  onClose: () => void;
  onCreated: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  categories,
  brands,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [brandId, setBrandId] = useState(brands[0]?.id || '');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number>(6500);
  const [baseCost, setBaseCost] = useState<number>(3500);
  const [imageUrl, setImageUrl] = useState('');
  const [initialStockPerVariant, setInitialStockPerVariant] = useState<number>(8);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', 'Free Size'];
  const availableColors = [
    { name: 'Black', hex: '#0F172A' },
    { name: 'White', hex: '#F8FAFC' },
    { name: 'Emerald Green', hex: '#047857' },
    { name: 'Midnight Navy', hex: '#1E293B' },
    { name: 'Maroon Crimson', hex: '#991B1B' },
    { name: 'Mustard Gold', hex: '#D97706' },
    { name: 'Sky Blue', hex: '#38BDF8' },
    { name: 'Rose Pink', hex: '#F472B6' },
    { name: 'Olive Drab', hex: '#4D7C0F' },
    { name: 'Lavender', hex: '#A855F7' },
  ];

  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L']);
  const [selectedColors, setSelectedColors] = useState<string[]>([
    'Emerald Green',
    'Midnight Navy',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName]
    );
  };

  const generatedVariantsCount = selectedSizes.length * selectedColors.length;
  const estimatedProfit = Math.max(0, basePrice - baseCost);
  const marginPct =
    basePrice > 0 ? Math.round(((basePrice - baseCost) / basePrice) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedSizes.length === 0 || selectedColors.length === 0) {
      setError('Please provide garment title and select at least one size and colour.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const variants = [];
      const prefix =
        name
          .replace(/[^a-zA-Z]/g, '')
          .slice(0, 3)
          .toUpperCase() || 'DRS';

      let counter = 1;
      for (const colorName of selectedColors) {
        const colorObj = availableColors.find((c) => c.name === colorName);
        for (const size of selectedSizes) {
          const sku = `${prefix}-${colorName.slice(0, 3).toUpperCase()}-${size}`;
          const barcode = `794${Date.now().toString().slice(-6)}${counter++}`;
          variants.push({
            sku,
            barcode,
            size,
            color: colorName,
            colorHex: colorObj?.hex || '#1E293B',
            costPrice: baseCost,
            sellingPrice: basePrice,
            reorderLevel: 5,
            initialStock: initialStockPerVariant,
            stockOnHand: initialStockPerVariant,
          });
        }
      }

      const payload = {
        name,
        categoryId: categoryId || categories[0]?.id || 'cat-dresses',
        brandId: brandId || undefined,
        description,
        basePrice,
        baseCost,
        imageUrl:
          imageUrl ||
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
        variants,
      };

      const res = await api.post('/products', payload);
      if (res.success) {
        onCreated();
      } else {
        throw new Error(res.message || 'Failed to create product');
      }
    } catch (err: any) {
      setError(err.message || 'Creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} title="Add Garment & Variant Matrix">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Title */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Garment / Dress Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. Linen Sleeveless Summer Dress"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full min-h-11 px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Category & Brand Dropdowns */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full min-h-11 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Brand / Label</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full min-h-11 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="">In-House Label</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing Economics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Retail Selling Price (Rs) *
            </label>
            <input
              type="number"
              required
              min={0}
              value={basePrice}
              onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
              className="w-full min-h-11 px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Supplier Unit Cost (Rs) *
            </label>
            <input
              type="number"
              required
              min={0}
              value={baseCost}
              onChange={(e) => setBaseCost(parseFloat(e.target.value) || 0)}
              className="w-full min-h-11 px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Live Margin Calculation Indicator */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">Calculated Gross Profit:</span>
          <span className="font-black text-emerald-700">
            Rs {estimatedProfit.toLocaleString()} ({marginPct}% margin)
          </span>
        </div>

        {/* Image URL with Preview */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Garment Image URL</label>
          <div className="flex items-center gap-3">
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full min-h-11 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {imageUrl && (
              <ImageWithFallback
                src={imageUrl}
                alt="Preview"
                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
              />
            )}
          </div>
        </div>

        {/* Sizes Selector */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">Select Sizes ({selectedSizes.length})</label>
            <span className="text-[11px] text-slate-500">Pick all available fits</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableSizes.map((s) => {
              const isChecked = selectedSizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className={`min-h-9 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isChecked
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Colors Selector */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              Select Colours ({selectedColors.length})
            </label>
            <span className="text-[11px] text-slate-500">Pick fabric hues</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {availableColors.map((c) => {
              const isChecked = selectedColors.includes(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => toggleColor(c.name)}
                  className={`min-h-10 px-2.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                    isChecked
                      ? 'bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 shadow-2xs"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="truncate">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Opening stock per variant */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-800 block">Opening Stock Per Variant</span>
            <span className="text-[11px] text-slate-500">
              Total stock created: {generatedVariantsCount * initialStockPerVariant} units
            </span>
          </div>
          <input
            type="number"
            min={0}
            value={initialStockPerVariant}
            onChange={(e) => setInitialStockPerVariant(parseInt(e.target.value) || 0)}
            className="w-24 min-h-10 px-3 py-1.5 text-right font-black rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-12 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <PressButton
            type="submit"
            disabled={isSubmitting || generatedVariantsCount === 0}
            className="flex-1 min-h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-md text-xs font-bold flex items-center justify-center rounded-xl transition-colors disabled:opacity-50"
          >
            {isSubmitting
              ? 'Generating Matrix...'
              : `Create ${generatedVariantsCount} Variants`}
          </PressButton>
        </div>
      </form>
    </Modal>
  );
};

export default ProductsPage;
