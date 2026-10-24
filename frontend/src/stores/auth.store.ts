import { create } from 'zustand';
import { User, Business, Branch } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  business: Business | null;
  branches: Branch[];
  activeBranchId: string | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  setAuth: (token: string, user: User, business: Business, branches: Branch[]) => void;
  setActiveBranch: (branchId: string) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  business: null,
  branches: [],
  activeBranchId: localStorage.getItem('ralypto_active_branch_id') || null,
  token: localStorage.getItem('ralypto_token') || null,
  isLoading: true,
  error: null,

  setAuth: (token, user, business, branches) => {
    localStorage.setItem('ralypto_token', token);
    const activeBranch = branches.find((b) => b.isMain) || branches[0];
    const activeBranchId = activeBranch ? activeBranch.id : null;
    if (activeBranchId) {
      localStorage.setItem('ralypto_active_branch_id', activeBranchId);
    }
    set({
      token,
      user,
      business,
      branches,
      activeBranchId,
      isLoading: false,
      error: null,
    });
  },

  setActiveBranch: (branchId: string) => {
    localStorage.setItem('ralypto_active_branch_id', branchId);
    set({ activeBranchId: branchId });
  },

  logout: () => {
    localStorage.removeItem('ralypto_token');
    localStorage.removeItem('ralypto_active_branch_id');
    set({
      user: null,
      business: null,
      branches: [],
      activeBranchId: null,
      token: null,
      isLoading: false,
    });
  },

  initAuth: async () => {
    const token = localStorage.getItem('ralypto_token');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        const { user, business, branches } = res.data;
        const currentActive = localStorage.getItem('ralypto_active_branch_id');
        const activeBranchId = currentActive || (branches[0] ? branches[0].id : null);
        set({
          user,
          business,
          branches,
          activeBranchId,
          isLoading: false,
        });
      } else {
        get().logout();
      }
    } catch (err) {
      console.warn('Session expired or server unavailable');
      get().logout();
    }
  },
}));
