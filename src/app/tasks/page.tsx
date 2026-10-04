"use client";

import { TaskBoard } from "@/components/features/TaskBoard";

export default function TasksPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="label-xs">Organize</div>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink">Tasks</h1>
        <p className="mt-1 text-[12.5px] text-ink-3">Drag cards between columns to change status, or within a column to reorder.</p>
      </div>
      <TaskBoard />
    </div>
  );
}
