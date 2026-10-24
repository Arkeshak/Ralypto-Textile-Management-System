export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  permissions: string[];
  branchId?: string;
  branchName?: string;
}

export interface Business {
  id: string;
  name: string;
  legalName?: string;
  phone: string;
  email?: string;
  address?: string;
  currency: string;
  timezone: string;
  taxRate: number;
  logoUrl?: string;
  receiptFooter?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  isMain: boolean;
  address?: string;
  phone?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: { products: number };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  barcode?: string;
  size: string;
  color: string;
  colorHex?: string;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  stockOnHand?: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  category?: { id: string; name: string };
  brandId?: string;
  brand?: { id: string; name: string };
  basePrice: number;
  baseCost: number;
  imageUrl?: string;
  isActive: boolean;
  totalStockOnHand?: number;
  variants: ProductVariant[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  creditLimit: number;
  outstandingBalance: number;
  loyaltyPoints: number;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  outstandingBalance: number;
}

export interface SaleItem {
  id: string;
  saleId: string;
  variantId: string;
  productName: string;
  variantDetails: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice: number;
}

export interface Payment {
  id: string;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'CREDIT';
  amount: number;
  referenceNote?: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  businessId: string;
  branchId: string;
  invoiceNumber: string;
  customerId?: string;
  customer?: Customer;
  cashierUserId: string;
  cashier?: { id: string; name: string; email?: string };
  branch?: Branch;
  business?: Business;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' | 'REFUNDED';
  paymentMethod: string;
  notes?: string;
  items: SaleItem[];
  payments: Payment[];
  createdAt: string;
}

export interface StockMovement {
  id: string;
  branchId: string;
  variantId: string;
  movementType: string;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  costPerUnit: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  createdAt: string;
  variant: ProductVariant & { product: { name: string; imageUrl?: string } };
  branch: { name: string; code: string };
  createdByUser?: { name: string };
}

export interface Expense {
  id: string;
  branchId: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  expenseDate: string;
  recordedByUser?: { name: string };
  branch?: { name: string; code: string };
}

export interface DashboardMetrics {
  summary: {
    todayRevenue: number;
    todayTransactions: number;
    todayGrossProfit: number;
    todayCashCollected: number;
    todayExpenseAmount: number;
    monthRevenue: number;
    monthGrossProfit: number;
    monthExpenseAmount: number;
    monthNetProfit: number;
    totalInventoryUnits: number;
    inventoryCostValue: number;
    inventoryRetailValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    customerReceivables: number;
    supplierPayables: number;
  };
  last7DaysTrend: Array<{
    date: string;
    sales: number;
    profit: number;
    transactions: number;
  }>;
  paymentBreakdown: Array<{
    method: string;
    amount: number;
  }>;
  recentSales: Sale[];
  lowStockAlerts: Array<{
    variantId: string;
    productName: string;
    variantDetails: string;
    sku: string;
    stock: number;
    reorderLevel: number;
    status: string;
  }>;
}

export interface AITryOnJob {
  id: string;
  businessId: string;
  sessionId?: string;
  productId: string;
  variantId?: string;
  category: string;
  personImageUrl: string;
  garmentImageUrl: string;
  resultImageUrl?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'DELETED';
  provider: string;
  cost?: number;
  errorMessage?: string;
  consentConfirmed: boolean;
  createdAt: string;
  product?: Product;
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
    role: string;
    reason: string;
  }>;
}

export interface PhotoStudioJob {
  id: string;
  productId?: string;
  originalImageUrl: string;
  processedImageUrl?: string;
  backgroundScene: string;
  generatedTitle?: string;
  generatedDescription?: string;
  generatedTags?: string[];
  status: string;
  approved: boolean;
  createdAt: string;
}

export interface InventoryInsightItem {
  type: 'FAST_SELLING_SIZE' | 'COLOR_SHORTAGE' | 'SLOW_MOVER' | 'REPLENISHMENT_ALERT' | 'SEASONAL_FORECAST';
  title: string;
  severity: 'high' | 'medium' | 'info';
  supportingData: string;
  dateRange: string;
  confidenceScore: number;
  reason: string;
  suggestedAction: string;
  suggestedActionType: string;
}

