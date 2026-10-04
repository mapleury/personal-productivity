"use client";

import { Card, CardHead } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { WeekStrip, WeeklyGoals } from "@/components/features/WeeklyGoals";
import { dayKey, fmtDur, weekDays } from "@/lib/time";
import { useCalendar } from "@/lib/store/calendar";
import { useGoals } from "@/lib/store/goals";
import { useProductivity } from "@/lib/store/productivity";
import { useTasks } from "@/lib/store/tasks";
import { EVENT_META } from "@/lib/types";
import { cn } from "@/lib/cn";

function DayColumn({ day }: { day: Date }) {
  const key = dayKey(day);
  const tasks = useTasks((s) => s.tasks).filter((t) => t.dueDate === key);
  const events = useCalendar((s) => s.events).filter((e) => e.date === key);
  const sessions = useProductivity((s) => s.sessions).filter((s) => dayKey(s.startedAt) === key);
  const goals = useGoals((s) => s.goals).filter((g) => g.deadline === key);
  const isToday = key === dayKey(new Date());

  return (
    <Card className={cn("flex min-h-[210px] flex-col p-3.5", isToday && "border-accent-2/40 bg-accent-soft/20")}>
      <div className="flex items-baseline justify-between">
        <span className={cn("text-[10px] font-semibold uppercase tracking-[0.08em]", isToday ? "text-accent" : "text-ink-3")}>
          {day.toLocaleDateString("en-US", { weekday: "short" })}
        </span>
        <span className="tnum text-[13px] font-semibold text-ink">{day.getDate()}</span>
      </div>
      <div className="mt-2.5 flex-1 space-y-1.5">
        {tasks.map((t) => (
          <div key={t.id} className={cn("truncate rounded-lg bg-surface-2 px-2 py-1 text-[10.5px] text-ink-2", t.status === "done" && "line-through opacity-50")}>
            {t.title}
          </div>
        ))}
        {events.map((e) => (
          <div key={e.id} className={cn("truncate rounded-lg px-2 py-1 text-[10.5px] font-medium", EVENT_META[e.type].tint)}>
            {e.start} {e.title}
          </div>
        ))}
        {goals.map((g) => (
          <div key={g.id} className="truncate rounded-lg bg-night px-2 py-1 text-[10.5px] font-medium text-white">
            goal due · {g.title}
          </div>
        ))}
        {sessions.length ? (
          <div className="flex items-center gap-1.5 px-1 pt-0.5">
            <Chip tone="accent">{sessions.length} session{sessions.length === 1 ? "" : "s"}</Chip>
            <span className="tnum text-[9.5px] text-ink-3">{fmtDur(sessions.reduce((a, s) => a + s.minutes, 0))}</span>
          </div>
        ) : null}
        {!tasks.length && !events.length && !goals.length && !sessions.length ? (
          <div className="py-4 text-center text-[10px] text-ink-3">unscheduled</div>
        ) : null}
      </div>
    </Card>
  );
}

export default function WeeklyPlanPage() {
  const days = weekDays(new Date());
  return (
    <div className="space-y-4">
      <div>
        <div className="label-xs">Organize</div>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink">Weekly plan</h1>
        <p className="mt-1 text-[12.5px] text-ink-3">The week at a glance — tasks, events, goals and logged focus per day.</p>
      </div>
      <Card className="p-5">
        <CardHead title="This week" sub="Load per day" />
        <div className="mt-4">
          <WeekStrip />
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {days.map((d) => (
          <DayColumn key={dayKey(d)} day={d} />
        ))}
      </div>
      <div>
        <h2 className="mb-3 text-[15px] font-semibold text-ink">Weekly goals</h2>
        <WeeklyGoals />
      </div>
    </div>
  );
}
