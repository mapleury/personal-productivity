"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Music2, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { fmtPlayer } from "@/lib/time";
import { currentTrack, loadAudioBlob, useMusic } from "@/lib/store/music";

export function MusicBar() {
  const tracks = useMusic((s) => s.tracks);
  const queue = useMusic((s) => s.queue);
  const index = useMusic((s) => s.index);
  const playing = useMusic((s) => s.playing);
  const shuffle = useMusic((s) => s.shuffle);
  const repeat = useMusic((s) => s.repeat);
  const volume = useMusic((s) => s.volume);
  const position = useMusic((s) => s.position);
  const { toggle, next, prev, toggleShuffle, cycleRepeat, setVolume, setPosition, setPlaying, playTrack } =
    useMusic.getState();

  const track = currentTrack({ tracks, queue, index });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const trackId = track?.id;

  useEffect(() => {
    let alive = true;
    const a = audioRef.current;
    if (!a) return;
    if (!trackId) {
      a.removeAttribute("src");
      return;
    }
    void (async () => {
      const file = await loadAudioBlob(trackId);
      if (!alive || !file) return;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(file);
      urlRef.current = url;
      a.src = url;
      a.currentTime = 0;
      if (useMusic.getState().playing) void a.play().catch(() => setPlaying(false));
    })();
    return () => {
      alive = false;
    };
  }, [trackId, setPlaying]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !trackId) return;
    if (playing) void a.play().catch(() => setPlaying(false));
    else a.pause();
  }, [playing, trackId, setPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const a = audioRef.current;
    if (a && Math.abs(a.currentTime - position) > 2) a.currentTime = position;
  }, [position]);

  if (!tracks.length) {
    return (
      <div className="fixed inset-x-0 bottom-14 z-30 border-t border-line bg-surface/90 backdrop-blur md:inset-x-auto md:left-[260px] md:right-3 md:bottom-3 md:rounded-2xl md:border">
        <div className="flex h-14 items-center gap-3 px-4 text-[12px] text-ink-3">
          <Music2 size={14} className="text-accent-2" />
          <span>No music in your library yet.</span>
          <Link href="/music" className="ml-auto rounded-full bg-surface-2 px-3 py-1 font-medium text-ink-2 transition-colors hover:bg-surface-3">
            Add local tracks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-14 z-30 border-t border-line bg-surface/92 backdrop-blur-md md:inset-x-auto md:left-[260px] md:right-3 md:bottom-3 md:rounded-2xl md:border md:shadow-card">
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => {
          const p = Math.floor(e.currentTarget.currentTime);
          if (p !== useMusic.getState().position) setPosition(p);
        }}
        onEnded={() => useMusic.getState().next(true)}
        onPause={() => {
          if (useMusic.getState().playing) setPlaying(false);
        }}
        onPlay={() => {
          if (!useMusic.getState().playing) setPlaying(true);
        }}
      />
      <div className="flex h-16 items-center gap-3 px-3 md:px-4">
        <button
          className="flex min-w-0 flex-1 items-center gap-3 text-left md:flex-none md:w-52"
          onClick={() => track && playTrack(track.id)}
          title={track ? `${track.name} — ${track.artist}` : undefined}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <Music2 size={15} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[12.5px] font-medium text-ink">{track?.name ?? "—"}</span>
            <span className="block truncate text-[11px] text-ink-3">{track?.artist ?? "Unknown artist"}</span>
          </span>
        </button>

        <div className="flex items-center gap-0.5">
          <IconButton label="Shuffle" active={shuffle} onClick={toggleShuffle}>
            <Shuffle size={14} />
          </IconButton>
          <IconButton label="Previous" onClick={prev}>
            <SkipBack size={15} />
          </IconButton>
          <button
            aria-label={playing ? "Pause" : "Play"}
            onClick={toggle}
            className="mx-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-night text-white transition-transform hover:scale-105 active:scale-95"
          >
            {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>
          <IconButton label="Next" onClick={() => next(false)}>
            <SkipForward size={15} />
          </IconButton>
          <IconButton label={`Repeat: ${repeat}`} active={repeat !== "off"} onClick={cycleRepeat}>
            {repeat === "one" ? <Repeat1 size={14} /> : <Repeat size={14} />}
          </IconButton>
        </div>

        <div className="hidden flex-1 items-center gap-2 sm:flex">
          <span className="tnum w-9 text-right text-[10.5px] text-ink-3">{fmtPlayer(position)}</span>
          <input
            type="range"
            min={0}
            max={track?.duration || 0}
            step={1}
            value={Math.min(position, track?.duration || 0)}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer accent-[#4b3f72]"
            aria-label="Seek"
          />
          <span className="tnum w-9 text-[10.5px] text-ink-3">{fmtPlayer(track?.duration || 0)}</span>
        </div>

        <div className="hidden items-center gap-1.5 lg:flex">
          <Volume2 size={13} className="text-ink-3" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1 w-20 cursor-pointer accent-[#4b3f72]"
            aria-label="Volume"
          />
        </div>

        <span
          className={cn(
            "ml-auto hidden rounded-full px-2 py-0.5 text-[10px] font-medium md:block",
            shuffle ? "bg-accent-soft text-accent" : "bg-surface-2 text-ink-3",
          )}
        >
          {shuffle ? "Shuffle on" : `Queue ${index + 1}/${queue.length}`}
        </span>
      </div>
    </div>
  );
}
