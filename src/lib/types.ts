export type Priority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "todo" | "progress" | "done";
export type Quadrant = "urgent-important" | "important" | "urgent" | "low";
export type TimerMode = "pomodoro" | "short" | "long" | "custom";
export type EventType = "task" | "meeting" | "study" | "focus" | "personal" | "deadline";
export type RepeatMode = "off" | "all" | "one";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // yyyy-MM-dd
  dueTime?: string; // HH:mm
  priority: Priority;
  category: string;
  status: TaskStatus;
  estimateMin: number;
  actualMin: number;
  tags: string[];
  goalId?: string | null;
  notes?: string;
  quadrant: Quadrant;
  order: number;
  createdAt: number;
  completedAt?: number | null;
}

export interface Goal {
  id: string;
  title: string;
  progress: number; // 0-100
  deadline: string; // yyyy-MM-dd
  taskIds: string[];
}

export interface CalEvent {
  id: string;
  title: string;
  date: string; // yyyy-MM-dd
  start: string; // HH:mm
  end?: string; // HH:mm
  type: EventType;
  location?: string;
}

export interface FocusSession {
  id: string;
  startedAt: number;
  endedAt: number;
  minutes: number;
  mode: TimerMode;
  taskId?: string | null;
  label?: string;
}

export interface Track {
  id: string;
  name: string;
  artist: string;
  duration: number; // seconds
  size: number;
  mime: string;
  addedAt: number;
}

export interface DayActivity {
  date: string; // yyyy-MM-dd
  focusMin: number;
  tasksDone: number;
  planned: number;
  plannedDone: number;
  sessions: number;
}

export interface AssistantMessage {
  role: "user" | "assistant";
  text: string;
  at: number;
}

export const PRIORITY_META: Record<Priority, { label: string; rank: number }> = {
  critical: { label: "Critical", rank: 0 },
  high: { label: "High", rank: 1 },
  medium: { label: "Medium", rank: 2 },
  low: { label: "Low", rank: 3 },
};

export const QUADRANT_META: Record<Quadrant, { label: string; hint: string }> = {
  "urgent-important": { label: "Urgent + Important", hint: "Do now" },
  important: { label: "Important", hint: "Schedule" },
  urgent: { label: "Urgent", hint: "Delegate or bound" },
  low: { label: "Low priority", hint: "Later" },
};

export const EVENT_META: Record<EventType, { label: string; dot: string; tint: string }> = {
  task: { label: "Task", dot: "bg-accent-2", tint: "bg-accent-soft text-accent" },
  meeting: { label: "Meeting", dot: "bg-ink-2", tint: "bg-surface-3 text-ink-2" },
  study: { label: "Study", dot: "bg-accent-3", tint: "bg-accent-soft text-accent-2" },
  focus: { label: "Focus", dot: "bg-accent", tint: "bg-accent text-white" },
  personal: { label: "Personal", dot: "bg-ink-3", tint: "bg-surface-2 text-ink-3" },
  deadline: { label: "Deadline", dot: "bg-night", tint: "bg-night text-white" },
};
