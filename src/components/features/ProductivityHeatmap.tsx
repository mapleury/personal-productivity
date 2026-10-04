"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { dayKey, fmtDur, monthMatrix, todayKey } from "@/lib/time";
import { dayScore, intensity, LEVEL_CLASS, LEVEL_LABEL, streak, type Level } from "@/lib/score";
import { useProductivity } from "@/lib/store/productivity";
import { useNow } from "@/lib/useNow";

type View = "day" | "week" | "month" | "year";
const VIEWS: View[] = ["day", "week", "month", "year"];

function Cell({ level, size = 12, title }: { level: Level; size?: number; title: string }) {
  return (
    <span
      title={title}
      className={cn("block rounded-[3px] transition-colors", LEVEL_CLASS[level])}
      style={{ width: size, height: size }}
    />
  );
}

export function ProductivityHeatmap({ withToggle = true }: { withToggle?: boolean }) {
  const activity = useProductivity((s) => s.activity);
  const sessions = useProductivity((s) => s.sessions);
  const [view, setView] = useState<View>("week");
  const today = todayKey();
  const nowMs = useNow(3600000).getTime();

  const keys = useMemo(
    () => Array.from({ length: 400 }, (_, i) => dayKey(new Date(nowMs - i * 86400000))),
    [nowMs],
  );
  const streakDays = streak(activity, keys);
  const a = activity[today];
  const pct = a?.planned ? Math.round((a.plannedDone / a.planned) * 100) : 0;

  const weekGrid = useMemo(() => {
    const end = new Date();
    const start = new Date(end.getTime() - 19 * 7 * 86400000);
    const cols: string[][] = [];
    for (let w = 0; w < 20; w++) {
      const col: string[] = [];
      for (let d = 0; d < 7; d++) col.push(dayKey(new Date(start.getTime() + (w * 7 + d) * 86400000)));
      cols.push(col);
    }
    return cols;
  }, []);

  const hourLevels = useMemo(() => {
    const per = Array(24).fill(0);
    for (const s of sessions) {
      if (dayKey(s.startedAt) !== today) continue;
      const h = new Date(s.startedAt).getHours();
      per[h] += s.minutes;
    }
    return per.map((m: number): Level => (m === 0 ? 0 : m < 15 ? 1 : m < 30 ? 2 : m < 45 ? 3 : 4));
  }, [sessions, today]);

  const monthWeeks = useMemo(() => {
    const d = new Date();
    return monthMatrix(d.getFullYear(), d.getMonth());
  }, []);

  return (
    <div>
      {withToggle ? (
        <div className="mb-4 flex items-center justify-between">
          <span className="label-xs">Productivity activity</span>
          <div className="flex rounded-full bg-surface-2 p-0.5">
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium capitalize transition-all duration-200",
                  view === v ? "bg-surface text-ink shadow-card" : "text-ink-3 hover:text-ink-2",
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {view === "week" ? (
        <div className="overflow-x-auto">
          <div className="flex gap-[3px]">
            {weekGrid.map((col, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {col.map((k) => (
                  <Cell key={k} level={intensity(dayScore(activity[k]))} title={`${k} · ${LEVEL_LABEL[intensity(dayScore(activity[k]))]}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {view === "day" ? (
        <div>
          <div className="flex gap-[3px]">
            {hourLevels.map((lv, h) => (
              <Cell key={h} level={lv} size={16} title={`${String(h).padStart(2, "0")}:00 · ${LEVEL_LABEL[lv]}`} />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] text-ink-3 tnum">
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>23</span>
          </div>
        </div>
      ) : null}

      {view === "month" ? (
        <div className="grid grid-cols-7 gap-[4px]">
          {monthWeeks.flat().map((d) => {
            const k = dayKey(d);
            const inMonth = d.getMonth() === new Date().getMonth();
            return (
              <div key={k} className={cn(!inMonth && "opacity-25")}>
                <Cell level={intensity(dayScore(activity[k]))} size={18} title={`${k} · ${LEVEL_LABEL[intensity(dayScore(activity[k]))]}`} />
              </div>
            );
          })}
        </div>
      ) : null}

      {view === "year" ? (
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-4">
          {Array.from({ length: 12 }, (_, m) => {
            const d = new Date();
            const weeks = monthMatrix(d.getFullYear(), m);
            return (
              <div key={m}>
                <div className="mb-1 text-[9.5px] font-semibold uppercase tracking-wider text-ink-3">
                  {new Date(d.getFullYear(), m, 1).toLocaleDateString("en-US", { month: "short" })}
                </div>
                <div className="flex gap-[2px]">
                  {weeks.map((col, i) => (
                    <div key={i} className="flex flex-col gap-[2px]">
                      {col.map((dd) => {
                        const k = dayKey(dd);
                        const inMonth = dd.getMonth() === m;
                        return (
                          <span key={k} className={cn(!inMonth && "opacity-0")}>
                            <Cell level={intensity(dayScore(activity[k]))} size={6} title={k} />
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between">
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Today" value={`${pct}%`} sub="planned work completed" />
          <Stat label="Focus" value={fmtDur(a?.focusMin ?? 0)} sub="logged today" />
          <Stat label="Tasks" value={String(a?.tasksDone ?? 0)} sub="completed today" />
          <Stat label="Streak" value={`${streakDays} days`} sub="consecutive activity" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[9.5px] text-ink-3">
        Less
        {([0, 1, 2, 3, 4] as Level[]).map((lv) => (
          <Cell key={lv} level={lv} size={9} title={LEVEL_LABEL[lv]} />
        ))}
        More
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div className="label-xs">{label}</div>
      <div className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em] text-ink tnum">{value}</div>
      <div className="text-[10px] text-ink-3">{sub}</div>
    </div>
  );
}
