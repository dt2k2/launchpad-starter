/**
 * Transition resolver — decides what happens at stage end.
 * Pure function of SimState. Deterministic priority + weighted fallback.
 */
import type { SimState } from "@/components/minigame/sim/simStore";
import type { PathOutcome } from "./outcomes";

interface Cand { o: PathOutcome; w: number; reason?: string }

export interface TransitionDecision {
  outcome: PathOutcome;
  weights: Cand[];
  reason: string;
}

export function resolveTransition(s: SimState): TransitionDecision {
  const c = s.metrics.contradiction;
  const st = s.metrics.stability;
  const p = s.metrics.production;
  const rev = s.metrics.revolution;
  const org = s.pressures.organization;
  const rep = s.pressures.repression;
  const leg = 100 - s.pressures.legitimacyLoss;
  const persp = s.perspective;

  // Note: We allow infinite freeze (stagnation) as historically accurate.

  const cands: Cand[] = [
    {
      o: "rupture",
      w: (c >= 80 && org >= 55) || rev >= 70 ? c + org * 0.8 : 0,
      reason: "high contradiction + organization",
    },
    {
      o: "failed_uprising",
      w: c >= 80 && org < 45 && rep > 40 ? c + (60 - org) + rep * 0.4 : 0,
      reason: "tried to rise but disorganized + heavy repression",
    },
    {
      o: "collapse",
      w: st < 22 && p < 28 ? (40 - st) + (45 - p) + c * 0.2 : 0,
      reason: "stability + production collapsed",
    },
    {
      o: "suppress",
      w:
        persp === "ruler" && rep > 60 && st > 45
          ? 45 + rep * 0.3
          : rep > 75 && st > 35
            ? 30
            : 0,
      reason: "authoritarian lock-in",
    },
    {
      o: "freeze",
      w:
        c < 55 && rev < 35 && p < 45 && org < 35
          ? 32 + (50 - org) * 0.2
          : 0,
      reason: "no pressure, no movement",
    },
    {
      o: "evolve",
      w: st > 35 && c < 75 && p >= 40 ? 32 + leg / 3 + p * 0.15 : 8,
      reason: "stable enough to transition",
    },
  ];

  // Deterministic priority for high-pressure outcomes
  const rupture = cands.find((x) => x.o === "rupture")!;
  const failed = cands.find((x) => x.o === "failed_uprising")!;
  const collapse = cands.find((x) => x.o === "collapse")!;

  if (collapse.w > 60) return pick(collapse, cands);
  if (rupture.w > 100) return pick(rupture, cands);
  if (failed.w > 80) return pick(failed, cands);

  // Weighted pick among remaining (>0)
  const pool = cands.filter((c) => c.w > 0);
  if (pool.length === 0) return pick(cands.find((x) => x.o === "evolve")!, cands);

  // Deterministic fallback: pick the candidate with the highest weight
  const chosen = pool.reduce((best, cand) => {
    if (cand.w > best.w) return cand;
    if (cand.w < best.w) return best;
    return cand.o > best.o ? cand : best; // tie breaker
  }, pool[0]);
  
  return pick(chosen, cands);
}

function pick(chosen: Cand, all: Cand[]): TransitionDecision {
  return { outcome: chosen.o, weights: all, reason: chosen.reason ?? "" };
}
