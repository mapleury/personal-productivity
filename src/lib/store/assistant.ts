"use client";

import { create } from "zustand";
import type { AssistantMessage } from "../types";
import { answerLocally } from "../briefing";
import { buildContext } from "../context";
import { uid } from "../time";
import { useSettings } from "./settings";
import { useTimer } from "./timer";

export type AssistantStatus = "idle" | "listening" | "thinking" | "speaking";

interface AssistantState {
  status: AssistantStatus;
  messages: AssistantMessage[];
  error: string | null;
  ask: (text: string) => Promise<void>;
  speak: (text: string) => Promise<void>;
  listen: () => void;
  stop: () => void;
  clear: () => void;
}

let ttsAudio: HTMLAudioElement | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let recog: any = null;

export const useAssistant = create<AssistantState>()((set, get) => ({
  status: "idle",
  messages: [],
  error: null,
  ask: async (text) => {
    const q = text.trim();
    if (!q) return;
    set((s) => ({ messages: [...s.messages, { role: "user", text: q, at: Date.now() }], error: null }));

    if (/^start (a )?focus/.test(q.toLowerCase())) {
      useTimer.getState().start();
      const reply = "Focus session started. I'll log it automatically when the timer completes.";
      set((s) => ({ messages: [...s.messages, { role: "assistant", text: reply, at: Date.now() }] }));
      if (useSettings.getState().autoSpeak) await get().speak(reply);
      return;
    }

    set({ status: "thinking" });
    const ctx = buildContext();
    let reply: string;
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: q, context: ctx }),
      });
      const data = (await res.json()) as { reply?: string };
      reply = data.reply?.trim() || answerLocally(q, ctx);
    } catch {
      reply = answerLocally(q, ctx);
    }
    set((s) => ({
      messages: [...s.messages, { role: "assistant", text: reply, at: Date.now() }],
      status: "idle",
    }));
    if (useSettings.getState().autoSpeak) await get().speak(reply);
  },
  speak: async (text) => {
    get().stop();
    set({ status: "speaking" });
    const done = () => set({ status: "idle" });
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok && (res.headers.get("content-type") ?? "").includes("audio")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        ttsAudio = new Audio(url);
        ttsAudio.onended = () => {
          URL.revokeObjectURL(url);
          done();
        };
        ttsAudio.onerror = done;
        await ttsAudio.play();
        return;
      }
    } catch {
      /* fall through to browser speech */
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.onend = done;
      u.onerror = done;
      window.speechSynthesis.speak(u);
      return;
    }
    done();
  },
  listen: () => {
    if (get().status === "listening") {
      recog?.stop();
      set({ status: "idle" });
      return;
    }
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      set({ error: "Voice input isn't supported in this browser — type your question instead." });
      return;
    }
    get().stop();
    recog = new SR();
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.onresult = (e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => {
      const text = e.results[0][0].transcript;
      set({ status: "idle" });
      void get().ask(text);
    };
    recog.onerror = () => set({ status: "idle", error: "I didn't catch that — try again or type it." });
    recog.onend = () => set((s) => (s.status === "listening" ? { status: "idle" } : s));
    set({ status: "listening", error: null });
    recog.start();
  },
  stop: () => {
    try {
      recog?.stop();
    } catch {
      /* noop */
    }
    if (ttsAudio) {
      ttsAudio.pause();
      ttsAudio = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    set({ status: "idle" });
  },
  clear: () => set({ messages: [], error: null }),
}));

export const assistantId = () => uid("m");
