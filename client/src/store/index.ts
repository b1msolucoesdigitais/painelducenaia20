import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  email: string;
}

export interface Section {
  id: number;
  title: string;
  content: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Webhook {
  id: number;
  type: 'save' | 'update';
  url: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

interface SectionsState {
  sections: Section[];
  isLoading: boolean;
  setSections: (sections: Section[]) => void;
  addSection: (section: Section) => void;
  updateSection: (id: number, updates: Partial<Section>) => void;
  removeSection: (id: number) => void;
  reorderSections: (sections: Section[]) => void;
  setLoading: (loading: boolean) => void;
}

interface WebhooksState {
  webhooks: Webhook[];
  isLoading: boolean;
  setWebhooks: (webhooks: Webhook[]) => void;
  addWebhook: (webhook: Webhook) => void;
  updateWebhook: (id: number, updates: Partial<Webhook>) => void;
  removeWebhook: (id: number) => void;
  setLoading: (loading: boolean) => void;
}

interface UIState {
  isModalOpen: boolean;
  modalType: 'section' | 'settings' | 'users' | 'stats' | null;
  selectedSection: Section | null;
  setModalOpen: (open: boolean, type?: 'section' | 'settings' | 'users' | 'stats' | null, section?: Section | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export const useSectionsStore = create<SectionsState>((set) => ({
  sections: [],
  isLoading: false,
  setSections: (sections) => set({ sections }),
  addSection: (section) => set((state) => ({ 
    sections: [...state.sections, section] 
  })),
  updateSection: (id, updates) => set((state) => ({
    sections: state.sections.map(section => 
      section.id === id ? { ...section, ...updates } : section
    )
  })),
  removeSection: (id) => set((state) => ({
    sections: state.sections.filter(section => section.id !== id)
  })),
  reorderSections: (sections) => set({ sections }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export const useWebhooksStore = create<WebhooksState>((set) => ({
  webhooks: [],
  isLoading: false,
  setWebhooks: (webhooks) => set({ webhooks }),
  addWebhook: (webhook) => set((state) => ({ 
    webhooks: [...state.webhooks, webhook] 
  })),
  updateWebhook: (id, updates) => set((state) => ({
    webhooks: state.webhooks.map(webhook => 
      webhook.id === id ? { ...webhook, ...updates } : webhook
    )
  })),
  removeWebhook: (id) => set((state) => ({
    webhooks: state.webhooks.filter(webhook => webhook.id !== id)
  })),
  setLoading: (isLoading) => set({ isLoading }),
}));

export const useUIStore = create<UIState>((set) => ({
  isModalOpen: false,
  modalType: null,
  selectedSection: null,
  setModalOpen: (isModalOpen, modalType = null, selectedSection = null) => 
    set({ isModalOpen, modalType, selectedSection }),
}));
