"use client";

import { Card } from "@/components/ui/Card";
import { ProductivityHeatmap } from "@/components/features/ProductivityHeatmap";

export default function ProductivityPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="label-xs">Focus</div>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink">Productivity activity</h1>
        <p className="mt-1 text-[12.5px] text-ink-3">
          An activity picture built from completed tasks, focus time, sessions and plan completion — a rhythm, not a score card.
        </p>
      </div>
      <Card className="p-6">
        <ProductivityHeatmap />
      </Card>
    </div>
  );
}
