import { create } from "zustand";

interface UIState {
  paletteOpen: boolean;
  dockOpen: boolean;
  mobileNavOpen: boolean;
  setPalette: (b: boolean) => void;
  setDock: (b: boolean) => void;
  setMobileNav: (b: boolean) => void;
}

export const useUI = create<UIState>()((set) => ({
  paletteOpen: false,
  dockOpen: false,
  mobileNavOpen: false,
  setPalette: (b) => set({ paletteOpen: b }),
  setDock: (b) => set({ dockOpen: b }),
  setMobileNav: (b) => set({ mobileNavOpen: b }),
}));
