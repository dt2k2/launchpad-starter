/**
 * ContradictionTierBadge — pill showing current contradiction tier + label.
 */
import { motion } from "framer-motion";
import { resolveTier, type TierId } from "@/data/contradiction";

const TIER_STYLE: Record<TierId, { ring: string; bg: string; text: string; dot: string; pulse: boolean }> = {
  calm: {
    ring: "border-emerald-300/30",
    bg: "bg-emerald-400/10",
    text: "text-emerald-100",
    dot: "bg-emerald-400",
    pulse: false,
  },
  tension: {
    ring: "border-amber-300/40",
    bg: "bg-amber-400/10",
    text: "text-amber-100",
    dot: "bg-amber-400",
    pulse: false,
  },
  unstable: {
    ring: "border-orange-300/50",
    bg: "bg-orange-400/15",
    text: "text-orange-100",
    dot: "bg-orange-400",
    pulse: true,
  },
  emergency: {
    ring: "border-rose-400/60",
    bg: "bg-rose-500/20",
    text: "text-rose-50",
    dot: "bg-rose-400",
    pulse: true,
  },
  rupture: {
    ring: "border-fuchsia-400/70",
    bg: "bg-fuchsia-600/25",
    text: "text-fuchsia-50",
    dot: "bg-fuchsia-300",
    pulse: true,
  },
};

export function ContradictionTierBadge({ contradiction }: { contradiction: number }) {
  const tier = resolveTier(contradiction);
  const s = TIER_STYLE[tier.id];
  return (
    <motion.span
      key={tier.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] backdrop-blur ${s.ring} ${s.bg} ${s.text}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${s.dot} ${
          s.pulse ? "animate-pulse" : ""
        }`}
      />
      Mâu thuẫn · {tier.shortLabel}
      <span className="ml-1 font-mono opacity-70">{Math.round(contradiction)}</span>
    </motion.span>
  );
}
