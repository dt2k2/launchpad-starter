/**
 * TransitionScreen — surfaces the 4 "quiet" stage outcomes:
 * freeze / collapse / suppress / failed_uprising.
 * (evolve & rupture have their own RevolutionCinematic.)
 *
 * Shows the OUTCOME_NARRATION title + body with tone-driven palette, then
 * dispatches ackTransition to continue.
 */
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Flame,
  Snowflake,
  Skull,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import type { PathOutcome } from "@/data/transition/outcomes";
import { OUTCOME_NARRATION } from "@/data/transition/outcomes";
import type { SimState } from "../simStore";

const TONE_BG: Record<string, string> = {
  calm: "from-stone-900 via-stone-950 to-stone-900",
  uneasy: "from-slate-900 via-stone-950 to-slate-900",
  strained: "from-amber-950 via-stone-950 to-amber-950",
  urgent: "from-rose-950 via-stone-950 to-rose-950",
  fractured: "from-zinc-950 via-red-950/40 to-zinc-950",
  rupture: "from-fuchsia-950 via-stone-950 to-rose-950",
  tense: "from-amber-950 via-stone-950 to-rose-950",
};

const OUTCOME_ICON: Partial<Record<PathOutcome, typeof Snowflake>> = {
  freeze: Snowflake,
  collapse: Skull,
  suppress: ShieldAlert,
  failed_uprising: Flame,
  evolve: AlertTriangle,
  rupture: AlertTriangle,
};

const OUTCOME_SUBTITLE: Record<PathOutcome, string> = {
  evolve: "Quá độ êm dịu",
  rupture: "Đứt gãy",
  freeze: "Một thập kỷ trượt qua",
  collapse: "Lịch sử thụt lùi",
  suppress: "Trật tự bị khoá cứng",
  failed_uprising: "Khởi nghĩa bị dập",
};

export function TransitionScreen({
  state,
  onContinue,
}: {
  state: SimState;
  onContinue: () => void;
}) {
  const outcome = state.lastTransition ?? "freeze";
  const n = OUTCOME_NARRATION[outcome];
  const Icon = OUTCOME_ICON[outcome] ?? AlertTriangle;
  const bg = TONE_BG[n.tone] ?? TONE_BG.uneasy;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`mx-auto max-w-2xl rounded-3xl border border-white/10 bg-gradient-to-b ${bg} px-6 py-12 text-center sm:px-10`}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-black/30"
      >
        <Icon className="h-7 w-7 text-white/85" />
      </motion.div>

      <p className="mt-5 text-[10px] uppercase tracking-[0.45em] text-white/55">
        Kết cục chuyển ải · {OUTCOME_SUBTITLE[outcome]}
      </p>
      <h2 className="mt-3 font-display text-3xl text-white sm:text-5xl">
        {n.title}
      </h2>
      <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
        {n.body}
      </p>

      {/* Per-outcome consequence chip */}
      <div className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-2 text-[11px] text-white/70">
        {outcome === "freeze" && (
          <Chip>Ải lặp lại · Sản xuất −8 · Công nghệ −3</Chip>
        )}
        {outcome === "failed_uprising" && (
          <Chip>Ải lặp lại · Ổn định −8 · Cách mạng −20</Chip>
        )}
        {outcome === "collapse" && (
          <Chip>Sang ải kế · Sản xuất & ổn định tổn thất nặng</Chip>
        )}
        {outcome === "suppress" && (
          <Chip>Sang ải kế · Cải cách bị khoá vĩnh viễn</Chip>
        )}
      </div>

      <button
        onClick={onContinue}
        className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium uppercase tracking-[0.25em] text-stone-950 hover:bg-white/90"
      >
        Tiếp tục <ChevronRight className="h-4 w-4" />
      </button>
    </motion.section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 uppercase tracking-widest">
      {children}
    </span>
  );
}
