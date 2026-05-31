/**
 * PerspectiveHUD — perspective-aware HUD replacing/wrapping the metrics bar.
 * Shows: emblem · objective · score · contextual warning · watched metrics
 * highlighted · contradiction tier badge · 6 systemic pressure gauges.
 *
 * Collapsible (default expanded) so it never traps the main content beneath it.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { METRIC_META, type MetricKey } from "@/data/historicalSim";
import type { SimState } from "../simStore";
import { usePerspective } from "./PerspectiveProvider";
import { PressureGauges } from "../pressure/PressureGauges";
import { ContradictionTierBadge } from "../pressure/ContradictionTierBadge";
const ALL_METRICS: MetricKey[] = [
  "production",
  "stability",
  "tech",
  "contradiction",
  "revolution",
];

export function PerspectiveHUD({ state }: { state: SimState }) {
  const { theme, objective } = usePerspective();
  const warning = objective.warning(state);
  const score = Math.round(objective.score(state));
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 px-3 pb-3 sm:px-6 sm:pb-4">
      <div
        className={`pointer-events-auto mx-auto max-w-5xl rounded-[var(--p-radius)] border p-3 shadow-2xl backdrop-blur-xl sm:p-4 ${theme.classes.surface}`}
      >
        {/* Header row: emblem + objective + score + collapse */}
        <div className="flex flex-wrap items-center gap-3">
          <span className={`text-xl ${theme.classes.accentText}`} aria-hidden>
            {theme.emblem}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[10px] uppercase tracking-[0.3em] text-[var(--p-muted)]">
              {theme.label} · Mục tiêu
            </p>
            <p className={`truncate text-sm font-medium ${theme.classes.accentText}`}>
              {objective.primary}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ContradictionTierBadge contradiction={state.metrics.contradiction} />
            <div className={`rounded-[var(--p-radius)] px-3 py-1 ${theme.classes.chip}`}>
              <p className="text-[9px] uppercase tracking-widest opacity-70">Điểm</p>
              <p className="font-mono text-lg leading-none">{score}</p>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Mở rộng HUD" : "Thu gọn HUD"}
              aria-expanded={!collapsed}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--p-border)] bg-[var(--p-accent-soft)] text-[var(--p-text)] transition hover:bg-[var(--p-accent)] hover:text-[var(--p-bg)]"
            >
              {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

        </div>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-3">
                {warning && (
                  <motion.div
                    key={warning}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-2 inline-flex items-center gap-1.5 rounded-[var(--p-radius)] border border-[var(--p-danger)]/50 bg-[var(--p-danger)]/15 px-2.5 py-1 text-xs text-[var(--p-danger)]"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {warning}
                  </motion.div>
                )}

                {/* Metrics: watched ones highlighted */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {ALL_METRICS.map((k) => {
                    const watched = objective.metricsWatched.includes(k);
                    return (
                      <MetricCell
                        key={k}
                        k={k}
                        value={state.metrics[k]}
                        watched={watched}
                        progressTrack={theme.classes.progressTrack}
                        progressFill={theme.classes.progressFill}
                        accent={theme.classes.accentText}
                      />
                    );
                  })}
                </div>

                <div className="mt-3">
                  <p className="mb-1 text-[9px] uppercase tracking-[0.3em] text-[var(--p-muted)]">
                    Áp lực hệ thống
                  </p>
                  <PressureGauges p={state.pressures} />
                </div>

                <p className="mt-2 text-[10px] italic text-[var(--p-muted)]">
                  {objective.hint}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MetricCell({
  k,
  value,
  watched,
  progressTrack,
  progressFill,
  accent,
}: {
  k: MetricKey;
  value: number;
  watched: boolean;
  progressTrack: string;
  progressFill: string;
  accent: string;
}) {
  const meta = METRIC_META[k];
  return (
    <div
      className={`rounded-[var(--p-radius)] border px-3 py-2 ${
        watched
          ? "border-[var(--p-accent)]/60 bg-[var(--p-accent-soft)]"
          : "border-[var(--p-border)] opacity-70"
      }`}
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em]">
        <span className={watched ? accent : "text-[var(--p-muted)]"}>
          {meta.short}
        </span>
        <span className="font-mono">{Math.round(value)}</span>
      </div>
      <div className={`mt-1.5 h-1.5 w-full overflow-hidden rounded-full ${progressTrack}`}>
        <motion.div
          key={value}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full ${watched ? progressFill : "bg-[var(--p-muted)]"}`}
        />
      </div>
    </div>
  );
}
