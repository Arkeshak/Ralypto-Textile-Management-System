import React, { useState, useEffect } from 'react';
import {
  Tags,
  Plus,
  Search,
  Sparkles,
  Shirt,
  Layers,
  ArrowRight,
  TrendingUp,
  Package,
  X,
  Check,
  Building2,
  FolderTree,
  ChevronRight,
  Eye,
  Edit2,
  SlidersHorizontal,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { Category, Brand, Product } from '../types';
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
  PillTabs,
} from '../components/ui-pattern';
import { useToastStore } from '../stores/toast.store';

interface CategoriesPageProps {
  onSelectProduct?: (product: Product) => void;
  onNavigate?: (tab: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  onSelectProduct,
  onNavigate,
}) => {
  const { push: pushToast } = useToastStore();

  const [activeTab, setActiveTab] = useState<'categories' | 'brands'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Drawer State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [inspectCategory, setInspectCategory] = useState<Category | null>(null);
  const [inspectBrand, setInspectBrand] = useState<Brand | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [cRes, bRes, pRes] = await Promise.all([
        api.get('/categories'),
        api.get('/brands'),
        api.get('/products'),
      ]);
      if (cRes.success) setCategories(cRes.data);
      if (bRes.success) setBrands(bRes.data);
      if (pRes.success) setProducts(pRes.data);
    } catch (err) {
      console.error('Failed to load categories/brands', err);
      pushToast('Unable to load category hierarchy', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Categories
  const filteredCategories = categories.filter((c) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      c.slug.toLowerCase().includes(q)
    );
  });

  // Filter Brands
  const filteredBrands = brands.filter((b) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      b.name.toLowerCase().includes(q) ||
      (b.description && b.description.toLowerCase().includes(q)) ||
      b.slug.toLowerCase().includes(q)
    );
  });

  // KPI Calculations
  const totalCategories = categories.length;
  const totalBrands = brands.length;
  const totalProducts = products.length;
  const totalInventoryValuation = products.reduce((acc, p) => {
    const stock = p.totalStockOnHand ?? 0;
    return acc + stock * p.basePrice;
  }, 0);

  // Products belonging to inspected category / brand
  const categoryProducts = inspectCategory
    ? products.filter((p) => p.categoryId === inspectCategory.id)
    : [];

  const brandProducts = inspectBrand
    ? products.filter((p) => p.brandId === inspectBrand.id)
    : [];

  return (
    <PageTransition routeKey={`categories-${activeTab}`}>
      <div className="min-h-screen bg-[#f3f4f6] text-slate-900 pb-12">
        <div className="mx-auto max-w-[1360px] p-4 sm:p-6 space-y-6">
          {/* Page Header */}
          <PageHeader
            title="Categories & Brand Architecture"
            subtitle="Structure boutique garment collections, department hierarchy, and designer brand labels"
            icon={Tags}
            right={
              <PressButton
                onClick={() =>
                  activeTab === 'categories'
                    ? setShowAddCategoryModal(true)
                    : setShowAddBrandModal(true)
                }
                className="min-h-12 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 rounded-xl shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {activeTab === 'categories' ? 'Add Category' : 'Add Brand Label'}
                </span>
              </PressButton>
            }
          />

          {/* Top 4 Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Garment Categories"
              value={totalCategories}
              icon={FolderTree}
              suffix=" Collections"
              isHero={true}
              change="Departmental Structure"
              isPositive={true}
            />

            <StatCard
              title="Boutique Brand Labels"
              value={totalBrands}
              icon={Building2}
              suffix=" Labels"
              change="Multi-Brand Catalogue"
              isPositive={true}
            />

            <StatCard
              title="Catalogued Garments"
              value={totalProducts}
              icon={Shirt}
              suffix=" Active Styles"
              change="100% Categorized"
              isPositive={true}
            />

            <StatCard
              title="Inventory Valuation"
              value={Math.round(totalInventoryValuation)}
              icon={TrendingUp}
              prefix="Rs "
              change="Stock on Hand Value"
              isPositive={true}
            />
          </div>

          {/* Segmented Navigation & Search Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* PillTabs Selector */}
              <PillTabs
                tabs={[
                  {
                    id: 'categories',
                    label: 'Garment Categories',
                    badge: categories.length,
                  },
                  {
                    id: 'brands',
                    label: 'Boutique Brands & Labels',
                    badge: brands.length,
                  },
                ]}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as 'categories' | 'brands')}
              />

              {/* Search Box */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'categories'
                      ? 'Search categories, slugs, descriptions...'
                      : 'Search brand labels, designer houses...'
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full min-h-12 pl-10 pr-9 text-xs sm:text-sm font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tab 1: Categories Architecture */}
          {activeTab === 'categories' && (
            <div>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-64 rounded-2xl" />
                  ))}
                </div>
              ) : filteredCategories.length === 0 ? (
                <EmptyState
                  icon={FolderTree}
                  title="No categories found"
                  description={
                    search
                      ? 'No categories match your search keywords.'
                      : 'Create your first boutique garment category to organize products.'
                  }
                  actionLabel="Add Category"
                  onAction={() => setShowAddCategoryModal(true)}
                />
              ) : (
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {filteredCategories.map((c) => {
                    const assignedProds = products.filter((p) => p.categoryId === c.id);
                    const totalUnits = assignedProds.reduce(
                      (acc, p) => acc + (p.totalStockOnHand ?? 0),
                      0
                    );
                    const categoryValuation = assignedProds.reduce(
                      (acc, p) => acc + (p.totalStockOnHand ?? 0) * p.basePrice,
                      0
                    );

                    return (
                      <motion.div
                        key={c.id}
                        variants={fadeUp}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        onClick={() => setInspectCategory(c)}
                        className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md p-5 flex flex-col justify-between cursor-pointer transition-all"
                      >
                        <div>
                          {/* Card Top Banner */}
                          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-2xs">
                                <Tags className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                                  {c.name}
                                </h3>
                                <span className="font-mono text-[11px] text-slate-400">
                                  /{c.slug}
                                </span>
                              </div>
                            </div>

                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {assignedProds.length} Styles
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                            {c.description ||
                              'Ready-to-wear departmental collection and curated wardrobe styles.'}
                          </p>

                          {/* Top 3 Garment Preview Thumbnails */}
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                              Live Garments in Category
                            </span>
                            {assignedProds.length === 0 ? (
                              <div className="text-xs text-slate-400 italic py-1">
                                No garments assigned yet
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                {assignedProds.slice(0, 3).map((p) => (
                                  <div
                                    key={p.id}
                                    className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 truncate max-w-[45%]"
                                    title={p.name}
                                  >
                                    <ImageWithFallback
                                      src={p.imageUrl}
                                      alt={p.name}
                                      className="w-5 h-5 rounded object-cover shrink-0"
                                    />
                                    <span className="truncate">{p.name}</span>
                                  </div>
                                ))}
                                {assignedProds.length > 3 && (
                                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg shrink-0">
                                    +{assignedProds.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Metrics & Footer */}
                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                              Total Inventory
                            </span>
                            <span className="text-xs font-black text-slate-800 tabular-nums">
                              {totalUnits} Units &bull; Rs{' '}
                              {categoryValuation.toLocaleString()}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectCategory(c);
                            }}
                            className="min-h-10 px-3 rounded-xl bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors shadow-2xs"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          )}

          {/* Tab 2: Brands & Labels Architecture */}
          {activeTab === 'brands' && (
            <div>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-64 rounded-2xl" />
                  ))}
                </div>
              ) : filteredBrands.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No brand labels found"
                  description={
                    search
                      ? 'No brands match your search keywords.'
                      : 'Register your in-house fashion label or designer partner.'
                  }
                  actionLabel="Add Brand Label"
                  onAction={() => setShowAddBrandModal(true)}
                />
              ) : (
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {filteredBrands.map((b) => {
                    const brandProds = products.filter((p) => p.brandId === b.id);
                    const totalUnits = brandProds.reduce(
                      (acc, p) => acc + (p.totalStockOnHand ?? 0),
                      0
                    );
                    const avgPrice =
                      brandProds.length > 0
                        ? Math.round(
                            brandProds.reduce((acc, p) => acc + p.basePrice, 0) /
                              brandProds.length
                          )
                        : 0;

                    return (
                      <motion.div
                        key={b.id}
                        variants={fadeUp}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        onClick={() => setInspectBrand(b)}
                        className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md p-5 flex flex-col justify-between cursor-pointer transition-all"
                      >
                        <div>
                          {/* Card Top Banner */}
                          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg shadow-2xs">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                                  {b.name}
                                </h3>
                                <span className="font-mono text-[11px] text-slate-400">
                                  /{b.slug}
                                </span>
                              </div>
                            </div>

                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {brandProds.length} Styles
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                            {b.description ||
                              'Official boutique designer label and artisanal manufacturing partner.'}
                          </p>

                          {/* Sample Garments Chips */}
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                              Representative Garments
                            </span>
                            {brandProds.length === 0 ? (
                              <div className="text-xs text-slate-400 italic py-1">
                                No garments assigned yet
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap">
                                {brandProds.slice(0, 2).map((p) => (
                                  <div
                                    key={p.id}
                                    className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 truncate max-w-[60%]"
                                  >
                                    <ImageWithFallback
                                      src={p.imageUrl}
                                      alt={p.name}
                                      className="w-5 h-5 rounded object-cover shrink-0"
                                    />
                                    <span className="truncate">{p.name}</span>
                                  </div>
                                ))}
                                {brandProds.length > 2 && (
                                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                                    +{brandProds.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Metrics & Footer */}
                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                              Average Selling Price
                            </span>
                            <span className="text-xs font-black text-slate-800 tabular-nums">
                              Rs {avgPrice.toLocaleString()} &bull; {totalUnits} Units
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectBrand(b);
                            }}
                            className="min-h-10 px-3 rounded-xl bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors shadow-2xs"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* -------------------- CATEGORY DETAIL DRAWER -------------------- */}
        <Drawer
          open={Boolean(inspectCategory)}
          onClose={() => setInspectCategory(null)}
          side="right"
        >
          {inspectCategory && (
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl shadow-xs">
                    <Tags className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {inspectCategory.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      /{inspectCategory.slug} &bull; {categoryProducts.length} Garments
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectCategory(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                {inspectCategory.description || 'No description provided for this collection.'}
              </div>

              {/* Garments List in Category */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Garments Assigned ({categoryProducts.length})
                  </span>
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => {
                        setInspectCategory(null);
                        onNavigate('products');
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Open in Catalogue &rarr;
                    </button>
                  )}
                </div>

                {categoryProducts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    No dresses currently linked to this category.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categoryProducts.map((p) => {
                      const stock = p.totalStockOnHand ?? 0;
                      return (
                        <div
                          key={p.id}
                          className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <ImageWithFallback
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-xs text-slate-900 line-clamp-1">
                                {p.name}
                              </div>
                              <div className="text-[11px] text-slate-500 font-black tabular-nums mt-0.5">
                                Rs {p.basePrice.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                stock === 0
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : stock <= 5
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {stock === 0 ? 'Out' : `${stock} pcs`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setInspectCategory(null)}
                  className="w-full min-h-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Close Drawer
                </button>
              </div>
            </div>
          )}
        </Drawer>

        {/* -------------------- BRAND DETAIL DRAWER -------------------- */}
        <Drawer
          open={Boolean(inspectBrand)}
          onClose={() => setInspectBrand(null)}
          side="right"
        >
          {inspectBrand && (
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl shadow-xs">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {inspectBrand.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      /{inspectBrand.slug} &bull; {brandProducts.length} Garments
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectBrand(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                {inspectBrand.description || 'No description recorded for this label.'}
              </div>

              {/* Garments List in Brand */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Garments Under Label ({brandProducts.length})
                  </span>
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => {
                        setInspectBrand(null);
                        onNavigate('products');
                      }}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Open in Catalogue &rarr;
                    </button>
                  )}
                </div>

                {brandProducts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    No dresses assigned to this brand yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {brandProducts.map((p) => {
                      const stock = p.totalStockOnHand ?? 0;
                      return (
                        <div
                          key={p.id}
                          className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <ImageWithFallback
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-xs text-slate-900 line-clamp-1">
                                {p.name}
                              </div>
                              <div className="text-[11px] text-slate-500 font-black tabular-nums mt-0.5">
                                Rs {p.basePrice.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                stock === 0
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : stock <= 5
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {stock === 0 ? 'Out' : `${stock} pcs`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setInspectBrand(null)}
                  className="w-full min-h-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Close Drawer
                </button>
              </div>
            </div>
          )}
        </Drawer>

        {/* -------------------- ADD CATEGORY MODAL -------------------- */}
        {showAddCategoryModal && (
          <AddCategoryModal
            onClose={() => setShowAddCategoryModal(false)}
            onCreated={() => {
              setShowAddCategoryModal(false);
              fetchData();
              pushToast('New garment category registered successfully', 'ok');
            }}
          />
        )}

        {/* -------------------- ADD BRAND MODAL -------------------- */}
        {showAddBrandModal && (
          <AddBrandModal
            onClose={() => setShowAddBrandModal(false)}
            onCreated={() => {
              setShowAddBrandModal(false);
              fetchData();
              pushToast('New brand label registered successfully', 'ok');
            }}
          />
        )}
      </div>
    </PageTransition>
  );
};

// Sub-component: Add Category Modal
interface AddCategoryModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Please provide a category title.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await api.post('/categories', {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
      });

      if (res.success) {
        onCreated();
      } else {
        throw new Error(res.message || 'Failed to create category');
      }
    } catch (err: any) {
      setError(err.message || 'Creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} title="Add Garment Category">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Category Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Sarees & Party Drapes"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full min-h-11 px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Category URL Slug</label>
          <input
            type="text"
            placeholder="e.g. sarees-party-drapes"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full min-h-11 px-3 py-2 text-xs font-mono font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Description</label>
          <textarea
            rows={3}
            placeholder="Describe the department, garment types, or fabrics included..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
          />
        </div>

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
            disabled={isSubmitting}
            className="flex-1 min-h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-md text-xs font-bold flex items-center justify-center rounded-xl transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Category'}
          </PressButton>
        </div>
      </form>
    </Modal>
  );
};

// Sub-component: Add Brand Modal
interface AddBrandModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const AddBrandModal: React.FC<AddBrandModalProps> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Please provide a brand or label name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await api.post('/brands', {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
      });

      if (res.success) {
        onCreated();
      } else {
        throw new Error(res.message || 'Failed to register brand');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} title="Register Brand Label">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Brand / Label Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Royal Silk Heritage"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full min-h-11 px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Brand Code / Slug</label>
          <input
            type="text"
            placeholder="e.g. royal-silk-heritage"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full min-h-11 px-3 py-2 text-xs font-mono font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Heritage & Description</label>
          <textarea
            rows={3}
            placeholder="Describe the label aesthetic, origin, or signature fabrics..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
          />
        </div>

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
            disabled={isSubmitting}
            className="flex-1 min-h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-md text-xs font-bold flex items-center justify-center rounded-xl transition-colors"
          >
            {isSubmitting ? 'Registering...' : 'Register Brand'}
          </PressButton>
        </div>
      </form>
    </Modal>
  );
};

export default CategoriesPage;
