"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardHead } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/cn";
import { useTasks } from "@/lib/store/tasks";
import { PRIORITY_META, QUADRANT_META, type Quadrant } from "@/lib/types";
import { priorityChip } from "./TaskBoard";

const QUADRANTS: Quadrant[] = ["urgent-important", "important", "urgent", "low"];

export function TodayFocus() {
  const tasks = useTasks((s) => s.tasks);
  const top = tasks
    .filter((t) => t.status !== "done" && t.quadrant === "urgent-important")
    .sort((a, b) => a.order - b.order);
  const focus = top.slice(0, 3);

  return (
    <Card className="p-5">
      <CardHead title="Today's focus" sub="" />
      <div className="mt-4 space-y-3">
        {focus.length === 0 ? (
          <p className="text-[12.5px] text-ink-3">Nothing flagged important yet.</p>
        ) : (
          focus.map((t, i) => (
            <div key={t.id} className="flex items-baseline gap-3">
              <span className="tnum text-[13px] font-semibold text-accent-3">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">{t.title}</span>
              {priorityChip(t.priority)}
            </div>
          ))
        )}
      </div>
      {top.length > 3 ? (
        <p className="mt-4 rounded-xl bg-surface-2 px-3 py-2 text-[11px] text-ink-3">
          {top.length - 3} more in Urgent + Important. The system shows three on purpose — finish one before promoting another.
        </p>
      ) : null}
    </Card>
  );
}

export function PriorityBoard() {
  const tasks = useTasks((s) => s.tasks);
  const setQuadrant = useTasks((s) => s.update);
  const add = useTasks((s) => s.add);
  const [adding, setAdding] = useState<Quadrant | null>(null);
  const [title, setTitle] = useState("");

  const submit = (q: Quadrant) => {
    if (!title.trim()) return;
    add({ title, quadrant: q, priority: q === "urgent-important" ? "high" : q === "low" ? "low" : "medium" });
    setTitle("");
    setAdding(null);
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {QUADRANTS.map((q) => {
        const items = tasks.filter((t) => t.status !== "done" && t.quadrant === q).sort((a, b) => a.order - b.order);
        return (
          <Card
            key={q}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const id = e.dataTransfer.getData("text/task");
              if (id) setQuadrant(id, { quadrant: q });
            }}
            className={cn("flex min-h-[190px] flex-col p-4 transition-shadow hover:shadow-lift", q === "urgent-important" && "border-accent-2/30 bg-accent-soft/25")}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold text-ink">{QUADRANT_META[q].label}</div>
                <div className="text-[10.5px] text-ink-3">{QUADRANT_META[q].hint}</div>
              </div>
              <Chip tone={q === "urgent-important" ? "accent" : "neutral"}>{items.length}</Chip>
            </div>

            <div className="mt-3 flex-1 space-y-1.5">
              {items.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/task", t.id)}
                  className="flex cursor-grab items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-[12.5px] text-ink-2 transition-all duration-150 hover:shadow-card active:cursor-grabbing"
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      t.priority === "critical" ? "bg-night" : t.priority === "high" ? "bg-accent-2" : t.priority === "medium" ? "bg-ink-3" : "bg-surface-3",
                    )}
                    title={PRIORITY_META[t.priority].label}
                  />
                  <span className="truncate">{t.title}</span>
                </div>
              ))}
              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line px-3 py-4 text-center text-[11px] text-ink-3">Drop tasks here</div>
              ) : null}
            </div>

            {adding === q ? (
              <form
                className="mt-2 flex gap-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(q);
                }}
              >
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setAdding(null)}
                  placeholder="Add to this quadrant…"
                  className="h-8 flex-1 rounded-full border border-line bg-surface px-3 text-[12px] focus:border-accent-3 focus:outline-none"
                />
              </form>
            ) : (
              <button
                onClick={() => {
                  setAdding(q);
                  setTitle("");
                }}
                className="mt-2 flex items-center gap-1 text-[11px] font-medium text-ink-3 transition-colors hover:text-accent"
              >
                <Plus size={11} /> Add item
              </button>
            )}
          </Card>
        );
      })}
    </div>
  );
}
