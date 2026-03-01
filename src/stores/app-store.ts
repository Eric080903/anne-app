import { create } from 'zustand';

interface AppStore {
  sidebarOpen: boolean;
  activeSymbol: string | null;
  connected: boolean;
  toggleSidebar: () => void;
  setActiveSymbol: (symbol: string | null) => void;
  setConnected: (connected: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  sidebarOpen: true,
  activeSymbol: null,
  connected: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),
  setConnected: (connected) => set({ connected }),
}));
