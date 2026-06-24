// Heathkit H-89 power-on sound, synthesized with Web Audio. No assets.
// Layers that approximate a real H-89 cold boot:
//   1. CRT degauss "thunk" — low filtered noise thump as the yoke energizes
//   2. CRT high-voltage whine — faint ~15.7 kHz flyback tone that fades in
//   3. Fan hum — steady low rumble (~60 Hz + harmonics) that sustains
//   4. System beep — short square-wave BEEP from the H19 terminal (~1 kHz)
//   5. Floppy seek chatter — a few short stepper clacks from the H-17 drive
//
// Everything is gated through a master gain so it can fade out cleanly.

let ctx: AudioContext | null = null;
let active: { stop: () => void } | null = null;

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

function noiseBuffer(c: AudioContext, ms: number): AudioBuffer {
    const len = Math.max(1, Math.floor((c.sampleRate * ms) / 1000));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
}

function crtThunk(c: AudioContext, at: number, out: GainNode) {
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, 280);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 180;
    lp.Q.value = 0.7;
    const g = c.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.9, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0005, at + 0.32);
    src.connect(lp).connect(g).connect(out);
    src.start(at);
    src.stop(at + 0.34);

    // sub-thump body
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(70, at);
    osc.frequency.exponentialRampToValueAtTime(35, at + 0.25);
    const og = c.createGain();
    og.gain.setValueAtTime(0, at);
    og.gain.linearRampToValueAtTime(0.55, at + 0.01);
    og.gain.exponentialRampToValueAtTime(0.0005, at + 0.28);
    osc.connect(og).connect(out);
    osc.start(at);
    osc.stop(at + 0.3);
}

function flybackWhine(c: AudioContext, at: number, dur: number, out: GainNode) {
    // High-pitched horizontal flyback whine (~15.7 kHz on NTSC CRTs).
    // Kept very quiet so it sits in the background like a real CRT.
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 15700;
    const g = c.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.018, at + 0.6);
    g.gain.setValueAtTime(0.018, at + dur - 0.4);
    g.gain.linearRampToValueAtTime(0, at + dur);
    osc.connect(g).connect(out);
    osc.start(at);
    osc.stop(at + dur + 0.05);
    return osc;
}

function fanHum(c: AudioContext, at: number, dur: number, out: GainNode) {
    // Low cooling-fan rumble: 60 Hz fundamental + 120 + 180 harmonics,
    // lightly modulated by filtered noise for "whoosh" texture.
    const nodes: AudioNode[] = [];
    const partials = [
        { f: 60, a: 0.09 },
        { f: 120, a: 0.05 },
        { f: 180, a: 0.025 },
    ];
    const hum = c.createGain();
    hum.gain.setValueAtTime(0, at);
    hum.gain.linearRampToValueAtTime(1, at + 0.8);
    hum.gain.setValueAtTime(1, at + dur - 0.5);
    hum.gain.linearRampToValueAtTime(0, at + dur);
    hum.connect(out);
    nodes.push(hum);

    for (const p of partials) {
        const o = c.createOscillator();
        o.type = 'sine';
        o.frequency.value = p.f;
        const g = c.createGain();
        g.gain.value = p.a;
        o.connect(g).connect(hum);
        o.start(at);
        o.stop(at + dur + 0.05);
        nodes.push(o, g);
    }

    // Air movement: lowpass-filtered noise bed
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, Math.ceil(dur * 1000) + 200);
    src.loop = true;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 380;
    const ng = c.createGain();
    ng.gain.value = 0.05;
    src.connect(lp).connect(ng).connect(hum);
    src.start(at);
    src.stop(at + dur + 0.05);
    nodes.push(src, lp, ng);

    return nodes;
}

function systemBeep(c: AudioContext, at: number, out: GainNode) {
    // H19 terminal "BEEP" — short ~1 kHz square wave, ~120 ms.
    const osc = c.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 1000;
    const g = c.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.22, at + 0.005);
    g.gain.setValueAtTime(0.22, at + 0.115);
    g.gain.exponentialRampToValueAtTime(0.0005, at + 0.14);
    osc.connect(g).connect(out);
    osc.start(at);
    osc.stop(at + 0.16);
}

function floppySeek(c: AudioContext, at: number, out: GainNode) {
    // Hard-coded stepper pattern: H-17 5.25" drive seek sounds like a
    // burst of short, sharp clacks at ~6 ms intervals.
    const steps = 14;
    const interval = 0.028;
    for (let i = 0; i < steps; i++) {
        const t = at + i * interval + (Math.random() - 0.5) * 0.004;
        const src = c.createBufferSource();
        src.buffer = noiseBuffer(c, 12);
        const bp = c.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1800 + Math.random() * 400;
        bp.Q.value = 4;
        const g = c.createGain();
        const peak = 0.18 + Math.random() * 0.08;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(peak, t + 0.001);
        g.gain.exponentialRampToValueAtTime(0.0005, t + 0.02);
        src.connect(bp).connect(g).connect(out);
        src.start(t);
        src.stop(t + 0.025);
    }
}

/**
 * Play the Heathkit H-89 power-on sequence. Returns a stop() function that
 * fades the sustained layers (fan, flyback) out quickly. Idempotent — calling
 * again while a sequence is playing is a no-op.
 */
export function playBootSound(): () => void {
    const c = getCtx();
    if (!c) return () => {};
    if (active) return active.stop;

    if (c.state === 'suspended') {
        c.resume().catch(() => {});
    }

    const now = c.currentTime + 0.02;
    const SUSTAIN = 6.5; // seconds of fan + flyback bed

    const master = c.createGain();
    master.gain.value = 0.55;
    master.connect(c.destination);

    crtThunk(c, now, master);
    const whine = flybackWhine(c, now + 0.05, SUSTAIN, master);
    const fan = fanHum(c, now + 0.15, SUSTAIN, master);
    systemBeep(c, now + 0.9, master);
    floppySeek(c, now + 1.35, master);

    const stop = () => {
        if (!active) return;
        active = null;
        try {
            const t = c.currentTime;
            master.gain.cancelScheduledValues(t);
            master.gain.setValueAtTime(master.gain.value, t);
            master.gain.linearRampToValueAtTime(0, t + 0.4);
            // best-effort cleanup
            setTimeout(() => {
                try { whine.stop(); } catch { /* noop */ }
                for (const n of fan) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const maybe = n as any;
                    if (typeof maybe.stop === 'function') {
                        try { maybe.stop(); } catch { /* noop */ }
                    }
                }
                try { master.disconnect(); } catch { /* noop */ }
            }, 500);
        } catch {
            // ignore
        }
    };

    active = { stop };
    // Auto-clear after the scheduled sequence so a later boot can replay.
    setTimeout(() => {
        if (active && active.stop === stop) active = null;
    }, (SUSTAIN + 1) * 1000);

    return stop;
}
