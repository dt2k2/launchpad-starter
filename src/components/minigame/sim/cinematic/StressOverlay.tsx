/**
 * StressOverlay — adaptive visual stress driven by contradiction.
 *
 * Renders fixed full-viewport layers behind UI (pointer-events: none).
 * All animations are CSS — no per-frame React work. Tied through CSS custom
 * properties so a single re-render updates everything smoothly.
 *
 * Tiers:
 *   <40  calm: nothing
 *   40-70  unease: warm vignette, slow pulse
 *   70-90  crisis: scanline flicker, red vignette, gentle shake (parent does shake)
 *   >90    rupture: crack overlay, hue shift, scanline intensify
 */
import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import { resolveTier } from "@/data/contradiction";

interface Props {
  contradiction: number; // 0..100
  reduced?: boolean;
}

export function StressOverlay({ contradiction, reduced }: Props) {
  const sysReduce = useReducedMotion();
  const off = reduced || sysReduce;

  const style = useMemo(() => {
    const c = Math.max(0, Math.min(100, contradiction));
    // Drive overlay from contradiction tier so the visual matches the
    // gameplay state, not just the raw value.
    const tier = resolveTier(c);
    const base = tier.uiDistortion; // 0..1
    const vignette = base;
    const scan = base >= 0.4 ? Math.min(1, (base - 0.3) * 1.6) : 0;
    const crack = base >= 0.7 ? Math.min(1, (base - 0.6) * 2.2) : 0;
    const hue = base * 14; // up to ~14deg
    return {
      "--stress-vignette": vignette.toFixed(3),
      "--stress-scan": scan.toFixed(3),
      "--stress-crack": crack.toFixed(3),
      "--stress-hue": `${hue.toFixed(1)}deg`,
    } as React.CSSProperties;
  }, [contradiction]);

  if (off) {
    const tier = resolveTier(contradiction);
    const v = tier.uiDistortion * 0.6;
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[15]"
        style={{
          background: `radial-gradient(ellipse at center, transparent 55%, rgba(120,10,10,${v.toFixed(2)}) 100%)`,
        }}
      />
    );
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[15]"
      style={style}
    >
      {/* warm/red vignette */}
      <div className="stress-vignette absolute inset-0" />
      {/* scanlines */}
      <div className="stress-scanlines absolute inset-0" />
      {/* hue shift via backdrop */}
      <div
        className="absolute inset-0 transition-[backdrop-filter] duration-700"
        style={{ backdropFilter: `hue-rotate(var(--stress-hue))` }}
      />

      {/* fracture overlay (SVG cracks) */}
      <svg
        className="stress-cracks absolute inset-0 h-full w-full"
        viewBox="0 0 1000 700"
        preserveAspectRatio="none"
      >
        <g
          stroke="white"
          strokeOpacity="0.7"
          strokeWidth="0.6"
          fill="none"
          filter="drop-shadow(0 0 2px rgba(255,80,80,0.7))"
        >
          <path d="M -10 80 L 220 180 L 380 120 L 560 260 L 780 180 L 1010 320" />
          <path d="M -10 520 L 180 440 L 360 560 L 540 460 L 760 580 L 1010 480" />
          <path d="M 120 -10 L 200 220 L 160 380 L 280 540 L 220 720" />
          <path d="M 820 -10 L 760 200 L 880 360 L 780 540 L 860 720" />
          <path d="M 460 -10 L 500 160 L 440 320 L 520 480 L 460 720" />
        </g>
      </svg>
    </div>
  );
}
