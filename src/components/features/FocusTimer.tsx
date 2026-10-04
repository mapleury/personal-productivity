"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHead } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { dayKey, fmtClock, fmtDur, todayKey } from "@/lib/time";
import { durationMin, remainingSec, useTimer } from "@/lib/store/timer";
import { useTasks } from "@/lib/store/tasks";
import { useProductivity } from "@/lib/store/productivity";
import type { TimerMode } from "@/lib/types";

const MODES: { id: TimerMode; label: string }[] = [
  { id: "pomodoro", label: "Pomodoro" },
  { id: "short", label: "Short break" },
  { id: "long", label: "Long break" },
  { id: "custom", label: "Custom" },
];

export function FocusTimer({ full = false }: { full?: boolean }) {
  const timer = useTimer();
  const tasks = useTasks((s) => s.tasks);
  const sessions = useProductivity((s) => s.sessions);
  const activity = useProductivity((s) => s.activity);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!timer.running) return;
    const id = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(id);
  }, [timer.running]);

  const rem = remainingSec(timer);
  const total = durationMin(timer) * 60;
  const progress = total ? ((total - rem) / total) * 100 : 0;
  const open = tasks.filter((t) => t.status !== "done").sort((a, b) => a.order - b.order);
  const today = todayKey();
  const todaySessions = sessions.filter((s) => dayKey(s.startedAt) === today);
  const focusedToday = activity[today]?.focusMin ?? 0;

  const size = full ? 224 : 168;
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;

  return (
    <Card className={cn("p-5", full && "p-7")}>
      <CardHead
        title="Focus session"
        sub={timer.activeTaskId ? tasks.find((t) => t.id === timer.activeTaskId)?.title : ""}
        action={
          <div className="flex rounded-full bg-surface-2 p-0.5">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => timer.setMode(m.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200",
                  timer.mode === m.id ? "bg-surface text-ink shadow-card" : "text-ink-3 hover:text-ink-2",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        }
      />

      <div className={cn("mt-5 flex flex-col items-center gap-6", full ? "md:flex-row md:items-center md:gap-10" : "")}>
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-3)" strokeWidth={6} />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--color-accent-2)"
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c - (c * progress) / 100}
              className="transition-[stroke-dashoffset] duration-300 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={cn("tnum font-semibold tracking-[-0.03em] text-ink", full ? "text-[56px]" : "text-[40px]")}>
              {fmtClock(rem)}
            </div>
            <div className="label-xs mt-1">
              {timer.mode === "custom" ? `${timer.customMin} min custom` : MODES.find((m) => m.id === timer.mode)?.label}
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-4">
          {timer.mode === "custom" ? (
            <label className="block">
              <span className="label-xs mb-1.5 block">Custom duration</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={5}
                  max={180}
                  step={5}
                  value={timer.customMin}
                  onChange={(e) => timer.setCustom(Number(e.target.value))}
                  className="h-1 flex-1 cursor-pointer accent-[#4b3f72]"
                />
                <span className="tnum w-14 text-right text-[13px] font-medium text-ink">{timer.customMin} min</span>
              </div>
            </label>
          ) : null}

          <label className="block">
            <span className="label-xs mb-1.5 block">Working on</span>
            <select
              value={timer.activeTaskId ?? ""}
              onChange={(e) => timer.setActiveTask(e.target.value || null)}
              className="h-9 w-full appearance-none rounded-xl border border-line bg-surface px-3 text-[13px] text-ink focus:border-accent-3 focus:outline-none"
            >
              <option value="">No task attached</option>
              {open.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-2">
            {timer.running ? (
              <Button variant="primary" size="md" className="flex-1" onClick={timer.pause}>
                <Pause size={13} /> Pause
              </Button>
            ) : (
              <Button variant="accent" size="md" className="flex-1" onClick={timer.startedAt ? timer.resume : timer.start}>
                <Play size={13} /> {timer.startedAt ? "Resume" : "Start"}
              </Button>
            )}
            <Button variant="soft" size="md" onClick={timer.reset} title="Reset">
              <RotateCcw size={13} /> Reset
            </Button>
            <Button variant="soft" size="md" onClick={timer.skip} title="Skip to next mode">
              <SkipForward size={13} /> Skip
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-surface-2 px-3.5 py-2.5 text-[11.5px] text-ink-3">
            <span>
              Session <span className="font-semibold text-ink-2 tnum">#{todaySessions.length + 1}</span> today
            </span>
            <span className="tnum">{fmtDur(focusedToday)} focused today</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
