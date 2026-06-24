// Heathkit H-89 piezo-beeper-style keypress feedback.
//
// The real H-89 had no speaker — only a small piezo/electromagnetic
// buzzer driven by the ROM monitor for system beeps. To preserve typing
// feedback while staying true to that hardware, every character emits a
// very short, low-pitched square-wave chirp (≈ 700 Hz, ~14 ms) instead
// of a mechanical-switch click. Slight per-keystroke pitch/duration
// jitter keeps fast typing from sounding looped.

let ctx: AudioContext | null = null;
let unlocked = false;
let lastPlay = 0;

const BEEPER_MASTER_GAIN = 0.09;

function getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (ctx) return ctx;
    const AC: typeof AudioContext | undefined =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window.AudioContext as any) || (window as any).webkitAudioContext;
    if (!AC) return null;
    try {
        ctx = new AC();
    } catch {
        ctx = null;
    }
    return ctx;
}

function tryUnlock() {
    const c = getCtx();
    if (!c) return;
    if (c.state === 'suspended') {
        c.resume()
            .then(() => {
                unlocked = true;
            })
            .catch(() => {});
    } else {
        unlocked = true;
    }
}

if (typeof window !== 'undefined') {
    const handler = () => tryUnlock();
    window.addEventListener('pointerdown', handler, { passive: true });
    window.addEventListener('keydown', handler, { passive: true });
}

/**
 * Play one short H-89-style piezo beep per typed character. Monophonic,
 * low pitch, ~14 ms, hard-edged square wave low-passed slightly to take
 * the harshness off the harmonics. Throttled so very fast streams don't
 * pile up.
 */
export function playKeyClick(): void {
    // Optional capture hook for offline audio generation. No-op in
    // production unless `window.__captureClicks = true` was set.
    if (typeof window !== 'undefined') {
        const w = window as unknown as { __captureClicks?: boolean; __clickTimes?: number[] };
        if (w.__captureClicks) {
            (w.__clickTimes ||= []).push(performance.now());
        }
    }

    const c = getCtx();
    if (!c) return;
    if (!unlocked) tryUnlock();

    const realNow = performance.now();
    if (realNow - lastPlay < 18) return;
    lastPlay = realNow;

    try {
        const now = c.currentTime;
        const dur = 0.012 + Math.random() * 0.006; // ~12-18 ms

        const osc = c.createOscillator();
        osc.type = 'square';
        // Slight pitch jitter around 700 Hz — authentic low-pitched beeper
        osc.frequency.setValueAtTime(680 + Math.random() * 60, now);

        // Tame the square-wave harshness so it reads as a buzzer rather
        // than a 1980s arcade blip
        const lp = c.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 2200;
        lp.Q.value = 0.3;

        const g = c.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(BEEPER_MASTER_GAIN, now + 0.0015);
        g.gain.setValueAtTime(BEEPER_MASTER_GAIN, now + dur - 0.002);
        g.gain.exponentialRampToValueAtTime(0.0005, now + dur);

        osc.connect(lp).connect(g).connect(c.destination);
        osc.start(now);
        osc.stop(now + dur + 0.01);
    } catch {
        // ignore audio failures
    }
}
