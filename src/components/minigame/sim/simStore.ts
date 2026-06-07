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
import { resolveOptions } from "@/data/perspective/perspectiveConfig";
import { resolveInterludeOptions, type InterludeKind } from "@/data/interludes";

export type SimPhase =
  | "perspective"
  | "intro"
  | "playing"
  | "consequence"
  | "interlude"
  | "transition"
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

  /* ───── History pressure layer (NEW) ───── */
  memory: MemoryTag[];
  stagePath: PathOutcome[];     // outcome of each completed stage
  stageFreezeCount: number;     // freezes in the current stage (anti-loop)
  reformLocked: boolean;        // true after suppress — reform tag banned
  lastTransition: PathOutcome | null;
  pendingInterlude: InterludeKind | null;
  endingId: string | null;

  /* ───── Companion presence (NEW) ───── */
  companionSaid: string[];      // ids of lines already said
  companionLine: CompanionLine | null;
}

export type SimAction =
  | { type: "choosePerspective"; id: PerspectiveId }
  | { type: "startStage" }
  | { type: "decide"; option: DecisionOption }
  | { type: "ackConsequence" }
  | { type: "ackTransition" }
  | { type: "ackRevolution" }
  | { type: "resolveInterlude"; option: DecisionOption }
  | { type: "ackCompanion" }
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

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRng(seed: string): () => number {
  let s = hashString(seed) || 0x9e3779b9;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function decisionSeed(state: SimState, optionId: string) {
  const metrics = ALL_METRICS.map((k) => `${k}:${Math.round(state.metrics[k])}`).join(",");
  const path = state.log.map((entry) => `${entry.stage}:${entry.optionLabel}:${entry.tag ?? ""}`).join("|");
  return [
    state.perspective,
    state.stageIdx,
    state.decisionIdx,
    state.stagesCompleted,
    metrics,
    path,
    optionId,
  ].join("::");
}

function resolveStateContradiction(
  metrics: Record<MetricKey, number>,
  perspective: PerspectiveId,
  tagCounts: Partial<Record<OptionTag, number>>,
  progressiveCount: number,
  eventCooldowns: Record<string, number>,
  eraId?: EraId,
) {
  return resolveContradiction({
    metrics,
    perspective,
    tagCounts,
    progressiveCount,
    eventCooldowns,
    eraId,
  });
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

/**
 * Foundational techs per stage — techPool entries that NO option's `unlocks`
 * field grants. They represent the baseline LLSX of the era (đồ đá cho cộng
 * sản nguyên thuỷ, đồng cho chiếm hữu nô lệ, cày nặng + cối xay nước cho
 * phong kiến, máy hơi nước + điện cho tư bản, năng lượng tái tạo cho XHCN).
 * Without auto-grant chúng sẽ vĩnh viễn bị khoá. Tính một lần ở module load.
 */
const BASELINE_TECH_BY_STAGE: Record<string, string[]> = (() => {
  const everUnlockable = new Set<string>();
  for (const s of STAGES) {
    for (const d of s.decisions) {
      for (const o of d.options) {
        for (const t of o.unlocks ?? []) everUnlockable.add(t);
      }
    }
  }
  const out: Record<string, string[]> = {};
  for (const s of STAGES) {
    out[s.id] = s.techPool.filter((t) => !everUnlockable.has(t));
  }
  return out;
})();

function grantBaselineTech(stageIdx: number, current: string[]): string[] {
  const stage = STAGES[stageIdx];
  if (!stage) return current;
  const baseline = BASELINE_TECH_BY_STAGE[stage.id] ?? [];
  if (!baseline.length) return current;
  const set = new Set(current);
  for (const t of baseline) set.add(t);
  return Array.from(set);
}

function recomputeLocks(state: SimState): { lockedOptionIds: string[]; lockReasons: Record<string, string> } {
  const stage = STAGES[state.stageIdx];
  const decision = stage?.decisions[state.decisionIdx];
  const tier = resolveTier(state.metrics.contradiction);
  const resolvedOptions = decision ? resolveOptions(decision, state.perspective, tier.id) : [];
  const decisionForLocks = decision ? { ...decision, options: resolvedOptions } : undefined;
  const { lockedIds, reasons } = computeLockedOptionIds(decisionForLocks, tier);
  // Add reformLocked: ban reform-tagged options after a suppress outcome
  if (state.reformLocked && decisionForLocks) {
    for (const opt of resolvedOptions) {
      if (opt.tag === "reform" && !lockedIds.includes(opt.id)) {
        lockedIds.push(opt.id);
        reasons[opt.id] = "Cánh cửa cải cách đã bị niêm phong sau đợt đàn áp.";
      }
    }
  }
  if (decisionForLocks && resolvedOptions.length > 0 && lockedIds.length >= resolvedOptions.length) {
    const fallback =
      resolvedOptions.find((opt) => opt.tag && ["uprising", "repression", "emergency"].includes(opt.tag)) ??
      resolvedOptions[0];
    const fallbackIdx = lockedIds.indexOf(fallback.id);
    if (fallbackIdx >= 0) lockedIds.splice(fallbackIdx, 1);
    delete reasons[fallback.id];
  }
  return { lockedOptionIds: lockedIds, lockReasons: reasons };
}

export function initialState(): SimState {
  const metrics = baseMetricsFor(STAGES[0]);
  const eventCooldowns: Record<string, number> = {};
  const { tier, pressures } = resolveStateContradiction(
    metrics,
    "historian",
    {},
    0,
    eventCooldowns,
    STAGES[0].id,
  );
  return {
    perspective: "historian",
    phase: "perspective",
    stageIdx: 0,
    decisionIdx: 0,
    metrics,
    unlockedTech: grantBaselineTech(0, []),
    insights: [],
    log: [],
    lastChoice: null,
    revolutionsBurned: 0,
    progressiveCount: 0,
    stagesCompleted: 0,
    contradictionTier: tier.id,
    pressures,
    tagCounts: {},
    activeEvents: [],
    eventCooldowns,
    lockedOptionIds: [],
    lockReasons: {},
    ruptureStreak: 0,
    memory: [],
    stagePath: [],
    stageFreezeCount: 0,
    reformLocked: false,
    lastTransition: null,
    pendingInterlude: null,
    endingId: null,
    companionSaid: [],
    companionLine: null,
  };
}

/** Helpers for triggering companion lines from inside the reducer. */
function withCompanion(state: SimState, trigger: CompanionTrigger): SimState {
  const said = new Set(state.companionSaid);
  const eraId = STAGES[state.stageIdx]?.id;
  const line = pickCompanionLine(state.perspective, trigger, said, eraId);
  if (!line) return state;
  return {
    ...state,
    companionLine: line,
    companionSaid: said.has(line.id) ? state.companionSaid : [...state.companionSaid, line.id],
  };
}


/** Emit memory tags based on a choice's tag + current pressures. */
function memoryFromChoice(
  state: SimState,
  tag: OptionTag,
  stageId: string,
): MemoryTagId | null {
  if (tag === "repression" && state.pressures.repression > 55) return "mass_repression";
  if (tag === "reform") return "successful_reform";
  if (tag === "uprising" && state.pressures.organization > 55) return "general_strike";
  if (tag === "uprising") return "underground_network";
  if (tag === "concession" && state.metrics.stability < 40) return "betrayed_promise";
  return null;
}

function memoryFromInterlude(kind: InterludeKind, tag: OptionTag): MemoryTagId | null {
  if (kind === "dark_age") {
    if (tag === "document") return "collapse_scar";
    if (tag === "uprising") return "underground_network";
    if (tag === "concession" || tag === "reform") return "successful_reform";
  }
  if (kind === "consolidation") {
    if (tag === "uprising") return "general_strike";
    if (tag === "reform" || tag === "document") return "successful_reform";
    if (tag === "reactionary") return "betrayed_promise";
    if (tag === "emergency") return "mass_repression";
  }
  return null;
}

export function reducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case "choosePerspective": {
      const stage = STAGES[state.stageIdx];
      const { tier, pressures } = resolveStateContradiction(
        state.metrics,
        action.id,
        state.tagCounts,
        state.progressiveCount,
        state.eventCooldowns,
        stage?.id,
      );
      return {
        ...state,
        perspective: action.id,
        contradictionTier: tier.id,
        pressures,
        phase: "intro",
      };
    }

    case "startStage": {
      const stage = STAGES[state.stageIdx];
      const { tier, pressures } = resolveStateContradiction(
        state.metrics,
        state.perspective,
        state.tagCounts,
        state.progressiveCount,
        state.eventCooldowns,
        stage?.id,
      );
      const withComp = withCompanion(
        { ...state, contradictionTier: tier.id, pressures },
        { kind: "stage_start" },
      );
      const next = { ...withComp, phase: "playing" as const };
      const { lockedOptionIds, lockReasons } = recomputeLocks(next);
      return { ...next, lockedOptionIds, lockReasons };
    }

    case "ackCompanion":
      return { ...state, companionLine: null };


    case "decide": {
      const stage = STAGES[state.stageIdx];
      const decision = stage?.decisions[state.decisionIdx];
      if (!decision) return state;
      const availableOptions = resolveOptions(decision, state.perspective, state.contradictionTier);
      const option = availableOptions.find((opt) => opt.id === action.option.id);
      if (!option || state.lockedOptionIds.includes(option.id)) return state;

      const bias = PERSPECTIVES.find((p) => p.id === state.perspective)?.bias ?? {};
      const biased = applyBias(option.effect, bias);

      // Current tier (before this decision applies) gates risk + decay
      const currentTier = resolveTier(state.metrics.contradiction);
      const seedBase = decisionSeed(state, option.id);
      const risked = applyOptionRisk(
        biased,
        currentTier,
        seededRng(`${seedBase}:risk`),
      ) as Partial<Record<MetricKey, number>>;
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
      const tag = (option.tag ?? "neutral") as OptionTag;
      const tagCounts = { ...state.tagCounts, [tag]: (state.tagCounts[tag] ?? 0) + 1 };

      // Insights + tech
      const insight = option.insight
        ? stage.insights.find((i) => i.id === option.insight)
        : null;
      const newTech = (option.unlocks ?? []).filter(
        (t) => !state.unlockedTech.includes(t),
      );

      // Recompute pressures with new metrics
      const progressiveCount =
        state.progressiveCount + (option.progressive ? 1 : 0);
      const eraId = STAGES[state.stageIdx]?.id;
      const { tier: newTier, pressures } = resolveContradiction({
        metrics: nextMetrics,
        perspective: state.perspective,
        tagCounts,
        progressiveCount,
        eventCooldowns: state.eventCooldowns,
        eraId,
      });

      // Roll contradiction event
      const rolled = rollContradictionEvent(newTier, {
        metrics: nextMetrics,
        perspective: state.perspective,
        tagCounts,
        progressiveCount,
        eventCooldowns: state.eventCooldowns,
        eraId,
        pressures,
      }, seededRng(`${seedBase}:event`));

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
          eraId,
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

      // Historical memory: emit tag if this choice + state warrant it
      const memTagId = memoryFromChoice({ ...state, pressures: pressuresAfterEvent, metrics: metricsAfterEvent }, tag, stage.id);
      const memory = memTagId
        ? pushMemory(state.memory, { id: memTagId, stage: stage.id, perspective: state.perspective })
        : state.memory;

      let result: SimState = {
        ...state,
        memory,
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
            optionLabel: option.label,
            chain: option.causeChain,
            tag,
          },
        ],
        lastChoice: {
          option,
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

      // Fire companion line on tier crossing into Unstable+
      const wasHigh = state.contradictionTier === "unstable" || state.contradictionTier === "emergency" || state.contradictionTier === "rupture";
      const isHigh  = finalTier.id === "unstable" || finalTier.id === "emergency" || finalTier.id === "rupture";
      if (!wasHigh && isHigh) result = withCompanion(result, { kind: "high_pressure" });
      return result;
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

      const nextIdx = state.decisionIdx + 1;
      const stageDone = nextIdx >= stage.decisions.length;
      const forceRevolution = state.ruptureStreak >= 2;

      // Mid-stage: just go to next decision (no transition engine yet)
      if (!stageDone && !forceRevolution) {
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

      // Stage end → consult transition engine
      const decision = resolveTransition(state);
      let outcome = decision.outcome;
      if (forceRevolution) outcome = "rupture";

      // Companion + memory hooks per outcome
      const memTag: MemoryTagId | null =
        outcome === "rupture"         ? "rupture_legacy" :
        outcome === "failed_uprising" ? "failed_revolt" :
        outcome === "collapse"        ? "collapse_scar" :
        outcome === "suppress"        ? "mass_repression" :
        outcome === "freeze"          ? "stagnation_decade" :
        null;
      const memory = memTag
        ? pushMemory(state.memory, { id: memTag, stage: stage.id, perspective: state.perspective })
        : state.memory;

      const base: SimState = {
        ...state,
        eventCooldowns,
        activeEvents,
        memory,
        lastTransition: outcome,
        stagePath: [...state.stagePath, outcome],
        lastChoice: null,
        ruptureStreak: 0,
      };
      const companionTrigger: CompanionTrigger =
        outcome === "rupture" ? { kind: "rupture" } : { kind: "outcome", outcome };
      const withOutComp = withCompanion(base, companionTrigger);

      const isLast = state.stageIdx >= STAGES.length - 1;

      // RUPTURE → revolution cinematic, ackRevolution will advance
      if (outcome === "rupture") {
        return {
          ...withOutComp,
          phase: isLast ? "finale" : "revolution",
          revolutionsBurned: state.revolutionsBurned + 1,
          stagesCompleted: state.stagesCompleted + 1,
          decisionIdx: nextIdx,
        };
      }

      // FREEZE / FAILED UPRISING → repeat current stage (after transition screen)
      if (outcome === "freeze" || outcome === "failed_uprising") {
        const penalty: Partial<Record<MetricKey, number>> =
          outcome === "failed_uprising"
            ? { stability: -8, contradiction: 6, revolution: -20 }
            : { production: -8, tech: -3, contradiction: -4 };
        const newMetrics = applyMetrics(state.metrics, penalty);
        const next: SimState = {
          ...withOutComp,
          metrics: newMetrics,
          stageFreezeCount: outcome === "freeze" ? state.stageFreezeCount + 1 : state.stageFreezeCount,
          decisionIdx: 0,
          phase: "transition",
          contradictionTier: resolveTier(newMetrics.contradiction).id,
          stagesCompleted: state.stagesCompleted,
        };
        return next;
      }

      // COLLAPSE → heavy penalty + jump to next stage (or finale), via transition screen
      if (outcome === "collapse") {
        if (isLast) return { ...withOutComp, phase: "transition", stagesCompleted: state.stagesCompleted + 1 };
        const nextStage = STAGES[state.stageIdx + 1];
        const carriedBase = baseMetricsFor(nextStage);
        const collapsed = {
          ...carriedBase,
          stability: Math.max(15, carriedBase.stability - 25),
          production: Math.max(5, carriedBase.production - 20),
          tech: Math.max(0, carriedBase.tech - 10),
        };
        return {
          ...withOutComp,
          stageIdx: state.stageIdx + 1,
          stageFreezeCount: 0,
          decisionIdx: 0,
          metrics: collapsed,
          contradictionTier: resolveTier(collapsed.contradiction).id,
          pressures: EMPTY_PRESSURES,
          stagesCompleted: state.stagesCompleted + 1,
          unlockedTech: grantBaselineTech(state.stageIdx + 1, state.unlockedTech),
          phase: "transition",
        };
      }

      // SUPPRESS → advance, lock reforms for rest of run, via transition screen
      if (outcome === "suppress") {
        if (isLast) return { ...withOutComp, phase: "transition", reformLocked: true, stagesCompleted: state.stagesCompleted + 1 };
        const nextStage = STAGES[state.stageIdx + 1];
        const carriedBase = baseMetricsFor(nextStage);
        const carried = { ...carriedBase, stability: Math.min(85, carriedBase.stability + 15) };
        return {
          ...withOutComp,
          stageIdx: state.stageIdx + 1,
          stageFreezeCount: 0,
          decisionIdx: 0,
          metrics: carried,
          contradictionTier: resolveTier(carried.contradiction).id,
          pressures: EMPTY_PRESSURES,
          reformLocked: true,
          stagesCompleted: state.stagesCompleted + 1,
          unlockedTech: grantBaselineTech(state.stageIdx + 1, state.unlockedTech),
          phase: "transition",
        };
      }

      // EVOLVE → run cinematic, then ackRevolution advances to next era
      if (isLast) {
        return { ...withOutComp, phase: "finale", stagesCompleted: state.stagesCompleted + 1 };
      }
      return {
        ...withOutComp,
        phase: "revolution",
        stagesCompleted: state.stagesCompleted + 1,
        decisionIdx: nextIdx,
      };

    }

    case "ackTransition": {
      // After the transition narration screen, decide what comes next.
      // If we already finished the final stage and outcome was terminal
      // (collapse/suppress on final era), go to finale; else play the new stage intro.
      const terminal =
        state.stagesCompleted >= STAGES.length &&
        (state.lastTransition === "collapse" || state.lastTransition === "suppress");
      if (terminal) return { ...state, phase: "finale", pendingInterlude: null };
      if (state.lastTransition === "collapse") {
        return { ...state, phase: "interlude", pendingInterlude: "dark_age" };
      }
      return { ...state, phase: "intro", pendingInterlude: null };
    }

    case "ackRevolution": {
      // Rupture branch — advance to next era after the cinematic.
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
      const carried = { ...carriedBase, tech: clamp(carriedBase.tech + techBonus) };
      const memory = decayMemory(state.memory);
      return {
        ...state,
        stageIdx: nextStageIdx,
        stageFreezeCount: 0,
        decisionIdx: 0,
        metrics: carried,
        contradictionTier: resolveTier(carried.contradiction).id,
        pressures: EMPTY_PRESSURES,
        activeEvents: [],
        lockedOptionIds: [],
        lockReasons: {},
        ruptureStreak: 0,
        memory,
        unlockedTech: grantBaselineTech(nextStageIdx, state.unlockedTech),
        pendingInterlude: state.lastTransition === "rupture" ? "consolidation" : null,
        phase: state.lastTransition === "rupture" ? "interlude" : "intro",
      };
    }

    case "resolveInterlude": {
      const kind = state.pendingInterlude;
      if (state.phase !== "interlude" || !kind) return state;
      const stage = STAGES[state.stageIdx];
      if (!stage) return state;
      const option = resolveInterludeOptions(kind, state.perspective).find(
        (opt) => opt.id === action.option.id,
      );
      if (!option) return state;

      const tag = (option.tag ?? "neutral") as OptionTag;
      const metrics = applyMetrics(state.metrics, option.effect);
      const tagCounts = { ...state.tagCounts, [tag]: (state.tagCounts[tag] ?? 0) + 1 };
      const progressiveCount = state.progressiveCount + (option.progressive ? 1 : 0);
      const { tier, pressures } = resolveContradiction({
        metrics,
        perspective: state.perspective,
        tagCounts,
        progressiveCount,
        eventCooldowns: state.eventCooldowns,
        eraId: stage.id,
      });
      const memTagId = memoryFromInterlude(kind, tag);
      const memory = memTagId
        ? pushMemory(state.memory, {
            id: memTagId,
            stage: stage.id,
            perspective: state.perspective,
          })
        : state.memory;

      return {
        ...state,
        metrics,
        memory,
        tagCounts,
        progressiveCount,
        pressures,
        contradictionTier: tier.id,
        pendingInterlude: null,
        lastChoice: null,
        lockedOptionIds: [],
        lockReasons: {},
        log: [
          ...state.log,
          {
            stage: stage.id,
            optionLabel: option.label,
            chain: option.causeChain,
            tag,
          },
        ],
        phase: "intro",
      };
    }


    case "restart":
      return initialState();

    default:
      return state;
  }
}

