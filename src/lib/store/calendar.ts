import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CalEvent } from "../types";
import { uid } from "../time";

interface CalendarState {
  events: CalEvent[];
  add: (e: Partial<CalEvent>) => void;
  update: (id: string, patch: Partial<CalEvent>) => void;
  remove: (id: string) => void;
}

export const useCalendar = create<CalendarState>()(
  persist(
    (set) => ({
      events: [],
      add: (e) =>
        set((st) => ({
          events: [
            ...st.events,
            {
              id: uid("e"),
              title: e.title?.trim() || "Untitled event",
              date: e.date ?? "",
              start: e.start ?? "09:00",
              end: e.end,
              type: e.type ?? "task",
              location: e.location ?? "",
            },
          ],
        })),
      update: (id, patch) =>
        set((st) => ({ events: st.events.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      remove: (id) => set((st) => ({ events: st.events.filter((e) => e.id !== id) })),
    }),
    { name: "wanei.calendar.v2" },
  ),
);

export const eventsOn = (dateKey: string) =>
  useCalendar
    .getState()
    .events.filter((e) => e.date === dateKey)
    .sort((a, b) => a.start.localeCompare(b.start));