"use client";

import { Card } from "@/components/ui/Card";
import { dayKey, fmtDur, todayKey } from "@/lib/time";
import { dayScore, streak } from "@/lib/score";
import { useProductivity } from "@/lib/store/productivity";
import { useSettings } from "@/lib/store/settings";
import { useTasks } from "@/lib/store/tasks";
import { useNow } from "@/lib/useNow";

export default function ProfilePage() {
  const name = useSettings((s) => s.name);
  const tasks = useTasks((s) => s.tasks);
  const activity = useProductivity((s) => s.activity);
  const sessions = useProductivity((s) => s.sessions);
  const nowMs = useNow(60000).getTime();
  const keys = Array.from({ length: 400 }, (_, i) => dayKey(new Date(nowMs - i * 86400000)));
  const totalFocus = sessions.reduce((a, s) => a + s.minutes, 0);
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const stats = [
    { label: "Focus sessions", value: String(sessions.length) },
    { label: "Total focus", value: fmtDur(totalFocus) },
    { label: "Tasks completed", value: String(tasks.filter((t) => t.status === "done").length) },
    { label: "Activity streak", value: `${streak(activity, keys)} days` },
    { label: "Today's index", value: `${dayScore(activity[todayKey()])}%` },
    { label: "Open tasks", value: String(tasks.filter((t) => t.status !== "done").length) },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="flex items-center gap-5 p-6">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-night text-[20px] font-semibold text-white">{initials || "W"}</span>
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">{name}</h1>
          <p className="mt-0.5 text-[12.5px] text-ink-3">Operator of this personal productivity OS · running on wanei.</p>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="label-xs">{s.label}</div>
            <div className="tnum mt-1 text-[19px] font-semibold tracking-[-0.01em] text-ink">{s.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
