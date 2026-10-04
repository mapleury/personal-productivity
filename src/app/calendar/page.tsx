"use client";

import { CalendarViews } from "@/components/features/CalendarViews";

export default function CalendarPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="label-xs">General</div>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink">Calendar</h1>
        <p className="mt-1 text-[12.5px] text-ink-3">Events, tasks windows, study blocks, focus time and deadlines in one place.</p>
      </div>
      <CalendarViews />
    </div>
  );
}
