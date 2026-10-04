import { todayKey } from "./time";

const KEYS = [
  "wanei.tasks.v2",
  "wanei.goals.v2",
  "wanei.calendar.v2",
  "wanei.productivity.v2",
  "wanei.settings.v1",
];

interface BackupFile {
  app: "wanei";
  version: 1;
  exportedAt: string;
  data: Record<string, unknown>;
}

export function exportBackup() {
  const data: Record<string, unknown> = {};
  for (const key of KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) data[key] = JSON.parse(raw);
  }
  const file: BackupFile = { app: "wanei", version: 1, exportedAt: new Date().toISOString(), data };
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wanei-backup-${todayKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importBackup(file: File): Promise<void> {
  const text = await file.text();
  let parsed: BackupFile;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  if (parsed.app !== "wanei" || typeof parsed.data !== "object" || parsed.data === null) {
    throw new Error("That doesn't look like a wanei backup file.");
  }
  for (const key of KEYS) {
    if (key in parsed.data) localStorage.setItem(key, JSON.stringify(parsed.data[key]));
  }
  // Reload so every store rehydrates from the restored data.
  window.location.reload();
}