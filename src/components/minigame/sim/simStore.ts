/**
 * Historical Simulation — store/reducer
 *
 * Now wired with the contradiction pressure engine:
 *   • derived multi-layer pressures
 *   • tier-based option locking
 *   • tier-driven decay (stability/production)
 *   • option risk dampening at high tiers
 *   • contradiction event rolls injected between decisions
 */
import type { EraId } from "@/data/eras";
import {
  STAGES,
  TECH_TREE,
  classifyEnding,
  type Decision,
  type DecisionOption,
  type Insight,
  type MetricKey,
  type OptionTag,
  type PerspectiveId,
  type SimStage,
  PERSPECTIVES,
} from "@/data/historicalSim";
import {
  resolveContradiction,
  computeLockedOptionIds,
  applyOptionRisk,
  rollContradictionEvent,
  EMPTY_PRESSURES,
  resolveTier,
  type Pressures,
  type TierId,
  type ContradictionEvent,
} from "@/data/contradiction";
import {
  decayMemory,
  pushMemory,
  type MemoryTag,
  type MemoryTagId,
} from "@/data/memory";
import { resolveTransition } from "@/data/transition/resolver";
import type { PathOutcome } from "@/data/transition/outcomes";
import { pickCompanionLine, type CompanionLine, type CompanionTrigger } from "@/data/companion/lines";

export type SimPhase =
  | "perspective"
  | "intro"
  | "playing"
  | "consequence"
  | "revolution"
  | "finale";

export interface ActiveEvent {
  id: string;
  title: string;
  narrator: string;
  accent?: ContradictionEvent["accent"];
  decisionTtl: number; // decisions remaining the banner stays visible
}

export interface SimState {
  perspective: PerspectiveId;
  phase: SimPhase;
  stageIdx: number;
  decisionIdx: number;
  metrics: Record<MetricKey, number>;
  unlockedTech: string[];
  insights: Insight[];
  log: { stage: EraId; optionLabel: string; chain: string[]; tag?: OptionTag }[];
  lastChoice: {
    option: DecisionOption;
    deltas: Partial<Record<MetricKey, number>>;
    newlyUnlocked: string[];
    riskApplied: boolean;
    triggeredEvent: ActiveEvent | null;
  } | null;
  revolutionsBurned: number;
  progressiveCount: number;
  stagesCompleted: number;

  /* ───── Contradiction engine state ───── */
  contradictionTier: TierId;
  pressures: Pressures;
  tagCounts: Partial<Record<OptionTag, number>>;
  activeEvents: ActiveEvent[];
  eventCooldowns: Record<string, number>;
  lockedOptionIds: string[];
  lockReasons: Record<string, string>;
  ruptureStreak: number;
}

export type SimAction =
  | { type: "choosePerspective"; id: PerspectiveId }
  | { type: "startStage" }
  | { type: "decide"; option: DecisionOption }
  | { type: "ackConsequence" }
  | { type: "ackRevolution" }
  | { type: "restart" };

export const ALL_METRICS: MetricKey[] = [
  "production",
  "stability",
  "tech",
  "contradiction",
  "revolution",
];

function clamp(v: number) {
  return Math.max(0, Math.min(100, v));
}

function applyBias(
  delta: Partial<Record<MetricKey, number>>,
  bias: Partial<Record<MetricKey, number>>,
) {
  const out: Partial<Record<MetricKey, number>> = {};
  for (const k of ALL_METRICS) {
    const base = delta[k] ?? 0;
    if (base === 0) continue;
    const factor = bias[k] ?? 1;
    out[k] = Math.round(base * factor);
  }
  return out;
}

function applyMetrics(
  metrics: Record<MetricKey, number>,
  delta: Partial<Record<MetricKey, number>>,
): Record<MetricKey, number> {
  const next = { ...metrics };
  for (const k of ALL_METRICS) {
    next[k] = clamp(next[k] + (delta[k] ?? 0));
  }
  return next;
}

function baseMetricsFor(stage: SimStage): Record<MetricKey, number> {
  return {
    production: stage.baseMetrics.production ?? 0,
    stability: stage.baseMetrics.stability ?? 50,
    tech: stage.baseMetrics.tech ?? 0,
    contradiction: stage.baseMetrics.contradiction ?? 10,
    revolution: stage.baseMetrics.revolution ?? 0,
  };
}

function recomputeLocks(state: SimState): { lockedOptionIds: string[]; lockReasons: Record<string, string> } {
  const stage = STAGES[state.stageIdx];
  const decision = stage?.decisions[state.decisionIdx];
  const tier = resolveTier(state.metrics.contradiction);
  const { lockedIds, reasons } = computeLockedOptionIds(decision, tier);
  return { lockedOptionIds: lockedIds, lockReasons: reasons };
}

export function initialState(): SimState {
  const metrics = baseMetricsFor(STAGES[0]);
  return {
    perspective: "historian",
    phase: "perspective",
    stageIdx: 0,
    decisionIdx: 0,
    metrics,
    unlockedTech: [],
    insights: [],
    log: [],
    lastChoice: null,
    revolutionsBurned: 0,
    progressiveCount: 0,
    stagesCompleted: 0,
    contradictionTier: resolveTier(metrics.contradiction).id,
    pressures: EMPTY_PRESSURES,
    tagCounts: {},
    activeEvents: [],
    eventCooldowns: {},
    lockedOptionIds: [],
    lockReasons: {},
    ruptureStreak: 0,
  };
}

export function reducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case "choosePerspective":
      return { ...state, perspective: action.id, phase: "intro" };

    case "startStage": {
      const next = { ...state, phase: "playing" as const };
      const { lockedOptionIds, lockReasons } = recomputeLocks(next);
      return { ...next, lockedOptionIds, lockReasons };
    }

    case "decide": {
      const stage = STAGES[state.stageIdx];
      const bias = PERSPECTIVES.find((p) => p.id === state.perspective)?.bias ?? {};
      const biased = applyBias(action.option.effect, bias);

      // Current tier (before this decision applies) gates risk + decay
      const currentTier = resolveTier(state.metrics.contradiction);
      const risked = applyOptionRisk(biased, currentTier) as Partial<Record<MetricKey, number>>;
      const riskApplied =
        currentTier.optionRiskFactor > 0 &&
        ALL_METRICS.some((k) => (risked[k] ?? 0) !== (biased[k] ?? 0));

      // Apply tier decay on top of the choice
      const decay: Partial<Record<MetricKey, number>> = {
        stability: -currentTier.stabilityDecay,
        production: -currentTier.productionDecay,
      };

      let nextMetrics = applyMetrics(state.metrics, risked);
      nextMetrics = applyMetrics(nextMetrics, decay);

      // Tag tracking
      const tag = (action.option.tag ?? "neutral") as OptionTag;
      const tagCounts = { ...state.tagCounts, [tag]: (state.tagCounts[tag] ?? 0) + 1 };

      // Insights + tech
      const insight = action.option.insight
        ? stage.insights.find((i) => i.id === action.option.insight)
        : null;
      const newTech = (action.option.unlocks ?? []).filter(
        (t) => !state.unlockedTech.includes(t),
      );

      // Recompute pressures with new metrics
      const progressiveCount =
        state.progressiveCount + (action.option.progressive ? 1 : 0);
      const { tier: newTier, pressures } = resolveContradiction({
        metrics: nextMetrics,
        perspective: state.perspective,
        tagCounts,
        progressiveCount,
        eventCooldowns: state.eventCooldowns,
      });

      // Roll contradiction event
      const rolled = rollContradictionEvent(newTier, {
        metrics: nextMetrics,
        perspective: state.perspective,
        tagCounts,
        progressiveCount,
        eventCooldowns: state.eventCooldowns,
        pressures,
      });

      let activeEvents = state.activeEvents;
      let eventCooldowns = state.eventCooldowns;
      let triggeredEvent: ActiveEvent | null = null;
      let metricsAfterEvent = nextMetrics;
      let pressuresAfterEvent = pressures;

      if (rolled) {
        metricsAfterEvent = applyMetrics(nextMetrics, rolled.effect);
        const narratorLine =
          rolled.narrator[state.perspective] ??
          rolled.narrator.historian ??
          Object.values(rolled.narrator)[0] ??
          rolled.title;
        triggeredEvent = {
          id: rolled.id,
          title: rolled.title,
          narrator: narratorLine,
          accent: rolled.accent,
          decisionTtl: 1,
        };
        activeEvents = [triggeredEvent, ...state.activeEvents];
        eventCooldowns = { ...state.eventCooldowns, [rolled.id]: rolled.cooldown };

        // Recompute pressures including event effect
        pressuresAfterEvent = resolveContradiction({
          metrics: metricsAfterEvent,
          perspective: state.perspective,
          tagCounts,
          progressiveCount,
          eventCooldowns,
        }).pressures;

        if (rolled.pressureImpact) {
          pressuresAfterEvent = { ...pressuresAfterEvent };
          for (const [k, v] of Object.entries(rolled.pressureImpact)) {
            const key = k as keyof Pressures;
            pressuresAfterEvent[key] = clamp(pressuresAfterEvent[key] + (v ?? 0));
          }
        }
      }

      const finalTier = resolveTier(metricsAfterEvent.contradiction);
      const ruptureStreak = finalTier.id === "rupture" ? state.ruptureStreak + 1 : 0;

      const deltas = ALL_METRICS.reduce<Partial<Record<MetricKey, number>>>((acc, k) => {
        const d = metricsAfterEvent[k] - state.metrics[k];
        if (d !== 0) acc[k] = d;
        return acc;
      }, {});

      return {
        ...state,
        metrics: metricsAfterEvent,
        unlockedTech: [...state.unlockedTech, ...newTech],
        insights:
          insight && !state.insights.find((i) => i.id === insight.id)
            ? [...state.insights, insight]
            : state.insights,
        log: [
          ...state.log,
          {
            stage: stage.id,
            optionLabel: action.option.label,
            chain: action.option.causeChain,
            tag,
          },
        ],
        lastChoice: {
          option: action.option,
          deltas,
          newlyUnlocked: newTech,
          riskApplied,
          triggeredEvent,
        },
        progressiveCount,
        contradictionTier: finalTier.id,
        pressures: pressuresAfterEvent,
        tagCounts,
        activeEvents,
        eventCooldowns,
        ruptureStreak,
        phase: "consequence",
      };
    }

    case "ackConsequence": {
      const stage = STAGES[state.stageIdx];
      const tier = resolveTier(state.metrics.contradiction);

      // Decrement event cooldowns & ttl
      const eventCooldowns = Object.fromEntries(
        Object.entries(state.eventCooldowns).map(([k, v]) => [k, Math.max(0, v - 1)]),
      );
      const activeEvents = state.activeEvents
        .map((e) => ({ ...e, decisionTtl: e.decisionTtl - 1 }))
        .filter((e) => e.decisionTtl > 0);

      // Forced revolution: 2 decisions stuck in rupture tier
      const forceRevolution = state.ruptureStreak >= 2;

      const revoTriggered =
        forceRevolution ||
        state.metrics.revolution >= stage.revolutionThreshold ||
        (state.metrics.contradiction >= stage.contradictionTrigger &&
          state.decisionIdx + 1 >= stage.decisions.length);

      const nextIdx = state.decisionIdx + 1;
      const stageDone = nextIdx >= stage.decisions.length;

      if (revoTriggered || stageDone) {
        const isLast = state.stageIdx >= STAGES.length - 1;
        return {
          ...state,
          eventCooldowns,
          activeEvents,
          phase: isLast ? "finale" : "revolution",
          revolutionsBurned:
            state.revolutionsBurned +
            (state.metrics.revolution >= stage.revolutionThreshold || forceRevolution ? 1 : 0),
          stagesCompleted: state.stagesCompleted + 1,
          decisionIdx: nextIdx,
          lastChoice: null,
          ruptureStreak: 0,
        };
      }

      const next: SimState = {
        ...state,
        eventCooldowns,
        activeEvents,
        contradictionTier: tier.id,
        phase: "playing",
        decisionIdx: nextIdx,
        lastChoice: null,
      };
      const { lockedOptionIds, lockReasons } = recomputeLocks(next);
      return { ...next, lockedOptionIds, lockReasons };
    }

    case "ackRevolution": {
      const nextStageIdx = state.stageIdx + 1;
      if (nextStageIdx >= STAGES.length) {
        return { ...state, phase: "finale" };
      }
      const nextStage = STAGES[nextStageIdx];
      const carriedBase = baseMetricsFor(nextStage);
      const techBonus = Math.min(
        20,
        state.unlockedTech
          .map((id) => TECH_TREE.find((t) => t.id === id))
          .filter(Boolean)
          .reduce((acc, t) => acc + (t!.effect.tech ?? 0), 0) / 8,
      );
      const carried = {
        ...carriedBase,
        tech: clamp(carriedBase.tech + techBonus),
      };
      return {
        ...state,
        stageIdx: nextStageIdx,
        decisionIdx: 0,
        metrics: carried,
        contradictionTier: resolveTier(carried.contradiction).id,
        pressures: EMPTY_PRESSURES,
        activeEvents: [],
        lockedOptionIds: [],
        lockReasons: {},
        ruptureStreak: 0,
        phase: "intro",
      };
    }

    case "restart":
      return initialState();

    default:
      return state;
  }
}

export function finalize(state: SimState) {
  return classifyEnding({
    ...state.metrics,
    stagesCompleted: state.stagesCompleted,
    revolutionsBurned: state.revolutionsBurned,
    progressiveCount: state.progressiveCount,
  });
}
