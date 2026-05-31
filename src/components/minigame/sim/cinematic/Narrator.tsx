/**
 * Narrator — cinematic centered overlay with blurred backdrop.
 *
 * Triggered externally by passing a `line` prop (key changes ⇒ new reveal).
 * Auto-dismisses after `holdMs`, or on click/keypress.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export interface NarratorPayload {
  id: string;
  text: string;
  attribution?: string;
  holdMs?: number;
  tone?: "calm" | "tense" | "rupture" | "uneasy" | "strained" | "urgent" | "fractured";
  /** Optional voiceover MP3 to play with the line */
  audioSrc?: string;
}

interface Props {
  line: NarratorPayload | null;
  onDone?: () => void;
  muted?: boolean;
}

export function Narrator({ line, onDone, muted = false }: Props) {
  const [active, setActive] = useState<NarratorPayload | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!line) return;
    setActive(line);

    // Voiceover — clamp display to audio duration if available
    let hold = line.holdMs ?? 4500;
    const a = audioRef.current;
    if (a && line.audioSrc && !muted) {
      a.src = line.audioSrc;
      a.volume = 0.85;
      a.currentTime = 0;
      a.play().catch(() => {});
    } else if (a) {
      a.pause();
    }

    const t = setTimeout(() => {
      setActive(null);
      onDone?.();
    }, hold);
    return () => {
      clearTimeout(t);
      const aa = audioRef.current;
      if (aa) {
        aa.pause();
        aa.removeAttribute("src");
      }
    };
  }, [line, onDone, muted]);

  const dismiss = () => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.removeAttribute("src");
    }
    setActive(null);
    onDone?.();
  };

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);


  const tone = active?.tone;
  const isRupture = tone === "rupture" || tone === "fractured";
  const isTense =
    tone === "tense" || tone === "uneasy" || tone === "strained" || tone === "urgent";
  const toneAccent = isRupture
    ? {
        ring: "border-rose-300/40",
        glow: "shadow-[0_0_120px_-10px_rgba(244,63,94,0.55)]",
        text: "text-rose-50 narrator-glitch",
        rule: "from-transparent via-rose-300/60 to-transparent",
        label: "text-rose-200/80",
      }
    : isTense
      ? {
          ring: "border-amber-300/40",
          glow: "shadow-[0_0_120px_-10px_rgba(245,158,11,0.45)]",
          text: `text-amber-50 ${tone === "urgent" ? "narrator-urgent" : tone === "strained" ? "narrator-strained" : "narrator-uneasy"}`,
          rule: "from-transparent via-amber-300/60 to-transparent",
          label: "text-amber-200/80",
        }
      : {
          ring: "border-white/25",
          glow: "shadow-[0_0_120px_-10px_rgba(255,255,255,0.18)]",
          text: "text-white",
          rule: "from-transparent via-white/40 to-transparent",
          label: "text-white/70",
        };

  return (
    <>
    <AnimatePresence mode="wait">
      {active && (

        <motion.div
          key={active.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          onClick={dismiss}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/55 px-6 backdrop-blur-xl"
          aria-live="polite"
          role="dialog"
        >
          {/* Cinematic letterbox bars */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-x-0 top-0 h-[8vh] origin-top bg-black"
          />
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[8vh] origin-bottom bg-black"
          />

          {/* Radial vignette focus */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_80%)]" />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`relative max-w-3xl rounded-3xl border ${toneAccent.ring} ${toneAccent.glow} bg-stone-950/70 px-8 py-10 text-center backdrop-blur-2xl sm:px-14 sm:py-14`}
          >
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              animate={{ opacity: 1, letterSpacing: "0.5em" }}
              transition={{ duration: 1, delay: 0.3 }}
              className={`text-[10px] uppercase tracking-[0.5em] ${toneAccent.label}`}
            >
              Người kể chuyện
            </motion.p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 0.5 }}
              className={`mx-auto mt-4 h-px w-32 bg-gradient-to-r ${toneAccent.rule}`}
            />

            <motion.p
              initial={{ opacity: 0, y: 12, letterSpacing: "0.04em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "0em" }}
              transition={{ duration: 1.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`mt-8 font-display text-balance text-2xl leading-relaxed sm:text-4xl sm:leading-[1.3] ${toneAccent.text}`}
            >
              <span className={`mr-1 text-3xl sm:text-5xl ${toneAccent.label}`}>“</span>
              {active.text}
              <span className={`ml-1 text-3xl sm:text-5xl ${toneAccent.label}`}>”</span>
            </motion.p>

            {active.attribution && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.75 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="mt-6 text-[11px] uppercase tracking-[0.4em] text-white/60"
              >
                — {active.attribution}
              </motion.p>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="mt-10 text-[10px] uppercase tracking-[0.4em] text-white/40"
            >
              Nhấn để tiếp tục
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    <audio ref={audioRef} preload="auto" aria-hidden />
    </>
  );


}
