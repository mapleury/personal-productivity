"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Mic, Search, Settings } from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import { fmtClock } from "@/lib/time";
import { remainingSec, useTimer } from "@/lib/store/timer";
import { useSettings } from "@/lib/store/settings";
import { useUI } from "@/lib/store/ui";

function TimerPill() {
  const timer = useTimer();
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!timer.running && !timer.startedAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [timer.running, timer.startedAt]);

  if (!timer.running && !timer.startedAt) return null;
  const rem = remainingSec(timer);
  return (
    <Link
      href="/focus"
      className="hidden items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:border-accent-3 sm:flex"
    >
      <span className={timer.running ? "h-1.5 w-1.5 animate-pulse rounded-full bg-accent-2" : "h-1.5 w-1.5 rounded-full bg-ink-3"} />
      <span className="tnum">{fmtClock(rem)}</span>
      <span className="text-ink-3">{timer.running ? "focusing" : "paused"}</span>
    </Link>
  );
}

export function TopBar() {
  const setPalette = useUI((s) => s.setPalette);
  const setDock = useUI((s) => s.setDock);
  const dockOpen = useUI((s) => s.dockOpen);
  const setMobileNav = useUI((s) => s.setMobileNav);
  const name = useSettings((s) => s.name);
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line/70 bg-bg/85 px-4 backdrop-blur-md md:px-6">
      <IconButton label="Menu" className="md:hidden" onClick={() => setMobileNav(true)}>
        <Menu size={16} />
      </IconButton>
      <Link href="/" className="text-[15px] font-semibold tracking-[-0.02em] text-ink md:hidden">
        wanei<span className="text-accent-2">.</span>
      </Link>

      <button
        onClick={() => setPalette(true)}
        className="ml-auto flex h-9 w-full max-w-[340px] items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-[13px] text-ink-3 transition-colors hover:border-accent-3 md:ml-6"
      >
        <Search size={14} />
        <span className="flex-1 text-left">Search or ask anything…</span>
        <kbd className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-ink-3">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <TimerPill />
        <IconButton label="Voice assistant" active={dockOpen} onClick={() => setDock(!dockOpen)}>
          <Mic size={15} />
        </IconButton>
        <Link href="/settings" aria-label="Settings" className="rounded-full p-2 text-ink-2 transition-colors hover:bg-surface-2">
          <Settings size={15} />
        </Link>
        <Link
          href="/profile"
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-night text-[10px] font-semibold text-white transition-transform hover:scale-105"
        >
          {initials || "W"}
        </Link>
      </div>
    </header>
  );
}
