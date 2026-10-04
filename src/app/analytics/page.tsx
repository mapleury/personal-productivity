"use client";

import { AnalyticsCharts } from "@/components/features/AnalyticsCharts";

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="label-xs">Organize</div>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink">Analytics</h1>
        <p className="mt-1 text-[12.5px] text-ink-3">Understand your work patterns — where the hours go and when you&apos;re sharpest.</p>
      </div>
      <AnalyticsCharts />
    </div>
  );
}
