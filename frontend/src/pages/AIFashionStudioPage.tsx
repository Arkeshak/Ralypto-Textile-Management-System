import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Camera,
  Layers,
  ShoppingBag,
  Trash2,
  Download,
  Share2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Wand2,
  Palette,
  Image as ImageIcon,
  Check,
  ArrowRight,
  RefreshCw,
  Eye,
  Percent,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Product, ProductVariant, AITryOnJob, RecommendedOutfit, PhotoStudioJob, InventoryInsightItem } from '../types';
import { api } from '../services/api';
import { useCartStore } from '../stores/cart.store';
import { PhotoUploadZone } from '../components/ai/PhotoUploadZone';
import { ComparisonSlider } from '../components/ai/ComparisonSlider';

interface AIFashionStudioProps {
  initialProduct?: Product | null;
  onNavigate?: (tab: string) => void;
}

export const AIFashionStudioPage: React.FC<AIFashionStudioProps> = ({
  initialProduct,
  onNavigate,
}) => {
  // Navigation sub-tab
  const [activeTab, setActiveTab] = useState<'try-on' | 'stylist' | 'photo-studio' | 'insights'>('try-on');

  // Provider and Quota Info
  const [aiInfo, setAiInfo] = useState<{
    provider: string;
    isDevelopmentMode: boolean;
    remainingGenerationsToday: number;
    supportedCategories: string[];
    costPerGenerationLkr: number;
  } | null>(null);

  // Products Catalogue
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isGarmentModalOpen, setIsGarmentModalOpen] = useState(false);

  // --- VIRTUAL TRY-ON STATE ---
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct || null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [category, setCategory] = useState<'dresses' | 'tops' | 'bottoms' | 'one-pieces'>('dresses');
  const [personImage, setPersonImage] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80');
  const [consentConfirmed, setConsentConfirmed] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [activeJob, setActiveJob] = useState<AITryOnJob | null>(null);
  const [tryOnHistory, setTryOnHistory] = useState<AITryOnJob[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // --- AI STYLIST STATE ---
  const [occasion, setOccasion] = useState('Sri Lankan Wedding Guest');
  const [preferredStyle, setPreferredStyle] = useState('Modern Chic & Elegant');
  const [selectedColors, setSelectedColors] = useState<string[]>(['Royal Blue', 'Emerald Green']);
  const [budgetLkr, setBudgetLkr] = useState<number>(25000);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [isStylistLoading, setIsStylistLoading] = useState<boolean>(false);
  const [stylistRecommendations, setStylistRecommendations] = useState<RecommendedOutfit[]>([]);

  // --- AI PHOTO STUDIO STATE ---
  const [photoStudioProduct, setPhotoStudioProduct] = useState<Product | null>(null);
  const [photoStudioRawImage, setPhotoStudioRawImage] = useState<string>('');
  const [backgroundScene, setBackgroundScene] = useState<'LUXURY_STUDIO' | 'COLOMBO_BOUTIQUE' | 'TROPICAL_CEYLON' | 'MINIMALIST_SLATE' | 'RUNWAY_VELVET'>('COLOMBO_BOUTIQUE');
  const [isPhotoStudioProcessing, setIsPhotoStudioProcessing] = useState(false);
  const [currentPhotoStudioJob, setCurrentPhotoStudioJob] = useState<PhotoStudioJob | null>(null);
  const [approvedNotification, setApprovedNotification] = useState<string | null>(null);

  // --- INVENTORY INSIGHTS STATE ---
  const [insights, setInsights] = useState<InventoryInsightItem[]>([]);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<'all' | 'high' | 'medium' | 'info'>('all');

  const { addItem } = useCartStore();

  // Load Initial Info and Catalogue
  useEffect(() => {
    loadAIInfo();
    loadCatalogProducts();
    loadTryOnHistory();
  }, []);

  // Update selected product if initialProduct changes
  useEffect(() => {
    if (initialProduct) {
      setSelectedProduct(initialProduct);
      if (initialProduct.variants && initialProduct.variants.length > 0) {
        setSelectedVariant(initialProduct.variants[0]);
      }
      setActiveTab('try-on');
    }
  }, [initialProduct]);

  // Set default variant when selectedProduct changes
  useEffect(() => {
    if (selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0) {
      if (!selectedVariant || !selectedProduct.variants.some((v) => v.id === selectedVariant.id)) {
        setSelectedVariant(selectedProduct.variants[0]);
      }
    }
  }, [selectedProduct]);

  const loadAIInfo = async () => {
    try {
      const res = await api.get('/ai/info');
      if (res.success && res.data) {
        setAiInfo(res.data);
      }
    } catch (err) {
      console.error('Failed to load AI info:', err);
    }
  };

  const loadCatalogProducts = async () => {
    setIsProductsLoading(true);
    try {
      const res = await api.get('/products');
      const products: Product[] = res.data || res.products || [];
      setCatalogProducts(products);
      const defaultWithImage = products.find((p) => p.imageUrl) || products[0];
      if (!selectedProduct && defaultWithImage) {
        setSelectedProduct(defaultWithImage);
        if (defaultWithImage.variants && defaultWithImage.variants.length > 0) {
          setSelectedVariant(defaultWithImage.variants[0]);
        }
      }
      if (!photoStudioProduct && defaultWithImage) {
        setPhotoStudioProduct(defaultWithImage);
        setPhotoStudioRawImage(defaultWithImage.imageUrl || '');
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsProductsLoading(false);
    }
  };

  const loadTryOnHistory = async () => {
    try {
      const res = await api.get('/ai/try-on/history');
      if (res.success && res.data) {
        setTryOnHistory(res.data);
      }
    } catch (err) {
      console.error('Failed to load try-on history:', err);
    }
  };

  // --- VIRTUAL TRY-ON SUBMISSION ---
  const handleGenerateTryOn = async () => {
    if (!selectedProduct) {
      setFeedbackMessage({ type: 'error', text: 'Please select a garment from the catalogue first.' });
      return;
    }
    if (!personImage) {
      setFeedbackMessage({ type: 'error', text: 'Please upload or choose a model photo first.' });
      return;
    }
    if (!consentConfirmed) {
      setFeedbackMessage({ type: 'error', text: 'You must confirm that you have permission to use this photo.' });
      return;
    }

    setIsGenerating(true);
    setFeedbackMessage(null);
    setGenerationStep('Validating garment silhouette and catalogue specifications...');

    try {
      const payload = {
        productId: selectedProduct.id,
        variantId: selectedVariant?.id,
        category,
        personImage,
        consentConfirmed: true,
      };

      const res = await api.post('/ai/try-on', payload);

      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to submit try-on job');
      }

      const jobId = res.data.id;
      setActiveJob(res.data);

      // Start realistic progress updates
      const steps = [
        'Analyzing model posture, body contours & lighting...',
        'Matching garment texture, neckline and sleeve silhouette...',
        'Synthesizing photorealistic drape & fabric alignment...',
        'Rendering high-definition try-on preview...',
      ];

      let stepIndex = 0;
      const stepInterval = setInterval(() => {
        if (stepIndex < steps.length) {
          setGenerationStep(steps[stepIndex]);
          stepIndex++;
        }
      }, 1400);

      // Poll for job completion
      let attempts = 0;
      const maxAttempts = 30;

      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const pollRes = await api.get(`/ai/try-on/${jobId}`);
          if (pollRes.success && pollRes.data) {
            const current = pollRes.data;
            if (current.status === 'COMPLETED') {
              clearInterval(pollInterval);
              clearInterval(stepInterval);
              setActiveJob(current);
              setIsGenerating(false);
              setFeedbackMessage({ type: 'success', text: 'Try-on preview generated successfully!' });
              loadAIInfo();
              loadTryOnHistory();
            } else if (current.status === 'FAILED') {
              clearInterval(pollInterval);
              clearInterval(stepInterval);
              setIsGenerating(false);
              setFeedbackMessage({
                type: 'error',
                text: current.errorMessage || 'AI generation could not complete. Please retry with a clearer photo.',
              });
            }
          }
        } catch (err: any) {
          console.error('Polling error:', err);
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          clearInterval(stepInterval);
          setIsGenerating(false);
          setFeedbackMessage({
            type: 'error',
            text: 'Request timed out waiting for AI provider. You can retry anytime.',
          });
        }
      }, 1500);
    } catch (err: any) {
      setIsGenerating(false);
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Failed to start AI Virtual Try-On. Please try again.',
      });
    }
  };

  // Immediate Privacy Deletion
  const handleDeleteTryOn = async () => {
    if (!activeJob) return;
    if (!confirm('Are you sure you want to permanently delete this photo and generated preview? This cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/ai/try-on/${activeJob.id}`);
      setActiveJob(null);
      setPersonImage('');
      setFeedbackMessage({
        type: 'info',
        text: 'Your photo and generated preview have been permanently deleted from server storage.',
      });
      loadTryOnHistory();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Failed to delete try-on record.',
      });
    }
  };

  // Add Item to Cart
  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const variantToUse = selectedVariant || selectedProduct.variants[0];
    if (!variantToUse) return;

    addItem({
      variantId: variantToUse.id,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      sku: variantToUse.sku,
      barcode: variantToUse.barcode || undefined,
      size: variantToUse.size,
      color: variantToUse.color,
      colorHex: variantToUse.colorHex || undefined,
      unitPrice: variantToUse.sellingPrice,
      unitCost: variantToUse.costPrice,
      stockOnHand: variantToUse.stockOnHand,
      imageUrl: selectedProduct.imageUrl,
    });

    setFeedbackMessage({
      type: 'success',
      text: `Added "${selectedProduct.name} (${variantToUse.size} / ${variantToUse.color})" to Cart!`,
    });
  };

  // Download Result
  const handleDownloadPreview = () => {
    if (!activeJob?.resultImageUrl) return;
    const link = document.createElement('a');
    link.href = activeJob.resultImageUrl;
    link.download = `ralypto-tryon-${selectedProduct?.name?.replace(/\s+/g, '-').toLowerCase() || 'outfit'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- AI STYLIST GENERATION ---
  const handleRunStylist = async () => {
    setIsStylistLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await api.post('/ai/stylist/recommend', {
        occasion,
        preferredStyle,
        preferredColors: selectedColors,
        maxBudgetLkr: budgetLkr,
        size: selectedSize,
      });

      if (res.success && res.data) {
        setStylistRecommendations(res.data.outfits || []);
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Stylist recommendation failed. Please try different filters.',
      });
    } finally {
      setIsStylistLoading(false);
    }
  };

  const handleSelectStylistItemForTryOn = (productId: string) => {
    const prod = catalogProducts.find((p) => p.id === productId);
    if (prod) {
      setSelectedProduct(prod);
      if (prod.variants && prod.variants.length > 0) {
        setSelectedVariant(prod.variants[0]);
      }
      setActiveTab('try-on');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- AI PHOTO STUDIO ACTIONS ---
  const handleRunPhotoStudio = async () => {
    const rawImage = photoStudioRawImage || photoStudioProduct?.imageUrl;
    if (!rawImage) {
      setFeedbackMessage({ type: 'error', text: 'Please select a product with an image or choose an image for the photo studio.' });
      return;
    }

    setIsPhotoStudioProcessing(true);
    setApprovedNotification(null);
    try {
      const res = await api.post('/ai/photo-studio/process', {
        productId: photoStudioProduct?.id,
        originalImageUrl: rawImage,
        backgroundScene,
        generateCopy: true,
      });

      if (res.success && res.data) {
        setCurrentPhotoStudioJob(res.data);
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Photo studio processing failed.',
      });
    } finally {
      setIsPhotoStudioProcessing(false);
    }
  };

  const handleApprovePhotoStudio = async () => {
    if (!currentPhotoStudioJob) return;

    try {
      const res = await api.post('/ai/photo-studio/approve', {
        jobId: currentPhotoStudioJob.id,
        updateImage: true,
        updateTitle: true,
        updateDescription: true,
      });

      if (res.success) {
        setApprovedNotification('Product catalogue image and boutique description updated successfully!');
        loadCatalogProducts();
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Approval could not be recorded.',
      });
    }
  };

  // --- INVENTORY INSIGHTS ACTIONS ---
  const loadInventoryInsights = async () => {
    setIsInsightsLoading(true);
    try {
      const res = await api.get('/ai/inventory-insights');
      if (res.success && res.data) {
        setInsights(res.data.insights || []);
      }
    } catch (err) {
      console.error('Failed to load inventory insights:', err);
    } finally {
      setIsInsightsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'insights') {
      loadInventoryInsights();
    }
    if (activeTab === 'stylist' && stylistRecommendations.length === 0) {
      handleRunStylist();
    }
  }, [activeTab]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Editorial Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ralypto Fashion Intelligence Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              AI Fashion Studio
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium">
              "Your style. Your photo. Your next favourite outfit."
            </p>
          </div>

          {/* AI Status & Quota Badge */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60 shadow-lg min-w-[240px]">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-medium">AI Model Provider:</span>
              <span className="font-bold text-indigo-300">{aiInfo?.provider || 'FASHN AI'}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-slate-400 font-medium">Daily Try-Ons Left:</span>
              <span className="font-bold text-emerald-400">{aiInfo?.remainingGenerationsToday ?? 50} / 50</span>
            </div>
            {aiInfo?.isDevelopmentMode && (
              <div className="mt-2.5 px-2 py-1 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>Dev Simulation Mode (Zero Cloud Cost)</span>
              </div>
            )}
          </div>
        </div>

        {/* Studio Sub-Navigation Tabs */}
        <div className="relative z-10 flex flex-wrap gap-2 pt-6 mt-6 border-t border-slate-800/80">
          {[
            { id: 'try-on', label: 'Virtual Try-On', icon: Camera, desc: 'Photo-to-garment synthesis' },
            { id: 'stylist', label: 'AI Personal Stylist', icon: Wand2, desc: 'Occasion & budget curations' },
            { id: 'photo-studio', label: 'AI Photo Studio', icon: ImageIcon, desc: 'Owner catalog elevation' },
            { id: 'insights', label: 'AI Inventory Insights', icon: TrendingUp, desc: 'Festive forecasts & velocity' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-lg shadow-white/10'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : feedbackMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : feedbackMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs hover:opacity-75 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. VIRTUAL TRY-ON TAB (PRIMARY FEATURE)                   */}
      {/* ========================================================= */}
      {activeTab === 'try-on' && (
        <div className="space-y-6">
          {/* Main 2-Column Working Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Garment Selection & Upload Controls */}
            <div className="lg:col-span-5 space-y-6">
              {/* Garment Selector Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h2 className="font-bold text-sm text-slate-900">Selected Garment</h2>
                  </div>
                  <button
                    onClick={() => setIsGarmentModalOpen(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>Change Dress</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {selectedProduct ? (
                  <div className="flex gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200">
                      {selectedProduct.imageUrl ? (
                        <img
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        {selectedProduct.category?.name || 'Catalogue Dress'}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm truncate">
                        {selectedProduct.name}
                      </h3>
                      <div className="text-indigo-600 font-extrabold text-sm">
                        LKR {selectedProduct.basePrice.toLocaleString()}
                      </div>

                      {/* Variant and Size Picker */}
                      {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                        <div className="pt-1 flex items-center gap-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Size:</label>
                          <select
                            value={selectedVariant?.id || ''}
                            onChange={(e) => {
                              const found = selectedProduct.variants.find((v) => v.id === e.target.value);
                              if (found) setSelectedVariant(found);
                            }}
                            className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-0.5 font-bold text-slate-800"
                          >
                            {selectedProduct.variants.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.size} ({v.color}) — {v.stockOnHand} in stock
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <p className="text-xs text-slate-500">No dress selected.</p>
                    <button
                      onClick={() => setIsGarmentModalOpen(true)}
                      className="mt-2 text-xs font-bold text-indigo-600"
                    >
                      Browse Catalogue
                    </button>
                  </div>
                )}

                {/* Garment Category Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Garment Category</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'dresses', label: 'Dresses' },
                      { id: 'tops', label: 'Tops / Shirts' },
                      { id: 'bottoms', label: 'Skirts / Pants' },
                      { id: 'one-pieces', label: 'Full Outfits' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as any)}
                        className={`py-2 rounded-xl text-[11px] font-bold transition-all ${
                          category === cat.id
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upload Zone Component */}
              <PhotoUploadZone
                personImage={personImage || null}
                onImageSelected={(img) => setPersonImage(img)}
                onClearImage={() => setPersonImage('')}
                consentConfirmed={consentConfirmed}
                onConsentChange={(val) => setConsentConfirmed(val)}
              />

              {/* Action Button */}
              <button
                type="button"
                onClick={handleGenerateTryOn}
                disabled={isGenerating}
                className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all ${
                  isGenerating
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-500/25 active:scale-[0.99]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Processing Try-On...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate AI Try-On Preview</span>
                  </>
                )}
              </button>
            </div>

            {/* RIGHT COLUMN: Polished Comparison & Results */}
            <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-20 self-start">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between min-h-[580px]">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h2 className="font-bold text-sm text-slate-900">Virtual Fitting Room Result</h2>
                  </div>
                  {activeJob?.status === 'COMPLETED' && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready to Wear
                    </span>
                  )}
                </div>

                {/* Main Visual Display */}
                <div className="flex-1 my-4 flex items-center justify-center">
                  {isGenerating ? (
                    <div className="w-full max-w-md mx-auto text-center space-y-6 py-12">
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-2xl">
                          👗
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-900 text-base">Synthesizing Your Preview</h4>
                        <p className="text-xs text-indigo-600 font-semibold animate-pulse">
                          {generationStep || 'Analyzing photo and garment drape...'}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 max-w-sm mx-auto">
                        Preserving authentic dress silhouette, sleeve cut, textile print, and neckline details.
                      </div>
                    </div>
                  ) : activeJob?.resultImageUrl ? (
                    <div className="w-full space-y-4">
                      {/* Before / After Comparison Slider */}
                      <ComparisonSlider
                        originalImage={activeJob.personImageUrl}
                        generatedImage={activeJob.resultImageUrl}
                        garmentName={selectedProduct?.name || 'Selected Garment'}
                      />

                      {/* Garment Identity Preservation Badges */}
                      <div className="grid grid-cols-3 gap-2 text-center pt-2">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Silhouette</div>
                          <div className="text-xs font-bold text-slate-800">100% Preserved</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Fabric Drape</div>
                          <div className="text-xs font-bold text-slate-800">Adaptive Drape</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Garment Source</div>
                          <div className="text-xs font-bold text-slate-800 truncate">Store Catalogue</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 space-y-4 max-w-sm mx-auto">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-3xl">
                        ✨
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">No Preview Generated Yet</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Select a garment on the left, upload a photo or pick a model, and click "Generate AI Try-On Preview".
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Disclaimer */}
                <div className="text-[11px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                  <span className="font-bold text-slate-600">Fit & Fabric Disclaimer:</span> AI virtual try-on previews provide visual styling approximations. Real-world fabric behaviour, drape, and sizing may vary slightly based on garment fabric elasticity and body measurements.
                </div>

                {/* Action Buttons */}
                {activeJob?.resultImageUrl && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAddToCart}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-400" />
                        <span>Add to Cart ({selectedVariant?.size || 'M'})</span>
                      </button>

                      <button
                        onClick={handleDownloadPreview}
                        className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        title="Download Preview"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download</span>
                      </button>

                      <button
                        onClick={() => setIsGarmentModalOpen(true)}
                        className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        title="Try Another Outfit"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span className="hidden sm:inline">Try Another</span>
                      </button>
                    </div>

                    {/* Immediate Privacy Delete */}
                    <button
                      onClick={handleDeleteTryOn}
                      className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      title="Permanently Delete My Photo"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>Delete My Photo Now</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Try-On Gallery */}
              {tryOnHistory.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wide">
                      Recent Session Looks ({tryOnHistory.length})
                    </h3>
                    <span className="text-[10px] text-slate-400">Click to inspect</span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {tryOnHistory.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => {
                          setActiveJob(job);
                          const prod = catalogProducts.find((p) => p.id === job.productId);
                          if (prod) setSelectedProduct(prod);
                        }}
                        className={`w-20 shrink-0 rounded-xl overflow-hidden border cursor-pointer transition-all ${
                          activeJob?.id === job.id
                            ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <img
                          src={job.resultImageUrl || job.garmentImageUrl}
                          alt="Try on thumbnail"
                          className="w-full h-24 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. AI PERSONAL STYLIST TAB                                */}
      {/* ========================================================= */}
      {activeTab === 'stylist' && (
        <div className="space-y-6">
          {/* Stylist Filters Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-indigo-600" />
                  <span>Curate Outfits from Real Store Catalogue</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Specify your occasion and budget in Sri Lankan Rupees. Every recommended piece is verified in stock.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunStylist}
                disabled={isStylistLoading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
              >
                {isStylistLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Curating Looks...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Recommendations</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Occasion */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Occasion</label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800"
                >
                  <option value="Sri Lankan Wedding Guest">Sri Lankan Wedding Guest</option>
                  <option value="Colombo Corporate Executive">Colombo Corporate Executive</option>
                  <option value="Sinhala & Tamil Avurudu Festive">Sinhala & Tamil Avurudu Festive</option>
                  <option value="High Tea & Brunch Chic">High Tea & Brunch Chic</option>
                  <option value="Evening Gala & Cocktails">Evening Gala & Cocktails</option>
                  <option value="Bentota Beach & Resort Weekend">Bentota Beach & Resort Weekend</option>
                  <option value="Modest Chic & Hijab Friendly">Modest Chic & Hijab Friendly</option>
                </select>
              </div>

              {/* Style Preference */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Aesthetic / Style</label>
                <select
                  value={preferredStyle}
                  onChange={(e) => setPreferredStyle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800"
                >
                  <option value="Modern Chic & Elegant">Modern Chic & Elegant</option>
                  <option value="Traditional Ethnic Luxe">Traditional Ethnic Luxe</option>
                  <option value="Smart Casual & Versatile">Smart Casual & Versatile</option>
                  <option value="Boho Floral & Linen">Boho Floral & Linen</option>
                  <option value="Minimalist Monochrome">Minimalist Monochrome</option>
                </select>
              </div>

              {/* Preferred Size */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Preferred Size</label>
                <div className="flex gap-1.5">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedSize === sz
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Max Budget:</span>
                  <span className="font-extrabold text-indigo-600">LKR {budgetLkr.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="60000"
                  step="2500"
                  value={budgetLkr}
                  onChange={(e) => setBudgetLkr(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Recommendations Grid */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              Curated Outfits for "{occasion}" ({stylistRecommendations.length} available)
            </h3>

            {isStylistLoading ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-600">
                  Scanning active catalogue, validating sizes, and evaluating colour harmonies...
                </p>
              </div>
            ) : stylistRecommendations.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <p className="text-xs text-slate-500">
                  No matching outfits found within LKR {budgetLkr.toLocaleString()}. Try increasing the budget or switching styles.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stylistRecommendations.map((outfit) => (
                  <div
                    key={outfit.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                            {outfit.occasion}
                          </span>
                          <h4 className="font-bold text-slate-900 text-base mt-1">
                            {outfit.title}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Outfit</span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            LKR {outfit.totalCostLkr.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Styling Advice Callout */}
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                        <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Styling Advice:</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {outfit.stylingAdvice}
                        </p>
                        <div className="text-[11px] text-slate-500 pt-1">
                          <span className="font-semibold">Colour Harmony:</span> {outfit.colorHarmony}
                        </div>
                      </div>

                      {/* Items in Outfit */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Curated Catalogue Pieces ({outfit.items.length})
                        </span>
                        <div className="space-y-2">
                          {outfit.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors bg-white"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                  {item.imageUrl ? (
                                    <img
                                      src={item.imageUrl}
                                      alt={item.productName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sm">👗</div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 text-xs truncate">
                                    {item.productName}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    Size: <span className="font-bold text-slate-700">{item.recommendedSize}</span> | Color: {item.recommendedColor}
                                  </div>
                                  <div className="text-indigo-600 font-extrabold text-xs">
                                    LKR {item.price.toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              {/* Item Quick Try-On Button */}
                              <button
                                type="button"
                                onClick={() => handleSelectStylistItemForTryOn(item.productId)}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-[11px] flex items-center gap-1 transition-colors shrink-0"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Try On</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Outfit Action Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        All items verified in store stock
                      </span>
                      <button
                        onClick={() => {
                          outfit.items.forEach((item) => {
                            const prod = catalogProducts.find((p) => p.id === item.productId);
                            if (prod && prod.variants && prod.variants.length > 0) {
                              const v = prod.variants.find((vr) => vr.size === item.recommendedSize) || prod.variants[0];
                              addItem({
                                variantId: v.id,
                                productId: prod.id,
                                productName: prod.name,
                                sku: v.sku,
                                barcode: v.barcode || undefined,
                                size: v.size,
                                color: v.color,
                                colorHex: v.colorHex || undefined,
                                unitPrice: v.sellingPrice,
                                unitCost: v.costPrice,
                                stockOnHand: v.stockOnHand,
                                imageUrl: prod.imageUrl,
                              });
                            }
                          });
                          setFeedbackMessage({
                            type: 'success',
                            text: `Added all available items for "${outfit.title}" to Cart!`,
                          });
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Add Outfit to Cart</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. AI PRODUCT PHOTO STUDIO TAB (OWNER / MANAGER)          */}
      {/* ========================================================= */}
      {activeTab === 'photo-studio' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-indigo-600" />
                  <span>Owner Photo Elevation & Editorial Studio</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Replace plain inventory backgrounds with boutique backdrops, generate SEO descriptions, and preview before approval.
                </p>
              </div>

              {photoStudioProduct && (
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>Selected: {photoStudioProduct.name}</span>
                </div>
              )}
            </div>

            {/* Product Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Select Catalogue Item</label>
                <select
                  value={photoStudioProduct?.id || ''}
                  onChange={(e) => {
                    const prod = catalogProducts.find((p) => p.id === e.target.value);
                    if (prod) {
                      setPhotoStudioProduct(prod);
                      setPhotoStudioRawImage(prod.imageUrl || '');
                    }
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800"
                >
                  {catalogProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (LKR {p.basePrice.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Background Scene Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Editorial Background Scene</label>
                <select
                  value={backgroundScene}
                  onChange={(e) => setBackgroundScene(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800"
                >
                  <option value="COLOMBO_BOUTIQUE">🏛️ Colombo Luxury Boutique (Warm Marble & Arch)</option>
                  <option value="LUXURY_STUDIO">🤍 Minimalist Pure White Studio (ASOS / E-commerce Standard)</option>
                  <option value="TROPICAL_CEYLON">🌴 Tropical Ceylon Garden (Soft Bokeh Sunlight)</option>
                  <option value="MINIMALIST_SLATE">🏢 Urban Loft Concrete Slate (High-Fashion Editorial)</option>
                  <option value="RUNWAY_VELVET">🎭 Runway Velvet Gala (Deep Dramatic Theater)</option>
                </select>
              </div>
            </div>

            {/* Processing Trigger */}
            <button
              type="button"
              onClick={handleRunPhotoStudio}
              disabled={isPhotoStudioProcessing}
              className={`px-6 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors ${
                isPhotoStudioProcessing
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isPhotoStudioProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Studio Backdrop & AI Copy...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-amber-300" />
                  <span>Generate Boutique Presentation</span>
                </>
              )}
            </button>
          </div>

          {/* Results Comparison & Approval Section */}
          {currentPhotoStudioJob && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">
                  Side-by-Side Review: Raw Inventory vs. Elevated Boutique
                </h3>
                {approvedNotification && (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    {approvedNotification}
                  </span>
                )}
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Original Authoritative Photo
                  </div>
                  <div className="aspect-3/4 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={currentPhotoStudioJob.originalImageUrl}
                      alt="Original product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Enhanced */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Studio Enhancement ({currentPhotoStudioJob.backgroundScene})</span>
                  </div>
                  <div className="aspect-3/4 rounded-2xl overflow-hidden bg-slate-900 border border-indigo-200 shadow-md">
                    <img
                      src={currentPhotoStudioJob.processedImageUrl || currentPhotoStudioJob.originalImageUrl}
                      alt="Enhanced product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* AI Generated Copywriting */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                    AI Boutique Copywriting & Tags
                  </span>
                  <span className="text-[10px] text-slate-400">SEO Optimized for Sri Lanka e-commerce</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Suggested Title</label>
                  <p className="font-bold text-slate-900 text-sm">
                    {currentPhotoStudioJob.generatedTitle || photoStudioProduct?.name}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Boutique Description</label>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentPhotoStudioJob.generatedDescription}
                  </p>
                </div>

                {currentPhotoStudioJob.generatedTags && currentPhotoStudioJob.generatedTags.length > 0 && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Generated Tags</label>
                    <div className="flex flex-wrap gap-1.5">
                      {currentPhotoStudioJob.generatedTags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px] font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Explicit Owner Approval Card */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Authoritative Image Protection</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Generated marketing imagery does not overwrite the live catalogue until you explicitly review and approve it.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleApprovePhotoStudio}
                  disabled={currentPhotoStudioJob.approved}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0 ${
                    currentPhotoStudioJob.approved
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{currentPhotoStudioJob.approved ? 'Approved & Published' : 'Approve & Update Product Image'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. AI INVENTORY INSIGHTS TAB                              */}
      {/* ========================================================= */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <span>Data-Driven Inventory & Festive Forecasts</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Grounded in real POS transactions, ledger movements, and seasonal Sri Lankan consumer trends.
                </p>
              </div>

              <button
                type="button"
                onClick={loadInventoryInsights}
                disabled={isInsightsLoading}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isInsightsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Analytics</span>
              </button>
            </div>

            {/* Severity Filter Pills */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              {[
                { id: 'all', label: 'All Alerts' },
                { id: 'high', label: 'High Priority' },
                { id: 'medium', label: 'Medium Priority' },
                { id: 'info', label: 'Seasonal & Trends' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedSeverityFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedSeverityFilter === f.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Insights Grid */}
          {isInsightsLoading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                Calculating size velocity curves, color shortages, and festive demand multipliers...
              </p>
            </div>
          ) : insights.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
              <p className="text-xs text-slate-500">No inventory alerts found for the current period.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights
                .filter((item) => selectedSeverityFilter === 'all' || item.severity === selectedSeverityFilter)
                .map((insight, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              insight.severity === 'high'
                                ? 'bg-rose-100 text-rose-700'
                                : insight.severity === 'medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {insight.severity.toUpperCase()} PRIORITY • {insight.type.replace(/_/g, ' ')}
                          </span>
                          <h4 className="font-bold text-slate-900 text-base">
                            {insight.title}
                          </h4>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Confidence</span>
                          <span className="font-extrabold text-indigo-600 text-xs">
                            {Math.round(insight.confidenceScore * 100)}%
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-500 text-[11px]">
                          <span>Supporting Metric:</span>
                          <span className="font-mono font-bold text-slate-800">{insight.supportingData}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500 text-[11px]">
                          <span>Observed Window:</span>
                          <span className="font-medium text-slate-700">{insight.dateRange}</span>
                        </div>
                        <p className="text-slate-600 pt-1 leading-relaxed">
                          {insight.reason}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[11px] font-bold text-slate-700">
                        Action: <span className="text-indigo-600">{insight.suggestedAction}</span>
                      </div>
                      {onNavigate && (
                        <button
                          onClick={() => onNavigate('inventory')}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <span>Go to Stock Ledger</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* GARMENT SELECTION MODAL                                   */}
      {/* ========================================================= */}
      {isGarmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Choose Garment from Catalogue</h3>
                <p className="text-xs text-slate-500">Pick an active dress or clothing product to try on</p>
              </div>
              <button
                onClick={() => setIsGarmentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {isProductsLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading products...</div>
              ) : catalogProducts.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">No active products found.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catalogProducts.map((p) => {
                    const isSelected = selectedProduct?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedProduct(p);
                          if (p.variants && p.variants.length > 0) {
                            setSelectedVariant(p.variants[0]);
                          }
                          setIsGarmentModalOpen(false);
                        }}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="w-16 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">👗</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">
                            {p.category?.name || 'Dress'}
                          </div>
                          <div className="font-bold text-slate-900 text-xs truncate">{p.name}</div>
                          <div className="text-indigo-600 font-extrabold text-xs mt-0.5">
                            LKR {p.basePrice.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {p.variants.length} sizes/variants
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setIsGarmentModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
