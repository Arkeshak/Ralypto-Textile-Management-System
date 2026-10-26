import { create } from 'zustand';
import { ToastItem } from '../lib/motion';

interface ToastState {
  items: ToastItem[];
  push: (text: string, tone?: 'ok' | 'warn' | 'error' | 'info') => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (text: string, tone: 'ok' | 'warn' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({ items: [...state.items, { id, text, tone }] }));
  },
  dismiss: (id: string) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
  },
}));
