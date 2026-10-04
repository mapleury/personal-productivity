"use client";

import { useState } from "react";
import { CalendarDays, Minus, Plus, Trash2 } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, CardHead } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Bar } from "@/components/ui/Progress";
import { inputCls } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { dayKey, fmtDateMed, weekDays } from "@/lib/time";
import { useCalendar } from "@/lib/store/calendar";
import { useGoals } from "@/lib/store/goals";
import { useProductivity } from "@/lib/store/productivity";
import { useTasks } from "@/lib/store/tasks";

export function WeeklyGoals() {
  const goals = useGoals((s) => s.goals);
  const tasks = useTasks((s) => s.tasks);
  const { bump, remove, add } = useGoals.getState();
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");

  return (
    <div className="space-y-3">
      {goals.map((g) => {
        const related = tasks.filter((t) => g.taskIds.includes(t.id) || t.goalId === g.id);
        return (
          <Card key={g.id} className="group p-4 transition-all duration-200 hover:shadow-lift">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[14px] font-semibold text-ink">{g.title}</span>
                  {g.progress >= 100 ? <Chip tone="accent">complete</Chip> : null}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-3">
                  <CalendarDays size={10} />
                  {g.deadline ? `due ${fmtDateMed(g.deadline)}` : "no deadline"}
                  <span>· {related.length} related task{related.length === 1 ? "" : "s"}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="tnum text-[15px] font-semibold text-accent tnum">{g.progress}%</span>
                <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <IconButton label="Decrease 10%" className="h-7 w-7" onClick={() => bump(g.id, -10)}>
                    <Minus size={11} />
                  </IconButton>
                  <IconButton label="Increase 10%" className="h-7 w-7" onClick={() => bump(g.id, 10)}>
                    <Plus size={11} />
                  </IconButton>
                  <IconButton label="Delete goal" className="h-7 w-7" onClick={() => remove(g.id)}>
                    <Trash2 size={11} />
                  </IconButton>
                </div>
              </div>
            </div>
            <Bar value={g.progress} className="mt-3" />
            {related.length ? (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {related.slice(0, 4).map((t) => (
                  <Chip key={t.id} tone="outline" className={cn(t.status === "done" && "line-through opacity-60")}>
                    {t.title}
                  </Chip>
                ))}
              </div>
            ) : null}
          </Card>
        );
      })}

      <Card className="flex flex-wrap items-center gap-2 p-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New weekly goal…" className={cn(inputCls, "min-w-[160px] flex-1")} />
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={cn(inputCls, "w-auto")} />
        <Button
          variant="accent"
          size="md"
          onClick={() => {
            if (!title.trim()) return;
            add({ title, deadline });
            setTitle("");
            setDeadline("");
          }}
        >
          <Plus size={13} /> Add goal
        </Button>
      </Card>
    </div>
  );
}

export function WeekStrip() {
  const tasks = useTasks((s) => s.tasks);
  const events = useCalendar((s) => s.events);
  const sessions = useProductivity((s) => s.sessions);
  const days = weekDays(new Date());
  const today = dayKey(new Date());

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d) => {
        const key = dayKey(d);
        const t = tasks.filter((x) => x.dueDate === key).length;
        const e = events.filter((x) => x.date === key).length;
        const s = sessions.filter((x) => dayKey(x.startedAt) === key).length;
        const isToday = key === today;
        return (
          <div
            key={key}
            className={cn(
              "rounded-xl border px-1.5 py-2 text-center transition-colors",
              isToday ? "border-accent-2/40 bg-accent-soft/40" : "border-line/70 bg-surface",
            )}
          >
            <div className={cn("text-[9.5px] font-semibold tracking-[0.08em]", isToday ? "text-accent" : "text-ink-3")}>
              {d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3).toUpperCase()}
            </div>
            <div className="tnum mt-0.5 text-[13px] font-semibold text-ink">{d.getDate()}</div>
            <div className="tnum mt-1 space-y-0.5 text-[9.5px] text-ink-3">
              <div>{t}t</div>
              <div>{e}e</div>
              <div>{s}s</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function GoalsHeader() {
  const goals = useGoals((s) => s.goals);
  const done = goals.filter((g) => g.progress >= 100).length;
  const avg = goals.length ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;
  return <CardHead title="This week" sub={`${done} of ${goals.length} goals complete · average progress ${avg}%`} />;
}
