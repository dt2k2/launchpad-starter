import { useReducer, useMemo, useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  STAGES,
  TOTAL_STAGES,
  rankFromPercent,
  type Question,
  type MiniStage,
} from "@/data/minigame";
import type { EraId } from "@/data/eras";
import {
  Lock,
  Check,
  X,
  Lightbulb,
  Sparkles,
  ChevronRight,
  Trophy,
  Zap,
  RotateCcw,
  Flag,
  Hammer,
} from "lucide-react";

/* =========================================================
   State machine — useReducer
   ========================================================= */

type StageStatus = "locked" | "active" | "completed";
type Phase = "intro" | "playing" | "stage-complete" | "transition" | "finale";

interface GameState {
  currentStageIdx: number;
  phase: Phase;
  currentQ: number;
  answered: boolean;
  lastCorrect: boolean | null;
  selected: unknown;
  hintUsed: boolean;
  contradiction: number; // 0–100 for current stage
  progress: number; // 0–100 for current stage
  stageScore: number;
  totalScore: number;
  totalPossible: number;
  status: Record<EraId, StageStatus>;
  stageResults: Record<EraId, { score: number; max: number } | null>;
  achievements: string[];
}

type Action =
  | { type: "start" }
  | { type: "select"; value: unknown }
  | { type: "submit"; correct: boolean; points: number; q: Question }
  | { type: "useHint" }
  | { type: "next" }
  | { type: "completeStage" }
  | { type: "transitionDone" }
  | { type: "advanceStage" }
  | { type: "restart" }
  | { type: "replayStage"; idx: number };

const initialStatus = STAGES.reduce(
  (acc, s, i) => ({ ...acc, [s.id]: i === 0 ? "active" : "locked" }),
  {} as Record<EraId, StageStatus>,
);
const initialResults = STAGES.reduce(
  (acc, s) => ({ ...acc, [s.id]: null }),
  {} as Record<EraId, { score: number; max: number } | null>,
);

const totalPossibleAll = STAGES.reduce(
  (sum, s) => sum + s.questions.reduce((a, q) => a + q.points, 0),
  0,
);

function init(): GameState {
  return {
    currentStageIdx: 0,
    phase: "intro",
    currentQ: 0,
    answered: false,
    lastCorrect: null,
    selected: null,
    hintUsed: false,
    contradiction: 0,
    progress: 0,
    stageScore: 0,
    totalScore: 0,
    totalPossible: totalPossibleAll,
    status: { ...initialStatus },
    stageResults: { ...initialResults },
    achievements: [],
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "start":
      return { ...state, phase: "playing" };

    case "select":
      return { ...state, selected: action.value };

    case "submit": {
      const { correct, points, q } = action;
      const gainPts = correct ? (state.hintUsed ? Math.ceil(points / 2) : points) : 0;
      const progBoost = correct ? q.progressOnCorrect ?? 15 : 0;
      const contraBoost = !correct ? q.contradictionOnWrong ?? 12 : 0;
      return {
        ...state,
        answered: true,
        lastCorrect: correct,
        stageScore: state.stageScore + gainPts,
        totalScore: state.totalScore + gainPts,
        progress: Math.min(100, state.progress + progBoost),
        contradiction: Math.min(100, state.contradiction + contraBoost),
      };
    }

    case "useHint":
      return { ...state, hintUsed: true };

    case "next": {
      const stage = STAGES[state.currentStageIdx];
      const nextQ = state.currentQ + 1;
      if (nextQ >= stage.questions.length) {
        return { ...state, phase: "stage-complete" };
      }
      return {
        ...state,
        currentQ: nextQ,
        answered: false,
        lastCorrect: null,
        selected: null,
        hintUsed: false,
      };
    }

    case "completeStage": {
      const stage = STAGES[state.currentStageIdx];
      const max = stage.questions.reduce((a, q) => a + q.points, 0);
      return {
        ...state,
        status: { ...state.status, [stage.id]: "completed" },
        stageResults: {
          ...state.stageResults,
          [stage.id]: { score: state.stageScore, max },
        },
        achievements: [...state.achievements, stage.rewards.badge],
        phase: "transition",
      };
    }

    case "transitionDone": {
      const isLast = state.currentStageIdx >= TOTAL_STAGES - 1;
      if (isLast) return { ...state, phase: "finale" };
      return state;
    }

    case "advanceStage": {
      const nextIdx = state.currentStageIdx + 1;
      const nextStage = STAGES[nextIdx];
      return {
        ...state,
        currentStageIdx: nextIdx,
        status: { ...state.status, [nextStage.id]: "active" },
        currentQ: 0,
        answered: false,
        lastCorrect: null,
        selected: null,
        hintUsed: false,
        progress: 0,
        contradiction: 0,
        stageScore: 0,
        phase: "playing",
      };
    }

    case "replayStage": {
      const stage = STAGES[action.idx];
      return {
        ...state,
        currentStageIdx: action.idx,
        currentQ: 0,
        answered: false,
        lastCorrect: null,
        selected: null,
        hintUsed: false,
        progress: 0,
        contradiction: 0,
        stageScore: 0,
        phase: "playing",
        status: { ...state.status, [stage.id]: "active" },
      };
    }

    case "restart":
      return init();

    default:
      return state;
  }
}

/* =========================================================
   Main Component
   ========================================================= */

export function MiniGame() {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const stage = STAGES[state.currentStageIdx];
  const reduceMotion = useReducedMotion();

  // keyboard: Enter to advance after answer
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Enter" && state.answered && state.phase === "playing") {
        dispatch({ type: "next" });
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [state.answered, state.phase]);

  // auto-complete stage when all questions answered
  useEffect(() => {
    if (state.phase === "playing" && state.currentQ >= stage.questions.length) {
      dispatch({ type: "completeStage" });
    }
  }, [state.currentQ, state.phase, stage.questions.length]);

  return (
    <div
      className={`relative min-h-screen overflow-hidden bg-gradient-to-b ${stage.palette.bg} text-stone-100 transition-colors duration-1000`}
    >
      {/* ambient particles */}
      {!reduceMotion && <AmbientLayer stage={stage} />}

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 pt-8">
        <div className="flex items-center gap-3">
          <span className={`text-2xl ${stage.palette.accent}`}>{stage.glyph}</span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">
              Trắc nghiệm tiến hóa
            </p>
            <p className="font-display text-lg">Hành trình Tiến hoá</p>
          </div>
        </div>
        <ScoreBadge total={state.totalScore} max={state.totalPossible} />
      </header>

      <StageStepper
        statusMap={state.status}
        currentIdx={state.currentStageIdx}
        onReplay={(i) => dispatch({ type: "replayStage", idx: i })}
      />

      <main className="relative z-10 mx-auto max-w-4xl px-6 py-10">
        <AnimatePresence mode="wait">
          {state.phase === "intro" && (
            <IntroPanel
              key="intro"
              stage={stage}
              onStart={() => dispatch({ type: "start" })}
            />
          )}

          {state.phase === "playing" && (
            <PlayPanel
              key={`play-${stage.id}-${state.currentQ}`}
              stage={stage}
              state={state}
              dispatch={dispatch}
            />
          )}

          {state.phase === "stage-complete" && (
            <ResultPanel
              key={`res-${stage.id}`}
              stage={stage}
              score={state.stageScore}
              max={stage.questions.reduce((a, q) => a + q.points, 0)}
              onContinue={() => dispatch({ type: "completeStage" })}
            />
          )}

          {state.phase === "transition" && (
            <TransitionPanel
              key={`tr-${stage.id}`}
              stage={stage}
              isLast={state.currentStageIdx >= TOTAL_STAGES - 1}
              onDone={() => {
                if (state.currentStageIdx >= TOTAL_STAGES - 1) {
                  dispatch({ type: "transitionDone" });
                } else {
                  dispatch({ type: "advanceStage" });
                }
              }}
            />
          )}

          {state.phase === "finale" && (
            <FinalePanel
              key="finale"
              state={state}
              onRestart={() => dispatch({ type: "restart" })}
            />
          )}
        </AnimatePresence>
      </main>

      {/* meters */}
      {(state.phase === "playing" || state.phase === "stage-complete") && (
        <MetersBar
          progress={state.progress}
          contradiction={state.contradiction}
          accent={stage.palette.accent}
        />
      )}
    </div>
  );
}

/* =========================================================
   Sub-components
   ========================================================= */

function AmbientLayer({ stage }: { stage: MiniStage }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]" />
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.span
          key={`${stage.id}-${i}`}
          className="absolute h-1 w-1 rounded-full bg-white/30"
          style={{ left: `${(i * 41) % 100}%`, top: `${(i * 67) % 100}%` }}
          animate={{ y: [0, -16, 0], opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 5 + (i % 4), repeat: Infinity, delay: i * 0.13 }}
        />
      ))}
    </div>
  );
}

function ScoreBadge({ total, max }: { total: number; max: number }) {
  return (
    <div className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs backdrop-blur">
      <span className="text-white/50">Nhận thức</span>{" "}
      <span className="font-mono font-semibold text-white">{total}</span>
      <span className="text-white/40"> / {max}</span>
    </div>
  );
}

function StageStepper({
  statusMap,
  currentIdx,
  onReplay,
}: {
  statusMap: Record<EraId, StageStatus>;
  currentIdx: number;
  onReplay: (i: number) => void;
}) {
  return (
    <nav
      aria-label="Stage progression"
      className="relative z-10 mx-auto mt-6 flex max-w-4xl items-center justify-between gap-2 px-6"
    >
      {STAGES.map((s, i) => {
        const st = statusMap[s.id];
        const isCurrent = i === currentIdx;
        return (
          <div key={s.id} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              disabled={st === "locked"}
              onClick={() => st === "completed" && onReplay(i)}
              aria-label={`${s.title} — ${st}`}
              className={`group flex flex-1 flex-col items-start rounded-lg border px-3 py-2 text-left transition ${
                isCurrent
                  ? `${s.palette.ring} bg-white/5`
                  : st === "completed"
                    ? "border-emerald-400/30 bg-emerald-400/5 hover:bg-emerald-400/10"
                    : "border-white/10 opacity-40"
              }`}
            >
              <div className="flex items-center gap-2">
                {st === "locked" && <Lock className="h-3 w-3" aria-hidden />}
                {st === "completed" && (
                  <Check className="h-3 w-3 text-emerald-300" aria-hidden />
                )}
                {isCurrent && st !== "completed" && (
                  <span className={`text-xs ${s.palette.accent}`}>●</span>
                )}
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/60">
                  Ải {s.order}
                </span>
              </div>
              <span className="mt-1 truncate text-xs font-medium text-white/90">
                {s.title}
              </span>
            </button>
            {i < STAGES.length - 1 && (
              <ChevronRight className="hidden h-4 w-4 shrink-0 text-white/20 sm:block" />
            )}
          </div>
        );
      })}
    </nav>
  );
}

function IntroPanel({
  stage,
  onStart,
}: {
  stage: MiniStage;
  onStart: () => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-3xl text-center"
    >
      <p className={`text-sm uppercase tracking-[0.35em] ${stage.palette.accent}`}>
        Ải {stage.order} · {stage.eraTag}
      </p>
      <h1 className="mt-4 font-display text-5xl text-balance text-white sm:text-6xl">
        {stage.title}
      </h1>
      <p className="mt-3 text-lg italic text-white/70">{stage.subtitle}</p>
      <p className="mx-auto mt-6 max-w-xl text-white/70">{stage.shortDescription}</p>

      <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
        <InfoCard title="Lực lượng sản xuất" items={stage.productionForces} />
        <InfoCard title="Quan hệ sản xuất" items={stage.relationsOfProduction} />
      </div>

      <p className={`mt-6 text-sm italic ${stage.palette.accent}`}>
        ⚡ Mâu thuẫn cốt lõi: {stage.keyContradiction}
      </p>

      <button
        onClick={onStart}
        className={`mt-8 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-medium uppercase tracking-[0.25em] text-stone-950 transition-transform hover:scale-[1.02] ${stage.palette.glow}`}
      >
        <Sparkles className="h-4 w-4" /> Bắt đầu vượt ải
      </button>
    </motion.section>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">{title}</p>
      <ul className="mt-2 space-y-1 text-sm text-white/80">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span className="text-white/30">·</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlayPanel({
  stage,
  state,
  dispatch,
}: {
  stage: MiniStage;
  state: GameState;
  dispatch: React.Dispatch<Action>;
}) {
  const q = stage.questions[state.currentQ];
  return (
    <motion.section
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-2xl"
    >
        <span className="uppercase tracking-[0.3em]">
          {stage.title} · Câu {state.currentQ + 1}/{stage.questions.length}
        </span>
        <span className={`${stage.palette.accent}`}>+{q.points} nhận thức</span>

      <div
        className={`rounded-2xl border ${stage.palette.ring} bg-stone-950/60 p-6 backdrop-blur-md sm:p-8 ${stage.palette.glow}`}
      >
        <h2 className="font-display text-2xl text-balance text-white sm:text-3xl">
          {q.prompt}
        </h2>

        <div className="mt-6">
          <QuestionRenderer
            q={q}
            stage={stage}
            state={state}
            dispatch={dispatch}
          />
        </div>

        {q.hint && !state.hintUsed && !state.answered && (
          <button
            onClick={() => dispatch({ type: "useHint" })}
            className="mt-4 inline-flex items-center gap-2 text-xs text-white/50 underline-offset-4 hover:underline"
          >
            <Lightbulb className="h-3.5 w-3.5" /> Dùng gợi ý (-50% điểm)
          </button>
        )}
        {state.hintUsed && !state.answered && q.hint && (
          <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/5 px-3 py-2 text-sm text-amber-200/90">
            <Lightbulb className="mr-1 inline h-3.5 w-3.5" />
            {q.hint}
          </p>
        )}

        <AnimatePresence>
          {state.answered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-6 rounded-lg border p-4 ${
                state.lastCorrect
                  ? "border-emerald-400/30 bg-emerald-400/10"
                  : "border-rose-400/30 bg-rose-400/10"
              }`}
            >
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                {state.lastCorrect ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-300" />
                    <span className="text-emerald-200">Chính xác</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-rose-300" />
                    <span className="text-rose-200">Chưa đúng</span>
                  </>
                )}
              </div>
              <p className="text-sm text-white/85">{q.explanation}</p>
              <button
                onClick={() => dispatch({ type: "next" })}
                autoFocus
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-medium uppercase tracking-[0.25em] text-stone-950"
              >
                Tiếp tục <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

/* =========================================================
   Question renderers
   ========================================================= */

function QuestionRenderer({
  q,
  stage,
  state,
  dispatch,
}: {
  q: Question;
  stage: MiniStage;
  state: GameState;
  dispatch: React.Dispatch<Action>;
}) {
  if (q.type === "match") {
    return <MatchUI q={q} stage={stage} state={state} dispatch={dispatch} />;
  }
  if (q.type === "order") {
    return <OrderUI q={q} stage={stage} state={state} dispatch={dispatch} />;
  }
  return <MCQ q={q} stage={stage} state={state} dispatch={dispatch} />;
}


function MCQ({
  q,
  stage,
  state,
  dispatch,
}: {
  q: Extract<Question, { type: "mcq" | "truefalse" | "scenario" }>;
  stage: MiniStage;
  state: GameState;
  dispatch: React.Dispatch<Action>;
}) {
  const selected = state.selected as number | null;
  const submit = (idx: number) => {
    dispatch({ type: "select", value: idx });
    dispatch({
      type: "submit",
      correct: idx === q.correctIndex,
      points: q.points,
      q,
    });
  };
  return (
    <div className="grid gap-2">
      {q.options.map((opt, i) => {
        const isPicked = selected === i;
        const isCorrect = state.answered && i === q.correctIndex;
        const isWrong = state.answered && isPicked && i !== q.correctIndex;
        return (
          <button
            key={i}
            disabled={state.answered}
            onClick={() => submit(i)}
            aria-pressed={isPicked}
            className={`group flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
              isCorrect
                ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-100"
                : isWrong
                  ? "border-rose-400/60 bg-rose-400/10 text-rose-100"
                  : isPicked
                    ? `${stage.palette.ring} bg-white/10`
                    : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${
                isCorrect
                  ? "border-emerald-300 bg-emerald-300/20"
                  : isWrong
                    ? "border-rose-300 bg-rose-300/20"
                    : "border-white/20 text-white/60"
              }`}
            >
              {String.fromCharCode(65 + i)}
            </span>
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

function MatchUI({
  q,
  state,
  dispatch,
}: {
  q: Extract<Question, { type: "match" }>;
  stage: MiniStage;
  state: GameState;
  dispatch: React.Dispatch<Action>;
}) {
  const [mapping, setMapping] = useState<(number | null)[]>(
    Array(q.left.length).fill(null),
  );
  const [activeLeft, setActiveLeft] = useState<number | null>(null);

  const pick = useCallback(
    (rightIdx: number) => {
      if (activeLeft === null || state.answered) return;
      // remove this right if used elsewhere
      const next = mapping.map((v) => (v === rightIdx ? null : v));
      next[activeLeft] = rightIdx;
      setMapping(next);
      setActiveLeft(null);
    },
    [activeLeft, mapping, state.answered],
  );

  const allMapped = mapping.every((v) => v !== null);

  const submit = () => {
    const correct = mapping.every((v, i) => v === q.correctMap[i]);
    dispatch({ type: "select", value: mapping });
    dispatch({ type: "submit", correct, points: q.points, q });
  };

  return (
    <div>
      <p className="mb-3 text-xs text-white/50">
        Bấm vào ô bên trái, sau đó bấm ô bên phải để ghép cặp.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {q.left.map((l, i) => {
            const matched = mapping[i] !== null;
            const isCorrect =
              state.answered && mapping[i] === q.correctMap[i];
            const isWrong =
              state.answered && mapping[i] !== q.correctMap[i];
            return (
              <button
                key={l}
                disabled={state.answered}
                onClick={() => setActiveLeft(i)}
                className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  isCorrect
                    ? "border-emerald-400/60 bg-emerald-400/10"
                    : isWrong
                      ? "border-rose-400/60 bg-rose-400/10"
                      : activeLeft === i
                        ? "border-white/60 bg-white/10"
                        : matched
                          ? "border-white/30 bg-white/5"
                          : "border-white/10 bg-white/5 hover:border-white/30"
                }`}
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  {String.fromCharCode(65 + i)}
                </span>
                <div>{l}</div>
                {mapping[i] !== null && (
                  <div className="mt-1 truncate text-xs italic text-white/60">
                    → {q.right[mapping[i]!]}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {q.right.map((r, i) => {
            const used = mapping.includes(i);
            return (
              <button
                key={r}
                disabled={state.answered || activeLeft === null}
                onClick={() => pick(i)}
                className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  used
                    ? "border-white/30 bg-white/10 opacity-60"
                    : "border-white/10 bg-white/5 hover:border-white/40 hover:bg-white/10"
                } ${activeLeft !== null && !used ? "ring-1 ring-white/30" : ""}`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>
      {!state.answered && (
        <button
          disabled={!allMapped}
          onClick={submit}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-medium uppercase tracking-[0.25em] text-stone-950 disabled:opacity-40"
        >
          Xác nhận ghép cặp
        </button>
      )}
    </div>
  );
}

function OrderUI({
  q,
  state,
  dispatch,
}: {
  q: Extract<Question, { type: "order" }>;
  stage: MiniStage;
  state: GameState;
  dispatch: React.Dispatch<Action>;
}) {
  const [order, setOrder] = useState<number[]>(() =>
    q.items.map((_, i) => i),
  );
  const move = (i: number, dir: -1 | 1) => {
    if (state.answered) return;
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };
  const submit = () => {
    const correct = order.every((v, i) => v === q.correctOrder[i]);
    dispatch({ type: "select", value: order });
    dispatch({ type: "submit", correct, points: q.points, q });
  };
  return (
    <div>
      <p className="mb-3 text-xs text-white/50">
        Dùng nút mũi tên để xếp theo trình tự đúng (cũ → mới).
      </p>
      <ul className="space-y-2">
        {order.map((itemIdx, i) => {
          const correctHere =
            state.answered && q.correctOrder[i] === itemIdx;
          const wrongHere =
            state.answered && q.correctOrder[i] !== itemIdx;
          return (
            <li
              key={itemIdx}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                correctHere
                  ? "border-emerald-400/60 bg-emerald-400/10"
                  : wrongHere
                    ? "border-rose-400/60 bg-rose-400/10"
                    : "border-white/10 bg-white/5"
              }`}
            >
              <span className="font-mono text-xs text-white/40">
                {i + 1}.
              </span>
              <span className="flex-1 text-sm">{q.items[itemIdx]}</span>
              <button
                aria-label="Lên"
                disabled={state.answered || i === 0}
                onClick={() => move(i, -1)}
                className="h-7 w-7 rounded border border-white/15 text-xs hover:bg-white/10 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                aria-label="Xuống"
                disabled={state.answered || i === order.length - 1}
                onClick={() => move(i, 1)}
                className="h-7 w-7 rounded border border-white/15 text-xs hover:bg-white/10 disabled:opacity-30"
              >
                ↓
              </button>
            </li>
          );
        })}
      </ul>
      {!state.answered && (
        <button
          onClick={submit}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-medium uppercase tracking-[0.25em] text-stone-950"
        >
          Xác nhận thứ tự
        </button>
      )}
    </div>
  );
}

/* =========================================================
   Result / Transition / Finale
   ========================================================= */

function ResultPanel({
  stage,
  score,
  max,
  onContinue,
}: {
  stage: MiniStage;
  score: number;
  max: number;
  onContinue: () => void;
}) {
  const pct = score / max;
  const rank = rankFromPercent(pct);
  const passed = score >= stage.passScore;
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-2xl text-center"
    >
      <Trophy
        className={`mx-auto h-12 w-12 ${stage.palette.accent}`}
        aria-hidden
      />
      <h2 className="mt-4 font-display text-4xl text-white">
        {passed ? "Vượt ải!" : "Cố lên — học lại nào"}
      </h2>
      <p className="mt-2 text-white/60">
        {stage.title} · {score}/{max} điểm · Xếp hạng{" "}
        <span className={stage.palette.accent}>{rank}</span>
      </p>

      <div
        className={`mt-8 rounded-2xl border ${stage.palette.ring} bg-stone-950/60 p-6 text-left ${stage.palette.glow}`}
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/70">
          <Sparkles className="h-3 w-3" /> Thẻ tri thức
        </div>
        </div>
        <h3 className="font-display text-2xl text-white">
          {stage.rewards.loreTitle}
        </h3>
        <p className="mt-2 text-white/75">{stage.rewards.loreBody}</p>

        <div className="mt-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
            Công nghệ mở khoá
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {stage.rewards.techUnlocked.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs"
              >
                <Hammer className="h-3 w-3" /> {t}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-5 rounded-md border border-white/10 bg-white/5 p-3 text-sm italic text-white/80">
          💡 {stage.learningSummary}
        </p>
        <p className="mt-2 text-xs text-white/50">Sự thật thú vị: {stage.funFact}</p>
      </div>

      <button
        onClick={onContinue}
        className={`mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3 text-sm font-medium uppercase tracking-[0.25em] text-stone-950 ${stage.palette.glow}`}
      >
        <Zap className="h-4 w-4" /> Kích hoạt {stage.transitionLabel}
      </button>
    </motion.section>
  );
}

function TransitionPanel({
  stage,
  isLast,
  onDone,
}: {
  stage: MiniStage;
  isLast: boolean;
  onDone: () => void;
}) {
  const reduce = useReducedMotion();
  // auto-progress after animation
  useEffect(() => {
    const t = setTimeout(onDone, reduce ? 600 : 2600);
    return () => clearTimeout(t);
  }, [onDone, reduce]);

  return (
    <motion.section
      key="transition"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative mx-auto flex h-[60vh] max-w-3xl flex-col items-center justify-center text-center"
    >
      {/* fracture lines */}
      {!reduce && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.line
              key={i}
              x1="50%"
              y1="50%"
              x2={`${(i * 137) % 100}%`}
              y2={`${(i * 79) % 100}%`}
              stroke="white"
              strokeOpacity={0.4}
              strokeWidth={0.6}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: i * 0.05 }}
            />
          ))}
        </svg>
      )}

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`text-xs uppercase tracking-[0.4em] ${stage.palette.accent}`}
      >
        Cách mạng
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="mt-3 font-display text-4xl text-white sm:text-6xl"
      >
        {stage.transitionLabel}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-6 max-w-lg text-white/70"
      >
        Quan hệ sản xuất cũ vỡ ra. Một hình thái mới trỗi dậy…
      </motion.p>

      {isLast && (
        <button
          onClick={onDone}
          className="mt-10 rounded-full bg-white px-6 py-3 text-xs uppercase tracking-[0.25em] text-stone-950"
        >
          Đến tổng kết
        </button>
      )}
    </motion.section>
  );
}

function FinalePanel({
  state,
  onRestart,
}: {
  state: GameState;
  onRestart: () => void;
}) {
  const pct = state.totalScore / state.totalPossible;
  const rank = rankFromPercent(pct);
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl text-center"
    >
      <Flag className="mx-auto h-14 w-14 text-emerald-300" aria-hidden />
      <h1 className="mt-4 font-display text-5xl text-white">Hoàn tất hành trình</h1>
      <p className="mt-3 text-white/70">
        Bạn đã đi qua {TOTAL_STAGES} hình thái kinh tế – xã hội.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric label="Tổng insight" value={`${state.totalScore}/${state.totalPossible}`} />
        <Metric label="Xếp hạng" value={rank} />
        <Metric label="Huy hiệu" value={`${state.achievements.length}`} />
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-stone-950/60 p-6 text-left">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
          Bộ sưu tập huy hiệu
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {state.achievements.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100"
            >
              <Trophy className="h-3 w-3" /> {b}
            </span>
          ))}
        </div>

        <p className="mt-6 text-sm italic text-white/80">
          “Lịch sử không kết thúc — lực lượng sản xuất tiếp tục lớn lên, và mỗi
          thế hệ phải tự trả lời: quan hệ sản xuất nào xứng đáng với nó?”
        </p>
      </div>

      <button
        onClick={onRestart}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium uppercase tracking-[0.25em] text-stone-950"
      >
        <RotateCcw className="h-4 w-4" /> Chơi lại
      </button>
    </motion.section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl text-white">{value}</p>
    </div>
  );
}

/* =========================================================
   Bottom meters
   ========================================================= */

function MetersBar({
  progress,
  contradiction,
  accent,
}: {
  progress: number;
  contradiction: number;
  accent: string;
}) {
  const burst = contradiction >= 80;
  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-stone-950/85 backdrop-blur-md"
      animate={burst ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mx-auto grid max-w-4xl gap-3 px-6 py-3 sm:grid-cols-2">
        <Meter
          label="Tiến trình lịch sử"
          value={progress}
          colorClass={accent}
          barClass="bg-gradient-to-r from-emerald-400 to-teal-300"
        />
        <Meter
          label="Mâu thuẫn"
          value={contradiction}
          colorClass="text-rose-300"
          barClass={`bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 ${
            burst ? "animate-pulse" : ""
          }`}
        />
      </div>
    </motion.div>
  );
}

function Meter({
  label,
  value,
  colorClass,
  barClass,
}: {
  label: string;
  value: number;
  colorClass: string;
  barClass: string;
}) {
  const pct = useMemo(() => Math.max(0, Math.min(100, value)), [value]);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.25em]">
        <span className={`${colorClass}`}>{label}</span>
        <span className="font-mono text-white/60">{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full ${barClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
