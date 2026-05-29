/**
 * PressureGauges — 6 systemic-pressure mini-bars rendered inside the HUD.
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
  repression: "from-slate-300/80 to-slate-500/80",
  legitimacyLoss: "from-amber-400/80 to-yellow-500/80",
  organization: "from-sky-400/80 to-indigo-500/80",
  productionInstability: "from-orange-400/80 to-red-500/80",
  ruptureRisk: "from-fuchsia-500/90 to-rose-600/90",
};

export function PressureGauges({ p }: { p: Pressures }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {KEYS.map((k) => {
        const v = Math.round(p[k]);
        const meta = PRESSURE_META[k];
        return (
          <div
            key={k}
            title={`${meta.label}: ${meta.description}`}
            className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5"
          >
            <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.15em] text-white/55">
              <span className="truncate">{meta.short}</span>
              <span className="font-mono text-white/80">{v}</span>
            </div>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
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
