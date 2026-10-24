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
} from 'lucide-react';
import { api } from '../services/api';
import { Product, Category, Brand } from '../types';
import { ImageWithFallback } from '../components/common/ImageWithFallback';

interface ProductsPageProps {
  onTryOnProduct?: (product: Product) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onTryOnProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
      p.variants?.some(
        (v) =>
          v.sku?.toLowerCase().includes(search.toLowerCase()) ||
          v.barcode?.toLowerCase().includes(search.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const totalProducts = products.length;
  const totalVariants = products.reduce((acc, p) => acc + (p.variants?.length || 0), 0);
  const lowStockCount = products.filter((p) => (p.totalStockOnHand ?? 0) > 0 && (p.totalStockOnHand ?? 0) <= 5).length;
  const outOfStockCount = products.filter((p) => (p.totalStockOnHand ?? 0) === 0).length;

  const copyToClipboard = (text: string, sku: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  return (
    <div className="page-wrapper space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Products & Variants</h1>
          <p className="page-subtitle">
            Manage your fashion garments, size-colour variant matrix, barcodes, and live retail inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Add Garment</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="kpi-label">Active Styles</span>
            <div className="w-8 h-8 rounded-xl bg-action-50 text-action-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">{totalProducts}</div>
          <span className="text-2xs text-label-secondary font-medium">Garments in catalogue</span>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="kpi-label">Total SKUs</span>
            <div className="w-8 h-8 rounded-xl bg-neutral-100 text-label-secondary flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">{totalVariants}</div>
          <span className="text-2xs text-label-secondary font-medium">Size & colour combinations</span>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="kpi-label">Low Stock</span>
            <div className="w-8 h-8 rounded-xl bg-warning-50 text-warning-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value text-warning-600">{lowStockCount}</div>
          <span className="text-2xs text-label-secondary font-medium">Under 5 units remaining</span>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <span className="kpi-label">Out of Stock</span>
            <div className="w-8 h-8 rounded-xl bg-error-50 text-error-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value text-error-600">{outOfStockCount}</div>
          <span className="text-2xs text-label-secondary font-medium">Require immediate restock</span>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="card p-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="search-field w-full lg:w-80 shrink-0">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by dress title, SKU, barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Pills & View Switcher */}
        <div className="flex items-center gap-2 justify-between lg:justify-end min-w-0 flex-1">
          <div className="flex items-center bg-surface-secondary p-1 rounded-xl border border-separator overflow-x-auto scrollbar-none min-w-0">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                selectedCategory === 'ALL'
                  ? 'bg-white text-label-primary shadow-xs'
                  : 'text-label-secondary hover:text-label-primary'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  selectedCategory === c.id
                    ? 'bg-white text-label-primary shadow-xs'
                    : 'text-label-secondary hover:text-label-primary'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Grid / Table Toggle */}
          <div className="flex items-center bg-surface-secondary p-1 rounded-xl border border-separator shrink-0 ml-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-label-primary shadow-xs'
                  : 'text-label-tertiary hover:text-label-primary'
              }`}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-label-primary shadow-xs'
                  : 'text-label-tertiary hover:text-label-primary'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="card p-12 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-action-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-label-secondary">Loading fashion catalogue...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <Package className="w-6 h-6 text-label-tertiary" />
          </div>
          <h3 className="empty-state-title">No products found</h3>
          <p className="empty-state-desc">
            {search || selectedCategory !== 'ALL'
              ? 'Try adjusting your search terms or category filter.'
              : 'Start your retail catalogue by adding your first clothing dress.'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary mt-4"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Product</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="py-3 px-5 min-w-[280px]">Garment Details</th>
                  <th className="py-3 px-4 min-w-[140px]">Category & Brand</th>
                  <th className="py-3 px-4 min-w-[200px]">Size & Colour Matrix</th>
                  <th className="py-3 px-4 min-w-[130px] text-right whitespace-nowrap">Retail Price</th>
                  <th className="py-3 px-4 min-w-[130px] text-center whitespace-nowrap">Stock on Hand</th>
                  <th className="py-3 px-5 min-w-[170px] text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-separator/40">
                {filteredProducts.map((p) => {
                  const totalStock = p.totalStockOnHand ?? 0;
                  return (
                    <tr key={p.id}>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3.5">
                          <ImageWithFallback
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-separator bg-surface-secondary shrink-0 shadow-2xs"
                          />
                          <div>
                            <div className="font-semibold text-label-primary hover:text-action-500 transition-colors cursor-pointer" onClick={() => setInspectProduct(p)}>
                              {p.name}
                            </div>
                            <div className="text-2xs text-label-secondary line-clamp-1 max-w-xs mt-0.5">
                              {p.description || 'No description added'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-label-primary text-xs">
                          {p.category?.name || 'General'}
                        </div>
                        <div className="text-2xs text-label-tertiary">
                          {p.brand?.name || 'In-House Label'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                          {p.variants?.slice(0, 3).map((v) => (
                            <span
                              key={v.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-secondary border border-separator text-2xs font-semibold text-label-secondary"
                            >
                              {v.colorHex && (
                                <span
                                  className="w-2 h-2 rounded-full border border-separator"
                                  style={{ backgroundColor: v.colorHex }}
                                />
                              )}
                              <span>{v.size} / {v.color}</span>
                            </span>
                          ))}
                          {(p.variants?.length || 0) > 3 && (
                            <span className="text-2xs font-bold text-action-600 bg-action-50 px-2 py-0.5 rounded-md">
                              +{(p.variants?.length || 0) - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-label-primary tabular-nums text-sm whitespace-nowrap">
                        LKR {p.basePrice.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`badge ${
                            totalStock === 0
                              ? 'badge-error'
                              : totalStock <= 5
                              ? 'badge-warning'
                              : 'badge-success'
                          }`}
                        >
                          {totalStock === 0 ? 'Out of stock' : `${totalStock} in stock`}
                        </span>
                      </td>

                      <td className="py-3 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {onTryOnProduct && (
                            <button
                              onClick={() => onTryOnProduct(p)}
                              className="btn-secondary btn-sm !px-2.5 !py-1 text-action-600 bg-action-50/50 hover:bg-action-50 border-action-100"
                              title="Try this garment in AI Fashion Studio"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-action-500" />
                              <span>Try On</span>
                            </button>
                          )}
                          <button
                            onClick={() => setInspectProduct(p)}
                            className="btn-secondary btn-sm !px-2.5 !py-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-label-secondary" />
                            <span>Variants</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const totalStock = p.totalStockOnHand ?? 0;
            return (
              <div key={p.id} className="card-hover overflow-hidden flex flex-col group">
                {/* Image & Stock Badge Overlay */}
                <div className="relative aspect-3/4 w-full bg-surface-secondary border-b border-separator overflow-hidden">
                  <ImageWithFallback
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Stock & Category Badges */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
                    <span
                      className={`badge backdrop-blur-md shrink-0 ${
                        totalStock === 0
                          ? 'bg-error-500/90 text-white border-transparent'
                          : totalStock <= 5
                          ? 'bg-warning-500/90 text-white border-transparent'
                          : 'bg-white/90 text-label-primary shadow-xs'
                      }`}
                    >
                      {totalStock === 0 ? 'Out of stock' : `${totalStock} in stock`}
                    </span>

                    <span className="badge bg-white/90 text-label-primary shadow-xs truncate max-w-[50%]">
                      {p.category?.name || 'General'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-semibold text-label-primary text-sm line-clamp-1 group-hover:text-action-500 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-2xs text-label-secondary line-clamp-1 mt-0.5">
                      {p.description || 'No description'}
                    </p>
                  </div>

                  {/* Size chips */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {p.variants?.slice(0, 4).map((v) => (
                      <span
                        key={v.id}
                        className="text-3xs font-semibold px-1.5 py-0.5 rounded bg-surface-secondary text-label-secondary border border-separator/60"
                      >
                        {v.size}
                      </span>
                    ))}
                    {(p.variants?.length || 0) > 4 && (
                      <span className="text-3xs text-label-tertiary font-medium">
                        +{p.variants.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Price & Actions */}
                  <div className="pt-2 border-t border-separator/60 flex items-center justify-between">
                    <div>
                      <span className="text-3xs text-label-tertiary block font-medium">RETAIL</span>
                      <span className="text-sm font-bold text-label-primary tabular-nums">
                        LKR {p.basePrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onTryOnProduct && (
                        <button
                          onClick={() => onTryOnProduct(p)}
                          className="btn-secondary btn-sm !px-2 text-action-600 bg-action-50/60"
                          title="Try On in AI Studio"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setInspectProduct(p)}
                        className="btn-secondary btn-sm !px-2.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-label-secondary" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Variants Modal */}
      {inspectProduct && (
        <div className="modal-overlay">
          <div className="modal-panel max-w-2xl">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{inspectProduct.name}</h3>
                <p className="text-xs text-label-secondary mt-0.5">
                  Variant matrix, barcodes, SKUs, and stock on hand
                </p>
              </div>
              <button
                onClick={() => setInspectProduct(null)}
                className="btn-icon"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body !p-0">
              <div className="overflow-x-auto max-h-[60vh]">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="py-2.5 px-4">Size & Colour</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Barcode</th>
                      <th className="py-2.5 px-3 text-right">Cost</th>
                      <th className="py-2.5 px-3 text-right">Retail</th>
                      <th className="py-2.5 px-4 text-center">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-separator/40">
                    {inspectProduct.variants?.map((v) => (
                      <tr key={v.id}>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            {v.colorHex && (
                              <span
                                className="w-3 h-3 rounded-full border border-separator shrink-0"
                                style={{ backgroundColor: v.colorHex }}
                              />
                            )}
                            <span className="font-semibold text-xs text-label-primary">
                              {v.size} / {v.color}
                            </span>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 font-mono text-xs text-label-secondary">
                          <button
                            onClick={() => copyToClipboard(v.sku, v.sku)}
                            className="inline-flex items-center gap-1 hover:text-action-500"
                            title="Click to copy SKU"
                          >
                            <span>{v.sku}</span>
                            {copiedSku === v.sku ? (
                              <Check className="w-3 h-3 text-success-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 opacity-40 hover:opacity-100" />
                            )}
                          </button>
                        </td>

                        <td className="py-2.5 px-3 font-mono text-2xs text-label-secondary">
                          {v.barcode || '—'}
                        </td>

                        <td className="py-2.5 px-3 text-right text-xs tabular-nums text-label-secondary">
                          LKR {v.costPrice.toLocaleString()}
                        </td>

                        <td className="py-2.5 px-3 text-right text-xs font-bold tabular-nums text-label-primary">
                          LKR {v.sellingPrice.toLocaleString()}
                        </td>

                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={`badge ${
                              (v.stockOnHand ?? 0) === 0
                                ? 'badge-error'
                                : (v.stockOnHand ?? 0) <= 3
                                ? 'badge-warning'
                                : 'badge-success'
                            }`}
                          >
                            {v.stockOnHand ?? 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer justify-between">
              {onTryOnProduct ? (
                <button
                  onClick={() => {
                    const prod = inspectProduct;
                    setInspectProduct(null);
                    onTryOnProduct(prod);
                  }}
                  className="btn-secondary text-action-600 bg-action-50 border-action-100"
                >
                  <Sparkles className="w-4 h-4 text-action-500" />
                  <span>Try Garment in AI Fashion Studio</span>
                </button>
              ) : <div />}

              <button
                onClick={() => setInspectProduct(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          categories={categories}
          brands={brands}
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            fetchData();
          }}
        />
      )}
    </div>
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
  const [basePrice, setBasePrice] = useState<number>(4500);
  const [baseCost, setBaseCost] = useState<number>(2500);
  const [imageUrl, setImageUrl] = useState('');
  const [initialStockPerVariant, setInitialStockPerVariant] = useState<number>(10);

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
  ];

  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L']);
  const [selectedColors, setSelectedColors] = useState<string[]>(['Emerald Green', 'Midnight Navy']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const generatedVariantsCount = selectedSizes.length * selectedColors.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedSizes.length === 0 || selectedColors.length === 0) {
      setError('Please provide product name and at least one size and colour.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const variants = [];
      const prefix = name
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
          });
        }
      }

      const payload = {
        name,
        categoryId,
        brandId: brandId || undefined,
        description,
        basePrice,
        baseCost,
        imageUrl: imageUrl || undefined,
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
    <div className="modal-overlay">
      <div className="modal-panel max-w-2xl max-h-[90vh] flex flex-col">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Add Garment & Variant Matrix</h3>
            <p className="text-xs text-label-secondary mt-0.5">
              Create a new style and auto-generate size-colour inventory combinations
            </p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body flex-1 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-error-50 border border-error-100 text-error-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Garment Basic Information */}
          <div className="space-y-4">
            <span className="section-label">1. General Information</span>

            <div className="form-group">
              <label className="input-label">Garment / Dress Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Linen Sleeveless Summer Dress"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="input-label">Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="input-field"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="input-label">Brand / Label</label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="input-field"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="input-label">Retail Selling Price (LKR) *</label>
                <input
                  type="number"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                  className="input-field font-semibold"
                />
              </div>

              <div className="form-group">
                <label className="input-label">Supplier Unit Cost (LKR) *</label>
                <input
                  type="number"
                  required
                  value={baseCost}
                  onChange={(e) => setBaseCost(parseFloat(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Product Image URL (Optional)</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Variant Matrix Generator */}
          <div className="p-4 rounded-xl bg-surface-secondary border border-separator space-y-4">
            <div className="flex items-center justify-between">
              <span className="section-label !text-label-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-action-500" />
                <span>2. Multi-Variant Matrix Generator</span>
              </span>
              <span className="badge badge-action">
                {generatedVariantsCount} variants
              </span>
            </div>

            {/* Sizes */}
            <div>
              <label className="input-label">Select Available Sizes</label>
              <div className="flex flex-wrap gap-1.5">
                {availableSizes.map((s) => {
                  const isChecked = selectedSizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        isChecked
                          ? 'bg-action-500 text-white border-action-500 shadow-2xs'
                          : 'bg-white text-label-secondary border-separator hover:bg-neutral-50'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="input-label">Select Garment Colours</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {availableColors.map((c) => {
                  const isChecked = selectedColors.includes(c.name);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => toggleColor(c.name)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                        isChecked
                          ? 'bg-white border-action-500 ring-2 ring-action-500/20 text-label-primary font-semibold'
                          : 'bg-white border-separator text-label-secondary hover:bg-neutral-50'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-separator shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Opening Stock */}
            <div className="pt-3 border-t border-separator/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-label-primary block">
                  Opening stock per variant
                </span>
                <span className="text-2xs text-label-tertiary">
                  Initial stock quantity created in warehouse inventory
                </span>
              </div>
              <input
                type="number"
                min={0}
                value={initialStockPerVariant}
                onChange={(e) => setInitialStockPerVariant(parseInt(e.target.value) || 0)}
                className="input-field w-24 text-right font-bold"
              />
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'Creating...' : `Create ${generatedVariantsCount} Variants`}
          </button>
        </div>
      </div>
    </div>
  );
};
