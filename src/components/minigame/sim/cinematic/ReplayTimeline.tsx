/**
 * ReplayTimeline — "Your Historical Path".
 *
 * Visualizes the player's run as a vertical timeline derived from
 * SimState.log + unlockedTech grouped by era.
 */
import { motion } from "framer-motion";
import { STAGES, TECH_TREE } from "@/data/historicalSim";
import type { EraId } from "@/data/eras";
import type { SimState } from "../simStore";

interface Props {
  state: SimState;
}

export function ReplayTimeline({ state }: Props) {
  // group log by stage
  const byStage = new Map<EraId, SimState["log"]>();
  for (const entry of state.log) {
    const arr = byStage.get(entry.stage) ?? [];
    arr.push(entry);
    byStage.set(entry.stage, arr);
  }

  return (
    <section className="mx-auto mt-12 max-w-3xl text-left">
      <p className="text-center text-xs uppercase tracking-[0.5em] text-white/50">
        Your Historical Path
      </p>
      <h2 className="mt-2 text-center font-display text-3xl text-white sm:text-4xl">
        Dòng chảy bạn đã đi qua
      </h2>

      <ol className="relative mt-10 ml-3 border-l border-white/15 pl-6">
        {STAGES.map((stage, sIdx) => {
          const entries = byStage.get(stage.id) ?? [];
          const tech = TECH_TREE.filter(
            (t) => t.era === stage.id && state.unlockedTech.includes(t.id),
          );
          const visited = entries.length > 0 || sIdx <= state.stageIdx;
          if (!visited) return null;
          return (
            <motion.li
              key={stage.id}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: sIdx * 0.1 }}
              className="relative mb-10"
            >
              <span
                className={`absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full border-2 bg-stone-950 ${stage.theme.accent} ${stage.theme.ring}`}
              >
                <span className="text-sm">{stage.theme.glyph}</span>
              </span>
              <div className={`text-xs uppercase tracking-[0.3em] ${stage.theme.accent}`}>
                Ải {stage.order} · {stage.era}
              </div>
              <h3 className="mt-1 font-display text-2xl text-white">
                {stage.title}
              </h3>

              {entries.length > 0 && (
                <ul className="mt-3 space-y-1.5 border-l border-white/10 pl-4">
                  {entries.map((e, i) => (
                    <li key={i} className="text-sm text-white/80">
                      <span className="font-mono text-[10px] text-white/40">
                        #{i + 1}
                      </span>{" "}
                      {e.optionLabel}
                    </li>
                  ))}
                </ul>
              )}

              {tech.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tech.map((t) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center gap-1 rounded-full border border-sky-300/30 bg-sky-400/10 px-2 py-0.5 text-[11px] text-sky-100"
                    >
                      <span>{t.icon}</span> {t.label}
                    </span>
                  ))}
                </div>
              )}

              {sIdx < state.stagesCompleted - 1 && (
                <div className="mt-3 text-xs italic text-rose-200/80">
                  ↯ {stage.transitionTitle}
                </div>
              )}
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
