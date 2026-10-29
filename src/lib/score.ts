import type { DayActivity, FocusSession, Task } from "./types";
import { dayKey } from "./time";

export const isFocusSession = (session: FocusSession) =>
  session.mode !== "short" && session.mode !== "long";

/** Heuristic 0-100 "productivity activity" index for a day. Not a scientific measure. */
export function dayScore(a?: DayActivity): number {
  if (!a) return 0;
  const focus = Math.min(a.focusMin / 150, 1) * 55;
  const tasks =
    a.planned > 0 ? (Math.min(a.plannedDone, a.planned) / a.planned) * 35 : Math.min(a.tasksDone / 6, 1) * 35;
  const sessions = (Math.min(a.sessions, 5) / 5) * 10;
  return Math.round(focus + tasks + sessions);
}

export function activityOnDay(
  activity: Record<string, DayActivity>,
  key: string,
  tasks: Task[] = [],
  sessions: FocusSession[] = [],
): DayActivity {
  const stored = activity[key];
  const dueTasks = tasks.filter((task) => task.dueDate === key);
  const completedTasks = tasks.filter(
    (task) =>
      (task.completedAt && dayKey(task.completedAt) === key) ||
      (!task.completedAt && task.status === "done" && task.dueDate === key),
  );
  const focusSessions = sessions.filter((session) => dayKey(session.startedAt) === key && isFocusSession(session));
  return {
    date: key,
    focusMin: Math.max(stored?.focusMin ?? 0, focusSessions.reduce((total, session) => total + session.minutes, 0)),
    tasksDone: Math.max(stored?.tasksDone ?? 0, completedTasks.length),
    planned: Math.max(stored?.planned ?? 0, dueTasks.length),
    plannedDone: Math.max(stored?.plannedDone ?? 0, dueTasks.filter((task) => task.status === "done").length),
    sessions: Math.max(stored?.sessions ?? 0, focusSessions.length),
  };
}

export type Level = 0 | 1 | 2 | 3 | 4;

export function intensity(score: number): Level {
  if (score <= 0) return 0;
  if (score < 25) return 1;
  if (score < 50) return 2;
  if (score < 75) return 3;
  return 4;
}

export const LEVEL_CLASS: Record<Level, string> = {
  0: "bg-[#edecef]",
  1: "bg-[#e8e3f2]",
  2: "bg-[#c6badf]",
  3: "bg-[#6b5aa8]",
  4: "bg-[#4b3f72]",
};

export const LEVEL_LABEL: Record<Level, string> = {
  0: "No activity",
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Very high",
};

/** Consecutive days with a completed task or at least 10 minutes of focus. */
export function streak(
  activity: Record<string, DayActivity>,
  keys: string[],
  tasks: Task[] = [],
  sessions: FocusSession[] = [],
): number {
  let i = 0;
  const hasActivity = (key: string) => {
    const day = activityOnDay(activity, key, tasks, sessions);
    return day.tasksDone > 0 || day.plannedDone > 0 || day.focusMin >= 10;
  };
  if (keys.length && !hasActivity(keys[0])) i = 1;
  let count = 0;
  for (; i < keys.length; i++) {
    if (hasActivity(keys[i])) count++;
    else break;
  }
  return count;
}
