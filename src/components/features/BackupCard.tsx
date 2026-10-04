"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHead } from "@/components/ui/Card";
import { exportBackup, importBackup } from "@/lib/backup";

export function BackupCard() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!window.confirm("This will replace your current data with the backup. Continue?")) return;
    try {
      setError("");
      await importBackup(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    }
  };

  return (
    <Card className="p-5">
      <CardHead title="Backup" sub="Your data lives only in this browser. Download a copy now and then." />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="accent" size="md" onClick={exportBackup}>
          <Download size={13} /> Export backup
        </Button>
        <Button variant="soft" size="md" onClick={() => inputRef.current?.click()}>
          <Upload size={13} /> Import backup
        </Button>
        <input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={onPick} />
      </div>
      {error ? <p className="mt-3 text-[12px] text-ink-3">{error}</p> : null}
    </Card>
  );
}