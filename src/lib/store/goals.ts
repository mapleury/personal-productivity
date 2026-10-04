import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Goal } from "../types";
import { uid } from "../time";

interface GoalsState {
  goals: Goal[];
  add: (g: Partial<Goal>) => void;
  update: (id: string, patch: Partial<Goal>) => void;
  remove: (id: string) => void;
  bump: (id: string, delta: number) => void;
}

export const useGoals = create<GoalsState>()(
  persist(
    (set) => ({
      goals: [],
      add: (g) =>
        set((st) => ({
          goals: [
            ...st.goals,
            {
              id: uid("g"),
              title: g.title?.trim() || "Untitled goal",
              progress: g.progress ?? 0,
              deadline: g.deadline ?? "",
              taskIds: g.taskIds ?? [],
            },
          ],
        })),
      update: (id, patch) =>
        set((st) => ({ goals: st.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      remove: (id) => set((st) => ({ goals: st.goals.filter((g) => g.id !== id) })),
      bump: (id, delta) =>
        set((st) => ({
          goals: st.goals.map((g) =>
            g.id === id ? { ...g, progress: Math.max(0, Math.min(100, g.progress + delta)) } : g,
          ),
        })),
    }),
    { name: "wanei.goals.v2" },
  ),
);