"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CalendarRange,
  CircleUser,
  Flag,
  History,
  LayoutGrid,
  ListTodo,
  Mic,
  Music,
  Play,
  Pause,
  Settings,
  Shuffle,
  Sun,
  Target,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useMusic } from "@/lib/store/music";
import { useTimer } from "@/lib/store/timer";
import { useUI } from "@/lib/store/ui";

interface Cmd {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  run: () => void;
}

export function CommandPalette() {
  const open = useUI((s) => s.paletteOpen);
  if (!open) return null;
  return <PalettePanel />;
}

function PalettePanel() {
  const setPalette = useUI((s) => s.setPalette);
  const setDock = useUI((s) => s.setDock);
  const router = useRouter();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const cmds = useMemo<Cmd[]>(() => {
    const go = (href: string) => () => {
      setPalette(false);
      router.push(href);
    };
    return [
      { id: "n1", label: "Dashboard", icon: LayoutGrid, run: go("/") },
      { id: "n2", label: "Today", icon: Sun, run: go("/today") },
      { id: "n3", label: "Tasks", icon: ListTodo, run: go("/tasks") },
      { id: "n4", label: "Goals", icon: Target, run: go("/goals") },
      { id: "n5", label: "Calendar", icon: CalendarDays, run: go("/calendar") },
      { id: "n6", label: "Focus Timer", icon: Timer, run: go("/focus") },
      { id: "n7", label: "Music", icon: Music, run: go("/music") },
      { id: "n8", label: "Sessions", icon: History, run: go("/sessions") },
      { id: "n9", label: "Productivity", icon: Activity, run: go("/productivity") },
      { id: "n10", label: "Priorities", icon: Flag, run: go("/priorities") },
      { id: "n11", label: "Weekly Plan", icon: CalendarRange, run: go("/weekly-plan") },
      { id: "n12", label: "Analytics", icon: BarChart3, run: go("/analytics") },
      { id: "n13", label: "Voice Assistant", icon: Mic, run: go("/assistant") },
      { id: "n14", label: "Settings", icon: Settings, run: go("/settings") },
      { id: "n15", label: "Profile", icon: CircleUser, run: go("/profile") },
      {
        id: "a1",
        label: useTimer.getState().running ? "Pause focus timer" : "Start focus timer",
        hint: "timer",
        icon: useTimer.getState().running ? Pause : Play,
        run: () => {
          setPalette(false);
          const t = useTimer.getState();
          if (t.running) t.pause();
          else if (t.startedAt) t.resume();
          else t.start();
        },
      },
      {
        id: "a2",
        label: "Toggle music shuffle",
        hint: "music",
        icon: Shuffle,
        run: () => {
          setPalette(false);
          useMusic.getState().toggleShuffle();
        },
      },
      {
        id: "a3",
        label: "Ask the assistant",
        hint: "ai",
        icon: Mic,
        run: () => {
          setPalette(false);
          setDock(true);
        },
      },
    ];
  }, [router, setPalette, setDock]);

  const results = q.trim()
    ? cmds.filter((c) => c.label.toLowerCase().includes(q.trim().toLowerCase()))
    : cmds;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-night/25 backdrop-blur-[2px] animate-fade-in" onClick={() => setPalette(false)} />
      <div className="relative mx-auto mt-[12vh] w-[min(560px,calc(100vw-32px))] overflow-hidden rounded-[20px] border border-line bg-surface shadow-pop animate-fade-up">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setPalette(false);
            if (e.key === "Enter" && results[0]) results[0].run();
          }}
          placeholder="Jump to a page or run a command…"
          className="h-12 w-full border-b border-line bg-transparent px-4 text-sm text-ink placeholder:text-ink-3 focus:outline-none"
        />
        <div className="max-h-[320px] overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center text-[13px] text-ink-3">Nothing matches “{q}”.</div>
          ) : (
            results.map((c, i) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  onClick={c.run}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] text-ink-2 transition-colors hover:bg-surface-2",
                    i === 0 && "bg-surface-2/60",
                  )}
                >
                  <Icon size={14} className="text-ink-3" />
                  <span className="flex-1">{c.label}</span>
                  {c.hint ? <span className="text-[10px] uppercase tracking-wider text-ink-3">{c.hint}</span> : null}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
