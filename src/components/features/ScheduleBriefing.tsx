"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { Card, CardHead } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { IconButton } from "@/components/ui/Button";
import { answerLocally, dailyBriefing } from "@/lib/briefing";
import { buildContext } from "@/lib/context";

export function ScheduleBriefing() {
  const [text, setText] = useState("");
  const [source, setSource] = useState<"local" | "gemini" | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const ctx = buildContext();
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Give me my daily briefing right now.", context: ctx }),
      });
      const data = (await res.json()) as { reply?: string; source?: string };
      setText(data.reply?.trim() || dailyBriefing(ctx));
      setSource(data.source === "gemini" ? "gemini" : "local");
    } catch {
      setText(answerLocally("briefing", ctx));
      setSource("local");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Mount fetch: the briefing (Gemini or local fallback) has to land in state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return (
    <Card className="flex h-full flex-col p-5">
      <CardHead
        title="Daily Brief"
        sub=""
        action={
          <div className="flex items-center gap-1.5">
            {source ? <Chip tone={source === "gemini" ? "accent" : "neutral"}>{source === "gemini" ? "Gemini" : "Engine"}</Chip> : null}
            <IconButton label="Refresh briefing" onClick={() => { setLoading(true); void load(); }}>
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </IconButton>
          </div>
        }
      />
      <div className="mt-3 flex-1">
        {loading ? (
          <div className="space-y-2">
            <div className="h-3 w-full animate-pulse rounded-full bg-surface-2" />
            <div className="h-3 w-4/5 animate-pulse rounded-full bg-surface-2" />
            <div className="h-3 w-3/5 animate-pulse rounded-full bg-surface-2" />
          </div>
        ) : (
          <p className="text-[13px] leading-relaxed whitespace-pre-line text-ink-2">{text}</p>
        )}
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-[10.5px] text-ink-3">
        <Sparkles size={10} className="text-accent-2" />
        Ask the assistant
      </div>
    </Card>
  );
}
