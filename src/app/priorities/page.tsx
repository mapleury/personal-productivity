"use client";

import { PriorityBoard, TodayFocus } from "@/components/features/PriorityBoard";

export default function PrioritiesPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="label-xs">Organize</div>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink">Priorities</h1>
        <p className="mt-1 text-[12.5px] text-ink-3">What actually matters today? Drag tasks between quadrants as reality changes.</p>
      </div>
      <TodayFocus />
      <PriorityBoard />
    </div>
  );
}
