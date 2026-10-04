"use client";

import { useRef, useState } from "react";
import { ListMusic, Music2, Play, Repeat, Repeat1, Shuffle, Trash2, Upload } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, CardHead } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { fmtPlayer } from "@/lib/time";
import { currentTrack, useMusic } from "@/lib/store/music";

const AUDIO_RE = /\.(mp3|wav|ogg|m4a|aac|flac)$/i;

export default function MusicPage() {
  const music = useMusic();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const accept = (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("audio") || AUDIO_RE.test(f.name));
    if (list.length) void music.addTracks(list);
  };

  const track = currentTrack(music);

  return (
    <div className="space-y-4">
      <div>
        <div className="label-xs">Focus</div>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-ink">Music</h1>
        <p className="mt-1 text-[12.5px] text-ink-3">
          Your local library, played in the browser. Files stay on this device — stored in IndexedDB so the library survives reloads.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          accept(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragOver ? "border-accent-2 bg-accent-soft/40" : "border-line bg-surface",
        )}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Upload size={17} />
        </span>
        <p className="mt-3 text-[13.5px] font-medium text-ink">Drop audio files here</p>
        <p className="mt-1 text-[11.5px] text-ink-3">MP3 · WAV · OGG · M4A — nothing is uploaded to a server</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.ogg,.m4a"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) accept(e.target.files);
            e.target.value = "";
          }}
        />
        <Button variant="accent" size="md" className="mt-4" onClick={() => inputRef.current?.click()}>
          <Upload size={13} /> Choose files
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <CardHead
            title="Library"
            sub={`${music.tracks.length} track${music.tracks.length === 1 ? "" : "s"} on this device`}
            action={
              <div className="flex items-center gap-1">
                <IconButton label="Shuffle queue" active={music.shuffle} onClick={music.toggleShuffle}>
                  <Shuffle size={14} />
                </IconButton>
                <IconButton label={`Repeat: ${music.repeat}`} active={music.repeat !== "off"} onClick={music.cycleRepeat}>
                  {music.repeat === "one" ? <Repeat1 size={14} /> : <Repeat size={14} />}
                </IconButton>
              </div>
            }
          />
          <div className="mt-3 space-y-1">
            {music.tracks.length === 0 ? (
              <p className="py-8 text-center text-[12px] text-ink-3">Library is empty — add a few tracks to get started.</p>
            ) : null}
            {music.tracks.map((t, i) => {
              const isCurrent = track?.id === t.id;
              return (
                <div
                  key={t.id}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors",
                    isCurrent ? "bg-accent-soft/50" : "hover:bg-surface-2",
                  )}
                >
                  <button
                    onClick={() => (isCurrent ? music.toggle() : music.playTrack(t.id))}
                    aria-label={isCurrent && music.playing ? "Pause" : `Play ${t.name}`}
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                      isCurrent ? "bg-accent text-white" : "bg-surface-2 text-ink-2 group-hover:bg-surface-3",
                    )}
                  >
                    {isCurrent && music.playing ? <Music2 size={13} /> : <Play size={12} className="ml-0.5" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className={cn("truncate text-[12.5px] font-medium", isCurrent ? "text-accent" : "text-ink")}>{t.name}</div>
                    <div className="truncate text-[10.5px] text-ink-3">{t.artist}</div>
                  </div>
                  <span className="tnum hidden text-[10.5px] text-ink-3 sm:block">{(t.size / 1e6).toFixed(1)} MB</span>
                  <span className="tnum text-[10.5px] text-ink-3">{fmtPlayer(t.duration)}</span>
                  <IconButton label="Remove track" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => music.removeTrack(t.id)}>
                    <Trash2 size={11} />
                  </IconButton>
                  <span className="tnum w-4 text-right text-[10px] text-ink-3/60">{i + 1}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <CardHead title="Queue" sub={music.shuffle ? "Shuffled order" : "Library order"} />
          <div className="mt-3 space-y-1">
            {music.queue.length === 0 ? <p className="py-6 text-center text-[12px] text-ink-3">Queue is empty.</p> : null}
            {music.queue.map((id, i) => {
              const t = music.tracks.find((x) => x.id === id);
              if (!t) return null;
              const isCurrent = i === music.index;
              return (
                <button
                  key={`${id}-${i}`}
                  onClick={() => music.playTrack(id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left transition-colors",
                    isCurrent ? "bg-accent-soft/60" : "hover:bg-surface-2",
                  )}
                >
                  <ListMusic size={12} className={isCurrent ? "text-accent" : "text-ink-3"} />
                  <span className={cn("min-w-0 flex-1 truncate text-[12px]", isCurrent ? "font-medium text-accent" : "text-ink-2")}>{t.name}</span>
                  <span className="tnum text-[10px] text-ink-3">{fmtPlayer(t.duration)}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 rounded-xl bg-surface-2 px-3 py-2 text-[10.5px] leading-relaxed text-ink-3">
            Playback keeps running while you move between pages — the player lives in the bottom bar.
          </p>
        </Card>
      </div>
    </div>
  );
}
