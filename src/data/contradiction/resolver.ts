/**
 * Contradiction Resolver — central effect engine.
 * Given a SimState-ish snapshot returns: active tier, derived pressures,
 * locked option ids for the current decision, and (optionally) an event roll.
 */
import type { EraId } from "../eras";
import type { Decision, DecisionOption, PerspectiveId } from "../historicalSim";
import { derivePressures, type Pressures } from "./pressures";
import { CONTRADICTION_EVENTS, type ContradictionEvent } from "./events";
import {
  resolveTier,
  tierIndex,
  tierLockReason,
  type OptionTag,
  type Tier,
} from "./thresholds";

export interface ResolverInput {
  metrics: { production: number; stability: number; contradiction: number; revolution: number; tech: number };
  perspective: PerspectiveId;
  tagCounts: Partial<Record<string, number>>;
  progressiveCount: number;
  eventCooldowns: Record<string, number>;
  /** Current era — gates era-specific contradiction events. */
  eraId?: EraId;
}

export interface ResolverOutput {
  tier: Tier;
  pressures: Pressures;
}

export function resolveContradiction(input: ResolverInput): ResolverOutput {
  const tier = resolveTier(input.metrics.contradiction);
  const pressures = derivePressures(input);
  return { tier, pressures };
}

/** Determine which option ids are locked under the current tier. */
export function computeLockedOptionIds(
  decision: Decision | undefined,
  tier: Tier,
): { lockedIds: string[]; reasons: Record<string, string> } {
  if (!decision) return { lockedIds: [], reasons: {} };
  const lockedIds: string[] = [];
  const reasons: Record<string, string> = {};
  for (const opt of decision.options) {
    const tag = (opt as DecisionOption & { tag?: OptionTag }).tag ?? "neutral";
    const reason = tierLockReason(tier, tag);
    if (reason) {
      lockedIds.push(opt.id);
      reasons[opt.id] = reason;
    }
  }
  return { lockedIds, reasons };
}

/** Apply the per-tier option risk factor: dampens positive metric gains
 *  (stability/production/tech) — never reduces contradiction/revolution. */
export function applyOptionRisk(
  delta: Partial<Record<string, number>>,
  tier: Tier,
  rng: () => number = Math.random,
): Partial<Record<string, number>> {
  if (tier.optionRiskFactor <= 0) return delta;
  const out: Partial<Record<string, number>> = { ...delta };
  for (const k of ["production", "stability", "tech"] as const) {
    const v = out[k];
    if (v && v > 0) {
      const dampen = 1 - tier.optionRiskFactor * rng();
      out[k] = Math.round(v * Math.max(0, dampen));
    }
  }
  return out;
}

/** Roll for a contradiction event. Returns the event or null. */
export function rollContradictionEvent(
  tier: Tier,
  ctx: ResolverInput & { pressures: Pressures },
  rng: () => number = Math.random,
): ContradictionEvent | null {
  if (tier.eventChance <= 0) return null;
  if (rng() > tier.eventChance) return null;
  const eligible = CONTRADICTION_EVENTS.filter((ev) => {
    if ((ctx.eventCooldowns[ev.id] ?? 0) > 0) return false;
    if (tierIndex(tier.id) < tierIndex(ev.minTier)) return false;
    if (
      ev.condition &&
      !ev.condition({ metrics: ctx.metrics, pressures: ctx.pressures, perspective: ctx.perspective })
    ) {
      return false;
    }
    return true;
  });
  if (!eligible.length) return null;

  const total = eligible.reduce((s, e) => s + e.weight, 0);
  let pick = rng() * total;
  for (const ev of eligible) {
    pick -= ev.weight;
    if (pick <= 0) return ev;
  }
  return eligible[eligible.length - 1];
}
