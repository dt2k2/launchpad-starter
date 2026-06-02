/**
 * PressureGauges — 6 systemic-pressure mini-bars rendered inside the HUD.
 * Theme-aware: uses perspective tokens (--p-text / --p-muted / --p-border)
 * so it stays readable on light surfaces (historian) and dark (ruler/worker).
 */
import { motion } from "framer-motion";
import { PRESSURE_META, type Pressures } from "@/data/contradiction";

const KEYS: (keyof Pressures)[] = [
  "classTension",
  "repression",
  "legitimacyLoss",
  "organization",
  "productionInstability",
  "ruptureRisk",
];

const HUE: Record<keyof Pressures, string> = {
  classTension: "from-rose-500/80 to-orange-400/80",
  repression: "from-slate-400/80 to-slate-600/80",
  legitimacyLoss: "from-amber-400/80 to-yellow-500/80",
  organization: "from-sky-500/80 to-indigo-500/80",
  productionInstability: "from-orange-400/80 to-red-500/80",
  ruptureRisk: "from-fuchsia-500/90 to-rose-600/90",
};

export function PressureGauges({
  p,
  watched = [],
}: {
  p: Pressures;
  watched?: (keyof Pressures)[];
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {KEYS.map((k) => {
        const v = Math.round(p[k]);
        const meta = PRESSURE_META[k];
        const isWatched = watched.includes(k);
        return (
          <div
            key={k}
            title={`${meta.label}: ${meta.description}`}
            className={`rounded-md border px-2 py-1.5 ${
              isWatched
                ? "border-[var(--p-accent)] bg-[var(--p-accent-soft)] ring-1 ring-[var(--p-accent)]/30"
                : "border-[var(--p-border)] bg-[var(--p-accent-soft)] opacity-70"
            }`}
          >
            <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.15em] text-[var(--p-muted)]">
              <span className="truncate">{meta.short}</span>
              <span className="font-mono text-[var(--p-text)]">{v}</span>
            </div>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--p-text)_15%,transparent)]">
              <motion.div
                key={v}
                initial={{ width: 0 }}
                animate={{ width: `${v}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`h-full rounded-full bg-gradient-to-r ${HUE[k]}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
