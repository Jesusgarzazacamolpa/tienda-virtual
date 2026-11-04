import { create } from 'zustand';

export interface ToastMessage {
  id: number;
  message: string;
}

interface ToastState {
  toasts: ToastMessage[];
  push: (message: string) => void;
  dismiss: (id: number) => void;
}

let nextId = 0;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (message) => {
    const id = ++nextId;
    set((state) => ({ toasts: [...state.toasts, { id, message }] }));
    window.setTimeout(() => get().dismiss(id), 3500);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
}));
