import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimerMode } from "../types";
import { uid } from "../time";
import { useProductivity } from "./productivity";
import { useTasks } from "./tasks";

const BASE: Record<TimerMode, number> = { pomodoro: 25, short: 5, long: 15, custom: 50 };

interface TimerState {
  mode: TimerMode;
  customMin: number;
  running: boolean;
  endsAt: number | null;
  pausedRemaining: number;
  startedAt: number | null;
  activeTaskId: string | null;
  completedPomodoros: number;
  lastCompletedAt: number | null;
  setMode: (m: TimerMode) => void;
  setCustom: (min: number) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  complete: () => void;
  setActiveTask: (id: string | null) => void;
}

export const durationMin = (s: Pick<TimerState, "mode" | "customMin">) =>
  s.mode === "custom" ? Math.max(1, s.customMin) : BASE[s.mode];

export const remainingSec = (s: Pick<TimerState, "running" | "endsAt" | "pausedRemaining">, now = Date.now()) =>
  s.running && s.endsAt ? Math.max(0, (s.endsAt - now) / 1000) : s.pausedRemaining;

const nextMode = (mode: TimerMode, pomodoros: number): TimerMode => {
  if (mode === "pomodoro") return pomodoros % 4 === 0 ? "long" : "short";
  return "pomodoro";
};

export const useTimer = create<TimerState>()(
  persist(
    (set, get) => ({
      mode: "pomodoro",
      customMin: 50,
      running: false,
      endsAt: null,
      pausedRemaining: BASE.pomodoro * 60,
      startedAt: null,
      activeTaskId: null,
      completedPomodoros: 0,
      lastCompletedAt: null,
      setMode: (m) => set({ mode: m, running: false, endsAt: null, pausedRemaining: durationMin({ mode: m, customMin: get().customMin }) * 60 }),
      setCustom: (min) => {
        const v = Math.max(1, Math.min(240, Math.round(min)));
        set((s) => ({
          customMin: v,
          ...(s.mode === "custom" && !s.running ? { pausedRemaining: v * 60 } : {}),
        }));
      },
      start: () => {
        const dur = durationMin(get()) * 60;
        set({ running: true, startedAt: Date.now(), endsAt: Date.now() + dur * 1000, pausedRemaining: dur });
      },
      pause: () => set({ running: false, endsAt: null, pausedRemaining: remainingSec(get()) }),
      resume: () => {
        const r = remainingSec(get());
        if (r <= 0) return;
        set({ running: true, endsAt: Date.now() + r * 1000 });
      },
      reset: () => set({ running: false, endsAt: null, pausedRemaining: durationMin(get()) * 60, startedAt: null }),
      skip: () => {
        const m = nextMode(get().mode, get().completedPomodoros + 1);
        set({ mode: m, running: false, endsAt: null, startedAt: null, pausedRemaining: durationMin({ mode: m, customMin: get().customMin }) * 60 });
      },
      complete: () => {
        const s = get();
        const minutes = durationMin(s);
        const task = s.activeTaskId ? useTasks.getState().tasks.find((t) => t.id === s.activeTaskId) : null;
        const endedAt = Date.now();
        useProductivity.getState().recordSession({
          id: uid("s"),
          startedAt: s.startedAt ?? endedAt - minutes * 60000,
          endedAt,
          minutes,
          mode: s.mode,
          taskId: s.activeTaskId,
          label: task?.title,
        });
        if (task) useTasks.getState().update(task.id, { actualMin: task.actualMin + minutes });
        const pomodoros = s.completedPomodoros + (s.mode === "pomodoro" ? 1 : 0);
        const m = nextMode(s.mode, pomodoros);
        set({
          completedPomodoros: pomodoros,
          lastCompletedAt: endedAt,
          mode: m,
          running: false,
          endsAt: null,
          startedAt: null,
          pausedRemaining: durationMin({ mode: m, customMin: s.customMin }) * 60,
        });
      },
      setActiveTask: (id) => set({ activeTaskId: id }),
    }),
    {
      name: "wanei.timer.v1",
      partialize: (s) => ({
        mode: s.mode,
        customMin: s.customMin,
        running: s.running,
        endsAt: s.endsAt,
        pausedRemaining: s.pausedRemaining,
        startedAt: s.startedAt,
        activeTaskId: s.activeTaskId,
        completedPomodoros: s.completedPomodoros,
      }),
    },
  ),
);
