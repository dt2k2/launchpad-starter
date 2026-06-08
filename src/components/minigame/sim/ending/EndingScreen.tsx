/**
 * EndingScreen v2 — renders the matched EndingTemplate with per-perspective
 * narration, tone-driven background, and a reflective question.
 */
import { motion } from "framer-motion";
import { Trophy, RotateCcw } from "lucide-react";
import type { SimState } from "../simStore";
import { resolveEnding, type EndingTone } from "@/data/endings/templates";
import { PERSPECTIVE_THEMES } from "@/data/perspective/perspectiveConfig";
import { MEMORY_META } from "@/data/memory";
import { ReplayTimeline } from "../cinematic/ReplayTimeline";

const TONE_BG: Record<EndingTone, string> = {
  somber:    "from-stone-950 via-slate-900 to-stone-950",
  defiant:   "from-rose-950 via-stone-900 to-amber-950",
  frozen:    "from-slate-950 via-slate-900 to-stone-950",
  hopeful:   "from-emerald-950 via-stone-900 to-teal-950",
  ironic:    "from-stone-950 via-amber-950/30 to-stone-950",
  fractured: "from-zinc-950 via-stone-950 to-red-950",
};

export function EndingScreen({ state, onRestart }: { state: SimState; onRestart: () => void }) {
  const template = resolveEnding(state);
  const narration = template.narration[state.perspective];
  const theme = PERSPECTIVE_THEMES[state.perspective];
  const path = state.stagePath ?? [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className={`mx-auto max-w-3xl rounded-3xl bg-gradient-to-b ${TONE_BG[template.tone]} px-6 py-12 text-center sm:px-10`}
    >
      <Trophy className={`mx-auto h-10 w-10 ${theme.classes.accentText}`} />
      <p className="mt-4 text-xs uppercase tracking-[0.5em] text-white/50">
        {theme.label} · Kết cục · {template.tone}
      </p>
      <h1 className="mt-3 font-display text-4xl text-balance text-white sm:text-6xl">
        {template.title}
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-white/85">{narration.body}</p>
      <p className={`mx-auto mt-6 max-w-xl border-t border-white/10 pt-6 text-sm italic ${theme.classes.accentText}`}>
        — {narration.epitaph}
      </p>

      {/* Reflective question */}
      <div className="mx-auto mt-8 max-w-xl rounded-[var(--p-radius)] border border-[var(--p-accent)]/30 bg-black/30 p-5 text-left">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--p-muted)]">
          Câu hỏi gửi lại bạn
        </p>
        <p className="mt-2 text-base italic text-white/90">{template.reflectiveQuestion}</p>
      </div>

      {/* Path summary */}
      {path.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/70">
          <span className="text-white/40">Hành trình:</span>
          {path.map((p, i) => (
            <span
              key={i}
              className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 uppercase tracking-widest"
            >
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Memory carryover */}
      {state.memory.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/70">
          <span className="text-white/40">Ký ức lịch sử:</span>
          {state.memory.slice(0, 6).map((m) => {
            const meta = MEMORY_META[m.id];
            return (
              <span
                key={`${m.id}-${m.stage}`}
                title={`${meta.label} · ${m.stage} · w=${m.weight.toFixed(2)}`}
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1"
              >
                <span>{meta.icon}</span> {meta.label}
              </span>
            );
          })}
        </div>
      )}

      <button
        onClick={onRestart}
        className="mt-10 inline-flex max-w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-center text-xs font-medium uppercase tracking-[0.18em] text-stone-950 sm:text-sm sm:tracking-[0.25em]"
      >
        <RotateCcw className="h-4 w-4 shrink-0" />
        <span className="whitespace-normal break-words">Chơi lại với góc nhìn khác</span>
      </button>

      <ReplayTimeline state={state} />
    </motion.section>
  );
}
