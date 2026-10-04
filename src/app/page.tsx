"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Card, CardHead } from "@/components/ui/Card";
import { MetricCards } from "@/components/features/MetricCards";
import { FocusTimer } from "@/components/features/FocusTimer";
import { ScheduleBriefing } from "@/components/features/ScheduleBriefing";
import { TodayFocus } from "@/components/features/PriorityBoard";
import { ProductivityHeatmap } from "@/components/features/ProductivityHeatmap";
import { RightPanel } from "@/components/features/RightPanel";
import { cn } from "@/lib/cn";
import { dayKey, fmtDateLong, greeting, todayKey } from "@/lib/time";
import { useNow } from "@/lib/useNow";
import { useProductivity } from "@/lib/store/productivity";
import { useSettings } from "@/lib/store/settings";
import { useTasks } from "@/lib/store/tasks";
import { priorityChip } from "@/components/features/TaskBoard";

function DashboardHeader() {
  const now = useNow(30000);
  const name = useSettings((s) => s.name);
  const activity = useProductivity((s) => s.activity);
  const sessions = useProductivity((s) => s.sessions);
  const today = todayKey();
  const a = activity[today];
  const sessionCount = sessions.filter((s) => dayKey(s.startedAt) === today).length;
  const pct = a?.planned ? Math.round((a.plannedDone / a.planned) * 100) : 0;

  return (
    <div>
      <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-ink">
        {greeting(now)}, {name}.
      </h1>
      <p className="mt-1 text-[13px] text-ink-3">{fmtDateLong(now)}</p>
      <p className="mt-2 text-[12.5px] text-ink-2">
        <span className="tnum font-semibold text-ink">{a?.tasksDone ?? 0} tasks completed</span>
        <span className="mx-1.5 text-ink-3">·</span>
        <span className="tnum font-semibold text-ink">{sessionCount} focus sessions</span>
        <span className="mx-1.5 text-ink-3">·</span>
        <span className="tnum font-semibold text-ink">{pct}% of today&apos;s plan</span>
      </p>
    </div>
  );
}

function TaskQueue() {
  const tasks = useTasks((s) => s.tasks);
  const setStatus = useTasks((s) => s.setStatus);
  const open = tasks.filter((t) => t.status !== "done").sort((a, b) => a.order - b.order).slice(0, 5);

  return (
    <Card className="flex h-full flex-col p-5">
      <CardHead
        title="Task queue"
        sub=""
        action={
          <Link href="/tasks" className="flex items-center gap-1 text-[11px] font-medium text-accent transition-opacity hover:opacity-70">
            Show all <ArrowRight size={10} />
          </Link>
        }
      />
      <div className="mt-3 flex-1 space-y-1">
        {open.length === 0 ? <p className="py-4 text-center text-[12px] text-ink-3">Queue is clear.</p> : null}
        {open.map((t) => (
          <div key={t.id} className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-surface-2">
            <button
              aria-label="Complete task"
              onClick={() => setStatus(t.id, "done")}
              className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border border-line text-transparent transition-colors hover:border-accent-3 hover:text-accent-3"
            >
              <Check size={11} strokeWidth={3} />
            </button>
            <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink-2">{t.title}</span>
            {priorityChip(t.priority)}
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_312px]">
      <div className="space-y-4">
        <DashboardHeader />
        <MetricCards />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FocusTimer />
          </div>
          <ScheduleBriefing />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TodayFocus />
          <TaskQueue />
        </div>
        <Card className="p-5">
          <ProductivityHeatmap withToggle={false} />
          <div className="mt-3 flex justify-end">
            <Link href="/productivity" className={cn("flex items-center gap-1 text-[11px] font-medium text-accent hover:opacity-70")}>
              Day / month / year views <ArrowRight size={10} />
            </Link>
          </div>
        </Card>
      </div>
      <aside className="hidden xl:block">
        <div className="sticky top-[72px]">
          <RightPanel />
        </div>
      </aside>
    </div>
  );
}
