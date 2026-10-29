"use client";

import { useEffect } from "react";
import { fmtClock } from "@/lib/time";
import { unlockAudio } from "@/lib/sound";
import { remainingSec, useTimer } from "@/lib/store/timer";
import { useSettings } from "@/lib/store/settings";
import { useUI } from "@/lib/store/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useSettings((s) => s.theme);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && mq.matches));
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    const id = setInterval(() => {
      const t = useTimer.getState();
      if (t.running && remainingSec(t) <= 0) t.complete();
      document.title = t.running ? `${fmtClock(remainingSec(t))} · focus — wanei.` : "wanei. — personal productivity OS";
    }, 500);
    return () => clearInterval(id);
  }, []);

  // Browsers only let audio start after a user gesture. After a reload a running
  // timer has had no gesture yet, so unlock on the first interaction of any kind.
  useEffect(() => {
    const events = ["pointerdown", "click", "keydown", "touchend"] as const;
    const unlock = () => unlockAudio();
    events.forEach((e) => window.addEventListener(e, unlock, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, unlock));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const ui = useUI.getState();
        ui.setPalette(!ui.paletteOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <>{children}</>;
}