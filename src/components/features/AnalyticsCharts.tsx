"use client";

import { Card, CardHead } from "@/components/ui/Card";
import { Bar, Ring } from "@/components/ui/Progress";
import { Bars } from "@/components/ui/charts";
import { dayKey, fmtDur } from "@/lib/time";
import { useGoals } from "@/lib/store/goals";
import { useProductivity } from "@/lib/store/productivity";
import { useTasks } from "@/lib/store/tasks";
import { useNow } from "@/lib/useNow";

export function AnalyticsCharts() {
  const activity = useProductivity((s) => s.activity);
  const sessions = useProductivity((s) => s.sessions);
  const tasks = useTasks((s) => s.tasks);
  const goals = useGoals((s) => s.goals);
  const nowMs = useNow(60000).getTime();

  const last14 = Array.from({ length: 14 }, (_, i) => dayKey(new Date(nowMs - (13 - i) * 86400000)));
  const labels = last14.map((k) => k.slice(5));
  const focusVals = last14.map((k) => activity[k]?.focusMin ?? 0);
  const plannedVals = last14.map((k) => activity[k]?.planned ?? 0);
  const doneVals = last14.map((k) => activity[k]?.plannedDone ?? 0);

  const hours = Array(24).fill(0);
  for (const s of sessions) {
    if (nowMs - s.startedAt > 30 * 86400000) continue;
    hours[new Date(s.startedAt).getHours()] += s.minutes;
  }

  const weeks = Array.from({ length: 8 }, (_, w) => {
    const start = nowMs - (7 - w) * 7 * 86400000;
    let sum = 0;
    for (let d = 0; d < 7; d++) sum += activity[dayKey(new Date(start + d * 86400000))]?.focusMin ?? 0;
    return Math.round(sum / 60);
  });

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const rate = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <Card className="p-5">
        <CardHead title="Focus time by day" sub="Minutes of logged focus, last 14 days" />
        <Bars values={focusVals} height={96} labels={labels} activeIndex={13} className="mt-5" />
        <div className="mt-2 flex justify-between text-[9.5px] text-ink-3 tnum">
          <span>{labels[0]}</span>
          <span>{labels[13]}</span>
        </div>
      </Card>

      <Card className="p-5">
        <CardHead title="Planned vs completed" sub="Tasks planned against tasks finished" />
        <div className="mt-5 flex h-[96px] items-end gap-[5px]">
          {last14.map((k, i) => {
            const max = Math.max(...plannedVals, 1);
            return (
              <div key={k} className="flex flex-1 items-end gap-[2px]" title={`${labels[i]}: ${doneVals[i]}/${plannedVals[i]}`}>
                <div className="w-1/2 rounded-[3px] bg-surface-3" style={{ height: `${Math.max(6, (plannedVals[i] / max) * 100)}%` }} />
                <div className="w-1/2 rounded-[3px] bg-accent-2" style={{ height: `${Math.max(6, (doneVals[i] / max) * 100)}%` }} />
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-4 text-[10px] text-ink-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-surface-3" /> planned
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-accent-2" /> completed
          </span>
        </div>
      </Card>

      <Card className="p-5">
        <CardHead title="Most productive hours" sub="Where your focus minutes land, last 30 days" />
        <Bars values={hours} height={96} className="mt-5" labels={hours.map((_, h) => `${String(h).padStart(2, "0")}:00`)} />
        <div className="mt-2 flex justify-between text-[9.5px] text-ink-3 tnum">
          <span>00</span>
          <span>06</span>
          <span>12</span>
          <span>18</span>
          <span>23</span>
        </div>
      </Card>

      <Card className="p-5">
        <CardHead title="Weekly focus time" sub="Hours per week, last 8 weeks" />
        <Bars values={weeks} height={96} className="mt-5" activeIndex={7} labels={weeks.map((w, i) => `W-${7 - i}: ${w}h`)} />
        <div className="mt-3 text-[11px] text-ink-3">
          Total {fmtDur(weeks.reduce((a, b) => a + b, 0) * 60)} across 8 weeks · best week {Math.max(...weeks)}h
        </div>
      </Card>

      <Card className="p-5">
        <CardHead title="Task completion rate" sub="All time" />
        <div className="mt-4 flex items-center gap-5">
          <Ring value={rate} size={84} stroke={7}>
            <span className="text-[17px] font-semibold text-ink tnum">{rate}%</span>
          </Ring>
          <div className="space-y-1 text-[12px] text-ink-3">
            <div>
              <span className="font-semibold text-ink tnum">{done}</span> completed
            </div>
            <div>
              <span className="font-semibold text-ink tnum">{total - done}</span> open
            </div>
            <div>
              <span className="font-semibold text-ink tnum">{sessions.length}</span> focus sessions logged
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <CardHead title="Goal completion" sub="Weekly goals progress" />
        <div className="mt-4 space-y-3">
          {goals.map((g) => (
            <div key={g.id}>
              <div className="mb-1 flex items-center justify-between text-[12px]">
                <span className="font-medium text-ink-2">{g.title}</span>
                <span className="tnum text-ink-3">{g.progress}%</span>
              </div>
              <Bar value={g.progress} />
            </div>
          ))}
          {goals.length === 0 ? <p className="text-[12px] text-ink-3">No goals set for this week.</p> : null}
        </div>
      </Card>
    </div>
  );
}
