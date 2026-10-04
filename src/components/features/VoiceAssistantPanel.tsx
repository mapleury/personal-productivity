"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Send, Sparkles, Volume2, VolumeX } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useAssistant, type AssistantStatus } from "@/lib/store/assistant";
import { useSettings } from "@/lib/store/settings";

const SUGGESTIONS = [
  "What is my schedule today?",
  "What do I need to do next?",
  "What are my priorities?",
  "How productive was I today?",
  "What should I focus on now?",
  "How much time do I have before my next event?",
  "Read my schedule.",
  "Start a focus session.",
  "What's left on my task list?",
];

const STATUS_TEXT: Record<AssistantStatus, string> = {
  idle: "Ask me about your day.",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
};

export function VoiceAssistantPanel() {
  const { status, messages, error, ask, listen, stop, clear } = useAssistant();
  const autoSpeak = useSettings((s) => s.autoSpeak);
  const setAutoSpeak = useSettings((s) => s.setAutoSpeak);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, status]);

  const active = status !== "idle";

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={status === "listening" ? stop : listen}
            aria-label={status === "listening" ? "Stop listening" : "Start listening"}
            className={cn(
              "relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-[var(--ease-soft)]",
              status === "listening" ? "bg-accent text-white scale-105" : "bg-accent-soft text-accent hover:scale-105",
            )}
          >
            <Mic size={20} />
            {status === "listening" ? <span className="absolute inset-0 animate-ping rounded-full bg-accent/30" /> : null}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-accent-2" />
              <span className="text-[14px] font-semibold text-ink">Voice assistant</span>
            </div>
            <p className="mt-0.5 text-[12px] text-ink-3">{STATUS_TEXT[status]}</p>
            <div className="mt-2.5 flex h-6 items-end gap-1" aria-hidden>
              {Array.from({ length: 24 }, (_, i) => (
                <span
                  key={i}
                  className={cn("w-[3px] origin-bottom rounded-full", active ? "bg-accent-2 animate-wave" : "bg-surface-3")}
                  style={{ height: 8 + ((i * 7) % 14), animationDelay: `${(i % 8) * 0.09}s`, animationPlayState: active ? "running" : "paused" }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <IconButton label={autoSpeak ? "Mute spoken replies" : "Enable spoken replies"} active={autoSpeak} onClick={() => setAutoSpeak(!autoSpeak)}>
              {autoSpeak ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </IconButton>
            {messages.length ? (
              <IconButton label="Clear conversation" onClick={clear}>
                <Sparkles size={13} className="opacity-40" />
              </IconButton>
            ) : null}
          </div>
        </div>
        {error ? <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-[11.5px] text-accent-2">{error}</p> : null}
      </Card>

      <Card className="flex h-[320px] flex-col">
        <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="px-1 py-6 text-center text-[12.5px] leading-relaxed text-ink-3">
              The assistant reads your calendar, tasks, goals, priorities and focus sessions to answer.
              <br />
              Try one of the suggestions below, or press the mic and speak.
            </p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed whitespace-pre-line",
                  m.role === "user" ? "ml-auto bg-surface-2 text-ink-2" : "bg-accent-soft/60 text-ink-2",
                )}
              >
                {m.text}
              </div>
            ))
          )}
          {status === "thinking" ? <div className="text-[11.5px] text-ink-3">Thinking…</div> : null}
        </div>
        <div className="flex items-center gap-2 border-t border-line p-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && text.trim()) {
                void ask(text);
                setText("");
              }
            }}
            placeholder="Type a question…"
            className="h-9 flex-1 rounded-full bg-surface-2 px-4 text-[12.5px] text-ink placeholder:text-ink-3 focus:outline-none"
          />
          <Button
            variant="accent"
            size="md"
            onClick={() => {
              if (!text.trim()) return;
              void ask(text);
              setText("");
            }}
          >
            <Send size={12} /> Ask
          </Button>
        </div>
      </Card>

      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => void ask(s)}
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] text-ink-2 transition-all duration-150 hover:border-accent-3 hover:text-accent"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
