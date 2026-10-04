"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { dayKey, monthMatrix, todayKey } from "@/lib/time";
import { useCalendar } from "@/lib/store/calendar";

const DOW = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

export function CalendarMini({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (key: string) => void;
}) {
  const events = useCalendar((s) => s.events);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const today = todayKey();
  const weeks = monthMatrix(cursor.y, cursor.m);
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const move = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink">{monthLabel}</span>
        <div className="flex gap-0.5">
          <IconButton label="Previous month" onClick={() => move(-1)}>
            <ChevronLeft size={14} />
          </IconButton>
          <IconButton label="Next month" onClick={() => move(1)}>
            <ChevronRight size={14} />
          </IconButton>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-y-1 text-center">
        {DOW.map((d) => (
          <span key={d} className="pb-1 text-[9.5px] font-semibold tracking-[0.08em] text-ink-3">
            {d}
          </span>
        ))}
        {weeks.flat().map((d) => {
          const key = dayKey(d);
          const inMonth = d.getMonth() === cursor.m;
          const isToday = key === today;
          const isSelected = key === selected;
          const has = events.some((e) => e.date === key);
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={cn(
                "relative mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full text-[11.5px] transition-all duration-150 tnum",
                isSelected
                  ? "bg-accent font-semibold text-white"
                  : isToday
                    ? "bg-accent-soft font-semibold text-accent"
                    : inMonth
                      ? "text-ink-2 hover:bg-surface-2"
                      : "text-ink-3/40 hover:bg-surface-2",
              )}
            >
              {d.getDate()}
              <span
                className={cn(
                  "absolute bottom-[5px] h-[3px] w-[3px] rounded-full",
                  has ? (isSelected ? "bg-white" : "bg-accent-3") : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
