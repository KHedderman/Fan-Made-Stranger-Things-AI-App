// Heathkit H-89 / Cherry M9-style mechanical key click, synthesized with
// Web Audio. No assets. Three stacked layers approximate a real keypress:
//   1. Low body "thock"   — short sine pluck around 280 Hz
//   2. Mid noise body     — bandpass-filtered noise around 500-700 Hz
//   3. High spring ping   — quick sine blip around 3.2-3.8 kHz
// Plus a softer key-up "tick" ~55 ms later. Per-call randomization (pitch,
// gain, timing) provides round-robin variety so it doesn't sound looped.

let ctx: AudioContext | null = null;
let unlocked = false;
let lastPlay = 0;

const KEY_CLICK_MASTER_GAIN = 0.18;

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

function noiseBuffer(c: AudioContext, ms: number): AudioBuffer {
    const len = Math.max(1, Math.floor((c.sampleRate * ms) / 1000));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
        // shaped noise: louder at the front, decaying
        const env = 1 - i / len;
        d[i] = (Math.random() * 2 - 1) * env;
    }
    return buf;
}

function thock(c: AudioContext, at: number, gainOut: GainNode) {
    // Low body: damped sine pluck ~ 260-320 Hz
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 260 + Math.random() * 60;
    const g = c.createGain();
    const peak = 0.55 + Math.random() * 0.15;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(peak, at + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0005, at + 0.07);
    osc.connect(g).connect(gainOut);
    osc.start(at);
    osc.stop(at + 0.08);
}

function midBody(c: AudioContext, at: number, gainOut: GainNode) {
    // Bandpass-filtered noise burst — the "wooden" body of the click
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, 45);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 520 + Math.random() * 220;
    bp.Q.value = 2.2;
    const g = c.createGain();
    const peak = 0.35 + Math.random() * 0.12;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(peak, at + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0005, at + 0.05);
    src.connect(bp).connect(g).connect(gainOut);
    src.start(at);
    src.stop(at + 0.06);
}

function springPing(c: AudioContext, at: number, gainOut: GainNode) {
    // High, brief sine ping for the spring/leaf
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 3200 + Math.random() * 700;
    const g = c.createGain();
    const peak = 0.055 + Math.random() * 0.035;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(peak, at + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0005, at + 0.025);
    osc.connect(g).connect(gainOut);
    osc.start(at);
    osc.stop(at + 0.03);
}

function keyUpTick(c: AudioContext, at: number, gainOut: GainNode) {
    // Quieter, dryer release tick ~55ms after the down-stroke
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, 20);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1400 + Math.random() * 400;
    bp.Q.value = 1.6;
    const g = c.createGain();
    const peak = 0.08 + Math.random() * 0.035;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(peak, at + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0005, at + 0.025);
    src.connect(bp).connect(g).connect(gainOut);
    src.start(at);
    src.stop(at + 0.03);
}

/**
 * Play a Heathkit H-89-style mechanical keypress. Combines a low body
 * thock, a mid noise body, a high spring ping, and a quieter key-up tick.
 * Internally throttled to avoid stacking on very fast type loops.
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
    if (realNow - lastPlay < 20) return;
    lastPlay = realNow;


    try {
        const now = c.currentTime;
        const master = c.createGain();
        master.gain.value = KEY_CLICK_MASTER_GAIN;
        master.connect(c.destination);

        thock(c, now, master);
        midBody(c, now + 0.001, master);
        springPing(c, now + 0.002, master);
        // Key-up tick at a slightly randomized delay
        keyUpTick(c, now + 0.05 + Math.random() * 0.015, master);
    } catch {
        // ignore audio failures
    }
}
