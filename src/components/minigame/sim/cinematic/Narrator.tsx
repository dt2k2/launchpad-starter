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

  return (
    <AnimatePresence mode="wait">
      {active && (
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 top-[18%] z-[40] flex justify-center px-6"
          aria-live="polite"
        >
          <div
            className={`max-w-2xl text-center ${
              active.tone === "rupture"
                ? "text-rose-50"
                : active.tone === "tense"
                  ? "text-amber-50"
                  : "text-white"
            }`}
          >
            <motion.p
              initial={{ letterSpacing: "0.02em" }}
              animate={{ letterSpacing: "0em" }}
              transition={{ duration: 2 }}
              className="font-display text-2xl leading-snug text-balance drop-shadow-[0_2px_18px_rgba(0,0,0,0.6)] sm:text-3xl"
            >
              "{active.text}"
            </motion.p>
            {active.attribution && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="mt-3 text-[10px] uppercase tracking-[0.4em] text-white/60"
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
