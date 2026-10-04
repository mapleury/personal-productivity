import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  name: string;
  autoSpeak: boolean;
  setName: (n: string) => void;
  setAutoSpeak: (b: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      name: "Wanei",
      autoSpeak: true,
      setName: (n) => set({ name: n.trim() || "Wanei" }),
      setAutoSpeak: (b) => set({ autoSpeak: b }),
    }),
    { name: "wanei.settings.v1" },
  ),
);
