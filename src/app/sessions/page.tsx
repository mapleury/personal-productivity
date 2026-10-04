"use client";

import { Card, CardHead } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { dayKey, fmtDur, fromKey } from "@/lib/time";
import { useProductivity } from "@/lib/store/productivity";

export default function SessionsPage() {
  const sessions = useProductivity((s) => s.sessions);
  const groups = new Map<string, typeof sessions>();
  for (const s of sessions) {
    const k = dayKey(s.startedAt);
    groups.set(k, [...(groups.get(k) ?? []), s]);
  }
  const keys = [...groups.keys()].sort((a, b) => b.localeCompare(a));
  const totalMin = sessions.reduce((a, s) => a + s.minutes, 0);

  return (
    <div className="space-y-4">
      <div>
        <div className="label-xs">Focus</div>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink">Sessions</h1>
        <p className="mt-1 text-[12.5px] text-ink-3">
          {sessions.length} sessions · {fmtDur(totalMin)} of recorded focus, logged automatically by the timer.
        </p>
      </div>
      {keys.map((k) => {
        const list = groups.get(k)!;
        return (
          <Card key={k} className="p-5">
            <CardHead
              title={fromKey(k).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              sub={`${list.length} session${list.length === 1 ? "" : "s"} · ${fmtDur(list.reduce((a, s) => a + s.minutes, 0))}`}
            />
            <div className="mt-3 space-y-1.5">
              {list.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2">
                  <span className="tnum w-24 shrink-0 text-[11px] text-ink-3">
                    {new Date(s.startedAt).toTimeString().slice(0, 5)}–{new Date(s.endedAt).toTimeString().slice(0, 5)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-ink-2">{s.label ?? "Focus session"}</span>
                  <Chip tone="outline">{s.mode}</Chip>
                  <Chip tone="accent">{s.minutes}m</Chip>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
      {keys.length === 0 ? (
        <Card className="p-10 text-center text-[13px] text-ink-3">No sessions recorded yet. Start the focus timer to begin logging.</Card>
      ) : null}
    </div>
  );
}
