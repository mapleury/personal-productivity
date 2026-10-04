import type { CalEvent, DayActivity, FocusSession, Goal, Task } from "./types";
import { addDays, dayKey } from "./time";

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SeedData {
  tasks: Task[];
  goals: Goal[];
  events: CalEvent[];
  sessions: FocusSession[];
  activity: Record<string, DayActivity>;
}

const at = (d: Date, h: number, m = 0) => {
  const x = new Date(d);
  x.setHours(h, m, 0, 0);
  return x.getTime();
};

export function buildEmptySeed(): SeedData {
  return {
    tasks: [],
    goals: [],
    events: [],
    sessions: [],
    activity: {},
  };
}

export function buildDemoSeed(): SeedData {
  const now = new Date();
  const k = (offset: number) => dayKey(addDays(now, offset));
  const today = k(0);
  const rng = mulberry32(20260922);

  const goals: Goal[] = [
    { id: "g-ielts", title: "IELTS", progress: 80, deadline: k(4), taskIds: ["t-ielts"] },
    { id: "g-daemon", title: "Daemon UI", progress: 60, deadline: k(2), taskIds: ["t-daemon"] },
    { id: "g-cyber", title: "Cybersecurity", progress: 40, deadline: k(6), taskIds: ["t-cyber"] },
    { id: "g-portfolio", title: "Portfolio", progress: 70, deadline: k(9), taskIds: ["t-portfolio"] },
  ];

  const tasks: Task[] = [
    {
      id: "t-daemon",
      title: "Finish Daemon UI",
      description: "Complete the dashboard grid, metric cards and right-panel calendar.",
      dueDate: today,
      dueTime: "18:00",
      priority: "high",
      category: "Build",
      status: "progress",
      estimateMin: 120,
      actualMin: 75,
      tags: ["design", "frontend"],
      goalId: "g-daemon",
      quadrant: "urgent-important",
      order: 0,
      createdAt: at(now, 8, 0),
    },
    {
      id: "t-ielts",
      title: "IELTS Speaking practice",
      description: "Part 2 cue cards — record and review two answers.",
      dueDate: today,
      dueTime: "19:00",
      priority: "high",
      category: "Study",
      status: "todo",
      estimateMin: 45,
      actualMin: 0,
      tags: ["english"],
      goalId: "g-ielts",
      quadrant: "urgent-important",
      order: 1,
      createdAt: at(now, 8, 5),
    },
    {
      id: "t-cyber",
      title: "Complete cybersecurity module",
      description: "Module 6: network defence lab + quiz.",
      dueDate: today,
      dueTime: "21:00",
      priority: "medium",
      category: "Study",
      status: "todo",
      estimateMin: 60,
      actualMin: 0,
      tags: ["course"],
      goalId: "g-cyber",
      quadrant: "important",
      order: 2,
      createdAt: at(now, 8, 10),
    },
    {
      id: "t-portfolio",
      title: "Portfolio case study write-up",
      dueDate: k(2),
      priority: "medium",
      category: "Writing",
      status: "todo",
      estimateMin: 90,
      actualMin: 0,
      tags: ["portfolio"],
      goalId: "g-portfolio",
      quadrant: "important",
      order: 3,
      createdAt: at(now, 8, 15),
    },
    {
      id: "t-expenses",
      title: "Submit expense report",
      dueDate: today,
      dueTime: "17:00",
      priority: "medium",
      category: "Admin",
      status: "todo",
      estimateMin: 15,
      actualMin: 0,
      tags: ["admin"],
      quadrant: "urgent",
      order: 4,
      createdAt: at(now, 8, 20),
    },
    {
      id: "t-domain",
      title: "Renew personal domain",
      dueDate: k(5),
      priority: "low",
      category: "Admin",
      status: "todo",
      estimateMin: 10,
      actualMin: 0,
      tags: [],
      quadrant: "low",
      order: 5,
      createdAt: at(now, 8, 25),
    },
    {
      id: "t-done-1",
      title: "Ship dashboard metric cards",
      dueDate: today,
      priority: "high",
      category: "Build",
      status: "done",
      estimateMin: 60,
      actualMin: 55,
      tags: ["frontend"],
      goalId: "g-daemon",
      quadrant: "urgent-important",
      order: 6,
      createdAt: at(now, 7, 0),
      completedAt: at(now, 10, 40),
    },
    {
      id: "t-done-2",
      title: "Review PR comments",
      dueDate: today,
      priority: "medium",
      category: "Build",
      status: "done",
      estimateMin: 25,
      actualMin: 20,
      tags: [],
      quadrant: "urgent",
      order: 7,
      createdAt: at(now, 7, 10),
      completedAt: at(now, 11, 30),
    },
    {
      id: "t-done-3",
      title: "Morning inbox zero",
      dueDate: today,
      priority: "low",
      category: "Admin",
      status: "done",
      estimateMin: 15,
      actualMin: 12,
      tags: [],
      quadrant: "low",
      order: 8,
      createdAt: at(now, 7, 20),
      completedAt: at(now, 8, 45),
    },
    {
      id: "t-done-4",
      title: "Vocabulary review — 40 words",
      dueDate: today,
      priority: "medium",
      category: "Study",
      status: "done",
      estimateMin: 20,
      actualMin: 18,
      tags: ["english"],
      goalId: "g-ielts",
      quadrant: "important",
      order: 9,
      createdAt: at(now, 7, 30),
      completedAt: at(now, 13, 20),
    },
  ];

  const events: CalEvent[] = [
    { id: "e-1", title: "Deep Work", date: today, start: "09:00", end: "10:30", type: "focus" },
    { id: "e-2", title: "School", date: today, start: "11:00", end: "13:00", type: "meeting", location: "Campus" },
    { id: "e-3", title: "Lunch", date: today, start: "13:00", end: "14:00", type: "personal" },
    { id: "e-4", title: "Cybersecurity", date: today, start: "15:00", end: "16:30", type: "study" },
    { id: "e-5", title: "IELTS", date: today, start: "19:00", end: "20:00", type: "study", location: "Online" },
    { id: "e-6", title: "Daemon", date: today, start: "20:00", end: "22:00", type: "focus" },
    { id: "e-7", title: "Deep Work", date: k(1), start: "09:00", end: "11:00", type: "focus" },
    { id: "e-8", title: "Design review", date: k(1), start: "14:00", end: "15:00", type: "meeting" },
    { id: "e-9", title: "Daemon UI milestone", date: k(2), start: "18:00", type: "deadline" },
    { id: "e-10", title: "IELTS mock test", date: k(4), start: "10:00", end: "12:00", type: "study" },
    { id: "e-11", title: "Gym", date: k(1), start: "18:00", end: "19:00", type: "personal" },
  ];

  const sessions: FocusSession[] = [
    { id: "s-1", startedAt: at(now, 9, 0), endedAt: at(now, 9, 30), minutes: 30, mode: "custom", taskId: "t-daemon", label: "Finish Daemon UI" },
    { id: "s-2", startedAt: at(now, 9, 35), endedAt: at(now, 10, 20), minutes: 45, mode: "custom", taskId: "t-daemon", label: "Finish Daemon UI" },
    { id: "s-3", startedAt: at(now, 10, 25), endedAt: at(now, 11, 15), minutes: 50, mode: "custom", taskId: "t-done-1", label: "Ship dashboard metric cards" },
    { id: "s-4", startedAt: at(now, 15, 0), endedAt: at(now, 15, 30), minutes: 30, mode: "pomodoro", taskId: "t-cyber", label: "Complete cybersecurity module" },
  ];

  const activity: Record<string, DayActivity> = {};
  for (let i = 364; i >= 1; i--) {
    const d = addDays(now, -i);
    const key = dayKey(d);
    const dow = d.getDay();
    const weekend = dow === 0 || dow === 6;
    const rest = rng() < (weekend ? 0.35 : 0.08);
    const base = weekend ? 25 + rng() * 70 : 60 + rng() * 140;
    const focusMin = rest ? 0 : Math.round(base);
    const tasksDone = rest ? 0 : Math.max(1, Math.round(focusMin / 45 + rng() * 2));
    const planned = tasksDone + Math.floor(rng() * 3);
    const plannedDone = rng() < 0.75 ? tasksDone : Math.max(0, planned - 1);
    activity[key] = {
      date: key,
      focusMin,
      tasksDone,
      planned: Math.max(planned, 1),
      plannedDone,
      sessions: rest ? 0 : Math.max(1, Math.round(focusMin / 35)),
    };
  }
  // guarantee a live 6-day streak leading into today
  for (let i = 6; i >= 1; i--) {
    const key = dayKey(addDays(now, -i));
    const a = activity[key];
    if (a.focusMin < 70) {
      activity[key] = { ...a, focusMin: 75 + Math.round(rng() * 60), sessions: Math.max(2, a.sessions), tasksDone: Math.max(3, a.tasksDone), planned: Math.max(5, a.planned), plannedDone: Math.max(4, a.plannedDone) };
    }
  }
  activity[today] = { date: today, focusMin: 155, tasksDone: 4, planned: 6, plannedDone: 4, sessions: 4 };

  return { tasks, goals, events, sessions, activity };
}

export function buildSeed(): SeedData {
  return buildEmptySeed();
}
