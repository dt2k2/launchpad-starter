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

interface Props {
  contradiction: number; // 0..100
  reduced?: boolean;
}

export function StressOverlay({ contradiction, reduced }: Props) {
  const sysReduce = useReducedMotion();
  const off = reduced || sysReduce;

  const style = useMemo(() => {
    const c = Math.max(0, Math.min(100, contradiction));
    // normalized intensity 0..1, kicks in above 40
    const vignette = Math.max(0, (c - 40) / 60); // 0..1
    const scan = Math.max(0, (c - 60) / 40);
    const crack = Math.max(0, (c - 80) / 20);
    const hue = Math.max(0, (c - 70) / 30) * 12; // up to 12deg
    return {
      "--stress-vignette": vignette.toFixed(3),
      "--stress-scan": scan.toFixed(3),
      "--stress-crack": crack.toFixed(3),
      "--stress-hue": `${hue.toFixed(1)}deg`,
    } as React.CSSProperties;
  }, [contradiction]);

  if (off) {
    // Still render the vignette (no motion), gentler ceiling
    const v = Math.max(0, (contradiction - 50) / 60);
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[15]"
        style={{
          background: `radial-gradient(ellipse at center, transparent 55%, rgba(120,10,10,${(v * 0.35).toFixed(2)}) 100%)`,
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
      {/* hue shift via backdrop */}
      <div
        className="absolute inset-0 transition-[backdrop-filter] duration-700"
        style={{
          backdropFilter: `hue-rotate(var(--stress-hue))`,
        }}
      />

          backdropFilter: `hue-rotate(var(--stress-hue)) contrast(${1 + 0.05 * Number(style["--stress-crack" as keyof React.CSSProperties])})`,
        }}
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
