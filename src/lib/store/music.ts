import { create } from "zustand";
import { persist } from "zustand/middleware";
import { get as idbGet, set as idbSet, del as idbDel, createStore } from "idb-keyval";
import type { RepeatMode, Track } from "../types";
import { uid } from "../time";

export const audioKey = (id: string) => `wanei:audio:${id}`;

// Dedicated, lazily-opened store so audio blobs never share idb-keyval's default
// store and so importing this module during SSR (no indexedDB) stays safe.
let _audioStore: ReturnType<typeof createStore> | null = null;
function audioStore() {
  if (typeof indexedDB === "undefined") return undefined;
  if (!_audioStore) _audioStore = createStore("wanei-audio-db", "audio");
  return _audioStore;
}

interface MusicState {
  tracks: Track[];
  queue: string[];
  index: number;
  playing: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  position: number;
  addTracks: (files: File[]) => Promise<void>;
  removeTrack: (id: string) => void;
  playTrack: (id: string) => void;
  toggle: () => void;
  next: (auto?: boolean) => void;
  prev: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setVolume: (v: number) => void;
  setPosition: (s: number) => void;
  setPlaying: (b: boolean) => void;
}

const shuffled = (ids: string[], first: string | null) => {
  const rest = ids.filter((i) => i !== first);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return first ? [first, ...rest] : rest;
};

function parseName(filename: string): { name: string; artist: string } {
  const base = filename.replace(/\.[^.]+$/, "").replace(/[_]+/g, " ");
  if (base.includes(" - ")) {
    const [artist, ...rest] = base.split(" - ");
    return { artist: artist.trim(), name: rest.join(" - ").trim() };
  }
  return { name: base.trim(), artist: "Local file" };
}

const probeDuration = (file: File): Promise<number> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement("audio");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      resolve(Number.isFinite(el.duration) ? el.duration : 0);
      URL.revokeObjectURL(url);
    };
    el.onerror = () => {
      resolve(0);
      URL.revokeObjectURL(url);
    };
    el.src = url;
  });

export const useMusic = create<MusicState>()(
  persist(
    (set, get) => ({
      tracks: [],
      queue: [],
      index: -1,
      playing: false,
      shuffle: false,
      repeat: "off",
      volume: 0.8,
      position: 0,
      addTracks: async (files) => {
        const added: Track[] = [];
        for (const file of files) {
          const id = uid("tr");
          await idbSet(audioKey(id), file, audioStore());
          const { name, artist } = parseName(file.name);
          added.push({
            id,
            name,
            artist,
            duration: await probeDuration(file),
            size: file.size,
            mime: file.type || "audio/mpeg",
            addedAt: Date.now(),
          });
        }
        if (!added.length) return;
        set((s) => {
          const tracks = [...s.tracks, ...added];
          const ids = added.map((t) => t.id);
          const queue = s.shuffle ? [...s.queue, ...shuffled(ids, null)] : [...s.queue, ...ids];
          return { tracks, queue, index: s.index < 0 ? 0 : s.index };
        });
      },
      removeTrack: (id) => {
        void idbDel(audioKey(id), audioStore());
        set((s) => {
          const tracks = s.tracks.filter((t) => t.id !== id);
          const queue = s.queue.filter((q) => q !== id);
          const currentId = s.queue[s.index];
          const index = currentId === id ? Math.min(s.index, queue.length - 1) : s.index;
          return { tracks, queue, index, playing: currentId === id ? false : s.playing, position: currentId === id ? 0 : s.position };
        });
      },
      playTrack: (id) =>
        set((s) => {
          const idx = s.queue.indexOf(id);
          if (idx < 0) return s;
          return { index: idx, playing: true, position: 0 };
        }),
      toggle: () => {
        const s = get();
        if (s.index < 0 && s.queue.length) set({ index: 0, playing: true, position: 0 });
        else set({ playing: !s.playing });
      },
      next: (auto) => {
        const s = get();
        if (!s.queue.length) return;
        if (auto && s.repeat === "one") {
          set({ position: 0 });
          return;
        }
        let i = s.index + 1;
        if (i >= s.queue.length) {
          if (s.repeat === "all") i = 0;
          else {
            set({ playing: false, position: 0 });
            return;
          }
        }
        set({ index: i, position: 0, playing: true });
      },
      prev: () => {
        const s = get();
        if (s.position > 3) {
          set({ position: 0 });
          return;
        }
        set({ index: Math.max(0, s.index - 1), position: 0 });
      },
      toggleShuffle: () =>
        set((s) => {
          const shuffle = !s.shuffle;
          const currentId = s.queue[s.index] ?? null;
          const ids = s.tracks.map((t) => t.id);
          const queue = shuffle ? shuffled(ids, currentId) : ids;
          return { shuffle, queue, index: queue.indexOf(currentId ?? "") };
        }),
      cycleRepeat: () =>
        set((s) => ({ repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off" })),
      setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
      setPosition: (p) => set({ position: p }),
      setPlaying: (b) => set({ playing: b }),
    }),
    {
      name: "wanei.music.v1",
      partialize: (s) => ({
        tracks: s.tracks,
        queue: s.queue,
        index: s.index,
        shuffle: s.shuffle,
        repeat: s.repeat,
        volume: s.volume,
      }),
    },
  ),
);

export const currentTrack = (s: Pick<MusicState, "tracks" | "queue" | "index">): Track | null => {
  const id = s.queue[s.index];
  return s.tracks.find((t) => t.id === id) ?? null;
};

export async function loadAudioBlob(id: string): Promise<File | undefined> {
  try {
    return await idbGet<File>(audioKey(id), audioStore());
  } catch {
    return undefined;
  }
}
