// Synthesizes a short Heathkit-H89-style mechanical key "click" using
// Web Audio. No assets required. Plays only in the browser, after the
// AudioContext has been unlocked by a user gesture (handled below).

let ctx: AudioContext | null = null;
let unlocked = false;
let lastPlay = 0;

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
        c.resume().then(() => {
            unlocked = true;
        }).catch(() => {});
    } else {
        unlocked = true;
    }
}

if (typeof window !== 'undefined') {
    const handler = () => {
        tryUnlock();
    };
    window.addEventListener('pointerdown', handler, { once: false, passive: true });
    window.addEventListener('keydown', handler, { once: false, passive: true });
}

/**
 * Play a short, dry mechanical key click. Safe to call rapidly — internally
 * throttled to avoid stacking on very fast type loops.
 */
export function playKeyClick(): void {
    const c = getCtx();
    if (!c) return;
    if (!unlocked) tryUnlock();
    const now = c.currentTime;
    // Throttle: at most ~one click per 18ms.
    const realNow = performance.now();
    if (realNow - lastPlay < 18) return;
    lastPlay = realNow;

    try {
        // Short noise burst → bandpass → fast envelope = "tick".
        const bufferSize = Math.floor(c.sampleRate * 0.025); // 25ms
        const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const src = c.createBufferSource();
        src.buffer = buffer;

        const bp = c.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1800 + Math.random() * 400;
        bp.Q.value = 1.2;

        const gain = c.createGain();
        const peak = 0.07 + Math.random() * 0.03;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(peak, now + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

        src.connect(bp).connect(gain).connect(c.destination);
        src.start(now);
        src.stop(now + 0.05);
    } catch {
        // ignore audio failures
    }
}
