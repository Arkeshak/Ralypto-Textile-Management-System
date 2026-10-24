export interface TryOnRequest {
  personImage: string; // Base64 or URL
  garmentImage: string; // Authoritative product image URL
  category: 'dresses' | 'tops' | 'bottoms' | 'one-pieces';
  mode?: 'performance' | 'balanced' | 'quality';
  adjustHands?: boolean;
  coverFeet?: boolean;
}

export interface TryOnResult {
  jobId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  resultImageUrl?: string;
  provider: string;
  cost?: number;
  error?: string;
  isDevelopmentMode?: boolean;
  metadata?: Record<string, any>;
}

export interface VirtualTryOnProvider {
  name: string;
  generate(req: TryOnRequest): Promise<TryOnResult>;
  checkStatus(providerJobId: string): Promise<TryOnResult>;
}

export interface StylistRequest {
  occasion: string; // e.g., "Sri Lankan Wedding", "Colombo Office / Workwear", "Avurudu Festive", "Party", "Casual Weekend"
  preferredStyle?: string; // "Traditional", "Modern Elegance", "Linen Casual", "Modest"
  preferredColors?: string[];
  maxBudgetLkr?: number;
  genderOrCategory?: string;
  size?: string;
  formality?: 'casual' | 'smart-casual' | 'formal' | 'luxury-ethnic';
}

export interface RecommendedOutfit {
  id: string;
  title: string;
  occasion: string;
  totalCostLkr: number;
  stylingAdvice: string;
  colorHarmony: string;
  items: Array<{
    productId: string;
    productName: string;
    categoryName: string;
    brandName?: string;
    imageUrl?: string;
    price: number;
    recommendedSize: string;
    recommendedColor: string;
    inStock: boolean;
    availableStock: number;
    role: 'primary-garment' | 'complementary-piece' | 'accessory';
    reason: string;
  }>;
}

export interface PhotoStudioRequest {
  productId?: string;
  originalImageUrl: string;
  backgroundScene: 'LUXURY_STUDIO' | 'COLOMBO_BOUTIQUE' | 'TROPICAL_CEYLON' | 'MINIMALIST_SLATE' | 'RUNWAY_VELVET';
  generateCopy?: boolean;
}

export interface PhotoStudioResult {
  processedImageUrl: string;
  generatedTitle?: string;
  generatedDescription?: string;
  generatedTags?: string[];
  sceneName: string;
}

export interface InventoryInsightItem {
  type: 'FAST_SELLING_SIZE' | 'COLOR_SHORTAGE' | 'SLOW_MOVER' | 'REPLENISHMENT_ALERT' | 'SEASONAL_FORECAST';
  title: string;
  severity: 'high' | 'medium' | 'info';
  supportingData: string;
  dateRange: string;
  confidenceScore: number; // e.g. 94%
  reason: string;
  suggestedAction: string;
  suggestedActionType: 'REORDER' | 'PROMO' | 'STOCK_TRANSFER' | 'ADJUST_PRICE' | 'VIEW_REPORT';
  metadata?: Record<string, any>;
}
