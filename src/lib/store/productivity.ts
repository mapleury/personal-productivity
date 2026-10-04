import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DayActivity, FocusSession } from "../types";
import { dayKey } from "../time";

interface ProdState {
  activity: Record<string, DayActivity>;
  sessions: FocusSession[];
  recordSession: (s: FocusSession) => void;
  addFocus: (key: string, minutes: number) => void;
  bumpTasksDone: (key: string, delta: number) => void;
  bumpPlanned: (key: string, delta: number) => void;
}

const zero = (key: string): DayActivity => ({
  date: key,
  focusMin: 0,
  tasksDone: 0,
  planned: 0,
  plannedDone: 0,
  sessions: 0,
});

export const useProductivity = create<ProdState>()(
  persist(
    (set) => ({
      activity: {},
      sessions: [],
      recordSession: (s) =>
        set((st) => {
          const key = dayKey(s.startedAt);
          const a = st.activity[key] ?? zero(key);
          return {
            sessions: [s, ...st.sessions],
            activity: {
              ...st.activity,
              [key]: { ...a, focusMin: a.focusMin + s.minutes, sessions: a.sessions + 1 },
            },
          };
        }),
      addFocus: (key, minutes) =>
        set((st) => {
          const a = st.activity[key] ?? zero(key);
          return { activity: { ...st.activity, [key]: { ...a, focusMin: a.focusMin + minutes } } };
        }),
      bumpTasksDone: (key, delta) =>
        set((st) => {
          const a = st.activity[key] ?? zero(key);
          return {
            activity: {
              ...st.activity,
              [key]: {
                ...a,
                tasksDone: Math.max(0, a.tasksDone + delta),
                plannedDone: Math.max(0, a.plannedDone + delta),
              },
            },
          };
        }),
      bumpPlanned: (key, delta) =>
        set((st) => {
          const a = st.activity[key] ?? zero(key);
          return {
            activity: { ...st.activity, [key]: { ...a, planned: Math.max(0, a.planned + delta) } },
          };
        }),
    }),
    { name: "wanei.productivity.v2" },
  ),
);