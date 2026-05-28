/**
 * RevolutionCinematic — replaces the simple RevolutionPanel.
 *
 * Choreography (≈ 5.2s):
 *  0.0  silence → low flash
 *  0.3  destruction symbols crumble outward
 *  1.6  shockwave ring expands
 *  2.0  rebirth symbols rise from below
 *  2.6  era title + cinematic quote fade in
 *  4.6  hint "Tiếp tục" appears
 */
import { useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { MetricKey, SimStage } from "@/data/historicalSim";
import { REVOLUTION_MOTIFS } from "./cinematicConfig";

interface Props {
  stage: SimStage; // the stage that JUST ended
  metrics: Record<MetricKey, number>;
  onDone: () => void;
}

export function RevolutionCinematic({ stage, metrics, onDone }: Props) {
  const motif = REVOLUTION_MOTIFS[stage.id];
  const burst = metrics.revolution >= stage.revolutionThreshold;
  const reduce = useReducedMotion();
  const duration = reduce ? 2000 : 5200;

  useEffect(() => {
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [onDone, duration]);

  const destructionItems = useMemo(
    () => spread(motif.destruction, 8),
    [motif.destruction],
  );
  const rebirthItems = useMemo(() => spread(motif.rebirth, 8), [motif.rebirth]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative mx-auto h-[70vh] max-w-3xl pt-2"
    >
      {/* shock flash */}
      {!reduce && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.5, times: [0, 0.2, 1] }}
          className="pointer-events-none fixed inset-0 z-[5]"
          style={{ background: motif.sparkColor, mixBlendMode: "overlay" }}
        />
      )}

      {/* shockwave ring */}
      {!reduce && (
        <motion.div
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 8, opacity: 0 }}
          transition={{ delay: 1.4, duration: 2.4, ease: "easeOut" }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-[6] h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{ borderColor: motif.sparkColor }}
        />
      )}

      {/* destruction symbols crumble */}
      <div className="pointer-events-none absolute inset-0 z-[7]">
        {destructionItems.map((s, i) => (
          <motion.span
            key={`d-${i}`}
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
            animate={
              reduce
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    x: s.x * 1.6,
                    y: s.y * 1.6 + 80,
                    rotate: s.r * 2,
                  }
            }
            transition={{
              delay: 0.25 + i * 0.08,
              duration: 1.6,
              ease: "easeIn",
            }}
            className="absolute select-none text-3xl text-white/70 sm:text-4xl"
            style={{
              left: `calc(50% + ${s.x}px)`,
              top: `calc(38% + ${s.y}px)`,
            }}
          >
            {s.glyph}
          </motion.span>
        ))}
      </div>

      {/* rebirth symbols rise */}
      <div className="pointer-events-none absolute inset-0 z-[8]">
        {rebirthItems.map((s, i) => (
          <motion.span
            key={`r-${i}`}
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: [0, 1, 1], y: 0 }}
            transition={{
              delay: 1.9 + i * 0.09,
              duration: 1.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute select-none text-3xl sm:text-4xl"
            style={{
              color: motif.sparkColor,
              left: `calc(50% + ${s.x}px)`,
              top: `calc(58% + ${s.y * 0.6}px)`,
              textShadow: `0 0 18px ${motif.sparkColor}`,
            }}
          >
            {s.glyph}
          </motion.span>
        ))}
      </div>

      {/* center title + quote */}
      <div className="relative z-[10] flex h-full flex-col items-center justify-center text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.4, duration: 0.6 }}
          className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.45em]"
          style={{ borderColor: motif.sparkColor, color: motif.sparkColor }}
        >
          {burst ? "Cách mạng bùng nổ" : motif.ruptureLabel}
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.7, duration: 0.8 }}
          className="mt-4 max-w-2xl font-display text-4xl text-balance text-white sm:text-6xl"
        >
          {stage.transitionTitle}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2, duration: 1.0 }}
          className="mt-4 max-w-xl text-white/80 italic"
        >
          "{stage.transitionLine}"
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 4.6, duration: 0.6 }}
          className="mt-10 text-xs uppercase tracking-[0.4em] text-white/50"
        >
          Lực lượng sản xuất đã vượt khỏi quan hệ cũ…
        </motion.p>
      </div>
    </motion.section>
  );
}

/** Place glyphs along a circle around the center, deterministic. */
function spread(symbols: string[], count: number) {
  const out: { glyph: string; x: number; y: number; r: number }[] = [];
  const radius = 170;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + 0.4;
    out.push({
      glyph: symbols[i % symbols.length],
      x: Math.cos(a) * radius,
      y: Math.sin(a) * radius * 0.7,
      r: (i % 2 === 0 ? 1 : -1) * (12 + i * 4),
    });
  }
  return out;
}
