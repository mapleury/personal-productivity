"use client";

import { Flame, Pause, Play, Target } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Bar, Ring } from "@/components/ui/Progress";
import { Sparkline } from "@/components/ui/charts";
import { Chip } from "@/components/ui/Chip";
import { dayKey, fmtDur, todayKey } from "@/lib/time";
import { dayScore, streak } from "@/lib/score";
import { useGoals } from "@/lib/store/goals";
import { useProductivity } from "@/lib/store/productivity";
import { useTasks } from "@/lib/store/tasks";
import { useTimer } from "@/lib/store/timer";
import { useNow } from "@/lib/useNow";

function MetricShell({ label, children, visual }: { label: string; children: React.ReactNode; visual?: React.ReactNode }) {
  return (
    <Card className="relative overflow-hidden p-4 transition-all duration-200 ease-[var(--ease-soft)] hover:-translate-y-0.5 hover:shadow-lift">
      <div className="label-xs">{label}</div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">{children}</div>
        {visual ? <div className="shrink-0">{visual}</div> : null}
      </div>
    </Card>
  );
}

export function MetricCards() {
  const activity = useProductivity((s) => s.activity);
  const sessions = useProductivity((s) => s.sessions);
  const tasks = useTasks((s) => s.tasks);
  const goals = useGoals((s) => s.goals);
  const running = useTimer((s) => s.running);
  const startedAt = useTimer((s) => s.startedAt);
  const nowMs = useNow(60000).getTime();

  const today = todayKey();
  const a = activity[today];
  const planned = a?.planned ?? 0;
  const done = a?.plannedDone ?? 0;
  const remaining = tasks.filter((t) => t.status !== "done").length;
  const pct = planned ? Math.round((done / planned) * 100) : 0;

  const weekFocus = Array.from({ length: 7 }, (_, i) => activity[dayKey(new Date(nowMs - (6 - i) * 86400000))]?.focusMin ?? 0);
  const timerState = running ? "running" : startedAt ? "paused" : "idle";

  const doneGoals = goals.filter((g) => g.progress >= 100).length;
  const avgGoal = goals.length ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;

  const score = dayScore(a);
  const keys = Array.from({ length: 400 }, (_, i) => dayKey(new Date(nowMs - i * 86400000)));
  const streakDays = streak(activity, keys);

  const todaySessions = sessions.filter((s) => dayKey(s.startedAt) === today);
  let peak = "—";
  if (todaySessions.length) {
    const first = todaySessions.reduce((m, s) => Math.min(m, s.startedAt), todaySessions[0].startedAt);
    const last = todaySessions.reduce((m, s) => Math.max(m, s.endedAt), todaySessions[0].endedAt);
    const f = (t: number) => new Date(t).toTimeString().slice(0, 5);
    peak = `${f(first)}–${f(last)}`;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricShell label="Today" visual={<Ring value={pct} size={40} stroke={3.5}><span className="text-[10px] font-semibold text-accent tnum">{pct}%</span></Ring>}>
        <div className="text-[22px] font-semibold tracking-[-0.02em] text-ink tnum">
          {done} <span className="text-ink-3">/</span> {planned || done}
        </div>
        <div className="mt-0.5 text-[11px] text-ink-3">{remaining} remaining</div>
        <Bar value={pct} className="mt-2.5" />
      </MetricShell>

      <MetricShell label="Focus" visual={<Sparkline points={weekFocus} width={72} height={32} />}>
        <div className="text-[22px] font-semibold tracking-[-0.02em] text-ink tnum">{fmtDur(a?.focusMin ?? 0)}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-3">
          {todaySessions.length} session{todaySessions.length === 1 ? "" : "s"}
          <Chip tone={timerState === "running" ? "accent" : "neutral"} className="ml-1">
            {timerState === "running" ? <Play size={8} /> : timerState === "paused" ? <Pause size={8} /> : null}
            {timerState}
          </Chip>
        </div>
      </MetricShell>

      <MetricShell label="Weekly goals" visual={<Ring value={avgGoal} size={40} stroke={3.5}><span className="text-[10px] font-semibold text-accent tnum">{avgGoal}%</span></Ring>}>
        <div className="text-[22px] font-semibold tracking-[-0.02em] text-ink tnum">
          {doneGoals} <span className="text-ink-3">/</span> {goals.length}
        </div>
        <div className="mt-0.5 text-[11px] text-ink-3">complete {avgGoal}% progress</div>
        <Bar value={avgGoal} className="mt-2.5" />
      </MetricShell>

      <MetricShell label="Productivity" visual={<Flame size={18} className={streakDays > 0 ? "text-accent-2" : "text-surface-3"} />}>
        <div className="text-[22px] font-semibold tracking-[-0.02em] text-ink tnum">{score}%</div>
        <div className="mt-0.5 text-[11px] text-ink-3">peak {peak}</div>
        <div className="mt-2 flex items-center gap-1.5">
          <Target size={11} className="text-accent-2" />
          <span className="text-[11px] font-medium text-accent">{streakDays} day streak</span>
        </div>
      </MetricShell>
    </div>
  );
}
