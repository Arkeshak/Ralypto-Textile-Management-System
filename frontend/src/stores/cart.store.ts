import { create } from 'zustand';
import { Customer } from '../types';

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  sku: string;
  barcode?: string;
  size: string;
  color: string;
  colorHex?: string;
  unitPrice: number;
  unitCost: number;
  quantity: number;
  discountAmount: number;
  stockOnHand: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  selectedCustomer: Customer | null;
  overallDiscount: number;
  notes: string;
  heldCarts: Array<{
    id: string;
    timestamp: Date;
    items: CartItem[];
    customer: Customer | null;
  }>;

  addItem: (item: Omit<CartItem, 'quantity' | 'discountAmount'>) => boolean;
  updateQuantity: (variantId: string, quantity: number) => void;
  updateItemDiscount: (variantId: string, discount: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  setCustomer: (customer: Customer | null) => void;
  setOverallDiscount: (discount: number) => void;
  setNotes: (notes: string) => void;

  holdCurrentCart: () => void;
  recallCart: (id: string) => void;

  getSubtotal: () => number;
  getTotalDiscounts: () => number;
  getGrandTotal: () => number;
  getTotalUnits: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  selectedCustomer: null,
  overallDiscount: 0,
  notes: '',
  heldCarts: [],

  addItem: (variantData) => {
    const { items } = get();
    const existingIndex = items.findIndex((i) => i.variantId === variantData.variantId);

    if (existingIndex > -1) {
      const existing = items[existingIndex];
      if (existing.quantity + 1 > variantData.stockOnHand) {
        return false; // Stock limit reached
      }
      const updated = [...items];
      updated[existingIndex] = {
        ...existing,
        quantity: existing.quantity + 1,
      };
      set({ items: updated });
      return true;
    } else {
      if (variantData.stockOnHand < 1) {
        return false; // No stock available
      }
      set({
        items: [
          ...items,
          {
            ...variantData,
            quantity: 1,
            discountAmount: 0,
          },
        ],
      });
      return true;
    }
  },

  updateQuantity: (variantId: string, quantity: number) => {
    const { items } = get();
    if (quantity <= 0) {
      set({ items: items.filter((i) => i.variantId !== variantId) });
      return;
    }

    const item = items.find((i) => i.variantId === variantId);
    if (!item) return;

    const clampedQty = Math.min(quantity, item.stockOnHand);
    set({
      items: items.map((i) =>
        i.variantId === variantId ? { ...i, quantity: clampedQty } : i
      ),
    });
  },

  updateItemDiscount: (variantId: string, discount: number) => {
    set({
      items: get().items.map((i) =>
        i.variantId === variantId ? { ...i, discountAmount: Math.max(0, discount) } : i
      ),
    });
  },

  removeItem: (variantId: string) => {
    set({ items: get().items.filter((i) => i.variantId !== variantId) });
  },

  clearCart: () => {
    set({
      items: [],
      selectedCustomer: null,
      overallDiscount: 0,
      notes: '',
    });
  },

  setCustomer: (customer) => set({ selectedCustomer: customer }),
  setOverallDiscount: (discount) => set({ overallDiscount: Math.max(0, discount) }),
  setNotes: (notes) => set({ notes }),

  holdCurrentCart: () => {
    const { items, selectedCustomer, heldCarts } = get();
    if (items.length === 0) return;

    set({
      heldCarts: [
        ...heldCarts,
        {
          id: `HOLD-${Date.now().toString().slice(-4)}`,
          timestamp: new Date(),
          items: [...items],
          customer: selectedCustomer,
        },
      ],
      items: [],
      selectedCustomer: null,
      overallDiscount: 0,
      notes: '',
    });
  },

  recallCart: (id: string) => {
    const { heldCarts } = get();
    const target = heldCarts.find((c) => c.id === id);
    if (!target) return;

    set({
      items: target.items,
      selectedCustomer: target.customer,
      heldCarts: heldCarts.filter((c) => c.id !== id),
    });
  },

  getSubtotal: () => {
    return get().items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  },

  getTotalDiscounts: () => {
    const itemDiscounts = get().items.reduce((acc, item) => acc + item.discountAmount, 0);
    return itemDiscounts + get().overallDiscount;
  },

  getGrandTotal: () => {
    const subtotal = get().getSubtotal();
    const discounts = get().getTotalDiscounts();
    return Math.max(0, subtotal - discounts);
  },

  getTotalUnits: () => {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  },
}));
