"use client";

import { VoiceAssistantPanel } from "@/components/features/VoiceAssistantPanel";

export default function AssistantPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="label-xs">AI</div>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink">Voice assistant</h1>
        <p className="mt-1 text-[12.5px] text-ink-3">
          Reasoning over your calendar, tasks, goals and focus data. Speaks with ElevenLabs when configured, browser voice otherwise.
        </p>
      </div>
      <VoiceAssistantPanel />
    </div>
  );
}
