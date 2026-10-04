"use client";

import { cn } from "@/lib/cn";
import { hmToMin } from "@/lib/time";
import { useCalendar } from "@/lib/store/calendar";
import { EVENT_META } from "@/lib/types";

export function DailyTimeline({
  dateKey,
  now,
  onEventClick,
  dense,
}: {
  dateKey: string;
  now?: Date;
  onEventClick?: (id: string) => void;
  dense?: boolean;
}) {
  const events = useCalendar((s) => s.events);
  const list = events.filter((e) => e.date === dateKey).sort((a, b) => a.start.localeCompare(b.start));
  const nowMin = now ? now.getHours() * 60 + now.getMinutes() : -1;

  if (!list.length)
    return <p className="py-6 text-center text-[12px] text-ink-3">Nothing scheduled. The day is yours.</p>;

  return (
    <div className="relative space-y-1">
      <span className="absolute top-2 bottom-2 left-[46px] w-px bg-line" aria-hidden />
      {list.map((e) => {
        const meta = EVENT_META[e.type];
        const start = hmToMin(e.start);
        const end = e.end ? hmToMin(e.end) : start + 45;
        const isNow = nowMin >= start && nowMin < end;
        const isPast = nowMin >= end;
        return (
          <button
            key={e.id}
            onClick={onEventClick ? () => onEventClick(e.id) : undefined}
            className={cn(
              "relative flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition-colors",
              onEventClick && "hover:bg-surface-2",
              isNow && "bg-accent-soft/50",
            )}
          >
            <span className={cn("tnum w-9 shrink-0 pt-0.5 text-right text-[10.5px] font-medium", isPast ? "text-ink-3/50" : "text-ink-3")}>
              {e.start}
            </span>
            <span className="relative mt-[7px] flex shrink-0 justify-center" style={{ width: 12 }}>
              <span className={cn("h-2 w-2 rounded-full ring-4 ring-surface", meta.dot, isPast && "opacity-40")} />
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn("flex items-center gap-2 text-[12.5px] font-medium", isPast ? "text-ink-3 line-through decoration-ink-3/40" : "text-ink")}>
                <span className="truncate">{e.title}</span>
                {isNow ? <span className="rounded-full bg-accent px-1.5 py-px text-[9px] font-semibold text-white">now</span> : null}
              </span>
              {!dense ? (
                <span className="mt-0.5 block text-[10.5px] text-ink-3 tnum">
                  {e.start}
                  {e.end ? ` – ${e.end}` : ""} · {meta.label}
                  {e.location ? ` · ${e.location}` : ""}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
