import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task, TaskStatus } from "../types";
import { todayKey, uid } from "../time";
import { useProductivity } from "./productivity";

interface TasksState {
  tasks: Task[];
  add: (t: Partial<Task>) => Task;
  update: (id: string, patch: Partial<Task>) => void;
  remove: (id: string) => void;
  setStatus: (id: string, status: TaskStatus) => void;
  reorder: (dragId: string, overId: string) => void;
}

export const useTasks = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [],
      add: (patch) => {
        const tasks = get().tasks;
        const task: Task = {
          id: uid("t"),
          title: patch.title?.trim() || "Untitled task",
          description: patch.description ?? "",
          dueDate: patch.dueDate,
          dueTime: patch.dueTime,
          priority: patch.priority ?? "medium",
          category: patch.category ?? "General",
          status: patch.status ?? "todo",
          estimateMin: patch.estimateMin ?? 25,
          actualMin: patch.actualMin ?? 0,
          tags: patch.tags ?? [],
          goalId: patch.goalId ?? null,
          notes: patch.notes ?? "",
          quadrant: patch.quadrant ?? "important",
          order: tasks.length ? Math.max(...tasks.map((t) => t.order)) + 1 : 0,
          createdAt: Date.now(),
          completedAt: null,
        };
        set({ tasks: [...tasks, task] });
        if (task.dueDate) useProductivity.getState().bumpPlanned(task.dueDate, 1);
        return task;
      },
      update: (id, patch) =>
        set((st) => {
          const prev = st.tasks.find((t) => t.id === id);
          if (!prev) return st;
          if (patch.dueDate !== undefined && patch.dueDate !== prev.dueDate) {
            const p = useProductivity.getState();
            if (prev.dueDate) p.bumpPlanned(prev.dueDate, -1);
            if (patch.dueDate) p.bumpPlanned(patch.dueDate, 1);
          }
          return { tasks: st.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) };
        }),
      remove: (id) =>
        set((st) => {
          const prev = st.tasks.find((t) => t.id === id);
          if (prev?.dueDate && prev.status !== "done")
            useProductivity.getState().bumpPlanned(prev.dueDate, -1);
          return { tasks: st.tasks.filter((t) => t.id !== id) };
        }),
      setStatus: (id, status) =>
        set((st) => {
          const prev = st.tasks.find((t) => t.id === id);
          if (!prev || prev.status === status) return st;
          const p = useProductivity.getState();
          if (status === "done" && prev.status !== "done") p.bumpTasksDone(prev.dueDate ?? todayKey(), 1);
          if (prev.status === "done" && status !== "done") p.bumpTasksDone(prev.dueDate ?? todayKey(), -1);
          return {
            tasks: st.tasks.map((t) =>
              t.id === id
                ? { ...t, status, completedAt: status === "done" ? Date.now() : null }
                : t,
            ),
          };
        }),
      reorder: (dragId, overId) =>
        set((st) => {
          if (dragId === overId) return st;
          const drag = st.tasks.find((t) => t.id === dragId);
          const over = st.tasks.find((t) => t.id === overId);
          if (!drag || !over || drag.status !== over.status) return st;
          const column = st.tasks
            .filter((t) => t.status === over.status)
            .sort((a, b) => a.order - b.order)
            .map((t) => t.id)
            .filter((tid) => tid !== dragId);
          column.splice(column.indexOf(overId), 0, dragId);
          const orderMap = new Map(column.map((tid, i) => [tid, i]));
          return {
            tasks: st.tasks.map((t) =>
              orderMap.has(t.id) ? { ...t, order: orderMap.get(t.id)! } : t,
            ),
          };
        }),
    }),
    { name: "wanei.tasks.v2" },
  ),
);