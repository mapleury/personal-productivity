"use client";

import { useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHead } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { inputCls, labelCls } from "@/components/ui/field";
import { useCalendar } from "@/lib/store/calendar";
import { useGoals } from "@/lib/store/goals";
import { useProductivity } from "@/lib/store/productivity";
import { useSettings } from "@/lib/store/settings";
import { useTasks } from "@/lib/store/tasks";
import { BackupCard } from "@/components/features/BackupCard";
export default function SettingsPage() {
  const { name, setName, autoSpeak, setAutoSpeak } = useSettings();
  const [api, setApi] = useState<{ gemini?: boolean; elevenlabs?: boolean }>({});

  useEffect(() => {
    void fetch("/api/config")
      .then((r) => r.json())
      .then(setApi)
      .catch(() => setApi({}));
  }, []);

  const exportData = () => {
    const data = {
      tasks: useTasks.getState().tasks,
      goals: useGoals.getState().goals,
      events: useCalendar.getState().events,
      productivity: {
        activity: useProductivity.getState().activity,
        sessions: useProductivity.getState().sessions,
      },
      settings: { name, autoSpeak },
      exportedAt: new Date().toISOString(),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `wanei-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearData = async () => {
    if (!window.confirm("Delete all local data (tasks, goals, calendar, productivity, focus sessions, music library)? This cannot be undone.")) return;

    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("wanei.")) localStorage.removeItem(key);
    }

    try {
      const dbs = await indexedDB.databases?.();
      for (const db of dbs ?? []) {
        if (db.name?.startsWith("wanei")) indexedDB.deleteDatabase(db.name);
      }
    } catch {
      // Some browsers do not support indexedDB.databases(); ignore and continue with local cleanup.
    }

    useTasks.setState({ tasks: [] });
    useGoals.setState({ goals: [] });
    useCalendar.setState({ events: [] });
    useProductivity.setState({ activity: {}, sessions: [] });

    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <div className="label-xs">System</div>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink">Settings</h1>
      </div>

      <Card className="p-5">
        <CardHead title="Profile" sub="How the OS addresses you" />
        <div className="mt-4 max-w-xs">
          <label className={labelCls}>Display name</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <label className="mt-4 flex items-center gap-2.5 text-[13px] text-ink-2">
          <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} className="h-4 w-4 accent-[#4b3f72]" />
          Speak assistant replies out loud
        </label>
      </Card>

      <Card className="p-5">
        <CardHead title="AI integration" sub="Keys live in .env.local on the server — never in browser code." />
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-surface-2 px-3.5 py-2.5">
            <span className="text-[12.5px] text-ink-2">Gemini reasoning</span>
            <Chip tone={api.gemini ? "accent" : "neutral"}>{api.gemini ? "configured" : "local fallback"}</Chip>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-surface-2 px-3.5 py-2.5">
            <span className="text-[12.5px] text-ink-2">ElevenLabs voice</span>
            <Chip tone={api.elevenlabs ? "accent" : "neutral"}>{api.elevenlabs ? "configured" : "browser voice"}</Chip>
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-ink-3">
          Copy <code className="rounded bg-surface-2 px-1 py-0.5">.env.example</code> to{" "}
          <code className="rounded bg-surface-2 px-1 py-0.5">.env.local</code>, add your keys and restart the dev server. Without keys everything
          still works with the built-in local engine.
        </p>
      </Card>

      <Card className="p-5">
        <CardHead title="Data" sub="Everything is stored locally in this browser (localStorage + IndexedDB)." />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="soft" size="md" onClick={exportData}>
            <Download size={13} /> Export JSON
          </Button>
          <Button variant="outline" size="md" className="text-ink-3" onClick={clearData}>
            <Trash2 size={13} /> Clear all local data
          </Button>
          
          <BackupCard />
        </div>
      </Card>
    </div>
  );
}
