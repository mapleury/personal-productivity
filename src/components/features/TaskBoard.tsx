"use client";

import { useState } from "react";
import { CalendarDays, Check, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { areaCls, inputCls, labelCls, selectCls } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { fmtDateMed, uid } from "@/lib/time";
import { useGoals } from "@/lib/store/goals";
import { useTasks } from "@/lib/store/tasks";
import { PRIORITY_META, type Priority, type Quadrant, type Task, type TaskStatus } from "@/lib/types";

const PRIORITIES: Priority[] = ["critical", "high", "medium", "low"];

export function priorityChip(p: Priority) {
  switch (p) {
    case "critical":
      return <Chip tone="dark">{PRIORITY_META[p].label}</Chip>;
    case "high":
      return <Chip tone="accent">{PRIORITY_META[p].label}</Chip>;
    case "medium":
      return <Chip>{PRIORITY_META[p].label}</Chip>;
    default:
      return <Chip tone="outline">{PRIORITY_META[p].label}</Chip>;
  }
}

export function TaskModal({ taskId, onClose }: { taskId: string | null; onClose: () => void }) {
  const tasks = useTasks((s) => s.tasks);
  const goals = useGoals((s) => s.goals);
  const { add, update, remove } = useTasks.getState();
  const existing = tasks.find((t) => t.id === taskId);
  const [form, setForm] = useState<Partial<Task>>(() => existing ?? { priority: "medium", quadrant: "important", status: "todo", estimateMin: 25, category: "General", tags: [] });

  const set = (patch: Partial<Task>) => setForm((f) => ({ ...f, ...patch }));

  const save = () => {
    if (!form.title?.trim()) return;
    if (existing) update(existing.id, form);
    else add(form);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={existing ? "Edit task" : "New task"} wide>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Title</label>
          <input className={inputCls} value={form.title ?? ""} onChange={(e) => set({ title: e.target.value })} placeholder="What needs to get done?" autoFocus />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Description</label>
          <textarea className={areaCls} rows={2} value={form.description ?? ""} onChange={(e) => set({ description: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Due date</label>
          <input type="date" className={inputCls} value={form.dueDate ?? ""} onChange={(e) => set({ dueDate: e.target.value || undefined })} />
        </div>
        <div>
          <label className={labelCls}>Due time</label>
          <input type="time" className={inputCls} value={form.dueTime ?? ""} onChange={(e) => set({ dueTime: e.target.value || undefined })} />
        </div>
        <div>
          <label className={labelCls}>Priority</label>
          <select className={selectCls} value={form.priority} onChange={(e) => set({ priority: e.target.value as Priority })}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_META[p].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select className={selectCls} value={form.status} onChange={(e) => set({ status: e.target.value as TaskStatus })}>
            <option value="todo">To do</option>
            <option value="progress">In progress</option>
            <option value="done">Completed</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <input className={inputCls} value={form.category ?? ""} onChange={(e) => set({ category: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Estimate (min)</label>
          <input type="number" min={5} step={5} className={inputCls} value={form.estimateMin ?? 25} onChange={(e) => set({ estimateMin: Number(e.target.value) })} />
        </div>
        <div>
          <label className={labelCls}>Priority quadrant</label>
          <select className={selectCls} value={form.quadrant} onChange={(e) => set({ quadrant: e.target.value as Quadrant })}>
            <option value="urgent-important">Urgent + Important</option>
            <option value="important">Important</option>
            <option value="urgent">Urgent</option>
            <option value="low">Low priority</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Related goal</label>
          <select className={selectCls} value={form.goalId ?? ""} onChange={(e) => set({ goalId: e.target.value || null })}>
            <option value="">None</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Tags (comma separated)</label>
          <input className={inputCls} value={(form.tags ?? []).join(", ")} onChange={(e) => set({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Notes</label>
          <textarea className={areaCls} rows={2} value={form.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2">
        {existing ? (
          <Button
            variant="ghost"
            size="md"
            className="text-ink-3 hover:bg-surface-2"
            onClick={() => {
              remove(existing.id);
              onClose();
            }}
          >
            <Trash2 size={13} /> Delete
          </Button>
        ) : null}
        <div className="flex-1" />
        <Button variant="soft" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="accent" size="md" onClick={save}>
          {existing ? "Save changes" : "Create task"}
        </Button>
      </div>
    </Modal>
  );
}

function TaskRow({ task, onEdit, draggable }: { task: Task; onEdit: () => void; draggable: boolean }) {
  const setStatus = useTasks((s) => s.setStatus);
  const remove = useTasks((s) => s.remove);
  const done = task.status === "done";
  return (
    <div
      draggable={draggable}
      onDragStart={(e) => e.dataTransfer.setData("text/task", task.id)}
      className={cn(
        "group rounded-xl border border-line bg-surface p-3 transition-all duration-200 ease-[var(--ease-soft)] hover:shadow-card",
        draggable && "cursor-grab active:cursor-grabbing",
      )}
    >
      <div className="flex items-start gap-2.5">
        <button
          aria-label={done ? "Mark as not done" : "Complete task"}
          onClick={() => setStatus(task.id, done ? "todo" : "done")}
          className={cn(
            "mt-0.5 flex shrink-0 items-center justify-center rounded-md border transition-all duration-200",
            done ? "border-accent bg-accent text-white" : "border-line hover:border-accent-3",
          )}
          style={{ width: 18, height: 18 }}
        >
          {done ? <Check size={11} strokeWidth={3} /> : null}
        </button>
        <div className="min-w-0 flex-1">
          <div className={cn("text-[13px] font-medium leading-snug", done ? "text-ink-3 line-through" : "text-ink")}>{task.title}</div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {priorityChip(task.priority)}
            {task.dueDate ? (
              <Chip tone="outline">
                <CalendarDays size={9} /> {fmtDateMed(task.dueDate)}
                {task.dueTime ? ` · ${task.dueTime}` : ""}
              </Chip>
            ) : null}
            <Chip tone="outline">{task.category}</Chip>
            {task.tags.slice(0, 2).map((t) => (
              <Chip key={t} tone="outline" className="text-ink-3">
                #{t}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <IconButton label="Edit task" onClick={onEdit} className="h-7 w-7">
            <Pencil size={12} />
          </IconButton>
          <IconButton label="Delete task" onClick={() => remove(task.id)} className="h-7 w-7 hover:bg-surface-3">
            <Trash2 size={12} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "progress", label: "In progress" },
  { id: "done", label: "Completed" },
];

export function TaskBoard() {
  const tasks = useTasks((s) => s.tasks);
  const reorder = useTasks((s) => s.reorder);
  const setStatus = useTasks((s) => s.setStatus);
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState<"all" | Priority>("all");
  const [sort, setSort] = useState<"manual" | "priority" | "due">("manual");
  const [modal, setModal] = useState<string | null>(null);

  const filtered = tasks.filter((t) => {
    if (priority !== "all" && t.priority !== priority) return false;
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return [t.title, t.category, t.description ?? "", ...t.tags].join(" ").toLowerCase().includes(needle);
  });

  const sortFn = (a: Task, b: Task) =>
    sort === "priority"
      ? PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank
      : sort === "due"
        ? (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999") || (a.dueTime ?? "").localeCompare(b.dueTime ?? "")
        : a.order - b.order;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search size={13} className="absolute top-1/2 left-3 -translate-y-1/2 text-ink-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks…" className={cn(inputCls, "pl-8")} />
        </div>
        <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} className={cn(selectCls, "w-auto")}>
          <option value="all">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_META[p].label}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={cn(selectCls, "w-auto")}>
          <option value="manual">Manual order</option>
          <option value="priority">Sort by priority</option>
          <option value="due">Sort by due date</option>
        </select>
        <Button variant="accent" size="md" onClick={() => setModal(uid("new"))}>
          <Plus size={13} /> New task
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const list = filtered.filter((t) => t.status === col.id).sort(sortFn);
          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = e.dataTransfer.getData("text/task");
                if (id) setStatus(id, col.id);
              }}
              className="rounded-[20px] border border-line/70 bg-surface-2/50 p-2.5"
            >
              <div className="flex items-center justify-between px-1.5 pb-2 pt-1">
                <span className="label-xs">{col.label}</span>
                <span className="tnum text-[10.5px] font-semibold text-ink-3">{list.length}</span>
              </div>
              <div className="space-y-2">
                {list.map((t) => (
                  <div
                    key={t.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.stopPropagation();
                      const id = e.dataTransfer.getData("text/task");
                      if (!id) return;
                      setStatus(id, col.id);
                      reorder(id, t.id);
                    }}
                  >
                    <TaskRow task={t} onEdit={() => setModal(t.id)} draggable={sort === "manual"} />
                  </div>
                ))}
                {list.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-[11.5px] text-ink-3">
                    Drop tasks here
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {modal ? <TaskModal key={modal} taskId={modal.startsWith("new_") ? null : modal} onClose={() => setModal(null)} /> : null}
    </div>
  );
}
