import { create } from 'zustand';

export interface Toast {
  id: string;
  icon: string;
  senderName: string;
  message: string;
  createdAt: number;
}

interface ToastState {
  toasts: Toast[];
}

interface ToastActions {
  addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => void;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastState & ToastActions>()((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = crypto.randomUUID();
    set((s) => ({
      toasts: [...s.toasts, { ...toast, id, createdAt: Date.now() }].slice(-5),
    }));

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  clearAll: () => set({ toasts: [] }),
}));
