import type { DayActivity } from "./types";

/** Heuristic 0-100 "productivity activity" index for a day. Not a scientific measure. */
export function dayScore(a?: DayActivity): number {
  if (!a) return 0;
  const focus = Math.min(a.focusMin / 150, 1) * 55;
  const tasks =
    a.planned > 0 ? (Math.min(a.plannedDone, a.planned) / a.planned) * 35 : Math.min(a.tasksDone / 6, 1) * 35;
  const sessions = (Math.min(a.sessions, 5) / 5) * 10;
  return Math.round(focus + tasks + sessions);
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

export const STREAK_THRESHOLD = 30;

/** Consecutive days at or above threshold, ending today or yesterday. */
export function streak(activity: Record<string, DayActivity>, keys: string[]): number {
  let i = 0;
  if (keys.length && dayScore(activity[keys[0]]) < STREAK_THRESHOLD) i = 1;
  let count = 0;
  for (; i < keys.length; i++) {
    if (dayScore(activity[keys[i]]) >= STREAK_THRESHOLD) count++;
    else break;
  }
  return count;
}
