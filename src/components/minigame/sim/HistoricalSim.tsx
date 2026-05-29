/**
 * HistoricalSim — main interactive component
 *
 * Một "historical simulation experience" thay vì quiz.
 * - Society HUD (5 metrics) cố định
 * - Decision/Event cards với cause→effect overlay
 * - Tech Tree panel (slide-over)
 * - Insights drawer (knowledge hub)
 * - Revolution transition cinematic
 * - Class perspective picker
 * - Multiple endings
 */
import { useReducer, useEffect, useMemo, useState, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  STAGES,
  TECH_TREE,
  METRIC_META,
  PERSPECTIVES,
  type MetricKey,
  type SimStage,
  type Decision,
  type DecisionOption,
  type PerspectiveId,
} from "@/data/historicalSim";
import {
  reducer,
  initialState,
  finalize,
  ALL_METRICS,
  type SimState,
} from "./simStore";
import {
  AlertTriangle,
  Cpu,
  Library,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  Lock,
  Check,
  ChevronRight,
} from "lucide-react";
import { AmbientEngine } from "./cinematic/AmbientEngine";
import { StressOverlay } from "./cinematic/StressOverlay";
import { Narrator, type NarratorPayload } from "./cinematic/Narrator";
import { RevolutionCinematic } from "./cinematic/RevolutionCinematic";
import { ReplayTimeline } from "./cinematic/ReplayTimeline";
import {
  SettingsToggle,
  useCinematicSettings,
} from "./cinematic/SettingsToggle";
import { NARRATOR_LINES, STRESS } from "./cinematic/cinematicConfig";
import { PerspectiveProvider, VoiceText, usePerspective } from "./perspective/PerspectiveProvider";
import { PerspectiveHUD } from "./perspective/PerspectiveHUD";
import {
  PERSPECTIVE_THEMES,
  PERSPECTIVE_OBJECTIVES,
  ENDING_NARRATIONS,
  resolveOptions,
  isOptionEmphasized,
  isInsightVisible,
} from "@/data/perspective/perspectiveConfig";


/* =========================================================
   Root
   ========================================================= */
export function HistoricalSim() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const stage = STAGES[state.stageIdx];
  const reduceMotion = useReducedMotion();
  const [techOpen, setTechOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [settings, setSettings] = useCinematicSettings();
  const [narratorLine, setNarratorLine] = useState<NarratorPayload | null>(null);
  const lastTensionEra = useRef<string | null>(null);

  // Keyboard: Esc closes drawers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setTechOpen(false);
        setInsightsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Narrator: fire on entering a stage
  useEffect(() => {
    if (state.phase === "intro") {
      const line = NARRATOR_LINES[stage.id]?.enter;
      if (line) {
        setNarratorLine({
          id: `enter-${stage.id}`,
          text: line.text,
          tone: "calm",
          holdMs: 4500,
        });
      }
      lastTensionEra.current = null;
    }
  }, [state.phase, stage.id]);

  // Narrator: fire on revolution
  useEffect(() => {
    if (state.phase === "revolution") {
      const line = NARRATOR_LINES[stage.id]?.revolution;
      if (line) {
        setNarratorLine({
          id: `rev-${stage.id}-${state.stagesCompleted}`,
          text: line.text,
          tone: "rupture",
          holdMs: 4800,
        });
      }
    }
  }, [state.phase, stage.id, state.stagesCompleted]);

  // Narrator: tension when contradiction crosses unease threshold (once per era)
  useEffect(() => {
    if (
      state.metrics.contradiction >= STRESS.unease &&
      lastTensionEra.current !== stage.id &&
      state.phase === "playing"
    ) {
      const line = NARRATOR_LINES[stage.id]?.tension;
      if (line) {
        setNarratorLine({
          id: `tension-${stage.id}`,
          text: line.text,
          tone: "tense",
          holdMs: 4000,
        });
        lastTensionEra.current = stage.id;
      }
    }
  }, [state.metrics.contradiction, stage.id, state.phase]);

  const shake = state.metrics.contradiction >= 70 && !reduceMotion && !settings.reducedFx;

  return (
    <PerspectiveProvider perspective={state.perspective}>
    <div
      data-era={stage.id}
      className={`relative min-h-screen overflow-hidden bg-gradient-to-b ${stage.theme.bg} text-stone-100 transition-colors duration-700`}
    >
      <AmbientEngine
        era={stage.id}
        contradiction={state.metrics.contradiction}
        muted={settings.muted}
      />
      <StressOverlay
        contradiction={state.metrics.contradiction}
        reduced={settings.reducedFx}
      />
      <Narrator line={narratorLine} onDone={() => setNarratorLine(null)} />

      <WorldBackdrop stage={stage} reduceMotion={!!reduceMotion || settings.reducedFx} />

      <motion.div
        animate={shake ? { x: [0, -2, 3, -2, 0] } : { x: 0 }}
        transition={shake ? { duration: 0.35, repeat: Infinity } : { duration: 0.4 }}
        className="relative z-10"
      >


        <TopBar
          state={state}
          stage={stage}
          settings={settings}
          onChangeSettings={setSettings}
          onOpenTech={() => setTechOpen(true)}
          onOpenInsights={() => setInsightsOpen(true)}
          onRestart={() => dispatch({ type: "restart" })}
        />


        <main className="mx-auto max-w-5xl px-4 pb-40 pt-6 sm:px-6">
          <AnimatePresence mode="wait">
            {state.phase === "perspective" && (
              <PerspectivePicker
                key="persp"
                onChoose={(id) => dispatch({ type: "choosePerspective", id })}
              />
            )}
            {state.phase === "intro" && (
              <StageIntro
                key={`intro-${stage.id}`}
                stage={stage}
                onStart={() => dispatch({ type: "startStage" })}
              />
            )}
            {state.phase === "playing" && (
              <DecisionPanel
                key={`play-${stage.id}-${state.decisionIdx}`}
                stage={stage}
                state={state}
                decision={stage.decisions[state.decisionIdx]}
                onChoose={(opt) => dispatch({ type: "decide", option: opt })}
              />
            )}
            {state.phase === "consequence" && state.lastChoice && (
              <ConsequencePanel
                key={`cons-${stage.id}-${state.decisionIdx}`}
                stage={stage}
                choice={state.lastChoice}
                onContinue={() => dispatch({ type: "ackConsequence" })}
              />
            )}
            {state.phase === "revolution" && (
              <RevolutionCinematic
                key={`rev-${stage.id}`}
                stage={stage}
                metrics={state.metrics}
                onDone={() => dispatch({ type: "ackRevolution" })}
              />
            )}

            {state.phase === "finale" && (
              <Finale
                key="finale"
                state={state}
                onRestart={() => dispatch({ type: "restart" })}
              />
            )}
          </AnimatePresence>
        </main>

        {/* Perspective-aware HUD */}
        {state.phase !== "perspective" && state.phase !== "finale" && (
          <PerspectiveHUD state={state} />
        )}
      </motion.div>

      <TechDrawer
        open={techOpen}
        onClose={() => setTechOpen(false)}
        unlocked={state.unlockedTech}
        currentEra={stage.id}
      />
      <InsightsDrawer
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        insights={state.insights}
      />
    </div>
    </PerspectiveProvider>

}

/* =========================================================
   Backdrop — đổi theo era
   ========================================================= */
function WorldBackdrop({ stage, reduceMotion }: { stage: SimStage; reduceMotion: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.07),transparent_60%)]" />
      <div className="absolute inset-0 grain" />
      {!reduceMotion &&
        Array.from({ length: 22 }).map((_, i) => (
          <motion.span
            key={`${stage.id}-${i}`}
            className="absolute h-1 w-1 rounded-full bg-white/30"
            style={{ left: `${(i * 41) % 100}%`, top: `${(i * 67) % 100}%` }}
            animate={{ y: [0, -16, 0], opacity: [0.1, 0.6, 0.1] }}
            transition={{ duration: 5 + (i % 4), repeat: Infinity, delay: i * 0.13 }}
          />
        ))}
    </div>
  );
}

/* =========================================================
   Top bar
   ========================================================= */
function TopBar({
  state,
  stage,
  settings,
  onChangeSettings,
  onOpenTech,
  onOpenInsights,
  onRestart,
}: {
  state: SimState;
  stage: SimStage;
  settings: import("./cinematic/SettingsToggle").CinematicSettings;
  onChangeSettings: (
    patch: Partial<import("./cinematic/SettingsToggle").CinematicSettings>,
  ) => void;
  onOpenTech: () => void;
  onOpenInsights: () => void;
  onRestart: () => void;
}) {
  const persp = PERSPECTIVES.find((p) => p.id === state.perspective)!;
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 pt-6 sm:px-6">
      <div className="flex items-center gap-3">
        <span className={`text-2xl ${stage.theme.accent}`} aria-hidden>
          {stage.theme.glyph}
        </span>
        <div className="leading-tight">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">
            Mô phỏng lịch sử
          </p>
          <p className="font-display text-lg text-white/90">
            Ải {stage.order}/5 · {stage.title}
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 backdrop-blur sm:flex">
        <span aria-hidden>{persp.glyph}</span>
        <span>{persp.label}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <SettingsToggle settings={settings} onChange={onChangeSettings} />
        <IconBtn label="Cây công nghệ" onClick={onOpenTech}>
          <Cpu className="h-4 w-4" />
          <span className="hidden text-xs sm:inline">Công nghệ</span>
          <span className="ml-1 rounded-full bg-white/10 px-1.5 text-[10px] font-mono">
            {state.unlockedTech.length}
          </span>
        </IconBtn>
        <IconBtn label="Kho tri thức" onClick={onOpenInsights}>
          <Library className="h-4 w-4" />
          <span className="hidden text-xs sm:inline">Tri thức</span>
          <span className="ml-1 rounded-full bg-white/10 px-1.5 text-[10px] font-mono">
            {state.insights.length}
          </span>
        </IconBtn>
        <IconBtn label="Bắt đầu lại" onClick={onRestart}>
          <RotateCcw className="h-4 w-4" />
        </IconBtn>
      </div>
    </header>
  );
}


function IconBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/80 backdrop-blur transition hover:bg-white/10"
    >
      {children}
    </button>
  );
}

/* =========================================================
   Perspective picker
   ========================================================= */
function PerspectivePicker({ onChoose }: { onChoose: (id: PerspectiveId) => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-3xl pt-10 text-center"
    >
      <p className="text-xs uppercase tracking-[0.4em] text-white/40">Bước 0 · Góc nhìn</p>
      <h1 className="mt-4 font-display text-5xl text-white sm:text-6xl">
        Bạn nhìn lịch sử từ đâu?
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-white/60">
        Mỗi giai cấp đọc cùng một sự kiện theo cách rất khác. Lựa chọn này sẽ ảnh
        hưởng đến cách hệ quả hiển thị và cường độ tác động lên xã hội.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {PERSPECTIVES.map((p) => (
          <button
            key={p.id}
            onClick={() => onChoose(p.id)}
            className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition hover:border-white/30 hover:bg-white/[0.06]"
          >
            <span className="text-4xl">{p.glyph}</span>
            <p className="mt-4 font-display text-2xl text-white">{p.label}</p>
            <p className="mt-1 text-sm italic text-white/60">{p.tagline}</p>
            <p className="mt-3 text-sm text-white/70">{p.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-white/40 group-hover:text-white/80">
              Chọn <ChevronRight className="h-3 w-3" />
            </span>
          </button>
        ))}
      </div>
    </motion.section>
  );
}

/* =========================================================
   Stage intro
   ========================================================= */
function StageIntro({ stage, onStart }: { stage: SimStage; onStart: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-3xl pt-10 pb-24 text-center sm:pt-16"
    >
      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.1em" }}
        animate={{ opacity: 1, letterSpacing: "0.4em" }}
        transition={{ duration: 1 }}
        className={`text-[11px] uppercase tracking-[0.4em] ${stage.theme.accent}`}
      >
        Ải {stage.order} · {stage.era}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="mt-4 font-display text-5xl text-balance text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] sm:text-6xl"
      >
        {stage.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="mt-3 text-base italic text-white/60 sm:text-lg"
      >
        {stage.subtitle}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className={`mx-auto mt-8 max-w-2xl rounded-2xl border ${stage.theme.ring} bg-stone-950/70 px-6 py-5 backdrop-blur-md sm:px-8 sm:py-6`}
      >
        <p className="text-base leading-relaxed text-white/85 sm:text-lg">{stage.intro}</p>
      </motion.div>

      <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
        <InfoCard title="Lực lượng sản xuất" items={stage.productionForces} />
        <InfoCard title="Quan hệ sản xuất" items={stage.relationsOfProduction} />
      </div>

      <p className={`mt-6 text-sm italic ${stage.theme.accent}`}>
        ⚡ Mâu thuẫn cốt lõi: {stage.keyContradiction}
      </p>

      <button
        onClick={onStart}
        className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-medium uppercase tracking-[0.25em] text-stone-950 transition-transform hover:scale-[1.02]"
      >
        <Sparkles className="h-4 w-4" /> Bước vào thời kỳ
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

/* =========================================================
   Decision panel
   ========================================================= */
function DecisionPanel({
  stage,
  state,
  decision,
  onChoose,
}: {
  stage: SimStage;
  state: SimState;
  decision: Decision;
  onChoose: (o: DecisionOption) => void;
}) {
  if (!decision) return null;
  const voice = decision.voice?.[state.perspective];
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-3xl pt-2"
    >
      <div className="mb-4 flex items-center justify-between text-xs text-white/50">
        <span className="uppercase tracking-[0.3em]">
          {decision.kind === "event" ? "Sự kiện lịch sử" : "Quyết định"} ·{" "}
          {state.decisionIdx + 1}/{stage.decisions.length}
        </span>
        <span className={stage.theme.accent}>{stage.theme.glyph}</span>
      </div>

      <div
        className={`rounded-2xl border ${stage.theme.ring} bg-stone-950/60 p-6 backdrop-blur-md sm:p-8`}
      >
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">
          {decision.title}
        </p>
        <h2 className="mt-2 font-display text-2xl text-balance text-white sm:text-3xl">
          {decision.prompt}
        </h2>
        {voice && (
          <p className="mt-3 border-l-2 border-white/20 pl-3 text-sm italic text-white/70">
            "{voice}"
          </p>
        )}

        <div className="mt-6 grid gap-3">
          {decision.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onChoose(opt)}
              className="group flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-white/30 hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-white">{opt.label}</p>
                <ChevronRight className="h-4 w-4 shrink-0 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white/80" />
              </div>
              <p className="mt-1 text-sm text-white/60">{opt.flavor}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {ALL_METRICS.filter((k) => (opt.effect[k] ?? 0) !== 0).map((k) => {
                  const v = opt.effect[k]!;
                  const pos = v > 0;
                  const isBad = k === "contradiction" || k === "revolution";
                  // Neutral display: just signed delta + label
                  return (
                    <span
                      key={k}
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-mono ${
                        pos
                          ? isBad
                            ? "border-rose-400/30 bg-rose-400/10 text-rose-200"
                            : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                          : "border-white/15 bg-white/5 text-white/70"
                      }`}
                    >
                      {pos ? "+" : ""}
                      {v} {METRIC_META[k].short}
                    </span>
                  );
                })}
                {opt.unlocks?.map((u) => {
                  const t = TECH_TREE.find((x) => x.id === u);
                  if (!t) return null;
                  return (
                    <span
                      key={u}
                      className="rounded-full border border-sky-300/30 bg-sky-400/10 px-2 py-0.5 text-[10px] text-sky-200"
                    >
                      ★ Mở {t.label}
                    </span>
                  );
                })}
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* =========================================================
   Consequence (cause → effect)
   ========================================================= */
function ConsequencePanel({
  stage,
  choice,
  onContinue,
}: {
  stage: SimStage;
  choice: NonNullable<SimState["lastChoice"]>;
  onContinue: () => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-3xl pt-2"
    >
      <div
        className={`overflow-hidden rounded-2xl border ${stage.theme.ring} bg-stone-950/70 p-6 backdrop-blur-md sm:p-8`}
      >
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">
          Hệ quả
        </p>
        <h2 className="mt-2 font-display text-2xl text-white sm:text-3xl">
          {choice.option.label}
        </h2>
        <p className="mt-1 text-sm italic text-white/60">{choice.option.flavor}</p>

        <ol className="mt-6 space-y-2">
          {choice.option.causeChain.map((c, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.25, duration: 0.4 }}
              className="flex items-start gap-3 text-white/90"
            >
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-white/60" />
              <span>{c}</span>
            </motion.li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap gap-2">
          {ALL_METRICS.filter((k) => (choice.deltas[k] ?? 0) !== 0).map((k) => {
            const v = choice.deltas[k]!;
            const pos = v > 0;
            const isBad = k === "contradiction" || k === "revolution";
            return (
              <motion.span
                key={k}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + Math.random() * 0.3 }}
                className={`rounded-full border px-3 py-1 text-xs font-mono ${
                  pos
                    ? isBad
                      ? "border-rose-400/40 bg-rose-400/15 text-rose-100"
                      : "border-emerald-400/40 bg-emerald-400/15 text-emerald-100"
                    : "border-white/20 bg-white/10 text-white/80"
                }`}
              >
                {METRIC_META[k].label} {pos ? "+" : ""}
                {v}
              </motion.span>
            );
          })}
        </div>

        {choice.newlyUnlocked.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 rounded-xl border border-sky-300/30 bg-sky-400/10 p-4"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-sky-200/80">
              Công nghệ mở khoá
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {choice.newlyUnlocked.map((id) => {
                const t = TECH_TREE.find((x) => x.id === id);
                if (!t) return null;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300/30 bg-stone-950/40 px-2.5 py-1 text-sm text-sky-100"
                  >
                    <span>{t.icon}</span> {t.label}
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}

        <button
          onClick={onContinue}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium uppercase tracking-[0.25em] text-stone-950 transition hover:scale-[1.01]"
        >
          Tiếp tục dòng chảy <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </motion.section>
  );
}

/* =========================================================
   Metrics HUD
   ========================================================= */
function MetricsHUD({
  metrics,
  stage,
}: {
  metrics: Record<MetricKey, number>;
  stage: SimStage;
}) {
  const danger = metrics.contradiction >= 65 || metrics.revolution >= 50;
  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 px-3 pb-3 sm:px-6 sm:pb-5">
      <div className="pointer-events-auto mx-auto max-w-5xl rounded-2xl border border-white/10 bg-stone-950/80 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">
            Trạng thái xã hội · {stage.title}
          </p>
          {danger && (
            <span className="inline-flex items-center gap-1 text-[10px] text-rose-300">
              <AlertTriangle className="h-3 w-3" /> Áp lực xã hội cao
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {ALL_METRICS.map((k) => (
            <MetricBar key={k} k={k} value={metrics[k]} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricBar({ k, value }: { k: MetricKey; value: number }) {
  const meta = METRIC_META[k];
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/55">
        <span>{meta.short}</span>
        <span className="font-mono text-white/80">{Math.round(value)}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          key={value}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full bg-gradient-to-r ${meta.hueClass}`}
        />
      </div>
    </div>
  );
}

/* (Legacy RevolutionPanel removed — replaced by RevolutionCinematic.) */


/* =========================================================
   Finale
   ========================================================= */
function Finale({
  state,
  onRestart,
}: {
  state: SimState;
  onRestart: () => void;
}) {
  const ending = useMemo(() => finalize(state), [state]);
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-3xl pt-8 text-center"
    >
      <Trophy className="mx-auto h-10 w-10 text-amber-300" />
      <p className="mt-4 text-xs uppercase tracking-[0.5em] text-white/50">
        Kết thúc · {ending.vibe === "linear" ? "Tiến triển tuyến tính" : ending.vibe === "rupture" ? "Đứt gãy" : ending.vibe === "future" ? "Tương lai" : "Trì trệ"}
      </p>
      <h1 className="mt-3 font-display text-5xl text-balance text-white sm:text-6xl">
        {ending.title}
      </h1>
      <p className="mt-3 text-lg italic text-white/70">{ending.subtitle}</p>
      <p className="mx-auto mt-6 max-w-xl text-white/80">{ending.body}</p>
      <p className="mx-auto mt-6 max-w-xl border-t border-white/10 pt-6 text-sm italic text-white/60">
        {ending.reflection}
      </p>

      <div className="mt-8 grid gap-2 text-left sm:grid-cols-5">
        {ALL_METRICS.map((k) => (
          <div key={k} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">
              {METRIC_META[k].short}
            </p>
            <p className="font-mono text-2xl text-white">
              {Math.round(state.metrics[k])}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-white/60">
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
          Công nghệ đã mở: {state.unlockedTech.length}/{TECH_TREE.length}
        </span>
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
          Tri thức: {state.insights.length}
        </span>
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
          Cách mạng bùng nổ: {state.revolutionsBurned}
        </span>
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
          Lựa chọn tiến bộ: {state.progressiveCount}
        </span>
      </div>

      <button
        onClick={onRestart}
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium uppercase tracking-[0.25em] text-stone-950"
      >
        <RotateCcw className="h-4 w-4" /> Chơi lại với góc nhìn khác
      </button>

      <ReplayTimeline state={state} />
    </motion.section>
  );
}


/* =========================================================
   Tech tree drawer
   ========================================================= */
function TechDrawer({
  open,
  onClose,
  unlocked,
  currentEra,
}: {
  open: boolean;
  onClose: () => void;
  unlocked: string[];
  currentEra: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-stone-950/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed inset-y-0 right-0 z-40 w-full max-w-md overflow-y-auto border-l border-white/10 bg-stone-950 p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Cpu className="h-4 w-4" />
                <h2 className="font-display text-2xl">Cây công nghệ</h2>
              </div>
              <button onClick={onClose} aria-label="Đóng" className="text-white/60 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            {STAGES.map((s) => (
              <div key={s.id} className="mb-6">
                <p className={`text-xs uppercase tracking-[0.3em] ${s.theme.accent}`}>
                  {s.title}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {TECH_TREE.filter((t) => t.era === s.id).map((t) => {
                    const u = unlocked.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        className={`rounded-xl border p-3 ${
                          u
                            ? "border-emerald-300/30 bg-emerald-300/5"
                            : "border-white/10 bg-white/[0.02] opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{t.icon}</span>
                          {u ? (
                            <Check className="h-3.5 w-3.5 text-emerald-300" />
                          ) : (
                            <Lock className="h-3.5 w-3.5 text-white/40" />
                          )}
                        </div>
                        <p className="mt-1 text-sm font-medium text-white">{t.label}</p>
                        <p className="mt-0.5 text-xs text-white/55">{t.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* =========================================================
   Insights drawer
   ========================================================= */
function InsightsDrawer({
  open,
  onClose,
  insights,
}: {
  open: boolean;
  onClose: () => void;
  insights: SimState["insights"];
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-stone-950/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed inset-y-0 left-0 z-40 w-full max-w-md overflow-y-auto border-r border-white/10 bg-stone-950 p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Library className="h-4 w-4" />
                <h2 className="font-display text-2xl">Kho tri thức</h2>
              </div>
              <button onClick={onClose} aria-label="Đóng" className="text-white/60 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            {insights.length === 0 ? (
              <p className="text-sm text-white/50">
                Chưa có tri thức nào. Hãy chọn các quyết định mang tính bước ngoặt
                để mở khoá tri thức lịch sử.
              </p>
            ) : (
              <div className="space-y-4">
                {insights.map((ins) => (
                  <article
                    key={ins.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                      {STAGES.find((s) => s.id === ins.era)?.title}
                    </p>
                    <h3 className="mt-1 font-display text-xl text-white">{ins.title}</h3>
                    <p className="mt-2 text-sm text-white/75">{ins.body}</p>
                  </article>
                ))}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
