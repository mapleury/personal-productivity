"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Send, Sparkles, X } from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useAssistant, type AssistantStatus } from "@/lib/store/assistant";
import { useUI } from "@/lib/store/ui";

const STATUS_TEXT: Record<AssistantStatus, string> = {
  idle: "Ask me about your day.",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
};

function Waveform({ status }: { status: AssistantStatus }) {
  const active = status !== "idle";
  return (
    <span className="flex h-5 items-end gap-[3px]" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] origin-bottom rounded-full transition-colors",
            active ? "bg-accent-2 animate-wave" : "bg-surface-3",
          )}
          style={{ height: 16, animationDelay: `${i * 0.12}s`, animationPlayState: active ? "running" : "paused" }}
        />
      ))}
    </span>
  );
}

export function AssistantDock() {
  const open = useUI((s) => s.dockOpen);
  const setDock = useUI((s) => s.setDock);
  const { status, messages, error, ask, listen, stop } = useAssistant();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, status]);

  if (!open) return null;
  const last = messages.slice(-4);

  return (
    <div className="fixed bottom-24 right-3 z-40 w-[min(340px,calc(100vw-24px))] overflow-hidden rounded-[20px] border border-line bg-surface shadow-pop animate-fade-up md:bottom-24">
      <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Sparkles size={13} />
        </span>
        <div className="flex-1">
          <div className="text-[12.5px] font-semibold text-ink">Assistant</div>
          <div className="text-[10.5px] text-ink-3">{STATUS_TEXT[status]}</div>
        </div>
        <Waveform status={status} />
        <IconButton label="Close assistant" onClick={() => setDock(false)}>
          <X size={14} />
        </IconButton>
      </div>

      <div ref={scrollRef} className="max-h-56 space-y-2.5 overflow-y-auto px-4 py-3">
        {last.length === 0 ? (
          <p className="text-[12px] leading-relaxed text-ink-3">
            Ask things like “What is my schedule today?”, “What should I focus on now?” or “How productive was I today?”.
          </p>
        ) : (
          last.map((m, i) => (
            <div
              key={i}
              className={cn(
                "rounded-2xl px-3 py-2 text-[12px] leading-relaxed whitespace-pre-line",
                m.role === "user" ? "ml-6 bg-surface-2 text-ink-2" : "mr-6 bg-accent-soft/60 text-ink-2",
              )}
            >
              {m.text}
            </div>
          ))
        )}
        {status === "thinking" ? <div className="text-[11px] text-ink-3">Thinking…</div> : null}
        {error ? <div className="text-[11px] text-accent-2">{error}</div> : null}
      </div>

      <div className="flex items-center gap-1.5 border-t border-line px-3 py-2.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && text.trim()) {
              void ask(text);
              setText("");
            }
          }}
          placeholder="Ask about your day…"
          className="h-8 flex-1 rounded-full bg-surface-2 px-3 text-[12px] text-ink placeholder:text-ink-3 focus:outline-none"
        />
        <IconButton label={status === "listening" ? "Stop listening" : "Speak"} active={status === "listening"} onClick={listen}>
          <Mic size={14} />
        </IconButton>
        <IconButton
          label="Send"
          className="bg-night text-white hover:bg-night-3"
          onClick={() => {
            if (!text.trim()) return;
            void ask(text);
            setText("");
          }}
        >
          <Send size={13} />
        </IconButton>
      </div>
      {status === "speaking" ? (
        <button onClick={stop} className="w-full border-t border-line py-1.5 text-[10.5px] text-ink-3 transition-colors hover:bg-surface-2">
          Stop speaking
        </button>
      ) : null}
    </div>
  );
}
