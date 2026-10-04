"use client";

import { Card } from "@/components/ui/Card";
import { GoalsHeader, WeekStrip, WeeklyGoals } from "@/components/features/WeeklyGoals";

export default function GoalsPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="label-xs">Organize</div>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink">Weekly goals</h1>
        <p className="mt-1 text-[12.5px] text-ink-3">The outcomes this week is actually about — progress, deadlines and the tasks feeding them.</p>
      </div>
      <Card className="p-5">
        <GoalsHeader />
        <div className="mt-4">
          <WeekStrip />
        </div>
        <p className="mt-3 text-[10.5px] text-ink-3">t = tasks due · e = events · s = focus sessions</p>
      </Card>
      <WeeklyGoals />
    </div>
  );
}
