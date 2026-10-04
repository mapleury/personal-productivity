"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CalendarMini } from "./CalendarMini";
import { DailyTimeline } from "./DailyTimeline";
import { useNow } from "@/lib/useNow";
import { fromKey, todayKey } from "@/lib/time";

export function RightPanel() {
  const [selected, setSelected] = useState(todayKey());
  const now = useNow(30000);
  const label = fromKey(selected).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-3">
      <Card className="p-4">
        <CalendarMini selected={selected} onSelect={setSelected} />
      </Card>
      <Card className="p-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-[14px] font-semibold text-ink">{label}</h3>
          <span className="label-xs">timeline</span>
        </div>
        <div className="mt-3">
          <DailyTimeline dateKey={selected} now={selected === todayKey() ? now : undefined} dense />
        </div>
        <Link
          href="/calendar"
          className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-night text-[12px] font-medium text-white transition-colors hover:bg-night-3"
        >
          View full schedule <ArrowRight size={12} />
        </Link>
      </Card>
    </div>
  );
}
