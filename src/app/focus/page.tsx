"use client";

import { Card, CardHead } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { FocusTimer } from "@/components/features/FocusTimer";
import { dayKey, fmtDur, todayKey } from "@/lib/time";
import { useProductivity } from "@/lib/store/productivity";

export default function FocusPage() {
  const sessions = useProductivity((s) => s.sessions);
  const activity = useProductivity((s) => s.activity);
  const today = todayKey();
  const todaySessions = sessions.filter((s) => dayKey(s.startedAt) === today);
  const recent = sessions.slice(0, 10);

  return (
    <div className="space-y-4">
      <div>
        <div className="label-xs">Focus</div>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink">Focus timer</h1>
        <p className="mt-1 text-[12.5px] text-ink-3">
          Pomodoro, breaks or a custom block. Completed sessions are logged automatically and feed your productivity activity.
        </p>
      </div>
      <FocusTimer full />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <CardHead title="Session history" sub="Most recent first" />
          <div className="mt-3 space-y-1.5">
            {recent.length === 0 ? <p className="py-4 text-center text-[12px] text-ink-3">No sessions yet.</p> : null}
            {recent.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2">
                <span className="tnum w-24 shrink-0 text-[11px] text-ink-3">
                  {dayKey(s.startedAt) === today ? "Today" : dayKey(s.startedAt).slice(5)} · {new Date(s.startedAt).toTimeString().slice(0, 5)}
                </span>
                <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-ink-2">{s.label ?? "Focus session"}</span>
                <Chip tone="outline">{s.mode}</Chip>
                <Chip tone="accent">{s.minutes}m</Chip>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <CardHead title="Today" />
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-surface-2 px-3.5 py-3">
              <div className="label-xs">Focused</div>
              <div className="tnum mt-0.5 text-[20px] font-semibold text-ink">{fmtDur(activity[today]?.focusMin ?? 0)}</div>
            </div>
            <div className="rounded-xl bg-surface-2 px-3.5 py-3">
              <div className="label-xs">Sessions</div>
              <div className="tnum mt-0.5 text-[20px] font-semibold text-ink">{todaySessions.length}</div>
            </div>
            <div className="rounded-xl bg-surface-2 px-3.5 py-3">
              <div className="label-xs">All-time sessions</div>
              <div className="tnum mt-0.5 text-[20px] font-semibold text-ink">{sessions.length}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
