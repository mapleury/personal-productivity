import type { AssistantContext } from "./briefing";
import { dayScore, streak } from "./score";
import { dayKey, todayKey } from "./time";
import { useCalendar } from "./store/calendar";
import { useGoals } from "./store/goals";
import { useProductivity } from "./store/productivity";
import { useSettings } from "./store/settings";
import { useTasks } from "./store/tasks";
import { PRIORITY_META } from "./types";

export function buildContext(): AssistantContext {
  const now = new Date();
  const today = todayKey();
  const tasks = useTasks.getState().tasks;
  const open = tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank);
  const priorities = tasks
    .filter((t) => t.status !== "done" && t.quadrant === "urgent-important")
    .sort((a, b) => a.order - b.order)
    .slice(0, 3)
    .map((t) => t.title);
  const sessions = useProductivity
    .getState()
    .sessions.filter((s) => dayKey(s.startedAt) === today)
    .map((s) => ({ minutes: s.minutes, label: s.label ?? null }));
  const a = useProductivity.getState().activity[today];
  const keys = Array.from({ length: 400 }, (_, i) => dayKey(new Date(now.getTime() - i * 86400000)));
  const planned = a?.planned ?? 0;
  const plannedDone = a?.plannedDone ?? 0;
  return {
    name: useSettings.getState().name,
    currentTime: now.toISOString(),
    todaySchedule: useCalendar
      .getState()
      .events.filter((e) => e.date === today)
      .sort((x, y) => x.start.localeCompare(y.start))
      .map((e) => ({ title: e.title, start: e.start, end: e.end, type: e.type })),
    tasks: open.map((t) => ({
      title: t.title,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate,
      dueTime: t.dueTime,
    })),
    completedToday: tasks
      .filter((t) => t.completedAt && dayKey(t.completedAt) === today)
      .map((t) => t.title),
    priorities: priorities.length ? priorities : open.slice(0, 3).map((t) => t.title),
    weeklyGoals: useGoals.getState().goals.map((g) => ({ title: g.title, progress: g.progress, deadline: g.deadline })),
    focusSessions: sessions,
    stats: {
      focusMin: a?.focusMin ?? 0,
      tasksDone: a?.tasksDone ?? 0,
      planned,
      plannedDone,
      streak: streak(useProductivity.getState().activity, keys),
      planPct: planned ? Math.round((plannedDone / planned) * 100) : 0,
    },
  };
}

export function todayScore(): number {
  return dayScore(useProductivity.getState().activity[todayKey()]);
}
