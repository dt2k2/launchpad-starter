/**
 * Narrator — cinematic quote overlay.
 *
 * Triggered externally by passing a `line` prop (key changes ⇒ new reveal).
 * Auto-dismisses after `holdMs`.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export interface NarratorPayload {
  id: string; // unique per appearance
  text: string;
  attribution?: string;
  /** Hold visible duration */
  holdMs?: number;
  /** Tone modifies typography */
  tone?: "calm" | "tense" | "rupture";
}

interface Props {
  line: NarratorPayload | null;
  onDone?: () => void;
}

export function Narrator({ line, onDone }: Props) {
  const [active, setActive] = useState<NarratorPayload | null>(null);

  useEffect(() => {
    if (!line) return;
    setActive(line);
    const hold = line.holdMs ?? 4200;
    const t = setTimeout(() => {
      setActive(null);
      onDone?.();
    }, hold);
    return () => clearTimeout(t);
  }, [line, onDone]);

  const toneAccent =
    active?.tone === "rupture"
      ? "border-rose-300/30 shadow-[0_30px_80px_-20px_rgba(244,63,94,0.45)]"
      : active?.tone === "tense"
        ? "border-amber-300/30 shadow-[0_30px_80px_-20px_rgba(245,158,11,0.35)]"
        : "border-white/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]";

  return (
    <AnimatePresence mode="wait">
      {active && (
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-6 z-[40] flex justify-center px-4 sm:bottom-10"
          aria-live="polite"
        >
          <div
            className={`relative max-w-2xl rounded-2xl border ${toneAccent} bg-stone-950/80 px-6 py-4 text-center backdrop-blur-xl sm:px-8 sm:py-5`}
          >
            <span className="pointer-events-none absolute left-4 top-2 text-[10px] uppercase tracking-[0.4em] text-white/40">
              Người kể chuyện
            </span>
            <motion.p
              initial={{ letterSpacing: "0.02em" }}
              animate={{ letterSpacing: "0em" }}
              transition={{ duration: 1.6 }}
              className={`mt-3 font-display text-balance text-lg leading-snug sm:text-2xl ${
                active.tone === "rupture"
                  ? "text-rose-50"
                  : active.tone === "tense"
                    ? "text-amber-50"
                    : "text-white"
              }`}
            >
              "{active.text}"
            </motion.p>
            {active.attribution && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="mt-2 text-[10px] uppercase tracking-[0.35em] text-white/60"
              >
                — {active.attribution}
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
