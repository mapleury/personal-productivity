import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface SettingsState {
  name: string;
  autoSpeak: boolean;
  theme: Theme;
  setName: (n: string) => void;
  setAutoSpeak: (b: boolean) => void;
  setTheme: (t: Theme) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      name: "Wanei",
      autoSpeak: true,
      theme: "system",
      setName: (n) => set({ name: n.trim() || "Wanei" }),
      setAutoSpeak: (b) => set({ autoSpeak: b }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "wanei.settings.v1" },
  ),
);