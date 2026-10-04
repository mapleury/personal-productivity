import {
  addDays,
  addMonths,
  differenceInMinutes,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export { addDays, addMonths, startOfWeek, startOfMonth, format, parseISO, differenceInMinutes };

export const dayKey = (d: Date | number) => format(typeof d === "number" ? new Date(d) : d, "yyyy-MM-dd");
export const todayKey = () => dayKey(new Date());
export const fromKey = (k: string) => parseISO(k);

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** 155 -> "2h 35m" */
export function fmtDur(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h <= 0) return `${m}m`;
  return `${pad2(h)}h ${pad2(m)}m`;
}

/** seconds -> "25:00" */
export function fmtClock(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
}

/** seconds -> "03:21" or "63:10" for long player times */
export function fmtPlayer(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
}

/** "14:05" -> "14:05" kept, but also minutes since midnight */
export function hmToMin(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minToHm(min: number): string {
  return `${pad2(Math.floor(min / 60))}:${pad2(min % 60)}`;
}

export function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function fmtDateLong(d = new Date()): string {
  return format(d, "EEEE, MMMM d");
}

export function fmtDateMed(key: string): string {
  return format(fromKey(key), "MMM d");
}

/** Monday-start month matrix, 6 weeks x 7 days */
export function monthMatrix(year: number, month: number): Date[][] {
  const first = startOfMonth(new Date(year, month, 1));
  const gridStart = startOfWeek(first, { weekStartsOn: 1 });
  const weeks: Date[][] = [];
  let cur = gridStart;
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let i = 0; i < 7; i++) {
      row.push(cur);
      cur = addDays(cur, 1);
    }
    weeks.push(row);
  }
  return weeks;
}

export function weekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function isoWeekLabel(d: Date): string {
  return format(d, "WW");
}

export function relTime(ts: number, now = Date.now()): string {
  const diff = Math.round((now - ts) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}
