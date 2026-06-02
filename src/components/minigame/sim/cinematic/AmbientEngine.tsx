/**
 * AmbientEngine — procedural Web Audio ambience.
 *
 * Zero audio assets. All ambience is synthesized with oscillators + filtered
 * noise so it ships with the bundle, crossfades smoothly between eras, and
 * responds to contradiction in real time (rumble + distortion increase).
 *
 * Lifecycle:
 *  - Audio cannot start without a user gesture (browser policy). The first
 *    click/keydown on the page resumes the AudioContext.
 *  - When `muted` is true, master gain ramps to 0 (engine stays alive so
 *    parameters can keep tracking era/contradiction without clicks on unmute).
 *  - On unmount everything is stopped and disconnected.
 */
import { useEffect, useRef } from "react";
import type { EraId } from "@/data/eras";
import { AUDIO_PROFILES } from "./cinematicConfig";

interface Props {
  era: EraId;
  contradiction: number;
  muted: boolean;
}

export function AmbientEngine({ era, contradiction, muted }: Props) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const eraGainRef = useRef<GainNode | null>(null);
  const droneNodesRef = useRef<OscillatorNode[]>([]);
  const noiseGainRef = useRef<GainNode | null>(null);
  const noiseFilterRef = useRef<BiquadFilterNode | null>(null);
  const rumbleGainRef = useRef<GainNode | null>(null);
  const distortionRef = useRef<WaveShaperNode | null>(null);
  const startedRef = useRef(false);
  const muteSuspendRef = useRef<number | null>(null);

  /* ---------- one-time graph construction on first gesture ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const ensureStarted = () => {
      if (startedRef.current) return;
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        ctxRef.current = ctx;

        // master
        const master = ctx.createGain();
        master.gain.value = muted ? 0 : 0.0001;
        masterRef.current = master;

        // distortion (driven by contradiction)
        const dist = ctx.createWaveShaper();
        dist.curve = makeDistortionCurve(0);
        dist.oversample = "2x";
        distortionRef.current = dist;

        // rumble: low-freq noise
        const rumbleBuf = makeNoiseBuffer(ctx, 0); // dark noise
        const rumble = ctx.createBufferSource();
        rumble.buffer = rumbleBuf;
        rumble.loop = true;
        const rumbleFilter = ctx.createBiquadFilter();
        rumbleFilter.type = "lowpass";
        rumbleFilter.frequency.value = 80;
        const rumbleGain = ctx.createGain();
        rumbleGain.gain.value = 0.0001;
        rumbleGainRef.current = rumbleGain;
        rumble.connect(rumbleFilter).connect(rumbleGain).connect(dist);
        rumble.start();

        // ambient noise (color set per era)
        const noiseBuf = makeNoiseBuffer(ctx, 1); // white, will be filtered
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuf;
        noise.loop = true;
        const nFilter = ctx.createBiquadFilter();
        nFilter.type = "lowpass";
        nFilter.frequency.value = 1000;
        const nGain = ctx.createGain();
        nGain.gain.value = 0.0001;
        noiseFilterRef.current = nFilter;
        noiseGainRef.current = nGain;
        noise.connect(nFilter).connect(nGain).connect(dist);
        noise.start();

        // era gain wraps drones + reaches master
        const eraGain = ctx.createGain();
        eraGain.gain.value = 0.0001;
        eraGainRef.current = eraGain;
        eraGain.connect(dist);

        dist.connect(master).connect(ctx.destination);

        startedRef.current = true;
        applyEra(era);
        applyContradiction(contradiction);
        applyMute(muted);
      } catch {
        // swallow — audio is optional
      }
      window.removeEventListener("pointerdown", ensureStarted);
      window.removeEventListener("keydown", ensureStarted);
    };

    window.addEventListener("pointerdown", ensureStarted, { once: true });
    window.addEventListener("keydown", ensureStarted, { once: true });

    return () => {
      window.removeEventListener("pointerdown", ensureStarted);
      window.removeEventListener("keydown", ensureStarted);
      const ctx = ctxRef.current;
      if (ctx) {
        try {
          if (muteSuspendRef.current) window.clearTimeout(muteSuspendRef.current);
          droneNodesRef.current.forEach((n) => {
            try {
              n.stop();
            } catch {
              /* noop */
            }
          });
          ctx.close();
        } catch {
          /* noop */
        }
      }
      ctxRef.current = null;
      startedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- react to era changes (crossfade + new drones) ---------- */
  useEffect(() => {
    applyEra(era);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [era]);

  /* ---------- react to contradiction (rumble + distortion) ---------- */
  useEffect(() => {
    applyContradiction(contradiction);
  }, [contradiction]);

  /* ---------- react to mute toggle ---------- */
  useEffect(() => {
    applyMute(muted);
  }, [muted]);

  function applyMute(m: boolean) {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    if (muteSuspendRef.current) {
      window.clearTimeout(muteSuspendRef.current);
      muteSuspendRef.current = null;
    }
    const now = ctx.currentTime;
    if (m) {
      master.gain.cancelScheduledValues(now);
      master.gain.linearRampToValueAtTime(0, now + 0.45);
      muteSuspendRef.current = window.setTimeout(() => {
        master.gain.value = 0;
        ctx.suspend().catch(() => {});
        muteSuspendRef.current = null;
      }, 520);
      return;
    }

    const resume = ctx.state === "suspended" ? ctx.resume() : Promise.resolve();
    resume
      .then(() => {
        const t = ctx.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
        master.gain.linearRampToValueAtTime(0.7, t + 0.6);
      })
      .catch(() => {});
  }

  function applyContradiction(c: number) {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const norm = Math.max(0, Math.min(100, c)) / 100;
    // rumble in 0..0.4 above 0.5 contradiction
    const rumble = Math.max(0, norm - 0.5) * 0.8;
    if (rumbleGainRef.current) {
      const now = ctx.currentTime;
      rumbleGainRef.current.gain.cancelScheduledValues(now);
      rumbleGainRef.current.gain.linearRampToValueAtTime(
        Math.max(0.0001, rumble),
        now + 0.8,
      );
    }
    // distortion ramps in above 0.7
    const drive = Math.max(0, norm - 0.7) * 80;
    if (distortionRef.current) {
      distortionRef.current.curve = makeDistortionCurve(drive);
    }
    // detune drones up slightly when crisis — micro-instability
    const detune = Math.max(0, norm - 0.7) * 25;
    droneNodesRef.current.forEach((d, i) => {
      try {
        const now = ctx.currentTime;
        d.detune.cancelScheduledValues(now);
        d.detune.linearRampToValueAtTime(
          (i % 2 === 0 ? 1 : -1) * detune,
          now + 0.6,
        );
      } catch {
        /* noop */
      }
    });
  }

  function applyEra(id: EraId) {
    const ctx = ctxRef.current;
    if (!ctx || !startedRef.current) return;
    const profile = AUDIO_PROFILES[id];
    const now = ctx.currentTime;

    // crossfade out old drones, then stop
    const old = droneNodesRef.current;
    const oldGain = eraGainRef.current;
    if (oldGain) {
      oldGain.gain.cancelScheduledValues(now);
      oldGain.gain.linearRampToValueAtTime(0.0001, now + 1.4);
    }
    setTimeout(() => {
      old.forEach((n) => {
        try {
          n.stop();
        } catch {
          /* noop */
        }
      });
    }, 1500);

    // new era gain
    const newGain = ctx.createGain();
    newGain.gain.value = 0.0001;
    newGain.connect(distortionRef.current!);
    eraGainRef.current = newGain;
    newGain.gain.linearRampToValueAtTime(profile.gain, now + 1.6);

    // new drones
    const drones: OscillatorNode[] = [];
    profile.drones.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "sine" : i % 2 === 0 ? "triangle" : "sawtooth";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = 0.5 / profile.drones.length;
      // gentle shimmer via LFO on gain
      if (profile.shimmerHz > 0) {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = profile.shimmerHz * (1 + i * 0.13);
        lfoGain.gain.value = 0.15 / profile.drones.length;
        lfo.connect(lfoGain).connect(g.gain);
        lfo.start();
      }
      osc.connect(g).connect(newGain);
      osc.start();
      drones.push(osc);
    });
    droneNodesRef.current = drones;

    // noise tint
    if (noiseFilterRef.current && noiseGainRef.current) {
      noiseFilterRef.current.frequency.linearRampToValueAtTime(
        profile.filterHz,
        now + 1.2,
      );
      noiseGainRef.current.gain.cancelScheduledValues(now);
      noiseGainRef.current.gain.linearRampToValueAtTime(
        profile.noiseGain * (0.5 + profile.noiseColor * 0.5),
        now + 1.2,
      );
    }
  }

  return null;
}

/* ---------- helpers ---------- */
function makeNoiseBuffer(ctx: AudioContext, color: number) {
  // color: 0 = brown-ish (integrated), 1 = white
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = color * white + (1 - color) * last * 4;
  }
  return buf;
}

function makeDistortionCurve(amount: number) {
  const n = 1024;
  const curve = new Float32Array(n);
  const k = amount;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}
