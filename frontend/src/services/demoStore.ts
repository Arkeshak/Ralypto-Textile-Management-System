import {
  DEMO_BUSINESS,
  DEMO_BRANCHES,
  DEMO_CATEGORIES,
  DEMO_BRANDS,
  DEMO_SUPPLIERS,
  DEMO_CUSTOMERS,
  DEMO_STAFF,
  DEMO_PRODUCTS,
  generateDemoSales,
  DEMO_EXPENSES,
  DEMO_DASHBOARD_METRICS,
  generateDemoTrend,
} from '../data/mockData';
import { Product, Category, Brand, Customer, Supplier, Expense, Sale, DashboardMetrics } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'luxe_demo_products',
  CATEGORIES: 'luxe_demo_categories',
  BRANDS: 'luxe_demo_brands',
  CUSTOMERS: 'luxe_demo_customers',
  SUPPLIERS: 'luxe_demo_suppliers',
  EXPENSES: 'luxe_demo_expenses',
  SALES: 'luxe_demo_sales',
  IS_INITIALIZED: 'luxe_demo_initialized_v2',
};

class DemoStore {
  private isInitialized = false;

  constructor() {
    this.ensureInitialized();
  }

  public ensureInitialized(force: boolean = false) {
    if (this.isInitialized && !force) return;

    const alreadyInit = localStorage.getItem(STORAGE_KEYS.IS_INITIALIZED);
    if (!alreadyInit || force) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEMO_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEMO_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(DEMO_CUSTOMERS));
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(DEMO_SUPPLIERS));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(DEMO_EXPENSES));
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(generateDemoSales()));
      localStorage.setItem(STORAGE_KEYS.IS_INITIALIZED, 'true');
    }
    this.isInitialized = true;
  }

  public resetToFactory() {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.IS_INITIALIZED);
    this.ensureInitialized(true);
  }

  // --- Products ---
  public getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : DEMO_PRODUCTS;
    } catch {
      return DEMO_PRODUCTS;
    }
  }

  public addProduct(product: Product): Product {
    const products = this.getProducts();
    const updated = [product, ...products];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const updated = { ...products[index], ...updates };
    products[index] = updated;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return updated;
  }

  // --- Categories ---
  public getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : DEMO_CATEGORIES;
    } catch {
      return DEMO_CATEGORIES;
    }
  }

  public addCategory(category: Category): Category {
    const categories = this.getCategories();
    const updated = [...categories, category];
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    return category;
  }

  // --- Brands ---
  public getBrands(): Brand[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BRANDS);
      return data ? JSON.parse(data) : DEMO_BRANDS;
    } catch {
      return DEMO_BRANDS;
    }
  }

  public addBrand(brand: Brand): Brand {
    const brands = this.getBrands();
    const updated = [...brands, brand];
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(updated));
    return brand;
  }

  // --- Customers ---
  public getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : DEMO_CUSTOMERS;
    } catch {
      return DEMO_CUSTOMERS;
    }
  }

  public addCustomer(customer: Customer): Customer {
    const customers = this.getCustomers();
    const updated = [customer, ...customers];
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
    return customer;
  }

  public recordCustomerPayment(customerId: string, amount: number): Customer | null {
    const customers = this.getCustomers();
    let updatedCustomer: Customer | null = null;
    const updated = customers.map((c) => {
      if (c.id === customerId) {
        const newBalance = Math.max(0, c.outstandingBalance - amount);
        updatedCustomer = { ...c, outstandingBalance: newBalance };
        return updatedCustomer;
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
    return updatedCustomer;
  }

  // --- Suppliers ---
  public getSuppliers(): Supplier[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      return data ? JSON.parse(data) : DEMO_SUPPLIERS;
    } catch {
      return DEMO_SUPPLIERS;
    }
  }

  public addSupplier(supplier: Supplier): Supplier {
    const suppliers = this.getSuppliers();
    const updated = [supplier, ...suppliers];
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(updated));
    return supplier;
  }

  public updateSupplier(supplier: Supplier): Supplier {
    const suppliers = this.getSuppliers();
    const updated = suppliers.map((s) => (s.id === supplier.id ? supplier : s));
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(updated));
    return supplier;
  }

  public recordSupplierPayment(supplierId: string, amount: number): Supplier | null {
    const suppliers = this.getSuppliers();
    let updatedSupplier: Supplier | null = null;
    const updated = suppliers.map((s) => {
      if (s.id === supplierId) {
        const newBalance = Math.max(0, s.outstandingBalance - amount);
        updatedSupplier = { ...s, outstandingBalance: newBalance };
        return updatedSupplier;
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(updated));
    return updatedSupplier;
  }

  // --- Expenses ---
  public getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return data ? JSON.parse(data) : DEMO_EXPENSES;
    } catch {
      return DEMO_EXPENSES;
    }
  }

  public addExpense(expense: Expense): Expense {
    const expenses = this.getExpenses();
    const updated = [expense, ...expenses];
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
    return expense;
  }

  // --- Sales ---
  public getSales(): Sale[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SALES);
      return data ? JSON.parse(data) : generateDemoSales();
    } catch {
      return generateDemoSales();
    }
  }

  public addSale(sale: Sale): Sale {
    const sales = this.getSales();
    const updated = [sale, ...sales];
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(updated));

    // Deduct stock for items in sale
    const products = this.getProducts();
    let productsUpdated = false;

    sale.items.forEach((item) => {
      for (const prod of products) {
        if (prod.variants) {
          const variant = prod.variants.find((v) => v.id === item.variantId);
          if (variant) {
            variant.stockOnHand = Math.max(0, (variant.stockOnHand ?? 0) - item.quantity);
            prod.totalStockOnHand = prod.variants.reduce((acc, v) => acc + (v.stockOnHand ?? 0), 0);
            productsUpdated = true;
          }
        }
      }
    });

    if (productsUpdated) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }

    return sale;
  }

  // --- Dynamic Dashboard Metrics ---
  public getDashboardMetrics(): DashboardMetrics {
    const sales = this.getSales();
    const products = this.getProducts();
    const expenses = this.getExpenses();
    const customers = this.getCustomers();
    const suppliers = this.getSuppliers();

    // Today's date string YYYY-MM-DD
    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySales = sales.filter((s) => s.createdAt && s.createdAt.slice(0, 10) === todayStr);

    const todayRevenue = todaySales.length > 0
      ? todaySales.reduce((acc, s) => acc + (s.grandTotal || 0), 0)
      : 84500; // Deterministic illustrative figure as specified in prompt

    const todayTransactions = todaySales.length > 0 ? todaySales.length : 32;

    const totalInventoryUnits = products.reduce((acc, p) => acc + (p.totalStockOnHand ?? 0), 0);
    const inventoryCostValue = products.reduce((acc, p) => {
      const cost = p.baseCost || 0;
      return acc + (p.totalStockOnHand ?? 0) * cost;
    }, 0);
    const inventoryRetailValue = products.reduce((acc, p) => {
      const price = p.basePrice || 0;
      return acc + (p.totalStockOnHand ?? 0) * price;
    }, 0);

    const lowStockCount = products.filter((p) => (p.totalStockOnHand ?? 0) > 0 && (p.totalStockOnHand ?? 0) <= 5).length;
    const outOfStockCount = products.filter((p) => (p.totalStockOnHand ?? 0) === 0).length;

    const customerReceivables = customers.reduce((acc, c) => acc + (c.outstandingBalance || 0), 0);
    const supplierPayables = suppliers.reduce((acc, s) => acc + (s.outstandingBalance || 0), 0);

    const monthRevenue = sales.reduce((acc, s) => acc + (s.grandTotal || 0), 0) + 1400000;
    const monthExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    return {
      summary: {
        todayRevenue,
        todayTransactions,
        todayGrossProfit: Math.round(todayRevenue * 0.46),
        todayCashCollected: Math.round(todayRevenue * 0.44),
        todayExpenseAmount: 0,
        monthRevenue,
        monthGrossProfit: Math.round(monthRevenue * 0.46),
        monthExpenseAmount: monthExpenses,
        monthNetProfit: Math.round(monthRevenue * 0.46) - monthExpenses,
        totalInventoryUnits,
        inventoryCostValue: inventoryCostValue || 1845000,
        inventoryRetailValue: inventoryRetailValue || 3120000,
        lowStockCount: lowStockCount || 2,
        outOfStockCount: outOfStockCount || 1,
        customerReceivables,
        supplierPayables,
      },
      last7DaysTrend: generateDemoTrend(),
      paymentBreakdown: [
        { method: 'CARD', amount: Math.round(todayRevenue * 0.58) },
        { method: 'CASH', amount: Math.round(todayRevenue * 0.30) },
        { method: 'BANK_TRANSFER', amount: Math.round(todayRevenue * 0.12) },
      ],
      recentSales: sales.slice(0, 6),
      lowStockAlerts: products
        .filter((p) => (p.totalStockOnHand ?? 0) <= 5)
        .slice(0, 4)
        .map((p) => ({
          variantId: p.variants?.[0]?.id || `var-${p.id}`,
          productName: p.name,
          variantDetails: `${p.variants?.[0]?.size || 'M'} / ${p.variants?.[0]?.color || 'Default'}`,
          sku: p.variants?.[0]?.sku || 'SKU-001',
          stock: p.totalStockOnHand ?? 0,
          reorderLevel: 5,
          status: (p.totalStockOnHand ?? 0) === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        })),
    };
  }

  // --- Stock Balances for Inventory Page ---
  public getStockBalances() {
    const products = this.getProducts();
    const balances: any[] = [];

    products.forEach((prod) => {
      (prod.variants || []).forEach((v) => {
        balances.push({
          id: `bal-${v.id}`,
          variantId: v.id,
          productName: prod.name,
          imageUrl: prod.imageUrl,
          categoryName: prod.category?.name || 'Garment',
          sku: v.sku,
          barcode: v.barcode,
          size: v.size,
          color: v.color,
          costPrice: v.costPrice,
          sellingPrice: v.sellingPrice,
          quantityOnHand: v.stockOnHand ?? 0,
          reorderLevel: v.reorderLevel || 5,
          isLowStock: (v.stockOnHand ?? 0) <= (v.reorderLevel || 5),
          isOutOfStock: (v.stockOnHand ?? 0) === 0,
        });
      });
    });

    return balances;
  }
}

export const demoStore = new DemoStore();
