/**
 * CompanionVoice — small bottom-left card surfacing the active companion line.
 * Auto-dismisses after a hold; reduced-motion friendly.
 */
import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { CompanionLine } from "@/data/companion/lines";
import { COMPANION_SPEAKER } from "@/data/companion/lines";
import type { PerspectiveId } from "@/data/historicalSim";

export function CompanionVoice({
  line,
  perspective,
  onDismiss,
}: {
  line: CompanionLine | null;
  perspective: PerspectiveId;
  onDismiss: () => void;
}) {
  const reduce = useReducedMotion();
  const speaker = COMPANION_SPEAKER[perspective];

  useEffect(() => {
    if (!line) return;
    const t = setTimeout(onDismiss, 7500);
    return () => clearTimeout(t);
  }, [line, onDismiss]);

  return (
    <AnimatePresence>
      {line && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, x: -16 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto fixed right-4 top-24 z-30 max-w-xs rounded-[var(--p-radius,8px)] border border-[var(--p-border,rgba(255,255,255,0.15))] bg-stone-950/90 px-4 py-3 shadow-[var(--p-shadow,0_20px_40px_-20px_rgba(0,0,0,0.6))] backdrop-blur-md sm:right-6 sm:top-28"

        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-lg" aria-hidden>
              {speaker.emoji}
            </span>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--p-muted,rgba(255,255,255,0.55))]">
                {line.speaker ?? speaker.name}
              </p>
              <p className="mt-1 text-sm italic text-white/90">"{line.text}"</p>
            </div>
            <button
              onClick={onDismiss}
              aria-label="Đóng"
              className="text-white/40 transition hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
