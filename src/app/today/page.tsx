"use client";

import { Check } from "lucide-react";
import { Card, CardHead } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { DailyTimeline } from "@/components/features/DailyTimeline";
import { TodayFocus } from "@/components/features/PriorityBoard";
import { useNow } from "@/lib/useNow";
import { dayKey, fmtDateLong, fmtDur, todayKey } from "@/lib/time";
import { dayScore, streak } from "@/lib/score";
import { useProductivity } from "@/lib/store/productivity";
import { useTasks } from "@/lib/store/tasks";

function StatsCard() {
  const activity = useProductivity((s) => s.activity);
  const today = todayKey();
  const a = activity[today];
  const nowMs = useNow(60000).getTime();
  const keys = Array.from({ length: 400 }, (_, i) => dayKey(new Date(nowMs - i * 86400000)));
  const items = [
    { label: "Planned completed", value: `${a?.planned ? Math.round((a.plannedDone / a.planned) * 100) : 0}%` },
    { label: "Focus logged", value: fmtDur(a?.focusMin ?? 0) },
    { label: "Tasks done", value: String(a?.tasksDone ?? 0) },
    { label: "Streak", value: `${streak(activity, keys)}d` },
    { label: "Activity index", value: `${dayScore(a)}%` },
  ];
  return (
    <Card className="p-5">
      <CardHead title="Day so far" sub="Live numbers, updated as you work" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        {items.map((i) => (
          <div key={i.label} className="rounded-xl bg-surface-2 px-3 py-2.5">
            <div className="label-xs">{i.label}</div>
            <div className="tnum mt-0.5 text-[16px] font-semibold text-ink">{i.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TodayTasks() {
  const tasks = useTasks((s) => s.tasks);
  const setStatus = useTasks((s) => s.setStatus);
  const today = todayKey();
  const list = tasks.filter((t) => t.dueDate === today).sort((a, b) => a.order - b.order);

  return (
    <Card className="p-5">
      <CardHead title="Tasks due today" sub={`${list.filter((t) => t.status === "done").length} of ${list.length} done`} />
      <div className="mt-3 space-y-1">
        {list.length === 0 ? <p className="py-4 text-center text-[12px] text-ink-3">Nothing due today.</p> : null}
        {list.map((t) => {
          const done = t.status === "done";
          return (
            <div key={t.id} className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-surface-2">
              <button
                aria-label={done ? "Reopen task" : "Complete task"}
                onClick={() => setStatus(t.id, done ? "todo" : "done")}
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-colors ${
                  done ? "border-accent bg-accent text-white" : "border-line text-transparent hover:border-accent-3"
                }`}
              >
                <Check size={11} strokeWidth={3} />
              </button>
              <span className={`min-w-0 flex-1 truncate text-[12.5px] font-medium ${done ? "text-ink-3 line-through" : "text-ink-2"}`}>{t.title}</span>
              {t.dueTime ? <Chip tone="outline">{t.dueTime}</Chip> : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function TodaySessions() {
  const sessions = useProductivity((s) => s.sessions);
  const today = todayKey();
  const list = sessions.filter((s) => dayKey(s.startedAt) === today);
  return (
    <Card className="p-5">
      <CardHead title="Focus sessions" sub={`${list.length} logged today · ${fmtDur(list.reduce((a, s) => a + s.minutes, 0))}`} />
      <div className="mt-3 space-y-1.5">
        {list.length === 0 ? <p className="py-4 text-center text-[12px] text-ink-3">No sessions yet — start the timer.</p> : null}
        {list.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2">
            <span className="tnum text-[11px] text-ink-3">
              {new Date(s.startedAt).toTimeString().slice(0, 5)}–{new Date(s.endedAt).toTimeString().slice(0, 5)}
            </span>
            <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-ink-2">{s.label ?? "Focus session"}</span>
            <Chip tone="accent">{s.minutes}m</Chip>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function TodayPage() {
  const now = useNow(30000);
  const today = todayKey();
  return (
    <div className="space-y-4">
      <div>
        <div className="label-xs">Today</div>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink">{fmtDateLong(now)}</h1>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TodayFocus />
        </div>
        <StatsCard />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <CardHead title="Timeline" sub="Events, study blocks and focus windows" />
          <div className="mt-3">
            <DailyTimeline dateKey={today} now={now} />
          </div>
        </Card>
        <div className="space-y-4">
          <TodayTasks />
          <TodaySessions />
        </div>
      </div>
    </div>
  );
}
