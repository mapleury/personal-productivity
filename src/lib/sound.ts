// Local, dependency-free completion alert built on the Web Audio API.
// Browsers keep an AudioContext "suspended" until a user gesture, so
// unlockAudio() is called from gesture handlers; playCompletionBeeps() never
// throws, so a blocked or missing audio device can't affect timer completion.

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    ctx = null;
  }
  return ctx;
}

/** Create/resume the audio context. Call from a user gesture (click, key press). */
export function unlockAudio(): void {
  const c = getContext();
  if (!c || c.state === "running") return;
  c.resume().catch(() => {
    // Still blocked; a later gesture will try again.
  });
}

const BEEP_COUNT = 3;
const BEEP_HZ = 880;
const BEEP_LEN_S = 0.15;
const BEEP_GAP_S = 0.3; // start-to-start

/** Three short "beep-beep-beep" tones. Resolves silently if audio is unavailable. */
export async function playCompletionBeeps(): Promise<void> {
  try {
    const c = getContext();
    if (!c) return;
    const running = () => c.state === "running";
    if (!running()) await c.resume();
    if (!running()) return; // autoplay-blocked: skip quietly

    const t0 = c.currentTime + 0.05;
    for (let i = 0; i < BEEP_COUNT; i++) {
      const start = t0 + i * BEEP_GAP_S;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.value = BEEP_HZ;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + BEEP_LEN_S);
      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(start + BEEP_LEN_S + 0.02);
    }
  } catch {
    // Audio is best-effort only.
  }
}