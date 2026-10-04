"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { inputCls, labelCls, selectCls } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { addDays, dayKey, fromKey, monthMatrix, todayKey, weekDays } from "@/lib/time";
import { useCalendar } from "@/lib/store/calendar";
import { EVENT_META, type CalEvent, type EventType } from "@/lib/types";
import { DailyTimeline } from "./DailyTimeline";

type View = "month" | "week" | "day";
const TYPES: EventType[] = ["task", "meeting", "study", "focus", "personal", "deadline"];

function EventModal({ eventId, onClose }: { eventId: string | null; onClose: () => void }) {
  const events = useCalendar((s) => s.events);
  const { add, update, remove } = useCalendar.getState();
  const existing = events.find((e) => e.id === eventId);
  const [form, setForm] = useState<Partial<CalEvent>>(() => existing ?? { date: todayKey(), start: "09:00", end: "10:00", type: "task" });

  const key = eventId ?? "new";
  const [loadedFor, setLoadedFor] = useState(key);
  if (loadedFor !== key) {
    setLoadedFor(key);
    setForm(existing ?? { date: todayKey(), start: "09:00", end: "10:00", type: "task" });
  }

  const set = (patch: Partial<CalEvent>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <Modal open={Boolean(eventId)} onClose={onClose} title={existing ? "Edit event" : "New event"}>
      <div className="space-y-3.5">
        <div>
          <label className={labelCls}>Title</label>
          <input className={inputCls} value={form.title ?? ""} onChange={(e) => set({ title: e.target.value })} autoFocus />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-3 sm:col-span-1">
            <label className={labelCls}>Date</label>
            <input type="date" className={inputCls} value={form.date ?? ""} onChange={(e) => set({ date: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Start</label>
            <input type="time" className={inputCls} value={form.start ?? ""} onChange={(e) => set({ start: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>End</label>
            <input type="time" className={inputCls} value={form.end ?? ""} onChange={(e) => set({ end: e.target.value || undefined })} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Type</label>
          <select className={selectCls} value={form.type} onChange={(e) => set({ type: e.target.value as EventType })}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {EVENT_META[t].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Location</label>
          <input className={inputCls} value={form.location ?? ""} onChange={(e) => set({ location: e.target.value })} />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2">
        {existing ? (
          <Button
            variant="ghost"
            size="md"
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
        <Button
          variant="accent"
          size="md"
          onClick={() => {
            if (!form.title?.trim() || !form.date) return;
            if (existing) update(existing.id, form);
            else add(form);
            onClose();
          }}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
}

export function CalendarViews() {
  const events = useCalendar((s) => s.events);
  const [view, setView] = useState<View>("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [modal, setModal] = useState<string | null>(null);
  const today = todayKey();

  const move = (dir: number) =>
    setAnchor((a) => (view === "month" ? new Date(a.getFullYear(), a.getMonth() + dir, 1) : addDays(a, dir * (view === "week" ? 7 : 1))));

  const weeks = useMemo(() => monthMatrix(anchor.getFullYear(), anchor.getMonth()), [anchor]);
  const title =
    view === "month"
      ? anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : view === "week"
        ? `Week of ${weekDays(anchor)[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
        : anchor.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-0.5">
          <IconButton label="Previous" onClick={() => move(-1)}>
            <ChevronLeft size={15} />
          </IconButton>
          <Button variant="soft" size="sm" onClick={() => setAnchor(new Date())}>
            Today
          </Button>
          <IconButton label="Next" onClick={() => move(1)}>
            <ChevronRight size={15} />
          </IconButton>
        </div>
        <h2 className="ml-1 text-[15px] font-semibold text-ink">{title}</h2>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-full bg-surface-2 p-0.5">
            {(["month", "week", "day"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "rounded-full px-3 py-1 text-[11.5px] font-medium capitalize transition-all duration-200",
                  view === v ? "bg-surface text-ink shadow-card" : "text-ink-3 hover:text-ink-2",
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <Button variant="accent" size="sm" onClick={() => setModal("new")}>
            <Plus size={12} /> Event
          </Button>
        </div>
      </div>

      {view === "month" ? (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-7 border-b border-line">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                {d}
              </div>
            ))}
          </div>
          {weeks.map((row, i) => (
            <div key={i} className="grid grid-cols-7 border-b border-line/60 last:border-0">
              {row.map((d) => {
                const k = dayKey(d);
                const dayEvents = events.filter((e) => e.date === k).sort((a, b) => a.start.localeCompare(b.start));
                const inMonth = d.getMonth() === anchor.getMonth();
                return (
                  <button
                    key={k}
                    onClick={() => {
                      setAnchor(d);
                      setView("day");
                    }}
                    className={cn(
                      "min-h-[86px] border-r border-line/60 p-1.5 text-left align-top transition-colors last:border-0 hover:bg-surface-2/60",
                      !inMonth && "bg-surface-2/30",
                    )}
                  >
                    <span
                      className={cn(
                        "tnum inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px]",
                        k === today ? "bg-accent font-semibold text-white" : inMonth ? "text-ink-2" : "text-ink-3/40",
                      )}
                    >
                      {d.getDate()}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div key={e.id} className="flex items-center gap-1 truncate text-[9.5px] text-ink-2">
                          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", EVENT_META[e.type].dot)} />
                          <span className="truncate">
                            {e.start} {e.title}
                          </span>
                        </div>
                      ))}
                      {dayEvents.length > 2 ? <div className="text-[9px] text-ink-3">+{dayEvents.length - 2} more</div> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </Card>
      ) : null}

      {view === "week" ? (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
          {weekDays(anchor).map((d) => {
            const k = dayKey(d);
            const dayEvents = events.filter((e) => e.date === k).sort((a, b) => a.start.localeCompare(b.start));
            return (
              <Card key={k} className={cn("min-h-[220px] p-2.5", k === today && "border-accent-2/40 bg-accent-soft/20")}>
                <div className="flex items-baseline justify-between px-1">
                  <span className={cn("text-[10px] font-semibold uppercase tracking-[0.08em]", k === today ? "text-accent" : "text-ink-3")}>
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className="tnum text-[12px] font-semibold text-ink">{d.getDate()}</span>
                </div>
                <div className="mt-2 space-y-1.5">
                  {dayEvents.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setModal(e.id)}
                      className={cn("block w-full rounded-lg px-2 py-1.5 text-left transition-transform hover:scale-[1.02]", EVENT_META[e.type].tint)}
                    >
                      <div className="tnum text-[9.5px] opacity-70">
                        {e.start}
                        {e.end ? `–${e.end}` : ""}
                      </div>
                      <div className="truncate text-[10.5px] font-medium">{e.title}</div>
                    </button>
                  ))}
                  {dayEvents.length === 0 ? <div className="px-1 py-3 text-center text-[10px] text-ink-3">—</div> : null}
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}

      {view === "day" ? (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map((t) => (
                <Chip key={t} tone="outline">
                  <span className={cn("h-1.5 w-1.5 rounded-full", EVENT_META[t].dot)} /> {EVENT_META[t].label}
                </Chip>
              ))}
            </div>
            <Button variant="soft" size="sm" onClick={() => setModal("new")}>
              <Plus size={12} /> Add
            </Button>
          </div>
          <div className="mt-4">
            <DailyTimeline dateKey={dayKey(anchor)} now={dayKey(anchor) === today ? new Date() : undefined} onEventClick={(id) => setModal(id)} />
          </div>
        </Card>
      ) : null}

      {modal ? <EventModal eventId={modal === "new" ? null : modal} onClose={() => setModal(null)} /> : null}
    </div>
  );
}

export function eventDateLabel(key: string) {
  return fromKey(key).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
