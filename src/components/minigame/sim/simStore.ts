/**
 * Historical Simulation — store/reducer
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
  type PerspectiveId,
  type SimStage,
  PERSPECTIVES,
} from "@/data/historicalSim";

export type SimPhase =
  | "perspective" // chọn giai cấp
  | "intro" // intro stage
  | "playing" // đang ra quyết định
  | "consequence" // hiển thị cause→effect
  | "revolution" // transition cinematic
  | "finale";

export interface SimState {
  perspective: PerspectiveId;
  phase: SimPhase;
  stageIdx: number;
  decisionIdx: number; // index trong stage.decisions
  metrics: Record<MetricKey, number>;
  unlockedTech: string[];
  insights: Insight[];
  log: { stage: EraId; optionLabel: string; chain: string[] }[];
  lastChoice: { option: DecisionOption; deltas: Partial<Record<MetricKey, number>>; newlyUnlocked: string[] } | null;
  revolutionsBurned: number;
  progressiveCount: number;
  stagesCompleted: number;
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

export function initialState(): SimState {
  return {
    perspective: "historian",
    phase: "perspective",
    stageIdx: 0,
    decisionIdx: 0,
    metrics: baseMetricsFor(STAGES[0]),
    unlockedTech: [],
    insights: [],
    log: [],
    lastChoice: null,
    revolutionsBurned: 0,
    progressiveCount: 0,
    stagesCompleted: 0,
  };
}

export function reducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case "choosePerspective":
      return { ...state, perspective: action.id, phase: "intro" };

    case "startStage":
      return { ...state, phase: "playing" };

    case "decide": {
      const stage = STAGES[state.stageIdx];
      const bias = PERSPECTIVES.find((p) => p.id === state.perspective)?.bias ?? {};
      const biased = applyBias(action.option.effect, bias);
      const nextMetrics = applyMetrics(state.metrics, biased);
      const insight = action.option.insight
        ? stage.insights.find((i) => i.id === action.option.insight)
        : null;
      const newTech = (action.option.unlocks ?? []).filter(
        (t) => !state.unlockedTech.includes(t),
      );
      return {
        ...state,
        metrics: nextMetrics,
        unlockedTech: [...state.unlockedTech, ...newTech],
        insights:
          insight && !state.insights.find((i) => i.id === insight.id)
            ? [...state.insights, insight]
            : state.insights,
        log: [
          ...state.log,
          { stage: stage.id, optionLabel: action.option.label, chain: action.option.causeChain },
        ],
        lastChoice: { option: action.option, deltas: biased, newlyUnlocked: newTech },
        progressiveCount: state.progressiveCount + (action.option.progressive ? 1 : 0),
        phase: "consequence",
      };
    }

    case "ackConsequence": {
      const stage = STAGES[state.stageIdx];
      // Check revolution trigger
      const revoTriggered =
        state.metrics.revolution >= stage.revolutionThreshold ||
        (state.metrics.contradiction >= stage.contradictionTrigger &&
          state.decisionIdx + 1 >= stage.decisions.length);

      const nextIdx = state.decisionIdx + 1;
      const stageDone = nextIdx >= stage.decisions.length;

      if (revoTriggered || stageDone) {
        // Move to revolution transition
        const isLast = state.stageIdx >= STAGES.length - 1;
        return {
          ...state,
          phase: isLast ? "finale" : "revolution",
          revolutionsBurned:
            state.revolutionsBurned +
            (state.metrics.revolution >= stage.revolutionThreshold ? 1 : 0),
          stagesCompleted: state.stagesCompleted + 1,
          decisionIdx: nextIdx,
          lastChoice: null,
        };
      }
      return {
        ...state,
        phase: "playing",
        decisionIdx: nextIdx,
        lastChoice: null,
      };
    }

    case "ackRevolution": {
      const nextStageIdx = state.stageIdx + 1;
      if (nextStageIdx >= STAGES.length) {
        return { ...state, phase: "finale" };
      }
      const nextStage = STAGES[nextStageIdx];
      // Carry over: tech & insights persist; metrics reset to stage base but blended with tech bonus
      const carriedBase = baseMetricsFor(nextStage);
      const techBonus = Math.min(
        20,
        state.unlockedTech
          .map((id) => TECH_TREE.find((t) => t.id === id))
          .filter(Boolean)
          .reduce((acc, t) => acc + (t!.effect.tech ?? 0), 0) / 8,
      );
      return {
        ...state,
        stageIdx: nextStageIdx,
        decisionIdx: 0,
        metrics: {
          ...carriedBase,
          tech: clamp(carriedBase.tech + techBonus),
        },
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
